import {
  Recording,
  setupRecording,
  SetupRecordingInput,
} from '@jupiterone/integration-sdk-testing';
import { gunzipSync } from 'zlib';
import { cloudfunctions_v1, iam_v1, privateca_v1beta1 } from 'googleapis';
import * as url from 'url';
import * as querystring from 'querystring';
import { integrationConfig } from './config';
import { parseServiceAccountKeyFile } from '../src/utils/parseServiceAccountKeyFile';

export { Recording } from '@jupiterone/integration-sdk-testing';

type SetupParameters = Parameters<typeof setupRecording>[0];

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
  response: privateca_v1beta1.Schema$ListCertificateAuthoritiesResponse,
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
                type: description.publicKey?.type,
                key: '[REDACTED]',
              },
            }),
          ),
      })),
  };
}

function sanitizeListCertificatesResponse(
  response: privateca_v1beta1.Schema$ListCertificatesResponse,
) {
  return {
    certificates:
      response.certificates &&
      response.certificates.map((certificate) => ({
        ...certificate,
        config: {
          ...certificate.config,
          publicKey: {
            type: certificate.config?.publicKey?.type,
            key: '[REDACTED]',
          },
        },
        pemCertificate: '[REDACTED]',
        certificateDescription: {
          ...certificate.certificateDescription,
          publicKey: {
            type: certificate.certificateDescription?.publicKey?.type,
            key: '[REDACTED]',
          },
        },
        pemCertificateChain: [],
      })),
  };
}

function gzipStringToUtf8(str: string) {
  const chunkBuffers: Buffer[] = [];
  const hexChunks = JSON.parse(str) as string[];

  hexChunks.forEach((chunk) => {
    const chunkBuffer = Buffer.from(chunk, 'hex');
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

    if (requestUrl === 'https://www.googleapis.com/oauth2/v4/token') {
      entry.response.content.text = JSON.stringify(getRedactedOAuthResponse());
      return;
    }

    responseText = gzipStringToUtf8(responseText);
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
