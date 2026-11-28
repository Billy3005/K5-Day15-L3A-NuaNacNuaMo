"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight, CheckCircle2, ClipboardCheck, Loader2, Lock, RotateCcw, Timer, XCircle } from "lucide-react";
import { ApiClientError, learningApi } from "../../lib/api-client";
import { dateTime, durationWords } from "../../lib/format";
import type { Course, Source } from "../../types/course";
import type { Answer, Attempt, AttemptSummary, CheckResult, Quiz, Verdict } from "../../types/learning";
import type { TabKey } from "../pages/CoursePage";
import { CiteChip, ErrorBlock, ModeBadges, SourceDialog } from "../nl/ui";

const TYPE_LABEL = { mcq: "Trắc nghiệm", tf: "Đúng hay sai", fill: "Điền chỗ trống", short: "Trả lời ngắn" } as const;
const VERDICT_VIEW: Record<Verdict, { label: string; cls: string }> = {
  dat: { label: "Đạt", cls: "ok" },
  gan_dung: { label: "Gần đúng", cls: "warn" },
  chua_dat: { label: "Chưa đạt", cls: "err" },
};
const MAX_ANSWER = 1000; // khớp giới hạn của API

function newSubmissionId() {
  try {
    return `s-${crypto.randomUUID()}`;
  } catch {
    return `s-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
  }
}

export function QuizTab({ course, daysDone, onToggle, go }: { course: Course; daysDone: number[]; onToggle: (day: number, done: boolean) => void; go: (tab: TabKey) => void }) {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [phase, setPhase] = useState<"intro" | "loading" | "doing" | "result">("intro");
  const [error, setError] = useState<string | null>(null);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  // Kết quả từng câu do server chấm; đáp án và giải thích chỉ có sau khi kiểm tra câu đó.
  const [results, setResults] = useState<(CheckResult | null)[]>([]);
  const [grading, setGrading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [history, setHistory] = useState<AttemptSummary[]>([]);
  const [source, setSource] = useState<{ src: Source; claim: string } | null>(null);
  const started = useRef(0);
  const submissionId = useRef("");
  const headingRef = useRef<HTMLHeadingElement>(null);

  const loadHistory = useCallback(() => {
    learningApi.attempts(course.id).then(setHistory).catch(() => setHistory([]));
  }, [course.id]);
  useEffect(loadHistory, [loadHistory]);

  const start = async () => {
    setError(null);
    setPhase("loading");
    try {
      const q = await learningApi.createQuiz(course.id);
      setQuiz(q);
      setAnswers(q.questions.map(() => null));
      setResults(q.questions.map(() => null));
      setIndex(0);
      setAttempt(null);
      started.current = Date.now();
      submissionId.current = newSubmissionId();
      setPhase("doing");
      window.setTimeout(() => headingRef.current?.focus(), 0);
    } catch (e) {
      setError(e instanceof ApiClientError ? e.message : "Chưa soạn được bài kiểm tra. Bạn thử lại.");
      setPhase("intro");
    }
  };

  const retry = () => {
    if (!quiz) return start();
    setError(null);
    setAnswers(quiz.questions.map(() => null));
    setResults(quiz.questions.map(() => null));
    setIndex(0);
    setAttempt(null);
    started.current = Date.now();
    submissionId.current = newSubmissionId();
    setPhase("doing");
  };

  const q = quiz?.questions[index];
  const answer = answers[index];
  const result = results[index] ?? null;
  const isChecked = result !== null;

  const check = async () => {
    if (!quiz || !q || grading) return;
    setError(null);
    setGrading(true);
    try {
      const r = await learningApi.checkAnswer(quiz.id, index, answer);
      setResults((list) => list.map((v, i) => (i === r.index ? r : v)));
    } catch (e) {
      setError(e instanceof ApiClientError ? e.message : "Chưa chấm được câu trả lời. Bạn thử lại.");
    } finally {
      setGrading(false);
    }
  };

  const next = async () => {
    if (!quiz || submitting) return;
    if (index < quiz.questions.length - 1) {
      setIndex(index + 1);
      window.setTimeout(() => headingRef.current?.focus(), 0);
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const saved = await learningApi.submitAttempt(quiz.id, answers, Math.round((Date.now() - started.current) / 1000), submissionId.current);
      setAttempt(saved);
      setPhase("result");
      loadHistory();
    } catch (e) {
      setError(e instanceof ApiClientError ? e.message : "Chưa lưu được kết quả. Bạn thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  const openSource = (id: string, claim: string) => {
    const src = course.sources.find((s) => s.id === id);
    if (src) setSource({ src, claim });
  };

  const canCheck = q && (q.type === "mcq" || q.type === "tf" ? typeof answer === "number" : typeof answer === "string" && answer.trim().length > 0);
  const verdict = result?.verdict ?? null;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(320px,100%),1fr))", gap: 24, alignItems: "start" }}>
      <div style={{ gridColumn: "span 2", display: "flex", flexDirection: "column", gap: 16, minWidth: 0, maxWidth: 760 }}>
        {error && <ErrorBlock message={error} />}

        {phase === "intro" && (
          <section className="card" style={{ padding: 28, display: "flex", flexDirection: "column", gap: 14 }}>
            <ClipboardCheck aria-hidden style={{ width: 32, height: 32, color: "var(--primary)" }} />
            <h2 className="h2">Kiểm tra nhanh bài 1</h2>
            <p className="muted" style={{ margin: 0 }}>5 câu soạn từ chính bài học và nguồn của bài: trắc nghiệm, đúng hay sai, điền chỗ trống và một câu trả lời ngắn. Mỗi câu có giải thích kèm nguồn.</p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <span className="badge">5 câu</span>
              <span className="badge">Khoảng 5 phút</span>
              <span className="badge">Kết quả được lưu</span>
            </div>
            <button type="button" className="btn btn-p t" onClick={start} style={{ alignSelf: "flex-start" }}>Bắt đầu</button>
          </section>
        )}

        {phase === "loading" && (
          <section className="card" style={{ padding: 28, display: "flex", flexDirection: "column", gap: 14 }} aria-busy="true" aria-live="polite">
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <Loader2 className="spin" aria-hidden style={{ color: "var(--primary)" }} />
              <strong>Đang soạn câu hỏi từ bài học…</strong>
            </div>
            <div className="sk" style={{ height: 20, width: "70%" }} />
            {[1, 2, 3, 4].map((i) => <div key={i} className="sk" style={{ height: 48 }} />)}
          </section>
        )}

        {phase === "doing" && quiz && q && (
          <section className="card" style={{ padding: 28, display: "flex", flexDirection: "column", gap: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
              <span className="eyebrow">Câu {index + 1}/{quiz.questions.length} · {TYPE_LABEL[q.type]}</span>
              <ModeBadges mode={quiz.mode} />
            </div>
            <div style={{ height: 6, borderRadius: 999, background: "var(--surface2)", overflow: "hidden" }} aria-hidden>
              <div className="t" style={{ height: "100%", width: `${((index + (isChecked ? 1 : 0)) / quiz.questions.length) * 100}%`, background: "var(--primary)" }} />
            </div>
            <h2 className="h3" ref={headingRef} tabIndex={-1} style={{ fontSize: 19, lineHeight: 1.45, overflowWrap: "anywhere" }}>{q.prompt}</h2>

            {(q.type === "mcq" || q.type === "tf") && (
              <div role="radiogroup" aria-label="Các lựa chọn" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {q.options.map((opt, i) => {
                  const selected = answer === i;
                  const cls = result ? (i === result.answer_index ? "ok" : selected ? "bad" : "") : selected ? "sel" : "";
                  return (
                    <button key={i} type="button" role="radio" aria-checked={selected} disabled={isChecked || grading} className={`opt t ${cls}`} onClick={() => setAnswers((a) => a.map((v, j) => (j === index ? i : v)))}>
                      <span className="k">{String.fromCharCode(65 + i)}</span>
                      <span style={{ overflowWrap: "anywhere" }} className={/[;()=*]/.test(opt) ? "mono" : undefined}>{opt}</span>
                    </button>
                  );
                })}
              </div>
            )}
            {q.type === "fill" && (
              <div className="field">
                <label htmlFor="q-fill">Từ còn thiếu</label>
                <input id="q-fill" className="input t mono" maxLength={200} disabled={isChecked || grading} value={typeof answer === "string" ? answer : ""} onChange={(e) => setAnswers((a) => a.map((v, j) => (j === index ? e.target.value : v)))} onKeyDown={(e) => e.key === "Enter" && canCheck && !isChecked && check()} />
              </div>
            )}
            {q.type === "short" && (
              <div className="field">
                <label htmlFor="q-short">Câu trả lời của bạn (1–2 câu)</label>
                <textarea id="q-short" rows={3} className="input t" maxLength={MAX_ANSWER} aria-describedby="q-short-count" disabled={isChecked || grading} value={typeof answer === "string" ? answer : ""} onChange={(e) => setAnswers((a) => a.map((v, j) => (j === index ? e.target.value : v)))} />
                <span id="q-short-count" className="hint">{(typeof answer === "string" ? answer.length : 0)}/{MAX_ANSWER} ký tự</span>
              </div>
            )}

            {result && verdict && (
              <div className={`alert ${verdict === "dat" ? "info" : verdict === "gan_dung" ? "warn" : "err"}`} role="status">
                {verdict === "dat" ? <CheckCircle2 aria-hidden style={{ color: "var(--ok)" }} /> : <XCircle aria-hidden style={{ color: verdict === "gan_dung" ? "var(--cite-fg)" : "var(--err)" }} />}
                <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 0 }}>
                  <strong>{verdict === "dat" ? "Chính xác" : VERDICT_VIEW[verdict].label}</strong>
                  {q.type === "short" && result.feedback && <span style={{ fontSize: 14 }}>{result.feedback}</span>}
                  {q.type === "fill" && verdict !== "dat" && <span style={{ fontSize: 14 }}>Đáp án: <span className="mono">{result.answer_text}</span></span>}
                  {q.type === "short" && <span style={{ fontSize: 14 }}><strong>Đáp án mẫu:</strong> {result.answer_text}</span>}
                  <span style={{ fontSize: 14 }}>
                    {result.explanation}
                    <CiteChip id={q.source_id} title={course.sources.find((s) => s.id === q.source_id)?.title} onClick={() => openSource(q.source_id, result.explanation)} />
                  </span>
                </div>
              </div>
            )}

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {!isChecked ? (
                <button type="button" className="btn btn-p t" disabled={!canCheck || grading} onClick={check}>
                  {grading && <Loader2 className="spin" aria-hidden />}
                  {grading ? "Đang chấm…" : "Kiểm tra"}
                </button>
              ) : (
                <button type="button" className="btn btn-p t" onClick={next} disabled={submitting} aria-busy={submitting || undefined}>
                  {submitting && <Loader2 className="spin" aria-hidden />}
                  {index < quiz.questions.length - 1 ? "Câu tiếp theo" : submitting ? "Đang lưu kết quả…" : "Xem kết quả"}
                  {!submitting && <ArrowRight aria-hidden />}
                </button>
              )}
            </div>
          </section>
        )}

        {phase === "result" && attempt && (
          <section className="card" style={{ padding: 28, display: "flex", flexDirection: "column", gap: 18 }} aria-live="polite">
            <div style={{ display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap" }}>
              <div style={{ fontSize: 44, fontWeight: 700, letterSpacing: "-.02em", color: attempt.score >= 4 ? "var(--ok)" : "var(--text)" }}>{attempt.score}/{attempt.total}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <h2 className="h2">{attempt.score >= 4 ? "Bạn nắm bài rất tốt" : attempt.score >= 3 ? "Khá rồi, ôn thêm chút nữa" : "Xem lại bài rồi thử lần nữa"}</h2>
                <span className="muted" style={{ display: "inline-flex", gap: 6, alignItems: "center", fontSize: 14 }}>
                  <Timer aria-hidden style={{ width: 16, height: 16 }} />
                  {durationWords(attempt.duration_s)} · Đã lưu vào Lịch sử kiểm tra
                </span>
              </div>
            </div>
            <ol style={{ margin: 0, paddingLeft: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
              {attempt.questions.map((qq, i) => (
                <li key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <span className={`badge ${VERDICT_VIEW[attempt.results[i].verdict].cls}`} style={{ flex: "none" }}>{VERDICT_VIEW[attempt.results[i].verdict].label}</span>
                  <span style={{ fontSize: 15, overflowWrap: "anywhere" }}>{qq.prompt}</span>
                </li>
              ))}
            </ol>
            {attempt.score >= 4 && !daysDone.includes(course.lesson.day) && (
              <div className="alert info">
                <CheckCircle2 aria-hidden style={{ color: "var(--ok)" }} />
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <span>Bạn đạt từ 4/5. Đánh dấu đã học xong ngày 1?</span>
                  <button type="button" className="btn btn-p btn-sm t" style={{ alignSelf: "flex-start" }} onClick={() => onToggle(course.lesson.day, true)}>Đánh dấu đã học</button>
                </div>
              </div>
            )}
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button type="button" className="btn btn-s t" onClick={retry}><RotateCcw aria-hidden />Làm lại</button>
              <button type="button" className="btn btn-s t" onClick={() => go("lesson")}>Xem bài học</button>
              <Link className="btn btn-g t" href={`/history?id=${encodeURIComponent(attempt.id)}`}>Xem lại chi tiết</Link>
            </div>
          </section>
        )}
      </div>

      <aside style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div className="card" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 10, boxShadow: "none" }}>
          <h3 className="h3">Lượt làm của khóa này</h3>
          {history.length === 0 ? (
            <p className="hint">Chưa có lượt nào. Kết quả sẽ lưu ở đây và trong Lịch sử kiểm tra.</p>
          ) : (
            <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column" }}>
              {history.slice(0, 5).map((h) => (
                <li key={h.id}>
                  <Link className="row-btn" href={`/history?id=${encodeURIComponent(h.id)}`} style={{ justifyContent: "space-between" }}>
                    <span className={`badge ${h.score >= 4 ? "ok" : ""}`}>{h.score}/{h.total}</span>
                    <span className="hint">{dateTime(h.created_at)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
        <LockedCard title="Bài thi cuối khóa (15–20 câu)" desc="Mở khi học xong ngày 5. Bài thi phủ cả lộ trình, có giờ làm bài và điểm tổng." badge="Mở khi xong ngày 5" />
        <LockedCard title="Ôn câu sai" desc="Gom các câu bạn từng trả lời sai để ôn lại theo lịch." badge="Sắp có" />
      </aside>

      <SourceDialog source={source?.src ?? null} claim={source?.claim} onClose={() => setSource(null)} />
    </div>
  );
}

function LockedCard({ title, desc, badge }: { title: string; desc: string; badge: string }) {
  return (
    <div className="card" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 8, boxShadow: "none", background: "var(--surface2)" }} aria-disabled="true">
      <div style={{ display: "flex", gap: 8, alignItems: "center", justifyContent: "space-between" }}>
        <h3 className="h3" style={{ display: "inline-flex", gap: 8, alignItems: "center" }}>
          <Lock aria-hidden style={{ width: 16, height: 16, color: "var(--muted)" }} />
          {title}
        </h3>
      </div>
      <p className="hint">{desc}</p>
      <span className="badge" style={{ alignSelf: "flex-start" }}>{badge}</span>
    </div>
  );
}
