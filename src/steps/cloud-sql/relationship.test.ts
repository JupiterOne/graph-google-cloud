import {
  createMockStepExecutionContext,
  executeStepWithDependencies,
  filterGraphObjects,
  Recording,
  StepTestConfig,
} from '@jupiterone/integration-sdk-testing';
import { integrationConfig } from '../../../test/config';
import { IntegrationConfig, invocationConfig } from '../..';
import {
  setupGoogleCloudRecording,
  getMatchRequestsBy,
} from '../../../test/recording';
import {
  ENTITY_CLASS_CLOUD_SQL,
  ENTITY_CLASS_CLOUD_SQL_INSTANCES,
  ENTITY_TYPE_CLOUD_SQL,
  ENTITY_TYPE_CLOUD_SQL_INSTANCES,
  RELATIONSHIP_TYPE_CLOUD_PROJECT_HAS_CLOUD_SQL,
  RELATIONSHIP_TYPE_CLOUD_SQL_HAS_CLOUD_SQL_INSTANCES,
  STEP_CLOUD_SQL_HAS_CLOUD_SQL_DATABASE,
  STEP_CLOUD_SQL_HAS_CLOUD_SQL_INSTANCES,
  STEP_CLOUD_SQL_INSTANCES_ASSIGNED_GOOGLE_USER,
  STEP_CLOUD_SQL_INSTANCES_HAS_CLOUD_SQL_BACKUP,
  STEP_CLOUD_SQL_INSTANCES_HAS_CLOUD_SQL_CONNECTION,
  STEP_CLOUD_SQL_INSTANCES_USES_CLOUD_SQL_DATABASE,
  STEP_CLOUD_SQL_INSTANCES_USES_CLOUD_SQL_SSL_CERTIFICATION,
  STEP_GOOGLE_CLOUD_PROJECT_HAS_CLOUD_SQL,
} from './constants';
import {
  ExplicitRelationship,
  Relationship,
} from '@jupiterone/integration-sdk-core';
import {
  buildProjectHasSqlRelationship,
  buildSqlHasSqlInstancesRelationship,
  fetchCloudSql,
  fetchCloudSqlInstances,
} from '.';
import {
  fetchResourceManagerProject,
  PROJECT_ENTITY_TYPE,
} from '../resource-manager';

