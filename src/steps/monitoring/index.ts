import {
  IntegrationMissingKeyError,
  RelationshipClass,
  createDirectRelationship,
} from '@jupiterone/integration-sdk-core';
import {
  GoogleCloudIntegrationStep,
  IntegrationStepContext,
} from '../../types';
import { publishUnsupportedConfigEvent } from '../../utils/events';
import { MonitoringClient } from './client';
import {
  MONITORING_ALERT_POLICY_CLASS,
  MONITORING_ALERT_POLICY_TYPE,
  STEP_MONITORING_ALERT_POLICIES,
  IngestionSources,
  STEP_MONITORING_GROUPS,
  MONITORING_GROUP_TYPE,
  MONITORING_GROUP_CLASS,
  STEP_MONITORING_CHANNELS,
  MONITORING_CHANNEL_TYPE,
  MONITORING_CHANNEL_CLASS,
  STEP_CLOUD_MONITORING,
  CLOUD_MONITORING_TYPE,
  CLOUD_MONITORING_CLASS,
  STEP_PROJECT_HAS_CLOUD_MONITORING_RELATIONSHIP,
  RELATIONSHIP_PROJECT_HAS_CLOUD_MONITORING_TYPE,
  STEP_CLOUD_MONITORING_HAS_MONITORING_GROUPS_RELATIONSHIP,
  RELATIONSHIP_CLOUD_MONITORING_HAS_MONITORING_GROUPS_TYPE,
  STEP_CLOUD_MONITORING_HAS_MONITORING_CHANNELS_RELATIONSHIP,
  REALTIONSHIP_CLOUD_MONITORING_HAS_MONITORING_CHANNELS_TYPE,
  STEP_CLOUD_MONITORING_HAS_MONITORING_ALERT_POLICIES_RELATIONSHIP,
  RELATIONSHIP_CLOUD_MONITORING_HAS_MONITORING_ALERT_POLICIES_TYPE,
} from './constants';
import {
  createAlertPolicyEntity,
  createChannelEntity,
  createCloudMonitoringEntity,
  createGroupEntity,
} from './converters';
import {
  PROJECT_ENTITY_TYPE,
  STEP_RESOURCE_MANAGER_PROJECT,
} from '../resource-manager';
import { getProjectEntity } from '../../utils/project';

export async function fetchAlertPolicies(
  context: IntegrationStepContext,
): Promise<void> {
  const {
    jobState,
    instance: { config },
    logger,
  } = context;

  const client = new MonitoringClient({ config }, logger);

  try {
    await client.iterateAlertPolicies(async (alertPolicy) => {
      await jobState.addEntity(
        createAlertPolicyEntity(alertPolicy, client.projectId),
      );
    });
  } catch (err) {
    if (err.message?.match && err.message.match(/is not a workspace/i)) {
      publishUnsupportedConfigEvent({
        logger,
        resource: 'Alert Policies',
        reason: `${client.projectId} project is not a workspace`,
      });
    } else {
      throw err;
    }
  }
}

export async function fetchGroups(
  context: IntegrationStepContext,
): Promise<void> {
  const {
    jobState,
    instance: { config },
    logger,
  } = context;

  const client = new MonitoringClient({ config }, logger);

  try {
    await client.iterateGroups(async (Group) => {
      await jobState.addEntity(createGroupEntity(Group, client.projectId));
    });
  } catch (err) {
    if (err.message?.match && err.message.match(/is not a workspace/i)) {
      publishUnsupportedConfigEvent({
        logger,
        resource: 'Groups',
        reason: `${client.projectId} project is not a workspace`,
      });
    } else {
      throw err;
    }
  }
}

export async function fetchChannels(
  context: IntegrationStepContext,
): Promise<void> {
  const {
    jobState,
    instance: { config },
    logger,
  } = context;

  const client = new MonitoringClient({ config }, logger);

  try {
    await client.iterateChannels(async (Channel) => {
      await jobState.addEntity(createChannelEntity(Channel, client.projectId));
    });
  } catch (err) {
    if (err.message?.match && err.message.match(/is not a workspace/i)) {
      publishUnsupportedConfigEvent({
        logger,
        resource: 'Channels',
        reason: `${client.projectId} project is not a workspace`,
      });
    } else {
      throw err;
    }
  }
}

export async function fetchCloudMonitoring(
  context: IntegrationStepContext,
): Promise<void> {
  const {
    jobState,
    instance: { config },
    logger,
  } = context;

  const client = new MonitoringClient({ config }, logger);
  const data = [];
  const organization_id = config.organizationId as string;
  await jobState.addEntity(
    createCloudMonitoringEntity(organization_id, data, client.projectId),
  );
}

