-- 0001: base tables (already present in production; IF NOT EXISTS makes this a no-op there).

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


CREATE TABLE IF NOT EXISTS user_roadmap_progress (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  github_id   TEXT NOT NULL,
  roadmap_id  TEXT NOT NULL,
  node_id     TEXT NOT NULL,
  completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(github_id, roadmap_id, node_id)
);

CREATE INDEX IF NOT EXISTS idx_progress_user ON user_roadmap_progress(github_id);
CREATE INDEX IF NOT EXISTS idx_progress_roadmap ON user_roadmap_progress(github_id, roadmap_id);

CREATE TABLE IF NOT EXISTS user_bookmarks (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  github_id   TEXT NOT NULL,
  type        TEXT NOT NULL,
  item_id     TEXT NOT NULL,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(github_id, type, item_id)
);

CREATE INDEX IF NOT EXISTS idx_bookmarks_user ON user_bookmarks(github_id);
