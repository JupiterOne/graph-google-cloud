export const CloudSourceRepositoriesEntitiesSpec = {
  REPOSITORY: {
    resourceName: 'Cloud Source Repository',
    _type: 'google_cloud_source_repository',
    _class: ['CodeRepo'],
  },
};

export const CloudSourceRepositoriesStepsSpec = {
  FETCH_REPOSITORIES: {
    id: 'fetch-cloud-source-repositories',
    name: 'Fetch Cloud Source Repositories',
  },
};

export const IngestionSources = {
  CLOUD_SOURCE_REPOSITORIES: 'cloud-source-repositories',
};

export const CloudSourceRepositoriesIngestionConfig = {
  [IngestionSources.CLOUD_SOURCE_REPOSITORIES]: {
    title: 'Google Cloud Source Repositories',
    description: 'Fully managed source code repositories.',
    defaultsToDisabled: false,
  },
};

export const CloudSourcePermissions = {
  FETCH_REPOSITORIES: ['source.repos.list'],
};
