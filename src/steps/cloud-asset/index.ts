import {
  createDirectRelationship,
  createMappedRelationship,
  Entity,
  ExplicitRelationship,
  generateRelationshipType,
  getRawData,
  IntegrationError,
  IntegrationLogger,
  JobState,
  MappedRelationship,
  PrimitiveEntity,
  Relationship,
  RelationshipClass,
  RelationshipDirection,
} from '@jupiterone/integration-sdk-core';
import { cloudasset_v1, cloudresourcemanager_v3 } from 'googleapis';
import {
  GoogleCloudIntegrationStep,
  IntegrationStepContext,
} from '../../types';
import { publishMissingPermissionEvent } from '../../utils/events';
import { getProjectIdFromName } from '../../utils/jobState';
import { IAM_ROLE_ENTITY_CLASS, IAM_ROLE_ENTITY_TYPE } from '../iam';
import {
  ORGANIZATION_ENTITY_TYPE,
  FOLDER_ENTITY_TYPE,
  PROJECT_ENTITY_TYPE,
} from '../resource-manager';
import { CloudAssetClient } from './client';
import {
  API_SERVICE_HAS_ANY_RESOURCE_RELATIONSHIP,
  BINDING_ALLOWS_ANY_RESOURCE_RELATIONSHIP,
  BINDING_ASSIGNED_PRINCIPAL_RELATIONSHIPS,
  STEP_CREATE_API_SERVICE_ANY_RESOURCE_RELATIONSHIPS,
  STEP_CREATE_BASIC_ROLES,
  STEP_CREATE_BINDING_ANY_RESOURCE_RELATIONSHIPS,
  STEP_CREATE_BINDING_PRINCIPAL_RELATIONSHIPS,
  STEP_CREATE_BINDING_ROLE_RELATIONSHIPS,
  STEP_IAM_BINDINGS,
  bindingEntities,
} from './constants';
import {
  BindingEntity,
  buildIamBindingEntityKey,
  createIamBindingEntity,
} from './converters';
import {
  getTypeAndKeyFromResourceIdentifier,
  makeLogsForTypeAndKeyResponse,
} from '../../utils/iamBindings/getTypeAndKeyFromResourceIdentifier';
import { createIamRoleEntity } from '../iam/converters';
import {
  basicRoles,
  BasicRoleType,
  ConvenienceMemberType,
  getIamManagedRoleData,
  getRoleKeyFromConvienenceMember,
  isConvienenceMember,
  ParsedIamMember,
  parseIamMember,
} from '../../utils/iam';
import { ServiceUsageEntities } from '../service-usage/constants';
import { CREATE_IAM_ENTITY_MAP } from '../resource-manager/createIamEntities';

export async function getPermissionsForManagedRole(
  jobState: JobState,
  roleName: string,
): Promise<string[] | null | undefined> {
  const iamManagedRoleData = await getIamManagedRoleData(jobState);
  return iamManagedRoleData[roleName]?.includedPermissions;
}

