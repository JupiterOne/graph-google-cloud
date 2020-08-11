import { iam_v1 } from 'googleapis';

export function getMockIamRole(
  partial?: Partial<iam_v1.Schema$Role>,
): iam_v1.Schema$Role {
  return {
    name: 'projects/j1-gc-integration-dev/roles/myrole',
    title: 'Role',
    description: 'Description',
    includedPermissions: [
      'cloudfunctions.functions.get',
      'cloudfunctions.functions.getIamPolicy',
    ],
    stage: 'GA',
    etag: 'abc123',
    ...partial,
  };
}

export function getMockServiceAccount(
  partial?: Partial<iam_v1.Schema$ServiceAccount>,
): iam_v1.Schema$ServiceAccount {
  return {
    name:
      'projects/j1-gc-integration-dev/serviceAccounts/j1-gc-integration-dev-sa@j1-gc-integration-dev.iam.gserviceaccount.com',
    projectId: 'j1-gc-integration-dev',
    uniqueId: '1234567890',
    email:
      'j1-gc-integration-dev-sa@j1-gc-integration-dev.iam.gserviceaccount.com',
    etag: 'abc=',
    description: 'J1 Google Cloud integration execution',
    oauth2ClientId: '1234567890',
    ...partial,
  };
}

export function getMockServiceAccountKey(
  partial?: Partial<iam_v1.Schema$ServiceAccountKey>,
): iam_v1.Schema$ServiceAccountKey {
  return {
    name:
      'projects/j1-gc-integration-dev/serviceAccounts/j1-gc-integration-dev-sa-tf@j1-gc-integration-dev.iam.gserviceaccount.com/keys/12345',
    validAfterTime: '2020-08-05T18:05:19Z',
    validBeforeTime: '2020-08-21T18:05:19Z',
    keyAlgorithm: 'KEY_ALG_RSA_2048',
    keyOrigin: 'GOOGLE_PROVIDED',
    keyType: 'SYSTEM_MANAGED',
    ...partial,
  };
}
