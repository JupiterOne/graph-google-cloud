import {
  createMockStepExecutionContext,
  executeStepWithDependencies,
  StepTestConfig,
} from '@jupiterone/integration-sdk-testing';
import { fetchSecrets, fetchSecretVersions } from '.';
import { IntegrationConfig, invocationConfig } from '../..';
import { integrationConfig } from '../../../test/config';

import { Recording, setupGoogleCloudRecording } from '../../../test/recording';
import { SecretManagerEntities, SecretManagerSteps } from './constants';

describe('#secret-manager', () => {
  let recording: Recording;

  afterEach(async () => {
    if (recording) await recording.stop();
  });

  test('fetch-secrets', async () => {
    recording = setupGoogleCloudRecording({
      name: 'fetch-secrets',
      directory: __dirname,
    });

    const stepTestConfig: StepTestConfig = {
      stepId: SecretManagerSteps.FETCH_SECRETS.id,
      instanceConfig: integrationConfig,
      invocationConfig: invocationConfig as any,
    };

    const result = await executeStepWithDependencies(stepTestConfig);
    expect(result).toMatchStepMetadata(stepTestConfig);
  });

  test('should collect data', async () => {
    const context = createMockStepExecutionContext<IntegrationConfig>({
      instanceConfig: integrationConfig,
    });

    await fetchSecrets(context);
    await fetchSecretVersions(context);

    expect({
      numCollectedEntities: context.jobState.collectedEntities.length,
      numCollectedRelationships: context.jobState.collectedRelationships.length,
      collectedEntities: context.jobState.collectedEntities,
      collectedRelationships: context.jobState.collectedRelationships,
      encounteredTypes: context.jobState.encounteredTypes,
    }).toMatchSnapshot();

    expect(
      context.jobState.collectedEntities.filter(
        (e) => e._type === SecretManagerEntities.SECRET._type,
      ),
    ).toMatchGraphObjectSchema({
      _class: ['Group'],
      schema: {
        additionalProperties: false,
        properties: {
          _type: { const: 'google_secret_manager_secret' },
          _rawData: {
            type: 'array',
            items: { type: 'object' },
          },
          createdAt: { type: 'number' },
          expiresAt: { type: 'number' },
          automaticReplicationKmsKeyName: { type: 'number' },
          nextRotationTime: { type: 'number' },
          rotationPeriod: { type: 'string' },
          topicNames: { type: 'array', items: { type: 'string' } },
          ttl: { type: 'string' },
        },
      },
    });

    expect(
      context.jobState.collectedEntities.filter(
        (e) => e._type === SecretManagerEntities.SECRET_VERSION._type,
      ),
    ).toMatchGraphObjectSchema({
      _class: ['Secret'],
      schema: {
        additionalProperties: false,
        properties: {
          _type: { const: 'google_secret_manager_secret_version' },
          _rawData: {
            type: 'array',
            items: { type: 'object' },
          },
          createdAt: { type: 'number' },
          destroyTime: { type: 'number' },
        },
      },
    });
  });
});
