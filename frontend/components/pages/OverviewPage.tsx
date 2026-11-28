"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { ArrowRight } from "lucide-react";
import { learningApi } from "../../lib/api-client";
import { relativeTime } from "../../lib/format";
import type { Activity, Overview } from "../../types/learning";
import { ErrorBlock, LoadingCard, ProgressRing } from "../nl/ui";

const ACTIVITY_LABEL: Record<Activity["kind"], { label: string; cls: string }> = {
  course: { label: "Tạo khóa", cls: "pri" },
  day_done: { label: "Học xong", cls: "ok" },
  quiz: { label: "Kiểm tra", cls: "cite" },
  video: { label: "Video", cls: "" },
};

function activityText(a: Activity): string {
  if (a.kind === "course") return `Tạo lộ trình “${a.title}”`;
  if (a.kind === "day_done") return `Hoàn thành ngày ${a.day} · ${a.title}`;
  if (a.kind === "quiz") return `Kiểm tra nhanh ${a.score}/${a.total} · ${a.title}`;
  return `Dựng video tóm tắt · ${a.title}`;
}

function activityHref(a: Activity): string {
  if (a.kind === "quiz" && a.attempt_id) return `/history?id=${encodeURIComponent(a.attempt_id)}`;
  if (a.kind === "video") return `/courses/view?id=${encodeURIComponent(a.course_id)}&tab=video${a.video_id ? `&video=${encodeURIComponent(a.video_id)}` : ""}`;
  return `/courses/view?id=${encodeURIComponent(a.course_id)}`;
}

