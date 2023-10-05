import {
  GoogleCloudIntegrationStep,
  IntegrationStepContext,
} from '../../../types';
import { WebSecurityScannerClient } from '../client';
import {
  WebSecurityScannerEntities,
  WebSecurityScannerSteps,
} from '../constants';
import { createScanConfigEntity } from '../converters';

async function fetchScanConfigs(
  context: IntegrationStepContext,
): Promise<void> {
  const {
    jobState,
    instance: { config },
    logger,
  } = context;
  const client = new WebSecurityScannerClient({ config }, logger);

  await client.iterateScanConfigs(async (data) => {
    await jobState.addEntity(createScanConfigEntity(data));
  });
}

export const fetchScanConfigsStepMap: GoogleCloudIntegrationStep = {
  id: WebSecurityScannerSteps.FETCH_SCAN_CONFIGS.id,
  name: WebSecurityScannerSteps.FETCH_SCAN_CONFIGS.name,
  entities: [WebSecurityScannerEntities.SCAN_CONFIG],
  relationships: [],
  dependsOn: [],
  executionHandler: fetchScanConfigs,
  permissions: ['cloudsecurityscanner.scans.list'],
  apis: ['websecurityscanner.googleapis.com'],
};
