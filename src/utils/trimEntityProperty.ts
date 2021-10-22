// This maximum value is described inside of the `jupiter-search-indexer`
export const MAX_ENTITY_PROPERTY_VALUE = 4096;
const TRIMMED_ENTITY_PROPERTY_SUFFIX = '...';

/**
 * The JupiterOne system has a maximum property value length. This function
 * ensures that the length of a provided entity property value does not exceed
 * the maximum.
 */
export function trimEntityProperty(value: string | undefined) {
  if (!value || value.length <= MAX_ENTITY_PROPERTY_VALUE) return value;

  return (
    value.substr(
      0,
      MAX_ENTITY_PROPERTY_VALUE - TRIMMED_ENTITY_PROPERTY_SUFFIX.length,
    ) + TRIMMED_ENTITY_PROPERTY_SUFFIX
  );
}
