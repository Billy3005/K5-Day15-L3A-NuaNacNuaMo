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
    <article onKeyDown={handleKeyDown} className="min-w-0 break-words rounded-lg border border-line bg-paper p-4 sm:p-8">
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
        {lesson.sections.map((section, index) => {
          const anchor = `section-${index}`;
          return (
            <div key={anchor} className="mt-3">
              <p className="whitespace-pre-line">{section.text}</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="text-[15px] text-muted">Nguồn:</span>
                {section.source_ids.map((id) => (
                  <Button
                    key={id}
                    variant="secondary"
                    aria-label={`Xem nguồn ${id}`}
                    aria-expanded={open?.anchor === anchor && open.sourceId === id}
                    onClick={(event) => openSource(id, anchor, event.currentTarget)}
                    className="min-w-11 border-line px-3 text-[15px]"
                  >
                    [{id}]
                  </Button>
                ))}
              </div>
              {panelAt(anchor)}
            </div>
          );
        })}

        <h3 className="mt-6 font-semibold">Ví dụ</h3>
        <pre className="mt-2 whitespace-pre-wrap break-words rounded-lg border border-line bg-page p-3 text-[15px]">
          <code>{lesson.example}</code>
        </pre>

        <h3 className="mt-6 font-semibold">Bài tập nhỏ</h3>
        <p className="whitespace-pre-line">{lesson.exercise}</p>

        <h3 className="mt-8 border-t border-line pt-4 font-semibold">Nguồn của bài</h3>
        <ul className="mt-2 space-y-3">
          {sources.map((source) => {
            const anchor = `list-${source.id}`;
            return (
              <li key={source.id}>
                <p>
                  [{source.id}] {source.title}
                </p>
                <Button
                  variant="text"
                  aria-label={`Xem đoạn đối chiếu của nguồn ${source.id}`}
                  aria-expanded={open?.anchor === anchor}
                  onClick={(event) => openSource(source.id, anchor, event.currentTarget)}
                  className="px-0"
                >
                  Xem đoạn đối chiếu
                </Button>
                {panelAt(anchor)}
              </li>
            );
          })}
        </ul>
      </div>
    </article>
  );
}