export function OverviewPage() {
  const router = useRouter();
  const [data, setData] = useState<Overview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [goal, setGoal] = useState("");

  const load = useCallback(() => {
    learningApi
      .overview()
      .then(setData)
      .catch((e: Error) => setError(e.message || "Chưa tải được số liệu."));
  }, []);
  useEffect(load, [load]);

  const quickSubmit = (event: FormEvent) => {
    event.preventDefault();
    router.push(`/create${goal.trim() ? `?goal=${encodeURIComponent(goal.trim())}` : ""}`);
  };

  const current = data?.courses.find((c) => c.days_done.length < c.days_total) ?? data?.courses[0];
  const pendingDay = current ? Array.from({ length: current.days_total }, (_, i) => i + 1).find((d) => !current.days_done.includes(d)) : undefined;
  const allDone = !!current && pendingDay === undefined;
  const nextDay = pendingDay ?? current?.days_total ?? 1;
  // Mỗi khóa mới có bài soạn sẵn cho ngày 1; các ngày sau học theo lộ trình.
  const LESSON_DAY = 1;
  const continueLink = !current
    ? null
    : allDone
      ? { href: `/courses/view?id=${encodeURIComponent(current.id)}&tab=plan`, label: "Xem lại lộ trình" }
      : nextDay === LESSON_DAY
        ? { href: `/courses/view?id=${encodeURIComponent(current.id)}&tab=lesson`, label: "Vào bài hôm nay" }
        : { href: `/courses/view?id=${encodeURIComponent(current.id)}&tab=plan`, label: `Xem lộ trình ngày ${nextDay}` };
  const stats = data?.stats;
  const cards = stats
    ? [
        { label: "Chuỗi ngày học", value: `${stats.streak_days} ngày`, hint: stats.streak_days ? "Giữ nhịp mỗi ngày" : "Học xong một ngày để bắt đầu", color: "var(--cite-fg)" },
        { label: "Phút đã học tuần này", value: `${stats.minutes_week} phút`, hint: "Tính theo ngày đã đánh dấu", color: "var(--text)" },
        { label: "Khóa học", value: String(stats.course_count), hint: "Lưu trên máy chủ của bạn", color: "var(--text)" },
        { label: "Điểm kiểm tra gần nhất", value: stats.last_score ? `${stats.last_score.score}/${stats.last_score.total}` : "Chưa có", hint: stats.last_score ? "Bài kiểm tra nhanh 5 câu" : "Làm kiểm tra sau bài 1", color: stats.last_score && stats.last_score.score >= 4 ? "var(--ok)" : "var(--text)" },
        { label: "Video đã tạo", value: String(stats.video_count), hint: "Video tóm tắt bài học", color: "var(--text)" },
      ]
    : [];

  return (
    <div className="page">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(420px,100%),1fr))", gap: 24, alignItems: "stretch" }}>
        <section className="card" style={{ padding: 28, display: "flex", flexDirection: "column", gap: 18 }} aria-labelledby="qc-h">
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <p className="eyebrow">Chào bạn</p>
            <h1 className="h1" id="qc-h">Hôm nay bạn muốn học gì?</h1>
            <p className="muted" style={{ margin: 0 }}>
              Nhập mục tiêu, nhận lộ trình 5 ngày và bài hôm nay. Mỗi ý đều có nguồn công khai để bạn kiểm chứng.
            </p>
          </div>
          <form onSubmit={quickSubmit} style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <label htmlFor="qc-goal" className="sr-only">Mục tiêu học</label>
            <input id="qc-goal" className="input t" style={{ flex: "1 1 260px", minHeight: 48 }} placeholder="Ví dụ: viết được câu SQL để làm bài tập Cơ sở dữ liệu" value={goal} onChange={(e) => setGoal(e.target.value)} />
            <button type="submit" className="btn btn-p t" style={{ minHeight: 48 }}>
              Tạo lộ trình
              <ArrowRight aria-hidden />
            </button>
          </form>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", fontSize: 14 }}>
            <span className="muted">Chưa nghĩ ra?</span>
            <Link className="btn btn-g btn-sm t" href="/create?example=sql">Dùng ví dụ SQL</Link>
          </div>
        </section>

        <section className="card" style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }} aria-labelledby="cont-h">
          <h2 className="h3" id="cont-h">Học tiếp</h2>
          {!data && !error && <LoadingCard lines={2} />}
          {current ? (
            <>
              <div style={{ display: "flex", gap: 18, alignItems: "center" }}>
                <ProgressRing done={current.days_done.length} total={current.days_total} size={64} />
                <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 0 }}>
                  <strong style={{ fontSize: 17, overflowWrap: "anywhere" }}>{current.title}</strong>
                  <span className="muted" style={{ fontSize: 14 }}>
                    {allDone ? `Đã học xong ${current.days_total}/${current.days_total} ngày` : `Ngày ${nextDay}/${current.days_total}`} · {current.minutes_per_day} phút
                    {current.last_score ? ` · Kiểm tra ${current.last_score.score}/${current.last_score.total}` : ""}
                  </span>
                </div>
              </div>
              {continueLink && (
                <Link className={`btn ${allDone ? "btn-s" : "btn-p"} t`} href={continueLink.href} style={{ alignSelf: "flex-start" }}>
                  {continueLink.label}
                </Link>
              )}
            </>
          ) : (
            data && (
              <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "flex-start", justifyContent: "center", gap: 10, padding: 16, border: "1px dashed var(--border-strong)", borderRadius: 12 }}>
                <strong>Chưa có khóa nào đang học</strong>
                <span className="muted" style={{ fontSize: 14 }}>Tạo lộ trình đầu tiên, bài hôm nay sẽ hiện ở đây.</span>
              </div>
            )
          )}
        </section>
      </div>

      {error && <ErrorBlock message={error} onRetry={() => { setError(null); load(); }} />}

      <section aria-label="Số liệu học tập" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(180px,100%),1fr))", gap: 16 }}>
        {(data ? cards : Array.from({ length: 5 }, () => null)).map((card, i) =>
          card ? (
            <div key={card.label} className="card" style={{ padding: 18, display: "flex", flexDirection: "column", gap: 6, boxShadow: "none" }}>
              <span className="muted" style={{ fontSize: 13, fontWeight: 500 }}>{card.label}</span>
              <span style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-.01em", color: card.color }}>{card.value}</span>
              <span className="hint">{card.hint}</span>
            </div>
          ) : (
            <div key={i} className="card" style={{ padding: 18, display: "flex", flexDirection: "column", gap: 10, boxShadow: "none" }}>
              <div className="sk" style={{ height: 12, width: "60%" }} />
              <div className="sk" style={{ height: 26, width: "40%" }} />
            </div>
          )
        )}
      </section>

      <section className="card" style={{ padding: 24, display: "flex", flexDirection: "column", gap: 12 }} aria-labelledby="act-h">
        <h2 className="h3" id="act-h">Hoạt động gần đây</h2>
        {data && data.activity.length > 0 ? (
          <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column" }}>
            {data.activity.map((a, i) => (
              <li key={`${a.kind}-${a.at}-${i}`} style={{ borderBottom: "1px solid var(--border)" }}>
                <Link href={activityHref(a)} className="row-btn" style={{ borderRadius: 0, padding: "10px 4px" }}>
                  <span className={`badge ${ACTIVITY_LABEL[a.kind].cls}`} style={{ minWidth: 96, justifyContent: "center" }}>{ACTIVITY_LABEL[a.kind].label}</span>
                  <span style={{ flex: 1, minWidth: 0, overflowWrap: "anywhere" }}>{activityText(a)}</span>
                  <span className="hint">{relativeTime(a.at)}</span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          data && <p className="muted" style={{ margin: 0 }}>Chưa có hoạt động nào. Khi bạn tạo khóa, học xong một ngày hay làm kiểm tra, mọi thứ sẽ ghi lại ở đây.</p>
        )}
      </section>
    </div>
  );
}
