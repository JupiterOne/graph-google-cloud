import { iam_v1 } from 'googleapis';
import {
  createIamRoleEntity,
  createIamServiceAccountEntity,
  createIamServiceAccountKeyEntity,
  createIamServiceAccountHasKeyRelationship,
} from './converters';

function getMockIamRole(
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

function getMockServiceAccount(
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

function getMockServiceAccountKey(
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

describe('#createIamRoleEntity', () => {
  test('should convert custom role to entity', () => {
    expect(
      createIamRoleEntity(getMockIamRole(), {
        custom: true,
      }),
    ).toMatchSnapshot();
  });

  test('should convert noncustom role to entity', () => {
    expect(
      createIamRoleEntity(getMockIamRole(), {
        custom: false,
      }),
    ).toMatchSnapshot();
  });
});

describe('#createIamServiceAccount', () => {
  test('should convert to entity', () => {
    expect(
      createIamServiceAccountEntity(getMockServiceAccount()),
    ).toMatchSnapshot();
  });

  test('should convert to entity with "enabled" set to "false" if "disabled" is "true"', () => {
    expect(
      createIamServiceAccountEntity(
        getMockServiceAccount({
          disabled: true,
        }),
      ),
    ).toMatchSnapshot();
  });
});

describe('#createIamServiceAccountKeyEntity', () => {
  test('should convert to entity', () => {
    expect(
      createIamServiceAccountKeyEntity(getMockServiceAccountKey(), {
        projectId: 'j1-gc-integration-dev',
        serviceAccountId: 'abc123',
      }),
    ).toMatchSnapshot();
  });
});

describe('#createIamServiceAccountHasKeyRelationship', () => {
  test('should convert to relationship', () => {
    const serviceAccountEntity = createIamServiceAccountEntity(
      getMockServiceAccount(),
    );

    const serviceAccountKeyEntity = createIamServiceAccountKeyEntity(
      getMockServiceAccountKey(),
      {
        projectId: 'j1-gc-integration-dev',
        serviceAccountId: 'abc123',
      },
    );

    expect(
      createIamServiceAccountHasKeyRelationship({
        serviceAccountEntity,
        serviceAccountKeyEntity,
      }),
    ).toMatchSnapshot();
  });
});
