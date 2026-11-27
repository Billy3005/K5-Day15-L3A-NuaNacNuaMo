# Hướng dẫn cấu trúc backend & từng API

Tài liệu này mô tả cấu trúc code chuẩn của backend FastAPI trong `codebase/` và cách gọi, kiểm thử từng endpoint theo hợp đồng [OpenAPI](openapi.json).

---

## 1. Cấu trúc code chuẩn (Clean / Layered Architecture)

```text
codebase/
├── app.py                          # Điểm vào FastAPI + exception handler + CORS + runner (`python run.py`)
├── core/
│   ├── config.py                   # Đọc cấu hình từ biến môi trường (HOST, PORT, COURSE_DB_PATH, COURSE_USE_FIXTURE)
│   └── database.py                 # Quản lý kết nối SQLite và transaction nguyên tử
├── models/
│   └── course.py                   # Định nghĩa DDL bảng SQLite `courses` và index
├── schemas/
│   └── course.py                   # Pydantic v2 schemas (CreateCourse, Course, CourseSummary, ErrorEnvelope)
├── repositories/
│   └── course_repository.py        # Thao tác đọc/ghi SQLite trực tiếp (save, list, get)
├── services/
│   └── course_service.py           # Nghiệp vụ: chuyển 5 trường sang answer(text), ánh xạ 422/503, fixture mode
└── api/
    └── v1/
        ├── router.py               # Gom các router v1
        └── endpoints/
            ├── health.py           # GET /health
            └── courses.py          # POST /api/courses, GET /api/courses, GET /api/courses/{course_id}
```

> **Lưu ý phần khung AI:** `codebase/agent.py`, `codebase/ai.py`, `codebase/tools.py` và `codebase/tracing.py` giữ nguyên tại gốc `codebase/` để tương thích với `run.py eval` và `run.py simulate`.

---

## 2. Khởi chạy server và tài liệu tương tác

```bash
python3 run.py
```

- **Base URL mặc định:** `http://127.0.0.1:8000`
- **Swagger UI (thử API trực tiếp):** `http://127.0.0.1:8000/docs`
- **ReDoc:** `http://127.0.0.1:8000/redoc`
- **Chế độ CLI cũ:** `python3 codebase/app.py --cli`

| Biến môi trường      | Mặc định          | Ý nghĩa                                             |
| -------------------- | ----------------- | --------------------------------------------------- |
| `HOST`               | `127.0.0.1`       | Địa chỉ bind của server                             |
| `PORT`               | `8000`            | Cổng HTTP của server                                |
| `COURSE_DB_PATH`     | `data/courses.db` | Đường dẫn file SQLite lưu khóa                      |
| `COURSE_USE_FIXTURE` | `0`               | Đặt `1` để `POST /api/courses` luôn trả fixture mẫu |

---

## 3. Hướng dẫn từng API

### 3.1. `GET /health` — Kiểm tra dịch vụ

- **Mục đích:** Kiểm tra server đang sống trước khi UI hoặc script gọi API.
- **Ví dụ:**

```bash
curl http://127.0.0.1:8000/health
```

- **Response `200 OK`:**

```json
{
  "status": "ok"
}
```

---

### 3.2. `POST /api/courses` — Tạo và lưu khóa học

- **Mục đích:** Nhận 5 trường đầu vào từ form, gọi workflow tạo lộ trình 5 ngày + bài 1 có trích dẫn, lưu vào SQLite khi thành công và trả về toàn bộ khóa học.
- **Query parameter tùy chọn:**
  - `?fixture=1` (hoặc `true`): Trả JSON mẫu cố định (`course-demo-sql`) và lưu vào SQLite để ghép/test UI nhanh mà không phụ thuộc workflow AI.
  - `?fixture=0` (hoặc `false`): Buộc chạy qua workflow `agent.answer(text)` kể cả khi biến môi trường `COURSE_USE_FIXTURE=1` đang bật.
- **Request Body (`CreateCourse`, bắt buộc đủ 5 trường, không nhận trường thừa):**
  - `learner_group`: `"middle_school"` | `"high_school"` | `"university"` | `"working_adult"`
  - `topic`: chuỗi 1–120 ký tự (tự trim khoảng trắng)
  - `goal`: chuỗi 1–500 ký tự (tự trim khoảng trắng)
  - `level`: chuỗi 1–250 ký tự (tự trim khoảng trắng)
  - `minutes_per_day`: số nguyên JSON từ `1` đến `240` (từ chối boolean, số thực và chuỗi)

- **Ví dụ gọi API (dùng fixture để test UI):**

```bash
curl -i -X POST "http://127.0.0.1:8000/api/courses?fixture=1" \
  -H "Content-Type: application/json" \
  -d '{
    "learner_group": "university",
    "topic": "SQL",
    "goal": "Phân tích doanh thu cho bài tập nhóm",
    "level": "Biết Excel, mới học SQL",
    "minutes_per_day": 20
  }'
```

- **Response `201 Created`:**
  - Header: `Location: /api/courses/<id>`
  - Body: `Course` gồm `id`, `title`, `learner_group`, `minutes_per_day`, `mode` (`mock` | `model`), `source_mode` (`mock` | `web`), `plan` (đúng 5 ngày `1..5`), `lesson` (bài ngày 1, `minutes <= minutes_per_day`), `sources` (mỗi `source_ids` trong bài phải tồn tại trong `sources`).

