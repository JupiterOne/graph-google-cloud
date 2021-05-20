/**
 * Example input: projects/j1-gc-integration-dev-v2/locations/global/keyRings/example-topic-keyring/cryptoKeys/example-key/cryptoKeyVersions/1
 * Example output: projects/j1-gc-integration-dev-v2/locations/global/keyRings/example-topic-keyring/cryptoKeys/example-key
 */
export function getKmsGraphObjectKeyFromKmsKeyName(kmsKeyName: string) {
  const versionPartIndex = kmsKeyName.indexOf('/cryptoKeyVersion');

  const kmsNameWithoutVersion = kmsKeyName.substring(
    0,
    versionPartIndex === -1 ? kmsKeyName.length : versionPartIndex,
  );

  return kmsNameWithoutVersion;
}
