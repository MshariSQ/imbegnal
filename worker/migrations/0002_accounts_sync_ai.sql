-- 0002: email/Google accounts, plans, study-state sync, AI tutor quotas.
--
-- Note: `users.github_id` is the stable account subject for every provider
-- ("<numeric id>" for GitHub, "email:<uuid>", "google:<sub>"). The column name
-- is kept for backwards compatibility with existing rows and foreign keys.

ALTER TABLE users ADD COLUMN provider TEXT NOT NULL DEFAULT 'github';
ALTER TABLE users ADD COLUMN password_hash TEXT;
ALTER TABLE users ADD COLUMN plan TEXT NOT NULL DEFAULT 'free';

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_login ON users(email) WHERE provider = 'email';

CREATE TABLE IF NOT EXISTS user_state (
  github_id   TEXT PRIMARY KEY,
  data        TEXT NOT NULL,
  updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ai_usage (
  github_id   TEXT NOT NULL,
  day         TEXT NOT NULL,
  count       INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (github_id, day)
);
