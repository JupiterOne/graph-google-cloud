import {
    createMockStepExecutionContext,
    Recording,
  } from '@jupiterone/integration-sdk-testing';
  import {
    fetchGoogleCloudDataFlowDataStore,
    fetchGoogleCloudDataFlowJob,
    fetchGoogleCloudDataFlowService,
    fetchGoogleCloudDataFlowSnapshot,
  } from '.';
  import { integrationConfig } from '../../../test/config';
  import { setupGoogleCloudRecording } from '../../../test/recording';
  import { IntegrationConfig } from '../../types';
  import {
    GOOGLE_CLOUD_DATAFLOW_DATASTORE_TYPE,
    GOOGLE_CLOUD_DATAFLOW_JOB_CLASS,
    GOOGLE_CLOUD_DATAFLOW_SNAPSHOT_TYPE,
    GOOGLE_CLOUD_DATAFLOW_TYPE,
  } from './constants';
  
  const tempNewAccountConfig = {
    ...integrationConfig,
    serviceAccountKeyFile: integrationConfig.serviceAccountKeyFile.replace(
      'j1-gc-integration-dev-v2',
      'j1-gc-integration-dev-v3',
    ),
    serviceAccountKeyConfig: {
      ...integrationConfig.serviceAccountKeyConfig,
      project_id: 'j1-gc-integration-dev-v3',
    },
  };
  
  describe('#fetchGoogleCloudDataFlowService', () => {
    let recording: Recording;
  
    beforeEach(() => {
      recording = setupGoogleCloudRecording({
        directory: __dirname,
        name: 'fetchGoogleCloudDataFlowService',
      });
    });
  
    afterEach(async () => {
      await recording.stop();
    });
  
    test('should collect data', async () => {
      const context = createMockStepExecutionContext<IntegrationConfig>({
        instanceConfig: tempNewAccountConfig,
      });
  
      await fetchGoogleCloudDataFlowService(context);
  
      expect({
        numCollectedEntities: context.jobState.collectedEntities.length,
        numCollectedRelationships: context.jobState.collectedRelationships.length,
        collectedEntities: context.jobState.collectedEntities,
        collectedRelationships: context.jobState.collectedRelationships,
        encounteredTypes: context.jobState.encounteredTypes,
      }).toMatchSnapshot();
  
      expect(
        context.jobState.collectedEntities.filter(
          (e) => e.type === GOOGLE_CLOUD_DATAFLOW_TYPE,
        ),
      ).toMatchGraphObjectSchema({
        _class: ['Service'],
        schema: {
          additionalProperties: false,
          properties: {
            _type: { const: 'google_cloud_dataflow' },
            name: { type: 'string' },
            category: { type: 'array' },
            function: { type: 'array' },
          },
        },
      });
    });
  });
  
  describe('#fetchGoogleCloudDataFlowJob', () => {
    let recording: Recording;
  
    beforeEach(() => {
      recording = setupGoogleCloudRecording({
        directory: __dirname,
        name: 'fetchGoogleCloudDataFlowJob',
      });
    });
  
    afterEach(async () => {
      await recording.stop();
    });
  
    test('should collect data', async () => {
      const context = createMockStepExecutionContext<IntegrationConfig>({
        instanceConfig: tempNewAccountConfig,
      });
  
      await fetchGoogleCloudDataFlowJob(context);
  
      expect({
        numCollectedEntities: context.jobState.collectedEntities.length,
        numCollectedRelationships: context.jobState.collectedRelationships.length,
        collectedEntities: context.jobState.collectedEntities,
        collectedRelationships: context.jobState.collectedRelationships,
        encounteredTypes: context.jobState.encounteredTypes,
      }).toMatchSnapshot();
  
      expect(
        context.jobState.collectedEntities.filter(
          (e) => e.type === GOOGLE_CLOUD_DATAFLOW_JOB_CLASS,
        ),
      ).toMatchGraphObjectSchema({
        _class: ['Workflow'],
        schema: {
          additionalProperties: false,
          properties: {
            _type: { const: 'google_cloud_dataflow_job' },
            name: { type: 'string' },
            displayname: { type: 'string' },
            description: { type: 'string' },
          },
        },
      });
    });
  });
  
  describe('#fetchGoogleCloudDataFlowDataStore', () => {
    let recording: Recording;
  
    beforeEach(() => {
      recording = setupGoogleCloudRecording({
        directory: __dirname,
        name: 'fetchGoogleCloudDataFlowDataStore',
      });
    });
  
    afterEach(async () => {
      await recording.stop();
    });
  
    test('should collect data', async () => {
      const context = createMockStepExecutionContext<IntegrationConfig>({
        instanceConfig: tempNewAccountConfig,
      });
  
      await fetchGoogleCloudDataFlowDataStore(context);
  
      expect({
        numCollectedEntities: context.jobState.collectedEntities.length,
        numCollectedRelationships: context.jobState.collectedRelationships.length,
        collectedEntities: context.jobState.collectedEntities,
        collectedRelationships: context.jobState.collectedRelationships,
        encounteredTypes: context.jobState.encounteredTypes,
      }).toMatchSnapshot();
  
      expect(
        context.jobState.collectedEntities.filter(
          (e) => e.type === GOOGLE_CLOUD_DATAFLOW_DATASTORE_TYPE,
        ),
      ).toMatchGraphObjectSchema({
        _class: ['Datastore'],
        schema: {
          additionalProperties: false,
          properties: {
            _type: { const: 'google_cloud_dataflow_datastore' },
            name: { type: 'string' },
            encrypted: { type: 'string' },
            projectId: { type: 'string' },
          },
        },
      });
    });
  });
  
  describe('#fetchGoogleCloudDataFlowSnapshot', () => {
    let recording: Recording;
  
    beforeEach(() => {
      recording = setupGoogleCloudRecording({
        directory: __dirname,
        name: 'fetchGoogleCloudDataFlowSnapshot',
      });
    });
  
    afterEach(async () => {
      await recording.stop();
    });
  
    test('should collect data', async () => {
      const context = createMockStepExecutionContext<IntegrationConfig>({
        instanceConfig: tempNewAccountConfig,
      });
  
      await fetchGoogleCloudDataFlowSnapshot(context);
      expect({
        numCollectedEntities: context.jobState.collectedEntities.length,
        numCollectedRelationships: context.jobState.collectedRelationships.length,
        collectedEntities: context.jobState.collectedEntities,
        collectedRelationships: context.jobState.collectedRelationships,
        encounteredTypes: context.jobState.encounteredTypes,
      }).toMatchSnapshot();
  
      expect(
        context.jobState.collectedEntities.filter(
          (e) => e.type === GOOGLE_CLOUD_DATAFLOW_SNAPSHOT_TYPE,
        ),
      ).toMatchGraphObjectSchema({
        _class: ['Database'],
        schema: {
          additionalProperties: false,
          properties: {
            _type: { const: 'google_bigtable_backup' },
            name: { type: 'string' },
            projectId: { type: 'string' },
            classification: { type: 'string' },
            encrypted: { type: 'boolean' },
            jobId: { type: 'string' },
          },
        },
      });
    });
  });
  
  