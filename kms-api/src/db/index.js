import Database from 'better-sqlite3';
import { DATABASE_URL } from '../config/env.js';
import { runMigrations } from './migrations.js';

function resolveSqlitePathFromUrl(url) {
  try {
    const u = new URL(url);
    if (u.protocol !== 'sqlite:') {
      throw new Error(`Unsupported protocol: ${u.protocol}. Only sqlite: is supported in this build.`);
    }
    // URL pathname keeps leading slash
    return u.pathname;
  } catch (err) {
    // Fallback treat as direct file path
    return url;
  }
}

const sqlitePath = resolveSqlitePathFromUrl(DATABASE_URL);
export const db = new Database(sqlitePath);

db.pragma('journal_mode = WAL');
db.pragma('synchronous = NORMAL');
db.pragma('foreign_keys = ON');

runMigrations(db);

// API Keys
export function insertApiKey({ id, name, hash, createdAt }) {
  const stmt = db.prepare(`INSERT INTO api_keys (id, name, hash, created_at, active) VALUES (?, ?, ?, ?, 1)`);
  stmt.run(id, name || null, hash, createdAt);
}

export function findActiveApiKeyByHash(hash) {
  const stmt = db.prepare(`SELECT * FROM api_keys WHERE hash = ? AND active = 1 LIMIT 1`);
  return stmt.get(hash);
}

export function touchApiKeyUsage(id, iso) {
  const stmt = db.prepare(`UPDATE api_keys SET last_used_at = ? WHERE id = ?`);
  stmt.run(iso, id);
}

// KMS Keys
export function insertKey({ id, name, algorithm, wrapped_key, wrap_iv, wrap_tag, createdAt }) {
  const stmt = db.prepare(`INSERT INTO keys (id, name, algorithm, wrapped_key, wrap_iv, wrap_tag, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`);
  stmt.run(id, name || null, algorithm, wrapped_key, wrap_iv, wrap_tag, createdAt);
}

export function getKeyById(id) {
  const stmt = db.prepare(`SELECT * FROM keys WHERE id = ? LIMIT 1`);
  return stmt.get(id);
}

export default {
  db,
  insertApiKey,
  findActiveApiKeyByHash,
  touchApiKeyUsage,
  insertKey,
  getKeyById,
};
