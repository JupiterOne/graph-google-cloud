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
import { createScanRunEntity, createScanRunFindingEntity } from '../converters';

async function fetchScanRunFindings(
  context: IntegrationStepContext,
): Promise<void> {
  const {
    jobState,
    instance: { config },
  } = context;
  const client = new WebSecurityScannerClient({ config });

  await jobState.iterateEntities(
    { _type: WebSecurityScannerEntities.SCAN_RUN._type },
    async (scanConfigEntity) => {
      const scanRun =
        getRawData<websecurityscanner_v1.Schema$ScanRun>(scanConfigEntity);

      if (scanRun?.name) {
        await client.iterateScanRunFindings(scanRun.name, async (data) => {
          const scanRunFindingEntity = createScanRunFindingEntity(data);
          await jobState.addEntity(scanRunFindingEntity);
          // await jobState.addRelationship(
          //   createDirectRelationship({
          //     _class:
          //       WebSecurityScannerRelationships
          //         .GOOGLE_CLOUD_SCAN_CONFIG_PERFORMED_SCAN_RUN._class,
          //     from: scanConfigEntity,
          //     to: scanRunEntity,
          //   }),
          // );
        });
      }
    },
  );
}

export const fetchScanRunFindingsStepMap: IntegrationStep<IntegrationConfig> = {
  id: WebSecurityScannerSteps.FETCH_SCAN_RUNS_FINDINGS.id,
  name: WebSecurityScannerSteps.FETCH_SCAN_RUNS_FINDINGS.name,
  entities: [WebSecurityScannerEntities.SCAN_RUN_FINDING],
  relationships: [
    WebSecurityScannerRelationships.GOOGLE_CLOUD_SCAN_RUN_HAS_FINDING,
  ],
  dependsOn: [WebSecurityScannerSteps.FETCH_SCAN_RUNS.id],
  executionHandler: fetchScanRunFindings,
};
