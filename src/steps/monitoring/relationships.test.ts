import {
  Recording,
  createMockStepExecutionContext,
  filterGraphObjects,
} from '@jupiterone/integration-sdk-testing';
import {
  CLOUD_MONITORING_CLASS,
  CLOUD_MONITORING_TYPE,
  MONITORING_ALERT_POLICY_TYPE,
  MONITORING_CHANNEL_CLASS,
  MONITORING_CHANNEL_TYPE,
  MONITORING_GROUP_CLASS,
  MONITORING_GROUP_TYPE,
  REALTIONSHIP_CLOUD_MONITORING_HAS_MONITORING_CHANNELS_TYPE,
  RELATIONSHIP_CLOUD_MONITORING_HAS_MONITORING_ALERT_POLICIES_TYPE,
  RELATIONSHIP_CLOUD_MONITORING_HAS_MONITORING_GROUPS_TYPE,
  RELATIONSHIP_PROJECT_HAS_CLOUD_MONITORING_TYPE,
  STEP_CLOUD_MONITORING_HAS_MONITORING_ALERT_POLICIES_RELATIONSHIP,
  STEP_CLOUD_MONITORING_HAS_MONITORING_CHANNELS_RELATIONSHIP,
  STEP_CLOUD_MONITORING_HAS_MONITORING_GROUPS_RELATIONSHIP,
  STEP_PROJECT_HAS_CLOUD_MONITORING_RELATIONSHIP,
} from './constants';
import { setupGoogleCloudRecording } from '../../../test/recording';
import {
  ExplicitRelationship,
  Relationship,
} from '@jupiterone/integration-sdk-core';
import { IntegrationConfig } from '../../types';
import { integrationConfig } from '../../../test/config';
import {
  PROJECT_ENTITY_TYPE,
  fetchResourceManagerProject,
} from '../resource-manager';
import {
  buildCloudMonitoringHasMonitoringGroupsRelationship,
  buildProjectHasCloudMonitoringRelationship,
  fetchAlertPolicies,
  fetchChannels,
  fetchCloudMonitoring,
  fetchGroups,
} from '.';

describe(`cloudMonitoring#${STEP_PROJECT_HAS_CLOUD_MONITORING_RELATIONSHIP}`, () => {
  let recording: Recording;
  beforeEach(() => {
    recording = setupGoogleCloudRecording({
      directory: __dirname,
      name: STEP_PROJECT_HAS_CLOUD_MONITORING_RELATIONSHIP,
    });
  });
  afterEach(async () => {
    await recording.stop();
  });
  function separateRelationships(collectedRelationships: Relationship[]) {
    const { targets: directRelationships } = filterGraphObjects(
      collectedRelationships,
      (r) => !r._mapping,
    ) as {
      targets: ExplicitRelationship[];
    };
    return {
      directRelationships,
    };
  }
  test('should collect data', async () => {
    const context = createMockStepExecutionContext<IntegrationConfig>({
      instanceConfig: {
        ...integrationConfig,
        serviceAccountKeyFile: integrationConfig.serviceAccountKeyFile.replace(
          'j1-gc-integration-dev-v2',
          'j1-gc-integration-dev-v3',
        ),
        serviceAccountKeyConfig: {
          ...integrationConfig.serviceAccountKeyConfig,
          project_id: 'j1-gc-integration-dev-v3',
        },
      },
    });
    await fetchCloudMonitoring(context);
    await fetchResourceManagerProject(context);
    await buildProjectHasCloudMonitoringRelationship(context);
    expect({
      numCollectedEntities: context.jobState.collectedEntities.length,
      numCollectedRelationships: context.jobState.collectedRelationships.length,
      collectedEntities: context.jobState.collectedEntities,
      collectedRelationships: context.jobState.collectedRelationships,
      encounteredTypes: context.jobState.encounteredTypes,
    }).toMatchSnapshot();
    expect(
      context.jobState.collectedEntities.filter(
        (e) => e._type === PROJECT_ENTITY_TYPE,
      ),
    ).toMatchGraphObjectSchema({
      _class: ['Account'],
      schema: {
        additionalProperties: false,
        properties: {
          _type: { const: 'google_cloud_project' },
          _rawData: {
            type: 'array',
            items: { type: 'object' },
          },
          projectId: { type: 'string' },
          name: { type: 'string' },
          displayName: { type: 'string' },
          parent: { type: 'string' },
          lifecycleState: { type: 'string' },
          createdOn: { type: 'number' },
          updatedOn: { type: 'number' },
        },
      },
    });
    expect(
      context.jobState.collectedEntities.filter(
        (e) => e._type === CLOUD_MONITORING_TYPE,
      ),
    ).toMatchGraphObjectSchema({
      _class: CLOUD_MONITORING_CLASS,
      schema: {
        additionalProperties: false,
        properties: {
          _type: { const: CLOUD_MONITORING_TYPE },
          _rawData: {
            type: 'array',
            items: { type: 'object' },
          },
          name: { type: 'string' },
          function: {
            type: 'array',
            items: { type: 'string' },
          },
          category: {
            type: 'array',
            items: { type: 'string' },
          },
          endpoint: { type: 'string' },
        },
      },
    });
    const { directRelationships } = separateRelationships(
      context.jobState.collectedRelationships,
    );
    expect(
      directRelationships.filter(
        (e) => e._type === RELATIONSHIP_PROJECT_HAS_CLOUD_MONITORING_TYPE,
      ),
    ).toMatchDirectRelationshipSchema({
      schema: {
        properties: {
          _class: { const: 'HAS' },
          _type: {
            const: RELATIONSHIP_PROJECT_HAS_CLOUD_MONITORING_TYPE,
          },
        },
      },
    });
  });
});

