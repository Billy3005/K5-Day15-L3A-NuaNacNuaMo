import { CourseList } from "../../components/features/courses/CourseList";

export default function CoursesPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-[28px] font-semibold leading-tight md:text-[32px]">Khóa đã lưu</h1>
      <CourseList />
    </main>
  );
}
