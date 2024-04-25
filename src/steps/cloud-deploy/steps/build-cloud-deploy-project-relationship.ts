import {
  IntegrationMissingKeyError,
  RelationshipClass,
  createDirectRelationship,
} from '@jupiterone/integration-sdk-core';
import {
  GoogleCloudIntegrationStep,
  IntegrationStepContext,
} from '../../../types';
import {
  ENTITY_TYPE_CLOUD_DEPLOY_SERVICE,
  RELATIONSHIP_TYPE_PROJECT_HAS_CLOUD_DEPLOY,
  STEP_CLOUD_DEPLOY_SERVICE,
  STEP_PROJECT_HAS_CLOUD_DEPLOY_RELATIONSHIP,
} from '../constant';
import { IngestionSources } from '../constant';
import {
  PROJECT_ENTITY_TYPE,
  STEP_RESOURCE_MANAGER_PROJECT,
} from '../../resource-manager';
import { getKey } from '../converter';

export async function buildProjectCloudDeployServiceRelationship(
  context: IntegrationStepContext,
): Promise<void> {
  const { instance, jobState } = context;

  const cloudDeployServiceKey = getKey(
    ENTITY_TYPE_CLOUD_DEPLOY_SERVICE,
    instance.id,
  );

  if (!jobState.hasKey(cloudDeployServiceKey)) {
    throw new IntegrationMissingKeyError(`
    Step Name: Build Project Has Cloud Deploy Service Relationship
    Entity Name: Cloud Deploy Service,
    Key: ${cloudDeployServiceKey} 
    `);
  }
  await jobState.iterateEntities(
    { _type: PROJECT_ENTITY_TYPE },
    async (project) => {
      await jobState.addRelationship(
        createDirectRelationship({
          _class: RelationshipClass.HAS,
          fromKey: project._key as string,
          fromType: PROJECT_ENTITY_TYPE,
          toKey: cloudDeployServiceKey,
          toType: ENTITY_TYPE_CLOUD_DEPLOY_SERVICE,
        }),
      );
    },
  );
}

export const buildProjectCloudDeployRelationshipStep: GoogleCloudIntegrationStep =
  {
    id: STEP_PROJECT_HAS_CLOUD_DEPLOY_RELATIONSHIP,
    ingestionSourceId: IngestionSources.PROJECT_HAS_CLOUD_DEPLOY_RELATIONSHIP,
    name: 'Build Project Has Cloud Deploy Service Relationship',
    entities: [],
    relationships: [
      {
        _type: RELATIONSHIP_TYPE_PROJECT_HAS_CLOUD_DEPLOY,
        sourceType: PROJECT_ENTITY_TYPE,
        _class: RelationshipClass.HAS,
        targetType: ENTITY_TYPE_CLOUD_DEPLOY_SERVICE,
      },
    ],
    dependsOn: [STEP_RESOURCE_MANAGER_PROJECT, STEP_CLOUD_DEPLOY_SERVICE],
    executionHandler: buildProjectCloudDeployServiceRelationship,
  };