describe(`cloudMonitoring#${STEP_CLOUD_MONITORING_HAS_MONITORING_GROUPS_RELATIONSHIP}`, () => {
  let recording: Recording;
  beforeEach(() => {
    recording = setupGoogleCloudRecording({
      directory: __dirname,
      name: STEP_CLOUD_MONITORING_HAS_MONITORING_GROUPS_RELATIONSHIP,
    });
  });
  afterEach(async () => {
    await recording.stop();
  });
  function separateRelationships(collectedRelationships: Relationship[]) {
    const { targets: directRelationships } = filterGraphObjects(
      collectedRelationships,
      (r) => !r._mapping,
    ) as {
      targets: ExplicitRelationship[];
    };
    return {
      directRelationships,
    };
  }
  test('should collect data', async () => {
    const context = createMockStepExecutionContext<IntegrationConfig>({
      instanceConfig: {
        ...integrationConfig,
        serviceAccountKeyFile: integrationConfig.serviceAccountKeyFile.replace(
          'j1-gc-integration-dev-v2',
          'j1-gc-integration-dev-v3',
        ),
        serviceAccountKeyConfig: {
          ...integrationConfig.serviceAccountKeyConfig,
          project_id: 'j1-gc-integration-dev-v3',
        },
      },
    });
    await fetchCloudMonitoring(context);
    await fetchGroups(context);
    await buildCloudMonitoringHasMonitoringGroupsRelationship(context);
    expect({
      numCollectedEntities: context.jobState.collectedEntities.length,
      numCollectedRelationships: context.jobState.collectedRelationships.length,
      collectedEntities: context.jobState.collectedEntities,
      collectedRelationships: context.jobState.collectedRelationships,
      encounteredTypes: context.jobState.encounteredTypes,
    }).toMatchSnapshot();
    expect(
      context.jobState.collectedEntities.filter(
        (e) => e._type === CLOUD_MONITORING_TYPE,
      ),
    ).toMatchGraphObjectSchema({
      _class: CLOUD_MONITORING_CLASS,
      schema: {
        additionalProperties: false,
        properties: {
          _type: { const: CLOUD_MONITORING_TYPE },
          _rawData: {
            type: 'array',
            items: { type: 'object' },
          },
          name: { type: 'string' },
          function: {
            type: 'array',
            items: { type: 'string' },
          },
          category: {
            type: 'array',
            items: { type: 'string' },
          },
          endpoint: { type: 'string' },
        },
      },
    });
    expect(
      context.jobState.collectedEntities.filter(
        (e) => e._type === MONITORING_GROUP_TYPE,
      ),
    ).toMatchGraphObjectSchema({
      _class: MONITORING_GROUP_CLASS,
      schema: {
        additionalProperties: false,
        properties: {
          _type: { const: MONITORING_GROUP_TYPE },
          _rawData: {
            type: 'array',
            items: { type: 'object' },
          },
          name: { type: 'string' },
          displayName: { type: 'string' },
          parentName: { type: 'string' },
          isCluster: { type: 'boolean' },
          filter: { type: 'string' },
        },
      },
    });
    const { directRelationships } = separateRelationships(
      context.jobState.collectedRelationships,
    );
    expect(
      directRelationships.filter(
        (e) =>
          e._type === RELATIONSHIP_CLOUD_MONITORING_HAS_MONITORING_GROUPS_TYPE,
      ),
    ).toMatchDirectRelationshipSchema({
      schema: {
        properties: {
          _class: { const: 'HAS' },
          _type: {
            const: RELATIONSHIP_CLOUD_MONITORING_HAS_MONITORING_GROUPS_TYPE,
          },
        },
      },
    });
  });
});

