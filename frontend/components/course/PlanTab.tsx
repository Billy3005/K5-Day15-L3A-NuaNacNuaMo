"use client";

import { Lock } from "lucide-react";
import type { Course } from "../../types/course";

export function PlanTab({ course, daysDone, onToggle, onOpenLesson }: { course: Course; daysDone: number[]; onToggle: (day: number, done: boolean) => void; onOpenLesson: () => void }) {
  const today = course.plan.find((d) => !daysDone.includes(d.day))?.day ?? null;
  return (
    <ol style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 12, maxWidth: 860 }}>
      {course.plan.map((d) => {
        const done = daysDone.includes(d.day);
        const isToday = d.day === today;
        const hasLesson = d.day === course.lesson.day;
        return (
          <li key={d.day} className="card" style={{ padding: "18px 20px", display: "flex", gap: 16, alignItems: "flex-start", boxShadow: isToday ? "var(--shadow)" : "none", borderColor: isToday ? "var(--primary)" : "var(--border)" }}>
            <input type="checkbox" className="chk" style={{ marginTop: 4 }} checked={done} onChange={(e) => onToggle(d.day, e.target.checked)} aria-label={`Đánh dấu đã học ngày ${d.day}: ${d.title}`} />
            <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                <span className="eyebrow">Ngày {d.day}</span>
                {done ? <span className="badge ok">Đã học</span> : isToday ? <span className="badge pri">Hôm nay</span> : <span className="badge">Sắp tới</span>}
              </div>
              <strong style={{ fontSize: 17, overflowWrap: "anywhere" }}>{d.title}</strong>
              <span className="muted" style={{ fontSize: 15 }}>{d.objective}</span>
            </div>
            {hasLesson ? (
              <button type="button" className="btn btn-s btn-sm t" onClick={onOpenLesson}>Mở bài</button>
            ) : (
              <span className="hint" style={{ display: "inline-flex", gap: 6, alignItems: "center", whiteSpace: "nowrap" }}>
                <Lock aria-hidden style={{ width: 14, height: 14 }} />
                Bài soạn sau
              </span>
            )}
          </li>
        );
      })}
    </ol>
  );
}
