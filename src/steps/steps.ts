import {
  ExecutionHandlerFunction,
  IntegrationProviderAuthorizationError,
  IntegrationStep,
  StepExecutionContext,
} from '@jupiterone/integration-sdk-core';
import { IntegrationConfig } from '../types';
import { functionsSteps } from './functions';
import { storageSteps } from './storage';
import { serviceUsageSteps } from './service-usage';
import { iamSteps } from './iam';
import { resourceManagerSteps } from './resource-manager';
import { computeSteps } from './compute';
import { kmsSteps } from './kms';
import { sqlAdminSteps } from './sql-admin';
import { bigQuerySteps } from './big-query';
import { dnsManagedZonesSteps } from './dns';
import { containerSteps } from './containers';
import { loggingSteps } from './logging';
import { monitoringSteps } from './monitoring';
import { binaryAuthorizationSteps } from './binary-authorization';
import { pubSubSteps } from './pub-sub';
import { appEngineSteps } from './app-engine';
import { cloudRunSteps } from './cloud-run';
import { redisSteps } from './redis';
import { memcacheSteps } from './memcache';
import { spannerSteps } from './spanner';
import { apiGatewaySteps } from './api-gateway';
import { privateCaSteps } from './privateca';
import { accessPoliciesSteps } from './access-context-manager';
import { dataprocSteps } from './dataproc';
import { billingBudgetsSteps } from './billing-budgets';
import { cloudBillingSteps } from './cloud-billing';
import { cloudAssetSteps } from './cloud-asset';
import { bigTableSteps } from './big-table';
import { createErrorProps } from '../google-cloud/utils/createErrorProps';

const steps: IntegrationStep<IntegrationConfig>[] = wrapStepExecutionHandlers([
  ...functionsSteps,
  ...storageSteps,
  ...serviceUsageSteps,
  ...iamSteps,
  ...cloudAssetSteps,
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
  ...accessPoliciesSteps,
  ...dataprocSteps,
  ...bigTableSteps,
  ...billingBudgetsSteps,
  ...cloudBillingSteps,
]);

function wrapStepExecutionHandlers(
  steps: IntegrationStep<IntegrationConfig>[],
): IntegrationStep<IntegrationConfig>[] {
  return steps.map((step) => {
    step.executionHandler;
    return {
      ...step,
      executionHandler: createWrappedStepExecutionHandler(
        step.executionHandler,
      ),
    };
  });
}

function handleExecutionHandler(err: any) {
  // This is a catch all that ensures every API call in this project is
  // properly wrapped. Some API calls in this project are using `iterateApi`,
  // which has a custom error handling wrapper. Some API calls aren't using
  // any wrappers and we need to ensure that these are wrapped at the highest
  // level possible.
  if (
    !(err instanceof IntegrationProviderAuthorizationError) &&
    isServiceApiDisabledError(err)
  ) {
    const errorProps = createErrorProps(err);
    const e = new IntegrationProviderAuthorizationError(errorProps);
    throw e;
  }

  throw err;
}

function createWrappedStepExecutionHandler<T extends StepExecutionContext>(
  originalExecutionHandler: ExecutionHandlerFunction<T>,
): ExecutionHandlerFunction<T> {
  return async (context: T) => {
    try {
      await originalExecutionHandler(context);
    } catch (err) {
      handleExecutionHandler(err);
    }
  };
}

type ApiResponseError = {
  message?: string;
  domain?: string;
  reason?: string;
  extendedHelp?: string;
};

/**
 * Returns `true` if the API response error is due to a GCP service API being
 * disabled, otherwise returns `false`.
 */
function isServiceApiDisabledError(err: any): boolean {
  const responseErrors = err.errors as ApiResponseError[] | undefined;
  if (!responseErrors || err.code !== 403) return false;

  return (
    responseErrors.find((v) => {
      // Example message:
      //
      // Cloud Text-to-Speech API has not been used in project 123456789 before
      // or it is disabled. Enable it by visiting https://console.developers.google.com/apis/api/texttospeech.googleapis.com/overview?project=123456789
      // then retry. If you enabled this API recently, wait a few minutes for the
      // action to propagate to our systems and retry.
      return (
        v?.reason === 'accessNotConfigured' && v.message?.includes('disabled')
      );
    }) !== undefined
  );
}

export { steps, wrapStepExecutionHandlers };