describe(`cloudMonitoring#${STEP_CLOUD_MONITORING_HAS_MONITORING_CHANNELS_RELATIONSHIP}`, () => {
  let recording: Recording;
  beforeEach(() => {
    recording = setupGoogleCloudRecording({
      directory: __dirname,
      name: STEP_CLOUD_MONITORING_HAS_MONITORING_CHANNELS_RELATIONSHIP,
    });
  });
  afterEach(async () => {
    await recording.stop();
  });
  function separateRelationships(collectedRelationships: Relationship[]) {
    const { targets: directRelationships } = filterGraphObjects(
      collectedRelationships,
      (r) => !r._mapping,
    ) as {
      targets: ExplicitRelationship[];
    };
    return {
      directRelationships,
    };
  }
  test('should collect data', async () => {
    const context = createMockStepExecutionContext<IntegrationConfig>({
      instanceConfig: {
        ...integrationConfig,
        serviceAccountKeyFile: integrationConfig.serviceAccountKeyFile.replace(
          'j1-gc-integration-dev-v2',
          'j1-gc-integration-dev-v3',
        ),
        serviceAccountKeyConfig: {
          ...integrationConfig.serviceAccountKeyConfig,
          project_id: 'j1-gc-integration-dev-v3',
        },
      },
    });
    await fetchCloudMonitoring(context);
    await fetchChannels(context);
    await buildCloudMonitoringHasMonitoringGroupsRelationship(context);
    expect({
      numCollectedEntities: context.jobState.collectedEntities.length,
      numCollectedRelationships: context.jobState.collectedRelationships.length,
      collectedEntities: context.jobState.collectedEntities,
      collectedRelationships: context.jobState.collectedRelationships,
      encounteredTypes: context.jobState.encounteredTypes,
    }).toMatchSnapshot();
    expect(
      context.jobState.collectedEntities.filter(
        (e) => e._type === CLOUD_MONITORING_TYPE,
      ),
    ).toMatchGraphObjectSchema({
      _class: CLOUD_MONITORING_CLASS,
      schema: {
        additionalProperties: false,
        properties: {
          _type: { const: CLOUD_MONITORING_TYPE },
          _rawData: {
            type: 'array',
            items: { type: 'object' },
          },
          name: { type: 'string' },
          function: {
            type: 'array',
            items: { type: 'string' },
          },
          category: {
            type: 'array',
            items: { type: 'string' },
          },
          endpoint: { type: 'string' },
        },
      },
    });
    expect(
      context.jobState.collectedEntities.filter(
        (e) => e._type === MONITORING_CHANNEL_TYPE,
      ),
    ).toMatchGraphObjectSchema({
      _class: MONITORING_CHANNEL_CLASS,
      schema: {
        additionalProperties: false,
        properties: {
          _type: { const: MONITORING_CHANNEL_TYPE },
          _rawData: {
            type: 'array',
            items: { type: 'object' },
          },
          name: { type: 'string' },
          displayName: { type: 'string' },
          description: { type: 'string' },
          type: { type: 'string' },
          isEnabled: { type: 'boolean' },
        },
      },
    });
    const { directRelationships } = separateRelationships(
      context.jobState.collectedRelationships,
    );
    expect(
      directRelationships.filter(
        (e) =>
          e._type ===
          REALTIONSHIP_CLOUD_MONITORING_HAS_MONITORING_CHANNELS_TYPE,
      ),
    ).toMatchDirectRelationshipSchema({
      schema: {
        properties: {
          _class: { const: 'HAS' },
          _type: {
            const: REALTIONSHIP_CLOUD_MONITORING_HAS_MONITORING_CHANNELS_TYPE,
          },
        },
      },
    });
  });
});

