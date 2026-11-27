# Cấu trúc code Frontend & Backend

Tài liệu này mô tả cấu trúc thư mục chuẩn cho cả **Frontend** (Next.js App Router) và **Backend** (FastAPI + SQLite + AI workflow) trong repo.

---

## 1. Tổng quan cây thư mục

```text
.
├── run.py                          # Điểm vào chung: `python3 run.py` (chạy API + UI), `eval`, `simulate`, `check`
├── codebase/                       # BACKEND (FastAPI + SQLite + AI workflow)
│   ├── app.py                      # Khởi tạo FastAPI, CORS, exception handler, mount UI tĩnh & runner
│   ├── core/
│   │   ├── config.py               # Cấu hình từ env (HOST, PORT, COURSE_DB_PATH, COURSE_USE_FIXTURE)
│   │   └── database.py             # Kết nối SQLite + transaction nguyên tử
│   ├── models/
│   │   └── course.py               # DDL bảng `courses` và index
│   ├── schemas/
│   │   └── course.py               # Pydantic v2 schemas (CreateCourse, Course, CourseSummary, ErrorEnvelope)
│   ├── repositories/
│   │   └── course_repository.py    # Truy vấn SQLite trực tiếp (save, list, get)
│   ├── services/
│   │   └── course_service.py       # Nghiệp vụ tạo khóa, gọi answer(text), ánh xạ 422/503, fixture mode
│   ├── api/v1/
│   │   ├── router.py               # Gom router v1
│   │   └── endpoints/
│   │       ├── health.py           # GET /health
│   │       └── courses.py          # POST /api/courses, GET /api/courses, GET /api/courses/{course_id}
│   ├── agent.py                    # [An] Workflow AI `answer(text)` dùng chung cho web, CLI, eval, simulate
│   ├── ai.py                       # [An] Gọi model `call_model()`
│   ├── tools.py                    # [An] Công cụ tra nguồn `search_web()`
│   └── tracing.py                  # [Khung] Ghi trace & đếm token
│
├── frontend/                       # FRONTEND (Next.js App Router + TypeScript + Tailwind)
│   ├── app/
│   │   ├── layout.tsx              # Root layout (lang="vi", nền #F5F7FB, chữ #172334)
│   │   ├── page.tsx                # Trang tạo lộ trình 5 ngày (LONG-01, LONG-02)
│   │   └── courses/
│   │       ├── page.tsx            # Trang danh sách khóa đã lưu (LONG-05)
│   │       └── [id]/page.tsx       # Trang chi tiết lộ trình, bài 1 & nguồn (LONG-03, LONG-04)
│   ├── components/
│   │   ├── ui/                     # Component dùng chung (Button, Input, Alert, Badge…)
│   │   └── features/courses/       # Component nghiệp vụ ('use client' ở leaf): CourseForm, PlanSidebar, LessonView, SourceDrawer
│   ├── hooks/                      # Custom hooks phía client (useCreateCourse, useCourses…)
│   ├── lib/
│   │   ├── api-client.ts           # Hàm gọi HTTP `/api/courses` chuẩn hóa lỗi `ApiClientError`
│   │   ├── constants.ts            # Dữ liệu mẫu SQL (`SQL_EXAMPLE_INPUT`) & nhóm người học
│   │   └── utils.ts                # Helper `cn()` gộp class Tailwind
│   └── types/
│       └── course.ts               # Kiểu TypeScript khớp 1:1 với `docs/openapi.json`
│
├── tests/
│   └── test_courses_api.py         # Kiểm thử tự động backend (pytest)
└── docs/
    ├── openapi.json                # Hợp đồng API dùng chung giữa Long & Đạo
    ├── ui-wireframes.md            # Wireframe & trạng thái UI cho Long
    ├── api-guide.md                # Hướng dẫn chi tiết từng endpoint & ví dụ curl
    └── architecture.md             # Tài liệu cấu trúc code này
```

---

## 2. Nguyên tắc phân tách

- **Frontend (`frontend/`):**
  - Mặc định dùng **React Server Components (RSC)** trong `app/`; chỉ thêm `'use client'` ở các component lá cần state hoặc event (`components/features/courses/`).
  - Mọi kiểu request/response và mã lỗi nhập từ `frontend/types/course.ts` và gọi qua `frontend/lib/api-client.ts`.
  - Khi build tĩnh ra `frontend/out/`, `frontend/dist/` (hoặc `web/`), `codebase/app.py` tự động phục vụ UI ở `/` cùng origin với `/api/courses`.
  - Khi chạy dev server riêng (Next.js ở cổng `3000`), đặt `NEXT_PUBLIC_API_URL=http://127.0.0.1:8000` (backend đã bật CORS).
- **Backend (`codebase/`):**
  - Tách rõ 5 tầng: `api/v1/endpoints/` (HTTP) → `schemas/` (validation) → `services/` (nghiệp vụ & gọi `agent.answer`) → `repositories/` (SQLite CRUD) → `models/` + `core/`.
  - Chi tiết từng endpoint xem [api-guide.md](api-guide.md).

