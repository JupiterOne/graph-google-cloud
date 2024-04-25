import {
  createMockStepExecutionContext,
  filterGraphObjects,
  Recording,
} from '@jupiterone/integration-sdk-testing';
import { IntegrationConfig } from '../../..';
import { integrationConfig } from '../../../../test/config';
import { setupGoogleCloudRecording } from '../../../../test/recording';
import {
  ENTITY_CLASS_CLOUD_DEPLOY_SERVICE,
  ENTITY_TYPE_CLOUD_DEPLOY_SERVICE,
  RELATIONSHIP_TYPE_PROJECT_HAS_CLOUD_DEPLOY,
  STEP_PROJECT_HAS_CLOUD_DEPLOY_RELATIONSHIP,
} from '../constant';
import {
  ExplicitRelationship,
  Relationship,
} from '@jupiterone/integration-sdk-core';
import { fetchCloudDeploySevice } from './cloud-deploy-service';
import {
  fetchResourceManagerProject,
  PROJECT_ENTITY_TYPE,
} from '../../resource-manager';
import { buildProjectCloudDeployServiceRelationship } from './build-cloud-deploy-project-relationship';

describe('Build Project and Cloud Deploy Service Relationship', () => {
  let recording: Recording;

  beforeEach(() => {
    recording = setupGoogleCloudRecording({
      directory: __dirname,
      name: STEP_PROJECT_HAS_CLOUD_DEPLOY_RELATIONSHIP,
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

    await fetchCloudDeploySevice(context);
    await fetchResourceManagerProject(context);
    await buildProjectCloudDeployServiceRelationship(context);

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
        (e) => e._type === ENTITY_TYPE_CLOUD_DEPLOY_SERVICE,
      ),
    ).toMatchGraphObjectSchema({
      _class: ENTITY_CLASS_CLOUD_DEPLOY_SERVICE,
      schema: {
        additionalProperties: false,
        properties: {
          _type: { const: ENTITY_TYPE_CLOUD_DEPLOY_SERVICE },
          _rawData: {
            type: 'array',
            items: { type: 'object' },
          },
          category: { type: 'array', items: { type: 'string' } },
          function: { type: 'array', items: { type: 'string' } },
          name: { type: 'string' },
          projectId: { type: 'string' },
          organizationId: { type: 'string' },
          instanceId: { type: 'string' },
        },
      },
    });

    const { directRelationships } = separateRelationships(
      context.jobState.collectedRelationships,
    );

    expect(
      directRelationships.filter(
        (e) => e._type === RELATIONSHIP_TYPE_PROJECT_HAS_CLOUD_DEPLOY,
      ),
    ).toMatchDirectRelationshipSchema({
      schema: {
        properties: {
          _class: { const: 'HAS' },
          _type: {
            const: RELATIONSHIP_TYPE_PROJECT_HAS_CLOUD_DEPLOY,
          },
        },
      },
    });
  });
});
