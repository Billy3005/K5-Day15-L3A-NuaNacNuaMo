"""Service layer connecting HTTP requests, agent workflow, and SQLite storage."""

import json
import re
import threading
import unicodedata
import uuid
from typing import Any, Optional
from urllib.parse import urlparse

import agent as agent_module
import tracing
from core.config import Settings
from repositories.course_repository import CourseRepository
from schemas.course import (
    Course,
    CourseSummary,
    CreateCourse,
    ErrorCode,
    ErrorDetail,
    ErrorEnvelope,
    ErrorField,
)

LEARNER_GROUP_LABELS = {
    "middle_school": "học sinh THCS",
    "high_school": "học sinh THPT",
    "university": "sinh viên",
    "working_adult": "người đi làm",
}

STOP_STATUS_MAP: dict[str, tuple[ErrorCode, Optional[ErrorField], str]] = {
    "clarification_required": (
        "CLARIFICATION_REQUIRED",
        "goal",
        "Bạn muốn dùng kỹ năng này để làm việc nào?",
    ),
    "insufficient_sources": (
        "INSUFFICIENT_SOURCES",
        "goal",
        "Chưa đủ nguồn cho mục tiêu này. Hãy thử thu hẹp mục tiêu.",
    ),
    "out_of_scope": (
        "OUT_OF_SCOPE",
        "topic",
        "Chủ đề này ngoài phạm vi. Hãy chọn một kỹ năng trong danh sách.",
    ),
    "refused": (
        "REFUSED",
        None,
        "Chỉ dùng nguồn công khai có thể đối chiếu.",
    ),
}


class CourseServiceError(Exception):
    """Domain/HTTP error mapped directly to OpenAPI ErrorEnvelope."""

    def __init__(
        self,
        status_code: int,
        code: ErrorCode,
        message: str,
        field: Optional[ErrorField] = None,
    ) -> None:
        super().__init__(message)
        self.status_code = status_code
        self.envelope = ErrorEnvelope(
            error=ErrorDetail(code=code, message=message, field=field)
        )


def format_course_request(payload: CreateCourse) -> str:
    """Convert structured 5-field form input into Vietnamese text for agent.answer(text)."""
    group_label = LEARNER_GROUP_LABELS[payload.learner_group]
    return (
        f"Tôi là {group_label}. "
        f"Chủ đề muốn học: {payload.topic}. "
        f"Mục tiêu: {payload.goal}. "
        f"Trình độ hiện tại: {payload.level}. "
        f"Thời gian học: {payload.minutes_per_day} phút mỗi ngày."
    )


def _slugify(text: str) -> str:
    normalized = unicodedata.normalize("NFKD", text)
    ascii_text = normalized.encode("ascii", "ignore").decode("ascii").lower()
    slug = re.sub(r"[^a-z0-9]+", "-", ascii_text).strip("-")
    return slug[:32] or "course"


def _build_course_id(topic: str) -> str:
    return f"course-{_slugify(topic)}-{uuid.uuid4().hex[:8]}"


def _build_course_title(payload: CreateCourse, raw_result: dict) -> str:
    explicit = str(raw_result.get("title") or "").strip()
    if explicit:
        return explicit
    return f"{payload.topic} — {payload.goal}"[:120]


