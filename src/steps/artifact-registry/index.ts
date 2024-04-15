import {
  GoogleCloudIntegrationStep,
  IntegrationStepContext,
} from '../../types';
import { publishUnsupportedConfigEvent } from '../../utils/events';
import { artifactRegistryClient } from './client';
import {
  ARTIFACT_REGISTRY_REPOSITORY_CLASS,
  ARTIFACT_REGISTRY_REPOSITORY_TYPE,
  IngestionSources,
  STEP_ARTIFACT_REGISTRY_REPOSITORY,
} from './constants';
import { createArtifactRegistryRepositoryEntity } from './converters';

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
        resource: 'APP Connectors',
        reason: `${client.projectId} project is not a workspace`,
      });
    } else {
      throw err;
    }
  }
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
        //   schema: {
        //     properties: {
        //       CIDR: { exclude: true },
        //       public: { exclude: true },
        //       internal: { exclude: true },
        //     },
        //   },
      },
    ],
    relationships: [],
    dependsOn: [],
    executionHandler: fetchArtifactRegistryRepository,
    permissions: ['artifactregistry.repositories.list'],
    apis: ['artifactregistry.googleapis.com'],
  },
];
