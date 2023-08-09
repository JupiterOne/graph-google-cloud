import {
  createIntegrationEntity,
  parseTimePropertyValue,
} from '@jupiterone/integration-sdk-core';
import { appengine_v1 } from 'googleapis';
import { getGoogleCloudConsoleWebLink } from '../../utils/url';
import {
  ENTITY_CLASS_APP_ENGINE_APPLICATION,
  ENTITY_CLASS_APP_ENGINE_INSTANCE,
  ENTITY_CLASS_APP_ENGINE_SERVICE,
  ENTITY_CLASS_APP_ENGINE_VERSION,
  ENTITY_TYPE_APP_ENGINE_APPLICATION,
  ENTITY_TYPE_APP_ENGINE_INSTANCE,
  ENTITY_TYPE_APP_ENGINE_SERVICE,
  ENTITY_TYPE_APP_ENGINE_VERSION,
} from './constants';

export function createAppEngineApplicationEntity(
  data: appengine_v1.Schema$Application,
  projectId: string,
) {
  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        _class: ENTITY_CLASS_APP_ENGINE_APPLICATION,
        _type: ENTITY_TYPE_APP_ENGINE_APPLICATION,
        _key: data.name as string,
        name: data.name,
        displayName: data.name as string,
        location: data.locationId,
        servingStatus: data.servingStatus,
        defaultHostname: data.defaultHostname,
        defaultBucket: data.defaultBucket,
        codeBucket: data.codeBucket,
        authDomain: data.authDomain,
        grcDomain: data.gcrDomain,
        splitHealthChecks: data.featureSettings?.splitHealthChecks,
        useContainerOptimizedOs: data.featureSettings?.useContainerOptimizedOs,
        webLink: getGoogleCloudConsoleWebLink(
          `/appengine?project=${projectId}`,
        ),
      },
    },
  });
}

export function createAppEngineServiceEntity(
  data: appengine_v1.Schema$Service,
) {
  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        _class: ENTITY_CLASS_APP_ENGINE_SERVICE,
        _type: ENTITY_TYPE_APP_ENGINE_SERVICE,
        _key: data.name as string,
        name: data.name,
        displayName: data.name as string,
      },
    },
  });
}

export function createAppEngineVersionEntity(
  data: appengine_v1.Schema$Version,
  projectId: string,
) {
  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        _class: ENTITY_CLASS_APP_ENGINE_VERSION,
        _type: ENTITY_TYPE_APP_ENGINE_VERSION,
        _key: data.name as string,
        name: data.name,
        displayName: data.name as string,
        category: ['application'],
        function: ['workload-management'],
        // The following properties are shared (both standard and flexible)
        versionUrl: data.versionUrl,
        threadsafe: data.threadsafe,
        // Tells us if this version is using standard of flexible env
        env: data.env,
        runtime: data.runtime,
        servingStatus: data.servingStatus,
        createdBy: data.createdBy,
        // Standard specific properties
        instanceClass: data.instanceClass,
        diskUsageBytes:
          data.diskUsageBytes && parseInt(data.diskUsageBytes as string, 10),
        // Flexible specific properties
        manualScalingInstances: data.manualScaling?.instances,
        cpuCount: data.resources?.cpu,
        diskGb: data.resources?.diskGb,
        memoryGb: data.resources?.memoryGb,
        readinessCheckFailureThreshold: data.readinessCheck?.failureThreshold,
        readinessCheckSuccessThreshold: data.readinessCheck?.successThreshold,
        readinessCheckInterval: data.readinessCheck?.checkInterval,
        readinessCheckTimeout: data.readinessCheck?.timeout,
        readinessCheckAppStartTimeout: data.readinessCheck?.appStartTimeout,
        livenessCheckFailureThreshold: data.livenessCheck?.failureThreshold,
        livenessCheckSuccessThreshold: data.livenessCheck?.successThreshold,
        livenessCheckInterval: data.livenessCheck?.checkInterval,
        livenessCheckTimeout: data.livenessCheck?.timeout,
        livenessCheckInitialDelay: data.livenessCheck?.initialDelay,
        createdOn: parseTimePropertyValue(data.createTime),
        webLink: getGoogleCloudConsoleWebLink(
          `/appengine/versions?serviceId=${data.name?.split(
            '/',
          )[3]}&project=${projectId}`,
        ),
      },
    },
  });
}

export function createAppEngineInstanceEntity(
  data: appengine_v1.Schema$Instance,
) {
  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        _class: ENTITY_CLASS_APP_ENGINE_INSTANCE,
        _type: ENTITY_TYPE_APP_ENGINE_INSTANCE,
        _key: data.name as string,
        name: data.name,
        displayName: data.name as string,
        // Standard specific properties
        appEngineRelease: data.appEngineRelease,
        availability: data.availability,
        requests: data.requests,
        averageLatency: data.averageLatency,
        // Turning this to int so that you can apply ASC,DESC inside J1QL on it
        memoryUsage:
          data.memoryUsage && parseInt(data.memoryUsage as string, 10),
        // Flexible specific properties
        vmStatus: data.vmStatus,
        vmIp: data.vmIp,
        vmLiveness: data.vmLiveness,
        createdOn: parseTimePropertyValue(data.startTime),
        hostname: null,
      },
    },
  });
}
