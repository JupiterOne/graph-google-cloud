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
  ENTITY_TYPE_POSTGRE_SQL_ALLOYDB_CLUSTER,
  RELATIONSHIP_TYPE_PROJECT_HAS_ALLOYDB_CLUSTER,
  STEP_ALLOYDB_POSTGRE_SQL_CLUSTER,
  STEP_PROJECT_HAS_ALLOYDB_CLUSTER_RELATIONSHIP,
} from '../constants';
import {
  PROJECT_ENTITY_TYPE,
  STEP_RESOURCE_MANAGER_PROJECT,
} from '../../resource-manager';
import { IngestionSources } from '../constants';
import { getProjectEntity } from '../../../utils/project';

export async function buildProjectClusterRelationship(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState } = context;

  const projectEntity = await getProjectEntity(jobState);

  if (!projectEntity) return;

  if (!jobState.hasKey(projectEntity._key)) {
    throw new IntegrationMissingKeyError(`
    Step Name: Build Project Has Cluster Relationship
    Project Key: ${projectEntity._key}
    `);
  }

  await jobState.iterateEntities(
    { _type: ENTITY_TYPE_POSTGRE_SQL_ALLOYDB_CLUSTER },
    async (cluster) => {
      await jobState.addRelationship(
        createDirectRelationship({
          _class: RelationshipClass.HAS,
          fromKey: projectEntity._key as string,
          fromType: PROJECT_ENTITY_TYPE,
          toKey: cluster._key as string,
          toType: ENTITY_TYPE_POSTGRE_SQL_ALLOYDB_CLUSTER,
        }),
      );
    },
  );
}

export const buildProjectClusterRelationshipStep: GoogleCloudIntegrationStep = {
  id: STEP_PROJECT_HAS_ALLOYDB_CLUSTER_RELATIONSHIP,
  ingestionSourceId: IngestionSources.PROJECT_HAS_ALLOYDB_CLUSTER_RELATIONSHIP,
  name: 'Build Project Has Cluster Relationship',
  entities: [],
  relationships: [
    {
      _type: RELATIONSHIP_TYPE_PROJECT_HAS_ALLOYDB_CLUSTER,
      sourceType: PROJECT_ENTITY_TYPE,
      _class: RelationshipClass.HAS,
      targetType: ENTITY_TYPE_POSTGRE_SQL_ALLOYDB_CLUSTER,
    },
  ],
  dependsOn: [STEP_RESOURCE_MANAGER_PROJECT, STEP_ALLOYDB_POSTGRE_SQL_CLUSTER],
  executionHandler: buildProjectClusterRelationship,
};
