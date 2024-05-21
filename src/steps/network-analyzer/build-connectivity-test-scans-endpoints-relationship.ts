import {
  IntegrationMissingKeyError,
  RelationshipClass,
  createDirectRelationship,
} from '@jupiterone/integration-sdk-core';
import {
  GoogleCloudIntegrationStep,
  IntegrationStepContext,
} from '../../types';
import {
  IngestionSources,
  NETWORK_ANALYZER_CONNECTIVITY_TEST_TYPE,
  RELATIONSHIP_TYPE_CONNECTIVITY_TEST_SCANS_CLOUD_SQL_INSTANCE,
  RELATIONSHIP_TYPE_CONNECTIVITY_TEST_SCANS_COMPUTE_INSTANCE,
  RELATIONSHIP_TYPE_CONNECTIVITY_TEST_SCANS_FORWARDING_RULE,
  RELATIONSHIP_TYPE_CONNECTIVITY_TEST_SCANS_CLOUD_FUNCTION,
  STEP_CONNECTIVITY_TEST_SCANS_CLOUD_FUNCTION,
  STEP_CONNECTIVITY_TEST_SCANS_CLOUD_SQL_INSTANCE,
  STEP_CONNECTIVITY_TEST_SCANS_COMPUTE_INSTANCE,
  STEP_CONNECTIVITY_TEST_SCANS_FORWARDING_RULE,
  STEP_NETWORK_ANALYZER_CONNECTIVITY_TEST,
  RELATIONSHIP_TYPE_CONNECTIVITY_TEST_SCANS_APP_ENGINE_VERSION,
  STEP_CONNECTIVITY_TEST_SCANS_APP_ENGINE_VERSION,
  STEP_CONNECTIVITY_TEST_SCANS_NETWORK,
  RELATIONSHIP_TYPE_CONNECTIVITY_TEST_SCANS_NETWORK,
} from './constants';
import {
  ENTITY_TYPE_COMPUTE_FORWARDING_RULE,
  ENTITY_TYPE_COMPUTE_INSTANCE,
  ENTITY_TYPE_COMPUTE_NETWORK,
  STEP_COMPUTE_FORWARDING_RULES,
  STEP_COMPUTE_INSTANCES,
  STEP_COMPUTE_NETWORKS,
} from '../compute';
import {
  SQL_ADMIN_MYSQL_INSTANCE_ENTITY_TYPE,
  STEP_SQL_ADMIN_INSTANCES,
} from '../sql-admin';
import { FunctionEntitiesSpec, FunctionStepsSpec } from '../functions';
import {
  ENTITY_TYPE_APP_ENGINE_VERSION,
  STEP_APP_ENGINE_VERSIONS,
} from '../app-engine/constants';

function throwErr(stepId: string, EntityName: string, Key: string) {
  throw new IntegrationMissingKeyError(`
        Error: Entity Key Missing.
        StepId: ${stepId}
        Entity: ${EntityName}
        Key: ${Key}
    `);
}

export async function buildConnectivityTestScansComputeInstanceRelationship(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState } = context;

  await jobState.iterateEntities(
    { _type: NETWORK_ANALYZER_CONNECTIVITY_TEST_TYPE },
    async (connTest) => {
      const instances: string[] = [
        connTest.srcInstance as string,
        connTest.dstInstance as string,
      ];

      for (let i = 0; i < instances.length; i = i + 1) {
        if (instances[i]) {
          const instanceKey =
            'https://www.googleapis.com/compute/v1/' + instances[i];
          if (!jobState.hasKey(instanceKey)) {
            throwErr(
              STEP_CONNECTIVITY_TEST_SCANS_COMPUTE_INSTANCE, // Step Id
              'Compute Instance', // Entity Name
              instanceKey, // Missing Key
            );
          }

          await jobState.addRelationship(
            createDirectRelationship({
              _class: RelationshipClass.SCANS,
              fromKey: connTest._key,
              fromType: NETWORK_ANALYZER_CONNECTIVITY_TEST_TYPE,
              toKey: instanceKey,
              toType: ENTITY_TYPE_COMPUTE_INSTANCE,
            }),
          );
        }
      }
    },
  );
}

