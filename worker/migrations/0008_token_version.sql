-- 0008: server-side token revocation (POST /api/auth/logout).
-- Every issued JWT carries the account's token_version as its `tv` claim; worker/src/auth/guard.ts refuses a
-- token whose `tv` differs from this column (a token without `tv` counts as 0, so tokens issued before this
-- migration keep working until the first logout). Logging out increments it, which revokes every token
-- issued so far for the account.

ALTER TABLE users ADD COLUMN token_version INTEGER NOT NULL DEFAULT 0;
