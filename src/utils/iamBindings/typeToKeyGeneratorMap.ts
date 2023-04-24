import {
  ENTITY_TYPE_API_GATEWAY_API,
  ENTITY_TYPE_API_GATEWAY_API_CONFIG,
  ENTITY_TYPE_API_GATEWAY_GATEWAY,
} from '../../steps/api-gateway/constants';
import {
  ENTITY_TYPE_APP_ENGINE_APPLICATION,
  ENTITY_TYPE_APP_ENGINE_SERVICE,
  ENTITY_TYPE_APP_ENGINE_VERSION,
} from '../../steps/app-engine/constants';
import {
  BIG_QUERY_DATASET_ENTITY_TYPE,
  BIG_QUERY_TABLE_ENTITY_TYPE,
} from '../../steps/big-query';
import { ENTITY_TYPE_CLOUD_RUN_SERVICE } from '../../steps/cloud-run/constants';
import {
  ENTITY_TYPE_COMPUTE_BACKEND_BUCKET,
  ENTITY_TYPE_COMPUTE_BACKEND_SERVICE,
  ENTITY_TYPE_COMPUTE_DISK,
  ENTITY_TYPE_COMPUTE_FIREWALL,
  ENTITY_TYPE_COMPUTE_HEALTH_CHECK,
  ENTITY_TYPE_COMPUTE_IMAGE,
  ENTITY_TYPE_COMPUTE_INSTANCE,
  ENTITY_TYPE_COMPUTE_INSTANCE_GROUP,
  ENTITY_TYPE_COMPUTE_NETWORK,
  ENTITY_TYPE_COMPUTE_PROJECT,
  ENTITY_TYPE_COMPUTE_SNAPSHOT,
  ENTITY_TYPE_COMPUTE_SSL_POLICY,
  ENTITY_TYPE_COMPUTE_SUBNETWORK,
  ENTITY_TYPE_COMPUTE_TARGET_HTTP_PROXY,
  ENTITY_TYPE_COMPUTE_TARGET_HTTPS_PROXY,
  ENTITY_TYPE_COMPUTE_TARGET_SSL_PROXY,
  ENTITY_TYPE_COMPUTE_LOAD_BALANCER,
} from '../../steps/compute';
import {
  getComputeDiskKey,
  getComputeSnapshotKey,
} from '../../steps/compute/converters';
import {
  CONTAINER_CLUSTER_ENTITY_TYPE,
  CONTAINER_NODE_POOL_ENTITY_TYPE,
} from '../../steps/containers';
import { getContainerClusterKey } from '../../steps/containers/converters';
import {
  DNS_MANAGED_ZONE_ENTITY_TYPE,
  DNS_POLICY_ENTITY_TYPE,
} from '../../steps/dns/constants';
import { CLOUD_FUNCTION_ENTITY_TYPE } from '../../steps/functions';
import {
  IAM_ROLE_ENTITY_TYPE,
  IAM_SERVICE_ACCOUNT_ENTITY_TYPE,
  IAM_SERVICE_ACCOUNT_KEY_ENTITY_TYPE,
} from '../../steps/iam';
import { ENTITY_TYPE_KMS_KEY_RING, ENTITY_TYPE_KMS_KEY } from '../../steps/kms';
import {
  LOGGING_PROJECT_SINK_ENTITY_TYPE,
  LOGGING_METRIC_ENTITY_TYPE,
} from '../../steps/logging/constants';
import { getLogingProjectSinkId } from '../../steps/logging/converters';
import { ENTITY_TYPE_MEMCACHE_INSTANCE } from '../../steps/memcache/constants';
import { getMemcacheKey } from '../../steps/memcache/converter';
import { MONITORING_ALERT_POLICY_TYPE } from '../../steps/monitoring/constants';
import {
  ENTITY_TYPE_PUBSUB_TOPIC,
  ENTITY_TYPE_PUBSUB_SUBSCRIPTION,
} from '../../steps/pub-sub/constants';
import { ENTITY_TYPE_REDIS_INSTANCE } from '../../steps/redis/constants';
import { getRedisKey } from '../../steps/redis/converter';
import {
  ORGANIZATION_ENTITY_TYPE,
  FOLDER_ENTITY_TYPE,
  PROJECT_ENTITY_TYPE,
} from '../../steps/resource-manager/constants';
import { ServiceUsageEntities } from '../../steps/service-usage/constants';
import {
  ENTITY_TYPE_SPANNER_INSTANCE,
  ENTITY_TYPE_SPANNER_INSTANCE_DATABASE,
} from '../../steps/spanner/constants';
import { getCloudStorageBucketKey } from '../../steps/storage/converters';
import { StepExecutionContext } from '@jupiterone/integration-sdk-core';
import { getProjectNameFromId } from '../jobState';
import { ENTITY_TYPE_DATAPROC_CLUSTER } from '../../steps/dataproc/constants';
import {
  ENTITY_TYPE_BIG_TABLE_APP_PROFILE,
  ENTITY_TYPE_BIG_TABLE_CLUSTER,
  ENTITY_TYPE_BIG_TABLE_INSTANCE,
  ENTITY_TYPE_BIG_TABLE_TABLE,
  ENTITY_TYPE_BIG_TABLE_BACKUP,
} from '../../steps/big-table/constants';
import { ENTITY_TYPE_BILLING_ACCOUNT } from '../../steps/cloud-billing/constants';
import {
  SQL_ADMIN_MYSQL_INSTANCE_ENTITY_TYPE,
  SQL_ADMIN_POSTGRES_INSTANCE_ENTITY_TYPE,
  SQL_ADMIN_SQL_SERVER_INSTANCE_ENTITY_TYPE,
} from '../../steps/sql-admin';
import { StorageEntitiesSpec } from '../../steps/storage/constants';
import { PrivatecaEntities } from '../../steps/privateca/constants';

