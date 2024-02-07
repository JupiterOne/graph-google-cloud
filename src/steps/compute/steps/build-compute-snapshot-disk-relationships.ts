import {
  RelationshipClass,
  createDirectRelationship,
} from '@jupiterone/integration-sdk-core';
import {
  GoogleCloudIntegrationStep,
  IntegrationStepContext,
} from '../../../types';
import {
  STEP_COMPUTE_SNAPSHOT_DISK_RELATIONSHIPS,
  RELATIONSHIP_TYPE_DISK_CREATED_SNAPSHOT,
  ENTITY_TYPE_COMPUTE_DISK,
  ENTITY_TYPE_COMPUTE_SNAPSHOT,
  STEP_COMPUTE_SNAPSHOTS,
  STEP_COMPUTE_DISKS,
} from '../constants';

export async function buildComputeSnapshotDiskRelationships(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState } = context;

  await jobState.iterateEntities(
    {
      _type: ENTITY_TYPE_COMPUTE_SNAPSHOT,
    },
    async (snapshotEntity) => {
      const sourceDiskId = snapshotEntity.sourceDiskId as string | undefined;

      if (!sourceDiskId) {
        return;
      }

      const sourceDiskEntity = await jobState.findEntity(
        `disk:${sourceDiskId}`,
      );

      if (sourceDiskEntity) {
        await jobState.addRelationship(
          createDirectRelationship({
            _class: RelationshipClass.CREATED,
            from: sourceDiskEntity,
            to: snapshotEntity,
          }),
        );
      } else {
        // TODO: Mapped relationship? I'm not sure whether it's possible for a
        // snapshot to reference a source disk from another project.
      }
    },
  );
}

export const buildComputeSnapshotDiskRelationshipsStepMap: GoogleCloudIntegrationStep =
  {
    id: STEP_COMPUTE_SNAPSHOT_DISK_RELATIONSHIPS,
    name: 'Compute Snapshot Disk Relationships',
    entities: [],
    relationships: [
      {
        _class: RelationshipClass.CREATED,
        _type: RELATIONSHIP_TYPE_DISK_CREATED_SNAPSHOT,
        sourceType: ENTITY_TYPE_COMPUTE_DISK,
        targetType: ENTITY_TYPE_COMPUTE_SNAPSHOT,
      },
    ],
    executionHandler: buildComputeSnapshotDiskRelationships,
    dependsOn: [STEP_COMPUTE_SNAPSHOTS, STEP_COMPUTE_DISKS],
  };
