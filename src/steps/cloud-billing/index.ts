import {
  GoogleCloudIntegrationStep,
  IntegrationStepContext,
} from '../../types';
import { CloudBillingClient } from './client';
import {
  STEP_BILLING_ACCOUNTS,
  ENTITY_TYPE_BILLING_ACCOUNT,
  ENTITY_CLASS_BILLING_ACCOUNT,
  IngestionSources,
  CloudBillingPermissions,
} from './constants';
import { createBillingAccountEntity } from './converters';

export async function fetchBillingAccounts(
  context: IntegrationStepContext,
): Promise<void> {
  const {
    jobState,
    instance: { config },
    logger,
  } = context;
  const client = new CloudBillingClient({ config }, logger);

  await client.iterateBillingAccounts(async (account) => {
    await jobState.addEntity(createBillingAccountEntity(account));
  });
}

export const cloudBillingSteps: GoogleCloudIntegrationStep[] = [
  {
    id: STEP_BILLING_ACCOUNTS,
    ingestionSourceId: IngestionSources.CLOUD_BILLING_ACCOUNTS,
    name: 'Billing Accounts',
    entities: [
      {
        resourceName: 'Billing Account',
        _type: ENTITY_TYPE_BILLING_ACCOUNT,
        _class: ENTITY_CLASS_BILLING_ACCOUNT,
      },
    ],
    relationships: [],
    dependsOn: [],
    executionHandler: fetchBillingAccounts,
    permissions: CloudBillingPermissions.STEP_BILLING_ACCOUNTS,
    apis: ['cloudasset.googleapis.com'],
  },
];
