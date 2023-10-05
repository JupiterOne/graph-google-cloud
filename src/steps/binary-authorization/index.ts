import {
  createDirectRelationship,
  RelationshipClass,
} from '@jupiterone/integration-sdk-core';
import { binaryauthorization_v1 } from 'googleapis';
import {
  GoogleCloudIntegrationStep,
  IntegrationStepContext,
} from '../../types';
import {
  PROJECT_ENTITY_TYPE,
  STEP_RESOURCE_MANAGER_PROJECT,
} from '../resource-manager';
import { BinaryAuthorizationClient } from './client';
import {
  BINARY_AUTHORIZATION_POLICY_ENTITY_CLASS,
  BINARY_AUTHORIZATION_POLICY_ENTITY_TYPE,
  STEP_BINARY_AUTHORIZATION_POLICY,
  RELATIONSHIP_TYPE_PROJECT_HAS_BINARY_AUTHORIZATION_POLICY,
} from './constants';
import { createBinaryAuthorizationPolicyEntity } from './converters';
import { publishMissingPermissionEvent } from '../../utils/events';
import { getProjectEntity } from '../../utils/project';

export async function fetchBinaryAuthorizationPolicy(
  context: IntegrationStepContext,
): Promise<void> {
  const {
    jobState,
    instance: { config },
    logger,
  } = context;

  const client = new BinaryAuthorizationClient({ config }, logger);

  let policy: binaryauthorization_v1.Schema$Policy;
  try {
    policy = await client.fetchPolicy();
  } catch (err) {
    if (err.code === 403) {
      logger.warn(
        { err },
        'Could not fetch binary authorization policy. Requires additional permission',
      );

      publishMissingPermissionEvent({
        logger,
        permission: 'binaryauthorization.policy.get',
        stepId: STEP_BINARY_AUTHORIZATION_POLICY,
      });

      return;
    }

    throw err;
  }

  if (policy) {
    const policyEntity = createBinaryAuthorizationPolicyEntity(
      policy,
      client.projectId,
    );

    await jobState.addEntity(policyEntity);

    const projectEntity = await getProjectEntity(jobState);
    await jobState.addRelationship(
      createDirectRelationship({
        _class: RelationshipClass.HAS,
        from: projectEntity,
        to: policyEntity,
      }),
    );
  }
}

export const binaryAuthorizationSteps: GoogleCloudIntegrationStep[] = [
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
    dependsOn: [STEP_RESOURCE_MANAGER_PROJECT],
    executionHandler: fetchBinaryAuthorizationPolicy,
    permissions: ['binaryauthorization.policy.get'],
    apis: ['binaryauthorization.googleapis.com'],
  },
];
