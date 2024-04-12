import {
  createMockStepExecutionContext,
  filterGraphObjects,
  Recording,
} from '@jupiterone/integration-sdk-testing';
import { IntegrationConfig } from '../../..';
import { integrationConfig } from '../../../../test/config';
import { setupGoogleCloudRecording } from '../../../../test/recording';
import {
  ENTITY_CLASS_POSTGRE_SQL_CLUSTER,
  ENTITY_TYPE_POSTGRE_SQL_ALLOYDB_CLUSTER,
  RELATIONSHIP_TYPE_ALLOYDB_CLUSTER_USES_KMS_KEY,
  STEP_ALLOYDB_CLUSTER_HAS_BACKUP_RELATIONSHIP,
} from '../constants';
import {
  ExplicitRelationship,
  Relationship,
} from '@jupiterone/integration-sdk-core';
import { fetchAlloyDBPostgreSQLCluster } from './alloydb-postgre-sql-cluster';
import {
  ENTITY_CLASS_KMS_KEY,
  ENTITY_TYPE_KMS_KEY,
  fetchKmsCryptoKeys,
  fetchKmsKeyRings,
} from '../../kms';
import { buildAlloyDBClusterUseskmsKeyRelationship } from './build-alloydb-cluster-uses-ksm-key';

describe('Build AlloyDb Cluster Uses Kms Key Relationship', () => {
  let recording: Recording;

  beforeEach(() => {
    recording = setupGoogleCloudRecording({
      directory: __dirname,
      name: STEP_ALLOYDB_CLUSTER_HAS_BACKUP_RELATIONSHIP,
    });
  });

  afterEach(async () => {
    await recording.stop();
  });

  function separateRelationships(collectedRelationships: Relationship[]) {
    const { targets: directRelationships } = filterGraphObjects(
      collectedRelationships,
      (r) => !r._mapping,
    ) as {
      targets: ExplicitRelationship[];
    };
    return {
      directRelationships,
    };
  }

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

    await fetchAlloyDBPostgreSQLCluster(context);
    await fetchKmsKeyRings(context);
    await fetchKmsCryptoKeys(context);
    await buildAlloyDBClusterUseskmsKeyRelationship(context);

    expect({
      numCollectedEntities: context.jobState.collectedEntities.length,
      numCollectedRelationships: context.jobState.collectedRelationships.length,
      collectedEntities: context.jobState.collectedEntities,
      collectedRelationships: context.jobState.collectedRelationships,
      encounteredTypes: context.jobState.encounteredTypes,
    }).toMatchSnapshot();

    expect(
      context.jobState.collectedEntities.filter(
        (e) => e._type === ENTITY_TYPE_POSTGRE_SQL_ALLOYDB_CLUSTER,
      ),
    ).toMatchGraphObjectSchema({
      _class: ENTITY_CLASS_POSTGRE_SQL_CLUSTER,
      schema: {
        additionalProperties: false,
        properties: {
          _type: { const: ENTITY_TYPE_POSTGRE_SQL_ALLOYDB_CLUSTER },
          _rawData: {
            type: 'array',
            items: { type: 'object' },
          },
          name: { type: 'string' },
          uid: { type: 'string' },
          displayName: { type: 'string' },
          state: { type: 'string' },
          clusterType: { type: 'string' },
          databaseVersion: { type: 'string' },
          networkConfigNetwork: { type: 'string' },
          networkConfigallocatedIpRange: { type: 'string' },
          reconciling: { type: 'boolean' },
          initialUserName: { type: 'string' },
          initialUserPassword: { type: 'string' },
          encrypted: { type: 'boolean' },
          kmsKeyName: { type: 'string' },
          location: { type: 'string' },
          clusterName: { type: 'string' },
          classification: { type: 'string', const: 'Database' },
          hostname: { type: 'string' },
        },
      },
    });

    expect(
      context.jobState.collectedEntities.filter(
        (e) => e._type === ENTITY_TYPE_KMS_KEY,
      ),
    ).toMatchGraphObjectSchema({
      _class: ENTITY_CLASS_KMS_KEY,
      schema: {
        additionalProperties: false,
        properties: {
          _type: { const: ENTITY_TYPE_KMS_KEY },
          _rawData: {
            type: 'array',
            items: { type: 'object' },
          },
          name: { type: 'string' },
          displayName: { type: 'string' },
          createdOn: { type: 'number' },
          purpose: { type: 'string' },
          keyUsage: { type: 'string' },
          nextRotationTime: { type: 'number' },
          rotationPeriod: { type: 'number' },
          protectionLevel: { type: 'string' },
          algorithm: { type: 'string' },
          public: { type: 'boolean' },
          primaryName: { type: 'string' },
          primaryState: { type: 'string' },
          primaryCreateTime: { type: 'number' },
          primaryProtectionLevel: { type: 'string' },
          primaryAlgorithm: { type: 'string' },
          primaryGenerateTime: { type: 'number' },
          webLink: { type: 'string' },
        },
      },
    });

    const { directRelationships } = separateRelationships(
      context.jobState.collectedRelationships,
    );

    expect(
      directRelationships.filter(
        (e) => e._type === RELATIONSHIP_TYPE_ALLOYDB_CLUSTER_USES_KMS_KEY,
      ),
    ).toMatchDirectRelationshipSchema({
      schema: {
        properties: {
          _class: { const: 'USES' },
          _type: {
            const: RELATIONSHIP_TYPE_ALLOYDB_CLUSTER_USES_KMS_KEY,
          },
        },
      },
    });
  });
});