export async function fetchIamBindings(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState, instance, logger } = context;

  if (instance.config.markBindingStepsAsPartial) {
    throw new IntegrationError({
      message:
        'google_iam_binding entity and relationship ingestion is temporarily disabled.',
      code: 'step_disabled',
    });
  }

  const client = new CloudAssetClient({ config: instance.config }, logger);
  let iamBindingsCount = 0;

  const bindingGraphKeySet = new Set<string>();
  const duplicateBindingGraphKeys: string[] = [];
  let maxPermissionLength = 0;
  let maxConditionLength = 0;

  async function handlePolicyResult(
    policyResult: cloudasset_v1.Schema$IamPolicySearchResult & {
      organization?: string | null;
      folders?: string[] | null;
    },
  ) {
    const resource = policyResult.resource;
    const projectName = policyResult.project;
    const { organization, folders } = policyResult;
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
        /**
         * We can not pull the projectId from the resource identifier because the resource
         * identifier does not gaurentee a projectId value.
         *
         * See https://cloud.google.com/asset-inventory/docs/resource-name-format and search
         * for cloudresourcemanager.googleapis.com/Project to see that the identifier could
         * either be for PROJECT_NUMBER or PROJECT_ID
         *
         * Because of this we have to pull the projectId from the jobState instead.
         */
        projectId = await getProjectIdFromName(jobState, projectName);
      }

      /**
       * We need to denormalize the permissions onto the role binding because J1QL does not support
       * baranching traversals, meaning that it is impossible to connect a resource, to a principle
       * to a role with a specific permission. Having the role's permissions on the binding prevents
       * any branching.
       */
      const roleEntity =
        binding.role && (await jobState.findEntity(binding.role));
      const permissions: string[] = binding.role
        ? roleEntity
          ? (roleEntity.permissions as any) ?? []
          : await getPermissionsForManagedRole(jobState, binding.role)
        : [];

      if (permissions?.length ?? 0 > maxPermissionLength) {
        maxPermissionLength = permissions?.length ?? 0;
      }

      const conditionLength =
        (JSON.stringify(binding.condition) ?? '')?.length ?? 0;
      if (conditionLength > maxConditionLength) {
        maxConditionLength = conditionLength;
      }

      await jobState.addEntity(
        createIamBindingEntity({
          _key,
          projectId,
          projectName,
          binding,
          resource,
          folders,
          organization,
          permissions,
        }),
      );

      bindingGraphKeySet.add(_key);
      iamBindingsCount++;
    }
  }

  // Need to get bindings for every level of the Resource Hierarchy.
  try {
    // Project level bindings and all resource level bindings in that project
    await client.iterateIamPoliciesForProjectAndResources(handlePolicyResult);
    // Folder level bindings
    await jobState.iterateEntities(
      { _type: FOLDER_ENTITY_TYPE },
      async (folderEntity: Entity) => {
        await client.iterateIamPoliciesForResourceAtScope(
          folderEntity._key,
          handlePolicyResult,
        );
      },
    );
    // Organization level bindings
    await jobState.iterateEntities(
      { _type: ORGANIZATION_ENTITY_TYPE },
      async (organizationEntity: Entity) => {
        await client.iterateIamPoliciesForResourceAtScope(
          organizationEntity._key,
          handlePolicyResult,
        );
      },
    );
  } catch (err) {
    if (err.status === 403) {
      logger.warn(
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
    {
      numIamBindings: iamBindingsCount,
      maxConditionLength,
      maxPermissionLength,
    },
    'Created IAM binding entities',
  );

  if (duplicateBindingGraphKeys.length) {
    logger.info(
      { duplicateBindingGraphKeys },
      'Found duplicate IAM binding graph keys',
    );
  }
}

function createBasicRoleKey(orgHierarchyKey: string, roleIdentifier: string) {
  return orgHierarchyKey + '/' + roleIdentifier;
}

async function findOrCreateIamRoleEntity({
  jobState,
  roleName,
  roleKey = roleName,
}: {
  jobState: JobState;
  roleName: string;
  roleKey?: string;
}) {
  const roleEntity = await jobState.findEntity(roleKey);
  if (roleEntity) {
    return roleEntity;
  }

  const includedPermissions = await getPermissionsForManagedRole(
    jobState,
    roleName,
  );
  return jobState.addEntity(
    createIamRoleEntity(
      {
        name: roleName,
        title: roleName,
        includedPermissions,
      },
      {
        custom: false,
        key: roleKey,
      },
    ),
  );
}

/**
 * Basic Roles roles exist at all levels of the organization resource hierarchy.
 * They are: roles/owner, roles/editor, roles/viewer and roles/browser
 *   https://cloud.google.com/iam/docs/understanding-roles#basic
 *
 * In order to make full access analysis possible, we need to create IAM Roles
 * for each Basic Role that is bond to a Project, Folder, or Organization via a
 * Role Binding.
 */
export async function createBasicRolesForBindings(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState, logger } = context;
  await jobState.iterateEntities(
    { _type: bindingEntities.BINDINGS._type },
    async (bindingEntity: BindingEntity) => {
      if (bindingEntity.role) {
        // Need to handle Basic Roles different than others as we need to add identifiers for what that basic role is attached to.
        // For example: roles/editor can be attached at either an Organization, Folder, or Project which will have a key of projects/12345/roles/editor.
        if (basicRoles.includes(bindingEntity.role as BasicRoleType)) {
          const { key } =
            makeLogsForTypeAndKeyResponse(
              logger,
              await getTypeAndKeyFromResourceIdentifier(
                bindingEntity.resource,
                context,
              ),
            ) ?? {};
          if (!key) return;
          await findOrCreateIamRoleEntity({
            jobState,
            roleName: bindingEntity.role,
            roleKey: createBasicRoleKey(key, bindingEntity.role),
          });
        }
      }
    },
  );
}

