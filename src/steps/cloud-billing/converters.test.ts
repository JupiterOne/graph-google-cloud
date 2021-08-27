import { getMockBillingAccount } from '../../../test/mocks';
import { createBillingAccountEntity } from './converters';

describe('#createBillingAccountEntity', () => {
  test('should convert to entity', () => {
    expect(
      createBillingAccountEntity(getMockBillingAccount()),
    ).toMatchSnapshot();
  });
});