describe(`Cloud-Sql#${STEP_GOOGLE_CLOUD_PROJECT_HAS_CLOUD_SQL}`, () => {
  let recording: Recording;
  beforeEach(() => {
    recording = setupGoogleCloudRecording({
      directory: __dirname,
      name: STEP_GOOGLE_CLOUD_PROJECT_HAS_CLOUD_SQL,
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
  test(
    STEP_GOOGLE_CLOUD_PROJECT_HAS_CLOUD_SQL,
    async () => {
      const context = createMockStepExecutionContext<IntegrationConfig>({
        instanceConfig: {
          ...integrationConfig,
          serviceAccountKeyFile:
            integrationConfig.serviceAccountKeyFile.replace(
              'j1-gc-integration-dev-v2',
              'j1-gc-integration-dev-v3',
            ),
          serviceAccountKeyConfig: {
            ...integrationConfig.serviceAccountKeyConfig,
            project_id: 'j1-gc-integration-dev-v3',
          },
        },
      });
      await fetchCloudSql(context);
      await fetchResourceManagerProject(context);
      await buildProjectHasSqlRelationship(context);
      expect({
        numCollectedEntities: context.jobState.collectedEntities.length,
        numCollectedRelationships:
          context.jobState.collectedRelationships.length,
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
          (e) => e._type === ENTITY_TYPE_CLOUD_SQL,
        ),
      ).toMatchGraphObjectSchema({
        _class: ENTITY_CLASS_CLOUD_SQL,
        schema: {
          additionalProperties: false,
          properties: {
            _type: { const: ENTITY_TYPE_CLOUD_SQL },
            _rawData: {
              type: 'array',
              items: { type: 'object' },
            },
            name: { type: 'string' },
            function: { type: 'array' },
            category: { type: 'array' },
          },
        },
      });
      const { directRelationships } = separateRelationships(
        context.jobState.collectedRelationships,
      );
      expect(
        directRelationships.filter(
          (e) => e._type === RELATIONSHIP_TYPE_CLOUD_PROJECT_HAS_CLOUD_SQL,
        ),
      ).toMatchDirectRelationshipSchema({
        schema: {
          properties: {
            _class: { const: 'HAS' },
            _type: {
              const: RELATIONSHIP_TYPE_CLOUD_PROJECT_HAS_CLOUD_SQL,
            },
          },
        },
      });
    },
    100000,
  );
});

describe(`Cloud-Sql#${STEP_CLOUD_SQL_HAS_CLOUD_SQL_INSTANCES}`, () => {
  let recording: Recording;
  beforeEach(() => {
    recording = setupGoogleCloudRecording({
      directory: __dirname,
      name: STEP_CLOUD_SQL_HAS_CLOUD_SQL_INSTANCES,
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
  test(
    STEP_CLOUD_SQL_HAS_CLOUD_SQL_INSTANCES,
    async () => {
      const context = createMockStepExecutionContext<IntegrationConfig>({
        instanceConfig: {
          ...integrationConfig,
          serviceAccountKeyFile:
            integrationConfig.serviceAccountKeyFile.replace(
              'j1-gc-integration-dev-v2',
              'j1-gc-integration-dev-v3',
            ),
          serviceAccountKeyConfig: {
            ...integrationConfig.serviceAccountKeyConfig,
            project_id: 'j1-gc-integration-dev-v3',
          },
        },
      });
      await fetchCloudSql(context);
      await fetchCloudSqlInstances(context);
      await buildSqlHasSqlInstancesRelationship(context);
      expect({
        numCollectedEntities: context.jobState.collectedEntities.length,
        numCollectedRelationships:
          context.jobState.collectedRelationships.length,
        collectedEntities: context.jobState.collectedEntities,
        collectedRelationships: context.jobState.collectedRelationships,
        encounteredTypes: context.jobState.encounteredTypes,
      }).toMatchSnapshot();
      expect(
        context.jobState.collectedEntities.filter(
          (e) => e._type === ENTITY_TYPE_CLOUD_SQL,
        ),
      ).toMatchGraphObjectSchema({
        _class: ENTITY_CLASS_CLOUD_SQL,
        schema: {
          additionalProperties: false,
          properties: {
            _type: { const: ENTITY_TYPE_CLOUD_SQL },
            _rawData: {
              type: 'array',
              items: { type: 'object' },
            },
            name: { type: 'string' },
            function: { type: 'array' },
            category: { type: 'array' },
          },
        },
      });
      expect(
        context.jobState.collectedEntities.filter(
          (e) => e._type === ENTITY_TYPE_CLOUD_SQL_INSTANCES,
        ),
      ).toMatchGraphObjectSchema({
        _class: ENTITY_CLASS_CLOUD_SQL_INSTANCES,
        schema: {
          additionalProperties: false,
          properties: {
            _type: { const: ENTITY_TYPE_CLOUD_SQL_INSTANCES },
            _rawData: {},
            name: { type: 'string' },
            etag: { type: 'string' },
            url: { type: 'string' },
            projectId: { type: 'string' },
            kind: { type: 'string' },
            databaseInstalledVersion: { type: 'string' },
            connectionName: { type: 'string' },
          },
        },
      });
      const { directRelationships } = separateRelationships(
        context.jobState.collectedRelationships,
      );
      expect(
        directRelationships.filter(
          (e) =>
            e._type === RELATIONSHIP_TYPE_CLOUD_SQL_HAS_CLOUD_SQL_INSTANCES,
        ),
      ).toMatchDirectRelationshipSchema({
        schema: {
          properties: {
            _class: { const: 'HAS' },
            _type: {
              const: RELATIONSHIP_TYPE_CLOUD_SQL_HAS_CLOUD_SQL_INSTANCES,
            },
          },
        },
      });
    },
    100000,
  );
});

describe(`Cloud-Sql#${STEP_CLOUD_SQL_INSTANCES_ASSIGNED_GOOGLE_USER}`, () => {
  let recording: Recording;
  afterEach(async () => {
    if (recording) await recording.stop();
  });

  test(STEP_CLOUD_SQL_INSTANCES_ASSIGNED_GOOGLE_USER, async () => {
    recording = setupGoogleCloudRecording({
      name: STEP_CLOUD_SQL_INSTANCES_ASSIGNED_GOOGLE_USER,
      directory: __dirname,
      options: {
        matchRequestsBy: getMatchRequestsBy(integrationConfig),
        recordFailedRequests: true,
      },
    });

    const stepTestConfig: StepTestConfig = {
      stepId: STEP_CLOUD_SQL_INSTANCES_ASSIGNED_GOOGLE_USER,
      instanceConfig: integrationConfig,
      invocationConfig: invocationConfig as any,
    };

    const result = await executeStepWithDependencies(stepTestConfig);
    expect(result).toMatchStepMetadata(stepTestConfig);
  });
});

describe(`Cloud-Sql#${STEP_CLOUD_SQL_INSTANCES_HAS_CLOUD_SQL_CONNECTION}`, () => {
  let recording: Recording;
  afterEach(async () => {
    if (recording) await recording.stop();
  });

  test(STEP_CLOUD_SQL_INSTANCES_HAS_CLOUD_SQL_CONNECTION, async () => {
    recording = setupGoogleCloudRecording({
      name: STEP_CLOUD_SQL_INSTANCES_HAS_CLOUD_SQL_CONNECTION,
      directory: __dirname,
      options: {
        matchRequestsBy: getMatchRequestsBy(integrationConfig),
        recordFailedRequests: true,
      },
    });

    const stepTestConfig: StepTestConfig = {
      stepId: STEP_CLOUD_SQL_INSTANCES_HAS_CLOUD_SQL_CONNECTION,
      instanceConfig: integrationConfig,
      invocationConfig: invocationConfig as any,
    };

    const result = await executeStepWithDependencies(stepTestConfig);
    expect(result).toMatchStepMetadata(stepTestConfig);
  });
});

describe(`Cloud-Sql#${STEP_CLOUD_SQL_INSTANCES_HAS_CLOUD_SQL_BACKUP}`, () => {
  let recording: Recording;
  afterEach(async () => {
    if (recording) await recording.stop();
  });

  test(STEP_CLOUD_SQL_INSTANCES_HAS_CLOUD_SQL_BACKUP, async () => {
    recording = setupGoogleCloudRecording({
      name: STEP_CLOUD_SQL_INSTANCES_HAS_CLOUD_SQL_BACKUP,
      directory: __dirname,
      options: {
        matchRequestsBy: getMatchRequestsBy(integrationConfig),
        recordFailedRequests: true,
      },
    });

    const stepTestConfig: StepTestConfig = {
      stepId: STEP_CLOUD_SQL_INSTANCES_HAS_CLOUD_SQL_BACKUP,
      instanceConfig: integrationConfig,
      invocationConfig: invocationConfig as any,
    };

    const result = await executeStepWithDependencies(stepTestConfig);
    expect(result).toMatchStepMetadata(stepTestConfig);
  });
});

describe(`Cloud-Sql#${STEP_CLOUD_SQL_HAS_CLOUD_SQL_DATABASE}`, () => {
  let recording: Recording;
  afterEach(async () => {
    if (recording) await recording.stop();
  });

  test(STEP_CLOUD_SQL_HAS_CLOUD_SQL_DATABASE, async () => {
    recording = setupGoogleCloudRecording({
      name: STEP_CLOUD_SQL_HAS_CLOUD_SQL_DATABASE,
      directory: __dirname,
      options: {
        matchRequestsBy: getMatchRequestsBy(integrationConfig),
        recordFailedRequests: true,
      },
    });

    const stepTestConfig: StepTestConfig = {
      stepId: STEP_CLOUD_SQL_HAS_CLOUD_SQL_DATABASE,
      instanceConfig: integrationConfig,
      invocationConfig: invocationConfig as any,
    };

    const result = await executeStepWithDependencies(stepTestConfig);
    expect(result).toMatchStepMetadata(stepTestConfig);
  });
});

describe(`Cloud-Sql#${STEP_CLOUD_SQL_INSTANCES_USES_CLOUD_SQL_DATABASE}`, () => {
  let recording: Recording;
  afterEach(async () => {
    if (recording) await recording.stop();
  });

  test(STEP_CLOUD_SQL_INSTANCES_USES_CLOUD_SQL_DATABASE, async () => {
    recording = setupGoogleCloudRecording({
      name: STEP_CLOUD_SQL_INSTANCES_USES_CLOUD_SQL_DATABASE,
      directory: __dirname,
      options: {
        matchRequestsBy: getMatchRequestsBy(integrationConfig),
        recordFailedRequests: true,
      },
    });

    const stepTestConfig: StepTestConfig = {
      stepId: STEP_CLOUD_SQL_INSTANCES_USES_CLOUD_SQL_DATABASE,
      instanceConfig: integrationConfig,
      invocationConfig: invocationConfig as any,
    };

    const result = await executeStepWithDependencies(stepTestConfig);
    expect(result).toMatchStepMetadata(stepTestConfig);
  });
});

describe(`Cloud-Sql#${STEP_CLOUD_SQL_INSTANCES_USES_CLOUD_SQL_SSL_CERTIFICATION}`, () => {
  let recording: Recording;
  afterEach(async () => {
    if (recording) await recording.stop();
  });

  test(STEP_CLOUD_SQL_INSTANCES_USES_CLOUD_SQL_SSL_CERTIFICATION, async () => {
    recording = setupGoogleCloudRecording({
      name: STEP_CLOUD_SQL_INSTANCES_USES_CLOUD_SQL_SSL_CERTIFICATION,
      directory: __dirname,
      options: {
        matchRequestsBy: getMatchRequestsBy(integrationConfig),
        recordFailedRequests: true,
      },
    });

    const stepTestConfig: StepTestConfig = {
      stepId: STEP_CLOUD_SQL_INSTANCES_USES_CLOUD_SQL_SSL_CERTIFICATION,
      instanceConfig: integrationConfig,
      invocationConfig: invocationConfig as any,
    };

    const result = await executeStepWithDependencies(stepTestConfig);
    expect(result).toMatchStepMetadata(stepTestConfig);
  });
});
