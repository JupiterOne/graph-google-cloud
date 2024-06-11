import {
  createDirectRelationship,
  IntegrationMissingKeyError,
  RelationshipClass,
} from '@jupiterone/integration-sdk-core';
import {
  GoogleCloudIntegrationStep,
  IntegrationStepContext,
} from '../../types';
import { dataFlowClient } from './client'
import {
  IngestionSources,
  STEP_GOOGLE_CLOUD_DATAFLOW_DATASTORE,
  GOOGLE_CLOUD_DATAFLOW_DATASTORE_TYPE,
  GOOGLE_CLOUD_DATAFLOW_DATASTORE_CLASS,
  STEP_GOOGLE_CLOUD_DATAFLOW,
  GOOGLE_CLOUD_DATAFLOW_TYPE,
  GOOGLE_CLOUD_DATAFLOW_CLASS,
  STEP_GOOGLE_CLOUD_PROJECT_HAS_GOOGLE_CLOUD_DATAFLOW_DATASTORE,
  RELATIONSHIP_TYPE_GOOGLE_CLOUD_PROJECT_HAS_GOOGLE_CLOUD_DATAFLOW_DATASTORE,
  STEP_GOOGLE_CLOUD_PROJECT_HAS_GOOGLE_CLOUD_DATAFLOW_JOB,
  RELATIONSHIP_TYPE_GOOGLE_CLOUD_PROJECT_HAS_GOOGLE_CLOUD_DATAFLOW_JOB,
  GOOGLE_CLOUD_DATAFLOW_JOB_TYPE,
  STEP_GOOGLE_CLOUD_DATAFLOW_JOB,
  STEP_GOOGLE_CLOUD_DATAFLOW_JOB_USES_GOOGLE_CLOUD_DATAFLOW_DATASTORE,
  RELATIONSHIP_TYPE_GOOGLE_CLOUD_DATAFLOW_JOB_USES_GOOGLE_CLOUD_DATAFLOW_DATASTORE,
  STEP_GOOGLE_CLOUD_PROJECT_HAS_GOOGLE_CLOUD_DATAFLOW,
  RELATIONSHIP_TYPE_GOOGLE_CLOUD_PROJECT_HAS_GOOGLE_CLOUD_DATAFLOW,
  STEP_GOOGLE_CLOUD_DATAFLOW_SNAPSHOT,
  GOOGLE_CLOUD_DATAFLOW_SNAPSHOT_TYPE,
  GOOGLE_CLOUD_DATAFLOW_SNAPSHOT_CLASS,
  STEP_GOOGLE_CLOUD_DATAFLOW_SNAPSHOT_USES_GOOGLE_PUBSUB_TOPIC,
  RELATIONSHIP_TYPE_GOOGLE_CLOUD_DATAFLOW_SNAPSHOT_USES_GOOGLE_PUBSUB_TOPIC,
  STEP_GOOGLE_CLOUD_DATAFLOW_USES_GOOGLE_SPANNER_INSTANCE,
  RELATIONSHIP_TYPE_GOOGLE_CLOUD_DATAFLOW_USES_GOOGLE_SPANNER_INSTANCE,
  GOOGLE_CLOUD_DATAFLOW_JOB_CLASS
} from './constants';
import {
  createGoogleCloudDataFlowEntity,
  createGoogleCloudDataFlowDataStoreEntity,
  createGoogleCloudDataFlowJobEntity,
} from './converters';
import { PROJECT_ENTITY_TYPE, STEP_RESOURCE_MANAGER_PROJECT } from '../resource-manager';
import { getProjectEntity } from '../../utils/project';
import { ENTITY_TYPE_PUBSUB_TOPIC, STEP_PUBSUB_TOPICS } from '../pub-sub/constants';
import { ENTITY_TYPE_SPANNER_INSTANCE, STEP_SPANNER_INSTANCES } from '../spanner/constants';

export async function fetchGoogleCloudDataFlowDataStore(
  context: IntegrationStepContext,
): Promise<void> {
  const {
    jobState,
  } = context;

  await jobState.iterateEntities(
    { _type: GOOGLE_CLOUD_DATAFLOW_JOB_TYPE },
    async (dataflowEntity) => { 

      const dataflowDataStore = dataflowEntity.datastoreDetails as any;
      for(const datastore in dataflowDataStore){
      if (datastore) {
        const dataflow=dataflowEntity.datastoreDetails[datastore]
        await jobState.addEntity(createGoogleCloudDataFlowDataStoreEntity(dataflow as any));
      }
    }
  }
  );
}

