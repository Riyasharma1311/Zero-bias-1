import { createHmac } from 'crypto';
import { API_KEY_PEPPER } from '../config/env.js';
import { findActiveApiKeyByHash, touchApiKeyUsage } from '../db/index.js';

function hashApiKey(token) {
  return createHmac('sha256', Buffer.from(API_KEY_PEPPER))
    .update(token)
    .digest('hex');
}

export async function apiKeyAuth(req, res, next) { // eslint-disable-line import/prefer-default-export
  try {
    const header = req.get('authorization') || '';
    let token = null;
    if (header.startsWith('ApiKey ')) {
      token = header.slice(7).trim();
    } else if (header.startsWith('Bearer ')) {
      token = header.slice(7).trim();
    } else if (req.query && typeof req.query.api_key === 'string') {
      token = req.query.api_key;
    }
    if (!token) {
      return res.status(401).json({ error: 'Missing API key' });
    }
    const hash = hashApiKey(token);
    const apiKey = findActiveApiKeyByHash(hash);
    if (!apiKey) {
      return res.status(401).json({ error: 'Invalid API key' });
    }
    req.apiKey = { id: apiKey.id, name: apiKey.name };
    touchApiKeyUsage(apiKey.id, new Date().toISOString());
    return next();
  } catch (err) {
    return next(err);
  }
}

export function hashApiKeyForStorage(token) {
  return hashApiKey(token);
}
