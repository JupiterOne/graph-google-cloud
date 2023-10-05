import {
  createDirectRelationship,
  getRawData,
  RelationshipClass,
} from '@jupiterone/integration-sdk-core';
import { CloudFunctionsClient } from './client';
import {
  GoogleCloudIntegrationStep,
  IntegrationStepContext,
} from '../../types';
import { createCloudFunctionEntity } from './converters';
import { STEP_IAM_SERVICE_ACCOUNTS } from '../iam';
import {
  FunctionEntitiesSpec,
  FunctionsRelationshipsSpec,
  FunctionStepsSpec,
} from './constants';
import { CloudSourceRepositoriesStepsSpec } from '../cloud-source-repositories/constants';
import { cloudfunctions_v1 } from 'googleapis';
import { getCloudStorageBucketKey } from '../storage/converters';
import { StorageStepsSpec } from '../storage/constants';

export * from './constants';

export async function fetchCloudFunctions(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState, logger } = context;
  const client = new CloudFunctionsClient(
    { config: context.instance.config },
    logger,
  );

  await client.iterateCloudFunctions(async (cloudFunction) => {
    await jobState.addEntity(createCloudFunctionEntity(cloudFunction));
  });
}

export async function buildCloudFunctionServiceAccountRelationships(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState } = context;

  await jobState.iterateEntities(
    {
      _type: FunctionEntitiesSpec.CLOUD_FUNCTION._type,
    },
    async (cloudFunctionEntity) => {
      const serviceAccountEmail = cloudFunctionEntity.serviceAccountEmail as
        | string
        | undefined;

      if (!serviceAccountEmail) {
        return;
      }

      const serviceAccountEntity = await jobState.findEntity(
        serviceAccountEmail,
      );

      if (!serviceAccountEntity) {
        return;
      }

      await jobState.addRelationship(
        createDirectRelationship({
          _class: RelationshipClass.USES,
          from: cloudFunctionEntity,
          to: serviceAccountEntity,
        }),
      );
    },
  );
}

export async function buildCloudFunctionSourceRepoRelationships(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState } = context;

  await jobState.iterateEntities(
    {
      _type: FunctionEntitiesSpec.CLOUD_FUNCTION._type,
    },
    async (cloudFunctionEntity) => {
      const cloudFunction =
        getRawData<cloudfunctions_v1.Schema$CloudFunction>(cloudFunctionEntity);
      const sourceRepoUrl = cloudFunction?.sourceRepository?.url;

      if (!sourceRepoUrl) {
        return;
      }

      const sourceRepoKey = sourceRepoUrl
        ?.replace('https://source.developers.google.com/', '')
        .split('/moveable-aliases/')[0];

      if (!sourceRepoKey) return;

      const sourceRepoEntity = await jobState.findEntity(sourceRepoKey);

      if (sourceRepoEntity) {
        await jobState.addRelationship(
          createDirectRelationship({
            _class:
              FunctionsRelationshipsSpec
                .GOOGLE_CLOUD_FUNCTION_USES_SOURCE_REPOSITORY._class,
            from: cloudFunctionEntity,
            to: sourceRepoEntity,
          }),
        );
      }
    },
  );
}

export async function buildCloudFunctionStorageBucketRelationships(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState } = context;

  await jobState.iterateEntities(
    {
      _type: FunctionEntitiesSpec.CLOUD_FUNCTION._type,
    },
    async (cloudFunctionEntity) => {
      const cloudFunction =
        getRawData<cloudfunctions_v1.Schema$CloudFunction>(cloudFunctionEntity);

      const storageBucketKey = cloudFunction?.sourceArchiveUrl?.split('/')[2];

      if (!storageBucketKey) return;

      const storageBucketEntity = await jobState.findEntity(
        getCloudStorageBucketKey(storageBucketKey),
      );

      if (storageBucketEntity) {
        await jobState.addRelationship(
          createDirectRelationship({
            _class:
              FunctionsRelationshipsSpec
                .GOOGLE_CLOUD_FUNCTION_USES_STORAGE_BUCKET._class,
            from: cloudFunctionEntity,
            to: storageBucketEntity,
          }),
        );
      }
    },
  );
}

export const functionsSteps: GoogleCloudIntegrationStep[] = [
  {
    id: FunctionStepsSpec.FETCH_CLOUD_FUNCTIONS.id,
    name: FunctionStepsSpec.FETCH_CLOUD_FUNCTIONS.name,
    dependsOn: [],
    entities: [FunctionEntitiesSpec.CLOUD_FUNCTION],
    relationships: [],
    executionHandler: fetchCloudFunctions,
    permissions: ['cloudfunctions.functions.list'],
    apis: ['cloudfunctions.googleapis.com'],
  },
  {
    id: FunctionStepsSpec.CLOUD_FUNCTIONS_SERVICE_ACCOUNT_RELATIONSHIPS.id,
    name: FunctionStepsSpec.CLOUD_FUNCTIONS_SERVICE_ACCOUNT_RELATIONSHIPS.name,
    dependsOn: [
      FunctionStepsSpec.FETCH_CLOUD_FUNCTIONS.id,
      STEP_IAM_SERVICE_ACCOUNTS,
    ],
    entities: [],
    relationships: [
      FunctionsRelationshipsSpec.GOOGLE_CLOUD_FUNCTION_USES_IAM_SERVICE_ACCOUNT,
    ],
    executionHandler: buildCloudFunctionServiceAccountRelationships,
  },
  {
    id: FunctionStepsSpec.CLOUD_FUNCTIONS_SOURCE_REPO_RELATIONSHIP.id,
    name: FunctionStepsSpec.CLOUD_FUNCTIONS_SOURCE_REPO_RELATIONSHIP.name,
    dependsOn: [
      FunctionStepsSpec.FETCH_CLOUD_FUNCTIONS.id,
      CloudSourceRepositoriesStepsSpec.FETCH_REPOSITORIES.id,
    ],
    entities: [],
    relationships: [
      FunctionsRelationshipsSpec.GOOGLE_CLOUD_FUNCTION_USES_SOURCE_REPOSITORY,
    ],
    executionHandler: buildCloudFunctionSourceRepoRelationships,
  },
  {
    id: FunctionStepsSpec.CLOUD_FUNCTIONS_STORAGE_BUCKET_RELATIONSHIP.id,
    name: FunctionStepsSpec.CLOUD_FUNCTIONS_STORAGE_BUCKET_RELATIONSHIP.name,
    dependsOn: [
      FunctionStepsSpec.FETCH_CLOUD_FUNCTIONS.id,
      StorageStepsSpec.FETCH_STORAGE_BUCKETS.id,
    ],
    entities: [],
    relationships: [
      FunctionsRelationshipsSpec.GOOGLE_CLOUD_FUNCTION_USES_STORAGE_BUCKET,
    ],
    executionHandler: buildCloudFunctionStorageBucketRelationships,
  },
];
