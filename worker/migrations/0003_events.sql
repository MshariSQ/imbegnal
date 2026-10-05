-- 0003: anonymous product analytics events.
CREATE TABLE IF NOT EXISTS events (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  day         TEXT NOT NULL,          -- UTC date
  name        TEXT NOT NULL,          -- lesson_start | lesson_done | ai_question | auth | pricing_view | pro_click
  anon        TEXT NOT NULL,          -- random per-browser id (no link to an account)
  meta        TEXT,                   -- e.g. "frontend/react"
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_events_day_name ON events(day, name);
