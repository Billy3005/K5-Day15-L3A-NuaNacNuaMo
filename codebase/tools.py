"""Công cụ tra cứu: fixture cục bộ (mặc định) hoặc tìm kiếm web thật qua Claude web_search."""

import json
import os
from pathlib import Path
import re
import unicodedata

import ai  # noqa: F401 — nạp .env trước khi đọc SEARCH_PROVIDER
from tracing import note, tool


MOCK_RESOURCES = Path(__file__).resolve().parents[1] / "data" / "mock_resources.json"
SEARCH_PROVIDER = (os.environ.get("SEARCH_PROVIDER") or "mock").strip().lower()
SOURCE_MODE = "mock" if SEARCH_PROVIDER == "mock" else "web"


def _search_mock(query: str) -> list[dict]:
    request = unicodedata.normalize("NFC", query).casefold()
    resources = json.loads(MOCK_RESOURCES.read_text(encoding="utf-8"))
    for resource in resources:
        if any(re.search(rf"(?<!\w){re.escape(keyword)}(?!\w)", request)
               for keyword in resource["keywords"]):
            return [resource]
    return []


def _search_anthropic(query: str) -> list[dict]:
    reply = ai.call_search_model(query)
    note(f"web_search: {reply['web_search_requests']} lượt tìm, {len(reply['results'])} nguồn có trích dẫn"
         + (f", lỗi: {', '.join(reply['search_errors'])}" if reply["search_errors"] else ""))
    if reply["search_error"]:
        # Lỗi upstream (thử lại được) — khác với tìm xong mà không có nguồn (insufficient_sources).
        raise ai.SearchServiceError(reply["search_error"])
    # ID tạm theo thứ tự trích dẫn; AN-05 sẽ chuẩn hóa ID ổn định.
    return [{"id": f"W{i}", **item} for i, item in enumerate(reply["results"], start=1)]


@tool
def search_web(query: str) -> list[dict]:
    """Tra nguồn học liệu cho một yêu cầu học tập.

    Input: chuỗi mục tiêu học. Output: danh sách nguồn, mỗi mục có id, title, url, excerpt
    (mock có thêm keywords, plan, example, exercise). Chỉ đọc, không có tác động ra ngoài.
    SEARCH_PROVIDER=mock (mặc định) đọc data/mock_resources.json, tối đa một mục.
    SEARCH_PROVIDER=anthropic gọi Claude với công cụ web_search; tiêu đề và URL lấy từ kết quả tìm kiếm,
    đoạn trích lấy nguyên văn từ cited_text của trích dẫn. Dịch vụ tìm kiếm lỗi hoặc chưa hoàn tất thì
    raise ai.SearchServiceError (backend trả 503), không trả danh sách rỗng.
    """
    if SEARCH_PROVIDER == "mock":
        return _search_mock(query)
    if SEARCH_PROVIDER == "anthropic":
        return _search_anthropic(query)
    raise ValueError("SEARCH_PROVIDER không hỗ trợ: %s (dùng mock hoặc anthropic)" % SEARCH_PROVIDER)
