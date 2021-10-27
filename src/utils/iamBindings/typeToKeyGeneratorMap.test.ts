import {
  bindingEntities,
  BINDING_ALLOWS_ANY_RESOURCE_TYPE,
} from '../../steps/cloud-asset/constants';
import {
  ENTITY_TYPE_ACCESS_CONTEXT_MANAGER_ACCESS_LEVEL,
  ENTITY_TYPE_ACCESS_CONTEXT_MANAGER_ACCESS_POLICY,
  ENTITY_TYPE_ACCESS_CONTEXT_MANAGER_SERVICE_PERIMETER,
  ENTITY_TYPE_ACCESS_CONTEXT_MANAGER_SERVICE_PERIMETER_API_OPERATION,
  ENTITY_TYPE_ACCESS_CONTEXT_MANAGER_SERVICE_PERIMETER_EGRESS_POLICY,
  ENTITY_TYPE_ACCESS_CONTEXT_MANAGER_SERVICE_PERIMETER_INGRESS_POLICY,
  ENTITY_TYPE_ACCESS_CONTEXT_MANAGER_SERVICE_PERIMETER_METHOD_SELECTOR,
} from '../../steps/access-context-manager/constants';
import { ENTITY_TYPE_APP_ENGINE_INSTANCE } from '../../steps/app-engine/constants';
import { AUDIT_CONFIG_ENTITY_TYPE } from '../../steps/resource-manager';
import { BIG_QUERY_MODEL_ENTITY_TYPE } from '../../steps/big-query';
import { ENTITY_TYPE_BILLING_BUDGET } from '../../steps/billing-budgets/constants';
import {
  ENTITY_TYPE_COMPUTE_ADDRESS,
  ENTITY_TYPE_COMPUTE_FORWARDING_RULE,
  ENTITY_TYPE_COMPUTE_GLOBAL_ADDRESS,
  ENTITY_TYPE_COMPUTE_GLOBAL_FORWARDING_RULE,
  ENTITY_TYPE_COMPUTE_INSTANCE_GROUP_NAMED_PORT,
} from '../../steps/compute';
import { BINARY_AUTHORIZATION_POLICY_ENTITY_TYPE } from '../../steps/binary-authorization/constants';
import {
  ENTITY_TYPE_CLOUD_RUN_CONFIGURATION,
  ENTITY_TYPE_CLOUD_RUN_ROUTE,
} from '../../steps/cloud-run/constants';
import { ENTITY_TYPE_MEMCACHE_INSTANCE_NODE } from '../../steps/memcache/constants';
import { ENTITY_TYPE_PRIVATE_CA_CERTIFICATE } from '../../steps/privateca/constants';
import { ENTITY_TYPE_SPANNER_INSTANCE_CONFIG } from '../../steps/spanner/constants';
import { J1_TYPE_TO_KEY_GENERATOR_MAP } from './typeToKeyGeneratorMap';
import { GOOGLE_RESOURCE_KIND_TO_J1_TYPE_MAP } from './resourceKindToTypeMap';
import {
  SQL_ADMIN_MYSQL_INSTANCE_ENTITY_TYPE,
  SQL_ADMIN_POSTGRES_INSTANCE_ENTITY_TYPE,
  SQL_ADMIN_SQL_SERVER_INSTANCE_ENTITY_TYPE,
} from '../../steps/sql-admin';
import { invocationConfig } from '../..';
import {
  generateRelationshipType,
  StepEntityMetadata,
  StepMappedRelationshipMetadata,
  StepMetadata,
  StepRelationshipMetadata,
} from '@jupiterone/integration-sdk-core';

/**
 * If your JupiterOne entity can not be indentified in Google Cloud with a Google Cloud
 * Resource Identifier, add it to the below list to skip this test.
 *
 * Verify this using the table in the link below BEFORE adding your entity to this list
 * => https://cloud.google.com/asset-inventory/docs/resource-name-format
 */

const entitiesTypesToSkip = [
  ENTITY_TYPE_ACCESS_CONTEXT_MANAGER_ACCESS_LEVEL,
  ENTITY_TYPE_ACCESS_CONTEXT_MANAGER_ACCESS_POLICY,
  ENTITY_TYPE_ACCESS_CONTEXT_MANAGER_SERVICE_PERIMETER,
  ENTITY_TYPE_ACCESS_CONTEXT_MANAGER_SERVICE_PERIMETER_API_OPERATION,
  ENTITY_TYPE_ACCESS_CONTEXT_MANAGER_SERVICE_PERIMETER_EGRESS_POLICY,
  ENTITY_TYPE_ACCESS_CONTEXT_MANAGER_SERVICE_PERIMETER_INGRESS_POLICY,
  ENTITY_TYPE_ACCESS_CONTEXT_MANAGER_SERVICE_PERIMETER_METHOD_SELECTOR,
  ENTITY_TYPE_APP_ENGINE_INSTANCE,
  AUDIT_CONFIG_ENTITY_TYPE,
  BIG_QUERY_MODEL_ENTITY_TYPE,
  ENTITY_TYPE_BILLING_BUDGET,
  BINARY_AUTHORIZATION_POLICY_ENTITY_TYPE,
  ENTITY_TYPE_CLOUD_RUN_CONFIGURATION,
  ENTITY_TYPE_CLOUD_RUN_ROUTE,
  ENTITY_TYPE_COMPUTE_ADDRESS,
  ENTITY_TYPE_COMPUTE_FORWARDING_RULE,
  ENTITY_TYPE_COMPUTE_GLOBAL_ADDRESS,
  ENTITY_TYPE_COMPUTE_GLOBAL_FORWARDING_RULE,
  ENTITY_TYPE_COMPUTE_INSTANCE_GROUP_NAMED_PORT,
  bindingEntities.BINDINGS._type,
  ENTITY_TYPE_MEMCACHE_INSTANCE_NODE,
  ENTITY_TYPE_PRIVATE_CA_CERTIFICATE,
  ENTITY_TYPE_SPANNER_INSTANCE_CONFIG,
];

