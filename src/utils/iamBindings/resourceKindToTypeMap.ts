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
import {
  ENTITY_TYPE_BIG_TABLE_APP_PROFILE,
  ENTITY_TYPE_BIG_TABLE_BACKUP,
  ENTITY_TYPE_BIG_TABLE_CLUSTER,
  ENTITY_TYPE_BIG_TABLE_INSTANCE,
  ENTITY_TYPE_BIG_TABLE_TABLE,
} from '../../steps/big-table/constants';
import { ENTITY_TYPE_BILLING_ACCOUNT } from '../../steps/cloud-billing/constants';
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
  CONTAINER_CLUSTER_ENTITY_TYPE,
  CONTAINER_NODE_POOL_ENTITY_TYPE,
} from '../../steps/containers';
import { ENTITY_TYPE_DATAPROC_CLUSTER } from '../../steps/dataproc/constants';
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
import { ENTITY_TYPE_MEMCACHE_INSTANCE } from '../../steps/memcache/constants';
import { MONITORING_ALERT_POLICY_TYPE } from '../../steps/monitoring/constants';
import { PrivatecaEntities } from '../../steps/privateca/constants';
import {
  ENTITY_TYPE_PUBSUB_TOPIC,
  ENTITY_TYPE_PUBSUB_SUBSCRIPTION,
} from '../../steps/pub-sub/constants';
import { ENTITY_TYPE_REDIS_INSTANCE } from '../../steps/redis/constants';
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
import {
  SQL_ADMIN_MYSQL_INSTANCE_ENTITY_TYPE,
  SQL_ADMIN_POSTGRES_INSTANCE_ENTITY_TYPE,
  SQL_ADMIN_SQL_SERVER_INSTANCE_ENTITY_TYPE,
} from '../../steps/sql-admin';
import { StorageEntitiesSpec } from '../../steps/storage/constants';

// Indicates JupiterOne is not ingesting that resource yet.
export const NONE = 'NO_DIRECT_J1_RESOURCE_YET';

/**
 * NOTE: Because a kind of "sqladmin.googleapis.com/Instance" can be a
 * "google_sql_mysql_instance", "google_sql_postgres_instance", or
 * "google_sql_sql_server_instance", we assign it to
 * "google_sql_sql_server_instance" because they all have the same
 * key generation funciton.
 */
export const SQL_ENTITY_TYPE = SQL_ADMIN_MYSQL_INSTANCE_ENTITY_TYPE;

export const J1_TYPES_WITHOUT_A_UNIQUE_KIND = [
  SQL_ADMIN_MYSQL_INSTANCE_ENTITY_TYPE,
  SQL_ADMIN_POSTGRES_INSTANCE_ENTITY_TYPE,
  SQL_ADMIN_SQL_SERVER_INSTANCE_ENTITY_TYPE,
];

/**
 * A map of all existing Google Cloud resources to their associated JupiterOne type
 */
