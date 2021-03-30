import {
  createDirectRelationship,
  IntegrationStep,
  RelationshipClass,
} from '@jupiterone/integration-sdk-core';
import { spanner_v1 } from 'googleapis';
import { IntegrationConfig, IntegrationStepContext } from '../../types';
import { isMemberPublic } from '../../utils/iam';
import { SpannerClient } from './client';
import {
  STEP_SPANNER_INSTANCES,
  STEP_SPANNER_INSTANCE_DATABASES,
  STEP_SPANNER_INSTANCE_CONFIGS,
  ENTITY_TYPE_SPANNER_INSTANCE,
  ENTITY_CLASS_SPANNER_INSTANCE,
  ENTITY_TYPE_SPANNER_INSTANCE_DATABASE,
  ENTITY_CLASS_SPANNER_INSTANCE_DATABASE,
  ENTITY_TYPE_SPANNER_INSTANCE_CONFIG,
  ENTITY_CLASS_SPANNER_INSTANCE_CONFIG,
  RELATIONSHIP_TYPE_SPANNER_INSTANCE_HAS_DATABASE,
  RELATIONSHIP_TYPE_SPANNER_INSTANCE_USES_CONFIG,
} from './constants';
import {
  createSpannerInstanceConfiguration,
  createSpannerInstanceDatabaseEntity,
  createSpannerInstanceEntity,
} from './converters';

function isSpannerPolicyPublicAccess(
  instancePolicy: spanner_v1.Schema$Policy,
): boolean {
  for (const binding of instancePolicy.bindings || []) {
    for (const member of binding.members || []) {
      if (isMemberPublic(member)) {
        return true;
      }
    }
  }

  return false;
}

export async function fetchSpannerInstanceConfigs(
  context: IntegrationStepContext,
): Promise<void> {
  const {
    jobState,
    instance: { config },
  } = context;

  const client = new SpannerClient({ config });

  await client.iterateInstanceConfigs(async (instanceConfig) => {
    await jobState.addEntity(
      createSpannerInstanceConfiguration(instanceConfig),
    );
  });
}

export async function fetchSpannerInstances(
  context: IntegrationStepContext,
): Promise<void> {
  const {
    jobState,
    instance: { config },
  } = context;

  const client = new SpannerClient({ config });
  await client.iterateInstances(async (instance) => {
    const instanceId = instance.name?.split('/')[3];
    const instancePolicy = await client.getInstancePolicy(instanceId as string);

    const instanceEntity = createSpannerInstanceEntity({
      data: instance,
      projectId: client.projectId,
      isPublic: isSpannerPolicyPublicAccess(instancePolicy),
    });
    await jobState.addEntity(instanceEntity);

    const instanceConfigEntity = await jobState.findEntity(
      instance.config as string,
    );
    if (instanceConfigEntity) {
      await jobState.addRelationship(
        createDirectRelationship({
          _class: RelationshipClass.USES,
          from: instanceEntity,
          to: instanceConfigEntity,
        }),
      );
    }
  });
}

export async function fetchSpannerInstanceDatabases(
  context: IntegrationStepContext,
): Promise<void> {
  const {
    jobState,
    instance: { config },
  } = context;

  const client = new SpannerClient({ config });
  await jobState.iterateEntities(
    {
      _type: ENTITY_TYPE_SPANNER_INSTANCE,
    },
    async (instanceEntity) => {
      const instanceId = (instanceEntity.name as string).split('/')[3];

      await client.iterateInstanceDatabases(instanceId, async (database) => {
        const databaseId = database.name?.split('/')[5];
        const databasePolicy = await client.getDatabasePolicy(
          instanceId,
          databaseId as string,
        );

        const instanceDatabaseEntity = createSpannerInstanceDatabaseEntity({
          data: database,
          projectId: client.projectId,
          isPublic: isSpannerPolicyPublicAccess(databasePolicy),
        });
        await jobState.addEntity(instanceDatabaseEntity);

        await jobState.addRelationship(
          createDirectRelationship({
            _class: RelationshipClass.HAS,
            from: instanceEntity,
            to: instanceDatabaseEntity,
          }),
        );
      });
    },
  );
}

export const spannerSteps: IntegrationStep<IntegrationConfig>[] = [
  {
    id: STEP_SPANNER_INSTANCE_CONFIGS,
    name: 'Spanner Instance Configs',
    entities: [
      {
        resourceName: 'Spanner Instance Config',
        _type: ENTITY_TYPE_SPANNER_INSTANCE_CONFIG,
        _class: ENTITY_CLASS_SPANNER_INSTANCE_CONFIG,
      },
    ],
    relationships: [],
    dependsOn: [],
    executionHandler: fetchSpannerInstanceConfigs,
  },
  {
    id: STEP_SPANNER_INSTANCES,
    name: 'Spanner Instances',
    entities: [
      {
        resourceName: 'Spanner Instance',
        _type: ENTITY_TYPE_SPANNER_INSTANCE,
        _class: ENTITY_CLASS_SPANNER_INSTANCE,
      },
    ],
    relationships: [
      {
        _class: RelationshipClass.USES,
        _type: RELATIONSHIP_TYPE_SPANNER_INSTANCE_USES_CONFIG,
        sourceType: ENTITY_TYPE_SPANNER_INSTANCE,
        targetType: ENTITY_TYPE_SPANNER_INSTANCE_CONFIG,
      },
    ],
    dependsOn: [STEP_SPANNER_INSTANCE_CONFIGS],
    executionHandler: fetchSpannerInstances,
  },
  {
    id: STEP_SPANNER_INSTANCE_DATABASES,
    name: 'Spanner Instance Databases',
    entities: [
      {
        resourceName: 'Spanner Instance Database',
        _type: ENTITY_TYPE_SPANNER_INSTANCE_DATABASE,
        _class: ENTITY_CLASS_SPANNER_INSTANCE_DATABASE,
      },
    ],
    relationships: [
      {
        _class: RelationshipClass.HAS,
        _type: RELATIONSHIP_TYPE_SPANNER_INSTANCE_HAS_DATABASE,
        sourceType: ENTITY_TYPE_SPANNER_INSTANCE,
        targetType: ENTITY_TYPE_SPANNER_INSTANCE_DATABASE,
      },
    ],
    dependsOn: [STEP_SPANNER_INSTANCES],
    executionHandler: fetchSpannerInstanceDatabases,
  },
];
