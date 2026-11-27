"""Thử nhanh AN-01 (tìm kiếm web thật), AN-04 (model thật đọc token từ usage) và AN-02 (ghép workflow).

    python codebase/smoke_an.py model              # gọi model 1 câu, in model và token
    python codebase/smoke_an.py search [truy vấn]  # tìm web thật, in tiêu đề, URL, đoạn trích
    python codebase/smoke_an.py                    # chạy model + search
    python codebase/smoke_an.py workflow           # AN-02: 2 form qua backend thật (1 ca ra bài, 1 ca thiếu nguồn)

Cần .env: MODEL_PROVIDER/MODEL_NAME/API_KEY cho model; SEARCH_PROVIDER=anthropic và SEARCH_API_KEY cho tìm kiếm.
workflow cần thêm thư viện backend (python -m pip install -r requirements.txt) và lưu vào SQLite tạm, tự xoá.
Không ghi file kết quả; chỉ in ra màn hình để dán bằng chứng vào ghi chú task.
"""
import json
import sys
import tempfile
import time
from pathlib import Path

for _stream in (sys.stdout, sys.stderr):
    try:
        _stream.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

import ai
import tools
import tracing

DEFAULT_QUERY = "Sinh viên mới học SQL để làm báo cáo, 20 phút mỗi ngày, cần bài nhập môn về SELECT và WHERE"


def check_model() -> bool:
    print("== AN-04 · model: provider=%s, model=%s" % (ai.MODEL_PROVIDER, ai.MODEL_NAME or "-"))
    if ai.MODEL_PROVIDER == "fake":
        print("  MODEL_PROVIDER chưa điền trong .env → đang ở chế độ giả.")
        return False
    tracing.begin("smoke-model")
    try:
        reply = ai.call_model("Trả lời ngắn bằng tiếng Việt.", "Câu lệnh SQL nào dùng để lọc dòng? Trả lời một câu.")
    except Exception as e:
        print("  LỖI:", e)
        return False
    finally:
        summary, _ = tracing.end()
    print("  trả lời:", reply["text"].strip()[:200])
    print("  token vào %d / ra %d (từ usage) · trace: %s" % (reply["tokens_in"], reply["tokens_out"],
                                                         json.dumps(summary, ensure_ascii=False)))
    return reply["tokens_in"] > 0 and reply["tokens_out"] > 0


def check_search(query: str) -> bool:
    print("== AN-01 · tìm kiếm: provider=%s, model=%s" % (tools.SEARCH_PROVIDER, ai.SEARCH_MODEL))
    if tools.SEARCH_PROVIDER != "anthropic":
        print("  Đặt SEARCH_PROVIDER=anthropic trong .env để tìm web thật.")
        return False
    print("  truy vấn:", query)
    tracing.begin("smoke-search")
    try:
        found = tools.search_web(query)
    except Exception as e:
        print("  LỖI:", e)
        return False
    finally:
        summary, events = tracing.end()
    for item in found:
        print("  [%s] %s\n       %s\n       \"%s\"" % (item["id"], item["title"], item["url"], item["excerpt"]))
    notes = [e["text"] for e in events if e["kind"] == "note"]
    print("  %d nguồn · %s · token vào %d / ra %d · model %s" % (
        len(found), "; ".join(notes), summary["tokens_in"], summary["tokens_out"], ", ".join(summary["models"])))
    return any(item["title"] and item["url"].startswith("http") and item["excerpt"] for item in found)


# Hai form demo cho AN-02 (không lấy từ bộ câu thử): một ca thường và một ca dựa vào tài liệu không công khai.
WORKFLOW_FORMS = [
    ("ra bài", None, {"learner_group": "university", "topic": "SQL",
                      "goal": "Phân tích doanh thu cho bài tập nhóm",
                      "level": "Biết Excel, mới học SQL", "minutes_per_day": 20}),
    ("thiếu nguồn", "INSUFFICIENT_SOURCES", {
        "learner_group": "university", "topic": "Kỹ năng ghi nhớ",
        "goal": "Học đúng các bước của phương pháp Lam-7 trong giáo trình nội bộ chưa phát hành của trung tâm; "
                "mình không có tài liệu đó",
        "level": "Đã biết lặp lại ngắt quãng cơ bản", "minutes_per_day": 15}),
]


def check_workflow() -> bool:
    """AN-02: form → backend (CourseService) → answer() với tìm kiếm + model thật → kiểm pydantic → SQLite."""
    print("== AN-02 · workflow: model=%s, search=%s/%s" % (ai.MODEL_NAME or ai.MODEL_PROVIDER,
                                                           tools.SEARCH_PROVIDER, ai.SEARCH_MODEL))
    if ai.MODEL_PROVIDER == "fake" or tools.SEARCH_PROVIDER != "anthropic":
        print("  Cần model thật và SEARCH_PROVIDER=anthropic trong .env.")
        return False
    try:
        from core.config import get_settings
        from core.database import Database
        from repositories.course_repository import CourseRepository
        from schemas.course import CreateCourse
        from services.course_service import CourseService, CourseServiceError
    except ImportError as e:
        print("  Thiếu thư viện backend (%s): python -m pip install -r requirements.txt" % e)
        return False
    ok = True
    with tempfile.TemporaryDirectory() as tmp:
        db = Database(Path(tmp) / "courses.db")
        db.init_schema()
        service = CourseService(CourseRepository(db), get_settings(db_path=db.db_path))
        for name, expected_error, form in WORKFLOW_FORMS:
            print("  -- ca %s: %s / %s (%d phút/ngày)" % (name, form["topic"], form["goal"][:60], form["minutes_per_day"]))
            t0 = time.perf_counter()
            try:
                course = service.create_course(CreateCourse(**form), use_fixture=False)
            except CourseServiceError as e:
                err = e.envelope.error
                print("     %.0fs · HTTP %d %s: %s" % (time.perf_counter() - t0, e.status_code, err.code, err.message[:220]))
                ok &= err.code == expected_error
                continue
            reopened = service.get_course(course.id)
            print("     %.0fs · 201 lưu khóa %s · %s · bài %d phút" % (
                time.perf_counter() - t0, course.id, course.title, course.lesson.minutes))
            print("     plan: " + " → ".join(day.title for day in course.plan))
            for section in course.lesson.sections:
                print("     [%s] %s" % (",".join(section.source_ids), section.text[:110]))
            for src in course.sources:
                print("     %s %s" % (src.id, src.url))
            ok &= expected_error is None and reopened.model_dump() == course.model_dump() \
                and course.lesson.minutes <= form["minutes_per_day"]
        print("  khóa đã lưu: %d (chỉ ca ra bài được lưu)" % len(service.list_courses()))
        ok &= len(service.list_courses()) == sum(1 for _, err, _ in WORKFLOW_FORMS if err is None)
    return ok


if __name__ == "__main__":
    what = sys.argv[1] if len(sys.argv) > 1 else "all"
    if what not in ("all", "model", "search", "workflow") or (what != "search" and len(sys.argv) > 2):
        print("Tham số không hợp lệ: %s\n%s" % (" ".join(sys.argv[1:]), __doc__.strip()), file=sys.stderr)
        sys.exit(2)
    ok = True
    if what == "workflow":
        ok &= check_workflow()
    if what in ("all", "model"):
        ok &= check_model()
    if what in ("all", "search"):
        ok &= check_search(" ".join(sys.argv[2:]) or DEFAULT_QUERY)
    print("== KẾT QUẢ:", "ĐẠT" if ok else "CHƯA ĐẠT")
    sys.exit(0 if ok else 1)
