import {
  ExplicitRelationship,
  MappedRelationship,
  Relationship,
} from '@jupiterone/integration-sdk-core';
import {
  createMockStepExecutionContext,
  Recording,
} from '@jupiterone/integration-sdk-testing';
import {
  fetchAccessLevels,
  fetchAccessPolicies,
  fetchServicePerimeters,
} from '.';
import { IntegrationConfig } from '../..';
import { integrationConfig } from '../../../test/config';
import { filterGraphObjects } from '../../../test/helpers/filterGraphObjects';
import { setupGoogleCloudRecording } from '../../../test/recording';
import { fetchIamManagedRoles } from '../iam';
import {
  buildOrgFolderProjectMappedRelationships,
  fetchResourceManagerOrganization,
  fetchResourceManagerProject,
  PROJECT_ENTITY_TYPE,
} from '../resource-manager';
import { fetchApiServices } from '../service-usage';
import { ServiceUsageEntities } from '../service-usage/constants';
import {
  ENTITY_TYPE_ACCESS_CONTEXT_MANAGER_ACCESS_LEVEL,
  ENTITY_TYPE_ACCESS_CONTEXT_MANAGER_ACCESS_POLICY,
  ENTITY_TYPE_ACCESS_CONTEXT_MANAGER_SERVICE_PERIMETER,
  ENTITY_TYPE_ACCESS_CONTEXT_MANAGER_SERVICE_PERIMETER_API_OPERATION,
  ENTITY_TYPE_ACCESS_CONTEXT_MANAGER_SERVICE_PERIMETER_EGRESS_POLICY,
  ENTITY_TYPE_ACCESS_CONTEXT_MANAGER_SERVICE_PERIMETER_INGRESS_POLICY,
  ENTITY_TYPE_ACCESS_CONTEXT_MANAGER_SERVICE_PERIMETER_METHOD_SELECTOR,
  RELATIONSHIP_TYPE_ACCESS_POLICY_HAS_ACCESS_LEVEL,
  RELATIONSHIP_TYPE_ACCESS_POLICY_HAS_SERVICE_PERIMETER,
  RELATIONSHIP_TYPE_API_OPERATION_HAS_METHOD_SELECTOR,
  RELATIONSHIP_TYPE_EGRESS_POLICY_HAS_API_OPERATION,
  RELATIONSHIP_TYPE_INGRESS_POLICY_HAS_API_OPERATION,
  RELATIONSHIP_TYPE_SERVICE_PERIMETER_HAS_EGRESS_POLICY,
  RELATIONSHIP_TYPE_SERVICE_PERIMETER_HAS_INGRESS_POLICY,
} from './constants';

describe('#fetchAccessContextManagerAccessPolicies', () => {
  let recording: Recording;

  beforeEach(() => {
    recording = setupGoogleCloudRecording({
      directory: __dirname,
      name: 'fetchAccessContextManagerAccessPolicies',
    });
  });

  afterEach(async () => {
    await recording.stop();
  });

  test('should collect data', async () => {
    const context = createMockStepExecutionContext<IntegrationConfig>({
      instanceConfig: integrationConfig,
    });

    await fetchAccessPolicies(context);

    expect({
      numCollectedEntities: context.jobState.collectedEntities.length,
      numCollectedRelationships: context.jobState.collectedRelationships.length,
      collectedEntities: context.jobState.collectedEntities,
      collectedRelationships: context.jobState.collectedRelationships,
      encounteredTypes: context.jobState.encounteredTypes,
    }).toMatchSnapshot();

    expect(
      context.jobState.collectedEntities.filter(
        (e) => e._type === ENTITY_TYPE_ACCESS_CONTEXT_MANAGER_ACCESS_POLICY,
      ),
    ).toMatchGraphObjectSchema({
      _class: ['AccessPolicy'],
      schema: {
        additionalProperties: false,
        properties: {
          _type: { const: 'google_access_context_manager_access_policy' },
          _rawData: {
            type: 'array',
            items: { type: 'object' },
          },
          name: { type: 'string' },
          title: { type: 'string' },
          etag: { type: 'string' },
        },
      },
    });
  });
});

