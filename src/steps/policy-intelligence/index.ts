import {
  createDirectRelationship,
  IntegrationMissingKeyError,
  RelationshipClass,
} from '@jupiterone/integration-sdk-core';
import {
  GoogleCloudIntegrationStep,
  IntegrationStepContext,
} from '../../types';
import { PolicyAnalyzerClient } from './client';
import {
  STEP_POLICY_INTELLIGENCE_ANALYZER_ACTIVITY,
  STEP_POLICY_INTELLIGENCE_ANALYZER,
  POLICY_INTELLIGENCE_ANALYZER_ACTIVITY_CLASS,
  POLICY_INTELLIGENCE_ANALYZER_ACTIVITY_TYPE,
  POLICY_INTELLIGENCE_ANALYZER_CLASS,
  POLICY_INTELLIGENCE_ANALYZER_TYPE,
  IngestionSources,
  RELATIONSHIP_TYPE_GOOGLE_CLOUD_PROJECT_HAS_POLICY_INTELLIGENCE_ANALYZER_ACTIVITY,
  RELATIONSHIP_TYPE_GOOGLE_CLOUD_PROJECT_HAS_POLICY_INTELLIGENCE_ANALYZER,
  STEP_GOOGLE_CLOUD_PROJECT_HAS_POLICY_INTELLIGENCE_ANALYZER_ACTIVITY,
  STEP_GOOGLE_CLOUD_PROJECT_HAS_POLICY_INTELLIGENCE_ANALYZER,
  STEP_POLICY_INTELLIGENCE_ANALYZER_HAS_POLICY_INTELLIGENCE_ANALYZER_ACTIVITY,
  RELATIONSHIP_TYPE_POLICY_INTELLIGENCE_ANALYZER_HAS_POLICY_INTELLIGENCE_ANALYZER_ACTIVITY,
} from './constants';
import {
  createPolicyIntelligenceAnalyzerActivityEntity,
  createPolicyIntelligenceAnalyzerEntity,
} from './converter';
import {
  PROJECT_ENTITY_TYPE,
  STEP_RESOURCE_MANAGER_PROJECT,
} from '../resource-manager';
import { getProjectEntity } from '../../utils/project';

export async function fetchPolicyAnalyzerActivity(
  context: IntegrationStepContext,
): Promise<void> {
  const {
    jobState,
    instance: { config },
    logger,
  } = context;

  const client = new PolicyAnalyzerClient({ config }, logger);

  await client.iteratePolicyAnalyzerActivity(async (policyAnalyzerActivity) => {
    if (!jobState.hasKey(policyAnalyzerActivity.fullResourceName as string)) {
      await jobState.addEntity(
        createPolicyIntelligenceAnalyzerActivityEntity(policyAnalyzerActivity),
      );
    }
  });
}

export async function fetchPolicyAnalyzer(
  context: IntegrationStepContext,
): Promise<void> {
  const {
    jobState,
    instance: { config },
    logger,
  } = context;

  const client = new PolicyAnalyzerClient({ config }, logger);

  await jobState.iterateEntities(
    { _type: POLICY_INTELLIGENCE_ANALYZER_ACTIVITY_TYPE },
    async (policyAnalyzerActivity) => {
      const policyAnalyzerEntity = createPolicyIntelligenceAnalyzerEntity(
        policyAnalyzerActivity,
        client.projectId,
      );

      await jobState.addEntity(policyAnalyzerEntity);
    },
  );
}

export async function buildProjectHasPolicyAnalyzerActivityRelationship(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState } = context;

  const projectEntity = await getProjectEntity(jobState);

  if (!projectEntity) return;

  await jobState.iterateEntities(
    { _type: POLICY_INTELLIGENCE_ANALYZER_ACTIVITY_TYPE },
    async (policyAnalyzerActivity) => {
      await jobState.addRelationship(
        createDirectRelationship({
          _class: RelationshipClass.HAS,
          fromKey: projectEntity._key as string,
          fromType: PROJECT_ENTITY_TYPE,
          toKey: policyAnalyzerActivity._key as string,
          toType: POLICY_INTELLIGENCE_ANALYZER_ACTIVITY_TYPE,
        }),
      );
    },
  );
}

export async function buildProjectHasPolicyAnalyzerRelationship(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState } = context;

  const projectEntity = await getProjectEntity(jobState);

  if (!projectEntity) return;

  await jobState.iterateEntities(
    { _type: POLICY_INTELLIGENCE_ANALYZER_TYPE },
    async (policyAnalyzery) => {
      await jobState.addRelationship(
        createDirectRelationship({
          _class: RelationshipClass.HAS,
          fromKey: projectEntity._key as string,
          fromType: PROJECT_ENTITY_TYPE,
          toKey: policyAnalyzery._key as string,
          toType: POLICY_INTELLIGENCE_ANALYZER_TYPE,
        }),
      );
    },
  );
}

export async function buildPolicyAnalyzerHasPolicyAnalyzerActivityRelationship(
  executionContext: IntegrationStepContext,
) {
  const { jobState } = executionContext;

  await jobState.iterateEntities(
    { _type: POLICY_INTELLIGENCE_ANALYZER_ACTIVITY_TYPE },
    async (policyAnalyzerActivity) => {
      const policyAnalyzerKey =
        policyAnalyzerActivity.serviceAccountId as string;

      const hasPolicyAnalyzerKey = jobState.hasKey(policyAnalyzerKey);

      if (!hasPolicyAnalyzerKey) {
        throw new IntegrationMissingKeyError(
          `Cannot build Relationship.
            Error: Missing Key.
            policyAnalyzerKey : ${policyAnalyzerKey}`,
        );
      }

      await jobState.addRelationship(
        createDirectRelationship({
          _class: RelationshipClass.HAS,
          fromKey: policyAnalyzerKey,
          fromType: POLICY_INTELLIGENCE_ANALYZER_TYPE,
          toKey: policyAnalyzerActivity._key,
          toType: POLICY_INTELLIGENCE_ANALYZER_ACTIVITY_TYPE,
        }),
      );
    },
  );
}

