import type { Course } from "../../../types/course";
import { Badge } from "../../ui/Badge";
import { CoursePlan } from "./CoursePlan";
import { LessonView } from "./LessonView";

/** Trang đọc của một khóa. Chỉ nhận dữ liệu qua props, không tự gọi API. */
export function CourseDetail({ course }: { course: Course }) {
  const isMock = course.mode === "mock" || course.source_mode === "mock";
  const openDay = course.lesson.day;

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="min-w-0 break-words text-[28px] font-semibold leading-tight md:text-[32px]">{course.title}</h1>
        {isMock && <Badge>Bản thử dữ liệu mẫu</Badge>}
      </div>
      <p className="mt-1">{course.minutes_per_day} phút/ngày</p>
      <p className="text-[15px] text-muted">
        Bài soạn: {course.mode === "mock" ? "dữ liệu mẫu" : "model AI"} · Nguồn:{" "}
        {course.source_mode === "mock" ? "dữ liệu mẫu" : "tìm trên web"}
      </p>

      <div className="mt-6 grid gap-6 md:grid-cols-[240px_minmax(0,1fr)]">
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