def _fixture_course(payload: CreateCourse) -> Course:
    """Return an OpenAPI-compliant mock course (fixed content, unique ID) for fixture mode."""
    return Course(
        id=f"course-demo-sql-{uuid.uuid4().hex[:8]}",
        title="SQL để phân tích doanh thu",
        learner_group=payload.learner_group,
        minutes_per_day=payload.minutes_per_day,
        mode="mock",
        source_mode="mock",
        plan=[
            {
                "day": 1,
                "title": "Đọc và lọc một bảng",
                "objective": "Chọn cột và lọc đơn hàng theo số tiền.",
            },
            {
                "day": 2,
                "title": "Sắp xếp dữ liệu",
                "objective": "Đọc doanh thu từ cao xuống thấp.",
            },
            {
                "day": 3,
                "title": "Tính tổng",
                "objective": "Nhóm đơn theo danh mục và tính tổng.",
            },
            {
                "day": 4,
                "title": "Nối hai bảng",
                "objective": "Nối đơn hàng với danh mục qua ID.",
            },
            {
                "day": 5,
                "title": "Hoàn thiện báo cáo",
                "objective": "Viết truy vấn trả doanh thu theo danh mục.",
            },
        ],
        lesson={
            "day": 1,
            "title": "Đọc và lọc một bảng",
            "minutes": min(payload.minutes_per_day, 20),
            "sections": [
                {
                    "text": "SELECT lấy dữ liệu từ bảng. WHERE chọn những dòng thỏa điều kiện.",
                    "source_ids": ["S1"],
                }
            ],
            "example": "SELECT amount FROM orders WHERE amount > 500000;",
            "exercise": "Đổi ngưỡng lọc xuống 200000 và dự đoán các dòng còn lại.",
        },
        sources=[
            {
                "id": "S1",
                "title": "PostgreSQL Tutorial — Querying a Table",
                "url": "https://www.postgresql.org/docs/current/tutorial-select.html",
                "excerpt": "SELECT lấy dữ liệu từ bảng. WHERE giữ những dòng thỏa điều kiện.",
            }
        ],
    )


_TRACE_LOCK = threading.Lock()
_FENCE_SEARCH_RE = re.compile(r"```(?:json)?\s*\n(.*?)\n```", re.DOTALL | re.IGNORECASE)
_VALID_ERROR_FIELDS: set[str] = {
    "learner_group",
    "topic",
    "goal",
    "level",
    "minutes_per_day",
}


def _parse_agent_output(raw_reply: Any) -> dict[str, Any]:
    """Parse agent.answer(text) response into a JSON object, tolerating markdown fences."""
    raw_output = raw_reply["output"] if isinstance(raw_reply, dict) and "output" in raw_reply else raw_reply
    if isinstance(raw_output, dict):
        return raw_output
    text = str(raw_output).strip()
    if not text:
        raise ValueError("Agent output is empty.")

    candidates: list[str] = [text]
    fenced = _FENCE_SEARCH_RE.search(text)
    if fenced:
        candidates.insert(0, fenced.group(1).strip())

    for candidate in candidates:
        try:
            parsed = json.loads(candidate)
            if isinstance(parsed, dict):
                return parsed
        except json.JSONDecodeError:
            pass

    decoder = json.JSONDecoder()
    start = text.find("{")
    if start != -1:
        parsed, _ = decoder.raw_decode(text, start)
        if isinstance(parsed, dict):
            return parsed

    raise ValueError("Agent output JSON must be an object.")


def _dedupe_source_ids(raw_ids: Any) -> Any:
    """Normalize and deduplicate section source_ids while preserving order."""
    if not isinstance(raw_ids, list):
        return raw_ids
    cleaned: list[str] = []
    seen: set[str] = set()
    for item in raw_ids:
        if not isinstance(item, str):
            return raw_ids
        value = item.strip()
        if not value:
            continue
        if value not in seen:
            seen.add(value)
            cleaned.append(value)
    return cleaned


def _fallback_source_title(raw_title: Any, raw_url: Any) -> Any:
    """Fallback empty web-search source title to its URL host so valid sources are preserved."""
    if isinstance(raw_title, str) and raw_title.strip():
        return raw_title
    if raw_title is not None and not isinstance(raw_title, str):
        return raw_title
    if isinstance(raw_url, str):
        parsed = urlparse(raw_url.strip())
        if parsed.scheme in {"http", "https"} and parsed.netloc:
            return parsed.netloc
    return raw_title


