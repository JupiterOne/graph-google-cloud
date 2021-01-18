import { bigquery_v2 } from 'googleapis';
import { createIntegrationEntity } from '@jupiterone/integration-sdk-core';
import {
  CLOUD_BIG_QUERY_DATASET_ENTITY_CLASS,
  CLOUD_BIG_QUERY_DATASET_ENTITY_TYPE,
} from './constants';
import { isMemberPublic } from '../../utils/iam';

interface DatasetAccess {
  domain?: string;
  groupByEmail?: string;
  iamMember?: string;
  role?: string;
  specialGroup?: string;
  userByEmail?: string;
}

// 7.1 Ensure that BigQuery datasets are not anonymously or publicly accessible (Scored)
function isBigQueryDatasetPublicAccess(accessList: DatasetAccess[]): boolean {
  for (const access of accessList) {
    const value =
      access.groupByEmail ||
      access.userByEmail ||
      access.iamMember ||
      access.specialGroup ||
      '';
    if (isMemberPublic(value)) {
      return true;
    }
  }

  return false;
}

export function createBigQueryDatasetEntity(
  dataset: bigquery_v2.Schema$Dataset,
) {
  return createIntegrationEntity({
    entityData: {
      source: dataset,
      assign: {
        _key: dataset.id as string,
        _type: CLOUD_BIG_QUERY_DATASET_ENTITY_TYPE,
        _class: CLOUD_BIG_QUERY_DATASET_ENTITY_CLASS,
        name: dataset.datasetReference?.datasetId,
        public: isBigQueryDatasetPublicAccess(dataset.access || []),
        location: dataset.location,
        webLink: dataset.selfLink as string,
        // Encrypted by default
        encrypted: true,
        // Rely on the value of the classification tag
        classification: null,
        etag: dataset.etag,
      },
    },
  });
}
