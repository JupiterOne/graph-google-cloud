import {
  Recording,
  createMockStepExecutionContext,
  filterGraphObjects,
} from '@jupiterone/integration-sdk-testing';
import {
  ARTIFACT_REGISTRY_CLASS,
  ARTIFACT_REGISTRY_REPOSITORY_CLASS,
  ARTIFACT_REGISTRY_REPOSITORY_TYPE,
  ARTIFACT_REGISTRY_TYPE,
  RELATIONSHIP_PROJECT_HAS_ARTIFACT_REGISTRY_REPOSITORY_TYPE,
  RELATIONSHIP_PROJECT_HAS_ARTIFACT_REGISTRY_TYPE,
  STEP_PROJECT_HAS_ARTIFACT_REGISTRY_RELATIONSHIP,
  STEP_PROJECT_HAS_ARTIFACT_REGISTRY_REPOSITORY_RELATIONSHIP,
} from './constants';
import { setupGoogleCloudRecording } from '../../../test/recording';
import {
  ExplicitRelationship,
  Relationship,
} from '@jupiterone/integration-sdk-core';
import { IntegrationConfig } from '../../types';
import { integrationConfig } from '../../../test/config';
import {
  buildProjectHasArtifactRegistryRelationship,
  buildProjectHasArtifactRegistryRepositoryRelationship,
  fetchArtifactRegistry,
  fetchArtifactRegistryRepository,
} from '.';
import {
  PROJECT_ENTITY_TYPE,
  fetchResourceManagerProject,
} from '../resource-manager';

describe(`artifactRegistry#${STEP_PROJECT_HAS_ARTIFACT_REGISTRY_REPOSITORY_RELATIONSHIP}`, () => {
  let recording: Recording;
  beforeEach(() => {
    recording = setupGoogleCloudRecording({
      directory: __dirname,
      name: STEP_PROJECT_HAS_ARTIFACT_REGISTRY_REPOSITORY_RELATIONSHIP,
    });
  });
  afterEach(async () => {
    await recording.stop();
  });
  function separateRelationships(collectedRelationships: Relationship[]) {
    const { targets: directRelationships } = filterGraphObjects(
      collectedRelationships,
      (r) => !r._mapping,
    ) as {
      targets: ExplicitRelationship[];
    };
    return {
      directRelationships,
    };
  }
  test('should collect data', async () => {
    const context = createMockStepExecutionContext<IntegrationConfig>({
      instanceConfig: {
        ...integrationConfig,
        serviceAccountKeyFile: integrationConfig.serviceAccountKeyFile.replace(
          'j1-gc-integration-dev-v2',
          'j1-gc-integration-dev-v3',
        ),
        serviceAccountKeyConfig: {
          ...integrationConfig.serviceAccountKeyConfig,
          project_id: 'j1-gc-integration-dev-v3',
        },
      },
    });
    await fetchArtifactRegistryRepository(context);
    await fetchResourceManagerProject(context);
    await buildProjectHasArtifactRegistryRepositoryRelationship(context);
    expect({
      numCollectedEntities: context.jobState.collectedEntities.length,
      numCollectedRelationships: context.jobState.collectedRelationships.length,
      collectedEntities: context.jobState.collectedEntities,
      collectedRelationships: context.jobState.collectedRelationships,
      encounteredTypes: context.jobState.encounteredTypes,
    }).toMatchSnapshot();
    expect(
      context.jobState.collectedEntities.filter(
        (e) => e._type === PROJECT_ENTITY_TYPE,
      ),
    ).toMatchGraphObjectSchema({
      _class: ['Account'],
      schema: {
        additionalProperties: false,
        properties: {
          _type: { const: 'google_cloud_project' },
          _rawData: {
            type: 'array',
            items: { type: 'object' },
          },
          projectId: { type: 'string' },
          name: { type: 'string' },
          displayName: { type: 'string' },
          parent: { type: 'string' },
          lifecycleState: { type: 'string' },
          createdOn: { type: 'number' },
          updatedOn: { type: 'number' },
        },
      },
    });
    expect(
      context.jobState.collectedEntities.filter(
        (e) => e._type === ARTIFACT_REGISTRY_REPOSITORY_TYPE,
      ),
    ).toMatchGraphObjectSchema({
      _class: ARTIFACT_REGISTRY_REPOSITORY_CLASS,
      schema: {
        additionalProperties: false,
        properties: {
          _type: { const: ARTIFACT_REGISTRY_REPOSITORY_TYPE },
          _rawData: {
            type: 'array',
            items: { type: 'object' },
          },
          name: { type: 'string' },
          projectId: { type: 'string' },
          createdTime: { type: 'string' },
          updatedTime: { type: 'string' },
          format: { type: 'string' },
          mode: { type: 'string' },
        },
      },
    });
    const { directRelationships } = separateRelationships(
      context.jobState.collectedRelationships,
    );
    expect(
      directRelationships.filter(
        (e) =>
          e._type ===
          RELATIONSHIP_PROJECT_HAS_ARTIFACT_REGISTRY_REPOSITORY_TYPE,
      ),
    ).toMatchDirectRelationshipSchema({
      schema: {
        properties: {
          _class: { const: 'HAS' },
          _type: {
            const: RELATIONSHIP_PROJECT_HAS_ARTIFACT_REGISTRY_REPOSITORY_TYPE,
          },
        },
      },
    });
  }, 100000);
});

