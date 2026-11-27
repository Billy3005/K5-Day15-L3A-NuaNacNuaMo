"""Hình dạng đầu ra của model và bộ kiểm trước khi xuất bài (AN-06).

REPLY_SCHEMA gửi cho OpenAI structured outputs (strict): mọi trường bắt buộc, không thêm trường lạ,
trường không dùng thì null. Ràng buộc số lượng, thứ tự ngày và ID nguồn do validate_reply() kiểm,
vì strict mode không bảo đảm các ràng buộc đó. Đầu ra hợp lệ khớp Course / ErrorEnvelope trong docs/openapi.json.
"""

import re

STOP_STATUSES = ("clarification_required", "insufficient_sources", "out_of_scope", "refused")
PLAN_DAYS = 5
MAX_MINUTES = 240
DEFAULT_MINUTES = 20   # trùng mức prompt dùng khi người học không nêu thời lượng


def _nullable(schema: dict) -> dict:
    return {"anyOf": [schema, {"type": "null"}]}


def _object(properties: dict) -> dict:
    return {"type": "object", "additionalProperties": False,
            "required": list(properties), "properties": properties}


_STRING = {"type": "string"}

REPLY_SCHEMA = _object({
    "status": {"type": "string", "enum": ["ok", *STOP_STATUSES]},
    "message": _nullable(_STRING),
    "title": _nullable(_STRING),
    "plan": _nullable({"type": "array", "items": _object({
        "day": {"type": "integer"}, "title": _STRING, "objective": _STRING})}),
    "lesson": _nullable(_object({
        "day": {"type": "integer"},
        "title": _STRING,
        "minutes": {"type": "integer"},
        "sections": {"type": "array", "items": _object({
            "text": _STRING, "source_ids": {"type": "array", "items": _STRING}})},
        "example": _STRING,
        "exercise": _STRING,
    })),
})


# Chỉ nhận cụm nói về thời lượng học mỗi ngày, không nhận số phút nằm trong mục tiêu
# (vd "tóm tắt báo cáo trong 5 phút"). Mẫu thứ hai là câu backend tạo từ minutes_per_day.
_PER_DAY = re.compile(r"(\d{1,3})\s*phút\s*(?:mỗi|một|/|trên|1)\s*ngày|thời gian học:?\s*(\d{1,3})\s*phút", re.I)


def minutes_budget(request: str, minutes_per_day: int | None = None) -> int:
    """Số phút tối đa cho bài: minutes_per_day đã xác thực (luồng web) nếu có, rồi đến cụm
    "N phút mỗi ngày" trong yêu cầu, không có thì DEFAULT_MINUTES."""
    if isinstance(minutes_per_day, int) and not isinstance(minutes_per_day, bool) and minutes_per_day > 0:
        return min(minutes_per_day, MAX_MINUTES)
    for found in _PER_DAY.finditer(request or ""):
        value = int(found[1] or found[2])
        if value > 0:
            return min(value, MAX_MINUTES)
    return DEFAULT_MINUTES


def _text(value) -> bool:
    return isinstance(value, str) and bool(value.strip())


def _plan_problem(plan) -> str | None:
    if not isinstance(plan, list) or len(plan) != PLAN_DAYS:
        return "plan phải có đúng %d ngày" % PLAN_DAYS
    for i, day in enumerate(plan, start=1):
        if not isinstance(day, dict) or day.get("day") != i:
            return "plan phải có ngày 1–%d theo đúng thứ tự" % PLAN_DAYS
        if not (_text(day.get("title")) and _text(day.get("objective"))):
            return "ngày %d thiếu title hoặc objective" % i
    return None