/**
 * We only create google_iam_role entities for "Custom" roles. Therefore, we need
 * to check to see if the role is in the jobState. If it is, the role is "Custom",
 * so make a direct relationship. If not, the roles is "Google Managed", so make
 * a mapped relationship and mark it as custom -> false.
 *
 * We also need to handle Basic Roles different than others because we append an
 * identifier to the key of the basic role relating to what that basic role is
 * attached to.
 * For example:
 *   roles/editor can be attached at either an Organization, Folder, or Project which will have a key of projects/12345/roles/editor.
 *
 * This is done by passing in a key with the "roleKey" parameter.
 */
async function createBindingRoleRelationship({
  context,
  bindingEntity,
  roleKey,
}) {
  const { jobState } = context;
  const roleEntity = await jobState.findEntity(roleKey);
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
        key: roleKey,
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

export async function createBindingRoleRelationships(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState, logger } = context;
  await jobState.iterateEntities(
    { _type: bindingEntities.BINDINGS._type },
    async (bindingEntity: BindingEntity) => {
      if (bindingEntity.role) {
        // Need to handle Basic Roles different than others as we need to add identifiers for what that basic role is attached to.
        // For example: roles/editor can be attached at either an Organization, Folder, or Project which will have a key of projects/12345/roles/editor.
        if (basicRoles.includes(bindingEntity.role as BasicRoleType)) {
          const { key } =
            makeLogsForTypeAndKeyResponse(
              logger,
              await getTypeAndKeyFromResourceIdentifier(
                bindingEntity.resource,
                context,
              ),
            ) ?? {};
          if (!key) return;
          const roleKey = createBasicRoleKey(key, bindingEntity.role);
          await createBindingRoleRelationship({
            context,
            bindingEntity,
            roleKey,
          });
        } else {
          await createBindingRoleRelationship({
            context,
            bindingEntity,
            roleKey: bindingEntity.role,
          });
        }
      }
    },
  );
}

export function getConditionRelationshipProperties(
  condition: cloudresourcemanager_v3.Schema$Expr,
) {
  return {
    conditionDescription: condition.description,
    conditionExpression: condition.expression,
    conditionLocation: condition.location,
    conditionTitle: condition.title,
  };
}

export function buildIamTargetRelationship({
  fromEntity,
  principalEntity,
  logger,
  parsedMember,
  projectId,
  projectName,
  condition,
  additionalProperties,
  relationshipClass,
}: {
  fromEntity: Entity;
  principalEntity: Entity | null;
  parsedMember: ParsedIamMember;
  logger: IntegrationLogger;
  projectId?: string;
  projectName?: string;
  condition?: cloudresourcemanager_v3.Schema$Expr;
  additionalProperties?: any;
  relationshipClass: RelationshipClass;
}): Relationship | undefined {
  if (principalEntity) {
    return createDirectRelationship({
      _class: relationshipClass,
      from: fromEntity,
      to: principalEntity,
      properties: {
        projectId,
        projectName,
        ...(condition && getConditionRelationshipProperties(condition)),
        ...additionalProperties,
      },
    });
  } else {
    const targetEntityFunction = CREATE_IAM_ENTITY_MAP[parsedMember.type];
    let targetEntity: Partial<PrimitiveEntity> | undefined = undefined;
    if (typeof targetEntityFunction === 'function') {
      targetEntity = targetEntityFunction(parsedMember);
    } else {
      logger.warn(
        { parsedMemberType: parsedMember.type },
        'Unable to find create entity function in CREATE_IAM_ENTITY_MAP',
      );
    }

    return targetEntity
      ? createMappedRelationship({
          _class: relationshipClass,
          _mapping: {
            relationshipDirection: RelationshipDirection.FORWARD,
            sourceEntityKey: fromEntity._key,
            targetFilterKeys: targetEntity._key // Not always able to determine a _key for google_users depending on how the binding is set up
              ? [['_key', '_type']]
              : [['_type', 'email']],
            skipTargetCreation: false,
            targetEntity,
          },
          properties: {
            _type: generateRelationshipType(
              relationshipClass,
              fromEntity._type,
              targetEntity._type!,
            ),
            projectId,
            projectName,
            ...(condition && getConditionRelationshipProperties(condition)),
            additionalProperties,
          },
        })
      : undefined;
  }
}

