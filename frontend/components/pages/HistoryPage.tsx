"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft, CheckCircle2, XCircle } from "lucide-react";
import { getCourse, learningApi } from "../../lib/api-client";
import { dateTime, durationWords } from "../../lib/format";
import type { Source } from "../../types/course";
import type { Attempt, AttemptSummary, Verdict } from "../../types/learning";
import { CiteChip, EmptyBlock, ErrorBlock, LoadingCard, ModeBadges, PageTitle, SourceDialog } from "../nl/ui";

const VERDICT: Record<Verdict, { label: string; cls: string }> = {
  dat: { label: "Đạt", cls: "ok" },
  gan_dung: { label: "Gần đúng", cls: "warn" },
  chua_dat: { label: "Chưa đạt", cls: "err" },
};

export function HistoryPage() {
  const params = useSearchParams();
  const id = params.get("id");
  // key={id}: đổi lượt làm trên cùng route thì không giữ dữ liệu / lỗi của lượt trước.
  return id ? <AttemptDetail key={id} id={id} /> : <AttemptList />;
}

function AttemptList() {
  const router = useRouter();
  const [rows, setRows] = useState<AttemptSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [course, setCourse] = useState("all");
  const [sort, setSort] = useState<"date" | "score">("date");

  const load = useCallback(() => {
    learningApi.attempts().then(setRows).catch((e: Error) => setError(e.message || "Chưa tải được lịch sử."));
  }, []);
  useEffect(load, [load]);

  const courses = useMemo(() => [...new Map((rows ?? []).map((r) => [r.course_id, r.course_title])).entries()], [rows]);
  const shown = useMemo(() => {
    const list = (rows ?? []).filter((r) => course === "all" || r.course_id === course);
    return sort === "score" ? [...list].sort((a, b) => b.score / b.total - a.score / a.total) : list;
  }, [rows, course, sort]);

  return (
    <div className="page">
      <PageTitle eyebrow="Kiểm tra" title="Lịch sử kiểm tra" desc="Mọi lượt kiểm tra nhanh được lưu ở đây để bạn xem lại từng câu và giải thích." />
      {rows && rows.length > 0 && (
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          <label htmlFor="h-course" className="lab">Khóa</label>
          <select id="h-course" className="input t" style={{ width: "auto", minWidth: 220 }} value={course} onChange={(e) => setCourse(e.target.value)}>
            <option value="all">Tất cả khóa</option>
            {courses.map(([cid, title]) => <option key={cid} value={cid}>{title}</option>)}
          </select>
          <div role="group" aria-label="Sắp xếp" style={{ display: "flex", gap: 8 }}>
            <button type="button" className={`pill t ${sort === "date" ? "on" : ""}`} aria-pressed={sort === "date"} onClick={() => setSort("date")}>Mới nhất</button>
            <button type="button" className={`pill t ${sort === "score" ? "on" : ""}`} aria-pressed={sort === "score"} onClick={() => setSort("score")}>Điểm cao</button>
          </div>
        </div>
      )}
      {error && <ErrorBlock message={error} onRetry={() => { setError(null); load(); }} />}
      {!rows && !error && <LoadingCard lines={5} />}
      {rows && rows.length === 0 && (
        <EmptyBlock title="Bạn chưa làm bài kiểm tra nào" desc="Mở một khóa học, vào tab Kiểm tra để làm 5 câu nhanh sau bài 1." action={<Link className="btn btn-s t" href="/courses">Mở khóa học</Link>} />
      )}
      {rows && rows.length > 0 && (
        <div className="card" style={{ padding: 0, overflowX: "auto" }}>
          <table className="tbl">
            <thead>
              <tr><th>Khóa</th><th>Bài</th><th>Điểm</th><th>Thời gian làm</th><th>Ngày làm</th></tr>
            </thead>
            <tbody>
              {shown.map((r) => (
                <tr key={r.id} className="click" onClick={() => router.push(`/history?id=${encodeURIComponent(r.id)}`)}>
                  <td style={{ fontWeight: 600 }}>
                    <Link href={`/history?id=${encodeURIComponent(r.id)}`} style={{ color: "var(--text)", textDecoration: "none" }}>{r.course_title}</Link>
                  </td>
                  <td>Ngày {r.day}</td>
                  <td><span className={`badge ${r.score >= 4 ? "ok" : r.score >= 3 ? "" : "err"}`}>{r.score}/{r.total}</span></td>
                  <td className="muted">{durationWords(r.duration_s)}</td>
                  <td className="muted">{dateTime(r.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function AttemptDetail({ id }: { id: string }) {
  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [sources, setSources] = useState<Source[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<{ src: Source; claim: string } | null>(null);

  useEffect(() => {
    let alive = true;
    learningApi
      .attempt(id)
      .then((a) => {
        if (!alive) return;
        setAttempt(a);
        return getCourse(a.course_id).then((c) => alive && setSources(c.sources)).catch(() => alive && setSources([]));
      })
      .catch((e: Error) => alive && setError(e.message || "Không tìm thấy lượt làm bài này."));
    return () => {
      alive = false;
    };
  }, [id]);

  const answerText = (a: Attempt, i: number) => {
    const q = a.questions[i];
    const ans = a.answers[i];
    if (q.type === "mcq" || q.type === "tf") return typeof ans === "number" ? q.options[ans] ?? "—" : "Chưa trả lời";
    return typeof ans === "string" && ans.trim() ? ans : "Chưa trả lời";
  };
  const correctText = (a: Attempt, i: number) => {
    const q = a.questions[i];
    return q.type === "mcq" || q.type === "tf" ? q.options[q.answer_index ?? 0] : q.answer_text ?? "";
  };

  return (
    <div className="page">
      <Link href="/history" className="btn btn-g btn-sm t" style={{ alignSelf: "flex-start" }}><ArrowLeft aria-hidden />Lịch sử kiểm tra</Link>
      {error && <EmptyBlock title="Không tìm thấy lượt làm bài này" desc={error} action={<Link className="btn btn-s t" href="/history">Về lịch sử</Link>} />}
      {!attempt && !error && <LoadingCard lines={6} />}
      {attempt && (
        <>
          <PageTitle
            eyebrow={`Xem lại · ${dateTime(attempt.created_at)}`}
            title={attempt.course_title}
            desc={`Ngày ${attempt.day} · ${attempt.score}/${attempt.total} câu đạt · ${durationWords(attempt.duration_s)}`}
            actions={<div style={{ display: "flex", gap: 8 }}><ModeBadges mode={attempt.mode} /><Link className="btn btn-s btn-sm t" href={`/courses/view?id=${encodeURIComponent(attempt.course_id)}&tab=quiz`}>Làm lại</Link></div>}
          />
          <ol style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 12, maxWidth: 860 }}>
            {attempt.questions.map((q, i) => {
              const v = attempt.results[i]?.verdict ?? "chua_dat";
              return (
                <li key={i} className="card" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 10, boxShadow: "none" }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                    <span className="eyebrow">Câu {i + 1}</span>
                    <span className={`badge ${VERDICT[v].cls}`}>{VERDICT[v].label}</span>
                  </div>
                  <strong style={{ fontSize: 16, overflowWrap: "anywhere" }}>{q.prompt}</strong>
                  <div style={{ display: "flex", gap: 8, alignItems: "flex-start", fontSize: 15 }}>
                    {v === "dat" ? <CheckCircle2 aria-hidden style={{ width: 18, height: 18, color: "var(--ok)", flex: "none", marginTop: 3 }} /> : <XCircle aria-hidden style={{ width: 18, height: 18, color: "var(--err)", flex: "none", marginTop: 3 }} />}
                    <span><span className="muted">Bạn trả lời:</span> {answerText(attempt, i)}</span>
                  </div>
                  {v !== "dat" && <span style={{ fontSize: 15 }}><span className="muted">Đáp án{q.type === "short" ? " mẫu" : ""}:</span> {correctText(attempt, i)}</span>}
                  <span className="muted" style={{ fontSize: 14 }}>
                    {q.explanation}
                    {sources.some((s) => s.id === q.source_id) && (
                      <CiteChip id={q.source_id} onClick={() => setSource({ src: sources.find((s) => s.id === q.source_id)!, claim: q.explanation })} />
                    )}
                  </span>
                </li>
              );
            })}
          </ol>
        </>
      )}
      <SourceDialog source={source?.src ?? null} claim={source?.claim} onClose={() => setSource(null)} />
    </div>
  );
}
