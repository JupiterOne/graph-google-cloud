import {
  IntegrationStep,
  JobState,
  Entity,
  createDirectRelationship,
} from '@jupiterone/integration-sdk-core';
import { ComputeClient } from './client';
import { IntegrationConfig, IntegrationStepContext } from '../../types';
import {
  createComputeDiskEntity,
  createComputeInstanceEntity,
  createComputeInstanceUsesComputeDiskRelationship,
  createComputeInstanceTrustsServiceAccountRelationship,
  createComputeNetworkEntity,
  createComputeSubnetEntity,
  createComputeFirewallEntity,
  createSubnetHasComputeInstanceRelationship,
  createFirewallRuleMappedRelationship,
  createComputeProjectEntity,
} from './converters';
import {
  STEP_COMPUTE_INSTANCES,
  ENTITY_TYPE_COMPUTE_DISK,
  ENTITY_TYPE_COMPUTE_INSTANCE,
  STEP_COMPUTE_DISKS,
  RELATIONSHIP_TYPE_GOOGLE_COMPUTE_INSTANCE_USES_DISK,
  ENTITY_CLASS_COMPUTE_INSTANCE,
  ENTITY_CLASS_COMPUTE_DISK,
  STEP_COMPUTE_NETWORKS,
  ENTITY_TYPE_COMPUTE_NETWORK,
  ENTITY_CLASS_COMPUTE_NETWORK,
  ENTITY_TYPE_COMPUTE_SUBNETWORK,
  ENTITY_CLASS_COMPUTE_SUBNETWORK,
  STEP_COMPUTE_SUBNETWORKS,
  STEP_COMPUTE_FIREWALLS,
  ENTITY_TYPE_COMPUTE_FIREWALL,
  ENTITY_CLASS_COMPUTE_FIREWALL,
  RELATIONSHIP_TYPE_GOOGLE_COMPUTE_INSTANCE_TRUSTS_IAM_SERVICE_ACCOUNT,
  RELATIONSHIP_TYPE_GOOGLE_COMPUTE_NETWORK_CONTAINS_GOOGLE_COMPUTE_SUBNETWORK,
  RELATIONSHIP_TYPE_SUBNET_HAS_COMPUTE_INSTANCE,
  RELATIONSHIP_TYPE_FIREWALL_PROTECTS_NETWORK,
  RELATIONSHIP_TYPE_NETWORK_HAS_FIREWALL,
  MAPPED_RELATIONSHIP_FIREWALL_RULE_TYPE,
  STEP_COMPUTE_PROJECT,
  ENTITY_TYPE_COMPUTE_PROJECT,
  ENTITY_CLASS_COMPUTE_PROJECT,
  RELATIONSHIP_TYPE_PROJECT_HAS_INSTANCE,
} from './constants';
import { compute_v1 } from 'googleapis';
import { INTERNET, RelationshipClass } from '@jupiterone/data-model';
import {
  STEP_IAM_SERVICE_ACCOUNTS,
  IAM_SERVICE_ACCOUNT_ENTITY_TYPE,
} from '../iam';
import {
  getFirewallIpRanges,
  getFirewallRelationshipDirection,
  processFirewallRuleRelationshipTargets,
} from '../../utils/firewall';

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

async function iterateComputeInstanceNetworkInterfaces(params: {
  jobState: JobState;
  computeInstanceEntity: Entity;
  computeInstance: compute_v1.Schema$Instance;
}) {
  const { jobState, computeInstanceEntity, computeInstance } = params;

  for (const networkInterface of computeInstance.networkInterfaces || []) {
    const subnetwork = networkInterface.subnetwork as string;

    const subnetEntity = await jobState.findEntity(subnetwork);

    if (!subnetEntity) {
      continue;
    }

    await jobState.addRelationship(
      createSubnetHasComputeInstanceRelationship({
        subnetEntity,
        computeInstanceEntity,
        networkInterface,
      }),
    );
  }
}

