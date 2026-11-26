-- Pilot only; apply to isolated D1 before enabling AUTH_MODE.
CREATE TABLE IF NOT EXISTS auth_challenges (
 email TEXT PRIMARY KEY,
 token_hash TEXT NOT NULL UNIQUE,
 expires_at INTEGER NOT NULL,
 issued_at INTEGER NOT NULL,
 consumed INTEGER NOT NULL DEFAULT 0 CHECK(consumed IN (0,1))
);
CREATE INDEX IF NOT EXISTS sessions_expiry ON sessions(expires_at);
