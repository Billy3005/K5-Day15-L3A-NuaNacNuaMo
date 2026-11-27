# Reflection — Nguyễn Quang Đạo

> Hạn nộp: **23:59 Thứ Bảy 28/11**. Mỗi câu 3–6 dòng.

1. **Vai trò + phần mình làm (trỏ tới file / commit):**
   Mình phụ trách backend, lưu trữ SQLite, chuẩn hóa điểm chạy demo và cấu hình mô phỏng chi phí trên nhánh riêng `feat/dao-backend-cost`. Mình xây dựng backend FastAPI theo cấu trúc phân tầng trong `codebase/` (`app.py`, `core/config.py`, `core/database.py`, `models/course.py`, `schemas/course.py`, `repositories/course_repository.py`, `services/course_service.py`, `api/v1/endpoints/courses.py`, `api/v1/endpoints/health.py`) khớp hợp đồng `docs/openapi.json` cho cả 3 endpoint (`POST /api/courses` kèm `?fixture=1`, `GET /api/courses`, `GET /api/courses/{id}`) và mã lỗi 422/404/503. Ngoài ra mình viết bộ kiểm thử tự động `tests/test_courses_api.py`, tài liệu `docs/api-guide.md`, `docs/architecture.md`, cập nhật `README.md` và chuẩn hóa đầu vào `cost/personas.yaml`, `cost/cost-estimate.md`.

2. **AI hỗ trợ mình thế nào (việc gì, công cụ gì, chỗ nào phải sửa lại output AI):**
   Mình dùng coding agent để dựng khung phân tầng FastAPI/Pydantic v2, sinh bộ test `pytest` và rà soát tài liệu API theo `docs/openapi.json`. Các điểm mình phải tự kiểm và sửa lại output AI: (a) tách đường chạy `--cli` khỏi phần import FastAPI để chế độ CLI vẫn chạy bằng thư viện chuẩn nếu chưa cài `requirements.txt`, (b) chuyển route handler đồng bộ từ `async def` sang `def` và bọc khóa luồng quanh `tracing.begin/end` để các lời gọi SQLite và `agent.answer()` không chặn event loop hoặc đè trace khi có nhiều request, (c) lọc các trường phụ từ JSON của `agent.answer()` trước khi kiểm tra Pydantic `extra="forbid"` để tránh trả 422 sai khi ghép workflow thật của An, và (d) đối chiếu trực tiếp bảng giá model chính thức thay vì giữ số ví dụ trong template.

3. **Một câu thử trượt của nhóm và mình học được gì từ nó:**
   *(Chờ `BAO-09` hoàn tất chấm eval lượt 1 và lượt 2 bằng model thật để trích đúng ID câu thử trượt thật, nguyên nhân từ trace và bài học rút ra — không tự bịa ví dụ trước khi có kết quả chạy thật.)*
