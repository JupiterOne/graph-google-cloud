import { pickBy } from 'lodash';
import { IntegrationStepContext } from '../../types';
import { testResourceIdentifiers } from './findResourceKindFromCloudResourceIdentifier.test';
import { getMockLogger } from '../../../scripts/organizationSetup.test';
import { getTypeAndKeyFromResourceIdentifier } from './getTypeAndKeyFromResourceIdentifier';
import {
  impossible,
  J1_TYPE_TO_KEY_GENERATOR_MAP,
} from './typeToKeyGeneratorMap';

const googleResourcesWithMappedJ1Resources = Object.keys(
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
      if (type && googleResourcesWithMappedJ1Resources.includes(type)) {
        successfullyMappedTypes.push(type);
      }
    }
    expect(successfullyMappedTypes.sort()).toEqual(
      expect.arrayContaining(googleResourcesWithMappedJ1Resources.sort()),
    );
  });
});
