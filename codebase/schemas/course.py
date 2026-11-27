"""Pydantic v2 schemas matching docs/openapi.json for the learning path API."""

from typing import Literal, Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator

LearnerGroup = Literal["middle_school", "high_school", "university", "working_adult"]
ModeType = Literal["mock", "model"]
SourceModeType = Literal["mock", "web"]
ErrorCode = Literal[
    "INVALID_INPUT",
    "CLARIFICATION_REQUIRED",
    "INSUFFICIENT_SOURCES",
    "OUT_OF_SCOPE",
    "REFUSED",
    "NOT_FOUND",
    "UPSTREAM_UNAVAILABLE",
]
ErrorField = Literal["learner_group", "topic", "goal", "level", "minutes_per_day"]


class _StrictBase(BaseModel):
    model_config = ConfigDict(extra="forbid")


class CreateCourse(_StrictBase):
    """Request payload for POST /api/courses."""

    learner_group: LearnerGroup
    topic: str = Field(..., min_length=1, max_length=120)
    goal: str = Field(..., min_length=1, max_length=500)
    level: str = Field(..., min_length=1, max_length=250)
    minutes_per_day: int = Field(..., ge=1, le=240)

    @field_validator("topic", "goal", "level", mode="before")
    @classmethod
    def _trim_strings(cls, value: object) -> object:
        if isinstance(value, str):
            return value.strip()
        return value

    @field_validator("minutes_per_day", mode="before")
    @classmethod
    def _reject_non_integer_minutes(cls, value: object) -> object:
        if isinstance(value, (bool, float)):
            raise ValueError("minutes_per_day must be an integer between 1 and 240.")
        return value


class PlanDay(_StrictBase):
    """Single day entry in the 5-day learning plan."""

    day: int = Field(..., ge=1, le=5)
    title: str = Field(..., min_length=1)
    objective: str = Field(..., min_length=1)


class LessonSection(_StrictBase):
    """Lesson explanation block with source references."""

    text: str = Field(..., min_length=1)
    source_ids: list[str] = Field(..., min_length=1)

    @field_validator("source_ids")
    @classmethod
    def _validate_source_ids(cls, value: list[str]) -> list[str]:
        cleaned: list[str] = []
        seen: set[str] = set()
        for item in value:
            s = item.strip()
            if not s or len(s) > 100:
                raise ValueError("source_ids items must be 1..100 characters.")
            if s in seen:
                raise ValueError("source_ids must be unique.")
            seen.add(s)
            cleaned.append(s)
        return cleaned


class Lesson(_StrictBase):
    """Day 1 lesson content."""

    day: int = Field(..., ge=1, le=1)
    title: str = Field(..., min_length=1)
    minutes: int = Field(..., ge=1, le=240)
    sections: list[LessonSection] = Field(..., min_length=1)
    example: str = Field(..., min_length=1)
    exercise: str = Field(..., min_length=1)


class Source(_StrictBase):
    """Verifiable public source returned by the search tool."""

    id: str = Field(..., min_length=1, max_length=100)
    title: str = Field(..., min_length=1)
    url: str = Field(..., pattern=r"^https?://")
    excerpt: str = Field(..., min_length=1)


class Course(_StrictBase):
    """Full saved course response."""

    id: str = Field(..., min_length=1, max_length=100)
    title: str = Field(..., min_length=1)
    learner_group: LearnerGroup
    minutes_per_day: int = Field(..., ge=1, le=240)
    mode: ModeType
    source_mode: SourceModeType
    plan: list[PlanDay] = Field(..., min_length=5, max_length=5)
    lesson: Lesson
    sources: list[Source] = Field(..., min_length=1)

    @model_validator(mode="after")
    def _validate_cross_fields(self) -> "Course":
        if [item.day for item in self.plan] != [1, 2, 3, 4, 5]:
            raise ValueError("plan must contain days 1 to 5 in order.")
        if self.lesson.minutes > self.minutes_per_day:
            raise ValueError("lesson.minutes cannot exceed minutes_per_day.")
        source_ids = [src.id for src in self.sources]
        if len(set(source_ids)) != len(source_ids):
            raise ValueError("sources IDs must be unique within a course.")
        valid_ids = set(source_ids)
        for section in self.lesson.sections:
            if not set(section.source_ids) <= valid_ids:
                raise ValueError("All lesson section source_ids must exist in sources.")
        return self


class CourseSummary(_StrictBase):
    """Compact course entry for GET /api/courses."""

    id: str = Field(..., min_length=1, max_length=100)
    title: str = Field(..., min_length=1)


class ErrorDetail(_StrictBase):
    """Error payload inside ErrorEnvelope."""

    code: ErrorCode
    message: str = Field(..., min_length=1)
    field: Optional[ErrorField] = None


class ErrorEnvelope(_StrictBase):
    """Standardized API error wrapper."""

    error: ErrorDetail

