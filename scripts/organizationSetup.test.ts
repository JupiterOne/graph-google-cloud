jest.setTimeout(60000);

import Logger from 'bunyan';
import { setupGoogleCloudRecording } from '../test/recording';
import {
  setupOrganization,
  SetupOrganizationParams,
  SetupOrganizationResult,
} from './organizationSetup';

function getMockLogger() {
  const mockLogger = ({
    info: jest.fn(),
    fatal: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    trace: jest.fn(),
  } as unknown) as Logger;

  mockLogger.child = () => mockLogger;

  return mockLogger;
}

function getSetupOrganizationParams(
  params?: Partial<SetupOrganizationParams>,
): SetupOrganizationParams {
  return {
    jupiteroneAccountId: process.env.JUPITERONE_ACCOUNT_ID || 'j1dev',
    googleAccessToken:
      process.env.GOOGLE_ACCESS_TOKEN || 'mock-google-access-token',
    jupiteroneApiKey:
      process.env.JUPITERONE_API_KEY || 'mock-jupiterone-api-key',
    logger: getMockLogger(),
    ...params,
  };
}

async function withRecording(recordingName: string, cb: () => Promise<void>) {
  const recording = setupGoogleCloudRecording({
    directory: __dirname,
    name: recordingName,
    options: {
      recordFailedRequests: true,
    },
  });

  try {
    await cb();
  } finally {
    await recording.stop();
  }
}

describe('#setupOrganization', () => {
  test('should iterate only specific projects when projectIds supplied', async () => {
    await withRecording('setupOrganization', async () => {
      const result = await setupOrganization(
        getSetupOrganizationParams({
          projectIds: ['j1-gc-integration-dev'],
        }),
      );

      console.log('RESULT', JSON.stringify(result, null, 2));

      const expected: SetupOrganizationResult = {
        created: ['j1-gc-integration-dev'],
        failed: [],
        skipped: [],
        exists: [],
      };

      expect(result).toEqual(expected);
    });
  });

  test('should iterate only specific projects when projectIds supplied', async () => {
    await withRecording('setupOrganizationWithOrgParam', async () => {
      const result = await setupOrganization(
        getSetupOrganizationParams({
          organizationIds: ['158838481165'],
        }),
      );

      console.log('RESULT', JSON.stringify(result, null, 2));

      const expected: SetupOrganizationResult = {
        created: [
          'j1-gc-integration-dev',
          'jupiterone',
          'test-j1-gc-integration-project',
          'test-proj-folder-proj',
          'test-proj-folder-nested-proj',
        ],
        failed: [
          'adams-project-290314',
          'wp-login-285520',
          'jupiterone-prod-us',
          'jupiterone-dev-232400',
        ],
        skipped: [],
        exists: [
          'delta-heading-286117',
          'absolute-nuance-284715',
          'test-new-proj-no-apps',
        ],
      };

      expect(result).toEqual(expected);
    });
  });
});
