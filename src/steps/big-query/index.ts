import {
  createDirectRelationship,
  createMappedRelationship,
  IntegrationStep,
  RelationshipClass,
  RelationshipDirection,
} from '@jupiterone/integration-sdk-core';
import { bigquery_v2 } from 'googleapis';
import { IntegrationConfig, IntegrationStepContext } from '../../types';
import { isMemberPublic } from '../../utils/iam';
import { getKmsGraphObjectKeyFromKmsKeyName } from '../../utils/kms';
import { ENTITY_TYPE_KMS_KEY, STEP_CLOUD_KMS_KEYS } from '../kms';
import { BigQueryClient } from './client';

import {
  STEP_BIG_QUERY_DATASETS,
  BIG_QUERY_DATASET_ENTITY_TYPE,
  BIG_QUERY_DATASET_ENTITY_CLASS,
  RELATIONSHIP_TYPE_DATASET_USES_KMS_CRYPTO_KEY,
  STEP_BIG_QUERY_TABLES,
  BIG_QUERY_TABLE_ENTITY_TYPE,
  BIG_QUERY_TABLE_ENTITY_CLASS,
  RELATIONSHIP_TYPE_DATASET_HAS_TABLE,
  STEP_BIG_QUERY_MODELS,
  BIG_QUERY_MODEL_ENTITY_TYPE,
  BIG_QUERY_MODEL_ENTITY_CLASS,
  RELATIONSHIP_TYPE_DATASET_HAS_MODEL,
  STEP_BUILD_BIG_QUERY_DATASET_KMS_RELATIONSHIPS,
} from './constants';
import {
  createBigQueryDatasetEntity,
  createBigQueryModelEntity,
  createBigQueryTableEntity,
} from './converters';

export * from './constants';

function isBigQueryPolicyPublicAccess(
  bigQueryPolicy: bigquery_v2.Schema$Policy | undefined,
): boolean | undefined {
  if (!bigQueryPolicy) {
    return undefined;
  }
  for (const binding of bigQueryPolicy.bindings || []) {
    for (const member of binding.members || []) {
      if (isMemberPublic(member)) {
        return true;
      }
    }
  }

  return false;
}

export async function fetchBigQueryDatasets(
  context: IntegrationStepContext,
): Promise<void> {
  const {
    jobState,
    instance: { config },
  } = context;
  const client = new BigQueryClient({ config });

  await client.iterateBigQueryDatasets(async (dataset) => {
    await jobState.addEntity(createBigQueryDatasetEntity(dataset));
  });
}

export async function buildBigQueryDatasetKMSRelationships(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState } = context;

  await jobState.iterateEntities(
    {
      _type: BIG_QUERY_DATASET_ENTITY_TYPE,
    },
    async (datasetEntity) => {
      if (datasetEntity.kmsKeyName) {
        const kmsKey = getKmsGraphObjectKeyFromKmsKeyName(
          datasetEntity.kmsKeyName as string,
        );
        const kmsKeyEntity = await jobState.findEntity(kmsKey);

        if (kmsKeyEntity) {
          await jobState.addRelationship(
            createDirectRelationship({
              _class: RelationshipClass.USES,
              from: datasetEntity,
              to: kmsKeyEntity,
            }),
          );
        } else {
          await jobState.addRelationship(
            createMappedRelationship({
              _class: RelationshipClass.USES,
              _type: RELATIONSHIP_TYPE_DATASET_USES_KMS_CRYPTO_KEY,
              _mapping: {
                relationshipDirection: RelationshipDirection.FORWARD,
                sourceEntityKey: datasetEntity._key,
                targetFilterKeys: [['_type', '_key']],
                skipTargetCreation: true,
                targetEntity: {
                  _type: ENTITY_TYPE_KMS_KEY,
                  _key: kmsKey,
                },
              },
            }),
          );
        }
      }
    },
  );
}

export async function fetchBigQueryModels(
  context: IntegrationStepContext,
): Promise<void> {
  const {
    jobState,
    instance: { config },
  } = context;
  const client = new BigQueryClient({ config });

  await jobState.iterateEntities(
    {
      _type: BIG_QUERY_DATASET_ENTITY_TYPE,
    },
    async (datasetEntity) => {
      if (datasetEntity.name) {
        await client.iterateBigQueryModels(
          datasetEntity.name as string,
          async (model) => {
            const modelEntity = createBigQueryModelEntity(model);
            await jobState.addEntity(modelEntity);

            await jobState.addRelationship(
              createDirectRelationship({
                _class: RelationshipClass.HAS,
                from: datasetEntity,
                to: modelEntity,
              }),
            );
          },
        );
      }
    },
  );
}

