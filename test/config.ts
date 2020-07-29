import { IntegrationConfig } from '../src/types';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

if (process.env.LOAD_ENV) {
  dotenv.config({
    path: path.join(__dirname, '../.env'),
  });
}

export const DEFAULT_INTEGRATION_CONFIG_PROJECT_ID = 'j1-gc-integration-dev';

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

export const integrationConfig: IntegrationConfig = {
  projectId: process.env.PROJECT_ID || DEFAULT_INTEGRATION_CONFIG_PROJECT_ID,
  privateKey: process.env.PRIVATE_KEY || DEFAULT_INTEGRATION_PRIVATE_KEY,
  clientEmail: process.env.CLIENT_EMAIL || DEFAULT_INTEGRATION_CLIENT_EMAIL,
};

export function getMockIntegrationConfig(): IntegrationConfig {
  return {
    projectId: DEFAULT_INTEGRATION_CONFIG_PROJECT_ID,
    privateKey: DEFAULT_INTEGRATION_PRIVATE_KEY,
    clientEmail: DEFAULT_INTEGRATION_CLIENT_EMAIL,
  };
}
