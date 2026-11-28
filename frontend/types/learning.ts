/** Kiểu dữ liệu cho API NewLearn: tổng quan, tiến độ, kiểm tra nhanh, video (codebase/api/v1/endpoints/learning.py). */

import type { ModeType, SourceModeType } from "./course";

export interface Score {
  score: number;
  total: number;
}

export interface OverviewCourse {
  id: string;
  title: string;
  minutes_per_day: number;
  mode: ModeType;
  source_mode: SourceModeType;
  created_at: string;
  days_total: number;
  days_done: number[];
  last_score: Score | null;
  has_video: boolean;
  first_day_title: string;
}

export type ActivityKind = "course" | "day_done" | "quiz" | "video";

export interface Activity {
  kind: ActivityKind;
  at: string;
  course_id: string;
  title: string;
  day?: number;
  score?: number;
  total?: number;
  attempt_id?: string;
  video_id?: string;
}

export interface Overview {
  stats: {
    streak_days: number;
    minutes_week: number;
    course_count: number;
    last_score: Score | null;
    video_count: number;
  };
  courses: OverviewCourse[];
  activity: Activity[];
}

export interface Progress {
  course_id: string;
  days_done: number[];
}

export type QuestionType = "mcq" | "tf" | "fill" | "short";
export type Verdict = "dat" | "gan_dung" | "chua_dat";

export interface Question {
  type: QuestionType;
  prompt: string;
  options: string[];
  answer_index: number | null;
  answer_text: string | null;
  explanation: string;
  source_id: string;
}

/** Câu hỏi lúc đang làm bài: server chưa gửi đáp án và giải thích. */
export type PublicQuestion = Pick<Question, "type" | "prompt" | "options" | "source_id">;

export interface Quiz {
  id: string;
  course_id: string;
  day: number;
  mode: ModeType;
  questions: PublicQuestion[];
  created_at: string;
}

/** Kết quả kiểm tra một câu: server chấm rồi mới trả đáp án và giải thích. */
export interface CheckResult {
  index: number;
  verdict: Verdict;
  feedback: string;
  answer_index: number | null;
  answer_text: string | null;
  explanation: string;
}

export type Answer = number | string | null;

export interface AttemptSummary {
  id: string;
  quiz_id: string;
  course_id: string;
  course_title: string;
  day: number;
  score: number;
  total: number;
  duration_s: number;
  created_at: string;
}

export interface Attempt extends AttemptSummary {
  answers: Answer[];
  results: { verdict: Verdict; correct: boolean }[];
  questions: Question[];
  mode: ModeType;
}

export type SceneKind = "Mở đầu" | "Khái niệm" | "Ví dụ" | "Bài tập" | "Kết";

export interface Scene {
  kind: SceneKind;
  headline: string;
  big: string | null;
  narration: string;
  visual: string;
  source_id: string;
  dur: number;
}

export interface Video {
  id: string;
  course_id: string;
  course_title: string;
  day: number;
  mode: ModeType;
  status: "draft" | "ready";
  scenes: Scene[];
  duration_s: number;
  created_at: string;
  updated_at: string;
}
