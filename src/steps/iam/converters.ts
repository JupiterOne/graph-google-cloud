import { iam_v1 } from 'googleapis';
import { createIntegrationEntity } from '@jupiterone/integration-sdk-core';
import { IAM_ROLE_ENTITY_CLASS, IAM_ROLE_ENTITY_TYPE } from './constants';
import { generateEntityKey } from '../../utils/generateKeys';

export function createIamRoleEntity(
  data: iam_v1.Schema$Role,
  {
    custom,
  }: {
    /**
     * Google Cloud has managed roles and custom roles. There is no metadata
     * on the role itself that marks whether it's a custom role or managed role.
     * We mark explcitly fetched custom rules as custom.
     */
    custom: boolean;
  },
) {
  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        _class: IAM_ROLE_ENTITY_CLASS,
        _type: IAM_ROLE_ENTITY_TYPE,
        _key: generateEntityKey({
          type: IAM_ROLE_ENTITY_TYPE,
          id: data.name as string,
        }),
        name: data.name,
        displayName: data.title as string,
        description: data.description,
        stage: data.stage,
        custom: custom === true,
        deleted: data.deleted === true,
        permissions: data.includedPermissions,
        etag: data.etag,
      },
    },
  });
}