describe('#fetchAccessContextManagerAccessLevels', () => {
  let recording: Recording;

  beforeEach(() => {
    recording = setupGoogleCloudRecording({
      directory: __dirname,
      name: 'fetchAccessContextManagerAccessLevels',
    });
  });

  afterEach(async () => {
    await recording.stop();
  });

  test('should collect data', async () => {
    const context = createMockStepExecutionContext<IntegrationConfig>({
      instanceConfig: integrationConfig,
    });

    await fetchAccessPolicies(context);
    await fetchAccessLevels(context);

    expect({
      numCollectedEntities: context.jobState.collectedEntities.length,
      numCollectedRelationships: context.jobState.collectedRelationships.length,
      collectedEntities: context.jobState.collectedEntities,
      collectedRelationships: context.jobState.collectedRelationships,
      encounteredTypes: context.jobState.encounteredTypes,
    }).toMatchSnapshot();

    expect(
      context.jobState.collectedEntities.filter(
        (e) => e._type === ENTITY_TYPE_ACCESS_CONTEXT_MANAGER_ACCESS_POLICY,
      ),
    ).toMatchGraphObjectSchema({
      _class: ['AccessPolicy'],
      schema: {
        additionalProperties: false,
        properties: {
          _type: { const: 'google_access_context_manager_access_policy' },
          _rawData: {
            type: 'array',
            items: { type: 'object' },
          },
          name: { type: 'string' },
          title: { type: 'string' },
          etag: { type: 'string' },
        },
      },
    });

    expect(
      context.jobState.collectedEntities.filter(
        (e) => e._type === ENTITY_TYPE_ACCESS_CONTEXT_MANAGER_ACCESS_LEVEL,
      ),
    ).toMatchGraphObjectSchema({
      _class: ['Ruleset'],
      schema: {
        additionalProperties: false,
        properties: {
          _type: { const: 'google_access_context_manager_access_level' },
          _rawData: {
            type: 'array',
            items: { type: 'object' },
          },
          name: { type: 'string' },
          description: { type: 'string' },
          title: { type: 'string' },
        },
      },
    });

    expect(
      context.jobState.collectedRelationships.filter(
        (e) => e._type === RELATIONSHIP_TYPE_ACCESS_POLICY_HAS_ACCESS_LEVEL,
      ),
    ).toMatchDirectRelationshipSchema({
      schema: {
        properties: {
          _class: { const: 'HAS' },
          _type: {
            const: 'google_access_context_manager_access_policy_has_level',
          },
        },
      },
    });
  });
});

