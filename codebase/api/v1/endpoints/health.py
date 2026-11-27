"""Health check endpoint."""

from fastapi import APIRouter

router = APIRouter(tags=["Hệ thống"])


@router.get(
    "/health",
    summary="Kiểm tra trạng thái dịch vụ",
    description="Trả về `{\"status\": \"ok\"}` khi API sẵn sàng nhận request.",
)
async def health() -> dict[str, str]:
    return {"status": "ok"}

