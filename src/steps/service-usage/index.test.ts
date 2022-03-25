import {
  Recording,
  createMockStepExecutionContext,
} from '@jupiterone/integration-sdk-testing';
import { setupGoogleCloudRecording } from '../../../test/recording';
import { IntegrationConfig } from '../../types';
import { fetchApiServices } from '.';
import { integrationConfig } from '../../../test/config';
import { ResourceManagerEntities } from '../resource-manager/constants';
import { fetchIamManagedRoles } from '../iam';
import { ServiceUsageEntities } from './constants';

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
      _type: ResourceManagerEntities.PROJECT._type,
      _class: ResourceManagerEntities.PROJECT._class,
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
        [ResourceManagerEntities.PROJECT._type]: projectEntity,
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

    expect(context.jobState.collectedEntities).toMatchGraphObjectSchema(
      ServiceUsageEntities.API_SERVICE,
    );
  }, 30_000);
});
