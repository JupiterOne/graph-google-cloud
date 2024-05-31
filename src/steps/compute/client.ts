import { BaseExternalAccountClient } from 'google-auth-library';
import { compute_v1, google, osconfig_v1 } from 'googleapis';
import { Client, PageableGaxiosResponse } from '../../google-cloud/client';
import { iterateRegions, iterateRegionZones } from '../../google-cloud/regions';
import {
  ComputePermissions,
  STEP_COMPUTE_ADDRESSES,
  STEP_COMPUTE_BACKEND_BUCKETS,
  STEP_COMPUTE_BACKEND_SERVICES,
  STEP_COMPUTE_DISKS,
  STEP_COMPUTE_DISK_IMAGE_RELATIONSHIPS,
  STEP_COMPUTE_ENGINE_AUTOSCALERS,
  STEP_COMPUTE_FIREWALLS,
  STEP_COMPUTE_FORWARDING_RULES,
  STEP_COMPUTE_GLOBAL_ADDRESSES,
  STEP_COMPUTE_GLOBAL_FORWARDING_RULES,
  STEP_COMPUTE_HEALTH_CHECKS,
  STEP_COMPUTE_IMAGES,
  STEP_COMPUTE_INSTANCES,
  STEP_COMPUTE_INSTANCE_GROUPS,
  STEP_COMPUTE_LOADBALANCERS,
  STEP_COMPUTE_NETWORKS,
  STEP_COMPUTE_PROJECT,
  STEP_COMPUTE_REGION_BACKEND_SERVICES,
  STEP_COMPUTE_REGION_DISKS,
  STEP_COMPUTE_REGION_HEALTH_CHECKS,
  STEP_COMPUTE_REGION_INSTANCE_GROUPS,
  STEP_COMPUTE_REGION_LOADBALANCERS,
  STEP_COMPUTE_REGION_TARGET_HTTPS_PROXIES,
  STEP_COMPUTE_REGION_TARGET_HTTP_PROXIES,
  STEP_COMPUTE_SNAPSHOTS,
  STEP_COMPUTE_SSL_POLICIES,
  STEP_COMPUTE_SUBNETWORKS,
  STEP_COMPUTE_TARGET_HTTPS_PROXIES,
  STEP_COMPUTE_TARGET_HTTP_PROXIES,
  STEP_COMPUTE_TARGET_SSL_PROXIES,
  regions,
  zones,
} from './constants';

export class ComputeClient extends Client {
  private client = google.compute({ version: 'v1', retry: false });
  private osConfigClient = google.osconfig({ version: 'v1', retry: false });

  private async iterateComputeApi<T>(
    fn: (params: {
      auth: BaseExternalAccountClient;
      zone: string;
      nextPageToken?: string;
    }) => Promise<PageableGaxiosResponse<T>>,
    callback: (data: T) => Promise<void>,
    stepId: string,
    suggestedPermissions: string[],
  ) {
    const auth = await this.getAuthenticatedServiceClient();

    await iterateRegionZones(async (zone) => {
      await this.iterateApi(
        async (nextPageToken) => fn({ auth, zone, nextPageToken }),
        callback,
        stepId,
        suggestedPermissions,
      );
    });
  }

  async iterateComputeRegionDisks(
    callback: (data: compute_v1.Schema$Disk) => Promise<void>,
  ) {
    const auth = await this.getAuthenticatedServiceClient();

    await iterateRegions(async (region) => {
      await this.iterateApi(
        async (nextPageToken) => {
          return this.client.regionDisks.list({
            auth,
            region,
            pageToken: nextPageToken,
            project: this.projectId,
          });
        },
        async (data: compute_v1.Schema$DiskList) => {
          for (const item of data.items || []) {
            await callback(item);
          }
        },
        STEP_COMPUTE_REGION_DISKS,
        ComputePermissions.STEP_COMPUTE_REGION_DISKS,
      );
    });
  }

  async iterateComputeDisks(
    callback: (data: compute_v1.Schema$Disk) => Promise<void>,
  ) {
    await this.iterateComputeApi(
      async ({ auth, zone, nextPageToken }) => {
        return this.client.disks.list({
          auth,
          pageToken: nextPageToken,
          project: this.projectId,
          zone,
        });
      },
      async (data: compute_v1.Schema$DiskList) => {
        for (const item of data.items || []) {
          await callback(item);
        }
      },
      STEP_COMPUTE_DISKS,
      ['compute.disks.list'],
    );
  }

