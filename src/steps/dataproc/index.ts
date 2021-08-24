import {
  createDirectRelationship,
  IntegrationStep,
  RelationshipClass,
} from '@jupiterone/integration-sdk-core';
import { IntegrationConfig, IntegrationStepContext } from '../../types';
import { getKmsGraphObjectKeyFromKmsKeyName } from '../../utils/kms';
import { ENTITY_TYPE_KMS_KEY, STEP_CLOUD_KMS_KEYS } from '../kms';
import {
  CLOUD_STORAGE_BUCKET_ENTITY_TYPE,
  STEP_CLOUD_STORAGE_BUCKETS,
} from '../storage';
import { getCloudStorageBucketKey } from '../storage/converters';
import { DataProcClient } from './client';
import {
  ENTITY_CLASS_DATAPROC_CLUSTER,
  ENTITY_TYPE_DATAPROC_CLUSTER,
  RELATIONSHIP_TYPE_DATAPROC_CLUSTER_USES_KMS_CRYPTO_KEY,
  RELATIONSHIP_TYPE_DATAPROC_CLUSTER_USES_STORAGE_BUCKET,
  STEP_CREATE_CLUSTER_STORAGE_RELATIONSHIPS,
  STEP_DATAPROC_CLUSTERS,
} from './constants';
import { createDataprocClusterEntity } from './converters';

export async function fetchDataprocClusters(
  context: IntegrationStepContext,
): Promise<void> {
  const {
    jobState,
    instance: { config },
  } = context;

  const client = new DataProcClient({ config });
  await client.iterateClusters(async (cluster) => {
    const clusterEntity = createDataprocClusterEntity(cluster);
    await jobState.addEntity(clusterEntity);

    const kmsKey = cluster.config?.encryptionConfig?.gcePdKmsKeyName;
    if (kmsKey) {
      const kmsKeyEntity = await jobState.findEntity(
        getKmsGraphObjectKeyFromKmsKeyName(kmsKey),
      );

      if (kmsKeyEntity) {
        await jobState.addRelationship(
          createDirectRelationship({
            _class: RelationshipClass.USES,
            from: clusterEntity,
            to: kmsKeyEntity,
          }),
        );
      }
    }
  });
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

export const dataprocSteps: IntegrationStep<IntegrationConfig>[] = [
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
    relationships: [
      {
        _class: RelationshipClass.USES,
        _type: RELATIONSHIP_TYPE_DATAPROC_CLUSTER_USES_KMS_CRYPTO_KEY,
        sourceType: ENTITY_TYPE_DATAPROC_CLUSTER,
        targetType: ENTITY_TYPE_KMS_KEY,
      },
    ],
    dependsOn: [STEP_CLOUD_KMS_KEYS],
    executionHandler: fetchDataprocClusters,
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
        targetType: CLOUD_STORAGE_BUCKET_ENTITY_TYPE,
      },
    ],
    dependsOn: [STEP_DATAPROC_CLUSTERS, STEP_CLOUD_STORAGE_BUCKETS],
    executionHandler: createClusterStorageRelationships,
  },
];
