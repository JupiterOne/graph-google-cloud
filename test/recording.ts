import {
  Recording,
  setupRecording,
  SetupRecordingInput,
} from '@jupiterone/integration-sdk-testing';
import {
  cloudbuild_v1,
  cloudfunctions_v1,
  iam_v1,
  privateca_v1,
} from 'googleapis';
import * as querystring from 'querystring';
import * as url from 'url';
import { gunzipSync } from 'zlib';
import { IntegrationConfig } from '../src';
import { parseServiceAccountKeyFile } from '../src/utils/parseServiceAccountKeyFile';
import { integrationConfig } from './config';

export { Recording } from '@jupiterone/integration-sdk-testing';

type SetupParameters = Parameters<typeof setupRecording>[0];
type MatchRequestsByFn =
  Required<SetupParameters>['options']['matchRequestsBy'];

enum GoogleHeaders {
  UPLOADER = 'x-guploader-uploadid',
}

function isListFunctionsUrl(url: string) {
  const parsed = parseServiceAccountKeyFile(
    integrationConfig.serviceAccountKeyFile,
  );
  return `https://cloudfunctions.googleapis.com/v1/projects/${parsed.project_id}/locations/-/functions`;
}

function sanitizeGoogleCloudFunctionSourceUploadUrl(sourceUploadUrl: string) {
  const parsedUrl = url.parse(sourceUploadUrl);

  if (!parsedUrl.query) {
    // This should not happen. `sourceUploadUrl` should always have a query string.
    return sourceUploadUrl;
  }

  const sanitizedQuerystring = querystring.encode({
    GoogleAccessId:
      'service-MOCK_PROJECT_ID_INT@gcf-admin-robot.iam.gserviceaccount.com',
    expires: 9999999999,
    Signature: '[REDACTED]',
  });

  return `${parsedUrl.protocol}//${parsedUrl.host}?${sanitizedQuerystring}`;
}

/**
 * Google Cloud Function responses include `sourceUploadUrl` which contains a
 * signed upload URL with a Google Cloud credentials.
 */
function sanitizeGoogleCloudFunctionResponse(
  response: cloudfunctions_v1.Schema$ListFunctionsResponse,
): cloudfunctions_v1.Schema$ListFunctionsResponse {
  return {
    functions:
      response.functions &&
      response.functions.map((cloudFunction) => ({
        ...cloudFunction,
        sourceUploadUrl:
          cloudFunction.sourceUploadUrl &&
          sanitizeGoogleCloudFunctionSourceUploadUrl(
            cloudFunction.sourceUploadUrl,
          ),
      })),
  };
}

function isCreateServiceAccountKeyUrl(url: string) {
  return new RegExp(
    /https:\/\/iam.googleapis.com\/v1\/projects\/(.*?)\/serviceAccounts\/(.*?)\/keys/,
  ).test(url);
}

function isListCertificateAutoritiesUrl(url: string) {
  return new RegExp(
    /https:\/\/privateca.googleapis.com\/v1beta1\/projects\/(.*?)\/locations\/-\/certificateAuthorities/,
  ).test(url);
}

function isListCertificatesUrl(url: string) {
  return new RegExp(
    /https:\/\/privateca.googleapis.com\/v1beta1\/projects\/(.*?)\/locations\/(.*?)\/certificateAuthorities\/(.*?)\/certificates/,
  ).test(url);
}

function isListBitbucketServerConfigUrl(url: string) {
  return new RegExp(
    /https:\/\/cloudbuild.googleapis.com\/v1\/projects\/(.*?)\/locations\/(.*?)\/bitbucketServerConfigs/,
  ).test(url);
}

function isListGithubEnterpriseServerConfigUrl(url: string) {
  return new RegExp(
    /https:\/\/cloudbuild.googleapis.com\/v1\/projects\/(.*?)\/githubEnterpriseConfigs/,
  ).test(url);
}

/**
 * The response from creating a service account key contains the private key
 * data, which we need to redact.
 */
function sanitizeCreateServiceAccountKeyResponse(
  response: iam_v1.Schema$ServiceAccountKey,
): iam_v1.Schema$ServiceAccountKey {
  return {
    ...response,
    privateKeyData: '[REDACTED]',
  };
}

function sanitizeListCertificateAuthoritiesResponse(
  response: privateca_v1.Schema$ListCertificateAuthoritiesResponse,
) {
  return {
    certificateAuthorities:
      response.certificateAuthorities &&
      response.certificateAuthorities.map((certificateAuthority) => ({
        ...certificateAuthority,
        pemCaCertificates: [],
        caCertificateDescriptions:
          certificateAuthority.caCertificateDescriptions?.map(
            (description) => ({
              ...description,
              publicKey: {
                key: '[REDACTED]',
              },
            }),
          ),
      })),
  };
}

function sanitizeListCertificatesResponse(
  response: privateca_v1.Schema$ListCertificatesResponse,
) {
  return {
    certificates:
      response.certificates &&
      response.certificates.map((certificate) => ({
        ...certificate,
        config: {
          ...certificate.config,
          publicKey: {
            key: '[REDACTED]',
          },
        },
        pemCertificate: '[REDACTED]',
        certificateDescription: {
          ...certificate.certificateDescription,
          publicKey: {
            key: '[REDACTED]',
          },
        },
        pemCertificateChain: [],
      })),
  };
}

