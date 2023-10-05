import {
  createMockStepExecutionContext,
  Recording,
} from '@jupiterone/integration-sdk-testing';
import { IntegrationConfig } from '../..';
import { integrationConfig } from '../../../test/config';
import { setupGoogleCloudRecording } from '../../../test/recording';
import { CloudAssetClient } from './client';
import { getMockLogger } from '../../../test/helpers/getMockLogger';
import { IntegrationLogger } from '@jupiterone/integration-sdk-core';

describe('#iterateIamPoliciesForProjectAndResources', () => {
  let recording: Recording;

  beforeEach(() => {
    recording = setupGoogleCloudRecording({
      directory: __dirname,
      name: 'iterateIamPoliciesForProjectAndResources',
    });
  });

  afterEach(async () => {
    await recording.stop();
  });

  test('should collect data when a projectId', async () => {
    const context = createMockStepExecutionContext<IntegrationConfig>({
      // Temporary tweak to make this test pass since its recording has been updated from the new organization/v3
      instanceConfig: {
        ...integrationConfig,
        projectId: 'j1-gc-integration-dev-v3',
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

    const handlePolicyResult = jest.fn();
    const logger = getMockLogger<IntegrationLogger>();
    const client = new CloudAssetClient(
      { config: context.instance.config },
      logger,
    );
    expect(typeof client.projectId).toBe('string');

    await client.iterateIamPoliciesForProjectAndResources(handlePolicyResult);
    expect(handlePolicyResult).toHaveBeenCalled();
    expect(handlePolicyResult.call).toMatchSnapshot();
  });

  test('should not collect data when ther is no projectId', async () => {
    const context = createMockStepExecutionContext<IntegrationConfig>({
      // Temporary tweak to make this test pass since its recording has been updated from the new organization/v3
      instanceConfig: {
        ...integrationConfig,
        projectId: 'j1-gc-integration-dev-v3',
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
    delete context.instance.config.projectId;
    delete (context as any).instance.config.serviceAccountKeyConfig.project_id;

    const handlePolicyResult = jest.fn();
    const logger = getMockLogger<IntegrationLogger>();
    const client = new CloudAssetClient(
      { config: context.instance.config },
      logger,
    );
    expect(client.projectId).toBeUndefined();

    await client.iterateIamPoliciesForProjectAndResources(handlePolicyResult);
    expect(handlePolicyResult).not.toHaveBeenCalled();
  });
});
