import {
  createBigQueryDatasetEntity,
  createBigQueryModelEntity,
  createBigQueryTableEntity,
} from './converters';
import {
  getMockBigQueryDataset,
  getMockBigQueryModel,
  getMockBigQueryTable,
} from '../../../test/mocks';
import { DEFAULT_INTEGRATION_CONFIG_PROJECT_ID } from '../../../test/config';

describe('#createBigQueryDatasetEntity', () => {
  test('should convert to entity', () => {
    expect(
      createBigQueryDatasetEntity(getMockBigQueryDataset()),
    ).toMatchSnapshot();
  });

  test('should convert to entity with public param set to on', () => {
    expect(
      createBigQueryDatasetEntity(
        getMockBigQueryDataset({
          access: [
            { role: 'WRITER', specialGroup: 'allAuthenticatedUsers' },
            { role: 'WRITER', specialGroup: 'projectWriters' },
            { role: 'OWNER', specialGroup: 'projectOwners' },
            { role: 'OWNER', userByEmail: 'admin@creativice.com' },
            { role: 'READER', iamMember: 'allUsers' },
            { role: 'READER', specialGroup: 'projectReaders' },
          ],
        }),
      ),
    ).toMatchSnapshot();
  });
});

describe('#createBigQueryModelEntity', () => {
  test('should convert to entity', () => {
    expect(
      createBigQueryModelEntity(
        getMockBigQueryModel(),
        'j1-gc-integration-dev-v2:test_big_query_dataset',
      ),
    ).toMatchSnapshot();
  });
});

describe('#createBigQueryTableEntity', () => {
  test('should convert to entity', () => {
    expect(
      createBigQueryTableEntity({
        data: getMockBigQueryTable(),
        projectId: DEFAULT_INTEGRATION_CONFIG_PROJECT_ID,
        isPublic: false,
        kmsKeyName: 'example-kms-key-name',
      }),
    ).toMatchSnapshot();
  });
});
