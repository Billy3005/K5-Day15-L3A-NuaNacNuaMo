"""Comprehensive tests for DAO-01..DAO-06 backend endpoints, validation, and SQLite storage."""

import json
from pathlib import Path
import sys

from fastapi.testclient import TestClient
import pytest

ROOT = Path(__file__).resolve().parents[1]
CODEBASE = ROOT / "codebase"
if str(CODEBASE) not in sys.path:
    sys.path.insert(0, str(CODEBASE))

from app import create_app  # noqa: E402
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
    assert data["id"] == "course-demo-sql"
    assert resp.headers["location"] == "/api/courses/course-demo-sql"
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
    def _broken_answer(_text: str) -> dict:
        raise NotImplementedError("model not configured")

    monkeypatch.setattr(course_service.agent_module, "answer", _broken_answer)
    resp = client.post("/api/courses", json=VALID_SQL_PAYLOAD)
    assert resp.status_code == 503
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
    def _real_like_answer(_text: str) -> dict:
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


def test_dao02_real_workflow_fenced_json_and_extra_metadata(
    client: TestClient,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    def _fenced_answer(_text: str) -> dict:
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
    def _clarify(_text: str) -> dict:
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

    def _broken_citation(_text: str) -> dict:
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
        lambda _text: {"output": "not valid json"},
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


