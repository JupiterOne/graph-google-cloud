import { Entity } from '@jupiterone/integration-sdk-core';
import { createMockStepExecutionContext } from '@jupiterone/integration-sdk-testing';
import { IntegrationConfig } from '..';
import { integrationConfig } from '../../test/config';
import { bindingEntities } from '../steps/cloud-asset/constants';
import {
  ORGANIZATION_ENTITY_TYPE,
  FOLDER_ENTITY_TYPE,
} from '../steps/resource-manager';
import { maybeDefaultProjectIdOnEntity } from './maybeDefaultProjectIdOnEntity';

describe('maybeDefaultProjectIdOnEntity', () => {
  test.each([
    ORGANIZATION_ENTITY_TYPE,
    FOLDER_ENTITY_TYPE,
    bindingEntities.BINDINGS._type,
  ])(`should not default a projectId on %s entities`, (entityType) => {
    const context = createMockStepExecutionContext<IntegrationConfig>({
      instanceConfig: {
        ...integrationConfig,
        projectId: 'someId',
      },
    });
    const mockEntity: Entity = {
      _key: 'abc',
      _class: 'Resource',
      _type: entityType,
    };
    const expected = Object.assign({}, mockEntity);
    expect(maybeDefaultProjectIdOnEntity(context, mockEntity)).toEqual(
      expected,
    );
  });

  test(`should maintain the entity's projectId if it was previously specified`, () => {
    const projectId = 'entitySpecificProjectId';
    const context = createMockStepExecutionContext<IntegrationConfig>({
      instanceConfig: {
        ...integrationConfig,
        projectId: 'someId',
      },
    });
    const mockEntity: Entity = {
      _key: 'abc',
      _class: 'Resource',
      _type: 'type',
      projectId,
    };
    expect(maybeDefaultProjectIdOnEntity(context, mockEntity).projectId).toBe(
      projectId,
    );
  });

  test(`should default to the config's projectId`, () => {
    const context = createMockStepExecutionContext<IntegrationConfig>({
      instanceConfig: {
        ...integrationConfig,
        projectId: 'someId',
      },
    });
    const configProjectId = context.instance.config.projectId;
    const serviceAccountProjectId =
      context.instance.config.serviceAccountKeyConfig.project_id;
    const mockEntity: Entity = {
      _key: 'abc',
      _class: 'Resource',
      _type: 'type',
    };
    expect(configProjectId).toBeTruthy();
    expect(serviceAccountProjectId).toBeTruthy();
    expect(maybeDefaultProjectIdOnEntity(context, mockEntity).projectId).toBe(
      configProjectId,
    );
  });

  test(`should fall-back to the serviceAccount's projectId when ther is no projectId in the config`, () => {
    const context = createMockStepExecutionContext<IntegrationConfig>({
      instanceConfig: {
        ...integrationConfig,
        projectId: 'someId',
      },
    });
    delete context.instance.config.projectId;
    const configProjectId = context.instance.config.projectId;
    const serviceAccountProjectId =
      context.instance.config.serviceAccountKeyConfig.project_id;
    const mockEntity: Entity = {
      _key: 'abc',
      _class: 'Resource',
      _type: 'type',
    };
    expect(configProjectId).toBeFalsy();
    expect(serviceAccountProjectId).toBeTruthy();
    expect(maybeDefaultProjectIdOnEntity(context, mockEntity).projectId).toBe(
      serviceAccountProjectId,
    );
  });
});
