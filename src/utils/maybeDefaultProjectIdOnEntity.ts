import { Entity } from '@jupiterone/integration-sdk-core';
import { bindingEntities } from '../steps/cloud-asset/constants';
import {
  ORGANIZATION_ENTITY_TYPE,
  FOLDER_ENTITY_TYPE,
} from '../steps/resource-manager';

/**
 * Defaults the projectId on an entity if the entity exists within a project.
 */
export function maybeDefaultProjectIdOnEntity(context, entity: Entity): Entity {
  // Do not put the project on organizations, folders, and bindings as they can live outside of a project.
  if (
    [
      ORGANIZATION_ENTITY_TYPE,
      FOLDER_ENTITY_TYPE,
      bindingEntities.BINDINGS._type,
    ].includes(entity._type)
  ) {
    return entity;
  }
  // Otherwise, default the projectId on every entity.
  return {
    ...entity,
    projectId:
      entity.projectId ??
      context.instance.config.projectId ??
      context.instance.config.serviceAccountKeyConfig.project_id,
  };
}
