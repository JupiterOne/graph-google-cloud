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
  createComputeInstanceTrustsServiceAccountRelationship,
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
import {
  STEP_IAM_SERVICE_ACCOUNTS,
  IAM_SERVICE_ACCOUNT_ENTITY_TYPE,
} from '../iam';

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

async function iterateComputeInstanceServiceAccounts(params: {
  context: IntegrationStepContext;
  computeInstanceEntity: Entity;
  computeInstance: compute_v1.Schema$Instance;
}) {
  const {
    context: { jobState, logger },
    computeInstanceEntity,
    computeInstance,
  } = params;

  for (const serviceAccount of computeInstance.serviceAccounts || []) {
    const serviceAccountEntity = await jobState.findEntity(
      serviceAccount.email as string,
    );

    if (!serviceAccountEntity) {
      // This should never happen because this step dependsOn the fetch service
      // account step.
      logger.warn(
        'Skipping building relationship between compute instance and service account. Service account entity does not exist.',
      );
      continue;
    }

    await jobState.addRelationship(
      createComputeInstanceTrustsServiceAccountRelationship({
        computeInstanceEntity,
        serviceAccountEntity,
        scopes: serviceAccount.scopes || [],
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

    await iterateComputeInstanceServiceAccounts({
      context,
      computeInstance,
      computeInstanceEntity,
    });

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
      {
        _class: RelationshipClass.TRUSTS,
        _type: 'google_compute_instance_trusts_iam_service_account',
        sourceType: ENTITY_TYPE_COMPUTE_INSTANCE,
        targetType: IAM_SERVICE_ACCOUNT_ENTITY_TYPE,
      },
    ],
    dependsOn: [STEP_COMPUTE_DISKS, STEP_IAM_SERVICE_ACCOUNTS],
    executionHandler: fetchComputeInstances,
  },
];
