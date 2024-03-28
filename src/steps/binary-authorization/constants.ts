export const BINARY_AUTHORIZATION_POLICY_ENTITY_CLASS = 'AccessPolicy';
export const BINARY_AUTHORIZATION_POLICY_ENTITY_TYPE =
  'google_binary_authorization_policy';

export const STEP_BINARY_AUTHORIZATION_POLICY =
  'fetch-binary-authorization-policy';

export const RELATIONSHIP_TYPE_PROJECT_HAS_BINARY_AUTHORIZATION_POLICY =
  'google_cloud_project_has_binary_authorization_policy';

export const IngestionSources = {
  BINARY_AUTHORIZATION_POLICY: 'binary-authorization-policy',
};

export const BinaryAuthorizationIngestionConfig = {
  [IngestionSources.BINARY_AUTHORIZATION_POLICY]: {
    title: 'Google Cloud Binary Authorization Policy',
    description: 'Controls for deploying trusted containers.',
    defaultsToDisabled: false,
  },
};

export const BinaryAuthPermissions = {
  STEP_BINARY_AUTHORIZATION_POLICY: ['binaryauthorization.policy.get'],
};
