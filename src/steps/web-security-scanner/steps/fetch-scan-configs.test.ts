import {
  executeStepWithDependencies,
  Recording,
  StepTestConfig,
} from '@jupiterone/integration-sdk-testing';
import { invocationConfig } from '../../..';
import { integrationConfig } from '../../../../test/config';
import {
  getMatchRequestsBy,
  setupGoogleCloudRecording,
} from '../../../../test/recording';
import { WebSecurityScannerSteps } from '../constants';

describe(`web-security-scanner#${WebSecurityScannerSteps.FETCH_SCAN_CONFIGS.id}`, () => {
  let recording: Recording;
  afterEach(async () => {
    if (recording) await recording.stop();
  });

  jest.setTimeout(45000);

  test(WebSecurityScannerSteps.FETCH_SCAN_CONFIGS.id, async () => {
    recording = setupGoogleCloudRecording({
      name: WebSecurityScannerSteps.FETCH_SCAN_CONFIGS.id,
      directory: __dirname,
      options: {
        matchRequestsBy: getMatchRequestsBy(integrationConfig),
      },
    });

    const stepTestConfig: StepTestConfig = {
      stepId: WebSecurityScannerSteps.FETCH_SCAN_CONFIGS.id,
      instanceConfig: integrationConfig,
      invocationConfig: invocationConfig as any,
    };

    const result = await executeStepWithDependencies(stepTestConfig);
    expect(result).toMatchStepMetadata(stepTestConfig);
  });
});
