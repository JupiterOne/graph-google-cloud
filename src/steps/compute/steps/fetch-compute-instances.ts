import {
  Entity,
  JobState,
  RelationshipClass,
  createDirectRelationship,
} from '@jupiterone/integration-sdk-core';
import {
  GoogleCloudIntegrationStep,
  IntegrationStepContext,
} from '../../../types';
import { ComputeClient } from '../client';
import {
  IngestionSources,
  STEP_COMPUTE_INSTANCES,
  ENTITY_TYPE_COMPUTE_INSTANCE,
  ENTITY_CLASS_COMPUTE_INSTANCE,
  RELATIONSHIP_TYPE_GOOGLE_COMPUTE_INSTANCE_USES_DISK,
  ENTITY_TYPE_COMPUTE_DISK,
  RELATIONSHIP_TYPE_SUBNET_HAS_COMPUTE_INSTANCE,
  ENTITY_TYPE_COMPUTE_SUBNETWORK,
  RELATIONSHIP_TYPE_INSTANCE_GROUP_HAS_COMPUTE_INSTANCE,
  ENTITY_TYPE_COMPUTE_INSTANCE_GROUP,
  STEP_COMPUTE_DISKS,
  STEP_COMPUTE_NETWORKS,
  STEP_COMPUTE_SUBNETWORKS,
  STEP_COMPUTE_INSTANCE_GROUPS,
  ComputePermissions,
} from '../constants';
import {
  createComputeInstanceEntity,
  createComputeInstanceUsesComputeDiskRelationship,
  createSubnetHasComputeInstanceRelationship,
} from '../converters';
import { compute_v1, osconfig_v1 } from 'googleapis';
import { setComputeInstanceServiceAccountData } from '../../../utils/jobState';

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

    // TODO: Also figure out how to build relationships to source snapshot and
    // source image? Is that even possible?

    const diskKey = await jobState.getData<string>(`disk:${disk.source}`);

    if (!diskKey) {
      continue;
    } else {
      // TODO: Mapped relationship to selfLink property? (disk.source as val)
    }

    const computeDiskEntity = await jobState.findEntity(diskKey);

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

export async function fetchComputeInstances(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState, logger } = context;
  const client = new ComputeClient(
    {
      config: context.instance.config,
    },
    logger,
  );

  const computeInstanceKeyToServiceAccountDataMap = new Map<
    string,
    compute_v1.Schema$ServiceAccount[]
  >();

  let inventoryApiDisabled = false;

  await client.iterateComputeInstances(async (computeInstance) => {
    let instanceInventory: osconfig_v1.Schema$Inventory | undefined;

    try {
      if (computeInstance.zone && !inventoryApiDisabled) {
        instanceInventory = await client.fetchComputeInstanceInventory(
          computeInstance.zone?.split('/')[8],
          computeInstance.id!,
        );
      }
    } catch (e) {
      // Do not make this inventory call if api is disabled and customer is not using this feature.
      if (e.code === 403) {
        inventoryApiDisabled = true;
      }
    }
    const computeInstanceEntity = await jobState.addEntity(
      createComputeInstanceEntity(
        computeInstance,
        instanceInventory,
        client.projectId,
        context.instance.config.computeInstanceMetadataFieldsToIngest,
      ),
    );

    /**
     * Google Cloud Docs ref:
     *
     * Only one service account per VM instance is supported. Service accounts
     * generate access tokens that can be accessed through the metadata server and
     * used to authenticate applications on the instance.
     *
     * NOTE: Regardless of the fact that the GCP docs explicitly mention that
     * only a single SA is supported today, the value of `serviceAccounts` is
     * an array, which means that they may support more than one in the future.
     */
    if (computeInstance.serviceAccounts?.length) {
      computeInstanceKeyToServiceAccountDataMap.set(
        computeInstanceEntity._key,
        computeInstance.serviceAccounts,
      );
    }

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

    // If this instance is managed by instance-group, add relationship
    const createdBy = computeInstance.metadata?.items?.find(
      (item) => item.key === 'created-by',
    )?.value;
    if (
      createdBy &&
      createdBy.includes('instanceGroupManagers') &&
      createdBy.split('/').length >= 5
    ) {
      /*
        Some explanation (not a fan of doing this but):
        Our instanceGroup entities use the selfLink for the _key which looks something like this:
        "selfLink": "https://www.googleapis.com/compute/v1/projects/j1-gc-integration-dev-300716/zones/us-central1-a/instanceGroups/instance-group-1",

        Here we want to find the correct instanceGroup based on compute instance data and formats sadly do not map 1-to-1.
        Compute instance gives us the following form:
        'projects/165882964161/zones/us-central1-a/instanceGroupManagers/instance-group-1'

        So we're building the selfLink format below so that we can use jobState.findEntity(that value) instead of having to iterateEntities and check that way
        Both would work. Perhaps there's a better way to do this and if so we'll refactor it, but for now this allows us to make the relationship
      */
      const zone = createdBy.split('/')[3];
      const instanceGroupName = createdBy.split('/')[5];
      const projectId = computeInstance.zone?.split('/')[6];
      const instanceGroupKey = `https://www.googleapis.com/compute/v1/projects/${projectId}/zones/${zone}/instanceGroups/${instanceGroupName}`;

      const instanceGroupEntity = await jobState.findEntity(instanceGroupKey);

      if (instanceGroupEntity) {
        await jobState.addRelationship(
          createDirectRelationship({
            _class: RelationshipClass.HAS,
            from: instanceGroupEntity,
            to: computeInstanceEntity,
          }),
        );
      }
    }
  });

  await setComputeInstanceServiceAccountData(
    jobState,
    computeInstanceKeyToServiceAccountDataMap,
  );
}

export const fetchComputeInstancesStepMap: GoogleCloudIntegrationStep = {
  id: STEP_COMPUTE_INSTANCES,
  ingestionSourceId: IngestionSources.COMPUTE_INSTANCES,
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
      _class: RelationshipClass.HAS,
      _type: RELATIONSHIP_TYPE_SUBNET_HAS_COMPUTE_INSTANCE,
      sourceType: ENTITY_TYPE_COMPUTE_SUBNETWORK,
      targetType: ENTITY_TYPE_COMPUTE_INSTANCE,
    },
    {
      _class: RelationshipClass.HAS,
      _type: RELATIONSHIP_TYPE_INSTANCE_GROUP_HAS_COMPUTE_INSTANCE,
      sourceType: ENTITY_TYPE_COMPUTE_INSTANCE_GROUP,
      targetType: ENTITY_TYPE_COMPUTE_INSTANCE,
    },
  ],
  dependsOn: [
    STEP_COMPUTE_DISKS,
    STEP_COMPUTE_NETWORKS,
    STEP_COMPUTE_SUBNETWORKS,
    STEP_COMPUTE_INSTANCE_GROUPS,
  ],
  executionHandler: fetchComputeInstances,
  permissions: ComputePermissions.STEP_COMPUTE_INSTANCES,
  apis: ['compute.googleapis.com', 'osconfig.googleapis.com'],
};
