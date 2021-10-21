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
  STEP_RESOURCE_MANAGER_PROJECT,
  PROJECT_ENTITY_TYPE,
  STEP_RESOURCE_MANAGER_ORGANIZATION,
  ORGANIZATION_ENTITY_TYPE,
  ORGANIZATION_ENTITY_CLASS,
  STEP_RESOURCE_MANAGER_FOLDERS,
  FOLDER_ENTITY_TYPE,
  FOLDER_ENTITY_CLASS,
  ORGANIZATION_HAS_FOLDER_RELATIONSHIP_TYPE,
  FOLDER_HAS_FOLDER_RELATIONSHIP_TYPE,
  STEP_RESOURCE_MANAGER_ORG_PROJECT_RELATIONSHIPS,
  ORGANIZATION_HAS_PROJECT_RELATIONSHIP_TYPE,
  FOLDER_HAS_PROJECT_RELATIONSHIP_TYPE,
  STEP_AUDIT_CONFIG_IAM_POLICY,
  AUDIT_CONFIG_ENTITY_CLASS,
  AUDIT_CONFIG_ENTITY_TYPE,
  SERVICE_USES_AUDIT_CONFIG_RELATIONSHIP_TYPE,
} from './constants';
import { ParsedIamMember, parseIamMember } from '../../utils/iam';
import { RelationshipClass } from '@jupiterone/data-model';
import { cacheProjectNameAndId } from '../../utils/jobState';
import {
  API_SERVICE_ENTITY_TYPE,
  STEP_API_SERVICES,
} from '../service-usage/constants';
import { getServiceApiEntityKey } from '../service-usage/converters';

export * from './constants';

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
    });
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
  if (organizationEntity) {
    await client.iterateProjects(async (project) => {
      const projectEntity = createProjectEntity(client.projectId, project);
      await cacheProjectNameAndId(jobState, project);

      await jobState.addRelationship(
        createMappedRelationship({
          _class: RelationshipClass.HAS,
          _type: ORGANIZATION_HAS_PROJECT_RELATIONSHIP_TYPE,
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
    });
  }

  // Folder -> HAS (mappedRelationship) -> Projects
  await jobState.iterateEntities(
    {
      _type: FOLDER_ENTITY_TYPE,
    },
    async (folderEntity) => {
      await client.iterateProjects(async (project) => {
        const projectEntity = createProjectEntity(client.projectId, project);
        await cacheProjectNameAndId(jobState, project);

        await jobState.addRelationship(
          createMappedRelationship({
            _class: RelationshipClass.HAS,
            _type: FOLDER_HAS_PROJECT_RELATIONSHIP_TYPE,
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

  await jobState.setData(PROJECT_ENTITY_TYPE, projectEntity);
  await jobState.addEntity(projectEntity);
}

export async function fetchIamPolicyAuditConfig(
  context: IntegrationStepContext,
): Promise<void> {
  const {
    instance: { config },
    jobState,
  } = context;
  const client = new ResourceManagerClient({ config });

  await client.iteratePolicyAuditConfigs(async (auditConfig) => {
    const auditConfigEntity = createAuditConfigEntity(auditConfig);
    await jobState.addEntity(auditConfigEntity);

    if (auditConfig.service === 'allServices') {
      await jobState.iterateEntities(
        {
          _type: API_SERVICE_ENTITY_TYPE,
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
  });
}

export const resourceManagerSteps: IntegrationStep<IntegrationConfig>[] = [
  {
    id: STEP_RESOURCE_MANAGER_ORGANIZATION,
    name: 'Resource Manager Organization',
    entities: [
      {
        resourceName: 'Organization',
        _type: ORGANIZATION_ENTITY_TYPE,
        _class: ORGANIZATION_ENTITY_CLASS,
      },
    ],
    relationships: [],
    dependsOn: [],
    executionHandler: fetchResourceManagerOrganization,
  },
  {
    id: STEP_RESOURCE_MANAGER_FOLDERS,
    name: 'Resource Manager Folders',
    entities: [
      {
        resourceName: 'Folder',
        _type: FOLDER_ENTITY_TYPE,
        _class: FOLDER_ENTITY_CLASS,
      },
    ],
    relationships: [
      {
        _class: RelationshipClass.HAS,
        _type: ORGANIZATION_HAS_FOLDER_RELATIONSHIP_TYPE,
        sourceType: ORGANIZATION_ENTITY_TYPE,
        targetType: FOLDER_ENTITY_TYPE,
      },
      {
        _class: RelationshipClass.HAS,
        _type: FOLDER_HAS_FOLDER_RELATIONSHIP_TYPE,
        sourceType: FOLDER_ENTITY_TYPE,
        targetType: FOLDER_ENTITY_TYPE,
      },
    ],
    dependsOn: [STEP_RESOURCE_MANAGER_ORGANIZATION],
    executionHandler: fetchResourceManagerFolders,
  },
  {
    id: STEP_RESOURCE_MANAGER_ORG_PROJECT_RELATIONSHIPS,
    name: 'Resource Manager Projects',
    entities: [],
    relationships: [
      {
        _class: RelationshipClass.HAS,
        _type: ORGANIZATION_HAS_PROJECT_RELATIONSHIP_TYPE,
        sourceType: ORGANIZATION_ENTITY_TYPE,
        targetType: PROJECT_ENTITY_TYPE,
      },
      {
        _class: RelationshipClass.HAS,
        _type: FOLDER_HAS_PROJECT_RELATIONSHIP_TYPE,
        sourceType: FOLDER_ENTITY_TYPE,
        targetType: PROJECT_ENTITY_TYPE,
      },
    ],
    dependsOn: [
      STEP_RESOURCE_MANAGER_ORGANIZATION,
      STEP_RESOURCE_MANAGER_FOLDERS,
    ],
    executionHandler: buildOrgFolderProjectMappedRelationships,
  },
  {
    id: STEP_RESOURCE_MANAGER_PROJECT,
    name: 'Resource Manager Project',
    entities: [
      {
        resourceName: 'Project',
        _type: 'google_cloud_project',
        _class: 'Account',
      },
    ],
    relationships: [],
    dependsOn: [],
    executionHandler: fetchResourceManagerProject,
  },
  {
    id: STEP_AUDIT_CONFIG_IAM_POLICY,
    name: 'Audit Config IAM Policy',
    entities: [
      {
        resourceName: 'Audit Config',
        _type: AUDIT_CONFIG_ENTITY_TYPE,
        _class: AUDIT_CONFIG_ENTITY_CLASS,
      },
    ],
    relationships: [
      {
        _class: RelationshipClass.USES,
        _type: SERVICE_USES_AUDIT_CONFIG_RELATIONSHIP_TYPE,
        sourceType: API_SERVICE_ENTITY_TYPE,
        targetType: AUDIT_CONFIG_ENTITY_TYPE,
      },
    ],
    executionHandler: fetchIamPolicyAuditConfig,
    dependsOn: [STEP_API_SERVICES],
  },
];
