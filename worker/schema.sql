CREATE TABLE IF NOT EXISTS users (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  github_id   TEXT UNIQUE NOT NULL,
  username    TEXT NOT NULL,
  name        TEXT,
  avatar_url  TEXT,
  email       TEXT,
  bio         TEXT,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_login  DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
