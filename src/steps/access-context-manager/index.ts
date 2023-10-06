import {
  createDirectRelationship,
  createMappedRelationship,
  Entity,
  JobState,
  RelationshipClass,
  RelationshipDirection,
} from '@jupiterone/integration-sdk-core';
import {
  GoogleCloudIntegrationStep,
  IntegrationStepContext,
} from '../../types';
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
  RELATIONSHIP_TYPE_SERVICE_PERIMETER_LIMITS_API_SERVICES,
  ENTITY_TYPE_ACCESS_CONTEXT_MANAGER_SERVICE_PERIMETER_EGRESS_POLICY,
  ENTITY_CLASS_ACCESS_CONTEXT_MANAGER_SERVICE_PERIMETER_EGRESS_POLICY,
  ENTITY_TYPE_ACCESS_CONTEXT_MANAGER_SERVICE_PERIMETER_API_OPERATION,
  ENTITY_CLASS_ACCESS_CONTEXT_MANAGER_SERVICE_PERIMETER_API_OPERATION,
  ENTITY_TYPE_ACCESS_CONTEXT_MANAGER_SERVICE_PERIMETER_METHOD_SELECTOR,
  ENTITY_CLASS_ACCESS_CONTEXT_MANAGER_SERVICE_PERIMETER_METHOD_SELECTOR,
  RELATIONSHIP_TYPE_SERVICE_PERIMETER_HAS_EGRESS_POLICY,
  RELATIONSHIP_TYPE_EGRESS_POLICY_HAS_API_OPERATION,
  RELATIONSHIP_TYPE_API_OPERATION_HAS_METHOD_SELECTOR,
  ENTITY_TYPE_ACCESS_CONTEXT_MANAGER_SERVICE_PERIMETER_INGRESS_POLICY,
  RELATIONSHIP_TYPE_SERVICE_PERIMETER_HAS_INGRESS_POLICY,
  RELATIONSHIP_TYPE_INGRESS_POLICY_HAS_API_OPERATION,
  ENTITY_CLASS_ACCESS_CONTEXT_MANAGER_SERVICE_PERIMETER_INGRESS_POLICY,
} from './constants';
import {
  PROJECT_ENTITY_TYPE,
  STEP_RESOURCE_MANAGER_ORG_PROJECT_RELATIONSHIPS,
} from '../resource-manager/constants';
import {
  createAccessLevelEntity,
  createAccessPolicyEntity,
  createServicePerimeterEntity,
  createServicePerimeterEgressPolicyEntity,
  createServicePerimeterApiOperationEntity,
  createServicePerimeterMethodSelectorEntity,
  createServicePerimeterIngressPolicyEntity,
} from './converters';
import { getProjectIdFromName } from '../../utils/jobState';
import { ServiceUsageEntities } from '../service-usage/constants';
import { accesscontextmanager_v1 } from 'googleapis';

export async function fetchAccessPolicies(
  context: IntegrationStepContext,
): Promise<void> {
  const {
    jobState,
    instance: { config },
    logger,
  } = context;
  const client = new AccessContextManagerClient({ config }, logger);
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
    logger,
  } = context;
  const client = new AccessContextManagerClient({ config }, logger);

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

