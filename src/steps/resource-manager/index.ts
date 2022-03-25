import {
  IntegrationStep,
  Entity,
  createDirectRelationship,
  createMappedRelationship,
  RelationshipDirection,
} from '@jupiterone/integration-sdk-core';
import { ResourceManagerClient } from './client';
import { IntegrationConfig, IntegrationStepContext } from '../../types';
import {
  createAuditConfigEntity,
  createFolderEntity,
  createOrganizationEntity,
  createProjectEntity,
} from './converters';
import {
  ResourceManagerStepIds,
  ResourceManagerEntities,
  ResourceManagerRelationships,
} from './constants';
import { STEP_IAM_SERVICE_ACCOUNTS } from '../iam';
import { ParsedIamMember, parseIamMember } from '../../utils/iam';
import { RelationshipClass } from '@jupiterone/data-model';
import { cacheProjectNameAndId } from '../../utils/jobState';
import {
  ServiceUsageEntities,
  ServiceUsageStepIds,
} from '../service-usage/constants';
import { getServiceApiEntityKey } from '../service-usage/converters';
import { buildIamTargetRelationship } from '../cloud-asset';

export interface IamUserEntityWithParsedMember {
  parsedMember: ParsedIamMember;
  userEntity: Entity | null;
}

export async function maybeFindIamUserEntityWithParsedMember({
  context,
  member,
}: {
  context: IntegrationStepContext;
  member: string;
}): Promise<IamUserEntityWithParsedMember> {
  const { jobState } = context;
  const parsedMember = parseIamMember(member);
  const { identifier: parsedIdentifier, type: parsedMemberType } = parsedMember;
  let userEntity: Entity | null = null;

  if (parsedIdentifier && parsedMemberType === 'serviceAccount') {
    userEntity = await jobState.findEntity(parsedIdentifier);
  }

  return {
    parsedMember,
    userEntity,
  };
}

export async function fetchResourceManagerOrganization(
  context: IntegrationStepContext,
): Promise<void> {
  const {
    jobState,
    instance: { config },
  } = context;
  const client = new ResourceManagerClient({ config });

  const organization = await client.getOrganization();
  await jobState.addEntity(createOrganizationEntity(organization));
}

export async function fetchResourceManagerFolders(
  context: IntegrationStepContext,
): Promise<void> {
  const {
    jobState,
    instance: { config },
  } = context;
  const client = new ResourceManagerClient({ config });

  // Sending parentFolder name instead of Entity would be "cheaper", but we'd need to use
  // many jobState.findEntity calls to fetch parentFolder entity
  const getAllInnerFolders = async (
    client: ResourceManagerClient,
    parentFolder: Entity,
    parentFolderName: string,
  ) => {
    await client.iterateFolders(async (folder) => {
      const folderEntity = createFolderEntity(folder);
      await jobState.addEntity(folderEntity);

      // Builds folder -> HAS -> folder
      await jobState.addRelationship(
        createDirectRelationship({
          _class: RelationshipClass.HAS,
          from: parentFolder,
          to: folderEntity,
        }),
      );

      await getAllInnerFolders(client, folderEntity, folder.name!);
    }, parentFolderName);
  };

  const organizationEntity = await jobState.findEntity(
    `organizations/${client.organizationId}`,
  );
  if (organizationEntity) {
    let folderParent;
    if (client.folderId) {
      folderParent = 'folders/' + client.folderId;
    }
    // Iterate organization's folders (starting point)
    await client.iterateFolders(async (folder) => {
      const folderEntity = createFolderEntity(folder);
      await jobState.addEntity(folderEntity);

      // Builds organization -> HAS -> folder
      await jobState.addRelationship(
        createDirectRelationship({
          _class: RelationshipClass.HAS,
          from: organizationEntity,
          to: folderEntity,
        }),
      );

      await getAllInnerFolders(client, folderEntity, folder.name!);
    }, folderParent);
  }
}

