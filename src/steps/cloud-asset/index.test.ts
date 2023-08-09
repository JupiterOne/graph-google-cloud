import { flatten } from 'lodash';
import { createMockStepExecutionContext } from '@jupiterone/integration-sdk-testing';
import { IntegrationConfig } from '../..';
import { integrationConfig } from '../../../test/config';
import { withRecording } from '../../../test/recording';
import {
  createBasicRolesForBindings,
  createBindingRoleRelationships,
  createBindingToAnyResourceRelationships,
  createPrincipalRelationships,
  createApiServiceToAnyResourceRelationships,
  fetchIamBindings,
} from '.';
import { bindingEntities } from './constants';
import {
  buildOrgFolderProjectMappedRelationships,
  fetchResourceManagerFolders,
  fetchResourceManagerOrganization,
  fetchResourceManagerProject,
  FOLDER_ENTITY_TYPE,
  ORGANIZATION_ENTITY_TYPE,
  PROJECT_ENTITY_TYPE,
} from '../resource-manager';
import {
  fetchIamCustomRoles,
  fetchIamManagedRoles,
  fetchIamServiceAccounts,
} from '../iam';
import {
  Entity,
  ExplicitRelationship,
  MappedRelationship,
  Relationship,
} from '@jupiterone/integration-sdk-core';
import { filterGraphObjects } from '../../../test/helpers/filterGraphObjects';
import {
  fetchBigQueryDatasets,
  BIG_QUERY_DATASET_ENTITY_TYPE,
} from '../big-query';
import { fetchStorageBuckets } from '../storage';
import { CLOUD_FUNCTION_ENTITY_TYPE, fetchCloudFunctions } from '../functions';
import { IAM_MANAGED_ROLES_DATA_JOB_STATE_KEY } from '../../utils/iam';
import { fetchApiServices } from '../service-usage';
import { StorageEntitiesSpec } from '../storage/constants';

/* eslint-disable no-console */
expect.extend({
  toHaveOnlyDirectRelationships(
    collectedRelationships: Relationship[],
    name: string,
  ) {
    if (!collectedRelationships || collectedRelationships.length < 1) {
      return {
        message: () => `${name} has no relationships`,
        pass: false,
      };
    }
    const { targets: directRelationships, rest: mappedRelationships } =
      filterGraphObjects(collectedRelationships, (r) => !r._mapping) as {
        targets: ExplicitRelationship[];
        rest: MappedRelationship[];
      };
    if (directRelationships?.length < 1) {
      return {
        message: () => `${name} has no direct relationships`,
        pass: false,
      };
    }
    if (mappedRelationships?.length > 0) {
      return {
        message: () => `${name} has mapped relationships`,
        pass: false,
      };
    }
    return {
      message: () => `${name} should have only direct relationships`,
      pass: true,
    };
  },
  toHaveOnlyMappedRelationships(
    collectedRelationships: Relationship[],
    name: string,
  ) {
    if (!collectedRelationships || collectedRelationships.length < 1) {
      return {
        message: () => `${name} has no relationships`,
        pass: false,
      };
    }
    const { targets: directRelationships, rest: mappedRelationships } =
      filterGraphObjects(collectedRelationships, (r) => !r._mapping) as {
        targets: ExplicitRelationship[];
        rest: MappedRelationship[];
      };
    if (directRelationships?.length > 0) {
      return {
        message: () => `${name} has direct relationships`,
        pass: false,
      };
    }
    if (mappedRelationships?.length < 1) {
      return {
        message: () => `${name} has no mapped relationships`,
        pass: false,
      };
    }
    return {
      message: () => `${name} should have only mapped relationships`,
      pass: true,
    };
  },
  toHaveBothDirectAndMappedRelationships(
    collectedRelationships: Relationship[],
    name: string,
  ) {
    if (!collectedRelationships || collectedRelationships.length < 1) {
      return {
        message: () => `${name} has no relationships`,
        pass: false,
      };
    }
    const { targets: directRelationships, rest: mappedRelationships } =
      filterGraphObjects(collectedRelationships, (r) => !r._mapping) as {
        targets: ExplicitRelationship[];
        rest: MappedRelationship[];
      };
    if (directRelationships?.length < 1) {
      return {
        message: () => `${name} has no direct relationships`,
        pass: false,
      };
    }
    if (mappedRelationships?.length < 1) {
      return {
        message: () => `${name} has no mapped relationships`,
        pass: false,
      };
    }
    return {
      message: () => `${name} should have both direct and mapped relationships`,
      pass: true,
    };
  },
});

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace jest {
    interface Matchers<R> {
      toHaveBothDirectAndMappedRelationships(name: string): R;
      toHaveOnlyDirectRelationships(name: string): R;
      toHaveOnlyMappedRelationships(name: string): R;
    }
  }
}

