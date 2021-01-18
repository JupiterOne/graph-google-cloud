import { bigquery_v2 } from 'googleapis';
import { createBigQueryDatasetEntity } from './converters';

function getMockBigQueryDataset(
  partial?: Partial<bigquery_v2.Schema$Dataset>,
): bigquery_v2.Schema$Dataset {
  return {
    kind: 'bigquery#dataset',
    etag: 'Q1RJczpo1aoPRRoUJ1pElQ==',
    id: 'j1-gc-integration-dev-300716:test_big_query_dataset',
    selfLink:
      'https://www.googleapis.com/bigquery/v2/projects/j1-gc-integration-dev-300716/datasets/test_big_query_dataset',
    datasetReference: {
      datasetId: 'test_big_query_dataset',
      projectId: 'j1-gc-integration-dev-300716',
    },
    access: [
      { role: 'WRITER', specialGroup: 'projectWriters' },
      { role: 'OWNER', specialGroup: 'projectOwners' },
      { role: 'OWNER', userByEmail: 'admin@creativice.com' },
      { role: 'READER', specialGroup: 'projectReaders' },
    ],
    creationTime: '1610919167542',
    lastModifiedTime: '1610919344642',
    location: 'US',
    ...partial,
  };
}

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