export async function fetchGoogleCloudDataFlowJob(
  context: IntegrationStepContext,
): Promise<void> {
  const {
    jobState,
    instance: { config },
    logger,
  } = context;

  const client = new dataFlowClient({ config }, logger);

  await client.iterateGoogleCloudDataFlowJob(async (dataflow) => {
    await jobState.addEntity(createGoogleCloudDataFlowJobEntity(dataflow));
  });
}

export async function fetchGoogleCloudDataFlowService(
  context: IntegrationStepContext,
): Promise<void> {
  const {
    jobState,
    instance: { config },
    logger,
  } = context;

  const client = new dataFlowClient({ config }, logger);
  await jobState.addEntity(createGoogleCloudDataFlowEntity(client.projectId));
}

export async function fetchGoogleCloudDataFlowSnapshot(
  context: IntegrationStepContext,
): Promise<void> {
  const {
    instance: { config },
    logger,
  } = context;

  const client = new dataFlowClient({ config }, logger);
  console.log(";;;;;;;;")
  await client.iterateGoogleCloudDataFlowSnapshot(async (snapshot) => {
    console.log(snapshot+"''''''''")
  }
)
}


export async function buildProjectHasDataflowDatastoreRelationship(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState } = context;

  const projectEntity = await getProjectEntity(jobState);

  if (!projectEntity) return;

  await jobState.iterateEntities(
    { _type: GOOGLE_CLOUD_DATAFLOW_DATASTORE_TYPE },
    async (DataStore) => {
      const projectId=projectEntity.projectId as string
    
      if(DataStore.projectId === projectId)
      await jobState.addRelationship(
        createDirectRelationship({
          _class: RelationshipClass.HAS,
          fromKey: projectEntity._key as string,
          fromType: PROJECT_ENTITY_TYPE,
          toKey: DataStore._key as string,
          toType: GOOGLE_CLOUD_DATAFLOW_DATASTORE_TYPE,
        }),
      );
    },
  );
}

export async function buildProjectHasDataflowRelationship(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState } = context;

  const projectEntity = await getProjectEntity(jobState);

  if (!projectEntity) return;

  await jobState.iterateEntities(
    { _type: GOOGLE_CLOUD_DATAFLOW_TYPE },
    async (dataflow) => {
      await jobState.addRelationship(
        createDirectRelationship({
          _class: RelationshipClass.HAS,
          fromKey: projectEntity._key as string,
          fromType: PROJECT_ENTITY_TYPE,
          toKey: dataflow._key as string,
          toType: GOOGLE_CLOUD_DATAFLOW_TYPE,
        }),
      );
    },
  );
}

export async function buildProjectHasDataflowJobRelationship(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState } = context;

  const projectEntity = await getProjectEntity(jobState);

  if (!projectEntity) return;

  await jobState.iterateEntities(
    { _type: GOOGLE_CLOUD_DATAFLOW_JOB_TYPE },
    async (dataflowJob) => {
      await jobState.addRelationship(
        createDirectRelationship({
          _class: RelationshipClass.HAS,
          fromKey: projectEntity._key as string,
          fromType: PROJECT_ENTITY_TYPE,
          toKey: dataflowJob._key as string,
          toType: GOOGLE_CLOUD_DATAFLOW_JOB_TYPE,
        }),
      );
    },
  );
}

export async function buildDataflowUsesDataflowDatastoreRelationship(
  executionContext: IntegrationStepContext,
) {
  const { jobState } = executionContext;

  await jobState.iterateEntities(
    { _type: GOOGLE_CLOUD_DATAFLOW_JOB_TYPE },
    async (dataflowEntity) => {
      const dataflowDataStore = dataflowEntity.datastoreDetails as any;
      for(const datastore in dataflowDataStore){

        const dataflow=dataflowEntity.datastoreDetails[datastore]
        const dataStoreKey = (dataflow.namespace+"/"+dataflow.projectId) as string

      const hasDataStoreKey = jobState.hasKey(dataStoreKey);

      if (!hasDataStoreKey) {
        throw new IntegrationMissingKeyError(
          `Cannot build Relationship.
          Error: Missing Key.
          dataflowJobKey : ${dataStoreKey}`,
        );
      }
      else{
      await jobState.addRelationship(
        createDirectRelationship({
          _class: RelationshipClass.USES,
          fromKey: dataflowEntity._key as string,
          fromType: GOOGLE_CLOUD_DATAFLOW_JOB_TYPE,
          toKey: dataStoreKey as string,
          toType: GOOGLE_CLOUD_DATAFLOW_DATASTORE_TYPE,
        }),
      );
    }}
  }
  );
}

