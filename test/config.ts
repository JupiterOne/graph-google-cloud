import { IntegrationConfig, SerializedIntegrationConfig } from '../src/types';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';
import { ParsedServiceAccountKeyFile } from '../src/utils/parseServiceAccountKeyFile';
import { deserializeIntegrationConfig } from '../src/utils/integrationConfig';
import { omitNewRegionsFromTests } from './regions';
omitNewRegionsFromTests();

if (process.env.LOAD_ENV) {
  dotenv.config({
    path: path.join(__dirname, '../.env'),
  });
}

export const DEFAULT_INTEGRATION_CONFIG_PROJECT_ID = 'j1-gc-integration-dev-v2';

// NOTE: This is a bogus certificate for tests. The Google Cloud SDK asserts
// that a certificate is valid.
export const DEFAULT_INTEGRATION_PRIVATE_KEY = fs.readFileSync(
  path.join(__dirname, '../fake-private-test-key.key'),
  {
    encoding: 'utf-8',
  },
);

export const DEFAULT_INTEGRATION_CLIENT_EMAIL =
  'j1-gc-integration-dev-sa@j1-gc-integration-dev.iam.gserviceaccount.com';

export const DEFAULT_INTEGRATION_CONFIG_SERVICE_ACCOUNT_KEY_FILE: ParsedServiceAccountKeyFile =
  {
    type: 'service_account',
    project_id: DEFAULT_INTEGRATION_CONFIG_PROJECT_ID,
    private_key_id: 'abcdef123456abcdef123456abcdef123456abc',
    private_key: DEFAULT_INTEGRATION_PRIVATE_KEY,
    client_email: DEFAULT_INTEGRATION_CLIENT_EMAIL,
    client_id: '12345678901234567890',
    auth_uri: 'https://accounts.google.com/o/oauth2/auth',
    token_uri: 'https://oauth2.googleapis.com/token',
    auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
    client_x509_cert_url: 'https://www.googleapis.com/abc',
  };

export const serializedIntegrationConfig: SerializedIntegrationConfig = {
  serviceAccountKeyFile:
    process.env.SERVICE_ACCOUNT_KEY_FILE ||
    JSON.stringify(DEFAULT_INTEGRATION_CONFIG_SERVICE_ACCOUNT_KEY_FILE),
  organizationId: '958457776463',
  configureOrganizationProjects: true,
};

export const integrationConfig: IntegrationConfig =
  deserializeIntegrationConfig(serializedIntegrationConfig);

export const setupErrorIntegrationConfig: IntegrationConfig = {
  ...serializedIntegrationConfig,
  serviceAccountKeyConfig: {
    type: 'service_account',
    project_id: 'mknoedel-project-1',
    private_key_id: 'abcdef123456abcdef123456abcdef123456abc',
    private_key: DEFAULT_INTEGRATION_PRIVATE_KEY,
    client_email:
      'j1-gc-integration-dev-sa@mknoedel-project-1.iam.gserviceaccount.com',
    client_id: '106311430307184243261',
    auth_uri: 'https://accounts.google.com/o/oauth2/auth',
    token_uri: 'https://oauth2.googleapis.com/token',
    auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
    client_x509_cert_url: 'https://www.googleapis.com/abc',
  },
};

export function getMockSerializedIntegrationConfig(): SerializedIntegrationConfig {
  return {
    serviceAccountKeyFile: JSON.stringify(
      DEFAULT_INTEGRATION_CONFIG_SERVICE_ACCOUNT_KEY_FILE,
    ),
  };
}

export function getMockIntegrationConfig(
  partial?: Partial<IntegrationConfig>,
): IntegrationConfig {
  return {
    ...deserializeIntegrationConfig(getMockSerializedIntegrationConfig()),
    ...partial,
  };
}
