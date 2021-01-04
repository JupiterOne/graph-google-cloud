import { IntegrationStep } from '@jupiterone/integration-sdk-core';
import { CloudFunctionsClient } from './client';
import { IntegrationConfig, IntegrationStepContext } from '../../types';
import { createCloudFunctionEntity } from './converters';
import {
  CLOUD_FUNCTION_ENTITY_TYPE,
  STEP_CLOUD_FUNCTIONS,
  CLOUD_FUNCTION_ENTITY_CLASS,
} from './constants';
import { withErrorHandling } from '../../utils/withErrorHandling';

export * from './constants';

export async function fetchCloudFunctions(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState } = context;
  const client = new CloudFunctionsClient({ config: context.instance.config });
  await client.iterateCloudFunctions(async (cloudFunction) => {
    await jobState.addEntity(createCloudFunctionEntity(cloudFunction));
  });
}

export const functionsSteps: IntegrationStep<IntegrationConfig>[] = [
  {
    id: STEP_CLOUD_FUNCTIONS,
    name: 'Cloud Functions',
    entities: [
      {
        resourceName: 'Cloud Function',
        _type: CLOUD_FUNCTION_ENTITY_TYPE,
        _class: CLOUD_FUNCTION_ENTITY_CLASS,
      },
    ],
    relationships: [],
    executionHandler: withErrorHandling(fetchCloudFunctions),
  },
];
