import {
  createDirectRelationship,
  RelationshipClass,
} from '@jupiterone/integration-sdk-core';
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
  IngestionSources,
  BinaryAuthPermissions,
} from './constants';
import { createBinaryAuthorizationPolicyEntity } from './converters';
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

  const policy = await client.fetchPolicy();

  if (policy) {
    const policyEntity = createBinaryAuthorizationPolicyEntity(
      policy,
      client.projectId,
    );

    await jobState.addEntity(policyEntity);

    const projectEntity = await getProjectEntity(jobState);

    if (!projectEntity) return;

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
    ingestionSourceId: IngestionSources.BINARY_AUTHORIZATION_POLICY,
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
    permissions: BinaryAuthPermissions.STEP_BINARY_AUTHORIZATION_POLICY,
    apis: ['binaryauthorization.googleapis.com'],
  },
];
