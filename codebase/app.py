"""FastAPI web server and CLI entrypoint for the learning path prototype.

Running `python run.py` starts the HTTP API server (with Swagger UI at /docs)
and serves built frontend assets from frontend/out, frontend/dist, or web/ if present.
Pass `--cli` to run the minimal interactive terminal loop instead (stdlib-only).
"""

from pathlib import Path
import sys

CODEBASE_DIR = Path(__file__).resolve().parent
if str(CODEBASE_DIR) not in sys.path:
    sys.path.insert(0, str(CODEBASE_DIR))

for _stream in (sys.stdout, sys.stderr, sys.stdin):
    try:
        _stream.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

VALID_ERROR_FIELDS: set[str] = {
    "learner_group",
    "topic",
    "goal",
    "level",
    "minutes_per_day",
}

FIELD_MESSAGES: dict[str, str] = {
    "learner_group": "Chọn nhóm người học hợp lệ (middle_school, high_school, university, working_adult).",
    "topic": "Nhập chủ đề học từ 1 đến 120 ký tự.",
    "goal": "Nhập mục tiêu học từ 1 đến 500 ký tự.",
    "level": "Nhập trình độ hiện tại từ 1 đến 250 ký tự.",
    "minutes_per_day": "Nhập số phút học mỗi ngày từ 1 đến 240.",
}

FALLBACK_LANDING_HTML = """<!doctype html>
<html lang="vi">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>API Lộ trình tự học — Nửa Nạc Nửa Mỡ</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; background: #F5F7FB; color: #172334; margin: 0; padding: 32px 16px; }
    main { max-width: 640px; margin: 0 auto; background: #FFFFFF; border: 1px solid #C9D3E4; border-radius: 12px; padding: 28px; }
    h1 { margin: 0 0 8px; font-size: 26px; }
    p { line-height: 1.6; }
    ul { padding-left: 20px; line-height: 1.8; }
    a { color: #234FA0; font-weight: 600; text-decoration: none; }
    a:hover { text-decoration: underline; }
    code { background: #EEF2F8; padding: 2px 6px; border-radius: 4px; font-size: 0.92em; }
  </style>
</head>
<body>
  <main>
    <h1>Lộ trình tự học có dẫn nguồn</h1>
    <p>Backend FastAPI đang chạy. Khi giao diện web được build vào <code>frontend/out</code>, <code>frontend/dist</code> hoặc <code>web/</code>, trang này sẽ tự động phục vụ giao diện demo.</p>
    <ul>
      <li><a href="/docs">Swagger UI (/docs)</a> — thử trực tiếp <code>POST /api/courses?fixture=1</code>, <code>GET /api/courses</code></li>
      <li><a href="/health">Kiểm tra dịch vụ (/health)</a></li>
      <li><a href="/api/courses">Danh sách khóa đã lưu (/api/courses)</a></li>
    </ul>
  </main>
</body>
</html>
"""


def _extract_error_field(loc: tuple) -> str | None:
    for part in loc:
        if isinstance(part, str) and part in VALID_ERROR_FIELDS:
            return part
    return None


def _resolve_static_ui_dir(root_dir: Path) -> Path | None:
    for candidate in (
        root_dir / "frontend" / "out",
        root_dir / "frontend" / "dist",
        root_dir / "web",
    ):
        if candidate.is_dir():
            return candidate
    return None


