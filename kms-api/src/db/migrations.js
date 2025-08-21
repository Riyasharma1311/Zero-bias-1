export function runMigrations(db) {
  db.exec(`
    PRAGMA foreign_keys = ON;
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS api_keys (
      id TEXT PRIMARY KEY,
      name TEXT,
      hash TEXT NOT NULL UNIQUE,
      created_at TEXT NOT NULL,
      last_used_at TEXT,
      active INTEGER NOT NULL DEFAULT 1
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS keys (
      id TEXT PRIMARY KEY,
      name TEXT,
      algorithm TEXT NOT NULL,
      wrapped_key TEXT NOT NULL,
      wrap_iv TEXT NOT NULL,
      wrap_tag TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
  `);

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_api_keys_active ON api_keys(active);
  `);
}
