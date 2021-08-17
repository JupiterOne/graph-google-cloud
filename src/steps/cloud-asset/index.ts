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
import {
  cacheIfResourceIsPublic,
  getIfResourceIsPublic,
  getProjectIdFromName,
} from '../../utils/jobState';
import {
  IAM_ROLE_ENTITY_CLASS,
  IAM_ROLE_ENTITY_TYPE,
  STEP_IAM_CUSTOM_ROLES,
  STEP_IAM_MANAGED_ROLES,
  STEP_IAM_SERVICE_ACCOUNTS,
} from '../iam';
import {
  buildIamTargetRelationship,
  findOrCreateIamRoleEntity,
  maybeFindIamUserEntityWithParsedMember,
  shouldMakeTargetIamRelationships,
  STEP_RESOURCE_MANAGER_ORG_PROJECT_RELATIONSHIPS,
} from '../resource-manager';
import { CloudAssetClient } from './client';
import {
  bindingEntities,
  BINDING_ALLOWS_ANY_RESOURCE_RELATIONSHIP,
  BINDING_ASSIGNED_PRINCIPAL_RELATIONSHIPS,
  PRINCIPAL_ASSIGNED_ROLE_RELATIONSHIPS,
  STEP_CACHE_IF_RESOURCES_ARE_PUBLIC,
  STEP_CREATE_BINDING_ANY_RESOURCE_RELATIONSHIPS,
  STEP_CREATE_BINDING_PRINCIPAL_RELATIONSHIPS,
  STEP_CREATE_BINDING_ROLE_RELATIONSHIPS,
  STEP_IAM_BINDINGS,
} from './constants';
import {
  BindingEntity,
  buildIamBindingEntityKey,
  createIamBindingEntity,
} from './converters';
import get from 'lodash.get';
import {
  getTypeAndKeyFromResourceIdentifier,
  makeLogsForTypeAndKeyResponse,
} from '../../utils/iamBindings/getTypeAndKeyFromResourceIdentifier';
import { getEnabledServiceNames } from '../enablement';
import { MULTIPLE_J1_TYPES_FOR_RESOURCE_KIND } from '../../utils/iamBindings/resourceKindToTypeMap';
import { isMemberPublic } from '../../utils/iam';

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

