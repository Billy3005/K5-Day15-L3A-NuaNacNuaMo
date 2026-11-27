"""Comprehensive tests for DAO-01..DAO-10 backend endpoints, validation, SQLite, UI serving, and cost config."""

from concurrent.futures import ThreadPoolExecutor
import json
import os
from pathlib import Path
import signal
import socket
import sqlite3
import subprocess
import sys
import time
import urllib.request

from fastapi.testclient import TestClient
import pytest

ROOT = Path(__file__).resolve().parents[1]
CODEBASE = ROOT / "codebase"
if str(CODEBASE) not in sys.path:
    sys.path.insert(0, str(CODEBASE))

from app import create_app  # noqa: E402
from schemas.course import Course, CourseSummary, CreateCourse, ErrorEnvelope  # noqa: E402
from services import course_service  # noqa: E402


VALID_SQL_PAYLOAD = {
    "learner_group": "university",
    "topic": "SQL",
    "goal": "Phân tích doanh thu cho bài tập nhóm",
    "level": "Biết Excel, mới học SQL",
    "minutes_per_day": 20,
}


@pytest.fixture()
def client(tmp_path: Path) -> TestClient:
    db_file = tmp_path / "test_courses.db"
    application = create_app(db_path=db_file)
    return TestClient(application)


def test_dao01_post_fixture_returns_201_and_location(client: TestClient) -> None:
    resp = client.post("/api/courses?fixture=1", json=VALID_SQL_PAYLOAD)
    assert resp.status_code == 201
    data = resp.json()
    assert data["id"].startswith("course-demo-sql")
    assert resp.headers["location"] == f"/api/courses/{data['id']}"
    assert data["learner_group"] == "university"
    assert data["minutes_per_day"] == 20
    assert len(data["plan"]) == 5
    assert [d["day"] for d in data["plan"]] == [1, 2, 3, 4, 5]
    assert data["lesson"]["day"] == 1
    assert data["lesson"]["minutes"] <= data["minutes_per_day"]
    source_ids = {s["id"] for s in data["sources"]}
    assert source_ids
    for sec in data["lesson"]["sections"]:
        assert set(sec["source_ids"]) <= source_ids


def test_dao03_sqlite_persists_across_restart(tmp_path: Path) -> None:
    db_file = tmp_path / "persist.db"
    app1 = create_app(db_path=db_file)
    c1 = TestClient(app1)
    post_resp = c1.post("/api/courses?fixture=1", json=VALID_SQL_PAYLOAD)
    assert post_resp.status_code == 201
    created = post_resp.json()

    # Simulate server restart by creating a new FastAPI app & repository against same DB file
    app2 = create_app(db_path=db_file)
    c2 = TestClient(app2)
    get_resp = c2.get(f"/api/courses/{created['id']}")
    assert get_resp.status_code == 200
    assert get_resp.json() == created


def test_dao04_list_empty_newest_first_and_404(client: TestClient) -> None:
    empty_resp = client.get("/api/courses")
    assert empty_resp.status_code == 200
    assert empty_resp.json() == []

    missing_resp = client.get("/api/courses/does-not-exist")
    assert missing_resp.status_code == 404
    assert missing_resp.json() == {
        "error": {
            "code": "NOT_FOUND",
            "message": "Không tìm thấy khóa này.",
        }
    }

    r1 = client.post("/api/courses", json=VALID_SQL_PAYLOAD)
    assert r1.status_code == 201
    c1 = r1.json()

    git_payload = {
        "learner_group": "university",
        "topic": "Git",
        "goal": "Quản lý code cho bài tập nhóm",
        "level": "Chưa từng dùng terminal",
        "minutes_per_day": 15,
    }
    r2 = client.post("/api/courses", json=git_payload)
    assert r2.status_code == 201
    c2 = r2.json()

    list_resp = client.get("/api/courses")
    assert list_resp.status_code == 200
    items = list_resp.json()
    assert [item["id"] for item in items] == [c2["id"], c1["id"]]