export async function buildCloudDataflowSpannerInstanceRelation(
  executionContext: IntegrationStepContext,
) {
  const { jobState } = executionContext;
  await jobState.iterateEntities(

    { _type: ENTITY_TYPE_SPANNER_INSTANCE },
    async (cloudSpannerInstanceEntity) => {

      const dataflowJobKey = cloudSpannerInstanceEntity.name as string

      const hasDataflowJobKey = jobState.hasKey(dataflowJobKey);

      if (!hasDataflowJobKey) {
        throw new IntegrationMissingKeyError(
          `Cannot build Relationship.
          Error: Missing Key.
          dataflowJobKey : ${dataflowJobKey}`,
        );
      }

      await jobState.addRelationship(
        createDirectRelationship({
          _class: RelationshipClass.USES,
          fromKey: dataflowJobKey,
          fromType: GOOGLE_CLOUD_DATAFLOW_JOB_TYPE,
          toKey: cloudSpannerInstanceEntity._key,
          toType: ENTITY_TYPE_SPANNER_INSTANCE,
        }),
      );
    },
  );
}

export async function buildCloudDataflowSnapshotPubsubTopicRelation(
  executionContext: IntegrationStepContext,
) {
  const { jobState } = executionContext;
  await jobState.iterateEntities(

    { _type: GOOGLE_CLOUD_DATAFLOW_SNAPSHOT_TYPE },
    async (snapshotEntity) => {

      const pubsubKey = snapshotEntity.pubsubName as string

      const haspubsubKey = jobState.hasKey(pubsubKey);

      if (!haspubsubKey) {
        throw new IntegrationMissingKeyError(
          `Cannot build Relationship.
          Error: Missing Key.
          haspubsubKey : ${haspubsubKey}`,
        );
      }

      await jobState.addRelationship(
        createDirectRelationship({
          _class: RelationshipClass.USES,
          fromKey: snapshotEntity._key,
          fromType: GOOGLE_CLOUD_DATAFLOW_SNAPSHOT_TYPE,
          toKey: pubsubKey,
          toType: ENTITY_TYPE_PUBSUB_TOPIC,
        }),
      );
    },
  );
}

