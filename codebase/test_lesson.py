"""Kiểm schema đầu ra và bộ kiểm bài (AN-06) bằng fixture, không gọi mạng.

    python -m unittest discover -s codebase -p "test_*.py"
"""
import copy
import json
import unittest

import agent
from lesson_schema import REPLY_SCHEMA, TRIAGE_SCHEMA, minutes_budget, validate_reply

PROCEED = json.dumps({"decision": "proceed", "question": None})

SOURCES = [
    {"id": "S1", "title": "PostgreSQL Tutorial — Querying a Table",
     "url": "https://www.postgresql.org/docs/current/tutorial-select.html",
     "excerpt": "An SQL SELECT statement is used to retrieve data from a table."},
    {"id": "S2", "title": "SQL WHERE", "url": "https://www.sqlshack.com/sql-where",
     "excerpt": "If we want to filter the result set of the SQL SELECT statement, we have to use the WHERE clause."},
    {"id": "S3", "title": "Không được trích", "url": "https://example.com/x", "excerpt": "Nội dung khác."},
]
REQUEST = "Tôi mới bắt đầu học SQL và có 20 phút mỗi ngày. Lập lộ trình truy vấn dữ liệu và bài đầu tiên."
GOOD = {
    "status": "ok", "message": None, "title": "SQL nhập môn",
    "plan": [{"day": d, "title": t, "objective": "Mục tiêu " + t} for d, t in enumerate(
        ["Đọc dữ liệu bằng SELECT", "Lọc bằng WHERE", "Sắp xếp và giới hạn", "Nhóm và tổng hợp", "Nối hai bảng"], 1)],
    "lesson": {
        "day": 1, "title": "Đọc dữ liệu bằng SELECT", "minutes": 20,
        "sections": [{"text": "SELECT dùng để lấy dữ liệu từ một bảng.", "source_ids": ["S1"]},
                     {"text": "Muốn lọc kết quả thì thêm WHERE.", "source_ids": ["S2", "S1"]}],
        "example": "SELECT name FROM students;", "exercise": "Viết truy vấn lấy cột email từ bảng students.",
    },
}


def broken(path, value):
    """Bản sao GOOD với một trường bị thay, path dạng 'lesson.sections.0.source_ids'."""
    data = copy.deepcopy(GOOD)
    *parents, last = path.split(".")
    node = data
    for key in parents:
        node = node[int(key)] if isinstance(node, list) else node[key]
    if isinstance(node, list):
        node[int(last)] = value
    else:
        node[last] = value
    return data


class StrictSchema(unittest.TestCase):
    def test_every_object_is_strict(self):
        """OpenAI strict mode: mọi object có additionalProperties false và required đủ mọi trường."""
        def walk(node, where="root"):
            if isinstance(node, dict):
                if node.get("type") == "object":
                    self.assertIs(node.get("additionalProperties"), False, where)
                    self.assertEqual(sorted(node["required"]), sorted(node["properties"]), where)
                for key, child in node.items():
                    walk(child, f"{where}.{key}")
            elif isinstance(node, list):
                for i, child in enumerate(node):
                    walk(child, f"{where}[{i}]")
        walk(REPLY_SCHEMA)
        walk(TRIAGE_SCHEMA)


