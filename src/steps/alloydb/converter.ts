import { alloydb_v1 } from 'googleapis';
import { createGoogleCloudIntegrationEntity } from '../../utils/entity';
import {
  ENTITY_CLASS_POSTGRE_SQL_BACKUP,
  ENTITY_CLASS_POSTGRE_SQL_CLUSTER,
  ENTITY_CLASS_POSTGRE_SQL_CONNECTION,
  ENTITY_CLASS_POSTGRE_SQL_INSTANCE,
  ENTITY_CLASS_ALLOYDB_POSTGRE_SQL_SERVICE,
  ENTITY_TYPE_POSTGRE_SQL_BACKUP,
  ENTITY_TYPE_POSTGRE_SQL_ALLOYDB_CLUSTER,
  ENTITY_TYPE_POSTGRE_SQL_CONNECTION,
  ENTITY_TYPE_POSTGRE_SQL_ALLOYDB_INSTANCE,
  ENTITY_TYPE_ALLOYDB_POSTGRE_SQL_SERVICE,
} from './constants';

/**
 * Returns Key of AlloyDB Service Entities.
 */
export function getKey(type, uid) {
  return type + ':' + uid;
}

export function getAlloyDBforPostgreSQLServiceEntity(serviceObj) {
  const data = {
    ...serviceObj, // organizationId, projectId, instanceId
    name: 'AlloyDB for PostgreSQL',
  };
  return createGoogleCloudIntegrationEntity(data, {
    entityData: {
      source: {},
      assign: {
        _class: ENTITY_CLASS_ALLOYDB_POSTGRE_SQL_SERVICE,
        _type: ENTITY_TYPE_ALLOYDB_POSTGRE_SQL_SERVICE,
        _key: getKey(ENTITY_TYPE_ALLOYDB_POSTGRE_SQL_SERVICE, data.instanceId),
        function: ['application'],
        category: ['database'],
        ...data,
      },
    },
  });
}

export function createAlloyDbClusterEntity(data: alloydb_v1.Schema$Cluster) {
  return createGoogleCloudIntegrationEntity(data, {
    entityData: {
      source: data,
      assign: {
        _class: ENTITY_CLASS_POSTGRE_SQL_CLUSTER,
        _type: ENTITY_TYPE_POSTGRE_SQL_ALLOYDB_CLUSTER,
        _key: getKey(ENTITY_TYPE_POSTGRE_SQL_ALLOYDB_CLUSTER, data.name),
        name: data.name,
        uid: data.uid,
        displayName: data.displayName as string,
        state: data.state,
        clusterType: data.clusterType,
        databaseVersion: data.databaseVersion,
        networkConfigNetwork: data.networkConfig?.network,
        networkConfigallocatedIpRange: data.networkConfig?.allocatedIpRange,
        reconciling: data.reconciling,
        initialUserName: data.initialUser?.user,
        initialUserPassword: data.initialUser?.password,
        encrypted: data.encryptionInfo ? true : false,
        kmsKeyName: data.encryptionConfig?.kmsKeyName,
        location: data.name?.split('/')[3],
        clusterName: data.name?.split('/').pop(),
        classification: 'Database',
        hostname: data.name?.split('/').pop(),
      },
    },
  });
}

export function createAlloyDBInstance(data: alloydb_v1.Schema$Instance) {
  const instanceName = data.name?.split('/').pop();
  return createGoogleCloudIntegrationEntity(data, {
    entityData: {
      source: data,
      assign: {
        _class: ENTITY_CLASS_POSTGRE_SQL_INSTANCE,
        _type: ENTITY_TYPE_POSTGRE_SQL_ALLOYDB_INSTANCE,
        _key: getKey(ENTITY_TYPE_POSTGRE_SQL_ALLOYDB_INSTANCE, data.name),
        name: data.name,
        displayName: data.displayName as string,
        state: data.state,
        reconciling: data.reconciling,
        ipAddress: data.ipAddress,
        availabilityType: data.availabilityType,
        instanceType: data.instanceType,
        machineConfig: data.machineConfig?.cpuCount,
        encryptionMode: data.clientConnectionConfig?.sslConfig?.sslMode,
        clsusterLocation: data.name?.split('/')[3],
        clusterName: data.name?.split('/')[5],
        instanceName: instanceName,
        hostname: instanceName,
        classification: 'Database',
        encrypted: true,
        uid: data.uid,
      },
    },
  });
}

export function createConnectionEntity(data: alloydb_v1.Schema$ConnectionInfo) {
  return createGoogleCloudIntegrationEntity(data, {
    entityData: {
      source: data,
      assign: {
        _class: ENTITY_CLASS_POSTGRE_SQL_CONNECTION,
        _type: ENTITY_TYPE_POSTGRE_SQL_CONNECTION,
        _key: getKey(ENTITY_TYPE_POSTGRE_SQL_CONNECTION, data.instanceUid),
        name: data.name
          ? data.name
          : `AlloyDB_PostgreSQL_Connection:${data.instanceUid}`,
        instanceUid: data.instanceUid,
        ipAddress: data.ipAddress,
        CIDR: `${data.ipAddress}/16`,
        public: true,
        internal: false,
      },
    },
  });
}

export function createBackupEntity(data: alloydb_v1.Schema$Backup) {
  return createGoogleCloudIntegrationEntity(data, {
    entityData: {
      source: data,
      assign: {
        _class: ENTITY_CLASS_POSTGRE_SQL_BACKUP,
        _type: ENTITY_TYPE_POSTGRE_SQL_BACKUP,
        _key: getKey(ENTITY_TYPE_POSTGRE_SQL_CONNECTION, data.uid),
        name: data.name,
        type: data.type,
        state: data.state,
        clusterName: data.clusterName,
        encryptionType: data.encryptionInfo?.encryptionType,
        clusterUid: data.clusterUid,
        databaseVersion: data.databaseVersion,
      },
    },
  });
}