function createMockContext(overrides: Partial<IntegrationConfig> = {}) {
  return createMockStepExecutionContext<IntegrationConfig>({
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
      ...overrides,
    },
  });
}

function separateGraphObjectsByType<T extends Entity | Relationship>(
  collected: T[],
  encounteredTypes: string[],
) {
  const relationshipsByType: Record<string, T[]> = {};
  let rest: T[] = collected;
  if (rest) {
    for (const type of encounteredTypes) {
      const filterResult = filterGraphObjects(rest, (o) => o._type === type);
      rest = filterResult.rest;
      relationshipsByType[type] = filterResult.targets;
    }
  }
  return relationshipsByType;
}

describe('#fetchIamBindings', () => {
  describe('Organization Instance', () => {
    it.skip('should create Binding and Role entities, Direct Relationships with resources and principals ingested, and Mapped Relationships with resources and principals not ingested.', async () => {
      await withRecording('fetchIamBindings', __dirname, async () => {
        const context = createMockContext();

        await fetchResourceManagerOrganization(context);
        await fetchResourceManagerFolders(context);
        await fetchResourceManagerProject(context);
        await buildOrgFolderProjectMappedRelationships(context);

        // Used for making direct relationships for google_cloud_api_service_has_resource
        await fetchStorageBuckets(context);

        await fetchIamCustomRoles(context);
        await fetchIamManagedRoles(context);
        await fetchIamServiceAccounts(context);
        await fetchIamBindings(context);
        await createBasicRolesForBindings(context);
        await createPrincipalRelationships(context);
        await createBindingRoleRelationships(context);
        await createBindingToAnyResourceRelationships(context);
        await fetchApiServices(context);
        await createApiServiceToAnyResourceRelationships(context);

        expect({
          numCollectedEntities: context.jobState.collectedEntities.length,
          numCollectedRelationships:
            context.jobState.collectedRelationships.length,
          collectedEntities: context.jobState.collectedEntities.length,
          collectedRelationships:
            context.jobState.collectedRelationships.length,
          encounteredTypes: context.jobState.encounteredTypes,
        }).toMatchSnapshot();

        /////////////////////
        /// Relationships ///
        /////////////////////
        const {
          google_iam_binding_uses_role,

          google_iam_binding_assigned_user,
          google_iam_binding_assigned_group,
          google_iam_binding_assigned_service_account,
          google_iam_binding_assigned_domain,
          google_iam_binding_assigned_role,
          google_iam_binding_assigned_everyone,

          google_user_assigned_iam_role,
          google_group_assigned_iam_role,
          google_iam_service_account_assigned_role,
          google_domain_assigned_iam_role,
          everyone_assigned_google_iam_role,
          google_iam_role_assigned_role,

          google_cloud_api_service_has_resource,
          google_iam_binding_allows_resource,
        } = separateGraphObjectsByType(
          context.jobState.collectedRelationships,
          context.jobState.encounteredTypes,
        );

        /// Both Direct and Mapped Relationships ///
        // Direct if target already ingested in this integration, mapped otherwise.
        expect(
          google_iam_binding_assigned_service_account,
        ).toHaveBothDirectAndMappedRelationships(
          'google_iam_binding_assigned_service_account',
        );
        expect(
          google_iam_binding_allows_resource,
        ).toHaveBothDirectAndMappedRelationships(
          'google_iam_binding_allows_resource',
        );
        expect(
          google_cloud_api_service_has_resource,
        ).toHaveBothDirectAndMappedRelationships(
          'google_cloud_api_service_has_resource',
        );
        expect(
          google_iam_binding_uses_role,
        ).toHaveBothDirectAndMappedRelationships(
          'google_iam_binding_uses_role',
        );
        // These are for "Convienence Members"
        expect(
          google_iam_binding_assigned_role,
        ).toHaveBothDirectAndMappedRelationships(
          'google_iam_binding_assigned_role',
        );

        // Ensure google_cloud_api_service HAS any resource in the organization resource hierarchy relationships are NOT created
        expect(
          google_cloud_api_service_has_resource.filter((r: any) => {
            r._toEntityKey?.startsWith('organizations/');
          }).length,
        ).toBe(0);
        expect(
          google_cloud_api_service_has_resource.filter((r: any) => {
            r._toEntityKey?.startsWith('folders/');
          }).length,
        ).toBe(0);

        /// Mapped Relationships ///
        expect(google_iam_binding_assigned_user).toHaveOnlyMappedRelationships(
          'google_iam_binding_assigned_user',
        );
        expect(google_iam_binding_assigned_group).toHaveOnlyMappedRelationships(
          'google_iam_binding_assigned_group',
        );
        expect(
          google_iam_binding_assigned_domain,
        ).toHaveOnlyMappedRelationships('google_iam_binding_assigned_domain');
        expect(
          google_iam_binding_assigned_everyone,
        ).toHaveOnlyMappedRelationships('google_iam_binding_assigned_everyone');

        // Ensure we do not assign principals directly to roles as in GCP a principal is only given a role for a specific resource, not for EVERY resource.
        expect(google_iam_service_account_assigned_role).toBeUndefined();
        expect(google_user_assigned_iam_role).toBeUndefined();
        expect(google_group_assigned_iam_role).toBeUndefined();
        expect(google_domain_assigned_iam_role).toBeUndefined();
        expect(everyone_assigned_google_iam_role).toBeUndefined();

        // Ensure there are never any group assigned group relationships created
        expect(google_iam_role_assigned_role).toBeUndefined();

        /// Direct Relationships ///
        // Organization relationships
        expect(
          google_iam_binding_allows_resource.filter(
            (r: any) => r._toEntityKey?.startsWith('organizations/'),
          ).length,
        ).toBeGreaterThan(0),
          expect(
            google_iam_binding_allows_resource.filter(
              (r: any) =>
                r._mapping?.targetEntity?._type === ORGANIZATION_ENTITY_TYPE,
            ).length,
          ).toBe(0),
          // Folder relationships
          expect(
            google_iam_binding_allows_resource.filter(
              (r: any) => r._toEntityKey?.startsWith('folders/'),
            ).length,
          ).toBeGreaterThan(0);
        expect(
          google_iam_binding_allows_resource.filter(
            (r: any) => r._mapping?.targetEntity?._type === FOLDER_ENTITY_TYPE,
          ).length,
        ).toBe(0);

        ////////////////
        /// Entities ///
        ////////////////
        const { google_iam_binding, google_iam_role } =
          separateGraphObjectsByType(
            context.jobState.collectedEntities,
            context.jobState.encounteredTypes,
          );

        /// Bindings ///
        expect(google_iam_binding.length).toBeGreaterThan(0);
        expect(google_iam_binding).toMatchGraphObjectSchema({
          _class: bindingEntities.BINDINGS._class,
          schema: {
            additionalProperties: false,
            properties: {
              _type: { const: bindingEntities.BINDINGS._type },
              _rawData: {
                type: 'array',
                items: { type: 'object' },
              },
              resource: { type: 'string' },
              projectId: { type: 'string' },
              projectName: { type: 'string' },
              folders: {
                type: 'array',
                items: { type: 'string' },
              },
              organization: { type: 'string' },
              members: { type: 'array' },
              role: { type: 'string' },
              'condition.title': { type: 'string' },
              'condition.description': { type: 'string' },
              'condition.expression': { type: 'string' },
              'condition.location': { type: 'string' },
              readonly: { type: 'boolean' },
              permissions: {
                type: 'array',
                items: { type: 'string' },
              },
            },
          },
        });

        // Ensure organization-level bindings do not have `projectId` or `folders` properties
        google_iam_binding
          .filter((entity) =>
            (entity.resource as string).startsWith(
              '//cloudresourcemanager.googleapis.com/organizations/',
            ),
          )
          .forEach((entity) => {
            expect(entity.projectId).toBeUndefined();
            expect(entity.folders).toBeUndefined();
            expect(typeof entity.organization).toBe('string');
          });
        // Ensure folder-level bindings do not have a `projectId` property
        google_iam_binding
          .filter((entity) =>
            (entity.resource as string).startsWith(
              '//cloudresourcemanager.googleapis.com/folders',
            ),
          )
          .forEach((entity) => {
            expect(entity.projectId).toBeUndefined();
            expect(Array.isArray(entity.folders)).toBe(true);
            expect(typeof entity.organization).toBe('string');
          });
        // Ensure all other bindings have projectId, folders, and organization properties
        google_iam_binding
          .filter(
            (entity) =>
              (entity.resource as string).startsWith(
                '//cloudresourcemanager.googleapis.com/folders',
              ) &&
              (entity.resource as string).startsWith(
                '//cloudresourcemanager.googleapis.com/organizations/',
              ),
          )
          .forEach((entity) => {
            expect(typeof entity.projectId).toBe('string');
            expect(Array.isArray(entity.folders)).toBe(true);
            expect(typeof entity.organization).toBe('string');
          });

        /// Roles ///
        const roleSchema = {
          _class: ['AccessRole'],
          schema: {
            additionalProperties: false,
            properties: {
              _type: { const: 'google_iam_role' },
              _rawData: {
                type: 'array',
                items: { type: 'object' },
              },
              description: { type: 'string' },
              stage: { type: 'string' },
              custom: { type: 'boolean' },
              deleted: { type: 'boolean' },
              permissions: {
                type: 'array',
                items: { type: 'string' },
              },
              etag: { type: 'string' },
              readonly: { type: 'boolean' },
            },
          },
        };
        expect(google_iam_role.length).toBeGreaterThan(0);
        expect(google_iam_role).toMatchGraphObjectSchema(roleSchema);
        const { targets: roleMappedRelationships } = filterGraphObjects(
          google_iam_binding_uses_role,
          (r) => !!r._mapping,
        ) as {
          targets: ExplicitRelationship[];
          rest: MappedRelationship[];
        };
        roleMappedRelationships.forEach((relationship) => {
          expect(
            (relationship as unknown as MappedRelationship)._mapping
              .targetEntity,
          ).toMatchGraphObjectSchema(roleSchema);
        });

        // Ensure there are no mapped relationships to google_iam_roles that we are also ingesting
        const iamRoleTargetEntityKeys = google_iam_binding_uses_role.map(
          (relationship) =>
            (relationship as MappedRelationship)._mapping?.targetEntity?._key,
        );
        const ingestedIamRoleEntityKeys = google_iam_role.map(
          (entity) => entity._key,
        );
        expect(
          iamRoleTargetEntityKeys.some((key) =>
            ingestedIamRoleEntityKeys.includes(key as string),
          ),
        ).toBe(false);

        // Ensure managed role target entities have permissions
        google_iam_binding_uses_role.forEach((relationship) => {
          if (relationship._mapping) {
            expect(
              Array.isArray(
                (relationship as MappedRelationship)._mapping?.targetEntity
                  ?.permissions,
              ),
            ).toBe(true);
          }
        });
      });
    });
  });

  describe('Project Instance', () => {
    it.skip('should create Binding and Role entities, Direct Relationships with resources and principals ingested, and Mapped Relationships with resources and principals not ingested.', async () => {
      await withRecording('fetchIamBindingsProject', __dirname, async () => {
        const context = createMockContext({
          configureOrganizationProjects: false,
        });

        // The only difference between an Organization Instance and a Project Instance is the existance of Orgs and Folders in the JobState.

        await fetchResourceManagerProject(context);
        await buildOrgFolderProjectMappedRelationships(context);

        // Used for making direct relationships for google_cloud_api_service_has_resource
        await fetchStorageBuckets(context);

        await fetchIamCustomRoles(context);
        await fetchIamManagedRoles(context);
        await fetchIamServiceAccounts(context);
        await fetchIamBindings(context);
        await createBasicRolesForBindings(context);
        await createPrincipalRelationships(context);
        await createBindingRoleRelationships(context);
        await createBindingToAnyResourceRelationships(context);
        await fetchApiServices(context);
        await createApiServiceToAnyResourceRelationships(context);

        expect({
          numCollectedEntities: context.jobState.collectedEntities.length,
          numCollectedRelationships:
            context.jobState.collectedRelationships.length,
          collectedEntities: context.jobState.collectedEntities.length,
          collectedRelationships:
            context.jobState.collectedRelationships.length,
          encounteredTypes: context.jobState.encounteredTypes,
        }).toMatchSnapshot();

        // Relationships
        const {
          google_iam_binding_uses_role,

          google_iam_binding_assigned_user,
          google_iam_binding_assigned_group,
          google_iam_binding_assigned_service_account,
          google_iam_binding_assigned_domain,
          google_iam_binding_assigned_role,
          google_iam_binding_assigned_everyone,

          google_user_assigned_iam_role,
          google_group_assigned_iam_role,
          google_iam_service_account_assigned_role,
          google_domain_assigned_iam_role,
          everyone_assigned_google_iam_role,
          google_iam_role_assigned_role,

          google_cloud_api_service_has_resource,
          google_iam_binding_allows_resource,
        } = separateGraphObjectsByType(
          context.jobState.collectedRelationships,
          context.jobState.encounteredTypes,
        );

        // Both Direct and Mapped Relationships
        // Direct if target already ingested in this integration, mapped otherwise.
        expect(
          google_iam_binding_assigned_service_account,
        ).toHaveBothDirectAndMappedRelationships(
          'google_iam_binding_assigned_service_account',
        );
        expect(
          google_iam_binding_allows_resource,
        ).toHaveBothDirectAndMappedRelationships(
          'google_iam_binding_allows_resource',
        );
        expect(
          google_cloud_api_service_has_resource,
        ).toHaveBothDirectAndMappedRelationships(
          'google_cloud_api_service_has_resource',
        );
        expect(
          google_iam_binding_uses_role,
        ).toHaveBothDirectAndMappedRelationships(
          'google_iam_binding_uses_role',
        );
        // These are for "Convienence Members"
        expect(
          google_iam_binding_assigned_role,
        ).toHaveBothDirectAndMappedRelationships(
          'google_iam_binding_assigned_role',
        );

        // Ensure google_cloud_api_service HAS any resource in the organization resource hierarchy relationships are NOT created
        expect(
          google_cloud_api_service_has_resource.filter((r: any) => {
            r._toEntityKey?.startsWith('organizations/');
          }).length,
        ).toBe(0);
        expect(
          google_cloud_api_service_has_resource.filter((r: any) => {
            r._toEntityKey?.startsWith('folders/');
          }).length,
        ).toBe(0);

        // Mapped Relationships
        expect(google_iam_binding_assigned_user).toHaveOnlyMappedRelationships(
          'google_iam_binding_assigned_user',
        );
        expect(google_iam_binding_assigned_group).toHaveOnlyMappedRelationships(
          'google_iam_binding_assigned_group',
        );
        expect(
          google_iam_binding_assigned_domain,
        ).toHaveOnlyMappedRelationships('google_iam_binding_assigned_domain');
        expect(
          google_iam_binding_assigned_everyone,
        ).toHaveOnlyMappedRelationships('google_iam_binding_assigned_everyone');

        // Ensure we do not assign principals directly to roles as in GCP a principal is only given a role for a specific resource, not for EVERY resource.
        expect(google_iam_service_account_assigned_role).toBeUndefined();
        expect(google_user_assigned_iam_role).toBeUndefined();
        expect(google_group_assigned_iam_role).toBeUndefined();
        expect(google_domain_assigned_iam_role).toBeUndefined();
        expect(everyone_assigned_google_iam_role).toBeUndefined();

        // Ensure there are never any group assigned group relationships created
        expect(google_iam_role_assigned_role).toBeUndefined();

        // Ensure no folder or organization relationships get created
        expect(
          google_iam_binding_allows_resource.filter(
            (r: any) =>
              r._toEntityKey?.startsWith('organizations/') ||
              r._mapping?.targetEntity?._type === ORGANIZATION_ENTITY_TYPE,
          ).length,
        ).toBe(0),
          // Folder relationships
          expect(
            google_iam_binding_allows_resource.filter(
              (r: any) =>
                r._toEntityKey?.startsWith('folders/') ||
                r._mapping?.targetEntity?._type === ORGANIZATION_ENTITY_TYPE,
            ).length,
          ).toBe(0);
      });
    });
  });

  /**
   * Fetches Storage Buckets, BigQuery Datasets, and CloudFunctions out of the context
   * of the main context of the test as examples of resources that could be ingested
   * by other integration instances. This is useful because it ensures that targets of
   * mapped relationships are being hooked up properly.
   */
  async function getSetupEntities() {
    const context = createMockContext();

    await fetchResourceManagerProject(context);
    const projects = context.jobState.collectedEntities.filter(
      (e) => e._type === PROJECT_ENTITY_TYPE,
    );
    expect(projects.length).toBe(1);

    await fetchStorageBuckets(context);
    const storageBuckets = context.jobState.collectedEntities.filter(
      (e) => e._type === StorageEntitiesSpec.STORAGE_BUCKET._type,
    );
    expect(storageBuckets.length).toBeGreaterThan(0);

    await fetchBigQueryDatasets(context);
    const bigQueryDatasets = context.jobState.collectedEntities.filter(
      (e) => e._type === BIG_QUERY_DATASET_ENTITY_TYPE,
    );
    expect(bigQueryDatasets.length).toBeGreaterThan(0);

    await fetchCloudFunctions(context);
    const cloudFunctions = context.jobState.collectedEntities.filter(
      (e) => e._type === CLOUD_FUNCTION_ENTITY_TYPE,
    );
    expect(cloudFunctions.length).toBeGreaterThan(0);

    return {
      storageBuckets,
      bigQueryDatasets,
      cloudFunctions,
      projects,
    };
  }

  it('should correctly map up to Google Cloud resources ingested in other integration instances', async () => {
    await withRecording(
      'createMappedBindingAnyResourceRelationships',
      __dirname,
      async () => {
        const targetResourcesNotIngestedInThisRun = flatten(
          Object.values(await getSetupEntities()),
        );
        const resourceKeys = targetResourcesNotIngestedInThisRun.map(
          (e) => e._key,
        );

        const context = createMockContext();

        // Needed for populating the ProjectName to ProjectId map in the job state
        await fetchResourceManagerOrganization(context);
        await fetchResourceManagerFolders(context);
        await buildOrgFolderProjectMappedRelationships(context);

        await context.jobState.setData(
          IAM_MANAGED_ROLES_DATA_JOB_STATE_KEY,
          {},
        );
        await fetchIamBindings(context);
        await createBindingToAnyResourceRelationships(context);

        const bindingAnyResourceMappedRelationships = (
          context.jobState.collectedRelationships as MappedRelationship[]
        ).filter((r: MappedRelationship) =>
          resourceKeys.includes(r._mapping?.targetEntity?._key),
        );

        expect(
          bindingAnyResourceMappedRelationships.filter(
            (r) => r._mapping.targetEntity._type === 'google_storage_bucket',
          ).length > 0,
        ).toBe(true);
        expect(
          bindingAnyResourceMappedRelationships.filter(
            (r) => r._mapping.targetEntity._type === 'google_bigquery_dataset',
          ).length > 0,
        ).toBe(true);
        expect(
          bindingAnyResourceMappedRelationships.filter(
            (r) => r._mapping.targetEntity._type === 'google_cloud_function',
          ).length > 0,
        ).toBe(true);
        expect(
          bindingAnyResourceMappedRelationships.filter(
            (r) => r._mapping.targetEntity._type === 'google_cloud_project',
          ).length > 0,
        ).toBe(true);
        expect(bindingAnyResourceMappedRelationships).toTargetEntities(
          flatten(Object.values(targetResourcesNotIngestedInThisRun)),
        );
      },
    );
  });
});

