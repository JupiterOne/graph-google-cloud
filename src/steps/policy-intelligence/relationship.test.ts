import {
  createMockStepExecutionContext,
  executeStepWithDependencies,
  filterGraphObjects,
  Recording,
  StepTestConfig,
} from '@jupiterone/integration-sdk-testing';
import { integrationConfig } from '../../../test/config';
import {
  getMatchRequestsBy,
  setupGoogleCloudRecording,
} from '../../../test/recording';
import {
  POLICY_INTELLIGENCE_ANALYZER_CLASS,
  POLICY_INTELLIGENCE_ANALYZER_TYPE,
  RELATIONSHIP_TYPE_GOOGLE_CLOUD_PROJECT_HAS_POLICY_INTELLIGENCE_ANALYZER,
  STEP_GOOGLE_CLOUD_PROJECT_HAS_POLICY_INTELLIGENCE_ANALYZER,
  STEP_GOOGLE_CLOUD_PROJECT_HAS_POLICY_INTELLIGENCE_ANALYZER_ACTIVITY,
  STEP_POLICY_INTELLIGENCE_ANALYZER_HAS_POLICY_INTELLIGENCE_ANALYZER_ACTIVITY,
} from './constants';
import { IntegrationConfig, invocationConfig } from '../..';
import {
  ExplicitRelationship,
  Relationship,
} from '@jupiterone/integration-sdk-core';
import {
  buildProjectHasPolicyAnalyzerRelationship,
  fetchPolicyAnalyzer,
} from '.';
import {
  fetchResourceManagerProject,
  PROJECT_ENTITY_TYPE,
} from '../resource-manager';

