import {
  createDirectRelationship,
  createMappedRelationship,
  Entity,
  IntegrationLogger,
  IntegrationStep,
  RelationshipClass,
  RelationshipDirection,
} from '@jupiterone/integration-sdk-core';
import { appengine_v1 } from 'googleapis';
import { IntegrationConfig, IntegrationStepContext } from '../../types';
import { publishMissingPermissionEvent } from '../../utils/events';
import { AppEngineClient } from './client';
import {
  STEP_APP_ENGINE_APPLICATION,
  STEP_APP_ENGINE_SERVICES,
  STEP_APP_ENGINE_VERSIONS,
  STEP_APP_ENGINE_INSTANCES,
  ENTITY_TYPE_APP_ENGINE_APPLICATION,
  ENTITY_CLASS_APP_ENGINE_APPLICATION,
  ENTITY_TYPE_APP_ENGINE_SERVICE,
  ENTITY_CLASS_APP_ENGINE_SERVICE,
  ENTITY_TYPE_APP_ENGINE_VERSION,
  ENTITY_CLASS_APP_ENGINE_VERSION,
  ENTITY_TYPE_APP_ENGINE_INSTANCE,
  ENTITY_CLASS_APP_ENGINE_INSTANCE,
  RELATIONSHIP_TYPE_APP_ENGINE_APPLICATION_HAS_SERVICE,
  RELATIONSHIP_TYPE_APP_ENGINE_SERVICE_HAS_VERSION,
  RELATIONSHIP_TYPE_APP_ENGINE_VERSION_HAS_INSTANCE,
  RELATIONSHIP_TYPE_APP_ENGINE_APPLICATION_USES_BUCKET,
  RELATIONSHIP_TYPE_GOOGLE_USER_CREATED_VERSION,
  RELATIONSHIP_TYPE_SERVICE_ACCOUNT_CREATED_VERSION,
} from './constants';
import {
  createAppEngineApplicationEntity,
  createAppEngineInstanceEntity,
  createAppEngineServiceEntity,
  createAppEngineVersionEntity,
} from './converters';
import { getCloudStorageBucketKey } from '../storage/converters';
import {
  CLOUD_STORAGE_BUCKET_ENTITY_TYPE,
  STEP_CLOUD_STORAGE_BUCKETS,
} from '../storage';
import {
  IAM_SERVICE_ACCOUNT_ENTITY_TYPE,
  GOOGLE_USER_ENTITY_TYPE,
  STEP_IAM_SERVICE_ACCOUNTS,
} from '../iam/constants';
import { isServiceAccountEmail } from '../../utils/iam';

async function withAppEngineErrorHandling<T>(
  logger: IntegrationLogger,
  projectId: string,
  fn: () => Promise<T>,
): Promise<T | undefined> {
  try {
    return await fn();
  } catch (err) {
    if (
      err._cause?.code === 404 ||
      err.message.startsWith('Could not find Application')
    ) {
      logger.info(
        {
          err,
          projectId,
          code: err.code,
          causeCode: err._cause?.code,
        },
        'Could not fetch app engine data for project',
      );

      logger.publishEvent({
        name: 'unprocessed_app_engine_data',
        description: `Could not fetch App Engine data from step (reason: 404 not found for project "${projectId}". Please check permissions.)"`,
      });

      return;
    }

    throw err;
  }
}

export async function fetchAppEngineApplication(
  context: IntegrationStepContext,
): Promise<void> {
  const {
    jobState,
    instance: { config },
    logger,
  } = context;
  const client = new AppEngineClient({ config });
  const { projectId } = client;

  let application: appengine_v1.Schema$Application | undefined;

  try {
    application = await withAppEngineErrorHandling(
      logger,
      projectId,
      async () => await client.getAppEngineApplication(),
    );
  } catch (err) {
    if (err.code === 403) {
      logger.info(
        { err },
        'Could not fetch app engine application. Requires additional permission',
      );

      publishMissingPermissionEvent({
        logger,
        permission: 'appengine.applications.get',
        stepId: STEP_APP_ENGINE_APPLICATION,
      });

      return;
    } else if (err.code === 404) {
      logger.info(
        { projectId },
        'App engine application not found for project',
      );

      return;
    }

    throw err;
  }

  if (application) {
    const applicationEntity = createAppEngineApplicationEntity(
      application,
      client.projectId,
    );

    // There's 1:1 mapping of GCloud project to AppEngine application, we can use this for easy access later
    await jobState.setData(
      ENTITY_TYPE_APP_ENGINE_APPLICATION,
      applicationEntity,
    );
    await jobState.addEntity(applicationEntity);

    if (application.defaultBucket) {
      const defaultBucketEntity = await jobState.findEntity(
        getCloudStorageBucketKey(application.defaultBucket),
      );
      if (defaultBucketEntity) {
        await jobState.addRelationship(
          createDirectRelationship({
            _class: RelationshipClass.USES,
            from: applicationEntity,
            to: defaultBucketEntity,
          }),
        );
      }
    }

    if (application.codeBucket) {
      const codeBucketEntity = await jobState.findEntity(
        getCloudStorageBucketKey(application.codeBucket),
      );
      if (codeBucketEntity) {
        await jobState.addRelationship(
          createDirectRelationship({
            _class: RelationshipClass.USES,
            from: applicationEntity,
            to: codeBucketEntity,
          }),
        );
      }
    }
  }
}

