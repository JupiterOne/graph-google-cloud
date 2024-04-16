export const ARTIFACT_REGISTRY_REPOSITORY_CLASS = ['CodeRepo', 'Repository'];
export const ARTIFACT_REGISTRY_REPOSITORY_TYPE =
  'google_cloud_artifact_registry_repository';
export const STEP_ARTIFACT_REGISTRY_REPOSITORY =
  'fetch-artifact-registry-repository';

export const ARTIFACT_REPOSITORY_PACKAGE_CLASS = ['CodeModule'];
export const ARTIFACT_REPOSITORY_PACKAGE_TYPE =
  'google_cloud_artifact_registry_package';
export const STEP_ARTIFACT_REPOSIOTRY_PACKAGE =
  'fetch-artifact-repository-package';

export const STEP_ARTIFACT_REGISTRY = 'fetch-artifact-registry';
export const ARTIFACT_REGISTRY_CLASS = ['Service'];
export const ARTIFACT_REGISTRY_TYPE = 'google_cloud_artifact_registry';

export const STEP_ARTIFACT_REGISTRY_VPCSC_CONFIGURATION =
  'fetch-artifact-registry-vpcsc-configuration';
export const ARTIFACT_REGISTRY_VPCSC_CONFIGURATION_CLASS = ['Configuration'];
export const ARTIFACT_REGISTRY_VPCSC_CONFIGURATION_TYPE =
  'google_cloud_artifact_registry_vpcsc_configuration';

export const IngestionSources = {
  ARTIFACT_REGISTRY_REPOSITORY: 'artifact_registry_repositories',
  ARTIFACT_REPOSITORY_PACKAGE: 'artifact_repository_packages',
  ARTIFACT_REGISTRY: 'artifact_registries',
  ARTIFACT_REGISTRY_VPCSC_CONFIGURATION:
    'artifact_registry_vpcsc_configurations',
};

export const MonitoringIngestionConfig = {
  [IngestionSources.ARTIFACT_REGISTRY_REPOSITORY]: {
    title: 'Artifact Registry Repository',
    description: 'Artifact Registry Repository for GCP',
    defaultsToDisabled: false,
  },
  [IngestionSources.ARTIFACT_REGISTRY]: {
    title: 'Artifact Registry',
    description: 'Artifact Registry for GCP',
    defaultsToDisabled: false,
  },
  [IngestionSources.ARTIFACT_REPOSITORY_PACKAGE]: {
    title: 'Artifact Repository Package',
    description: 'Artifact Repository package for GCP',
    defaultsToDisabled: false,
  },
  [IngestionSources.ARTIFACT_REGISTRY_VPCSC_CONFIGURATION]: {
    title: 'Artifact Registry vpcsc configuration',
    description: 'Artifact Registry vpcsc configuration for GCP',
    defaultsToDisabled: false,
  },
};

//Fetched directly from the repository.location.list
// This is the location : https://cloud.google.com/artifact-registry/docs/repositories/repo-locations

export const ARTIFACT_REGISTRY_LOCATIONS: string[] = [
  'africa-south1',
  'asia',
  'asia-east1',
  'asia-east2',
  'asia-northeast1',
  'asia-northeast2',
  'asia-northeast3',
  'asia-south1',
  'asia-south2',
  'asia-southeast1',
  'asia-southeast2',
  'australia-southeast1',
  'australia-southeast2',
  'europe',
  'europe-central2',
  'europe-north1',
  'europe-southwest1',
  'europe-west1',
  'europe-west10',
  'europe-west12',
  'europe-west2',
  'europe-west3',
  'europe-west4',
  'europe-west6',
  'europe-west8',
  'europe-west9',
  'me-central1',
  'me-central2',
  'me-west1',
  'northamerica-northeast1',
  'northamerica-northeast2',
  'southamerica-east1',
  'southamerica-west1',
  'us',
  'us-central1',
  'us-east1',
  'us-east4',
  'us-east5',
  'us-south1',
  'us-west1',
  'us-west2',
  'us-west3',
  'us-west4',
];