/**
 * A map of JupiterOne types to a function which can generate their _key
 * properties given a Google Cloud resource identifier.
 */
export const J1_TYPE_TO_KEY_GENERATOR_MAP: {
  [key: string]: (
    googleResourceIdentifier: string,
    context?: StepExecutionContext,
  ) => string | undefined | Promise<string | undefined>;
} = {
  [CLOUD_FUNCTION_ENTITY_TYPE]: fullPathKeyMap,
  [ORGANIZATION_ENTITY_TYPE]: fullPathKeyMap,
  [FOLDER_ENTITY_TYPE]: fullPathKeyMap,
  [PROJECT_ENTITY_TYPE]: async (id: string, context?: StepExecutionContext) =>
    (await getProjectNameFromId(
      context!.jobState,
      finalIdentifierKeyMap(id),
    )) ?? finalIdentifierKeyMap(id),
  [ENTITY_TYPE_CLOUD_RUN_SERVICE]: fullPathKeyMap,
  [ENTITY_TYPE_COMPUTE_BACKEND_BUCKET]: selfLinkKeyMap,
  [ENTITY_TYPE_COMPUTE_BACKEND_SERVICE]: selfLinkKeyMap,
  [ENTITY_TYPE_COMPUTE_DISK]: customPrefixAndIdKeyMap(getComputeDiskKey),
  [ENTITY_TYPE_COMPUTE_FIREWALL]: selfLinkKeyMap,
  [ENTITY_TYPE_COMPUTE_HEALTH_CHECK]: selfLinkKeyMap,
  [ENTITY_TYPE_COMPUTE_IMAGE]: selfLinkKeyMap,
  [ENTITY_TYPE_COMPUTE_INSTANCE]: selfLinkKeyMap,
  [ENTITY_TYPE_COMPUTE_INSTANCE_GROUP]: selfLinkKeyMap,
  [ENTITY_TYPE_COMPUTE_NETWORK]: selfLinkKeyMap,
  [ENTITY_TYPE_COMPUTE_PROJECT]: selfLinkKeyMap,
  [ENTITY_TYPE_COMPUTE_SNAPSHOT]: customPrefixAndIdKeyMap(
    getComputeSnapshotKey,
  ),
  [ENTITY_TYPE_COMPUTE_SSL_POLICY]: selfLinkKeyMap,
  [ENTITY_TYPE_COMPUTE_SUBNETWORK]: selfLinkKeyMap,
  [ENTITY_TYPE_COMPUTE_TARGET_HTTP_PROXY]: selfLinkKeyMap,
  [ENTITY_TYPE_COMPUTE_TARGET_HTTPS_PROXY]: selfLinkKeyMap,
  [ENTITY_TYPE_COMPUTE_TARGET_SSL_PROXY]: selfLinkKeyMap,
  [ENTITY_TYPE_COMPUTE_LOAD_BALANCER]: selfLinkKeyMap,
  [ENTITY_TYPE_APP_ENGINE_APPLICATION]: fullPathKeyMap,
  [ENTITY_TYPE_APP_ENGINE_SERVICE]: fullPathKeyMap,
  [ENTITY_TYPE_APP_ENGINE_VERSION]: fullPathKeyMap,
  [StorageEntitiesSpec.STORAGE_BUCKET._type]: customPrefixAndIdKeyMap(
    getCloudStorageBucketKey,
  ),
  [DNS_MANAGED_ZONE_ENTITY_TYPE]: finalIdentifierKeyMap,
  [ENTITY_TYPE_SPANNER_INSTANCE]: fullPathKeyMap,
  [ENTITY_TYPE_SPANNER_INSTANCE_DATABASE]: fullPathKeyMap,
  [BIG_QUERY_DATASET_ENTITY_TYPE]: bigQueryIdentifier,
  [BIG_QUERY_TABLE_ENTITY_TYPE]: bigQueryIdentifier,
  [IAM_ROLE_ENTITY_TYPE]: impossible, // Key is different depending on if it is a custom or managed Role. I'm pretty sure this can not be the target of a role binding.
  [IAM_SERVICE_ACCOUNT_ENTITY_TYPE]: finalIdentifierKeyMap,
  [IAM_SERVICE_ACCOUNT_KEY_ENTITY_TYPE]: fullPathKeyMap,
  [ENTITY_TYPE_PUBSUB_TOPIC]: fullPathKeyMap,
  [ENTITY_TYPE_PUBSUB_SUBSCRIPTION]: fullPathKeyMap,
  [ENTITY_TYPE_KMS_KEY_RING]: fullPathKeyMap,
  [ENTITY_TYPE_KMS_KEY]: fullPathKeyMap,
  [CONTAINER_CLUSTER_ENTITY_TYPE]: customPrefixAndIdKeyMap(
    getContainerClusterKey,
  ),
  [CONTAINER_NODE_POOL_ENTITY_TYPE]: selfLinkKeyMap,
  [ServiceUsageEntities.API_SERVICE._type]: fullPathKeyMap,
  [LOGGING_PROJECT_SINK_ENTITY_TYPE]: customPrefixAndIdKeyMap(
    getLogingProjectSinkId,
  ),
  [LOGGING_METRIC_ENTITY_TYPE]: finalIdentifierKeyMap, // I'm pretty sure this can not be the target of a role binding.
  [PrivatecaEntities.PRIVATE_CA_CERTIFICATE_AUTHORITY._type]: fullPathKeyMap,
  [ENTITY_TYPE_API_GATEWAY_API]: fullPathKeyMap,
  [ENTITY_TYPE_API_GATEWAY_API_CONFIG]: fullPathKeyMap,
  [ENTITY_TYPE_API_GATEWAY_GATEWAY]: fullPathKeyMap,
  [ENTITY_TYPE_REDIS_INSTANCE]: customPrefixAndIdKeyMap(getRedisKey),
  [ENTITY_TYPE_MEMCACHE_INSTANCE]: customPrefixAndIdKeyMap(getMemcacheKey),
  [MONITORING_ALERT_POLICY_TYPE]: fullPathKeyMap,
  [ENTITY_TYPE_DATAPROC_CLUSTER]: fullPathKeyMap,
  [ENTITY_TYPE_BIG_TABLE_INSTANCE]: fullPathKeyMap,
  [ENTITY_TYPE_BIG_TABLE_CLUSTER]: fullPathKeyMap,
  [ENTITY_TYPE_BIG_TABLE_APP_PROFILE]: fullPathKeyMap,
  [ENTITY_TYPE_BIG_TABLE_TABLE]: fullPathKeyMap,
  [ENTITY_TYPE_BIG_TABLE_BACKUP]: fullPathKeyMap,
  [ENTITY_TYPE_BILLING_ACCOUNT]: fullPathKeyMap,
  [DNS_POLICY_ENTITY_TYPE]: fullPathKeyMap,
  [SQL_ADMIN_MYSQL_INSTANCE_ENTITY_TYPE]: selfLinkKeyMap,
  [SQL_ADMIN_POSTGRES_INSTANCE_ENTITY_TYPE]: selfLinkKeyMap,
  [SQL_ADMIN_SQL_SERVER_INSTANCE_ENTITY_TYPE]: selfLinkKeyMap,
};

