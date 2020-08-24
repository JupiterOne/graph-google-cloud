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
  ENTITY_CLASS_COMPUTE_INSTANCE,
  ENTITY_CLASS_COMPUTE_DISK,
} from './constants';
import { compute_v1 } from 'googleapis';
import { RelationshipClass } from '@jupiterone/data-model';

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

    const computeDiskEntity = await jobState.findEntity(disk.source);

    if (!computeDiskEntity) {
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
    entities: [
      {
        resourceName: 'Compute Disk',
        _type: ENTITY_TYPE_COMPUTE_DISK,
        _class: ENTITY_CLASS_COMPUTE_DISK,
      },
    ],
    relationships: [],
    executionHandler: fetchComputeDisks,
  },
  {
    id: STEP_COMPUTE_INSTANCES,
    name: 'Compute Instances',
    entities: [
      {
        resourceName: 'Compute Instance',
        _type: ENTITY_TYPE_COMPUTE_INSTANCE,
        _class: ENTITY_CLASS_COMPUTE_INSTANCE,
      },
    ],
    relationships: [
      {
        _class: RelationshipClass.USES,
        _type: RELATIONSHIP_TYPE_GOOGLE_COMPUTE_INSTANCE_USES_DISK,
        sourceType: ENTITY_TYPE_COMPUTE_INSTANCE,
        targetType: ENTITY_TYPE_COMPUTE_DISK,
      },
    ],
    dependsOn: [STEP_COMPUTE_DISKS],
    executionHandler: fetchComputeInstances,
  },
];
