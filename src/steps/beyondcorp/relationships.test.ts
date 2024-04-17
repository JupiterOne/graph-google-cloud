import {
  createMockStepExecutionContext,
  executeStepWithDependencies,
  filterGraphObjects,
  Recording,
  StepTestConfig,
} from '@jupiterone/integration-sdk-testing';
import { IntegrationConfig, invocationConfig } from '../..';
import {
  BEYONDCORP_APP_CONNECTION_CLASS,
  BEYONDCORP_APP_CONNECTION_TYPE,
  BEYONDCORP_APP_CONNECTOR_CLASS,
  BEYONDCORP_APP_CONNECTOR_TYPE,
  BEYONDCORP_ENTERPRISE_CLASS,
  BEYONDCORP_ENTERPRISE_TYPE,
  RELATIONSHIP_TYPE_PROJECT_HAS_BEYONDCORP_ENTERPRISE,
  RELATIONSHIP_TYPE_PROJECT_USES_APP_CONNECTION,
  RELATIONSHIP_TYPE_PROJECT_USES_APP_CONNECTOR,
  STEP_APP_CONNECTION_HAS_APP_CONNECTOR_RELATIONSHIP,
  STEP_APP_CONNECTION_HAS_APPLICATION_ENDPOINT_RELATIONSHIP,
  STEP_APP_CONNECTION_HAS_GATEWAY_RELATIONSHIP,
  STEP_APPLICATION_ENDPOINT_USES_GATEWAY_RELATIONSHIP,
  STEP_PROJECT_HAS_BEYONDCORP_ENTERPRISE_RELATIONSHIP,
  STEP_PROJECT_USES_APP_CONNECTION_RELATIONSHIP,
  STEP_PROJECT_USES_APP_CONNECTOR_RELATIONSHIP,
} from './constant';
import {
  setupGoogleCloudRecording,
  getMatchRequestsBy,
} from '../../../test/recording';
import { integrationConfig } from '../../../test/config';
import {
  ExplicitRelationship,
  Relationship,
} from '@jupiterone/integration-sdk-core';
import {
  fetchResourceManagerProject,
  PROJECT_ENTITY_TYPE,
} from '../resource-manager';
import {
  buildProjectHasBeyondcorpEnterpriseRelationship,
  buildProjectUsesAppConnectorRelationship,
  fetchAppConnections,
  fetchAppConnectors,
  fetchBeyondcorpEnterprise,
} from '.';

describe(`beyondcorp#${STEP_APP_CONNECTION_HAS_APP_CONNECTOR_RELATIONSHIP}`, () => {
  let recording: Recording;
  afterEach(async () => {
    if (recording) await recording.stop();
  });

  jest.setTimeout(45000);

  test(STEP_APP_CONNECTION_HAS_APP_CONNECTOR_RELATIONSHIP, async () => {
    recording = setupGoogleCloudRecording({
      name: STEP_APP_CONNECTION_HAS_APP_CONNECTOR_RELATIONSHIP,
      directory: __dirname,
      options: {
        matchRequestsBy: getMatchRequestsBy(integrationConfig),
      },
    });

    const stepTestConfig: StepTestConfig = {
      stepId: STEP_APP_CONNECTION_HAS_APP_CONNECTOR_RELATIONSHIP,
      instanceConfig: integrationConfig,
      invocationConfig: invocationConfig as any,
    };

    const result = await executeStepWithDependencies(stepTestConfig);
    expect(result).toMatchStepMetadata(stepTestConfig);
  });
});

describe(`beyondcorp#${STEP_APP_CONNECTION_HAS_APPLICATION_ENDPOINT_RELATIONSHIP}`, () => {
  let recording: Recording;
  afterEach(async () => {
    if (recording) await recording.stop();
  });

  jest.setTimeout(45000);

  test(STEP_APP_CONNECTION_HAS_APPLICATION_ENDPOINT_RELATIONSHIP, async () => {
    recording = setupGoogleCloudRecording({
      name: STEP_APP_CONNECTION_HAS_APPLICATION_ENDPOINT_RELATIONSHIP,
      directory: __dirname,
      options: {
        matchRequestsBy: getMatchRequestsBy(integrationConfig),
      },
    });

    const stepTestConfig: StepTestConfig = {
      stepId: STEP_APP_CONNECTION_HAS_APPLICATION_ENDPOINT_RELATIONSHIP,
      instanceConfig: integrationConfig,
      invocationConfig: invocationConfig as any,
    };

    const result = await executeStepWithDependencies(stepTestConfig);
    expect(result).toMatchStepMetadata(stepTestConfig);
  });
});

