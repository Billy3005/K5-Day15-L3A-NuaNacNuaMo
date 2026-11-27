"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { listCourses } from "../../../lib/api-client";
import type { CourseSummary } from "../../../types/course";
import { Button, buttonClass } from "../../ui/Button";
import { StatusMessage } from "./StatusMessage";

type Result = { attempt: number } & ({ status: "ready"; courses: CourseSummary[] } | { status: "error" });

const createLink = (
  <Link href="/" className={buttonClass("primary")}>
    Tạo lộ trình
  </Link>
);

/** Danh sách khóa đã lưu, giữ đúng thứ tự server trả về (mới nhất trước). */
export function CourseList() {
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<Result | null>(null);

  useEffect(() => {
    let ignore = false;
    listCourses().then(
      (courses) => {
        if (!ignore) setResult({ attempt, status: "ready", courses });
      },
      () => {
        if (!ignore) setResult({ attempt, status: "error" });
      },
    );
    return () => {
      ignore = true;
    };
  }, [attempt]);

  const current = result?.attempt === attempt ? result : null;

  return (
    <div aria-live="polite" className="mt-8">
      {!current && (
        <ul aria-hidden="true" className="grid gap-4 sm:grid-cols-2">
          {[0, 1].map((item) => (
            <li key={item} className="h-28 animate-pulse rounded-2xl border border-line-soft bg-paper" />
          ))}
        </ul>
      )}
      {!current && <p className="sr-only">Đang tải danh sách…</p>}

      {current?.status === "error" && (
        <StatusMessage tone="error" action={<Button onClick={() => setAttempt((value) => value + 1)}>Thử lại</Button>}>
          Chưa tải được danh sách khóa lúc này. Bạn thử lại nhé.
        </StatusMessage>
      )}

      {current?.status === "ready" && current.courses.length === 0 && (
        <div className="rounded-2xl border border-dashed border-line bg-paper px-6 py-14 text-center">
          <p className="text-[20px] font-semibold">Bạn chưa có khóa nào</p>
          <p className="mt-1 text-muted">Tạo lộ trình đầu tiên, khóa sẽ được lưu ở đây để bạn mở lại.</p>
          <div className="mt-6">{createLink}</div>
        </div>
      )}

      {current?.status === "ready" && current.courses.length > 0 && (
        <ul className="grid gap-4 sm:grid-cols-2">
          {current.courses.map((course) => (
            <li key={course.id}>
              <Link
                href={`/courses/view?id=${encodeURIComponent(course.id)}`}
                className="group flex h-full flex-col justify-between gap-6 rounded-2xl border border-line-soft bg-paper p-5 shadow-card transition-colors hover:border-action/40"
              >
                <span className="min-w-0 break-words text-[19px] font-semibold leading-snug">{course.title}</span>
                <span className="inline-flex items-center gap-1.5 text-[15px] font-semibold text-action">
                  Mở khóa
                  <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">
                    →
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
