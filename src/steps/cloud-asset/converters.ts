import { cloudasset_v1 } from 'googleapis';
import { snakeCase } from 'lodash';
import { hashArray } from '../../utils/crypto';

import { createGoogleCloudIntegrationEntity } from '../../utils/entity';
import { bindingEntities } from './constants';

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
}: {
  _key: string;
  projectId?: string;
  binding: cloudasset_v1.Schema$Binding;
  resource: string | undefined | null;
}) {
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
        resource,
        role: binding.role,
        members: binding.members,
        projectId,
        'condition.title': binding.condition?.title,
        'condition.description': binding.condition?.description,
        'condition.expression': binding.condition?.expression,
      },
    },
  });
}
