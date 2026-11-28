"""NewLearn endpoints: tiến độ, kiểm tra nhanh, lịch sử kiểm tra, video tóm tắt bài và tổng quan."""

from typing import Annotated, Any, Optional, Union

from fastapi import APIRouter, Body, Depends, Path, Query, Request
from pydantic import BaseModel, Field

from services.learning_service import LearningService

router = APIRouter(prefix="/api", tags=["NewLearn"])

CourseId = Annotated[str, Path(min_length=1, max_length=100)]


def get_learning_service(request: Request) -> LearningService:
    return request.app.state.learning_service


Service = Annotated[LearningService, Depends(get_learning_service)]


class ProgressUpdate(BaseModel):
    done: bool


AnswerValue = Union[int, Annotated[str, Field(max_length=1000)], None]


class AnswerCheck(BaseModel):
    index: int = Field(ge=0, le=20)
    answer: AnswerValue = None


class AttemptCreate(BaseModel):
    answers: list[AnswerValue] = Field(max_length=20)
    duration_s: int = Field(default=0, ge=0, le=24 * 3600)
    submission_id: Optional[str] = Field(default=None, max_length=64)


class ScenesUpdate(BaseModel):
    scenes: list[dict[str, Any]] = Field(max_length=8)


@router.get("/overview", summary="Số liệu tổng quan, khóa học kèm tiến độ và hoạt động gần đây")
def overview(service: Service) -> dict[str, Any]:
    return service.overview()


@router.get("/courses/{course_id}/progress", summary="Các ngày đã học của một khóa")
def get_progress(course_id: CourseId, service: Service) -> dict[str, Any]:
    return service.get_progress(course_id)


@router.put("/courses/{course_id}/progress/{day}", summary="Đánh dấu hoặc bỏ đánh dấu đã học một ngày")
def set_progress(course_id: CourseId, day: Annotated[int, Path(ge=1, le=30)],
                 body: ProgressUpdate, service: Service) -> dict[str, Any]:
    return service.set_progress(course_id, day, body.done)


@router.post("/courses/{course_id}/quizzes", status_code=201, summary="Sinh bài kiểm tra nhanh 5 câu từ bài 1")
def create_quiz(course_id: CourseId, service: Service) -> dict[str, Any]:
    return service.create_quiz(course_id)


@router.post("/quizzes/{quiz_id}/check", summary="Kiểm tra một câu: server chấm rồi trả đáp án và giải thích")
def check_answer(quiz_id: Annotated[str, Path(min_length=1, max_length=100)], body: AnswerCheck,
                 service: Service) -> dict[str, Any]:
    return service.check_answer(quiz_id, body.index, body.answer)


@router.post("/quizzes/{quiz_id}/attempts", status_code=201, summary="Nộp và lưu một lượt làm bài (server chấm)")
def submit_attempt(quiz_id: Annotated[str, Path(min_length=1, max_length=100)], body: AttemptCreate,
                   service: Service) -> dict[str, Any]:
    return service.submit_attempt(quiz_id, body.answers, body.duration_s, body.submission_id)


@router.get("/quiz-attempts", summary="Lịch sử các lượt kiểm tra (mới nhất trước)")
def list_attempts(service: Service, course_id: Annotated[Optional[str], Query(max_length=100)] = None
                  ) -> list[dict[str, Any]]:
    return service.list_attempts(course_id)


@router.get("/quiz-attempts/{attempt_id}", summary="Xem lại một lượt làm bài")
def get_attempt(attempt_id: Annotated[str, Path(min_length=1, max_length=100)], service: Service) -> dict[str, Any]:
    return service.get_attempt(attempt_id)


@router.post("/courses/{course_id}/videos", status_code=201, summary="Soạn kịch bản video tóm tắt bài 1")
def create_video(course_id: CourseId, service: Service) -> dict[str, Any]:
    return service.create_video_script(course_id)


@router.get("/videos", summary="Thư viện video")
def list_videos(service: Service, course_id: Annotated[Optional[str], Query(max_length=100)] = None
                ) -> list[dict[str, Any]]:
    return service.list_videos(course_id)


@router.get("/videos/{video_id}", summary="Một video")
def get_video(video_id: Annotated[str, Path(min_length=1, max_length=100)], service: Service) -> dict[str, Any]:
    return service.get_video(video_id)


@router.put("/videos/{video_id}", summary="Lưu kịch bản cảnh đã sửa")
def update_video(video_id: Annotated[str, Path(min_length=1, max_length=100)], body: ScenesUpdate,
                 service: Service) -> dict[str, Any]:
    return service.update_video(video_id, body.scenes)


@router.post("/videos/{video_id}/render", summary="Chốt kịch bản để phát video trên trình duyệt")
def render_video(video_id: Annotated[str, Path(min_length=1, max_length=100)],
                 service: Service, _body: Annotated[Optional[dict], Body()] = None) -> dict[str, Any]:
    return service.render_video(video_id)
