/**
 * LONG-03 & LONG-04: Chi tiết lộ trình 5 ngày, bài 1 và đối chiếu nguồn (GET /api/courses/{id}).
 */
export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-[28px] font-semibold">Khóa học: {id}</h1>
    </main>
  );
}

