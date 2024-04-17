import {
  RelationshipClass,
  createDirectRelationship,
} from '@jupiterone/integration-sdk-core';
import {
  GoogleCloudIntegrationStep,
  IntegrationStepContext,
} from '../../types';
import { publishUnsupportedConfigEvent } from '../../utils/events';
import { artifactRegistryClient } from './client';
import {
  ARTIFACT_REGISTRY_CLASS,
  ARTIFACT_REGISTRY_REPOSITORY_CLASS,
  ARTIFACT_REGISTRY_REPOSITORY_TYPE,
  ARTIFACT_REGISTRY_TYPE,
  ARTIFACT_REPOSITORY_PACKAGE_CLASS,
  ARTIFACT_REPOSITORY_PACKAGE_TYPE,
  IngestionSources,
  RELATIONSHIP_PROJECT_HAS_ARTIFACT_REGISTRY_REPOSITORY_TYPE,
  RELATIONSHIP_PROJECT_HAS_ARTIFACT_REGISTRY_TYPE,
  STEP_ARTIFACT_REGISTRY,
  STEP_ARTIFACT_REGISTRY_REPOSITORY,
  STEP_ARTIFACT_REPOSIOTRY_PACKAGE,
  STEP_PROJECT_HAS_ARTIFACT_REGISTRY_RELATIONSHIP,
  STEP_PROJECT_HAS_ARTIFACT_REGISTRY_REPOSITORY_RELATIONSHIP,
} from './constants';
import {
  createArtifactRegistryEntity,
  createArtifactRegistryRepositoryEntity,
  createArtifactRepositoryPackageEntity,
} from './converters';
import {
  PROJECT_ENTITY_TYPE,
  STEP_RESOURCE_MANAGER_PROJECT,
} from '../resource-manager';
import { getProjectEntity } from '../../utils/project';

export async function fetchArtifactRegistryRepository(
  context: IntegrationStepContext,
): Promise<void> {
  const {
    jobState,
    instance: { config },
    logger,
  } = context;

  const client = new artifactRegistryClient({ config }, logger);

  try {
    await client.iterateArtifactRegistryRepository(async (repositories) => {
      await jobState.addEntity(
        createArtifactRegistryRepositoryEntity(repositories, client.projectId),
      );
    });
  } catch (err) {
    if (err.message?.match && err.message.match(/is not a workspace/i)) {
      publishUnsupportedConfigEvent({
        logger,
        resource: 'Artifact Registry Repository',
        reason: `${client.projectId} project is not a workspace`,
      });
    } else {
      throw err;
    }
  }
}

export async function fetchArtifactRepositoryPackage(
  context: IntegrationStepContext,
): Promise<void> {
  const {
    jobState,
    instance: { config },
    logger,
  } = context;

  const client = new artifactRegistryClient({ config }, logger);
  try {
    await jobState.iterateEntities(
      {
        _type: ARTIFACT_REGISTRY_REPOSITORY_TYPE,
      },
      async (repository) => {
        const repositoryName = (repository.name as string).split('/')[5];
        const repositoryLocation = (repository.name as string).split('/')[3];
        console.log(repositoryName + ' ;;;;' + repositoryLocation);
        await client.iterateArtifactRepositoryPackage(
          repositoryName,
          repositoryLocation,
          async (packages) => {
            await jobState.addEntity(
              createArtifactRepositoryPackageEntity(packages, client.projectId),
            );
          },
        );
      },
    );
  } catch (err) {
    if (err.message?.match && err.message.match(/is not a workspace/i)) {
      publishUnsupportedConfigEvent({
        logger,
        resource: 'Artifact Repository Package',
        reason: `${client.projectId} project is not a workspace`,
      });
    } else {
      throw err;
    }
  }
}

export async function fetchArtifactRegistry(
  context: IntegrationStepContext,
): Promise<void> {
  const {
    jobState,
    instance: { config },
    logger,
  } = context;

  const client = new artifactRegistryClient({ config }, logger);
  const data = [];
  const organization_id = config.organizationId as string;
  await jobState.addEntity(
    createArtifactRegistryEntity(organization_id, data, client.projectId),
  );
}

export async function buildProjectHasArtifactRegistryRepositoryRelationship(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState } = context;

  const projectEntity = await getProjectEntity(jobState);

  if (!projectEntity) return;

  await jobState.iterateEntities(
    { _type: ARTIFACT_REGISTRY_REPOSITORY_TYPE },
    async (repositories) => {
      await jobState.addRelationship(
        createDirectRelationship({
          _class: RelationshipClass.HAS,
          fromKey: projectEntity._key as string,
          fromType: PROJECT_ENTITY_TYPE,
          toKey: repositories._key as string,
          toType: ARTIFACT_REGISTRY_REPOSITORY_TYPE,
        }),
      );
    },
  );
}

