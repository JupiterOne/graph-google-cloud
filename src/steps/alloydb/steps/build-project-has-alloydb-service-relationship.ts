import {
  RelationshipClass,
  createDirectRelationship,
} from '@jupiterone/integration-sdk-core';
import {
  GoogleCloudIntegrationStep,
  IntegrationStepContext,
} from '../../../types';
import {
  ENTITY_TYPE_ALLOYDB_POSTGRE_SQL_SERVICE,
  Relationships,
  STEP_ALLOYDB_POSTGRE_SQL_SERVICE,
} from '../constants';
import {
  PROJECT_ENTITY_TYPE,
  STEP_RESOURCE_MANAGER_PROJECT,
} from '../../resource-manager';
import { getKey } from '../converter';
import { STEP_PROJECT_HAS_ALLOYDB_SERVICE_RELATIONSHIP } from '../constants';

export async function buildProjectAlloyDBServiceRelationship(
  context: IntegrationStepContext,
): Promise<void> {
  const { instance, jobState, logger } = context;

  const alloyDbServiceKey = getKey(
    ENTITY_TYPE_ALLOYDB_POSTGRE_SQL_SERVICE,
    instance.id,
  );

  if (!jobState.hasKey(alloyDbServiceKey)) {
    logger.warn(`
      Step Name: Build Project Has AlloyDB Service Relationship
      Entity Name: AlloyDB Service,
      Key: ${alloyDbServiceKey} 
      `);
  } else {
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
}

export const buildProjectAlloyDBServiceRelationshipStep: GoogleCloudIntegrationStep =
  {
    id: STEP_PROJECT_HAS_ALLOYDB_SERVICE_RELATIONSHIP,
    name: 'Build Project Has AlloyDB Service Relationship',
    entities: [],
    relationships: [Relationships.PROJECT_HAS_ALLOYDB_SERVICE],
    dependsOn: [
      STEP_RESOURCE_MANAGER_PROJECT,
      STEP_ALLOYDB_POSTGRE_SQL_SERVICE,
    ],
    executionHandler: buildProjectAlloyDBServiceRelationship,
  };
