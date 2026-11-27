import { CourseForm } from "../components/features/courses/CourseForm";
import { Card } from "../components/ui/Card";

export default function HomePage() {
  return (
    <main className="mx-auto max-w-[560px] px-4 py-8">
      <h1 className="text-[28px] font-semibold leading-tight md:text-[32px]">Hôm nay bạn muốn học gì?</h1>
      <p className="mt-2 text-muted">
        Cho biết mục tiêu, trình độ và thời gian mỗi ngày. Bạn sẽ nhận lộ trình 5 ngày kèm bài đầu tiên có trích dẫn.
      </p>
      <Card className="mt-6">
        <CourseForm />
      </Card>
    </main>
  );
}
