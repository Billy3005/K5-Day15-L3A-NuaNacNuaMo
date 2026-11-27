"""Chuẩn hóa nguồn tra được (AN-05): lọc URL, chọn đoạn bằng chứng, gộp trùng, gán ID S1…Sn.

Đầu vào là kết quả thô của công cụ tìm kiếm: [{"title", "url", "excerpts": [đoạn trích nguyên văn, …]}].
Đầu ra khớp schema Source trong docs/openapi.json: [{"id", "title", "url", "excerpt"}].
Hàm thuần, không gọi mạng — kiểm bằng codebase/test_sources.py.
"""

import re
from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit

MAX_SOURCES = 5
MIN_EXCERPT_CHARS = 40
MIN_EXCERPT_WORDS = 6
MAX_EXCERPT_CHARS = 300

TRACKING_PARAMS = re.compile(r"^(utm_\w+|gclid|fbclid|msclkid|ref|ref_src|igshid|mc_cid|mc_eid)$", re.I)
# Chữ hay gặp ở menu, đầu trang, chân trang — không phải nội dung bài.
NAV_WORDS = re.compile(
    r"\b(logo|menu|log ?in|sign ?(in|up)|subscribe|cookies?|skip to (main )?content|home page|"
    r"đăng nhập|đăng ký|trang chủ|danh mục)\b", re.I)
NAV_SEPARATORS = re.compile(r"\s(?:-|\||»|›|·)\s")


def normalize_url(url: str) -> str | None:
    """Trả URL chuẩn (host chữ thường, bỏ #…, bỏ tham số theo dõi, bỏ / cuối) hoặc None nếu không phải http(s)."""
    try:
        parts = urlsplit((url or "").strip())
        port = parts.port   # cổng sai (vd :99999, :abc) chỉ ném ValueError khi đọc thuộc tính này
    except ValueError:
        return None
    if parts.scheme.lower() not in ("http", "https") or not parts.hostname:
        return None
    netloc = parts.hostname.lower() + (f":{port}" if port else "")
    query = urlencode([(k, v) for k, v in parse_qsl(parts.query, keep_blank_values=True)
                       if not TRACKING_PARAMS.match(k)])
    path = parts.path.rstrip("/") if parts.path not in ("", "/") else ""
    return urlunsplit((parts.scheme.lower(), netloc, path, query, ""))


def _shorten(text: str) -> str:
    """Cắt đoạn dài theo ranh giới câu (hoặc từ), không đổi ký tự nào trong phần giữ lại."""
    if len(text) <= MAX_EXCERPT_CHARS:
        return text
    cut = text[:MAX_EXCERPT_CHARS]
    end = max(cut.rfind(". "), cut.rfind("? "), cut.rfind("! "))
    return cut[:end + 1] if end >= MIN_EXCERPT_CHARS else cut.rsplit(" ", 1)[0] + "…"


def display_excerpt(text: str) -> str:
    """Đoạn trích để hiển thị: giữ nguyên văn (kể cả ** hay * trong code như 2 ** 3), chỉ gộp khoảng trắng."""
    return _shorten(" ".join((text or "").split()))


def clean_excerpt(text: str) -> str:
    """Bản làm sạch CHỈ dùng để lọc: bỏ định dạng markdown đơn giản, gộp khoảng trắng, cắt gọn."""
    text = re.sub(r"\*\*|__|`", "", text or "")
    text = re.sub(r"\*(\S(?:[^*]*\S)?)\*", r"\1", text)   # *nghiêng* → nghiêng, giữ "SELECT * FROM"
    return _shorten(re.sub(r"^[\s\-–•|>#]+", "", " ".join(text.split())))


def excerpt_problem(text: str) -> str | None:
    """Lý do đoạn không dùng làm bằng chứng được, hoặc None nếu dùng được."""
    if len(text) < MIN_EXCERPT_CHARS or len(re.findall(r"\w+", text)) < MIN_EXCERPT_WORDS:
        return "quá ngắn"
    # Một từ như "menu" hay "sign in" có thể nằm trong bài thật (Excel, GitHub) nên cần từ 2 lần trở lên.
    if len(NAV_WORDS.findall(text)) >= 2:
        return "giống chữ menu"
    segments = [s for s in NAV_SEPARATORS.split(" " + text + " ") if s.strip()]
    short = sum(1 for s in segments if len(s.split()) <= 3)
    if len(segments) >= 4 and short >= len(segments) / 2:
        return "giống chữ menu"
    words = text.casefold().split()
    pairs = list(zip(words, words[1:]))
    if pairs and len(set(pairs)) / len(pairs) < 0.75:
        return "lặp chữ"
    return None


def best_excerpt(excerpts: list[str]) -> tuple[str | None, list[str]]:
    """Chọn đoạn dùng được dài nhất. Trả (đoạn nguyên văn để hiển thị hoặc None, lý do loại các đoạn còn lại).
    Việc lọc xét bản đã làm sạch; đoạn trả về là bản nguyên văn để không làm hỏng cú pháp code."""
    usable, rejected = [], []
    for raw in excerpts:
        problem = excerpt_problem(clean_excerpt(raw))
        (rejected.append(problem) if problem else usable.append(display_excerpt(raw)))
    return (max(usable, key=len) if usable else None), rejected


def normalize_sources(raw: list[dict], max_sources: int = MAX_SOURCES) -> tuple[list[dict], list[str]]:
    """Trả (nguồn đã chuẩn hóa có ID S1…Sn, ghi chú các nguồn bị loại để đưa vào trace)."""
    kept, seen, dropped = [], set(), []
    for item in raw:
        url = normalize_url(item.get("url", ""))
        if not url:
            dropped.append(f"URL không hợp lệ: {item.get('url')!r}")
            continue
        if url in seen:
            continue
        excerpts = item.get("excerpts") or ([item["excerpt"]] if item.get("excerpt") else [])
        excerpt, rejected = best_excerpt(excerpts)
        if not excerpt:
            dropped.append(f"{url}: không có đoạn bằng chứng dùng được ({', '.join(rejected) or 'trống'})")
            continue
        seen.add(url)
        title = " ".join((item.get("title") or "").split()) or urlsplit(url).hostname
        kept.append({"title": title, "url": url, "excerpt": excerpt})
        if len(kept) == max_sources:
            break
    return [{"id": f"S{i}", **src} for i, src in enumerate(kept, start=1)], dropped


def sufficiency(sources: list[dict], min_sources: int = 1) -> str | None:
    """None nếu đủ nguồn để soạn bài; ngược lại là câu báo thiếu nguồn cho người học."""
    if len(sources) >= min_sources:
        return None
    return ("Chưa tìm được nguồn công khai có đoạn bằng chứng đủ rõ cho mục tiêu này. "
            "Hãy thu hẹp chủ đề hoặc cung cấp tài liệu công khai.")
