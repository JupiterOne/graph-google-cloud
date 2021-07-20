import {
  createMockStepExecutionContext,
  Recording,
} from '@jupiterone/integration-sdk-testing';
import { integrationConfig } from '../../../test/config';
import { setupGoogleCloudRecording } from '../../../test/recording';
import { IntegrationConfig } from '../../types';
import { fetchDataprocClusters } from '.';
import { ENTITY_TYPE_DATAPROC_CLUSTER } from './constants';

jest.setTimeout(500000);

describe('#fetchDataprocClusters', () => {
  let recording: Recording;

  beforeEach(() => {
    recording = setupGoogleCloudRecording({
      directory: __dirname,
      name: 'fetchDataprocClusters',
    });
  });

  afterEach(async () => {
    await recording.stop();
  });

  test('should collect data', async () => {
    const context = createMockStepExecutionContext<IntegrationConfig>({
      instanceConfig: {
        ...integrationConfig,
        serviceAccountKeyFile: integrationConfig.serviceAccountKeyFile.replace(
          'j1-gc-integration-dev-v2',
          'j1-gc-integration-dev-v3',
        ),
        serviceAccountKeyConfig: {
          ...integrationConfig.serviceAccountKeyConfig,
          project_id: 'j1-gc-integration-dev-v3',
        },
      },
    });

    await fetchDataprocClusters(context);

    expect({
      numCollectedEntities: context.jobState.collectedEntities.length,
      numCollectedRelationships: context.jobState.collectedRelationships.length,
      collectedEntities: context.jobState.collectedEntities,
      collectedRelationships: context.jobState.collectedRelationships,
      encounteredTypes: context.jobState.encounteredTypes,
    }).toMatchSnapshot();

    expect(
      context.jobState.collectedEntities.filter(
        (e) => e._type === ENTITY_TYPE_DATAPROC_CLUSTER,
      ),
    ).toMatchGraphObjectSchema({
      _class: ['Cluster'],
      schema: {
        additionalProperties: false,
        properties: {
          _type: { const: 'google_dataproc_cluster' },
          _rawData: {
            type: 'array',
            items: { type: 'object' },
          },
          name: { type: 'string' },
          status: { type: 'string' },
          configBucket: { type: 'string' },
          tempBucket: { type: 'string' },
          zoneUri: { type: 'string' },
          networkUri: { type: 'string' },
          masterConfigNumInstances: { type: 'number' },
          masterConfigImageUri: { type: 'string' },
          masterConfigMachineTypeUri: { type: 'string' },
          masterConfigMinCpuPlatform: { type: 'string' },
          masterConfigPreemptibility: { type: 'string' },
          workerConfigNumInstances: { type: 'number' },
          workerConfigImageUri: { type: 'string' },
          workerConfigMachineTypeUri: { type: 'string' },
          workerConfigMinCpuPlatform: { type: 'string' },
          workerConfigPreemptibility: { type: 'string' },
          softwareConfigImageVersion: { type: 'string' },
          webLink: { type: 'string' },
        },
      },
    });
  });
});
