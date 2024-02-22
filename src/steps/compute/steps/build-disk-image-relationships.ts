import {
  Entity,
  RelationshipClass,
  RelationshipDirection,
  createDirectRelationship,
  createMappedRelationship,
} from '@jupiterone/integration-sdk-core';
import {
  GoogleCloudIntegrationStep,
  IntegrationStepContext,
} from '../../../types';
import { ComputeClient } from '../client';
import {
  STEP_COMPUTE_DISK_IMAGE_RELATIONSHIPS,
  RELATIONSHIP_TYPE_DISK_USES_IMAGE,
  ENTITY_TYPE_COMPUTE_DISK,
  ENTITY_TYPE_COMPUTE_IMAGE,
  STEP_COMPUTE_DISKS,
  STEP_COMPUTE_IMAGES,
} from '../constants';
import { createComputeImageEntity } from '../converters';
import { compute_v1 } from 'googleapis';
import { publishMissingPermissionEvent } from '../../../utils/events';

export async function buildDiskImageRelationships(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState, logger } = context;
  const client = new ComputeClient(
    {
      config: context.instance.config,
    },
    logger,
  );

  await jobState.iterateEntities(
    { _type: ENTITY_TYPE_COMPUTE_DISK },
    async (
      diskEntity: {
        sourceImage?: string | null;
      } & Entity,
    ) => {
      if (diskEntity.sourceImage) {
        // disk.sourceImage looks like this:
        // https://www.googleapis.com/compute/v1/projects/j1-gc-integration-dev-v2/global/images/my-custom-image
        // https://www.googleapis.com/compute/v1/projects/ubuntu-os-cloud/global/images/ubuntu-1804-bionic-v20210211
        // ProjectId part can be good separator between public and custom images and is necessary for images.get API call
        const sourceImageProjectId = diskEntity.sourceImage?.split('/')[6];
        const sourceImageName = diskEntity.sourceImage?.split('/')[9];

        if (sourceImageProjectId === client.projectId) {
          // Custom image case
          const imageEntity = await jobState.findEntity(diskEntity.sourceImage);
          if (imageEntity) {
            await jobState.addRelationship(
              createDirectRelationship({
                _class: RelationshipClass.USES,
                from: diskEntity,
                to: imageEntity,
              }),
            );
          }
        } else {
          // Public image case
          let image: compute_v1.Schema$Image;

          try {
            image = await client.fetchComputeImage(
              sourceImageName as string,
              sourceImageProjectId as string,
            );
          } catch (err) {
            if (err.code === 403) {
              publishMissingPermissionEvent({
                logger,
                permission: 'compute.images.get',
                stepId: STEP_COMPUTE_DISKS,
              });

              return;
            } else if (err.code === 404) {
              logger.info(
                { sourceImageName },
                `The public image cannot be found, it's most likely deprecated`,
              );

              return;
            } else {
              throw err;
            }
          }

          if (image) {
            // iamPolicy can't be fetched for public images/nor can it be changed (expected)
            const imageEntity = createComputeImageEntity({
              data: image,
              isPublic: true,
            });

            await jobState.addRelationship(
              createMappedRelationship({
                _class: RelationshipClass.USES,
                _type: RELATIONSHIP_TYPE_DISK_USES_IMAGE,
                _mapping: {
                  relationshipDirection: RelationshipDirection.FORWARD,
                  sourceEntityKey: diskEntity._key,
                  targetFilterKeys: [['_type', '_key']],
                  targetEntity: {
                    ...imageEntity,
                    _rawData: undefined,
                  },
                },
              }),
            );
          }
        }
      }
    },
  );
}

export const buildDiskImageRelationshipsStepMap: GoogleCloudIntegrationStep = {
  id: STEP_COMPUTE_DISK_IMAGE_RELATIONSHIPS,
  name: 'Compute Disk Image Relationships',
  entities: [],
  relationships: [
    {
      _class: RelationshipClass.USES,
      _type: RELATIONSHIP_TYPE_DISK_USES_IMAGE,
      sourceType: ENTITY_TYPE_COMPUTE_DISK,
      targetType: ENTITY_TYPE_COMPUTE_IMAGE,
    },
  ],
  executionHandler: buildDiskImageRelationships,
  dependsOn: [STEP_COMPUTE_DISKS, STEP_COMPUTE_IMAGES],
  permissions: ['compute.images.get'],
  apis: ['compute.googleapis.com'],
};
