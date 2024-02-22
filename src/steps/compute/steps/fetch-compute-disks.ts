import {
  GoogleCloudIntegrationStep,
  IntegrationStepContext,
} from '../../../types';
import { ComputeClient } from '../client';
import {
  IngestionSources,
  STEP_COMPUTE_DISKS,
  ENTITY_TYPE_COMPUTE_DISK,
  ENTITY_CLASS_COMPUTE_DISK,
} from '../constants';
import { createComputeDiskEntity } from '../converters';

export async function fetchComputeDisks(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState, logger } = context;
  const client = new ComputeClient(
    {
      config: context.instance.config,
    },
    logger,
  );

  await client.iterateComputeDisks(async (disk) => {
    await jobState.setData(`disk:${disk.selfLink}`, `disk:${disk.id}`);

    await jobState.addEntity(createComputeDiskEntity(disk, client.projectId));
  });
}

export const fetchComputeDisksStepMap: GoogleCloudIntegrationStep = {
  id: STEP_COMPUTE_DISKS,
  ingestionSourceId: IngestionSources.COMPUTE_DISKS,
  name: 'Compute Disks',
  entities: [
    {
      resourceName: 'Compute Disk',
      _type: ENTITY_TYPE_COMPUTE_DISK,
      _class: ENTITY_CLASS_COMPUTE_DISK,
    },
  ],
  relationships: [],
  executionHandler: fetchComputeDisks,
  dependsOn: [],
  permissions: ['compute.disks.list'],
  apis: ['compute.googleapis.com'],
};
