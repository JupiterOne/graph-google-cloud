import {
  GoogleCloudIntegrationStep,
  IntegrationStepContext,
} from '../../../types';
import { ComputeClient } from '../client';
import {
  IngestionSources,
  STEP_COMPUTE_SNAPSHOTS,
  ENTITY_TYPE_COMPUTE_SNAPSHOT,
  ENTITY_CLASS_COMPUTE_SNAPSHOT,
} from '../constants';
import { createComputeSnapshotEntity } from '../converters';

export async function fetchComputeSnapshots(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState, logger } = context;
  const client = new ComputeClient(
    {
      config: context.instance.config,
    },
    logger,
  );

  await client.iterateComputeSnapshots(async (snapshot) => {
    await jobState.addEntity(createComputeSnapshotEntity(snapshot));
  });
}

export const fetchComputeSnapshotsStepMap: GoogleCloudIntegrationStep = {
  id: STEP_COMPUTE_SNAPSHOTS,
  ingestionSourceId: IngestionSources.COMPUTE_SNAPSHOTS,
  name: 'Compute Snapshots',
  entities: [
    {
      resourceName: 'Compute Snapshot',
      _type: ENTITY_TYPE_COMPUTE_SNAPSHOT,
      _class: ENTITY_CLASS_COMPUTE_SNAPSHOT,
    },
  ],
  relationships: [],
  executionHandler: fetchComputeSnapshots,
  dependsOn: [],
  permissions: ['compute.snapshots.list'],
  apis: ['compute.googleapis.com'],
};
