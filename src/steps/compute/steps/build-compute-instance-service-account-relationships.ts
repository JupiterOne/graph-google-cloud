import {
  RelationshipClass,
  createDirectRelationship,
} from '@jupiterone/integration-sdk-core';
import {
  GoogleCloudIntegrationStep,
  IntegrationStepContext,
} from '../../../types';
import {
  STEP_COMPUTE_INSTANCE_SERVICE_ACCOUNT_RELATIONSHIPS,
  RELATIONSHIP_TYPE_GOOGLE_COMPUTE_INSTANCE_TRUSTS_IAM_SERVICE_ACCOUNT,
  ENTITY_TYPE_COMPUTE_INSTANCE,
  STEP_COMPUTE_INSTANCES,
} from '../constants';
import {
  IAM_SERVICE_ACCOUNT_ENTITY_TYPE,
  STEP_IAM_SERVICE_ACCOUNTS,
} from '../../iam';
import { getComputeInstanceServiceAccountData } from '../../../utils/jobState';

export async function buildComputeInstanceServiceAccountRelationships(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState } = context;
  const computeInstanceServiceAccountData =
    await getComputeInstanceServiceAccountData(jobState);

  if (!computeInstanceServiceAccountData) {
    // This should never happen because of the step dependency graph
    context.logger.error(
      'Compute instance and service account relationships attempted to be built before possible',
    );
    return;
  }

  for (const [
    computeInstanceKey,
    serviceAccountData,
  ] of computeInstanceServiceAccountData) {
    for (const { email, scopes } of serviceAccountData) {
      const serviceAccountEntity = await jobState.findEntity(email!);

      if (!serviceAccountEntity) {
        // TODO: Should we create a mapped relationship here?
        continue;
      }

      await jobState.addRelationship(
        createDirectRelationship({
          _class: RelationshipClass.TRUSTS,
          fromKey: computeInstanceKey,
          fromType: ENTITY_TYPE_COMPUTE_INSTANCE,
          toKey: serviceAccountEntity._key,
          toType: serviceAccountEntity._type,
          properties: {
            scopes: scopes && `[${scopes.join(',')}]`,
          },
        }),
      );
    }
  }
}

export const buildComputeInstanceServiceAccountRelationshipsStepMap: GoogleCloudIntegrationStep =
  {
    id: STEP_COMPUTE_INSTANCE_SERVICE_ACCOUNT_RELATIONSHIPS,
    name: 'Compute Instance Service Account Relationships',
    entities: [],
    relationships: [
      {
        _class: RelationshipClass.TRUSTS,
        _type:
          RELATIONSHIP_TYPE_GOOGLE_COMPUTE_INSTANCE_TRUSTS_IAM_SERVICE_ACCOUNT,
        sourceType: ENTITY_TYPE_COMPUTE_INSTANCE,
        targetType: IAM_SERVICE_ACCOUNT_ENTITY_TYPE,
      },
    ],
    dependsOn: [STEP_COMPUTE_INSTANCES, STEP_IAM_SERVICE_ACCOUNTS],
    executionHandler: buildComputeInstanceServiceAccountRelationships,
  };
