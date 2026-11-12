import crypto from 'node:crypto';
import type { IdTokenClaims } from 'ltijs';

const claims: Record<string, IdTokenClaims> = {};

export function saveClaims(token: IdTokenClaims): string {
  let key: string;
  do {
    key = crypto.randomUUID();
  } while (key in claims);
  claims[key] = token;
  expire(key, 1000);
  return key;
}

export function consumeClaims(key: string): IdTokenClaims | undefined {
  if (key in claims) {
    const token = claims[key];
    delete claims[key];
    return token;
  }
  return undefined;
}

function expire(key: string, delay: number) {
  setTimeout(() => consumeClaims(key), delay);
}
