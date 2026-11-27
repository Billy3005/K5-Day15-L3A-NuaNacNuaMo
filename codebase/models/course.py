"""SQLite table definition for persisted courses."""

COURSES_TABLE_DDL = """
CREATE TABLE IF NOT EXISTS courses (
    seq INTEGER PRIMARY KEY AUTOINCREMENT,
    id TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    learner_group TEXT NOT NULL,
    minutes_per_day INTEGER NOT NULL,
    mode TEXT NOT NULL,
    source_mode TEXT NOT NULL,
    payload_json TEXT NOT NULL,
    created_at TEXT NOT NULL,
    is_deleted INTEGER NOT NULL DEFAULT 0,
    deleted_at TEXT
)
"""

COURSES_INDEX_DDL = """
CREATE INDEX IF NOT EXISTS idx_courses_active_seq
ON courses (is_deleted, seq DESC)
"""

