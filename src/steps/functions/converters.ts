import { cloudfunctions_v1 } from 'googleapis';
import { getTime } from '@jupiterone/integration-sdk-core';
import {
  CLOUD_FUNCTION_ENTITY_CLASS,
  CLOUD_FUNCTION_ENTITY_TYPE,
} from './constants';
import { createGoogleCloudIntegrationEntity } from '../../utils/entity';

export function createCloudFunctionEntity(
  cloudFunction: cloudfunctions_v1.Schema$CloudFunction,
) {
  return createGoogleCloudIntegrationEntity(cloudFunction, {
    entityData: {
      source: cloudFunction,
      assign: {
        _class: CLOUD_FUNCTION_ENTITY_CLASS,
        _type: CLOUD_FUNCTION_ENTITY_TYPE,
        _key: cloudFunction.name as string,
        name: cloudFunction.name,
        displayName: cloudFunction.name as string,
        // NOTE: The runtime versions are inconsistent between GC and AWS. For
        // example, in AWS the Node 12 runtime is nodejs12.x, but in GC the Node
        // 12 runtime is "nodejs12".
        //
        // See here: https://cloud.google.com/sdk/gcloud/reference/functions/deploy#--runtime
        runtime: cloudFunction.runtime,
        updatedOn: getTime(cloudFunction.updateTime),
        availableMemoryMb: cloudFunction.availableMemoryMb,
        description: cloudFunction.description,
        // TODO: Normalize to a number? This is a custom "Duration" format from
        // Google. See: https://developers.google.com/protocol-buffers/docs/reference/google.protobuf#google.protobuf.Duration
        timeout: cloudFunction.timeout,
        version: cloudFunction.versionId,
        handler: cloudFunction.entryPoint,
        ingressSettings: cloudFunction.ingressSettings,
        maxInstances: cloudFunction.maxInstances,
        status: cloudFunction.status,
        active: cloudFunction.status === 'ACTIVE',
        serviceAccountEmail: cloudFunction.serviceAccountEmail,
        sourceRepoUrl: cloudFunction.sourceRepository?.url,
      },
    },
  });
}
