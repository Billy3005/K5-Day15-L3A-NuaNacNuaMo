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
    <div aria-live="polite" className="mt-6">
      {!current && <p>Đang tải danh sách…</p>}

      {current?.status === "error" && (
        <StatusMessage tone="error" action={<Button onClick={() => setAttempt((value) => value + 1)}>Thử lại</Button>}>
          Chưa tải được danh sách khóa lúc này. Bạn thử lại nhé.
        </StatusMessage>
      )}

      {current?.status === "ready" && current.courses.length === 0 && (
        <StatusMessage action={createLink}>Bạn chưa có khóa nào. Tạo lộ trình đầu tiên nhé.</StatusMessage>
      )}

      {current?.status === "ready" && current.courses.length > 0 && (
        <>
          <ul className="space-y-3">
            {current.courses.map((course) => (
              <li
                key={course.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-line bg-paper p-4"
              >
                <span className="min-w-0 break-words font-semibold">{course.title}</span>
                <Link
                  href={`/courses/view?id=${encodeURIComponent(course.id)}`}
                  aria-label={`Mở khóa ${course.title}`}
                  className={buttonClass("secondary")}
                >
                  Mở khóa
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-6">{createLink}</div>
        </>
      )}
    </div>
  );
}
