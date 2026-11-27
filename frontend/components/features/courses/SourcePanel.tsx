"use client";

import { useEffect, useId, useRef } from "react";
import type { Source } from "../../../types/course";
import { Button } from "../../ui/Button";

interface SourcePanelProps {
  sourceId: string;
  /** undefined khi mã được trích không có trong sources[] */
  source: Source | undefined;
  /** Tăng mỗi lần người dùng bấm mở, để bấm lại cùng mã vẫn đưa focus về tiêu đề. */
  request: number;
  onClose: () => void;
}

/** Đoạn đối chiếu của một nguồn, hiện ngay cạnh chỗ được trích. */
export function SourcePanel({ sourceId, source, request, onClose }: SourcePanelProps) {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const titleId = useId();

  useEffect(() => {
    titleRef.current?.focus();
  }, [request]);

  return (
    <section aria-labelledby={titleId} className="mt-3 rounded-lg border border-action bg-page p-4">
      <h4 id={titleId} ref={titleRef} tabIndex={-1} className="font-semibold leading-snug">
        {source ? `[${source.id}] ${source.title}` : `Không tìm thấy nguồn này (${sourceId})`}
      </h4>
      {source && (
        <>
          <p className="mt-2 text-[15px] text-muted">Đoạn đối chiếu</p>
          <blockquote className="whitespace-pre-line border-l-4 border-line pl-3">{source.excerpt}</blockquote>
          <p className="mt-2 break-all text-[15px] text-muted">{source.url}</p>
        </>
      )}
      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2">
        {source && (
          <a
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center font-semibold text-action underline underline-offset-4"
          >
            Mở nguồn (mở trang gốc ở tab mới)
          </a>
        )}
        <Button variant="secondary" onClick={onClose}>
          Đóng
        </Button>
      </div>
    </section>
  );
}