async function processEgressPolicies({
  jobState,
  servicePerimeter,
  servicePerimeterEntity,
}: {
  jobState: JobState;
  servicePerimeter: accesscontextmanager_v1.Schema$ServicePerimeter;
  servicePerimeterEntity: Entity;
}) {
  let egressPolicies: accesscontextmanager_v1.Schema$EgressPolicy[] = [];
  if (servicePerimeter.spec?.egressPolicies) {
    egressPolicies = [...servicePerimeter.spec.egressPolicies];
  } else if (servicePerimeter.status?.egressPolicies) {
    egressPolicies = [...servicePerimeter.status.egressPolicies];
  }

  for (const [egressIndex, egressPolicy] of egressPolicies.entries()) {
    const egressPolicyEntity = createServicePerimeterEgressPolicyEntity({
      servicePerimeter,
      egressPolicy,
      egressIndex,
    });

    await jobState.addEntity(egressPolicyEntity);
    await jobState.addRelationship(
      createDirectRelationship({
        _class: RelationshipClass.HAS,
        from: servicePerimeterEntity,
        to: egressPolicyEntity,
      }),
    );

    for (const [operationIndex, operation] of (
      egressPolicy.egressTo?.operations || []
    ).entries()) {
      const apiOperationEntity = createServicePerimeterApiOperationEntity({
        servicePerimeter,
        operation,
        policyIndex: egressIndex,
        operationIndex,
        type: 'egress',
      });
      await jobState.addEntity(apiOperationEntity);
      await jobState.addRelationship(
        createDirectRelationship({
          _class: RelationshipClass.HAS,
          from: egressPolicyEntity,
          to: apiOperationEntity,
        }),
      );

      for (const [methodIndex, methodSelector] of (
        operation.methodSelectors || []
      ).entries()) {
        const methodSelectorEntity = createServicePerimeterMethodSelectorEntity(
          {
            servicePerimeter,
            methodSelector,
            policyIndex: egressIndex,
            operationIndex,
            methodIndex,
            type: 'egress',
          },
        );
        await jobState.addEntity(methodSelectorEntity);
        await jobState.addRelationship(
          createDirectRelationship({
            _class: RelationshipClass.HAS,
            from: apiOperationEntity,
            to: methodSelectorEntity,
          }),
        );
      }
    }
  }
}

async function processIngressPolicies({
  jobState,
  servicePerimeter,
  servicePerimeterEntity,
}: {
  jobState: JobState;
  servicePerimeter: accesscontextmanager_v1.Schema$ServicePerimeter;
  servicePerimeterEntity: Entity;
}) {
  let ingressPolicies: accesscontextmanager_v1.Schema$IngressPolicy[] = [];
  if (servicePerimeter.spec?.ingressPolicies) {
    ingressPolicies = [...servicePerimeter.spec.ingressPolicies];
  } else if (servicePerimeter.status?.ingressPolicies) {
    ingressPolicies = [...servicePerimeter.status.ingressPolicies];
  }

  for (const [ingressIndex, ingressPolicy] of ingressPolicies.entries()) {
    const ingressPolicyEntity = createServicePerimeterIngressPolicyEntity({
      servicePerimeter,
      ingressPolicy,
      ingressIndex,
    });

    await jobState.addEntity(ingressPolicyEntity);
    await jobState.addRelationship(
      createDirectRelationship({
        _class: RelationshipClass.HAS,
        from: servicePerimeterEntity,
        to: ingressPolicyEntity,
      }),
    );

    for (const [operationIndex, operation] of (
      ingressPolicy.ingressTo?.operations || []
    ).entries()) {
      const apiOperationEntity = createServicePerimeterApiOperationEntity({
        servicePerimeter,
        operation,
        policyIndex: ingressIndex,
        operationIndex,
        type: 'ingress',
      });
      await jobState.addEntity(apiOperationEntity);
      await jobState.addRelationship(
        createDirectRelationship({
          _class: RelationshipClass.HAS,
          from: ingressPolicyEntity,
          to: apiOperationEntity,
        }),
      );

      for (const [methodIndex, methodSelector] of (
        operation.methodSelectors || []
      ).entries()) {
        const methodSelectorEntity = createServicePerimeterMethodSelectorEntity(
          {
            servicePerimeter,
            methodSelector,
            policyIndex: ingressIndex,
            operationIndex,
            methodIndex,
            type: 'ingress',
          },
        );
        await jobState.addEntity(methodSelectorEntity);
        await jobState.addRelationship(
          createDirectRelationship({
            _class: RelationshipClass.HAS,
            from: apiOperationEntity,
            to: methodSelectorEntity,
          }),
        );
      }
    }
  }
}

