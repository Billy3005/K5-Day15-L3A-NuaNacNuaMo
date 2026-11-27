"""Kiểm ghép workflow của An với backend của Đạo (AN-02): form → answer() → Course pydantic → SQLite.

Model và tìm kiếm giả lập, không gọi mạng. Cần fastapi/pydantic (requirements.txt); thiếu thì bỏ qua.

    python -m unittest discover -s codebase -p "test_*.py"
"""
import json
import tempfile
import unittest
from pathlib import Path

import agent
import ai
from lesson_schema import TRIAGE_SCHEMA

try:
    from core.config import get_settings
    from core.database import Database
    from repositories.course_repository import CourseRepository
    from schemas.course import CreateCourse
    from services.course_service import CourseService, CourseServiceError
    HAVE_BACKEND = True
except ImportError:   # máy chưa cài requirements.txt
    HAVE_BACKEND = False

SOURCES = [
    {"id": "S1", "title": "PostgreSQL Tutorial — Querying a Table",
     "url": "https://www.postgresql.org/docs/current/tutorial-select.html",
     "excerpt": "An SQL SELECT statement is used to retrieve data from a table."},
    {"id": "S2", "title": "SQL WHERE", "url": "https://www.sqlshack.com/sql-where",
     "excerpt": "If we want to filter the result set of the SQL SELECT statement, we have to use the WHERE clause."},
    {"id": "S3", "title": "Không được trích", "url": "https://example.com/x", "excerpt": "Nội dung khác."},
]
LESSON = {
    "status": "ok", "message": None, "title": "SQL cho báo cáo doanh thu",
    "plan": [{"day": d, "title": t, "objective": "Mục tiêu: " + t} for d, t in enumerate(
        ["Đọc bảng bằng SELECT", "Lọc bằng WHERE", "Sắp xếp kết quả", "Tổng hợp doanh thu", "Nối hai bảng"], 1)],
    "lesson": {"day": 1, "title": "Đọc bảng bằng SELECT", "minutes": 20,
               "sections": [{"text": "SELECT lấy dữ liệu từ một bảng.", "source_ids": ["S1"]},
                            {"text": "WHERE giữ lại các dòng thỏa điều kiện.", "source_ids": ["S2"]}],
               "example": "SELECT amount FROM orders;", "exercise": "Lấy cột customer từ bảng orders."},
}
FORM = {"learner_group": "university", "topic": "SQL", "goal": "Phân tích doanh thu cho bài tập nhóm",
        "level": "Biết Excel, mới học SQL", "minutes_per_day": 20}


def stop(status, message):
    return json.dumps({"status": status, "message": message, "title": None, "plan": None, "lesson": None})


