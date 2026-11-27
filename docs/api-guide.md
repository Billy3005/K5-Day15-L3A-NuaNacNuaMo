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

| Biến môi trường | Mặc định | Ý nghĩa |
|---|---|---|
| `HOST` | `127.0.0.1` | Địa chỉ bind của server |
| `PORT` | `8000` | Cổng HTTP của server |
| `COURSE_DB_PATH` | `data/courses.db` | Đường dẫn file SQLite lưu khóa |
| `COURSE_USE_FIXTURE` | `0` | Đặt `1` để `POST /api/courses` luôn trả fixture mẫu |

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
- **Request Body (`CreateCourse`, bắt buộc đủ 5 trường, không nhận trường thừa):**
  - `learner_group`: `"middle_school"` | `"high_school"` | `"university"` | `"working_adult"`
  - `topic`: chuỗi 1–120 ký tự (tự trim khoảng trắng)
  - `goal`: chuỗi 1–500 ký tự (tự trim khoảng trắng)
  - `level`: chuỗi 1–250 ký tự (tự trim khoảng trắng)
  - `minutes_per_day`: số nguyên từ `1` đến `240`

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

## 4. Hợp đồng tích hợp Backend (Đạo) ↔ Workflow AI (An · `AN-02`)

Khi `POST /api/courses` chạy ở chế độ thật (không truyền `?fixture=1` và `COURSE_USE_FIXTURE != 1`):

1. **Đầu vào gửi tới `agent.answer(text)`** (`format_course_request` trong `codebase/services/course_service.py`):

```text
Tôi là <nhóm người học>. Chủ đề muốn học: <topic>. Mục tiêu: <goal>. Trình độ hiện tại: <level>. Thời gian học: <minutes_per_day> phút mỗi ngày.
```

2. **Đầu ra `agent.answer(text)` trả về** (`{"output": "<JSON string>"}`):
   - **Ca thành công (`status = "ok"`):** gồm `mode` (`"model"` | `"mock"`), `source_mode` (`"web"` | `"mock"`), `plan` (5 ngày `1..5`, mỗi ngày có `day`, `title`, `objective`), `lesson` (`day: 1`, `title`, `minutes`, `sections` với `text` và `source_ids`, `example`, `exercise`), `sources` (`id`, `title`, `url`, `excerpt`). Các trường phụ nội bộ (nếu có) sẽ được tầng service lọc bỏ để đầu ra HTTP khớp 100% OpenAPI; `lesson.minutes` nếu vượt `minutes_per_day` sẽ được cắt về `minutes_per_day`.
   - **Ca dừng (`clarification_required`, `insufficient_sources`, `out_of_scope`, `refused`):** trả `{"status": "<trạng thái>", "message": "<thông điệp tiếng Việt>"}`. Backend ánh xạ sang HTTP `422` đúng mã lỗi OpenAPI và **không lưu** vào SQLite.
   - **Ca lỗi dịch vụ / JSON hỏng:** Backend ánh xạ sang HTTP `503` (`UPSTREAM_UNAVAILABLE`) và **không lưu** vào SQLite.

---

## 5. Kiểm thử tự động

```bash
python3 -m pip install -r requirements.txt
pytest -v
```


