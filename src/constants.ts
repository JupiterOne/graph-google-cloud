/**
 * ANY_RESOURCE is used to describe any Google Cloud resource.
 * This includes all assets both ingested and not ingested with this integration
 */
export const ANY_RESOURCE = 'ANY_RESOURCE';

/**
 * A map that goes from google cloud resource
 */
export const CLOUD_RESOURCES_MAP = {
  '//cloudfunctions.googleapis.com': {
    projects: {
      PROJECT_ID: {
        locations: {
          LOCATION: {
            functions: {
              CLOUD_FUNCTION: '//cloudfunctions.googleapis.com/CloudFunction',
            },
          },
        },
      },
    },
  },
  '//cloudresourcemanager.googleapis.com': {
    organizations: {
      ORGANIZATION_NUMBER: '//cloudresourcemanager.googleapis.com/Organization',
    },
    folders: {
      FOLDER_NUMBER: '//cloudresourcemanager.googleapis.com/Folder',
    },
    projects: {
      PROJECT_NUMBER: '//cloudresourcemanager.googleapis.com/Project',
      PROJECT_ID: '//cloudresourcemanager.googleapis.com/Project',
    },
  },
  '//run.googleapis.com': {
    projects: {
      PROJECT_ID: {
        locations: {
          LOCATION: {
            domainmappings: {
              DOMAIN_MAPPING: '//run.googleapis.com/DomainMapping',
            },
            revisions: {
              REVISION: '//run.googleapis.com/Revision',
            },
            services: {
              SERVICE: '//run.googleapis.com/Service',
            },
          },
        },
        regions: {
          REGION: {
            addresses: {
              ADDRESS: '//compute.googleapis.com/Address',
            },
            autoscalers: {
              AUTOSCALER: '//compute.googleapis.com/Autoscaler',
            },
            forwardingRules: {
              FORWARDING_RULE: '//compute.googleapis.com/ForwardingRule',
            },
            instanceGroups: {
              INSTANCE_GROUP: '//compute.googleapis.com/InstanceGroup',
            },
            instanceGroupManager: {
              INSTANCE_GROUP_MANAGER:
                '//compute.googleapis.com/InstanceGroupManager',
            },
            nodeTemplates: {
              NODE_TEMPLATE: '//compute.googleapis.com/NodeTemplate',
            },
          },
          interconnectAttachments: {
            INTERCONNECT_ATTACHMENT:
              '//compute.googleapis.com/InterconnectAttachment',
          },
        },
        global: {
          addresses: {
            ADDRESS: '//compute.googleapis.com/GlobalAddress',
          },
          backendBuckets: {
            BACKEND_BUCKET: '//compute.googleapis.com/BackendBucket',
          },
          backendServices: {
            BACKEND_SERVICE: '//compute.googleapis.com/BackendService',
          },
          externalVpnGateways: {
            EXTERNAL_VPN_GATEWAY: '//compute.googleapis.com/ExternalVpnGateway',
          },
          firewalls: {
            FIREWALL: '//compute.googleapis.com/Firewall',
          },
          healthChecks: {
            HEALTH_CHECK: '//compute.googleapis.com/HealthCheck',
          },
          httpHealthChecks: {
            HTTP_HEALTH_CHECK: '//compute.googleapis.com/HttpHealthCheck',
          },
          httpsHealthChecks: {
            HTTPS_HEALTH_CHECK: '//compute.googleapis.com/HttpsHealthCheck',
          },
          images: {
            IMAGE: '//compute.googleapis.com/Image',
          },
          instanceTemplates: {
            INSTANCE_TEMPLATE: '//compute.googleapis.com/InstanceTemplate',
          },
          interconnects: {
            INTERCONNECT: '//compute.googleapis.com/Interconnect',
          },
          licenses: {
            LICENSE: '//compute.googleapis.com/License',
          },
          networks: {
            NETWORK: '//compute.googleapis.com/Network',
          },
        },
        zones: {
          ZONE: {
            autoscalers: {
              AUTOSCALER: '//compute.googleapis.com/Autoscaler',
            },
            disks: {
              DISKS: '//compute.googleapis.com/Disk',
            },
            instances: {
              INSTANCE: '//compute.googleapis.com/Instance',
            },
            instanceGroups: {
              INSTANCE_GROUP: '//compute.googleapis.com/InstanceGroup',
            },
            instanceGroupManager: {
              INSTANCE_GROUP_MANAGER:
                '//compute.googleapis.com/InstanceGroupManager',
            },
            networkEndpointGroups: {
              NETWORK_ENDPOINT_GROUP:
                '//compute.googleapis.com/NetworkEndpointGroup',
            },
            nodeGroups: {
              NODE_GROUP: '//compute.googleapis.com/NodeGroup',
            },
          },
        },
        region: {
          REGION: {
            commitments: {
              COMMITMENT: '//compute.googleapis.com/Commitment',
            },
          },
        },
      },
    },
  },
  '//compute.googleapis.com': {
    projects: {
      PROJECT_ID: {
        //compute.googleapis.com/Project
        regions: {
          REGION: {
            packetMirrorings: {
              PACKET_MIRRORING: '//compute.googleapis.com/PacketMirroring',
            },
            disks: {
              DISKS: '//compute.googleapis.com/RegionDisk',
            },
            resourcePolicies: {
              RESOURCE_POLICY: '//compute.googleapis.com/ResourcePolicy',
            },
            routers: {
              ROUTER: '//compute.googleapis.com/Router',
            },
            subnetworks: {
              SUBNETWORK: '//compute.googleapis.com/Subnetwork',
            },
            targetPools: {
              TARGET_POOL: '//compute.googleapis.com/TargetPool',
            },
            targetVpnGateways: {
              TARGET_VPN_GATEWAY: '//compute.googleapis.com/TargetVpnGateway',
            },
            vpnGateways: {
              VPN_GATEWAY: '//compute.googleapis.com/VpnGateway',
            },
            vpnTunnels: {
              VPN_TUNNEL: '//compute.googleapis.com/VpnTunnel',
            },
          },
        },
        zones: {
          ZONE: {
            reservations: {
              RESERVATION: '//compute.googleapis.com/Reservation',
            },
            targetInstances: {
              TARGET_INSTANCE: '//compute.googleapis.com/TargetInstance',
            },
          },
        },
        global: {
          routes: {
            ROUTE: '//compute.googleapis.com/Route',
          },
          securityPolicies: {
            SECURITY_POLICY: '//compute.googleapis.com/SecurityPolicy',
          },
          snapshots: {
            SNAPSHOT: '//compute.googleapis.com/Snapshot',
          },
          sslCertificates: {
            SSL_CERTIFICATE: '//compute.googleapis.com/SslCertificate',
          },
          sslPolicies: {
            SSL_POLICY: '//compute.googleapis.com/SslPolicy',
          },
          targetHttpProxies: {
            TARGET_HTTP_PROXY: '//compute.googleapis.com/TargetHttpProxy',
          },
          targetHttpsProxies: {
            TARGET_HTTPS_PROXY: '//compute.googleapis.com/TargetHttpsProxy',
          },
          targetTcpProxies: {
            TARGET_TCP_PROXY: '//compute.googleapis.com/TargetTcpProxy',
          },
          targetSslProxies: {
            TARGET_SSL_PROXY: '//compute.googleapis.com/TargetSslProxy',
          },
          urlMaps: {
            URL_MAP: '//compute.googleapis.com/UrlMap',
          },
        },
      },
    },
  },
  '//appengine.googleapis.com': {
    apps: {
      //appengine.googleapis.com/Application
      APP: {
        services: {
          SERVICE: {
            //appengine.googleapis.com/Service
            versions: {
              VERSION: '//appengine.googleapis.com/Version',
            },
          },
        },
      },
    },
    '//cloudbilling.googleapis.com': {
      billingAccounts: {
        BILLING_ACCOUNT: '//cloudbilling.googleapis.com/BillingAccount',
      },
    },
    '//storage.googleapis.com': {
      BUCKET: '//storage.googleapis.com/BUCKET',
    },
    '//osconfig.googleapis.com': {
      PATCH_DEPLOYMENT: '//osconfig.googleapis.com/PatchDeployment',
    },
    '//dns.googleapis.com': {
      projects: {
        PROJECT_ID: {
          managedZones: {
            ZONE_NUMBER: '//dns.googleapis.com/ManagedZone',
          },
          policies: {
            POLICY_NUMBER: '//dns.googleapis.com/Policy',
          },
        },
      },
    },
    '//spanner.googleapis.com': {
      projects: {
        PROJECT_ID: {
          instances: {
            INSTANCE: {
              //spanner.googleapis.com/Instance
              databases: {
                DATABASE: '//spanner.googleapis.com/Database',
              },
              backups: {
                BACKUP: '//spanner.googleapis.com/Backup',
              },
            },
          },
        },
      },
    },
    '//bigquery.googleapis.com': {
      projects: {
        PROJECT_ID: {
          datasets: {
            DATA_SET: {
              tables: {
                TABLE: '//bigquery.googleapis.com/Table',
              },
            },
            DATASET: '//bigquery.googleapis.com/Dataset',
          },
        },
      },
    },
    '//iam.googleapis.com': {
      projects: {
        PROJECT_ID: {
          roles: {
            ROLE: '//iam.googleapis.com/Role',
          },
          serviceAccounts: {
            SERVICE_ACCOUNT_EMAIL_OR_ID: {
              //iam.googleapis.com/ServiceAccount
              keys: {
                SERVICE_ACCOUNT_KEY: '//iam.googleapis.com/ServiceAccountKey',
              },
            },
          },
        },
      },
    },
    '//pubsub.googleapis.com': {
      projects: {
        PROJECT_ID: {
          topics: {
            TOPIC: '//pubsub.googleapis.com/Topic',
          },
          subscriptions: {
            SUBSCRIPTION: '//pubsub.googleapis.com/Subscription',
          },
          snapshots: {
            SNAPSHOT: '//pubsub.googleapis.com/Snapshot',
          },
        },
      },
    },
    '//dataproc.googleapis.com': {
      projects: {
        PROJECT_ID: {
          regions: {
            REGION: {
              clusters: {
                CLUSTER: '//dataproc.googleapis.com/Cluster',
              },
              jobs: {
                JOB: '//dataproc.googleapis.com/Job',
              },
            },
          },
        },
      },
    },
    '//cloudkms.googleapis.com': {
      projects: {
        PROJECT_ID: {
          locations: {
            LOCATION: {
              keyRings: {
                KEY_RING: {
                  //cloudkms.googleapis.com/KeyRing
                  cryptoKeys: {
                    CRYPTO_KEY: {
                      //cloudkms.googleapis.com/CryptoKey
                      cryptoKeyVersions: {
                        CRYPTO_KEY_VERSION:
                          '//cloudkms.googleapis.com/CryptoKeyVersion',
                      },
                    },
                  },
                  importJobs: {
                    IMPORT_JOBS: '//cloudkms.googleapis.com/ImportJob',
                  },
                },
              },
            },
          },
        },
      },
    },
    '//container.googleapis.com': {
      projects: {
        PROJECT_ID: {
          locations: {
            LOCATION: {
              clusters: {
                CLUSTER: '//container.googleapis.com/Cluster',
              },
            },
          },
          zones: {
            ZONE: {
              clusters: {
                CLUSTER: {
                  //container.googleapis.com/Cluster
                  k8s: {
                    nodes: {
                      NODE: '//k8s.io/Node',
                    },
                    namespaces: {
                      NAMESPACE: {
                        //k8s.io/Namespace
                        pods: {
                          POD: '//k8s.io/Pod',
                        },
                        services: {
                          SERVICE: '//k8s.io/Service',
                        },
                        'rbac.authorization.k8s.io': {
                          roles: {
                            ROLE: '//rbac.authorization.k8s.io',
                          },
                          rolebindings: {
                            ROLEBINDING: '//rbac.authorization.k8s.io',
                          },
                        },
                        extensions: {
                          ingresses: {
                            INGRESS: '//extensions.k8s.io/Ingress',
                          },
                        },
                        'networking.k8s.io': {
                          ingresses: {
                            INGRESS: '//networking.k8s.io/Ingress',
                          },
                          networkpolicies: {
                            NETWORKPOLICY: '//networking.k8s.io/Networkpolicy',
                          },
                        },
                      },
                    },
                    'rbac.authorization.k8s.io': {
                      clusterroles: {
                        CLUSTER_ROLE: '//rbac.authorization.k8s.io',
                      },
                      clusterrolebindings: {
                        CLUSTER_ROLE_BINDING: '//rbac.authorization.k8s.io',
                      },
                    },
                  },
                  nodePools: {
                    NODE_POOL: '//container.googleapis.com/NodePool',
                  },
                },
              },
            },
          },
        },
      },
    },
    '//cloudsql.googleapis.com': {
      projects: {
        PROJECT_ID: {
          instances: {
            INSTANCE: '//sqladmin.googleapis.com/Instance',
          },
        },
      },
    },
    '//bigtable.googleapis.com': {
      projects: {
        PROJECT_ID: {
          instances: {
            INSTANCE: {
              //bigtableadmin.googleapis.com/Instance
              appProfiles: {
                APP_PROFILE: '//bigtableadmin.googleapis.com/AppProfile',
              },
              tables: {
                TABLE: '//bigtableadmin.googleapis.com/Table',
              },
              clusters: {
                CLUSTER: {
                  //bigtableadmin.googleapis.com/Cluster
                  backups: {
                    BACKUP: '//bigtableadmin.googleapis.com/Backup',
                  },
                },
              },
            },
          },
        },
      },
    },
    '//serviceusage.googleapis.com': {
      projects: {
        PROJECT_NUMBER: {
          services: {
            SERVICE: '//serviceusage.googleapis.com/Service',
          },
        },
      },
    },
    '//datafusion.googleapis.com': {
      projects: {
        PROJECT_ID: {
          locations: {
            LOCATION: {
              instances: {
                INSTANCE: '//datafusion.googleapis.com/Instance',
              },
            },
          },
        },
      },
    },
    '//logging.googleapis.com': {
      projects: {
        PROJECT_NUMBER: {
          locations: {
            LOCATION: {
              buckets: {
                BUCKET: '//logging.googleapis.com/LogBucket',
              },
            },
          },
          sinks: {
            SINK: '//logging.googleapis.com/LogSink',
          },
          metrics: {
            METRIC: '//logging.googleapis.com/LogMetric',
          },
        },
      },
      folders: {
        FOLDER_NUMBER: {
          sinks: {
            SINK: '//logging.googleapis.com/LogSink',
          },
        },
      },
      organizations: {
        ORGANIZATION_NUMBER: {
          sinks: {
            SINK: '//logging.googleapis.com/LogSink',
          },
        },
      },
      billingAccounts: {
        BILLING_ACCOUNT_ID: {
          sinks: {
            SINK: '//logging.googleapis.com/LogSink',
          },
        },
      },
    },
    '//networkmanagement.googleapis.com': {
      projects: {
        PROJECT_ID: {
          locations: {
            global: {
              connectivityTests: {
                TEST: '//networkmanagement.googleapis.com/ConnectivityTest',
              },
            },
          },
        },
      },
    },
    '//managedidentities.googleapis.com': {
      projects: {
        PROJECT_ID: {
          locations: {
            global: {
              domains: {
                DOMAIN: '//managedidentities.googleapis.com/Domain',
              },
            },
          },
        },
      },
    },
    '//privateca.googleapis.com': {
      projects: {
        PROJECT_ID: {
          locations: {
            LOCATION: {
              caPools: {
                CA_POOL_ID: {
                  //privateca.googleapis.com/CaPool
                  certificateAuthorities: {
                    CERTIFICATE_AUTHORITIES_ID: {
                      //privateca.googleapis.com/CertificateAuthority
                      certificateRevocationLists: {
                        CERTIFICATE_REVOCATION_LISTS_ID:
                          '//privateca.googleapis.com/CertificateRevocationList',
                      },
                    },
                  },
                },
              },
              certificateTemplates: {
                CERTIFICATE_TEMPLATES_ID:
                  '//privateca.googleapis.com/CertificateTemplate',
              },
            },
          },
        },
      },
    },
    '//dataflow.googleapis.com': {
      projects: {
        PROJECT_ID: {
          locations: {
            LOCATION: {
              jobs: {
                JOB: '//dataflow.googleapis.com/Job',
              },
            },
          },
        },
      },
    },
    '//gameservices.googleapis.com': {
      projects: {
        PROJECT_ID: {
          locations: {
            global: {
              realms: {
                REALM_ID: {
                  //gameservices.googleapis.com/Realm
                  gameServerClusters: {
                    GAME_SERVER_CLUSTER_ID:
                      '//gameservices.googleapis.com/GameServerCluster',
                  },
                },
              },
              gameServerDeployments: {
                GAME_SERVER_DEPLOYMENTS_ID: {
                  //gameservices.googleapis.com/GameServerDeployment
                  configs: {
                    CONFIG_ID: '//gameservices.googleapis.com/GameServerConfig',
                  },
                },
              },
            },
          },
        },
      },
    },
    '//gkehub.googleapis.com': {
      projects: {
        PROJECT_ID: {
          locations: {
            global: {
              memberships: {
                MEMBERSHIP: '//gkehub.googleapis.com/Membership',
              },
            },
          },
        },
      },
    },
    '//secretmanager.googleapis.com': {
      projects: {
        PROJECT_NUMBER: {
          secrets: {
            SECRET: {
              //secretmanager.googleapis.com/Secret
              versions: {
                VERSION: '//secretmanager.googleapis.com/SecretVersion',
              },
            },
          },
        },
      },
    },
    '//tpu.googleapis.com': {
      projects: {
        PROJECT_NUMBER: {
          locations: {
            LOCATION: {
              nodes: {
                NODE_ID: '//tpu.googleapis.com/Node',
              },
            },
          },
        },
      },
    },
    '//composer.googleapis.com': {
      projects: {
        PROJECT_NUMBER: {
          locations: {
            LOCATION: {
              environments: {
                ENVIRONMENT: '//composer.googleapis.com/Environment',
              },
            },
          },
        },
      },
    },
    '//file.googleapis.com': {
      projects: {
        PROJECT_NUMBER: {
          locations: {
            LOCATION: {
              instances: {
                INSTANCE: '//file.googleapis.com/Instance',
              },
              backups: {
                BACKUP: '//file.googleapis.com/Backup',
              },
            },
          },
        },
      },
    },
    '//servicedirectory.googleapis.com': {
      projects: {
        PROJECT_NUMBER: {
          locations: {
            LOCATION: {
              namespaces: {
                NAMESPACE: '//servicedirectory.googleapis.com/Namespace',
              },
            },
          },
        },
      },
    },
    '//assuredworkloads.googleapis.com': {
      organizations: {
        ORGANIZATION_NUMBER: {
          locations: {
            LOCATION: {
              workloads: {
                WORKLOAD: '//assuredworkloads.googleapis.com/Workload',
              },
            },
          },
        },
      },
    },
    '//artifactregistry.googleapis.com': {
      projects: {
        PROJECT_NUMBER: {
          locations: {
            LOCATION: {
              repositories: {
                REPOSITORY: {
                  //artifactregistry.googleapis.com/Repository
                  dockerimages: {
                    DOCKER_IMAGE:
                      '//artifactregistry.googleapis.com/DockerImage',
                  },
                },
              },
            },
          },
        },
      },
    },
    '//apigateway.googleapis.com': {
      projects: {
        PROJECT_NUMBER: {
          locations: {
            LOCATION: {
              apis: {
                API: {
                  //apigateway.googleapis.com/Api
                  configs: {
                    CONFIG: '//apigateway.googleapis.com/ApiConfig',
                  },
                },
              },
              gateways: {
                GATEWAY: '//apigateway.googleapis.com/Gateway',
              },
            },
          },
        },
      },
    },
    '//redis.googleapis.com': {
      projects: {
        PROJECT_ID: {
          locations: {
            LOCATION: {
              instances: {
                INSTANCE: '//redis.googleapis.com/Instance',
              },
            },
          },
        },
      },
    },
    '//memcache.googleapis.com': {
      projects: {
        PROJECT_NUMBER: {
          locations: {
            LOCATION: {
              instances: {
                INSTANCE: '//memcache.googleapis.com/Instance',
              },
            },
          },
        },
      },
    },
    '//documentai.googleapis.com': {
      projects: {
        PROJECT_NUMBER: {
          locations: {
            LOCATION: {
              processors: {
                PROCESSOR: {
                  humanReviewConfig:
                    '//documentai.googleapis.com/HumanReviewConfig',
                },
              },
              labelerPools: {
                LABELERPOOL: '//documentai.googleapis.com/LabelerPool',
              },
              processors: {
                PROCESSOR: '//documentai.googleapis.com/Processor',
              },
            },
          },
        },
      },
    },
    '//aiplatform.googleapis.com': {
      projects: {
        PROJECT_NUMBER: {
          locations: {
            LOCATION: {
              batchPredictionJobs: {
                BATCH_PREDICTION_JOB:
                  '//aiplatform.googleapis.com/BatchPredictionJob',
              },
              customJobs: {
                CUSTOM_JOB: '//aiplatform.googleapis.com/CustomJob',
              },
              dataLabelingJobs: {
                DATA_LABELING_JOB:
                  '//aiplatform.googleapis.com/DataLabelingJob',
              },
              datasets: {
                DATASET: '//aiplatform.googleapis.com/Dataset',
              },
              endpoints: {
                ENDPOINT: '//aiplatform.googleapis.com/Endpoint',
              },
              hyperparameterTuningJobs: {
                HYPERPARAMETER_TUNING_JOB:
                  '//aiplatform.googleapis.com/HyperparameterTuningJob',
              },
              models: {
                MODEL: '//aiplatform.googleapis.com/Model',
              },
              specialistPools: {
                SPECIALIST_POOL: '//aiplatform.googleapis.com/SpecialistPool',
              },
              trainingPipelines: {
                TRAINING_PIPELINE:
                  '//aiplatform.googleapis.com/TrainingPipeline',
              },
            },
          },
        },
      },
    },
    '//monitoring.googleapis.com': {
      projects: {
        PROJECT_NUMBER: {
          policies: {
            POLICY_NUMBER: '//monitoring.googleapis.com/AlertPolicy',
          },
        },
      },
    },
    '//vpcaccess.googleapis.com': {
      projects: {
        PROJECT_NUMBER: {
          locations: {
            LOCATION: {
              connectors: {
                CONNECTOR: '//vpcaccess.googleapis.com/Connector',
              },
            },
          },
        },
      },
    },
  },
};
