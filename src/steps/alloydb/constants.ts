import {
  RelationshipClass,
  StepEntityMetadata,
  StepRelationshipMetadata,
} from '@jupiterone/integration-sdk-core';
import { ENTITY_TYPE_KMS_KEY } from '../kms';
import { PROJECT_ENTITY_TYPE } from '../resource-manager';
import { GOOGLE_USER_ENTITY_TYPE } from '../iam';

export const STEP_ALLOYDB_POSTGRE_SQL_SERVICE = 'create-postgre-sql-service';
export const STEP_ALLOYDB_POSTGRE_SQL_CLUSTER =
  'fetch-alloydb-postgre-sql-cluster';
export const STEP_ALLOYDB_POSTGRE_SQL_INSTANCE =
  'fetch-alloydb-postgre-sql-instance';
export const STEP_ALLOYDB_POSTGRE_SQL_CONNECTION =
  'fetch-alloydb-postgre-sql-connection';
export const STEP_ALLOYDB_POSTGRE_SQL_BACKUP =
  'fetch-alloydb-postgre-sql-backup';

// Entity type
export const ENTITY_TYPE_ALLOYDB_POSTGRE_SQL_SERVICE = 'google_cloud_alloydb';
export const ENTITY_CLASS_ALLOYDB_POSTGRE_SQL_SERVICE = ['Service'];

export const ENTITY_TYPE_POSTGRE_SQL_ALLOYDB_CLUSTER =
  'google_cloud_alloydb_cluster';
export const ENTITY_CLASS_POSTGRE_SQL_CLUSTER = [
  'Database',
  'DataStore',
  'Cluster',
];

export const ENTITY_TYPE_POSTGRE_SQL_ALLOYDB_INSTANCE =
  'google_cloud_alloydb_instance';
export const ENTITY_CLASS_POSTGRE_SQL_INSTANCE = [
  'Database',
  'DataStore',
  'Host',
];

export const ENTITY_TYPE_POSTGRE_SQL_CONNECTION =
  'google_cloud_alloydb_connection';
export const ENTITY_CLASS_POSTGRE_SQL_CONNECTION = ['Network'];

export const ENTITY_TYPE_POSTGRE_SQL_BACKUP = 'google_cloud_alloydb_backup';
export const ENTITY_CLASS_POSTGRE_SQL_BACKUP = ['Backup'];

// Relationships
export const STEP_PROJECT_HAS_ALLOYDB_SERVICE_RELATIONSHIP =
  'build-project-alloydb-service-relationship';
export const STEP_PROJECT_HAS_ALLOYDB_CLUSTER_RELATIONSHIP =
  'build-project-has-alloydb-cluster-relationship';

export const STEP_ALLOYDB_INSTANCE_USES_CLUSTER_RELATIONSHIP =
  'build-alloydb-instance-uses-cluster-relationship';

export const STEP_ALLOYDB_CLUSTER_HAS_BACKUP_RELATIONSHIP =
  'build-alloydb-cluster-has-backup-relationship';

export const STEP_ALLOYDB_INSTANCE_HAS_CONNECTION_RELATIONSHIP =
  'build-alloydb-instance-has-connection-relationship';

export const STEP_ALLOYDB_CLUSTER_USES_KMS_KEY_RELATIONSHIP =
  'build-alloydb-cluster-uses-kms-key-relationship';

export const STEP_USER_ASSIGNED_ALLOYDB_CLUSTER_RELATIONSHIP =
  'build-user-asssigned-alloydb-cluster-relatipnship';

export const RELATIONSHIP_TYPE_PROJECT_HAS_ALLOYDB_SERVICE =
  'google_cloud_project_has_alloydb';
export const RELATIONSHIP_TYPE_PROJECT_HAS_ALLOYDB_CLUSTER =
  'google_cloud_project_has_alloydb_cluster';
export const RELATIONSHIP_TYPE_ALLOYDB_INSTANCE_USES_CLUSTER =
  'google_cloud_alloydb_instance_uses_cluster';
export const RELATIONSHIP_TYPE_ALLOYDB_CLUSTER_HAS_BACKUP =
  'google_cloud_alloydb_cluster_has_backup';
export const RELATIONSHIP_TYPE_STEP_ALLOYDB_INSTANCE_HAS_CONNECTION_BACKUP =
  'google_cloud_alloydb_instance_has_connection';
export const RELATIONSHIP_TYPE_ALLOYDB_CLUSTER_USES_KMS_KEY =
  'google_cloud_alloydb_cluster_uses_kms_crypto_key';
