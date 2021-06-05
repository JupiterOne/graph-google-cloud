import { accesscontextmanager_v1 } from 'googleapis';
import { createGoogleCloudIntegrationEntity } from '../../utils/entity';
import {
  ENTITY_CLASS_ACCESS_CONTEXT_MANAGER_ACCESS_LEVEL,
  ENTITY_CLASS_ACCESS_CONTEXT_MANAGER_ACCESS_POLICY,
  ENTITY_CLASS_ACCESS_CONTEXT_MANAGER_SERVICE_PERIMETER,
  ENTITY_TYPE_ACCESS_CONTEXT_MANAGER_ACCESS_LEVEL,
  ENTITY_TYPE_ACCESS_CONTEXT_MANAGER_ACCESS_POLICY,
  ENTITY_TYPE_ACCESS_CONTEXT_MANAGER_SERVICE_PERIMETER,
  ENTITY_TYPE_ACCESS_CONTEXT_MANAGER_SERVICE_PERIMETER_EGRESS_POLICY,
  ENTITY_CLASS_ACCESS_CONTEXT_MANAGER_SERVICE_PERIMETER_EGRESS_POLICY,
  ENTITY_CLASS_ACCESS_CONTEXT_MANAGER_SERVICE_PERIMETER_API_OPERATION,
  ENTITY_TYPE_ACCESS_CONTEXT_MANAGER_SERVICE_PERIMETER_API_OPERATION,
  ENTITY_TYPE_ACCESS_CONTEXT_MANAGER_SERVICE_PERIMETER_METHOD_SELECTOR,
  ENTITY_CLASS_ACCESS_CONTEXT_MANAGER_SERVICE_PERIMETER_METHOD_SELECTOR,
  ENTITY_TYPE_ACCESS_CONTEXT_MANAGER_SERVICE_PERIMETER_INGRESS_POLICY,
  ENTITY_CLASS_ACCESS_CONTEXT_MANAGER_SERVICE_PERIMETER_INGRESS_POLICY,
} from './constants';

export function createAccessPolicyEntity(
  data: accesscontextmanager_v1.Schema$AccessPolicy,
) {
  return createGoogleCloudIntegrationEntity(data, {
    entityData: {
      source: data,
      assign: {
        _key: data.name as string,
        _type: ENTITY_TYPE_ACCESS_CONTEXT_MANAGER_ACCESS_POLICY,
        _class: ENTITY_CLASS_ACCESS_CONTEXT_MANAGER_ACCESS_POLICY,
        name: data.name,
        title: data.title,
        etag: data.etag,
      },
    },
  });
}

export function createAccessLevelEntity(
  data: accesscontextmanager_v1.Schema$AccessLevel,
) {
  return createGoogleCloudIntegrationEntity(data, {
    entityData: {
      source: data,
      assign: {
        _key: data.name as string,
        _type: ENTITY_TYPE_ACCESS_CONTEXT_MANAGER_ACCESS_LEVEL,
        _class: ENTITY_CLASS_ACCESS_CONTEXT_MANAGER_ACCESS_LEVEL,
        name: data.name,
        description: data.description,
        title: data.title,
      },
    },
  });
}

export function createServicePerimeterEntity(
  data: accesscontextmanager_v1.Schema$ServicePerimeter,
) {
  // We don't want to include egress/ingress policies here as we're turning them
  // into separate entities
  const withoutPolicies = {
    ...data,
    spec: data.spec
      ? {
          ...data.spec,
          egressPolicies: undefined,
          ingressPolicies: undefined,
        }
      : undefined,
    status: data.status
      ? {
          ...data.status,
          egressPolicies: undefined,
          ingressPolicies: undefined,
        }
      : undefined,
  };

  return createGoogleCloudIntegrationEntity(withoutPolicies, {
    entityData: {
      source: withoutPolicies,
      assign: {
        _key: withoutPolicies.name as string,
        _type: ENTITY_TYPE_ACCESS_CONTEXT_MANAGER_SERVICE_PERIMETER,
        _class: ENTITY_CLASS_ACCESS_CONTEXT_MANAGER_SERVICE_PERIMETER,
        name: withoutPolicies.name,
        description: withoutPolicies.description,
        perimeterType: withoutPolicies.perimeterType,
        title: withoutPolicies.title,
        useExplicitDryRunSpec: withoutPolicies.useExplicitDryRunSpec,
        // shared fields between .spec/.status depending on the run mode
        'status.accessLevels': withoutPolicies.status?.accessLevels,
        'status.resources': withoutPolicies.status?.resources,
        'status.restrictedServices': withoutPolicies.status?.restrictedServices,
        'spec.accessLevels': withoutPolicies.spec?.accessLevels,
        'spec.resources': withoutPolicies.spec?.resources,
        'spec.restrictedServices': withoutPolicies.spec?.restrictedServices,
      },
    },
  });
}