  async iterateComputeSnapshots(
    callback: (data: compute_v1.Schema$Snapshot) => Promise<void>,
  ) {
    const auth = await this.getAuthenticatedServiceClient();

    await this.iterateApi(
      async (nextPageToken) => {
        return this.client.snapshots.list({
          auth,
          pageToken: nextPageToken,
          project: this.projectId,
        });
      },
      async (data: compute_v1.Schema$SnapshotList) => {
        for (const item of data.items || []) {
          await callback(item);
        }
      },
      STEP_COMPUTE_SNAPSHOTS,
      ComputePermissions.STEP_COMPUTE_SNAPSHOTS,
    );
  }

  async iterateComputeGlobalAddresses(
    callback: (data: compute_v1.Schema$Address) => Promise<void>,
  ) {
    const auth = await this.getAuthenticatedServiceClient();

    await this.iterateApi(
      async (nextPageToken) => {
        return this.client.globalAddresses.list({
          auth,
          project: this.projectId,
          pageToken: nextPageToken,
        });
      },
      async (data: compute_v1.Schema$AddressList) => {
        for (const item of data.items || []) {
          await callback(item);
        }
      },
      STEP_COMPUTE_GLOBAL_ADDRESSES,
      ComputePermissions.STEP_COMPUTE_GLOBAL_ADDRESSES,
    );
  }

  // This seems to be similar to region counterpart
  // It requires region as a parameter plus there's GlobalAddress
  // Unfortunately, Terraform doesn't call it google_compute_region_address so neither will we.
  async iterateComputeAddresses(
    callback: (data: compute_v1.Schema$Address) => Promise<void>,
  ) {
    const auth = await this.getAuthenticatedServiceClient();

    await iterateRegions(async (region) => {
      await this.iterateApi(
        async (nextPageToken) => {
          return this.client.addresses.list({
            auth,
            region,
            project: this.projectId,
            pageToken: nextPageToken,
          });
        },
        async (data: compute_v1.Schema$AddressList) => {
          for (const item of data.items || []) {
            await callback(item);
          }
        },
        STEP_COMPUTE_ADDRESSES,
        ComputePermissions.STEP_COMPUTE_ADDRESSES,
      );
    });
  }

  async fetchComputeImagePolicy(
    name: string,
  ): Promise<compute_v1.Schema$Policy | undefined> {
    const auth = await this.getAuthenticatedServiceClient();

    const resp = await this.withErrorHandling(
      () =>
        this.client.images.getIamPolicy({
          auth,
          project: this.projectId,
          resource: name,
        }),
      this.logger,
      {
        stepId: STEP_COMPUTE_IMAGES,
        suggestedPermissions: ComputePermissions.STEP_COMPUTE_IMAGES,
      },
    );

    return resp?.data;
  }

  async fetchComputeImage(
    name: string,
    projectId: string,
  ): Promise<compute_v1.Schema$Image | undefined> {
    const auth = await this.getAuthenticatedServiceClient();

    const resp = await this.withErrorHandling(
      () =>
        this.client.images.get({
          auth,
          image: name,
          // allow us to use the same method for both custom and public images
          project: projectId,
        }),
      this.logger,
      {
        stepId: STEP_COMPUTE_DISK_IMAGE_RELATIONSHIPS,
        suggestedPermissions:
          ComputePermissions.STEP_COMPUTE_DISK_IMAGE_RELATIONSHIPS,
      },
    );

    return resp?.data;
  }

  async iterateGlobalForwardingRules(
    callback: (data: compute_v1.Schema$ForwardingRule) => Promise<void>,
  ) {
    const auth = await this.getAuthenticatedServiceClient();
    await this.iterateApi(
      async (nextPageToken) => {
        return this.client.globalForwardingRules.list({
          auth,
          project: this.projectId,
          pageToken: nextPageToken,
        });
      },
      async (data: compute_v1.Schema$ForwardingRuleList) => {
        for (const item of data.items || []) {
          await callback(item);
        }
      },
      STEP_COMPUTE_GLOBAL_FORWARDING_RULES,
      ComputePermissions.STEP_COMPUTE_GLOBAL_FORWARDING_RULES,
    );
  }

