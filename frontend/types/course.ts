/** TypeScript types matching docs/openapi.json */

export type LearnerGroup =
  | "middle_school"
  | "high_school"
  | "university"
  | "working_adult";

export type ModeType = "mock" | "model";
export type SourceModeType = "mock" | "web";

export type ErrorCode =
  | "INVALID_INPUT"
  | "CLARIFICATION_REQUIRED"
  | "INSUFFICIENT_SOURCES"
  | "OUT_OF_SCOPE"
  | "REFUSED"
  | "NOT_FOUND"
  | "UPSTREAM_UNAVAILABLE";

export type ErrorField =
  | "learner_group"
  | "topic"
  | "goal"
  | "level"
  | "minutes_per_day";

export interface CreateCourseRequest {
  learner_group: LearnerGroup;
  topic: string;
  goal: string;
  level: string;
  minutes_per_day: number;
}

export interface PlanDay {
  day: number;
  title: string;
  objective: string;
}

export interface LessonSection {
  text: string;
  source_ids: string[];
}

export interface Lesson {
  day: 1;
  title: string;
  minutes: number;
  sections: LessonSection[];
  example: string;
  exercise: string;
}

export interface Source {
  id: string;
  title: string;
  url: string;
  excerpt: string;
}

export interface Course {
  id: string;
  title: string;
  learner_group: LearnerGroup;
  minutes_per_day: number;
  mode: ModeType;
  source_mode: SourceModeType;
  plan: PlanDay[];
  lesson: Lesson;
  sources: Source[];
}

export interface CourseSummary {
  id: string;
  title: string;
}

export interface ErrorDetail {
  code: ErrorCode;
  message: string;
  field?: ErrorField;
}

export interface ErrorEnvelope {
  error: ErrorDetail;
}

