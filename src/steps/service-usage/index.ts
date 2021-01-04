import {
  IntegrationStep,
  Entity,
  createDirectRelationship,
  RelationshipClass,
} from '@jupiterone/integration-sdk-core';
import { ServiceUsageClient } from './client';
import { IntegrationConfig, IntegrationStepContext } from '../../types';
import { createApiServiceEntity } from './converters';
import {
  API_SERVICE_ENTITY_TYPE,
  STEP_API_SERVICES,
  API_SERVICE_ENTITY_CLASS,
  PROJECT_API_SERVICE_RELATIONSHIP_TYPE,
} from './constants';
import { STEP_PROJECT, PROJECT_ENTITY_TYPE } from '../resource-manager';
import { withErrorHandling } from '../../utils/withErrorHandling';

export * from './constants';

export async function fetchApiServices(
  context: IntegrationStepContext,
): Promise<void> {
  const {
    jobState,
    instance: { config },
  } = context;
  const client = new ServiceUsageClient({ config });
  const projectEntity = await jobState.getData<Entity>(PROJECT_ENTITY_TYPE);
  await client.iterateServices(async (service) => {
    const serviceEntity = await jobState.addEntity(
      createApiServiceEntity(service),
    );
    const r = createDirectRelationship({
      _class: RelationshipClass.HAS,
      from: projectEntity,
      to: serviceEntity,
      properties: {
        _type: PROJECT_API_SERVICE_RELATIONSHIP_TYPE,
      },
    });
    await jobState.addRelationship(r);
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
    relationships: [
      {
        _type: PROJECT_API_SERVICE_RELATIONSHIP_TYPE,
        sourceType: PROJECT_ENTITY_TYPE,
        _class: RelationshipClass.HAS,
        targetType: API_SERVICE_ENTITY_TYPE,
      },
    ],
    dependsOn: [STEP_PROJECT],
    executionHandler: withErrorHandling(fetchApiServices),
  },
];
