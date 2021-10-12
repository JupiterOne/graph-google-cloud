import {
  Recording,
  createMockStepExecutionContext,
  MockIntegrationStepExecutionContext,
} from '@jupiterone/integration-sdk-testing';
import { setupGoogleCloudRecording } from '../../../test/recording';
import { IntegrationConfig } from '../../types';
import {
  fetchResourceManagerFolders,
  fetchResourceManagerOrganization,
  fetchResourceManagerProject,
  buildOrgFolderProjectMappedRelationships,
  fetchResourceManagerIamPolicy,
} from '.';
import { integrationConfig } from '../../../test/config';
import {
  FOLDER_ENTITY_TYPE,
  ORGANIZATION_HAS_FOLDER_RELATIONSHIP_TYPE,
  FOLDER_HAS_FOLDER_RELATIONSHIP_TYPE,
  PROJECT_ENTITY_TYPE,
} from './constants';
import {
  Entity,
  ExplicitRelationship,
  MappedRelationship,
  Relationship,
} from '@jupiterone/integration-sdk-core';
import { filterGraphObjects } from '../../../test/helpers/filterGraphObjects';
import { GOOGLE_USER_ENTITY_TYPE, iamSteps } from '../iam';

async function executeIamSteps(
  context: MockIntegrationStepExecutionContext<IntegrationConfig>,
) {
  for (const step of iamSteps) {
    await step.executionHandler(context);
  }
}

describe('#fetchResourceManagerIamPolicy', () => {
  let recording: Recording;

  beforeEach(() => {
    recording = setupGoogleCloudRecording({
      directory: __dirname,
      name: 'fetchResourceManagerIamPolicy',
    });
  });

  afterEach(async () => {
    if (recording) {
      await recording.stop();
    }
  });

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

    await executeIamSteps(context);
    await fetchResourceManagerIamPolicy(context);

    expect({
      numCollectedEntities: context.jobState.collectedEntities.length,
      numCollectedRelationships: context.jobState.collectedRelationships.length,
      collectedEntities: context.jobState.collectedEntities,
      collectedRelationships: context.jobState.collectedRelationships,
      encounteredTypes: context.jobState.encounteredTypes,
    }).toMatchSnapshot();

    const userEntities = context.jobState.collectedEntities.filter(
      (e) => e._type === GOOGLE_USER_ENTITY_TYPE,
    );
    const iamServiceAccountEntities = context.jobState.collectedEntities.filter(
      (e) => e._type === 'google_iam_service_account',
    );
    const iamServiceAccountKeyEntities =
      context.jobState.collectedEntities.filter(
        (e) => e._type === 'google_iam_service_account_key',
      );
    const iamServiceAccountAssignedRoleRelationships =
      context.jobState.collectedRelationships.filter(
        (r) => r._type === 'google_iam_service_account_assigned_role',
      );
    const {
      targets: mappedIamServiceAccountAssignedRoleRelationships,
      rest: directIamServiceAccountAssignedRoleRelationships,
    } = filterGraphObjects(
      iamServiceAccountAssignedRoleRelationships,
      (r) => !!r._mapping,
    );
    const iamServiceAccountHasKeyRelationships =
      context.jobState.collectedRelationships.filter(
        (r) => r._type === 'google_iam_service_account_has_key',
      );

    expect(userEntities.length).toEqual(0);
    expect(iamServiceAccountEntities.length).toBeGreaterThanOrEqual(1);
    expect(iamServiceAccountKeyEntities.length).toBeGreaterThanOrEqual(1);
    expect(
      mappedIamServiceAccountAssignedRoleRelationships.length,
    ).toBeGreaterThanOrEqual(1);
    expect(
      directIamServiceAccountAssignedRoleRelationships.length,
    ).toBeGreaterThanOrEqual(1);
    expect(iamServiceAccountHasKeyRelationships.length).toBeGreaterThanOrEqual(
      1,
    );

    expect(userEntities).toMatchGraphObjectSchema({
      _class: ['User'],
      schema: {
        additionalProperties: false,
        properties: {
          _type: { const: 'google_user' },
          type: { type: 'string' },
          deleted: { type: 'boolean' },
          uniqueid: { type: 'string' },
          _rawData: {
            type: 'array',
            items: { type: 'object' },
          },
        },
      },
    });

    expect(iamServiceAccountEntities).toMatchGraphObjectSchema({
      _class: ['User'],
      schema: {
        additionalProperties: false,
        properties: {
          _type: { const: 'google_iam_service_account' },
          _rawData: {
            type: 'array',
            items: { type: 'object' },
          },
          enabled: { type: 'boolean' },
          projectId: { type: 'string' },
          id: { type: 'string' },
          oauth2ClientId: { type: 'string' },
          etag: { type: 'string' },
        },
      },
    });

    expect(iamServiceAccountKeyEntities).toMatchGraphObjectSchema({
      _class: ['AccessKey'],
      schema: {
        additionalProperties: false,
        properties: {
          _type: { const: 'google_iam_service_account_key' },
          _rawData: {
            type: 'array',
            items: { type: 'object' },
          },
          origin: { type: 'string' },
          type: { type: 'string' },
          algorithm: { type: 'string' },
        },
      },
    });

    expect(iamServiceAccountAssignedRoleRelationships).toEqual(
      iamServiceAccountAssignedRoleRelationships.map((r) =>
        expect.objectContaining({
          _class: 'ASSIGNED',
        }),
      ),
    );

    expect(iamServiceAccountHasKeyRelationships).toEqual(
      iamServiceAccountHasKeyRelationships.map((r) =>
        expect.objectContaining({
          _class: 'HAS',
        }),
      ),
    );
  });
});

