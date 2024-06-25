import { RelationshipClass, StepEntityMetadata, StepRelationshipMetadata } from '@jupiterone/integration-sdk-core';
import { ENTITY_TYPE_KMS_KEY } from '../kms';
import { PROJECT_ENTITY_TYPE } from '../resource-manager';

export const STEP_SPANNER_INSTANCES = 'fetch-spanner-instances';
export const STEP_SPANNER_INSTANCE_DATABASES =
  'fetch-spanner-instance-databases';
export const STEP_SPANNER_INSTANCE_CONFIGS = 'fetch-spanner-instance-configs';
export const STEP_SPANNER_INSTANCE_DATABASES_ROLE =
  'fetch-spanner-instance-databases-role';
export const STEP_SPANNER_INSTANCE_DATABASES_ASSIGNED_DATABASE_ROLE =
  'build-spanner-instance-database-assigned-role-relationship';
export const STEP_SPANNER_BACKUP = 'fetch-spanner-backup';
export const STEP_CLOUD_SPANNER_SERVICE = 'fetch-spanner-service';
export const STEP_SPANNER_INSTANCE_HAS_BACKUP =
  'fetch-spanner-instance-has-backup';
export const STEP_PROJECT_HAS_SPANNER_INSTANCE =
  'build-project-has-spanner-instance';
export const STEP_PROJECT_HAS_SPANNER_INSTANCE_CONFIG =
  'build-project-has-spanner-instance-config';
export const STEP_PROJECT_HAS_SPANNER_SERVICE =
  'build-project-has-spanner-service';

export const ENTITY_CLASS_SPANNER_INSTANCE_CONFIG = ['Configuration'];
export const ENTITY_TYPE_SPANNER_INSTANCE_CONFIG =
  'google_spanner_instance_config';

export const ENTITY_CLASS_SPANNER_INSTANCE = ['Database', 'Cluster'];
export const ENTITY_TYPE_SPANNER_INSTANCE = 'google_spanner_instance';

export const ENTITY_CLASS_SPANNER_INSTANCE_DATABASE = ['Database'];
export const ENTITY_TYPE_SPANNER_INSTANCE_DATABASE = 'google_spanner_database';

export const ENTITY_CLASS_SPANNER_INSTANCE_DATABASE_ROLE = ['AccessRole'];
export const ENTITY_TYPE_SPANNER_INSTANCE_DATABASE_ROLE =
  'google_cloud_spanner_database_role';

export const ENTITY_TYPE_SPANNER_BACKUP = 'google_cloud_spanner_backup';
export const ENTITY_CLASS_SPANNER_BACKUP = ['Backup'];

export const ENTITY_TYPE_SPANNER_SERVICE = 'google_cloud_spanner';
export const ENTITY_CLASS_SPANNER_SERVICE = ['Service'];

export const RELATIONSHIP_TYPE_SPANNER_INSTANCE_HAS_DATABASE =
  'google_spanner_instance_has_database';
export const RELATIONSHIP_TYPE_SPANNER_INSTANCE_USES_CONFIG =
  'google_spanner_instance_uses_config';
export const RELATIONSHIP_TYPE_SPANNER_INSTANCE_DATABASE_USES_KMS_KEY =
  'google_spanner_database_uses_kms_crypto_key';
export const RELATIONSHIP_TYPE_SPANNER_INSTANCE_DATABASES_ASSIGNED_DATABASE_ROLE =
  'google_spanner_database_assigned_cloud_spanner_database_role';
export const RELATIONSHIP_TYPE_SPANNER_INSTANCE_HAS_BACKUP =
  'google_spanner_instance_has_cloud_spanner_backup';
export const RELATIONSHIP_TYPE_PROJECT_HAS_SPANNER_INSTANCE =
  'google_cloud_project_has_spanner_instance';
export const RELATIONSHIP_TYPE_PROJECT_HAS_SPANNER_INSTANCE_CONFIG =
  'google_cloud_project_has_spanner_instance_config';
export const RELATIONSHIP_TYPE_PROJECT_HAS_SPANNER_SERVICE =
  'google_cloud_project_has_spanner';