/**
 * HACK: sqladmin.googleapis.com/Instances are currently mapped incorrectly.
 * A Google Resource Type of sqladmin.googleapis.com/Instances could be a
 * google_sql_mysql_instance, a google_sql_postgres_instance, or a
 * google_sql_sql_server_instance. There is no way to tell at the moment.
 *
 * These tests have value right now though, so adding this temporary hack
 * to skip sqladmin instances.
 */
const HACK_SKIP_UNTIL_SQL_INSTANCES_ARE_FIXED = [
  SQL_ADMIN_MYSQL_INSTANCE_ENTITY_TYPE,
  SQL_ADMIN_POSTGRES_INSTANCE_ENTITY_TYPE,
  SQL_ADMIN_SQL_SERVER_INSTANCE_ENTITY_TYPE,
]; // will be fixed with https://jupiterone.atlassian.net/browse/INT-1303

describe('J1_TYPE_TO_KEY_GENERATOR_MAP', () => {
  test('All resource entities that can be targeted by an IAM Binding should be documented in the stepMetadata', () => {
    const metadata = collectGraphObjectMetadataFromSteps(
      invocationConfig.integrationSteps,
    );
    const unmappedEntities: string[] = [];
    const bindingRelationships = metadata.relationships.filter(
      (r) => r._type === BINDING_ALLOWS_ANY_RESOURCE_TYPE,
    );

    metadata.entities.forEach((entity) => {
      if (!entitiesTypesToSkip.includes(entity._type)) {
        if (!bindingRelationships.find((r) => r.targetType == entity._type)) {
          console.log(entity._type);
          unmappedEntities.push(entity._type);
        }
      }
    });
    expect(unmappedEntities).toHaveLength(0);
  });

  test('All resource entities that can be targeted by an IAM Binding should be in the J1_TYPE_TO_KEY_GENERATOR_MAP', () => {
    const metadata = collectGraphObjectMetadataFromSteps(
      invocationConfig.integrationSteps,
    );
    const unmappedEntities: string[] = [];

    metadata.entities.forEach((entity) => {
      if (
        ![
          ...entitiesTypesToSkip,
          ...HACK_SKIP_UNTIL_SQL_INSTANCES_ARE_FIXED,
        ].includes(entity._type)
      ) {
        if (typeof J1_TYPE_TO_KEY_GENERATOR_MAP[entity._type] != 'function') {
          unmappedEntities.push(entity._type);
        }
      }
    });
    expect(unmappedEntities).toHaveLength(0);
  });
});

describe('GOOGLE_RESOURCE_KIND_TO_J1_TYPE_MAP', () => {
  test('All resource entities that can be targeted by an IAM Binding should be targeted in the GOOGLE_RESOURCE_KIND_TO_J1_TYPE_MAP', () => {
    const metadata = collectGraphObjectMetadataFromSteps(
      invocationConfig.integrationSteps,
    );
    const unmappedEntities: string[] = [];

    metadata.entities.forEach((entity) => {
      if (
        ![
          ...entitiesTypesToSkip,
          ...HACK_SKIP_UNTIL_SQL_INSTANCES_ARE_FIXED,
        ].includes(entity._type)
      ) {
        if (
          !Object.values(GOOGLE_RESOURCE_KIND_TO_J1_TYPE_MAP).includes(
            entity._type,
          )
        ) {
          unmappedEntities.push(entity._type);
        }
      }
    });
    expect(unmappedEntities).toHaveLength(0);
  });
});

function integrationStepsToMap(integrationSteps) {
  const integrationStepMap = new Map<string, StepMetadata>();
  for (const step of integrationSteps) {
    integrationStepMap.set(step.id, step);
  }
  return integrationStepMap;
}

function collectGraphObjectMetadataFromSteps(
  steps: typeof invocationConfig.integrationSteps,
) {
  const integrationStepMap = integrationStepsToMap(steps);
  const entities: StepEntityMetadata[] = [];
  const relationships: StepRelationshipMetadata[] = [];
  const mappedRelationships: StepMappedRelationshipMetadata[] = [];
  // There could be multiple steps that ingest the same entity/relationship
  // `_type`, so we need to deduplicate the data.
  const entityTypeSet = new Set();
  const relationshipTypeSet = new Set();
  const mappedRelationshipTypeSet = new Set();
  for (const stepName of steps.map((s) => s.name)) {
    const step = integrationStepMap.get(stepName);
    if (!step) continue;
    for (const e of step.entities) {
      if (entityTypeSet.has(e._type)) {
        continue;
      }
      entityTypeSet.add(e._type);
      entities.push(e);
    }
    for (const r of step.relationships) {
      // We want to regenerate the type off of the composite types to get all ANY_RESOURCE relationships
      const generatedType = generateRelationshipType(
        r._class,
        r.sourceType,
        r.targetType,
      );
      if (relationshipTypeSet.has(generatedType)) {
        continue;
      }
      relationshipTypeSet.add(generatedType);
      relationships.push(r);
    }
    for (const r of step.mappedRelationships || []) {
      // We want to regenerate the type off of the composite types to get all ANY_RESOURCE relationships
      const generatedType = generateRelationshipType(
        r._class,
        r.sourceType,
        r.targetType,
      );
      if (mappedRelationshipTypeSet.has(generatedType)) {
        continue;
      }
      mappedRelationshipTypeSet.add(generatedType);
      mappedRelationships.push(r);
    }
  }
  return {
    entities,
    relationships,
    mappedRelationships,
  };
}
