"""SQLite repository for Course persistence (DAO-03 & DAO-04)."""

from datetime import datetime, timezone
import json
from typing import Optional

from core.database import Database
from schemas.course import Course, CourseSummary


class CourseRepository:
    """Direct database operations for courses."""

    def __init__(self, db: Database) -> None:
        self.db = db

    def save_course(self, course: Course) -> Course:
        """Persist a validated Course inside an atomic transaction."""
        now = datetime.now(timezone.utc).isoformat()
        payload_json = course.model_dump_json()
        with self.db.session() as conn:
            conn.execute(
                """
                INSERT INTO courses (
                    id, title, learner_group, minutes_per_day,
                    mode, source_mode, payload_json, created_at, is_deleted
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)
                ON CONFLICT(id) DO UPDATE SET
                    title = excluded.title,
                    learner_group = excluded.learner_group,
                    minutes_per_day = excluded.minutes_per_day,
                    mode = excluded.mode,
                    source_mode = excluded.source_mode,
                    payload_json = excluded.payload_json,
                    created_at = excluded.created_at,
                    is_deleted = 0,
                    deleted_at = NULL
                """,
                (
                    course.id,
                    course.title,
                    course.learner_group,
                    course.minutes_per_day,
                    course.mode,
                    course.source_mode,
                    payload_json,
                    now,
                ),
            )
        return course

    def list_courses(self) -> list[CourseSummary]:
        """Return active courses newest first."""
        with self.db.session() as conn:
            rows = conn.execute(
                """
                SELECT id, title
                FROM courses
                WHERE is_deleted = 0
                ORDER BY seq DESC
                """
            ).fetchall()
        return [CourseSummary(id=row["id"], title=row["title"]) for row in rows]

    def get_course(self, course_id: str) -> Optional[Course]:
        """Return a single active course by ID, or None if not found."""
        with self.db.session() as conn:
            row = conn.execute(
                """
                SELECT payload_json
                FROM courses
                WHERE id = ? AND is_deleted = 0
                """,
                (course_id,),
            ).fetchone()
        if row is None:
            return None
        return Course.model_validate(json.loads(row["payload_json"]))

