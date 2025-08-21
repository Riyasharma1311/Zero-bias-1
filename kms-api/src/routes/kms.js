import express from 'express';
import { randomBytes, randomUUID } from 'crypto';
import { getMasterKey } from '../config/env.js';
import { deriveKey } from '../crypto/kdf.js';
import { aesGcmEncrypt, aesGcmDecrypt } from '../crypto/aes.js';
import { hmacSha256, constantTimeEqual } from '../crypto/hmac.js';
import { insertKey, getKeyById } from '../db/index.js';
import { requireBase64, requireString } from '../utils/validators.js';

const router = express.Router();

function getWrappingKey() {
  const master = getMasterKey();
  // Use static salt for wrap to be deterministic across process restarts if MASTER_KEY_HEX is stable
  return deriveKey(master, 'kms-wrap-key', 32, Buffer.alloc(16, 0));
}

// POST /keys - create a new AES-256 key
router.post('/keys', (req, res, next) => {
  try {
    const name = req.body?.name ? String(req.body.name).slice(0, 255) : null;
    const keyBytes = randomBytes(32);
    const wrapKey = getWrappingKey();
    const aad = Buffer.from('keywrap:v1');
    const { iv, ciphertext, tag } = aesGcmEncrypt(keyBytes, wrapKey, aad);
    const id = randomUUID();
    insertKey({
      id,
      name,
      algorithm: 'AES-256-GCM',
      wrapped_key: ciphertext.toString('base64'),
      wrap_iv: iv.toString('base64'),
      wrap_tag: tag.toString('base64'),
      createdAt: new Date().toISOString(),
    });
    return res.status(201).json({ id, algorithm: 'AES-256-GCM', name });
  } catch (err) {
    return next(err);
  }
});

// POST /encrypt - encrypt with a key
router.post('/encrypt', (req, res, next) => {
  try {
    const keyId = requireString(req.body, 'key_id');
    const plaintextB64 = requireBase64(req.body, 'plaintext');
    const aadStr = req.body?.aad;
    const aad = typeof aadStr === 'string' ? Buffer.from(aadStr, 'utf8') : undefined;

    const keyRow = getKeyById(keyId);
    if (!keyRow) return res.status(404).json({ error: 'Key not found' });
    const wrapKey = getWrappingKey();
    const wrapped = Buffer.from(keyRow.wrapped_key, 'base64');
    const iv = Buffer.from(keyRow.wrap_iv, 'base64');
    const tag = Buffer.from(keyRow.wrap_tag, 'base64');
    const aadWrap = Buffer.from('keywrap:v1');
    const dataKey = aesGcmDecrypt(wrapped, wrapKey, iv, tag, aadWrap);

    const { iv: eiv, ciphertext, tag: etag } = aesGcmEncrypt(Buffer.from(plaintextB64, 'base64'), dataKey, aad);
    return res.json({ iv: eiv.toString('base64'), ciphertext: ciphertext.toString('base64'), tag: etag.toString('base64'), algorithm: keyRow.algorithm });
  } catch (err) {
    return next(err);
  }
});

// POST /decrypt - decrypt with a key
router.post('/decrypt', (req, res, next) => {
  try {
    const keyId = requireString(req.body, 'key_id');
    const ivB64 = requireBase64(req.body, 'iv');
    const ctB64 = requireBase64(req.body, 'ciphertext');
    const tagB64 = requireBase64(req.body, 'tag');
    const aadStr = req.body?.aad;
    const aad = typeof aadStr === 'string' ? Buffer.from(aadStr, 'utf8') : undefined;

    const keyRow = getKeyById(keyId);
    if (!keyRow) return res.status(404).json({ error: 'Key not found' });
    const wrapKey = getWrappingKey();
    const wrapped = Buffer.from(keyRow.wrapped_key, 'base64');
    const ivWrap = Buffer.from(keyRow.wrap_iv, 'base64');
    const tagWrap = Buffer.from(keyRow.wrap_tag, 'base64');
    const aadWrap = Buffer.from('keywrap:v1');
    const dataKey = aesGcmDecrypt(wrapped, wrapKey, ivWrap, tagWrap, aadWrap);

    const pt = aesGcmDecrypt(Buffer.from(ctB64, 'base64'), dataKey, Buffer.from(ivB64, 'base64'), Buffer.from(tagB64, 'base64'), aad);
    return res.json({ plaintext: pt.toString('base64') });
  } catch (err) {
    return next(err);
  }
});

// POST /sign - HMAC-SHA256 using derived signing key
router.post('/sign', (req, res, next) => {
  try {
    const keyId = requireString(req.body, 'key_id');
    const messageB64 = requireBase64(req.body, 'message');

    const keyRow = getKeyById(keyId);
    if (!keyRow) return res.status(404).json({ error: 'Key not found' });
    const wrapKey = getWrappingKey();
    const wrapped = Buffer.from(keyRow.wrapped_key, 'base64');
    const iv = Buffer.from(keyRow.wrap_iv, 'base64');
    const tag = Buffer.from(keyRow.wrap_tag, 'base64');
    const aadWrap = Buffer.from('keywrap:v1');
    const dataKey = aesGcmDecrypt(wrapped, wrapKey, iv, tag, aadWrap);

    // Derive sign key from data key to separate from encryption usage
    const signKey = deriveKey(dataKey, `sign:${keyId}`, 32, Buffer.alloc(16, 1));
    const sig = hmacSha256(Buffer.from(messageB64, 'base64'), signKey);
    return res.json({ signature: sig.toString('base64'), algorithm: 'HMAC-SHA256' });
  } catch (err) {
    return next(err);
  }
});

// POST /verify - verify signature
router.post('/verify', (req, res, next) => {
  try {
    const keyId = requireString(req.body, 'key_id');
    const messageB64 = requireBase64(req.body, 'message');
    const signatureB64 = requireBase64(req.body, 'signature');

    const keyRow = getKeyById(keyId);
    if (!keyRow) return res.status(404).json({ error: 'Key not found' });
    const wrapKey = getWrappingKey();
    const wrapped = Buffer.from(keyRow.wrapped_key, 'base64');
    const iv = Buffer.from(keyRow.wrap_iv, 'base64');
    const tag = Buffer.from(keyRow.wrap_tag, 'base64');
    const aadWrap = Buffer.from('keywrap:v1');
    const dataKey = aesGcmDecrypt(wrapped, wrapKey, iv, tag, aadWrap);

    const signKey = deriveKey(dataKey, `sign:${keyId}`, 32, Buffer.alloc(16, 1));
    const expected = hmacSha256(Buffer.from(messageB64, 'base64'), signKey);
    const provided = Buffer.from(signatureB64, 'base64');
    const ok = constantTimeEqual(expected, provided);
    return res.json({ valid: ok });
  } catch (err) {
    return next(err);
  }
});

export default router;