export async function buildOrgFolderProjectMappedRelationships(
  context: IntegrationStepContext,
): Promise<void> {
  const {
    jobState,
    instance: { config },
  } = context;
  const client = new ResourceManagerClient({ config });

  const organizationEntity = await jobState.findEntity(
    `organizations/${client.organizationId}`,
  );
  // Organization -> HAS -> Projects
  let folderParent;
  if (config.folderId) {
    folderParent = 'folders/' + config.folderId;
  }

  if (organizationEntity) {
    await client.iterateProjects(async (project) => {
      const projectEntity = createProjectEntity(client.projectId, project);
      await cacheProjectNameAndId(jobState, project);

      await jobState.addRelationship(
        createMappedRelationship({
          _class: RelationshipClass.HAS,
          _type: ResourceManagerRelationships.ORGANIZATION_HAS_PROJECT._type,
          _mapping: {
            relationshipDirection: RelationshipDirection.FORWARD,
            sourceEntityKey: organizationEntity._key,
            targetFilterKeys: [['_type', '_key']],
            targetEntity: {
              ...projectEntity,
              _rawData: undefined,
            },
          },
        }),
      );
    }, folderParent);
  }

  // Folder -> HAS (mappedRelationship) -> Projects
  await jobState.iterateEntities(
    {
      _type: ResourceManagerEntities.FOLDER._type,
    },
    async (folderEntity) => {
      await client.iterateProjects(async (project) => {
        const projectEntity = createProjectEntity(client.projectId, project);
        await cacheProjectNameAndId(jobState, project);

        await jobState.addRelationship(
          createMappedRelationship({
            _class: RelationshipClass.HAS,
            _type: ResourceManagerRelationships.FOLDER_HAS_PROJECT._type,
            _mapping: {
              relationshipDirection: RelationshipDirection.FORWARD,
              sourceEntityKey: folderEntity._key,
              targetFilterKeys: [['_type', '_key']],
              targetEntity: {
                ...projectEntity,
                _rawData: undefined,
              },
            },
          }),
        );
      }, folderEntity.name as string);
    },
  );
}

export async function fetchResourceManagerProject(
  context: IntegrationStepContext,
): Promise<void> {
  const {
    jobState,
    instance: { config },
    logger,
  } = context;
  const client = new ResourceManagerClient({ config });

  let project;
  try {
    project = await client.getProject();
    await cacheProjectNameAndId(jobState, project);
  } catch (err) {
    // This step _always_ executes because it creates a root `Account` entity for the integration instance.
    // However, users can only fetch the project details if cloudresourcemanager API is enabled.
    const message =
      'Could not fetch project from Cloud Resource Manager API. Ensure the API is enabled and the service account has the ' +
      '`resourcemanager.projects.get` permission (see ' +
      'https://github.com/JupiterOne/graph-google-cloud/blob/master/docs/development.md#enabling-google-cloud-services) ' +
      `${JSON.stringify({ code: err.code, message: err.message })}`;
    if (err.code === 403) {
      logger.warn({ err }, message);
    } else {
      logger.error({ err }, message);
    }
    logger.publishEvent({
      name: 'auth_error',
      description: message,
    });
  }

  const projectEntity = createProjectEntity(client.projectId, project);

  await jobState.setData(ResourceManagerEntities.PROJECT._type, projectEntity);
  await jobState.addEntity(projectEntity);
}

