import {
  ENTITY_TYPE_API_GATEWAY_API,
  ENTITY_TYPE_API_GATEWAY_API_CONFIG,
  ENTITY_TYPE_API_GATEWAY_GATEWAY,
} from './steps/api-gateway/constants';
import {
  ENTITY_TYPE_APP_ENGINE_APPLICATION,
  ENTITY_TYPE_APP_ENGINE_SERVICE,
  ENTITY_TYPE_APP_ENGINE_VERSION,
} from './steps/app-engine/constants';
import {
  BIG_QUERY_DATASET_ENTITY_TYPE,
  BIG_QUERY_TABLE_ENTITY_TYPE,
} from './steps/big-query';
import { ENTITY_TYPE_CLOUD_RUN_SERVICE } from './steps/cloud-run/constants';
import { getCloudRunServiceKey } from './steps/cloud-run/converters';
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
} from './steps/compute';
import {
  getComputeDiskKey,
  getComputeImageKey,
  getComputeSnapshotKey,
} from './steps/compute/converters';
import {
  CONTAINER_CLUSTER_ENTITY_TYPE,
  CONTAINER_NODE_POOL_ENTITY_TYPE,
} from './steps/containers';
import { DNS_MANAGED_ZONE_ENTITY_TYPE } from './steps/dns/constants';
import { CLOUD_FUNCTION_ENTITY_TYPE } from './steps/functions';
import {
  IAM_ROLE_ENTITY_TYPE,
  IAM_SERVICE_ACCOUNT_ENTITY_TYPE,
  IAM_SERVICE_ACCOUNT_KEY_ENTITY_TYPE,
} from './steps/iam';
import { ENTITY_TYPE_KMS_KEY_RING, ENTITY_TYPE_KMS_KEY } from './steps/kms';
import {
  LOGGING_PROJECT_SINK_ENTITY_TYPE,
  LOGGING_METRIC_ENTITY_TYPE,
} from './steps/logging/constants';
import { getLogingProjectSinkId } from './steps/logging/converters';
import { ENTITY_TYPE_MEMCACHE_INSTANCE } from './steps/memcache/constants';
import { getMemcacheKey } from './steps/memcache/converter';
import { MONITORING_ALERT_POLICY_TYPE } from './steps/monitoring/constants';
import { ENTITY_TYPE_PRIVATE_CA_CERTIFICATE_AUTHORITY } from './steps/privateca/constants';
import {
  ENTITY_TYPE_PUBSUB_TOPIC,
  ENTITY_TYPE_PUBSUB_SUBSCRIPTION,
} from './steps/pub-sub/constants';
import { ENTITY_TYPE_REDIS_INSTANCE } from './steps/redis/constants';
import { getRedisKey } from './steps/redis/converter';
import {
  FOLDER_ENTITY_TYPE,
  ORGANIZATION_ENTITY_TYPE,
  PROJECT_ENTITY_TYPE,
} from './steps/resource-manager';
import { API_SERVICE_ENTITY_TYPE } from './steps/service-usage';
import {
  ENTITY_TYPE_SPANNER_INSTANCE,
  ENTITY_TYPE_SPANNER_INSTANCE_DATABASE,
} from './steps/spanner/constants';
import {
  SQL_ADMIN_MYSQL_INSTANCE_ENTITY_TYPE,
  SQL_ADMIN_POSTGRES_INSTANCE_ENTITY_TYPE,
  SQL_ADMIN_SQL_SERVER_INSTANCE_ENTITY_TYPE,
} from './steps/sql-admin';
import { CLOUD_STORAGE_BUCKET_ENTITY_TYPE } from './steps/storage';
import { getCloudStorageBucketKey } from './steps/storage/converters';

/**
 * ANY_RESOURCE is used to describe any Google Cloud resource.
 * This includes all assets both ingested and not ingested with this integration
 */
export const ANY_RESOURCE = 'ANY_RESOURCE';

function checkResourceFormatMatch(
  googleResourceIdentifier: string,
  resourceFormat: string,
): boolean {
  const splitIdentifier = googleResourceIdentifier.split('/');
  const newFormat = resourceFormat
    .split('/')
    .map((f, i) => (f === f.toUpperCase() ? splitIdentifier[i] : f))
    .join('/');
  return newFormat === googleResourceIdentifier;
}

export function traverseCloudResourcesMap(
  googleResourceIdentifier: string,
): string | undefined {
  const match = Object.keys(CLOUD_RESOURCES_MAP).find((resourceFormat) =>
    checkResourceFormatMatch(googleResourceIdentifier, resourceFormat),
  );
  return match ? CLOUD_RESOURCES_MAP[match] : undefined;
}

/**
 * A map that goes from google cloud resource identifier structure to the cloud resource kind.
 * Taken directly from https://cloud.google.com/asset-inventory/docs/resource-name-format
 */