@unittest.skipUnless(HAVE_BACKEND, "chưa cài fastapi/pydantic (python -m pip install -r requirements.txt)")
class BackendIntegration(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        db = Database(Path(self.tmp.name) / "courses.db")
        db.init_schema()
        self.service = CourseService(CourseRepository(db), get_settings(db_path=db.db_path))
        self.saved = agent.MODEL_PROVIDER, agent.SOURCE_MODE, agent.search_web, agent.call_model
        agent.MODEL_PROVIDER, agent.SOURCE_MODE = "openai", "web"
        agent.search_web = lambda q: SOURCES
        self.requests = []

    def tearDown(self):
        agent.MODEL_PROVIDER, agent.SOURCE_MODE, agent.search_web, agent.call_model = self.saved
        self.tmp.cleanup()

    def model_replies(self, text, triage=json.dumps({"decision": "proceed", "question": None})):
        """triage: câu trả lời của bước kiểm độ rõ (AN-09); text: câu trả lời của bước soạn bài."""
        def fake(system, user, schema=None):
            if schema is TRIAGE_SCHEMA:
                return {"text": triage, "model": "gpt-5.4-nano", "tokens_in": 1, "tokens_out": 1}
            self.requests.append(json.loads(user)["request"])
            return {"text": text, "model": "gpt-5.4-nano", "tokens_in": 1, "tokens_out": 1}
        agent.call_model = fake

    def create(self, **form):
        return self.service.create_course(CreateCourse(**{**FORM, **form}), use_fixture=False)

    def assert_error(self, status_code, code, **form):
        with self.assertRaises(CourseServiceError) as caught:
            self.create(**form)
        self.assertEqual((caught.exception.status_code, caught.exception.envelope.error.code), (status_code, code))
        self.assertEqual(self.service.list_courses(), [], "ca dừng không được tạo khóa")
        return caught.exception

    def test_lesson_saved_and_reopened(self):
        self.model_replies(json.dumps(LESSON))
        course = self.create()
        self.assertIn("Trình độ hiện tại: Biết Excel, mới học SQL", self.requests[0])
        self.assertEqual((course.mode, course.source_mode), ("model", "web"))
        self.assertEqual(course.title, "SQL cho báo cáo doanh thu")
        self.assertEqual([s.id for s in course.sources], ["S1", "S2"])   # chỉ nguồn được trích
        self.assertEqual(self.service.get_course(course.id).model_dump(), course.model_dump())

    def test_lesson_minutes_kept_within_form_budget(self):
        self.model_replies(json.dumps({**LESSON, "lesson": {**LESSON["lesson"], "minutes": 25}}))
        self.assertEqual(self.create(minutes_per_day=15).lesson.minutes, 15)

    def test_insufficient_sources_is_422_and_not_saved(self):
        self.model_replies(stop("insufficient_sources", "Không kiểm chứng được tài liệu nội bộ được nhắc tới."))
        err = self.assert_error(422, "INSUFFICIENT_SOURCES")
        self.assertIn("Không kiểm chứng được", err.envelope.error.message)

    def test_other_stop_statuses(self):
        for status, code in (("clarification_required", "CLARIFICATION_REQUIRED"),
                             ("out_of_scope", "OUT_OF_SCOPE"), ("refused", "REFUSED")):
            with self.subTest(status):
                self.model_replies(stop(status, "Lý do cụ thể."))
                self.assert_error(422, code)

    def test_vague_goal_asks_before_search(self):
        """AN-09: bước kiểm độ rõ hỏi lại → 422 CLARIFICATION_REQUIRED, không tìm web, không tạo khóa."""
        def no_search(q):
            raise AssertionError("không được tìm web khi cần hỏi lại")
        agent.search_web = no_search
        question = "Bạn muốn học kinh doanh để làm việc gì, ví dụ lập kế hoạch bán hàng hay đọc báo cáo tài chính?"
        self.model_replies(json.dumps(LESSON),
                           triage=json.dumps({"decision": "clarification_required", "question": question}))
        err = self.assert_error(422, "CLARIFICATION_REQUIRED", topic="Kinh doanh", goal="Muốn biết thêm")
        self.assertEqual(err.envelope.error.message, question)
        self.assertEqual(self.requests, [], "không gọi bước soạn bài")

    def test_vague_and_out_of_scope_is_out_of_scope(self):
        """Review PR #12 (P2): yêu cầu vừa mơ hồ vừa ngoài phạm vi → 422 OUT_OF_SCOPE, không phải hỏi lại."""
        self.model_replies(stop("out_of_scope", "Mỹ thuật nằm ngoài phạm vi. Bạn có thể học kỹ năng viết hoặc Excel."),
                           triage=json.dumps({"decision": "out_of_scope", "question": None}))
        self.assert_error(422, "OUT_OF_SCOPE", topic="Hội họa", goal="Muốn học thêm")

    def test_invalid_source_id_never_saved(self):
        bad = {**LESSON, "lesson": {**LESSON["lesson"], "sections": [{"text": "x", "source_ids": ["S9"]}]}}
        self.model_replies(json.dumps(bad))
        self.assert_error(422, "INSUFFICIENT_SOURCES")

    def test_search_service_error_is_503(self):
        def failing(q):
            raise ai.SearchServiceError("dịch vụ tìm kiếm lỗi: too_many_requests")
        agent.search_web = failing
        self.model_replies(json.dumps(LESSON))
        self.assert_error(503, "UPSTREAM_UNAVAILABLE")


if __name__ == "__main__":
    unittest.main()
