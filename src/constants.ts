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
import { ENTITY_TYPE_MEMCACHE_INSTANCE } from './steps/memcache/constants';
import { MONITORING_ALERT_POLICY_TYPE } from './steps/monitoring/constants';
import { ENTITY_TYPE_PRIVATE_CA_CERTIFICATE_AUTHORITY } from './steps/privateca/constants';
import {
  ENTITY_TYPE_PUBSUB_TOPIC,
  ENTITY_TYPE_PUBSUB_SUBSCRIPTION,
} from './steps/pub-sub/constants';
import { ENTITY_TYPE_REDIS_INSTANCE } from './steps/redis/constants';
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

/**
 * ANY_RESOURCE is used to describe any Google Cloud resource.
 * This includes all assets both ingested and not ingested with this integration
 */
export const ANY_RESOURCE = 'ANY_RESOURCE';

// Used when resource type stops with still more to traverse
const EARLY_STOP_KEY = '__EARLY_STOP_KEY';

/**
 * A map that goes from google cloud resource identifier structure to the cloud resource kind.
 * https://cloud.google.com/asset-inventory/docs/resource-name-format
 */
export const CLOUD_RESOURCES_MAP = {
  'cloudfunctions.googleapis.com': {
    projects: {
      PROJECT_ID: {
        locations: {
          LOCATION: {
            functions: {
              CLOUD_FUNCTION: 'cloudfunctions.googleapis.com/CloudFunction',
            },
          },
        },
      },
    },
  },
  'cloudresourcemanager.googleapis.com': {
    organizations: {
      ORGANIZATION_NUMBER: 'cloudresourcemanager.googleapis.com/Organization',
    },
    folders: {
      FOLDER_NUMBER: 'cloudresourcemanager.googleapis.com/Folder',
    },
    projects: {
      PROJECT_NUMBER: 'cloudresourcemanager.googleapis.com/Project',
      PROJECT_ID: 'cloudresourcemanager.googleapis.com/Project',
    },
  },
  'run.googleapis.com': {
    projects: {
      PROJECT_ID: {
        locations: {
          LOCATION: {
            domainmappings: {
              DOMAIN_MAPPING: 'run.googleapis.com/DomainMapping',
            },
            revisions: {
              REVISION: 'run.googleapis.com/Revision',
            },
            services: {
              SERVICE: 'run.googleapis.com/Service',
            },
          },
        },
      },
    },
  },
  'compute.googleapis.com': {
    projects: {
      PROJECT_ID: {
        [EARLY_STOP_KEY]: 'compute.googleapis.com/Project',
        regions: {
          REGION: {
            packetMirrorings: {
              PACKET_MIRRORING: 'compute.googleapis.com/PacketMirroring',
            },
            disks: {
              DISKS: 'compute.googleapis.com/RegionDisk',
            },
            resourcePolicies: {
              RESOURCE_POLICY: 'compute.googleapis.com/ResourcePolicy',
            },
            routers: {
              ROUTER: 'compute.googleapis.com/Router',
            },
            subnetworks: {
              SUBNETWORK: 'compute.googleapis.com/Subnetwork',
            },
            targetPools: {
              TARGET_POOL: 'compute.googleapis.com/TargetPool',
            },
            targetVpnGateways: {
              TARGET_VPN_GATEWAY: 'compute.googleapis.com/TargetVpnGateway',
            },
            vpnGateways: {
              VPN_GATEWAY: 'compute.googleapis.com/VpnGateway',
            },
            vpnTunnels: {
              VPN_TUNNEL: 'compute.googleapis.com/VpnTunnel',
            },
            addresses: {
              ADDRESS: 'compute.googleapis.com/Address',
            },
            autoscalers: {
              AUTOSCALER: 'compute.googleapis.com/Autoscaler',
            },
            forwardingRules: {
              FORWARDING_RULE: 'compute.googleapis.com/ForwardingRule',
            },
            instanceGroups: {
              INSTANCE_GROUP: 'compute.googleapis.com/InstanceGroup',
            },
            instanceGroupManager: {
              INSTANCE_GROUP_MANAGER:
                'compute.googleapis.com/InstanceGroupManager',
            },
            nodeTemplates: {
              NODE_TEMPLATE: 'compute.googleapis.com/NodeTemplate',
            },
          },
          interconnectAttachments: {
            INTERCONNECT_ATTACHMENT:
              'compute.googleapis.com/InterconnectAttachment',
          },
        },
        zones: {
          ZONE: {
            reservations: {
              RESERVATION: 'compute.googleapis.com/Reservation',
            },
            targetInstances: {
              TARGET_INSTANCE: 'compute.googleapis.com/TargetInstance',
            },
            autoscalers: {
              AUTOSCALER: 'compute.googleapis.com/Autoscaler',
            },
            disks: {
              DISKS: 'compute.googleapis.com/Disk',
            },
            instances: {
              INSTANCE: 'compute.googleapis.com/Instance',
            },
            instanceGroups: {
              INSTANCE_GROUP: 'compute.googleapis.com/InstanceGroup',
            },
            instanceGroupManager: {
              INSTANCE_GROUP_MANAGER:
                'compute.googleapis.com/InstanceGroupManager',
            },
            networkEndpointGroups: {
              NETWORK_ENDPOINT_GROUP:
                'compute.googleapis.com/NetworkEndpointGroup',
            },
            nodeGroups: {
              NODE_GROUP: 'compute.googleapis.com/NodeGroup',
            },
          },
        },
        global: {
          routes: {
            ROUTE: 'compute.googleapis.com/Route',
          },
          securityPolicies: {
            SECURITY_POLICY: 'compute.googleapis.com/SecurityPolicy',
          },
          snapshots: {
            SNAPSHOT: 'compute.googleapis.com/Snapshot',
          },
          sslCertificates: {
            SSL_CERTIFICATE: 'compute.googleapis.com/SslCertificate',
          },
          sslPolicies: {
            SSL_POLICY: 'compute.googleapis.com/SslPolicy',
          },
          targetHttpProxies: {
            TARGET_HTTP_PROXY: 'compute.googleapis.com/TargetHttpProxy',
          },
          targetHttpsProxies: {
            TARGET_HTTPS_PROXY: 'compute.googleapis.com/TargetHttpsProxy',
          },
          targetTcpProxies: {
            TARGET_TCP_PROXY: 'compute.googleapis.com/TargetTcpProxy',
          },
          targetSslProxies: {
            TARGET_SSL_PROXY: 'compute.googleapis.com/TargetSslProxy',
          },
          urlMaps: {
            URL_MAP: 'compute.googleapis.com/UrlMap',
          },
          addresses: {
            ADDRESS: 'compute.googleapis.com/GlobalAddress',
          },
          backendBuckets: {
            BACKEND_BUCKET: 'compute.googleapis.com/BackendBucket',
          },
          backendServices: {
            BACKEND_SERVICE: 'compute.googleapis.com/BackendService',
          },
          externalVpnGateways: {
            EXTERNAL_VPN_GATEWAY: 'compute.googleapis.com/ExternalVpnGateway',
          },
          firewalls: {
            FIREWALL: 'compute.googleapis.com/Firewall',
          },
          healthChecks: {
            HEALTH_CHECK: 'compute.googleapis.com/HealthCheck',
          },
          httpHealthChecks: {
            HTTP_HEALTH_CHECK: 'compute.googleapis.com/HttpHealthCheck',
          },
          httpsHealthChecks: {
            HTTPS_HEALTH_CHECK: 'compute.googleapis.com/HttpsHealthCheck',
          },
          images: {
            IMAGE: 'compute.googleapis.com/Image',
          },
          instanceTemplates: {
            INSTANCE_TEMPLATE: 'compute.googleapis.com/InstanceTemplate',
          },
          interconnects: {
            INTERCONNECT: 'compute.googleapis.com/Interconnect',
          },
          licenses: {
            LICENSE: 'compute.googleapis.com/License',
          },
          networks: {
            NETWORK: 'compute.googleapis.com/Network',
          },
        },
        region: {
          REGION: {
            commitments: {
              COMMITMENT: 'compute.googleapis.com/Commitment',
            },
          },
        },
      },
    },
  },
  'appengine.googleapis.com': {
    apps: {
      [EARLY_STOP_KEY]: 'appengine.googleapis.com/Application',
      APP: {
        services: {
          SERVICE: {
            [EARLY_STOP_KEY]: 'appengine.googleapis.com/Service',
            versions: {
              VERSION: 'appengine.googleapis.com/Version',
            },
          },
        },
      },
    },
    'cloudbilling.googleapis.com': {
      billingAccounts: {
        BILLING_ACCOUNT: 'cloudbilling.googleapis.com/BillingAccount',
      },
    },
    'storage.googleapis.com': {
      BUCKET: 'storage.googleapis.com/BUCKET',
    },
    'osconfig.googleapis.com': {
      PATCH_DEPLOYMENT: 'osconfig.googleapis.com/PatchDeployment',
    },
    'dns.googleapis.com': {
      projects: {
        PROJECT_ID: {
          managedZones: {
            ZONE_NUMBER: 'dns.googleapis.com/ManagedZone',
          },
          policies: {
            POLICY_NUMBER: 'dns.googleapis.com/Policy',
          },
        },
      },
    },
    'spanner.googleapis.com': {
      projects: {
        PROJECT_ID: {
          instances: {
            INSTANCE: {
              [EARLY_STOP_KEY]: 'spanner.googleapis.com/Instance',
              databases: {
                DATABASE: 'spanner.googleapis.com/Database',
              },
              backups: {
                BACKUP: 'spanner.googleapis.com/Backup',
              },
            },
          },
        },
      },
    },
    'bigquery.googleapis.com': {
      projects: {
        PROJECT_ID: {
          datasets: {
            DATA_SET: {
              tables: {
                TABLE: 'bigquery.googleapis.com/Table',
              },
            },
            DATASET: 'bigquery.googleapis.com/Dataset',
          },
        },
      },
    },
    'iam.googleapis.com': {
      projects: {
        PROJECT_ID: {
          roles: {
            ROLE: 'iam.googleapis.com/Role',
          },
          serviceAccounts: {
            SERVICE_ACCOUNT_EMAIL_OR_ID: {
              [EARLY_STOP_KEY]: 'iam.googleapis.com/ServiceAccount',
              keys: {
                SERVICE_ACCOUNT_KEY: 'iam.googleapis.com/ServiceAccountKey',
              },
            },
          },
        },
      },
    },
    'pubsub.googleapis.com': {
      projects: {
        PROJECT_ID: {
          topics: {
            TOPIC: 'pubsub.googleapis.com/Topic',
          },
          subscriptions: {
            SUBSCRIPTION: 'pubsub.googleapis.com/Subscription',
          },
          snapshots: {
            SNAPSHOT: 'pubsub.googleapis.com/Snapshot',
          },
        },
      },
    },
    'dataproc.googleapis.com': {
      projects: {
        PROJECT_ID: {
          regions: {
            REGION: {
              clusters: {
                CLUSTER: 'dataproc.googleapis.com/Cluster',
              },
              jobs: {
                JOB: 'dataproc.googleapis.com/Job',
              },
            },
          },
        },
      },
    },
    'cloudkms.googleapis.com': {
      projects: {
        PROJECT_ID: {
          locations: {
            LOCATION: {
              keyRings: {
                KEY_RING: {
                  [EARLY_STOP_KEY]: 'cloudkms.googleapis.com/KeyRing',
                  cryptoKeys: {
                    CRYPTO_KEY: {
                      [EARLY_STOP_KEY]: 'cloudkms.googleapis.com/CryptoKey',
                      cryptoKeyVersions: {
                        CRYPTO_KEY_VERSION:
                          'cloudkms.googleapis.com/CryptoKeyVersion',
                      },
                    },
                  },
                  importJobs: {
                    IMPORT_JOBS: 'cloudkms.googleapis.com/ImportJob',
                  },
                },
              },
            },
          },
        },
      },
    },
    'container.googleapis.com': {
      projects: {
        PROJECT_ID: {
          locations: {
            LOCATION: {
              clusters: {
                CLUSTER: 'container.googleapis.com/Cluster',
              },
            },
          },
          zones: {
            ZONE: {
              clusters: {
                CLUSTER: {
                  [EARLY_STOP_KEY]: 'container.googleapis.com/Cluster',
                  k8s: {
                    nodes: {
                      NODE: 'k8s.io/Node',
                    },
                    namespaces: {
                      NAMESPACE: {
                        [EARLY_STOP_KEY]: 'k8s.io/Namespace',
                        pods: {
                          POD: 'k8s.io/Pod',
                        },
                        services: {
                          SERVICE: 'k8s.io/Service',
                        },
                        'rbac.authorization.k8s.io': {
                          roles: {
                            ROLE: 'rbac.authorization.k8s.io',
                          },
                          rolebindings: {
                            ROLEBINDING: 'rbac.authorization.k8s.io',
                          },
                        },
                        extensions: {
                          ingresses: {
                            INGRESS: 'extensions.k8s.io/Ingress',
                          },
                        },
                        'networking.k8s.io': {
                          ingresses: {
                            INGRESS: 'networking.k8s.io/Ingress',
                          },
                          networkpolicies: {
                            NETWORKPOLICY: 'networking.k8s.io/Networkpolicy',
                          },
                        },
                      },
                    },
                    'rbac.authorization.k8s.io': {
                      clusterroles: {
                        CLUSTER_ROLE: 'rbac.authorization.k8s.io',
                      },
                      clusterrolebindings: {
                        CLUSTER_ROLE_BINDING: 'rbac.authorization.k8s.io',
                      },
                    },
                  },
                  nodePools: {
                    NODE_POOL: 'container.googleapis.com/NodePool',
                  },
                },
              },
            },
          },
        },
      },
    },
    'cloudsql.googleapis.com': {
      projects: {
        PROJECT_ID: {
          instances: {
            INSTANCE: 'sqladmin.googleapis.com/Instance',
          },
        },
      },
    },
    'bigtable.googleapis.com': {
      projects: {
        PROJECT_ID: {
          instances: {
            INSTANCE: {
              [EARLY_STOP_KEY]: 'bigtableadmin.googleapis.com/Instance',
              appProfiles: {
                APP_PROFILE: 'bigtableadmin.googleapis.com/AppProfile',
              },
              tables: {
                TABLE: 'bigtableadmin.googleapis.com/Table',
              },
              clusters: {
                CLUSTER: {
                  [EARLY_STOP_KEY]: 'bigtableadmin.googleapis.com/Cluster',
                  backups: {
                    BACKUP: 'bigtableadmin.googleapis.com/Backup',
                  },
                },
              },
            },
          },
        },
      },
    },
    'serviceusage.googleapis.com': {
      projects: {
        PROJECT_NUMBER: {
          services: {
            SERVICE: 'serviceusage.googleapis.com/Service',
          },
        },
      },
    },
    'datafusion.googleapis.com': {
      projects: {
        PROJECT_ID: {
          locations: {
            LOCATION: {
              instances: {
                INSTANCE: 'datafusion.googleapis.com/Instance',
              },
            },
          },
        },
      },
    },
    'logging.googleapis.com': {
      projects: {
        PROJECT_NUMBER: {
          locations: {
            LOCATION: {
              buckets: {
                BUCKET: 'logging.googleapis.com/LogBucket',
              },
            },
          },
          sinks: {
            SINK: 'logging.googleapis.com/LogSink',
          },
          metrics: {
            METRIC: 'logging.googleapis.com/LogMetric',
          },
        },
      },
      folders: {
        FOLDER_NUMBER: {
          sinks: {
            SINK: 'logging.googleapis.com/LogSink',
          },
        },
      },
      organizations: {
        ORGANIZATION_NUMBER: {
          sinks: {
            SINK: 'logging.googleapis.com/LogSink',
          },
        },
      },
      billingAccounts: {
        BILLING_ACCOUNT_ID: {
          sinks: {
            SINK: 'logging.googleapis.com/LogSink',
          },
        },
      },
    },
    'networkmanagement.googleapis.com': {
      projects: {
        PROJECT_ID: {
          locations: {
            global: {
              connectivityTests: {
                TEST: 'networkmanagement.googleapis.com/ConnectivityTest',
              },
            },
          },
        },
      },
    },
    'managedidentities.googleapis.com': {
      projects: {
        PROJECT_ID: {
          locations: {
            global: {
              domains: {
                DOMAIN: 'managedidentities.googleapis.com/Domain',
              },
            },
          },
        },
      },
    },
    'privateca.googleapis.com': {
      projects: {
        PROJECT_ID: {
          locations: {
            LOCATION: {
              caPools: {
                CA_POOL_ID: {
                  [EARLY_STOP_KEY]: 'privateca.googleapis.com/CaPool',
                  certificateAuthorities: {
                    CERTIFICATE_AUTHORITIES_ID: {
                      [EARLY_STOP_KEY]:
                        'privateca.googleapis.com/CertificateAuthority',
                      certificateRevocationLists: {
                        CERTIFICATE_REVOCATION_LISTS_ID:
                          'privateca.googleapis.com/CertificateRevocationList',
                      },
                    },
                  },
                },
              },
              certificateTemplates: {
                CERTIFICATE_TEMPLATES_ID:
                  'privateca.googleapis.com/CertificateTemplate',
              },
            },
          },
        },
      },
    },
    'dataflow.googleapis.com': {
      projects: {
        PROJECT_ID: {
          locations: {
            LOCATION: {
              jobs: {
                JOB: 'dataflow.googleapis.com/Job',
              },
            },
          },
        },
      },
    },
    'gameservices.googleapis.com': {
      projects: {
        PROJECT_ID: {
          locations: {
            global: {
              realms: {
                REALM_ID: {
                  [EARLY_STOP_KEY]: 'gameservices.googleapis.com/Realm',
                  gameServerClusters: {
                    GAME_SERVER_CLUSTER_ID:
                      'gameservices.googleapis.com/GameServerCluster',
                  },
                },
              },
              gameServerDeployments: {
                GAME_SERVER_DEPLOYMENTS_ID: {
                  [EARLY_STOP_KEY]:
                    'gameservices.googleapis.com/GameServerDeployment',
                  configs: {
                    CONFIG_ID: 'gameservices.googleapis.com/GameServerConfig',
                  },
                },
              },
            },
          },
        },
      },
    },
    'gkehub.googleapis.com': {
      projects: {
        PROJECT_ID: {
          locations: {
            global: {
              memberships: {
                MEMBERSHIP: 'gkehub.googleapis.com/Membership',
              },
            },
          },
        },
      },
    },
    'secretmanager.googleapis.com': {
      projects: {
        PROJECT_NUMBER: {
          secrets: {
            SECRET: {
              [EARLY_STOP_KEY]: 'secretmanager.googleapis.com/Secret',
              versions: {
                VERSION: 'secretmanager.googleapis.com/SecretVersion',
              },
            },
          },
        },
      },
    },
    'tpu.googleapis.com': {
      projects: {
        PROJECT_NUMBER: {
          locations: {
            LOCATION: {
              nodes: {
                NODE_ID: 'tpu.googleapis.com/Node',
              },
            },
          },
        },
      },
    },
    'composer.googleapis.com': {
      projects: {
        PROJECT_NUMBER: {
          locations: {
            LOCATION: {
              environments: {
                ENVIRONMENT: 'composer.googleapis.com/Environment',
              },
            },
          },
        },
      },
    },
    'file.googleapis.com': {
      projects: {
        PROJECT_NUMBER: {
          locations: {
            LOCATION: {
              instances: {
                INSTANCE: 'file.googleapis.com/Instance',
              },
              backups: {
                BACKUP: 'file.googleapis.com/Backup',
              },
            },
          },
        },
      },
    },
    'servicedirectory.googleapis.com': {
      projects: {
        PROJECT_NUMBER: {
          locations: {
            LOCATION: {
              namespaces: {
                NAMESPACE: 'servicedirectory.googleapis.com/Namespace',
              },
            },
          },
        },
      },
    },
    'assuredworkloads.googleapis.com': {
      organizations: {
        ORGANIZATION_NUMBER: {
          locations: {
            LOCATION: {
              workloads: {
                WORKLOAD: 'assuredworkloads.googleapis.com/Workload',
              },
            },
          },
        },
      },
    },
    'artifactregistry.googleapis.com': {
      projects: {
        PROJECT_NUMBER: {
          locations: {
            LOCATION: {
              repositories: {
                REPOSITORY: {
                  [EARLY_STOP_KEY]:
                    'artifactregistry.googleapis.com/Repository',
                  dockerimages: {
                    DOCKER_IMAGE: 'artifactregistry.googleapis.com/DockerImage',
                  },
                },
              },
            },
          },
        },
      },
    },
    'apigateway.googleapis.com': {
      projects: {
        PROJECT_NUMBER: {
          locations: {
            LOCATION: {
              apis: {
                API: {
                  [EARLY_STOP_KEY]: 'apigateway.googleapis.com/Api',
                  configs: {
                    CONFIG: 'apigateway.googleapis.com/ApiConfig',
                  },
                },
              },
              gateways: {
                GATEWAY: 'apigateway.googleapis.com/Gateway',
              },
            },
          },
        },
      },
    },
    'redis.googleapis.com': {
      projects: {
        PROJECT_ID: {
          locations: {
            LOCATION: {
              instances: {
                INSTANCE: 'redis.googleapis.com/Instance',
              },
            },
          },
        },
      },
    },
    'memcache.googleapis.com': {
      projects: {
        PROJECT_NUMBER: {
          locations: {
            LOCATION: {
              instances: {
                INSTANCE: 'memcache.googleapis.com/Instance',
              },
            },
          },
        },
      },
    },
    'documentai.googleapis.com': {
      projects: {
        PROJECT_NUMBER: {
          locations: {
            LOCATION: {
              processors: {
                [EARLY_STOP_KEY]: 'documentai.googleapis.com/Processor',
                PROCESSOR: {
                  humanReviewConfig:
                    'documentai.googleapis.com/HumanReviewConfig',
                },
              },
              labelerPools: {
                LABELERPOOL: 'documentai.googleapis.com/LabelerPool',
              },
            },
          },
        },
      },
    },
    'aiplatform.googleapis.com': {
      projects: {
        PROJECT_NUMBER: {
          locations: {
            LOCATION: {
              batchPredictionJobs: {
                BATCH_PREDICTION_JOB:
                  'aiplatform.googleapis.com/BatchPredictionJob',
              },
              customJobs: {
                CUSTOM_JOB: 'aiplatform.googleapis.com/CustomJob',
              },
              dataLabelingJobs: {
                DATA_LABELING_JOB: 'aiplatform.googleapis.com/DataLabelingJob',
              },
              datasets: {
                DATASET: 'aiplatform.googleapis.com/Dataset',
              },
              endpoints: {
                ENDPOINT: 'aiplatform.googleapis.com/Endpoint',
              },
              hyperparameterTuningJobs: {
                HYPERPARAMETER_TUNING_JOB:
                  'aiplatform.googleapis.com/HyperparameterTuningJob',
              },
              models: {
                MODEL: 'aiplatform.googleapis.com/Model',
              },
              specialistPools: {
                SPECIALIST_POOL: 'aiplatform.googleapis.com/SpecialistPool',
              },
              trainingPipelines: {
                TRAINING_PIPELINE: 'aiplatform.googleapis.com/TrainingPipeline',
              },
            },
          },
        },
      },
    },
    'monitoring.googleapis.com': {
      projects: {
        PROJECT_NUMBER: {
          policies: {
            POLICY_NUMBER: 'monitoring.googleapis.com/AlertPolicy',
          },
        },
      },
    },
    'vpcaccess.googleapis.com': {
      projects: {
        PROJECT_NUMBER: {
          locations: {
            LOCATION: {
              connectors: {
                CONNECTOR: 'vpcaccess.googleapis.com/Connector',
              },
            },
          },
        },
      },
    },
  },
};

const NONE = 'NO_DIRECT_J1_RESOURCE_YET';

const GOOGLE_RESOURCE_TO_J1_ENTITY_MAP = {
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
  'sqladmin.googleapis.com/Instance': [
    SQL_ADMIN_MYSQL_INSTANCE_ENTITY_TYPE,
    SQL_ADMIN_POSTGRES_INSTANCE_ENTITY_TYPE,
    SQL_ADMIN_SQL_SERVER_INSTANCE_ENTITY_TYPE,
  ],
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
