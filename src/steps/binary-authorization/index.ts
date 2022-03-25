import {
  createDirectRelationship,
  IntegrationStep,
  RelationshipClass,
} from '@jupiterone/integration-sdk-core';
import { binaryauthorization_v1 } from 'googleapis';
import { IntegrationConfig, IntegrationStepContext } from '../../types';
import {
  ResourceManagerEntities,
  ResourceManagerStepIds,
} from '../resource-manager/constants';
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

  const client = new BinaryAuthorizationClient({ config });

  let policy: binaryauthorization_v1.Schema$Policy;
  try {
    policy = await client.fetchPolicy();
  } catch (err) {
    if (err.code === 403) {
      logger.trace(
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
        sourceType: ResourceManagerEntities.PROJECT._type,
        targetType: BINARY_AUTHORIZATION_POLICY_ENTITY_TYPE,
      },
    ],
    dependsOn: [ResourceManagerStepIds.FETCH_PROJECT],
    executionHandler: fetchBinaryAuthorizationPolicy,
  },
];
