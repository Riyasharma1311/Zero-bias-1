import { createHmac, hkdfSync, randomBytes } from 'crypto';

export function deriveKey(masterKey, info, length = 32, salt) {
  const useSalt = salt || randomBytes(16);
  if (typeof hkdfSync === 'function') {
    return hkdfSync('sha256', useSalt, masterKey, Buffer.from(info, 'utf8'), length);
  }
  // Fallback: simple KDF using HMAC chaining (not full HKDF, dev only)
  let output = Buffer.alloc(0);
  let counter = 1;
  while (output.length < length) {
    const h = createHmac('sha256', masterKey)
      .update(useSalt)
      .update(Buffer.from(info, 'utf8'))
      .update(Buffer.from([counter]))
      .digest();
    output = Buffer.concat([output, h]);
    counter += 1;
  }
  return output.subarray(0, length);
}