describe(`cloudMonitoring#${STEP_CLOUD_MONITORING_HAS_MONITORING_ALERT_POLICIES_RELATIONSHIP}`, () => {
  let recording: Recording;
  beforeEach(() => {
    recording = setupGoogleCloudRecording({
      directory: __dirname,
      name: STEP_CLOUD_MONITORING_HAS_MONITORING_ALERT_POLICIES_RELATIONSHIP,
    });
  });
  afterEach(async () => {
    await recording.stop();
  });
  function separateRelationships(collectedRelationships: Relationship[]) {
    const { targets: directRelationships } = filterGraphObjects(
      collectedRelationships,
      (r) => !r._mapping,
    ) as {
      targets: ExplicitRelationship[];
    };
    return {
      directRelationships,
    };
  }
  test('should collect data', async () => {
    const context = createMockStepExecutionContext<IntegrationConfig>({
      instanceConfig: {
        ...integrationConfig,
        serviceAccountKeyFile: integrationConfig.serviceAccountKeyFile.replace(
          'j1-gc-integration-dev-v2',
          'j1-gc-integration-dev-v3',
        ),
        serviceAccountKeyConfig: {
          ...integrationConfig.serviceAccountKeyConfig,
          project_id: 'j1-gc-integration-dev-v3',
        },
      },
    });
    await fetchCloudMonitoring(context);
    await fetchAlertPolicies(context);
    await buildCloudMonitoringHasMonitoringGroupsRelationship(context);
    expect({
      numCollectedEntities: context.jobState.collectedEntities.length,
      numCollectedRelationships: context.jobState.collectedRelationships.length,
      collectedEntities: context.jobState.collectedEntities,
      collectedRelationships: context.jobState.collectedRelationships,
      encounteredTypes: context.jobState.encounteredTypes,
    }).toMatchSnapshot();
    expect(
      context.jobState.collectedEntities.filter(
        (e) => e._type === CLOUD_MONITORING_TYPE,
      ),
    ).toMatchGraphObjectSchema({
      _class: CLOUD_MONITORING_CLASS,
      schema: {
        additionalProperties: false,
        properties: {
          _type: { const: CLOUD_MONITORING_TYPE },
          _rawData: {
            type: 'array',
            items: { type: 'object' },
          },
          name: { type: 'string' },
          function: {
            type: 'array',
            items: { type: 'string' },
          },
          category: {
            type: 'array',
            items: { type: 'string' },
          },
          endpoint: { type: 'string' },
        },
      },
    });
    expect(
      context.jobState.collectedEntities.filter(
        (e) => e._type === MONITORING_ALERT_POLICY_TYPE,
      ),
    ).toMatchGraphObjectSchema({
      _class: ['Policy'],
      schema: {
        additionalProperties: false,
        properties: {
          _type: { const: 'google_monitoring_alert_policy' },
          _rawData: {
            type: 'array',
            items: { type: 'object' },
          },
          name: { type: 'string' },
          displayName: { type: 'string' },
          title: { type: 'string' },
          summary: { type: 'string' },
          content: { type: 'string' },
          conditionFilters: {
            type: 'array',
            items: { type: 'string' },
          },
          enabled: { type: 'boolean' },
          webLink: { type: 'string' },
          createdOn: { type: 'number' },
          updatedOn: { type: 'number' },
        },
      },
    });
    const { directRelationships } = separateRelationships(
      context.jobState.collectedRelationships,
    );
    expect(
      directRelationships.filter(
        (e) =>
          e._type ===
          RELATIONSHIP_CLOUD_MONITORING_HAS_MONITORING_ALERT_POLICIES_TYPE,
      ),
    ).toMatchDirectRelationshipSchema({
      schema: {
        properties: {
          _class: { const: 'HAS' },
          _type: {
            const:
              RELATIONSHIP_CLOUD_MONITORING_HAS_MONITORING_ALERT_POLICIES_TYPE,
          },
        },
      },
    });
  });
});
