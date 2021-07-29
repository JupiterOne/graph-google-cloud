import { uniq } from 'lodash';
import {
  createDirectRelationship,
  createMappedRelationship,
  generateRelationshipType,
  IntegrationStep,
  Relationship,
  RelationshipClass,
  RelationshipDirection,
} from '@jupiterone/integration-sdk-core';
import { cloudresourcemanager_v3 } from 'googleapis';
import { IntegrationConfig } from '../..';
import { IntegrationStepContext } from '../../types';
import { publishMissingPermissionEvent } from '../../utils/events';
import { getProjectIdFromName } from '../../utils/jobState';
import { getEnabledServiceNames } from '../enablement';
import { IAM_ROLE_ENTITY_CLASS, IAM_ROLE_ENTITY_TYPE } from '../iam';
import {
  buildIamTargetRelationship,
  findOrCreateIamRoleEntity,
  maybeFindIamUserEntityWithParsedMember,
  shouldMakeTargetIamRelationships,
} from '../resource-manager';
import { CloudAssetClient } from './client';
import {
  bindingEntities,
  BINDING_ALLOWS_ANY_RESOURCE_RELATIONSHIP,
  BINDING_ASSIGNED_PRINCIPAL_RELATIONSHIPS,
  PRINCIPAL_ASSIGNED_ROLE_RELATIONSHIPS,
  // STEP_CREATE_BINDING_ANY_RESOURCE_RELATIONSHIPS,
  STEP_CREATE_BINDING_PRINCIPAL_RELATIONSHIPS,
  STEP_CREATE_BINDING_ROLE_RELATIONSHIPS,
  STEP_CREATE_MAPPED_BINDING_ANY_RESOURCE_RELATIONSHIPS,
  STEP_IAM_BINDINGS,
} from './constants';
import {
  BindingEntity,
  buildIamBindingEntityKey,
  createIamBindingEntity,
} from './converters';
import get from 'lodash.get';
import {
  GOOGLE_RESOURCE_TO_J1_TYPE_MAP,
  J1_TYPE_TO_KEY_GENERATOR_MAP,
  NONE,
  traverseCloudResourcesMap,
} from '../../constants';

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

        await jobState.addEntity(
          createIamBindingEntity({ _key, projectId, binding, resource }),
        );

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
        stepId: STEP_IAM_BINDINGS,
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

export async function createBindingRoleRelationships(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState } = context;
  await jobState.iterateEntities(
    { _type: bindingEntities.BINDINGS._type },
    async (bindingEntity: BindingEntity) => {
      if (bindingEntity.role) {
        const roleEntity = await jobState.findEntity(bindingEntity.role);

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
              _mapping: {
                relationshipDirection: RelationshipDirection.FORWARD,
                sourceEntityKey: bindingEntity._key,
                targetFilterKeys: [['_type', '_key']],
                skipTargetCreation: false,
                targetEntity: {
                  _type: IAM_ROLE_ENTITY_TYPE,
                  _key: bindingEntity.role,
                  name: bindingEntity.role,
                  displayName: bindingEntity.role,
                },
              },
            }),
          );
        }
      }
    },
  );
}

export async function createPrincipalRelationships(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState, logger } = context;
  const memberRelationshipKeys = new Set<string>();

  async function safeAddRelationship(relationship?: Relationship) {
    if (relationship && !memberRelationshipKeys.has(relationship._key)) {
      await jobState.addRelationship(relationship);
      memberRelationshipKeys.add(String(relationship._key));
    }
  }

  await jobState.iterateEntities(
    { _type: bindingEntities.BINDINGS._type },
    async (bindingEntity: BindingEntity) => {
      const condition: cloudresourcemanager_v3.Schema$Expr = {
        description: get(bindingEntity, 'condition.description'),
        expression: get(bindingEntity, 'condition.expression'),
        location: get(bindingEntity, 'condition.location'),
        title: get(bindingEntity, 'condition.title'),
      };
      if (bindingEntity.members?.length) {
        if (!bindingEntity.role) {
          logger.warn(
            { binding: bindingEntity },
            'Unable to build relationships for binding. Binding does not have an associated role.',
          );
        } else {
          for (const member of bindingEntity.members) {
            const iamUserEntityWithParsedMember =
              await maybeFindIamUserEntityWithParsedMember({
                jobState,
                member,
              });

            if (
              shouldMakeTargetIamRelationships(iamUserEntityWithParsedMember)
            ) {
              await safeAddRelationship(
                buildIamTargetRelationship({
                  iamEntity: bindingEntity,
                  projectId: bindingEntity.projectId,
                  iamUserEntityWithParsedMember,
                  condition,
                  relationshipDirection: RelationshipDirection.FORWARD,
                }),
              );

              if (bindingEntity.role) {
                const iamRoleEntity = await findOrCreateIamRoleEntity({
                  jobState,
                  roleName: bindingEntity.role,
                });
                await safeAddRelationship(
                  buildIamTargetRelationship({
                    iamEntity: iamRoleEntity,
                    projectId: bindingEntity.projectId,
                    iamUserEntityWithParsedMember,
                    condition,
                  }),
                );
              }
            }
          }
        }
      }
    },
  );
}

// This strategy seems to get a good amount of the resource entities, but I don't think it gets them all.
export async function createBindingAnyResourceRelationships(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState, instance } = context;
  const enabledServiceNames = await getEnabledServiceNames(instance.config);

  await jobState.iterateEntities(
    { _type: bindingEntities.BINDINGS._type },
    async (bindingEntity: BindingEntity) => {
      const [_, __, service, ...key] = bindingEntity.resource.split('/');
      bindingEntity['condition.expression'];
      // TODO: check the condition before creating ALLOWS relationship
      if (enabledServiceNames.includes(service)) {
        const targetEntity = await jobState.findEntity(key.join('/'));
        if (targetEntity) {
          await jobState.addRelationship(
            createDirectRelationship({
              from: bindingEntity,
              _class: RelationshipClass.ALLOWS,
              to: targetEntity,
            }),
          );
        }
      }
    },
  );
}

