import {
  createDirectRelationship,
  createMappedRelationship,
  getRawData,
  RelationshipClass,
  RelationshipDirection,
} from '@jupiterone/integration-sdk-core';
import { dataproc_v1 } from 'googleapis';
import {
  GoogleCloudIntegrationStep,
  IntegrationStepContext,
} from '../../types';
import { getKmsGraphObjectKeyFromKmsKeyName } from '../../utils/kms';
import { ENTITY_TYPE_COMPUTE_IMAGE, STEP_COMPUTE_IMAGES } from '../compute';
import { ENTITY_TYPE_KMS_KEY, STEP_CLOUD_KMS_KEYS } from '../kms';
import { StorageEntitiesSpec, StorageStepsSpec } from '../storage/constants';
import { getCloudStorageBucketKey } from '../storage/converters';
import { DataProcClient } from './client';
import {
  ENTITY_CLASS_DATAPROC_CLUSTER,
  ENTITY_TYPE_DATAPROC_CLUSTER,
  RELATIONSHIP_TYPE_DATAPROC_CLUSTER_USES_COMPUTE_IMAGE,
  RELATIONSHIP_TYPE_DATAPROC_CLUSTER_USES_KMS_CRYPTO_KEY,
  RELATIONSHIP_TYPE_DATAPROC_CLUSTER_USES_STORAGE_BUCKET,
  STEP_CREATE_CLUSTER_STORAGE_RELATIONSHIPS,
  STEP_CREATE_CLUSTER_IMAGE_RELATIONSHIPS,
  STEP_DATAPROC_CLUSTERS,
  STEP_DATAPROC_CLUSTER_KMS_RELATIONSHIPS,
} from './constants';
import { createDataprocClusterEntity } from './converters';

export async function fetchDataprocClusters(
  context: IntegrationStepContext,
): Promise<void> {
  const {
    jobState,
    instance: { config },
    logger,
  } = context;

  const client = new DataProcClient({ config }, logger);
  await client.iterateClusters(async (cluster) => {
    const clusterEntity = createDataprocClusterEntity(cluster);
    await jobState.addEntity(clusterEntity);
  });
}

