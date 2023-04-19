import { IntegrationStep } from '@jupiterone/integration-sdk-core';

import { fetchCaPoolsStepMap } from './steps/fetchCaPools';
import { IntegrationConfig } from '../../types';
import { fetchAuthorityCertificatesStepMap } from './steps/fetchAuthorityCertificates';
import { fetchCertificateAuthoritiesStepMap } from './steps/fetchCertificateAuthorities';
import { buildCAPoolCertificateAuthorityRelationshipsStepMap } from './steps/buildCAPoolCertificateAuthorityRelationships';
import { buildCertificateAuthorityBucketRelationshipsStepMap } from './steps/buildCertificateAuthorityBucketRelationships';
import { buildCertificateAuthorityCertificateRelationshipsStepMap } from './steps/buildCertificateAuthorityCertificateRelationships';

export const privateCaSteps: IntegrationStep<IntegrationConfig>[] = [
  fetchCaPoolsStepMap,
  fetchAuthorityCertificatesStepMap,
  fetchCertificateAuthoritiesStepMap,
  buildCAPoolCertificateAuthorityRelationshipsStepMap,
  buildCertificateAuthorityBucketRelationshipsStepMap,
  buildCertificateAuthorityCertificateRelationshipsStepMap,
];