export async function fetchAppEngineServices(
  context: IntegrationStepContext,
): Promise<void> {
  const {
    jobState,
    instance: { config },
    logger,
  } = context;

  const client = new AppEngineClient({ config });
  const { projectId } = client;

  await withAppEngineErrorHandling(logger, projectId, async () => {
    await client.iterateAppEngineServices(async (service) => {
      const serviceEntity = createAppEngineServiceEntity(service);
      await jobState.addEntity(serviceEntity);

      // There's 1:1 mapping of GCloud project to AppEngine application
      // So we can safely map these to the only one existing app engine application
      const applicationEntity = await jobState.getData<Entity>(
        ENTITY_TYPE_APP_ENGINE_APPLICATION,
      );
      if (applicationEntity) {
        await jobState.addRelationship(
          createDirectRelationship({
            _class: RelationshipClass.HAS,
            from: applicationEntity,
            to: serviceEntity,
          }),
        );
      }
    });
  });
}

export async function fetchAppEngineServiceVersions(
  context: IntegrationStepContext,
): Promise<void> {
  const {
    jobState,
    instance: { config },
    logger,
  } = context;

  const client = new AppEngineClient({ config });
  const { projectId } = client;

  await jobState.iterateEntities(
    {
      _type: ENTITY_TYPE_APP_ENGINE_SERVICE,
    },
    async (serviceEntity) => {
      if (serviceEntity) {
        const serviceId = (serviceEntity.name as string).split('/')[3];

        await withAppEngineErrorHandling(logger, projectId, async () => {
          await client.iterateAppEngineServiceVersions(
            serviceId,
            async (version) => {
              const versionEntity = createAppEngineVersionEntity(
                version,
                client.projectId,
              );

              await jobState.addEntity(versionEntity);
              await jobState.addRelationship(
                createDirectRelationship({
                  _class: RelationshipClass.HAS,
                  from: serviceEntity,
                  to: versionEntity,
                }),
              );

              if (version.createdBy) {
                // This can either be google_user or google_iam_service_account.
                // If it's a service account, the GCP integration owns this entity.
                // If it's a google_user, the Google Workspace integration "owns"
                // this entity and we should create a mapped relationship instead.
                if (isServiceAccountEmail(version.createdBy)) {
                  const creatorEntity = await jobState.findEntity(
                    version.createdBy,
                  );

                  if (creatorEntity) {
                    await jobState.addRelationship(
                      createDirectRelationship({
                        _class: RelationshipClass.CREATED,
                        from: creatorEntity,
                        to: versionEntity,
                      }),
                    );
                  }
                } else {
                  await jobState.addRelationship(
                    createMappedRelationship({
                      _class: RelationshipClass.CREATED,
                      _mapping: {
                        relationshipDirection: RelationshipDirection.REVERSE,
                        sourceEntityKey: versionEntity._key,
                        targetFilterKeys: [['_type', 'email']],
                        /**
                         * The mapper does not properly remove mapper-created entities at the moment. These
                         * entities will never be cleaned up which will cause duplicates.
                         *
                         * Until this is fixed, we should not create mapped relationships with target creation
                         * enabled, thus only creating version relationships to google users that have already
                         * been ingested by other integrations.
                         */
                        targetEntity: {
                          _type: GOOGLE_USER_ENTITY_TYPE,
                          email: version.createdBy,
                          username: version.createdBy,
                        },
                      },
                    }),
                  );
                }
              }
            },
          );
        });
      }
    },
  );
}

