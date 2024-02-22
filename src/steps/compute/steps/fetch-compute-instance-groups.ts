import {
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
  ENTITY_TYPE_COMPUTE_INSTANCE_GROUP,
  ENTITY_CLASS_COMPUTE_INSTANCE_GROUP,
  ENTITY_TYPE_COMPUTE_INSTANCE_GROUP_NAMED_PORT,
  ENTITY_CLASS_COMPUTE_INSTANCE_GROUP_NAMED_PORT,
  RELATIONSHIP_TYPE_INSTANCE_GROUP_HAS_NAMED_PORT,
  STEP_COMPUTE_INSTANCE_GROUPS,
} from '../constants';
import {
  createInstanceGroupEntity,
  createInstanceGroupNamedPortEntity,
} from '../converters';
import { parseRegionNameFromRegionUrl } from '../../../google-cloud/regions';

export async function fetchComputeInstanceGroups(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState, logger } = context;
  const client = new ComputeClient(
    {
      config: context.instance.config,
    },
    logger,
  );
  const { projectId } = client;

  await client.iterateInstanceGroups(async (instanceGroup) => {
    const regionName = parseRegionNameFromRegionUrl(instanceGroup.zone!);

    const instanceGroupEntity = await jobState.addEntity(
      createInstanceGroupEntity(instanceGroup, projectId, regionName),
    );

    for (const namedPort of instanceGroup.namedPorts || []) {
      const namedPortEntity = await jobState.addEntity(
        createInstanceGroupNamedPortEntity({
          instanceGroupId: instanceGroup.id!,
          instanceGroupName: instanceGroup.name!,
          namedPort,
          projectId,
          regionName,
        }),
      );

      await jobState.addRelationship(
        createDirectRelationship({
          _class: RelationshipClass.HAS,
          from: instanceGroupEntity,
          to: namedPortEntity,
        }),
      );
    }
  });
}

export const fetchComputeInstanceGroupsStepMap: GoogleCloudIntegrationStep = {
  id: STEP_COMPUTE_INSTANCE_GROUPS,
  ingestionSourceId: IngestionSources.COMPUTE_INSTANCE_GROUPS,
  name: 'Compute Instance Groups',
  entities: [
    {
      resourceName: 'Compute Instance Group',
      _type: ENTITY_TYPE_COMPUTE_INSTANCE_GROUP,
      _class: ENTITY_CLASS_COMPUTE_INSTANCE_GROUP,
    },
    {
      resourceName: 'Compute Instance Group Named Port',
      _type: ENTITY_TYPE_COMPUTE_INSTANCE_GROUP_NAMED_PORT,
      _class: ENTITY_CLASS_COMPUTE_INSTANCE_GROUP_NAMED_PORT,
    },
  ],
  relationships: [
    {
      _class: RelationshipClass.HAS,
      _type: RELATIONSHIP_TYPE_INSTANCE_GROUP_HAS_NAMED_PORT,
      sourceType: ENTITY_TYPE_COMPUTE_INSTANCE_GROUP,
      targetType: ENTITY_TYPE_COMPUTE_INSTANCE_GROUP_NAMED_PORT,
    },
  ],
  dependsOn: [],
  executionHandler: fetchComputeInstanceGroups,
  permissions: ['compute.instanceGroups.list'],
  apis: ['compute.googleapis.com'],
};
