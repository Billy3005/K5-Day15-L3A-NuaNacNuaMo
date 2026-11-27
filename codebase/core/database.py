"""SQLite connection and transaction management."""

from contextlib import contextmanager
from pathlib import Path
import sqlite3
from typing import Iterator

from models.course import COURSES_INDEX_DDL, COURSES_TABLE_DDL


class Database:
    """Lightweight SQLite connection manager with atomic transactions."""

    def __init__(self, db_path: Path | str) -> None:
        self.db_path = Path(db_path)
        self.init_schema()

    @contextmanager
    def session(self) -> Iterator[sqlite3.Connection]:
        """Yield a SQLite connection wrapped in an atomic transaction."""
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        conn = sqlite3.connect(str(self.db_path), timeout=10.0)
        conn.row_factory = sqlite3.Row
        try:
            with conn:
                yield conn
        finally:
            conn.close()

    def init_schema(self) -> None:
        """Initialize database tables, WAL mode, and indexes if absent."""
        with self.session() as conn:
            conn.execute("PRAGMA journal_mode=WAL")
            conn.execute(COURSES_TABLE_DDL)
            conn.execute(COURSES_INDEX_DDL)