// This map is much more easier to read when all the values are on a single line, disabling prettier to prevent reformatting to two lines.
// prettier-ignore
export const CLOUD_RESOURCES_MAP: {
  [key: string]: string;
} = {
  '//cloudfunctions.googleapis.com/projects/PROJECT_ID/locations/LOCATION/functions/CLOUD_FUNCTION': 'cloudfunctions.googleapis.com/CloudFunction',
  '//cloudresourcemanager.googleapis.com/organizations/ORGANIZATION_NUMBER': 'cloudresourcemanager.googleapis.com/Organization',
  '//cloudresourcemanager.googleapis.com/folders/FOLDER_NUMBER': 'cloudresourcemanager.googleapis.com/Folder',
  '//cloudresourcemanager.googleapis.com/projects/PROJECT_NUMBER': 'cloudresourcemanager.googleapis.com/Project',
  '//cloudresourcemanager.googleapis.com/projects/PROJECT_ID': 'cloudresourcemanager.googleapis.com/Project',
  '//run.googleapis.com/projects/PROJECT_ID/locations/LOCATION/domainmappings/DOMAIN_MAPPING': 'run.googleapis.com/DomainMapping',
  '//run.googleapis.com/projects/PROJECT_ID/locations/LOCATION/revisions/REVISION': 'run.googleapis.com/Revision',
  '//run.googleapis.com/projects/PROJECT_ID/locations/LOCATION/services/SERVICE': 'run.googleapis.com/Service',
  '//compute.googleapis.com/projects/PROJECT_ID/regions/REGION/addresses/ADDRESS': 'compute.googleapis.com/Address',
  '//compute.googleapis.com/projects/PROJECT_ID/global/addresses/ADDRESS': 'compute.googleapis.com/GlobalAddress',
  '//compute.googleapis.com/projects/PROJECT_ID/zones/ZONE/autoscalers/AUTOSCALER': 'compute.googleapis.com/Autoscaler',
  '//compute.googleapis.com/projects/PROJECT_ID/regions/REGION/autoscalers/AUTOSCALER': 'compute.googleapis.com/Autoscaler',
  '//compute.googleapis.com/projects/PROJECT_ID/global/backendBuckets/BACKEND_BUCKET': 'compute.googleapis.com/BackendBucket',
  '//compute.googleapis.com/projects/PROJECT_ID/global/backendServices/BACKEND_SERVICE': 'compute.googleapis.com/BackendService',
  '//compute.googleapis.com/projects/PROJECT_ID/region/REGION/commitments/COMMITMENT': 'compute.googleapis.com/Commitment',
  '//compute.googleapis.com/projects/PROJECT_ID/zones/ZONE/disks/DISKS': 'compute.googleapis.com/Disk',
  '//compute.googleapis.com/projects/PROJECT_ID/global/externalVpnGateways/EXTERNAL_VPN_GATEWAY': 'compute.googleapis.com/ExternalVpnGateway',
  '//compute.googleapis.com/projects/PROJECT_ID/global/firewalls/FIREWALL': 'compute.googleapis.com/Firewall',
  '//compute.googleapis.com/projects/PROJECT_ID/regions/REGION/forwardingRules/FORWARDING_RULE': 'compute.googleapis.com/ForwardingRule',
  '//compute.googleapis.com/projects/PROJECT_ID/global/healthChecks/HEALTH_CHECK': 'compute.googleapis.com/HealthCheck',
  '//compute.googleapis.com/projects/PROJECT_ID/global/httpHealthChecks/HTTP_HEALTH_CHECK': 'compute.googleapis.com/HttpHealthCheck',
  '//compute.googleapis.com/projects/PROJECT_ID/global/httpsHealthChecks/HTTPS_HEALTH_CHECK': 'compute.googleapis.com/HttpsHealthCheck',
  '//compute.googleapis.com/projects/PROJECT_ID/global/images/IMAGE': 'compute.googleapis.com/Image',
  '//compute.googleapis.com/projects/PROJECT_ID/zones/ZONE/instances/INSTANCE': 'compute.googleapis.com/Instance',
  '//compute.googleapis.com/projects/PROJECT_ID/zones/ZONE/instanceGroups/INSTANCE_GROUP': 'compute.googleapis.com/InstanceGroup',
  '//compute.googleapis.com/projects/PROJECT_ID/regions/REGION/instanceGroups/INSTANCE_GROUP': 'compute.googleapis.com/InstanceGroup',
  '//compute.googleapis.com/projects/PROJECT_ID/zones/ZONE/instanceGroupManager/INSTANCE_GROUP_MANAGER': 'compute.googleapis.com/InstanceGroupManager',
  '//compute.googleapis.com/projects/PROJECT_ID/regions/REGION/instanceGroupManager/INSTANCE_GROUP_MANAGER': 'compute.googleapis.com/InstanceGroupManager',
  '//compute.googleapis.com/projects/PROJECT_ID/global/instanceTemplates/INSTANCE_TEMPLATE': 'compute.googleapis.com/InstanceTemplate',
  '//compute.googleapis.com/projects/PROJECT_ID/global/interconnects/INTERCONNECT': 'compute.googleapis.com/Interconnect',
  '//compute.googleapis.com/projects/PROJECT_ID/regions/interconnectAttachments/INTERCONNECT_ATTACHMENT': 'compute.googleapis.com/InterconnectAttachment',
  '//compute.googleapis.com/projects/PROJECT_ID/global/licenses/LICENSE': 'compute.googleapis.com/License',
  '//compute.googleapis.com/projects/PROJECT_ID/global/networks/NETWORK': 'compute.googleapis.com/Network',
  '//compute.googleapis.com/projects/PROJECT_ID/zones/ZONE/networkEndpointGroups/NETWORK_ENDPOINT_GROUP': 'compute.googleapis.com/NetworkEndpointGroup',
  '//compute.googleapis.com/projects/PROJECT_ID/zones/ZONE/nodeGroups/NODE_GROUP': 'compute.googleapis.com/NodeGroup',
  '//compute.googleapis.com/projects/PROJECT_ID/regions/REGION/nodeTemplates/NODE_TEMPLATE': 'compute.googleapis.com/NodeTemplate',
  '//compute.googleapis.com/projects/PROJECT_ID': 'compute.googleapis.com/Project',
  '//compute.googleapis.com/projects/PROJECT_ID/regions/REGION/packetMirrorings/PACKET_MIRRORING': 'compute.googleapis.com/PacketMirroring',
  '//compute.googleapis.com/projects/PROJECT_ID/regions/REGION/disks/DISKS': 'compute.googleapis.com/RegionDisk',
  '//compute.googleapis.com/projects/PROJECT_ID/zones/ZONE/reservations/RESERVATION': 'compute.googleapis.com/Reservation',
  '//compute.googleapis.com/projects/PROJECT_ID/regions/REGION/resourcePolicies/RESOURCE_POLICY': 'compute.googleapis.com/ResourcePolicy',
  '//compute.googleapis.com/projects/PROJECT_ID/global/routes/ROUTE': 'compute.googleapis.com/Route',
  '//compute.googleapis.com/projects/PROJECT_ID/regions/REGION/routers/ROUTER': 'compute.googleapis.com/Router',
  '//compute.googleapis.com/projects/PROJECT_ID/global/securityPolicies/SECURITY_POLICY': 'compute.googleapis.com/SecurityPolicy',
  '//compute.googleapis.com/projects/PROJECT_ID/global/snapshots/SNAPSHOT': 'compute.googleapis.com/Snapshot',
  '//compute.googleapis.com/projects/PROJECT_ID/global/sslCertificates/SSL_CERTIFICATE': 'compute.googleapis.com/SslCertificate',
  '//compute.googleapis.com/projects/PROJECT_ID/global/sslPolicies/SSL_POLICY': 'compute.googleapis.com/SslPolicy',
  '//compute.googleapis.com/projects/PROJECT_ID/regions/REGION/subnetworks/SUBNETWORK': 'compute.googleapis.com/Subnetwork',
  '//compute.googleapis.com/projects/PROJECT_ID/global/targetHttpProxies/TARGET_HTTP_PROXY': 'compute.googleapis.com/TargetHttpProxy',
  '//compute.googleapis.com/projects/PROJECT_ID/global/targetHttpsProxies/TARGET_HTTPS_PROXY': 'compute.googleapis.com/TargetHttpsProxy',
  '//compute.googleapis.com/projects/PROJECT_ID/zones/ZONE/targetInstances/TARGET_INSTANCE': 'compute.googleapis.com/TargetInstance',
  '//compute.googleapis.com/projects/PROJECT_ID/regions/REGION/targetPools/TARGET_POOL': 'compute.googleapis.com/TargetPool',
  '//compute.googleapis.com/projects/PROJECT_ID/global/targetTcpProxies/TARGET_TCP_PROXY': 'compute.googleapis.com/TargetTcpProxy',
  '//compute.googleapis.com/projects/PROJECT_ID/global/targetSslProxies/TARGET_SSL_PROXY': 'compute.googleapis.com/TargetSslProxy',
  '//compute.googleapis.com/projects/PROJECT_ID/regions/REGION/targetVpnGateways/TARGET_VPN_GATEWAY': 'compute.googleapis.com/TargetVpnGateway',
  '//compute.googleapis.com/projects/PROJECT_ID/global/urlMaps/URL_MAP': 'compute.googleapis.com/UrlMap',
  '//compute.googleapis.com/projects/PROJECT_ID/regions/REGION/vpnGateways/VPN_GATEWAY': 'compute.googleapis.com/VpnGateway',
  '//compute.googleapis.com/projects/PROJECT_ID/regions/REGION/vpnTunnels/VPN_TUNNEL': 'compute.googleapis.com/VpnTunnel',
  '//appengine.googleapis.com/apps/APP': 'appengine.googleapis.com/Application',
  '//appengine.googleapis.com/apps/APP/services/SERVICE': 'appengine.googleapis.com/Service',
  '//appengine.googleapis.com/apps/APP/services/SERVICE/versions/VERSION': 'appengine.googleapis.com/Version',
  '//cloudbilling.googleapis.com/billingAccounts/BILLING_ACCOUNT': 'cloudbilling.googleapis.com/BillingAccount',
  '//storage.googleapis.com/BUCKET': 'storage.googleapis.com/Bucket',
  '//osconfig.googleapis.com/PATCH_DEPLOYMENT': 'osconfig.googleapis.com/PatchDeployment',
  '//dns.googleapis.com/projects/PROJECT_ID/managedZones/ZONE_NUMBER': 'dns.googleapis.com/ManagedZone',
  '//dns.googleapis.com/projects/PROJECT_ID/policies/POLICY_NUMBER': 'dns.googleapis.com/Policy',
  '//spanner.googleapis.com/projects/PROJECT_ID/instances/INSTANCE': 'spanner.googleapis.com/Instance',
  '//spanner.googleapis.com/projects/PROJECT_ID/instances/INSTANCE/databases/DATABASE': 'spanner.googleapis.com/Database',
  '//spanner.googleapis.com/projects/PROJECT_ID/instances/INSTANCE/backups/BACKUP': 'spanner.googleapis.com/Backup',
  '//bigquery.googleapis.com/projects/PROJECT_ID/datasets/DATASET': 'bigquery.googleapis.com/Dataset',
  '//bigquery.googleapis.com/projects/PROJECT_ID/datasets/DATA_SET/tables/TABLE': 'bigquery.googleapis.com/Table',
  '//iam.googleapis.com/projects/PROJECT_ID/roles/ROLE': 'iam.googleapis.com/Role',
  '//iam.googleapis.com/projects/PROJECT_ID/serviceAccounts/SERVICE_ACCOUNT_EMAIL_OR_ID': 'iam.googleapis.com/ServiceAccount',
  '//iam.googleapis.com/projects/PROJECT_ID/serviceAccounts/SERVICE_ACCOUNT_EMAIL_OR_ID/keys/SERVICE_ACCOUNT_KEY': 'iam.googleapis.com/ServiceAccountKey',
  '//pubsub.googleapis.com/projects/PROJECT_ID/topics/TOPIC': 'pubsub.googleapis.com/Topic',
  '//pubsub.googleapis.com/projects/PROJECT_ID/subscriptions/SUBSCRIPTION': 'pubsub.googleapis.com/Subscription',
  '//pubsub.googleapis.com/projects/PROJECT_ID/snapshots/SNAPSHOT': 'pubsub.googleapis.com/Snapshot',
  '//dataproc.googleapis.com/projects/PROJECT_ID/regions/REGION/clusters/CLUSTER': 'dataproc.googleapis.com/Cluster',
  '//dataproc.googleapis.com/projects/PROJECT_ID/regions/REGION/jobs/JOB': 'dataproc.googleapis.com/Job',
  '//cloudkms.googleapis.com/projects/PROJECT_ID/locations/LOCATION/keyRings/KEY_RING': 'cloudkms.googleapis.com/KeyRing',
  '//cloudkms.googleapis.com/projects/PROJECT_ID/locations/LOCATION/keyRings/KEY_RING/cryptoKeys/CRYPTO_KEY': 'cloudkms.googleapis.com/CryptoKey',
  '//cloudkms.googleapis.com/projects/PROJECT_ID/locations/LOCATION/keyRings/KEY_RING/cryptoKeys/CRYPTO_KEY/cryptoKeyVersions/CRYPTO_KEY_VERSION': 'cloudkms.googleapis.com/CryptoKeyVersion',
  '//cloudkms.googleapis.com/projects/PROJECT_ID/locations/LOCATION/keyRings/KEY_RING/importJobs/IMPORT_JOBS': 'cloudkms.googleapis.com/ImportJob',
  '//container.googleapis.com/projects/PROJECT_ID/zones/ZONE/clusters/CLUSTER': 'container.googleapis.com/Cluster',
  '//container.googleapis.com/projects/PROJECT_ID/locations/LOCATION/clusters/CLUSTER': 'container.googleapis.com/Cluster',
  '//container.googleapis.com/projects/PROJECT_ID/zones/ZONE/clusters/CLUSTER/nodePools/NODE_POOL': 'container.googleapis.com/NodePool',
  '//cloudsql.googleapis.com/projects/PROJECT_ID/instances/INSTANCE': 'sqladmin.googleapis.com/Instance',
  '//bigtable.googleapis.com/projects/PROJECT_ID/instances/INSTANCE/appProfiles/APP_PROFILE': 'bigtableadmin.googleapis.com/AppProfile',
  '//bigtable.googleapis.com/projects/PROJECT_ID/instances/INSTANCE/clusters/CLUSTER/backups/BACKUP': 'bigtableadmin.googleapis.com/Backup',
  '//bigtable.googleapis.com/projects/PROJECT_ID/instances/INSTANCE/clusters/CLUSTER': 'bigtableadmin.googleapis.com/Cluster',
  '//bigtable.googleapis.com/projects/PROJECT_ID/instances/INSTANCE': 'bigtableadmin.googleapis.com/Instance',
  '//bigtable.googleapis.com/projects/PROJECT_ID/instances/INSTANCE/tables/TABLE': 'bigtableadmin.googleapis.com/Table',
  '//container.googleapis.com/projects/PROJECT_ID/zones/ZONE/clusters/CLUSTER/k8s/namespaces/NAMESPACE/extensions/ingresses/INGRESS': 'extensions.k8s.io/Ingress',
  '//container.googleapis.com/projects/PROJECT_ID/zones/ZONE/clusters/CLUSTER/k8s/namespaces/NAMESPACE/networking.k8s.io/ingresses/INGRESS': 'networking.k8s.io/Ingress',
  '//container.googleapis.com/projects/PROJECT_ID/zones/ZONE/clusters/CLUSTER/k8s/namespaces/NAMESPACE/networking.k8s.io/networkpolicies/NETWORKPOLICY': 'networking.k8s.io/Networkpolicy',
  '//serviceusage.googleapis.com/projects/PROJECT_NUMBER/services/SERVICE': 'serviceusage.googleapis.com/Service',
  '//datafusion.googleapis.com/projects/PROJECT_ID/locations/LOCATION/instances/INSTANCE': 'datafusion.googleapis.com/Instance',
  '//logging.googleapis.com/projects/PROJECT_NUMBER/locations/LOCATION/buckets/BUCKET': 'logging.googleapis.com/LogBucket',
  '//logging.googleapis.com/projects/PROJECT_NUMBER/sinks/SINK': 'logging.googleapis.com/LogSink',
  '//logging.googleapis.com/folders/FOLDER_NUMBER/sinks/SINK': 'logging.googleapis.com/LogSink',
  '//logging.googleapis.com/organizations/ORGANIZATION_NUMBER/sinks/SINK': 'logging.googleapis.com/LogSink',
  '//logging.googleapis.com/billingAccounts/BILLING_ACCOUNT_ID/sinks/SINK': 'logging.googleapis.com/LogSink',
  '//logging.googleapis.com/projects/PROJECT_NUMBER/metrics/METRIC': 'logging.googleapis.com/LogMetric',
  '//networkmanagement.googleapis.com/projects/PROJECT_ID/locations/global/connectivityTests/TEST': 'networkmanagement.googleapis.com/ConnectivityTest',
  '//managedidentities.googleapis.com/projects/PROJECT_ID/locations/global/domains/DOMAIN': 'managedidentities.googleapis.com/Domain',
  '//privateca.googleapis.com/projects/PROJECT_ID/locations/LOCATION/caPools/CA_POOL_ID': 'privateca.googleapis.com/CaPool',
  '//privateca.googleapis.com/projects/PROJECT_ID/locations/LOCATION/caPools/CA_POOL_ID/certificateAuthorities/CERTIFICATE_AUTHORITIES_ID': 'privateca.googleapis.com/CertificateAuthority',
  '//privateca.googleapis.com/projects/PROJECT_ID/locations/LOCATION/caPools/CA_POOL_ID/certificateAuthorities/CERTIFICATE_AUTHORITIES_ID/certificateRevocationLists/CERTIFICATE_REVOCATION_LISTS_ID': 'privateca.googleapis.com/CertificateRevocationList',
  '//privateca.googleapis.com/projects/PROJECT_ID/locations/LOCATION/certificateTemplates/CERTIFICATE_TEMPLATES_ID': 'privateca.googleapis.com/CertificateTemplate',
  '//dataflow.googleapis.com/projects/PROJECT_ID/locations/LOCATION/jobs/JOB': 'dataflow.googleapis.com/Job',
  '//gameservices.googleapis.com/projects/PROJECT_ID/locations/global/realms/REALM_ID/gameServerClusters/GAME_SERVER_CLUSTER_ID': 'gameservices.googleapis.com/GameServerCluster',
  '//gameservices.googleapis.com/projects/PROJECT_ID/locations/global/realms/REALM_ID': 'gameservices.googleapis.com/Realm',
  '//gameservices.googleapis.com/projects/PROJECT_ID/locations/global/gameServerDeployments/GAME_SERVER_DEPLOYMENTS_ID/configs/CONFIG_ID': 'gameservices.googleapis.com/GameServerConfig',
  '//gameservices.googleapis.com/projects/PROJECT_ID/locations/global/gameServerDeployments/GAME_SERVER_DEPLOYMENTS_ID': 'gameservices.googleapis.com/GameServerDeployment',
  '//gkehub.googleapis.com/projects/PROJECT_ID/locations/global/memberships/MEMBERSHIP': 'gkehub.googleapis.com/Membership',
  '//secretmanager.googleapis.com/projects/PROJECT_NUMBER/secrets/SECRET': 'secretmanager.googleapis.com/Secret',
  '//secretmanager.googleapis.com/projects/PROJECT_NUMBER/secrets/SECRET/versions/VERSION': 'secretmanager.googleapis.com/SecretVersion',
  '//tpu.googleapis.com/projects/PROJECT_NUMBER/locations/LOCATION/nodes/NODE_ID': 'tpu.googleapis.com/Node',
  '//composer.googleapis.com/projects/PROJECT_NUMBER/locations/LOCATION/environments/ENVIRONMENT': 'composer.googleapis.com/Environment',
  '//file.googleapis.com/projects/PROJECT_NUMBER/locations/LOCATION/instances/INSTANCE': 'file.googleapis.com/Instance',
  '//file.googleapis.com/projects/PROJECT_NUMBER/locations/LOCATION/backups/BACKUP': 'file.googleapis.com/Backup',
  '//servicedirectory.googleapis.com/projects/PROJECT_NUMBER/locations/LOCATION/namespaces/NAMESPACE': 'servicedirectory.googleapis.com/Namespace',
  '//assuredworkloads.googleapis.com/organizations/ORGANIZATION_NUMBER/locations/LOCATION/workloads/WORKLOAD': 'assuredworkloads.googleapis.com/Workload',
  '//artifactregistry.googleapis.com/projects/PROJECT_NUMBER/locations/LOCATION/repositories/REPOSITORY/dockerimages/DOCKER_IMAGE': 'artifactregistry.googleapis.com/DockerImage',
  '//artifactregistry.googleapis.com/projects/PROJECT_NUMBER/locations/LOCATION/repositories/REPOSITORY': 'artifactregistry.googleapis.com/Repository',
  '//apigateway.googleapis.com/projects/PROJECT_NUMBER/locations/LOCATION/apis/API': 'apigateway.googleapis.com/Api',
  '//apigateway.googleapis.com/projects/PROJECT_NUMBER/locations/LOCATION/apis/API/configs/CONFIG': 'apigateway.googleapis.com/ApiConfig',
  '//apigateway.googleapis.com/projects/PROJECT_NUMBER/locations/LOCATION/gateways/GATEWAY': 'apigateway.googleapis.com/Gateway',
  '//redis.googleapis.com/projects/PROJECT_ID/locations/LOCATION/instances/INSTANCE': 'redis.googleapis.com/Instance',
  '//memcache.googleapis.com/projects/PROJECT_NUMBER/locations/LOCATION/instances/INSTANCE': 'memcache.googleapis.com/Instance',
  '//documentai.googleapis.com/projects/PROJECT_NUMBER/locations/LOCATION/processors/PROCESSOR/humanReviewConfig': 'documentai.googleapis.com/HumanReviewConfig',
  '//documentai.googleapis.com/projects/PROJECT_NUMBER/locations/LOCATION/labelerPools/LABELERPOOL': 'documentai.googleapis.com/LabelerPool',
  '//documentai.googleapis.com/projects/PROJECT_NUMBER/locations/LOCATION/processors/PROCESSOR': 'documentai.googleapis.com/Processor',
  '//aiplatform.googleapis.com/projects/PROJECT_NUMBER/locations/LOCATION/batchPredictionJobs/BATCH_PREDICTION_JOB': 'aiplatform.googleapis.com/BatchPredictionJob',
  '//aiplatform.googleapis.com/projects/PROJECT_NUMBER/locations/LOCATION/customJobs/CUSTOM_JOB': 'aiplatform.googleapis.com/CustomJob',
  '//aiplatform.googleapis.com/projects/PROJECT_NUMBER/locations/LOCATION/dataLabelingJobs/DATA_LABELING_JOB': 'aiplatform.googleapis.com/DataLabelingJob',
  '//aiplatform.googleapis.com/projects/PROJECT_NUMBER/locations/LOCATION/datasets/DATASET': 'aiplatform.googleapis.com/Dataset',
  '//aiplatform.googleapis.com/projects/PROJECT_NUMBER/locations/LOCATION/endpoints/ENDPOINT': 'aiplatform.googleapis.com/Endpoint',
  '//aiplatform.googleapis.com/projects/PROJECT_NUMBER/locations/LOCATION/hyperparameterTuningJobs/HYPERPARAMETER_TUNING_JOB': 'aiplatform.googleapis.com/HyperparameterTuningJob',
  '//aiplatform.googleapis.com/projects/PROJECT_NUMBER/locations/LOCATION/models/MODEL': 'aiplatform.googleapis.com/Model',
  '//aiplatform.googleapis.com/projects/PROJECT_NUMBER/locations/LOCATION/specialistPools/SPECIALIST_POOL': 'aiplatform.googleapis.com/SpecialistPool',
  '//aiplatform.googleapis.com/projects/PROJECT_NUMBER/locations/LOCATION/trainingPipelines/TRAINING_PIPELINE': 'aiplatform.googleapis.com/TrainingPipeline',
  '//monitoring.googleapis.com/projects/PROJECT_NUMBER/policies/POLICY_NUMBER': 'monitoring.googleapis.com/AlertPolicy',
  '//vpcaccess.googleapis.com/projects/PROJECT_NUMBER/locations/LOCATION/connectors/CONNECTOR': 'vpcaccess.googleapis.com/Connector',
  '//servicemanagement.googleapis.com/services/SERVICE_ID': 'servicemanagement.googleapis.com/ManagedService',
  '//eventarc.googleapis.com/projects/PROJECT_NUMBER/locations/LOCATION/triggers/TRIGGER': 'eventarc.googleapis.com/Trigger',
  '//container.googleapis.com/projects/PROJECT_ID/zones/ZONE/clusters/CLUSTER/k8s/nodes/NODE': 'k8s.io/Node',
  '//container.googleapis.com/projects/PROJECT_ID/zones/ZONE/clusters/CLUSTER/k8s/namespaces/NAMESPACE/pods/POD': 'k8s.io/Pod',
  '//container.googleapis.com/projects/PROJECT_ID/zones/ZONE/clusters/CLUSTER/k8s/namespaces/NAMESPACE': 'k8s.io/Namespace',
  '//container.googleapis.com/projects/PROJECT_ID/zones/ZONE/clusters/CLUSTER/k8s/namespaces/NAMESPACE/services/SERVICE': 'k8s.io/Service',
  '//container.googleapis.com/projects/PROJECT_ID/zones/ZONE/clusters/CLUSTER/k8s/namespaces/NAMESPACE/rbac.authorization.k8s.io/roles/ROLE': 'rbac.authorization.k8s.io/Role',
  '//container.googleapis.com/projects/PROJECT_ID/zones/ZONE/clusters/CLUSTER/k8s/namespaces/NAMESPACE/rbac.authorization.k8s.io/rolebindings/ROLEBINDING': 'rbac.authorization.k8s.io/RoleBinding',
  '//container.googleapis.com/projects/PROJECT_ID/zones/ZONE/clusters/CLUSTER/k8s/rbac.authorization.k8s.io/clusterroles/CLUSTER_ROLE': 'rbac.authorization.k8s.io/ClusterRole',
  '//container.googleapis.com/projects/PROJECT_ID/zones/ZONE/clusters/CLUSTER/k8s/rbac.authorization.k8s.io/clusterrolebindings/CLUSTER_ROLE_BINDING': 'rbac.authorization.k8s.io/ClusterRoleBinding',
}

