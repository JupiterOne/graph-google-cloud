import { IntegrationStep } from '@jupiterone/integration-sdk-core';

import { fetchCaPoolsStepMap } from './steps/fetchCaPools';
import { IntegrationConfig } from '../../types';
import {
  buildCertificateAuthorityBucketRelationshipsStepMap,
  fetchAuthorityCertificatesStepMap,
} from './steps/fetchAuthorityCertificates';
import { fetchCertificateAuthoritiesStepMap } from './steps/fetchCertificateAuthorities';

export const privateCaSteps: IntegrationStep<IntegrationConfig>[] = [
  fetchCaPoolsStepMap,
  fetchAuthorityCertificatesStepMap,
  fetchCertificateAuthoritiesStepMap,
  buildCertificateAuthorityBucketRelationshipsStepMap,
];
