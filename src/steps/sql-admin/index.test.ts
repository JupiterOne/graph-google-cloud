import { createMockStepExecutionContext } from '@jupiterone/integration-sdk-testing';
import { fetchSQLAdminInstances } from '.';
import { integrationConfig } from '../../../test/config';
import { separateDirectMappedRelationships } from '../../../test/helpers/separateDirectMappedRelationships';
import { Recording, setupGoogleCloudRecording } from '../../../test/recording';
import { IntegrationConfig } from '../../types';
import { fetchKmsCryptoKeys, fetchKmsKeyRings } from '../kms';
import { fetchResourceManagerProject } from '../resource-manager';

import {
  DATABASE_TYPE,
  SQL_ADMIN_INSTANCE_ENTITY_TYPE,
  SQL_INSTANCE_USES_KMS_KEY_RELATIONSHIP_TYPE,
} from './constants';

describe('#fetchSQLInstances', () => {
  let recording: Recording;

  beforeEach(() => {
    recording = setupGoogleCloudRecording({
      directory: __dirname,
      name: 'fetchSQLInstances',
    });
  });

  afterEach(async () => {
    await recording.stop();
  });

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

    await fetchResourceManagerProject(context);
    await fetchSQLAdminInstances(context);

    expect({
      numCollectedEntities: context.jobState.collectedEntities.length,
      numCollectedRelationships: context.jobState.collectedRelationships.length,
      collectedEntities: context.jobState.collectedEntities,
      collectedRelationships: context.jobState.collectedRelationships,
      encounteredTypes: context.jobState.encounteredTypes,
    }).toMatchSnapshot();

    expect(
      context.jobState.collectedEntities.filter(
        (e) => e.database === DATABASE_TYPE.MYSQL,
      ),
    ).toMatchGraphObjectSchema({
      _class: ['Database'],
      schema: {
        additionalProperties: false,
        properties: {
          _type: { const: SQL_ADMIN_INSTANCE_ENTITY_TYPE },
          _rawData: {
            type: 'array',
            items: { type: 'object' },
          },
          name: { type: 'string' },
          encrypted: { type: 'boolean' },
          location: { type: 'string' },
          displayName: { type: 'string' },
          database: { type: 'string' },
          databaseVersion: { type: 'string' },
          localInfile: { type: 'string' },
          requireSSL: { type: 'boolean' },
          authorizedNetworks: {
            type: 'array',
            items: { type: 'string' },
          },
          hasPublicIP: { type: 'boolean' },
          automatedBackupsEnabled: { type: 'boolean' },
          kmsKeyName: { type: 'string' },
          connectionName: { type: 'string' },
          skipShowDatabase: { type: 'string' },
        },
      },
    });

    expect(
      context.jobState.collectedEntities.filter(
        (e) => e.database === DATABASE_TYPE.POSTGRES,
      ),
    ).toMatchGraphObjectSchema({
      _class: ['Database'],
      schema: {
        additionalProperties: false,
        properties: {
          _type: { const: SQL_ADMIN_INSTANCE_ENTITY_TYPE },
          _rawData: {
            type: 'array',
            items: { type: 'object' },
          },
          name: { type: 'string' },
          encrypted: { type: 'boolean' },
          location: { type: 'string' },
          displayName: { type: 'string' },
          database: { type: 'string' },
          databaseVersion: { type: 'string' },
          logCheckpoints: { type: 'string' },
          logConnections: { type: 'string' },
          logDisconnections: { type: 'string' },
          logLockWaits: { type: 'string' },
          logMinMessages: { type: 'string' },
          logMinErrorStatement: { type: 'string' },
          logTempFiles: { type: 'string' },
          logMinDurationStatement: { type: 'string' },
          logDuration: { type: 'string' },
          logErrorVerbosity: { type: 'string' },
          logStatement: { type: 'string' },
          logHostname: { type: 'string' },
          logParserStats: { type: 'string' },
          logPlannerStats: { type: 'string' },
          logExecutorStats: { type: 'string' },
          logStatementStats: { type: 'string' },
          requireSSL: { type: 'boolean' },
          authorizedNetworks: {
            type: 'array',
            items: { type: 'string' },
          },
          hasPublicIP: { type: 'boolean' },
          automatedBackupsEnabled: { type: 'boolean' },
          kmsKeyName: { type: 'string' },
          connectionName: { type: 'string' },
        },
      },
    });

    expect(
      context.jobState.collectedEntities.filter(
        (e) => e.database === DATABASE_TYPE.SQL_SERVER,
      ),
    ).toMatchGraphObjectSchema({
      _class: ['Database'],
      schema: {
        additionalProperties: false,
        properties: {
          _type: { const: SQL_ADMIN_INSTANCE_ENTITY_TYPE },
          _rawData: {
            type: 'array',
            items: { type: 'object' },
          },
          name: { type: 'string' },
          encrypted: { type: 'boolean' },
          location: { type: 'string' },
          displayName: { type: 'string' },
          database: { type: 'string' },
          databaseVersion: { type: 'string' },
          crossDatabaseOwnershipChaining: { type: 'string' },
          containedDatabaseAuthentication: { type: 'string' },
          requireSSL: { type: 'boolean' },
          authorizedNetworks: {
            type: 'array',
            items: { type: 'string' },
          },
          hasPublicIP: { type: 'boolean' },
          automatedBackupsEnabled: { type: 'boolean' },
          kmsKeyName: { type: 'string' },
          connectionName: { type: 'string' },
          externalScriptsEnabled: { type: 'string' },
          userConnections: { type: 'number' },
          userOptions: { type: 'number' },
          remoteAccess: { type: 'string' },
          traceFlag: { type: 'string' },
        },
      },
    });
  });
});

