import {
  createDirectRelationship,
  createMappedRelationship,
  Entity,
  ExplicitRelationship,
  generateRelationshipType,
  getRawData,
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
  ORGANIZATION_ENTITY_TYPE,
  FOLDER_ENTITY_TYPE,
  PROJECT_ENTITY_TYPE,
} from '../resource-manager';
import { CloudAssetClient } from './client';
import {
  API_SERVICE_HAS_ANY_RESOURCE_RELATIONSHIP,
  bindingEntities,
  BINDING_ALLOWS_ANY_RESOURCE_RELATIONSHIP,
  BINDING_ASSIGNED_PRINCIPAL_RELATIONSHIPS,
  STEP_CREATE_API_SERVICE_ANY_RESOURCE_RELATIONSHIPS,
  STEP_CREATE_BASIC_ROLES,
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
import {
  getTypeAndKeyFromResourceIdentifier,
  makeLogsForTypeAndKeyResponse,
} from '../../utils/iamBindings/getTypeAndKeyFromResourceIdentifier';
import { getEnabledServiceNames } from '../enablement';
import { MULTIPLE_J1_TYPES_FOR_RESOURCE_KIND } from '../../utils/iamBindings/resourceKindToTypeMap';
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
import { API_SERVICE_ENTITY_TYPE } from '../service-usage';
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
  const client = new CloudAssetClient({ config: instance.config });
  let iamBindingsCount = 0;

  const bindingGraphKeySet = new Set<string>();
  const duplicateBindingGraphKeys: string[] = [];

  try {
    await client.iterateAllIamPolicies(context, async (policyResult) => {
      const resource = policyResult.resource;
      const projectName = policyResult.project;
      const { organization, folders } = policyResult as any;
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
        const permissions = binding.role
          ? roleEntity
            ? ((roleEntity.permissions as string) || '').split(',')
            : await getPermissionsForManagedRole(jobState, binding.role)
          : [];

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

function createBasicRoleKey(orgHierarchyKey: string, roleIdentifier: string) {
  return orgHierarchyKey + '/' + roleIdentifier;
}

export async function findOrCreateIamRoleEntity({
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

export async function createBindingRoleRelationships(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState, logger } = context;
  await jobState.iterateEntities(
    { _type: bindingEntities.BINDINGS._type },
    async (bindingEntity: BindingEntity) => {
      if (bindingEntity.role) {
        let roleKey: string = bindingEntity.role;
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
          roleKey = createBasicRoleKey(key, bindingEntity.role);
        }

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
                /**
                 * The mapper does not properly remove mapper-created entities at the moment. These
                 * entities will never be cleaned up which will cause duplicates.
                 *
                 * However, we should still create these entities as they are important for access
                 * analysis and having duplicates shouldn't matter too much with IAM roles.
                 */
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
  bindingEntity,
  principalEntity,
  parsedMember,
  projectId,
  condition,
}: {
  bindingEntity: BindingEntity;
  principalEntity: Entity | null;
  parsedMember: ParsedIamMember;
  projectId?: string;
  condition?: cloudresourcemanager_v3.Schema$Expr;
}): Relationship {
  if (principalEntity) {
    return createDirectRelationship({
      _class: RelationshipClass.ASSIGNED,
      from: bindingEntity,
      to: principalEntity,
      properties: {
        projectId,
        ...(condition && getConditionRelationshipProperties(condition)),
      },
    });
  } else {
    const targetEntity = CREATE_IAM_ENTITY_MAP[parsedMember.type](parsedMember);
    return createMappedRelationship({
      _class: RelationshipClass.ASSIGNED,
      _mapping: {
        relationshipDirection: RelationshipDirection.FORWARD,
        sourceEntityKey: bindingEntity._key,
        targetFilterKeys: targetEntity._key // Not always able to determine a _key for google_users depending on how the binding is set up
          ? [['_key', '_type']]
          : [['_type', 'email']],
        /**
         * The mapper does not properly remove mapper-created entities at the moment. These
         * entities will never be cleaned up which will causes duplicates.
         *
         * However, we should still create these entities as they are important for access
         * analysis. Without these relationships, it will make is look like something is
         * secure when it actually is not. We will just have to deal with the duplicates.
         */
        skipTargetCreation: false,
        targetEntity,
      },
      properties: {
        _type: generateRelationshipType(
          RelationshipClass.ASSIGNED,
          bindingEntity._type,
          targetEntity._type!,
        ),
        projectId,
        ...(condition && getConditionRelationshipProperties(condition)),
      },
    });
  }
}

function getOrgHierarchyKeysForBinding(bindingEntity: BindingEntity) {
  return [
    bindingEntity.projectName,
    ...(bindingEntity.folders ?? []),
    bindingEntity.organization,
  ].filter((identifier) => !!identifier);
}

async function createAndAddConvienceMemberTargetRelationships(
  jobState: JobState,
  member: string,
  bindingEntity: BindingEntity,
  safeAddRelationship: (relationship: ExplicitRelationship) => Promise<void>,
  condition?: cloudresourcemanager_v3.Schema$Expr,
) {
  const convenienceMember = member.split(':')[0] as ConvenienceMemberType; // 'projectOwner:PROJECT_ID' => 'projectOwner'
  for (const orgHierarchyKey of getOrgHierarchyKeysForBinding(bindingEntity)) {
    // Find the Basic Role that relates to this member.
    const roleKey = createBasicRoleKey(
      orgHierarchyKey!,
      getRoleKeyFromConvienenceMember(convenienceMember),
    );
    const roleEntity = await jobState.findEntity(roleKey);
    if (roleEntity) {
      await safeAddRelationship(
        createDirectRelationship({
          _class: RelationshipClass.ASSIGNED,
          from: bindingEntity,
          to: roleEntity,
          properties: {
            projectId: bindingEntity.projectId,
            ...(condition && getConditionRelationshipProperties(condition)),
          },
        }),
      );
    }
  }
}

export async function createPrincipalRelationships(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState } = context;

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
              bindingEntity,
              principalEntity,
              parsedMember,
              projectId: bindingEntity.projectId,
              condition,
            }),
          );
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
  const relationshipKeys = new Set<string>();

  async function safeAddRelationship(relationship?: Relationship) {
    if (relationship && !relationshipKeys.has(relationship._key)) {
      await jobState.addRelationship(relationship);
      relationshipKeys.add(String(relationship._key));
    }
  }

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
      const relationship = existingEntity
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
              /**
               * The mapper does not properly remove mapper-created entities at the moment. These
               * entities will never be cleaned up which will cause duplicates.
               *
               * Until this is fixed, we should not create mapped relationships with target creation
               * enabled, thus only creating iam_binding relationships to resources that have already
               * been ingested by other integrations.
               *
               * This is a BIG problem because we can no longer tell a customer with 100% confidence
               * that they do not have any insecure resources if they have yet to have an integration
               * ingest that resource.
               */
              skipTargetCreation: true,
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

function isOrganizationalHierarchyResource(resourceType: string) {
  return [
    ORGANIZATION_ENTITY_TYPE,
    FOLDER_ENTITY_TYPE,
    PROJECT_ENTITY_TYPE,
    API_SERVICE_ENTITY_TYPE,
  ].includes(resourceType);
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
      if (isOrganizationalHierarchyResource(resourceType!)) return;
      if (!googleResourceKind || !resourceKey) return;

      const serviceIdentifier = googleResourceKind.split('/')[0]; // 'cloudfunctions.googleapis.com/CloudFunction' => 'cloudfunctions.googleapis.com'
      const serviceKey = buildServiceGraphObjectKey(
        bindingEntity,
        serviceIdentifier,
      );
      const serviceEntity = await jobState.findEntity(serviceKey);
      const resourceEntity = await jobState.findEntity(resourceKey);

      // We can not make these relationships for sqladmin.googleapis.com/Instances
      // A Google Resource Type of sqladmin.googleapis.com/Instances could be a
      // google_sql_mysql_instance, a google_sql_postgres_instance, or a
      // google_sql_sql_server_instance. There is no way to tell at the moment.
      if (
        !serviceEntity ||
        !resourceType ||
        resourceType === MULTIPLE_J1_TYPES_FOR_RESOURCE_KIND
      )
        return;

      await jobState.addRelationship(
        resourceEntity
          ? createDirectRelationship({
              _class: RelationshipClass.HAS,
              from: serviceEntity,
              to: resourceEntity,
            })
          : createMappedRelationship({
              _class: RelationshipClass.HAS,
              _type: generateRelationshipType(
                RelationshipClass.HAS,
                API_SERVICE_ENTITY_TYPE,
                resourceType,
              ),
              source: serviceEntity,
              /**
               * The mapper does not properly remove mapper-created entities at the moment. These
               * entities will never be cleaned up which will cause duplicates.
               *
               * Until this is fixed, we should not create mapped relationships with target creation
               * enabled, thus only creating iam_binding relationships to resources that have already
               * been ingested by other integrations.
               */
              skipTargetCreation: true,
              target: {
                _type: resourceType,
                _key: resourceKey,
                resourceIdentifier: bindingEntity.resource,
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
