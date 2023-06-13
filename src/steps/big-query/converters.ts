import { bigquery_v2 } from 'googleapis';
import {
  GoogleCloudResourceData,
  createGoogleCloudIntegrationEntity,
} from '../../utils/entity';
import {
  BIG_QUERY_DATASET_ENTITY_CLASS,
  BIG_QUERY_DATASET_ENTITY_TYPE,
  BIG_QUERY_TABLE_ENTITY_CLASS,
  BIG_QUERY_TABLE_ENTITY_TYPE,
  BIG_QUERY_MODEL_ENTITY_TYPE,
  BIG_QUERY_MODEL_ENTITY_CLASS,
} from './constants';
import { isMemberPublic } from '../../utils/iam';
import { BigQueryTable } from './client';
import { getGoogleCloudConsoleWebLink } from '../../utils/url';

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

export function createBigQueryDatasetEntity(data: bigquery_v2.Schema$Dataset) {
  return createGoogleCloudIntegrationEntity(data, {
    entityData: {
      source: data as GoogleCloudResourceData,
      assign: {
        _key: data.id as string,
        _type: BIG_QUERY_DATASET_ENTITY_TYPE,
        _class: BIG_QUERY_DATASET_ENTITY_CLASS,
        name: data.datasetReference?.datasetId,
        description: data.description,
        public: isBigQueryDatasetPublicAccess(data.access || []),
        // 7.3 Ensure that a Default Customer-managed encryption key (CMEK) is specified for all BigQuery Data Sets
        kmsKeyName: data.defaultEncryptionConfiguration?.kmsKeyName,
        location: data.location,
        encrypted: true,
        classification: null,
        etag: data.etag,
        createdOn: data.creationTime
          ? parseInt(data.creationTime, 10)
          : undefined,
        updatedOn: data.lastModifiedTime
          ? parseInt(data.lastModifiedTime, 10)
          : undefined,
        webLink: getGoogleCloudConsoleWebLink(
          `/bigquery?project=${data.datasetReference?.projectId}&d=${data.datasetReference?.datasetId}&p=${data.datasetReference?.projectId}&page=dataset`,
        ),
      },
    },
  });
}

function getBigQueryModelKey(datasetId: string, modelId: string) {
  return `${datasetId}:${modelId}`;
}

export function createBigQueryModelEntity(
  data: bigquery_v2.Schema$Model,
  datasetId: string,
) {
  return createGoogleCloudIntegrationEntity(data, {
    entityData: {
      source: data,
      assign: {
        _key: getBigQueryModelKey(
          datasetId,
          data.modelReference?.modelId as string,
        ),
        _type: BIG_QUERY_MODEL_ENTITY_TYPE,
        _class: BIG_QUERY_MODEL_ENTITY_CLASS,
        name: data.modelReference?.modelId,
        displayName: data.friendlyName!,
        description: data.description,
        etag: data.etag,
        modelType: data.modelType,
        location: data.location,
        createdOn: data.creationTime
          ? parseInt(data.creationTime, 10)
          : undefined,
        updatedOn: data.lastModifiedTime
          ? parseInt(data.lastModifiedTime, 10)
          : undefined,
        expirationTime: data.expirationTime
          ? parseInt(data.expirationTime, 10)
          : undefined,
        classification: null,
        webLink: getGoogleCloudConsoleWebLink(
          `/bigquery?project=${data.modelReference?.projectId}&d=${data.modelReference?.datasetId}&m=${data.modelReference?.modelId}&p=${data.modelReference?.projectId}&page=model`,
        ),
      },
    },
  });
}

export function createBigQueryTableEntity({
  data,
  projectId,
  isPublic,
  kmsKeyName,
}: {
  data: BigQueryTable;
  projectId: string;
  isPublic: boolean | undefined;
  kmsKeyName: string | undefined;
}) {
  return createGoogleCloudIntegrationEntity(data, {
    entityData: {
      source: data,
      assign: {
        _key: data.id as string,
        _type: BIG_QUERY_TABLE_ENTITY_TYPE,
        _class: BIG_QUERY_TABLE_ENTITY_CLASS,
        name: data.tableReference?.tableId,
        public: isPublic,
        type: data.type,
        friendlyName: data.friendlyName,
        classification: null,
        // 7.2 Ensure that all BigQuery Tables are encrypted with Customer-managed encryption key (CMEK)
        kmsKeyName,
        webLink: getGoogleCloudConsoleWebLink(
          `/bigquery?project=${projectId}&d=${data.tableReference?.datasetId}&p=${projectId}&t=${data.tableReference?.tableId}&page=table`,
        ),
        createdOn: data.creationTime
          ? parseInt(data.creationTime, 10)
          : undefined,
        expirationTime: data.expirationTime
          ? parseInt(data.expirationTime, 10)
          : undefined,
      },
    },
  });
}
