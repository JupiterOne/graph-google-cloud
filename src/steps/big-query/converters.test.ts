import { createBigQueryDatasetEntity } from './converters';
import { getMockBigQueryDataset } from '../../../test/mocks';

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
