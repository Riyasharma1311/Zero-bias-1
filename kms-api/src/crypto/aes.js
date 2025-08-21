import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

export function aesGcmEncrypt(plaintextBuf, keyBuf, aad) {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', keyBuf, iv, { authTagLength: 16 });
  if (aad) cipher.setAAD(Buffer.isBuffer(aad) ? aad : Buffer.from(aad));
  const enc = Buffer.concat([cipher.update(plaintextBuf), cipher.final()]);
  const tag = cipher.getAuthTag();
  return { iv, ciphertext: enc, tag };
}

export function aesGcmDecrypt(ciphertextBuf, keyBuf, ivBuf, tagBuf, aad) {
  const decipher = createDecipheriv('aes-256-gcm', keyBuf, ivBuf, { authTagLength: 16 });
  if (aad) decipher.setAAD(Buffer.isBuffer(aad) ? aad : Buffer.from(aad));
  decipher.setAuthTag(tagBuf);
  const dec = Buffer.concat([decipher.update(ciphertextBuf), decipher.final()]);
  return dec;
}
