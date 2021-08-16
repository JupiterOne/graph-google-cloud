import { flatten } from 'lodash';
import { createMockStepExecutionContext } from '@jupiterone/integration-sdk-testing';
import { IntegrationConfig } from '../..';
import { integrationConfig } from '../../../test/config';
import { withRecording } from '../../../test/recording';
import {
  createBindingRoleRelationships,
  createBindingToAnyResourceRelationships,
  createPrincipalRelationships,
  fetchIamBindings,
} from '.';
import { bindingEntities } from './constants';
import {
  buildOrgFolderProjectMappedRelationships,
  fetchResourceManagerFolders,
  fetchResourceManagerOrganization,
  fetchResourceManagerProject,
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
import {
  fetchStorageBuckets,
  CLOUD_STORAGE_BUCKET_ENTITY_TYPE,
} from '../storage';
import { CLOUD_FUNCTION_ENTITY_TYPE, fetchCloudFunctions } from '../functions';

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
  toTargetEntities(
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

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace jest {
    interface Matchers<R> {
      toHaveBothDirectAndMappedRelationships(name: string): R;
      toHaveOnlyDirectRelationships(name: string): R;
      toHaveOnlyMappedRelationships(name: string): R;
      toTargetEntities(entities: Entity[]): R;
    }
  }
}

function createMockContext() {
  return createMockStepExecutionContext<IntegrationConfig>({
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
}

describe('#fetchIamBindings', () => {
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

  test('should create Binding and Role entities, Direct Relationships with resources and principals ingested, and Mapped Relationships with resources and principals not ingested.', async () => {
    await withRecording('fetchIamBindings', __dirname, async () => {
      const context = createMockContext();

      await fetchResourceManagerOrganization(context);
      await fetchResourceManagerFolders(context);
      await buildOrgFolderProjectMappedRelationships(context);
      await fetchIamCustomRoles(context);
      await fetchIamManagedRoles(context);
      await fetchIamServiceAccounts(context);
      await fetchIamBindings(context);
      await createPrincipalRelationships(context);
      await createBindingRoleRelationships(context);
      await createBindingToAnyResourceRelationships(context);

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
        google_iam_binding_allows_cloud_project,
        google_iam_binding_allows_storage_bucket,
        google_iam_binding_allows_bigquery_dataset,
        google_iam_binding_allows_kms_crypto_key,
        google_iam_binding_allows_kms_key_ring,
      } = separateGraphObjectsByType(
        context.jobState.collectedRelationships,
        context.jobState.encounteredTypes,
      );

      // Both Direct and Mapped Relationships
      // mapped are for managed roles that were only used by binding
      expect(
        google_iam_binding_uses_role,
      ).toHaveBothDirectAndMappedRelationships('google_iam_binding_uses_role');
      // Do not have examples of some resources ingested in this integration and some in others yet.
      expect(google_iam_binding_allows_storage_bucket.length > 0).toBe(true);
      expect(google_iam_binding_allows_bigquery_dataset.length > 0).toBe(true);
      expect(google_iam_binding_allows_kms_crypto_key.length > 0).toBe(true);
      expect(google_iam_binding_allows_kms_key_ring.length > 0).toBe(true);

      // Mapped Relationships
      expect(google_iam_binding_assigned_user).toHaveOnlyMappedRelationships(
        'google_iam_binding_assigned_user',
      );
      expect(google_iam_binding_assigned_domain).toHaveOnlyMappedRelationships(
        'google_iam_binding_assigned_domain',
      );
      expect(google_domain_assigned_iam_role).toHaveOnlyMappedRelationships(
        'google_domain_assigned_iam_role',
      );
      expect(google_iam_binding_assigned_group).toHaveOnlyMappedRelationships(
        'google_iam_binding_assigned_group',
      );
      expect(google_user_assigned_iam_role).toHaveOnlyMappedRelationships(
        'google_user_assigned_iam_role',
      );
      expect(google_group_assigned_iam_role).toHaveOnlyMappedRelationships(
        'google_group_assigned_iam_role',
      );
      expect(
        google_iam_binding_allows_cloud_project,
      ).toHaveOnlyMappedRelationships(
        'google_iam_binding_allows_cloud_project',
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
            permissions: { type: 'string' },
            etag: { type: 'string' },
            readonly: { type: 'boolean' },
          },
        },
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
      (e) => e._type === CLOUD_STORAGE_BUCKET_ENTITY_TYPE,
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

        await fetchIamBindings(context);
        await createBindingToAnyResourceRelationships(context);

        const bindingAnyResourceMappedRelationships = (
          context.jobState.collectedRelationships as MappedRelationship[]
        ).filter((r: MappedRelationship) =>
          resourceKeys.includes(r._mapping?.targetEntity?._key),
        );

        expect(
          bindingAnyResourceMappedRelationships.filter(
            (r) => r._type === 'google_iam_binding_allows_storage_bucket',
          ).length > 0,
        ).toBe(true);
        expect(
          bindingAnyResourceMappedRelationships.filter(
            (r) => r._type === 'google_iam_binding_allows_bigquery_dataset',
          ).length > 0,
        ).toBe(true);
        expect(
          bindingAnyResourceMappedRelationships.filter(
            (r) => r._type === 'google_iam_binding_allows_cloud_function',
          ).length > 0,
        ).toBe(true);
        expect(
          bindingAnyResourceMappedRelationships.filter(
            (r) => r._type === 'google_iam_binding_allows_cloud_project',
          ).length > 0,
        ).toBe(true);
        expect(bindingAnyResourceMappedRelationships).toTargetEntities(
          flatten(Object.values(targetResourcesNotIngestedInThisRun)),
        );
      },
    );
  });
});