describe(`beyondcorp#${STEP_APP_CONNECTION_HAS_GATEWAY_RELATIONSHIP}`, () => {
  let recording: Recording;
  afterEach(async () => {
    if (recording) await recording.stop();
  });

  jest.setTimeout(45000);

  test(STEP_APP_CONNECTION_HAS_GATEWAY_RELATIONSHIP, async () => {
    recording = setupGoogleCloudRecording({
      name: STEP_APP_CONNECTION_HAS_GATEWAY_RELATIONSHIP,
      directory: __dirname,
      options: {
        matchRequestsBy: getMatchRequestsBy(integrationConfig),
      },
    });

    const stepTestConfig: StepTestConfig = {
      stepId: STEP_APP_CONNECTION_HAS_GATEWAY_RELATIONSHIP,
      instanceConfig: integrationConfig,
      invocationConfig: invocationConfig as any,
    };

    const result = await executeStepWithDependencies(stepTestConfig);
    expect(result).toMatchStepMetadata(stepTestConfig);
  });
});

describe(`beyondcorp#${STEP_PROJECT_USES_APP_CONNECTOR_RELATIONSHIP}`, () => {
  let recording: Recording;
  beforeEach(() => {
    recording = setupGoogleCloudRecording({
      directory: __dirname,
      name: STEP_PROJECT_USES_APP_CONNECTOR_RELATIONSHIP,
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
    await fetchAppConnectors(context);
    await fetchResourceManagerProject(context);
    await buildProjectUsesAppConnectorRelationship(context);
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
        (e) => e._type === BEYONDCORP_APP_CONNECTOR_TYPE,
      ),
    ).toMatchGraphObjectSchema({
      _class: BEYONDCORP_APP_CONNECTOR_CLASS,
      schema: {
        additionalProperties: false,
        properties: {
          _type: { const: BEYONDCORP_APP_CONNECTOR_TYPE },
          _rawData: {
            type: 'array',
            items: { type: 'object' },
          },
          name: { type: 'string' },
          projectId: { type: 'string' },
          createdTime: { type: 'string' },
          updatedTime: { type: 'string' },
          UID: { type: 'string' },
          State: { type: 'string' },
          PrincipleInfo: { type: 'object' },
          CIDR: { type: 'string' },
          internal: { type: 'boolean' },
          public: { type: 'boolean' },
        },
      },
    });
    const { directRelationships } = separateRelationships(
      context.jobState.collectedRelationships,
    );
    expect(
      directRelationships.filter(
        (e) => e._type === RELATIONSHIP_TYPE_PROJECT_USES_APP_CONNECTOR,
      ),
    ).toMatchDirectRelationshipSchema({
      schema: {
        properties: {
          _class: { const: 'USES' },
          _type: {
            const: RELATIONSHIP_TYPE_PROJECT_USES_APP_CONNECTOR,
          },
        },
      },
    });
  });
});

