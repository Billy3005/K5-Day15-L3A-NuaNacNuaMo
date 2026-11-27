import type { Lesson } from "../../../types/course";

/** Bài học của ngày 1: mục tiêu, các đoạn giải thích, ví dụ và bài tập. */
export function LessonView({ lesson, objective }: { lesson: Lesson; objective: string | undefined }) {
  return (
    <article className="min-w-0 break-words rounded-lg border border-line bg-paper p-4 sm:p-8">
      <div className="max-w-[70ch]">
        <h2 className="text-2xl font-semibold leading-snug">
          Bài {lesson.day} · {lesson.title}
        </h2>
        <p className="text-[15px] text-muted">Khoảng {lesson.minutes} phút</p>

        {objective && (
          <>
            <h3 className="mt-6 font-semibold">Mục tiêu bài</h3>
            <p>{objective}</p>
          </>
        )}

        <h3 className="mt-6 font-semibold">Nội dung</h3>
        {lesson.sections.map((section, index) => (
          <p key={index} className="mt-3 whitespace-pre-line">
            {section.text}
          </p>
        ))}

        <h3 className="mt-6 font-semibold">Ví dụ</h3>
        <pre className="mt-2 whitespace-pre-wrap break-words rounded-lg border border-line bg-page p-3 text-[15px]">
          <code>{lesson.example}</code>
        </pre>

        <h3 className="mt-6 font-semibold">Bài tập nhỏ</h3>
        <p className="whitespace-pre-line">{lesson.exercise}</p>
      </div>
    </article>
  );
}
