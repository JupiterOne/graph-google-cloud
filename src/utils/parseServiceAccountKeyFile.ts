import { IntegrationValidationError } from '@jupiterone/integration-sdk-core';

const NEWLINE = '\n';
const RE_NEWLINES = /\\n/g;

export interface ParsedServiceAccountKeyFile {
  type: 'service_account';
  project_id: string;
  private_key_id: string;
  private_key: string;
  client_email: string;
  client_id: string;
  auth_uri: string;
  token_uri: string;
  auth_provider_x509_cert_url: string;
  client_x509_cert_url: string;
}

function collectInvalidKeysFromParsedServiceAccountKeyFile(
  parsed: ParsedServiceAccountKeyFile,
): string[] {
  const invalidKeys: string[] = [];

  [
    'type',
    'project_id',
    'private_key_id',
    'private_key',
    'client_email',
    'client_id',
    'auth_uri',
    'token_uri',
    'auth_provider_x509_cert_url',
    'client_x509_cert_url',
  ].forEach((k) => {
    if (typeof parsed[k] !== 'string') {
      invalidKeys.push(k);
    }
  });

  return invalidKeys;
}

export function parseServiceAccountKeyFile(
  serviceAccountKeyFile: string | undefined,
): ParsedServiceAccountKeyFile {
  if (!serviceAccountKeyFile) {
    throw new IntegrationValidationError(
      'Missing a required integration config value {serviceAccountKeyFile}',
    );
  }
  if (typeof serviceAccountKeyFile !== 'string') {
    // JSON.parse can take other types besides just strings. This should never
    // happen, but if it does, we do not want to continue.
    throw new IntegrationValidationError(
      'Invalid "serviceAccountKeyFile" content type passed to integration',
    );
  }

  let parsed: ParsedServiceAccountKeyFile;

  try {
    parsed = JSON.parse(serviceAccountKeyFile);
  } catch (err) {
    throw new IntegrationValidationError(
      'Invalid "serviceAccountKeyFile" contents passed to integration',
    );
  }

  const invalidKeys = collectInvalidKeysFromParsedServiceAccountKeyFile(parsed);

  if (invalidKeys.length) {
    throw new IntegrationValidationError(
      `Invalid contents of "serviceAccountKeyFile" passed to integration (invalidFileKeys=${invalidKeys.join(
        ',',
      )})`,
    );
  }

  return {
    ...parsed,
    private_key: parsed.private_key.replace(RE_NEWLINES, NEWLINE),
  };
}