describe(`beyondcorp#${STEP_PROJECT_USES_APP_CONNECTION_RELATIONSHIP}`, () => {
  let recording: Recording;
  beforeEach(() => {
    recording = setupGoogleCloudRecording({
      directory: __dirname,
      name: STEP_PROJECT_USES_APP_CONNECTION_RELATIONSHIP,
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
    await fetchAppConnections(context);
    await fetchResourceManagerProject(context);
    await buildProjectUsesAppConnectorRelationship(context);
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
        (e) => e._type === BEYONDCORP_APP_CONNECTION_TYPE,
      ),
    ).toMatchGraphObjectSchema({
      _class: BEYONDCORP_APP_CONNECTION_CLASS,
      schema: {
        additionalProperties: false,
        properties: {
          _type: { const: BEYONDCORP_APP_CONNECTION_TYPE },
          _rawData: {
            type: 'array',
            items: { type: 'object' },
          },
          name: { type: 'string' },
          createdTime: { type: 'string' },
          gateway: { type: 'string' },
          connector: { type: 'array' },
          uid: { type: 'string' },
          type: { type: 'string' },
          updatedTime: { type: 'string' },
          state: { type: 'string' },
          endpointHost: { type: 'string' },
          endpointPort: { type: 'number' },
          CIDR: { type: 'string' },
          internal: { type: 'boolean' },
          public: { type: 'boolean' },
        },
      },
    });
    const { directRelationships } = separateRelationships(
      context.jobState.collectedRelationships,
    );
    expect(
      directRelationships.filter(
        (e) => e._type === RELATIONSHIP_TYPE_PROJECT_USES_APP_CONNECTION,
      ),
    ).toMatchDirectRelationshipSchema({
      schema: {
        properties: {
          _class: { const: 'USES' },
          _type: {
            const: RELATIONSHIP_TYPE_PROJECT_USES_APP_CONNECTION,
          },
        },
      },
    });
  });
});

describe(`beyondcorp#${STEP_APPLICATION_ENDPOINT_USES_GATEWAY_RELATIONSHIP}`, () => {
  let recording: Recording;
  afterEach(async () => {
    if (recording) await recording.stop();
  });

  jest.setTimeout(45000);

  test(STEP_APPLICATION_ENDPOINT_USES_GATEWAY_RELATIONSHIP, async () => {
    recording = setupGoogleCloudRecording({
      name: STEP_APPLICATION_ENDPOINT_USES_GATEWAY_RELATIONSHIP,
      directory: __dirname,
      options: {
        matchRequestsBy: getMatchRequestsBy(integrationConfig),
      },
    });

    const stepTestConfig: StepTestConfig = {
      stepId: STEP_APPLICATION_ENDPOINT_USES_GATEWAY_RELATIONSHIP,
      instanceConfig: integrationConfig,
      invocationConfig: invocationConfig as any,
    };

    const result = await executeStepWithDependencies(stepTestConfig);
    expect(result).toMatchStepMetadata(stepTestConfig);
  });
});

describe(`beyondcorp#${STEP_PROJECT_HAS_BEYONDCORP_ENTERPRISE_RELATIONSHIP}`, () => {
  let recording: Recording;
  beforeEach(() => {
    recording = setupGoogleCloudRecording({
      directory: __dirname,
      name: STEP_PROJECT_HAS_BEYONDCORP_ENTERPRISE_RELATIONSHIP,
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
    await fetchBeyondcorpEnterprise(context);
    await fetchResourceManagerProject(context);
    await buildProjectHasBeyondcorpEnterpriseRelationship(context);
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
        (e) => e._type === BEYONDCORP_ENTERPRISE_TYPE,
      ),
    ).toMatchGraphObjectSchema({
      _class: BEYONDCORP_ENTERPRISE_CLASS,
      schema: {
        additionalProperties: false,
        properties: {
          _type: { const: BEYONDCORP_ENTERPRISE_TYPE },
          _rawData: {
            type: 'array',
            items: { type: 'object' },
          },
          name: { type: 'string' },
          category: { type: 'array' },
          function: { type: 'array' },
          endpoint: { type: 'string' },
        },
      },
    });
    const { directRelationships } = separateRelationships(
      context.jobState.collectedRelationships,
    );
    expect(
      directRelationships.filter(
        (e) => e._type === RELATIONSHIP_TYPE_PROJECT_HAS_BEYONDCORP_ENTERPRISE,
      ),
    ).toMatchDirectRelationshipSchema({
      schema: {
        properties: {
          _class: { const: 'HAS' },
          _type: {
            const: RELATIONSHIP_TYPE_PROJECT_HAS_BEYONDCORP_ENTERPRISE,
          },
        },
      },
    });
  });
});
