"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { AlertCircle, AlertTriangle, Check, HelpCircle, Loader2, RefreshCw } from "lucide-react";
import { ApiClientError, createCourse } from "../../lib/api-client";
import { USE_FIXTURE } from "../../lib/config";
import { SQL_EXAMPLE_INPUT } from "../../lib/constants";
import { LIMITS, firstInvalidField, toRequest, validateForm, type FormErrors, type FormValues } from "../../lib/validation";
import type { ErrorCode, ErrorField, LearnerGroup } from "../../types/course";

const GROUPS: Array<{ value: LearnerGroup; label: string }> = [
  { value: "middle_school", label: "THCS" },
  { value: "high_school", label: "THPT" },
  { value: "university", label: "Sinh viên" },
  { value: "working_adult", label: "Người đi làm" },
];

const STEPS = [
  { label: "Hiểu mục tiêu của bạn", at: 0 },
  { label: "Tìm nguồn công khai", at: 3 },
  { label: "Soạn lộ trình 5 ngày", at: 9 },
  { label: "Kiểm tra trích dẫn", at: 15 },
];

const STOP_VIEW: Partial<Record<ErrorCode, { cls: string; title: string; retry?: boolean; icon: "help" | "warn" | "err" }>> = {
  CLARIFICATION_REQUIRED: { cls: "info", title: "Cần làm rõ mục tiêu", icon: "help" },
  INSUFFICIENT_SOURCES: { cls: "warn", title: "Chưa đủ nguồn để soạn bài", icon: "warn" },
  OUT_OF_SCOPE: { cls: "warn", title: "Chủ đề nằm ngoài phạm vi", icon: "warn" },
  REFUSED: { cls: "warn", title: "Không thể làm theo yêu cầu này", icon: "warn" },
  UPSTREAM_UNAVAILABLE: { cls: "err", title: "Chưa tạo được lộ trình", retry: true, icon: "err" },
};

const EMPTY: FormValues = { learner_group: "university", topic: "", goal: "", level: "", minutes_per_day: "20" };

function fromExample(): FormValues {
  return { ...SQL_EXAMPLE_INPUT, minutes_per_day: String(SQL_EXAMPLE_INPUT.minutes_per_day) };
}

