import { serviceResourceNameToServiceName } from './client';

describe('#serviceResourceNameToServiceName', () => {
  test('should convert service resource name to short service name', () => {
    expect(
      serviceResourceNameToServiceName(
        'projects/my-proj/services/appengine.googleapis.com',
      ),
    ).toEqual('appengine.googleapis.com');
  });
});
