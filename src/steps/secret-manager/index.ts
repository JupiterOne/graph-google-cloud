import { IntegrationStep } from '@jupiterone/integration-sdk-core';
import { IntegrationConfig, IntegrationStepContext } from '../../types';
import { SecretManagerClient } from './client';
import {
  ENTITY_CLASS_SECRET_MANAGER_SECRET,
  ENTITY_TYPE_SECRET_MANAGER_SECRET,
  STEP_SECRET_MANAGER_FETCH_SECRETS,
} from './constants';
import { createSecretEntitiy } from './converters';

export async function fetchSecrets(
  context: IntegrationStepContext,
): Promise<void> {
  const {
    jobState,
    instance: { config },
  } = context;
  const client = new SecretManagerClient({ config });

  await client.iterateSecrets(async (secret) => {
    await jobState.addEntity(createSecretEntitiy(secret));
  });
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
  // {
  //   id: STEP_SECRET_MANAGER_FETCH_SECRET_VERSION,
  //   name: 'Secret manager',
  //   entities: [
  //     {
  //       resourceName: 'Secrets',
  //       _type: ENTITY_TYPE_SECRET_MANAGER_SECRET_VERSION,
  //       _class: ENTITY_CLASS_SECRET_MANAGER_SECRET_VERSION,
  //     },
  //   ],
  //   relationships: [],
  //   dependsOn: [],
  //   executionHandler: () => {},
  // },
];