describe(`artifactRegistry#${STEP_PROJECT_HAS_ARTIFACT_REGISTRY_RELATIONSHIP}`, () => {
  let recording: Recording;
  beforeEach(() => {
    recording = setupGoogleCloudRecording({
      directory: __dirname,
      name: STEP_PROJECT_HAS_ARTIFACT_REGISTRY_RELATIONSHIP,
    });
  });
  afterEach(async () => {
    await recording.stop();
  });
  function separateRelationships(collectedRelationships: Relationship[]) {
    const { targets: directRelationships } = filterGraphObjects(
      collectedRelationships,
      (r) => !r._mapping,
    ) as {
      targets: ExplicitRelationship[];
    };
    return {
      directRelationships,
    };
  }
  test('should collect data', async () => {
    const context = createMockStepExecutionContext<IntegrationConfig>({
      instanceConfig: {
        ...integrationConfig,
        serviceAccountKeyFile: integrationConfig.serviceAccountKeyFile.replace(
          'j1-gc-integration-dev-v2',
          'j1-gc-integration-dev-v3',
        ),
        serviceAccountKeyConfig: {
          ...integrationConfig.serviceAccountKeyConfig,
          project_id: 'j1-gc-integration-dev-v3',
        },
      },
    });
    await fetchArtifactRegistry(context);
    await fetchResourceManagerProject(context);
    await buildProjectHasArtifactRegistryRelationship(context);
    expect({
      numCollectedEntities: context.jobState.collectedEntities.length,
      numCollectedRelationships: context.jobState.collectedRelationships.length,
      collectedEntities: context.jobState.collectedEntities,
      collectedRelationships: context.jobState.collectedRelationships,
      encounteredTypes: context.jobState.encounteredTypes,
    }).toMatchSnapshot();
    expect(
      context.jobState.collectedEntities.filter(
        (e) => e._type === PROJECT_ENTITY_TYPE,
      ),
    ).toMatchGraphObjectSchema({
      _class: ['Account'],
      schema: {
        additionalProperties: false,
        properties: {
          _type: { const: 'google_cloud_project' },
          _rawData: {
            type: 'array',
            items: { type: 'object' },
          },
          projectId: { type: 'string' },
          name: { type: 'string' },
          displayName: { type: 'string' },
          parent: { type: 'string' },
          lifecycleState: { type: 'string' },
          createdOn: { type: 'number' },
          updatedOn: { type: 'number' },
        },
      },
    });
    expect(
      context.jobState.collectedEntities.filter(
        (e) => e._type === ARTIFACT_REGISTRY_TYPE,
      ),
    ).toMatchGraphObjectSchema({
      _class: ARTIFACT_REGISTRY_CLASS,
      schema: {
        additionalProperties: false,
        properties: {
          _type: { const: ARTIFACT_REGISTRY_TYPE },
          _rawData: {
            type: 'array',
            items: { type: 'object' },
          },
          name: { type: 'string' },
          function: { type: 'array' },
          category: { type: 'array' },
          endpoint: { type: 'string' },
        },
      },
    });
    const { directRelationships } = separateRelationships(
      context.jobState.collectedRelationships,
    );
    expect(
      directRelationships.filter(
        (e) => e._type === RELATIONSHIP_PROJECT_HAS_ARTIFACT_REGISTRY_TYPE,
      ),
    ).toMatchDirectRelationshipSchema({
      schema: {
        properties: {
          _class: { const: 'HAS' },
          _type: {
            const: RELATIONSHIP_PROJECT_HAS_ARTIFACT_REGISTRY_TYPE,
          },
        },
      },
    });
  });
});
