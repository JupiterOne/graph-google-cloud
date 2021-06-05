import {
  createDirectRelationship,
  createMappedRelationship,
  IntegrationStep,
  RelationshipClass,
  RelationshipDirection,
} from '@jupiterone/integration-sdk-core';
import { IntegrationConfig, IntegrationStepContext } from '../../types';
import { AccessContextManagerClient } from './client';

import {
  STEP_ACCESS_CONTEXT_MANAGER_ACCESS_POLICIES,
  ENTITY_TYPE_ACCESS_CONTEXT_MANAGER_ACCESS_POLICY,
  ENTITY_CLASS_ACCESS_CONTEXT_MANAGER_ACCESS_POLICY,
  STEP_ACCESS_CONTEXT_MANAGER_ACCESS_LEVELS,
  STEP_ACCESS_CONTEXT_MANAGER_SERVICE_PERIMETERS,
  ENTITY_TYPE_ACCESS_CONTEXT_MANAGER_ACCESS_LEVEL,
  ENTITY_CLASS_ACCESS_CONTEXT_MANAGER_ACCESS_LEVEL,
  ENTITY_TYPE_ACCESS_CONTEXT_MANAGER_SERVICE_PERIMETER,
  ENTITY_CLASS_ACCESS_CONTEXT_MANAGER_SERVICE_PERIMETER,
  RELATIONSHIP_TYPE_ACCESS_POLICY_HAS_ACCESS_LEVEL,
  RELATIONSHIP_TYPE_ACCESS_POLICY_HAS_SERVICE_PERIMETER,
  RELATIONSHIP_TYPE_SERVICE_PERIMETER_PROTECTS_PROJECT,
} from './constants';
import { PROJECT_ENTITY_TYPE } from '../resource-manager/constants';
import {
  createAccessLevelEntity,
  createAccessPolicyEntity,
  createServicePerimeterEntity,
} from './converters';

export async function fetchAccessPolicies(
  context: IntegrationStepContext,
): Promise<void> {
  const {
    jobState,
    instance: { config },
  } = context;
  const client = new AccessContextManagerClient({ config });
  await client.iterateAccessPolicies(async (accessPolicy) => {
    await jobState.addEntity(createAccessPolicyEntity(accessPolicy));
  });
}

export async function fetchAccessLevels(
  context: IntegrationStepContext,
): Promise<void> {
  const {
    jobState,
    instance: { config },
  } = context;
  const client = new AccessContextManagerClient({ config });

  await jobState.iterateEntities(
    {
      _type: ENTITY_TYPE_ACCESS_CONTEXT_MANAGER_ACCESS_POLICY,
    },
    async (accessPolicyEntity) => {
      await client.iterateAccessLevels(
        accessPolicyEntity.name as string,
        async (accessLevel) => {
          const accessLevelEntity = createAccessLevelEntity(accessLevel);
          await jobState.addEntity(accessLevelEntity);

          await jobState.addRelationship(
            createDirectRelationship({
              _class: RelationshipClass.HAS,
              from: accessPolicyEntity,
              to: accessLevelEntity,
            }),
          );
        },
      );
    },
  );
}

export async function fetchServicePerimeters(
  context: IntegrationStepContext,
): Promise<void> {
  const {
    jobState,
    instance: { config },
  } = context;
  const client = new AccessContextManagerClient({ config });

  await jobState.iterateEntities(
    {
      _type: ENTITY_TYPE_ACCESS_CONTEXT_MANAGER_ACCESS_POLICY,
    },
    async (accessPolicyEntity) => {
      await client.iterateServicePerimeters(
        accessPolicyEntity.name as string,
        async (servicePerimeter) => {
          const servicePerimeterEntity =
            createServicePerimeterEntity(servicePerimeter);
          await jobState.addEntity(servicePerimeterEntity);

          await jobState.addRelationship(
            createDirectRelationship({
              _class: RelationshipClass.HAS,
              from: accessPolicyEntity,
              to: servicePerimeterEntity,
            }),
          );

          // Service Perimeter -> Protects (mapped) -> Project
          for (const resource of servicePerimeter.status?.resources ||
            servicePerimeter.spec?.resources ||
            []) {
            await jobState.addRelationship(
              createMappedRelationship({
                _class: RelationshipClass.PROTECTS,
                _type: RELATIONSHIP_TYPE_SERVICE_PERIMETER_PROTECTS_PROJECT,
                _mapping: {
                  relationshipDirection: RelationshipDirection.FORWARD,
                  sourceEntityKey: servicePerimeterEntity._key,
                  targetFilterKeys: [['_type', '_key']],
                  skipTargetCreation: true,
                  targetEntity: {
                    _type: PROJECT_ENTITY_TYPE,
                    _key: resource,
                  },
                },
              }),
            );
          }

          // Service Perimeter -> 'RESTRICTS' (mapped) -> API Service
          // for (const service of servicePerimeter.status?.restrictedServices || servicePerimeter.spec?.restrictedServices || []) {
          // TODO: Some idea below:
          // "resources": [
          //   "projects/619127027446"
          // ],
          // "accessLevels": [
          //   "accessPolicies/368605946207/accessLevels/access_level_example"
          // ],
          // "restrictedServices": [
          //   "storage.googleapis.com"
          // ],

          // What we might want to do is, for each resource (e.g. project), we want to iterate over all of its restricted services
          // and then create a mappedRelationship between this service perimeter and
          // targetEntity: {
          //   _type: API_SERVICE_ENTITY_TYPE,
          //   _key: `projects/${projectId}/services/${restrictedService}`,
          // },
          // }
        },
      );
    },
  );
}

