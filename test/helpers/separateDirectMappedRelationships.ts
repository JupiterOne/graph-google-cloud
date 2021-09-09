import {
  ExplicitRelationship,
  MappedRelationship,
  Relationship,
} from '@jupiterone/integration-sdk-core';
import { filterGraphObjects } from './filterGraphObjects';

export function separateDirectMappedRelationships(
  collectedRelationships: Relationship[],
) {
  const { targets: directRelationships, rest: mappedRelationships } =
    filterGraphObjects(collectedRelationships, (r) => !r._mapping) as {
      targets: ExplicitRelationship[];
      rest: MappedRelationship[];
    };
  return {
    directRelationships,
    mappedRelationships,
  };
}
