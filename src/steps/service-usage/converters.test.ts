import { serviceusage_v1 } from 'googleapis';
import { createApiServiceEntity } from './converters';
import { Entity } from '@jupiterone/integration-sdk-core';

function getMockServiceApi(
  partial?: serviceusage_v1.Schema$GoogleApiServiceusageV1Service,
): serviceusage_v1.Schema$GoogleApiServiceusageV1Service {
  return {
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
    ...partial,
  };
}

describe('#createApiServiceEntity', () => {
  test('should convert entity', () => {
    const expected: Entity = {
      name: 'vision.googleapis.com',
      _class: ['Service'],
      _type: 'google_cloud_api_service',
      _key: 'projects/545240943112/services/vision.googleapis.com',
      displayName: 'Cloud Vision API',
      category: ['infrastructure'],
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
    };

    expect(createApiServiceEntity(getMockServiceApi())).toEqual(expected);
  });

  test('should handle missing title', () => {
    const expected: Entity = {
      name: 'vision.googleapis.com',
      _class: ['Service'],
      _type: 'google_cloud_api_service',
      _key: 'projects/545240943112/services/vision.googleapis.com',
      displayName: 'vision.googleapis.com',
      category: ['infrastructure'],
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
    };

    expect(
      createApiServiceEntity(
        getMockServiceApi({
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
      ),
    ).toEqual(expected);
  });

  test('should handle documentation', () => {
    const expected: Entity = {
      name: 'vision.googleapis.com',
      _class: ['Service'],
      _type: 'google_cloud_api_service',
      _key: 'projects/545240943112/services/vision.googleapis.com',
      displayName: 'vision.googleapis.com',
      category: ['infrastructure'],
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
    };

    expect(
      createApiServiceEntity(
        getMockServiceApi({
          config: {
            name: 'vision.googleapis.com',
            quota: {},
            authentication: {},
            usage: {
              requirements: ['serviceusage.googleapis.com/tos/cloud'],
            },
          },
        }),
      ),
    ).toEqual(expected);
  });

  test('should handle missing usage', () => {
    const expected: Entity = {
      name: 'vision.googleapis.com',
      _class: ['Service'],
      _type: 'google_cloud_api_service',
      _key: 'projects/545240943112/services/vision.googleapis.com',
      displayName: 'Cloud Vision API',
      category: ['infrastructure'],
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
    };

    expect(
      createApiServiceEntity(
        getMockServiceApi({
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
      ),
    ).toEqual(expected);
  });

  test('should handle empty config property', () => {
    expect(() =>
      createApiServiceEntity(
        getMockServiceApi({
          config: undefined,
        }),
      ),
    ).toThrowError('API Service missing required "config" in response');
  });
});
