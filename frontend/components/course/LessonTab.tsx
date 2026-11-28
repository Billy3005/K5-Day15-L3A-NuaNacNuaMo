"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Circle, Copy, Info } from "lucide-react";
import type { Course } from "../../types/course";
import type { TabKey } from "../pages/CoursePage";
import { CiteChip, SourceCard } from "../nl/ui";

/** Tách dòng mô tả ("Ví dụ (giả sử …):") khỏi phần code để hiển thị khối code riêng. */
function splitExample(example: string): { intro: string | null; code: string } {
  const lines = example.split("\n");
  if (lines.length > 1 && lines[0].trim().endsWith(":")) return { intro: lines[0].trim(), code: lines.slice(1).join("\n").trim() };
  return { intro: null, code: example.trim() };
}

export function LessonTab({ course, daysDone, onToggle, go }: { course: Course; daysDone: number[]; onToggle: (day: number, done: boolean) => void; go: (tab: TabKey) => void }) {
  const [active, setActive] = useState<{ id: string; claim: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const lesson = course.lesson;
  const day1 = course.plan.find((d) => d.day === lesson.day);
  const done = daysDone.includes(lesson.day);
  const example = splitExample(lesson.example);
  const lessonTitle = lesson.title === course.title && day1 ? day1.title : lesson.title;

  const open = (id: string, claim: string) => {
    setActive((cur) => (cur?.id === id && cur.claim === claim ? null : { id, claim }));
    window.setTimeout(() => {
      const card = document.getElementById(`src-${id}`);
      card?.scrollIntoView({ block: "nearest", behavior: "smooth" });
      card?.querySelector<HTMLElement>("[data-src-title]")?.focus();
    }, 0);
  };

  useEffect(() => {
    if (!active) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      const id = active.id;
      setActive(null);
      document.querySelector<HTMLElement>(`[data-chip="${id}"]`)?.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(example.code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="lesson-grid">
      <nav className="lesson-toc" aria-label="Mục lục 5 ngày" style={{ display: "flex", flexDirection: "column", gap: 2, position: "sticky", top: 80 }}>
        <span className="eyebrow" style={{ padding: "0 12px 8px" }}>Lộ trình</span>
        {course.plan.map((d) => (
          <button key={d.day} type="button" className={`row-btn t ${d.day === lesson.day ? "on" : ""}`} disabled={d.day !== lesson.day} aria-current={d.day === lesson.day ? "true" : undefined} onClick={() => go("plan")} style={{ flexDirection: "column", alignItems: "flex-start", gap: 2 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--muted)" }}>
              Ngày {d.day} · {daysDone.includes(d.day) ? "Đã học" : d.day === lesson.day ? "Hôm nay" : "Sắp tới"}
            </span>
            <span style={{ fontSize: 14, fontWeight: 500, lineHeight: 1.35 }}>{d.title}</span>
          </button>
        ))}
      </nav>

      <article className="read" style={{ display: "flex", flexDirection: "column", gap: 22, minWidth: 0 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <span className="eyebrow">Ngày {lesson.day} · {lesson.minutes} phút</span>
          <h2 className="h1" style={{ fontSize: 28 }}>{lessonTitle}</h2>
        </div>
        {day1 && (
          <div className="alert info" style={{ fontSize: 15 }}>
            <Info aria-hidden style={{ color: "var(--primary)" }} />
            <div><strong>Mục tiêu bài:</strong> {day1.objective}</div>
          </div>
        )}
        {lesson.sections.map((sec, i) => (
          <p key={i}>
            {sec.text}
            {sec.source_ids.map((sid) => (
              <span key={sid} data-chip={sid} style={{ display: "contents" }}>
                <CiteChip id={sid} title={course.sources.find((s) => s.id === sid)?.title} on={active?.id === sid && active.claim === sec.text} onClick={() => open(sid, sec.text)} />
              </span>
            ))}
          </p>
        ))}
        <section style={{ display: "flex", flexDirection: "column", gap: 10 }} aria-labelledby="ex-h">
          <h3 className="h3" id="ex-h">Ví dụ</h3>
          {example.intro && <p className="muted" style={{ fontSize: 15 }}>{example.intro}</p>}
          <div style={{ position: "relative" }}>
            <pre className="code" style={{ paddingRight: 110 }}>{example.code}</pre>
            <button type="button" className="btn btn-sm t" onClick={copy} aria-live="polite" style={{ position: "absolute", top: 8, right: 8, background: "rgba(255,255,255,.08)", color: "#E2E8F0", border: "1px solid rgba(255,255,255,.16)" }}>
              <Copy aria-hidden />
              {copied ? "Đã chép" : "Sao chép"}
            </button>
          </div>
        </section>
        <section className="card" style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: 10, boxShadow: "none", background: "var(--surface2)" }} aria-labelledby="bt-h">
          <h3 className="h3" id="bt-h">Bài tập</h3>
          <p style={{ fontSize: 16, whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>{lesson.exercise}</p>
        </section>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", borderTop: "1px solid var(--border)", paddingTop: 20 }}>
          <button type="button" className={`btn ${done ? "btn-s" : "btn-p"} t`} onClick={() => onToggle(lesson.day, !done)}>
            {done ? <CheckCircle2 aria-hidden style={{ color: "var(--ok)" }} /> : <Circle aria-hidden />}
            {done ? "Đã học xong ngày 1" : "Đánh dấu đã học"}
          </button>
          <button type="button" className="btn btn-s t" onClick={() => go("quiz")}>Làm kiểm tra nhanh</button>
          <button type="button" className="btn btn-s t" onClick={() => go("video")}>Tạo video tóm tắt</button>
        </div>
      </article>

      <aside aria-labelledby="src-h" style={{ position: "sticky", top: 80, display: "flex", flexDirection: "column", gap: 12 }}>
        <h3 className="h3" id="src-h">
          Nguồn của bài <span className="muted" style={{ fontWeight: 500 }}>({course.sources.length})</span>
        </h3>
        {!active && (
          <p className="hint">
            Bấm nhãn như <span className="badge cite" style={{ height: 20, padding: "0 6px", fontSize: 11, fontWeight: 700 }}>{course.sources[0]?.id ?? "S1"}</span> trong bài để xem đoạn đối chiếu nguyên văn.
          </p>
        )}
        {course.sources.map((s) => (
          <SourceCard key={s.id} source={s} active={active?.id === s.id} claim={active?.id === s.id ? active.claim : undefined} onClose={() => setActive(null)} />
        ))}
      </aside>
    </div>
  );
}