  async iterateForwardingRules(
    callback: (data: compute_v1.Schema$ForwardingRule) => Promise<void>,
  ) {
    const auth = await this.getAuthenticatedServiceClient();

    await iterateRegions(async (region) => {
      await this.iterateApi(
        async (nextPageToken) => {
          return this.client.forwardingRules.list({
            auth,
            region,
            project: this.projectId,
            pageToken: nextPageToken,
          });
        },
        async (data: compute_v1.Schema$ForwardingRuleList) => {
          for (const item of data.items || []) {
            await callback(item);
          }
        },
        STEP_COMPUTE_FORWARDING_RULES,
        ComputePermissions.STEP_COMPUTE_FORWARDING_RULES,
      );
    });
  }

  async iterateCustomComputeImages(
    callback: (data: compute_v1.Schema$Image) => Promise<void>,
  ) {
    const auth = await this.getAuthenticatedServiceClient();

    await this.iterateApi(
      async (nextPageToken) => {
        return this.client.images.list({
          auth,
          pageToken: nextPageToken,
          project: this.projectId,
        });
      },
      async (data: compute_v1.Schema$ImageList) => {
        for (const item of data.items || []) {
          await callback(item);
        }
      },
      STEP_COMPUTE_IMAGES,
      ComputePermissions.STEP_COMPUTE_IMAGES,
    );
  }

  async fetchComputeProject(): Promise<compute_v1.Schema$Project | undefined> {
    const auth = await this.getAuthenticatedServiceClient();

    const computeProjectResponse = await this.withErrorHandling(
      () =>
        this.client.projects.get({
          auth: auth,
          project: this.projectId,
        }),
      this.logger,
      {
        stepId: STEP_COMPUTE_PROJECT,
        suggestedPermissions: ComputePermissions.STEP_COMPUTE_PROJECT,
      },
    );

    return computeProjectResponse?.data;
  }

  // CAN'T: iterateRegionComputeInstances => this.client.regionInstances (missing .list())

  async iterateComputeInstances(
    callback: (
      data: compute_v1.Schema$Instance,
      projectId: string,
    ) => Promise<void>,
  ): Promise<void> {
    await this.iterateComputeApi(
      async ({ auth, zone, nextPageToken }) => {
        return this.client.instances.list({
          auth,
          pageToken: nextPageToken,
          project: this.projectId,
          zone,
        });
      },
      async (data: compute_v1.Schema$InstanceList) => {
        for (const item of data.items || []) {
          await callback(item, this.projectId);
        }
      },
      STEP_COMPUTE_INSTANCES,
      ['compute.instances.list', 'osconfig.inventories.get'],
    );
  }

  async fetchComputeInstanceInventory(
    location: string,
    instanceId: string,
  ): Promise<osconfig_v1.Schema$Inventory | undefined> {
    const auth = await this.getAuthenticatedServiceClient();

    const resp = await this.withErrorHandling(
      () =>
        this.osConfigClient.projects.locations.instances.inventories.get({
          auth,
          name: `projects/${this.projectId}/locations/${location}/instances/${instanceId}/inventory`,
        }),
      this.logger,
      {
        stepId: STEP_COMPUTE_INSTANCES,
        suggestedPermissions: ComputePermissions.STEP_COMPUTE_INSTANCES,
      },
    );

    return resp?.data;
  }

  async iterateFirewalls(
    callback: (data: compute_v1.Schema$Firewall) => Promise<void>,
  ): Promise<void> {
    const auth = await this.getAuthenticatedServiceClient();

    await this.iterateApi(
      async (nextPageToken) => {
        return this.client.firewalls.list({
          auth,
          pageToken: nextPageToken,
          project: this.projectId,
        });
      },
      async (data: compute_v1.Schema$FirewallList) => {
        for (const item of data.items || []) {
          await callback(item);
        }
      },
      STEP_COMPUTE_FIREWALLS,
      ComputePermissions.STEP_COMPUTE_FIREWALLS,
    );
  }

  async iterateSubnetworks(
    callback: (data: compute_v1.Schema$Subnetwork) => Promise<void>,
  ): Promise<void> {
    const auth = await this.getAuthenticatedServiceClient();
    await iterateRegions(async (region) => {
      await this.iterateApi(
        async (nextPageToken) => {
          return this.client.subnetworks.list({
            auth,
            pageToken: nextPageToken,
            project: this.projectId,
            region: region,
          });
        },
        async (data: compute_v1.Schema$NetworkList) => {
          for (const item of data.items || []) {
            await callback(item);
          }
        },
        STEP_COMPUTE_SUBNETWORKS,
        ComputePermissions.STEP_COMPUTE_SUBNETWORKS,
      );
    });
  }

