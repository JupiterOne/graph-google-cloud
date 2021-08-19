import { Entity } from '@jupiterone/integration-sdk-core';
import { cloudasset_v1 } from 'googleapis';
import { snakeCase } from 'lodash';
import { hashArray } from '../../utils/crypto';

import { createGoogleCloudIntegrationEntity } from '../../utils/entity';
import { isMemberPublic } from '../../utils/iam';
import { bindingEntities } from './constants';

export interface BindingEntity extends Entity {
  resource: string;
  role: string;
  members: string;
  projectId: string;
  'condition.title': string;
  'condition.description': string;
  'condition.expression': string;
  'condition.location': string;
  isReadOnly: boolean;
  isOpenToTheInternet: boolean;
}

export function buildIamBindingEntityKey({
  binding,
  projectName,
  resource,
}: {
  binding: cloudasset_v1.Schema$Binding;
  projectName: string | undefined | null;
  resource: string | undefined | null;
}) {
  // There are no unique values returned from this result so use everything
  // available to make the binding key unique.
  const keyBuilders = ['binding'];

  if (projectName) keyBuilders.push('project:' + projectName);
  if (resource) keyBuilders.push('resource:' + resource);
  if (binding.role) keyBuilders.push('role:' + binding.role);
  if (binding.members)
    keyBuilders.push('members:' + hashArray(binding.members));

  return keyBuilders.join('|');
}

export function createIamBindingEntity({
  _key,
  projectId,
  binding,
  resource,
  isReadOnly,
}: {
  _key: string;
  projectId?: string;
  binding: cloudasset_v1.Schema$Binding;
  resource: string | undefined | null;
  isReadOnly: boolean;
}): BindingEntity {
  const namePrefix = 'Role Binding for Resource: ';

  return createGoogleCloudIntegrationEntity(binding, {
    entityData: {
      source: binding,
      assign: {
        _class: bindingEntities.BINDINGS._class,
        _type: bindingEntities.BINDINGS._type,
        _key,
        name: snakeCase(namePrefix) + resource,
        displayName: namePrefix + resource,
        /**
         * The full resource name of the resource associated with this IAM policy.
         * Example: `//compute.googleapis.com/projects/my_project_123/zones/zone1/instances/instance1`.
         * See [Cloud Asset Inventory Resource Name Format](https://cloud.google.com/asset-inventory/docs/resource-name-format)
         * for more information. To search against the `resource`: * use a field query. Example: `resource:organizations/123`
         */
        resource,
        role: binding.role,
        members: binding.members,
        projectId,
        'condition.title': binding.condition?.title,
        'condition.description': binding.condition?.description,
        'condition.expression': binding.condition?.expression,
        'condition.location': binding.condition?.location,
        isReadOnly, // Are all the permissions associated with this binding read only permissions
        isOpenToTheInternet: (binding.members ?? []).some(isMemberPublic), // Is there a member associated with this binding that is open to the internet
      },
    },
  }) as BindingEntity;
}
