# Reflection — Nguyễn Quang Đạo

> Hạn nộp: **23:59 Thứ Bảy 28/11**. Mỗi câu 3–6 dòng.

1. **Vai trò + phần mình làm (trỏ tới file / commit):**
   Mình phụ trách backend, lưu trữ SQLite, chuẩn hóa điểm chạy demo và cấu hình mô phỏng chi phí trên nhánh `feat/dao-backend-cost` (PR #1 `7767ef6` và các đợt đồng bộ ghép với PR #2–#6). Mình xây dựng backend FastAPI phân tầng trong `codebase/` (`app.py`, `core/`, `models/`, `schemas/`, `repositories/`, `services/`, `api/v1/`) khớp hợp đồng `docs/openapi.json` cho cả 3 endpoint (`POST /api/courses` kèm `?fixture=1`, `GET /api/courses`, `GET /api/courses/{id}`) và mã lỗi 422/404/503, nối trực tiếp vào pipeline thật của An (`agent.answer(..., minutes_per_day=...)`). Ngoài ra mình viết bộ kiểm thử `tests/test_courses_api.py`, tài liệu `docs/api-guide.md`, `docs/architecture.md`, cập nhật `README.md` và chuẩn hóa đầu vào `cost/personas.yaml`, `cost/cost-estimate.md` theo stack OpenAI + Claude và khảo sát `evidence/summary.md`.

2. **AI hỗ trợ mình thế nào (việc gì, công cụ gì, chỗ nào phải sửa lại output AI):**
   Mình dùng coding agent để dựng khung phân tầng FastAPI/Pydantic v2, sinh bộ test `pytest` và rà soát tài liệu API theo `docs/openapi.json`. Các điểm mình phải tự kiểm và sửa lại output AI: (a) tách đường chạy `--cli` khỏi phần import FastAPI để CLI vẫn chạy bằng thư viện chuẩn, (b) chuyển route đồng bộ sang `def`, bọc khóa luồng + `finally: tracing.end()` và thêm handler lỗi toàn cục để không lộ stack trace, (c) thay `StaticFiles` mặc định bằng bộ định tuyến hỗ trợ clean URL + SPA fallback cho `/courses/{id}` khi tải lại trang (chặn path traversal và giữ 404 JSON cho `/api/*`), và (d) siết xác thực số nguyên cho `minutes_per_day`, URL có host hợp lệ và đối chiếu trực tiếp bảng giá chính thức trong `cost/personas.yaml`.

3. **Một câu thử trượt của nhóm và mình học được gì từ nó:**
   _(Chờ `BAO-09` hoàn tất chấm eval lượt 1 và lượt 2 bằng model thật để trích đúng ID câu thử trượt thật, nguyên nhân từ trace và bài học rút ra — không tự bịa ví dụ trước khi có kết quả chạy thật.)_