export async function buildDataprocClusterUsesKmsRelationships(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState, logger } = context;

  await jobState.iterateEntities(
    { _type: ENTITY_TYPE_DATAPROC_CLUSTER },
    async (clusterEntity) => {
      const instance = getRawData<dataproc_v1.Schema$Cluster>(clusterEntity);
      if (!instance) {
        logger.warn(
          {
            _key: clusterEntity._key,
          },
          'Could not find raw data on dataproc cluster instance entity',
        );
        return;
      }

      const kmsKeyName = instance.config?.encryptionConfig?.gcePdKmsKeyName;
      if (!kmsKeyName) {
        return;
      }

      const kmsKey = getKmsGraphObjectKeyFromKmsKeyName(kmsKeyName);
      const kmsKeyEntity = await jobState.findEntity(kmsKey);

      if (kmsKeyEntity) {
        await jobState.addRelationship(
          createDirectRelationship({
            _class: RelationshipClass.USES,
            from: clusterEntity,
            to: kmsKeyEntity,
          }),
        );
      } else {
        await jobState.addRelationship(
          createMappedRelationship({
            _class: RelationshipClass.USES,
            _type: RELATIONSHIP_TYPE_DATAPROC_CLUSTER_USES_KMS_CRYPTO_KEY,
            _mapping: {
              relationshipDirection: RelationshipDirection.FORWARD,
              sourceEntityKey: clusterEntity._key,
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
    },
  );
}

export async function createClusterImageRelationships(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState } = context;

  await jobState.iterateEntities(
    { _type: ENTITY_TYPE_DATAPROC_CLUSTER },
    async (clusterEntity) => {
      const imageEntity = await jobState.findEntity(
        clusterEntity.masterConfigImageUri as string,
      );

      if (imageEntity) {
        await jobState.addRelationship(
          createDirectRelationship({
            _class: RelationshipClass.USES,
            from: clusterEntity,
            to: imageEntity,
          }),
        );
      }
    },
  );
}

export async function createClusterStorageRelationships(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState } = context;

  await jobState.iterateEntities(
    { _type: ENTITY_TYPE_DATAPROC_CLUSTER },
    async (clusterEntity) => {
      const configBucket = clusterEntity.configBucket as string;
      const tempBucket = clusterEntity.tempBucket as string;

      if (configBucket === tempBucket) {
        const storageEntity = await jobState.findEntity(
          getCloudStorageBucketKey(configBucket),
        );
        if (storageEntity) {
          await jobState.addRelationship(
            createDirectRelationship({
              _class: RelationshipClass.USES,
              from: clusterEntity,
              to: storageEntity,
            }),
          );
        }
      } else {
        if (configBucket) {
          const storageEntity = await jobState.findEntity(
            getCloudStorageBucketKey(configBucket),
          );
          if (storageEntity) {
            await jobState.addRelationship(
              createDirectRelationship({
                _class: RelationshipClass.USES,
                from: clusterEntity,
                to: storageEntity,
              }),
            );
          }
        }

        if (tempBucket) {
          const storageEntity = await jobState.findEntity(
            getCloudStorageBucketKey(tempBucket),
          );
          if (storageEntity) {
            await jobState.addRelationship(
              createDirectRelationship({
                _class: RelationshipClass.USES,
                from: clusterEntity,
                to: storageEntity,
              }),
            );
          }
        }
      }
    },
  );
}

export const dataprocSteps: GoogleCloudIntegrationStep[] = [
  {
    id: STEP_DATAPROC_CLUSTERS,
    name: 'Dataproc Clusters',
    entities: [
      {
        resourceName: 'Dataproc Cluster',
        _type: ENTITY_TYPE_DATAPROC_CLUSTER,
        _class: ENTITY_CLASS_DATAPROC_CLUSTER,
      },
    ],
    relationships: [],
    dependsOn: [],
    executionHandler: fetchDataprocClusters,
    permissions: ['dataproc.clusters.list'],
    apis: ['dataproc.googleapis.com'],
  },
  {
    id: STEP_DATAPROC_CLUSTER_KMS_RELATIONSHIPS,
    name: 'Build Dataproc Cluster KMS Relationships',
    entities: [],
    relationships: [
      {
        _class: RelationshipClass.USES,
        _type: RELATIONSHIP_TYPE_DATAPROC_CLUSTER_USES_KMS_CRYPTO_KEY,
        sourceType: ENTITY_TYPE_DATAPROC_CLUSTER,
        targetType: ENTITY_TYPE_KMS_KEY,
      },
    ],
    dependsOn: [STEP_DATAPROC_CLUSTERS, STEP_CLOUD_KMS_KEYS],
    executionHandler: buildDataprocClusterUsesKmsRelationships,
  },
  {
    id: STEP_CREATE_CLUSTER_IMAGE_RELATIONSHIPS,
    name: 'Dataproc Cluster to Image Relationships',
    entities: [],
    relationships: [
      {
        _class: RelationshipClass.USES,
        _type: RELATIONSHIP_TYPE_DATAPROC_CLUSTER_USES_COMPUTE_IMAGE,
        sourceType: ENTITY_TYPE_DATAPROC_CLUSTER,
        targetType: ENTITY_TYPE_COMPUTE_IMAGE,
      },
    ],
    dependsOn: [STEP_DATAPROC_CLUSTERS, STEP_COMPUTE_IMAGES],
    executionHandler: createClusterImageRelationships,
  },
  {
    id: STEP_CREATE_CLUSTER_STORAGE_RELATIONSHIPS,
    name: 'Dataproc Cluster to Storage Bucket Relationships',
    entities: [],
    relationships: [
      {
        _class: RelationshipClass.USES,
        _type: RELATIONSHIP_TYPE_DATAPROC_CLUSTER_USES_STORAGE_BUCKET,
        sourceType: ENTITY_TYPE_DATAPROC_CLUSTER,
        targetType: StorageEntitiesSpec.STORAGE_BUCKET._type,
      },
    ],
    dependsOn: [
      STEP_DATAPROC_CLUSTERS,
      StorageStepsSpec.FETCH_STORAGE_BUCKETS.id,
    ],
    executionHandler: createClusterStorageRelationships,
  },
];
