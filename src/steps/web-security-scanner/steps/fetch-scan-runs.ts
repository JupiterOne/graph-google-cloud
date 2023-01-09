import {
  createDirectRelationship,
  getRawData,
  IntegrationStep,
} from '@jupiterone/integration-sdk-core';
import { websecurityscanner_v1 } from 'googleapis';
import { IntegrationConfig, IntegrationStepContext } from '../../../types';
import { WebSecurityScannerClient } from '../client';
import {
  WebSecurityScannerEntities,
  WebSecurityScannerRelationships,
  WebSecurityScannerSteps,
} from '../constants';
import { createScanRunEntity } from '../converters';

async function fetchScanRuns(context: IntegrationStepContext): Promise<void> {
  const {
    jobState,
    instance: { config },
  } = context;
  const client = new WebSecurityScannerClient({ config });

  await jobState.iterateEntities(
    { _type: WebSecurityScannerEntities.SCAN_CONFIG._type },
    async (scanConfigEntity) => {
      const scanConfig =
        getRawData<websecurityscanner_v1.Schema$ScanConfig>(scanConfigEntity);

      if (scanConfig?.name) {
        await client.iterateScanRuns(scanConfig.name, async (data) => {
          const scanRunEntity = createScanRunEntity(data);
          await jobState.addEntity(scanRunEntity);
          await jobState.addRelationship(
            createDirectRelationship({
              _class:
                WebSecurityScannerRelationships
                  .GOOGLE_CLOUD_SCAN_CONFIG_PERFORMED_SCAN_RUN._class,
              from: scanConfigEntity,
              to: scanRunEntity,
            }),
          );
        });
      }
    },
  );
}

export const fetchScanRunsStepMap: IntegrationStep<IntegrationConfig> = {
  id: WebSecurityScannerSteps.FETCH_SCAN_RUNS.id,
  name: WebSecurityScannerSteps.FETCH_SCAN_RUNS.name,
  entities: [WebSecurityScannerEntities.SCAN_RUN],
  relationships: [
    WebSecurityScannerRelationships.GOOGLE_CLOUD_SCAN_CONFIG_PERFORMED_SCAN_RUN,
  ],
  dependsOn: [WebSecurityScannerSteps.FETCH_SCAN_CONFIGS.id],
  executionHandler: fetchScanRuns,
};
