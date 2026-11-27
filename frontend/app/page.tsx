/**
 * LONG-01 & LONG-02: Trang tạo lộ trình 5 ngày.
 * Server Component mặc định; form tương tác đặt trong components/features/courses/ với 'use client'.
 */
export default function HomePage() {
  return (
    <main className="mx-auto max-w-[560px] px-4 py-8">
      <h1 className="text-[28px] font-semibold leading-tight">Lộ trình tự học</h1>
      <p className="mt-2 text-base text-[#172334]/80">
        Nhập mục tiêu, trình độ và thời lượng mỗi ngày để nhận lộ trình 5 ngày kèm bài 1 có trích dẫn.
      </p>
    </main>
  );
}