async function buildServicePerimeterProtectsProjects({
  jobState,
  servicePerimeter,
  servicePerimeterEntityKey,
}: {
  jobState: JobState;
  servicePerimeter: accesscontextmanager_v1.Schema$ServicePerimeter;
  servicePerimeterEntityKey: string;
}) {
  for (const resource of servicePerimeter.status?.resources ||
    servicePerimeter.spec?.resources ||
    []) {
    // TODO: Check if this is a project resource. More may be added in the future
    await jobState.addRelationship(
      createMappedRelationship({
        _class: RelationshipClass.PROTECTS,
        _type: RELATIONSHIP_TYPE_SERVICE_PERIMETER_PROTECTS_PROJECT,
        _mapping: {
          relationshipDirection: RelationshipDirection.FORWARD,
          sourceEntityKey: servicePerimeterEntityKey,
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
}

async function buildServicePerimeterLimitsServices({
  jobState,
  servicePerimeter,
  servicePerimeterEntityKey,
}: {
  jobState: JobState;
  servicePerimeter: accesscontextmanager_v1.Schema$ServicePerimeter;
  servicePerimeterEntityKey: string;
}) {
  for (const resource of servicePerimeter.status?.resources ||
    servicePerimeter.spec?.resources ||
    []) {
    for (const service of servicePerimeter.status?.restrictedServices ||
      servicePerimeter.spec?.restrictedServices ||
      []) {
      const projectId = await getProjectIdFromName(jobState, resource);

      if (projectId) {
        await jobState.addRelationship(
          createMappedRelationship({
            _class: RelationshipClass.LIMITS,
            _type: RELATIONSHIP_TYPE_SERVICE_PERIMETER_LIMITS_API_SERVICES,
            _mapping: {
              relationshipDirection: RelationshipDirection.FORWARD,
              sourceEntityKey: servicePerimeterEntityKey,
              targetFilterKeys: [['_type', '_key']],
              skipTargetCreation: true,
              targetEntity: {
                _type: ServiceUsageEntities.API_SERVICE._type,
                _key: `projects/${projectId}/services/${service}`,
              },
            },
          }),
        );
      }
    }
  }
}

export async function fetchServicePerimeters(
  context: IntegrationStepContext,
): Promise<void> {
  const {
    jobState,
    instance: { config },
    logger,
  } = context;
  const client = new AccessContextManagerClient({ config }, logger);

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

          await processEgressPolicies({
            jobState,
            servicePerimeter,
            servicePerimeterEntity,
          });

          await processIngressPolicies({
            jobState,
            servicePerimeter,
            servicePerimeterEntity,
          });

          await buildServicePerimeterProtectsProjects({
            jobState,
            servicePerimeter,
            servicePerimeterEntityKey: servicePerimeterEntity._key,
          });

          await buildServicePerimeterLimitsServices({
            jobState,
            servicePerimeter,
            servicePerimeterEntityKey: servicePerimeterEntity._key,
          });
        },
      );
    },
  );
}

export const accessPoliciesSteps: GoogleCloudIntegrationStep[] = [
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
    permissions: ['accesscontextmanager.accessPolicies.list'],
    apis: ['accesscontextmanager.googleapis.com'],
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
    permissions: ['accesscontextmanager.accessLevels.list'],
    apis: ['accesscontextmanager.googleapis.com'],
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
      {
        resourceName: 'Access Context Manager Service Perimeter Egress Policy',
        _type:
          ENTITY_TYPE_ACCESS_CONTEXT_MANAGER_SERVICE_PERIMETER_EGRESS_POLICY,
        _class:
          ENTITY_CLASS_ACCESS_CONTEXT_MANAGER_SERVICE_PERIMETER_EGRESS_POLICY,
      },
      {
        resourceName: 'Access Context Manager Service Perimeter Ingress Policy',
        _type:
          ENTITY_TYPE_ACCESS_CONTEXT_MANAGER_SERVICE_PERIMETER_INGRESS_POLICY,
        _class:
          ENTITY_CLASS_ACCESS_CONTEXT_MANAGER_SERVICE_PERIMETER_INGRESS_POLICY,
      },
      {
        resourceName: 'Access Context Manager Service Perimeter Api Operation',
        _type:
          ENTITY_TYPE_ACCESS_CONTEXT_MANAGER_SERVICE_PERIMETER_API_OPERATION,
        _class:
          ENTITY_CLASS_ACCESS_CONTEXT_MANAGER_SERVICE_PERIMETER_API_OPERATION,
      },
      {
        resourceName:
          'Access Context Manager Service Perimeter Method Selector',
        _type:
          ENTITY_TYPE_ACCESS_CONTEXT_MANAGER_SERVICE_PERIMETER_METHOD_SELECTOR,
        _class:
          ENTITY_CLASS_ACCESS_CONTEXT_MANAGER_SERVICE_PERIMETER_METHOD_SELECTOR,
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
      {
        _class: RelationshipClass.LIMITS,
        _type: RELATIONSHIP_TYPE_SERVICE_PERIMETER_LIMITS_API_SERVICES,
        sourceType: ENTITY_TYPE_ACCESS_CONTEXT_MANAGER_SERVICE_PERIMETER,
        targetType: ServiceUsageEntities.API_SERVICE._type,
      },
      {
        _class: RelationshipClass.HAS,
        _type: RELATIONSHIP_TYPE_SERVICE_PERIMETER_HAS_EGRESS_POLICY,
        sourceType: ENTITY_TYPE_ACCESS_CONTEXT_MANAGER_SERVICE_PERIMETER,
        targetType:
          ENTITY_TYPE_ACCESS_CONTEXT_MANAGER_SERVICE_PERIMETER_EGRESS_POLICY,
      },
      {
        _class: RelationshipClass.HAS,
        _type: RELATIONSHIP_TYPE_EGRESS_POLICY_HAS_API_OPERATION,
        sourceType:
          ENTITY_TYPE_ACCESS_CONTEXT_MANAGER_SERVICE_PERIMETER_EGRESS_POLICY,
        targetType:
          ENTITY_TYPE_ACCESS_CONTEXT_MANAGER_SERVICE_PERIMETER_API_OPERATION,
      },
      {
        _class: RelationshipClass.HAS,
        _type: RELATIONSHIP_TYPE_API_OPERATION_HAS_METHOD_SELECTOR,
        sourceType:
          ENTITY_TYPE_ACCESS_CONTEXT_MANAGER_SERVICE_PERIMETER_API_OPERATION,
        targetType:
          ENTITY_TYPE_ACCESS_CONTEXT_MANAGER_SERVICE_PERIMETER_METHOD_SELECTOR,
      },
      {
        _class: RelationshipClass.HAS,
        _type: RELATIONSHIP_TYPE_SERVICE_PERIMETER_HAS_INGRESS_POLICY,
        sourceType: ENTITY_TYPE_ACCESS_CONTEXT_MANAGER_SERVICE_PERIMETER,
        targetType:
          ENTITY_TYPE_ACCESS_CONTEXT_MANAGER_SERVICE_PERIMETER_INGRESS_POLICY,
      },
      {
        _class: RelationshipClass.HAS,
        _type: RELATIONSHIP_TYPE_INGRESS_POLICY_HAS_API_OPERATION,
        sourceType:
          ENTITY_TYPE_ACCESS_CONTEXT_MANAGER_SERVICE_PERIMETER_INGRESS_POLICY,
        targetType:
          ENTITY_TYPE_ACCESS_CONTEXT_MANAGER_SERVICE_PERIMETER_API_OPERATION,
      },
    ],
    dependsOn: [
      STEP_RESOURCE_MANAGER_ORG_PROJECT_RELATIONSHIPS,
      STEP_ACCESS_CONTEXT_MANAGER_ACCESS_POLICIES,
    ],
    executionHandler: fetchServicePerimeters,
    permissions: ['accesscontextmanager.servicePerimeters.list'],
    apis: ['accesscontextmanager.googleapis.com'],
  },
];
