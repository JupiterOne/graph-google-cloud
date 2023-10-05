import {
  createDirectRelationship,
  RelationshipClass,
} from '@jupiterone/integration-sdk-core';
import {
  GoogleCloudIntegrationStep,
  IntegrationStepContext,
} from '../../types';
import {
  cacheCloudRunServiceKeyAndUid,
  getCloudRunServiceKeyFromUid,
} from '../../utils/jobState';
import { CloudRunClient } from './client';
import {
  STEP_CLOUD_RUN_SERVICES,
  ENTITY_TYPE_CLOUD_RUN_SERVICE,
  ENTITY_CLASS_CLOUD_RUN_SERVICE,
  STEP_CLOUD_RUN_ROUTES,
  STEP_CLOUD_RUN_CONFIGURATIONS,
  ENTITY_CLASS_CLOUD_RUN_ROUTE,
  ENTITY_TYPE_CLOUD_RUN_ROUTE,
  ENTITY_TYPE_CLOUD_RUN_CONFIGURATION,
  ENTITY_CLASS_CLOUD_RUN_CONFIGURATION,
  RELATIONSHIP_TYPE_CLOUD_RUN_SERVICE_MANAGES_ROUTE,
  RELATIONSHIP_TYPE_CLOUD_RUN_SERVICE_MANAGES_CONFIGURATION,
} from './constants';
import {
  createCloudRunConfigurationEntity,
  createCloudRunRouteEntity,
  createCloudRunServiceEntity,
  MetadataComputedPropertyData,
} from './converters';

export async function fetchCloudRunServices(
  context: IntegrationStepContext,
): Promise<void> {
  const {
    jobState,
    instance: { config },
    logger,
  } = context;

  const client = new CloudRunClient({ config }, logger);

  await client.iterateCloudRunServices(async (service) => {
    const key = await cacheCloudRunServiceKeyAndUid(
      jobState,
      service,
      client.projectId,
    );
    const serviceEntity = createCloudRunServiceEntity(
      service,
      client.projectId,
      key,
    );

    await jobState.addEntity(serviceEntity);
  });
}

export async function fetchCloudRunRoutes(
  context: IntegrationStepContext,
): Promise<void> {
  const {
    jobState,
    instance: { config },
    logger,
  } = context;

  const client = new CloudRunClient({ config }, logger);

  await client.iterateCloudRunRoutes(async (route) => {
    const routeEntity = createCloudRunRouteEntity(route);
    await jobState.addEntity(routeEntity);

    const ownerService = route.metadata?.ownerReferences?.find(
      (owner) => owner.kind === 'Service',
    );
    if (ownerService) {
      const serviceKey = await getCloudRunServiceKeyFromUid(
        jobState,
        ownerService.uid as string,
      );
      const serviceEntity = await jobState.findEntity(serviceKey);
      if (serviceEntity) {
        await jobState.addRelationship(
          createDirectRelationship({
            _class: RelationshipClass.MANAGES,
            from: serviceEntity,
            to: routeEntity,
          }),
        );
      }
    }
  });
}

export async function fetchCloudRunConfigurations(
  context: IntegrationStepContext,
): Promise<void> {
  const {
    jobState,
    instance: { config },
    logger,
  } = context;

  const client = new CloudRunClient({ config }, logger);

  await client.iterateCloudRunConfigurations(async (configuration) => {
    const configurationEntity = createCloudRunConfigurationEntity(
      configuration,
      {
        onMetadataPropertiesComputed(
          computedProperties: MetadataComputedPropertyData,
        ) {
          if (computedProperties.duplicateProperties.length > 0) {
            logger.warn(
              {
                duplicates: computedProperties.duplicateProperties,
              },
              'Found duplicate metadata properties in cloud run configuration',
            );
          }
        },
      },
    );

    await jobState.addEntity(configurationEntity);

    const ownerService = configuration.metadata?.ownerReferences?.find(
      (owner) => owner.kind === 'Service',
    );
    if (ownerService) {
      const serviceKey = await getCloudRunServiceKeyFromUid(
        jobState,
        ownerService.uid as string,
      );
      const serviceEntity = await jobState.findEntity(serviceKey);
      if (serviceEntity) {
        await jobState.addRelationship(
          createDirectRelationship({
            _class: RelationshipClass.MANAGES,
            from: serviceEntity,
            to: configurationEntity,
          }),
        );
      }
    }
  });
}

export const cloudRunSteps: GoogleCloudIntegrationStep[] = [
  {
    id: STEP_CLOUD_RUN_SERVICES,
    name: 'Cloud Run Services',
    entities: [
      {
        resourceName: 'Cloud Run Service',
        _type: ENTITY_TYPE_CLOUD_RUN_SERVICE,
        _class: ENTITY_CLASS_CLOUD_RUN_SERVICE,
      },
    ],
    relationships: [],
    dependsOn: [],
    executionHandler: fetchCloudRunServices,
    permissions: ['run.services.list'],
  },
  {
    id: STEP_CLOUD_RUN_ROUTES,
    name: 'Cloud Run Routes',
    entities: [
      {
        resourceName: 'Cloud Run Route',
        _type: ENTITY_TYPE_CLOUD_RUN_ROUTE,
        _class: ENTITY_CLASS_CLOUD_RUN_ROUTE,
      },
    ],
    relationships: [
      {
        _class: RelationshipClass.MANAGES,
        _type: RELATIONSHIP_TYPE_CLOUD_RUN_SERVICE_MANAGES_ROUTE,
        sourceType: ENTITY_TYPE_CLOUD_RUN_SERVICE,
        targetType: ENTITY_TYPE_CLOUD_RUN_ROUTE,
      },
    ],
    dependsOn: [STEP_CLOUD_RUN_SERVICES],
    executionHandler: fetchCloudRunRoutes,
    permissions: ['run.routes.list'],
  },
  {
    id: STEP_CLOUD_RUN_CONFIGURATIONS,
    name: 'Cloud Run Configurations',
    entities: [
      {
        resourceName: 'Cloud Run Configuration',
        _type: ENTITY_TYPE_CLOUD_RUN_CONFIGURATION,
        _class: ENTITY_CLASS_CLOUD_RUN_CONFIGURATION,
      },
    ],
    relationships: [
      {
        _class: RelationshipClass.MANAGES,
        _type: RELATIONSHIP_TYPE_CLOUD_RUN_SERVICE_MANAGES_CONFIGURATION,
        sourceType: ENTITY_TYPE_CLOUD_RUN_SERVICE,
        targetType: ENTITY_TYPE_CLOUD_RUN_CONFIGURATION,
      },
    ],
    dependsOn: [STEP_CLOUD_RUN_SERVICES],
    executionHandler: fetchCloudRunConfigurations,
    permissions: ['run.configurations.list'],
    apis: ['run.googleapis.com'],
  },
];
