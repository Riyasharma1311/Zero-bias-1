import { createHmac } from 'crypto';

export function hmacSha256(data, key) {
  return createHmac('sha256', key).update(data).digest();
}

export function constantTimeEqual(a, b) {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i += 1) {
    result |= a[i] ^ b[i];
  }
  return result === 0;
}
