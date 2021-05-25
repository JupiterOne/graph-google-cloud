import {
  assignTags,
  createIntegrationEntity,
  IntegrationEntityBuilderInput,
} from '@jupiterone/integration-sdk-core';

export interface GoogleCloudResourceData {
  /**
   * User-provided labels, in key/value pairs.
   */
  labels?: {
    [key: string]: string;
  } | null;
  [key: string]: any;
}

export function createGoogleCloudIntegrationEntity<
  T extends GoogleCloudResourceData,
>(data: T, entityBuilderInput: IntegrationEntityBuilderInput) {
  return assignTags(createIntegrationEntity(entityBuilderInput), data.labels);
}
