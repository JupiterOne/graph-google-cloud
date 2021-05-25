import {
  createBigQueryDatasetEntity,
  createBigQueryTableEntity,
} from './converters';
import {
  getMockBigQueryDataset,
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

describe('#createBigQueryTableEntity', () => {
  test('should convert to entity', () => {
    expect(
      createBigQueryTableEntity({
        data: getMockBigQueryTable(),
        projectId: DEFAULT_INTEGRATION_CONFIG_PROJECT_ID,
        isPublic: false,
      }),
    ).toMatchSnapshot();
  });
});
