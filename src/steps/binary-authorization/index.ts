import {
  createDirectRelationship,
  Entity,
  IntegrationStep,
  RelationshipClass,
} from '@jupiterone/integration-sdk-core';
import { IntegrationConfig, IntegrationStepContext } from '../../types';
import { PROJECT_ENTITY_TYPE, STEP_PROJECT } from '../resource-manager';
import { BinaryAuthorizationClient } from './client';
import {
  BINARY_AUTHORIZATION_POLICY_ENTITY_CLASS,
  BINARY_AUTHORIZATION_POLICY_ENTITY_TYPE,
  STEP_BINARY_AUTHORIZATION_POLICY,
  RELATIONSHIP_TYPE_PROJECT_HAS_BINARY_AUTHORIZATION_POLICY,
} from './constants';
import { createBinaryAuthorizationPolicyEntity } from './converters';

export async function fetchBinaryAuthorizationPolicy(
  context: IntegrationStepContext,
): Promise<void> {
  const {
    jobState,
    instance: { config },
  } = context;

  const client = new BinaryAuthorizationClient({ config });

  const policy = await client.fetchPolicy();
  const policyEntity = createBinaryAuthorizationPolicyEntity(
    policy,
    client.projectId,
  );

  await jobState.addEntity(policyEntity);

  const projectEntity = await jobState.getData<Entity>(PROJECT_ENTITY_TYPE);
  await jobState.addRelationship(
    createDirectRelationship({
      _class: RelationshipClass.HAS,
      from: projectEntity,
      to: policyEntity,
    }),
  );
}

export const binaryAuthorizationSteps: IntegrationStep<IntegrationConfig>[] = [
  {
    id: STEP_BINARY_AUTHORIZATION_POLICY,
    name: 'Binary Authorization Policy',
    entities: [
      {
        resourceName: 'Binary Authorization Policy',
        _type: BINARY_AUTHORIZATION_POLICY_ENTITY_TYPE,
        _class: BINARY_AUTHORIZATION_POLICY_ENTITY_CLASS,
      },
    ],
    relationships: [
      {
        _class: RelationshipClass.HAS,
        _type: RELATIONSHIP_TYPE_PROJECT_HAS_BINARY_AUTHORIZATION_POLICY,
        sourceType: PROJECT_ENTITY_TYPE,
        targetType: BINARY_AUTHORIZATION_POLICY_ENTITY_TYPE,
      },
    ],
    dependsOn: [STEP_PROJECT],
    executionHandler: fetchBinaryAuthorizationPolicy,
  },
];
