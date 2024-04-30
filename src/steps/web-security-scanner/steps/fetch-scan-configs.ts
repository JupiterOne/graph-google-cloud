import {
  GoogleCloudIntegrationStep,
  IntegrationStepContext,
} from '../../../types';
import { WebSecurityScannerClient } from '../client';
import {
  WebSecurityScannerEntities,
  WebSecurityScannerSteps,
  IngestionSources,
  WebSecurityScannerPermissions,
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
  ingestionSourceId: IngestionSources.WEB_SECURITY_SCANNER_CONFIGS,
  name: WebSecurityScannerSteps.FETCH_SCAN_CONFIGS.name,
  entities: [WebSecurityScannerEntities.SCAN_CONFIG],
  relationships: [],
  dependsOn: [],
  executionHandler: fetchScanConfigs,
  permissions: WebSecurityScannerPermissions.FETCH_SCAN_CONFIGS,
  apis: ['websecurityscanner.googleapis.com'],
};
