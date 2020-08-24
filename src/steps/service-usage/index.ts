import { IntegrationStep } from '@jupiterone/integration-sdk-core';
import { ServiceUsageClient } from './client';
import { IntegrationConfig, IntegrationStepContext } from '../../types';
import { createApiServiceEntity } from './converters';
import {
  API_SERVICE_ENTITY_TYPE,
  STEP_API_SERVICES,
  API_SERVICE_ENTITY_CLASS,
} from './constants';

export * from './constants';

export async function fetchApiServices(
  context: IntegrationStepContext,
): Promise<void> {
  const {
    jobState,
    instance: { config },
  } = context;
  const client = new ServiceUsageClient({ config });
  await client.iterateServices(async (service) => {
    await jobState.addEntity(createApiServiceEntity(service));
  });
}

export const serviceUsageSteps: IntegrationStep<IntegrationConfig>[] = [
  {
    id: STEP_API_SERVICES,
    name: 'API Services',
    entities: [
      {
        resourceName: 'Cloud API Service',
        _type: API_SERVICE_ENTITY_TYPE,
        _class: API_SERVICE_ENTITY_CLASS,
      },
    ],
    relationships: [],
    executionHandler: fetchApiServices,
  },
];
