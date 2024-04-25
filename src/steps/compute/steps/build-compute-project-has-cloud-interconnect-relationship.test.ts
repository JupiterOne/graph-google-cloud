import {
  Recording,
  StepTestConfig,
  executeStepWithDependencies,
} from '@jupiterone/integration-sdk-testing';
import { STEP_COMPUTE_PROJECT_HAS_CLOUD_INTERCONNECT_RELATIONSHIP } from '../constants';
import {
  setupGoogleCloudRecording,
  getMatchRequestsBy,
} from '../../../../test/recording';
import { integrationConfig } from '../../../../test/config';
import { invocationConfig } from '../../..';

describe(`compute#${STEP_COMPUTE_PROJECT_HAS_CLOUD_INTERCONNECT_RELATIONSHIP}`, () => {
  let recording: Recording;
  afterEach(async () => {
    if (recording) await recording.stop();
  });

  test(
    STEP_COMPUTE_PROJECT_HAS_CLOUD_INTERCONNECT_RELATIONSHIP,
    async () => {
      const stepTestConfig: StepTestConfig = {
        stepId: STEP_COMPUTE_PROJECT_HAS_CLOUD_INTERCONNECT_RELATIONSHIP,
        instanceConfig: integrationConfig,
        invocationConfig: invocationConfig as any,
      };

      recording = setupGoogleCloudRecording({
        name: STEP_COMPUTE_PROJECT_HAS_CLOUD_INTERCONNECT_RELATIONSHIP,
        directory: __dirname,
        options: {
          matchRequestsBy: getMatchRequestsBy(integrationConfig),
        },
      });

      const stepResults = await executeStepWithDependencies(stepTestConfig);
      expect(stepResults.collectedRelationships.length).toBeGreaterThan(0);
    },
    500_000,
  );
});

//   describe(`compute#${STEP_COMPUTE_PROJECT_HAS_CLOUD_INTERCONNECT_RELATIONSHIP}`, () => {
//     let recording: Recording;
//     beforeEach(() => {
//       recording = setupGoogleCloudRecording({
//         directory: __dirname,
//         name: STEP_COMPUTE_PROJECT_HAS_CLOUD_INTERCONNECT_RELATIONSHIP,
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
//           serviceAccountKeyFile: integrationConfig.serviceAccountKeyFile.replace(
//             'j1-gc-integration-dev-v2',
//             'j1-gc-integration-dev-v3',
//           ),
//           serviceAccountKeyConfig: {
//             ...integrationConfig.serviceAccountKeyConfig,
//             project_id: 'j1-gc-integration-dev-v3',
//           },
//         },
//       });
//       await fetchComputeProject(context);
//       await fetchCloudInterconnect(context);
//       await buildComputeProjectHasCloudInterconnectRelationship(context);
//       expect({
//         numCollectedEntities: context.jobState.collectedEntities.length,
//         numCollectedRelationships: context.jobState.collectedRelationships.length,
//         collectedEntities: context.jobState.collectedEntities,
//         collectedRelationships: context.jobState.collectedRelationships,
//         encounteredTypes: context.jobState.encounteredTypes,
//       }).toMatchSnapshot();
//       expect(
//         context.jobState.collectedEntities.filter(
//           (e) => e._type === ENTITY_TYPE_COMPUTE_PROJECT,
//         ),
//       ).toMatchGraphObjectSchema({
//         _class: ENTITY_CLASS_COMPUTE_PROJECT,
//         schema: {
//           additionalProperties: false,
//           properties: {
//             _type: { const: 'google_compute_project' },
//             _rawData: {
//               type: 'array',
//               items: { type: 'object' },
//             },
//             id: { type: 'string' },
//             name: { type: 'string' },
//             displayName: { type: 'string' },
//             isOSLoginEnabled: { type: 'boolean' },
//             kind: { type: 'string' },
//             defaultServiceAccount: { type : 'string'},
//             defaultNetworkTier: { type: 'string'},
//             createdOn: { type: 'number' },
//           },
//         },
//       });
//       expect(
//         context.jobState.collectedEntities.filter(
//           (e) => e._type === ENTITY_TYPE_CLOUD_INTERCONNECT,
//         ),
//       ).toMatchGraphObjectSchema({
//         _class: ENTITY_CLASS_CLOUD_INTERCONNECT,
//         schema: {
//           additionalProperties: false,
//           properties: {
//             _type: { const: ENTITY_TYPE_CLOUD_INTERCONNECT },
//             _rawData: {
//               type: 'array',
//               items: { type: 'object' },
//             },
//             id: { type: 'number'},
//             name: { type: 'string' },
//             location: { type: 'string' },
//             interConnectionType: { type: 'string' },
//             kind: { type: 'string' },
//             public: { type: 'boolean' },
//             adminEnabled: { type: 'boolean' },
//             createdOn: { type : 'number'}
//           },
//         },
//       });
//       const { directRelationships } = separateRelationships(
//         context.jobState.collectedRelationships,
//       );
//       expect(
//         directRelationships.filter(
//           (e) => e._type === REATIONSHIP_TYPE_COMPUTE_PROJECT_HAS_CLOUD_INTERCONNECT,
//         ),
//       ).toMatchDirectRelationshipSchema({
//         schema: {
//           properties: {
//             _class: { const: 'HAS' },
//             _type: {
//               const: REATIONSHIP_TYPE_COMPUTE_PROJECT_HAS_CLOUD_INTERCONNECT,
//             },
//           },
//         },
//       });
//     });
//   });
