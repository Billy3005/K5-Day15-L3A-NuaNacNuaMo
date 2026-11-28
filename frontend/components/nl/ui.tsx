"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { AlertCircle, ExternalLink, RefreshCw, X } from "lucide-react";
import type { ModeType, Source, SourceModeType } from "../../types/course";
import { hostOf } from "../../lib/format";

export function PageTitle({ eyebrow, title, desc, actions }: { eyebrow: string; title: string; desc?: ReactNode; actions?: ReactNode }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16, flexWrap: "wrap" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 0 }}>
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="h1">{title}</h1>
        {desc && <p className="muted" style={{ margin: 0 }}>{desc}</p>}
      </div>
      {actions}
    </div>
  );
}

export function ProgressRing({ done, total, size = 56 }: { done: number; total: number; size?: number }) {
  const r = (size - 8) / 2;
  const c = 2 * Math.PI * r;
  const pct = total ? Math.min(1, done / total) : 0;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`Đã học ${done}/${total} ngày`} style={{ flex: "none" }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--surface2)" strokeWidth="6" />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={pct >= 1 ? "var(--ok)" : "var(--primary)"}
        strokeWidth="6"
        strokeLinecap="round"
        strokeDasharray={`${c * pct} ${c}`}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text x="50%" y="54%" textAnchor="middle" dominantBaseline="middle" fontSize={size / 4} fontWeight="700" fill="var(--text)">
        {done}/{total}
      </text>
    </svg>
  );
}

export function ModeBadges({ mode, sourceMode }: { mode: ModeType; sourceMode?: SourceModeType }) {
  return (
    <>
      {mode === "mock" ? (
        <span className="badge warn"><span className="dot" />Dữ liệu mẫu</span>
      ) : (
        <span className="badge pri"><span className="dot" />Bài soạn: model AI</span>
      )}
      {sourceMode && (
        <span className="badge cite"><span className="dot" />{sourceMode === "web" ? "Nguồn: tìm trên web" : "Nguồn mẫu"}</span>
      )}
    </>
  );
}

export function Skeleton({ h = 16, w = "100%", r = 8 }: { h?: number; w?: number | string; r?: number }) {
  return <div className="sk" style={{ height: h, width: w, borderRadius: r }} aria-hidden />;
}

export function LoadingCard({ lines = 3 }: { lines?: number }) {
  return (
    <div className="card" style={{ padding: 24, display: "flex", flexDirection: "column", gap: 12 }} aria-busy="true" aria-live="polite">
      <span className="sr-only">Đang tải…</span>
      <Skeleton h={22} w="40%" />
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton key={i} h={14} w={`${90 - i * 12}%`} />
      ))}
    </div>
  );
}

export function ErrorBlock({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="alert err" role="alert">
      <AlertCircle aria-hidden style={{ color: "var(--err)" }} />
      <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 0 }}>
        <strong>Có lỗi</strong>
        <span style={{ fontSize: 14, overflowWrap: "anywhere" }}>{message}</span>
        {onRetry && (
          <button type="button" className="btn btn-s btn-sm t" onClick={onRetry} style={{ alignSelf: "flex-start", marginTop: 4 }}>
            <RefreshCw aria-hidden />
            Thử lại
          </button>
        )}
      </div>
    </div>
  );
}

export function EmptyBlock({ title, desc, action }: { title: string; desc: string; action?: ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 10, padding: 24, border: "1px dashed var(--border-strong)", borderRadius: 14, background: "var(--surface)" }}>
      <strong style={{ fontSize: 17 }}>{title}</strong>
      <span className="muted" style={{ fontSize: 14 }}>{desc}</span>
      {action}
    </div>
  );
}

/** Đánh dấu cụm trong đoạn trích trùng với câu được dẫn (từ ≥ 5 ký tự), để người học thấy chỗ đối chiếu. */
function highlight(excerpt: string, claim?: string): ReactNode {
  if (!claim) return excerpt;
  const words = new Set(
    claim
      .toLowerCase()
      .split(/[^\p{L}\p{N}_*]+/u)
      .filter((w) => w.length >= 5)
  );
  if (!words.size) return excerpt;
  return excerpt.split(/(\s+)/).map((part, i) =>
    words.has(part.toLowerCase().replace(/[^\p{L}\p{N}_*]/gu, "")) ? <mark key={i}>{part}</mark> : part
  );
}

export function SourceCard({ source, active, claim, onClose }: { source: Source; active?: boolean; claim?: string; onClose?: () => void }) {
  return (
    <div
      className="card t"
      id={`src-${source.id}`}
      style={{ padding: 0, overflow: "hidden", boxShadow: active ? "var(--shadow)" : "none", borderColor: active ? "var(--cite-fg)" : "var(--border)" }}
    >
      <div style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "14px 16px", background: active ? "var(--cite-bg)" : "transparent" }}>
        <span className="badge cite" style={{ height: 22, padding: "0 7px", fontWeight: 700, flex: "none" }}>{source.id}</span>
        <div style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0, flex: 1 }}>
          <strong tabIndex={-1} data-src-title={source.id} style={{ fontSize: 14, lineHeight: 1.35, overflowWrap: "anywhere" }}>{source.title}</strong>
          <span className="hint">{hostOf(source.url)}</span>
        </div>
        {onClose && active && (
          <button type="button" className="icon-btn t" onClick={onClose} aria-label="Đóng đoạn đối chiếu (Esc)" style={{ width: 32, height: 32 }}>
            <X aria-hidden />
          </button>
        )}
      </div>
      {active && (
        <div style={{ padding: "0 16px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
          <span className="eyebrow" style={{ fontSize: 11 }}>Đoạn đối chiếu nguyên văn</span>
          <blockquote style={{ margin: 0, paddingLeft: 12, borderLeft: "3px solid var(--cite-border)", fontSize: 14, lineHeight: 1.6, overflowWrap: "anywhere" }}>
            {highlight(source.excerpt, claim)}
          </blockquote>
          <a className="btn btn-s btn-sm t" href={source.url} target="_blank" rel="noreferrer" style={{ alignSelf: "flex-start" }}>
            <ExternalLink aria-hidden />
            Mở trang gốc
          </a>
        </div>
      )}
    </div>
  );
}

/** Hộp đối chiếu nguồn dùng trong kiểm tra và video: mở khi bấm nhãn nguồn, Esc đóng và trả focus. */
export function SourceDialog({ source, claim, onClose }: { source: Source | null; claim?: string; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const opener = useRef<Element | null>(null);
  useEffect(() => {
    if (!source) return;
    opener.current = document.activeElement;
    ref.current?.querySelector<HTMLElement>("[data-src-title]")?.focus();
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      (opener.current as HTMLElement | null)?.focus?.();
    };
  }, [source, onClose]);
  if (!source) return null;
  return (
    <div role="dialog" aria-modal="true" aria-label={`Nguồn ${source.id}`} onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(11,16,32,.45)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div ref={ref} onClick={(e) => e.stopPropagation()} style={{ width: "min(520px,100%)" }}>
        <SourceCard source={source} active claim={claim} onClose={onClose} />
      </div>
    </div>
  );
}

export function CiteChip({ id, title, on, onClick }: { id: string; title?: string; on?: boolean; onClick: () => void }) {
  return (
    <button type="button" className={`cite t ${on ? "on" : ""}`} onClick={onClick} aria-label={`Nguồn ${id}${title ? `: ${title}` : ""}`} aria-expanded={on}>
      {id}
    </button>
  );
}
