import {
  Entity,
  IntegrationInvocationConfig,
} from '@jupiterone/integration-sdk-core';
import { deserializeIntegrationConfig } from './utils/integrationConfig';
import { IntegrationConfig } from './types';
import getStepStartStates from './getStepStartStates';
import { functionsSteps } from './steps/functions';
import { storageSteps } from './steps/storage';
import { serviceUsageSteps } from './steps/service-usage';
import { iamSteps } from './steps/iam';
import { resourceManagerSteps } from './steps/resource-manager';
import { computeSteps } from './steps/compute';
import { kmsSteps } from './steps/kms';
import { sqlAdminSteps } from './steps/sql-admin';
import { bigQuerySteps } from './steps/big-query';
import { dnsManagedZonesSteps } from './steps/dns';
import { containerSteps } from './steps/containers';
import { loggingSteps } from './steps/logging';
import { monitoringSteps } from './steps/monitoring';
import { binaryAuthorizationSteps } from './steps/binary-authorization';
import { pubSubSteps } from './steps/pub-sub';
import { appEngineSteps } from './steps/app-engine';
import { cloudRunSteps } from './steps/cloud-run';
import { redisSteps } from './steps/redis';
import { memcacheSteps } from './steps/memcache';
import { spannerSteps } from './steps/spanner';
import { apiGatewaySteps } from './steps/api-gateway';
import { privateCaSteps } from './steps/privateca';

import { Client } from './google-cloud/client';

export const invocationConfig: IntegrationInvocationConfig<IntegrationConfig> =
  {
    instanceConfigFields: {
      serviceAccountKeyFile: {
        type: 'string',
        mask: true,
      },
      projectId: {
        type: 'string',
      },
      organizationId: {
        type: 'string',
      },
      configureOrganizationAccounts: {
        type: 'boolean',
        mask: false,
      },
    },
    getStepStartStates,
    integrationSteps: [
      ...functionsSteps,
      ...storageSteps,
      ...serviceUsageSteps,
      ...iamSteps,
      ...resourceManagerSteps,
      ...computeSteps,
      ...kmsSteps,
      ...sqlAdminSteps,
      ...bigQuerySteps,
      ...dnsManagedZonesSteps,
      ...containerSteps,
      ...loggingSteps,
      ...monitoringSteps,
      ...binaryAuthorizationSteps,
      ...pubSubSteps,
      ...appEngineSteps,
      ...cloudRunSteps,
      ...redisSteps,
      ...memcacheSteps,
      ...spannerSteps,
      ...apiGatewaySteps,
      ...privateCaSteps,
    ],

    beforeAddEntity(context, entity: Entity): Entity {
      const projectId =
        context.instance.config.projectId ||
        context.instance.config.serviceAccountKeyConfig.project_id;

      return {
        ...entity,
        projectId: entity.projectId || projectId,
      };
    },
  };

export {
  IntegrationConfig,
  deserializeIntegrationConfig,
  Client as GoogleCloudClient,
};
