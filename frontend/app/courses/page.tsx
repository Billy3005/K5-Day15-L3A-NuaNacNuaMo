import Link from "next/link";
import { CourseList } from "../../components/features/courses/CourseList";
import { buttonClass } from "../../components/ui/Button";

export default function CoursesPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 md:py-14">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[32px] font-bold leading-tight tracking-tight md:text-[38px]">Khóa đã lưu</h1>
          <p className="mt-1 text-muted">Mở lại lộ trình bạn đã tạo, mới nhất ở trên cùng.</p>
        </div>
        <Link href="/" className={buttonClass("primary")}>
          Tạo lộ trình mới
        </Link>
      </div>
      <CourseList />
    </main>
  );
}