describe('#fetchResourceManagerProject', () => {
  let recording: Recording;

  afterEach(async () => {
    if (recording) {
      await recording.stop();
    }
  });

  test('should collect data', async () => {
    recording = setupGoogleCloudRecording({
      directory: __dirname,
      name: 'fetchResourceManagerProject',
    });
    const context = createMockStepExecutionContext<IntegrationConfig>({
      // Temporary tweak to make this test pass since its recording has been updated from the new organization/v3
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

    await fetchResourceManagerProject(context);

    expect({
      numCollectedEntities: context.jobState.collectedEntities.length,
      numCollectedRelationships: context.jobState.collectedRelationships.length,
      collectedEntities: context.jobState.collectedEntities,
      collectedRelationships: context.jobState.collectedRelationships,
      encounteredTypes: context.jobState.encounteredTypes,
    }).toMatchSnapshot();

    expect(context.jobState.collectedEntities).toMatchGraphObjectSchema({
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
  });

  test('should log & return Account entity if client.getProject() fails', async () => {
    recording = setupGoogleCloudRecording({
      directory: __dirname,
      name: 'fetchResourceManagerProjectWithDisabledApi',
      options: { recordFailedRequests: true },
    });
    const context = createMockStepExecutionContext<IntegrationConfig>({
      // Temporary tweak to make this test pass since its recording has been updated from the new organization/v3
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

    await fetchResourceManagerProject(context);

    expect({
      numCollectedEntities: context.jobState.collectedEntities.length,
      numCollectedRelationships: context.jobState.collectedRelationships.length,
      collectedEntities: context.jobState.collectedEntities,
      collectedRelationships: context.jobState.collectedRelationships,
      encounteredTypes: context.jobState.encounteredTypes,
    }).toMatchSnapshot();

    expect(context.jobState.collectedEntities).toMatchGraphObjectSchema({
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
  });
});

describe('#fetchResourceManagerOrganization', () => {
  let recording: Recording;

  afterEach(async () => {
    if (recording) {
      await recording.stop();
    }
  });

  test('should collect data', async () => {
    recording = setupGoogleCloudRecording({
      directory: __dirname,
      name: 'fetchResourceManagerOrganization',
    });
    const context = createMockStepExecutionContext<IntegrationConfig>({
      instanceConfig: integrationConfig,
    });

    await fetchResourceManagerOrganization(context);

    expect({
      numCollectedEntities: context.jobState.collectedEntities.length,
      numCollectedRelationships: context.jobState.collectedRelationships.length,
      collectedEntities: context.jobState.collectedEntities,
      collectedRelationships: context.jobState.collectedRelationships,
      encounteredTypes: context.jobState.encounteredTypes,
    }).toMatchSnapshot();

    expect(context.jobState.collectedEntities).toMatchGraphObjectSchema({
      _class: ['Organization'],
      schema: {
        additionalProperties: false,
        properties: {
          _type: { const: 'google_cloud_organization' },
          _rawData: {
            type: 'array',
            items: { type: 'object' },
          },
          name: { type: 'string' },
          displayName: { type: 'string' },
          directoryCustomerId: { type: 'string' },
          etag: { type: 'string' },
          lifecycleState: { type: 'string' },
          createdOn: { type: 'number' },
          updatedOn: { type: 'number' },
        },
      },
    });
  });
});

describe('#fetchResourceManagerFolders', () => {
  let recording: Recording;

  afterEach(async () => {
    if (recording) {
      await recording.stop();
    }
  });

  test('should collect data', async () => {
    recording = setupGoogleCloudRecording({
      directory: __dirname,
      name: 'fetchResourceManagerFolders',
    });
    const context = createMockStepExecutionContext<IntegrationConfig>({
      // Temporary tweak to make this test pass since its recording has been updated from the new organization/v3
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

    await fetchResourceManagerOrganization(context);
    await fetchResourceManagerFolders(context);

    expect({
      numCollectedEntities: context.jobState.collectedEntities.length,
      numCollectedRelationships: context.jobState.collectedRelationships.length,
      collectedEntities: context.jobState.collectedEntities,
      collectedRelationships: context.jobState.collectedRelationships,
      encounteredTypes: context.jobState.encounteredTypes,
    }).toMatchSnapshot();

    expect(
      context.jobState.collectedEntities.filter(
        (e) => e._type === FOLDER_ENTITY_TYPE,
      ),
    ).toMatchGraphObjectSchema({
      _class: ['Group'],
      schema: {
        additionalProperties: false,
        properties: {
          _type: { const: 'google_cloud_folder' },
          _rawData: {
            type: 'array',
            items: { type: 'object' },
          },
          name: { type: 'string' },
          displayName: { type: 'string' },
          etag: { type: 'string' },
          lifecycleState: { type: 'string' },
          parent: { type: 'string' },
          createdOn: { type: 'number' },
          updatedOn: { type: 'number' },
        },
      },
    });

    expect(
      context.jobState.collectedRelationships.filter(
        (e) => e._type === ORGANIZATION_HAS_FOLDER_RELATIONSHIP_TYPE,
      ),
    ).toMatchDirectRelationshipSchema({
      schema: {
        properties: {
          _class: { const: 'HAS' },
          _type: {
            const: 'google_cloud_organization_has_folder',
          },
        },
      },
    });

    expect(
      context.jobState.collectedRelationships.filter(
        (e) => e._type === FOLDER_HAS_FOLDER_RELATIONSHIP_TYPE,
      ),
    ).toMatchDirectRelationshipSchema({
      schema: {
        properties: {
          _class: { const: 'HAS' },
          _type: {
            const: 'google_cloud_folder_has_folder',
          },
        },
      },
    });
  });
});

describe('#buildOrgFolderProjectMappedRelationships', () => {
  let recording: Recording;

  afterEach(async () => {
    if (recording) {
      await recording.stop();
    }
  });

  function separateProjectsRelationships(
    collectedRelationships: Relationship[],
  ) {
    const {
      targets: directRelationships,
      // All mapped relationships point to PROJECT_ENTITY_TYPE
      rest: mappedProjectRelationships,
    } = filterGraphObjects(collectedRelationships, (r) => !r._mapping) as {
      targets: ExplicitRelationship[];
      rest: MappedRelationship[];
    };

    return {
      directRelationships,
      mappedProjectRelationships,
    };
  }

  test('should collect data', async () => {
    recording = setupGoogleCloudRecording({
      directory: __dirname,
      name: 'buildOrgFolderProjectMappedRelationships',
    });
    const context = createMockStepExecutionContext<IntegrationConfig>({
      // Temporary tweak to make this test pass since its recording has been updated from the new organization/v3
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

    await fetchResourceManagerProject(context);
    await fetchResourceManagerOrganization(context);
    await fetchResourceManagerFolders(context);
    await buildOrgFolderProjectMappedRelationships(context);

    expect({
      numCollectedEntities: context.jobState.collectedEntities.length,
      numCollectedRelationships: context.jobState.collectedRelationships.length,
      collectedEntities: context.jobState.collectedEntities,
      collectedRelationships: context.jobState.collectedRelationships,
      encounteredTypes: context.jobState.encounteredTypes,
    }).toMatchSnapshot();

    const projectEntities = context.jobState.collectedEntities.filter(
      (e) => e._type === PROJECT_ENTITY_TYPE,
    );
    const { directRelationships, mappedProjectRelationships } =
      separateProjectsRelationships(context.jobState.collectedRelationships);

    // Expected many mapped relationships
    expect(mappedProjectRelationships.length).toBeGreaterThan(0);
    // Side-effect: we also have direct relationships because of dependent steps
    expect(directRelationships.length).toBeGreaterThan(0);

    // TODO for later:
    // We should use DEFAULT_INTEGRATION_CONFIG_PROJECT_ID from '../../../test/config'
    // Once we update it to 'j1-gc-integration-dev-v3' and update all the tests for v3
    expect(
      mappedProjectRelationships.filter(
        (e) =>
          e._mapping.targetEntity.displayName === 'j1-gc-integration-dev-v3',
      ),
    ).toCreateValidRelationshipsToEntities(projectEntities);
  });
});

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace jest {
    interface Matchers<R> {
      toCreateValidRelationshipsToEntities(entities: Entity[]): R;
    }
  }
}

expect.extend({
  toCreateValidRelationshipsToEntities(
    mappedRelationships: MappedRelationship[],
    entities: Entity[],
  ) {
    for (const mappedRelationship of mappedRelationships) {
      const _mapping = mappedRelationship._mapping;
      if (!_mapping) {
        throw new Error(
          'expect(mappedRelationships).toCreateValidRelationshipsToEntities() requires relationships with the `_mapping` property!',
        );
      }
      const targetEntity = _mapping.targetEntity;
      for (let targetFilterKey of _mapping.targetFilterKeys) {
        /* type TargetFilterKey = string | string[]; */
        if (!Array.isArray(targetFilterKey)) {
          console.warn(
            'WARNING: Found mapped relationship with targetFilterKey of type string. Please ensure the targetFilterKey was not intended to be of type string[]',
          );
          targetFilterKey = [targetFilterKey];
        }
        const mappingTargetEntities = entities.filter((entity) =>
          (targetFilterKey as string[]).every(
            (k) => targetEntity[k] === entity[k],
          ),
        );

        if (mappingTargetEntities.length === 0) {
          return {
            message: () =>
              `No target entity found for mapped relationship: ${JSON.stringify(
                mappedRelationship,
                null,
                2,
              )}`,
            pass: false,
          };
        } else if (mappingTargetEntities.length > 1) {
          return {
            message: () =>
              `Multiple target entities found for mapped relationship [${mappingTargetEntities.map(
                (e) => e._key,
              )}]; expected exactly one: ${JSON.stringify(
                mappedRelationship,
                null,
                2,
              )}`,
            pass: false,
          };
        }
      }
    }
    return {
      message: () => '',
      pass: true,
    };
  },
});
