import {
  createDirectRelationship,
  createMappedRelationship,
  generateRelationshipType,
  IntegrationStep,
  JobState,
  Relationship,
  RelationshipClass,
  RelationshipDirection,
} from '@jupiterone/integration-sdk-core';
import { cloudresourcemanager_v3 } from 'googleapis';
import { IntegrationConfig } from '../..';
import { IntegrationStepContext } from '../../types';
import { publishMissingPermissionEvent } from '../../utils/events';
import { getProjectIdFromName } from '../../utils/jobState';
import { IAM_ROLE_ENTITY_CLASS, IAM_ROLE_ENTITY_TYPE } from '../iam';
import {
  buildIamTargetRelationship,
  findOrCreateIamRoleEntity,
  getPermissionsForManagedRole,
  maybeFindIamUserEntityWithParsedMember,
  shouldMakeTargetIamRelationships,
} from '../resource-manager';
import { CloudAssetClient } from './client';
import {
  bindingEntities,
  BINDING_ALLOWS_ANY_RESOURCE_RELATIONSHIP,
  BINDING_ASSIGNED_PRINCIPAL_RELATIONSHIPS,
  PRINCIPAL_ASSIGNED_ROLE_RELATIONSHIPS,
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
import { isReadOnlyPermission } from '../../utils/iam';
import { createIamRoleEntity } from '../iam/converters';

async function isBindingReadOnly(
  jobState: JobState,
  roleName: string | undefined | null,
): Promise<boolean> {
  let permissions: string[] | null | undefined = undefined;
  if (roleName) {
    // previously ingested custom role entity
    const roleEntity = await jobState.findEntity(roleName);
    if (roleEntity) {
      permissions = ((roleEntity.permissions as string) || '').split(',');
    } else {
      // managed role data from jobState
      permissions = await getPermissionsForManagedRole(jobState, roleName);
    }
  }
  return permissions?.some(isReadOnlyPermission) ?? true; // default to true if there are no permissions
}

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
            // This would only happen if we have not run fetch-resource-manager-org-project-relationships, which caches project data
            logger.warn({ projectName }, 'Missing project ID in local cache');
          }
        }

        const isReadOnly = await isBindingReadOnly(jobState, binding.role);
        await jobState.addEntity(
          createIamBindingEntity({
            _key,
            projectId,
            binding,
            resource,
            isReadOnly,
          }),
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
          const includedPermissions = await getPermissionsForManagedRole(
            jobState,
            bindingEntity.role,
          );
          const targetRoleEntitiy = createIamRoleEntity(
            {
              name: bindingEntity.role,
              title: bindingEntity.role,
              includedPermissions,
            },
            {
              custom: false,
            },
          );
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
                  ...targetRoleEntitiy,
                  _rawData: undefined,
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
                /**
                 * We need to create IAM managed role entities here because the sdk does not allow for creating
                 * mapped relationships with two target entities.
                 *
                 * NOTE: This will duplicate Google Managed Roles if multiple Google Cloud Organizations are
                 * ingested in a single JupiterOne account.
                 */
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
      await jobState.addRelationship(
        existingEntity
          ? createDirectRelationship({
              from: bindingEntity,
              _class: RelationshipClass.ALLOWS,
              to: existingEntity,
            })
          : createMappedRelationship({
              _class: BINDING_ALLOWS_ANY_RESOURCE_RELATIONSHIP._class,
              _type: generateRelationshipType(
                RelationshipClass.ALLOWS,
                bindingEntities.BINDINGS._type,
                type,
              ),
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
    // Needs to run after all google_iam_roles have been created in this integration
    dependsOn: [STEP_CREATE_BINDING_PRINCIPAL_RELATIONSHIPS],
    executionHandler: createBindingRoleRelationships,
    dependencyGraphId: 'last',
  },
  {
    id: STEP_CREATE_BINDING_ANY_RESOURCE_RELATIONSHIPS,
    name: 'Role Binding to Any Resource Relationships',
    entities: [],
    relationships: [BINDING_ALLOWS_ANY_RESOURCE_RELATIONSHIP],
    dependsOn: [STEP_IAM_BINDINGS],
    executionHandler: createBindingToAnyResourceRelationships,
    dependencyGraphId: 'last',
  },
];
