import {
  GOOGLE_RESOURCE_KIND_TO_J1_TYPE_MAP,
  NONE,
} from './resourceKindToTypeMap';
import { findResourceKindFromCloudResourceIdentifier } from './findResourceKindFromCloudResourceIdentifier';
import { J1_TYPE_TO_KEY_GENERATOR_MAP } from './typeToKeyGeneratorMap';
import {
  IntegrationLogger,
  StepExecutionContext,
} from '@jupiterone/integration-sdk-core';

export interface TypeAndKey {
  key?: string | false;
  type?: string;
  metadata: {
    googleResourceKind?: string;
    keyGenFunction?: Function;
  };
}

/**
 * Gets the JupiterOne `_type` and `_key` properties using a Google Cloud Resource Identifier
 *
 * ex:
 *   input - googleResourceIdentifier = //bigquery.googleapis.com/projects/j1-gc-integration-dev-v3/datasets/natality
 *   returns - j1-gc-integration-dev-v3:natality
 */
export async function getTypeAndKeyFromResourceIdentifier(
  googleResourceIdentifier: string,
  context: StepExecutionContext,
): Promise<TypeAndKey> {
  const response: TypeAndKey = { metadata: {} };

  const googleResourceKind = findResourceKindFromCloudResourceIdentifier(
    googleResourceIdentifier,
  );
  response.metadata.googleResourceKind = googleResourceKind;
  if (!googleResourceKind) {
    return response;
  }

  const targetResourceType =
    GOOGLE_RESOURCE_KIND_TO_J1_TYPE_MAP[googleResourceKind];
  response.type = targetResourceType;
  if (!targetResourceType || targetResourceType === NONE) {
    return response;
  }

  const keyGenFunction = J1_TYPE_TO_KEY_GENERATOR_MAP[targetResourceType];
  response.metadata.keyGenFunction = keyGenFunction;
  if (typeof keyGenFunction !== 'function') {
    return response;
  }

  const key = await keyGenFunction(googleResourceIdentifier, context);
  response.key = key;

  return response;
}

export function makeLogsForTypeAndKeyResponse(
  logger: IntegrationLogger,
  response: TypeAndKey,
): TypeAndKey {
  const {
    key,
    type,
    metadata: { googleResourceKind, keyGenFunction },
  } = response;
  if (!googleResourceKind) {
    logger.warn(response, 'Unable to find google cloud resource identifier.');
  } else if (!type) {
    logger.warn(response, 'Unable to find J1 type from google cloud resource.');
  } else if (type === NONE) {
    logger.info(response, 'There is no JupiterOne entity for this resource.');
  } else if (typeof keyGenFunction !== 'function') {
    logger.warn(
      response,
      'Unable to find a key generation function for this entity.',
    );
  } else if (!key) {
    logger.warn(response, 'Unable to generate key for this type.');
  }
  return response;
}
