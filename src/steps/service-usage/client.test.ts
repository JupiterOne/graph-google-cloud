import { serviceusage_v1 } from 'googleapis';
import { createServiceMapper } from './client';
import { ServiceUsageName } from '../../google-cloud/types';

describe('#createServiceMapper', () => {
  test('should call callback for each function returned in iteration', async () => {
    const callbackFn = jest.fn().mockResolvedValue(Promise.resolve());
    const service1: serviceusage_v1.Schema$Api = {
      name: ServiceUsageName.CLOUD_FUNCTIONS,
    };
    const service2: serviceusage_v1.Schema$Api = {
      name: ServiceUsageName.STORAGE,
    };

    const map = createServiceMapper(callbackFn);
    await map({
      services: [service1, service2],
    } as serviceusage_v1.Schema$ListServicesResponse);

    expect(callbackFn).toHaveBeenCalledTimes(2);
    expect(callbackFn).toHaveBeenNthCalledWith(1, service1);
    expect(callbackFn).toHaveBeenNthCalledWith(2, service2);
  });

  test('should allow for undefined "functions" to be returned in the list', async () => {
    const callbackFn = jest.fn().mockResolvedValue(Promise.resolve());

    const map = createServiceMapper(callbackFn);
    await map({} as serviceusage_v1.Schema$ListServicesResponse);

    expect(callbackFn).not.toHaveBeenCalled();
  });
});
