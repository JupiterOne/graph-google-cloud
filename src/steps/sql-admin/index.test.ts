jest.setTimeout(60000);

import { createMockStepExecutionContext } from '@jupiterone/integration-sdk-testing';
import { fetchSQLAdminInstances } from '.';
import { integrationConfig } from '../../../test/config';
import { Recording, setupGoogleCloudRecording } from '../../../test/recording';
import { IntegrationConfig } from '../../types';
import { fetchKmsCryptoKeys, fetchKmsKeyRings } from '../kms';
import { fetchResourceManagerProject } from '../resource-manager';

import {
  SQL_ADMIN_MYSQL_INSTANCE_ENTITY_TYPE,
  SQL_ADMIN_POSTGRES_INSTANCE_ENTITY_TYPE,
  SQL_ADMIN_SQL_SERVER_INSTANCE_ENTITY_TYPE,
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
        (e) => e._type === SQL_ADMIN_MYSQL_INSTANCE_ENTITY_TYPE,
      ),
    ).toMatchGraphObjectSchema({
      _class: ['Database'],
      schema: {
        additionalProperties: false,
        properties: {
          _type: { const: 'google_sql_mysql_instance' },
          _rawData: {
            type: 'array',
            items: { type: 'object' },
          },
          name: { type: 'string' },
          encrypted: { type: 'boolean' },
          location: { type: 'string' },
          displayName: { type: 'string' },
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
        (e) => e._type === SQL_ADMIN_POSTGRES_INSTANCE_ENTITY_TYPE,
      ),
    ).toMatchGraphObjectSchema({
      _class: ['Database'],
      schema: {
        additionalProperties: false,
        properties: {
          _type: { const: 'google_sql_postgres_instance' },
          _rawData: {
            type: 'array',
            items: { type: 'object' },
          },
          name: { type: 'string' },
          encrypted: { type: 'boolean' },
          location: { type: 'string' },
          displayName: { type: 'string' },
          logCheckpoints: { type: 'string' },
          logConnections: { type: 'string' },
          logDisconnections: { type: 'string' },
          logLockWaits: { type: 'string' },
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
        (e) => e._type === SQL_ADMIN_SQL_SERVER_INSTANCE_ENTITY_TYPE,
      ),
    ).toMatchGraphObjectSchema({
      _class: ['Database'],
      schema: {
        additionalProperties: false,
        properties: {
          _type: { const: 'google_sql_sql_server_instance' },
          _rawData: {
            type: 'array',
            items: { type: 'object' },
          },
          name: { type: 'string' },
          encrypted: { type: 'boolean' },
          location: { type: 'string' },
          displayName: { type: 'string' },
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
        (e) => e._type === SQL_ADMIN_MYSQL_INSTANCE_ENTITY_TYPE,
      ),
    ).toMatchGraphObjectSchema({
      _class: ['Database'],
      schema: {
        additionalProperties: false,
        properties: {
          _type: { const: 'google_sql_mysql_instance' },
          _rawData: {
            type: 'array',
            items: { type: 'object' },
          },
          name: { type: 'string' },
          encrypted: { type: 'boolean' },
          location: { type: 'string' },
          displayName: { type: 'string' },
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
        (e) => e._type === SQL_ADMIN_POSTGRES_INSTANCE_ENTITY_TYPE,
      ),
    ).toMatchGraphObjectSchema({
      _class: ['Database'],
      schema: {
        additionalProperties: false,
        properties: {
          _type: { const: 'google_sql_postgres_instance' },
          _rawData: {
            type: 'array',
            items: { type: 'object' },
          },
          name: { type: 'string' },
          encrypted: { type: 'boolean' },
          location: { type: 'string' },
          displayName: { type: 'string' },
          logCheckpoints: { type: 'string' },
          logConnections: { type: 'string' },
          logDisconnections: { type: 'string' },
          logLockWaits: { type: 'string' },
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
        (e) => e._type === SQL_ADMIN_SQL_SERVER_INSTANCE_ENTITY_TYPE,
      ),
    ).toMatchGraphObjectSchema({
      _class: ['Database'],
      schema: {
        additionalProperties: false,
        properties: {
          _type: { const: 'google_sql_sql_server_instance' },
          _rawData: {
            type: 'array',
            items: { type: 'object' },
          },
          name: { type: 'string' },
          encrypted: { type: 'boolean' },
          location: { type: 'string' },
          displayName: { type: 'string' },
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
        },
      },
    });

    const postgresInstanceUsesKmsKeyRelationships =
      context.jobState.collectedRelationships.filter(
        (r) => r._type === 'google_sql_postgres_instance_uses_kms_crypto_key',
      );

    expect(postgresInstanceUsesKmsKeyRelationships.length).toBeGreaterThan(0);

    expect(postgresInstanceUsesKmsKeyRelationships).toEqual(
      postgresInstanceUsesKmsKeyRelationships.map((r) =>
        expect.objectContaining({
          _class: 'USES',
        }),
      ),
    );
  });
});