def _normalize_course_fields(payload: CreateCourse, parsed: dict[str, Any]) -> dict[str, Any]:
    """Project parsed agent JSON onto strict OpenAPI Course fields."""
    raw_plan = parsed.get("plan")
    plan = [
        {
            "day": item.get("day"),
            "title": item.get("title"),
            "objective": item.get("objective"),
        }
        for item in raw_plan
        if isinstance(item, dict)
    ] if isinstance(raw_plan, list) else []

    raw_lesson = parsed.get("lesson") if isinstance(parsed.get("lesson"), dict) else {}
    raw_sections = raw_lesson.get("sections")
    sections = [
        {
            "text": sec.get("text"),
            "source_ids": _dedupe_source_ids(sec.get("source_ids")),
        }
        for sec in raw_sections
        if isinstance(sec, dict)
    ] if isinstance(raw_sections, list) else []

    minutes = raw_lesson.get("minutes")
    if isinstance(minutes, int) and not isinstance(minutes, bool) and minutes >= 1:
        minutes = min(minutes, payload.minutes_per_day)

    lesson = {
        "day": raw_lesson.get("day"),
        "title": raw_lesson.get("title"),
        "minutes": minutes,
        "sections": sections,
        "example": raw_lesson.get("example"),
        "exercise": raw_lesson.get("exercise"),
    }

    raw_sources = parsed.get("sources")
    sources = [
        {
            "id": src.get("id"),
            "title": _fallback_source_title(src.get("title"), src.get("url")),
            "url": src.get("url"),
            "excerpt": src.get("excerpt"),
        }
        for src in raw_sources
        if isinstance(src, dict)
    ] if isinstance(raw_sources, list) else []

    return {
        "id": _build_course_id(payload.topic),
        "title": _build_course_title(payload, parsed),
        "learner_group": payload.learner_group,
        "minutes_per_day": payload.minutes_per_day,
        "mode": parsed.get("mode", "mock"),
        "source_mode": parsed.get("source_mode", "mock"),
        "plan": plan,
        "lesson": lesson,
        "sources": sources,
    }


class CourseService:
    """Orchestrates course creation, validation, AI workflow execution, and storage."""

    def __init__(self, repository: CourseRepository, settings: Settings) -> None:
        self.repository = repository
        self.settings = settings

    def create_course(
        self,
        payload: CreateCourse,
        *,
        use_fixture: Optional[bool] = None,
    ) -> Course:
        """Create and persist a 5-day course + Day 1 lesson."""
        resolved_fixture = (
            self.settings.use_fixture_default if use_fixture is None else use_fixture
        )
        if resolved_fixture:
            course = _fixture_course(payload)
            return self.repository.save_course(course)

        request_text = format_course_request(payload)
        with _TRACE_LOCK:
            tracing.begin("web")
            try:
                raw_reply = agent_module.answer(request_text, minutes_per_day=payload.minutes_per_day)
            except Exception as exc:
                raise CourseServiceError(
                    status_code=503,
                    code="UPSTREAM_UNAVAILABLE",
                    message="Chưa tạo được lộ trình. Bạn có thể thử lại.",
                ) from exc
            finally:
                tracing.end()

        try:
            parsed = _parse_agent_output(raw_reply)
        except Exception as exc:
            raise CourseServiceError(
                status_code=503,
                code="UPSTREAM_UNAVAILABLE",
                message="Chưa tạo được lộ trình. Bạn có thể thử lại.",
            ) from exc

        status = parsed.get("status")
        if status in STOP_STATUS_MAP:
            code, default_field, default_msg = STOP_STATUS_MAP[status]
            raw_field = parsed.get("field")
            field: Optional[ErrorField] = (
                raw_field
                if isinstance(raw_field, str) and raw_field in _VALID_ERROR_FIELDS
                else default_field
            )  # type: ignore[assignment]
            msg = str(parsed.get("message") or "").strip() or default_msg
            raise CourseServiceError(status_code=422, code=code, message=msg, field=field)

        if status != "ok":
            raise CourseServiceError(
                status_code=503,
                code="UPSTREAM_UNAVAILABLE",
                message="Chưa tạo được lộ trình. Bạn có thể thử lại.",
            )

        try:
            normalized = _normalize_course_fields(payload, parsed)
            course = Course(**normalized)
        except Exception as exc:
            raise CourseServiceError(
                status_code=422,
                code="INSUFFICIENT_SOURCES",
                message="Chưa đủ căn cứ hợp lệ để lưu lộ trình. Hãy thử thu hẹp mục tiêu.",
                field="goal",
            ) from exc

        return self.repository.save_course(course)

    def list_courses(self) -> list[CourseSummary]:
        """List all saved courses newest first."""
        return self.repository.list_courses()

    def get_course(self, course_id: str) -> Course:
        """Retrieve a saved course or raise 404 NOT_FOUND."""
        course = self.repository.get_course(course_id)
        if course is None:
            raise CourseServiceError(
                status_code=404,
                code="NOT_FOUND",
                message="Không tìm thấy khóa này.",
            )
        return course