export const dataFlowSteps: GoogleCloudIntegrationStep[] = [
  {
    id: STEP_GOOGLE_CLOUD_DATAFLOW,
    ingestionSourceId: IngestionSources.GOOGLE_CLOUD_DATAFLOW,
    name: 'Google Cloud Dataflow',
    entities: [
      {
        resourceName: 'Google Cloud Dataflow',
        _type: GOOGLE_CLOUD_DATAFLOW_TYPE,
        _class: GOOGLE_CLOUD_DATAFLOW_CLASS,
      },
    ],
    relationships: [],
    dependsOn: [],
    executionHandler: fetchGoogleCloudDataFlowService,
    apis: ['dataflow.googleapis.com'],
  },
  {
    id: STEP_GOOGLE_CLOUD_DATAFLOW_JOB,
    ingestionSourceId: IngestionSources.GOOGLE_CLOUD_DATAFLOW_JOB,
    name: 'Google Cloud Dataflow Job',
    entities: [
      {
        resourceName: 'Google Cloud Dataflow Job',
        _type: GOOGLE_CLOUD_DATAFLOW_JOB_TYPE,
        _class: GOOGLE_CLOUD_DATAFLOW_JOB_CLASS,
      },
    ],
    relationships: [],
    dependsOn: [],
    executionHandler: fetchGoogleCloudDataFlowJob,
    apis: ['dataflow.googleapis.com'],
  },
  {
    id: STEP_GOOGLE_CLOUD_DATAFLOW_DATASTORE,
    ingestionSourceId: IngestionSources.GOOGLE_CLOUD_DATAFLOW_DATASTORE,
    name: 'Google Cloud Dataflow Datastore',
    entities: [
      {
        resourceName: 'Google Cloud Dataflow Datastore',
        _type: GOOGLE_CLOUD_DATAFLOW_DATASTORE_TYPE,
        _class: GOOGLE_CLOUD_DATAFLOW_DATASTORE_CLASS,
      },
    ],
    relationships: [],
    dependsOn: [STEP_GOOGLE_CLOUD_DATAFLOW_JOB],
    executionHandler: fetchGoogleCloudDataFlowDataStore,
    apis: ['dataflow.googleapis.com'],
  },
  {
    id: STEP_GOOGLE_CLOUD_PROJECT_HAS_GOOGLE_CLOUD_DATAFLOW_DATASTORE,
    ingestionSourceId:
      IngestionSources.GOOGLE_CLOUD_PROJECT_HAS_GOOGLE_CLOUD_DATAFLOW_DATASTORE,
    name: 'Project HAS DataFlow Datastore',
    entities: [],
    relationships: [
      {
        _class: RelationshipClass.HAS,
        _type: RELATIONSHIP_TYPE_GOOGLE_CLOUD_PROJECT_HAS_GOOGLE_CLOUD_DATAFLOW_DATASTORE,
        sourceType: PROJECT_ENTITY_TYPE,
        targetType: GOOGLE_CLOUD_DATAFLOW_DATASTORE_TYPE,
      },
    ],
    dependsOn: [
      STEP_RESOURCE_MANAGER_PROJECT,
      STEP_GOOGLE_CLOUD_DATAFLOW_DATASTORE,
    ],
    executionHandler: buildProjectHasDataflowDatastoreRelationship,
    permissions: [],
    apis: ['dataflow.googleapis.com'],
  },
  {
    id: STEP_GOOGLE_CLOUD_PROJECT_HAS_GOOGLE_CLOUD_DATAFLOW,
    ingestionSourceId:
      IngestionSources.GOOGLE_CLOUD_PROJECT_HAS_GOOGLE_CLOUD_DATAFLOW,
    name: 'Project HAS DataFlow',
    entities: [],
    relationships: [
      {
        _class: RelationshipClass.HAS,
        _type: RELATIONSHIP_TYPE_GOOGLE_CLOUD_PROJECT_HAS_GOOGLE_CLOUD_DATAFLOW,
        sourceType: PROJECT_ENTITY_TYPE,
        targetType: GOOGLE_CLOUD_DATAFLOW_TYPE,
      },
    ],
    dependsOn: [
      STEP_RESOURCE_MANAGER_PROJECT,
      STEP_GOOGLE_CLOUD_DATAFLOW,
    ],
    executionHandler: buildProjectHasDataflowRelationship,
    permissions: [],
    apis: ['dataflow.googleapis.com'],
  },
  {
    id: STEP_GOOGLE_CLOUD_PROJECT_HAS_GOOGLE_CLOUD_DATAFLOW_JOB,
    ingestionSourceId:
      IngestionSources.GOOGLE_CLOUD_PROJECT_HAS_GOOGLE_CLOUD_DATAFLOW_JOB,
    name: 'Project HAS DataFlow Job',
    entities: [],
    relationships: [
      {
        _class: RelationshipClass.HAS,
        _type: RELATIONSHIP_TYPE_GOOGLE_CLOUD_PROJECT_HAS_GOOGLE_CLOUD_DATAFLOW_JOB,
        sourceType: PROJECT_ENTITY_TYPE,
        targetType: GOOGLE_CLOUD_DATAFLOW_JOB_TYPE,
      },
    ],
    dependsOn: [
      STEP_RESOURCE_MANAGER_PROJECT,
      STEP_GOOGLE_CLOUD_DATAFLOW_JOB,
    ],
    executionHandler: buildProjectHasDataflowJobRelationship,
    permissions: [],
    apis: ['dataflow.googleapis.com'],
  },
  {
    id: STEP_GOOGLE_CLOUD_DATAFLOW_JOB_USES_GOOGLE_CLOUD_DATAFLOW_DATASTORE,
    ingestionSourceId:
      IngestionSources.GOOGLE_CLOUD_DATAFLOW_JOB_USES_GOOGLE_CLOUD_DATAFLOW_DATASTORE,
    name: 'DataFlow HAS DataFlow Datastore',
    entities: [],
    relationships: [
      {
        _class: RelationshipClass.USES,
        _type: RELATIONSHIP_TYPE_GOOGLE_CLOUD_DATAFLOW_JOB_USES_GOOGLE_CLOUD_DATAFLOW_DATASTORE,
        sourceType: GOOGLE_CLOUD_DATAFLOW_JOB_TYPE,
        targetType: GOOGLE_CLOUD_DATAFLOW_DATASTORE_TYPE,
      },
    ],
    dependsOn: [
      STEP_GOOGLE_CLOUD_DATAFLOW_DATASTORE,
      STEP_GOOGLE_CLOUD_DATAFLOW_JOB,
    ],
    executionHandler: buildDataflowUsesDataflowDatastoreRelationship,
    permissions: [],
    apis: ['dataflow.googleapis.com'],
  },
  {
    id: STEP_GOOGLE_CLOUD_DATAFLOW_SNAPSHOT,
    ingestionSourceId: IngestionSources.GOOGLE_CLOUD_DATAFLOW_SNAPSHOT,
    name: 'Google Cloud Dataflow Snapshot',
    entities: [
      {
        resourceName: 'Google Cloud Dataflow Datastore',
        _type: GOOGLE_CLOUD_DATAFLOW_SNAPSHOT_TYPE,
        _class: GOOGLE_CLOUD_DATAFLOW_SNAPSHOT_CLASS,
      },
    ],
    relationships: [],
    dependsOn: [],
    executionHandler: fetchGoogleCloudDataFlowSnapshot,
    apis: ['dataflow.googleapis.com'],
  },
  {
    id: STEP_GOOGLE_CLOUD_DATAFLOW_SNAPSHOT_USES_GOOGLE_PUBSUB_TOPIC,
    ingestionSourceId: IngestionSources.GOOGLE_CLOUD_DATAFLOW_SNAPSHOT_USES_GOOGLE_PUBSUB_TOPIC,
    name: 'Google Cloud Dataflow Snapshot uses Google pubsub',
    entities: [],
    relationships: [
      {
        _class: RelationshipClass.HAS,
        _type: RELATIONSHIP_TYPE_GOOGLE_CLOUD_DATAFLOW_SNAPSHOT_USES_GOOGLE_PUBSUB_TOPIC,
        sourceType: GOOGLE_CLOUD_DATAFLOW_SNAPSHOT_TYPE,
        targetType: ENTITY_TYPE_PUBSUB_TOPIC,
      },
    ],
    dependsOn: [STEP_GOOGLE_CLOUD_DATAFLOW_SNAPSHOT, STEP_PUBSUB_TOPICS],
    executionHandler: buildCloudDataflowSnapshotPubsubTopicRelation,
    apis: ['dataflow.googleapis.com'],
  },
  {
    id: STEP_GOOGLE_CLOUD_DATAFLOW_USES_GOOGLE_SPANNER_INSTANCE,
    ingestionSourceId: IngestionSources.GOOGLE_CLOUD_DATAFLOW_USES_GOOGLE_SPANNER_INSTANCE,
    name: 'Google Cloud Dataflow uses Google Spanner Instance',
    entities: [],
    relationships: [
      {
        _class: RelationshipClass.USES,
        _type: RELATIONSHIP_TYPE_GOOGLE_CLOUD_DATAFLOW_USES_GOOGLE_SPANNER_INSTANCE,
        sourceType: GOOGLE_CLOUD_DATAFLOW_TYPE,
        targetType: ENTITY_TYPE_SPANNER_INSTANCE,
      },
    ],
    dependsOn: [STEP_SPANNER_INSTANCES, STEP_GOOGLE_CLOUD_DATAFLOW],
    executionHandler: buildCloudDataflowSpannerInstanceRelation,
    apis: ['dataflow.googleapis.com'],
  },
  // {
  //   id: STEP_GOOGLE_CLOUD_DATAFLOW_JOB_HAS_GOOGLE_CLOUD_DATAFLOW_SNAPSHOT,
  //   ingestionSourceId: IngestionSources.GOOGLE_CLOUD_DATAFLOW_JOB_HAS_GOOGLE_CLOUD_DATAFLOW_SNAPSHOT,
  //   name: 'Google Cloud Dataflow Has Google Cloud DataFlow SNapshot',
  //   entities: [],
  //   relationships: [
  //     {
  //       _class: RelationshipClass.USES,
  //       _type: RELATIONSHIP_TYPE_GOOGLE_CLOUD_DATAFLOW_JOB_HAS_GOOGLE_CLOUD_DATAFLOW_SNAPSHOT,
  //       sourceType: GOOGLE_CLOUD_DATAFLOW_TYPE,
  //       targetType: ENTITY_TYPE_SPANNER_INSTANCE,
  //     },
  //   ],
  //   dependsOn: [STEP_SPANNER_INSTANCES, STEP_GOOGLE_CLOUD_DATAFLOW],
  //   executionHandler: buildCloudDataflowSnapshoteRelation,
  //   apis: ['dataflow.googleapis.com'],
  // },
];

