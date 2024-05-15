import {
  Recording,
  createMockStepExecutionContext,
} from '@jupiterone/integration-sdk-testing';
import {
  ENTITY_CLASS_CLOUD_INTERCONNECT,
  ENTITY_TYPE_CLOUD_INTERCONNECT,
} from '../constants';
import { setupGoogleCloudRecording } from '../../../../test/recording';
import { integrationConfig } from '../../../../test/config';
import { IntegrationConfig } from '../../..';
import { fetchCloudInterconnect } from './fetch-cloud-interconnect';

describe('#fetchCloudInterconnect', () => {
  let recording: Recording;

  beforeEach(() => {
    recording = setupGoogleCloudRecording({
      directory: __dirname,
      name: 'fetchCloudInterconnect',
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

    await fetchCloudInterconnect(context);

    expect({
      numCollectedEntities: context.jobState.collectedEntities.length,
      numCollectedRelationships: context.jobState.collectedRelationships.length,
      collectedEntities: context.jobState.collectedEntities,
      collectedRelationships: context.jobState.collectedRelationships,
      encounteredTypes: context.jobState.encounteredTypes,
    }).toMatchSnapshot();

    expect(
      context.jobState.collectedEntities.filter(
        (e) => e._type === ENTITY_TYPE_CLOUD_INTERCONNECT,
      ),
    ).toMatchGraphObjectSchema({
      _class: ENTITY_CLASS_CLOUD_INTERCONNECT,
      schema: {
        additionalProperties: false,
        properties: {
          _type: { const: ENTITY_TYPE_CLOUD_INTERCONNECT },
          _rawData: {
            type: 'array',
            items: { type: 'object' },
          },
          CIDR: { exclude: true },
          internal: { exclude: true },
          id: { type: 'string' },
          name: { type: 'string' },
          location: { type: 'string' },
          interConnectType: { type: 'string' },
          kind: { type: 'string' },
          public: { type: 'boolean' },
          adminEnabled: { type: 'boolean' },
          createdOn: { type: 'number' },
        },
      },
    });
  });
});