  async iterateNetworks(
    callback: (data: compute_v1.Schema$Network) => Promise<void>,
  ): Promise<void> {
    const auth = await this.getAuthenticatedServiceClient();
    await this.iterateApi(
      async (nextPageToken) => {
        return this.client.networks.list({
          auth,
          pageToken: nextPageToken,
          project: this.projectId,
        });
      },
      async (data: compute_v1.Schema$NetworkList) => {
        for (const item of data.items || []) {
          await callback(item);
        }
      },
      STEP_COMPUTE_NETWORKS,
      ComputePermissions.STEP_COMPUTE_NETWORKS,
    );
  }

  async iterateRegionHealthChecks(
    callback: (data: compute_v1.Schema$HealthCheck) => Promise<void>,
  ): Promise<void> {
    const auth = await this.getAuthenticatedServiceClient();

    await iterateRegions(async (region) => {
      await this.iterateApi(
        async (nextPageToken) => {
          return this.client.regionHealthChecks.list({
            auth,
            region,
            pageToken: nextPageToken,
            project: this.projectId,
          });
        },
        async (data: compute_v1.Schema$HealthCheckList) => {
          for (const item of data.items || []) {
            await callback(item);
          }
        },
        STEP_COMPUTE_REGION_HEALTH_CHECKS,
        ComputePermissions.STEP_COMPUTE_REGION_HEALTH_CHECKS,
      );
    });
  }

  async iterateHealthChecks(
    callback: (data: compute_v1.Schema$HealthCheck) => Promise<void>,
  ): Promise<void> {
    const auth = await this.getAuthenticatedServiceClient();
    await this.iterateApi(
      async (nextPageToken) => {
        return this.client.healthChecks.list({
          auth,
          pageToken: nextPageToken,
          project: this.projectId,
        });
      },
      async (data: compute_v1.Schema$HealthCheckList) => {
        for (const item of data.items || []) {
          await callback(item);
        }
      },
      STEP_COMPUTE_HEALTH_CHECKS,
      ComputePermissions.STEP_COMPUTE_HEALTH_CHECKS,
    );
  }

  async iterateRegionInstanceGroups(
    callback: (data: compute_v1.Schema$InstanceGroup) => Promise<void>,
  ): Promise<void> {
    const auth = await this.getAuthenticatedServiceClient();

    await iterateRegions(async (region) => {
      await this.iterateApi(
        async (nextPageToken) => {
          return this.client.regionInstanceGroups.list({
            auth,
            region,
            pageToken: nextPageToken,
            project: this.projectId,
          });
        },
        async (data: compute_v1.Schema$RegionInstanceGroupList) => {
          for (const item of data.items || []) {
            await callback(item);
          }
        },
        STEP_COMPUTE_REGION_INSTANCE_GROUPS,
        ComputePermissions.STEP_COMPUTE_REGION_INSTANCE_GROUPS,
      );
    });
  }

  async iterateInstanceGroups(
    callback: (data: compute_v1.Schema$InstanceGroup) => Promise<void>,
  ): Promise<void> {
    await this.iterateComputeApi(
      async ({ auth, zone, nextPageToken }) => {
        return this.client.instanceGroups.list({
          auth,
          pageToken: nextPageToken,
          project: this.projectId,
          zone,
        });
      },
      async (data: compute_v1.Schema$InstanceGroupList) => {
        for (const item of data.items || []) {
          await callback(item);
        }
      },
      STEP_COMPUTE_INSTANCE_GROUPS,
      ['compute.instanceGroups.list'],
    );
  }

  async iterateRegionLoadBalancers(
    callback: (data: compute_v1.Schema$UrlMap) => Promise<void>,
  ): Promise<void> {
    const auth = await this.getAuthenticatedServiceClient();

    await iterateRegions(async (region) => {
      await this.iterateApi(
        async (nextPageToken) => {
          return this.client.regionUrlMaps.list({
            auth,
            region,
            pageToken: nextPageToken,
            project: this.projectId,
          });
        },
        async (data: compute_v1.Schema$UrlMapList) => {
          for (const item of data.items || []) {
            await callback(item);
          }
        },
        STEP_COMPUTE_REGION_LOADBALANCERS,
        ComputePermissions.STEP_COMPUTE_REGION_LOADBALANCERS,
      );
    });
  }

