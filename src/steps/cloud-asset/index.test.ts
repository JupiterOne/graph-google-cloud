import { createMockStepExecutionContext } from '@jupiterone/integration-sdk-testing';
import { IntegrationConfig } from '../..';
import { integrationConfig } from '../../../test/config';
import { withRecording } from '../../../test/recording';
import {
  createBindingAnyResourceRelationships,
  createBindingRoleRelationships,
  createPrincipalRelationships,
  fetchIamBindings,
} from '.';
import { bindingEntities } from './constants';
import {
  buildOrgFolderProjectMappedRelationships,
  fetchResourceManagerFolders,
  fetchResourceManagerOrganization,
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

expect.extend({
  toHaveOnlyDirectRelationships(
    collectedRelationships: Relationship[],
    name: string,
  ) {
    if (collectedRelationships?.length < 1) {
      return {
        message: () => `${name} has no relatioinships`,
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
        message: () => `${name} has no direct relatioinships`,
        pass: false,
      };
    }
    if (mappedRelationships?.length > 0) {
      return {
        message: () => `${name} has mapped relatioinships`,
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
    if (collectedRelationships?.length < 1) {
      return {
        message: () => `${name} has no relatioinships`,
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
        message: () => `${name} has direct relatioinships`,
        pass: false,
      };
    }
    if (mappedRelationships?.length < 1) {
      return {
        message: () => `${name} has no mapped relatioinships`,
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
    if (collectedRelationships?.length < 1) {
      return {
        message: () => `${name} has no relatioinships`,
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
        message: () => `${name} has no direct relatioinships`,
        pass: false,
      };
    }
    if (mappedRelationships?.length < 1) {
      return {
        message: () => `${name} has no mapped relatioinships`,
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
      toHaveBothDirectAndMappedRelationships(name: string): CustomMatcherResult;
      toHaveOnlyDirectRelationships(name: string): CustomMatcherResult;
      toHaveOnlyMappedRelationships(name: string): CustomMatcherResult;
    }
  }
}

describe('#fetchIamBindings', () => {
  function separateGraphObjectsByType<T extends Entity | Relationship>(
    collected: T[],
    encounteredTypes: string[],
  ) {
    const relationshipsByType: Record<string, T[]> = {};
    let rest: T[] = collected;
    for (const type of encounteredTypes) {
      const filterResult = filterGraphObjects(rest, (o) => o._type === type);
      rest = filterResult.rest;
      relationshipsByType[type] = filterResult.targets;
    }
    return relationshipsByType;
  }

  test('should collect data', async () => {
    await withRecording('fetchIamBindings', __dirname, async () => {
      const context = createMockStepExecutionContext<IntegrationConfig>({
        // Temporary tweak to make this test pass since its recording has been updated from the new organization/v3
        instanceConfig: {
          ...integrationConfig,
          serviceAccountKeyFile:
            integrationConfig.serviceAccountKeyFile.replace(
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
      await buildOrgFolderProjectMappedRelationships(context);
      await fetchIamCustomRoles(context);
      await fetchIamManagedRoles(context);
      await fetchIamServiceAccounts(context);
      await fetchIamBindings(context);
      await createPrincipalRelationships(context);
      await createBindingRoleRelationships(context);
      await createBindingAnyResourceRelationships(context);

      expect({
        numCollectedEntities: context.jobState.collectedEntities.length,
        numCollectedRelationships:
          context.jobState.collectedRelationships.length,
        collectedEntities: context.jobState.collectedEntities.length,
        collectedRelationships: context.jobState.collectedRelationships.length,
        encounteredTypes: context.jobState.encounteredTypes,
      }).toMatchSnapshot();

      // Relationships
      const {
        google_iam_binding_uses_role,
        google_iam_binding_assigned_user,
        google_iam_binding_assigned_group,
        google_iam_binding_assigned_service_account,
        google_iam_binding_assigned_domain,
        google_user_assigned_iam_role,
        google_group_assigned_iam_role,
        google_iam_service_account_assigned_role,
        google_domain_assigned_iam_role,
        google_iam_binding_allows_cloud_organization,
        google_iam_binding_allows_cloud_folder,
      } = separateGraphObjectsByType(
        context.jobState.collectedRelationships,
        context.jobState.encounteredTypes,
      );

      // Both Direct and Mapped Relationships
      expect(
        google_iam_binding_uses_role,
      ).toHaveBothDirectAndMappedRelationships('google_iam_binding_uses_role');

      // Mapped Relationships
      expect(google_iam_binding_assigned_user).toHaveOnlyMappedRelationships(
        'google_iam_binding_assigned_user',
      );
      expect(google_iam_binding_assigned_group).toHaveOnlyMappedRelationships(
        'google_iam_binding_assigned_group',
      );
      expect(google_iam_binding_assigned_domain).toHaveOnlyMappedRelationships(
        'google_iam_binding_assigned_domain',
      );
      expect(google_user_assigned_iam_role).toHaveOnlyMappedRelationships(
        'google_user_assigned_iam_role',
      );
      expect(google_group_assigned_iam_role).toHaveOnlyMappedRelationships(
        'google_group_assigned_iam_role',
      );
      expect(google_domain_assigned_iam_role).toHaveOnlyMappedRelationships(
        'google_domain_assigned_iam_role',
      );

      // Direct Relationships
      expect(
        google_iam_binding_assigned_service_account,
      ).toHaveOnlyDirectRelationships(
        'google_iam_binding_assigned_service_account',
      );
      expect(
        google_iam_service_account_assigned_role,
      ).toHaveOnlyDirectRelationships(
        'google_iam_service_account_assigned_role',
      );
      expect(
        google_iam_binding_allows_cloud_organization,
      ).toHaveOnlyDirectRelationships(
        'google_iam_binding_allows_cloud_organization',
      );
      expect(
        google_iam_binding_allows_cloud_folder,
      ).toHaveOnlyDirectRelationships('google_iam_binding_allows_cloud_folder');

      // Entities
      const { google_iam_binding, google_iam_role } =
        separateGraphObjectsByType(
          context.jobState.collectedEntities,
          context.jobState.encounteredTypes,
        );

      expect(google_iam_binding.length).toBeGreaterThan(0);
      expect(google_iam_binding).toMatchGraphObjectSchema({
        _class: bindingEntities.BINDINGS._class,
        schema: {
          properties: {
            _type: { const: bindingEntities.BINDINGS._type },
            _rawData: {
              type: 'array',
              items: { type: 'object' },
            },
            resource: { type: 'string' },
            projectId: { type: 'string' },
            members: { type: 'array' },
            'condition.title': { type: 'string' },
            'condition.description': { type: 'string' },
            'condition.expression': { type: 'string' },
          },
        },
      });

      expect(google_iam_role.length).toBeGreaterThan(0);
      expect(google_iam_role).toMatchGraphObjectSchema({
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
      });
    });
  });
});
