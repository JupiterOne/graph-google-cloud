export const CloudBuildStepsSpec = {
  FETCH_BUILDS: {
    id: 'fetch-cloud-builds',
    name: 'Fetch Cloud Builds',
  },
  FETCH_BUILD_TRIGGERS: {
    id: 'fetch-cloud-build-triggers',
    name: 'Fetch Cloud Build Triggers',
  },
};

export const CloudBuildEntitiesSpec = {
  BUILD: {
    resourceName: 'Cloud Build',
    _type: 'google_cloud_build',
    _class: ['Workflow'],
  },
  TRIGGER: {
    resourceName: 'Cloud Build Trigger',
    _type: 'google_cloud_build_trigger',
    _class: ['Rule'],
  },
};

export const CloudBuildRelationshipsSpec = {};
