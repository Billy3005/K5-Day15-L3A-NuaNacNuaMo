import type {
  Course,
  CourseSummary,
  CreateCourseRequest,
  ErrorEnvelope,
} from "../types/course";
import type {
  Answer,
  Attempt,
  AttemptSummary,
  CheckResult,
  Overview,
  Progress,
  Quiz,
  Scene,
  Video,
} from "../types/learning";

/**
 * 1. Có NEXT_PUBLIC_API_URL thì dùng.
 * 2. Bản build: gọi cùng origin, vì backend phục vụ luôn giao diện.
 * 3. `npm run dev` (cổng nào cũng vậy): gọi backend ở cổng 8000.
 */
function resolveApiBaseUrl(): string {
  // Phải viết đủ `process.env.X` để Next thay giá trị vào lúc build.
  const configured = process.env.NEXT_PUBLIC_API_URL;
  if (configured) {
    return configured.replace(/\/+$/, "");
  }
  return process.env.NODE_ENV === "production" ? "" : "http://127.0.0.1:8000";
}

export class ApiClientError extends Error {
  readonly status: number;
  readonly detail: ErrorEnvelope["error"];

  constructor(status: number, envelope: ErrorEnvelope) {
    super(envelope.error.message);
    this.status = status;
    this.detail = envelope.error;
  }
}

function networkUnavailableError(): ApiClientError {
  return new ApiClientError(503, {
    error: {
      code: "UPSTREAM_UNAVAILABLE",
      message: "Chưa tạo được lộ trình. Bạn có thể thử lại.",
    },
  });
}

async function safeFetch(url: string, init?: RequestInit): Promise<Response> {
  try {
    return await fetch(url, init);
  } catch {
    throw networkUnavailableError();
  }
}

async function parseError(response: Response): Promise<ApiClientError> {
  try {
    const body = (await response.json()) as ErrorEnvelope;
    if (body?.error?.code && body?.error?.message) {
      return new ApiClientError(response.status, body);
    }
  } catch {
    // Fall through to generic network/unavailable error
  }
  return new ApiClientError(response.status, {
    error: {
      code: "UPSTREAM_UNAVAILABLE",
      message: "Chưa tạo được lộ trình. Bạn có thể thử lại.",
    },
  });
}

export async function createCourse(
  payload: CreateCourseRequest,
  options?: { fixture?: boolean }
): Promise<Course> {
  const query =
    options?.fixture === true
      ? "?fixture=1"
      : options?.fixture === false
        ? "?fixture=0"
        : "";
  const response = await safeFetch(`${resolveApiBaseUrl()}/api/courses${query}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw await parseError(response);
  }
  return (await response.json()) as Course;
}

export async function listCourses(): Promise<CourseSummary[]> {
  const response = await safeFetch(`${resolveApiBaseUrl()}/api/courses`, {
    cache: "no-store",
  });
  if (!response.ok) {
    throw await parseError(response);
  }
  return (await response.json()) as CourseSummary[];
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await safeFetch(`${resolveApiBaseUrl()}${path}`, {
    cache: "no-store",
    ...init,
    headers: init?.body ? { "Content-Type": "application/json", ...init?.headers } : init?.headers,
  });
  if (!response.ok) {
    throw await parseError(response);
  }
  return (await response.json()) as T;
}

const enc = encodeURIComponent;

export const learningApi = {
  overview: () => request<Overview>("/api/overview"),
  progress: (courseId: string) => request<Progress>(`/api/courses/${enc(courseId)}/progress`),
  setDay: (courseId: string, day: number, done: boolean) =>
    request<Progress>(`/api/courses/${enc(courseId)}/progress/${day}`, {
      method: "PUT",
      body: JSON.stringify({ done }),
    }),
  createQuiz: (courseId: string) => request<Quiz>(`/api/courses/${enc(courseId)}/quizzes`, { method: "POST" }),
  checkAnswer: (quizId: string, index: number, answer: Answer) =>
    request<CheckResult>(`/api/quizzes/${enc(quizId)}/check`, {
      method: "POST",
      body: JSON.stringify({ index, answer }),
    }),
  /** submissionId: tạo một lần cho mỗi lượt làm, nộp lại cùng mã không tạo thêm dòng lịch sử. */
  submitAttempt: (quizId: string, answers: Answer[], durationS: number, submissionId: string) =>
    request<Attempt>(`/api/quizzes/${enc(quizId)}/attempts`, {
      method: "POST",
      body: JSON.stringify({ answers, duration_s: durationS, submission_id: submissionId }),
    }),
  video: (videoId: string) => request<Video>(`/api/videos/${enc(videoId)}`),
  attempts: (courseId?: string) =>
    request<AttemptSummary[]>(`/api/quiz-attempts${courseId ? `?course_id=${enc(courseId)}` : ""}`),
  attempt: (attemptId: string) => request<Attempt>(`/api/quiz-attempts/${enc(attemptId)}`),
  videos: (courseId?: string) => request<Video[]>(`/api/videos${courseId ? `?course_id=${enc(courseId)}` : ""}`),
  createVideo: (courseId: string) => request<Video>(`/api/courses/${enc(courseId)}/videos`, { method: "POST" }),
  updateVideo: (videoId: string, scenes: Scene[]) =>
    request<Video>(`/api/videos/${enc(videoId)}`, { method: "PUT", body: JSON.stringify({ scenes }) }),
  renderVideo: (videoId: string) => request<Video>(`/api/videos/${enc(videoId)}/render`, { method: "POST" }),
};

export async function getCourse(courseId: string): Promise<Course> {
  const response = await safeFetch(
    `${resolveApiBaseUrl()}/api/courses/${encodeURIComponent(courseId)}`,
    { cache: "no-store" }
  );
  if (!response.ok) {
    throw await parseError(response);
  }
  return (await response.json()) as Course;
}