export async function fetchComputeProject(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState, instance } = context;
  const client = new ComputeClient({ config: instance.config });

  const computeProject = await client.fetchComputeProject();
  if (computeProject) {
    const computeProjectEntity = createComputeProjectEntity(computeProject);
    await jobState.addEntity(computeProjectEntity);

    await jobState.iterateEntities(
      {
        _type: ENTITY_TYPE_COMPUTE_INSTANCE,
      },
      async (computeInstanceEntity) => {
        await jobState.addRelationship(
          createDirectRelationship({
            _class: RelationshipClass.HAS,
            from: computeProjectEntity,
            to: computeInstanceEntity,
          }),
        );
      },
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

    await iterateComputeInstanceNetworkInterfaces({
      jobState,
      computeInstance,
      computeInstanceEntity,
    });
  });
}

export async function processFirewallRuleLists({
  jobState,
  firewall,
  firewallEntity,
}: {
  jobState: JobState;
  firewall: compute_v1.Schema$Firewall;
  firewallEntity: Entity;
}) {
  const ipRanges = getFirewallIpRanges(firewall);
  const relationshipDirection = getFirewallRelationshipDirection(firewall);

  for (const rule of firewall.allowed || []) {
    await processFirewallRuleRelationshipTargets({
      rule,
      ipRanges,
      callback: async (processedRuleTarget) => {
        await jobState.addRelationship(
          createFirewallRuleMappedRelationship({
            _class: RelationshipClass.ALLOWS,
            relationshipDirection,
            firewallEntity,
            ...processedRuleTarget,
          }),
        );
      },
    });
  }

  for (const rule of firewall.denied || []) {
    await processFirewallRuleRelationshipTargets({
      rule,
      ipRanges,
      callback: async (processedRuleTarget) => {
        await jobState.addRelationship(
          createFirewallRuleMappedRelationship({
            _class: RelationshipClass.DENIES,
            relationshipDirection,
            firewallEntity,
            ...processedRuleTarget,
          }),
        );
      },
    });
  }
}

export async function fetchComputeFirewalls(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState, instance } = context;
  const client = new ComputeClient({ config: instance.config });

  await client.iterateFirewalls(async (firewall) => {
    const firewallEntity = await jobState.addEntity(
      createComputeFirewallEntity(firewall),
    );

    const networkEntity = await jobState.findEntity(firewall.network as string);

    if (!networkEntity) {
      // Possible that the network was created after the network entities were
      // created.
      return;
    }

    await jobState.addRelationship(
      createDirectRelationship({
        _class: RelationshipClass.PROTECTS,
        from: firewallEntity,
        to: networkEntity,
      }),
    );

    await jobState.addRelationship(
      createDirectRelationship({
        _class: RelationshipClass.HAS,
        from: networkEntity,
        to: firewallEntity,
      }),
    );

    await processFirewallRuleLists({
      jobState,
      firewall,
      firewallEntity,
    });
  });
}

export async function fetchComputeSubnetworks(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState, instance } = context;
  const client = new ComputeClient({ config: instance.config });

  await client.iterateSubnetworks(async (subnet) => {
    const subnetEntity = await jobState.addEntity(
      createComputeSubnetEntity(subnet, client.projectId),
    );

    const networkEntity = await jobState.findEntity(subnet.network as string);

    if (!networkEntity) {
      // Possible that the network was created after the network entities were
      // created.
      return;
    }

    await jobState.addRelationship(
      createDirectRelationship({
        _class: RelationshipClass.CONTAINS,
        from: networkEntity,
        to: subnetEntity,
      }),
    );
  });
}

export async function fetchComputeNetworks(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState, instance } = context;
  const client = new ComputeClient({ config: instance.config });

  await client.iterateNetworks(async (network) => {
    await jobState.addEntity(
      createComputeNetworkEntity(network, client.projectId),
    );
  });
}

