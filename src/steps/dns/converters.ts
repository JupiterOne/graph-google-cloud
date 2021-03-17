import { parseTimePropertyValue } from '@jupiterone/integration-sdk-core';
import { dns_v1 } from 'googleapis';
import { createGoogleCloudIntegrationEntity } from '../../utils/entity';
import {
  DNS_MANAGED_ZONE_ENTITY_CLASS,
  DNS_MANAGED_ZONE_ENTITY_TYPE,
} from './constants';

export function createDNSManagedZoneEntity(data: dns_v1.Schema$ManagedZone) {
  return createGoogleCloudIntegrationEntity(data, {
    entityData: {
      source: data,
      assign: {
        _key: data.id as string,
        _type: DNS_MANAGED_ZONE_ENTITY_TYPE,
        _class: DNS_MANAGED_ZONE_ENTITY_CLASS,
        name: data.name,
        displayName: data.name as string,
        domainName: data.dnsName,
        visibility: data.visibility,
        kind: data.kind,
        // 3.3 Ensure that DNSSEC is enabled for Cloud DNS (Scored)
        dnssec: data.dnssecConfig?.state,
        // 3.4 Ensure that RSASHA1 is not used for the key-signing key in Cloud DNS DNSSEC (Not Scored)
        keySigningAlgorithm: data.dnssecConfig?.defaultKeySpecs?.find(
          (spec) => spec.keyType === 'keySigning',
        )?.algorithm,
        // 3.5 Ensure that RSASHA1 is not used for the zone-signing key in Cloud DNS DNSSEC (Not Scored)
        zoneSigningAlgorithm: data.dnssecConfig?.defaultKeySpecs?.find(
          (spec) => spec.keyType === 'zoneSigning',
        )?.algorithm,
        createdOn: parseTimePropertyValue(data.creationTime),
      },
    },
  });
}
