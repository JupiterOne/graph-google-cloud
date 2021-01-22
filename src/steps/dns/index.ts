import { IntegrationStep } from '@jupiterone/integration-sdk-core';
import { IntegrationConfig, IntegrationStepContext } from '../../types';
import { DNSClient } from './client';
import {
  DNS_MANAGED_ZONE_ENTITY_CLASS,
  DNS_MANAGED_ZONE_ENTITY_TYPE,
  STEP_DNS_MANAGED_ZONES,
} from './constants';
import { createDNSManagedZoneEntity } from './converters';

export async function fetchDNSManagedZones(
  context: IntegrationStepContext,
): Promise<void> {
  const {
    jobState,
    instance: { config },
  } = context;

  const client = new DNSClient({ config });

  await client.iterateDNSManagedZones(async (dnsZone) => {
    await jobState.addEntity(createDNSManagedZoneEntity(dnsZone));
  });
}

export const dnsManagedZonesSteps: IntegrationStep<IntegrationConfig>[] = [
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
  },
];
