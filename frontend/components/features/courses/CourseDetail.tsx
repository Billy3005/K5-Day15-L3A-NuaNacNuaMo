import Link from "next/link";
import type { Course } from "../../../types/course";
import { Badge } from "../../ui/Badge";
import { CoursePlan } from "./CoursePlan";
import { LessonView } from "./LessonView";

/** Trang đọc của một khóa. Chỉ nhận dữ liệu qua props, không tự gọi API. */
export function CourseDetail({ course }: { course: Course }) {
  const isMock = course.mode === "mock" || course.source_mode === "mock";
  const openDay = course.lesson.day;

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 md:py-12">
      <nav aria-label="Vị trí" className="text-[15px] text-muted">
        <Link href="/courses" className="-my-2.5 inline-flex min-h-11 items-center rounded hover:text-action hover:underline underline-offset-4">
          Khóa đã lưu
        </Link>
        <span aria-hidden="true" className="mx-2 text-faint">
          /
        </span>
        <span className="text-ink">Lộ trình</span>
      </nav>

      <header className="mt-4 border-b border-line-soft pb-6">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="min-w-0 break-words text-[30px] font-bold leading-tight tracking-tight md:text-[36px]">
            {course.title}
          </h1>
          {isMock && <Badge>Bản thử dữ liệu mẫu</Badge>}
        </div>
        <ul className="mt-4 flex flex-wrap gap-2 text-[15px]">
          <li>
            <Badge tone="neutral">{course.minutes_per_day} phút/ngày</Badge>
          </li>
          <li>
            <Badge tone="neutral">{course.plan.length} ngày</Badge>
          </li>
          <li>
            <Badge tone="neutral">Bài soạn: {course.mode === "mock" ? "dữ liệu mẫu" : "model AI"}</Badge>
          </li>
          <li>
            <Badge tone="neutral">
              Nguồn: {course.source_mode === "mock" ? "dữ liệu mẫu" : "tìm trên web"} · {course.sources.length} nguồn
            </Badge>
          </li>
        </ul>
      </header>

      <div className="mt-8 grid gap-8 md:grid-cols-[260px_minmax(0,1fr)] lg:gap-12">
        <CoursePlan plan={course.plan} openDay={openDay} />
        <LessonView
          lesson={course.lesson}
          objective={course.plan.find((item) => item.day === openDay)?.objective}
          sources={course.sources}
        />
      </div>
    </main>
  );
}
