import { createMockStepExecutionContext } from '@jupiterone/integration-sdk-testing';
import { fetchCloudSQLInstances } from '.';
import { integrationConfig } from '../../../test/config';
import { Recording, setupGoogleCloudRecording } from '../../../test/recording';
import { IntegrationConfig } from '../../types';
import { fetchResourceManagerProject } from '../resource-manager';

import {
  CLOUD_SQL_ADMIN_MYSQL_INSTANCE_ENTITY_TYPE,
  CLOUD_SQL_ADMIN_POSTGRES_INSTANCE_ENTITY_TYPE,
  CLOUD_SQL_ADMIN_SQL_SERVER_INSTANCE_ENTITY_TYPE,
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

    const customConfig = { ...integrationConfig, serviceAccountKeyConfig: { ...integrationConfig.serviceAccountKeyConfig, project_id: 'j1-gc-integration-dev-300716' }}
    const context = createMockStepExecutionContext<IntegrationConfig>({
      instanceConfig: customConfig,
    });

    await fetchResourceManagerProject(context);
    await fetchCloudSQLInstances(context);

    expect({
      numCollectedEntities: context.jobState.collectedEntities.length,
      numCollectedRelationships: context.jobState.collectedRelationships.length,
      collectedEntities: context.jobState.collectedEntities,
      collectedRelationships: context.jobState.collectedRelationships,
      encounteredTypes: context.jobState.encounteredTypes,
    }).toMatchSnapshot();

    expect(
      context.jobState.collectedEntities.filter(
        (e) => e._type === CLOUD_SQL_ADMIN_MYSQL_INSTANCE_ENTITY_TYPE,
      ),
    ).toMatchGraphObjectSchema({
      _class: ['Database'],
      schema: {
        additionalProperties: false,
        properties: {
          _type: { const: 'google_cloud_sql_mysql_instance' },
          _rawData: {
            type: 'array',
            items: { type: 'object' },
          },
          name: { type: 'string' },
          type: { type: 'string' },
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
        },
      },
    });

    expect(
      context.jobState.collectedEntities.filter(
        (e) => e._type === CLOUD_SQL_ADMIN_POSTGRES_INSTANCE_ENTITY_TYPE,
      ),
    ).toMatchGraphObjectSchema({
      _class: ['Database'],
      schema: {
        additionalProperties: false,
        properties: {
          _type: { const: 'google_cloud_sql_postgres_instance' },
          _rawData: {
            type: 'array',
            items: { type: 'object' },
          },
          name: { type: 'string' },
          type: { type: 'string' },
          location: { type: 'string' },
          displayName: { type: 'string' },
          logCheckpoints: { type: 'string' },
          logConnections: { type: 'string' },
          logDisconnections: { type: 'string' },
          logLockWaits: { type: 'string' },
          logMinErrorStatement: { type: 'string' },
          logTempFiles: { type: 'string' },
          logMinDurationStatement: { type: 'string' },
          requireSSL: { type: 'boolean' },
          authorizedNetworks: {
            type: 'array',
            items: { type: 'string' },
          },
          hasPublicIP: { type: 'boolean' },
          automatedBackupsEnabled: { type: 'boolean' },
        },
      },
    });

    expect(
      context.jobState.collectedEntities.filter(
        (e) => e._type === CLOUD_SQL_ADMIN_SQL_SERVER_INSTANCE_ENTITY_TYPE,
      ),
    ).toMatchGraphObjectSchema({
      _class: ['Database'],
      schema: {
        additionalProperties: false,
        properties: {
          _type: { const: 'google_cloud_sql_sql_server_instance' },
          _rawData: {
            type: 'array',
            items: { type: 'object' },
          },
          name: { type: 'string' },
          type: { type: 'string' },
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
        },
      },
    });
  });
});
