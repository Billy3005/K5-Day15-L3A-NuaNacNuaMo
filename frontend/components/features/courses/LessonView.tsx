"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import type { Lesson, Source } from "../../../types/course";
import { Button } from "../../ui/Button";
import { SourcePanel } from "./SourcePanel";

interface OpenSource {
  sourceId: string;
  /** Chỗ bấm: "section-0", "section-1"… hoặc "list-S1". Khung nguồn hiện ngay tại đó. */
  anchor: string;
  request: number;
}

interface LessonViewProps {
  lesson: Lesson;
  objective: string | undefined;
  sources: Source[];
}

/** Bài học của ngày 1: mục tiêu, các đoạn giải thích có trích dẫn, ví dụ, bài tập và danh sách nguồn. */
export function LessonView({ lesson, objective, sources }: LessonViewProps) {
  const [open, setOpen] = useState<OpenSource | null>(null);
  // Nút vừa bấm, để trả focus về khi đóng khung nguồn.
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  const findSource = (id: string) => sources.find((source) => source.id === id);

  function openSource(sourceId: string, anchor: string, trigger: HTMLButtonElement) {
    if (!findSource(sourceId)) console.warn(`Mã nguồn "${sourceId}" không có trong danh sách nguồn.`);
    triggerRef.current = trigger;
    setOpen((previous) => ({ sourceId, anchor, request: (previous?.request ?? 0) + 1 }));
  }

  function closeSource() {
    setOpen(null);
    triggerRef.current?.focus();
  }

  function handleKeyDown(event: KeyboardEvent) {
    if (event.key === "Escape" && open) closeSource();
  }

  function panelAt(anchor: string) {
    if (open?.anchor !== anchor) return null;
    return (
      <SourcePanel
        sourceId={open.sourceId}
        source={findSource(open.sourceId)}
        request={open.request}
        onClose={closeSource}
      />
    );
  }

  return (
    <article
      onKeyDown={handleKeyDown}
      className="min-w-0 break-words rounded-2xl border border-line-soft bg-paper p-5 shadow-card sm:p-10"
    >
      <div className="max-w-[68ch]">
        <p className="text-[14px] font-semibold uppercase tracking-wider text-action">
          Bài {lesson.day} · khoảng {lesson.minutes} phút
        </p>
        <h2 className="mt-2 text-[28px] font-bold leading-tight tracking-tight sm:text-[32px]">{lesson.title}</h2>

        {objective && (
          <div className="mt-6 rounded-xl bg-page px-5 py-4">
            <h3 className="text-[14px] font-semibold uppercase tracking-wider text-muted">Sau bài này bạn sẽ</h3>
            <p className="mt-1 text-[17px] leading-relaxed">{objective}</p>
          </div>
        )}

        <h3 className="mt-10 text-[21px] font-bold tracking-tight">Nội dung</h3>
        <div className="mt-2 space-y-6">
          {lesson.sections.map((section, index) => {
            const anchor = `section-${index}`;
            return (
              <div key={anchor}>
                <p className="whitespace-pre-line text-[18px] leading-[1.75]">
                  {section.text}{" "}
                  {section.source_ids.map((id) => {
                    const expanded = open?.anchor === anchor && open.sourceId === id;
                    return (
                      <button
                        key={id}
                        type="button"
                        aria-label={`Xem nguồn ${id}`}
                        aria-expanded={expanded}
                        onClick={(event) => openSource(id, anchor, event.currentTarget)}
                        className={
                          "mx-0.5 inline-flex min-h-8 min-w-9 items-center justify-center rounded-md border px-1.5 align-baseline text-[14px] font-semibold leading-none transition-colors " +
                          (expanded
                            ? "border-action bg-action text-white"
                            : "border-action/30 bg-action-soft text-action hover:border-action")
                        }
                      >
                        {id}
                      </button>
                    );
                  })}
                </p>
                {panelAt(anchor)}
              </div>
            );
          })}
        </div>

        <h3 className="mt-10 text-[21px] font-bold tracking-tight">Ví dụ</h3>
        <pre className="mt-3 overflow-x-auto rounded-xl bg-code p-4 font-mono text-[15px] leading-relaxed text-[#e6edf7] sm:p-5">
          <code className="whitespace-pre-wrap break-words">{lesson.example}</code>
        </pre>

        <section className="mt-10 rounded-xl border-l-4 border-action bg-action-soft/50 px-5 py-4">
          <h3 className="text-[19px] font-bold tracking-tight">Bài tập nhỏ</h3>
          <p className="mt-1 whitespace-pre-line leading-relaxed">{lesson.exercise}</p>
        </section>

        <section className="mt-12 border-t border-line-soft pt-6">
          <h3 className="text-[19px] font-bold tracking-tight">Nguồn của bài</h3>
          <p className="mt-1 text-[15px] text-muted">Bấm vào mã nguồn trong bài hoặc ở đây để xem đoạn đối chiếu.</p>
          <ul className="mt-4 space-y-3">
            {sources.map((source) => {
              const anchor = `list-${source.id}`;
              return (
                <li key={source.id} className="rounded-xl border border-line-soft p-4">
                  <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
                    <p className="min-w-0 font-semibold leading-snug">
                      <span className="mr-2 inline-flex min-w-9 justify-center rounded-md bg-action-soft px-1.5 text-[14px] text-action">
                        {source.id}
                      </span>
                      {source.title}
                    </p>
                    <Button
                      variant="text"
                      aria-label={`Xem đoạn đối chiếu của nguồn ${source.id}`}
                      aria-expanded={open?.anchor === anchor}
                      onClick={(event) => openSource(source.id, anchor, event.currentTarget)}
                      className="min-h-9 px-0 text-[15px]"
                    >
                      Xem đoạn đối chiếu
                    </Button>
                  </div>
                  {panelAt(anchor)}
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    </article>
  );
}
