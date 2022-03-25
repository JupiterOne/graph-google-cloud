import { cloudresourcemanager_v3 } from 'googleapis';
import { parseTimePropertyValue } from '@jupiterone/integration-sdk-core';
import { ResourceManagerEntities } from './constants';
import { createGoogleCloudIntegrationEntity } from '../../utils/entity';
import { getGoogleCloudConsoleWebLink } from '../../utils/url';

export function createAuditConfigEntity(
  data: cloudresourcemanager_v3.Schema$AuditConfig,
) {
  return createGoogleCloudIntegrationEntity(data, {
    entityData: {
      source: data,
      assign: {
        _key: `auditConfig:${data.service}`,
        _type: ResourceManagerEntities.AUDIT_CONFIG._type,
        _class: ResourceManagerEntities.AUDIT_CONFIG._class,
        name: `auditConfig:${data.service}`,
        displayName: `auditConfig:${data.service}`,
        service: data.service,
        logTypes: data.auditLogConfigs?.map(
          (logConfig) => logConfig.logType as string,
        ),
      },
    },
  });
}

export function createOrganizationEntity(
  data: cloudresourcemanager_v3.Schema$Organization,
) {
  return createGoogleCloudIntegrationEntity(data, {
    entityData: {
      source: data,
      assign: {
        _key: data.name as string,
        _type: ResourceManagerEntities.ORGANIZATION._type,
        _class: ResourceManagerEntities.ORGANIZATION._class,
        name: data.name,
        displayName: data.displayName as string,
        directoryCustomerId: data.directoryCustomerId,
        etag: data.etag,
        lifecycleState: data.state,
        createdOn: parseTimePropertyValue(data.createTime),
        updatedOn: parseTimePropertyValue(data.updateTime),
      },
    },
  });
}

export function createFolderEntity(
  data: cloudresourcemanager_v3.Schema$Folder,
) {
  return createGoogleCloudIntegrationEntity(data, {
    entityData: {
      source: data,
      assign: {
        _key: data.name as string,
        _type: ResourceManagerEntities.FOLDER._type,
        _class: ResourceManagerEntities.FOLDER._class,
        name: data.name,
        parent: data.parent,
        displayName: data.displayName as string,
        etag: data.etag,
        lifecycleState: data.state,
        createdOn: parseTimePropertyValue(data.createTime),
        updatedOn: parseTimePropertyValue(data.updateTime),
      },
    },
  });
}

export function createProjectEntity(
  projectId: string,
  project: cloudresourcemanager_v3.Schema$Project | undefined = {},
) {
  const primaryProjectId = project.projectId || projectId;

  return createGoogleCloudIntegrationEntity(project, {
    entityData: {
      source: project,
      assign: {
        _key: project.name || primaryProjectId,
        _type: ResourceManagerEntities.PROJECT._type,
        _class: ResourceManagerEntities.PROJECT._class,
        id: primaryProjectId,
        projectId: primaryProjectId,
        name: project.name || primaryProjectId,
        displayName: project.displayName as string,
        parent: project.parent,
        lifecycleState: project.state,
        createdOn: parseTimePropertyValue(project.createTime),
        updatedOn: parseTimePropertyValue(project.updateTime),
        webLink: getGoogleCloudConsoleWebLink(
          `/home/dashboard?project=${primaryProjectId}`,
        ),
      },
    },
  });
}