export const NONE = 'NO_DIRECT_J1_RESOURCE_YET';

/**
 * A map of all existing Google Cloud resources to their associated JupiterOne type
 */
export const GOOGLE_RESOURCE_TO_J1_TYPE_MAP: {
  [key: string]: string | string[];
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
  'cloudbilling.googleapis.com/BillingAccount': NONE,
  'storage.googleapis.com/Bucket': CLOUD_STORAGE_BUCKET_ENTITY_TYPE,
  'osconfig.googleapis.com/PatchDeployment': NONE,
  'dns.googleapis.com/ManagedZone': DNS_MANAGED_ZONE_ENTITY_TYPE,
  'dns.googleapis.com/Policy': NONE,
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
  'dataproc.googleapis.com/Cluster': NONE,
  'dataproc.googleapis.com/Job': NONE,
  'cloudkms.googleapis.com/KeyRing': ENTITY_TYPE_KMS_KEY_RING,
  'cloudkms.googleapis.com/CryptoKey': ENTITY_TYPE_KMS_KEY,
  'cloudkms.googleapis.com/CryptoKeyVersion': NONE,
  'cloudkms.googleapis.com/ImportJob': NONE,
  'container.googleapis.com/Cluster': CONTAINER_CLUSTER_ENTITY_TYPE,
  'container.googleapis.com/NodePool': CONTAINER_NODE_POOL_ENTITY_TYPE,
  'bigtableadmin.googleapis.com/AppProfile': NONE,
  'bigtableadmin.googleapis.com/Backup': NONE,
  'bigtableadmin.googleapis.com/Cluster': NONE,
  'bigtableadmin.googleapis.com/Instance': NONE,
  'bigtableadmin.googleapis.com/Table': NONE,
  'k8s.io/Node	//': NONE,
  'k8s.io/Pod	//': NONE,
  'k8s.io/Namespace	//': NONE,
  'k8s.io/Service	//': NONE,
  'rbac.authorization.k8s.io': NONE,
  'extensions.k8s.io/Ingress': NONE,
  'networking.k8s.io/Ingress': NONE,
  'networking.k8s.io/Networkpolicy': NONE,
  'serviceusage.googleapis.com/Service': API_SERVICE_ENTITY_TYPE,
  'datafusion.googleapis.com/Instance': NONE,
  'logging.googleapis.com/LogBucket': NONE,
  'logging.googleapis.com/LogSink': LOGGING_PROJECT_SINK_ENTITY_TYPE,
  'logging.googleapis.com/LogMetric': LOGGING_METRIC_ENTITY_TYPE,
  'networkmanagement.googleapis.com/ConnectivityTest': NONE,
  'managedidentities.googleapis.com/Domain': NONE,
  'privateca.googleapis.com/CaPool': NONE,
  'privateca.googleapis.com/CertificateAuthority':
    ENTITY_TYPE_PRIVATE_CA_CERTIFICATE_AUTHORITY,
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
  'sqladmin.googleapis.com/Instance': [
    SQL_ADMIN_MYSQL_INSTANCE_ENTITY_TYPE,
    SQL_ADMIN_POSTGRES_INSTANCE_ENTITY_TYPE,
    SQL_ADMIN_SQL_SERVER_INSTANCE_ENTITY_TYPE,
  ],
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

// ex: j1-gc-integration-dev-v3
// ex: j1-gc-integration-dev-v3:test_big_query_dataset
// ex: j1-gc-integration-dev-v3:natality.Test Table
function allUniqueIdentifiers(googleResourceIdentifier: string): string {
  const [
    _,
    __,
    _service,
    _firstDivision,
    idForFistDivision,
    _secondDivision,
    idForSecondDivision,
    _thirdDivision,
    idForThirdDivision,
    _fourthDivision,
    idForFourthDivision,
  ] = googleResourceIdentifier.split('/');
  return [
    idForFistDivision,
    idForSecondDivision,
    idForThirdDivision,
    idForFourthDivision,
  ]
    .filter((i) => !!i)
    .join(':');
}

// ex: cloudrun_service:2fab1cb9-fb5c-4f22-b364-979cebdc2820
function customPrefixAndIdKeyMap(
  customKeyPrefixFunction: (uid: string) => string,
): (googleResourceIdentifier: string) => string {
  return (googleResourceIdentifier: string) =>
    customKeyPrefixFunction(finalIdentifierKeyMap(googleResourceIdentifier));
}

// Used when there is no way to generate the J1 entity key given only the googleResourceIdentifier
function impossible(googleResourceIdentifier: string): false {
  return false;
}

/**
 * A map of JupiterOne types to a function which can generate their _key properties given a Google Cloud resource identifier
 */
export const J1_TYPE_TO_KEY_GENERATOR_MAP: {
  [key: string]: (googleResourceIdentifier: string) => string | false;
} = {
  [CLOUD_FUNCTION_ENTITY_TYPE]: fullPathKeyMap,
  [ORGANIZATION_ENTITY_TYPE]: fullPathKeyMap,
  [FOLDER_ENTITY_TYPE]: fullPathKeyMap,
  [PROJECT_ENTITY_TYPE]: allUniqueIdentifiers,
  [ENTITY_TYPE_CLOUD_RUN_SERVICE]: customPrefixAndIdKeyMap(
    getCloudRunServiceKey,
  ),
  [ENTITY_TYPE_COMPUTE_BACKEND_BUCKET]: selfLinkKeyMap,
  [ENTITY_TYPE_COMPUTE_BACKEND_SERVICE]: selfLinkKeyMap,
  [ENTITY_TYPE_COMPUTE_DISK]: customPrefixAndIdKeyMap(getComputeDiskKey),
  [ENTITY_TYPE_COMPUTE_FIREWALL]: selfLinkKeyMap,
  [ENTITY_TYPE_COMPUTE_HEALTH_CHECK]: selfLinkKeyMap,
  [ENTITY_TYPE_COMPUTE_IMAGE]: customPrefixAndIdKeyMap(getComputeImageKey),
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
  [CLOUD_STORAGE_BUCKET_ENTITY_TYPE]: customPrefixAndIdKeyMap(
    getCloudStorageBucketKey,
  ),
  [DNS_MANAGED_ZONE_ENTITY_TYPE]: finalIdentifierKeyMap,
  [ENTITY_TYPE_SPANNER_INSTANCE]: fullPathKeyMap,
  [ENTITY_TYPE_SPANNER_INSTANCE_DATABASE]: fullPathKeyMap,
  [BIG_QUERY_DATASET_ENTITY_TYPE]: allUniqueIdentifiers,
  [BIG_QUERY_TABLE_ENTITY_TYPE]: allUniqueIdentifiers,
  [IAM_ROLE_ENTITY_TYPE]: impossible, // Key is different depending on if it is a custom or managed Role. I'm pretty sure this can not be the target of a role binding.
  [IAM_SERVICE_ACCOUNT_ENTITY_TYPE]: finalIdentifierKeyMap,
  [IAM_SERVICE_ACCOUNT_KEY_ENTITY_TYPE]: fullPathKeyMap,
  [ENTITY_TYPE_PUBSUB_TOPIC]: fullPathKeyMap,
  [ENTITY_TYPE_PUBSUB_SUBSCRIPTION]: fullPathKeyMap,
  [ENTITY_TYPE_KMS_KEY_RING]: fullPathKeyMap,
  [ENTITY_TYPE_KMS_KEY]: fullPathKeyMap,
  [CONTAINER_CLUSTER_ENTITY_TYPE]: selfLinkKeyMap,
  [CONTAINER_NODE_POOL_ENTITY_TYPE]: selfLinkKeyMap,
  [API_SERVICE_ENTITY_TYPE]: fullPathKeyMap,
  [LOGGING_PROJECT_SINK_ENTITY_TYPE]: customPrefixAndIdKeyMap(
    getLogingProjectSinkId,
  ),
  [LOGGING_METRIC_ENTITY_TYPE]: finalIdentifierKeyMap, // I'm pretty sure this can not be the target of a role binding.
  [ENTITY_TYPE_PRIVATE_CA_CERTIFICATE_AUTHORITY]: fullPathKeyMap,
  [ENTITY_TYPE_API_GATEWAY_API]: fullPathKeyMap,
  [ENTITY_TYPE_API_GATEWAY_API_CONFIG]: fullPathKeyMap,
  [ENTITY_TYPE_API_GATEWAY_GATEWAY]: fullPathKeyMap,
  [ENTITY_TYPE_REDIS_INSTANCE]: customPrefixAndIdKeyMap(getRedisKey),
  [ENTITY_TYPE_MEMCACHE_INSTANCE]: customPrefixAndIdKeyMap(getMemcacheKey),
  [MONITORING_ALERT_POLICY_TYPE]: fullPathKeyMap,
  [SQL_ADMIN_MYSQL_INSTANCE_ENTITY_TYPE]: impossible, // needs access to the region (us-east1, etc...) the instance is in in order to generate the key
  [SQL_ADMIN_POSTGRES_INSTANCE_ENTITY_TYPE]: impossible, // needs access to the region (us-east1, etc...) the instance is in in order to generate the key
  [SQL_ADMIN_SQL_SERVER_INSTANCE_ENTITY_TYPE]: impossible, // needs access to the region (us-east1, etc...) the instance is in in order to generate the key
};