function getOrgHierarchyKeysForBinding(bindingEntity: BindingEntity) {
  return [
    bindingEntity.projectName,
    ...(bindingEntity.folders ?? []),
    bindingEntity.organization,
  ].filter((identifier) => !!identifier) as string[];
}

async function createAndAddConvienceMemberTargetRelationships(
  jobState: JobState,
  member: string,
  bindingEntity: BindingEntity,
  safeAddRelationship: (
    relationship: ExplicitRelationship | MappedRelationship,
  ) => Promise<void>,
  condition?: cloudresourcemanager_v3.Schema$Expr,
) {
  const convenienceMember = member.split(':')[0] as ConvenienceMemberType; // 'projectOwner:PROJECT_ID' => 'projectOwner'
  for (const orgHierarchyKey of getOrgHierarchyKeysForBinding(bindingEntity)) {
    // Find the Basic Role that relates to this member.
    const roleKey = createBasicRoleKey(
      orgHierarchyKey,
      getRoleKeyFromConvienenceMember(convenienceMember),
    );
    const targetRoleEntitiy = await jobState.findEntity(roleKey);
    await safeAddRelationship(
      targetRoleEntitiy
        ? createDirectRelationship({
            _class: RelationshipClass.ASSIGNED,
            from: bindingEntity,
            to: targetRoleEntitiy,
            properties: {
              projectId: bindingEntity.projectId,
              projectName: bindingEntity.projectName,
              ...(condition && getConditionRelationshipProperties(condition)),
            },
          })
        : createMappedRelationship({
            _class: RelationshipClass.ASSIGNED,
            _type: generateRelationshipType(
              RelationshipClass.ASSIGNED,
              bindingEntity._type,
              IAM_ROLE_ENTITY_TYPE,
            ),
            _mapping: {
              relationshipDirection: RelationshipDirection.FORWARD,
              sourceEntityKey: bindingEntity._key,
              targetFilterKeys: [['_key', '_type']],
              skipTargetCreation: false,
              // De do not need to make the whole role entity for thethe targetEntity here
              // because we already did that in the `createBindingRoleRelationships`. We
              // only need what is necessary to make the relationship.
              targetEntity: {
                _key: roleKey,
                _type: IAM_ROLE_ENTITY_TYPE,
              },
            },
            properties: {
              projectId: bindingEntity.projectId,
              projectName: bindingEntity.projectName,
              ...(condition && getConditionRelationshipProperties(condition)),
            },
          }),
    );
  }
}