export const RELATIONSHIP_TYPE_USER_ASSIGNED_ALLOYDB_CLUSTER =
  'google_user_assigned_cloud_alloydb_cluster';
export const RELATIONSHIP_TYPE_SERVICE_ACCOUNT_ASSIGNED_ALLOYDB_CLUSTE =
  'google_service_account_assigned_cloud_alloydb_cluster';

// IngestionSources
export const IngestionSources = {
  ALLOYDB_POSTGRE_SQL_SERVICE: 'postgre-sql-service',
  ALLOYDB_POSTGRE_SQL_CLUSTER: 'alloydb-postgre-sql-cluster',
  ALLOYDB_POSTGRE_SQL_INSTANCE: 'alloydb-postgre-sql-instance',
  ALLOYDB_POSTGRE_SQL_CONNECTION: 'alloydb-postgre-sql-connection',
  ALLOYDB_POSTGRE_SQL_BACKUP: 'alloydb-postgre-sql-backup',
};

// IngestionSources Configs
export const AlloyDBIngestionConfig = {
  [IngestionSources.ALLOYDB_POSTGRE_SQL_SERVICE]: {
    title: 'AlloyDB for Postgre SQL service',
    description: 'AlloyDB for Postgre SQL service.',
    defaultsToDisabled: false,
  },
  [IngestionSources.ALLOYDB_POSTGRE_SQL_CLUSTER]: {
    title: 'AlloyDB for Postgre SQL Cluster',
    description: 'AlloyDB for Postgre SQL Cluster.',
    defaultsToDisabled: false,
  },
  [IngestionSources.ALLOYDB_POSTGRE_SQL_INSTANCE]: {
    title: 'AlloyDB for Postgre SQL Instance',
    description: 'AlloyDB for Postgre SQL Instance.',
    defaultsToDisabled: false,
  },
  [IngestionSources.ALLOYDB_POSTGRE_SQL_CONNECTION]: {
    title: 'AlloyDB for Postgre SQL Connection',
    description: 'AlloyDB for Postgre SQL Connection.',
    defaultsToDisabled: false,
  },
  [IngestionSources.ALLOYDB_POSTGRE_SQL_BACKUP]: {
    title: 'AlloyDB for Postgre SQL Backup',
    description: 'AlloyDB for Postgre SQL Backup.',
    defaultsToDisabled: false,
  },
};

// IAM Permissions
export const AlloyDBPermissions = {
  STEP_ALLOYDB_POSTGRE_SQL_CLUSTER: ['alloydb.clusters.list'],
  STEP_ALLOYDB_POSTGRE_SQL_INSTANCE: ['alloydb.instances.list'],
  STEP_ALLOYDB_POSTGRE_SQL_CONNECTION: ['alloydb.instances.connect'],
  STEP_ALLOYDB_POSTGRE_SQL_BACKUP: ['alloydb.backups.get'],
  STEP_USER_ASSIGNED_ALLOYDB_CLUSTER_RELATIONSHIP: ['alloydb.users.list'], // to fetch alloydb cluster users
};

// Entities

export const Entities: Record<
  | 'ALLOYDB_POSTGRE_SQL_BACKUP'
  | 'ALLOYDB_POSTGRE_SQL_CLUSTER'
  | 'ALLOYDB_POSTGRE_SQL_CONNECTION'
  | 'ALLOYDB_POSTGRE_SQL_ALLOYDB_INSTANCE'
  | 'ALLOYDB_POSTGRE_SQL_SERVICE',
  StepEntityMetadata
> = {
  ALLOYDB_POSTGRE_SQL_BACKUP: {
    resourceName: 'AlloyDB for PostgreSQL Backup',
    _type: ENTITY_TYPE_POSTGRE_SQL_BACKUP,
    _class: ENTITY_CLASS_POSTGRE_SQL_BACKUP,
  },
  ALLOYDB_POSTGRE_SQL_CLUSTER: {
    resourceName: ' AlloyDB for PostgreSQL Cluster',
    _type: ENTITY_TYPE_POSTGRE_SQL_ALLOYDB_CLUSTER,
    _class: ENTITY_CLASS_POSTGRE_SQL_CLUSTER,
  },
  ALLOYDB_POSTGRE_SQL_CONNECTION: {
    resourceName: 'AlloyDB for PostgreSQL Connection',
    _type: ENTITY_TYPE_POSTGRE_SQL_CONNECTION,
    _class: ENTITY_CLASS_POSTGRE_SQL_CONNECTION,
  },
  ALLOYDB_POSTGRE_SQL_ALLOYDB_INSTANCE: {
    resourceName: 'AlloyDB for PostgreSQL Instances',
    _type: ENTITY_TYPE_POSTGRE_SQL_ALLOYDB_INSTANCE,
    _class: ENTITY_CLASS_POSTGRE_SQL_INSTANCE,
  },
  ALLOYDB_POSTGRE_SQL_SERVICE: {
    resourceName: 'AlloyDB for PostgreSQL',
    _type: ENTITY_TYPE_ALLOYDB_POSTGRE_SQL_SERVICE,
    _class: ENTITY_CLASS_ALLOYDB_POSTGRE_SQL_SERVICE,
  },
};

