"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Clapperboard, Search } from "lucide-react";
import { learningApi } from "../../lib/api-client";
import { relativeTime } from "../../lib/format";
import type { OverviewCourse } from "../../types/learning";
import { EmptyBlock, ErrorBlock, LoadingCard, ModeBadges, PageTitle, ProgressRing } from "../nl/ui";

type Filter = "all" | "active" | "done";

export function CoursesPage() {
  const [courses, setCourses] = useState<OverviewCourse[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const load = useCallback(() => {
    learningApi
      .overview()
      .then((d) => setCourses(d.courses))
      .catch((e: Error) => setError(e.message || "Chưa tải được danh sách khóa."));
  }, []);
  useEffect(load, [load]);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (courses ?? []).filter((c) => {
      const done = c.days_done.length >= c.days_total;
      if (filter === "active" && done) return false;
      if (filter === "done" && !done) return false;
      return !q || c.title.toLowerCase().includes(q);
    });
  }, [courses, query, filter]);

  return (
    <div className="page">
      <PageTitle eyebrow="Thư viện" title="Khóa học" desc="Mọi lộ trình bạn đã tạo, mới nhất ở đầu." />

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ position: "relative", flex: "1 1 280px", maxWidth: 420 }}>
          <Search aria-hidden style={{ position: "absolute", left: 12, top: 13, width: 18, height: 18, color: "var(--muted)" }} />
          <label htmlFor="c-q" className="sr-only">Tìm khóa học</label>
          <input id="c-q" className="input t" style={{ paddingLeft: 38 }} placeholder="Tìm theo tên khóa" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <div role="group" aria-label="Lọc theo trạng thái" style={{ display: "flex", gap: 8 }}>
          {([["all", "Tất cả"], ["active", "Đang học"], ["done", "Hoàn thành"]] as const).map(([value, label]) => (
            <button key={value} type="button" className={`pill t ${filter === value ? "on" : ""}`} aria-pressed={filter === value} onClick={() => setFilter(value)}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {error && <ErrorBlock message={error} onRetry={() => { setError(null); load(); }} />}
      {!courses && !error && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(min(340px,100%),1fr))", gap: 16 }}>
          <LoadingCard /> <LoadingCard /> <LoadingCard />
        </div>
      )}
      {courses && courses.length === 0 && (
        <EmptyBlock title="Bạn chưa có khóa nào" desc="Tạo lộ trình đầu tiên để bắt đầu học." action={<Link className="btn btn-p t" href="/create">Tạo lộ trình</Link>} />
      )}
      {courses && courses.length > 0 && shown.length === 0 && (
        <EmptyBlock title="Không có khóa phù hợp" desc="Thử từ khóa khác hoặc bỏ bộ lọc." />
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(min(340px,100%),1fr))", gap: 16 }}>
        {shown.map((c) => (
          <Link key={c.id} href={`/courses/view?id=${encodeURIComponent(c.id)}`} className="card t" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14, textDecoration: "none", color: "var(--text)" }}>
            <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
              <ProgressRing done={c.days_done.length} total={c.days_total} />
              <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 0 }}>
                <strong style={{ fontSize: 17, lineHeight: 1.3, overflowWrap: "anywhere" }}>{c.title}</strong>
                <span className="hint">{c.minutes_per_day} phút/ngày · tạo {relativeTime(c.created_at)}</span>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <ModeBadges mode={c.mode} />
              {c.last_score ? (
                <span className={`badge ${c.last_score.score >= 4 ? "ok" : ""}`}>Kiểm tra {c.last_score.score}/{c.last_score.total}</span>
              ) : (
                <span className="badge">Chưa kiểm tra</span>
              )}
              {c.has_video && (
                <span className="badge">
                  <Clapperboard aria-hidden style={{ width: 14, height: 14 }} />
                  Có video
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
