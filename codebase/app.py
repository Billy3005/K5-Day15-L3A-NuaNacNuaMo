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


def _resolve_ui_file(ui_root: Path, full_path: str) -> Path | None:
    """Resolve static asset, clean HTML URL, or SPA fallback safely within ui_root."""
    base = ui_root.resolve()
    rel = full_path.strip("/")
    if rel == "api" or rel.startswith("api/"):
        return None

    def _safe_file(candidate: Path) -> Path | None:
        try:
            resolved = candidate.resolve()
        except OSError:
            return None
        if not resolved.is_relative_to(base):
            return None
        if resolved.is_file():
            return resolved
        return None

    if not rel:
        return _safe_file(base / "index.html")

    exact = _safe_file(base / rel)
    if exact is not None:
        return exact

    dir_index = _safe_file(base / rel / "index.html")
    if dir_index is not None:
        return dir_index

    clean_html = _safe_file(base / f"{rel}.html")
    if clean_html is not None:
        return clean_html

    # Next 16 static export ghi file prefetch theo segment thành thư mục
    # (videos/__next.videos/__PAGE__.txt) nhưng client gọi tên phẳng (videos/__next.videos.__PAGE__.txt).
    head, _, last_segment = rel.rpartition("/")
    if last_segment.startswith("__next.") and last_segment.endswith(".txt"):
        parts = last_segment[: -len(".txt")].split(".")
        nested = "__next." + "/".join(parts[1:]) + ".txt"
        segment_file = _safe_file(base / head / nested)
        if segment_file is not None:
            return segment_file

    # Extensionless client-side route (e.g. /courses/<id>) falls back to SPA index.html
    last_segment = rel.rsplit("/", 1)[-1]
    if "." not in last_segment:
        return _safe_file(base / "index.html")
    return None


def create_app(
    db_path: Path | str | None = None,
    ui_dir: Path | str | None = None,
):
    """Build and configure the FastAPI application."""
    from fastapi import FastAPI, Request
    from fastapi.exceptions import RequestValidationError
    from fastapi.middleware.cors import CORSMiddleware
    from fastapi.responses import FileResponse, HTMLResponse, JSONResponse
    from starlette.exceptions import HTTPException as StarletteHTTPException

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

    from repositories.learning_repository import LearningRepository
    from services.learning_service import LearningService

    application.state.learning_service = LearningService(
        LearningRepository(database), application.state.course_service
    )

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
        loc = tuple(first.get("loc", ()))
        field = _extract_error_field(loc)
        if field is not None:
            message = FIELD_MESSAGES[field]
        elif "course_id" in loc:
            message = "ID khóa học phải dài từ 1 đến 100 ký tự."
        else:
            message = "Dữ liệu đầu vào không hợp lệ. Vui lòng kiểm tra lại 5 trường."
        envelope = ErrorEnvelope(
            error=ErrorDetail(code="INVALID_INPUT", message=message, field=field)  # type: ignore[arg-type]
        )
        return JSONResponse(
            status_code=422,
            content=envelope.model_dump(exclude_none=True),
        )

    @application.exception_handler(StarletteHTTPException)
    async def _handle_http_error(request: Request, exc: StarletteHTTPException) -> JSONResponse:
        if request.url.path.startswith("/api"):
            if exc.status_code == 404:
                code = "NOT_FOUND"
                message = "Không tìm thấy đường dẫn API này."
            elif exc.status_code >= 500:
                code = "UPSTREAM_UNAVAILABLE"
                message = "Chưa tạo được lộ trình. Bạn có thể thử lại."
            else:
                code = "INVALID_INPUT"
                message = "Yêu cầu API không hợp lệ."
            envelope = ErrorEnvelope(error=ErrorDetail(code=code, message=message))  # type: ignore[arg-type]
            return JSONResponse(
                status_code=exc.status_code,
                content=envelope.model_dump(exclude_none=True),
            )
        return JSONResponse(
            status_code=exc.status_code,
            content={"detail": exc.detail},
        )

    @application.exception_handler(Exception)
    async def _handle_unexpected_error(_request: Request, _exc: Exception) -> JSONResponse:
        envelope = ErrorEnvelope(
            error=ErrorDetail(
                code="UPSTREAM_UNAVAILABLE",
                message="Chưa tạo được lộ trình. Bạn có thể thử lại.",
            )
        )
        # Starlette's ServerErrorMiddleware wraps CORSMiddleware, so unexpected-error
        # responses bypass CORSMiddleware and must include CORS headers explicitly.
        return JSONResponse(
            status_code=503,
            content=envelope.model_dump(exclude_none=True),
            headers={"Access-Control-Allow-Origin": "*"},
        )

    application.include_router(api_router)

    resolved_ui = Path(ui_dir) if ui_dir is not None else _resolve_static_ui_dir(ROOT_DIR)
    if resolved_ui is not None and resolved_ui.is_dir():
        ui_root = resolved_ui.resolve()

        @application.api_route("/{full_path:path}", methods=["GET", "HEAD"], include_in_schema=False)
        async def _serve_ui(full_path: str):
            if full_path == "api" or full_path.startswith("api/"):
                envelope = ErrorEnvelope(
                    error=ErrorDetail(
                        code="NOT_FOUND",
                        message="Không tìm thấy đường dẫn API này.",
                    )
                )
                return JSONResponse(
                    status_code=404,
                    content=envelope.model_dump(exclude_none=True),
                )
            target = _resolve_ui_file(ui_root, full_path)
            if target is not None:
                return FileResponse(target)
            return JSONResponse(status_code=404, content={"detail": "Not Found"})
    else:
        @application.api_route("/", methods=["GET", "HEAD"], response_class=HTMLResponse, include_in_schema=False)
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