export const computeSteps: IntegrationStep<IntegrationConfig>[] = [
  {
    id: STEP_COMPUTE_NETWORKS,
    name: 'Compute Networks',
    entities: [
      {
        resourceName: 'Compute Networks',
        _type: ENTITY_TYPE_COMPUTE_NETWORK,
        _class: ENTITY_CLASS_COMPUTE_NETWORK,
      },
    ],
    relationships: [],
    executionHandler: fetchComputeNetworks,
  },
  {
    id: STEP_COMPUTE_FIREWALLS,
    name: 'Compute Firewalls',
    entities: [
      {
        resourceName: 'Compute Firewalls',
        _type: ENTITY_TYPE_COMPUTE_FIREWALL,
        _class: ENTITY_CLASS_COMPUTE_FIREWALL,
      },
    ],
    relationships: [
      {
        _class: RelationshipClass.PROTECTS,
        _type: RELATIONSHIP_TYPE_FIREWALL_PROTECTS_NETWORK,
        sourceType: ENTITY_TYPE_COMPUTE_FIREWALL,
        targetType: ENTITY_TYPE_COMPUTE_NETWORK,
      },
      {
        _class: RelationshipClass.HAS,
        _type: RELATIONSHIP_TYPE_NETWORK_HAS_FIREWALL,
        sourceType: ENTITY_TYPE_COMPUTE_NETWORK,
        targetType: ENTITY_TYPE_COMPUTE_FIREWALL,
      },
      {
        _type: MAPPED_RELATIONSHIP_FIREWALL_RULE_TYPE,
        sourceType: INTERNET._type,
        _class: RelationshipClass.ALLOWS,
        targetType: ENTITY_TYPE_COMPUTE_FIREWALL,
      },
    ],
    executionHandler: fetchComputeFirewalls,
    dependsOn: [STEP_COMPUTE_NETWORKS],
  },
  {
    id: STEP_COMPUTE_SUBNETWORKS,
    name: 'Compute Subnetworks',
    entities: [
      {
        resourceName: 'Compute Subnetwork',
        _type: ENTITY_TYPE_COMPUTE_SUBNETWORK,
        _class: ENTITY_CLASS_COMPUTE_SUBNETWORK,
      },
    ],
    relationships: [
      {
        _class: RelationshipClass.CONTAINS,
        _type: RELATIONSHIP_TYPE_GOOGLE_COMPUTE_NETWORK_CONTAINS_GOOGLE_COMPUTE_SUBNETWORK,
        sourceType: ENTITY_TYPE_COMPUTE_NETWORK,
        targetType: ENTITY_TYPE_COMPUTE_SUBNETWORK,
      },
    ],
    executionHandler: fetchComputeSubnetworks,
    dependsOn: [STEP_COMPUTE_NETWORKS],
  },
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
        _type: RELATIONSHIP_TYPE_GOOGLE_COMPUTE_INSTANCE_TRUSTS_IAM_SERVICE_ACCOUNT,
        sourceType: ENTITY_TYPE_COMPUTE_INSTANCE,
        targetType: IAM_SERVICE_ACCOUNT_ENTITY_TYPE,
      },
      {
        _class: RelationshipClass.HAS,
        _type: RELATIONSHIP_TYPE_SUBNET_HAS_COMPUTE_INSTANCE,
        sourceType: ENTITY_TYPE_COMPUTE_SUBNETWORK,
        targetType: ENTITY_TYPE_COMPUTE_INSTANCE,
      },
    ],
    dependsOn: [
      STEP_COMPUTE_DISKS,
      STEP_IAM_SERVICE_ACCOUNTS,
      STEP_COMPUTE_NETWORKS,
      STEP_COMPUTE_SUBNETWORKS,
    ],
    executionHandler: fetchComputeInstances,
  },
  {
    id: STEP_COMPUTE_PROJECT,
    name: 'Compute Project',
    entities: [
      {
        resourceName: 'Compute Project',
        _type: ENTITY_TYPE_COMPUTE_PROJECT,
        _class: ENTITY_CLASS_COMPUTE_PROJECT,
      },
    ],
    relationships: [
      {
        _class: RelationshipClass.HAS,
        _type: RELATIONSHIP_TYPE_PROJECT_HAS_INSTANCE,
        sourceType: ENTITY_TYPE_COMPUTE_PROJECT,
        targetType: ENTITY_TYPE_COMPUTE_INSTANCE,
      },
    ],
    dependsOn: [STEP_COMPUTE_INSTANCES],
    executionHandler: fetchComputeProject,
  },
];