export async function buildConnectivityTestScansForwardingRuleRelationship(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState } = context;

  await jobState.iterateEntities(
    { _type: NETWORK_ANALYZER_CONNECTIVITY_TEST_TYPE },
    async (connTest) => {
      const forwardingRules: string[] = [
        connTest.srcForwardingRule as string,
        connTest.dstForwardingRule as string,
      ];

      for (let i = 0; i < forwardingRules.length; i = i + 1) {
        if (forwardingRules[i]) {
          const forwardingRuleKey =
            'https://www.googleapis.com/compute/v1/' + forwardingRules[i];
          if (!jobState.hasKey(forwardingRuleKey)) {
            throwErr(
              STEP_CONNECTIVITY_TEST_SCANS_FORWARDING_RULE, // Step Id
              'Compute Forwarding Rule', // Entity Name
              forwardingRuleKey, // Missing Key
            );
          }

          await jobState.addRelationship(
            createDirectRelationship({
              _class: RelationshipClass.SCANS,
              fromKey: connTest._key,
              fromType: NETWORK_ANALYZER_CONNECTIVITY_TEST_TYPE,
              toKey: forwardingRuleKey,
              toType: ENTITY_TYPE_COMPUTE_FORWARDING_RULE,
            }),
          );
        }
      }
    },
  );
}

export async function buildConnectivityTestScansCloudSqlInstanceRelationship(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState } = context;

  await jobState.iterateEntities(
    { _type: NETWORK_ANALYZER_CONNECTIVITY_TEST_TYPE },
    async (connTest) => {
      const cloudSqlInstances: string[] = [
        connTest.srcCloudSqlInstance as string,
        connTest.dstCloudSqlInstance as string,
      ];

      for (let i = 0; i < cloudSqlInstances.length; i = i + 1) {
        if (cloudSqlInstances[i]) {
          const cloudSqlInstanceKey =
            'https://sqladmin.googleapis.com/sql/v1beta4/' +
            cloudSqlInstances[i];
          if (!jobState.hasKey(cloudSqlInstanceKey)) {
            throwErr(
              STEP_CONNECTIVITY_TEST_SCANS_CLOUD_SQL_INSTANCE, // Step Id
              'Cloud Sql Instance', // Entity Name
              cloudSqlInstanceKey, // Missing Key
            );
          }

          await jobState.addRelationship(
            createDirectRelationship({
              _class: RelationshipClass.SCANS,
              fromKey: connTest._key,
              fromType: NETWORK_ANALYZER_CONNECTIVITY_TEST_TYPE,
              toKey: cloudSqlInstanceKey,
              toType: SQL_ADMIN_MYSQL_INSTANCE_ENTITY_TYPE,
            }),
          );
        }
      }
    },
  );
}

export async function buildConnectivityTestScansCloudFunctionRelationship(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState } = context;

  await jobState.iterateEntities(
    { _type: NETWORK_ANALYZER_CONNECTIVITY_TEST_TYPE },
    async (connTest) => {
      const cloudFunctions: string[] = [
        connTest.srcCloudFunction as string,
        connTest.dstCloudFunction as string,
      ];

      for (let i = 0; i < cloudFunctions.length; i = i + 1) {
        if (cloudFunctions[i]) {
          const cloudFunctionKey = cloudFunctions[i];
          if (!jobState.hasKey(cloudFunctionKey)) {
            throwErr(
              STEP_CONNECTIVITY_TEST_SCANS_CLOUD_FUNCTION, // Step Id
              'Cloud Function', // Entity Name
              cloudFunctionKey, // Missing Key
            );
          }

          await jobState.addRelationship(
            createDirectRelationship({
              _class: RelationshipClass.SCANS,
              fromKey: connTest._key,
              fromType: NETWORK_ANALYZER_CONNECTIVITY_TEST_TYPE,
              toKey: cloudFunctionKey,
              toType: FunctionEntitiesSpec.CLOUD_FUNCTION._type,
            }),
          );
        }
      }
    },
  );
}

