"""Thử nhanh AN-01 (tìm kiếm web thật) và AN-04 (model thật đọc token từ usage).

    python codebase/smoke_an.py model              # gọi model 1 câu, in model và token
    python codebase/smoke_an.py search [truy vấn]  # tìm web thật, in tiêu đề, URL, đoạn trích
    python codebase/smoke_an.py                    # chạy cả hai

Cần .env: MODEL_PROVIDER/MODEL_NAME/API_KEY cho model; SEARCH_PROVIDER=anthropic và SEARCH_API_KEY cho tìm kiếm.
Không ghi file kết quả; chỉ in ra màn hình để dán bằng chứng vào ghi chú task.
"""
import json
import sys

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


if __name__ == "__main__":
    what = sys.argv[1] if len(sys.argv) > 1 else "all"
    if what not in ("all", "model", "search") or (what != "search" and len(sys.argv) > 2):
        print("Tham số không hợp lệ: %s\n%s" % (" ".join(sys.argv[1:]), __doc__.strip()), file=sys.stderr)
        sys.exit(2)
    ok = True
    if what in ("all", "model"):
        ok &= check_model()
    if what in ("all", "search"):
        ok &= check_search(" ".join(sys.argv[2:]) or DEFAULT_QUERY)
    print("== KẾT QUẢ:", "ĐẠT" if ok else "CHƯA ĐẠT")
    sys.exit(0 if ok else 1)
