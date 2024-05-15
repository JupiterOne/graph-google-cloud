import { GoogleCloudIntegrationStep } from '../../types';
import { fetchComputeNetworksStepMap } from './steps/fetch-compute-networks';
import { buildComputeNetworkPeeringRelationshipsStepMap } from './steps/build-compute-network-peering-relationships';
import { fetchComputeSubnetworksStepMap } from './steps/fetch-compute-subnetworks';
import { fetchComputeDisksStepMap } from './steps/fetch-compute-disks';
import { fetchBackendBucketsStepMap } from './steps/fetch-compute-backend-buckets';
import { fetchComputeRegionDisksStepMap } from './steps/fetch-compute-region-disks';
import { fetchComputeSnapshotsStepMap } from './steps/fetch-compute-snapshots';
import { fetchComputeHealthChecksStepMap } from './steps/fetch-compute-health-checks';
import { fetchComputeRegionHealthChecksStepMap } from './steps/fetch-compute-region-health-checks';
import { fetchComputeRegionInstanceGroupsStepMap } from './steps/fetch-compute-region-instance-groups';
import { fetchComputeInstanceGroupsStepMap } from './steps/fetch-compute-instance-groups';
import { fetchComputeProjectStepMap } from './steps/fetch-compute-project';
import { fetchComputeAddressesStepMap } from './steps/fetch-compute-addresses';
import { fetchComputeRegionBackendServicesStepMap } from './steps/fetch-compute-region-backend-services';
import { fetchComputeBackendServicesStepMap } from './steps/fetch-compute-backend-services';
import { fetchComputeGlobalAddressesStepMap } from './steps/fetch-compute-global-addresses';
import { fetchComputeRegionLoadbalancersStepMap } from './steps/fetch-compute-region-loadbalancers';
import { fetchComputeLoadbalancersStepMap } from './steps/fetch-compute-loadbalancers';
import { fetchComputeTargetSslProxiesStepMap } from './steps/fetch-compute-target-ssl-proxies';
import { fetchComputeImagesStepMap } from './steps/fetch-compute-images';
import { fetchComputeTargetHttpsProxiesStepMap } from './steps/fetch-compute-target-https-proxies';
import { fetchComputeInstancesStepMap } from './steps/fetch-compute-instances';
import { fetchComputeRegionTargetHttpsProxiesStepMap } from './steps/fetch-compute-region-target-https-proxies';
import { fetchComputeFirewallsStepMap } from './steps/fetch-compute-firewalls';
import { buildDiskImageRelationshipsStepMap } from './steps/build-disk-image-relationships';
import { buildComputeSnapshotDiskRelationshipsStepMap } from './steps/build-compute-snapshot-disk-relationships';
import { fetchComputeRegionTargetHttpProxiesStepMap } from './steps/fetch-compute-region-target-http-proxies';
import { fetchComputeTargetHttpProxiesStepMap } from './steps/fetch-compute-target-http-proxies';
import { fetchComputeSslPoliciesStepMap } from './steps/fetch-compute-ssl-policies';
import { buildComputeBackendBucketHasBucketRelationshipsStepMap } from './steps/build-compute-backend-bucket-has-bucket-relationships';
import { buildComputeInstanceServiceAccountRelationshipsStepMap } from './steps/build-compute-instance-service-account-relationships';
import { buildImageCreatedImageRelationshipsStepMap } from './steps/build-image-created-image-relationships';
import { buildImageUsesKmsRelationshipsStepMap } from './steps/build-image-uses-kms-relationships';
import { fetchComputeForwardingRulesStepMap } from './steps/fetch-compute-forwarding-rules';
import { buildDiskUsesKmsRelationshipsStepMap } from './steps/build-disk-uses-kms-relationships';
import { fetchComputeGlobalForwardingRulesStepMap } from './steps/fetch-compute-global-forwarding-rules';
import { fetchComputeEngineAutoScalersMap } from './steps/fetch-compute-engine-autoscalers';
import { fetchComputeEngineRegionAutoScalersMap } from './steps/fetch-compute-engine-region-autoscalers';
import { fetchAutoScalersPolicyMap } from './steps/fetch-autoscaler-policy';
import { fetchAutoScalersRegionPolicyMap } from './steps/fetch-region-autoscaler-policy';
import { buildComputeEngineRegionAutoscalerRegionPolicyRelationshipStepMap } from './steps/build-compute-engine-region-autoscalers-and-region-policy-relationships'
import { buildProjectComputeEngineAutoscalersRelationshipStepMap } from './steps/build-project-compute-engine-autoscalers-relationships';
import { buildProjectComputeEngineRegionAutoscalersRelationshipMap } from './steps/build-project-compute-engine-region-autoscalers-relationships';
import { buildComputeEngineAutoscalerPolicyRelationshipStepMap } from './steps/build-compute-engine-autoscalers-and-policy-relationships'
export * from './constants';

export const computeSteps: GoogleCloudIntegrationStep[] = [
  // Fetch steps
  fetchComputeNetworksStepMap,
  fetchComputeSubnetworksStepMap,
  fetchComputeDisksStepMap,
  fetchComputeRegionDisksStepMap,
  fetchBackendBucketsStepMap,
  fetchComputeSnapshotsStepMap,
  fetchComputeHealthChecksStepMap,
  fetchComputeRegionHealthChecksStepMap,
  fetchComputeInstanceGroupsStepMap,
  fetchComputeRegionInstanceGroupsStepMap,
  fetchComputeProjectStepMap,
  fetchComputeAddressesStepMap,
  fetchComputeRegionBackendServicesStepMap,
  fetchComputeBackendServicesStepMap,
  fetchComputeGlobalAddressesStepMap,
  fetchComputeRegionLoadbalancersStepMap,
  fetchComputeLoadbalancersStepMap,
  fetchComputeTargetSslProxiesStepMap,
  fetchComputeImagesStepMap,
  fetchComputeTargetHttpsProxiesStepMap,
  fetchComputeInstancesStepMap,
  fetchComputeRegionTargetHttpsProxiesStepMap,
  fetchComputeFirewallsStepMap,
  fetchComputeRegionTargetHttpProxiesStepMap,
  fetchComputeTargetHttpProxiesStepMap,
  fetchComputeSslPoliciesStepMap,
  fetchComputeForwardingRulesStepMap,
  fetchComputeGlobalForwardingRulesStepMap,
  fetchComputeEngineAutoScalersMap,
  fetchComputeEngineRegionAutoScalersMap,
  fetchAutoScalersPolicyMap,
  fetchAutoScalersRegionPolicyMap,
  // Build steps
  buildComputeNetworkPeeringRelationshipsStepMap,
  buildComputeSnapshotDiskRelationshipsStepMap,
  buildDiskImageRelationshipsStepMap,
  buildComputeBackendBucketHasBucketRelationshipsStepMap,
  buildComputeInstanceServiceAccountRelationshipsStepMap,
  buildImageCreatedImageRelationshipsStepMap,
  buildComputeBackendBucketHasBucketRelationshipsStepMap,
  buildImageUsesKmsRelationshipsStepMap,
  buildDiskUsesKmsRelationshipsStepMap,
  // buildProjectComputeEngineRegionAutoscalersRelationshipMap,
  buildComputeEngineAutoscalerPolicyRelationshipStepMap,
  buildProjectComputeEngineAutoscalersRelationshipStepMap,
  buildComputeEngineRegionAutoscalerRegionPolicyRelationshipStepMap,
];
