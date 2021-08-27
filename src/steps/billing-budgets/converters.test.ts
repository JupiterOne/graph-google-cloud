import { getMockBillingBudget } from '../../../test/mocks';
import { createBillingBudgetEntity } from './converters';

describe('#createBillingBudgetEntity', () => {
  test('should convert to entity', () => {
    expect(
      createBillingBudgetEntity({
        billingAccount: 'sample-account',
        data: getMockBillingBudget(),
      }),
    ).toMatchSnapshot();
  });
});