export async function fetchBigQueryTables(
  context: IntegrationStepContext,
): Promise<void> {
  const {
    jobState,
    logger,
    instance: { config },
  } = context;
  const client = new BigQueryClient({ config });

  await jobState.iterateEntities(
    {
      _type: BIG_QUERY_DATASET_ENTITY_TYPE,
    },
    async (datasetEntity) => {
      if (datasetEntity.name) {
        await client.iterateBigQueryTables(
          datasetEntity.name as string,
          async (table) => {
            let tablePolicy: bigquery_v2.Schema$Policy | undefined = undefined;
            try {
              tablePolicy = await client.getTablePolicy(table);
            } catch (error) {
              logger.warn(
                { tableId: table.id },
                'Unable to fetch IAM policy for BigQuery table. Property `isPublic` will not be set.',
              );
            }
            const tableResource = await client.getTableResource(table);

            const tableEntity = createBigQueryTableEntity({
              data: table,
              projectId: client.projectId,
              isPublic: isBigQueryPolicyPublicAccess(tablePolicy),
              kmsKeyName: tableResource.encryptionConfiguration?.kmsKeyName
                ? tableResource.encryptionConfiguration?.kmsKeyName
                : undefined,
            });

            await jobState.addEntity(tableEntity);
            await jobState.addRelationship(
              createDirectRelationship({
                _class: RelationshipClass.HAS,
                from: datasetEntity,
                to: tableEntity,
              }),
            );
          },
        );
      }
    },
  );
}

export const bigQuerySteps: IntegrationStep<IntegrationConfig>[] = [
  {
    id: STEP_BIG_QUERY_DATASETS,
    name: 'Big Query Datasets',
    entities: [
      {
        resourceName: 'Big Query Dataset',
        _type: BIG_QUERY_DATASET_ENTITY_TYPE,
        _class: BIG_QUERY_DATASET_ENTITY_CLASS,
      },
    ],
    relationships: [],
    dependsOn: [],
    executionHandler: fetchBigQueryDatasets,
  },
  {
    id: STEP_BUILD_BIG_QUERY_DATASET_KMS_RELATIONSHIPS,
    name: 'Build Big Query Dataset KMS Relationships',
    entities: [],
    relationships: [
      {
        _class: RelationshipClass.USES,
        _type: RELATIONSHIP_TYPE_DATASET_USES_KMS_CRYPTO_KEY,
        sourceType: BIG_QUERY_DATASET_ENTITY_TYPE,
        targetType: ENTITY_TYPE_KMS_KEY,
      },
    ],
    dependsOn: [STEP_CLOUD_KMS_KEYS, STEP_BIG_QUERY_DATASETS],
    executionHandler: buildBigQueryDatasetKMSRelationships,
  },
  {
    id: STEP_BIG_QUERY_MODELS,
    name: 'Big Query Models',
    entities: [
      {
        resourceName: 'Big Query Model',
        _type: BIG_QUERY_MODEL_ENTITY_TYPE,
        _class: BIG_QUERY_MODEL_ENTITY_CLASS,
      },
    ],
    relationships: [
      {
        _class: RelationshipClass.HAS,
        _type: RELATIONSHIP_TYPE_DATASET_HAS_MODEL,
        sourceType: BIG_QUERY_DATASET_ENTITY_TYPE,
        targetType: BIG_QUERY_MODEL_ENTITY_TYPE,
      },
    ],
    dependsOn: [STEP_BIG_QUERY_DATASETS],
    executionHandler: fetchBigQueryModels,
  },
  {
    id: STEP_BIG_QUERY_TABLES,
    name: 'Big Query Tables',
    entities: [
      {
        resourceName: 'Big Query Table',
        _type: BIG_QUERY_TABLE_ENTITY_TYPE,
        _class: BIG_QUERY_TABLE_ENTITY_CLASS,
      },
    ],
    relationships: [
      {
        _class: RelationshipClass.HAS,
        _type: RELATIONSHIP_TYPE_DATASET_HAS_TABLE,
        sourceType: BIG_QUERY_DATASET_ENTITY_TYPE,
        targetType: BIG_QUERY_TABLE_ENTITY_TYPE,
      },
    ],
    dependsOn: [STEP_BIG_QUERY_DATASETS],
    executionHandler: fetchBigQueryTables,
  },
];
