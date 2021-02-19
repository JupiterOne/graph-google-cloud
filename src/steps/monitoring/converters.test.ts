import { getMockAlertPolicy } from '../../../test/mocks';
import { createAlertPolicyEntity } from './converters';
import { DEFAULT_INTEGRATION_CONFIG_PROJECT_ID } from '../../../test/config';

describe('#createAlertPolicyEntity', () => {
  test('should convert to entity', () => {
    expect(
      createAlertPolicyEntity(
        getMockAlertPolicy(),
        DEFAULT_INTEGRATION_CONFIG_PROJECT_ID,
      ),
    ).toMatchSnapshot();
  });

  test('should convert to entity with conditionFilters array', () => {
    expect(
      createAlertPolicyEntity(
        getMockAlertPolicy({
          conditions: [
            {
              conditionThreshold: {
                filter:
                  'metric.type="logging.googleapis.com/user/my-example-metric" AND resource.type="metric"',
                comparison: 'COMPARISON_GT',
                duration: '0s',
                trigger: {
                  count: 1,
                },
                aggregations: [
                  {
                    alignmentPeriod: '300s',
                    perSeriesAligner: 'ALIGN_RATE',
                  },
                ],
              },
              displayName: 'test condition',
              name: `projects/${DEFAULT_INTEGRATION_CONFIG_PROJECT_ID}/alertPolicies/9246450381922925470/conditions/9246450381922923601`,
            },
          ],
        }),
        DEFAULT_INTEGRATION_CONFIG_PROJECT_ID,
      ),
    ).toMatchSnapshot();
  });
});
