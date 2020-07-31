import { cloudfunctions_v1 } from 'googleapis';
import { createCloudFunctionEntity } from './converters';

function getMockCloudFunction(
  partial?: Partial<cloudfunctions_v1.Schema$CloudFunction>,
): cloudfunctions_v1.Schema$CloudFunction {
  return {
    name:
      'projects/j1-gc-integration-dev/locations/us-central1/functions/j1-gc-integration-devtestfunction',
    description: 'Test function',
    sourceArchiveUrl:
      'gs://j1-gc-integration-devcloudfunctions/http_trigger.zip',
    httpsTrigger: {
      url:
        'https://us-central1-j1-gc-integration-dev.cloudfunctions.net/j1-gc-integration-devtestfunction',
    },
    status: 'ACTIVE',
    entryPoint: 'handler',
    timeout: '60s',
    availableMemoryMb: 128,
    serviceAccountEmail: 'j1-gc-integration-dev@appspot.gserviceaccount.com',
    updateTime: '2020-07-28T18:35:52.821Z',
    versionId: '1',
    environmentVariables: {
      TEST_ENV_VAR: 'test-env-var-val',
    },
    runtime: 'nodejs10',
    ingressSettings: 'ALLOW_ALL',
    ...partial,
  };
}

describe('#createCloudFunctionEntity', () => {
  test('should convert to entity', () => {
    expect(createCloudFunctionEntity(getMockCloudFunction())).toMatchSnapshot();
  });
});
