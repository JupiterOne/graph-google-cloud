import {
  createDirectRelationship,
  createMappedRelationship,
  generateRelationshipType,
  IntegrationStep,
  RelationshipClass,
  RelationshipDirection,
} from '@jupiterone/integration-sdk-core';
import { IntegrationConfig } from '../..';
import { IntegrationStepContext } from '../../types';
import { publishMissingPermissionEvent } from '../../utils/events';
import { getProjectIdFromName } from '../../utils/jobState';
import {
  IAM_ROLE_ENTITY_TYPE,
  STEP_IAM_CUSTOM_ROLES,
  STEP_IAM_MANAGED_ROLES,
} from '../iam';
import { STEP_RESOURCE_MANAGER_ORG_PROJECT_RELATIONSHIPS } from '../resource-manager';
import { CloudAssetClient } from './client';
import { bindingEntities, CLOUD_ASSET_STEPS } from './constants';
import { buildIamBindingEntityKey, createIamBindingEntity } from './converters';

export async function fetchIamBindings(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState, instance, logger } = context;
  const client = new CloudAssetClient({ config: instance.config });
  let iamBindingsCount = 0;

  const bindingGraphKeySet = new Set<string>();
  const duplicateBindingGraphKeys: string[] = [];

  try {
    await client.iterateAllIamPolicies(context, async (policyResult) => {
      const resource = policyResult.resource;
      const projectName = policyResult.project;
      const bindings = policyResult.policy?.bindings ?? [];

      for (const binding of bindings) {
        const _key = buildIamBindingEntityKey({
          binding,
          projectName,
          resource,
        });

        if (bindingGraphKeySet.has(_key)) {
          duplicateBindingGraphKeys.push(_key);
          continue;
        }

        let projectId: string | undefined;

        if (projectName) {
          projectId = await getProjectIdFromName(jobState, projectName);

          if (!projectId) {
            // This should never happen because this step depends on another
            // step that collects all of the project data in an organization.
            logger.warn({ projectName }, 'Missing project ID in local cache');
          }
        }

        const bindingEntity = await jobState.addEntity(
          createIamBindingEntity({ _key, projectId, binding, resource }),
        );

        if (binding.role) {
          const roleEntity = await jobState.findEntity(binding.role);

          if (roleEntity) {
            await jobState.addRelationship(
              createDirectRelationship({
                _class: RelationshipClass.USES,
                from: bindingEntity,
                to: roleEntity,
              }),
            );
          } else {
            await jobState.addRelationship(
              createMappedRelationship({
                _class: RelationshipClass.USES,
                _type: generateRelationshipType(
                  RelationshipClass.USES,
                  bindingEntities.BINDINGS._type,
                  IAM_ROLE_ENTITY_TYPE,
                ),
                properties: {
                  projectId,
                },
                _mapping: {
                  relationshipDirection: RelationshipDirection.FORWARD,
                  sourceEntityKey: bindingEntity._key,
                  targetFilterKeys: [['_type', '_key']],
                  skipTargetCreation: false,
                  targetEntity: {
                    _type: IAM_ROLE_ENTITY_TYPE,
                    _key: binding.role,
                  },
                },
              }),
            );
          }
        }

        bindingGraphKeySet.add(_key);
        iamBindingsCount++;
      }
    });
  } catch (err) {
    if (err.status === 403) {
      logger.info(
        {
          err,
        },
        'Error iterating all IAM policies',
      );

      publishMissingPermissionEvent({
        logger,
        permission: 'cloudasset.assets.searchAllIamPolicies',
        stepId: CLOUD_ASSET_STEPS.BINDINGS,
      });

      return;
    }

    throw err;
  }

  logger.info(
    { numIamBindings: iamBindingsCount },
    'Created IAM binding entities',
  );

  if (duplicateBindingGraphKeys.length) {
    logger.info(
      { duplicateBindingGraphKeys },
      'Found duplicate IAM binding graph keys',
    );
  }
}

export const cloudAssetSteps: IntegrationStep<IntegrationConfig>[] = [
  {
    id: CLOUD_ASSET_STEPS.BINDINGS,
    name: 'IAM Bindings',
    entities: [bindingEntities.BINDINGS],
    relationships: [],
    dependsOn: [
      STEP_RESOURCE_MANAGER_ORG_PROJECT_RELATIONSHIPS,
      STEP_IAM_CUSTOM_ROLES,
      STEP_IAM_MANAGED_ROLES,
    ],
    executionHandler: fetchIamBindings,
  },
];
