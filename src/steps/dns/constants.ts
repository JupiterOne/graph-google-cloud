export const STEP_DNS_MANAGED_ZONES = 'fetch-dns-managed-zones';
export const STEP_DNS_POLICIES = 'fetch-dns-policies';

export const DNS_MANAGED_ZONE_ENTITY_CLASS = 'DomainZone';
export const DNS_MANAGED_ZONE_ENTITY_TYPE = 'google_dns_managed_zone';

export const DNS_POLICY_ENTITY_CLASS = 'Ruleset';
export const DNS_POLICY_ENTITY_TYPE = 'google_dns_policy';

export const RELATIONSHIP_TYPE_COMPUTE_NETWORK_HAS_DNS_POLICY =
  'google_compute_network_has_dns_policy';

export const IngestionSources = {
  DNS_MANAGED_ZONES: 'dns-managed-zones',
  DNS_POLICIES: 'dns-policies',
};

export const DnsIngestionConfig = {
  [IngestionSources.DNS_MANAGED_ZONES]: {
    title: 'Google DNS Managed Zones',
    description: 'Managed domains for DNS services.',
    defaultsToDisabled: false,
  },
  [IngestionSources.DNS_POLICIES]: {
    title: 'Google DNS Policies',
    description: 'Policies for managing DNS traffic.',
    defaultsToDisabled: false,
  },
};
