import { sqladmin_v1beta4 } from 'googleapis';
import {
  createCloudMySQLInstanceEntity,
  createCloudPostgresInstanceEntity,
  createCloudSQLServerInstanceEntity,
} from './converters';

function getMockSQLInstance(
  partial?: Partial<sqladmin_v1beta4.Schema$DatabaseInstance>,
): sqladmin_v1beta4.Schema$DatabaseInstance {
  return {
    kind: 'sql#instance',
    state: 'RUNNABLE',
    settings: {
      authorizedGaeApplications: [],
      tier: 'db-custom-1-3840',
      kind: 'sql#settings',
      availabilityType: 'ZONAL',
      pricingPlan: 'PER_USE',
      activationPolicy: 'ALWAYS',
      ipConfiguration: {
        authorizedNetworks: [],
        ipv4Enabled: true,
      },
      locationPreference: {
        zone: 'europe-west3-b',
        kind: 'sql#locationPreference',
      },
      dataDiskType: 'PD_SSD',
      maintenanceWindow: {
        kind: 'sql#maintenanceWindow',
        hour: 0,
        day: 0,
      },
      backupConfiguration: {
        startTime: '06:00',
        kind: 'sql#backupConfiguration',
        location: 'eu',
        backupRetentionSettings: {
          retentionUnit: 'COUNT',
          retainedBackups: 7,
        },
        enabled: true,
        replicationLogArchivingEnabled: true,
        pointInTimeRecoveryEnabled: true,
        transactionLogRetentionDays: 7,
      },
      settingsVersion: '19',
      storageAutoResizeLimit: '0',
      storageAutoResize: true,
      dataDiskSizeGb: '10',
    },
    etag: '98de3deaeeca4420e21a891488c187b0b029235e2e0cb551fc00a388d1ac4f7d',
    ipAddresses: [],
    instanceType: 'CLOUD_SQL_INSTANCE',
    project: 'j1-gc-integration-dev-300716',
    serviceAccountEmailAddress:
      'p165882964161-x5ifig@gcp-sa-cloud-sql.iam.gserviceaccount.com',
    selfLink:
      'https://www.googleapis.com/sql/v1beta4/projects/j1-gc-integration-dev-300716/instances/cloud-sql-postgres',
    connectionName:
      'j1-gc-integration-dev-300716:europe-west3:cloud-sql-postgres',
    name: 'cloud-sql-postgres',
    region: 'europe-west3',
    gceZone: 'europe-west3-b',
    ...partial,
  };
}

describe('#createCloudMySQLInstanceEntity', () => {
  test('should convert to entity', () => {
    expect(
      createCloudMySQLInstanceEntity(
        getMockSQLInstance({
          databaseVersion: 'MYSQL_5_7',
          backendType: 'SECOND_GEN',
        }),
      ),
    ).toMatchSnapshot();
  });

  test('should convert to entity with localInfile param set to off', () => {
    expect(
      createCloudMySQLInstanceEntity(
        getMockSQLInstance({
          databaseVersion: 'MYSQL_5_7',
          backendType: 'SECOND_GEN',
          settings: {
            databaseFlags: [
              {
                name: 'local_infile',
                value: 'off',
              },
            ],
          },
        }),
      ),
    ).toMatchSnapshot();
  });

  test('should convert to entity with requireSSL param set to true', () => {
    expect(
      createCloudMySQLInstanceEntity(
        getMockSQLInstance({
          databaseVersion: 'MYSQL_5_7',
          backendType: 'SECOND_GEN',
          settings: {
            ipConfiguration: {
              requireSsl: true,
            },
          },
        }),
      ),
    ).toMatchSnapshot();
  });
});

describe('#createCloudPostgresInstanceEntity', () => {
  test('should convert to entity', () => {
    expect(
      createCloudPostgresInstanceEntity(
        getMockSQLInstance({
          databaseVersion: 'POSTGRES_12',
          backendType: 'SECOND_GEN',
        }),
      ),
    ).toMatchSnapshot();
  });

  test('should convert to entity with logCheckpoints param set to off', () => {
    expect(
      createCloudPostgresInstanceEntity(
        getMockSQLInstance({
          databaseVersion: 'POSTGRES_12',
          backendType: 'SECOND_GEN',
          settings: {
            databaseFlags: [
              {
                name: 'log_checkpoints',
                value: 'off',
              },
            ],
          },
        }),
      ),
    ).toMatchSnapshot();
  });
});

describe('#createCloudSQLServerInstanceEntity', () => {
  test('should convert to entity', () => {
    expect(
      createCloudSQLServerInstanceEntity(
        getMockSQLInstance({
          databaseVersion: 'SQLSERVER_2017_STANDARD',
          backendType: 'SECOND_GEN',
        }),
      ),
    ).toMatchSnapshot();
  });

  test('should convert to entity with crossDbOwnershipChaining param set to on', () => {
    expect(
      createCloudSQLServerInstanceEntity(
        getMockSQLInstance({
          databaseVersion: 'SQLSERVER_2017_STANDARD',
          backendType: 'SECOND_GEN',
          settings: {
            databaseFlags: [
              {
                name: 'cross db ownership chaining',
                value: 'on',
              },
            ],
          },
        }),
      ),
    ).toMatchSnapshot();
  });
});
