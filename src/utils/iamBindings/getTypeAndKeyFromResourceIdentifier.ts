import {
  GOOGLE_RESOURCE_KIND_TO_J1_TYPE_MAP,
  NONE,
} from './resourceKindToTypeMap';
import { IntegrationStepContext } from '../../types';
import { findResourceKindFromCloudResourceIdentifier } from './findResourceKindFromCloudResourceIdentifier';
import { J1_TYPE_TO_KEY_GENERATOR_MAP } from './typeToKeyGeneratorMap';

export interface TypeAndKey {
  key: string;
  type: string;
}

/**
 * Gets the JupiterOne `_type` and `_key` properties from a Google Cloud Resource Identifier
 */
export function getTypeAndKeyFromResourceIdentifier(
  context: IntegrationStepContext,
  googleResourceIdentifier: string,
): TypeAndKey | undefined {
  const { logger } = context;
  const googleResourceKind = findResourceKindFromCloudResourceIdentifier(
    googleResourceIdentifier,
  );
  if (!googleResourceKind) {
    logger.warn(
      { googleResourceIdentifier },
      'unable to find google cloud resource identifier.',
    );
    return;
  }
  const targetResourceType =
    GOOGLE_RESOURCE_KIND_TO_J1_TYPE_MAP[googleResourceKind];
  if (!targetResourceType) {
    logger.warn(
      { googleResourceIdentifier, googleResourceKind },
      'unable to find J1 type from google cloud resource.',
    );
    return;
  } else if (targetResourceType === NONE) {
    logger.warn(
      { googleResourceIdentifier, googleResourceKind },
      'There is no JupiterOne entity for this resource.',
    );
    return;
  }
  const key = getTargetKey(targetResourceType, googleResourceIdentifier);
  if (!key) {
    logger.warn(
      {
        googleResourceIdentifier,
        googleResourceKind,
        targetResourceType,
      },
      'unable to generate key for type.',
    );
    return;
  }
  return {
    key,
    type: targetResourceType,
  };
}

function getTargetKey(targetResourceType: string, resource: string) {
  const keyGenFunction = J1_TYPE_TO_KEY_GENERATOR_MAP[targetResourceType];
  if (!keyGenFunction) {
    console.warn(
      { resource, targetResourceType },
      'unable to find key generation function for J1 type.',
    );
    return;
  }
  return keyGenFunction(resource);
}
