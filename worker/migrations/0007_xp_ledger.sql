-- 0007: server-side XP authority. One row per XP award the Worker granted, so each
-- award happens once per user and source item (PRIMARY KEY + INSERT OR IGNORE).
-- source 'lab': ref = track/lesson/exerciseId, written when POST /api/lab/run grades a
-- lesson lab exercise as passed. GET /api/lab/progress sums it.
-- Idempotent statements only (worker/scripts/d1-reconcile.mjs). No foreign keys, like
-- the other per-user tables; account deletion erases the rows (lab/account-data.ts).

CREATE TABLE IF NOT EXISTS xp_ledger (
  user_id    TEXT NOT NULL,
  source     TEXT NOT NULL,
  ref        TEXT NOT NULL,
  xp         INTEGER NOT NULL,
  awarded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, source, ref)
);
CREATE INDEX IF NOT EXISTS idx_xp_ledger_user_awarded ON xp_ledger(user_id, awarded_at);
