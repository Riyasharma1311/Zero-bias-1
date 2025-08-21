import dotenv from 'dotenv';
import { randomBytes } from 'crypto';

dotenv.config();

function parseIntOrDefault(value, defaultValue) {
  const n = Number.parseInt(value, 10);
  return Number.isNaN(n) ? defaultValue : n;
}

export const NODE_ENV = process.env.NODE_ENV || 'development';
export const PORT = parseIntOrDefault(process.env.PORT, 3000);
export const DATABASE_URL = process.env.DATABASE_URL || 'sqlite:///workspace/kms-api/data.db';
export const API_KEY_PEPPER = process.env.API_KEY_PEPPER || 'dev-pepper-change-me';

export function getMasterKey() {
  const hex = process.env.MASTER_KEY_HEX;
  if (!hex || hex.length !== 64) {
    const buf = randomBytes(32);
    if (!hex) {
      console.warn('[WARN] MASTER_KEY_HEX not set. Using ephemeral key for this process.');
    } else {
      console.warn('[WARN] MASTER_KEY_HEX invalid length. Using ephemeral key for this process.');
    }
    return buf;
  }
  return Buffer.from(hex, 'hex');
}

export default {
  NODE_ENV,
  PORT,
  DATABASE_URL,
  API_KEY_PEPPER,
  getMasterKey,
};
