import type {
  Course,
  CourseSummary,
  CreateCourseRequest,
  ErrorEnvelope,
} from "../types/course";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") ??
  "http://127.0.0.1:8000";

export class ApiClientError extends Error {
  readonly status: number;
  readonly detail: ErrorEnvelope["error"];

  constructor(status: number, envelope: ErrorEnvelope) {
    super(envelope.error.message);
    this.status = status;
    this.detail = envelope.error;
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
  const query = options?.fixture ? "?fixture=1" : "";
  const response = await fetch(`${API_BASE_URL}/api/courses${query}`, {
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
  const response = await fetch(`${API_BASE_URL}/api/courses`, {
    cache: "no-store",
  });
  if (!response.ok) {
    throw await parseError(response);
  }
  return (await response.json()) as CourseSummary[];
}

export async function getCourse(courseId: string): Promise<Course> {
  const response = await fetch(
    `${API_BASE_URL}/api/courses/${encodeURIComponent(courseId)}`,
    { cache: "no-store" }
  );
  if (!response.ok) {
    throw await parseError(response);
  }
  return (await response.json()) as Course;
}

