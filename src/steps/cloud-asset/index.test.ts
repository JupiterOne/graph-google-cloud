import { createMockStepExecutionContext } from '@jupiterone/integration-sdk-testing';
import { IntegrationConfig } from '../..';
import { integrationConfig } from '../../../test/config';
import { withRecording } from '../../../test/recording';
import { fetchIamBindings } from '.';
import { bindingEntities } from './constants';

describe('#fetchIamBindings', () => {
  test('should collect data', async () => {
    await withRecording('fetchIamBindings', __dirname, async () => {
      const context = createMockStepExecutionContext<IntegrationConfig>({
        instanceConfig: integrationConfig,
      });

      await fetchIamBindings(context);

      expect({
        numCollectedEntities: context.jobState.collectedEntities.length,
        numCollectedRelationships:
          context.jobState.collectedRelationships.length,
        collectedEntities: context.jobState.collectedEntities,
        collectedRelationships: context.jobState.collectedRelationships,
        encounteredTypes: context.jobState.encounteredTypes,
      }).toMatchSnapshot();

      expect(
        context.jobState.collectedEntities.filter(
          (e) => e._type === bindingEntities.BINDINGS._type,
        ),
      ).toMatchGraphObjectSchema({
        _class: bindingEntities.BINDINGS._class,
        schema: {
          properties: {
            _type: { const: bindingEntities.BINDINGS._type },
            _rawData: {
              type: 'array',
              items: { type: 'object' },
            },
            resource: { type: 'string' },
            project: { type: 'string' },
            members: { type: 'array' },
            'condition.title': { type: 'string' },
            'condition.description': { type: 'string' },
            'condition.expression': { type: 'string' },
          },
        },
      });
    });
  });
});