describe('#fetchSQLInstances encrypted', () => {
  let recording: Recording;

  beforeEach(() => {
    recording = setupGoogleCloudRecording({
      directory: __dirname,
      name: 'fetchSQLInstances-encrypted',
    });
  });

  afterEach(async () => {
    await recording.stop();
  });

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

    await fetchKmsKeyRings(context);
    await fetchKmsCryptoKeys(context);
    await fetchResourceManagerProject(context);
    await fetchSQLAdminInstances(context);

    expect({
      numCollectedEntities: context.jobState.collectedEntities.length,
      numCollectedRelationships: context.jobState.collectedRelationships.length,
      collectedEntities: context.jobState.collectedEntities,
      collectedRelationships: context.jobState.collectedRelationships,
      encounteredTypes: context.jobState.encounteredTypes,
    }).toMatchSnapshot();

    expect(
      context.jobState.collectedEntities.filter(
        (e) => e.database === DATABASE_TYPE.MYSQL,
      ),
    ).toMatchGraphObjectSchema({
      _class: ['Database'],
      schema: {
        additionalProperties: false,
        properties: {
          _type: { const: SQL_ADMIN_INSTANCE_ENTITY_TYPE },
          _rawData: {
            type: 'array',
            items: { type: 'object' },
          },
          name: { type: 'string' },
          encrypted: { type: 'boolean' },
          location: { type: 'string' },
          displayName: { type: 'string' },
          database: { type: 'string' },
          databaseVersion: { type: 'string' },
          localInfile: { type: 'string' },
          requireSSL: { type: 'boolean' },
          authorizedNetworks: {
            type: 'array',
            items: { type: 'string' },
          },
          hasPublicIP: { type: 'boolean' },
          automatedBackupsEnabled: { type: 'boolean' },
          kmsKeyName: { type: 'string' },
          connectionName: { type: 'string' },
          skipShowDatabase: { type: 'string' },
        },
      },
    });

    expect(
      context.jobState.collectedEntities.filter(
        (e) => e.database === DATABASE_TYPE.POSTGRES,
      ),
    ).toMatchGraphObjectSchema({
      _class: ['Database'],
      schema: {
        additionalProperties: false,
        properties: {
          _type: { const: SQL_ADMIN_INSTANCE_ENTITY_TYPE },
          _rawData: {
            type: 'array',
            items: { type: 'object' },
          },
          name: { type: 'string' },
          encrypted: { type: 'boolean' },
          location: { type: 'string' },
          displayName: { type: 'string' },
          database: { type: 'string' },
          databaseVersion: { type: 'string' },
          logCheckpoints: { type: 'string' },
          logConnections: { type: 'string' },
          logDisconnections: { type: 'string' },
          logLockWaits: { type: 'string' },
          logMinMessages: { type: 'string' },
          logMinErrorStatement: { type: 'string' },
          logTempFiles: { type: 'string' },
          logMinDurationStatement: { type: 'string' },
          logDuration: { type: 'string' },
          logErrorVerbosity: { type: 'string' },
          logStatement: { type: 'string' },
          logHostname: { type: 'string' },
          logParserStats: { type: 'string' },
          logPlannerStats: { type: 'string' },
          logExecutorStats: { type: 'string' },
          logStatementStats: { type: 'string' },
          requireSSL: { type: 'boolean' },
          authorizedNetworks: {
            type: 'array',
            items: { type: 'string' },
          },
          hasPublicIP: { type: 'boolean' },
          automatedBackupsEnabled: { type: 'boolean' },
          kmsKeyName: { type: 'string' },
          connectionName: { type: 'string' },
        },
      },
    });

    expect(
      context.jobState.collectedEntities.filter(
        (e) => e.database === DATABASE_TYPE.SQL_SERVER,
      ),
    ).toMatchGraphObjectSchema({
      _class: ['Database'],
      schema: {
        additionalProperties: false,
        properties: {
          _type: { const: SQL_ADMIN_INSTANCE_ENTITY_TYPE },
          _rawData: {
            type: 'array',
            items: { type: 'object' },
          },
          name: { type: 'string' },
          encrypted: { type: 'boolean' },
          location: { type: 'string' },
          displayName: { type: 'string' },
          database: { type: 'string' },
          databaseVersion: { type: 'string' },
          crossDatabaseOwnershipChaining: { type: 'string' },
          containedDatabaseAuthentication: { type: 'string' },
          requireSSL: { type: 'boolean' },
          authorizedNetworks: {
            type: 'array',
            items: { type: 'string' },
          },
          hasPublicIP: { type: 'boolean' },
          automatedBackupsEnabled: { type: 'boolean' },
          kmsKeyName: { type: 'string' },
          connectionName: { type: 'string' },
          externalScriptsEnabled: { type: 'string' },
          userConnections: { type: 'number' },
          userOptions: { type: 'number' },
          remoteAccess: { type: 'string' },
          traceFlag: { type: 'string' },
        },
      },
    });

    const { directRelationships, mappedRelationships } =
      separateDirectMappedRelationships(
        context.jobState.collectedRelationships,
      );

    const postgresInstanceUsesKmsKeyRelationships = directRelationships.filter(
      (r) => r._type === SQL_INSTANCE_USES_KMS_KEY_RELATIONSHIP_TYPE,
    );

    expect(postgresInstanceUsesKmsKeyRelationships.length).toBeGreaterThan(0);

    expect(postgresInstanceUsesKmsKeyRelationships).toEqual(
      postgresInstanceUsesKmsKeyRelationships.map((r) =>
        expect.objectContaining({
          _class: 'USES',
        }),
      ),
    );

    expect(mappedRelationships.length).toBeGreaterThan(0);

    expect(
      mappedRelationships
        .filter(
          (e) =>
            e._mapping.sourceEntityKey ===
            'https://www.googleapis.com/sql/v1beta4/projects/j1-gc-integration-dev-v3/instances/sample-mysql-foreign-key',
        )
        .every(
          (mappedRelationship) =>
            mappedRelationship._key ===
            'https://www.googleapis.com/sql/v1beta4/projects/j1-gc-integration-dev-v3/instances/sample-mysql-foreign-key|uses|projects/vmware-account/locations/us-central1/keyRings/test-key-ring-us-central-1/cryptoKeys/test-key-us-central-1',
        ),
    ).toBe(true);
  });
});