export const accessPoliciesSteps: IntegrationStep<IntegrationConfig>[] = [
  {
    id: STEP_ACCESS_CONTEXT_MANAGER_ACCESS_POLICIES,
    name: 'Access Context Manager Access Policies',
    entities: [
      {
        resourceName: 'Access Context Manager Access Policy',
        _type: ENTITY_TYPE_ACCESS_CONTEXT_MANAGER_ACCESS_POLICY,
        _class: ENTITY_CLASS_ACCESS_CONTEXT_MANAGER_ACCESS_POLICY,
      },
    ],
    relationships: [],
    dependsOn: [],
    executionHandler: fetchAccessPolicies,
  },
  {
    id: STEP_ACCESS_CONTEXT_MANAGER_ACCESS_LEVELS,
    name: 'Access Context Manager Access Levels',
    entities: [
      {
        resourceName: 'Access Context Manager Access Level',
        _type: ENTITY_TYPE_ACCESS_CONTEXT_MANAGER_ACCESS_LEVEL,
        _class: ENTITY_CLASS_ACCESS_CONTEXT_MANAGER_ACCESS_LEVEL,
      },
    ],
    relationships: [
      {
        _class: RelationshipClass.HAS,
        _type: RELATIONSHIP_TYPE_ACCESS_POLICY_HAS_ACCESS_LEVEL,
        sourceType: ENTITY_TYPE_ACCESS_CONTEXT_MANAGER_ACCESS_POLICY,
        targetType: ENTITY_TYPE_ACCESS_CONTEXT_MANAGER_ACCESS_LEVEL,
      },
    ],
    dependsOn: [STEP_ACCESS_CONTEXT_MANAGER_ACCESS_POLICIES],
    executionHandler: fetchAccessLevels,
  },
  {
    id: STEP_ACCESS_CONTEXT_MANAGER_SERVICE_PERIMETERS,
    name: 'Access Context Manager Service Perimeters',
    entities: [
      {
        resourceName: 'Access Context Manager Service Perimeter',
        _type: ENTITY_TYPE_ACCESS_CONTEXT_MANAGER_SERVICE_PERIMETER,
        _class: ENTITY_CLASS_ACCESS_CONTEXT_MANAGER_SERVICE_PERIMETER,
      },
    ],
    relationships: [
      {
        _class: RelationshipClass.HAS,
        _type: RELATIONSHIP_TYPE_ACCESS_POLICY_HAS_SERVICE_PERIMETER,
        sourceType: ENTITY_TYPE_ACCESS_CONTEXT_MANAGER_ACCESS_POLICY,
        targetType: ENTITY_TYPE_ACCESS_CONTEXT_MANAGER_SERVICE_PERIMETER,
      },
      {
        _class: RelationshipClass.PROTECTS,
        _type: RELATIONSHIP_TYPE_SERVICE_PERIMETER_PROTECTS_PROJECT,
        sourceType: ENTITY_TYPE_ACCESS_CONTEXT_MANAGER_SERVICE_PERIMETER,
        targetType: PROJECT_ENTITY_TYPE,
      },
    ],
    dependsOn: [STEP_ACCESS_CONTEXT_MANAGER_ACCESS_POLICIES],
    executionHandler: fetchServicePerimeters,
  },
];
