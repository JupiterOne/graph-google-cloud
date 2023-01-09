import { IntegrationStep } from '@jupiterone/integration-sdk-core';
import { IntegrationConfig } from '../../types';
import { fetchScanConfigsStepMap } from './steps/fetch-scan-configs';
import { fetchScanRunsStepMap } from './steps/fetch-scan-runs';
import { fetchScanRunFindingsStepMap } from './steps/fetch-scan-runs-findings';

export const webSecurityScannerSteps: IntegrationStep<IntegrationConfig>[] = [
  fetchScanConfigsStepMap,
  fetchScanRunsStepMap,
  fetchScanRunFindingsStepMap,
];
