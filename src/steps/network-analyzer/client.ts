import { google, networkmanagement_v1, compute_v1 } from 'googleapis';
import { Client } from '../../google-cloud/client';
import { NETWORK_ANALYZER_LOCATIONS } from './constants';

export class networkAnalyzerClient extends Client {
    private networkmanagementClient = google.networkmanagement({ version: 'v1', retry: false });
    private computeClient = google.compute({ version: 'v1', retry: false })

    async iterateProjectLocations(
        callback: (locationId: string) => Promise<void>,
    ) {
        for (const location of NETWORK_ANALYZER_LOCATIONS) {
            await callback(location);
        }
    }

    async iterateNetworkIntelligenceCenter(
        callback: (data: networkmanagement_v1.Schema$Location) => Promise<void>,
    ): Promise<void> {
        const auth = await this.getAuthenticatedServiceClient();
        await this.iterateApi(
            async (nextPageToken) => {
                return this.networkmanagementClient.projects.locations.list({
                    auth,
                    name: `projects/${this.projectId}`,
                    pageToken: nextPageToken,
                });
            },
            async (data: networkmanagement_v1.Schema$ListLocationsResponse) => {
                for (const location of data.locations || []) {
                    await callback(location);
                }
            },
        );
    }

    async iterateNetworkAnalyzerConnectivityTest(
        callback: (data: networkmanagement_v1.Schema$ConnectivityTest) => Promise<void>,
    ): Promise<void> {
        const auth = await this.getAuthenticatedServiceClient();
        await this.iterateApi(
            async (nextPageToken) => {
                return this.networkmanagementClient.projects.locations.global.connectivityTests.list({
                    auth,
                    parent: `projects/${this.projectId}/locations/global`,
                    pageToken: nextPageToken,
                });
            },
            async (data: networkmanagement_v1.Schema$ListConnectivityTestsResponse) => {
                for (const location of data.resources || []) {
                    await callback(location);
                }
            },
        );
    }

    async iterateVpnGatewayTunnel(
        callback: (data: compute_v1.Schema$VpnTunnel) => Promise<void>,
    ): Promise<void> {
        const auth = await this.getAuthenticatedServiceClient();
        await this.iterateProjectLocations(async (locationId) => {
            await this.iterateApi(
                async (nextPageToken) => {
                    return this.computeClient.vpnTunnels.list({
                        auth,
                        project: this.projectId,
                        region: locationId,
                        pageToken: nextPageToken,
                    });
                },
                async (data: compute_v1.Schema$VpnTunnelList) => {
                    for (const item of data.items || []) {
                        await callback(item);
                    }
                },
            )
        });
    }

    async iterateNetworkAnalyzerVpc(
        callback: (data: compute_v1.Schema$VpnTunnel) => Promise<void>,
    ): Promise<void> {
        const auth = await this.getAuthenticatedServiceClient();
        await this.iterateProjectLocations(async (locationId) => {
            await this.iterateApi(
                async (nextPageToken) => {
                    return this.computeClient.vpnTunnels.list({
                        auth,
                        project: this.projectId,
                        region: locationId,
                        pageToken: nextPageToken,
                    });
                },
                async (data: compute_v1.Schema$VpnTunnelList) => {
                    for (const item of data.items || []) {
                        await callback(item);
                    }
                },
            )
        });
    }

    async iterateVpnGateway(
        callback: (data: compute_v1.Schema$VpnGateway) => Promise<void>,
    ): Promise<void> {
        const auth = await this.getAuthenticatedServiceClient();
        await this.iterateProjectLocations(async (locationId) => {
            await this.iterateApi(
                async (nextPageToken) => {
                    return this.computeClient.vpnGateways.list({
                        auth,
                        project: this.projectId,
                        region: locationId,
                        pageToken: nextPageToken,
                    });
                },
                async (data: compute_v1.Schema$VpnGatewayList) => {
                    for (const item of data.items || []) {
                        await callback(item);
                    }
                },
            )
        });
    }
}
