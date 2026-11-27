import { CourseForm } from "../components/features/courses/CourseForm";

const STEPS = [
  { title: "Kể mục tiêu", text: "Muốn học gì, đang biết đến đâu." },
  { title: "Nhận lộ trình", text: "5 ngày, mỗi ngày một mục tiêu nhỏ." },
  { title: "Học có nguồn", text: "Bấm mã nguồn để xem đoạn gốc." },
];

/** Khung minh họa một câu trong bài có trích nguồn. Chỉ để giới thiệu, không phải dữ liệu thật. */
function CitationPreview() {
  return (
    <figure aria-label="Minh họa một đoạn bài học có trích nguồn" className="mt-10 max-w-[460px]">
      <div className="rounded-2xl border border-line-soft bg-paper p-5 shadow-card">
        <p className="text-[12px] font-semibold uppercase tracking-wider text-action">Bài 1 · Đọc và lọc một bảng</p>
        <p className="mt-2 text-[16px] leading-relaxed">
          <code className="rounded bg-page px-1 font-mono text-[14px]">WHERE</code> chỉ giữ lại những dòng thỏa điều
          kiện bạn đặt ra.{" "}
          <span className="inline-flex items-center rounded-md bg-action px-1.5 text-[12px] font-semibold leading-5 text-white">
            S1
          </span>
        </p>
        <div className="mt-3 rounded-xl bg-action-soft/70 px-4 py-3">
          <p className="text-[12px] font-semibold text-action">
            Nguồn S1 <span className="font-normal text-muted">· postgresql.org</span>
          </p>
          <p className="mt-1 border-l-2 border-action/40 pl-3 text-[14px] italic leading-snug text-ink/80">
            “The WHERE clause contains a Boolean (truth value) expression…”
          </p>
        </div>
      </div>
      <figcaption className="mt-2 pl-1 text-[13px] text-faint">Minh họa. Phần giải thích trong bài có trích nguồn để bạn tự kiểm chứng.</figcaption>
    </figure>
  );
}

export default function HomePage() {
  return (
    <div className="relative overflow-hidden">
      {/* Nền chấm rất nhạt ở phần đầu trang */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(#c9d3e4_1px,transparent_1px)] [background-size:22px_22px] opacity-50 [mask-image:linear-gradient(to_bottom,black,transparent)]"
      />
      <main className="relative mx-auto grid max-w-7xl items-start gap-10 px-4 py-10 sm:px-6 md:py-14 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-14">
        <section className="lg:pt-4">
          <p className="inline-flex items-center gap-2 rounded-full border border-line-soft bg-paper px-3 py-1 text-[13px] font-semibold text-muted shadow-card">
            <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-action" />
            Tự học có người dẫn đường
          </p>
          <h1 className="mt-5 text-balance text-[36px] font-bold leading-[1.1] tracking-tight sm:text-[46px]">
            Hôm nay bạn muốn <span className="text-action">học gì?</span>
          </h1>
          <p className="mt-4 max-w-[44ch] text-pretty text-[18px] leading-relaxed text-muted">
            Kể mục tiêu và thời gian bạn có. Bạn nhận lộ trình 5 ngày và bài đầu tiên. Phần giải thích trong bài có trích nguồn để bạn tự kiểm chứng.
          </p>

          <ol className="mt-8 grid gap-4 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
            {STEPS.map((step, index) => (
              <li key={step.title}>
                <p className="text-[13px] font-bold text-action">0{index + 1}</p>
                <p className="mt-0.5 font-semibold leading-snug">{step.title}</p>
                <p className="mt-0.5 text-[15px] leading-snug text-muted">{step.text}</p>
              </li>
            ))}
          </ol>

          <div className="hidden lg:block">
            <CitationPreview />
          </div>
        </section>

        <section
          aria-labelledby="tao-lo-trinh"
          className="rounded-2xl border border-line-soft bg-paper shadow-[0_1px_2px_rgb(23_35_52/0.04),0_12px_40px_rgb(23_35_52/0.08)]"
        >
          <CourseForm headingId="tao-lo-trinh" />
        </section>
      </main>
    </div>
  );
}
