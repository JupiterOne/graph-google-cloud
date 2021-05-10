import {
  IntegrationStep,
  createDirectRelationship,
  RelationshipClass,
} from '@jupiterone/integration-sdk-core';
import { ServiceUsageClient } from './client';
import { IntegrationConfig, IntegrationStepContext } from '../../types';
import { createApiServiceEntity } from './converters';
import {
  API_SERVICE_ENTITY_TYPE,
  STEP_API_SERVICES,
  API_SERVICE_ENTITY_CLASS,
  PROJECT_API_SERVICE_RELATIONSHIP_TYPE,
} from './constants';
import { STEP_PROJECT, PROJECT_ENTITY_TYPE } from '../resource-manager';
import { getProjectEntity } from '../../utils/project';
import { STEP_IAM_MANAGED_ROLES } from '../iam';
import {
  buildPermissionsByApiServiceMap,
  getIamManagedRoleData,
  IAM_MANAGED_ROLES_DATA_JOB_STATE_KEY,
} from '../../utils/iam';
import { serviceusage_v1 } from 'googleapis';

export * from './constants';

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
  } = context;
  const client = new ServiceUsageClient({ config });
  const projectEntity = await getProjectEntity(jobState);

  const permissionsByApiServiceMap = buildPermissionsByApiServiceMap(
    await getIamManagedRoleData(jobState),
  );

  await client.iterateServices(async (service) => {
    const permissions = getPermissionsForApiService(
      service,
      permissionsByApiServiceMap,
    );

    const serviceEntity = await jobState.addEntity(
      createApiServiceEntity({
        data: service,
        permissions,
      }),
    );

    await jobState.addRelationship(
      createDirectRelationship({
        _class: RelationshipClass.HAS,
        from: projectEntity,
        to: serviceEntity,
        properties: {
          _type: PROJECT_API_SERVICE_RELATIONSHIP_TYPE,
        },
      }),
    );
  });

  // We don't need to hold all of this data in memory for the entire integration
  // execution. If we decide that we need to share this across more steps in the
  // future, we can consider holding the data for longer or until the integration
  // finishes .
  await jobState.setData(IAM_MANAGED_ROLES_DATA_JOB_STATE_KEY, undefined);
}

export const serviceUsageSteps: IntegrationStep<IntegrationConfig>[] = [
  {
    id: STEP_API_SERVICES,
    name: 'API Services',
    entities: [
      {
        resourceName: 'Cloud API Service',
        _type: API_SERVICE_ENTITY_TYPE,
        _class: API_SERVICE_ENTITY_CLASS,
      },
    ],
    relationships: [
      {
        _type: PROJECT_API_SERVICE_RELATIONSHIP_TYPE,
        sourceType: PROJECT_ENTITY_TYPE,
        _class: RelationshipClass.HAS,
        targetType: API_SERVICE_ENTITY_TYPE,
      },
    ],
    dependsOn: [STEP_PROJECT, STEP_IAM_MANAGED_ROLES],
    executionHandler: fetchApiServices,
  },
];
