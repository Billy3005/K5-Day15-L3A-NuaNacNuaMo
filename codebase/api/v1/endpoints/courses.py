"""Course endpoints (POST /api/courses, GET /api/courses, GET /api/courses/{id})."""

from typing import Annotated, Optional

from fastapi import APIRouter, Depends, Path, Query, Request, Response

from schemas.course import Course, CourseSummary, CreateCourse, ErrorEnvelope
from services.course_service import CourseService

router = APIRouter(prefix="/api/courses", tags=["Khóa học"])


def get_course_service(request: Request) -> CourseService:
    """Dependency injecting the configured CourseService from app state."""
    return request.app.state.course_service


@router.post(
    "",
    response_model=Course,
    status_code=201,
    summary="Tạo và lưu một khóa học",
    description=(
        "Nhận 5 trường thông tin người học, chạy workflow tạo lộ trình 5 ngày + bài 1 có trích dẫn, "
        "lưu vào SQLite khi thành công và trả HTTP 201 kèm header `Location`. "
        "Truyền `?fixture=1` để dùng JSON mẫu cố định khi kiểm thử UI."
    ),
    responses={
        201: {"description": "Khóa đã được tạo và lưu vào SQLite."},
        422: {
            "model": ErrorEnvelope,
            "description": "Đầu vào không hợp lệ, cần làm rõ, thiếu nguồn, ngoài phạm vi hoặc bị từ chối.",
        },
        503: {
            "model": ErrorEnvelope,
            "description": "Dịch vụ model hoặc tìm nguồn chưa sẵn sàng.",
        },
    },
)
def create_course(
    payload: CreateCourse,
    response: Response,
    service: Annotated[CourseService, Depends(get_course_service)],
    fixture: Annotated[
        Optional[bool],
        Query(
            description=(
                "Truyền true/1 để trả JSON mẫu cố định theo OpenAPI (DAO-01), "
                "hoặc false/0 để buộc chạy workflow thật kể cả khi bật COURSE_USE_FIXTURE=1."
            )
        ),
    ] = None,
) -> Course:
    course = service.create_course(payload, use_fixture=fixture)
    response.headers["Location"] = f"/api/courses/{course.id}"
    return course


@router.get(
    "",
    response_model=list[CourseSummary],
    summary="Liệt kê khóa đã lưu",
    description="Trả danh sách khóa đã lưu (mới nhất trước). Danh sách rỗng trả `[]`.",
)
def list_courses(
    service: Annotated[CourseService, Depends(get_course_service)],
) -> list[CourseSummary]:
    return service.list_courses()


@router.get(
    "/{course_id}",
    response_model=Course,
    summary="Mở một khóa đã lưu",
    description="Đọc đầy đủ lộ trình 5 ngày, bài 1 và danh sách nguồn theo `id`.",
    responses={
        404: {"model": ErrorEnvelope, "description": "Không tìm thấy khóa với ID đã cho."},
    },
)
def get_course(
    course_id: Annotated[str, Path(min_length=1, max_length=100, description="ID của khóa học.")],
    service: Annotated[CourseService, Depends(get_course_service)],
) -> Course:
    return service.get_course(course_id)

