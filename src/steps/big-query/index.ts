import { IntegrationStep } from '@jupiterone/integration-sdk-core';
import { IntegrationConfig, IntegrationStepContext } from '../../types';
import { STEP_PROJECT } from '../resource-manager';
import { BigQueryClient } from './client';

import {
  STEP_BIG_QUERY_DATASETS,
  BIG_QUERY_DATASET_ENTITY_TYPE,
  BIG_QUERY_DATASET_ENTITY_CLASS,
} from './constants';
import { createBigQueryDatasetEntity } from './converters';

export * from './constants';

export async function fetchBigQueryDatasets(
  context: IntegrationStepContext,
): Promise<void> {
  const {
    jobState,
    instance: { config },
  } = context;
  const client = new BigQueryClient({ config });

  await client.iterateBigQueryDatasets(async (dataset) => {
    await jobState.addEntity(createBigQueryDatasetEntity(dataset));
  });
}

export const bigQuerySteps: IntegrationStep<IntegrationConfig>[] = [
  {
    id: STEP_BIG_QUERY_DATASETS,
    name: 'Big Query Datasets',
    entities: [
      {
        resourceName: 'Big Query Dataset',
        _type: BIG_QUERY_DATASET_ENTITY_TYPE,
        _class: BIG_QUERY_DATASET_ENTITY_CLASS,
      },
    ],
    relationships: [],
    dependsOn: [STEP_PROJECT],
    executionHandler: fetchBigQueryDatasets,
  },
];
