import { createMockStepExecutionContext } from '@jupiterone/integration-sdk-testing';
import { IntegrationConfig } from '../..';
import { integrationConfig } from '../../../test/config';
import { withRecording } from '../../../test/recording';
import { fetchIamBindings } from '.';
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
import { Entity, Relationship } from '@jupiterone/integration-sdk-core';
import { filterGraphObjects } from '../../../test/helpers/filterGraphObjects';

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
        google_user_assigned_iam_role,
        google_group_assigned_iam_role,
        google_iam_service_account_assigned_role,
      } = separateGraphObjectsByType(
        context.jobState.collectedRelationships,
        context.jobState.encounteredTypes,
      );

      // Each of these relationships could either be mapped or direct depending on if it has been previously ingested in this run so not checking if direct or mapped here
      expect(google_iam_binding_uses_role.length).toBeGreaterThan(0);
      expect(google_iam_binding_assigned_user.length).toBeGreaterThan(0);
      expect(google_iam_binding_assigned_group.length).toBeGreaterThan(0);
      expect(
        google_iam_binding_assigned_service_account.length,
      ).toBeGreaterThan(0);
      expect(google_user_assigned_iam_role.length).toBeGreaterThan(0);
      expect(google_group_assigned_iam_role.length).toBeGreaterThan(0);
      expect(google_iam_service_account_assigned_role.length).toBeGreaterThan(
        0,
      );

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
