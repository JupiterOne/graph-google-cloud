import {
  Recording,
  createMockStepExecutionContext,
} from '@jupiterone/integration-sdk-testing';
import { setupGoogleCloudRecording } from '../../../test/recording';
import { IntegrationConfig } from '../../types';
import { fetchApiServices } from '.';
import { integrationConfig } from '../../../test/config';
import { PROJECT_ENTITY_TYPE, PROJECT_ENTITY_CLASS } from '../resource-manager';
import { fetchIamManagedRoles } from '../iam';

describe('#fetchApiServices', () => {
  let recording: Recording;

  beforeEach(() => {
    recording = setupGoogleCloudRecording({
      directory: __dirname,
      name: 'fetchApiServices',
    });
  });

  afterEach(async () => {
    await recording.stop();
  });

  test('should collect data', async () => {
    const projectEntity = {
      _key: 'j1-gc-integration-dev-v3',
      _type: PROJECT_ENTITY_TYPE,
      _class: PROJECT_ENTITY_CLASS,
    };

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
      setData: {
        [PROJECT_ENTITY_TYPE]: projectEntity,
      },
    });

    await fetchIamManagedRoles(context);
    await fetchApiServices(context);

    expect({
      numCollectedEntities: context.jobState.collectedEntities.length,
      numCollectedRelationships: context.jobState.collectedRelationships.length,
      collectedEntities: context.jobState.collectedEntities,
      collectedRelationships: context.jobState.collectedRelationships,
      encounteredTypes: context.jobState.encounteredTypes,
    }).toMatchSnapshot();

    expect(context.jobState.collectedEntities).toMatchGraphObjectSchema({
      _class: ['Service'],
      schema: {
        additionalProperties: false,
        properties: {
          _type: { const: 'google_cloud_api_service' },
          category: { const: ['infrastructure'] },
          state: {
            type: 'string',
            enum: ['STATE_UNSPECIFIED', 'DISABLED', 'ENABLED'],
          },
          enabled: { type: 'boolean' },
          usageRequirements: {
            type: 'array',
            items: { type: 'string' },
          },
          hasIamPermissions: { type: 'boolean' },
          _rawData: {
            type: 'array',
            items: { type: 'object' },
          },
          auditable: { type: 'boolean' },
        },
      },
    });
  }, 30_000);
});
