import { IntegrationStep } from '@jupiterone/integration-sdk-core';
import { IntegrationConfig, IntegrationStepContext } from '../../types';
import { DataProcClient } from './client';
import {
  ENTITY_CLASS_DATAPROC_CLUSTER,
  ENTITY_TYPE_DATAPROC_CLUSTER,
  STEP_DATAPROC_CLUSTERS,
} from './constants';
import { createDataprocClusterEntity } from './converters';

export async function fetchDataprocClusters(
  context: IntegrationStepContext,
): Promise<void> {
  const {
    jobState,
    instance: { config },
  } = context;

  const client = new DataProcClient({ config });
  await client.iterateClusters(async (cluster) => {
    const clusterEntity = createDataprocClusterEntity(cluster);
    await jobState.addEntity(clusterEntity);
  });
}

export const dataprocSteps: IntegrationStep<IntegrationConfig>[] = [
  {
    id: STEP_DATAPROC_CLUSTERS,
    name: 'Dataproc Clusters',
    entities: [
      {
        resourceName: 'Dataproc Cluster',
        _type: ENTITY_TYPE_DATAPROC_CLUSTER,
        _class: ENTITY_CLASS_DATAPROC_CLUSTER,
      },
    ],
    relationships: [],
    dependsOn: [],
    executionHandler: fetchDataprocClusters,
  },
];
