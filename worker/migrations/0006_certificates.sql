-- 0006: completion certificates (skeleton for the paid tier).
-- `code` is derived from HMAC(JWT_SECRET, user|track) so it cannot be guessed; one certificate per user and track.

CREATE TABLE IF NOT EXISTS certificates (
  code      TEXT PRIMARY KEY,
  user_id   TEXT NOT NULL,
  track     TEXT NOT NULL,                 -- roadmap id
  recipient TEXT NOT NULL,                 -- display name at issue time
  issued_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (user_id, track)
);
