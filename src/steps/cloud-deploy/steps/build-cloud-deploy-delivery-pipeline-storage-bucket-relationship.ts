import {
  RelationshipClass,
  createDirectRelationship,
} from '@jupiterone/integration-sdk-core';
import {
  GoogleCloudIntegrationStep,
  IntegrationStepContext,
} from '../../../types';
import {
  ENTITY_TYPE_CLOUD_DEPLOY_DELIVERY_PIPELINE,
  Relationships,
  STEP_CLOUD_DEPLOY_DELIVERY_PIPELINE,
  STEP_CLOUD_DEPLOY_DELIVERY_PIPELINE_USES_STORAGE_BUCKET_RELATIONSHIP,
} from '../constant';
import { StorageEntitiesSpec, StorageStepsSpec } from '../../storage/constants';
import { getCloudStorageBucketKey } from '../../storage/converters';

export async function buildCloudDeployDeliveryPipelineStorageBucketRelationship(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState, logger } = context;

  await jobState.iterateEntities(
    { _type: ENTITY_TYPE_CLOUD_DEPLOY_DELIVERY_PIPELINE },
    async (deliveryPipeline) => {
      const bucketId = `${deliveryPipeline.region}.deploy-artifacts.${deliveryPipeline.projectId}.appspot.com`;
      const cloudStorageBucketKey = getCloudStorageBucketKey(bucketId);

      if (!jobState.hasKey(cloudStorageBucketKey)) {
        logger.warn(`Missing Key: ${cloudStorageBucketKey}`);
      } else {
        await jobState.addRelationship(
          createDirectRelationship({
            _class: RelationshipClass.USES,
            fromKey: deliveryPipeline._key,
            fromType: ENTITY_TYPE_CLOUD_DEPLOY_DELIVERY_PIPELINE,
            toKey: cloudStorageBucketKey as string,
            toType: StorageEntitiesSpec.STORAGE_BUCKET._type,
          }),
        );
      }
    },
  );
}

export const buildCloudDeployDeliveryPipelineStorageBucketRelationshipStep: GoogleCloudIntegrationStep =
  {
    id: STEP_CLOUD_DEPLOY_DELIVERY_PIPELINE_USES_STORAGE_BUCKET_RELATIONSHIP,
    name: 'Build Cloud Deploy Delivery Pipeline Storage Bucket Relationship',
    entities: [],
    relationships: [
      Relationships.CLOUD_DEPLOY_DELIVERY_PIPELINE_USES_STORAGE_BUCKET,
    ],
    dependsOn: [
      StorageStepsSpec.FETCH_STORAGE_BUCKETS.id,
      STEP_CLOUD_DEPLOY_DELIVERY_PIPELINE,
    ],
    executionHandler: buildCloudDeployDeliveryPipelineStorageBucketRelationship,
  };
