/**
 * Example input: 3.5s {string}
 * Example output: 3.5 {number}
 */
export function googleCloudDurationSecondsToNumber(
  duration: string | null | undefined,
) {
  if (!duration) {
    return undefined;
  }

  const [seconds] = duration.split('s');

  if (!seconds) {
    return undefined;
  }

  return parseInt(seconds);
}
