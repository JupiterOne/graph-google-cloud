import { getMockIntegrationConfig } from '../../test/config';
import { ServiceUsageName } from '../google-cloud/types';
import * as enablement from './enablement';
import * as serviceUsage from './service-usage/client';

describe('#getUniqueIntegrationConfigProjectsForStepEnablement', () => {
  test('should return only "main" integration project ID if no "target" project ID is supplied', () => {
    const config = getMockIntegrationConfig();
    expect(
      enablement.getUniqueIntegrationConfigProjectsForStepEnablement(config),
    ).toEqual(['j1-gc-integration-dev-v2']);
  });

  test('should return both "main" and "target" integration project IDs if "target" project ID is supplied', () => {
    const config = getMockIntegrationConfig({
      projectId: 'my-target-project-id',
    });

    expect(
      enablement.getUniqueIntegrationConfigProjectsForStepEnablement(config),
    ).toEqual(['j1-gc-integration-dev-v2', 'my-target-project-id']);
  });
});

describe('#createStepStartState', () => {
  test('should not mark step start state as disabled when the service is enabled', () => {
    expect(
      enablement.createStepStartState(
        [
          'pubsub.googleapis.com',
          'appengine.googleapis.com',
          'dns.googleapis.com',
        ],
        ServiceUsageName.APP_ENGINE,
      ),
    ).toEqual({
      disabled: false,
    });
  });

  test('should mark step start state as disabled when the service is not enabled', () => {
    expect(
      enablement.createStepStartState(
        [
          'pubsub.googleapis.com',
          'appengine.googleapis.com',
          'dns.googleapis.com',
        ],
        ServiceUsageName.CLOUD_FUNCTIONS,
      ),
    ).toEqual({
      disabled: true,
    });
  });

  test('should allow alternative service names to be supplied', () => {
    expect(
      enablement.createStepStartState(
        [
          'pubsub.googleapis.com',
          'storage-component.googleapis.com',
          'dns.googleapis.com',
        ],
        ServiceUsageName.STORAGE,
        ServiceUsageName.STORAGE_COMPONENT,
        ServiceUsageName.STORAGE_API,
      ),
    ).toEqual({
      disabled: false,
    });
  });
});

describe('#createStepStartStateWhereAllServicesMustBeEnabled', () => {
  test('should enable if all service names are enabled', () => {
    expect(
      enablement.createStepStartStateWhereAllServicesMustBeEnabled(
        [
          'storage.googleapis.com',
          'storage-component.googleapis.com',
          'storage-api.googleapis.com',
        ],
        ServiceUsageName.STORAGE,
        ServiceUsageName.STORAGE_COMPONENT,
        ServiceUsageName.STORAGE_API,
      ),
    ).toEqual({
      disabled: false,
    });
  });
  test('should not enable if not all service names are enabled', () => {
    expect(
      enablement.createStepStartStateWhereAllServicesMustBeEnabled(
        ['storage-component.googleapis.com'],
        ServiceUsageName.STORAGE,
        ServiceUsageName.STORAGE_COMPONENT,
        ServiceUsageName.STORAGE_API,
      ),
    ).toEqual({
      disabled: true,
    });
  });
});

describe('#getEnabledServiceNames', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test('should return "main" project enabled service names if "target" project not specified in config', async () => {
    const mockConfig = getMockIntegrationConfig();
    const mockEnabledServiceNames: string[] = [
      'pubsub.googleapis.com',
      'appengine.googleapis.com',
      'dns.googleapis.com',
    ];

    const collectEnabledServicesForProjectSpy = jest
      .spyOn(serviceUsage, 'collectEnabledServicesForProject')
      .mockResolvedValue(Promise.resolve(mockEnabledServiceNames));

    expect(await enablement.getEnabledServiceNames(mockConfig)).toEqual(
      mockEnabledServiceNames,
    );
    expect(collectEnabledServicesForProjectSpy).toHaveBeenCalledTimes(1);
  });

  test('should return "main" project enabled service names if "target" project specified in config is equal to "main" project', async () => {
    const mockConfig = getMockIntegrationConfig({
      projectId: 'j1-gc-integration-dev-v2',
    });

    const mockEnabledServiceNames: string[] = [
      'pubsub.googleapis.com',
      'appengine.googleapis.com',
      'dns.googleapis.com',
    ];

    const collectEnabledServicesForProjectSpy = jest
      .spyOn(serviceUsage, 'collectEnabledServicesForProject')
      .mockResolvedValue(Promise.resolve(mockEnabledServiceNames));

    expect(await enablement.getEnabledServiceNames(mockConfig)).toEqual(
      mockEnabledServiceNames,
    );
    expect(collectEnabledServicesForProjectSpy).toHaveBeenCalledTimes(1);
  });

  test('should return enabled service names intersection between "main" and "target" projects if "target" project specified in config', async () => {
    const mockConfig = getMockIntegrationConfig({
      projectId: 'my-target-project-id',
    });

    const mainMockEnabledServiceNames: string[] = [
      'pubsub.googleapis.com',
      'appengine.googleapis.com',
      'dns.googleapis.com',
    ];

    const targetMockEnabledServiceNames: string[] = [
      'appengine.googleapis.com',
    ];

    const collectEnabledServicesForProjectSpy = jest
      .spyOn(serviceUsage, 'collectEnabledServicesForProject')
      .mockResolvedValue(Promise.resolve(mainMockEnabledServiceNames))
      .mockResolvedValue(Promise.resolve(targetMockEnabledServiceNames));

    expect(await enablement.getEnabledServiceNames(mockConfig)).toEqual([
      'appengine.googleapis.com',
    ]);

    expect(collectEnabledServicesForProjectSpy).toHaveBeenCalledTimes(2);
  });
});
