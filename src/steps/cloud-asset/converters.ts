import { cloudasset_v1 } from 'googleapis';
import { snakeCase } from 'lodash';

import { createGoogleCloudIntegrationEntity } from '../../utils/entity';
import { bindingEntities } from './constants';

export function createIamBindingEntity(
  binding: cloudasset_v1.Schema$Binding,
  project: string | undefined | null,
  resource: string | undefined | null,
) {
  // There are no unique values returned from this result so use everything available to make the binding key unique.
  const keyBuilders = ['binding'];
  if (project) keyBuilders.push('project:' + project);
  if (resource) keyBuilders.push('resource:' + resource);
  if (binding.role) keyBuilders.push('role:' + binding.role);
  const key = keyBuilders.join('|');

  const namePrefix = 'Role Binding for Resource: ';

  return createGoogleCloudIntegrationEntity(binding, {
    entityData: {
      source: binding,
      assign: {
        _class: bindingEntities.BINDINGS._class,
        _type: bindingEntities.BINDINGS._type,
        _key: key,
        name: snakeCase(namePrefix) + resource,
        displayName: namePrefix + resource,
        resource,
        project,
        role: binding.role,
        members: binding.members,
        'condition.title': binding.condition?.title,
        'condition.description': binding.condition?.description,
        'condition.expression': binding.condition?.expression,
      },
    },
  });
}