export async function createPrincipalRelationships(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState, logger } = context;

  const principalRelationshipKeys = new Set<string>();

  async function safeAddRelationship(relationship?: Relationship) {
    if (relationship && !principalRelationshipKeys.has(relationship._key)) {
      await jobState.addRelationship(relationship);
      principalRelationshipKeys.add(String(relationship._key));
    }
  }

  await jobState.iterateEntities(
    { _type: bindingEntities.BINDINGS._type },
    async (bindingEntity: BindingEntity) => {
      const condition =
        getRawData<cloudresourcemanager_v3.Schema$Binding>(
          bindingEntity,
        )?.condition;

      for (const member of bindingEntity?.members ?? []) {
        if (isConvienenceMember(member)) {
          await createAndAddConvienceMemberTargetRelationships(
            jobState,
            member,
            bindingEntity,
            safeAddRelationship,
            condition,
          );
        } else {
          const parsedMember = parseIamMember(member);
          const { identifier: parsedIdentifier, type: parsedMemberType } =
            parsedMember;
          let principalEntity: Entity | null = null;
          if (parsedIdentifier && parsedMemberType === 'serviceAccount') {
            principalEntity = await jobState.findEntity(parsedIdentifier);
          }

          await safeAddRelationship(
            buildIamTargetRelationship({
              fromEntity: bindingEntity,
              principalEntity,
              parsedMember,
              logger,
              projectId: bindingEntity.projectId,
              projectName: bindingEntity.projectName,
              condition,
              relationshipClass: RelationshipClass.ASSIGNED,
            }),
          );
        }
      }
    },
  );
}

export async function createBindingToAnyResourceRelationships(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState, logger } = context;
  const relationshipKeys = new Set<string>();

  async function safeAddRelationship(relationship?: Relationship) {
    if (relationship && !relationshipKeys.has(relationship._key)) {
      await jobState.addRelationship(relationship);
      relationshipKeys.add(String(relationship._key));
    }
  }

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
      if (typeof key !== 'string') return;

      const existingEntity = await jobState.findEntity(key);

      const relationship = existingEntity
        ? createDirectRelationship({
            from: bindingEntity,
            _class: BINDING_ALLOWS_ANY_RESOURCE_RELATIONSHIP._class,
            to: existingEntity,
            properties: {
              _type: BINDING_ALLOWS_ANY_RESOURCE_RELATIONSHIP._type,
            },
          })
        : createMappedRelationship({
            _class: BINDING_ALLOWS_ANY_RESOURCE_RELATIONSHIP._class,
            _type: BINDING_ALLOWS_ANY_RESOURCE_RELATIONSHIP._type,
            _mapping: {
              relationshipDirection: RelationshipDirection.FORWARD,
              sourceEntityKey: bindingEntity._key,
              targetFilterKeys: [type ? ['_type', '_key'] : ['_key']],
              skipTargetCreation: true, // Each project should be in charge of ingesting its own resources
              targetEntity: {
                _type: type,
                _key: key,
                resourceIdentifier: bindingEntity.resource,
              },
            },
          });
      await safeAddRelationship(relationship);
    },
  );
}

function buildBindingEntityResourceKey(bindingEntity: BindingEntity) {
  return (
    (bindingEntity.projectId ?? bindingEntity.projectName) +
    '|' +
    bindingEntity.resource
  );
}

/**
 * Returns true if the passed in _type relates to an entity
 * that is a part of the Google Cloud Resource Hierarchy.
 * https://cloud.google.com/resource-manager/docs/cloud-platform-resource-hierarchy
 */
function isOrganizationalHierarchyResource(resourceType?: string) {
  return (
    !!resourceType &&
    [
      ORGANIZATION_ENTITY_TYPE,
      FOLDER_ENTITY_TYPE,
      PROJECT_ENTITY_TYPE,
      ServiceUsageEntities.API_SERVICE._type,
    ].includes(resourceType)
  );
}

function buildServiceGraphObjectKey(
  bindingEntity: BindingEntity,
  googleService: string,
) {
  return (
    'projects/' +
    (bindingEntity.projectId ?? bindingEntity.projectName) +
    '/services/' +
    googleService
  );
}

