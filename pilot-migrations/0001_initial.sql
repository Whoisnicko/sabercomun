-- Initial schema for future functional migration. No personal or demo accounts.
CREATE TABLE IF NOT EXISTS users (
 id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL UNIQUE,
 password_hash TEXT NOT NULL, teacher INTEGER NOT NULL DEFAULT 0 CHECK(teacher IN (0,1)),
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS sessions (
 token_hash TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 expires_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS courses (
 id TEXT PRIMARY KEY, teacher_id TEXT NOT NULL REFERENCES users(id),
 title TEXT NOT NULL, category TEXT NOT NULL, description TEXT NOT NULL,
 starts_at TEXT, duration_minutes INTEGER NOT NULL CHECK(duration_minutes > 0),
 capacity INTEGER NOT NULL CHECK(capacity > 0),
 live_price INTEGER NOT NULL CHECK(live_price >= 0),
 recording_price INTEGER NOT NULL CHECK(recording_price >= 0 AND recording_price <= live_price),
 published INTEGER NOT NULL DEFAULT 0 CHECK(published IN (0,1)),
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS course_access (
 course_id TEXT PRIMARY KEY REFERENCES courses(id) ON DELETE CASCADE,
 live_url TEXT, recording_url TEXT
);
CREATE TABLE IF NOT EXISTS orders (
 id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id),
 course_id TEXT NOT NULL REFERENCES courses(id),
 kind TEXT NOT NULL CHECK(kind IN ('live','recording')),
 amount INTEGER NOT NULL CHECK(amount >= 0),
 status TEXT NOT NULL CHECK(status IN ('pending','approved','rejected','refunded')),
 payment_id TEXT UNIQUE, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS courses_catalog ON courses(published,category);
CREATE TABLE IF NOT EXISTS reviews (
 user_id TEXT NOT NULL REFERENCES users(id),
 course_id TEXT NOT NULL REFERENCES courses(id),
 rating INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5),
 comment TEXT NOT NULL DEFAULT '', PRIMARY KEY(user_id,course_id)
);