export function createServicePerimeterEgressPolicyEntity({
  servicePerimeter,
  egressPolicy,
  egressIndex,
}: {
  servicePerimeter: accesscontextmanager_v1.Schema$ServicePerimeter;
  egressPolicy: accesscontextmanager_v1.Schema$EgressPolicy;
  egressIndex: number;
}) {
  return createGoogleCloudIntegrationEntity(egressPolicy, {
    entityData: {
      source: egressPolicy,
      assign: {
        _key: `${servicePerimeter.name}:egressPolicies[${egressIndex}]`,
        _type:
          ENTITY_TYPE_ACCESS_CONTEXT_MANAGER_SERVICE_PERIMETER_EGRESS_POLICY,
        _class:
          ENTITY_CLASS_ACCESS_CONTEXT_MANAGER_SERVICE_PERIMETER_EGRESS_POLICY,
        name: `${servicePerimeter.name}:egressPolicies[${egressIndex}]`,
        displayName: `${servicePerimeter.name}:egressPolicies[${egressIndex}]`,
        fromIdentities: egressPolicy.egressFrom?.identities,
        fromIdentityType: egressPolicy.egressFrom?.identityType,
      },
    },
  });
}

export function createServicePerimeterIngressPolicyEntity({
  servicePerimeter,
  ingressPolicy,
  ingressIndex,
}: {
  servicePerimeter: accesscontextmanager_v1.Schema$ServicePerimeter;
  ingressPolicy: accesscontextmanager_v1.Schema$IngressPolicy;
  ingressIndex: number;
}) {
  return createGoogleCloudIntegrationEntity(ingressPolicy, {
    entityData: {
      source: ingressPolicy,
      assign: {
        _key: `${servicePerimeter.name}:ingressPolicies[${ingressIndex}]`,
        _type:
          ENTITY_TYPE_ACCESS_CONTEXT_MANAGER_SERVICE_PERIMETER_INGRESS_POLICY,
        _class:
          ENTITY_CLASS_ACCESS_CONTEXT_MANAGER_SERVICE_PERIMETER_INGRESS_POLICY,
        name: `${servicePerimeter.name}:ingressPolicies[${ingressIndex}]`,
        displayName: `${servicePerimeter.name}:ingressPolicies[${ingressIndex}]`,
        fromIdentities: ingressPolicy.ingressFrom?.identities,
        fromIdentityType: ingressPolicy.ingressFrom?.identityType,
      },
    },
  });
}

export function createServicePerimeterApiOperationEntity({
  servicePerimeter,
  operation,
  policyIndex,
  operationIndex,
  type,
}: {
  servicePerimeter: accesscontextmanager_v1.Schema$ServicePerimeter;
  operation: accesscontextmanager_v1.Schema$ApiOperation;
  policyIndex: number;
  operationIndex: number;
  type: 'egress' | 'ingress';
}) {
  const { methodSelectors, ...withoutMethodSelectors } = operation;

  return createGoogleCloudIntegrationEntity(withoutMethodSelectors, {
    entityData: {
      source: withoutMethodSelectors,
      assign: {
        _key: `${servicePerimeter.name}:${type}Policies[${policyIndex}]:apiOperations[${operationIndex}]`,
        _type:
          ENTITY_TYPE_ACCESS_CONTEXT_MANAGER_SERVICE_PERIMETER_API_OPERATION,
        _class:
          ENTITY_CLASS_ACCESS_CONTEXT_MANAGER_SERVICE_PERIMETER_API_OPERATION,
        name: `${servicePerimeter.name}:${type}Policies[${policyIndex}]:operations[${operationIndex}]`,
        displayName: `${servicePerimeter.name}:${type}Policies[${policyIndex}]:operations[${operationIndex}]`,
        serviceName: withoutMethodSelectors.serviceName,
      },
    },
  });
}

export function createServicePerimeterMethodSelectorEntity({
  servicePerimeter,
  methodSelector,
  policyIndex,
  operationIndex,
  methodIndex,
  type,
}: {
  servicePerimeter: accesscontextmanager_v1.Schema$ServicePerimeter;
  methodSelector: accesscontextmanager_v1.Schema$MethodSelector;
  policyIndex: number;
  operationIndex: number;
  methodIndex: number;
  type: 'egress' | 'ingress';
}) {
  return createGoogleCloudIntegrationEntity(methodSelector, {
    entityData: {
      source: methodSelector,
      assign: {
        _key: `${servicePerimeter.name}:${type}Policies[${policyIndex}]:apiOperations[${operationIndex}]:methodSelectors[${methodIndex}]`,
        _type:
          ENTITY_TYPE_ACCESS_CONTEXT_MANAGER_SERVICE_PERIMETER_METHOD_SELECTOR,
        _class:
          ENTITY_CLASS_ACCESS_CONTEXT_MANAGER_SERVICE_PERIMETER_METHOD_SELECTOR,
        name: `${servicePerimeter.name}:${type}Policies[${policyIndex}]:apiOperations[${operationIndex}]:methodSelectors[${methodIndex}]`,
        displayName: `${servicePerimeter.name}:${type}Policies[${policyIndex}]:apiOperations[${operationIndex}]:methodSelectors[${methodIndex}]`,
        method: methodSelector.method,
        permission: methodSelector.permission,
      },
    },
  });
}