/**
 * At the time of writing this, 4096 is the maximum value described in the
 * JupiterOne search indexer system
 */
const MAX_ENTITY_PROPERTY_VALUE = 4096;

describe('#createBasicRolesForBindings', () => {
  it('should truncate permission values for both bindings and roles', async () => {
    await withRecording('createBasicRolesForBindings', __dirname, async () => {
      const context = createMockContext();

      // Needed for gathering folder and organization level IAM bindings
      await fetchResourceManagerOrganization(context);
      await fetchResourceManagerFolders(context);

      await fetchResourceManagerProject(context);
      await fetchIamManagedRoles(context);
      await fetchIamBindings(context);
      await createBasicRolesForBindings(context);

      expect({
        numCollectedEntities: context.jobState.collectedEntities.length,
        numCollectedRelationships:
          context.jobState.collectedRelationships.length,
        encounteredTypes: context.jobState.encounteredTypes,
      }).toMatchSnapshot();

      const { google_iam_role, google_iam_binding } =
        separateGraphObjectsByType(
          context.jobState.collectedEntities,
          context.jobState.encounteredTypes,
        );

      expect(google_iam_role.length).toBeGreaterThan(0);
      expect(google_iam_role).toMatchSnapshot();

      google_iam_role.forEach((role) => {
        if (typeof role.permissions === 'string') {
          expect(role.permissions.length).toBeLessThanOrEqual(
            MAX_ENTITY_PROPERTY_VALUE,
          );
        }
      });

      expect(google_iam_binding.length).toBeGreaterThan(0);

      google_iam_binding.forEach((binding) => {
        if (typeof binding.permissions === 'string') {
          expect(binding.permissions.length).toBeLessThanOrEqual(
            MAX_ENTITY_PROPERTY_VALUE,
          );
        }
      });

      // Ensure that all Basic roles are for hierarchy members that we have ingested.
      for (const role of google_iam_role) {
        const orgHierarchyKey = role._key.split('/').slice(0, -2).join('/');
        expect(context.jobState.hasKey(orgHierarchyKey)).toBe(true);
      }
    });
  });
});