export const IngestionSources = {
  SPANNER_INSTANCE_CONFIGS: 'spanner-instance-configs',
  SPANNER_INSTANCES: 'spanner-instances',
  SPANNER_INSTANCE_DATABASES: 'spanner-instance-databases',
  SPANNER_INSTANCE_DATABASES_ROLE: 'spanner-instance-databases-role',
  SPANNER_INSTANCE_DATABASES_ASSIGNED_DATABASE_ROLE:
    'spanner-instance-database-assigned-role-relationship',
  SPANNER_BACKUP: 'spanner-backup',
  SPANNER_SERVICE: 'spanner-service',
  SPANNER_INSTANCE_HAS_BACKUP: 'spanner-instance-has-backup',
  PROJECT_HAS_SPANNER_INSTANCE: 'project-has-spanner-instance',
  PROJECT_HAS_SPANNER_INSTANCE_CONFIG: 'project-has-spanner-instance-config',
  PROJECT_HAS_SPANNER_SERVICE: 'project-has-spanner-service',
};

export const SpannerIngestionConfig = {
  [IngestionSources.SPANNER_INSTANCE_CONFIGS]: {
    title: 'Google Spanner Instance Configs',
    description: 'Configurations for Spanner instances.',
    defaultsToDisabled: false,
  },
  [IngestionSources.SPANNER_INSTANCES]: {
    title: 'Google Spanner Instances',
    description: 'Managed database instances in Spanner.',
    defaultsToDisabled: false,
  },
  [IngestionSources.SPANNER_INSTANCE_DATABASES]: {
    title: 'Google Spanner Databases',
    description: 'Databases within Spanner instances.',
    defaultsToDisabled: false,
  },
  [IngestionSources.SPANNER_INSTANCE_HAS_BACKUP]: {
    title: 'Google Spanner Instance Has Backup',
    description: 'Build Relationship Google Spanner Instance Has Backup',
    defaultsToDisabled: false,
  },
  [IngestionSources.PROJECT_HAS_SPANNER_INSTANCE]: {
    title: 'Google Project Has Spanner Instance',
    description: 'Build Relationship Google Project Has Instance',
    defaultsToDisabled: false,
  },
  [IngestionSources.PROJECT_HAS_SPANNER_INSTANCE_CONFIG]: {
    title: 'Google Project Has Spanner Instance Config',
    description: 'Build Relationship Google Project Has Instance Config',
    defaultsToDisabled: false,
  },
};

export const SpannerPermissions = {
  STEP_SPANNER_INSTANCE_CONFIGS: ['spanner.instanceConfigs.list'],
  STEP_SPANNER_INSTANCES: [
    'spanner.instances.list',
    'spanner.databases.getIamPolicy',
  ],
  STEP_SPANNER_INSTANCE_DATABASES: ['spanner.databases.list'],
  STEP_SPANNER_INSTANCE_DATABASES_ROLE: ['spanner.databasesRoles.list'],
  STEP_SPANNER_INSTANCE_BACKUP: ['spanner.backups.get'],
};

// Entities
export const Entities: Record<
  | 'SPANNER_INSTANCES'
  | 'SPANNER_INSTANCE_CONFIGS'
  | 'SPANNER_INSTANCE_DATABASES'
  | 'SPANNER_INSTANCE_DATABASES_ROLE'
  | 'SPANNER_BACKUP'
  | 'SPANNER_SERVICE',
  StepEntityMetadata
> = {
  SPANNER_INSTANCE_CONFIGS: {
    resourceName: 'Spanner Instance Config',
    _type: ENTITY_TYPE_SPANNER_INSTANCE_CONFIG,
    _class: ENTITY_CLASS_SPANNER_INSTANCE_CONFIG,
  },
  SPANNER_INSTANCES: {
    resourceName: 'Spanner Instance',
    _type: ENTITY_TYPE_SPANNER_INSTANCE,
    _class: ENTITY_CLASS_SPANNER_INSTANCE,
  },
  SPANNER_INSTANCE_DATABASES: {
    resourceName: 'Spanner Instance Database',
    _type: ENTITY_TYPE_SPANNER_INSTANCE_DATABASE,
    _class: ENTITY_CLASS_SPANNER_INSTANCE_DATABASE,
  },
  SPANNER_INSTANCE_DATABASES_ROLE: {
    resourceName: 'Spanner Instance Database Role',
    _type: ENTITY_TYPE_SPANNER_INSTANCE_DATABASE_ROLE,
    _class: ENTITY_CLASS_SPANNER_INSTANCE_DATABASE_ROLE,
  },
  SPANNER_BACKUP: {
    resourceName: 'Cloud Spanner Backups',
    _type: ENTITY_TYPE_SPANNER_BACKUP,
    _class: ENTITY_CLASS_SPANNER_BACKUP,
  },
  SPANNER_SERVICE: {
    resourceName: 'Cloud Spanner',
    _type: ENTITY_TYPE_SPANNER_SERVICE,
    _class: ENTITY_CLASS_SPANNER_SERVICE,
  },
};

