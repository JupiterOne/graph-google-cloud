import { generateEntityKey } from './generateKeys';

describe('#generateEntityKey', () => {
  test('should generate entity key using type and id', () => {
    expect(
      generateEntityKey({
        type: 'google_cloud_function',
        id: 'abc',
      }),
    ).toEqual('google_cloud_function_abc');
  });

  test('should throw error if attempting to generate entity key with undefined id', () => {
    expect(() =>
      generateEntityKey({
        type: 'google_cloud_function',
        id: undefined,
      }),
    ).toThrowError('Cannot generate entity key with "undefined" id');
  });
});
