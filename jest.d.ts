import { Entity } from '@jupiterone/integration-sdk-core';
import { GraphObjectSchema } from './test/jest';
import { MockIntegrationStepExecutionContext } from '@jupiterone/integration-sdk-testing';

declare global {
  namespace jest {
    interface Matchers<R> {
      toMatchGraphObjectSchema<T extends Entity>(
        expectedMatchSchema: GraphObjectSchema,
      ): R;
    }
  }
}
