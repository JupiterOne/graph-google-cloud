import {
  Recording,
  createMockStepExecutionContext,
  StepTestConfig,
  executeStepWithDependencies,
} from '@jupiterone/integration-sdk-testing';
import {
  setupGoogleCloudRecording,
  getMatchRequestsBy,
} from '../../../test/recording';
import { IntegrationConfig } from '../../types';
import { fetchCloudFunctions } from '.';
import { integrationConfig } from '../../../test/config';
import {
  CLOUD_FUNCTION_ENTITY_CLASS,
  CLOUD_FUNCTION_ENTITY_TYPE,
  FunctionStepsSpec,
} from './constants';
import { invocationConfig } from '../..';

describe('#fetchCloudFunctions', () => {
  let recording: Recording;

  afterEach(async () => {
    await recording.stop();
  });

  test('should collect data', async () => {
    recording = setupGoogleCloudRecording({
      directory: __dirname,
      name: 'fetchCloudFunctions',
    });

    const context = createMockStepExecutionContext<IntegrationConfig>({
      instanceConfig: integrationConfig,
    });

    await fetchCloudFunctions(context);

    expect(context.jobState.collectedRelationships.length).toEqual(0);
    expect(context.jobState.collectedEntities.length).toBeGreaterThanOrEqual(1);

    expect(context.jobState.collectedEntities).toEqual(
      context.jobState.collectedEntities.map((e) =>
        expect.objectContaining({
          ...e,
          _rawData: expect.any(Array),
          _class: [CLOUD_FUNCTION_ENTITY_CLASS],
          _type: CLOUD_FUNCTION_ENTITY_TYPE,
          _key: e.name as string,
          name: expect.any(String),
          displayName: e.name,
          runtime: expect.any(String),
          updatedOn: expect.any(Number),
          availableMemoryMb: expect.any(Number),
          timeout: expect.any(String),
          version: expect.any(String),
          handler: expect.any(String),
          status: expect.any(String),
        }),
      ),
    );
  });

  test(
    FunctionStepsSpec.CLOUD_FUNCTIONS_SOURCE_REPO_RELATIONSHIP.id,
    async () => {
      recording = setupGoogleCloudRecording({
        name: FunctionStepsSpec.CLOUD_FUNCTIONS_SOURCE_REPO_RELATIONSHIP.id,
        directory: __dirname,
        options: {
          matchRequestsBy: getMatchRequestsBy(integrationConfig),
        },
      });

      const stepTestConfig: StepTestConfig = {
        stepId: FunctionStepsSpec.CLOUD_FUNCTIONS_SOURCE_REPO_RELATIONSHIP.id,
        instanceConfig: integrationConfig,
        invocationConfig: invocationConfig as any,
      };

      const result = await executeStepWithDependencies(stepTestConfig);
      expect(result).toMatchStepMetadata(stepTestConfig);
    },
  );
});