export async function buildConnectivityTestScansAppEngineVersionRelationship(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState } = context;

  await jobState.iterateEntities(
    { _type: NETWORK_ANALYZER_CONNECTIVITY_TEST_TYPE },
    async (connTest) => {
      const appEngineVersions: string[] = [
        connTest.dstAppEngineVersion as string,
        connTest.srcAppEngineVersion as string,
      ];

      for (let i = 0; i < appEngineVersions.length; i = i + 1) {
        if (appEngineVersions[i]) {
          const appEngineVersionKey = appEngineVersions[i];
          if (!jobState.hasKey(appEngineVersionKey)) {
            throwErr(
              STEP_CONNECTIVITY_TEST_SCANS_APP_ENGINE_VERSION, // Step Id
              'App Engine Version', // Entity Name
              appEngineVersionKey, // Missing Key
            );
          }

          await jobState.addRelationship(
            createDirectRelationship({
              _class: RelationshipClass.SCANS,
              fromKey: connTest._key,
              fromType: NETWORK_ANALYZER_CONNECTIVITY_TEST_TYPE,
              toKey: appEngineVersionKey,
              toType: ENTITY_TYPE_APP_ENGINE_VERSION,
            }),
          );
        }
      }
    },
  );
}

export async function buildConnectivityTestScansNetworkRelationship(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState } = context;

  await jobState.iterateEntities(
    { _type: NETWORK_ANALYZER_CONNECTIVITY_TEST_TYPE },
    async (connTest) => {
      const networks: string[] = [
        connTest.dstNetwork as string,
        connTest.srcNetwork as string,
      ];

      for (let i = 0; i < networks.length; i = i + 1) {
        if (networks[i]) {
          const networkKey =
            'https://www.googleapis.com/compute/v1/' + networks[i];
          if (!jobState.hasKey(networkKey)) {
            throwErr(
              STEP_CONNECTIVITY_TEST_SCANS_NETWORK, // Step Id
              'Network Key', // Entity Name
              networkKey, // Missing Key
            );
          }

          if (!jobState.hasKey(`${connTest._key}|scans|${networkKey}`))
            await jobState.addRelationship(
              createDirectRelationship({
                _class: RelationshipClass.SCANS,
                fromKey: connTest._key,
                fromType: NETWORK_ANALYZER_CONNECTIVITY_TEST_TYPE,
                toKey: networkKey,
                toType: ENTITY_TYPE_COMPUTE_NETWORK,
              }),
            );
        }
      }
    },
  );
}