export async function createApiServiceToAnyResourceRelationships(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState, logger } = context;

  // Optimization to prevent calling jobState.findEntity for entities we have already made relationships for.
  const projectToResourceTracker = new Set<string>();

  await jobState.iterateEntities(
    { _type: bindingEntities.BINDINGS._type },
    async (bindingEntity: BindingEntity) => {
      // skip processing resource -> project pairs that we have already made relationships for.
      const projectToResourceTrackerKey =
        buildBindingEntityResourceKey(bindingEntity);
      if (projectToResourceTracker.has(projectToResourceTrackerKey)) return;
      projectToResourceTracker.add(projectToResourceTrackerKey);

      const {
        type: resourceType,
        key: resourceKey,
        metadata: { googleResourceKind },
      } = makeLogsForTypeAndKeyResponse(
        logger,
        await getTypeAndKeyFromResourceIdentifier(
          bindingEntity.resource,
          context,
        ),
      ) ?? {};

      // Do NOT make relationships for resources in the Organization Resource Heirarchy.
      if (isOrganizationalHierarchyResource(resourceType)) return;
      if (!googleResourceKind || !resourceKey) return;

      const serviceIdentifier = googleResourceKind.split('/')[0]; // 'cloudfunctions.googleapis.com/CloudFunction' => 'cloudfunctions.googleapis.com'
      const serviceKey = buildServiceGraphObjectKey(
        bindingEntity,
        serviceIdentifier,
      );

      const serviceEntity = await jobState.findEntity(serviceKey);
      if (!serviceEntity) return;

      const resourceEntity = await jobState.findEntity(resourceKey);
      await jobState.addRelationship(
        resourceEntity
          ? createDirectRelationship({
              _class: API_SERVICE_HAS_ANY_RESOURCE_RELATIONSHIP._class,
              from: serviceEntity,
              to: resourceEntity,
              properties: {
                _type: API_SERVICE_HAS_ANY_RESOURCE_RELATIONSHIP._type,
              },
            })
          : createMappedRelationship({
              _class: API_SERVICE_HAS_ANY_RESOURCE_RELATIONSHIP._class,
              _type: API_SERVICE_HAS_ANY_RESOURCE_RELATIONSHIP._type,
              _mapping: {
                relationshipDirection: RelationshipDirection.FORWARD,
                sourceEntityKey: serviceEntity._key,
                targetFilterKeys: [resourceType ? ['_type', '_key'] : ['_key']],
                skipTargetCreation: true, // Each project should be in charge of ingesting its own resources.
                targetEntity: {
                  _type: resourceType,
                  _key: resourceKey,
                  resourceIdentifier: bindingEntity.resource,
                },
              },
            }),
      );
    },
  );
}

export const cloudAssetSteps: GoogleCloudIntegrationStep[] = [
  {
    id: STEP_IAM_BINDINGS,
    name: 'IAM Bindings',
    entities: [bindingEntities.BINDINGS],
    relationships: [],
    dependsOn: [],
    executionHandler: fetchIamBindings,
    dependencyGraphId: 'last',
    permissions: ['cloudasset.assets.searchAllIamPolicies'],
    apis: ['cloudasset.googleapis.com'],
  },
  {
    id: STEP_CREATE_BASIC_ROLES,
    name: 'Identity and Access Management (IAM) Basic Roles',
    entities: [
      {
        resourceName: 'IAM Basic Role',
        _type: IAM_ROLE_ENTITY_TYPE,
        _class: IAM_ROLE_ENTITY_CLASS,
      },
    ],
    relationships: [],
    executionHandler: createBasicRolesForBindings,
    dependsOn: [STEP_IAM_BINDINGS],
    dependencyGraphId: 'last',
  },
  {
    id: STEP_CREATE_BINDING_PRINCIPAL_RELATIONSHIPS,
    name: 'IAM Binding Principal Relationships',
    entities: [],
    relationships: [...BINDING_ASSIGNED_PRINCIPAL_RELATIONSHIPS],
    dependsOn: [STEP_IAM_BINDINGS, STEP_CREATE_BASIC_ROLES],
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
    dependsOn: [STEP_IAM_BINDINGS, STEP_CREATE_BASIC_ROLES],
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
  {
    id: STEP_CREATE_API_SERVICE_ANY_RESOURCE_RELATIONSHIPS,
    name: 'Api Service to Any Resource Relationships',
    entities: [],
    relationships: [API_SERVICE_HAS_ANY_RESOURCE_RELATIONSHIP],
    dependsOn: [STEP_IAM_BINDINGS],
    executionHandler: createApiServiceToAnyResourceRelationships,
    dependencyGraphId: 'last',
  },
];