export const PolicyAnalyzerSteps: GoogleCloudIntegrationStep[] = [
  {
    id: STEP_POLICY_INTELLIGENCE_ANALYZER_ACTIVITY,
    ingestionSourceId: IngestionSources.POLICY_INTELLIGENCE_ANALYZER_ACTIVITY,
    name: 'Policy Intelligence Analyzer Activity',
    entities: [
      {
        resourceName: 'Policy Intelligence Analyzer Activity',
        _type: POLICY_INTELLIGENCE_ANALYZER_ACTIVITY_TYPE,
        _class: POLICY_INTELLIGENCE_ANALYZER_ACTIVITY_CLASS,
      },
    ],
    relationships: [],
    dependsOn: [],
    executionHandler: fetchPolicyAnalyzerActivity,
    apis: ['policyanalyzer.googleapis.com'],
  },
  {
    id: STEP_GOOGLE_CLOUD_PROJECT_HAS_POLICY_INTELLIGENCE_ANALYZER_ACTIVITY,
    ingestionSourceId:
      IngestionSources.PROJECT_HAS_POLICY_INTELLIGENCE_ANALYZER_ACTIVITY,
    name: 'Project HAS Policy Intelligence Analyzer Activity',
    entities: [],
    relationships: [
      {
        _class: RelationshipClass.HAS,
        _type:
          RELATIONSHIP_TYPE_GOOGLE_CLOUD_PROJECT_HAS_POLICY_INTELLIGENCE_ANALYZER_ACTIVITY,
        sourceType: PROJECT_ENTITY_TYPE,
        targetType: POLICY_INTELLIGENCE_ANALYZER_ACTIVITY_TYPE,
      },
    ],
    dependsOn: [
      STEP_RESOURCE_MANAGER_PROJECT,
      STEP_POLICY_INTELLIGENCE_ANALYZER_ACTIVITY,
    ],
    executionHandler: buildProjectHasPolicyAnalyzerActivityRelationship,
    permissions: [],
    apis: ['networkmanagement.googleapis.com'],
  },
  {
    id: STEP_POLICY_INTELLIGENCE_ANALYZER,
    ingestionSourceId: IngestionSources.POLICY_INTELLIGENCE_ANALYZER,
    name: 'Policy Intelligence Analyzer',
    entities: [
      {
        resourceName: 'Policy Intelligence Analyzer',
        _type: POLICY_INTELLIGENCE_ANALYZER_TYPE,
        _class: POLICY_INTELLIGENCE_ANALYZER_CLASS,
      },
    ],
    relationships: [],
    executionHandler: fetchPolicyAnalyzer,
    dependsOn: [STEP_POLICY_INTELLIGENCE_ANALYZER_ACTIVITY],
    apis: ['policyanalyzer.googleapis.com'],
  },
  {
    id: STEP_GOOGLE_CLOUD_PROJECT_HAS_POLICY_INTELLIGENCE_ANALYZER,
    ingestionSourceId:
      IngestionSources.PROJECT_HAS_POLICY_INTELLIGENCE_ANALYZER,
    name: 'Project HAS Policy Intelligence Analyzer',
    entities: [],
    relationships: [
      {
        _class: RelationshipClass.HAS,
        _type:
          RELATIONSHIP_TYPE_GOOGLE_CLOUD_PROJECT_HAS_POLICY_INTELLIGENCE_ANALYZER,
        sourceType: PROJECT_ENTITY_TYPE,
        targetType: POLICY_INTELLIGENCE_ANALYZER_TYPE,
      },
    ],
    dependsOn: [
      STEP_RESOURCE_MANAGER_PROJECT,
      STEP_POLICY_INTELLIGENCE_ANALYZER,
    ],
    executionHandler: buildProjectHasPolicyAnalyzerRelationship,
    permissions: [],
    apis: ['networkmanagement.googleapis.com'],
  },
  {
    id: STEP_POLICY_INTELLIGENCE_ANALYZER_HAS_POLICY_INTELLIGENCE_ANALYZER_ACTIVITY,
    ingestionSourceId:
      IngestionSources.POLICY_INTELLIGENCE_ANALYZER_HAS_POLICY_INTELLIGENCE_ANALYZER_ACTIVITY,
    name: 'Policy Intelligence Analyzer HAS Policy Intelligence Analyzer Activity',
    entities: [],
    relationships: [
      {
        _class: RelationshipClass.HAS,
        _type:
          RELATIONSHIP_TYPE_POLICY_INTELLIGENCE_ANALYZER_HAS_POLICY_INTELLIGENCE_ANALYZER_ACTIVITY,
        sourceType: POLICY_INTELLIGENCE_ANALYZER_TYPE,
        targetType: POLICY_INTELLIGENCE_ANALYZER_ACTIVITY_TYPE,
      },
    ],
    dependsOn: [
      STEP_POLICY_INTELLIGENCE_ANALYZER,
      STEP_POLICY_INTELLIGENCE_ANALYZER_ACTIVITY,
    ],
    executionHandler: buildPolicyAnalyzerHasPolicyAnalyzerActivityRelationship,
    permissions: [],
    apis: ['networkmanagement.googleapis.com'],
  },
];
