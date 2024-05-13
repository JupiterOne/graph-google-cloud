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
        projectId: data.projectId,
        type: data.type,
        stepLocation: data.stepsLocation,
        currentState: data.currentState,
        currentStateTime: data.currentStateTime,
        requestedState: data.requestedState,
        createTime: data.createTime,
        replaceJobId: data.replaceJobId,
        clientRequestId: data.clientRequestId,
        location: data.location,
        version: data.jobMetadata?.sdkVersion?.version,
        startTime: data.startTime,
        createFromSnapshotId: data.createdFromSnapshotId,
        satisfiesPzs: data.satisfiesPzs,
        satisfiesPzi: data.satisfiesPzi,
        maxNumWorkers: data.runtimeUpdatableParams?.maxNumWorkers,
        minNumWorkers: data.runtimeUpdatableParams?.minNumWorkers
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
        sourceJobId: data.sourceJobId,
        jobId: jobId,
        creationTime: data.creationTime,
        ttl: data.ttl,
        state: data.state,
        description: data.description,
        region: data.region,
        diskSizeBytes: data.diskSizeBytes,
      },
    },
  });
}
