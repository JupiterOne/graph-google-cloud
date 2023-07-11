import { parseTimePropertyValue } from '@jupiterone/integration-sdk-core';
import { dns_v1 } from 'googleapis';
import { createGoogleCloudIntegrationEntity } from '../../utils/entity';
import {
  DNS_MANAGED_ZONE_ENTITY_CLASS,
  DNS_MANAGED_ZONE_ENTITY_TYPE,
  DNS_POLICY_ENTITY_CLASS,
  DNS_POLICY_ENTITY_TYPE,
} from './constants';
import { cloudLoggingConfigParser } from './cloudLoggingConfigParser';

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
        cloudLoggingStatus: cloudLoggingConfigParser.parseEnableLoggingStatus(
          data.cloudLoggingConfig,
        ),
      },
    },
  });
}

export function createDNSPolicyEntity(
  data: dns_v1.Schema$Policy,
  projectId: string,
) {
  return createGoogleCloudIntegrationEntity(data, {
    entityData: {
      source: data,
      assign: {
        _key: `projects/${projectId}/policies/${data.id}`,
        _type: DNS_POLICY_ENTITY_TYPE,
        _class: DNS_POLICY_ENTITY_CLASS,
        id: data.id as string,
        name: data.name,
        displayName: data.name as string,
        description: data.description,
        enableInboundForwarding: data.enableInboundForwarding,
        enableLogging: data.enableLogging,
        networks: data.networks?.map((network) => network.networkUrl as string),
        kind: data.kind,
      },
    },
  });
}
