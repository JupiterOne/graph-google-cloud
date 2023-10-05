import {
  createDirectRelationship,
  RelationshipClass,
} from '@jupiterone/integration-sdk-core';
import {
  GoogleCloudIntegrationStep,
  IntegrationStepContext,
} from '../../types';
import { ENTITY_TYPE_COMPUTE_NETWORK, STEP_COMPUTE_NETWORKS } from '../compute';
import { DNSClient } from './client';
import {
  DNS_MANAGED_ZONE_ENTITY_CLASS,
  DNS_MANAGED_ZONE_ENTITY_TYPE,
  DNS_POLICY_ENTITY_CLASS,
  DNS_POLICY_ENTITY_TYPE,
  RELATIONSHIP_TYPE_COMPUTE_NETWORK_HAS_DNS_POLICY,
  STEP_DNS_MANAGED_ZONES,
  STEP_DNS_POLICIES,
} from './constants';
import {
  createDNSManagedZoneEntity,
  createDNSPolicyEntity,
} from './converters';

export async function fetchDNSManagedZones(
  context: IntegrationStepContext,
): Promise<void> {
  const {
    jobState,
    instance: { config },
    logger,
  } = context;

  const client = new DNSClient({ config }, logger);

  await client.iterateDNSManagedZones(async (dnsZone) => {
    await jobState.addEntity(createDNSManagedZoneEntity(dnsZone));
  });
}

export async function fetchDNSPolicies(
  context: IntegrationStepContext,
): Promise<void> {
  const {
    jobState,
    instance: { config },
    logger,
  } = context;

  const client = new DNSClient({ config }, logger);

  await client.iterateDNSPolicies(async (dnsPolicy) => {
    const dnsPolicyEntity = createDNSPolicyEntity(dnsPolicy, client.projectId);
    await jobState.addEntity(dnsPolicyEntity);

    if (dnsPolicy.networks) {
      for (const network of dnsPolicy.networks) {
        const networkKey = network.networkUrl;

        if (networkKey) {
          const networkEntity = await jobState.findEntity(networkKey);

          if (networkEntity) {
            await jobState.addRelationship(
              createDirectRelationship({
                _class: RelationshipClass.HAS,
                from: networkEntity,
                to: dnsPolicyEntity,
              }),
            );
          }
        }
      }
    }
  });
}

export const dnsManagedZonesSteps: GoogleCloudIntegrationStep[] = [
  {
    id: STEP_DNS_MANAGED_ZONES,
    name: 'DNS Managed Zones',
    entities: [
      {
        resourceName: 'DNS Managed Zone',
        _type: DNS_MANAGED_ZONE_ENTITY_TYPE,
        _class: DNS_MANAGED_ZONE_ENTITY_CLASS,
      },
    ],
    relationships: [],
    dependsOn: [],
    executionHandler: fetchDNSManagedZones,
    permissions: ['dns.managedZones.list'],
    apis: ['dns.googleapis.com'],
  },
  {
    id: STEP_DNS_POLICIES,
    name: 'DNS Policies',
    entities: [
      {
        resourceName: 'DNS Policy',
        _type: DNS_POLICY_ENTITY_TYPE,
        _class: DNS_POLICY_ENTITY_CLASS,
      },
    ],
    relationships: [
      {
        _class: RelationshipClass.HAS,
        _type: RELATIONSHIP_TYPE_COMPUTE_NETWORK_HAS_DNS_POLICY,
        sourceType: ENTITY_TYPE_COMPUTE_NETWORK,
        targetType: DNS_POLICY_ENTITY_TYPE,
      },
    ],
    executionHandler: fetchDNSPolicies,
    dependsOn: [STEP_COMPUTE_NETWORKS],
    permissions: ['dns.policies.list'],
    apis: ['dns.googleapis.com'],
  },
];