export async function fetchAppEngineVersionInstances(
  context: IntegrationStepContext,
): Promise<void> {
  const {
    jobState,
    instance: { config },
    logger,
  } = context;

  const client = new AppEngineClient({ config });
  const { projectId } = client;

  await jobState.iterateEntities(
    {
      _type: ENTITY_TYPE_APP_ENGINE_VERSION,
    },
    async (versionEntity) => {
      if (!versionEntity) {
        return;
      }

      const serviceId = (versionEntity.name as string).split('/')[3];
      const versionId = (versionEntity.name as string).split('/')[5];

      await withAppEngineErrorHandling(logger, projectId, async () => {
        await client.iterateAppEngineVersionInstances(
          serviceId,
          versionId,
          async (instance) => {
            const instanceEntity = createAppEngineInstanceEntity(instance);

            await jobState.addEntity(instanceEntity);
            await jobState.addRelationship(
              createDirectRelationship({
                _class: RelationshipClass.HAS,
                from: versionEntity,
                to: instanceEntity,
              }),
            );
          },
        );
      });
    },
  );
}

export const appEngineSteps: IntegrationStep<IntegrationConfig>[] = [
  {
    id: STEP_APP_ENGINE_APPLICATION,
    name: 'AppEngine Application',
    entities: [
      {
        resourceName: 'AppEngine Application',
        _type: ENTITY_TYPE_APP_ENGINE_APPLICATION,
        _class: ENTITY_CLASS_APP_ENGINE_APPLICATION,
      },
    ],
    relationships: [
      {
        _class: RelationshipClass.USES,
        _type: RELATIONSHIP_TYPE_APP_ENGINE_APPLICATION_USES_BUCKET,
        sourceType: ENTITY_TYPE_APP_ENGINE_APPLICATION,
        targetType: CLOUD_STORAGE_BUCKET_ENTITY_TYPE,
      },
    ],
    dependsOn: [STEP_CLOUD_STORAGE_BUCKETS],
    executionHandler: fetchAppEngineApplication,
  },
  {
    id: STEP_APP_ENGINE_SERVICES,
    name: 'AppEngine Services',
    entities: [
      {
        resourceName: 'AppEngine Service',
        _type: ENTITY_TYPE_APP_ENGINE_SERVICE,
        _class: ENTITY_CLASS_APP_ENGINE_SERVICE,
      },
    ],
    relationships: [
      {
        _class: RelationshipClass.HAS,
        _type: RELATIONSHIP_TYPE_APP_ENGINE_APPLICATION_HAS_SERVICE,
        sourceType: ENTITY_TYPE_APP_ENGINE_APPLICATION,
        targetType: ENTITY_TYPE_APP_ENGINE_SERVICE,
      },
    ],
    dependsOn: [STEP_APP_ENGINE_APPLICATION],
    executionHandler: fetchAppEngineServices,
  },
  {
    id: STEP_APP_ENGINE_VERSIONS,
    name: 'AppEngine Versions',
    entities: [
      {
        resourceName: 'AppEngine Version',
        _type: ENTITY_TYPE_APP_ENGINE_VERSION,
        _class: ENTITY_CLASS_APP_ENGINE_VERSION,
      },
    ],
    relationships: [
      {
        _class: RelationshipClass.HAS,
        _type: RELATIONSHIP_TYPE_APP_ENGINE_SERVICE_HAS_VERSION,
        sourceType: ENTITY_TYPE_APP_ENGINE_SERVICE,
        targetType: ENTITY_TYPE_APP_ENGINE_VERSION,
      },
      {
        _type: RELATIONSHIP_TYPE_GOOGLE_USER_CREATED_VERSION,
        _class: RelationshipClass.CREATED,
        sourceType: GOOGLE_USER_ENTITY_TYPE,
        targetType: ENTITY_TYPE_APP_ENGINE_VERSION,
      },
      {
        _class: RelationshipClass.CREATED,
        _type: RELATIONSHIP_TYPE_SERVICE_ACCOUNT_CREATED_VERSION,
        sourceType: IAM_SERVICE_ACCOUNT_ENTITY_TYPE,
        targetType: ENTITY_TYPE_APP_ENGINE_VERSION,
      },
    ],
    dependsOn: [STEP_APP_ENGINE_SERVICES, STEP_IAM_SERVICE_ACCOUNTS],
    executionHandler: fetchAppEngineServiceVersions,
  },
  {
    id: STEP_APP_ENGINE_INSTANCES,
    name: 'AppEngine Instances',
    entities: [
      {
        resourceName: 'AppEngine Instance',
        _type: ENTITY_TYPE_APP_ENGINE_INSTANCE,
        _class: ENTITY_CLASS_APP_ENGINE_INSTANCE,
      },
    ],
    relationships: [
      {
        _class: RelationshipClass.HAS,
        _type: RELATIONSHIP_TYPE_APP_ENGINE_VERSION_HAS_INSTANCE,
        sourceType: ENTITY_TYPE_APP_ENGINE_VERSION,
        targetType: ENTITY_TYPE_APP_ENGINE_INSTANCE,
      },
    ],
    dependsOn: [STEP_APP_ENGINE_VERSIONS],
    executionHandler: fetchAppEngineVersionInstances,
  },
];
