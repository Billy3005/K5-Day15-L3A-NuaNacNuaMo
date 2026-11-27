"""Application settings loaded from environment variables."""

from dataclasses import dataclass
import os
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parents[2]
CODEBASE_DIR = ROOT_DIR / "codebase"
DEFAULT_DB_PATH = ROOT_DIR / "data" / "courses.db"


@dataclass(frozen=True)
class Settings:
    """Runtime configuration for the learning path API."""

    app_title: str = "API lộ trình tự học"
    app_version: str = "0.1.0"
    app_description: str = (
        "Backend lộ trình tự học 5 ngày và bài đầu có trích dẫn. "
        "Xem thêm hướng dẫn tại docs/api-guide.md."
    )
    host: str = "127.0.0.1"
    port: int = 8000
    db_path: Path = DEFAULT_DB_PATH
    use_fixture_default: bool = False


def get_settings(db_path: Path | str | None = None) -> Settings:
    """Resolve runtime settings from environment variables and optional overrides."""
    configured_db = os.environ.get("COURSE_DB_PATH", "").strip()
    resolved_db = (
        Path(db_path)
        if db_path is not None
        else (Path(configured_db) if configured_db else DEFAULT_DB_PATH)
    )
    return Settings(
        host=os.environ.get("HOST", "127.0.0.1").strip() or "127.0.0.1",
        port=int(os.environ.get("PORT", "8000")),
        db_path=resolved_db,
        use_fixture_default=os.environ.get("COURSE_USE_FIXTURE", "").strip() == "1",
    )

