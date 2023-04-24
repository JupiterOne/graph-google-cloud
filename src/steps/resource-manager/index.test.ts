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
  AUDIT_CONFIG_ENTITY_TYPE,
  flattenAuditLogConfigs,
} from '.';
import { integrationConfig } from '../../../test/config';
import {
  FOLDER_ENTITY_TYPE,
  ORGANIZATION_HAS_FOLDER_RELATIONSHIP_TYPE,
  FOLDER_HAS_FOLDER_RELATIONSHIP_TYPE,
  PROJECT_ENTITY_TYPE,
  SERVICE_USES_AUDIT_CONFIG_RELATIONSHIP_TYPE,
  AUDIT_CONFIG_ALLOWS_SERVICE_ACCOUNT_RELATIONSHIP_TYPE,
} from './constants';
import {
  ExplicitRelationship,
  MappedRelationship,
  Relationship,
} from '@jupiterone/integration-sdk-core';
import { filterGraphObjects } from '../../../test/helpers/filterGraphObjects';
import { fetchApiServices } from '../service-usage';
import { fetchIamManagedRoles, fetchIamServiceAccounts } from '../iam';
import { separateDirectMappedRelationships } from '../../../test/helpers/separateDirectMappedRelationships';

describe('flattenAuditLogConfigs', () => {
  test('should flatten multiple log types onto the same exempted member', () => {
    expect(
      flattenAuditLogConfigs([
        { exemptedMembers: ['dev@j1.co', 'prod@j1.co'], logType: 'type1' },
        { exemptedMembers: ['dev@j1.co', 'prod@j1.co'], logType: 'type2' },
      ]),
    ).toEqual([
      {
        exemptedMember: 'dev@j1.co',
        logTypes: { 'logType.type1': true, 'logType.type2': true },
      },
      {
        exemptedMember: 'prod@j1.co',
        logTypes: { 'logType.type1': true, 'logType.type2': true },
      },
    ]);
  });

  test('should return empty array for `null` logType', () => {
    expect(
      flattenAuditLogConfigs([
        { exemptedMembers: ['dev@j1.co'], logType: null },
      ]),
    ).toEqual([{ exemptedMember: 'dev@j1.co', logTypes: {} }]);
  });

  test('should return empty array for `undefined` logType', () => {
    expect(
      flattenAuditLogConfigs([
        { exemptedMembers: ['dev@j1.co'], logType: undefined },
      ]),
    ).toEqual([{ exemptedMember: 'dev@j1.co', logTypes: {} }]);
  });

  test('should skip `null` exemptedMembers', () => {
    expect(
      flattenAuditLogConfigs([{ exemptedMembers: null, logType: 'type1' }]),
    ).toEqual([]);
  });

  test('should skip `undefined` exemptedMembers', () => {
    expect(
      flattenAuditLogConfigs([{ exemptedMembers: null, logType: 'type1' }]),
    ).toEqual([]);
  });
});

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
      (e) => e._type === AUDIT_CONFIG_ENTITY_TYPE,
    );

    expect(auditConfigEntities.length).toBeGreaterThan(1);

    expect(
      context.jobState.collectedEntities.filter(
        (e) => e._type === 'google_cloud_project',
      ),
    ).toMatchGraphObjectSchema({
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

    expect(
      context.jobState.collectedEntities.filter(
        (e) => e._type === 'google_cloud_api_service',
      ),
    ).toMatchGraphObjectSchema({
      _class: ['Service'],
      schema: {
        additionalProperties: false,
        properties: {
          _type: { const: 'google_cloud_api_service' },
          category: { const: ['infrastructure'] },
          state: {
            type: 'string',
            enum: ['STATE_UNSPECIFIED', 'DISABLED', 'ENABLED'],
          },
          enabled: { type: 'boolean' },
          usageRequirements: {
            type: 'array',
            items: { type: 'string' },
          },
          hasIamPermissions: { type: 'boolean' },
          _rawData: {
            type: 'array',
            items: { type: 'object' },
          },
          auditable: { type: 'boolean' },
        },
      },
    });

    expect(
      context.jobState.collectedEntities.filter(
        (e) => e._type === 'google_cloud_audit_config',
      ),
    ).toMatchGraphObjectSchema({
      _class: ['Configuration'],
      schema: {
        additionalProperties: false,
        properties: {
          _type: { const: 'google_cloud_audit_config' },
          _rawData: {
            type: 'array',
            items: { type: 'object' },
          },
          name: { type: 'string' },
          displayName: { type: 'string' },
          service: { type: 'string' },
          logTypes: { type: 'array', items: { type: 'string' } },
        },
      },
    });

    const { directRelationships, mappedRelationships } =
      separateDirectMappedRelationships(
        context.jobState.collectedRelationships,
      );

    expect(
      directRelationships.filter(
        (e) => e._type === SERVICE_USES_AUDIT_CONFIG_RELATIONSHIP_TYPE,
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
            e._type === AUDIT_CONFIG_ALLOWS_SERVICE_ACCOUNT_RELATIONSHIP_TYPE,
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
    ).toTargetEntities(projectEntities);
  });
});