describe('#fetchAccessContextManagerServicePerimeters', () => {
  let recording: Recording;

  beforeEach(() => {
    recording = setupGoogleCloudRecording({
      directory: __dirname,
      name: 'fetchAccessContextManagerServicePerimeters',
    });
  });

  afterEach(async () => {
    await recording.stop();
  });

  function separateRelationships(collectedRelationships: Relationship[]) {
    const { targets: directRelationships, rest: mappedProjectRelationships } =
      filterGraphObjects(collectedRelationships, (r) => !r._mapping) as {
        targets: ExplicitRelationship[];
        rest: MappedRelationship[];
      };

    const {
      targets: mappedProtectsProjectsRelationships,
      rest: restAfterProtectsProjects,
    } = filterGraphObjects(
      mappedProjectRelationships,
      (r) =>
        r._class === 'PROTECTS' &&
        r._mapping.targetEntity._type === PROJECT_ENTITY_TYPE,
    );

    const { targets: mappedLimitsServicesRelationships } = filterGraphObjects(
      restAfterProtectsProjects,
      (r) =>
        r._class === 'LIMITS' &&
        r._mapping.targetEntity._type ===
          ServiceUsageEntities.API_SERVICE._type,
    );

    return {
      directRelationships,
      mappedProtectsProjectsRelationships,
      mappedLimitsServicesRelationships,
    };
  }

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
    // needed to populate getProjectIdFromName()
    await fetchResourceManagerOrganization(context);
    await buildOrgFolderProjectMappedRelationships(context);
    await fetchAccessPolicies(context);
    await fetchServicePerimeters(context);

    expect({
      numCollectedEntities: context.jobState.collectedEntities.length,
      numCollectedRelationships: context.jobState.collectedRelationships.length,
      collectedEntities: context.jobState.collectedEntities,
      collectedRelationships: context.jobState.collectedRelationships,
      encounteredTypes: context.jobState.encounteredTypes,
    }).toMatchSnapshot();

    const {
      directRelationships,
      mappedProtectsProjectsRelationships,
      mappedLimitsServicesRelationships,
    } = separateRelationships(context.jobState.collectedRelationships);

    expect(
      context.jobState.collectedEntities.filter(
        (e) => e._type === ENTITY_TYPE_ACCESS_CONTEXT_MANAGER_SERVICE_PERIMETER,
      ),
    ).toMatchGraphObjectSchema({
      _class: ['Configuration'],
      schema: {
        additionalProperties: false,
        properties: {
          _type: { const: 'google_access_context_manager_service_perimeter' },
          _rawData: {
            type: 'array',
            items: { type: 'object' },
          },
          name: { type: 'string' },
          description: { type: 'string' },
          perimeterType: { type: 'string' },
          title: { type: 'string' },
          useExplicitDryRunSpec: { type: 'boolean' },
          'status.accessLevels': {
            type: 'array',
            items: { type: 'string' },
          },
          'status.resources': {
            type: 'array',
            items: { type: 'string' },
          },
          'status.restrictedServices': {
            type: 'array',
            items: { type: 'string' },
          },
          'spec.accessLevels': {
            type: 'array',
            items: { type: 'string' },
          },
          'spec.resources': {
            type: 'array',
            items: { type: 'string' },
          },
          'spec.restrictedServices': {
            type: 'array',
            items: { type: 'string' },
          },
        },
      },
    });

    expect(
      context.jobState.collectedEntities.filter(
        (e) =>
          e._type ===
          ENTITY_TYPE_ACCESS_CONTEXT_MANAGER_SERVICE_PERIMETER_EGRESS_POLICY,
      ),
    ).toMatchGraphObjectSchema({
      _class: ['ControlPolicy'],
      schema: {
        additionalProperties: false,
        properties: {
          _type: {
            const:
              'google_access_context_manager_service_perimeter_egress_policy',
          },
          _rawData: {
            type: 'array',
            items: { type: 'object' },
          },
          name: { type: 'string' },
          displayName: { type: 'string' },
          fromIdentities: {
            type: 'array',
            items: { type: 'string' },
          },
          fromIdentityType: { type: 'string' },
        },
      },
    });

    expect(
      context.jobState.collectedEntities.filter(
        (e) =>
          e._type ===
          ENTITY_TYPE_ACCESS_CONTEXT_MANAGER_SERVICE_PERIMETER_INGRESS_POLICY,
      ),
    ).toMatchGraphObjectSchema({
      _class: ['ControlPolicy'],
      schema: {
        additionalProperties: false,
        properties: {
          _type: {
            const:
              'google_access_context_manager_service_perimeter_ingress_policy',
          },
          _rawData: {
            type: 'array',
            items: { type: 'object' },
          },
          name: { type: 'string' },
          displayName: { type: 'string' },
          fromIdentities: {
            type: 'array',
            items: { type: 'string' },
          },
          fromIdentityType: { type: 'string' },
        },
      },
    });

    expect(
      context.jobState.collectedEntities.filter(
        (e) =>
          e._type ===
          ENTITY_TYPE_ACCESS_CONTEXT_MANAGER_SERVICE_PERIMETER_API_OPERATION,
      ),
    ).toMatchGraphObjectSchema({
      _class: ['Configuration'],
      schema: {
        additionalProperties: false,
        properties: {
          _type: {
            const:
              'google_access_context_manager_service_perimeter_api_operation',
          },
          _rawData: {
            type: 'array',
            items: { type: 'object' },
          },
          name: { type: 'string' },
          displayName: { type: 'string' },
          serviceName: { type: 'string' },
        },
      },
    });

    expect(
      context.jobState.collectedEntities.filter(
        (e) =>
          e._type ===
          ENTITY_TYPE_ACCESS_CONTEXT_MANAGER_SERVICE_PERIMETER_METHOD_SELECTOR,
      ),
    ).toMatchGraphObjectSchema({
      _class: ['Configuration'],
      schema: {
        additionalProperties: false,
        properties: {
          _type: {
            const:
              'google_access_context_manager_service_perimeter_method_selector',
          },
          _rawData: {
            type: 'array',
            items: { type: 'object' },
          },
          name: { type: 'string' },
          displayName: { type: 'string' },
          method: { type: 'string' },
          permission: { type: 'string' },
        },
      },
    });

    expect(
      directRelationships.filter(
        (e) =>
          e._type === RELATIONSHIP_TYPE_ACCESS_POLICY_HAS_SERVICE_PERIMETER,
      ),
    ).toMatchDirectRelationshipSchema({
      schema: {
        properties: {
          _class: { const: 'HAS' },
          _type: {
            const:
              'google_access_context_manager_access_policy_has_service_perimeter',
          },
        },
      },
    });

    expect(
      directRelationships.filter(
        (e) =>
          e._type === RELATIONSHIP_TYPE_SERVICE_PERIMETER_HAS_EGRESS_POLICY,
      ),
    ).toMatchDirectRelationshipSchema({
      schema: {
        properties: {
          _class: { const: 'HAS' },
          _type: {
            const:
              'google_access_context_manager_service_perimeter_has_egress_policy',
          },
        },
      },
    });

    expect(
      directRelationships.filter(
        (e) => e._type === RELATIONSHIP_TYPE_EGRESS_POLICY_HAS_API_OPERATION,
      ),
    ).toMatchDirectRelationshipSchema({
      schema: {
        properties: {
          _class: { const: 'HAS' },
          _type: {
            const:
              'google_access_context_manager_service_perimeter_egress_policy_has_api_operation',
          },
        },
      },
    });

    expect(
      directRelationships.filter(
        (e) => e._type === RELATIONSHIP_TYPE_API_OPERATION_HAS_METHOD_SELECTOR,
      ),
    ).toMatchDirectRelationshipSchema({
      schema: {
        properties: {
          _class: { const: 'HAS' },
          _type: {
            const:
              'google_access_context_manager_service_perimeter_api_operation_has_method_selector',
          },
        },
      },
    });

    expect(
      directRelationships.filter(
        (e) =>
          e._type === RELATIONSHIP_TYPE_SERVICE_PERIMETER_HAS_INGRESS_POLICY,
      ),
    ).toMatchDirectRelationshipSchema({
      schema: {
        properties: {
          _class: { const: 'HAS' },
          _type: {
            const:
              'google_access_context_manager_service_perimeter_has_ingress_policy',
          },
        },
      },
    });

    expect(
      directRelationships.filter(
        (e) => e._type === RELATIONSHIP_TYPE_INGRESS_POLICY_HAS_API_OPERATION,
      ),
    ).toMatchDirectRelationshipSchema({
      schema: {
        properties: {
          _class: { const: 'HAS' },
          _type: {
            const:
              'google_access_context_manager_service_perimeter_ingress_policy_has_api_operation',
          },
        },
      },
    });

    const serviceEntities = context.jobState.collectedEntities.filter(
      (e) =>
        e._type === ServiceUsageEntities.API_SERVICE._type &&
        e._key ===
          'projects/j1-gc-integration-dev-v3/services/storage.googleapis.com',
    );
    const projectEntities = context.jobState.collectedEntities.filter(
      (e) => e._type === PROJECT_ENTITY_TYPE,
    );

    expect(mappedProtectsProjectsRelationships.length).toBeGreaterThan(0);
    expect(mappedLimitsServicesRelationships.length).toBeGreaterThan(0);

    // We have one example for each
    expect(
      mappedProtectsProjectsRelationships.filter(
        (e) => e._mapping.targetEntity._key === 'projects/167984947943',
      ),
    ).toTargetEntities(projectEntities);

    expect(
      mappedLimitsServicesRelationships.filter(
        (e) =>
          e._mapping.targetEntity._key ===
          'projects/j1-gc-integration-dev-v3/services/storage.googleapis.com',
      ),
    ).toTargetEntities(serviceEntities);
  });
});
