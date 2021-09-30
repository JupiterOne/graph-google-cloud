import { withRecording } from '../test/recording';
import {
  buildPolicyWithServiceAccountSecurityRoleMember,
  setupOrganization,
  SetupOrganizationParams,
  SetupOrganizationResult,
} from './organizationSetup';
import { cloudresourcemanager_v1 } from 'googleapis';
import { SchedulerInterval } from './types';
import { getMockLogger } from '../test/helpers/getMockLogger';

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
    rotateServiceAccountKeys: false,
    integrationPollingInterval: SchedulerInterval.ONE_DAY,
    servicesToEnable: [
      'serviceusage.googleapis.com',
      'cloudfunctions.googleapis.com',
      'storage.googleapis.com',
      'iam.googleapis.com',
      'cloudresourcemanager.googleapis.com',
      'compute.googleapis.com',
      'cloudkms.googleapis.com',
    ],
    ...params,
  };
}

describe('#setupOrganization', () => {
  test('should iterate only specific projects when projectIds supplied', async () => {
    await withRecording('setupOrganization', __dirname, async () => {
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

  test('should create integration instance names using a pattern when supplied', async () => {
    await withRecording(
      'setupOrganizationWithIntegrationNamePattern',
      __dirname,
      async () => {
        const result = await setupOrganization(
          getSetupOrganizationParams({
            projectIds: ['j1-gc-integration-dev'],
            integrationInstanceNamePattern: 'gcp-{{projectId}}',
          }),
        );

        const expected: SetupOrganizationResult = {
          created: ['j1-gc-integration-dev'],
          failed: [],
          skipped: [],
          exists: [],
        };

        expect(result).toEqual(expected);
      },
    );
  });

  test('should iterate only specific projects when projectIds supplied and skip specific projects when skipProjectIds supplied', async () => {
    const result = await setupOrganization(
      getSetupOrganizationParams({
        projectIds: ['j1-gc-integration-dev'],
        skipProjectIds: ['j1-gc-integration-dev'],
      }),
    );

    const expected: SetupOrganizationResult = {
      created: [],
      failed: [],
      skipped: ['j1-gc-integration-dev'],
      exists: [],
    };

    expect(result).toEqual(expected);
  });

  test('should allow skipping projects using a regex string', async () => {
    const result = await setupOrganization(
      getSetupOrganizationParams({
        projectIds: ['j1-gc-integration-dev'],
        skipProjectIdRegex: 'gc-(.*)-d',
      }),
    );

    const expected: SetupOrganizationResult = {
      created: [],
      failed: [],
      skipped: ['j1-gc-integration-dev'],
      exists: [],
    };

    expect(result).toEqual(expected);
  });

  test('should walk all projects in organization and skip system projects when specified', async () => {
    await withRecording(
      'setupOrganizationWithOrgParam',
      __dirname,
      async () => {
        const result = await setupOrganization(
          getSetupOrganizationParams({
            organizationIds: ['158838481165'],
            skipSystemProjects: true,
            skipProjectIds: ['jupiterone'],
            skipProjectIdRegex: 'wp-lo(.*)gin-28',
          }),
        );

        const expected: SetupOrganizationResult = {
          created: ['test-proj-folder-proj', 'test-proj-folder-nested-proj'],
          failed: [
            'inductive-voice-303719',
            'prismatic-sunup-303723',
            'responsive-amp-300923',
            'mknoedel-project-1',
            'adams-project-290314',
            'absolute-nuance-284715',
            'test-new-proj-no-apps',
            'jupiterone-prod-us',
            'jupiterone-dev-232400',
          ],
          skipped: [
            'wp-login-285520',
            'jupiterone',
            'sys-99686866195189065260180571',
            'sys-19451335604181712081909834',
            'sys-81149970861094796527395912',
            'sys-36562423552262474660103412',
            'sys-94166402018847623427755954',
            'sys-95661014411687422341185298',
            'sys-40785860069512551437326853',
            'sys-66386573024521065462054454',
            'sys-25169157129529309177644632',
            'sys-59753616726783316402190285',
            'sys-45754578318201223029726913',
            'sys-35287363835851150555050559',
            'sys-59400323599694316417431456',
            'sys-21778942497577332719434611',
            'sys-35148606142304631479159728',
            'sys-71862516278384527179674398',
            'sys-35592248662871406312563757',
            'sys-14652612172805927206962915',
            'sys-64199502258587165655591724',
            'sys-96362345657227520875518474',
            'sys-66590938318210446964136623',
            'sys-15400709913127895368029377',
            'sys-77071883705624133422684525',
            'sys-50979948941753011494802828',
            'sys-52306418765020687482869939',
            'sys-35559884830304627435839973',
            'sys-61977720532373423753614327',
            'sys-37219452519346385871057215',
            'sys-65035627885005105553419283',
            'sys-69983517717674632391597859',
            'sys-80811042466016504994762814',
            'sys-51853757980273800382267361',
            'sys-13890833683817418671196331',
            'sys-85265385321492645164115370',
            'sys-25142491248601449657376187',
            'sys-63470029234872721778012808',
            'sys-45586657012023306823811700',
            'sys-34215368123804453737550886',
            'sys-16548384619035708297313081',
            'sys-86157971349338966916344144',
            'sys-94206081723162920328491480',
            'sys-77741026357069947622155114',
            'sys-00672183896521181614760968',
            'sys-56683601211247239472862195',
            'sys-46685961468304037717646823',
            'sys-40787825693766810263127322',
            'sys-94358424126574479796628834',
            'sys-62422410436750716222638555',
            'sys-41732131823259218474565029',
            'sys-25076584592625930196186040',
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
            'sys-32763239635548588702312541',
          ],
          exists: [
            'helical-cascade-303723',
            'delta-heading-286117',
            'j1-gc-integration-dev',
            'test-j1-gc-integration-project',
          ],
        };

        expect(result).toEqual(expected);
      },
    );
  });
});

describe('#buildPolicyWithServiceAccountSecurityRoleMember', () => {
  test('should handle policy with "roles/iam.securityReviewer" binding with no members', () => {
    const oldPolicy: cloudresourcemanager_v1.Schema$Policy = {
      version: 1,
      etag: 'abc',
      bindings: [
        {
          role: 'roles/editor',
          members: [],
        },
        {
          role: 'roles/iam.securityReviewer',
          members: [],
        },
      ],
    };

    const serviceAccountEmail = 'abc@j1-project.iam.gserviceaccount.com';
    const expectedPolicy: cloudresourcemanager_v1.Schema$Policy = {
      version: 1,
      etag: 'abc',
      bindings: [
        {
          role: 'roles/editor',
          members: [],
        },
        {
          role: 'roles/iam.securityReviewer',
          members: ['serviceAccount:abc@j1-project.iam.gserviceaccount.com'],
        },
      ],
    };

    expect(
      buildPolicyWithServiceAccountSecurityRoleMember(
        oldPolicy,
        serviceAccountEmail,
      ),
    ).toEqual(expectedPolicy);
  });

  test('should handle policy with "roles/iam.securityReviewer" binding with existing members', () => {
    const oldPolicy: cloudresourcemanager_v1.Schema$Policy = {
      version: 1,
      etag: 'abc',
      bindings: [
        {
          role: 'roles/editor',
          members: [],
        },
        {
          role: 'roles/iam.securityReviewer',
          members: [
            'serviceAccount:abc-old@j1-project.iam.gserviceaccount.com',
          ],
        },
      ],
    };

    const serviceAccountEmail = 'abc@j1-project.iam.gserviceaccount.com';
    const expectedPolicy: cloudresourcemanager_v1.Schema$Policy = {
      version: 1,
      etag: 'abc',
      bindings: [
        {
          role: 'roles/editor',
          members: [],
        },
        {
          role: 'roles/iam.securityReviewer',
          members: [
            'serviceAccount:abc-old@j1-project.iam.gserviceaccount.com',
            'serviceAccount:abc@j1-project.iam.gserviceaccount.com',
          ],
        },
      ],
    };

    expect(
      buildPolicyWithServiceAccountSecurityRoleMember(
        oldPolicy,
        serviceAccountEmail,
      ),
    ).toEqual(expectedPolicy);
  });

  test('should handle policy with "roles/iam.securityReviewer" binding with existing members', () => {
    const oldPolicy: cloudresourcemanager_v1.Schema$Policy = {
      version: 1,
      etag: 'abc',
      bindings: [
        {
          role: 'roles/editor',
          members: [],
        },
        {
          role: 'roles/iam.securityReviewer',
          members: [
            'serviceAccount:abc-old@j1-project.iam.gserviceaccount.com',
          ],
        },
      ],
    };

    const serviceAccountEmail = 'abc@j1-project.iam.gserviceaccount.com';
    const expectedPolicy: cloudresourcemanager_v1.Schema$Policy = {
      version: 1,
      etag: 'abc',
      bindings: [
        {
          role: 'roles/editor',
          members: [],
        },
        {
          role: 'roles/iam.securityReviewer',
          members: [
            'serviceAccount:abc-old@j1-project.iam.gserviceaccount.com',
            'serviceAccount:abc@j1-project.iam.gserviceaccount.com',
          ],
        },
      ],
    };

    expect(
      buildPolicyWithServiceAccountSecurityRoleMember(
        oldPolicy,
        serviceAccountEmail,
      ),
    ).toEqual(expectedPolicy);
  });

  test('should not add existing member again to "roles/iam.securityReviewer" role', () => {
    const oldPolicy: cloudresourcemanager_v1.Schema$Policy = {
      version: 1,
      etag: 'abc',
      bindings: [
        {
          role: 'roles/editor',
          members: [],
        },
        {
          role: 'roles/iam.securityReviewer',
          members: ['serviceAccount:abc@j1-project.iam.gserviceaccount.com'],
        },
      ],
    };

    const serviceAccountEmail = 'abc@j1-project.iam.gserviceaccount.com';
    const expectedPolicy: cloudresourcemanager_v1.Schema$Policy = {
      version: 1,
      etag: 'abc',
      bindings: [
        {
          role: 'roles/editor',
          members: [],
        },
        {
          role: 'roles/iam.securityReviewer',
          members: ['serviceAccount:abc@j1-project.iam.gserviceaccount.com'],
        },
      ],
    };

    expect(
      buildPolicyWithServiceAccountSecurityRoleMember(
        oldPolicy,
        serviceAccountEmail,
      ),
    ).toEqual(expectedPolicy);
  });

  test('should add "roles/iam.securityReviewer" role with new member if none exists', () => {
    const oldPolicy: cloudresourcemanager_v1.Schema$Policy = {
      version: 1,
      etag: 'abc',
      bindings: [
        {
          role: 'roles/editor',
          members: [],
        },
      ],
    };

    const serviceAccountEmail = 'abc@j1-project.iam.gserviceaccount.com';
    const expectedPolicy: cloudresourcemanager_v1.Schema$Policy = {
      version: 1,
      etag: 'abc',
      bindings: [
        {
          role: 'roles/editor',
          members: [],
        },
        {
          role: 'roles/iam.securityReviewer',
          members: ['serviceAccount:abc@j1-project.iam.gserviceaccount.com'],
        },
      ],
    };

    expect(
      buildPolicyWithServiceAccountSecurityRoleMember(
        oldPolicy,
        serviceAccountEmail,
      ),
    ).toEqual(expectedPolicy);
  });

  test('should handle a policy with "version" 3', () => {
    const oldPolicy: cloudresourcemanager_v1.Schema$Policy = {
      version: 3,
      etag: 'abc',
      bindings: [
        {
          role: 'roles/iam.securityReviewer',
          members: [
            'serviceAccount:abc-old@j1-project.iam.gserviceaccount.com',
          ],
          condition: {
            expression: 'resource.name != "bogusunknownresourcename"',
            title: 'Test condition title',
            description: 'Test condition description',
          },
        },
      ],
    };

    const expectedPolicy: cloudresourcemanager_v1.Schema$Policy = {
      version: 3,
      etag: 'abc',
      bindings: [
        {
          role: 'roles/iam.securityReviewer',
          members: [
            'serviceAccount:abc-old@j1-project.iam.gserviceaccount.com',
            'serviceAccount:abc@j1-project.iam.gserviceaccount.com',
          ],
          condition: {
            expression: 'resource.name != "bogusunknownresourcename"',
            title: 'Test condition title',
            description: 'Test condition description',
          },
        },
      ],
    };

    const serviceAccountEmail = 'abc@j1-project.iam.gserviceaccount.com';
    expect(
      buildPolicyWithServiceAccountSecurityRoleMember(
        oldPolicy,
        serviceAccountEmail,
      ),
    ).toEqual(expectedPolicy);
  });
});