export async function fetchIamPolicyAuditConfig(
  context: IntegrationStepContext,
): Promise<void> {
  const {
    instance: { config },
    jobState,
    logger,
  } = context;
  const client = new ResourceManagerClient({ config });

  await client.iteratePolicyAuditConfigs(async (auditConfig) => {
    const auditConfigEntity = createAuditConfigEntity(auditConfig);
    await jobState.addEntity(auditConfigEntity);

    if (auditConfig.service === 'allServices') {
      await jobState.iterateEntities(
        {
          _type: ServiceUsageEntities.API_SERVICE._type,
        },
        async (serviceEntity) => {
          if (serviceEntity.isAuditable) {
            await jobState.addRelationship(
              createDirectRelationship({
                _class: RelationshipClass.USES,
                from: serviceEntity,
                to: auditConfigEntity,
              }),
            );
          }
        },
      );
    } else {
      const serviceEntity = await jobState.findEntity(
        getServiceApiEntityKey({
          projectId: client.projectId,
          serviceApiName: auditConfig.service as string,
        }),
      );

      if (serviceEntity) {
        await jobState.addRelationship(
          createDirectRelationship({
            _class: RelationshipClass.USES,
            from: serviceEntity,
            to: auditConfigEntity,
          }),
        );
      }
    }

    for (const auditLogConfig of auditConfig.auditLogConfigs || []) {
      const exemptedMembers = auditLogConfig.exemptedMembers;
      const logType = auditLogConfig.logType;
      if (exemptedMembers) {
        for (const exemptedMember of exemptedMembers) {
          const parsedMember = parseIamMember(exemptedMember);
          const { identifier: parsedIdentifier, type: parsedMemberType } =
            parsedMember;
          let principalEntity: Entity | null = null;
          if (parsedIdentifier && parsedMemberType === 'serviceAccount') {
            principalEntity = await jobState.findEntity(parsedIdentifier);
          }

          const relationship = buildIamTargetRelationship({
            fromEntity: auditConfigEntity,
            principalEntity,
            parsedMember,
            logger,
            projectId: client.projectId,
            additionalProperties: { logType },
            relationshipClass: RelationshipClass.ALLOWS,
          });

          if (relationship) {
            await jobState.addRelationship(relationship);
          }
        }
      }
    }
  });
}

export const resourceManagerSteps: IntegrationStep<IntegrationConfig>[] = [
  {
    id: ResourceManagerStepIds.FETCH_ORGANIZATION,
    name: 'Resource Manager Organization',
    entities: [ResourceManagerEntities.ORGANIZATION],
    relationships: [],
    dependsOn: [],
    executionHandler: fetchResourceManagerOrganization,
  },
  {
    id: ResourceManagerStepIds.FETCH_FOLDERS,
    name: 'Resource Manager Folders',
    entities: [ResourceManagerEntities.FOLDER],
    relationships: [
      ResourceManagerRelationships.ORGANIZATION_HAS_FOLDER,
      ResourceManagerRelationships.FOLDER_HAS_FOLDER,
    ],
    dependsOn: [ResourceManagerStepIds.FETCH_ORGANIZATION],
    executionHandler: fetchResourceManagerFolders,
  },
  {
    id: ResourceManagerStepIds.BUILD_ORG_PROJECT_RELATIONSHIPS,
    name: 'Resource Manager Projects',
    entities: [],
    relationships: [
      ResourceManagerRelationships.ORGANIZATION_HAS_PROJECT,
      ResourceManagerRelationships.FOLDER_HAS_PROJECT,
    ],
    dependsOn: [
      ResourceManagerStepIds.FETCH_ORGANIZATION,
      ResourceManagerStepIds.FETCH_FOLDERS,
    ],
    executionHandler: buildOrgFolderProjectMappedRelationships,
  },
  {
    id: ResourceManagerStepIds.FETCH_PROJECT,
    name: 'Resource Manager Project',
    entities: [ResourceManagerEntities.PROJECT],
    relationships: [],
    dependsOn: [],
    executionHandler: fetchResourceManagerProject,
  },
  {
    id: ResourceManagerStepIds.FETCH_IAM_POLICY_AUDIT_CONFIG,
    name: 'Audit Config IAM Policy',
    entities: [ResourceManagerEntities.AUDIT_CONFIG],
    relationships: [
      ResourceManagerRelationships.API_SERVICE_USES_AUDIT_CONFIG,
      ResourceManagerRelationships.AUDIT_CONFIG_ALLOWS_SERVICE_ACCOUNT,
      ResourceManagerRelationships.AUDIT_CONFIG_ALLOWS_USER,
      ResourceManagerRelationships.AUDIT_CONFIG_ALLOWS_GROUP,
      ResourceManagerRelationships.AUDIT_CONFIG_ALLOWS_DOMAIN,
    ],
    executionHandler: fetchIamPolicyAuditConfig,
    dependsOn: [
      ServiceUsageStepIds.FETCH_API_SERVICES,
      STEP_IAM_SERVICE_ACCOUNTS,
    ],
  },
];
