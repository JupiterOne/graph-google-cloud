jest.setTimeout(60000);

import {
  Recording,
  createMockStepExecutionContext,
} from '@jupiterone/integration-sdk-testing';
import { setupGoogleCloudRecording } from '../../../test/recording';
import { IntegrationConfig } from '../../types';
import { fetchComputeDisks, fetchComputeInstances } from '.';
import { integrationConfig } from '../../../test/config';
import {
  ENTITY_TYPE_COMPUTE_DISK,
  ENTITY_TYPE_COMPUTE_INSTANCE,
} from './constants';

describe('#fetchComputeDisks', () => {
  let recording: Recording;

  beforeEach(() => {
    recording = setupGoogleCloudRecording({
      directory: __dirname,
      name: 'fetchComputeDisks',
    });
  });

  afterEach(async () => {
    await recording.stop();
  });

  test('should collect data', async () => {
    const context = createMockStepExecutionContext<IntegrationConfig>({
      instanceConfig: integrationConfig,
    });

    await fetchComputeDisks(context);

    expect({
      numCollectedEntities: context.jobState.collectedEntities.length,
      numCollectedRelationships: context.jobState.collectedRelationships.length,
      collectedEntities: context.jobState.collectedEntities,
      collectedRelationships: context.jobState.collectedRelationships,
      encounteredTypes: context.jobState.encounteredTypes,
    }).toMatchSnapshot();

    expect(context.jobState.collectedEntities).toMatchGraphObjectSchema({
      _class: ['DataStore'],
      schema: {
        additionalProperties: false,
        properties: {
          _type: { const: 'google_compute_disk' },
          _rawData: {
            type: 'array',
            items: { type: 'object' },
          },
          description: { type: 'string' },
          zone: { type: 'string' },
          sizeGB: { type: 'string' },
          status: { type: 'string' },
          sourceImage: { type: 'string' },
          sourceImageId: { type: 'string' },
          type: { type: 'string' },
          licenses: {
            type: 'array',
            items: { type: 'string' },
          },
          guestOsFeatures: {
            type: 'array',
            items: { type: 'string' },
          },
          lastAttachTimestamp: { type: 'number' },
          labelFingerprint: { type: 'string' },
          licenseCodes: {
            type: 'array',
            items: { type: 'string' },
          },
          physicalBlockSizeBytes: { type: 'string' },
          kind: { type: 'string' },
          encrypted: true,
        },
      },
    });
  });
});

describe('#fetchComputeInstances', () => {
  let recording: Recording;

  beforeEach(() => {
    recording = setupGoogleCloudRecording({
      directory: __dirname,
      name: 'fetchComputeInstances',
    });
  });

  afterEach(async () => {
    await recording.stop();
  });

  test('should collect data', async () => {
    const context = createMockStepExecutionContext<IntegrationConfig>({
      instanceConfig: integrationConfig,
    });

    await fetchComputeDisks(context);
    await fetchComputeInstances(context);

    expect({
      numCollectedEntities: context.jobState.collectedEntities.length,
      numCollectedRelationships: context.jobState.collectedRelationships.length,
      collectedEntities: context.jobState.collectedEntities,
      collectedRelationships: context.jobState.collectedRelationships,
      encounteredTypes: context.jobState.encounteredTypes,
    }).toMatchSnapshot();

    expect(
      context.jobState.collectedEntities.filter(
        (e) => e._type === ENTITY_TYPE_COMPUTE_DISK,
      ),
    ).toMatchGraphObjectSchema({
      _class: ['DataStore'],
      schema: {
        additionalProperties: false,
        properties: {
          _type: { const: 'google_compute_disk' },
          _rawData: {
            type: 'array',
            items: { type: 'object' },
          },
          description: { type: 'string' },
          zone: { type: 'string' },
          sizeGB: { type: 'string' },
          status: { type: 'string' },
          sourceImage: { type: 'string' },
          sourceImageId: { type: 'string' },
          type: { type: 'string' },
          licenses: {
            type: 'array',
            items: { type: 'string' },
          },
          guestOsFeatures: {
            type: 'array',
            items: { type: 'string' },
          },
          lastAttachTimestamp: { type: 'number' },
          labelFingerprint: { type: 'string' },
          licenseCodes: {
            type: 'array',
            items: { type: 'string' },
          },
          physicalBlockSizeBytes: { type: 'string' },
          kind: { type: 'string' },
          encrypted: true,
        },
      },
    });

    expect(
      context.jobState.collectedEntities.filter(
        (e) => e._type === ENTITY_TYPE_COMPUTE_INSTANCE,
      ),
    ).toMatchGraphObjectSchema({
      _class: ['Host'],
      schema: {
        additionalProperties: false,
        properties: {
          _type: { const: 'google_compute_instance' },
          _rawData: {
            type: 'array',
            items: { type: 'object' },
          },
          machineType: { type: 'string' },
          status: { type: 'string' },
          zone: { type: 'string' },
          canIpForward: { type: 'boolean' },
          cpuPlatform: { type: 'string' },
          labelFingerprint: { type: 'string' },
          startRestricted: { type: 'boolean' },
          deletionProtection: { type: 'boolean' },
          fingerprint: { type: 'string' },
          kind: { type: 'string' },
        },
      },
    });

    const computeInstanceUsesDiskRelationship = context.jobState.collectedRelationships.filter(
      (r) => r._type === 'google_compute_instance_uses_disk',
    );

    expect(computeInstanceUsesDiskRelationship).toEqual(
      computeInstanceUsesDiskRelationship.map((r) =>
        expect.objectContaining({
          _class: 'USES',
        }),
      ),
    );
  });
});
