import { IntegrationStep } from '@jupiterone/integration-sdk-core';
import { IntegrationConfig, IntegrationStepContext } from '../../types';
import { PROJECT_ENTITY_TYPE, STEP_PROJECT } from '../resource-manager';
import { BigQueryClient } from './client';

import {
  STEP_CLOUD_BIG_QUERY_DATASETS,
  CLOUD_BIG_QUERY_DATASET_ENTITY_TYPE,
  CLOUD_BIG_QUERY_DATASET_ENTITY_CLASS,
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

  await jobState.iterateEntities(
    {
      _type: PROJECT_ENTITY_TYPE,
    },
    async (projectEntity) => {
      await client.iterateBigQueryDatasets(
        projectEntity._key as string,
        async (dataset) => {
          await jobState.addEntity(createBigQueryDatasetEntity(dataset));
        },
      );
    },
  );
}

export const bigQuerySteps: IntegrationStep<IntegrationConfig>[] = [
  {
    id: STEP_CLOUD_BIG_QUERY_DATASETS,
    name: 'Cloud Big Query Datasets',
    entities: [
      {
        resourceName: 'Cloud Big Query Dataset',
        _type: CLOUD_BIG_QUERY_DATASET_ENTITY_TYPE,
        _class: CLOUD_BIG_QUERY_DATASET_ENTITY_CLASS,
      },
    ],
    relationships: [],
    dependsOn: [STEP_PROJECT],
    executionHandler: fetchBigQueryDatasets,
  },
];
