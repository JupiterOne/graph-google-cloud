export function generateEntityKey({
  type,
  id,
}: {
  type: string;
  id: string | number | undefined;
}): string {
  if (!id) {
    throw new Error('Cannot generate entity key with "undefined" id');
  }
  return `${type}_${id}`;
}