export const GOOGLE_RESOURCE_KIND_TO_J1_TYPE_MAP: {
  [key: string]: string;
} = {
  'cloudfunctions.googleapis.com/CloudFunction': CLOUD_FUNCTION_ENTITY_TYPE,
  'cloudresourcemanager.googleapis.com/Organization': ORGANIZATION_ENTITY_TYPE,
  'cloudresourcemanager.googleapis.com/Folder': FOLDER_ENTITY_TYPE,
  'cloudresourcemanager.googleapis.com/Project': PROJECT_ENTITY_TYPE,
  'run.googleapis.com/DomainMapping': NONE,
  'run.googleapis.com/Revision': NONE,
  'run.googleapis.com/Service': ENTITY_TYPE_CLOUD_RUN_SERVICE,
  'compute.googleapis.com/Address': NONE,
  'compute.googleapis.com/GlobalAddress': NONE,
  'compute.googleapis.com/Autoscaler': NONE,
  'compute.googleapis.com/BackendBucket': ENTITY_TYPE_COMPUTE_BACKEND_BUCKET,
  'compute.googleapis.com/BackendService': ENTITY_TYPE_COMPUTE_BACKEND_SERVICE,
  'compute.googleapis.com/Commitment': NONE,
  'compute.googleapis.com/Disk': ENTITY_TYPE_COMPUTE_DISK,
  'compute.googleapis.com/ExternalVpnGateway': NONE,
  'compute.googleapis.com/Firewall': ENTITY_TYPE_COMPUTE_FIREWALL,
  'compute.googleapis.com/ForwardingRule': NONE,
  'compute.googleapis.com/HealthCheck': ENTITY_TYPE_COMPUTE_HEALTH_CHECK,
  'compute.googleapis.com/HttpHealthCheck': NONE,
  'compute.googleapis.com/HttpsHealthCheck': NONE,
  'compute.googleapis.com/Image': ENTITY_TYPE_COMPUTE_IMAGE,
  'compute.googleapis.com/Instance': ENTITY_TYPE_COMPUTE_INSTANCE,
  'compute.googleapis.com/InstanceGroup': ENTITY_TYPE_COMPUTE_INSTANCE_GROUP,
  'compute.googleapis.com/InstanceGroupManager': NONE,
  'compute.googleapis.com/InstanceTemplate': NONE,
  'compute.googleapis.com/Interconnect': NONE,
  'compute.googleapis.com/InterconnectAttachment': NONE,
  'compute.googleapis.com/License': NONE,
  'compute.googleapis.com/Network': ENTITY_TYPE_COMPUTE_NETWORK,
  'compute.googleapis.com/NetworkEndpointGroup': NONE,
  'compute.googleapis.com/NodeGroup': NONE,
  'compute.googleapis.com/NodeTemplate': NONE,
  'compute.googleapis.com/Project': ENTITY_TYPE_COMPUTE_PROJECT,
  'compute.googleapis.com/PacketMirroring': NONE,
  'compute.googleapis.com/RegionDisk': NONE,
  'compute.googleapis.com/Reservation': NONE,
  'compute.googleapis.com/ResourcePolicy': NONE,
  'compute.googleapis.com/Route': NONE,
  'compute.googleapis.com/Router': NONE,
  'compute.googleapis.com/SecurityPolicy': NONE,
  'compute.googleapis.com/Snapshot': ENTITY_TYPE_COMPUTE_SNAPSHOT,
  'compute.googleapis.com/SslCertificate': NONE,
  'compute.googleapis.com/SslPolicy': ENTITY_TYPE_COMPUTE_SSL_POLICY,
  'compute.googleapis.com/Subnetwork': ENTITY_TYPE_COMPUTE_SUBNETWORK,
  'compute.googleapis.com/TargetHttpProxy':
    ENTITY_TYPE_COMPUTE_TARGET_HTTP_PROXY,
  'compute.googleapis.com/TargetHttpsProxy':
    ENTITY_TYPE_COMPUTE_TARGET_HTTPS_PROXY,
  'compute.googleapis.com/TargetInstance': NONE,
  'compute.googleapis.com/TargetPool': NONE,
  'compute.googleapis.com/TargetTcpProxy': NONE,
  'compute.googleapis.com/TargetSslProxy': ENTITY_TYPE_COMPUTE_TARGET_SSL_PROXY,
  'compute.googleapis.com/TargetVpnGateway': NONE,
  'compute.googleapis.com/UrlMap': ENTITY_TYPE_COMPUTE_LOAD_BALANCER,
  'compute.googleapis.com/VpnGateway': NONE,
  'compute.googleapis.com/VpnTunnel': NONE,
  'appengine.googleapis.com/Application': ENTITY_TYPE_APP_ENGINE_APPLICATION,
  'appengine.googleapis.com/Service': ENTITY_TYPE_APP_ENGINE_SERVICE,
  'appengine.googleapis.com/Version': ENTITY_TYPE_APP_ENGINE_VERSION,
  'cloudbilling.googleapis.com/BillingAccount': ENTITY_TYPE_BILLING_ACCOUNT,
  'storage.googleapis.com/Bucket': StorageEntitiesSpec.STORAGE_BUCKET._type,
  'osconfig.googleapis.com/PatchDeployment': NONE,
  'dns.googleapis.com/ManagedZone': DNS_MANAGED_ZONE_ENTITY_TYPE,
  'dns.googleapis.com/Policy': DNS_POLICY_ENTITY_TYPE,
  'spanner.googleapis.com/Instance': ENTITY_TYPE_SPANNER_INSTANCE,
  'spanner.googleapis.com/Database': ENTITY_TYPE_SPANNER_INSTANCE_DATABASE,
  'spanner.googleapis.com/Backup': NONE,
  'bigquery.googleapis.com/Dataset': BIG_QUERY_DATASET_ENTITY_TYPE,
  'bigquery.googleapis.com/Table': BIG_QUERY_TABLE_ENTITY_TYPE,
  'iam.googleapis.com/Role': IAM_ROLE_ENTITY_TYPE,
  'iam.googleapis.com/ServiceAccount': IAM_SERVICE_ACCOUNT_ENTITY_TYPE,
  'iam.googleapis.com/ServiceAccountKey': IAM_SERVICE_ACCOUNT_KEY_ENTITY_TYPE,
  'pubsub.googleapis.com/Topic': ENTITY_TYPE_PUBSUB_TOPIC,
  'pubsub.googleapis.com/Subscription': ENTITY_TYPE_PUBSUB_SUBSCRIPTION,
  'pubsub.googleapis.com/Snapshot': NONE,
  'dataproc.googleapis.com/Cluster': ENTITY_TYPE_DATAPROC_CLUSTER,
  'dataproc.googleapis.com/Job': NONE,
  'cloudkms.googleapis.com/KeyRing': ENTITY_TYPE_KMS_KEY_RING,
  'cloudkms.googleapis.com/CryptoKey': ENTITY_TYPE_KMS_KEY,
  'cloudkms.googleapis.com/CryptoKeyVersion': NONE,
  'cloudkms.googleapis.com/ImportJob': NONE,
  'container.googleapis.com/Cluster': CONTAINER_CLUSTER_ENTITY_TYPE,
  'container.googleapis.com/NodePool': CONTAINER_NODE_POOL_ENTITY_TYPE,
  'bigtableadmin.googleapis.com/AppProfile': ENTITY_TYPE_BIG_TABLE_APP_PROFILE,
  'bigtableadmin.googleapis.com/Backup': ENTITY_TYPE_BIG_TABLE_BACKUP,
  'bigtableadmin.googleapis.com/Cluster': ENTITY_TYPE_BIG_TABLE_CLUSTER,
  'bigtableadmin.googleapis.com/Instance': ENTITY_TYPE_BIG_TABLE_INSTANCE,
  'bigtableadmin.googleapis.com/Table': ENTITY_TYPE_BIG_TABLE_TABLE,
  'k8s.io/Node	//': NONE,
  'k8s.io/Pod	//': NONE,
  'k8s.io/Namespace	//': NONE,
  'k8s.io/Service	//': NONE,
  'rbac.authorization.k8s.io': NONE,
  'extensions.k8s.io/Ingress': NONE,
  'networking.k8s.io/Ingress': NONE,
  'networking.k8s.io/Networkpolicy': NONE,
  'serviceusage.googleapis.com/Service': ServiceUsageEntities.API_SERVICE._type,
  'datafusion.googleapis.com/Instance': NONE,
  'logging.googleapis.com/LogBucket': NONE,
  'logging.googleapis.com/LogSink': LOGGING_PROJECT_SINK_ENTITY_TYPE,
  'logging.googleapis.com/LogMetric': LOGGING_METRIC_ENTITY_TYPE,
  'networkmanagement.googleapis.com/ConnectivityTest': NONE,
  'managedidentities.googleapis.com/Domain': NONE,
  'privateca.googleapis.com/CaPool': NONE,
  'privateca.googleapis.com/CertificateAuthority':
    PrivatecaEntities.PRIVATE_CA_CERTIFICATE_AUTHORITY._type,
  'privateca.googleapis.com/CertificateRevocationList': NONE,
  'privateca.googleapis.com/CertificateTemplate': NONE,
  'dataflow.googleapis.com/Job': NONE,
  'gameservices.googleapis.com/GameServerCluster': NONE,
  'gameservices.googleapis.com/Realm': NONE,
  'gameservices.googleapis.com/GameServerConfig': NONE,
  'gameservices.googleapis.com/GameServerDeployment': NONE,
  'gkehub.googleapis.com/Membership': NONE,
  'secretmanager.googleapis.com/Secret': NONE,
  'secretmanager.googleapis.com/SecretVersion': NONE,
  'tpu.googleapis.com/Node': NONE,
  'composer.googleapis.com/Environment': NONE,
  'sqladmin.googleapis.com/Instance': SQL_ENTITY_TYPE,
  'file.googleapis.com/Instance': NONE,
  'file.googleapis.com/Backup': NONE,
  'servicedirectory.googleapis.com/Namespace': NONE,
  'assuredworkloads.googleapis.com/Workload': NONE,
  'artifactregistry.googleapis.com/DockerImage': NONE,
  'artifactregistry.googleapis.com/Repository': NONE,
  'apigateway.googleapis.com/Api': ENTITY_TYPE_API_GATEWAY_API,
  'apigateway.googleapis.com/ApiConfig': ENTITY_TYPE_API_GATEWAY_API_CONFIG,
  'apigateway.googleapis.com/Gateway': ENTITY_TYPE_API_GATEWAY_GATEWAY,
  'redis.googleapis.com/Instance': ENTITY_TYPE_REDIS_INSTANCE,
  'memcache.googleapis.com/Instance': ENTITY_TYPE_MEMCACHE_INSTANCE,
  'documentai.googleapis.com/HumanReviewConfig': NONE,
  'documentai.googleapis.com/LabelerPool': NONE,
  'documentai.googleapis.com/Processor': NONE,
  'aiplatform.googleapis.com/BatchPredictionJob': NONE,
  'aiplatform.googleapis.com/CustomJob': NONE,
  'aiplatform.googleapis.com/DataLabelingJob': NONE,
  'aiplatform.googleapis.com/Dataset': NONE,
  'aiplatform.googleapis.com/Endpoint': NONE,
  'aiplatform.googleapis.com/HyperparameterTuningJob': NONE,
  'aiplatform.googleapis.com/Model': NONE,
  'aiplatform.googleapis.com/SpecialistPool': NONE,
  'aiplatform.googleapis.com/TrainingPipeline': NONE,
  'monitoring.googleapis.com/AlertPolicy': MONITORING_ALERT_POLICY_TYPE,
  'vpcaccess.googleapis.com/Connector': NONE,
};
