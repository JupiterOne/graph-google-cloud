import {
  RelationshipClass,
  RelationshipDirection,
  StepEntityMetadata,
  StepMappedRelationshipMetadata,
  StepRelationshipMetadata,
} from '@jupiterone/integration-sdk-core';
import { PROJECT_ENTITY_TYPE } from '../resource-manager';
import { StorageEntitiesSpec } from '../storage/constants';

// Steps
export const STEP_CLOUD_DEPLOY_DELIVERY_PIPELINE =
  'fetch-cloud-deploy-delivery-pipeline';
export const STEP_CLOUD_DEPLOY_AUTOMATION = 'fetch-cloud-deploy-automation';
export const STEP_CLOUD_DEPLOY_SERVICE = 'fetch-cloud-deploy-service';
export const STEP_PROJECT_HAS_CLOUD_DEPLOY_RELATIONSHIP =
  'build-project-has-cloud-deploy-relationship';
export const STEP_CLOUD_DEPLOY_SERVICE_HAS_DELIVERY_PIPELINE_RELAIONSHIP =
  'build-cloud-deploy-service-has-delivery-pipeline-relationship';
export const STEP_CLOUD_DEPLOY_AUTOMATION_TRIGGERS_DELIVERY_PIPELINE_AUTOMATION_RELATIONSHIP =
  'build-cloud-deploy-automation-triggers-delivery-pipeline-relationship';
export const STEP_CLOUD_DEPLOY_DELIVERY_PIPELINE_USES_GITHUB_REPO_RELAIONSHIP =
  'build-cloud-deploy-delivery-pipeline-uses-github-repo-relationship';
export const STEP_CLOUD_DEPLOY_DELIVERY_PIPELINE_USES_STORAGE_BUCKET_RELATIONSHIP =
  'build-cloud-deploy-delivery-pipeline-uses-storage-bucket-relationship';

// Entities
export const ENTITY_CLASS_CLOUD_DEPLOY_DELIVERY_PIPELINE = ['Workflow'];
export const ENTITY_TYPE_CLOUD_DEPLOY_DELIVERY_PIPELINE =
  'google_cloud_deploy_delivery_pipeline';

export const ENTITY_CLASS_CLOUD_DEPLOY_AUTOMATION = ['Rule'];
export const ENTITY_TYPE_CLOUD_DEPLOY_AUTOMATION =
  'google_cloud_deploy_automation';

export const ENTITY_CLASS_CLOUD_DEPLOY_SERVICE = ['Service'];
export const ENTITY_TYPE_CLOUD_DEPLOY_SERVICE = 'google_cloud_deploy_service';

// Relationships
export const RELATIONSHIP_TYPE_PROJECT_HAS_CLOUD_DEPLOY =
  'google_cloud_project_has_deploy_service';
export const RELATIONSHIP_TYPE_CLOUD_DEPLOY_SERVICE_HAS_DELIVERY_PIPELINE =
  'google_cloud_deploy_service_has_delivery_pipeline';
export const RELATIONSHIP_TYPE_CLOUD_DEPLOY_AUTOMATION_TRIGGERS_DELIVERY_PIPELINE =
  'google_cloud_deploy_automation_triggers_delivery_pipeline';
export const RELATIONSHIP_TYPE_CLOUD_DEPLOY_DELIVERY_PIPELINE_USES_STORAGE_BUCKET =
  'google_cloud_deploy_delivery_pipeline_uses_storage_bucket';

// Mapped Relationships
export const MAPPED_RELATIONSHIP_TYPE_CLOUD_DEPLOY_DELIVERY_PIPELINE_USES_GITHUB_REPO =
  'google_cloud_deploy_delivery_pipeline-uses-github-repo';

