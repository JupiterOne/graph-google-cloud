/**
 * Used to generate the `.env` file at the root of the project for running
 * locally against a real Google Cloud account.
 *
 * Usage: `yarn create-env-file ~/SERVICE_ACCOUNT_FILE_PATH_HERE.json
 */
import { promises as fs } from 'fs';
import * as path from 'path';
import {
  parseServiceAccountKeyFile,
  ParsedServiceAccountKeyFile,
} from '../src/utils/parseServiceAccountKeyFile';

/* eslint-disable no-console */
async function writeEnvFile(parsed: ParsedServiceAccountKeyFile) {
  const serialized = `SERVICE_ACCOUNT_KEY_FILE=${JSON.stringify(parsed)}`;

  await fs.writeFile(path.join(__dirname, '../.env'), serialized, {
    encoding: 'utf-8',
  });
}

(async () => {
  const serviceAccountKeyFilePath = process.argv[2];

  if (!serviceAccountKeyFilePath) {
    throw new Error('No service account key file path specified.');
  }

  const serviceAccountKeyFile = await fs.readFile(serviceAccountKeyFilePath, {
    encoding: 'utf-8',
  });

  await writeEnvFile(parseServiceAccountKeyFile(serviceAccountKeyFile));
})().catch((err) => {
  console.error(err, 'Error creating .env file'); // eslint-disable-line no-console
});