// Relationships
export const Relationships: Record<
  | 'ALLOYDB_CLUSTER_HAS_BACKUP'
  | 'ALLOYDB_CLUSTER_USES_KMS_KEY'
  | 'ALLOYDB_INSTANCE_HAS_CONNECTION_BACKUP'
  | 'ALLOYDB_INSTANCE_USES_CLUSTER'
  | 'PROJECT_HAS_ALLOYDB_SERVICE'
  | 'PROJECT_HAS_ALLOYDB_CLUSTER'
  | 'USER_ASSIGNED_ALLOYDB_CLUSTER',
  StepRelationshipMetadata
> = {
  ALLOYDB_CLUSTER_HAS_BACKUP: {
    _type: RELATIONSHIP_TYPE_ALLOYDB_CLUSTER_HAS_BACKUP,
    sourceType: ENTITY_TYPE_POSTGRE_SQL_ALLOYDB_CLUSTER,
    _class: RelationshipClass.HAS,
    targetType: ENTITY_TYPE_POSTGRE_SQL_BACKUP,
  },
  ALLOYDB_CLUSTER_USES_KMS_KEY: {
    _type: RELATIONSHIP_TYPE_ALLOYDB_CLUSTER_USES_KMS_KEY,
    sourceType: ENTITY_TYPE_POSTGRE_SQL_ALLOYDB_CLUSTER,
    _class: RelationshipClass.USES,
    targetType: ENTITY_TYPE_KMS_KEY,
  },
  ALLOYDB_INSTANCE_HAS_CONNECTION_BACKUP: {
    _type: RELATIONSHIP_TYPE_STEP_ALLOYDB_INSTANCE_HAS_CONNECTION_BACKUP,
    sourceType: ENTITY_TYPE_POSTGRE_SQL_ALLOYDB_INSTANCE,
    _class: RelationshipClass.HAS,
    targetType: ENTITY_TYPE_POSTGRE_SQL_CONNECTION,
  },
  ALLOYDB_INSTANCE_USES_CLUSTER: {
    _type: RELATIONSHIP_TYPE_ALLOYDB_INSTANCE_USES_CLUSTER,
    sourceType: ENTITY_TYPE_POSTGRE_SQL_ALLOYDB_INSTANCE,
    _class: RelationshipClass.USES,
    targetType: ENTITY_TYPE_POSTGRE_SQL_ALLOYDB_CLUSTER,
  },
  PROJECT_HAS_ALLOYDB_SERVICE: {
    _type: RELATIONSHIP_TYPE_PROJECT_HAS_ALLOYDB_SERVICE,
    sourceType: PROJECT_ENTITY_TYPE,
    _class: RelationshipClass.HAS,
    targetType: ENTITY_TYPE_ALLOYDB_POSTGRE_SQL_SERVICE,
  },
  PROJECT_HAS_ALLOYDB_CLUSTER: {
    _type: RELATIONSHIP_TYPE_PROJECT_HAS_ALLOYDB_CLUSTER,
    sourceType: PROJECT_ENTITY_TYPE,
    _class: RelationshipClass.HAS,
    targetType: ENTITY_TYPE_POSTGRE_SQL_ALLOYDB_CLUSTER,
  },
  USER_ASSIGNED_ALLOYDB_CLUSTER: {
    _type: RELATIONSHIP_TYPE_USER_ASSIGNED_ALLOYDB_CLUSTER,
    sourceType: GOOGLE_USER_ENTITY_TYPE,
    _class: RelationshipClass.ASSIGNED,
    targetType: ENTITY_TYPE_POSTGRE_SQL_ALLOYDB_CLUSTER,
  },
};
