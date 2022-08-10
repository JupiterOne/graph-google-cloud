import {
  createDirectRelationship,
  getRawData,
  IntegrationStep,
  RelationshipClass,
} from '@jupiterone/integration-sdk-core';
import { secretmanager_v1beta1 } from 'googleapis';
import { IntegrationConfig, IntegrationStepContext } from '../../types';
import { SecretManagerClient } from './client';
import {
  ENTITY_CLASS_SECRET_MANAGER_SECRET,
  ENTITY_CLASS_SECRET_MANAGER_SECRET_VERSION,
  ENTITY_TYPE_SECRET_MANAGER_SECRET,
  ENTITY_TYPE_SECRET_MANAGER_SECRET_VERSION,
  RELATIONSHIP_TYPE_SECRET_HAS_VERSION,
  STEP_SECRET_MANAGER_FETCH_SECRETS,
  STEP_SECRET_MANAGER_FETCH_SECRET_VERSION,
} from './constants';
import { createSecretEntity, createSecretVersionEntity } from './converters';

export async function fetchSecrets(
  context: IntegrationStepContext,
): Promise<void> {
  const {
    jobState,
    instance: { config },
  } = context;
  const client = new SecretManagerClient({ config });

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
  } = context;
  const client = new SecretManagerClient({ config });

  await jobState.iterateEntities(
    { _type: ENTITY_TYPE_SECRET_MANAGER_SECRET },
    async (secretEntity) => {
      const secret =
        getRawData<secretmanager_v1beta1.Schema$Secret>(secretEntity);

      // TO-DO: Why is this necessary?
      if (!secret) return;

      await client.iterateSecretVersions(secret, async (version) => {
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

export const secretManagerSteps: IntegrationStep<IntegrationConfig>[] = [
  {
    id: STEP_SECRET_MANAGER_FETCH_SECRETS,
    name: 'Secret manager',
    entities: [
      {
        resourceName: 'Secret',
        _type: ENTITY_TYPE_SECRET_MANAGER_SECRET,
        _class: ENTITY_CLASS_SECRET_MANAGER_SECRET,
      },
    ],
    relationships: [],
    dependsOn: [],
    executionHandler: fetchSecrets,
  },
  {
    id: STEP_SECRET_MANAGER_FETCH_SECRET_VERSION,
    name: 'Secret manager',
    entities: [
      {
        resourceName: 'Secrets',
        _type: ENTITY_TYPE_SECRET_MANAGER_SECRET_VERSION,
        _class: ENTITY_CLASS_SECRET_MANAGER_SECRET_VERSION,
      },
    ],
    relationships: [
      {
        _class: RelationshipClass.HAS,
        _type: RELATIONSHIP_TYPE_SECRET_HAS_VERSION,
        sourceType: ENTITY_TYPE_SECRET_MANAGER_SECRET,
        targetType: ENTITY_TYPE_SECRET_MANAGER_SECRET_VERSION,
      },
    ],
    dependsOn: [STEP_SECRET_MANAGER_FETCH_SECRETS],
    executionHandler: fetchSecretVersions,
  },
];
