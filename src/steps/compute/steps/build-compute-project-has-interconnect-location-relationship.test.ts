import {
  Recording,
  createMockStepExecutionContext,
  filterGraphObjects,
} from '@jupiterone/integration-sdk-testing';
import {
  ENTITY_CLASS_COMPUTE_PROJECT,
  ENTITY_CLASS_INTERCONNECT_LOCATION,
  ENTITY_TYPE_COMPUTE_PROJECT,
  ENTITY_TYPE_INTERCONNECT_LOCATION,
  RELATIONSHIP_TYPE_COMPUTE_PROJECT_HAS_INTERCONNECT_LOCATION,
  STEP_COMPUTE_PROJECT_HAS_INTERCONNECT_LOCATION_RELATIONSHIP,
} from '../constants';
import { IntegrationConfig } from '../../..';
import { integrationConfig } from '../../../../test/config';
import { setupGoogleCloudRecording } from '../../../../test/recording';
import {
  ExplicitRelationship,
  Relationship,
} from '@jupiterone/integration-sdk-core';
import { fetchComputeProject } from './fetch-compute-project';
import { fetchInterconnectLocation } from './fetch-interconnect-locations';
import { buildComputeProjectHasInterconnectLocationRelationship } from './build-compute-project-has-interconnect-location-relationship';

describe(`compute#${STEP_COMPUTE_PROJECT_HAS_INTERCONNECT_LOCATION_RELATIONSHIP}`, () => {
  let recording: Recording;
  beforeEach(() => {
    recording = setupGoogleCloudRecording({
      directory: __dirname,
      name: STEP_COMPUTE_PROJECT_HAS_INTERCONNECT_LOCATION_RELATIONSHIP,
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
    await fetchInterconnectLocation(context);
    await buildComputeProjectHasInterconnectLocationRelationship(context);
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
        (e) => e._type === ENTITY_TYPE_INTERCONNECT_LOCATION,
      ),
    ).toMatchGraphObjectSchema({
      _class: ENTITY_CLASS_INTERCONNECT_LOCATION,
      schema: {
        additionalProperties: false,
        properties: {
          _type: { const: ENTITY_TYPE_INTERCONNECT_LOCATION },
          _rawData: {
            type: 'array',
            items: { type: 'object' },
          },
          id: { type: 'string' },
          name: { type: 'string' },
          kind: { type: 'string' },
          city: { type: 'string' },
          address: { type: 'string' },
          facilityProvider: { type: 'string' },
          status: { type: 'string' },
          createdOn: { type: 'number' },
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
          RELATIONSHIP_TYPE_COMPUTE_PROJECT_HAS_INTERCONNECT_LOCATION,
      ),
    ).toMatchDirectRelationshipSchema({
      schema: {
        properties: {
          _class: { const: 'HAS' },
          _type: {
            const: RELATIONSHIP_TYPE_COMPUTE_PROJECT_HAS_INTERCONNECT_LOCATION,
          },
        },
      },
    });
  });
});
