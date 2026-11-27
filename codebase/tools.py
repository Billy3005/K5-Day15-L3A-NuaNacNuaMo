"""Công cụ tra cứu cho bản chạy thử CP2."""

import json
from pathlib import Path
import re
import unicodedata

from tracing import tool


MOCK_RESOURCES = Path(__file__).resolve().parents[1] / "data" / "mock_resources.json"


@tool
def search_web(query: str) -> list[dict]:
    """Tra nguồn học liệu theo từ khóa từ yêu cầu.

    Input: chuỗi mục tiêu học. Output: tối đa một mục mock gồm ID, tiêu đề,
    URL, đoạn căn cứ và bài mẫu. Chỉ đọc dữ liệu cục bộ, không gọi ra ngoài.
    """
    request = unicodedata.normalize("NFC", query).casefold()
    resources = json.loads(MOCK_RESOURCES.read_text(encoding="utf-8"))
    for resource in resources:
        if any(re.search(rf"(?<!\w){re.escape(keyword)}(?!\w)", request)
               for keyword in resource["keywords"]):
            return [resource]
    return []
