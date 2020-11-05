jest.setTimeout(60000);

import Logger from 'bunyan';
import { Recording, setupGoogleCloudRecording } from '../test/recording';
import {
  setupOrganization,
  SetupOrganizationParams,
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

describe('#setupOrganization', () => {
  let recording: Recording;

  beforeEach(() => {
    recording = setupGoogleCloudRecording({
      directory: __dirname,
      name: 'setupOrganization',
      options: {
        recordFailedRequests: true,
      },
    });
  });

  afterEach(async () => {
    await recording.stop();
  });

  test('should iterate only specific projects when projectIds supplied', async () => {
    await setupOrganization(
      getSetupOrganizationParams({
        projectIds: ['j1-gc-integration-dev'],
      }),
    );
  });
});
