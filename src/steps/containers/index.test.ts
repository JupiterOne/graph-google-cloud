import { createMockStepExecutionContext } from '@jupiterone/integration-sdk-testing';
import { fetchContainerClusters } from '.';
import { integrationConfig } from '../../../test/config';
import { withRecording } from '../../../test/recording';
import { IntegrationConfig } from '../../types';
import {
  CONTAINER_CLUSTER_ENTITY_TYPE,
  CONTAINER_NODE_POOL_ENTITY_TYPE,
  RELATIONSHIP_TYPE_CONTAINER_CLUSTER_HAS_NODE_POOL,
} from './constants';

describe('#fetchContainerClusters', () => {
  test('should collect data', async () => {
    await withRecording('fetchContainerClusters', __dirname, async () => {
      const context = createMockStepExecutionContext<IntegrationConfig>({
        instanceConfig: {
          ...integrationConfig,
          serviceAccountKeyFile:
            integrationConfig.serviceAccountKeyFile.replace(
              'j1-gc-integration-dev-v2',
              'j1-gc-integration-dev-v3',
            ),
          serviceAccountKeyConfig: {
            ...integrationConfig.serviceAccountKeyConfig,
            project_id: 'j1-gc-integration-dev-v3',
          },
        },
      });

      await fetchContainerClusters(context);

      expect({
        numCollectedEntities: context.jobState.collectedEntities.length,
        numCollectedRelationships:
          context.jobState.collectedRelationships.length,
        collectedEntities: context.jobState.collectedEntities,
        collectedRelationships: context.jobState.collectedRelationships,
        encounteredTypes: context.jobState.encounteredTypes,
      }).toMatchSnapshot();

      expect(
        context.jobState.collectedEntities.filter(
          (e) => e._type === CONTAINER_CLUSTER_ENTITY_TYPE,
        ),
      ).toMatchGraphObjectSchema({
        _class: ['Cluster'],
        schema: {
          additionalProperties: true,
          properties: {
            _type: { const: 'google_container_cluster' },
            _rawData: {
              type: 'array',
              items: { type: 'object' },
            },
            name: { type: 'string' },
            initialNodeCode: { type: 'number' },
            nodeMachineType: { type: 'string' },
            nodeDiskSizeGb: { type: 'number' },
            nodeOAuthScopes: {
              type: 'array',
              items: { type: 'string' },
            },
            nodeImageType: { type: 'string' },
            nodePreemptible: { type: 'boolean' },
            nodeDiskType: { type: 'string' },
            nodeEnableIntegrityMonitoring: { type: 'boolean' },
            nodeEnableSecureBoot: { type: 'boolean' },
            network: { type: 'string' },
            intraNodeVisibilityEnabled: { type: 'boolean' },
            masterAuthorizedNetworksEnabled: { type: 'boolean' },
            clusterIpv4Cidr: { type: 'string' },
            kubernetesDashboardEnabled: { type: 'boolean' },
            networkPolicyConfigEnabled: { type: 'boolean' },
            subnetwork: { type: 'string' },
            locations: {
              type: 'array',
              items: { type: 'string' },
            },
            useRoutes: { type: 'boolean' },
            useIpAliases: { type: 'boolean' },
            databaseEncryptionState: { type: 'string' },
            databaseEncryptionKey: { type: 'string' },
            releaseChannel: { type: 'string' },
            shieldedNodesEnabled: { type: 'boolean' },
            endpoint: { type: 'string' },
            initialClusterVersion: { type: 'string' },
            currentMasterVersion: { type: 'string' },
            status: { type: 'string' },
            nodeIpv4CidrSize: { type: 'number' },
            servicesIpv4Cidr: { type: 'string' },
            instanceGroupUrls: {
              type: 'array',
              items: { type: 'string' },
            },
            currentNodeCount: { type: 'number' },
            location: { type: 'string' },
            binaryAuthorizationEnabled: { type: 'boolean' },
            privateEndpointEnabled: { type: 'boolean' },
            privateNodesEnabled: { type: 'boolean' },
            networkPolicyEnabled: { type: 'boolean' },
            loggingService: { type: 'string' },
            monitoringService: { type: 'string' },
            basicAuthenticationEnabled: { type: 'boolean' },
            clientCertificatesEnabled: { type: 'boolean' },
            rbacEnabled: { type: 'boolean' },
            abacEnabled: { type: 'boolean' },
            isAlphaCluster: { type: 'boolean' },
            workloadIdentity: { type: 'string' },
            'metadata.description': { type: 'string' },
            webLink: { type: 'string' },
          },
        },
      });

      expect(
        context.jobState.collectedEntities.filter(
          (e) => e._type === CONTAINER_NODE_POOL_ENTITY_TYPE,
        ),
      ).toMatchGraphObjectSchema({
        _class: ['Group'],
        schema: {
          additionalProperties: true,
          properties: {
            _type: { const: 'google_container_node_pool' },
            _rawData: {
              type: 'array',
              items: { type: 'object' },
            },
            name: { type: 'string' },
            initialNodeCount: { type: 'number' },
            podIpv4CidrSize: { type: 'number' },
            legacyEndpointsDisabled: { type: 'boolean' },
            gkeMetadataServerEnabled: { type: 'boolean' },
            imageType: { type: 'string' },
            autoRepairEnabled: { type: 'boolean' },
            autoUpgradeEnabled: { type: 'boolean' },
            integrityMonitoringEnabled: { type: 'boolean' },
            secureBootEnabled: { type: 'boolean' },
            status: { type: 'string' },
            statusMessage: { type: 'string' },
            version: { type: 'string' },
            gkeSandboxEnabled: { type: 'boolean' },
            serviceAccount: { type: 'string' },
            bootDiskKmsKey: { type: 'string' },
            'metadata.networkTags': {
              type: 'array',
              items: { type: 'string' },
            },
            'metadata.gce.disable-legacy-endpoints': { type: 'string' },
            webLink: { type: 'string' },
          },
        },
      });

      expect(
        context.jobState.collectedRelationships.filter(
          (e) => e._type === RELATIONSHIP_TYPE_CONTAINER_CLUSTER_HAS_NODE_POOL,
        ),
      ).toMatchDirectRelationshipSchema({
        schema: {
          properties: {
            _class: { const: 'HAS' },
            _type: { const: 'google_container_cluster_has_node_pool' },
          },
        },
      });
    });
  });
});
