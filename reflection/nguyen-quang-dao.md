# Reflection — Nguyễn Quang Đạo

> Hạn nộp: **23:59 Thứ Bảy 28/11**. Mỗi câu 3–6 dòng.

1. **Vai trò + phần mình làm (trỏ tới file / commit):**
   Mình phụ trách backend, lưu trữ SQLite, chuẩn hóa điểm chạy demo và cấu hình mô phỏng chi phí trên nhánh riêng `feat/dao-backend-cost`. Mình xây dựng backend FastAPI theo cấu trúc phân tầng trong `codebase/` (`app.py`, `core/config.py`, `core/database.py`, `models/course.py`, `schemas/course.py`, `repositories/course_repository.py`, `services/course_service.py`, `api/v1/endpoints/courses.py`, `api/v1/endpoints/health.py`) khớp hợp đồng `docs/openapi.json` cho cả 3 endpoint (`POST /api/courses` kèm `?fixture=1`, `GET /api/courses`, `GET /api/courses/{id}`) và mã lỗi 422/404/503. Ngoài ra mình viết bộ kiểm thử tự động `tests/test_courses_api.py`, tài liệu `docs/api-guide.md`, `docs/architecture.md`, cập nhật `README.md` và chuẩn hóa đầu vào `cost/personas.yaml`, `cost/cost-estimate.md`.

2. **AI hỗ trợ mình thế nào (việc gì, công cụ gì, chỗ nào phải sửa lại output AI):**
   Mình dùng coding agent để dựng khung phân tầng FastAPI/Pydantic v2, sinh bộ test `pytest` và rà soát tài liệu API theo `docs/openapi.json`. Các điểm mình phải tự kiểm và sửa lại output AI: (a) tách đường chạy `--cli` khỏi phần import FastAPI để CLI vẫn chạy bằng thư viện chuẩn, (b) chuyển route đồng bộ sang `def`, bọc khóa luồng + `finally: tracing.end()` và thêm handler lỗi toàn cục để không lộ stack trace, (c) thay `StaticFiles` mặc định bằng bộ định tuyến hỗ trợ clean URL + SPA fallback cho `/courses/{id}` khi tải lại trang (chặn path traversal và giữ 404 JSON cho `/api/*`), và (d) siết xác thực số nguyên cho `minutes_per_day`, URL có host hợp lệ và đối chiếu trực tiếp bảng giá chính thức trong `cost/personas.yaml`.

3. **Một câu thử trượt của nhóm và mình học được gì từ nó:**
   *(Chờ `BAO-09` hoàn tất chấm eval lượt 1 và lượt 2 bằng model thật để trích đúng ID câu thử trượt thật, nguyên nhân từ trace và bài học rút ra — không tự bịa ví dụ trước khi có kết quả chạy thật.)*