def _lesson_problem(lesson, valid_ids: set) -> str | None:
    if not isinstance(lesson, dict):
        return "lesson phải là object"
    if lesson.get("day") != 1:
        return "lesson phải là bài của ngày 1"
    minutes = lesson.get("minutes")
    if not isinstance(minutes, int) or isinstance(minutes, bool) or minutes < 1:
        return "lesson.minutes phải là số nguyên dương"
    for key in ("title", "example", "exercise"):
        if not _text(lesson.get(key)):
            return "lesson thiếu %s" % key
    sections = lesson.get("sections")
    if not isinstance(sections, list) or not sections:
        return "lesson cần ít nhất một section"
    for i, section in enumerate(sections, start=1):
        if not isinstance(section, dict) or not _text(section.get("text")):
            return "section %d thiếu text" % i
        ids = section.get("source_ids")
        if not isinstance(ids, list) or not ids:
            return "section %d không trích nguồn" % i
        # Kiểm kiểu trước: phần tử list/dict không hash được sẽ làm phép tra set ném TypeError.
        if not all(isinstance(x, str) and x.strip() for x in ids):
            return "section %d có ID nguồn không phải chuỗi" % i
        if len(set(ids)) != len(ids):
            return "section %d trích trùng ID" % i
        unknown = [x for x in ids if x not in valid_ids]
        if unknown:
            return "section %d trích ID không có trong danh sách nguồn: %s" % (i, ", ".join(unknown))
    return None


def validate_reply(reply, sources: list[dict], request: str = "",
                   minutes_per_day: int | None = None) -> tuple[dict, list[str]]:
    """Kiểm đầu ra model. Trả (kết quả sạch, ghi chú cho trace).

    Kết quả sạch là {status: ok, title?, plan, lesson, sources (chỉ nguồn được trích)} hoặc
    {status: <dừng>, message}. Đầu ra sai hình dạng hoặc trích ID lạ → insufficient_sources:
    không xuất bài khi ID nguồn không hợp lệ.
    """
    notes = []

    def stop(status, message):
        return {"status": status, "message": message}, notes

    if not isinstance(reply, dict) or not isinstance(reply.get("status"), str):
        notes.append("Đầu ra model không có status dạng chuỗi")
        return stop("insufficient_sources", "Chưa đủ căn cứ để xuất bài có trích dẫn.")
    status = reply["status"]
    if status in STOP_STATUSES:
        message = reply.get("message") if _text(reply.get("message")) else "Chưa thể soạn bài cho yêu cầu này."
        return stop(status, message.strip())
    if status != "ok":
        notes.append("status lạ: %r" % status)
        return stop("insufficient_sources", "Chưa đủ căn cứ để xuất bài có trích dẫn.")

    by_id = {src["id"]: src for src in sources}
    problem = _plan_problem(reply.get("plan")) or _lesson_problem(reply.get("lesson"), set(by_id))
    if problem:
        notes.append("Bộ kiểm chặn bài: " + problem)
        return stop("insufficient_sources", "Chưa đủ căn cứ để xuất bài có trích dẫn.")

    lesson = reply["lesson"]
    minutes = min(lesson["minutes"], minutes_budget(request, minutes_per_day))
    if minutes != lesson["minutes"]:
        notes.append("Giảm lesson.minutes %d → %d theo giới hạn thời lượng mỗi ngày" % (lesson["minutes"], minutes))
    cited = list(dict.fromkeys(i for s in lesson["sections"] for i in s["source_ids"]))
    clean = {
        "status": "ok",
        "plan": [{"day": d["day"], "title": d["title"].strip(), "objective": d["objective"].strip()}
                 for d in reply["plan"]],
        "lesson": {
            "day": 1, "title": lesson["title"].strip(), "minutes": minutes,
            "sections": [{"text": s["text"].strip(), "source_ids": list(s["source_ids"])} for s in lesson["sections"]],
            "example": lesson["example"].strip(), "exercise": lesson["exercise"].strip(),
        },
        "sources": [{k: by_id[i][k] for k in ("id", "title", "url", "excerpt")} for i in cited],
    }
    if _text(reply.get("title")):
        clean = {"status": "ok", "title": reply["title"].strip(), **{k: v for k, v in clean.items() if k != "status"}}
    return clean, notes