class Validate(unittest.TestCase):
    def test_good_reply_passes_and_keeps_only_cited_sources(self):
        result, notes = validate_reply(GOOD, SOURCES, REQUEST)
        self.assertEqual(result["status"], "ok")
        self.assertEqual([s["id"] for s in result["sources"]], ["S1", "S2"])
        self.assertEqual(set(result), {"status", "title", "plan", "lesson", "sources"})
        self.assertNotIn("message", result)
        self.assertEqual(notes, [])

    def test_rejections(self):
        cases = {
            "plan 4 ngày": broken("plan", GOOD["plan"][:4]),
            "ngày sai thứ tự": broken("plan.1.day", 3),
            "lesson là list (lỗi gặp khi chạy thật)": broken("lesson", [GOOD["lesson"]]),
            "lesson không phải ngày 1": broken("lesson.day", 2),
            "example là object": broken("lesson.example", {"text": "x"}),
            "thiếu exercise": broken("lesson.exercise", ""),
            "section không trích nguồn": broken("lesson.sections.0.source_ids", []),
            "trích ID bịa": broken("lesson.sections.0.source_ids", ["S9"]),
            "trích trùng ID": broken("lesson.sections.0.source_ids", ["S1", "S1"]),
            "không có section": broken("lesson.sections", []),
            "status lạ": broken("status", "done"),
            "status là list": broken("status", ["ok"]),
            "ID là list rỗng": broken("lesson.sections.0.source_ids", [[]]),
            "ID là object": broken("lesson.sections.0.source_ids", [{"id": "S1"}]),
            "ID là số": broken("lesson.sections.0.source_ids", [1]),
            "ID là chuỗi rỗng": broken("lesson.sections.0.source_ids", [""]),
        }
        for name, reply in cases.items():
            with self.subTest(name):
                result, notes = validate_reply(reply, SOURCES, REQUEST)
                self.assertEqual(result, {"status": "insufficient_sources",
                                          "message": "Chưa đủ căn cứ để xuất bài có trích dẫn."})
                self.assertTrue(notes)

    def test_no_sources_means_no_lesson(self):
        result, _ = validate_reply(GOOD, [], REQUEST)
        self.assertEqual(result["status"], "insufficient_sources")

    def test_minutes_capped_to_budget(self):
        result, notes = validate_reply(broken("lesson.minutes", 45), SOURCES, REQUEST)
        self.assertEqual(result["lesson"]["minutes"], 20)
        self.assertIn("45 → 20", notes[0])

    def test_stop_status_keeps_message_only(self):
        reply = {"status": "out_of_scope", "message": "Ngoài phạm vi. Bạn có thể học Excel.", "title": None,
                 "plan": None, "lesson": None}
        self.assertEqual(validate_reply(reply, SOURCES)[0],
                         {"status": "out_of_scope", "message": "Ngoài phạm vi. Bạn có thể học Excel."})
        self.assertEqual(validate_reply({"status": "refused", "message": None}, SOURCES)[0]["message"],
                         "Chưa thể soạn bài cho yêu cầu này.")

    def test_minutes_budget(self):
        self.assertEqual(minutes_budget(REQUEST), 20)
        self.assertEqual(minutes_budget("Thời gian học: 15 phút mỗi ngày."), 15)
        self.assertEqual(minutes_budget("Có 25 phút/ngày để học Git."), 25)
        self.assertEqual(minutes_budget("Tôi muốn học về dữ liệu."), 20)   # không nêu → mặc định
        self.assertEqual(minutes_budget("có 15 phút mỗi ngày", minutes_per_day=40), 40)

    def test_minutes_in_goal_not_taken_as_budget(self):
        """Ca review: mục tiêu nhắc "5 phút", minutes_per_day=30 → bài 25 phút được giữ."""
        request = ("Tôi là sinh viên đại học. Chủ đề muốn học: viết học thuật. Mục tiêu: tóm tắt báo cáo trong "
                   "5 phút. Trình độ hiện tại: mới bắt đầu. Thời gian học: 30 phút mỗi ngày.")
        lesson25 = broken("lesson.minutes", 25)
        self.assertEqual(validate_reply(lesson25, SOURCES, request)[0]["lesson"]["minutes"], 25)
        self.assertEqual(validate_reply(lesson25, SOURCES, "mục tiêu: trình bày trong 5 phút",
                                        minutes_per_day=30)[0]["lesson"]["minutes"], 25)

    def test_no_duration_defaults_to_20(self):
        result, notes = validate_reply(broken("lesson.minutes", 25), SOURCES, "Tôi muốn học SQL để làm báo cáo.")
        self.assertEqual(result["lesson"]["minutes"], 20)
        self.assertIn("25 → 20", notes[0])


