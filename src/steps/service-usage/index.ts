import {
  createDirectRelationship,
  RelationshipClass,
} from '@jupiterone/integration-sdk-core';
import { ServiceUsageClient } from './client';
import {
  GoogleCloudIntegrationStep,
  IntegrationStepContext,
} from '../../types';
import { createApiServiceEntity } from './converters';
import {
  ServiceUsageStepIds,
  ServiceUsageEntities,
  ServiceUsageRelationships,
} from './constants';
import { STEP_RESOURCE_MANAGER_PROJECT } from '../resource-manager';
import { getProjectEntity } from '../../utils/project';
import { STEP_IAM_MANAGED_ROLES } from '../iam/constants';
import {
  buildPermissionsByApiServiceMap,
  getIamManagedRoleData,
} from '../../utils/iam';
import { serviceusage_v1 } from 'googleapis';
import { IamClient } from '../iam/client';
import { ServiceUsageListFilter } from '../../google-cloud/types';

function getPermissionsForApiService(
  apiService: serviceusage_v1.Schema$GoogleApiServiceusageV1Service,
  permissionsByApiServiceMap: Map<string, string[]>,
): string[] | undefined {
  const apiServiceName = apiService.config?.name;

  if (!apiServiceName) {
    // This should never happen.
    return;
  }

  // youtube.googleapis.com -> youtube
  const serviceShortName = apiServiceName.split('.')[0];
  return permissionsByApiServiceMap.get(serviceShortName);
}

export async function fetchApiServices(
  context: IntegrationStepContext,
): Promise<void> {
  const {
    jobState,
    instance: { config },
    logger,
  } = context;
  const client = new ServiceUsageClient({ config }, logger);
  const iamClient = new IamClient({ config }, logger);
  const projectEntity = await getProjectEntity(jobState);

  const permissionsByApiServiceMap = buildPermissionsByApiServiceMap(
    await getIamManagedRoleData(jobState),
  );

  const auditableServices = await iamClient.collectAuditableServices();

  await client.iterateServices(
    async (service) => {
      const permissions = getPermissionsForApiService(
        service,
        permissionsByApiServiceMap,
      );

      const serviceEntity = await jobState.addEntity(
        createApiServiceEntity({
          projectId: client.projectId,
          data: service,
          permissions,
          auditable: auditableServices.includes(service.config?.name as string),
        }),
      );

      await jobState.addRelationship(
        createDirectRelationship({
          _class: RelationshipClass.HAS,
          from: projectEntity,
          to: serviceEntity,
          properties: {
            _type: ServiceUsageRelationships.PROJECT_HAS_API_SERVICE._type,
          },
        }),
      );
    },
    {
      filter: ServiceUsageListFilter.ENABLED,
    },
    ({
      totalRequestsMade,
      totalResourcesReturned,
      maximumResourcesPerPage,
    }) => {
      logger.info(
        {
          totalRequestsMade,
          totalResourcesReturned,
          maximumResourcesPerPage,
        },
        'API Services API Requests summary',
      );
    },
  );
}

export const serviceUsageSteps: GoogleCloudIntegrationStep[] = [
  {
    id: ServiceUsageStepIds.FETCH_API_SERVICES,
    name: 'API Services',
    entities: [ServiceUsageEntities.API_SERVICE],
    relationships: [ServiceUsageRelationships.PROJECT_HAS_API_SERVICE],
    dependsOn: [STEP_RESOURCE_MANAGER_PROJECT, STEP_IAM_MANAGED_ROLES],
    executionHandler: fetchApiServices,
    permissions: ['serviceusage.services.list'],
    apis: ['serviceusage.googleapis.com'],
  },
];