export async function buildProjectHasCloudMonitoringRelationship(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState } = context;

  const projectEntity = await getProjectEntity(jobState);

  if (!projectEntity) return;

  await jobState.iterateEntities(
    { _type: CLOUD_MONITORING_TYPE },
    async (monitoring) => {
      await jobState.addRelationship(
        createDirectRelationship({
          _class: RelationshipClass.HAS,
          fromKey: projectEntity._key as string,
          fromType: PROJECT_ENTITY_TYPE,
          toKey: monitoring._key as string,
          toType: CLOUD_MONITORING_TYPE,
        }),
      );
    },
  );
}

export async function buildCloudMonitoringHasMonitoringGroupsRelationship(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState } = context;

  await jobState.iterateEntities(
    {
      _type: MONITORING_GROUP_TYPE,
    },
    async (group) => {
      const groups = group.name as string;

      if (!jobState.hasKey(groups)) {
        throw new IntegrationMissingKeyError(`
          Step Name : build cloud monitoring has monitoring group relationship
          applicationEndpoint Key: ${groups}`);
      }

      await jobState.iterateEntities(
        { _type: CLOUD_MONITORING_TYPE },
        async (monitoring) => {
          await jobState.addRelationship(
            createDirectRelationship({
              _class: RelationshipClass.HAS,
              fromKey: monitoring._key as string,
              fromType: CLOUD_MONITORING_TYPE,
              toKey: groups as string,
              toType: MONITORING_GROUP_TYPE,
            }),
          );
        },
      );
    },
  );
}

export async function buildCloudMonitoringHasMonitoringChannelsRelationship(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState } = context;

  await jobState.iterateEntities(
    {
      _type: MONITORING_CHANNEL_TYPE,
    },
    async (channel) => {
      const channels = channel.name as string;

      if (!jobState.hasKey(channels)) {
        throw new IntegrationMissingKeyError(`
          Step Name : build cloud monitoring has monitoring channel relationship
          applicationEndpoint Key: ${channels}`);
      }

      await jobState.iterateEntities(
        { _type: CLOUD_MONITORING_TYPE },
        async (monitoring) => {
          await jobState.addRelationship(
            createDirectRelationship({
              _class: RelationshipClass.HAS,
              fromKey: monitoring._key as string,
              fromType: CLOUD_MONITORING_TYPE,
              toKey: channels as string,
              toType: MONITORING_CHANNEL_TYPE,
            }),
          );
        },
      );
    },
  );
}

export async function buildCloudMonitoringHasMonitoringAlertPoliciesRelationship(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState } = context;

  await jobState.iterateEntities(
    {
      _type: MONITORING_ALERT_POLICY_TYPE,
    },
    async (alertPolicy) => {
      const policies = alertPolicy._key as string;

      if (!jobState.hasKey(policies)) {
        throw new IntegrationMissingKeyError(`
          Step Name : build cloud monitoring has monitoring alert policies relationship
          applicationEndpoint Key: ${policies}`);
      }

      await jobState.iterateEntities(
        { _type: CLOUD_MONITORING_TYPE },
        async (monitoring) => {
          await jobState.addRelationship(
            createDirectRelationship({
              _class: RelationshipClass.HAS,
              fromKey: monitoring._key as string,
              fromType: CLOUD_MONITORING_TYPE,
              toKey: policies as string,
              toType: MONITORING_ALERT_POLICY_TYPE,
            }),
          );
        },
      );
    },
  );
}

