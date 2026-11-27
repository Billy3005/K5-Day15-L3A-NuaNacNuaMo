"""Kiểm tìm kiếm web và các nhánh lỗi bằng phản hồi giả lập, không gọi mạng (góp ý review PR #2).

    python -m unittest discover -s codebase -p "test_*.py"
"""
import json
import os
import unittest

os.environ["SEARCH_API_KEY"] = os.environ.get("SEARCH_API_KEY") or "test-key"

import agent  # noqa: E402
import ai  # noqa: E402
import tools  # noqa: E402
import tracing  # noqa: E402

URL = "https://www.postgresql.org/docs/current/tutorial-select.html"
SEARCH_USE = {"type": "server_tool_use", "id": "s1", "name": "web_search", "input": {"query": "sql"}}
RESULT = {"type": "web_search_tool_result", "tool_use_id": "s1",
          "content": [{"type": "web_search_result", "url": URL, "title": "2.5. Querying a Table"}]}
CITED = {"type": "text", "text": "PostgreSQL dạy SELECT.",
         "citations": [{"type": "web_search_result_location", "url": URL, "title": "2.5. Querying a Table",
                        "cited_text": "An SQL SELECT statement is used to retrieve data from a table."}]}


def error_block(code):
    return {"type": "web_search_tool_result", "tool_use_id": "s1",
            "content": {"type": "web_search_tool_result_error", "error_code": code}}


def reply(content, stop="end_turn", searches=1):
    return {"model": "claude-haiku-5-5", "stop_reason": stop, "content": content,
            "usage": {"input_tokens": 1000, "output_tokens": 100, "server_tool_use": {"web_search_requests": searches}}}


class FakeApi:
    """Thay ai.post_json: trả lần lượt các phản hồi đã cho, ghi lại body từng lần gọi."""

    def __init__(self, *replies):
        self.replies, self.bodies = list(replies), []

    def __call__(self, url, headers, body, timeout=60):
        self.bodies.append(body)
        item = self.replies[min(len(self.bodies), len(self.replies)) - 1]
        if isinstance(item, Exception):
            raise item
        return item


class SearchCase(unittest.TestCase):
    def setUp(self):
        self._post, self._provider = ai.post_json, tools.SEARCH_PROVIDER
        tools.SEARCH_PROVIDER = "anthropic"
        tracing.begin("test")

    def tearDown(self):
        ai.post_json, tools.SEARCH_PROVIDER = self._post, self._provider
        self.summary, self.events = tracing.end()

    def search(self, *replies):
        ai.post_json = FakeApi(*replies)
        return tools.search_web("học sql")


class SearchResults(SearchCase):
    def test_title_url_and_cited_excerpt(self):
        found = self.search(reply([SEARCH_USE, RESULT, CITED]))
        self.assertEqual(found, [{"id": "S1", "title": "2.5. Querying a Table", "url": URL,
                                  "excerpt": "An SQL SELECT statement is used to retrieve data from a table."}])

    def test_pause_turn_resumed_then_finished(self):
        found = self.search(reply([SEARCH_USE, RESULT], stop="pause_turn"), reply([CITED]))
        self.assertEqual(len(found), 1)
        self.assertEqual([m["role"] for m in ai.post_json.bodies[1]["messages"]], ["user", "assistant"])

    def test_found_nothing_is_empty_not_error(self):
        self.assertEqual(self.search(reply([SEARCH_USE, RESULT, {"type": "text", "text": "Không tìm được."}])), [])


class SearchErrors(SearchCase):
    def test_service_error_raises_upstream(self):
        for code in ("too_many_requests", "unavailable"):
            with self.subTest(code=code), self.assertRaisesRegex(ai.SearchServiceError, code):
                self.search(reply([SEARCH_USE, error_block(code), {"type": "text", "text": "Lỗi."}]))

    def test_error_with_other_cited_results_still_succeeds(self):
        found = self.search(reply([SEARCH_USE, error_block("unavailable"), RESULT, CITED], searches=2))
        self.assertEqual(len(found), 1)

    def test_still_paused_after_last_call_raises(self):
        paused = reply([SEARCH_USE, RESULT, CITED], stop="pause_turn")
        with self.assertRaisesRegex(ai.SearchServiceError, "chưa hoàn tất"):
            self.search(paused)
        self.assertEqual(len(ai.post_json.bodies), ai.MAX_SEARCH_CALLS)

    def test_tokens_kept_in_trace_when_search_fails(self):
        with self.assertRaises(ai.SearchServiceError):
            self.search(reply([SEARCH_USE, error_block("too_many_requests")]))
        model_events = [e for e in tracing._case["events"] if e["kind"] == "model"]
        self.assertEqual(model_events[0]["tokens_in"], 1000)

    def test_timeout_while_resuming_keeps_spent_tokens(self):
        with self.assertRaisesRegex(ai.SearchServiceError, "tiếp tục.*TimeoutError"):
            self.search(reply([SEARCH_USE, RESULT], stop="pause_turn"), TimeoutError("timed out"))
        event = [e for e in tracing._case["events"] if e["kind"] == "model"][0]
        self.assertEqual((event["tokens_in"], event["tokens_out"]), (1000, 100))
        self.assertNotIn("error", event)

    def test_first_call_failure_propagates_unchanged(self):
        with self.assertRaises(TimeoutError):
            self.search(TimeoutError("timed out"))


class ModelOutputShape(unittest.TestCase):
    def test_non_string_status_does_not_crash(self):
        saved = agent.MODEL_PROVIDER, agent.SOURCE_MODE, agent.search_web, agent.call_model
        agent.MODEL_PROVIDER, agent.SOURCE_MODE = "openai", "mock"
        agent.search_web = lambda q: [{"id": "S1", "title": "t", "url": "https://a.b", "excerpt": "e"}]
        try:
            for status in (["ok"], {"value": "ok"}, 1, None):
                text = json.dumps({"status": status})
                agent.call_model = lambda s, u, schema=None, t=text: {"text": t, "model": "gpt-5.4-nano",
                                                                      "tokens_in": 1, "tokens_out": 1}
                with self.subTest(status=status):
                    out = json.loads(agent.answer("học sql")["output"])
                    self.assertEqual(out["status"], "insufficient_sources")
        finally:
            agent.MODEL_PROVIDER, agent.SOURCE_MODE, agent.search_web, agent.call_model = saved


class ConfigGuard(unittest.TestCase):
    def test_fake_model_with_web_search_rejected_before_searching(self):
        saved = agent.MODEL_PROVIDER, agent.SOURCE_MODE, agent.search_web
        agent.MODEL_PROVIDER, agent.SOURCE_MODE = "fake", "web"
        agent.search_web = lambda q: self.fail("không được tốn lượt tìm")
        try:
            with self.assertRaisesRegex(RuntimeError, "SEARCH_PROVIDER=mock"):
                agent.answer("Tôi mới học SQL, 20 phút mỗi ngày")
        finally:
            agent.MODEL_PROVIDER, agent.SOURCE_MODE, agent.search_web = saved


if __name__ == "__main__":
    unittest.main()
