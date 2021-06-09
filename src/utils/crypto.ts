import * as crypto from 'crypto';

export function hashArray(arr: string[]) {
  return hash(JSON.stringify(arr.sort()));
}

export function hash(str: string): string {
  const shasum = crypto.createHash('sha1');
  shasum.update(str);
  return shasum.digest('hex');
}
