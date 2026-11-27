"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getCourse } from "../../../lib/api-client";
import { SAMPLE_COURSE, SAMPLE_ROUTE_ID } from "../../../lib/fixtures";
import type { Course } from "../../../types/course";
import { Button } from "../../ui/Button";
import { CourseDetail } from "./CourseDetail";
import { StatusMessage } from "./StatusMessage";

type Result = { key: string } & ({ status: "ready"; course: Course } | { status: "error" });

/** Đọc ?id= trên URL rồi lấy khóa từ API. */
export function CourseView() {
  const id = useSearchParams().get("id") ?? "";
  const isSample = id === SAMPLE_ROUTE_ID;
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<Result | null>(null);
  // Mỗi cặp (id, lần thử) có một khóa; kết quả khác khóa nghĩa là đang tải.
  const key = `${id}#${attempt}`;

  useEffect(() => {
    if (isSample) return;
    let ignore = false;
    getCourse(id).then(
      (course) => {
        if (!ignore) setResult({ key, status: "ready", course });
      },
      () => {
        if (!ignore) setResult({ key, status: "error" });
      },
    );
    return () => {
      ignore = true;
    };
  }, [id, isSample, key]);

  if (isSample) return <CourseDetail course={SAMPLE_COURSE} />;

  const current = result?.key === key ? result : null;
  if (current?.status === "ready") return <CourseDetail key={current.course.id} course={current.course} />;

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <div aria-live="polite">
        {current ? (
          <StatusMessage
            tone="error"
            action={<Button onClick={() => setAttempt((value) => value + 1)}>Thử lại</Button>}
          >
            Chưa mở được khóa này lúc này. Bạn thử lại nhé.
          </StatusMessage>
        ) : (
          <p>Đang mở khóa…</p>
        )}
      </div>
    </main>
  );
}
