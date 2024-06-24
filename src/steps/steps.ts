import {
  ExecutionHandlerFunction,
  IntegrationLogger,
  IntegrationProviderAuthorizationError,
  IntegrationWarnEventName,
  StepExecutionContext,
} from '@jupiterone/integration-sdk-core';
import { createErrorProps } from '../google-cloud/utils/createErrorProps';
import { GoogleCloudIntegrationStep } from '../types';
import { accessPoliciesSteps } from './access-context-manager';
import { apiGatewaySteps } from './api-gateway';
import { appEngineSteps } from './app-engine';
import { bigQuerySteps } from './big-query';
import { bigTableSteps } from './big-table';
import { billingBudgetsSteps } from './billing-budgets';
import { binaryAuthorizationSteps } from './binary-authorization';
import { cloudAssetSteps } from './cloud-asset';
import { cloudBillingSteps } from './cloud-billing';
import { cloudBuildSteps } from './cloud-build';
import { cloudRunSteps } from './cloud-run';
import { cloudSourceRepositoriesSteps } from './cloud-source-repositories';
import { computeSteps } from './compute';
import { containerSteps } from './containers';
import { dataprocSteps } from './dataproc';
import { dnsManagedZonesSteps } from './dns';
import { functionsSteps } from './functions';
import { iamSteps } from './iam';
import { kmsSteps } from './kms';
import { loggingSteps } from './logging';
import { memcacheSteps } from './memcache';
import { monitoringSteps } from './monitoring';
import { privateCaSteps } from './privateca';
import { pubSubSteps } from './pub-sub';
import { redisSteps } from './redis';
import { resourceManagerSteps } from './resource-manager';
import { secretManagerSteps } from './secret-manager';
import { serviceUsageSteps } from './service-usage';
import { spannerSteps } from './spanner';
import { sqlAdminSteps } from './sql-admin';
import { storageSteps } from './storage';
import { webSecurityScannerSteps } from './web-security-scanner';

const steps: GoogleCloudIntegrationStep[] = wrapStepExecutionHandlers([
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
  ...secretManagerSteps,
  ...cloudBuildSteps,
  ...cloudSourceRepositoriesSteps,
  ...webSecurityScannerSteps,
]);

function wrapStepExecutionHandlers(
  steps: GoogleCloudIntegrationStep[],
): GoogleCloudIntegrationStep[] {
  return steps.map((step) => {
    step.executionHandler;
    return {
      ...step,
      executionHandler: createWrappedStepExecutionHandler(
        step.name,
        step.executionHandler,
      ),
    };
  });
}

function handleExecutionHandler(
  err: any,
  { stepName, logger }: { stepName: string; logger: IntegrationLogger },
) {
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

  if (
    err.status === 400 &&
    err.statusText?.match &&
    err.statusText.match(/billing/i)
  ) {
    logger.publishWarnEvent({
      name: IntegrationWarnEventName.IncompleteData,
      description: `Billing not enabled for the project. Skipping "${stepName}" ingestion.`,
    });
    return;
  }

  throw err;
}

function createWrappedStepExecutionHandler<T extends StepExecutionContext>(
  stepName: string,
  originalExecutionHandler: ExecutionHandlerFunction<T>,
): ExecutionHandlerFunction<T> {
  return async (context: T) => {
    try {
      await originalExecutionHandler(context);
    } catch (err) {
      handleExecutionHandler(err, { stepName, logger: context.logger });
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