@pytest.mark.parametrize(
    ("bad_patch", "expected_field"),
    [
        ({"learner_group": "phd"}, "learner_group"),
        ({"topic": "   "}, "topic"),
        ({"topic": "x" * 121}, "topic"),
        ({"goal": ""}, "goal"),
        ({"goal": "x" * 501}, "goal"),
        ({"level": "   "}, "level"),
        ({"level": "x" * 251}, "level"),
        ({"minutes_per_day": 0}, "minutes_per_day"),
        ({"minutes_per_day": 241}, "minutes_per_day"),
        ({"minutes_per_day": True}, "minutes_per_day"),
        ({"minutes_per_day": 20.5}, "minutes_per_day"),
        ({"minutes_per_day": 20.0}, "minutes_per_day"),
        ({"minutes_per_day": "20"}, "minutes_per_day"),
    ],
)
def test_dao05_input_validation_maps_to_422(
    client: TestClient,
    bad_patch: dict,
    expected_field: str,
) -> None:
    payload = {**VALID_SQL_PAYLOAD, **bad_patch}
    resp = client.post("/api/courses", json=payload)
    assert resp.status_code == 422
    body = resp.json()
    assert body["error"]["code"] == "INVALID_INPUT"
    assert body["error"]["field"] == expected_field
    assert body["error"]["message"]


def test_dao05_rejects_extra_fields(client: TestClient) -> None:
    payload = {**VALID_SQL_PAYLOAD, "extra_field": "nope"}
    resp = client.post("/api/courses", json=payload)
    assert resp.status_code == 422
    assert resp.json()["error"]["code"] == "INVALID_INPUT"


def test_dao05_stop_statuses_return_422_and_do_not_save(client: TestClient) -> None:
    # Out of scope topic
    oos_payload = {
        "learner_group": "university",
        "topic": "Mỹ thuật",
        "goal": "Học vẽ sơn dầu cơ bản",
        "level": "Mới bắt đầu",
        "minutes_per_day": 30,
    }
    r_oos = client.post("/api/courses", json=oos_payload)
    assert r_oos.status_code == 422
    assert r_oos.json()["error"]["code"] == "OUT_OF_SCOPE"
    assert r_oos.json()["error"]["field"] == "topic"

    # Insufficient sources
    insuff_payload = {
        "learner_group": "university",
        "topic": "Quantum compiler internals",
        "goal": "Tối ưu mạch lượng tử chuyên sâu chưa công bố",
        "level": "Đã biết Python",
        "minutes_per_day": 30,
    }
    r_insuff = client.post("/api/courses", json=insuff_payload)
    assert r_insuff.status_code == 422
    assert r_insuff.json()["error"]["code"] == "INSUFFICIENT_SOURCES"
    assert r_insuff.json()["error"]["field"] == "goal"

    # Refused (ask to fabricate)
    refused_payload = {
        "learner_group": "university",
        "topic": "Kinh tế",
        "goal": "Hãy bịa nguồn tài liệu về tăng trưởng",
        "level": "Mới bắt đầu",
        "minutes_per_day": 20,
    }
    r_refused = client.post("/api/courses", json=refused_payload)
    assert r_refused.status_code == 422
    assert r_refused.json()["error"]["code"] == "REFUSED"

    # Nothing should be saved in SQLite
    assert client.get("/api/courses").json() == []