  async iterateLoadBalancers(
    callback: (data: compute_v1.Schema$UrlMap) => Promise<void>,
  ): Promise<void> {
    const auth = await this.getAuthenticatedServiceClient();
    await this.iterateApi(
      async (nextPageToken) => {
        return this.client.urlMaps.list({
          auth,
          pageToken: nextPageToken,
          project: this.projectId,
        });
      },
      async (data: compute_v1.Schema$UrlMapList) => {
        for (const item of data.items || []) {
          await callback(item);
        }
      },
      STEP_COMPUTE_LOADBALANCERS,
      ComputePermissions.STEP_COMPUTE_LOADBALANCERS,
    );
  }

  async iterateRegionBackendServices(
    callback: (data: compute_v1.Schema$BackendService) => Promise<void>,
  ): Promise<void> {
    const auth = await this.getAuthenticatedServiceClient();

    await iterateRegions(async (region) => {
      await this.iterateApi(
        async (nextPageToken) => {
          return this.client.regionBackendServices.list({
            auth,
            region,
            pageToken: nextPageToken,
            project: this.projectId,
          });
        },
        async (data: compute_v1.Schema$BackendServiceList) => {
          for (const item of data.items || []) {
            await callback(item);
          }
        },
        STEP_COMPUTE_REGION_BACKEND_SERVICES,
        ComputePermissions.STEP_COMPUTE_REGION_BACKEND_SERVICES,
      );
    });
  }

  async iterateBackendServices(
    callback: (data: compute_v1.Schema$BackendService) => Promise<void>,
  ): Promise<void> {
    const auth = await this.getAuthenticatedServiceClient();

    await this.iterateApi(
      async (nextPageToken) => {
        return this.client.backendServices.list({
          auth,
          pageToken: nextPageToken,
          project: this.projectId,
        });
      },
      async (data: compute_v1.Schema$BackendServiceList) => {
        for (const item of data.items || []) {
          await callback(item);
        }
      },
      STEP_COMPUTE_BACKEND_SERVICES,
      ComputePermissions.STEP_COMPUTE_BACKEND_SERVICES,
    );
  }

  async iterateBackendBuckets(
    callback: (data: compute_v1.Schema$BackendBucket) => Promise<void>,
  ): Promise<void> {
    const auth = await this.getAuthenticatedServiceClient();
    await this.iterateApi(
      async (nextPageToken) => {
        return this.client.backendBuckets.list({
          auth,
          pageToken: nextPageToken,
          project: this.projectId,
        });
      },
      async (data: compute_v1.Schema$BackendBucketList) => {
        for (const item of data.items || []) {
          await callback(item);
        }
      },
      STEP_COMPUTE_BACKEND_BUCKETS,
      ComputePermissions.STEP_COMPUTE_BACKEND_BUCKETS,
    );
  }

  async iterateTargetSslProxies(
    callback: (data: compute_v1.Schema$TargetSslProxy) => Promise<void>,
  ): Promise<void> {
    const auth = await this.getAuthenticatedServiceClient();
    await this.iterateApi(
      async (nextPageToken) => {
        return this.client.targetSslProxies.list({
          auth,
          pageToken: nextPageToken,
          project: this.projectId,
        });
      },
      async (data: compute_v1.Schema$TargetSslProxyList) => {
        for (const item of data.items || []) {
          await callback(item);
        }
      },
      STEP_COMPUTE_TARGET_SSL_PROXIES,
      ComputePermissions.STEP_COMPUTE_TARGET_SSL_PROXIES,
    );
  }

  async iterateRegionTargetHttpsProxies(
    callback: (data: compute_v1.Schema$TargetHttpsProxy) => Promise<void>,
  ): Promise<void> {
    const auth = await this.getAuthenticatedServiceClient();

    await iterateRegions(async (region) => {
      await this.iterateApi(
        async (nextPageToken) => {
          return this.client.regionTargetHttpsProxies.list({
            auth,
            region,
            pageToken: nextPageToken,
            project: this.projectId,
          });
        },
        async (data: compute_v1.Schema$TargetHttpsProxyList) => {
          for (const item of data.items || []) {
            await callback(item);
          }
        },
        STEP_COMPUTE_REGION_TARGET_HTTPS_PROXIES,
        ComputePermissions.STEP_COMPUTE_REGION_TARGET_HTTPS_PROXIES,
      );
    });
  }

