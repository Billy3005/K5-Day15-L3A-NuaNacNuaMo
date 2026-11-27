"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ApiClientError, getCourse } from "../../../lib/api-client";
import { SAMPLE_COURSE, SAMPLE_ROUTE_ID } from "../../../lib/fixtures";
import type { Course } from "../../../types/course";
import { Button, buttonClass } from "../../ui/Button";
import { CourseDetail } from "./CourseDetail";
import { StatusMessage } from "./StatusMessage";

type Result = { key: string } & ({ status: "ready"; course: Course } | { status: "missing" } | { status: "error" });

/** 404, hoặc ID mà backend coi là không hợp lệ (quá 100 ký tự): đều là không có khóa này. */
function isMissing(error: unknown) {
  return error instanceof ApiClientError && ["NOT_FOUND", "INVALID_INPUT"].includes(error.detail.code);
}

const backToList = (
  <Link href="/courses" className={buttonClass("secondary")}>
    Về danh sách
  </Link>
);

/** Đọc ?id= trên URL rồi lấy khóa từ API. */
export function CourseView() {
  const router = useRouter();
  const id = useSearchParams().get("id") ?? "";
  const isSample = id === SAMPLE_ROUTE_ID;
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<Result | null>(null);
  // Mỗi cặp (id, lần thử) có một khóa; kết quả khác khóa nghĩa là đang tải.
  const key = `${id}#${attempt}`;

  // Không có id thì đưa về danh sách.
  useEffect(() => {
    if (!id) router.replace("/courses");
  }, [id, router]);

  useEffect(() => {
    if (!id || isSample) return;
    let ignore = false;
    getCourse(id).then(
      (course) => {
        if (!ignore) setResult({ key, status: "ready", course });
      },
      (error: unknown) => {
        if (!ignore) setResult({ key, status: isMissing(error) ? "missing" : "error" });
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
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <div aria-live="polite">
        {!current && <p className="text-muted">Đang mở khóa…</p>}
        {current?.status === "missing" && (
          <StatusMessage action={backToList}>Không tìm thấy khóa này. Có thể đường dẫn đã cũ.</StatusMessage>
        )}
        {current?.status === "error" && (
          <StatusMessage
            tone="error"
            action={
              <div className="flex flex-wrap gap-3">
                <Button onClick={() => setAttempt((value) => value + 1)}>Thử lại</Button>
                {backToList}
              </div>
            }
          >
            Chưa mở được khóa lúc này. Bạn thử lại nhé.
          </StatusMessage>
        )}
      </div>
    </main>
  );
}
