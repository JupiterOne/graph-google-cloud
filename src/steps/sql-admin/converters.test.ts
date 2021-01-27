import {
  createMySQLInstanceEntity,
  createPostgresInstanceEntity,
  createSQLServerInstanceEntity,
} from './converters';

import { getMockSQLInstance } from '../../../test/mocks';

describe('#createMySQLInstanceEntity', () => {
  test('should convert to entity', () => {
    expect(
      createMySQLInstanceEntity(
        getMockSQLInstance({
          databaseVersion: 'MYSQL_5_7',
          backendType: 'SECOND_GEN',
        }),
      ),
    ).toMatchSnapshot();
  });

  test('should convert to entity with localInfile param set to off', () => {
    expect(
      createMySQLInstanceEntity(
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
      createMySQLInstanceEntity(
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

describe('#createPostgresInstanceEntity', () => {
  test('should convert to entity', () => {
    expect(
      createPostgresInstanceEntity(
        getMockSQLInstance({
          databaseVersion: 'POSTGRES_12',
          backendType: 'SECOND_GEN',
        }),
      ),
    ).toMatchSnapshot();
  });

  test('should convert to entity with logCheckpoints param set to off', () => {
    expect(
      createPostgresInstanceEntity(
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

describe('#createSQLServerInstanceEntity', () => {
  test('should convert to entity', () => {
    expect(
      createSQLServerInstanceEntity(
        getMockSQLInstance({
          databaseVersion: 'SQLSERVER_2017_STANDARD',
          backendType: 'SECOND_GEN',
        }),
      ),
    ).toMatchSnapshot();
  });

  test('should convert to entity with crossDbOwnershipChaining param set to on', () => {
    expect(
      createSQLServerInstanceEntity(
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
