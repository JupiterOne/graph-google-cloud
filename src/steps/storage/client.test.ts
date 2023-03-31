import { storage_v1 } from 'googleapis';

describe('#createCloudFunctionClientMapper', () => {
  test('should call callback for each function returned in iteration', async () => {
    const callbackFn = jest.fn().mockResolvedValue(Promise.resolve());
    const bucket1: storage_v1.Schema$Bucket = { name: 'b1' };
    const bucket2: storage_v1.Schema$Bucket = { name: 'b2' };

    const map = async (data: storage_v1.Schema$Buckets) => {
      for (const bucket of data.items || []) {
        await callbackFn(bucket);
      }
    };
    await map({
      items: [bucket1, bucket2],
    } as storage_v1.Schema$Buckets);

    expect(callbackFn).toHaveBeenCalledTimes(2);
    expect(callbackFn).toHaveBeenNthCalledWith(1, bucket1);
    expect(callbackFn).toHaveBeenNthCalledWith(2, bucket2);
  });

  test('should allow for undefined "functions" to be returned in the list', async () => {
    const callbackFn = jest.fn().mockResolvedValue(Promise.resolve());

    const map = async (data: storage_v1.Schema$Buckets) => {
      for (const bucket of data.items || []) {
        await callbackFn(bucket);
      }
    };
    await map({} as storage_v1.Schema$Buckets);

    expect(callbackFn).not.toHaveBeenCalled();
  });
});
