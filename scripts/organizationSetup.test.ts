jest.setTimeout(60000);

import Logger from 'bunyan';
import { setupGoogleCloudRecording, withRecording } from '../test/recording';
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
    skipSystemProjects: false,
    ...params,
  };
}

describe('#setupOrganization', () => {
  test('should iterate only specific projects when projectIds supplied', async () => {
    await withRecording('setupOrganization', async () => {
      const result = await setupOrganization(
        getSetupOrganizationParams({
          projectIds: ['j1-gc-integration-dev'],
        }),
      );

      const expected: SetupOrganizationResult = {
        created: ['j1-gc-integration-dev'],
        failed: [],
        skipped: [],
        exists: [],
      };

      expect(result).toEqual(expected);
    });
  });

  test('should walk all projects in organization and skip system projects when specified', async () => {
    await withRecording('setupOrganizationWithOrgParam', async () => {
      const result = await setupOrganization(
        getSetupOrganizationParams({
          organizationIds: ['158838481165'],
          skipSystemProjects: true,
        }),
      );

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
        skipped: [
          'sys-98599569169400400326209101',
          'sys-50680297627320816758109742',
          'sys-64826652132265949410571220',
          'sys-32242372370195991090675689',
          'sys-04026420853267700556085940',
          'sys-76708699834679388507414794',
          'sys-61341367474031150852024309',
          'sys-24461752245584275250335793',
          'sys-23186434601955566952902619',
          'sys-26824420248546700828486586',
          'sys-28026517950310748574319250',
          'sys-55889229949743723134013110',
          'sys-46006761883988199049134739',
          'sys-31653372488357050200478355',
          'sys-94616015625779749801594627',
          'sys-92916509802817325974444557',
          'sys-33908624595628892107125632',
          'sys-26773279521140400022448579',
          'sys-19535034961718876092655441',
          'sys-08926868016060106381733257',
          'sys-01847385770329437655722703',
          'sys-08256176884541900854705853',
          'sys-82157304548130326390490584',
          'sys-67529707054070618309649360',
          'sys-10247169231662869166768151',
          'sys-07358806053497091564918927',
          'sys-12397813096864479148541480',
          'sys-08220899634530151120090179',
          'sys-93689727118030549033398702',
          'sys-50292531503659640226798910',
          'sys-62095661531566839176779921',
          'sys-15722752096902051075605485',
          'sys-67211891913206923062371121',
          'sys-39716245077103752633418924',
          'sys-34408605379303855344970959',
          'sys-02724935019023959190242562',
          'sys-05256168127096786239622836',
          'sys-17521875051025803236409844',
          'sys-81781898855457991309830982',
          'sys-70737472267595159238495972',
          'sys-25279764369490591894740334',
          'sys-13570098878464468985078421',
          'sys-32763239635548588702312541',
        ],
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