  async iterateTargetHttpsProxies(
    callback: (data: compute_v1.Schema$TargetHttpsProxy) => Promise<void>,
  ): Promise<void> {
    const auth = await this.getAuthenticatedServiceClient();

    await this.iterateApi(
      async (nextPageToken) => {
        return this.client.targetHttpsProxies.list({
          auth,
          pageToken: nextPageToken,
          project: this.projectId,
        });
      },
      async (data: compute_v1.Schema$TargetHttpsProxyList) => {
        for (const item of data.items || []) {
          await callback(item);
        }
      },
      STEP_COMPUTE_TARGET_HTTPS_PROXIES,
      ComputePermissions.STEP_COMPUTE_TARGET_HTTPS_PROXIES,
    );
  }

  async iterateRegionTargetHttpProxies(
    callback: (data: compute_v1.Schema$TargetHttpProxy) => Promise<void>,
  ): Promise<void> {
    const auth = await this.getAuthenticatedServiceClient();

    await iterateRegions(async (region) => {
      await this.iterateApi(
        async (nextPageToken) => {
          return this.client.regionTargetHttpProxies.list({
            auth,
            region,
            pageToken: nextPageToken,
            project: this.projectId,
          });
        },
        async (data: compute_v1.Schema$TargetHttpProxyList) => {
          for (const item of data.items || []) {
            await callback(item);
          }
        },
        STEP_COMPUTE_REGION_TARGET_HTTP_PROXIES,
        ComputePermissions.STEP_COMPUTE_REGION_TARGET_HTTP_PROXIES,
      );
    });
  }

  async iterateTargetHttpProxies(
    callback: (data: compute_v1.Schema$TargetHttpProxy) => Promise<void>,
  ): Promise<void> {
    const auth = await this.getAuthenticatedServiceClient();
    await this.iterateApi(
      async (nextPageToken) => {
        return this.client.targetHttpProxies.list({
          auth,
          pageToken: nextPageToken,
          project: this.projectId,
        });
      },
      async (data: compute_v1.Schema$TargetHttpProxyList) => {
        for (const item of data.items || []) {
          await callback(item);
        }
      },
      STEP_COMPUTE_TARGET_HTTP_PROXIES,
      ComputePermissions.STEP_COMPUTE_TARGET_HTTP_PROXIES,
    );
  }

  async iterateSslPolicies(
    callback: (data: compute_v1.Schema$SslPolicy) => Promise<void>,
  ): Promise<void> {
    const auth = await this.getAuthenticatedServiceClient();
    await this.iterateApi(
      async (nextPageToken) => {
        return this.client.sslPolicies.list({
          auth,
          pageToken: nextPageToken,
          project: this.projectId,
        });
      },
      async (data: compute_v1.Schema$SslPoliciesList) => {
        for (const item of data.items || []) {
          await callback(item);
        }
      },
      STEP_COMPUTE_SSL_POLICIES,
      ComputePermissions.STEP_COMPUTE_SSL_POLICIES,
    );
  }

  async iterateComputeAutoscaler(
    callback: (data: compute_v1.Schema$AutoscalerList) => Promise<void>,
  ): Promise<void> {
    const auth = await this.getAuthenticatedServiceClient();

    // Iterate over each zone
    for (const zone of zones) {
      await this.iterateApi(
        async (nextPageToken) => {
          return this.client.autoscalers.list({
            auth,
            pageToken: nextPageToken,
            project: this.projectId,
            zone: zone,
          });
        },
        async (data: compute_v1.Schema$AutoscalerList) => {
          for (const item of data.items || []) {
            await callback(item);
          }
        },
        STEP_COMPUTE_ENGINE_AUTOSCALERS,
        ComputePermissions.STEP_COMPUTE_ENGINE_AUTOSCALERS,
      );
    }
  }

  async iterateComputeRegionAutoscaler(
    callback: (data: compute_v1.Schema$RegionAutoscalerList) => Promise<void>,
  ): Promise<void> {
    const auth = await this.getAuthenticatedServiceClient();

    // Iterate over each region
    for (const region of regions) {
      await this.iterateApi(
        async (nextPageToken) => {
          return this.client.regionAutoscalers.list({
            auth,
            pageToken: nextPageToken,
            project: this.projectId,
            region: region,
          });
        },
        async (data: compute_v1.Schema$RegionAutoscalerList) => {
          for (const item of data.items || []) {
            await callback(item);
          }
        },
        STEP_COMPUTE_ENGINE_AUTOSCALERS,
        ComputePermissions.STEP_COMPUTE_ENGINE_AUTOSCALERS,
      );
    }
  }
}