describe(`#${STEP_GOOGLE_CLOUD_PROJECT_HAS_POLICY_INTELLIGENCE_ANALYZER}`, () => {
  let recording: Recording;
  beforeEach(() => {
    recording = setupGoogleCloudRecording({
      directory: __dirname,
      name: STEP_GOOGLE_CLOUD_PROJECT_HAS_POLICY_INTELLIGENCE_ANALYZER,
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
    await fetchPolicyAnalyzer(context);
    await fetchResourceManagerProject(context);
    await buildProjectHasPolicyAnalyzerRelationship(context);
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
        (e) => e._type === POLICY_INTELLIGENCE_ANALYZER_TYPE,
      ),
    ).toMatchGraphObjectSchema({
      _class: POLICY_INTELLIGENCE_ANALYZER_CLASS,
      schema: {
        additionalProperties: false,
        properties: {
          _type: { const: POLICY_INTELLIGENCE_ANALYZER_TYPE },
          _rawData: {
            type: 'array',
            items: { type: 'object' },
          },
          name: { type: 'string' },
          summary: { type: 'string' },
          category: { type: 'array' },
          function: { type: 'array' },
          projectId: { type: 'string' },
          activityType: { type: 'string' },
          observationPeriod: { type: 'string' },
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
          RELATIONSHIP_TYPE_GOOGLE_CLOUD_PROJECT_HAS_POLICY_INTELLIGENCE_ANALYZER,
      ),
    ).toMatchDirectRelationshipSchema({
      schema: {
        properties: {
          _class: { const: 'HAS' },
          _type: {
            const:
              RELATIONSHIP_TYPE_GOOGLE_CLOUD_PROJECT_HAS_POLICY_INTELLIGENCE_ANALYZER,
          },
        },
      },
    });
  });
});

describe(`Policy-intelligence#${STEP_POLICY_INTELLIGENCE_ANALYZER_HAS_POLICY_INTELLIGENCE_ANALYZER_ACTIVITY}`, () => {
  let recording: Recording;
  afterEach(async () => {
    if (recording) await recording.stop();
  });
  test(STEP_POLICY_INTELLIGENCE_ANALYZER_HAS_POLICY_INTELLIGENCE_ANALYZER_ACTIVITY, async () => {
    recording = setupGoogleCloudRecording({
      name: STEP_POLICY_INTELLIGENCE_ANALYZER_HAS_POLICY_INTELLIGENCE_ANALYZER_ACTIVITY,
      directory: __dirname,
      options: {
        matchRequestsBy: getMatchRequestsBy(integrationConfig),
        recordFailedRequests: true,
      },
    });
    const stepTestConfig: StepTestConfig = {
      stepId: STEP_POLICY_INTELLIGENCE_ANALYZER_HAS_POLICY_INTELLIGENCE_ANALYZER_ACTIVITY,
      instanceConfig: integrationConfig,
      invocationConfig: invocationConfig as any,
    };
    const result = await executeStepWithDependencies(stepTestConfig);
    expect(result).toMatchStepMetadata(stepTestConfig);
  }, 300000);
});


describe(`Policy-intelligence#${STEP_GOOGLE_CLOUD_PROJECT_HAS_POLICY_INTELLIGENCE_ANALYZER_ACTIVITY}`, () => {
  let recording: Recording;
  afterEach(async () => {
    if (recording) await recording.stop();
  });
  test(STEP_GOOGLE_CLOUD_PROJECT_HAS_POLICY_INTELLIGENCE_ANALYZER_ACTIVITY, async () => {
    recording = setupGoogleCloudRecording({
      name: STEP_GOOGLE_CLOUD_PROJECT_HAS_POLICY_INTELLIGENCE_ANALYZER_ACTIVITY,
      directory: __dirname,
      options: {
        matchRequestsBy: getMatchRequestsBy(integrationConfig),
        recordFailedRequests: true,
      },
    });
    const stepTestConfig: StepTestConfig = {
      stepId: STEP_GOOGLE_CLOUD_PROJECT_HAS_POLICY_INTELLIGENCE_ANALYZER_ACTIVITY,
      instanceConfig: integrationConfig,
      invocationConfig: invocationConfig as any,
    };
    const result = await executeStepWithDependencies(stepTestConfig);
    expect(result).toMatchStepMetadata(stepTestConfig);
  }, 300000);
});


// describe(
//   `#${STEP_GOOGLE_CLOUD_PROJECT_HAS_POLICY_INTELLIGENCE_ANALYZER_ACTIVITY}`,
//   () => {
//     let recording: Recording;
//     beforeEach(() => {
//       recording = setupGoogleCloudRecording({
//         directory: __dirname,
//         name: STEP_GOOGLE_CLOUD_PROJECT_HAS_POLICY_INTELLIGENCE_ANALYZER_ACTIVITY,
//         options: {
//           matchRequestsBy: getMatchRequestsBy(integrationConfig),
//           recordFailedRequests: true,
//         },
//       });
//     });
//     afterEach(async () => {
//       await recording.stop();
//     });
//     function separateRelationships(collectedRelationships: Relationship[]) {
//       const { targets: directRelationships } = filterGraphObjects(
//         collectedRelationships,
//         (r) => !r._mapping,
//       ) as {
//         targets: ExplicitRelationship[];
//       };
//       return {
//         directRelationships,
//       };
//     }
//     test('should collect data', async () => {
//       const context = createMockStepExecutionContext<IntegrationConfig>({
//         instanceConfig: {
//           ...integrationConfig,
//           serviceAccountKeyFile:
//             integrationConfig.serviceAccountKeyFile.replace(
//               'j1-gc-integration-dev-v2',
//               'j1-gc-integration-dev-v3',
//             ),
//           serviceAccountKeyConfig: {
//             ...integrationConfig.serviceAccountKeyConfig,
//             project_id: 'j1-gc-integration-dev-v3',
//           },
//         },
//       });
//       await fetchPolicyAnalyzerActivity(context);
//       await fetchResourceManagerProject(context);
//       await buildProjectHasPolicyAnalyzerActivityRelationship(context);
//       expect({
//         numCollectedEntities: context.jobState.collectedEntities.length,
//         numCollectedRelationships:
//           context.jobState.collectedRelationships.length,
//         collectedEntities: context.jobState.collectedEntities,
//         collectedRelationships: context.jobState.collectedRelationships,
//         encounteredTypes: context.jobState.encounteredTypes,
//       }).toMatchSnapshot();
//       expect(
//         context.jobState.collectedEntities.filter(
//           (e) => e._type === PROJECT_ENTITY_TYPE,
//         ),
//       ).toMatchGraphObjectSchema({
//         _class: ['Account'],
//         schema: {
//           additionalProperties: false,
//           properties: {
//             _type: { const: 'google_cloud_project' },
//             _rawData: {
//               type: 'array',
//               items: { type: 'object' },
//             },
//             projectId: { type: 'string' },
//             name: { type: 'string' },
//             displayName: { type: 'string' },
//             parent: { type: 'string' },
//             lifecycleState: { type: 'string' },
//             createdOn: { type: 'number' },
//             updatedOn: { type: 'number' },
//           },
//         },
//       });
//       expect(
//         context.jobState.collectedEntities.filter(
//           (e) => e._type === POLICY_INTELLIGENCE_ANALYZER_ACTIVITY_TYPE,
//         ),
//       ).toMatchGraphObjectSchema({
//         _class: POLICY_INTELLIGENCE_ANALYZER_ACTIVITY_CLASS,
//         schema: {
//           additionalProperties: false,
//           properties: {
//             _type: { const: POLICY_INTELLIGENCE_ANALYZER_ACTIVITY_TYPE },
//             _rawData: {
//               type: 'array',
//               items: { type: 'object' },
//             },
//             name: { type: 'string' },
//             summary: { type: 'string' },
//             category: { type: 'string' },
//             internal: { type: 'boolean' },
//             serviceAccountId: { type: 'string' },
//             endTime: { type: 'string' },
//             startTime: { type: 'string' },
//           },
//         },
//       });
//       const { directRelationships } = separateRelationships(
//         context.jobState.collectedRelationships,
//       );
//       expect(
//         directRelationships.filter(
//           (e) =>
//             e._type ===
//             RELATIONSHIP_TYPE_GOOGLE_CLOUD_PROJECT_HAS_POLICY_INTELLIGENCE_ANALYZER_ACTIVITY,
//         ),
//       ).toMatchDirectRelationshipSchema({
//         schema: {
//           properties: {
//             _class: { const: 'HAS' },
//             _type: {
//               const:
//                 RELATIONSHIP_TYPE_GOOGLE_CLOUD_PROJECT_HAS_POLICY_INTELLIGENCE_ANALYZER_ACTIVITY,
//             },
//           },
//         },
//       });
//     }, 300000);
//   },
// );