def create_app(
    db_path: Path | str | None = None,
    ui_dir: Path | str | None = None,
):
    """Build and configure the FastAPI application."""
    from fastapi import FastAPI, Request
    from fastapi.exceptions import RequestValidationError
    from fastapi.middleware.cors import CORSMiddleware
    from fastapi.responses import HTMLResponse, JSONResponse
    from fastapi.staticfiles import StaticFiles

    from api.v1.router import api_router
    from core.config import ROOT_DIR, get_settings
    from core.database import Database
    from repositories.course_repository import CourseRepository
    from schemas.course import ErrorDetail, ErrorEnvelope
    from services.course_service import CourseService, CourseServiceError

    settings = get_settings(db_path=db_path)
    application = FastAPI(
        title=settings.app_title,
        version=settings.app_version,
        description=settings.app_description,
    )
    application.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=False,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    database = Database(settings.db_path)
    repository = CourseRepository(database)
    application.state.settings = settings
    application.state.course_service = CourseService(repository, settings)

    @application.exception_handler(CourseServiceError)
    async def _handle_service_error(_request: Request, exc: CourseServiceError) -> JSONResponse:
        return JSONResponse(
            status_code=exc.status_code,
            content=exc.envelope.model_dump(exclude_none=True),
        )

    @application.exception_handler(RequestValidationError)
    async def _handle_validation_error(_request: Request, exc: RequestValidationError) -> JSONResponse:
        errors = exc.errors()
        first = errors[0] if errors else {}
        field = _extract_error_field(tuple(first.get("loc", ())))
        if field is not None:
            message = FIELD_MESSAGES[field]
        else:
            message = "Dữ liệu đầu vào không hợp lệ. Vui lòng kiểm tra lại 5 trường."
        envelope = ErrorEnvelope(
            error=ErrorDetail(code="INVALID_INPUT", message=message, field=field)  # type: ignore[arg-type]
        )
        return JSONResponse(
            status_code=422,
            content=envelope.model_dump(exclude_none=True),
        )

    application.include_router(api_router)

    resolved_ui = Path(ui_dir) if ui_dir is not None else _resolve_static_ui_dir(ROOT_DIR)
    if resolved_ui is not None and resolved_ui.is_dir():
        application.mount("/", StaticFiles(directory=str(resolved_ui), html=True), name="ui")
    else:
        @application.get("/", response_class=HTMLResponse, include_in_schema=False)
        async def _landing() -> HTMLResponse:
            return HTMLResponse(content=FALLBACK_LANDING_HTML)

    return application


def _run_cli() -> int:
    import tracing
    from agent import answer

    print("Bản chạy thử — gõ đầu vào rồi Enter. Thoát: Ctrl+C (hoặc Enter 2 lần với dòng trống).")
    blank = 0
    while True:
        try:
            text = input("> ").strip()
        except (EOFError, KeyboardInterrupt):
            print()
            return 0
        if not text:
            blank += 1
            if blank >= 2:
                return 0
            continue
        blank = 0
        tracing.begin("app")
        try:
            result = answer(text)
        except NotImplementedError as e:
            tracing.end()
            print("Chưa nối model: %s" % e)
            return 1
        except Exception as e:
            tracing.end()
            print("[lỗi] %s: %s" % (type(e).__name__, e))
            continue
        s, _ = tracing.end()
        print(result.get("output", "") if isinstance(result, dict) else result)
        print(
            "   (model: %s · gọi model %d lần · công cụ %d lần · token vào %d / ra %d)"
            % (", ".join(s["models"]) or "—", s["model_calls"], s["tool_calls"], s["tokens_in"], s["tokens_out"])
        )


def main() -> int:
    if "--cli" in sys.argv[1:]:
        return _run_cli()
    try:
        import uvicorn
        from core.config import ROOT_DIR, get_settings
    except ImportError as exc:
        print(
            f"Thiếu thư viện chạy web server ({exc.name}).\n"
            "Cài đặt bằng lệnh: python -m pip install -r requirements.txt\n"
            "Hoặc chạy chế độ CLI không cần cài thêm thư viện: python codebase/app.py --cli"
        )
        return 1

    settings = get_settings()
    application = create_app()
    ui_dir = _resolve_static_ui_dir(ROOT_DIR)
    ui_note = f" · UI tĩnh: {ui_dir.relative_to(ROOT_DIR)}" if ui_dir else " · Chưa build UI (đang mở trang dẫn tới /docs)"
    print(
        f"Đang chạy API tại http://{settings.host}:{settings.port} "
        f"(Swagger UI: http://{settings.host}:{settings.port}/docs{ui_note})"
    )
    uvicorn.run(application, host=settings.host, port=settings.port, log_level="info")
    return 0


if __name__ == "__main__":
    sys.exit(main())
else:
    try:
        app = create_app()
    except ImportError:
        app = None
