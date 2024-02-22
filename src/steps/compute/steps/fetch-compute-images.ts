import {
  RelationshipClass,
  createDirectRelationship,
} from '@jupiterone/integration-sdk-core';
import {
  GoogleCloudIntegrationStep,
  IntegrationStepContext,
} from '../../../types';
import { ComputeClient } from '../client';
import {
  IngestionSources,
  STEP_COMPUTE_IMAGES,
  ENTITY_TYPE_COMPUTE_IMAGE,
  ENTITY_CLASS_COMPUTE_IMAGE,
  RELATIONSHIP_TYPE_SNAPSHOT_CREATED_IMAGE,
  ENTITY_TYPE_COMPUTE_SNAPSHOT,
  STEP_COMPUTE_SNAPSHOTS,
} from '../constants';
import { createComputeImageEntity } from '../converters';
import { compute_v1 } from 'googleapis';
import { isMemberPublic } from '../../../utils/iam';

function isComputeImagePublicAccess(
  imagePolicy: compute_v1.Schema$Policy,
): boolean {
  for (const binding of imagePolicy.bindings || []) {
    for (const member of binding.members || []) {
      if (isMemberPublic(member)) {
        return true;
      }
    }
  }

  return false;
}

export async function fetchComputeImages(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState, logger } = context;
  const client = new ComputeClient(
    {
      config: context.instance.config,
    },
    logger,
  );

  await client.iterateCustomComputeImages(async (image) => {
    const imagePolicy = await client.fetchComputeImagePolicy(
      image.name as string,
    );
    const imageEntity = createComputeImageEntity({
      data: image,
      isPublic: isComputeImagePublicAccess(imagePolicy),
    });
    await jobState.addEntity(imageEntity);

    if (image.sourceSnapshotId) {
      const sourceSnapshotEntity = await jobState.findEntity(
        `snapshot:${image.sourceSnapshotId}`,
      );

      if (sourceSnapshotEntity) {
        await jobState.addRelationship(
          createDirectRelationship({
            _class: RelationshipClass.CREATED,
            from: sourceSnapshotEntity,
            to: imageEntity,
          }),
        );
      } else {
        // TODO: Mapped relationship?
      }
    }
  });
}

export const fetchComputeImagesStepMap: GoogleCloudIntegrationStep = {
  id: STEP_COMPUTE_IMAGES,
  ingestionSourceId: IngestionSources.COMPUTE_IMAGES,
  name: 'Compute Images',
  entities: [
    {
      resourceName: 'Compute Image',
      _type: ENTITY_TYPE_COMPUTE_IMAGE,
      _class: ENTITY_CLASS_COMPUTE_IMAGE,
    },
  ],
  relationships: [
    {
      _class: RelationshipClass.CREATED,
      _type: RELATIONSHIP_TYPE_SNAPSHOT_CREATED_IMAGE,
      sourceType: ENTITY_TYPE_COMPUTE_SNAPSHOT,
      targetType: ENTITY_TYPE_COMPUTE_IMAGE,
    },
  ],
  dependsOn: [STEP_COMPUTE_SNAPSHOTS],
  executionHandler: fetchComputeImages,
  permissions: ['compute.images.list', 'compute.images.getIamPolicy'],
  apis: ['compute.googleapis.com'],
};
