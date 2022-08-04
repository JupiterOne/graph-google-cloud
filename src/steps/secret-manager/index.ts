import { IntegrationStep } from '@jupiterone/integration-sdk-core';
import { IntegrationConfig } from '../../types';
import {
  ENTITY_CLASS_SECRET_MANAGER_SECRET,
  ENTITY_TYPE_SECRET_MANAGER_SECRET,
  STEP_SECRET_MANAGER,
} from './constants';

export const secretManagerSteps: IntegrationStep<IntegrationConfig>[] = [
  {
    id: STEP_SECRET_MANAGER,
    name: 'Secret manager',
    entities: [
      {
        resourceName: 'Secrets',
        _type: ENTITY_TYPE_SECRET_MANAGER_SECRET,
        _class: ENTITY_CLASS_SECRET_MANAGER_SECRET,
      },
    ],
    relationships: [],
    dependsOn: [],
    executionHandler: () => {},
  },
];