// IngestionSources
export const IngestionSources = {
  CLOUD_DEPLOY_DELIVERY_PIPELINES: 'cloud-deploy-delivery-pipelines',
  CLOUD_DEPLOY_AUTOMATION: 'cloud-deploy-automation',
  CLOUD_DEPLOY_SERVICE: 'cloud-deploy-service',
  PROJECT_HAS_CLOUD_DEPLOY_RELATIONSHIP:
    'project-has-cloud-deploy-relationship',
  CLOUD_DEPLOY_SERVICE_HAS_DELIVERY_PIPELINE_RELAIONSHIP:
    'cloud-deploy-service-has-delivery-pipeline-relationship',
  CLOUD_DEPLOY_AUTOMATION_TRIGGERS_DELIVERY_PIPELINE_AUTOMATION_RELATIONSHIP:
    'cloud-deploy-automation-triggers-delivery-pipeline-relationship',
  CLOUD_DEPLOY_DELIVERY_PIPELINE_USES_GITHUB_REPO_RELATIONSHIP:
    'cloud-deploy-delivery-pipeline-uses-github-repo-relationship',
  CLOUD_DEPLOY_DELIVERY_PIPELINE_USES_STORAGE_BUCKET_RELATIONSHIP:
    'cloud-deploy-delivery-pipeline-uses-storage-bucket-relationship',
};

// IngestionSources Configs
export const CodeDeployIngestionConfig = {
  [IngestionSources.CLOUD_DEPLOY_DELIVERY_PIPELINES]: {
    title: 'Google Cloud Deploy Delivery Pipelines',
    description: 'Cloud Deploy Delivery Pipelines.',
    defaultsToDisabled: false,
  },
  [IngestionSources.CLOUD_DEPLOY_AUTOMATION]: {
    title: 'Google Cloud Deploy Delivery Pipelines Automation',
    description: 'Cloud Deploy Delivery Pipelines Automation.',
    defaultsToDisabled: false,
  },
  [IngestionSources.CLOUD_DEPLOY_SERVICE]: {
    title: 'Google Cloud Deploy Service',
    description: 'Cloud Deploy Service.',
    defaultsToDisabled: false,
  },
  [IngestionSources.PROJECT_HAS_CLOUD_DEPLOY_RELATIONSHIP]: {
    title: 'Project Has Cloud Deploy Relationship',
    description: 'Build relationship between Project and Cloud Deploy Service.',
    defaultsToDisabled: false,
  },
  [IngestionSources.CLOUD_DEPLOY_SERVICE_HAS_DELIVERY_PIPELINE_RELAIONSHIP]: {
    title: 'Cloud Deploy Service Has Delivery Pipeline Relationship',
    description:
      'Build relationship between Delivery Pipeline and Cloud Deploy Service.',
    defaultsToDisabled: false,
  },
  [IngestionSources.CLOUD_DEPLOY_AUTOMATION_TRIGGERS_DELIVERY_PIPELINE_AUTOMATION_RELATIONSHIP]:
    {
      title: 'Cloud Deploy Automation Triggers Delivery Pipeline Relationship',
      description:
        'Build relationship between Automation and Delivery Pipeline.',
      defaultsToDisabled: false,
    },
  [IngestionSources.CLOUD_DEPLOY_DELIVERY_PIPELINE_USES_GITHUB_REPO_RELATIONSHIP]:
    {
      title: 'Cloud Deploy Delivery Pipeline Uses Github Repo Relationship',
      description:
        'Build relationship between Cloud Deploy Delivery Pipeline Uses Github Repo.',
      defaultsToDisabled: false,
    },
};

// IAM Permissions
export const CloudDeployPermissions = {
  STEP_CLOUD_DEPLOY_DELIVERY_PIPELINES: ['clouddeploy.deliveryPipelines.list'],
  STEP_CLOUD_DEPLOY_AUTOMATION: ['clouddeploy.automations.list'],
};

// Entities
export const Entities: Record<
  | 'CLOUD_DEPLOY_SERVICE'
  | 'CLOUD_DEPLOY_AUTOMATION'
  | 'CLOUD_DEPLOY_DELIVERY_PIPELINE',
  StepEntityMetadata