// ex: projects/j1-gc-integration-dev-v3/locations/us-central1/functions/j1-gc-integration-dev-v3testfunction
function fullPathKeyMap(googleResourceIdentifier: string): string {
  const [_, __, _service, ...key] = googleResourceIdentifier.split('/');
  return key.join('/');
}

// ex: 2fab1cb9-fb5c-4f22-b364-979cebdc2820
// ex: 711888229551-compute@developer.gserviceaccount.com
function finalIdentifierKeyMap(googleResourceIdentifier: string): string {
  return googleResourceIdentifier.split('/').slice(-1)[0];
}

// ex: https://www.googleapis.com/compute/v1/projects/j1-gc-integration-dev-v3/global/backendServices/load-balancer-www-service
function selfLinkKeyMap(googleResourceIdentifier: string): string {
  const [_, __, service, ...key] = googleResourceIdentifier.split('/');
  const [shortenedServiceName, googleDomainName, topLevelDomainName] =
    service.split('.');
  return (
    'https://www.' +
    googleDomainName +
    '.' +
    topLevelDomainName +
    '/' +
    [shortenedServiceName, ...key].join('/')
  );
}

// ex: cloudrun_service:2fab1cb9-fb5c-4f22-b364-979cebdc2820
function customPrefixAndIdKeyMap(
  customKeyPrefixFunction: (uid: string) => string,
): (googleResourceIdentifier: string) => string {
  return (googleResourceIdentifier: string) =>
    customKeyPrefixFunction(finalIdentifierKeyMap(googleResourceIdentifier));
}

// ex: DATASET - j1-gc-integration-dev-v3:test_big_query_dataset
// ex: TABLE   - j1-gc-integration-dev-v3:test_big_query_dataset.Test Table
function bigQueryIdentifier(googleResourceIdentifier: string): string {
  const [
    _,
    __,
    _service,
    _literallyTheWordProjects,
    project,
    _literallyTheWordDatasets,
    dataset,
    _literallyTheWordTables,
    table,
  ] = googleResourceIdentifier.split('/');
  return project + ':' + dataset + (table ? '.' + table : '');
}

// Used when there is no way to generate the J1 entity key given only the googleResourceIdentifier
export function impossible(googleResourceIdentifier: string): undefined {
  return undefined;
}
