import {
  RelationshipClass,
  RelationshipDirection,
  createDirectRelationship,
  createMappedRelationship,
} from '@jupiterone/integration-sdk-core';
import {
  GoogleCloudIntegrationStep,
  IntegrationStepContext,
} from '../../../types';
import {
  STEP_COMPUTE_IMAGE_IMAGE_RELATIONSHIPS,
  RELATIONSHIP_TYPE_IMAGE_CREATED_IMAGE,
  ENTITY_TYPE_COMPUTE_IMAGE,
  STEP_COMPUTE_IMAGES,
} from '../constants';

export async function buildImageCreatedImageRelationships(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState } = context;

  await jobState.iterateEntities(
    {
      _type: ENTITY_TYPE_COMPUTE_IMAGE,
    },
    async (imageEntity) => {
      const sourceImageId = imageEntity.sourceImageId as string | undefined;

      if (!sourceImageId) {
        return;
      }

      const sourceImageKey = imageEntity._key;

      const sourceImageEntity = await jobState.findEntity(sourceImageKey);

      if (sourceImageEntity) {
        await jobState.addRelationship(
          createDirectRelationship({
            _class: RelationshipClass.CREATED,
            from: sourceImageEntity,
            to: imageEntity,
          }),
        );
      } else {
        await jobState.addRelationship(
          createMappedRelationship({
            _class: RelationshipClass.CREATED,
            _type: RELATIONSHIP_TYPE_IMAGE_CREATED_IMAGE,
            _mapping: {
              relationshipDirection: RelationshipDirection.FORWARD,
              sourceEntityKey: sourceImageKey,
              targetFilterKeys: [['_type', '_key']],
              skipTargetCreation: true,
              targetEntity: {
                ...imageEntity,
                _rawData: undefined,
              },
            },
          }),
        );
      }
    },
  );
}
export const buildImageCreatedImageRelationshipsStepMap: GoogleCloudIntegrationStep =
  {
    id: STEP_COMPUTE_IMAGE_IMAGE_RELATIONSHIPS,
    name: 'Compute Image Relationships',
    entities: [],
    relationships: [
      {
        _class: RelationshipClass.USES,
        _type: RELATIONSHIP_TYPE_IMAGE_CREATED_IMAGE,
        sourceType: ENTITY_TYPE_COMPUTE_IMAGE,
        targetType: ENTITY_TYPE_COMPUTE_IMAGE,
      },
    ],
    dependsOn: [STEP_COMPUTE_IMAGES],
    executionHandler: buildImageCreatedImageRelationships,
  };