def test_dao05_upstream_unavailable_maps_to_503(
    client: TestClient,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    def _broken_answer(_text: str, *, minutes_per_day: int) -> dict:
        raise NotImplementedError("model not configured")

    monkeypatch.setattr(course_service.agent_module, "answer", _broken_answer)
    resp = client.post(
        "/api/courses",
        json=VALID_SQL_PAYLOAD,
        headers={"Origin": "http://localhost:3000"},
    )
    assert resp.status_code == 503
    assert resp.headers.get("access-control-allow-origin") == "*"
    assert resp.json() == {
        "error": {
            "code": "UPSTREAM_UNAVAILABLE",
            "message": "Chưa tạo được lộ trình. Bạn có thể thử lại.",
        }
    }
    assert client.get("/api/courses").json() == []


def test_dao02_real_workflow_shape_persists_course(
    client: TestClient,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    def _real_like_answer(_text: str, *, minutes_per_day: int) -> dict:
        payload = {
            "status": "ok",
            "mode": "model",
            "source_mode": "web",
            "plan": [
                {"day": d, "title": f"Ngày {d}", "objective": f"Mục tiêu ngày {d}"}
                for d in range(1, 6)
            ],
            "lesson": {
                "day": 1,
                "title": "Ngày 1",
                "minutes": 25,  # will be clamped to minutes_per_day=20
                "sections": [{"text": "Nội dung bài 1", "source_ids": ["S1"]}],
                "example": "SELECT 1;",
                "exercise": "Viết lại truy vấn.",
            },
            "sources": [
                {
                    "id": "S1",
                    "title": "PostgreSQL Docs",
                    "url": "https://www.postgresql.org/docs/current/tutorial-select.html",
                    "excerpt": "SELECT retrieves rows from a table.",
                }
            ],
        }
        return {"output": json.dumps(payload, ensure_ascii=False)}

    monkeypatch.setattr(course_service.agent_module, "answer", _real_like_answer)
    resp = client.post("/api/courses", json=VALID_SQL_PAYLOAD)
    assert resp.status_code == 201
    created = resp.json()
    assert created["mode"] == "model"
    assert created["source_mode"] == "web"
    assert created["lesson"]["minutes"] == 20

    fetched = client.get(f"/api/courses/{created['id']}")
    assert fetched.status_code == 200
    assert fetched.json() == created


@pytest.mark.parametrize(("model", "expected_minutes"), [("stub-model", 25), ("fake", 20)])
def test_web_uses_daily_minutes_from_form(
    client: TestClient,
    monkeypatch: pytest.MonkeyPatch,
    model: str,
    expected_minutes: int,
) -> None:
    sample = client.post("/api/courses?fixture=1", json=VALID_SQL_PAYLOAD).json()
    sample["status"] = "ok"
    sample["lesson"]["minutes"] = 25

    def _model_reply(_system: str, user: str, *, schema: dict) -> dict:
        source_id = json.loads(user)["sources"][0]["id"]
        sample["lesson"]["sections"][0]["source_ids"] = [source_id]
        return {"model": model, "text": json.dumps(sample)}

    monkeypatch.setattr(course_service.agent_module, "call_model", _model_reply)
    payload = {
        **VALID_SQL_PAYLOAD,
        "goal": "Tóm tắt báo cáo trong 5 phút mỗi ngày",
        "minutes_per_day": 30,
    }
    response = client.post("/api/courses?fixture=0", json=payload)
    assert response.status_code == 201
    assert response.json()["lesson"]["minutes"] == expected_minutes


def test_dao02_real_workflow_fenced_json_and_extra_metadata(
    client: TestClient,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    def _fenced_answer(_text: str, *, minutes_per_day: int) -> dict:
        payload = {
            "status": "ok",
            "mode": "model",
            "source_mode": "web",
            "debug_notes": "should be stripped",
            "plan": [
                {
                    "day": d,
                    "title": f"Ngày {d}",
                    "objective": f"Mục tiêu {d}",
                    "extra_meta": True,
                }
                for d in range(1, 6)
            ],
            "lesson": {
                "day": 1,
                "title": "Ngày 1",
                "minutes": 15,
                "sections": [
                    {"text": "Giải thích có nguồn", "source_ids": ["S1"], "confidence": 0.9}
                ],
                "example": "SELECT * FROM orders;",
                "exercise": "Lọc theo ngày.",
                "internal_tag": "v2",
            },
            "sources": [
                {
                    "id": "S1",
                    "title": "PostgreSQL Docs",
                    "url": "https://www.postgresql.org/docs/current/tutorial-select.html",
                    "excerpt": "SELECT retrieves rows.",
                    "rank": 1,
                }
            ],
        }
        return {"output": "```json\n" + json.dumps(payload, ensure_ascii=False) + "\n```"}

    monkeypatch.setattr(course_service.agent_module, "answer", _fenced_answer)
    resp = client.post("/api/courses", json=VALID_SQL_PAYLOAD)
    assert resp.status_code == 201
    created = resp.json()
    assert set(created.keys()) == {
        "id",
        "title",
        "learner_group",
        "minutes_per_day",
        "mode",
        "source_mode",
        "plan",
        "lesson",
        "sources",
    }
    assert "rank" not in created["sources"][0]
    assert "internal_tag" not in created["lesson"]


def test_dao05_clarification_and_invalid_citations_do_not_save(
    client: TestClient,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    def _clarify(_text: str, *, minutes_per_day: int) -> dict:
        return {
            "output": json.dumps(
                {
                    "status": "clarification_required",
                    "message": "Bạn muốn dùng SQL để giải bài toán cụ thể nào?",
                },
                ensure_ascii=False,
            )
        }

    monkeypatch.setattr(course_service.agent_module, "answer", _clarify)
    r_clarify = client.post("/api/courses", json=VALID_SQL_PAYLOAD)
    assert r_clarify.status_code == 422
    assert r_clarify.json() == {
        "error": {
            "code": "CLARIFICATION_REQUIRED",
            "message": "Bạn muốn dùng SQL để giải bài toán cụ thể nào?",
            "field": "goal",
        }
    }

    def _broken_citation(_text: str, *, minutes_per_day: int) -> dict:
        payload = {
            "status": "ok",
            "mode": "model",
            "source_mode": "web",
            "plan": [
                {"day": d, "title": f"Ngày {d}", "objective": f"Mục tiêu {d}"}
                for d in range(1, 6)
            ],
            "lesson": {
                "day": 1,
                "title": "Ngày 1",
                "minutes": 15,
                "sections": [{"text": "Nội dung", "source_ids": ["S999"]}],
                "example": "SELECT 1;",
                "exercise": "Thử lại.",
            },
            "sources": [
                {
                    "id": "S1",
                    "title": "Docs",
                    "url": "https://example.com/docs",
                    "excerpt": "Excerpt.",
                }
            ],
        }
        return {"output": json.dumps(payload, ensure_ascii=False)}

    monkeypatch.setattr(course_service.agent_module, "answer", _broken_citation)
    r_bad_cite = client.post("/api/courses", json=VALID_SQL_PAYLOAD)
    assert r_bad_cite.status_code == 422
    assert r_bad_cite.json()["error"]["code"] == "INSUFFICIENT_SOURCES"
    assert client.get("/api/courses").json() == []


def test_dao05_invalid_json_from_agent_maps_to_503(
    client: TestClient,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setattr(
        course_service.agent_module,
        "answer",
        lambda _text, *, minutes_per_day: {"output": "not valid json"},
    )
    resp = client.post("/api/courses", json=VALID_SQL_PAYLOAD)
    assert resp.status_code == 503
    assert resp.json()["error"]["code"] == "UPSTREAM_UNAVAILABLE"
    assert client.get("/api/courses").json() == []


def test_dao06_health_docs_landing_and_static_ui_mount(tmp_path: Path) -> None:
    app_no_ui = create_app(db_path=tmp_path / "no_ui.db", ui_dir=tmp_path / "missing")
    c_no_ui = TestClient(app_no_ui)

    assert c_no_ui.get("/health").status_code == 200
    assert c_no_ui.get("/health").json() == {"status": "ok"}
    assert c_no_ui.get("/docs").status_code == 200
    assert c_no_ui.get("/openapi.json").status_code == 200
    landing = c_no_ui.get("/")
    assert landing.status_code == 200
    assert "text/html" in landing.headers["content-type"]
    assert "/docs" in landing.text

    ui_dir = tmp_path / "out"
    ui_dir.mkdir()
    (ui_dir / "index.html").write_text("<html><body>Demo UI Ready</body></html>", encoding="utf-8")
    app_with_ui = create_app(db_path=tmp_path / "with_ui.db", ui_dir=ui_dir)
    c_ui = TestClient(app_with_ui)
    root_resp = c_ui.get("/")
    assert root_resp.status_code == 200
    assert "Demo UI Ready" in root_resp.text
    assert c_ui.get("/api/courses").status_code == 200


def test_dao08_cost_personas_yaml_valid_with_zero_warnings() -> None:
    cost_dir = ROOT / "cost"
    if str(cost_dir) not in sys.path:
        sys.path.insert(0, str(cost_dir))
    import simulate  # noqa: E402
    import run_eval as ev  # noqa: E402

    cfg, warnings = simulate.load_config()
    assert warnings == [], f"Unexpected warnings in cost/personas.yaml: {warnings}"
    assert cfg["sessions"] >= 50
    assert len(cfg["personas"]) >= 3
    assert abs(cfg["total_share"] - 1.0) < 1e-6
    assert len(cfg["prices"]) >= 2
    assert cfg["fx_rate"] is not None and cfg["fx_rate"] > 0

    bench = ev.load_items()
    plan = simulate.plan_sessions(cfg, bench, 10)
    assert len(plan) == 10

    # Verify summarize() renders 8-column table with VND conversion in memory (no CSV written)
    synthetic_rows = [
        {
            "persona": "dung_it",
            "turns": 1,
            "model": "gemini-2.5-flash",
            "model_calls": 1,
            "tool_calls": 1,
            "tokens_in": 1200,
            "tokens_out": 600,
            "error": "",
            "by_model": {"gemini-2.5-flash": {"in": 1200, "out": 600}},
        },
        {
            "persona": "dung_vua",
            "turns": 2,
            "model": "gemini-2.5-flash",
            "model_calls": 2,
            "tool_calls": 2,
            "tokens_in": 2400,
            "tokens_out": 1200,
            "error": "",
            "by_model": {"gemini-2.5-flash": {"in": 2400, "out": 1200}},
        },
        {
            "persona": "dung_nhieu",
            "turns": 3,
            "model": "gemini-2.5-flash",
            "model_calls": 3,
            "tool_calls": 3,
            "tokens_in": 3600,
            "tokens_out": 1800,
            "error": "",
            "by_model": {"gemini-2.5-flash": {"in": 3600, "out": 1800}},
        },
    ]
    graded = {
        "name": "run-2.csv",
        "run_id": "run-2@synthetic",
        "passed": 20,
        "total": 24,
        "models": ["gemini-2.5-flash"],
        "why": "synthetic unit test",
    }
    summary_md = "\n".join(simulate.summarize(cfg, synthetic_rows, graded))
    assert "Chi phí / câu hỏi đạt" in summary_md
    assert "gemini-2.5-flash-lite" in summary_md
    assert "gemini-2.5-flash" in summary_md
    assert "gemini-2.5-pro" in summary_md
    assert "₫" in summary_md


def test_openapi_contract_examples_match_pydantic_schemas() -> None:
    spec = json.loads((ROOT / "docs" / "openapi.json").read_text(encoding="utf-8"))
    post_op = spec["paths"]["/api/courses"]["post"]
    get_list = spec["paths"]["/api/courses"]["get"]
    get_one = spec["paths"]["/api/courses/{id}"]["get"]

    for ex in post_op["requestBody"]["content"]["application/json"]["examples"].values():
        CreateCourse.model_validate(ex["value"])

    for ex in post_op["responses"]["201"]["content"]["application/json"]["examples"].values():
        Course.model_validate(ex["value"])

    for status_code in ("422", "503"):
        for ex in post_op["responses"][status_code]["content"]["application/json"]["examples"].values():
            ErrorEnvelope.model_validate(ex["value"])

    for ex in get_list["responses"]["200"]["content"]["application/json"]["examples"].values():
        for item in ex["value"]:
            CourseSummary.model_validate(item)

    for ex in get_one["responses"]["200"]["content"]["application/json"]["examples"].values():
        Course.model_validate(ex["value"])

    for ex in get_one["responses"]["404"]["content"]["application/json"]["examples"].values():
        ErrorEnvelope.model_validate(ex["value"])


def test_dao01_fixture_override_with_env_default(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setenv("COURSE_USE_FIXTURE", "1")
    application = create_app(db_path=tmp_path / "env_fixture.db")
    c = TestClient(application)

    # Default uses fixture from env
    r_default = c.post("/api/courses", json=VALID_SQL_PAYLOAD)
    assert r_default.status_code == 201
    assert r_default.json()["id"].startswith("course-demo-sql")

    # Explicit ?fixture=0 forces agent workflow instead of fixture
    r_override = c.post(
        "/api/courses?fixture=0",
        json={
            "learner_group": "university",
            "topic": "Mỹ thuật",
            "goal": "Học vẽ sơn dầu cơ bản",
            "level": "Mới bắt đầu",
            "minutes_per_day": 30,
        },
    )
    assert r_override.status_code == 422
    assert r_override.json()["error"]["code"] == "OUT_OF_SCOPE"


def test_dao03_soft_delete_exclusion_and_upsert_recency(tmp_path: Path) -> None:
    db_file = tmp_path / "soft_delete.db"
    application = create_app(db_path=db_file)
    c = TestClient(application)

    r_fix = c.post("/api/courses?fixture=1", json=VALID_SQL_PAYLOAD)
    assert r_fix.status_code == 201
    fix_id = r_fix.json()["id"]
    assert fix_id.startswith("course-demo-sql")
    r_git = c.post(
        "/api/courses",
        json={
            "learner_group": "university",
            "topic": "Git",
            "goal": "Quản lý code nhóm",
            "level": "Mới bắt đầu",
            "minutes_per_day": 15,
        },
    )
    assert r_git.status_code == 201
    git_id = r_git.json()["id"]

    # Upserting the same ID again should move that course back to newest first.
    # The API now issues a new fixture ID per POST, so re-save through the repository.
    repository = application.state.course_service.repository
    fixture_course = Course.model_validate(r_fix.json())
    time.sleep(0.01)
    repository.save_course(fixture_course)
    ids = [item["id"] for item in c.get("/api/courses").json()]
    assert ids == [fix_id, git_id]

    # Soft-deleting a row excludes it from list and detail
    with sqlite3.connect(str(db_file)) as conn:
        conn.execute(
            "UPDATE courses SET is_deleted = 1, deleted_at = '2026-11-27T00:00:00Z' WHERE id = ?",
            (fix_id,),
        )
    assert [item["id"] for item in c.get("/api/courses").json()] == [git_id]
    assert c.get(f"/api/courses/{fix_id}").status_code == 404

    # Re-saving restores soft-deleted course cleanly
    repository.save_course(fixture_course)
    assert c.get(f"/api/courses/{fix_id}").status_code == 200


def test_dao04_dao05_path_validation_unknown_api_and_no_traceback_leak(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    application = create_app(db_path=tmp_path / "errors.db")
    c = TestClient(application, raise_server_exceptions=False)

    # Path param > 100 chars returns clean 422 message (not "5 trường")
    r_long_id = c.get(f"/api/courses/{'a' * 101}")
    assert r_long_id.status_code == 422
    body = r_long_id.json()
    assert body["error"]["code"] == "INVALID_INPUT"
    assert "ID khóa học" in body["error"]["message"]
    assert "field" not in body["error"]

    # Unknown /api/* path returns OpenAPI ErrorEnvelope NOT_FOUND
    r_unknown = c.get("/api/does-not-exist")
    assert r_unknown.status_code == 404
    assert r_unknown.json()["error"]["code"] == "NOT_FOUND"

    # Malformed JSON body returns 422 INVALID_INPUT
    r_bad_json = c.post(
        "/api/courses",
        content="{not valid json",
        headers={"Content-Type": "application/json"},
    )
    assert r_bad_json.status_code == 422
    assert r_bad_json.json()["error"]["code"] == "INVALID_INPUT"

    # Unexpected internal error returns 503 UPSTREAM_UNAVAILABLE with CORS header and zero stack trace
    def _boom() -> list:
        raise RuntimeError("secret internal failure detail")

    monkeypatch.setattr(application.state.course_service, "list_courses", _boom)
    r_unhandled = c.get("/api/courses", headers={"Origin": "http://localhost:3000"})
    assert r_unhandled.status_code == 503
    assert r_unhandled.headers.get("access-control-allow-origin") == "*"
    assert r_unhandled.json() == {
        "error": {
            "code": "UPSTREAM_UNAVAILABLE",
            "message": "Chưa tạo được lộ trình. Bạn có thể thử lại.",
        }
    }
    assert "secret internal failure" not in r_unhandled.text


def test_dao02_resilient_json_parsing_dedupe_urls_and_concurrency(
    client: TestClient,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    # Prose around fenced JSON + duplicate source_ids should succeed (201)
    def _prose_fenced_answer(_text: str, *, minutes_per_day: int) -> dict:
        payload = {
            "status": "ok",
            "mode": "model",
            "source_mode": "web",
            "plan": [
                {"day": d, "title": f"Ngày {d}", "objective": f"Mục tiêu {d}"}
                for d in range(1, 6)
            ],
            "lesson": {
                "day": 1,
                "title": "Ngày 1",
                "minutes": 15,
                "sections": [{"text": "Giải thích SQL", "source_ids": ["S1", " S1 "]}],
                "example": "SELECT 1;",
                "exercise": "Thử lại.",
            },
            "sources": [
                {
                    "id": "S1",
                    "title": "PostgreSQL Docs",
                    "url": "https://www.postgresql.org/docs/current/tutorial-select.html",
                    "excerpt": "SELECT retrieves rows.",
                }
            ],
        }
        return {
            "output": "Đây là lộ trình đề xuất:\n```json\n"
            + json.dumps(payload, ensure_ascii=False)
            + "\n```\nChúc bạn học tốt!"
        }

    monkeypatch.setattr(course_service.agent_module, "answer", _prose_fenced_answer)
    r_ok = client.post("/api/courses", json=VALID_SQL_PAYLOAD)
    assert r_ok.status_code == 201
    assert r_ok.json()["lesson"]["sections"][0]["source_ids"] == ["S1"]

    # Concurrent calls must all succeed safely under _TRACE_LOCK + SQLite WAL
    with ThreadPoolExecutor(max_workers=4) as pool:
        futures = [
            pool.submit(client.post, "/api/courses", json=VALID_SQL_PAYLOAD)
            for _ in range(4)
        ]
        responses = [f.result() for f in futures]
    assert all(r.status_code == 201 for r in responses)
    assert len({r.json()["id"] for r in responses}) == 4

    # Invalid URL without host must be rejected as 422 INSUFFICIENT_SOURCES
    def _bad_url_answer(_text: str, *, minutes_per_day: int) -> dict:
        payload = {
            "status": "ok",
            "mode": "model",
            "source_mode": "web",
            "plan": [
                {"day": d, "title": f"Ngày {d}", "objective": f"Mục tiêu {d}"}
                for d in range(1, 6)
            ],
            "lesson": {
                "day": 1,
                "title": "Ngày 1",
                "minutes": 15,
                "sections": [{"text": "Giải thích", "source_ids": ["S1"]}],
                "example": "SELECT 1;",
                "exercise": "Thử lại.",
            },
            "sources": [
                {
                    "id": "S1",
                    "title": "Broken",
                    "url": "https://",
                    "excerpt": "No host.",
                }
            ],
        }
        return {"output": json.dumps(payload, ensure_ascii=False)}

    monkeypatch.setattr(course_service.agent_module, "answer", _bad_url_answer)
    r_bad_url = client.post("/api/courses", json=VALID_SQL_PAYLOAD)
    assert r_bad_url.status_code == 422
    assert r_bad_url.json()["error"]["code"] == "INSUFFICIENT_SOURCES"

    # Stop status honoring optional valid field from workflow
    monkeypatch.setattr(
        course_service.agent_module,
        "answer",
        lambda _text, *, minutes_per_day: {
            "output": json.dumps(
                {
                    "status": "clarification_required",
                    "message": "Chọn chủ đề cụ thể hơn.",
                    "field": "topic",
                },
                ensure_ascii=False,
            )
        },
    )
    r_field = client.post("/api/courses", json=VALID_SQL_PAYLOAD)
    assert r_field.status_code == 422
    assert r_field.json()["error"]["field"] == "topic"


def test_dao06_spa_clean_urls_reload_and_security(tmp_path: Path) -> None:
    ui_dir = tmp_path / "out"
    (ui_dir / "assets").mkdir(parents=True)
    (ui_dir / "index.html").write_text("<html>SPA Index</html>", encoding="utf-8")
    (ui_dir / "courses.html").write_text("<html>Courses List</html>", encoding="utf-8")
    (ui_dir / "assets" / "app.js").write_text("console.log('ok');", encoding="utf-8")

    application = create_app(db_path=tmp_path / "spa.db", ui_dir=ui_dir)
    c = TestClient(application)

    assert c.get("/").status_code == 200
    assert c.head("/").status_code == 200
    assert "SPA Index" in c.get("/").text

    # Clean URL resolves courses.html
    r_list_page = c.get("/courses")
    assert r_list_page.status_code == 200
    assert "Courses List" in r_list_page.text

    # Dynamic route reload (/courses/<id>) falls back to index.html for client hydration
    r_detail_reload = c.get("/courses/course-demo-sql")
    assert r_detail_reload.status_code == 200
    assert "SPA Index" in r_detail_reload.text

    # Existing static asset served cleanly; missing asset returns 404 (not index.html)
    assert c.get("/assets/app.js").status_code == 200
    assert c.get("/assets/missing.js").status_code == 404

    # Unknown /api/* returns JSON ErrorEnvelope 404 (never index.html)
    r_api_404 = c.get("/api/nonexistent")
    assert r_api_404.status_code == 404
    assert r_api_404.json()["error"]["code"] == "NOT_FOUND"

    # Path traversal outside ui_dir is blocked
    r_traversal = c.get("/..%2F..%2FREADME.md")
    assert r_traversal.status_code == 404


def test_dao06_cli_and_live_server_smoke(tmp_path: Path) -> None:
    # 1. Verify stdlib-only --cli mode via subprocess
    cli_proc = subprocess.run(
        [sys.executable, str(ROOT / "codebase" / "app.py"), "--cli"],
        input="Tôi mới học SQL, có 20 phút mỗi ngày.\n\n\n",
        text=True,
        encoding="utf-8",
        capture_output=True,
        cwd=str(ROOT),
        timeout=15,
        check=False,
    )
    assert cli_proc.returncode == 0, cli_proc.stderr
    assert '"status": "ok"' in cli_proc.stdout
    assert "model: fake" in cli_proc.stdout

    # 2. Verify `python run.py` starts real Uvicorn HTTP server and serves all endpoints
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
        sock.bind(("127.0.0.1", 0))
        port = sock.getsockname()[1]

    env = dict(os.environ)
    env["HOST"] = "127.0.0.1"
    env["PORT"] = str(port)
    env["COURSE_DB_PATH"] = str(tmp_path / "live_smoke.db")

    proc = subprocess.Popen(
        [sys.executable, str(ROOT / "run.py")],
        cwd=str(ROOT),
        env=env,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
        encoding="utf-8",
        errors="replace",
    )
    base_url = f"http://127.0.0.1:{port}"
    try:
        ready = False
        for _ in range(40):
            if proc.poll() is not None:
                break
            try:
                with urllib.request.urlopen(f"{base_url}/health", timeout=1) as resp:
                    if resp.status == 200:
                        ready = True
                        break
            except Exception:
                time.sleep(0.15)
        assert ready, f"Server failed to start: stdout={proc.stdout.read() if proc.stdout else ''} stderr={proc.stderr.read() if proc.stderr else ''}"

        with urllib.request.urlopen(f"{base_url}/", timeout=3) as resp:
            assert resp.status == 200

        req = urllib.request.Request(
            f"{base_url}/api/courses?fixture=1",
            data=json.dumps(VALID_SQL_PAYLOAD).encode("utf-8"),
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        with urllib.request.urlopen(req, timeout=3) as resp:
            assert resp.status == 201
            created = json.loads(resp.read().decode("utf-8"))
            assert created["id"].startswith("course-demo-sql")

        with urllib.request.urlopen(f"{base_url}/api/courses/{created['id']}", timeout=3) as resp:
            assert resp.status == 200
            fetched = json.loads(resp.read().decode("utf-8"))
            assert fetched == created
    finally:
        proc.send_signal(signal.SIGTERM)
        try:
            proc.wait(timeout=5)
        except subprocess.TimeoutExpired:
            proc.kill()
            proc.wait(timeout=5)


