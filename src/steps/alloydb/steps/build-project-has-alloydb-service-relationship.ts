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
  ENTITY_TYPE_ALLOYDB_POSTGRE_SQL_SERVICE,
  RELATIONSHIP_TYPE_PROJECT_HAS_ALLOYDB_SERVICE,
  STEP_ALLOYDB_POSTGRE_SQL_SERVICE,
} from '../constants';
import {
  PROJECT_ENTITY_TYPE,
  STEP_RESOURCE_MANAGER_PROJECT,
} from '../../resource-manager';
import { getKey } from '../converter';
import {
  IngestionSources,
  STEP_PROJECT_HAS_ALLOYDB_SERVICE_RELATIONSHIP,
} from '../constants';

export async function buildProjectAlloyDBServiceRelationship(
  context: IntegrationStepContext,
): Promise<void> {
  const { instance, jobState } = context;

  const alloyDbServiceKey = getKey(
    ENTITY_TYPE_ALLOYDB_POSTGRE_SQL_SERVICE,
    instance.id,
  );

  if (!jobState.hasKey(alloyDbServiceKey)) {
    throw new IntegrationMissingKeyError(`
      Step Name: Build Project Has AlloyDB Service Relationship
      Entity Name: AlloyDB Service,
      Key: ${alloyDbServiceKey} 
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
          toKey: alloyDbServiceKey,
          toType: ENTITY_TYPE_ALLOYDB_POSTGRE_SQL_SERVICE,
        }),
      );
    },
  );
}

export const buildProjectAlloyDBServiceRelationshipStep: GoogleCloudIntegrationStep =
  {
    id: STEP_PROJECT_HAS_ALLOYDB_SERVICE_RELATIONSHIP,
    ingestionSourceId:
      IngestionSources.PROJECT_HAS_ALLOYDB_SERVICE_RELATIONSHIP,
    name: 'Build Project Has AlloyDB Service Relationship',
    entities: [],
    relationships: [
      {
        _type: RELATIONSHIP_TYPE_PROJECT_HAS_ALLOYDB_SERVICE,
        sourceType: PROJECT_ENTITY_TYPE,
        _class: RelationshipClass.HAS,
        targetType: ENTITY_TYPE_ALLOYDB_POSTGRE_SQL_SERVICE,
      },
    ],
    dependsOn: [
      STEP_RESOURCE_MANAGER_PROJECT,
      STEP_ALLOYDB_POSTGRE_SQL_SERVICE,
    ],
    executionHandler: buildProjectAlloyDBServiceRelationship,
  };