export const buildConnectivityTestScansEndpointsRelationship: GoogleCloudIntegrationStep[] =
  [
    {
      id: STEP_CONNECTIVITY_TEST_SCANS_COMPUTE_INSTANCE,
      ingestionSourceId:
        IngestionSources.CONNECTIVITY_TEST_SCANS_COMPUTE_INSTANCE_RELATIONSHIP,
      name: 'Connectivity Test Scans Compute Instance Relationship',
      entities: [],
      relationships: [
        {
          _class: RelationshipClass.SCANS,
          _type: RELATIONSHIP_TYPE_CONNECTIVITY_TEST_SCANS_COMPUTE_INSTANCE,
          sourceType: NETWORK_ANALYZER_CONNECTIVITY_TEST_TYPE,
          targetType: ENTITY_TYPE_COMPUTE_INSTANCE,
        },
      ],
      dependsOn: [
        STEP_COMPUTE_INSTANCES,
        STEP_NETWORK_ANALYZER_CONNECTIVITY_TEST,
      ],
      executionHandler: buildConnectivityTestScansComputeInstanceRelationship,
    },
    {
      id: STEP_CONNECTIVITY_TEST_SCANS_FORWARDING_RULE,
      ingestionSourceId:
        IngestionSources.CONNECTIVITY_TEST_SCANS_FORWARDING_RULE_RELATIONSHIP,
      name: 'Connectivity Test Scans Forwarding Rule Relationship',
      entities: [],
      relationships: [
        {
          _class: RelationshipClass.SCANS,
          _type: RELATIONSHIP_TYPE_CONNECTIVITY_TEST_SCANS_FORWARDING_RULE,
          sourceType: NETWORK_ANALYZER_CONNECTIVITY_TEST_TYPE,
          targetType: ENTITY_TYPE_COMPUTE_FORWARDING_RULE,
        },
      ],
      dependsOn: [
        STEP_NETWORK_ANALYZER_CONNECTIVITY_TEST,
        STEP_COMPUTE_FORWARDING_RULES,
      ],
      executionHandler: buildConnectivityTestScansForwardingRuleRelationship,
    },
    {
      id: STEP_CONNECTIVITY_TEST_SCANS_CLOUD_SQL_INSTANCE,
      ingestionSourceId:
        IngestionSources.CONNECTIVITY_TEST_SCANS_CLOUD_SQL_INSTANCE_RELATIONSHIP,
      name: 'Connectivity Test Scans Cloud Sql Instance Relationship',
      entities: [],
      relationships: [
        {
          _class: RelationshipClass.SCANS,
          _type: RELATIONSHIP_TYPE_CONNECTIVITY_TEST_SCANS_CLOUD_SQL_INSTANCE,
          sourceType: NETWORK_ANALYZER_CONNECTIVITY_TEST_TYPE,
          targetType: SQL_ADMIN_MYSQL_INSTANCE_ENTITY_TYPE,
        },
      ],
      dependsOn: [
        STEP_NETWORK_ANALYZER_CONNECTIVITY_TEST,
        STEP_SQL_ADMIN_INSTANCES,
      ],
      executionHandler: buildConnectivityTestScansCloudSqlInstanceRelationship,
    },
    {
      id: STEP_CONNECTIVITY_TEST_SCANS_CLOUD_FUNCTION,
      ingestionSourceId:
        IngestionSources.CONNECTIVITY_TEST_SCANS_CLOUD_FUNCTION_RELATIONSHIP,
      name: 'Connectivity Test Scans Cloud Function Relationship',
      entities: [],
      relationships: [
        {
          _class: RelationshipClass.SCANS,
          _type: RELATIONSHIP_TYPE_CONNECTIVITY_TEST_SCANS_CLOUD_FUNCTION,
          sourceType: NETWORK_ANALYZER_CONNECTIVITY_TEST_TYPE,
          targetType: FunctionEntitiesSpec.CLOUD_FUNCTION._type,
        },
      ],
      dependsOn: [
        STEP_NETWORK_ANALYZER_CONNECTIVITY_TEST,
        FunctionStepsSpec.FETCH_CLOUD_FUNCTIONS.id,
      ],
      executionHandler: buildConnectivityTestScansCloudFunctionRelationship,
    },
    {
      id: STEP_CONNECTIVITY_TEST_SCANS_APP_ENGINE_VERSION,
      ingestionSourceId:
        IngestionSources.CONNECTIVITY_TEST_SCANS_APP_ENGINE_VERSION_RELATIONSHIP,
      name: 'Connectivity Test Scans App Engine Version Relationship',
      entities: [],
      relationships: [
        {
          _class: RelationshipClass.SCANS,
          _type: RELATIONSHIP_TYPE_CONNECTIVITY_TEST_SCANS_APP_ENGINE_VERSION,
          sourceType: NETWORK_ANALYZER_CONNECTIVITY_TEST_TYPE,
          targetType: ENTITY_TYPE_APP_ENGINE_VERSION,
        },
      ],
      dependsOn: [
        STEP_NETWORK_ANALYZER_CONNECTIVITY_TEST,
        STEP_APP_ENGINE_VERSIONS,
      ],
      executionHandler: buildConnectivityTestScansAppEngineVersionRelationship,
    },
    {
      id: STEP_CONNECTIVITY_TEST_SCANS_NETWORK,
      ingestionSourceId:
        IngestionSources.CONNECTIVITY_TEST_SCANS_NETWORK_RELATIONSHIP,
      name: 'Connectivity Test Scans Network Relationship',
      entities: [],
      relationships: [
        {
          _class: RelationshipClass.SCANS,
          _type: RELATIONSHIP_TYPE_CONNECTIVITY_TEST_SCANS_NETWORK,
          sourceType: NETWORK_ANALYZER_CONNECTIVITY_TEST_TYPE,
          targetType: ENTITY_TYPE_COMPUTE_NETWORK,
        },
      ],
      dependsOn: [
        STEP_NETWORK_ANALYZER_CONNECTIVITY_TEST,
        STEP_COMPUTE_NETWORKS,
      ],
      executionHandler: buildConnectivityTestScansNetworkRelationship,
    },
  ];
