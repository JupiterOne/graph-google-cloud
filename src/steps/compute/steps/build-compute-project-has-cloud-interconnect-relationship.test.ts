import {
  Recording,
  createMockStepExecutionContext,
  filterGraphObjects,
} from '@jupiterone/integration-sdk-testing';
import {
  ENTITY_CLASS_CLOUD_INTERCONNECT,
  ENTITY_CLASS_COMPUTE_PROJECT,
  ENTITY_TYPE_CLOUD_INTERCONNECT,
  ENTITY_TYPE_COMPUTE_PROJECT,
  REATIONSHIP_TYPE_COMPUTE_PROJECT_HAS_CLOUD_INTERCONNECT,
  STEP_COMPUTE_PROJECT_HAS_CLOUD_INTERCONNECT_RELATIONSHIP,
} from '../constants';
import { setupGoogleCloudRecording } from '../../../../test/recording';
import { integrationConfig } from '../../../../test/config';
import { IntegrationConfig } from '../../..';
import {
  ExplicitRelationship,
  Relationship,
} from '@jupiterone/integration-sdk-core';
import { fetchComputeProject } from './fetch-compute-project';
import { fetchCloudInterconnect } from './fetch-cloud-interconnect';
import { buildComputeProjectHasCloudInterconnectRelationship } from './build-compute-project-has-cloud-interconnect-relationship';

describe(`compute#${STEP_COMPUTE_PROJECT_HAS_CLOUD_INTERCONNECT_RELATIONSHIP}`, () => {
  let recording: Recording;
  beforeEach(() => {
    recording = setupGoogleCloudRecording({
      directory: __dirname,
      name: STEP_COMPUTE_PROJECT_HAS_CLOUD_INTERCONNECT_RELATIONSHIP,
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
    await fetchComputeProject(context);
    await fetchCloudInterconnect(context);
    await buildComputeProjectHasCloudInterconnectRelationship(context);
    expect({
      numCollectedEntities: context.jobState.collectedEntities.length,
      numCollectedRelationships: context.jobState.collectedRelationships.length,
      collectedEntities: context.jobState.collectedEntities,
      collectedRelationships: context.jobState.collectedRelationships,
      encounteredTypes: context.jobState.encounteredTypes,
    }).toMatchSnapshot();
    expect(
      context.jobState.collectedEntities.filter(
        (e) => e._type === ENTITY_TYPE_COMPUTE_PROJECT,
      ),
    ).toMatchGraphObjectSchema({
      _class: ENTITY_CLASS_COMPUTE_PROJECT,
      schema: {
        additionalProperties: false,
        properties: {
          _type: { const: 'google_compute_project' },
          _rawData: {
            type: 'array',
            items: { type: 'object' },
          },
          id: { type: 'string' },
          name: { type: 'string' },
          displayName: { type: 'string' },
          isOSLoginEnabled: { type: 'boolean' },
          kind: { type: 'string' },
          defaultServiceAccount: { type: 'string' },
          defaultNetworkTier: { type: 'string' },
          createdOn: { type: 'number' },
        },
      },
    });
    expect(
      context.jobState.collectedEntities.filter(
        (e) => e._type === ENTITY_TYPE_CLOUD_INTERCONNECT,
      ),
    ).toMatchGraphObjectSchema({
      _class: ENTITY_CLASS_CLOUD_INTERCONNECT,
      schema: {
        additionalProperties: false,
        properties: {
          _type: { const: ENTITY_TYPE_CLOUD_INTERCONNECT },
          _rawData: {
            type: 'array',
            items: { type: 'object' },
          },
          id: { type: 'string' },
          name: { type: 'string' },
          location: { type: 'string' },
          interConnectType: { type: 'string' || 'null' },
          kind: { type: 'string' },
          public: { type: 'boolean' },
          adminEnabled: { type: 'boolean' },
          createdOn: { type: 'number' },
          CIDR: { exclude: true },
          internal: { exclude: true },
        },
      },
    });
    const { directRelationships } = separateRelationships(
      context.jobState.collectedRelationships,
    );
    expect(
      directRelationships.filter(
        (e) =>
          e._type === REATIONSHIP_TYPE_COMPUTE_PROJECT_HAS_CLOUD_INTERCONNECT,
      ),
    ).toMatchDirectRelationshipSchema({
      schema: {
        properties: {
          _class: { const: 'HAS' },
          _type: {
            const: REATIONSHIP_TYPE_COMPUTE_PROJECT_HAS_CLOUD_INTERCONNECT,
          },
        },
      },
    });
  });
});