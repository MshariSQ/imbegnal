-- 0005: Challenges (CTF) — per-learner progress, solves (first blood), attempt log.
-- `user_id` is users.github_id, the stable subject for every provider.

CREATE TABLE IF NOT EXISTS challenge_progress (
  user_id         TEXT NOT NULL,
  challenge_id    TEXT NOT NULL,
  first_opened_at DATETIME,
  attempts        INTEGER NOT NULL DEFAULT 0,
  hints_used      INTEGER NOT NULL DEFAULT 0,
  hint_mask       INTEGER NOT NULL DEFAULT 0,   -- bit i set = hint i revealed
  solved_at       DATETIME,
  points          INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, challenge_id)
);

CREATE TABLE IF NOT EXISTS challenge_solves (
  challenge_id     TEXT NOT NULL,
  user_id          TEXT NOT NULL,
  points           INTEGER NOT NULL,            -- points awarded at solve time (after hint costs)
  first_blood      INTEGER NOT NULL DEFAULT 0,
  minutes_to_solve REAL,                        -- first open -> solve; NULL when never opened
  solved_at        DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (challenge_id, user_id)
);

-- At most one first-blood row per challenge: makes "who was first" atomic under concurrent solves.
CREATE UNIQUE INDEX IF NOT EXISTS one_first_blood ON challenge_solves(challenge_id) WHERE first_blood = 1;
CREATE INDEX IF NOT EXISTS idx_solves_user ON challenge_solves(user_id, solved_at);
CREATE INDEX IF NOT EXISTS idx_solves_at ON challenge_solves(solved_at);

-- Brute-force limits + analytics. The submitted flag is NEVER stored.
CREATE TABLE IF NOT EXISTS challenge_attempts (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id      TEXT NOT NULL,
  challenge_id TEXT NOT NULL,
  correct      INTEGER NOT NULL,
  at           DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_attempts_user ON challenge_attempts(user_id, challenge_id, at);
CREATE INDEX IF NOT EXISTS idx_attempts_user_at ON challenge_attempts(user_id, at);
CREATE INDEX IF NOT EXISTS idx_attempts_challenge ON challenge_attempts(challenge_id, at);