// Relationships 
export const Relationships: Record<
  | 'SPANNER_INSTANCE_USES_CONFIG'
  | 'SPANNER_INSTANCE_HAS_DATABASE'
  | 'SPANNER_INSTANCE_DATABASE_USES_KMS_KEY'
  | 'SPANNER_INSTANCE_DATABASES_ASSIGNED_DATABASE_ROLE'
  | 'SPANNER_INSTANCE_HAS_BACKUP'
  | 'PROJECT_HAS_SPANNER_INSTANCE'
  | 'PROJECT_HAS_SPANNER_INSTANCE_CONFIG'
  | 'PROJECT_HAS_SPANNER_SERVICE',
  StepRelationshipMetadata
> = {
  SPANNER_INSTANCE_USES_CONFIG: {
    _class: RelationshipClass.USES,
    _type: RELATIONSHIP_TYPE_SPANNER_INSTANCE_USES_CONFIG,
    sourceType: ENTITY_TYPE_SPANNER_INSTANCE,
    targetType: ENTITY_TYPE_SPANNER_INSTANCE_CONFIG,
  },
  SPANNER_INSTANCE_HAS_DATABASE: {
    _class: RelationshipClass.HAS,
    _type: RELATIONSHIP_TYPE_SPANNER_INSTANCE_HAS_DATABASE,
    sourceType: ENTITY_TYPE_SPANNER_INSTANCE,
    targetType: ENTITY_TYPE_SPANNER_INSTANCE_DATABASE,
  },
  SPANNER_INSTANCE_DATABASE_USES_KMS_KEY: {
    _class: RelationshipClass.USES,
    _type: RELATIONSHIP_TYPE_SPANNER_INSTANCE_DATABASE_USES_KMS_KEY,
    sourceType: ENTITY_TYPE_SPANNER_INSTANCE_DATABASE,
    targetType: ENTITY_TYPE_KMS_KEY,
  },
  SPANNER_INSTANCE_DATABASES_ASSIGNED_DATABASE_ROLE: {
    _class: RelationshipClass.ASSIGNED,
    _type: RELATIONSHIP_TYPE_SPANNER_INSTANCE_DATABASES_ASSIGNED_DATABASE_ROLE,
    sourceType: ENTITY_TYPE_SPANNER_INSTANCE_DATABASE,
    targetType: ENTITY_TYPE_SPANNER_INSTANCE_DATABASE_ROLE,
  },
  SPANNER_INSTANCE_HAS_BACKUP: {
    _class: RelationshipClass.HAS,
    _type: RELATIONSHIP_TYPE_SPANNER_INSTANCE_HAS_BACKUP,
    sourceType: ENTITY_TYPE_SPANNER_INSTANCE,
    targetType: ENTITY_TYPE_SPANNER_BACKUP,
  },
  PROJECT_HAS_SPANNER_INSTANCE: {
    _class: RelationshipClass.HAS,
    _type: RELATIONSHIP_TYPE_PROJECT_HAS_SPANNER_INSTANCE,
    sourceType: PROJECT_ENTITY_TYPE,
    targetType: ENTITY_TYPE_SPANNER_INSTANCE,
  },
  PROJECT_HAS_SPANNER_INSTANCE_CONFIG: {
    _class: RelationshipClass.HAS,
    _type: RELATIONSHIP_TYPE_PROJECT_HAS_SPANNER_INSTANCE_CONFIG,
    sourceType: PROJECT_ENTITY_TYPE,
    targetType: ENTITY_TYPE_SPANNER_INSTANCE_CONFIG,
  },
  PROJECT_HAS_SPANNER_SERVICE: {
    _class: RelationshipClass.HAS,
    _type: RELATIONSHIP_TYPE_PROJECT_HAS_SPANNER_SERVICE,
    sourceType: PROJECT_ENTITY_TYPE,
    targetType: ENTITY_TYPE_SPANNER_SERVICE,
  },
};