import { clouddeploy_v1 } from 'googleapis';
import { createGoogleCloudIntegrationEntity } from '../../utils/entity';
import {
  ENTITY_CLASS_CLOUD_DEPLOY_AUTOMATION,
  ENTITY_CLASS_CLOUD_DEPLOY_DELIVERY_PIPELINE,
  ENTITY_CLASS_CLOUD_DEPLOY_SERVICE,
  ENTITY_TYPE_CLOUD_DEPLOY_AUTOMATION,
  ENTITY_TYPE_CLOUD_DEPLOY_DELIVERY_PIPELINE,
  ENTITY_TYPE_CLOUD_DEPLOY_SERVICE,
} from './constant';
import { getGoogleCloudConsoleWebLink } from '../../utils/url';

/**
 * Returns Key of Cloud Deploy Service Entities.
 */
export function getKey(type, uid) {
  return type + ':' + uid;
}

export function createDeliveryPipelineEntity(
  data: clouddeploy_v1.Schema$DeliveryPipeline,
  projectId: string,
  region: string,
) {
  const deployPipelineName = data.name?.split('/').pop();
  return createGoogleCloudIntegrationEntity(data, {
    entityData: {
      source: data,
      assign: {
        _class: ENTITY_CLASS_CLOUD_DEPLOY_DELIVERY_PIPELINE,
        _type: ENTITY_TYPE_CLOUD_DEPLOY_DELIVERY_PIPELINE,
        _key: getKey(
          ENTITY_TYPE_CLOUD_DEPLOY_DELIVERY_PIPELINE,
          data.uid as string,
        ),
        uid: data.uid as string,
        displayName: deployPipelineName,
        description: data.description,
        name: data.name as string,
        projectId: projectId,
        etag: data.etag,
        region: region,
        webLink: getGoogleCloudConsoleWebLink(
          `/deploy/delivery-pipelines/${region}/${deployPipelineName}?project=${projectId}`,
        ),
      },
    },
  });
}

export function createCloudDeployAutomationEntity(
  data: clouddeploy_v1.Schema$Automation,
  projectId: string,
  region: string,
  deliveryPipelineUid,
) {
  const deliveryPipelineName = data.name?.split('/')[5];
  const automationName = data.name?.split('/').pop();

  return createGoogleCloudIntegrationEntity(data, {
    entityData: {
      source: data,
      assign: {
        _class: ENTITY_CLASS_CLOUD_DEPLOY_AUTOMATION,
        _type: ENTITY_TYPE_CLOUD_DEPLOY_AUTOMATION,
        _key: getKey(ENTITY_TYPE_CLOUD_DEPLOY_AUTOMATION, data.uid as string),
        uid: data.uid as string,
        displayName: automationName,
        description: data.description,
        name: data.name,
        projectId: projectId,
        etag: data.etag,
        serviceAccount: data.serviceAccount,
        suspended: data.suspended,
        deliveryPipelineName: deliveryPipelineName,
        deliveryPipelineUid: deliveryPipelineUid,
        region: region,
        webLink: getGoogleCloudConsoleWebLink(
          `/deploy/delivery-pipelines/${region}/${deliveryPipelineName}/automations/${automationName}/?project=${projectId}`,
        ),
      },
    },
  });
}

export function getCloudDeployServiceEntity(serviceObj) {
  const data = {
    ...serviceObj, // organizationId, projectId, instanceId
    name: 'Google Cloud Deploy Service',
  };
  return createGoogleCloudIntegrationEntity(data, {
    entityData: {
      source: {},
      assign: {
        _class: ENTITY_CLASS_CLOUD_DEPLOY_SERVICE,
        _type: ENTITY_TYPE_CLOUD_DEPLOY_SERVICE,
        _key: getKey(ENTITY_TYPE_CLOUD_DEPLOY_SERVICE, data.instanceId),
        function: ['provisioning'],
        category: ['other'],
        ...data,
      },
    },
  });
}