class AnswerWithFixture(unittest.TestCase):
    """Luồng answer() với model và nguồn giả lập: kiểm cách nối, schema được gửi và hình dạng đầu ra."""

    def setUp(self):
        self.saved = agent.MODEL_PROVIDER, agent.SOURCE_MODE, agent.search_web, agent.call_model
        agent.MODEL_PROVIDER, agent.SOURCE_MODE = "openai", "web"
        self.searches = []
        agent.search_web = lambda q: self.searches.append(q) or SOURCES
        self.calls = []

    def tearDown(self):
        agent.MODEL_PROVIDER, agent.SOURCE_MODE, agent.search_web, agent.call_model = self.saved

    def run_with(self, reply_text, request=REQUEST, triage=PROCEED, **kwargs):
        """triage: câu trả lời của bước kiểm độ rõ; reply_text: câu trả lời của bước soạn bài."""
        def fake(system, user, schema=None):
            self.calls.append({"user": json.loads(user), "schema": schema})
            text = triage if schema is TRIAGE_SCHEMA else reply_text
            return {"text": text, "model": "gpt-5.4-nano", "tokens_in": 1, "tokens_out": 1}
        agent.call_model = fake
        return json.loads(agent.answer(request, **kwargs)["output"])

    def test_vague_request_asks_before_search(self):
        """AN-09: yêu cầu chỉ nêu lĩnh vực rộng → hỏi lại, không tìm web, không gọi bước soạn bài."""
        question = "Bạn muốn học lập trình để làm việc gì, ví dụ làm web, phân tích số liệu hay tự động hoá?"
        out = self.run_with(json.dumps(GOOD), request="Mình muốn học lập trình.",
                            triage=json.dumps({"decision": "clarification_required", "question": question}))
        self.assertEqual(out, {"status": "clarification_required", "message": question,
                               "mode": "model", "source_mode": "web"})
        self.assertEqual(self.searches, [])
        self.assertEqual([c["schema"] for c in self.calls], [TRIAGE_SCHEMA])

    def test_clarification_without_question_uses_fallback(self):
        out = self.run_with(json.dumps(GOOD), triage=json.dumps({"decision": "clarification_required",
                                                                 "question": "  "}))
        self.assertEqual(out["message"], agent.CLARIFY_FALLBACK)

    def test_unreadable_triage_keeps_old_flow(self):
        for triage in ("không phải JSON", json.dumps({"decision": "maybe"}), json.dumps(["proceed"])):
            with self.subTest(triage):
                self.searches.clear()
                self.assertEqual(self.run_with(json.dumps(GOOD), triage=triage)["status"], "ok")
                self.assertEqual(len(self.searches), 1)

    def test_fake_model_skips_triage(self):
        agent.MODEL_PROVIDER, agent.SOURCE_MODE = "fake", "mock"
        self.run_with(json.dumps(GOOD))
        self.assertEqual([c["schema"] for c in self.calls], [REPLY_SCHEMA])

    def test_minutes_per_day_from_web_form(self):
        out = self.run_with(json.dumps(broken("lesson.minutes", 25)), request="Mục tiêu: thuyết trình 5 phút.",
                            minutes_per_day=30)
        self.assertEqual(out["lesson"]["minutes"], 25)

    def test_ok_output_matches_contract(self):
        out = self.run_with(json.dumps(GOOD))
        self.assertEqual([c["schema"] for c in self.calls], [TRIAGE_SCHEMA, REPLY_SCHEMA])
        self.assertEqual(self.calls[0]["user"], {"request": REQUEST})   # bước kiểm không thấy nguồn
        self.assertEqual([s["id"] for s in self.calls[1]["user"]["sources"]], ["S1", "S2", "S3"])
        self.assertEqual(self.searches, [REQUEST])
        self.assertEqual((out["status"], out["mode"], out["source_mode"]), ("ok", "model", "web"))
        self.assertEqual(len(out["plan"]), 5)
        cited = {i for s in out["lesson"]["sections"] for i in s["source_ids"]}
        self.assertEqual(cited, {s["id"] for s in out["sources"]})

    def test_stop_output(self):
        out = self.run_with(json.dumps({"status": "clarification_required", "message": "Bạn muốn học SQL để làm gì?",
                                        "title": None, "plan": None, "lesson": None}))
        self.assertEqual(out, {"status": "clarification_required", "message": "Bạn muốn học SQL để làm gì?",
                               "mode": "model", "source_mode": "web"})


if __name__ == "__main__":
    unittest.main()
