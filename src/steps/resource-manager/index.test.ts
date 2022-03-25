import {
  Recording,
  createMockStepExecutionContext,
} from '@jupiterone/integration-sdk-testing';
import { setupGoogleCloudRecording } from '../../../test/recording';
import { IntegrationConfig } from '../../types';
import {
  fetchResourceManagerFolders,
  fetchResourceManagerOrganization,
  fetchResourceManagerProject,
  buildOrgFolderProjectMappedRelationships,
  fetchIamPolicyAuditConfig,
} from '.';
import { integrationConfig } from '../../../test/config';
import {
  ResourceManagerEntities,
  ResourceManagerRelationships,
} from './constants';
import {
  Entity,
  ExplicitRelationship,
  MappedRelationship,
  Relationship,
} from '@jupiterone/integration-sdk-core';
import { filterGraphObjects } from '../../../test/helpers/filterGraphObjects';
import { fetchApiServices } from '../service-usage';
import { fetchIamManagedRoles, fetchIamServiceAccounts } from '../iam';
import { separateDirectMappedRelationships } from '../../../test/helpers/separateDirectMappedRelationships';
import { ServiceUsageEntities } from '../service-usage/constants';

describe('#fetchIamPolicyAuditConfig', () => {
  let recording: Recording;

  beforeEach(() => {
    recording = setupGoogleCloudRecording({
      directory: __dirname,
      name: 'fetchIamPolicyAuditConfig',
    });
  });

  afterEach(async () => {
    if (recording) {
      await recording.stop();
    }
  });

  test.skip('should collect data', async () => {
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

    await fetchResourceManagerProject(context);
    await fetchIamManagedRoles(context);
    await fetchApiServices(context);
    await fetchIamServiceAccounts(context);
    await fetchIamPolicyAuditConfig(context);

    expect({
      numCollectedEntities: context.jobState.collectedEntities.length,
      numCollectedRelationships: context.jobState.collectedRelationships.length,
      collectedEntities: context.jobState.collectedEntities,
      collectedRelationships: context.jobState.collectedRelationships,
      encounteredTypes: context.jobState.encounteredTypes,
    }).toMatchSnapshot();

    const auditConfigEntities = context.jobState.collectedEntities.filter(
      (e) => e._type === ResourceManagerEntities.AUDIT_CONFIG._type,
    );

    expect(auditConfigEntities.length).toBeGreaterThan(1);

    expect(
      context.jobState.collectedEntities.filter(
        (e) => e._type === 'google_cloud_project',
      ),
    ).toMatchGraphObjectSchema(ResourceManagerEntities.PROJECT);

    expect(
      context.jobState.collectedEntities.filter(
        (e) => e._type === ServiceUsageEntities.API_SERVICE._type,
      ),
    ).toMatchGraphObjectSchema(ServiceUsageEntities.API_SERVICE);

    expect(
      context.jobState.collectedEntities.filter(
        (e) => e._type === ResourceManagerEntities.AUDIT_CONFIG._type,
      ),
    ).toMatchGraphObjectSchema(ResourceManagerEntities.AUDIT_CONFIG);

    const { directRelationships, mappedRelationships } =
      separateDirectMappedRelationships(
        context.jobState.collectedRelationships,
      );

    expect(
      directRelationships.filter(
        (e) =>
          e._type ===
          ResourceManagerRelationships.API_SERVICE_USES_AUDIT_CONFIG._type,
      ),
    ).toMatchDirectRelationshipSchema({
      schema: {
        properties: {
          _class: { const: 'USES' },
          _type: {
            const: 'google_cloud_api_service_uses_audit_config',
          },
        },
      },
    });

    expect(
      directRelationships
        .filter(
          (e) =>
            e._type ===
            ResourceManagerRelationships.AUDIT_CONFIG_ALLOWS_SERVICE_ACCOUNT
              ._type,
        )
        .every(
          (directRelationship) =>
            directRelationship._type ===
              'google_cloud_audit_config_allows_iam_service_account' &&
            directRelationship._class === 'ALLOWS',
        ),
    ).toBe(true);

    expect(mappedRelationships.length).toBeGreaterThan(0);

    expect(
      mappedRelationships
        .filter(
          (e) =>
            e._type === 'google_cloud_audit_config_allows_iam_service_account',
        )
        .every(
          (mappedRelationship) =>
            mappedRelationship._key ===
            'auditConfig:binaryauthorization.googleapis.com|allows|j1-gc-integration-dev-org@my-j1-test-proj-test.iam.gserviceaccount.com',
        ),
    ).toBe(true);
  }, 30_000);
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

    expect(context.jobState.collectedEntities).toMatchGraphObjectSchema(
      ResourceManagerEntities.PROJECT,
    );
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

    expect(context.jobState.collectedEntities).toMatchGraphObjectSchema(
      ResourceManagerEntities.PROJECT,
    );
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

    expect(context.jobState.collectedEntities).toMatchGraphObjectSchema(
      ResourceManagerEntities.ORGANIZATION,
    );
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
        (e) => e._type === ResourceManagerEntities.FOLDER._type,
      ),
    ).toMatchGraphObjectSchema(ResourceManagerEntities.FOLDER);

    expect(
      context.jobState.collectedRelationships.filter(
        (e) =>
          e._type ===
          ResourceManagerRelationships.ORGANIZATION_HAS_FOLDER._type,
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
        (e) => e._type === ResourceManagerRelationships.FOLDER_HAS_FOLDER._type,
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
      (e) => e._type === ResourceManagerEntities.PROJECT._type,
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
