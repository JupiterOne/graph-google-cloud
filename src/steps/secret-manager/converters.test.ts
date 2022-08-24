import {
  getMockSecretEntity,
  getMockSecretVersionEntity,
} from '../../../test/mocks';
import { createSecretEntity } from './converters';

describe('#createSecretEntity', () => {
  test('should convert to entity', () => {
    expect(createSecretEntity(getMockSecretEntity())).toMatchSnapshot();
  });
});

describe('#createSecretVersionEntity', () => {
  test('should convert to entity', () => {
    expect(createSecretEntity(getMockSecretVersionEntity())).toMatchSnapshot();
  });
});
