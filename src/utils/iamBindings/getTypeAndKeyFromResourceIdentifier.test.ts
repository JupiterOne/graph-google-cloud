import { pickBy } from 'lodash';
import { getMockLogger } from '../../../test/helpers/getMockLogger';
import { IntegrationStepContext } from '../../types';
import { testResourceIdentifiers } from './findResourceKindFromCloudResourceIdentifier.test';
import { getTypeAndKeyFromResourceIdentifier } from './getTypeAndKeyFromResourceIdentifier';
import {
  impossible,
  J1_TYPE_TO_KEY_GENERATOR_MAP,
} from './typeToKeyGeneratorMap';

const jupiterOneTypesWithMappedGoogleResources = Object.keys(
  pickBy(J1_TYPE_TO_KEY_GENERATOR_MAP, (keyMethod) => keyMethod !== impossible),
);

describe('getTypeAndKeyFromResourceIdentifier', () => {
  it(`should find the correct keys for all available resources`, () => {
    const successfullyMappedTypes: string[] = [];
    for (const identifier of Object.keys(testResourceIdentifiers)) {
      const context = {
        logger: getMockLogger(),
      } as unknown as IntegrationStepContext;
      const { type, key } =
        getTypeAndKeyFromResourceIdentifier(context, identifier) ?? {};
      expect({ type, key }).toMatchSnapshot();
      if (type && jupiterOneTypesWithMappedGoogleResources.includes(type)) {
        successfullyMappedTypes.push(type);
      }
    }
    expect(successfullyMappedTypes.sort()).toEqual(
      expect.arrayContaining(jupiterOneTypesWithMappedGoogleResources.sort()),
    );
  });
});