function sanitizeBitbucketServerConfigResponse(
  response: cloudbuild_v1.Schema$ListBitbucketServerConfigsResponse,
) {
  return {
    ...response,
    bitbucketServerConfigs: response.bitbucketServerConfigs?.map((config) => {
      return {
        ...config,
        apiKey: '[REDACTED]',
      };
    }),
  };
}

function sanitizeGithubEnterpriseServerConfig(
  response: cloudbuild_v1.Schema$ListGithubEnterpriseConfigsResponse,
) {
  return {
    ...response,
    configs: response.configs?.map((config) => {
      return {
        ...config,
        webhookKey: '[REDACTED]',
      };
    }),
  };
}

function gzipStringToUtf8(str: string, encoding: BufferEncoding = 'hex') {
  const chunkBuffers: Buffer[] = [];
  const hexChunks = JSON.parse(str) as string[];

  hexChunks.forEach((chunk) => {
    const chunkBuffer = Buffer.from(chunk, encoding);
    chunkBuffers.push(chunkBuffer);
  });

  return gunzipSync(Buffer.concat(chunkBuffers)).toString('utf-8');
}

function getRedactedOAuthResponse() {
  return {
    access_token: '[REDACTED]',
    expires_in: 9999,
    token_type: 'Bearer',
  };
}

export async function withGoogleCloudRecording(
  options: SetupParameters,
  testFn: () => Promise<void>,
) {
  const recording = setupGoogleCloudRecording(options);
  try {
    await testFn();
  } finally {
    await recording.stop();
  }
}

export function getMatchRequestsBy(
  instanceConfig: IntegrationConfig,
): MatchRequestsByFn {
  return {
    headers: false,
    body: false,
    url: {
      query: (query) => {
        if (query['project']) {
          query['project'] = 'project-id';
        }

        return query;
      },
      pathname: (pathname: string): string => {
        pathname = pathname.replace(
          `/projects/${instanceConfig.serviceAccountKeyConfig.project_id}/`,
          '/projects/project-id/',
        );
        return pathname;
      },
    },
  };
}

export function setupGoogleCloudRecording({
  name,
  directory,
  ...overrides
}: SetupParameters): Recording {
  return setupRecording({
    directory,
    name,
    redactedResponseHeaders: [GoogleHeaders.UPLOADER],
    mutateEntry: (entry) => {
      redact(entry);
    },
    ...overrides,
  });
}

function redact(entry): void {
  const requestUrl = entry.request.url;

  if (entry.request.postData) {
    entry.request.postData.text = '[REDACTED]';
  }

  let responseText = entry.response.content.text;
  if (!responseText) {
    return;
  }

  const contentEncoding = entry.response.headers.find(
    (e) => e.name === 'content-encoding',
  );
  const transferEncoding = entry.response.headers.find(
    (e) => e.name === 'transfer-encoding',
  );

  if (contentEncoding && contentEncoding.value === 'gzip') {
    // Remove encoding/chunking since content is going to be unzipped
    entry.response.headers = entry.response.headers.filter(
      (e) => e && e !== contentEncoding && e !== transferEncoding,
    );

    // Remove recording binary marker
    delete (entry.response.content as any)._isBinary;

    if (
      requestUrl === 'https://www.googleapis.com/oauth2/v4/token' &&
      entry.response.status === 200
    ) {
      entry.response.content.encoding = 'utf-8';
      entry.response.content.text = JSON.stringify(getRedactedOAuthResponse());
      return;
    }

    responseText = gzipStringToUtf8(
      responseText,
      entry.response.content.encoding,
    );
    entry.response.content.encoding = 'utf-8';

    let parsedResponseText = JSON.parse(responseText.replace(/\r?\n|\r/g, ''));

    if (requestUrl === isListFunctionsUrl(requestUrl)) {
      parsedResponseText =
        sanitizeGoogleCloudFunctionResponse(parsedResponseText);
    }

    if (isCreateServiceAccountKeyUrl(requestUrl)) {
      parsedResponseText =
        sanitizeCreateServiceAccountKeyResponse(parsedResponseText);
    }

    if (isListCertificateAutoritiesUrl(requestUrl)) {
      parsedResponseText =
        sanitizeListCertificateAuthoritiesResponse(parsedResponseText);
    }

    if (isListCertificatesUrl(requestUrl)) {
      parsedResponseText = sanitizeListCertificatesResponse(parsedResponseText);
    }

    if (isListBitbucketServerConfigUrl(requestUrl)) {
      parsedResponseText =
        sanitizeBitbucketServerConfigResponse(parsedResponseText);
    }

    if (isListGithubEnterpriseServerConfigUrl(requestUrl)) {
      parsedResponseText =
        sanitizeGithubEnterpriseServerConfig(parsedResponseText);
    }

    entry.response.content.text = JSON.stringify(parsedResponseText);
  }
}

export async function withRecording(
  recordingName: string,
  directoryName: string,
  cb: () => Promise<void>,
  options?: SetupRecordingInput['options'],
) {
  const recording = setupGoogleCloudRecording({
    directory: directoryName,
    name: recordingName,
    options: {
      ...(options || {}),
    },
  });

  try {
    await cb();
  } finally {
    await recording.stop();
  }
}
