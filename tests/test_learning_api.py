"""NewLearn API: tiến độ, kiểm tra nhanh, lịch sử kiểm tra, video và tổng quan (chạy offline, model giả)."""

from pathlib import Path
import sys

from fastapi.testclient import TestClient
import pytest

ROOT = Path(__file__).resolve().parents[1]
CODEBASE = ROOT / "codebase"
if str(CODEBASE) not in sys.path:
    sys.path.insert(0, str(CODEBASE))

import ai  # noqa: E402
from app import create_app  # noqa: E402
from services import learning_service  # noqa: E402

PAYLOAD = {
    "learner_group": "university",
    "topic": "SQL",
    "goal": "Phân tích doanh thu cho bài tập nhóm",
    "level": "Biết Excel, mới học SQL",
    "minutes_per_day": 20,
}


@pytest.fixture()
def client(tmp_path: Path, monkeypatch) -> TestClient:
    monkeypatch.setattr(ai, "MODEL_PROVIDER", "fake")
    return TestClient(create_app(db_path=tmp_path / "learn.db"))


@pytest.fixture()
def course_id(client: TestClient) -> str:
    response = client.post("/api/courses?fixture=1", json=PAYLOAD)
    assert response.status_code == 201
    return response.json()["id"]


def test_progress_roundtrip_and_validation(client, course_id):
    assert client.get(f"/api/courses/{course_id}/progress").json()["days_done"] == []
    assert client.put(f"/api/courses/{course_id}/progress/1", json={"done": True}).json()["days_done"] == [1]
    assert client.put(f"/api/courses/{course_id}/progress/3", json={"done": True}).json()["days_done"] == [1, 3]
    assert client.put(f"/api/courses/{course_id}/progress/1", json={"done": False}).json()["days_done"] == [3]
    bad = client.put(f"/api/courses/{course_id}/progress/9", json={"done": True})
    assert bad.status_code == 422 and bad.json()["error"]["code"] == "INVALID_INPUT"
    assert client.get("/api/courses/khong-co/progress").status_code == 404


def _answers_from_checks(client, quiz):
    """Lấy đáp án đúng qua /check (đáp án chỉ lộ ra sau khi kiểm tra từng câu)."""
    answers = []
    for i, q in enumerate(quiz["questions"]):
        revealed = client.post(f"/api/quizzes/{quiz['id']}/check", json={"index": i, "answer": None}).json()
        answers.append(revealed["answer_index"] if q["type"] in ("mcq", "tf") else revealed["answer_text"])
    return answers


def test_quiz_flow_saves_attempt_in_history(client, course_id):
    quiz = client.post(f"/api/courses/{course_id}/quizzes").json()
    assert quiz["mode"] == "mock" and len(quiz["questions"]) == 5
    assert [q["type"] for q in quiz["questions"]].count("mcq") == 2
    source_ids = {s["id"] for s in client.get(f"/api/courses/{course_id}").json()["sources"]}
    assert all(q["source_id"] in source_ids for q in quiz["questions"])
    # Đề gửi cho người làm không kèm đáp án hay giải thích.
    assert all(set(q) == {"type", "prompt", "options", "source_id"} for q in quiz["questions"])

    answers = _answers_from_checks(client, quiz)
    short_index = next(i for i, q in enumerate(quiz["questions"]) if q["type"] == "short")
    graded = client.post(f"/api/quizzes/{quiz['id']}/check",
                         json={"index": short_index, "answer": answers[short_index]}).json()
    assert graded["verdict"] == "dat" and graded["explanation"]

    attempt = client.post(f"/api/quizzes/{quiz['id']}/attempts",
                          json={"answers": answers, "duration_s": 95, "submission_id": "sub-12345678"})
    assert attempt.status_code == 201
    body = attempt.json()
    assert (body["score"], body["total"]) == (5, 5)

    # Nộp lại cùng mã lượt (nhấp đúp, mất phản hồi) không tạo thêm dòng lịch sử.
    again = client.post(f"/api/quizzes/{quiz['id']}/attempts",
                        json={"answers": answers, "duration_s": 99, "submission_id": "sub-12345678"}).json()
    assert again["id"] == body["id"]

    history = client.get("/api/quiz-attempts").json()
    assert len(history) == 1 and history[0]["course_title"]
    detail = client.get(f"/api/quiz-attempts/{body['id']}").json()
    assert len(detail["questions"]) == 5 and detail["answers"] == answers


