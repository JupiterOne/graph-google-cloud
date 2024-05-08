import {
  GoogleCloudIntegrationStep,
  IntegrationStepContext,
} from '../../../types';
import { PrivateCaClient } from '../client';
import {
  PrivatecaEntities,
  PrivatecaSteps,
  IngestionSources,
  PrivateCAPermissions,
} from '../constants';
import { createCaPoolEntity } from '../converters';

export async function fetchCaPools(
  context: IntegrationStepContext,
): Promise<void> {
  const {
    jobState,
    instance: { config },
    logger,
  } = context;

  const client = new PrivateCaClient({ config }, logger);

  await client.iterateCaPools(async (caPool) => {
    await jobState.addEntity(createCaPoolEntity(caPool));
  });
}

export const fetchCaPoolsStepMap: GoogleCloudIntegrationStep = {
  id: PrivatecaSteps.STEP_PRIVATE_CA_POOLS.id,
  ingestionSourceId: IngestionSources.PRIVATE_CA_POOLS,
  name: PrivatecaSteps.STEP_PRIVATE_CA_POOLS.name,
  entities: [PrivatecaEntities.PRIVATE_CA_POOL],
  relationships: [],
  dependsOn: [],
  executionHandler: fetchCaPools,
  permissions: PrivateCAPermissions.STEP_PRIVATE_CA_POOLS,
  apis: ['privateca.googleapis.com'],
};
