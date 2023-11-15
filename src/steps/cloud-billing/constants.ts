export const STEP_BILLING_ACCOUNTS = 'fetch-billing-accounts';

export const ENTITY_CLASS_BILLING_ACCOUNT = 'Account';
export const ENTITY_TYPE_BILLING_ACCOUNT = 'google_billing_account';

export const IngestionSources = {
  CLOUD_BILLING_ACCOUNTS: 'billing-accounts',
};

export const CloudBillingIngestionConfig = {
  [IngestionSources.CLOUD_BILLING_ACCOUNTS]: {
    title: 'Google Cloud Billing Accounts',
    description: 'Management of billing and payments.',
    defaultsToDisabled: false,
  },
};
