import { createApiServiceEntity } from './converters';
import { Entity } from '@jupiterone/integration-sdk-core';
import { getMockServiceApi } from '../../../test/mocks';

describe('#createApiServiceEntity', () => {
  test('should convert entity', () => {
    const expected: Entity = {
      name: 'vision.googleapis.com',
      _class: ['Service'],
      _type: 'google_cloud_api_service',
      _key: 'projects/j1-gc-integration-dev-v2/services/vision.googleapis.com',
      displayName: 'Cloud Vision API',
      category: ['infrastructure'],
      function: ['api-enablement'],
      description:
        'Integrates Google Vision features, including image labeling, face, logo, and landmark detection, optical character recognition (OCR), and detection of explicit content, into applications.',
      state: 'ENABLED',
      enabled: true,
      usageRequirements: ['serviceusage.googleapis.com/tos/cloud'],
      _rawData: [
        {
          name: 'default',
          rawData: {
            name: 'projects/545240943112/services/vision.googleapis.com',
            config: {
              name: 'vision.googleapis.com',
              title: 'Cloud Vision API',
              documentation: {
                summary:
                  'Integrates Google Vision features, including image labeling, face, logo, and landmark detection, optical character recognition (OCR), and detection of explicit content, into applications.',
              },
              quota: {},
              authentication: {},
              usage: {
                requirements: ['serviceusage.googleapis.com/tos/cloud'],
              },
            },
            state: 'ENABLED',
            parent: 'projects/545240943112',
          },
        },
      ],
      hasIamPermissions: false,
    };

    expect(
      createApiServiceEntity({
        projectId: 'j1-gc-integration-dev-v2',
        data: getMockServiceApi(),
      }),
    ).toEqual(expected);
  });

  test('should handle missing title', () => {
    const expected: Entity = {
      name: 'vision.googleapis.com',
      _class: ['Service'],
      _type: 'google_cloud_api_service',
      _key: 'projects/j1-gc-integration-dev-v2/services/vision.googleapis.com',
      displayName: 'vision.googleapis.com',
      category: ['infrastructure'],
      function: ['api-enablement'],
      description:
        'Integrates Google Vision features, including image labeling, face, logo, and landmark detection, optical character recognition (OCR), and detection of explicit content, into applications.',
      state: 'ENABLED',
      enabled: true,
      usageRequirements: ['serviceusage.googleapis.com/tos/cloud'],
      _rawData: [
        {
          name: 'default',
          rawData: {
            name: 'projects/545240943112/services/vision.googleapis.com',
            config: {
              name: 'vision.googleapis.com',
              documentation: {
                summary:
                  'Integrates Google Vision features, including image labeling, face, logo, and landmark detection, optical character recognition (OCR), and detection of explicit content, into applications.',
              },
              quota: {},
              authentication: {},
              usage: {
                requirements: ['serviceusage.googleapis.com/tos/cloud'],
              },
            },
            state: 'ENABLED',
            parent: 'projects/545240943112',
          },
        },
      ],
      hasIamPermissions: false,
    };

    expect(
      createApiServiceEntity({
        projectId: 'j1-gc-integration-dev-v2',
        data: getMockServiceApi({
          config: {
            name: 'vision.googleapis.com',
            documentation: {
              summary:
                'Integrates Google Vision features, including image labeling, face, logo, and landmark detection, optical character recognition (OCR), and detection of explicit content, into applications.',
            },
            quota: {},
            authentication: {},
            usage: {
              requirements: ['serviceusage.googleapis.com/tos/cloud'],
            },
          },
        }),
      }),
    ).toEqual(expected);
  });

  test('should handle documentation', () => {
    const expected: Entity = {
      name: 'vision.googleapis.com',
      _class: ['Service'],
      _type: 'google_cloud_api_service',
      _key: 'projects/j1-gc-integration-dev-v2/services/vision.googleapis.com',
      displayName: 'vision.googleapis.com',
      category: ['infrastructure'],
      function: ['api-enablement'],
      state: 'ENABLED',
      enabled: true,
      usageRequirements: ['serviceusage.googleapis.com/tos/cloud'],
      _rawData: [
        {
          name: 'default',
          rawData: {
            name: 'projects/545240943112/services/vision.googleapis.com',
            config: {
              name: 'vision.googleapis.com',
              quota: {},
              authentication: {},
              usage: {
                requirements: ['serviceusage.googleapis.com/tos/cloud'],
              },
            },
            state: 'ENABLED',
            parent: 'projects/545240943112',
          },
        },
      ],
      hasIamPermissions: false,
    };

    expect(
      createApiServiceEntity({
        projectId: 'j1-gc-integration-dev-v2',
        data: getMockServiceApi({
          config: {
            name: 'vision.googleapis.com',
            quota: {},
            authentication: {},
            usage: {
              requirements: ['serviceusage.googleapis.com/tos/cloud'],
            },
          },
        }),
      }),
    ).toEqual(expected);
  });

  test('should handle missing usage', () => {
    const expected: Entity = {
      name: 'vision.googleapis.com',
      _class: ['Service'],
      _type: 'google_cloud_api_service',
      _key: 'projects/j1-gc-integration-dev-v2/services/vision.googleapis.com',
      displayName: 'Cloud Vision API',
      category: ['infrastructure'],
      function: ['api-enablement'],
      description:
        'Integrates Google Vision features, including image labeling, face, logo, and landmark detection, optical character recognition (OCR), and detection of explicit content, into applications.',
      state: 'ENABLED',
      enabled: true,
      _rawData: [
        {
          name: 'default',
          rawData: {
            name: 'projects/545240943112/services/vision.googleapis.com',
            config: {
              name: 'vision.googleapis.com',
              title: 'Cloud Vision API',
              documentation: {
                summary:
                  'Integrates Google Vision features, including image labeling, face, logo, and landmark detection, optical character recognition (OCR), and detection of explicit content, into applications.',
              },
              quota: {},
              authentication: {},
            },
            state: 'ENABLED',
            parent: 'projects/545240943112',
          },
        },
      ],
      hasIamPermissions: false,
    };

    expect(
      createApiServiceEntity({
        projectId: 'j1-gc-integration-dev-v2',
        data: getMockServiceApi({
          config: {
            name: 'vision.googleapis.com',
            title: 'Cloud Vision API',
            documentation: {
              summary:
                'Integrates Google Vision features, including image labeling, face, logo, and landmark detection, optical character recognition (OCR), and detection of explicit content, into applications.',
            },
            quota: {},
            authentication: {},
          },
        }),
      }),
    ).toEqual(expected);
  });

  test('should handle empty config property', () => {
    expect(() =>
      createApiServiceEntity({
        projectId: 'j1-gc-integration-dev-v2',
        data: getMockServiceApi({
          config: undefined,
        }),
      }),
    ).toThrowError('API Service missing required "config" in response');
  });
});