> = {
  CLOUD_DEPLOY_SERVICE: {
    resourceName: 'Cloud Deploy Service',
    _type: ENTITY_TYPE_CLOUD_DEPLOY_SERVICE,
    _class: ENTITY_CLASS_CLOUD_DEPLOY_SERVICE,
  },
  CLOUD_DEPLOY_AUTOMATION: {
    resourceName: 'Cloud Deploy Automation',
    _type: ENTITY_TYPE_CLOUD_DEPLOY_AUTOMATION,
    _class: ENTITY_CLASS_CLOUD_DEPLOY_AUTOMATION,
  },
  CLOUD_DEPLOY_DELIVERY_PIPELINE: {
    resourceName: 'Cloud Deploy Delivery Pipeline',
    _type: ENTITY_TYPE_CLOUD_DEPLOY_DELIVERY_PIPELINE,
    _class: ENTITY_CLASS_CLOUD_DEPLOY_DELIVERY_PIPELINE,
  },
};

// Relationships
export const Relationships: Record<
  | 'CLOUD_DEPLOY_AUTOMATION_TRIGGERS_DELIVERY_PIPELINE'
  | 'CLOUD_DEPLOY_DELIVERY_PIPELINE_USES_STORAGE_BUCKET'
  | 'PROJECT_HAS_CLOUD_DEPLOY'
  | 'CLOUD_DEPLOY_SERVICE_HAS_DELIVERY_PIPELINE',
  StepRelationshipMetadata
> = {
  CLOUD_DEPLOY_AUTOMATION_TRIGGERS_DELIVERY_PIPELINE: {
    _type: RELATIONSHIP_TYPE_CLOUD_DEPLOY_AUTOMATION_TRIGGERS_DELIVERY_PIPELINE,
    sourceType: ENTITY_TYPE_CLOUD_DEPLOY_AUTOMATION,
    _class: RelationshipClass.TRIGGERS,
    targetType: ENTITY_TYPE_CLOUD_DEPLOY_DELIVERY_PIPELINE,
  },
  CLOUD_DEPLOY_DELIVERY_PIPELINE_USES_STORAGE_BUCKET: {
    _type: RELATIONSHIP_TYPE_CLOUD_DEPLOY_DELIVERY_PIPELINE_USES_STORAGE_BUCKET,
    sourceType: ENTITY_TYPE_CLOUD_DEPLOY_DELIVERY_PIPELINE,
    _class: RelationshipClass.USES,
    targetType: StorageEntitiesSpec.STORAGE_BUCKET._type,
  },
  PROJECT_HAS_CLOUD_DEPLOY: {
    _type: RELATIONSHIP_TYPE_PROJECT_HAS_CLOUD_DEPLOY,
    sourceType: PROJECT_ENTITY_TYPE,
    _class: RelationshipClass.HAS,
    targetType: ENTITY_TYPE_CLOUD_DEPLOY_SERVICE,
  },
  CLOUD_DEPLOY_SERVICE_HAS_DELIVERY_PIPELINE: {
    _type: RELATIONSHIP_TYPE_CLOUD_DEPLOY_SERVICE_HAS_DELIVERY_PIPELINE,
    sourceType: ENTITY_TYPE_CLOUD_DEPLOY_SERVICE,
    _class: RelationshipClass.HAS,
    targetType: ENTITY_TYPE_CLOUD_DEPLOY_DELIVERY_PIPELINE,
  },
};

export const MappedRelationships: Record<
  'CLOUD_DEPLOY_DELIVERY_PIPELINE_USES_GITHUB_REPO',
  StepMappedRelationshipMetadata
> = {
  CLOUD_DEPLOY_DELIVERY_PIPELINE_USES_GITHUB_REPO: {
    _type:
      MAPPED_RELATIONSHIP_TYPE_CLOUD_DEPLOY_DELIVERY_PIPELINE_USES_GITHUB_REPO,
    sourceType: ENTITY_TYPE_CLOUD_DEPLOY_DELIVERY_PIPELINE,
    _class: RelationshipClass.USES,
    targetType: 'github_repo',
    direction: RelationshipDirection.FORWARD,
  },
};
