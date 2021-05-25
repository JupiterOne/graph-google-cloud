import {
  parseServiceAccountKeyFile,
  ParsedServiceAccountKeyFile,
} from './parseServiceAccountKeyFile';
import {
  DEFAULT_INTEGRATION_CONFIG_SERVICE_ACCOUNT_KEY_FILE,
  DEFAULT_INTEGRATION_CONFIG_PROJECT_ID,
  DEFAULT_INTEGRATION_PRIVATE_KEY,
  DEFAULT_INTEGRATION_CLIENT_EMAIL,
} from '../../test/config';
import { IntegrationValidationError } from '@jupiterone/integration-sdk-core';

describe('#parseServiceAcccountKeyFile', () => {
  test('should pass if valid key file provided', () => {
    const expectedKeyFile: ParsedServiceAccountKeyFile = {
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

    expect(
      parseServiceAccountKeyFile(
        JSON.stringify(DEFAULT_INTEGRATION_CONFIG_SERVICE_ACCOUNT_KEY_FILE),
      ),
    ).toEqual(expectedKeyFile);
  });

  test('should throw "IntegrationValidationError" if unable to parse serviceAccountKeyFile JSON', () => {
    expect.assertions(2);

    try {
      parseServiceAccountKeyFile('INVALID_CONTENTS');
    } catch (err) {
      expect(err instanceof IntegrationValidationError).toEqual(true);
      expect(err.message).toEqual(
        'Invalid "serviceAccountKeyFile" contents passed to integration',
      );
    }
  });

  test('should throw "IntegrationValidationError" if serviceAccountKeyFile does not have type string', () => {
    expect.assertions(2);

    try {
      parseServiceAccountKeyFile(123 as unknown as string);
    } catch (err) {
      expect(err instanceof IntegrationValidationError).toEqual(true);
      expect(err.message).toEqual(
        'Invalid "serviceAccountKeyFile" content type passed to integration',
      );
    }
  });

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
    test(`should throw if missing "${k}" from serviceAccountKeyFile`, () => {
      expect.assertions(1);

      try {
        parseServiceAccountKeyFile(
          JSON.stringify({
            ...DEFAULT_INTEGRATION_CONFIG_SERVICE_ACCOUNT_KEY_FILE,
            [k]: undefined,
          }),
        );
      } catch (err) {
        expect(err.message).toEqual(
          `Invalid contents of "serviceAccountKeyFile" passed to integration (invalidFileKeys=${k})`,
        );
      }
    });
  });
});