export function CreatePage() {
  const router = useRouter();
  const params = useSearchParams();
  const [form, setForm] = useState<FormValues>(() => {
    const base = params.get("example") === "sql" ? fromExample() : EMPTY;
    const goal = params.get("goal");
    return goal ? { ...base, goal } : base;
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [stop, setStop] = useState<{ code: ErrorCode; message: string } | null>(null);
  const [generating, setGenerating] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const stopRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!generating) return;
    const started = Date.now();
    const timer = window.setInterval(() => setElapsed((Date.now() - started) / 1000), 250);
    return () => window.clearInterval(timer);
  }, [generating]);

  const set = (name: ErrorField) => (value: string) => {
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((e) => ({ ...e, [name]: undefined }));
  };

  const focusField = (name: ErrorField) => {
    window.setTimeout(() => document.getElementById(`f-${name}`)?.focus(), 0);
  };

  const submit = async (event?: FormEvent) => {
    event?.preventDefault();
    if (generating) return;
    const found = validateForm(form);
    setErrors(found);
    const first = firstInvalidField(found);
    if (first) {
      focusField(first);
      return;
    }
    setStop(null);
    setElapsed(0);
    setGenerating(true);
    try {
      const course = await createCourse(toRequest(form), { fixture: USE_FIXTURE });
      router.push(`/courses/view?id=${encodeURIComponent(course.id)}&tab=lesson`);
    } catch (e) {
      setGenerating(false);
      const detail = e instanceof ApiClientError ? e.detail : { code: "UPSTREAM_UNAVAILABLE" as ErrorCode, message: "Chưa tạo được lộ trình. Bạn có thể thử lại." };
      if (detail.code === "INVALID_INPUT" && detail.field) {
        setErrors({ [detail.field]: detail.message });
        focusField(detail.field);
        return;
      }
      setStop({ code: detail.code, message: detail.message });
      window.setTimeout(() => {
        if (detail.code === "CLARIFICATION_REQUIRED") focusField("goal");
        else stopRef.current?.focus();
      }, 0);
    }
  };

  const stopView = stop ? STOP_VIEW[stop.code] ?? STOP_VIEW.UPSTREAM_UNAVAILABLE! : null;
  const pct = Math.min(95, Math.round((elapsed / 20) * 100));
  const activeStep = STEPS.reduce((acc, step, i) => (elapsed >= step.at ? i : acc), 0);

  return (
    <div className="page" style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "flex-start", gap: 32 }}>
      <div style={{ flex: "1 1 520px", maxWidth: 600, display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <p className="eyebrow">Tạo lộ trình</p>
          <h1 className="h1">Bạn muốn học gì?</h1>
          <p className="muted" style={{ margin: 0 }}>Trả lời 5 câu ngắn. NewLearn tìm nguồn công khai và soạn lộ trình 5 ngày cho bạn.</p>
        </div>

        {stop && stopView && (
          <div ref={stopRef} className={`alert ${stopView.cls}`} role="alert" tabIndex={-1}>
            {stopView.icon === "help" ? <HelpCircle aria-hidden style={{ color: "var(--primary)" }} /> : stopView.icon === "warn" ? <AlertTriangle aria-hidden style={{ color: "var(--cite-fg)" }} /> : <AlertCircle aria-hidden style={{ color: "var(--err)" }} />}
            <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 0 }}>
              <strong>{stopView.title}</strong>
              <span style={{ fontSize: 14, overflowWrap: "anywhere" }}>{stop.message}</span>
              {stopView.retry && (
                <button type="button" className="btn btn-s btn-sm t" onClick={() => submit()} style={{ alignSelf: "flex-start", marginTop: 4 }}>
                  <RefreshCw aria-hidden />
                  Thử lại
                </button>
              )}
            </div>
          </div>
        )}

        {generating && (
          <section className="card" style={{ padding: 28, display: "flex", flexDirection: "column", gap: 20 }} aria-live="polite" aria-busy="true">
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <h2 className="h2">Đang soạn lộ trình cho bạn</h2>
              <p className="muted" style={{ margin: 0 }}>Thường mất khoảng 20 giây. Bạn cứ để trang mở.</p>
            </div>
            <div style={{ height: 8, borderRadius: 999, background: "var(--surface2)", overflow: "hidden" }} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} aria-label="Tiến độ tạo lộ trình">
              <div className="t" style={{ height: "100%", width: `${pct}%`, background: "var(--primary)", borderRadius: 999 }} />
            </div>
            <ol style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 14 }}>
              {STEPS.map((step, i) => {
                const done = i < activeStep;
                const active = i === activeStep;
                return (
                  <li key={step.label} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span className={`step-ic ${done ? "done" : active ? "active" : ""}`}>
                      {done ? <Check aria-hidden /> : active ? <Loader2 className="spin" aria-hidden /> : null}
                    </span>
                    <span style={{ flex: 1, fontWeight: active ? 600 : 500, color: done || active ? "var(--text)" : "var(--muted)" }}>{step.label}</span>
                    <span className="hint">{done ? "Xong" : active ? "Đang làm" : "Chờ"}</span>
                  </li>
                );
              })}
            </ol>
          </section>
        )}

        {!generating && (
          <form className="card" onSubmit={submit} noValidate style={{ padding: 28, display: "flex", flexDirection: "column", gap: 20 }}>
            <div className="field">
              <span className="lab" id="grp-l">Bạn đang là ai</span>
              <div className="seg" role="group" aria-labelledby="grp-l" id="f-learner_group" tabIndex={-1}>
                {GROUPS.map((g) => (
                  <button key={g.value} type="button" className={`t ${form.learner_group === g.value ? "on" : ""}`} aria-pressed={form.learner_group === g.value} onClick={() => set("learner_group")(g.value)}>
                    {g.label}
                  </button>
                ))}
              </div>
              {errors.learner_group && <p className="err-t">{errors.learner_group}</p>}
            </div>
            <Field id="topic" label="Chủ đề" error={errors.topic}>
              <input id="f-topic" className={`input t ${errors.topic ? "bad" : ""}`} placeholder="Ví dụ: SQL, Git, Python" value={form.topic} maxLength={LIMITS.topic} onChange={(e) => set("topic")(e.target.value)} aria-invalid={!!errors.topic} aria-describedby={errors.topic ? "f-topic-e" : undefined} />
            </Field>
            <Field id="goal" label="Mục tiêu" error={errors.goal}>
              <textarea id="f-goal" rows={3} className={`input t ${errors.goal ? "bad" : ""}`} placeholder="Học xong bạn muốn làm được gì?" value={form.goal} maxLength={LIMITS.goal} onChange={(e) => set("goal")(e.target.value)} aria-invalid={!!errors.goal} aria-describedby={errors.goal ? "f-goal-e" : undefined} />
            </Field>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(200px,100%),1fr))", gap: 16 }}>
              <Field id="level" label="Trình độ hiện tại" error={errors.level}>
                <input id="f-level" className={`input t ${errors.level ? "bad" : ""}`} placeholder="Ví dụ: mới bắt đầu" value={form.level} maxLength={LIMITS.level} onChange={(e) => set("level")(e.target.value)} aria-invalid={!!errors.level} aria-describedby={errors.level ? "f-level-e" : undefined} />
              </Field>
              <Field id="minutes_per_day" label="Phút học mỗi ngày" error={errors.minutes_per_day} hint={`Từ ${LIMITS.minutesMin} đến ${LIMITS.minutesMax} phút`}>
                <input id="f-minutes_per_day" type="number" inputMode="numeric" min={LIMITS.minutesMin} max={LIMITS.minutesMax} className={`input t ${errors.minutes_per_day ? "bad" : ""}`} placeholder="20" value={form.minutes_per_day} onChange={(e) => set("minutes_per_day")(e.target.value)} aria-invalid={!!errors.minutes_per_day} aria-describedby={errors.minutes_per_day ? "f-minutes_per_day-e" : "f-minutes_per_day-h"} />
              </Field>
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", paddingTop: 4 }}>
              <button type="submit" className="btn btn-p t">Tạo lộ trình</button>
              <button type="button" className="btn btn-s t" onClick={() => { setForm(fromExample()); setErrors({}); setStop(null); }}>Dùng ví dụ SQL</button>
            </div>
          </form>
        )}
      </div>

      <aside style={{ flex: "0 1 360px", display: "flex", flexDirection: "column", gap: 16, paddingTop: 96 }}>
        <div className="card" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 12, boxShadow: "none" }}>
          <h2 className="h3">Mục tiêu tốt trông thế nào?</h2>
          <p className="muted" style={{ margin: 0, fontSize: 14 }}>Nói rõ việc bạn muốn làm được, không chỉ tên môn.</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 14 }}>
            <div style={{ display: "flex", gap: 8 }}><span className="badge err" style={{ flex: "none" }}>Chưa rõ</span><span>Học dữ liệu</span></div>
            <div style={{ display: "flex", gap: 8 }}><span className="badge ok" style={{ flex: "none" }}>Rõ hơn</span><span>Viết được câu SELECT để lấy dữ liệu cho bài tập môn Cơ sở dữ liệu</span></div>
          </div>
        </div>
        <div className="card" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 10, boxShadow: "none" }}>
          <h2 className="h3">Bạn sẽ nhận được</h2>
          <ul style={{ margin: 0, paddingLeft: 18, display: "flex", flexDirection: "column", gap: 6, fontSize: 14 }}>
            <li>Lộ trình 5 ngày, mỗi ngày một mục tiêu</li>
            <li>Bài hôm nay có ví dụ, bài tập và nguồn bấm được</li>
            <li>Kiểm tra nhanh 5 câu và video tóm tắt bài</li>
          </ul>
        </div>
      </aside>
    </div>
  );
}

function Field({ id, label, error, hint, children }: { id: ErrorField; label: string; error?: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="field">
      <label htmlFor={`f-${id}`}>{label}</label>
      {children}
      {error ? (
        <p className="err-t" id={`f-${id}-e`}>
          <AlertCircle aria-hidden style={{ width: 14, height: 14 }} />
          {error}
        </p>
      ) : (
        hint && <p className="hint" id={`f-${id}-h`}>{hint}</p>
      )}
    </div>
  );
}
