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

  let host = "";
  try {
    host = source ? new URL(source.url).hostname.replace(/^www\./, "") : "";
  } catch {
    host = "";
  }

  return (
    <section
      aria-labelledby={titleId}
      className="mt-4 rounded-xl border border-action/25 bg-action-soft/60 p-4 sm:p-5"
    >
      <p className="text-[13px] font-semibold uppercase tracking-wider text-action">
        Nguồn {sourceId}
        {host && <span className="font-normal normal-case tracking-normal text-muted"> · {host}</span>}
      </p>
      <h4 id={titleId} ref={titleRef} tabIndex={-1} className="mt-1 font-semibold leading-snug">
        {source ? source.title : `Không tìm thấy nguồn này (${sourceId})`}
      </h4>
      {source && (
        <>
          <p className="sr-only">Đoạn đối chiếu</p>
          <blockquote className="mt-3 whitespace-pre-line border-l-2 border-action/40 pl-4 text-[16px] italic leading-relaxed text-ink/90">
            {source.excerpt}
          </blockquote>
          <p className="mt-3 break-all text-[14px] text-muted">{source.url}</p>
        </>
      )}
      <div className="mt-4 flex flex-wrap items-center gap-3">
        {source && (
          <a
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center gap-1.5 rounded-lg bg-paper px-4 font-semibold text-action ring-1 ring-action/30 transition-colors hover:ring-action"
          >
            Mở trang gốc <span aria-hidden="true">↗</span>
            <span className="sr-only">(mở ở tab mới)</span>
          </a>
        )}
        <Button variant="text" onClick={onClose} className="px-2">
          Đóng
        </Button>
      </div>
    </section>
  );
}