export const monitoringSteps: GoogleCloudIntegrationStep[] = [
  {
    id: STEP_MONITORING_ALERT_POLICIES,
    ingestionSourceId: IngestionSources.MONITORING_ALERT_POLICIES,
    name: 'Monitoring Alert Policies',
    entities: [
      {
        resourceName: 'Monitoring Alert Policy',
        _type: MONITORING_ALERT_POLICY_TYPE,
        _class: MONITORING_ALERT_POLICY_CLASS,
      },
    ],
    relationships: [],
    dependsOn: [],
    executionHandler: fetchAlertPolicies,
    permissions: ['monitoring.alertPolicies.list'],
    apis: ['monitoring.googleapis.com'],
  },
  {
    id: STEP_MONITORING_GROUPS,
    ingestionSourceId: IngestionSources.MONITORING_GROUP,
    name: 'Monitoring Groups',
    entities: [
      {
        resourceName: 'Monitoring Groups',
        _type: MONITORING_GROUP_TYPE,
        _class: MONITORING_GROUP_CLASS,
      },
    ],
    relationships: [],
    dependsOn: [],
    executionHandler: fetchGroups,
    permissions: [],
    apis: ['monitoring.googleapis.com'],
  },
  {
    id: STEP_MONITORING_CHANNELS,
    ingestionSourceId: IngestionSources.MONITORING_CHANNEL,
    name: 'Monitoring Channels',
    entities: [
      {
        resourceName: 'Monitoring Channels',
        _type: MONITORING_CHANNEL_TYPE,
        _class: MONITORING_CHANNEL_CLASS,
      },
    ],
    relationships: [],
    dependsOn: [],
    executionHandler: fetchChannels,
    permissions: ['monitoring.notificationChannels.list'],
    apis: ['monitoring.googleapis.com'],
  },
  {
    id: STEP_CLOUD_MONITORING,
    ingestionSourceId: IngestionSources.CLOUD_MONITORING,
    name: 'Cloud Monitoring',
    entities: [
      {
        resourceName: 'Cloud Monitoring',
        _type: CLOUD_MONITORING_TYPE,
        _class: CLOUD_MONITORING_CLASS,
      },
    ],
    relationships: [],
    dependsOn: [],
    executionHandler: fetchCloudMonitoring,
    permissions: [],
    apis: ['monitoring.googleapis.com'],
  },
  {
    id: STEP_PROJECT_HAS_CLOUD_MONITORING_RELATIONSHIP,
    ingestionSourceId: IngestionSources.PROJECT_HAS_CLOUD_MONITORING,
    name: 'build project has cloud monitoring relationship',
    entities: [],
    relationships: [
      {
        _class: RelationshipClass.HAS,
        _type: RELATIONSHIP_PROJECT_HAS_CLOUD_MONITORING_TYPE,
        sourceType: PROJECT_ENTITY_TYPE,
        targetType: CLOUD_MONITORING_TYPE,
      },
    ],
    dependsOn: [STEP_RESOURCE_MANAGER_PROJECT, STEP_CLOUD_MONITORING],
    executionHandler: buildProjectHasCloudMonitoringRelationship,
    permissions: [],
    apis: ['beyondcorp.googleapis.com'],
  },
  {
    id: STEP_CLOUD_MONITORING_HAS_MONITORING_GROUPS_RELATIONSHIP,
    ingestionSourceId: IngestionSources.CLOUD_MONITORING_HAS_MONITORING_GROUPS,
    name: 'build Cloud Monitoring HAS Monitoring Groups relationship',
    entities: [],
    relationships: [
      {
        _class: RelationshipClass.HAS,
        _type: RELATIONSHIP_CLOUD_MONITORING_HAS_MONITORING_GROUPS_TYPE,
        sourceType: CLOUD_MONITORING_TYPE,
        targetType: MONITORING_GROUP_TYPE,
      },
    ],
    dependsOn: [STEP_MONITORING_GROUPS, STEP_CLOUD_MONITORING],
    executionHandler: buildCloudMonitoringHasMonitoringGroupsRelationship,
    permissions: [],
    apis: ['beyondcorp.googleapis.com'],
  },
  {
    id: STEP_CLOUD_MONITORING_HAS_MONITORING_CHANNELS_RELATIONSHIP,
    ingestionSourceId:
      IngestionSources.CLOUD_MONITORING_HAS_MONITORING_CHANNELS,
    name: 'build Cloud Monitoring HAS Monitoring Channels relationship',
    entities: [],
    relationships: [
      {
        _class: RelationshipClass.HAS,
        _type: REALTIONSHIP_CLOUD_MONITORING_HAS_MONITORING_CHANNELS_TYPE,
        sourceType: CLOUD_MONITORING_TYPE,
        targetType: MONITORING_CHANNEL_TYPE,
      },
    ],
    dependsOn: [STEP_MONITORING_CHANNELS, STEP_CLOUD_MONITORING],
    executionHandler: buildCloudMonitoringHasMonitoringChannelsRelationship,
    permissions: ['monitoring.notificationChannels.list'],
    apis: ['beyondcorp.googleapis.com'],
  },
  {
    id: STEP_CLOUD_MONITORING_HAS_MONITORING_ALERT_POLICIES_RELATIONSHIP,
    ingestionSourceId:
      IngestionSources.CLOUD_MONITORING_HAS_MONITORING_ALERT_POLICIES,
    name: 'build Cloud Monitoring HAS Monitoring Alert Polcies relationship',
    entities: [],
    relationships: [
      {
        _class: RelationshipClass.HAS,
        _type: RELATIONSHIP_CLOUD_MONITORING_HAS_MONITORING_ALERT_POLICIES_TYPE,
        sourceType: CLOUD_MONITORING_TYPE,
        targetType: MONITORING_ALERT_POLICY_TYPE,
      },
    ],
    dependsOn: [STEP_MONITORING_ALERT_POLICIES, STEP_CLOUD_MONITORING],
    executionHandler:
      buildCloudMonitoringHasMonitoringAlertPoliciesRelationship,
    permissions: ['monitoring.alertPolicies.list'],
    apis: ['beyondcorp.googleapis.com'],
  },
];
