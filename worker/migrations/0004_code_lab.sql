-- 0004: Code Lab — roles and account status, run log, quotas, snippets, lab progress,
-- audit log and abuse signals. See docs/CODE_LAB.md and worker/README-lab.md.
--
-- `user_id` columns hold users.github_id (the stable subject of every provider:
-- "<num>" GitHub, "email:<uuid>", "google:<sub>"). No foreign keys, like the
-- existing tables, so deleting an account never fails on history.

ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'student';   -- student | instructor | admin
ALTER TABLE users ADD COLUMN status TEXT NOT NULL DEFAULT 'active';  -- active | suspended
ALTER TABLE users ADD COLUMN suspended_until DATETIME;               -- NULL while suspended = until an operator lifts it

-- One row per run attempt (a graded lesson submission is ONE row). A row with
-- status 'running' is the in-flight reservation that the concurrency limit counts.
CREATE TABLE IF NOT EXISTS lab_runs (
  id            TEXT PRIMARY KEY,                  -- uuid
  user_id       TEXT NOT NULL,
  ref_kind      TEXT NOT NULL,                     -- free | lesson | challenge
  track         TEXT,
  lesson        TEXT,
  exercise      TEXT,
  challenge_id  TEXT,
  lang          TEXT NOT NULL,
  status        TEXT NOT NULL,                     -- running | ok | compile_error | runtime_error | timeout | memory_limit | output_limit | unsupported | internal_error
  exit_code     INTEGER,
  run_ms        INTEGER,
  compile_ms    INTEGER,
  stdout_bytes  INTEGER,
  stderr_bytes  INTEGER,
  success       INTEGER NOT NULL DEFAULT 0,        -- 1 when status = ok
  passed        INTEGER,                           -- graded runs: 1/0, otherwise NULL
  first_error   TEXT,                              -- first compiler/runtime error line, normalized, <= 200 chars
  code          TEXT,                              -- the user's own history copy, size-capped
  stdin         TEXT,
  stdout        TEXT,
  stderr        TEXT,
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_lab_runs_user_created ON lab_runs(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_lab_runs_status_created ON lab_runs(status, created_at);
CREATE INDEX IF NOT EXISTS idx_lab_runs_exercise ON lab_runs(track, lesson, exercise);
CREATE INDEX IF NOT EXISTS idx_lab_runs_challenge ON lab_runs(challenge_id);
CREATE INDEX IF NOT EXISTS idx_lab_runs_created ON lab_runs(created_at);

-- Daily run counters. user_id '_global' counts every run (cost kill switch).
CREATE TABLE IF NOT EXISTS lab_usage (
  user_id TEXT NOT NULL,
  day     TEXT NOT NULL,                           -- UTC date
  count   INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, day)
);

-- Immutable, publicly readable by link.
CREATE TABLE IF NOT EXISTS lab_snippets (
  id         TEXT PRIMARY KEY,
  user_id    TEXT NOT NULL,
  lang       TEXT NOT NULL,
  code       TEXT NOT NULL,
  stdin      TEXT NOT NULL DEFAULT '',
  title      TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_lab_snippets_user_created ON lab_snippets(user_id, created_at);

-- Graded lab exercises a learner has passed. ref = track/lesson/exerciseId.
CREATE TABLE IF NOT EXISTS lab_progress (
  user_id   TEXT NOT NULL,
  ref       TEXT NOT NULL,
  passed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, ref)
);

CREATE TABLE IF NOT EXISTS audit_log (
  id      INTEGER PRIMARY KEY AUTOINCREMENT,
  at      DATETIME DEFAULT CURRENT_TIMESTAMP,
  user_id TEXT,
  action  TEXT NOT NULL,
  detail  TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_audit_log_at ON audit_log(at);
CREATE INDEX IF NOT EXISTS idx_audit_log_user ON audit_log(user_id, at);

CREATE TABLE IF NOT EXISTS abuse_signals (
  id      INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  kind    TEXT NOT NULL,                           -- resource | network_probe | flood | bruteforce | volume
  detail  TEXT,
  at      DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_abuse_signals_user_kind ON abuse_signals(user_id, kind, at);