- **Các mã lỗi có thể trả về (không lưu vào SQLite):**
  - `422 Unprocessable Entity` — dạng `{"error": {"code": "...", "message": "...", "field": "..."}}`:
    - `INVALID_INPUT`: Thiếu/sai kiểu/ngoài khoảng 5 trường (có `field` tương ứng để UI focus).
    - `CLARIFICATION_REQUIRED`: Mục tiêu quá mơ hồ (`field: "goal"`).
    - `INSUFFICIENT_SOURCES`: Chưa đủ nguồn công khai đối chiếu (`field: "goal"`).
    - `OUT_OF_SCOPE`: Chủ đề ngoài phạm vi hỗ trợ (`field: "topic"`).
    - `REFUSED`: Yêu cầu vi phạm quy tắc (ví dụ đòi bịa nguồn).
  - `503 Service Unavailable`:
    - `UPSTREAM_UNAVAILABLE`: Model hoặc công cụ tìm nguồn chưa sẵn sàng / lỗi kết nối.

---

### 3.3. `GET /api/courses` — Liệt kê khóa đã lưu

- **Mục đích:** Hiển thị danh sách các khóa đã tạo ở màn hình thư viện/lịch sử, sắp xếp **mới nhất trước**.
- **Ví dụ:**

```bash
curl http://127.0.0.1:8000/api/courses
```

- **Response `200 OK`:**
  - Khi chưa có khóa nào: `[]`
  - Khi đã có khóa:

```json
[
  {
    "id": "course-sql-a1b2c3d4",
    "title": "SQL — Phân tích doanh thu cho bài tập nhóm"
  }
]
```

---

### 3.4. `GET /api/courses/{course_id}` — Mở chi tiết một khóa đã lưu

- **Mục đích:** Đọc lại đầy đủ lộ trình 5 ngày, bài học ngày 1 và nguồn trích dẫn khi người dùng mở lại hoặc tải lại trang.
- **Path parameter:** `course_id` (chuỗi 1–100 ký tự).
- **Ví dụ:**

```bash
curl http://127.0.0.1:8000/api/courses/course-demo-sql
```

- **Response `200 OK`:** Trả object `Course` đầy đủ.
- **Response `404 Not Found`:**

```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Không tìm thấy khóa này."
  }
}
```

---

## 4. Hợp đồng tích hợp Backend (Đạo) ↔ Workflow AI (An · `AN-02`) & Frontend (Long · `DAO-06`)

Khi `POST /api/courses` chạy ở chế độ thật (không truyền `?fixture=1` và `COURSE_USE_FIXTURE != 1`):

1. **Đầu vào gửi tới `agent.answer(text, minutes_per_day=payload.minutes_per_day)`** (`format_course_request` trong `codebase/services/course_service.py`):

```text
Tôi là <nhóm người học>. Chủ đề muốn học: <topic>. Mục tiêu: <goal>. Trình độ hiện tại: <level>. Thời gian học: <minutes_per_day> phút mỗi ngày.
```

     Truyền thêm `minutes_per_day` đã xác thực từ form giúp `lesson_schema.minutes_budget` không bị nhầm với con số phút nằm trong chuỗi mục tiêu.

3. **Đầu ra `agent.answer(...)` trả về** (`{"output": "<JSON string>"}`, đã đi qua `codebase/sources.py` & `codebase/lesson_schema.py`):
   - **Ca thành công (`status = "ok"`):** gồm `mode` (`"model"` | `"mock"`), `source_mode` (`"web"` | `"mock"`), tùy chọn `title`, `plan` (5 ngày `1..5`, mỗi ngày có `day`, `title`, `objective`), `lesson` (`day: 1`, `title`, `minutes`, `sections` với `text` và `source_ids`, `example`, `exercise`), `sources` (ID chuẩn `S1..Sn` chỉ gồm các nguồn thực sự được trích dẫn, URL đã bỏ tham số theo dõi, `title`, `excerpt`). Tầng service tiếp tục bảo vệ thêm ở lớp HTTP: giải mã JSON bọc markdown fence, khử trùng `source_ids`, fallback `source.title` rỗng sang tên miền của `url` hợp lệ, lọc bỏ trường phụ nội bộ để khớp 100% OpenAPI và chặn `lesson.minutes` không vượt `minutes_per_day`.
   - **Ca dừng (`clarification_required`, `insufficient_sources`, `out_of_scope`, `refused`):** trả `{"status": "<trạng thái>", "message": "<thông điệp tiếng Việt>"}` (tùy chọn kèm `"field"` hợp lệ). Backend ánh xạ sang HTTP `422` đúng mã lỗi OpenAPI và **không lưu** vào SQLite.
   - **Ca lỗi dịch vụ / JSON hỏng:** Khi công cụ tìm kiếm raise `ai.SearchServiceError`, lỗi cấu hình `MODEL_PROVIDER=fake` + `SEARCH_PROVIDER=anthropic`, lỗi mạng/model hoặc JSON hỏng, backend ánh xạ sang HTTP `503` (`UPSTREAM_UNAVAILABLE`) và **không lưu** vào SQLite.

4. **Phục vụ giao diện tĩnh cùng origin (`DAO-06`):**
   - `python3 run.py` tự tìm bản build theo thứ tự `frontend/out/`, `frontend/dist/`, `web/`.
   - Hỗ trợ tài nguyên tĩnh (`/_next/...`, `/assets/...`), clean URL (`/courses` → `courses.html` hoặc `courses/index.html`) và fallback SPA (`/courses/<id>` → `index.html`) để nhấn **F5 / tải lại trang** vẫn mở đúng khóa học, đồng thời chặn path traversal và giữ nguyên phản hồi JSON `404 NOT_FOUND` cho mọi đường dẫn `/api/...` không tồn tại.

---

## 5. Kiểm thử tự động

Cài phụ thuộc kiểm thử (đã bao gồm `requirements.txt`, `pytest` và `httpx`) rồi chạy bộ test:

```bash
python -m pip install -r requirements-dev.txt
python -m pytest -q
```

> Trên macOS / Linux, thay `python` bằng `python3` nếu máy không có alias `python`.