export async function putResourceIsPublicIntoJobState(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState, logger } = context;
  await jobState.iterateEntities(
    { _type: bindingEntities.BINDINGS._type },
    async (bindingEntity: BindingEntity) => {
      const { type, key } =
        makeLogsForTypeAndKeyResponse(
          logger,
          await getTypeAndKeyFromResourceIdentifier(
            bindingEntity.resource!,
            context,
          ),
        ) ?? {};
      if (typeof type !== 'string' || typeof key !== 'string') {
        return;
      }

      let accessLevel: 'private' | 'publicRead' | 'publicWrite' = 'private';
      let condition: string | undefined = undefined;
      const resourceIsPublic = (bindingEntity.members ?? []).some(
        isMemberPublic,
      );
      if (resourceIsPublic) {
        condition = bindingEntity['condition.expression'];
        const roleEntity = await jobState.findEntity(bindingEntity.role);
        if (!roleEntity) {
          // Not a runtime error - This would only happen due to an error when developing
          throw new Error(
            'Role Entitiy not found in Job state, make sure step create-binding-role-relationships is run prior to this step.',
          );
        }
        accessLevel = roleEntity!.readonly ? 'publicRead' : 'publicWrite';
      }
      await cacheIfResourceIsPublic(jobState, {
        type,
        key,
        accessLevel,
        condition,
      });
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
                    relationshipDirection: RelationshipDirection.REVERSE,
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

function getServiceFromResourceIdentifier(googleResourceIdentifier: string) {
  const [_, __, service, ..._rest] = googleResourceIdentifier.split('/');
  return service;
}

export async function createBindingToAnyResourceRelationships(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState, instance, logger } = context;
  const enabledServiceNames = await getEnabledServiceNames(instance.config);
  await jobState.iterateEntities(
    { _type: bindingEntities.BINDINGS._type },
    async (bindingEntity: BindingEntity) => {
      const { type, key } =
        makeLogsForTypeAndKeyResponse(
          logger,
          await getTypeAndKeyFromResourceIdentifier(
            bindingEntity.resource,
            context,
          ),
        ) ?? {};
      if (typeof type !== 'string' || typeof key !== 'string') {
        return;
      }
      // Check to see if service is enabled prior to searching the jobState for an entity
      const service = getServiceFromResourceIdentifier(bindingEntity.resource);
      const existingEntity = enabledServiceNames.includes(service)
        ? await jobState.findEntity(key)
        : undefined;

      const { accessLevel, condition } =
        (await getIfResourceIsPublic(jobState, type, key)) ?? {};
      await jobState.addRelationship(
        existingEntity
          ? createDirectRelationship({
              from: bindingEntity,
              _class: RelationshipClass.ALLOWS,
              to: existingEntity,
              properties: {
                accessLevel,
                accessLevelCondition: condition,
                accessLevelIsConditional: !!condition,
              },
            })
          : createMappedRelationship({
              _class: BINDING_ALLOWS_ANY_RESOURCE_RELATIONSHIP._class,
              _type: generateRelationshipType(
                RelationshipClass.ALLOWS,
                bindingEntities.BINDINGS._type,
                type,
              ),
              properties: {
                accessLevel,
                accessLevelCondition: condition,
                accessLevelIsConditional: !!condition,
              },
              _mapping: {
                relationshipDirection: RelationshipDirection.FORWARD,
                sourceEntityKey: bindingEntity._key,
                targetFilterKeys: [
                  // Because there is no one-to-one-mapping from Google Resource Kind to J1 Type, only map on the `_key`.
                  type === MULTIPLE_J1_TYPES_FOR_RESOURCE_KIND
                    ? ['_key']
                    : ['_type', '_key'],
                ],
                skipTargetCreation: false,
                targetEntity: {
                  // When there is no one-to-one-mapping from Google Resource Kind to J1 Type, do not set the _type on target entities.
                  _type:
                    type === MULTIPLE_J1_TYPES_FOR_RESOURCE_KIND
                      ? undefined
                      : type,
                  _key: key,
                  resourceIdentifier: bindingEntity.resource,
                  accessLevel,
                  accessLevelCondition: condition,
                  accessLevelIsConditional: !!condition,
                },
              },
            }),
      );
    },
  );
}

export const cloudAssetSteps: IntegrationStep<IntegrationConfig>[] = [
  {
    id: STEP_IAM_BINDINGS,
    name: 'IAM Bindings',
    entities: [bindingEntities.BINDINGS],
    relationships: [],
    dependsOn: [STEP_RESOURCE_MANAGER_ORG_PROJECT_RELATIONSHIPS],
    executionHandler: fetchIamBindings,
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
    dependsOn: [
      STEP_IAM_BINDINGS,
      STEP_IAM_CUSTOM_ROLES,
      STEP_IAM_SERVICE_ACCOUNTS,
      STEP_IAM_MANAGED_ROLES,
    ],
    executionHandler: createPrincipalRelationships,
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
  },
  {
    id: STEP_CACHE_IF_RESOURCES_ARE_PUBLIC,
    name: 'Calculate If Resources Are Public',
    entities: [],
    relationships: [],
    dependsOn: [STEP_CREATE_BINDING_ROLE_RELATIONSHIPS],
    executionHandler: putResourceIsPublicIntoJobState,
  },
  {
    id: STEP_CREATE_BINDING_ANY_RESOURCE_RELATIONSHIPS,
    name: 'Role Binding to Any Resource Relationships',
    entities: [],
    relationships: [BINDING_ALLOWS_ANY_RESOURCE_RELATIONSHIP],
    dependsOn: [],
    executionHandler: createBindingToAnyResourceRelationships,
    dependencyGraphId: 'last',
  },
];
