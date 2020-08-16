import {
  IntegrationStep,
  JobState,
  Entity,
} from '@jupiterone/integration-sdk-core';
import { ComputeClient } from './client';
import { IntegrationConfig, IntegrationStepContext } from '../../types';
import {
  createComputeDiskEntity,
  createComputeInstanceEntity,
  createComputeInstanceUsesComputeDiskRelationship,
} from './converters';
import {
  STEP_COMPUTE_INSTANCES,
  ENTITY_TYPE_COMPUTE_DISK,
  ENTITY_TYPE_COMPUTE_INSTANCE,
  STEP_COMPUTE_DISKS,
  RELATIONSHIP_TYPE_GOOGLE_COMPUTE_INSTANCE_USES_DISK,
} from './constants';
import { compute_v1 } from 'googleapis';

export * from './constants';

async function iterateComputeInstanceDisks(params: {
  jobState: JobState;
  computeInstanceEntity: Entity;
  computeInstance: compute_v1.Schema$Instance;
}) {
  const { jobState, computeInstanceEntity, computeInstance } = params;

  for (const disk of computeInstance.disks || []) {
    if (!disk.source) {
      // NOTE: Currently, we are only building relationships disks that were
      // created externally. Not local devices. We should also create entities
      // for local devices.
      continue;
    }

    let computeDiskEntity: Entity;

    try {
      computeDiskEntity = await jobState.getEntity({
        _key: disk.source,
        _type: ENTITY_TYPE_COMPUTE_DISK,
      });
    } catch (err) {
      // Do nothing.
      continue;
    }

    await jobState.addRelationship(
      createComputeInstanceUsesComputeDiskRelationship({
        computeInstanceEntity,
        computeDiskEntity,
        mode: disk.mode,
        autoDelete: disk.autoDelete,
        deviceName: disk.deviceName,
        interface: disk.interface,
      }),
    );
  }
}

export async function fetchComputeDisks(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState, instance } = context;
  const client = new ComputeClient({ config: instance.config });

  await client.iterateComputeDisks(async (disk) => {
    await jobState.addEntity(createComputeDiskEntity(disk));
  });
}

export async function fetchComputeInstances(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState, instance } = context;
  const client = new ComputeClient({ config: instance.config });

  await client.iterateComputeInstances(async (computeInstance) => {
    const computeInstanceEntity = await jobState.addEntity(
      createComputeInstanceEntity(computeInstance),
    );

    await iterateComputeInstanceDisks({
      jobState,
      computeInstanceEntity,
      computeInstance,
    });
  });
}

export const computeSteps: IntegrationStep<IntegrationConfig>[] = [
  {
    id: STEP_COMPUTE_DISKS,
    name: 'Compute Disks',
    types: [ENTITY_TYPE_COMPUTE_DISK],
    executionHandler: fetchComputeDisks,
  },
  {
    id: STEP_COMPUTE_INSTANCES,
    name: 'Compute Instances',
    types: [
      ENTITY_TYPE_COMPUTE_INSTANCE,
      RELATIONSHIP_TYPE_GOOGLE_COMPUTE_INSTANCE_USES_DISK,
    ],
    dependsOn: [STEP_COMPUTE_DISKS],
    executionHandler: fetchComputeInstances,
  },
];
