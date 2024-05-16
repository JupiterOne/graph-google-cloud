import {
    getMockCloudSqlBackupEntity,
    getMockCloudSqlConnectionEntity,
    getMockCloudSqlDatabaseEntity,
    getMockCloudSqlInstancesEntity,
    getMockCloudSslCertificationEntity,
    getMockCloudUserEntity,
} from '../../../test/mocks';
import {
    createCloudSqlBackupEntity,
    createCloudSqlInstancesEntity,
    createCloudSqlConnectionEntity,
    createCloudSqlDatabaseEntity,
    createCloudSslCertificationEntity,
    createCloudUserEntity
} from './converters';

describe('#createCloudSqlBackupEntity', () => {
    test('should convert to entity', () => {
        expect(
            createCloudSqlBackupEntity(
                getMockCloudSqlBackupEntity(),
            ),
        ).toMatchSnapshot();
    });
});

describe('#createCloudSqlInstancesEntity', () => {
    test('should convert to entity', () => {
        expect(
            createCloudSqlInstancesEntity(
                getMockCloudSqlInstancesEntity(),
            ),
        ).toMatchSnapshot();
    });
});

describe('#createCloudSqlConnectionEntity', () => {
    test('should convert to entity', () => {
        expect(
            createCloudSqlConnectionEntity(
                getMockCloudSqlConnectionEntity(),
            ),
        ).toMatchSnapshot();
    });
});


describe('#createCloudSqlDatabaseEntity', () => {
    test('should convert to entity', () => {
        expect(
            createCloudSqlDatabaseEntity(
                getMockCloudSqlDatabaseEntity(),
            ),
        ).toMatchSnapshot();
    });
});

describe('#createCloudSslCertificationEntity', () => {
    test('should convert to entity', () => {
        expect(
            createCloudSslCertificationEntity(
                getMockCloudSslCertificationEntity(),
            ),
        ).toMatchSnapshot();
    });
});

describe('#createCloudUserEntity', () => {
    test('should convert to entity', () => {
        expect(
            createCloudUserEntity(
                getMockCloudUserEntity(),
            ),
        ).toMatchSnapshot();
    });
});