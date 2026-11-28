"""SQLite tables for learning progress, quick quizzes and lesson videos (NewLearn)."""

LEARNING_DDL = (
    """
    CREATE TABLE IF NOT EXISTS progress (
        course_id TEXT NOT NULL,
        day INTEGER NOT NULL,
        done_at TEXT NOT NULL,
        PRIMARY KEY (course_id, day)
    )
    """,
    """
    CREATE TABLE IF NOT EXISTS quizzes (
        id TEXT PRIMARY KEY,
        course_id TEXT NOT NULL,
        day INTEGER NOT NULL,
        mode TEXT NOT NULL,
        questions_json TEXT NOT NULL,
        created_at TEXT NOT NULL
    )
    """,
    """
    CREATE TABLE IF NOT EXISTS quiz_attempts (
        id TEXT PRIMARY KEY,
        quiz_id TEXT NOT NULL,
        course_id TEXT NOT NULL,
        day INTEGER NOT NULL,
        answers_json TEXT NOT NULL,
        results_json TEXT NOT NULL,
        score INTEGER NOT NULL,
        total INTEGER NOT NULL,
        duration_s INTEGER NOT NULL,
        created_at TEXT NOT NULL
    )
    """,
    """
    CREATE TABLE IF NOT EXISTS videos (
        id TEXT PRIMARY KEY,
        course_id TEXT NOT NULL,
        day INTEGER NOT NULL,
        mode TEXT NOT NULL,
        status TEXT NOT NULL,
        scenes_json TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
    )
    """,
    """
    CREATE TABLE IF NOT EXISTS quiz_checks (
        quiz_id TEXT NOT NULL,
        idx INTEGER NOT NULL,
        answer_json TEXT NOT NULL,
        verdict TEXT NOT NULL,
        feedback TEXT NOT NULL,
        checked_at TEXT NOT NULL,
        PRIMARY KEY (quiz_id, idx)
    )
    """,
    "CREATE INDEX IF NOT EXISTS idx_attempts_recent ON quiz_attempts (created_at DESC)",
    "CREATE INDEX IF NOT EXISTS idx_videos_recent ON videos (updated_at DESC)",
)