function getTargetKey(targetResourceType: string, resource: string) {
  const keyGenFunction = J1_TYPE_TO_KEY_GENERATOR_MAP[targetResourceType];
  if (!keyGenFunction) {
    console.log(
      { resource, targetResourceType },
      'unable to find key generation function for J1 type.',
    );
    return;
  }
  return keyGenFunction(resource);
}

export async function createMappedBindingAnyResourceRelationships(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState, logger } = context;
  await jobState.iterateEntities(
    { _type: bindingEntities.BINDINGS._type },
    async (bindingEntity: BindingEntity) => {
      const cloudResourceIdentifier = traverseCloudResourcesMap(
        bindingEntity.resource,
      );
      if (!cloudResourceIdentifier) {
        logger.warn(
          { resource: bindingEntity.resource },
          'unable to find google cloud resource identifier.',
        );
        return;
      }
      const targetResourceType =
        GOOGLE_RESOURCE_TO_J1_TYPE_MAP[cloudResourceIdentifier];
      if (!targetResourceType) {
        logger.warn(
          { resource: bindingEntity.resource, cloudResourceIdentifier },
          'unable to find J1 type from google cloud resource.',
        );
        return;
      } else if (targetResourceType === NONE) {
        logger.warn(
          { resource: bindingEntity.resource, cloudResourceIdentifier },
          'There is no JupiterOne entity for this resource',
        );
        return;
      }
      const keys = uniq(
        Array.isArray(targetResourceType)
          ? targetResourceType
          : [targetResourceType],
      ).map((type) => getTargetKey(type, bindingEntity.resource));
      if (keys.length < 1) {
        logger.warn(
          {
            resource: bindingEntity.resource,
            cloudResourceIdentifier,
            targetResourceType,
            keys,
          },
          'unable to generate key for type.',
        );
        return;
      }
      for (const key of keys) {
        if (typeof key === 'string') {
          await jobState.addRelationship(
            createMappedRelationship({
              _class: BINDING_ALLOWS_ANY_RESOURCE_RELATIONSHIP._class,
              _type: BINDING_ALLOWS_ANY_RESOURCE_RELATIONSHIP._type,
              _mapping: {
                relationshipDirection: RelationshipDirection.FORWARD,
                sourceEntityKey: bindingEntity._key,
                targetFilterKeys: [['_type', '_key']],
                skipTargetCreation: false,
                targetEntity: {
                  _type: Array.isArray(targetResourceType)
                    ? targetResourceType[0]
                    : targetResourceType, // TODO: fix
                  _key: key,
                },
              },
            }),
          );
        }
      }
    },
  );
}

export const cloudAssetSteps: IntegrationStep<IntegrationConfig>[] = [
  {
    id: STEP_IAM_BINDINGS,
    name: 'IAM Bindings',
    entities: [bindingEntities.BINDINGS],
    relationships: [],
    dependsOn: [],
    executionHandler: fetchIamBindings,
    dependencyGraphId: 'last',
  },
  {
    id: STEP_CREATE_BINDING_PRINCIPAL_RELATIONSHIPS,
    name: 'IAM Binding Principal Relationships',
    entities: [
      {
        resourceName: 'IAM Role',
        _type: IAM_ROLE_ENTITY_TYPE,
        _class: IAM_ROLE_ENTITY_CLASS,
      },
    ],
    relationships: [
      ...BINDING_ASSIGNED_PRINCIPAL_RELATIONSHIPS,
      ...PRINCIPAL_ASSIGNED_ROLE_RELATIONSHIPS,
    ],
    dependsOn: [STEP_IAM_BINDINGS],
    executionHandler: createPrincipalRelationships,
    dependencyGraphId: 'last',
  },
  {
    id: STEP_CREATE_BINDING_ROLE_RELATIONSHIPS,
    name: 'IAM Binding IAM Role Relationships',
    entities: [],
    relationships: [
      {
        _class: RelationshipClass.USES,
        _type: generateRelationshipType(
          RelationshipClass.USES,
          bindingEntities.BINDINGS._type,
          IAM_ROLE_ENTITY_TYPE,
        ),
        sourceType: bindingEntities.BINDINGS._type,
        targetType: IAM_ROLE_ENTITY_TYPE,
      },
    ],
    dependsOn: [STEP_CREATE_BINDING_PRINCIPAL_RELATIONSHIPS],
    executionHandler: createBindingRoleRelationships,
    dependencyGraphId: 'last',
  },
  // {
  //   id: STEP_CREATE_BINDING_ANY_RESOURCE_RELATIONSHIPS,
  //   name: 'Role Binding to Any Resource Relationships',
  //   entities: [],
  //   relationships: [BINDING_ALLOWS_ANY_RESOURCE_RELATIONSHIP],
  //   dependsOn: [STEP_IAM_BINDINGS],
  //   executionHandler: createBindingAnyResourceRelationships,
  //   dependencyGraphId: 'last',
  // },
  {
    id: STEP_CREATE_MAPPED_BINDING_ANY_RESOURCE_RELATIONSHIPS,
    name: 'Role Binding to Any Resource Relationships Outside Integration',
    entities: [],
    relationships: [BINDING_ALLOWS_ANY_RESOURCE_RELATIONSHIP],
    dependsOn: [STEP_IAM_BINDINGS],
    executionHandler: createMappedBindingAnyResourceRelationships,
    dependencyGraphId: 'last',
  },
];
