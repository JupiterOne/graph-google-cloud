/**
 * Ex input: https://www.googleapis.com/compute/v1/projects/j1-gc-integration-dev/zones/us-central1-a
 * Result: us-central1-a
 */
export function getLastUrlPart(url: string) {
  const parts = url.split('/');
  return parts[parts.length - 1];
}

export function getGoogleCloudConsoleWebLink(path: string) {
  return `https://console.cloud.google.com${encodeURI(path)}`;
}
