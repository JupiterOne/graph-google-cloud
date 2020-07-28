import { cloudfunctions_v1 } from 'googleapis';
import { createCloudFunctionClientMapper } from './client';

describe('#createCloudFunctionClientMapper', () => {
  test('should call callback for each function returned in iteration', async () => {
    const callbackFn = jest.fn().mockResolvedValue(Promise.resolve());
    const function1: cloudfunctions_v1.Schema$CloudFunction = { name: 'fn1' };
    const function2: cloudfunctions_v1.Schema$CloudFunction = { name: 'fn2' };

    const map = createCloudFunctionClientMapper(callbackFn);
    await map({
      functions: [function1, function2],
    } as cloudfunctions_v1.Schema$ListFunctionsResponse);

    expect(callbackFn).toHaveBeenCalledTimes(2);
    expect(callbackFn).toHaveBeenNthCalledWith(1, function1);
    expect(callbackFn).toHaveBeenNthCalledWith(2, function2);
  });

  test('should allow for undefined "functions" to be returned in the list', async () => {
    const callbackFn = jest.fn().mockResolvedValue(Promise.resolve());

    const map = createCloudFunctionClientMapper(callbackFn);
    await map({} as cloudfunctions_v1.Schema$ListFunctionsResponse);

    expect(callbackFn).not.toHaveBeenCalled();
  });
});
