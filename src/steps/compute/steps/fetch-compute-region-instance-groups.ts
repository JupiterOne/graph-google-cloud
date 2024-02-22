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
  STEP_COMPUTE_REGION_INSTANCE_GROUPS,
  ENTITY_TYPE_COMPUTE_INSTANCE_GROUP,
  ENTITY_CLASS_COMPUTE_INSTANCE_GROUP,
  ENTITY_TYPE_COMPUTE_INSTANCE_GROUP_NAMED_PORT,
  ENTITY_CLASS_COMPUTE_INSTANCE_GROUP_NAMED_PORT,
  RELATIONSHIP_TYPE_INSTANCE_GROUP_HAS_NAMED_PORT,
} from '../constants';
import {
  createInstanceGroupNamedPortEntity,
  createRegionInstanceGroupEntity,
} from '../converters';
import { parseRegionNameFromRegionUrl } from '../../../google-cloud/regions';

export async function fetchComputeRegionInstanceGroups(
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

  await client.iterateRegionInstanceGroups(async (regionInstanceGroup) => {
    const regionName = parseRegionNameFromRegionUrl(
      regionInstanceGroup.region!,
    );

    const regionInstanceGroupEntity = await jobState.addEntity(
      createRegionInstanceGroupEntity(
        regionInstanceGroup,
        projectId,
        regionName,
      ),
    );

    for (const namedPort of regionInstanceGroup.namedPorts || []) {
      // we could create a separate resource for this
      // e.g. region_instance_group_named_port
      // however Terraform doesn't have separate resource for this
      // so right now we're just calling it instance_group_named_port
      // and the Entity type for this is the same as the one found in
      // fetchComputeInstanceGroups
      const namedPortEntity = await jobState.addEntity(
        createInstanceGroupNamedPortEntity({
          instanceGroupId: regionInstanceGroup.id!,
          instanceGroupName: regionInstanceGroup.name!,
          namedPort,
          projectId,
          regionName,
        }),
      );

      await jobState.addRelationship(
        createDirectRelationship({
          _class: RelationshipClass.HAS,
          from: regionInstanceGroupEntity,
          to: namedPortEntity,
        }),
      );
    }
  });
}

export const fetchComputeRegionInstanceGroupsStepMap: GoogleCloudIntegrationStep =
  {
    id: STEP_COMPUTE_REGION_INSTANCE_GROUPS,
    ingestionSourceId: IngestionSources.COMPUTE_REGION_INSTANCE_GROUPS,
    name: 'Compute Region Instance Groups',
    entities: [
      {
        resourceName: 'Compute Region Instance Group',
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
    executionHandler: fetchComputeRegionInstanceGroups,
    permissions: ['compute.instanceGroups.list'],
    apis: ['compute.googleapis.com'],
  };
