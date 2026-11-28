"""SQLite repository for progress, quizzes, quiz attempts and lesson videos (NewLearn)."""

from datetime import datetime, timezone
import json
from typing import Any, Optional

from core.database import Database


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


class LearningRepository:
    def __init__(self, db: Database) -> None:
        self.db = db

    # ------------------------------------------------------------------ courses (read-only view)
    def course_rows(self) -> list[dict[str, Any]]:
        with self.db.session() as conn:
            rows = conn.execute(
                """
                SELECT id, title, minutes_per_day, mode, source_mode, created_at, payload_json
                FROM courses WHERE is_deleted = 0
                ORDER BY created_at DESC, seq DESC
                """
            ).fetchall()
        return [dict(row) for row in rows]

    # ------------------------------------------------------------------ progress
    def days_done(self, course_id: str) -> list[int]:
        with self.db.session() as conn:
            rows = conn.execute(
                "SELECT day FROM progress WHERE course_id = ? ORDER BY day", (course_id,)
            ).fetchall()
        return [row["day"] for row in rows]

    def set_day(self, course_id: str, day: int, done: bool) -> list[int]:
        with self.db.session() as conn:
            if done:
                conn.execute(
                    "INSERT OR IGNORE INTO progress (course_id, day, done_at) VALUES (?, ?, ?)",
                    (course_id, day, _now()),
                )
            else:
                conn.execute("DELETE FROM progress WHERE course_id = ? AND day = ?", (course_id, day))
        return self.days_done(course_id)

    def all_progress(self) -> list[dict[str, Any]]:
        with self.db.session() as conn:
            rows = conn.execute("SELECT course_id, day, done_at FROM progress").fetchall()
        return [dict(row) for row in rows]

    # ------------------------------------------------------------------ quizzes
    def save_quiz(self, quiz_id: str, course_id: str, day: int, mode: str, questions: list[dict]) -> str:
        created = _now()
        with self.db.session() as conn:
            conn.execute(
                "INSERT INTO quizzes (id, course_id, day, mode, questions_json, created_at) VALUES (?, ?, ?, ?, ?, ?)",
                (quiz_id, course_id, day, mode, json.dumps(questions, ensure_ascii=False), created),
            )
        return created

    def get_quiz(self, quiz_id: str) -> Optional[dict[str, Any]]:
        with self.db.session() as conn:
            row = conn.execute("SELECT * FROM quizzes WHERE id = ?", (quiz_id,)).fetchone()
        if row is None:
            return None
        quiz = dict(row)
        quiz["questions"] = json.loads(quiz.pop("questions_json"))
        return quiz

    def save_check(self, quiz_id: str, idx: int, answer: Any, verdict: str, feedback: str) -> None:
        with self.db.session() as conn:
            conn.execute(
                """
                INSERT INTO quiz_checks (quiz_id, idx, answer_json, verdict, feedback, checked_at)
                VALUES (?, ?, ?, ?, ?, ?)
                ON CONFLICT(quiz_id, idx) DO UPDATE SET
                    answer_json = excluded.answer_json, verdict = excluded.verdict,
                    feedback = excluded.feedback, checked_at = excluded.checked_at
                """,
                (quiz_id, idx, json.dumps(answer, ensure_ascii=False), verdict, feedback, _now()),
            )

    def get_checks(self, quiz_id: str) -> dict[int, dict[str, Any]]:
        with self.db.session() as conn:
            rows = conn.execute(
                "SELECT idx, answer_json, verdict, feedback FROM quiz_checks WHERE quiz_id = ?", (quiz_id,)
            ).fetchall()
        return {row["idx"]: {"answer": json.loads(row["answer_json"]), "verdict": row["verdict"],
                             "feedback": row["feedback"]} for row in rows}

    def save_attempt(self, attempt: dict[str, Any]) -> dict[str, Any]:
        attempt = {**attempt, "created_at": _now()}
        with self.db.session() as conn:
            conn.execute(
                """
                INSERT INTO quiz_attempts
                (id, quiz_id, course_id, day, answers_json, results_json, score, total, duration_s, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    attempt["id"], attempt["quiz_id"], attempt["course_id"], attempt["day"],
                    json.dumps(attempt["answers"], ensure_ascii=False),
                    json.dumps(attempt["results"], ensure_ascii=False),
                    attempt["score"], attempt["total"], attempt["duration_s"], attempt["created_at"],
                ),
            )
        return attempt

    def list_attempts(self, course_id: Optional[str] = None) -> list[dict[str, Any]]:
        sql = "SELECT id, quiz_id, course_id, day, score, total, duration_s, created_at FROM quiz_attempts"
        params: tuple = ()
        if course_id:
            sql += " WHERE course_id = ?"
            params = (course_id,)
        sql += " ORDER BY created_at DESC"
        with self.db.session() as conn:
            rows = conn.execute(sql, params).fetchall()
        return [dict(row) for row in rows]

    def get_attempt(self, attempt_id: str) -> Optional[dict[str, Any]]:
        with self.db.session() as conn:
            row = conn.execute("SELECT * FROM quiz_attempts WHERE id = ?", (attempt_id,)).fetchone()
        if row is None:
            return None
        attempt = dict(row)
        attempt["answers"] = json.loads(attempt.pop("answers_json"))
        attempt["results"] = json.loads(attempt.pop("results_json"))
        return attempt

    # ------------------------------------------------------------------ videos
    def save_video(self, video: dict[str, Any]) -> dict[str, Any]:
        now = _now()
        video = {**video, "created_at": video.get("created_at") or now, "updated_at": now}
        with self.db.session() as conn:
            conn.execute(
                """
                INSERT INTO videos (id, course_id, day, mode, status, scenes_json, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(id) DO UPDATE SET
                    status = excluded.status, scenes_json = excluded.scenes_json, updated_at = excluded.updated_at
                """,
                (
                    video["id"], video["course_id"], video["day"], video["mode"], video["status"],
                    json.dumps(video["scenes"], ensure_ascii=False), video["created_at"], video["updated_at"],
                ),
            )
        return video

    def _video_from_row(self, row) -> dict[str, Any]:
        video = dict(row)
        video["scenes"] = json.loads(video.pop("scenes_json"))
        return video

    def get_video(self, video_id: str) -> Optional[dict[str, Any]]:
        with self.db.session() as conn:
            row = conn.execute("SELECT * FROM videos WHERE id = ?", (video_id,)).fetchone()
        return None if row is None else self._video_from_row(row)

    def list_videos(self, course_id: Optional[str] = None) -> list[dict[str, Any]]:
        sql = "SELECT * FROM videos"
        params: tuple = ()
        if course_id:
            sql += " WHERE course_id = ?"
            params = (course_id,)
        sql += " ORDER BY updated_at DESC"
        with self.db.session() as conn:
            rows = conn.execute(sql, params).fetchall()
        return [self._video_from_row(row) for row in rows]
