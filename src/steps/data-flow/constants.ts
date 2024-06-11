export const STEP_GOOGLE_CLOUD_DATAFLOW_DATASTORE = 'fetch-google-cloud-dataflow-datastore';
export const GOOGLE_CLOUD_DATAFLOW_DATASTORE_CLASS = 'Datastore';
export const GOOGLE_CLOUD_DATAFLOW_DATASTORE_TYPE = 'google_cloud_dataflow_datastore';

export const STEP_GOOGLE_CLOUD_DATAFLOW = 'fetch-google-cloud-dataflow';
export const GOOGLE_CLOUD_DATAFLOW_CLASS = 'Service';
export const GOOGLE_CLOUD_DATAFLOW_TYPE = 'google_cloud_dataflow';

export const STEP_GOOGLE_CLOUD_DATAFLOW_JOB = 'fetch-google-cloud-dataflow-job';
export const GOOGLE_CLOUD_DATAFLOW_JOB_CLASS = ['Workflow'];
export const GOOGLE_CLOUD_DATAFLOW_JOB_TYPE = 'google_cloud_dataflow_job';


export const STEP_GOOGLE_CLOUD_PROJECT_HAS_GOOGLE_CLOUD_DATAFLOW_DATASTORE =
  'fetch-project-has-google-cloud-dataflow-datastore';
export const RELATIONSHIP_TYPE_GOOGLE_CLOUD_PROJECT_HAS_GOOGLE_CLOUD_DATAFLOW_DATASTORE =
  'google_cloud_project_has_google_cloud_dataflow_datastore';

export const STEP_GOOGLE_CLOUD_PROJECT_HAS_GOOGLE_CLOUD_DATAFLOW =
  'fetch-project-has-google-cloud-dataflow';
export const RELATIONSHIP_TYPE_GOOGLE_CLOUD_PROJECT_HAS_GOOGLE_CLOUD_DATAFLOW =
  'google_cloud_project_has_dataflow';

export const STEP_GOOGLE_CLOUD_PROJECT_HAS_GOOGLE_CLOUD_DATAFLOW_JOB =
  'fetch-project-has-google-cloud-dataflow-job';
export const RELATIONSHIP_TYPE_GOOGLE_CLOUD_PROJECT_HAS_GOOGLE_CLOUD_DATAFLOW_JOB =
  'google_cloud_project_has_dataflow_job';

export const STEP_GOOGLE_CLOUD_DATAFLOW_JOB_USES_GOOGLE_CLOUD_DATAFLOW_DATASTORE =
  'fetch-google-cloud-dataflow-job-uses-google-cloud-dataflow-datastore';
export const RELATIONSHIP_TYPE_GOOGLE_CLOUD_DATAFLOW_JOB_USES_GOOGLE_CLOUD_DATAFLOW_DATASTORE =
  'google_cloud_dataflow_job_uses_google_cloud_dataflow_datastore';


export const STEP_GOOGLE_CLOUD_DATAFLOW_USES_GOOGLE_SPANNER_INSTANCE =
  'fetch-google-cloud-dataflow-uses-google-spanner-instance';
export const RELATIONSHIP_TYPE_GOOGLE_CLOUD_DATAFLOW_USES_GOOGLE_SPANNER_INSTANCE =
  'google_cloud_dataflow_uses_google_spanner_instance';

export const IngestionSources = {
  GOOGLE_CLOUD_DATAFLOW_DATASTORE: 'google-cloud-dataflow-datastore',
  GOOGLE_CLOUD_DATAFLOW: 'google-cloud-dataflow',
  GOOGLE_CLOUD_DATAFLOW_JOB: 'google-cloud-dataflow-job',
  GOOGLE_CLOUD_PROJECT_HAS_GOOGLE_CLOUD_DATAFLOW_DATASTORE: 'google-cloud-project-has-google-cloud-dataflow-datastore-job',
  GOOGLE_CLOUD_PROJECT_HAS_GOOGLE_CLOUD_DATAFLOW: 'google-cloud-project-has-google-cloud-dataflow',
  GOOGLE_CLOUD_PROJECT_HAS_GOOGLE_CLOUD_DATAFLOW_JOB: 'google-cloud-project-has-google-cloud-dataflow-job',
  GOOGLE_CLOUD_DATAFLOW_JOB_USES_GOOGLE_CLOUD_DATAFLOW_DATASTORE: 'google-cloud-dataflow-job-uses-google-cloud-dataflow-datastore',
  GOOGLE_CLOUD_DATAFLOW_USES_GOOGLE_SPANNER_INSTANCE: 'google-cloud-dataflow-uses-google-spanner-instance'
};

export const DataflowIngestionConfig = {
  [IngestionSources.GOOGLE_CLOUD_DATAFLOW]: {
    title: 'Google Cloud Dataflow',
    description: '',
    defaultsToDisabled: false,
  },
  [IngestionSources.GOOGLE_CLOUD_DATAFLOW_DATASTORE]: {
    title: 'Google Cloud Dataflow Datastore',
    description: '',
    defaultsToDisabled: false,
  },
  [IngestionSources.GOOGLE_CLOUD_DATAFLOW_JOB]: {
    title: 'Google Cloud Dataflow Job',
    description: '',
    defaultsToDisabled: false,
  },
  [IngestionSources.GOOGLE_CLOUD_PROJECT_HAS_GOOGLE_CLOUD_DATAFLOW_DATASTORE]: {
    title: 'Google Cloud Project has Google Cloud Dataflow Datastore Job',
    description: '',
    defaultsToDisabled: false,
  },
  [IngestionSources.GOOGLE_CLOUD_PROJECT_HAS_GOOGLE_CLOUD_DATAFLOW]: {
    title: 'Google Cloud Project has Google Cloud Dataflow',
    description: '',
    defaultsToDisabled: false,
  },
  [IngestionSources.GOOGLE_CLOUD_PROJECT_HAS_GOOGLE_CLOUD_DATAFLOW_JOB]: {
    title: 'Google Cloud Project has Google Cloud Dataflow Job',
    description: '',
    defaultsToDisabled: false,
  },
  [IngestionSources.GOOGLE_CLOUD_DATAFLOW_JOB_USES_GOOGLE_CLOUD_DATAFLOW_DATASTORE]: {
    title: 'Google Cloud Dataflow Job Uses Google Cloud Dataflow Datastore',
    description: '',
    defaultsToDisabled: false,
  },
  [IngestionSources.GOOGLE_CLOUD_DATAFLOW_USES_GOOGLE_SPANNER_INSTANCE]: {
    title: 'Google Cloud Dataflow Uses Google Spanner Instance',
    description: '',
    defaultsToDisabled: false,
  }
};

export const DataFlowPermissions = {
  STEP_GOOGLE_CLOUD_DATAFLOW_JOB: ['dataflow.jobs.list'],
};