export async function buildProjectHasArtifactRegistryRelationship(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState } = context;

  const projectEntity = await getProjectEntity(jobState);

  if (!projectEntity) return;

  await jobState.iterateEntities(
    { _type: ARTIFACT_REGISTRY_TYPE },
    async (registry) => {
      await jobState.addRelationship(
        createDirectRelationship({
          _class: RelationshipClass.HAS,
          fromKey: projectEntity._key as string,
          fromType: PROJECT_ENTITY_TYPE,
          toKey: registry._key as string,
          toType: ARTIFACT_REGISTRY_TYPE,
        }),
      );
    },
  );
}

export const artifactRegistrySteps: GoogleCloudIntegrationStep[] = [
  {
    id: STEP_ARTIFACT_REGISTRY_REPOSITORY,
    ingestionSourceId: IngestionSources.ARTIFACT_REGISTRY_REPOSITORY,
    name: 'Artifact Registry Repository',
    entities: [
      {
        resourceName: 'Artifact Registry Repository',
        _type: ARTIFACT_REGISTRY_REPOSITORY_TYPE,
        _class: ARTIFACT_REGISTRY_REPOSITORY_CLASS,
      },
    ],
    relationships: [],
    dependsOn: [],
    executionHandler: fetchArtifactRegistryRepository,
    permissions: ['artifactregistry.repositories.list'],
    apis: ['artifactregistry.googleapis.com'],
  },
  {
    id: STEP_ARTIFACT_REPOSIOTRY_PACKAGE,
    ingestionSourceId: IngestionSources.ARTIFACT_REPOSITORY_PACKAGE,
    name: 'Artifact Repository Package',
    entities: [
      {
        resourceName: 'Artifact Repository Package',
        _type: ARTIFACT_REPOSITORY_PACKAGE_TYPE,
        _class: ARTIFACT_REPOSITORY_PACKAGE_CLASS,
      },
    ],
    relationships: [],
    dependsOn: [STEP_ARTIFACT_REGISTRY_REPOSITORY],
    executionHandler: fetchArtifactRepositoryPackage,
    permissions: ['artifactregistry.packages.list'],
    apis: ['artifactregistry.googleapis.com'],
  },
  {
    id: STEP_ARTIFACT_REGISTRY,
    ingestionSourceId: IngestionSources.ARTIFACT_REGISTRY,
    name: 'Artifact Registry',
    entities: [
      {
        resourceName: 'Artifact Registry',
        _type: ARTIFACT_REGISTRY_TYPE,
        _class: ARTIFACT_REGISTRY_CLASS,
      },
    ],
    relationships: [],
    dependsOn: [],
    executionHandler: fetchArtifactRegistry,
    permissions: [],
    apis: ['artifactregistry.googleapis.com'],
  },
  {
    id: STEP_PROJECT_HAS_ARTIFACT_REGISTRY_REPOSITORY_RELATIONSHIP,
    ingestionSourceId:
      IngestionSources.PROJECT_HAS_ARTIFACT_REGISTRY_REPOSITORY_RELATIONSHIP,
    name: 'Project HAS Artifact Registry Repository',
    entities: [],
    relationships: [
      {
        _class: RelationshipClass.HAS,
        _type: RELATIONSHIP_PROJECT_HAS_ARTIFACT_REGISTRY_REPOSITORY_TYPE,
        sourceType: PROJECT_ENTITY_TYPE,
        targetType: ARTIFACT_REGISTRY_REPOSITORY_TYPE,
      },
    ],
    dependsOn: [
      STEP_RESOURCE_MANAGER_PROJECT,
      STEP_ARTIFACT_REGISTRY_REPOSITORY,
    ],
    executionHandler: buildProjectHasArtifactRegistryRepositoryRelationship,
    permissions: ['artifactregistry.repositories.list'],
    apis: ['artifactregistry.googleapis.com'],
  },
  {
    id: STEP_PROJECT_HAS_ARTIFACT_REGISTRY_RELATIONSHIP,
    ingestionSourceId:
      IngestionSources.PROJECT_HAS_ARTIFACT_REGISTRY_RELATIONSHIP,
    name: 'Project HAS Artifact Registry',
    entities: [],
    relationships: [
      {
        _class: RelationshipClass.HAS,
        _type: RELATIONSHIP_PROJECT_HAS_ARTIFACT_REGISTRY_TYPE,
        sourceType: PROJECT_ENTITY_TYPE,
        targetType: ARTIFACT_REGISTRY_TYPE,
      },
    ],
    dependsOn: [STEP_RESOURCE_MANAGER_PROJECT, STEP_ARTIFACT_REGISTRY],
    executionHandler: buildProjectHasArtifactRegistryRelationship,
    permissions: [],
    apis: ['artifactregistry.googleapis.com'],
  },
];
