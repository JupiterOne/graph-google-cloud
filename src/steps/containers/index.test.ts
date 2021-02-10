import { createMockStepExecutionContext } from '@jupiterone/integration-sdk-testing';
import { fetchContainerClusters } from '.';
import { integrationConfig } from '../../../test/config';
import { withRecording } from '../../../test/recording';
import { IntegrationConfig } from '../../types';
import { CONTAINER_CLUSTER_ENTITY_TYPE } from './constants';

describe('#fetchContainerClusters', () => {
  test('should collect data', async () => {
    await withRecording('fetchContainerClusters', __dirname, async () => {
      const context = createMockStepExecutionContext<IntegrationConfig>({
        instanceConfig: integrationConfig,
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
          additionalProperties: false,
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
          },
        },
      });
    });
  });
});
