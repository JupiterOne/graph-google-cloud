import {
  executeStepWithDependencies,
  Recording,
  StepTestConfig,
} from '@jupiterone/integration-sdk-testing';
import { invocationConfig } from '../..';
import { integrationConfig } from '../../../test/config';
import {
  getMatchRequestsBy,
  setupGoogleCloudRecording,
} from '../../../test/recording';
import { CloudBuildEntitiesSpec, CloudBuildStepsSpec } from './constants';
import converters from './converters';
import mocks from './mocks';

describe('#cloud-build', () => {
  describe('steps', () => {
    let recording: Recording;
    afterEach(async () => {
      if (recording) await recording.stop();
    });

    for (const step of Object.values(CloudBuildStepsSpec)) {
      test(step.id, async () => {
        recording = setupGoogleCloudRecording({
          name: step.id,
          directory: __dirname,
          options: {
            matchRequestsBy: getMatchRequestsBy(integrationConfig),
          },
        });

        const stepTestConfig: StepTestConfig = {
          stepId: step.id,
          instanceConfig: integrationConfig,
          invocationConfig: invocationConfig as any,
        };

        const result = await executeStepWithDependencies(stepTestConfig);
        expect(result).toMatchStepMetadata(stepTestConfig);
      });
    }
  });

  describe('entities', () => {
    for (const entity of Object.values(CloudBuildEntitiesSpec)) {
      test(entity._type, () => {
        expect(converters[entity._type](mocks[entity._type])).toMatchSnapshot();
      });
    }
  });
});
