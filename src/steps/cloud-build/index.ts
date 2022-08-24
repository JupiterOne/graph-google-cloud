import { IntegrationStep } from '@jupiterone/integration-sdk-core';
import { IntegrationConfig } from '../../types';
import steps from './steps';

export const CloudBuildSteps: IntegrationStep<IntegrationConfig>[] = steps;
