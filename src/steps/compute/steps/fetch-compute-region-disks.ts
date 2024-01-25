import {
  GoogleCloudIntegrationStep,
  IntegrationStepContext,
} from '../../../types';
import { ComputeClient } from '../client';
import {
  IngestionSources,
  ENTITY_TYPE_COMPUTE_DISK,
  ENTITY_CLASS_COMPUTE_DISK,
  STEP_COMPUTE_REGION_DISKS,
} from '../constants';
import { createComputeRegionDiskEntity } from '../converters';

// Region disks can't use image as source (only snapshots)
export async function fetchComputeRegionDisks(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState, logger } = context;
  const client = new ComputeClient(
    {
      config: context.instance.config,
      onRetry(err) {
        context.logger.info({ err }, 'Retrying API call');
      },
    },
    logger,
  );

  await client.iterateComputeRegionDisks(async (disk) => {
    const diskEntity = createComputeRegionDiskEntity(disk, client.projectId);
    await jobState.addEntity(diskEntity);
  });
}

export const fetchComputeRegionDisksStepMap: GoogleCloudIntegrationStep = {
  id: STEP_COMPUTE_REGION_DISKS,
  ingestionSourceId: IngestionSources.COMPUTE_REGION_DISKS,
  name: 'Compute Region Disks',
  entities: [
    {
      resourceName: 'Compute Region Disk',
      _type: ENTITY_TYPE_COMPUTE_DISK,
      _class: ENTITY_CLASS_COMPUTE_DISK,
    },
  ],
  relationships: [],
  executionHandler: fetchComputeRegionDisks,
  dependsOn: [],
  permissions: ['compute.disks.list'],
  apis: ['compute.googleapis.com'],
};
