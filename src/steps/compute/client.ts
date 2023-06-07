import { BaseExternalAccountClient } from 'google-auth-library';
import { compute_v1, google, osconfig_v1 } from 'googleapis';
import { Client, PageableGaxiosResponse } from '../../google-cloud/client';
import { iterateRegions, iterateRegionZones } from '../../google-cloud/regions';

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
  ) {
    const auth = await this.getAuthenticatedServiceClient();

    await iterateRegionZones(async (zone) => {
      await this.iterateApi(
        async (nextPageToken) => fn({ auth, zone, nextPageToken }),
        callback,
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
      );
    });
  }

  async fetchComputeImagePolicy(name: string) {
    const auth = await this.getAuthenticatedServiceClient();

    const resp = await this.client.images.getIamPolicy({
      auth,
      project: this.projectId,
      resource: name,
    });

    return resp.data;
  }

  async fetchComputeImage(name: string, projectId: string) {
    const auth = await this.getAuthenticatedServiceClient();

    const resp = await this.client.images.get({
      auth,
      image: name,
      // allow us to use the same method for both custom and public images
      project: projectId,
    });

    return resp.data;
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
    );
  }

  async fetchComputeProject(): Promise<compute_v1.Schema$Project> {
    const auth = await this.getAuthenticatedServiceClient();

    const computeProjectResponse = await this.client.projects.get({
      auth: auth,
      project: this.projectId,
    });

    return computeProjectResponse.data;
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
    );
  }

  async fetchComputeInstanceInventory(
    location: string,
    instanceId: string,
  ): Promise<osconfig_v1.Schema$Inventory> {
    const auth = await this.getAuthenticatedServiceClient();

    const resp =
      await this.osConfigClient.projects.locations.instances.inventories.get({
        auth,
        name: `projects/${this.projectId}/locations/${location}/instances/${instanceId}/inventory`,
      });

    return resp.data;
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
    );
  }
}
