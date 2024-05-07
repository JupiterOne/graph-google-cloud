import { dataflow_v1b3 } from 'googleapis';
import { createGoogleCloudIntegrationEntity } from '../../utils/entity';
import { GOOGLE_CLOUD_DATAFLOW_CLASS, GOOGLE_CLOUD_DATAFLOW_DATASTORE_CLASS, GOOGLE_CLOUD_DATAFLOW_DATASTORE_TYPE, GOOGLE_CLOUD_DATAFLOW_JOB_CLASS, GOOGLE_CLOUD_DATAFLOW_JOB_TYPE, GOOGLE_CLOUD_DATAFLOW_TYPE } from './constants';

export function createGoogleCloudDataFlowEntity(serviceObj) {
  const data = {
    ...serviceObj, // organizationId, projectId, instanceId
    name: 'Google Cloud Data Flow',
  };
  return createGoogleCloudIntegrationEntity(serviceObj, {
    entityData: {
      source: {},
      assign: {
        _class: GOOGLE_CLOUD_DATAFLOW_CLASS,
        _type: GOOGLE_CLOUD_DATAFLOW_TYPE,
        _key: `${GOOGLE_CLOUD_DATAFLOW_TYPE}:${serviceObj}`,
        name: data.name,
        function: ['workflow', 'networking'],
        category: ['network', 'security'],
      },
    },
  });
}

export function createGoogleCloudDataFlowJobEntity(
  data: dataflow_v1b3.Schema$Job,
  projectId: string,
) {
  return createGoogleCloudIntegrationEntity(data, {
    entityData: {
      source: data,
      assign: {
        _key: data.id as string,
        _type: GOOGLE_CLOUD_DATAFLOW_JOB_TYPE,
        _class: GOOGLE_CLOUD_DATAFLOW_JOB_CLASS,
        id: data.id as string,
        name: data.name,
        displayName: data.name as string,
        description: data.environment as string,
      },
    },
  });
}

export function createGoogleCloudDataFlowDataStoreEntity(
  data: dataflow_v1b3.Schema$DatastoreIODetails,
) {
  return createGoogleCloudIntegrationEntity(data, {
    entityData: {
      source: data,
      assign: {
        _key: data.namespace as string,
        _type: GOOGLE_CLOUD_DATAFLOW_DATASTORE_TYPE,
        _class: GOOGLE_CLOUD_DATAFLOW_DATASTORE_CLASS,
        projectId: data.projectId as string,
        name: data.namespace,
        encrypted: false,
      },
    },
  });
}

export function createGoogleCloudDataFlowSnapshotEntity(
  data: dataflow_v1b3.Schema$Snapshot,
  jobId:string,
) {
  return createGoogleCloudIntegrationEntity(data, {
    entityData: {
      source: data,
      assign: {
        _key: data.id as string,
        _type: GOOGLE_CLOUD_DATAFLOW_DATASTORE_TYPE,
        _class: GOOGLE_CLOUD_DATAFLOW_DATASTORE_CLASS,
        projectId: data.projectId as string,
        name: data.diskSizeBytes,
        classification: data.diskSizeBytes,
        encrypted: false,
        jobId: jobId
      },
    },
  });
}