def test_client_cannot_claim_short_answer_verdict(client, course_id):
    quiz = client.post(f"/api/courses/{course_id}/quizzes").json()
    answers = _answers_from_checks(client, quiz)
    short_index = next(i for i, q in enumerate(quiz["questions"]) if q["type"] == "short")
    answers[short_index] = ""
    body = client.post(f"/api/quizzes/{quiz['id']}/attempts",
                       json={"answers": answers, "short_verdicts": {str(short_index): "dat"}}).json()
    assert body["results"][short_index]["verdict"] == "chua_dat" and body["score"] == 4


def test_fill_answer_ignores_curly_quotes(client, course_id):
    quiz = client.post(f"/api/courses/{course_id}/quizzes").json()
    fill_index = next(i for i, q in enumerate(quiz["questions"]) if q["type"] == "fill")
    answer = client.post(f"/api/quizzes/{quiz['id']}/check", json={"index": fill_index}).json()["answer_text"]
    checked = client.post(f"/api/quizzes/{quiz['id']}/check",
                          json={"index": fill_index, "answer": f"“{answer}”"}).json()
    assert checked["verdict"] == "dat"


def test_wrong_answers_score_lower(client, course_id):
    quiz = client.post(f"/api/courses/{course_id}/quizzes").json()
    answers = [None] * 5
    body = client.post(f"/api/quizzes/{quiz['id']}/attempts", json={"answers": answers}).json()
    assert body["score"] == 0
    short = client.post(f"/api/quizzes/{quiz['id']}/attempts", json={"answers": [None]})
    assert short.status_code == 422
    too_long = client.post(f"/api/quizzes/{quiz['id']}/check", json={"index": 4, "answer": "x" * 1001})
    assert too_long.status_code == 422


def test_video_script_edit_and_render(client, course_id):
    video = client.post(f"/api/courses/{course_id}/videos").json()
    assert video["status"] == "draft" and video["scenes"][0]["kind"] == "Mở đầu"
    assert video["scenes"][-1]["source_id"] == "plan" and video["duration_s"] > 0

    scenes = video["scenes"]
    scenes[1]["narration"] = "Lời dẫn đã sửa."
    updated = client.put(f"/api/videos/{video['id']}", json={"scenes": scenes}).json()
    assert updated["scenes"][1]["narration"] == "Lời dẫn đã sửa."

    scenes[1]["source_id"] = "S99"
    bad = client.put(f"/api/videos/{video['id']}", json={"scenes": scenes})
    assert bad.status_code == 422

    ready = client.post(f"/api/videos/{video['id']}/render").json()
    assert ready["status"] == "ready"
    assert client.get("/api/videos").json()[0]["id"] == video["id"]


def test_overview_counts(client, course_id):
    client.put(f"/api/courses/{course_id}/progress/1", json={"done": True})
    video = client.post(f"/api/courses/{course_id}/videos").json()
    client.post(f"/api/videos/{video['id']}/render")
    data = client.get("/api/overview").json()
    assert data["stats"]["course_count"] == 1
    assert data["stats"]["minutes_week"] == 20
    assert data["stats"]["streak_days"] == 1
    assert data["stats"]["video_count"] == 1
    assert data["courses"][0]["days_done"] == [1] and data["courses"][0]["has_video"] is True
    assert {e["kind"] for e in data["activity"]} >= {"course", "day_done", "video"}


def test_model_quiz_rejects_bad_output_then_503(client, course_id, monkeypatch):
    monkeypatch.setattr(ai, "MODEL_PROVIDER", "openai")
    monkeypatch.setattr(learning_service, "_model_reply",
                        lambda *a, **k: {"text": '{"questions": []}', "model": "x", "tokens_in": 0, "tokens_out": 0})
    response = client.post(f"/api/courses/{course_id}/quizzes")
    assert response.status_code == 503
    assert response.json()["error"]["code"] == "UPSTREAM_UNAVAILABLE"


def test_model_network_error_has_operation_message(client, course_id, monkeypatch):
    monkeypatch.setattr(ai, "MODEL_PROVIDER", "openai")

    def boom(*_a, **_k):
        raise TimeoutError("timed out")

    monkeypatch.setattr(learning_service, "_model_reply", boom)
    response = client.post(f"/api/courses/{course_id}/videos")
    assert response.status_code == 503
    assert "video" in response.json()["error"]["message"]
