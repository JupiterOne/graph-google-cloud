import {
  createDirectRelationship,
  getRawData,
  RelationshipClass,
} from '@jupiterone/integration-sdk-core';
import { secretmanager_v1 } from 'googleapis';
import {
  GoogleCloudIntegrationStep,
  IntegrationStepContext,
} from '../../types';
import { SecretManagerClient } from './client';
import {
  SecretManagerEntities,
  SecretManagerRelationships,
  SecretManagerSteps,
} from './constants';
import { createSecretEntity, createSecretVersionEntity } from './converters';

export async function fetchSecrets(
  context: IntegrationStepContext,
): Promise<void> {
  const {
    jobState,
    instance: { config },
    logger,
  } = context;
  const client = new SecretManagerClient({ config }, logger);

  await client.iterateSecrets(async (secret) => {
    await jobState.addEntity(createSecretEntity(secret));
  });
}

export async function fetchSecretVersions(
  context: IntegrationStepContext,
): Promise<void> {
  const {
    jobState,
    instance: { config },
    logger,
  } = context;
  const client = new SecretManagerClient({ config }, logger);

  await jobState.iterateEntities(
    { _type: SecretManagerEntities.SECRET._type },
    async (secretEntity) => {
      const secret = getRawData<secretmanager_v1.Schema$Secret>(secretEntity);

      await client.iterateSecretVersions(secret!, async (version) => {
        const versionEntity = createSecretVersionEntity(version);
        await jobState.addEntity(versionEntity);

        await jobState.addRelationship(
          createDirectRelationship({
            _class: RelationshipClass.HAS,
            from: secretEntity,
            to: versionEntity,
          }),
        );
      });
    },
  );
}

export const secretManagerSteps: GoogleCloudIntegrationStep[] = [
  {
    ...SecretManagerSteps.FETCH_SECRETS,
    entities: [SecretManagerEntities.SECRET],
    relationships: [],
    executionHandler: fetchSecrets,
    permissions: ['secretmanager.secrets.list'],
    apis: ['secretmanager.googleapis.com'],
  },
  {
    ...SecretManagerSteps.FETCH_SECRET_VERSIONS,
    entities: [SecretManagerEntities.SECRET_VERSION],
    relationships: [SecretManagerRelationships.SECRET_HAS_VERSION],
    dependsOn: [SecretManagerSteps.FETCH_SECRETS.id],
    executionHandler: fetchSecretVersions,
    permissions: ['secretmanager.versions.list'],
    apis: ['secretmanager.googleapis.com'],
  },
];
