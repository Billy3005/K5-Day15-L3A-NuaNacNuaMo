"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertTriangle, ArrowDown, ArrowUp, Check, Loader2, RotateCcw } from "lucide-react";
import { ApiClientError, learningApi } from "../../lib/api-client";
import { durationWords } from "../../lib/format";
import type { Course, Source } from "../../types/course";
import type { Scene, Video } from "../../types/learning";
import { ErrorBlock, LoadingCard, ModeBadges, SourceDialog } from "../nl/ui";
import { Slide, VideoPlayer } from "./VideoPlayer";

type Step = "start" | "script" | "build" | "player";
const STEP_LABELS: Array<[Step, string]> = [["start", "Bắt đầu"], ["script", "Kịch bản cảnh"], ["build", "Dựng video"], ["player", "Xem video"]];
const BUILD_STEPS = ["Tạo giọng đọc", "Dựng slide minh họa", "Ghép cảnh và phụ đề", "Hoàn tất"];

export function VideoTab({ course, videoId }: { course: Course; videoId?: string | null }) {
  const [video, setVideo] = useState<Video | null>(null);
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [step, setStep] = useState<Step>("start");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [buildIndex, setBuildIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<Source | null>(null);
  const dayTitle = course.plan.find((d) => d.day === course.lesson.day)?.title ?? course.lesson.title;

  useEffect(() => {
    let alive = true;
    // Mở từ thư viện / tổng quan thì có video_id: tải đúng bản đó; không có thì lấy bản mới nhất của khóa.
    learningApi
      .videos(course.id)
      .then((list) => {
        if (!alive) return;
        const chosen = (videoId ? list.find((v) => v.id === videoId) : undefined) ?? list[0];
        if (chosen) {
          setVideo(chosen);
          setScenes(chosen.scenes);
          setStep(chosen.status === "ready" ? "player" : "script");
        }
      })
      .catch(() => undefined)
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [course.id, videoId]);

  const sourceIds = new Set(course.sources.map((s) => s.id));
  const missing = scenes.filter((s) => s.source_id !== "plan" && !sourceIds.has(s.source_id)).length;
  const emptyText = scenes.some((s) => !s.headline.trim() || !s.narration.trim());

  const writeScript = async () => {
    setError(null);
    setBusy(true);
    try {
      const v = await learningApi.createVideo(course.id);
      setVideo(v);
      setScenes(v.scenes);
      setStep("script");
    } catch (e) {
      setError(e instanceof ApiClientError ? e.message : "Chưa soạn được kịch bản. Bạn thử lại.");
    } finally {
      setBusy(false);
    }
  };

  const edit = (i: number, patch: Partial<Scene>) => setScenes((list) => list.map((s, j) => (j === i ? { ...s, ...patch } : s)));
  const move = (i: number, delta: number) =>
    setScenes((list) => {
      const next = [...list];
      const [item] = next.splice(i, 1);
      next.splice(i + delta, 0, item);
      return next;
    });

  const build = useCallback(async () => {
    if (!video) return;
    setError(null);
    setStep("build");
    setBuildIndex(0);
    try {
      await learningApi.updateVideo(video.id, scenes);
      for (let i = 1; i < BUILD_STEPS.length; i++) {
        await new Promise((r) => window.setTimeout(r, 700));
        setBuildIndex(i);
      }
      const ready = await learningApi.renderVideo(video.id);
      setVideo(ready);
      setScenes(ready.scenes);
      setStep("player");
    } catch (e) {
      setError(e instanceof ApiClientError ? e.message : "Chưa dựng được video. Bạn thử lại.");
      setStep("script");
    }
  }, [video, scenes]);

  const openSource = (id: string) => setSource(course.sources.find((s) => s.id === id) ?? null);
  const total = scenes.reduce((sum, s) => sum + s.dur, 0);

  if (loading) return <LoadingCard lines={4} />;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <ol aria-label="Các bước tạo video" style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", gap: 8, flexWrap: "wrap" }}>
        {STEP_LABELS.map(([key, label], i) => {
          const current = key === step;
          const done = STEP_LABELS.findIndex(([k]) => k === step) > i;
          return (
            <li key={key} aria-current={current ? "step" : undefined} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 12px 6px 6px", borderRadius: 999, background: current ? "var(--primary-soft)" : "var(--surface2)", color: current ? "var(--primary)" : done ? "var(--text)" : "var(--muted)", fontSize: 14, fontWeight: current ? 600 : 500 }}>
              <span style={{ width: 24, height: 24, borderRadius: "50%", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, background: done ? "var(--ok)" : current ? "var(--primary)" : "var(--border)", color: done || current ? "var(--on-primary)" : "var(--muted)" }}>
                {done ? <Check aria-hidden style={{ width: 14, height: 14 }} /> : i + 1}
              </span>
              {label}
            </li>
          );
        })}
      </ol>

      {error && <ErrorBlock message={error} />}

      {step === "start" && (
        <section className="card" style={{ padding: 32, display: "flex", gap: 32, alignItems: "center", flexWrap: "wrap", maxWidth: 1040 }}>
          <div style={{ flex: "1 1 360px", maxWidth: 440 }}>
            <Slide scene={{ kind: "Mở đầu", headline: dayTitle, big: null, narration: "", visual: "", source_id: course.lesson.sections[0]?.source_ids[0] ?? "plan", dur: 10 }} title="Video tóm tắt" onCite={openSource} />
          </div>
          <div style={{ flex: "1 1 320px", display: "flex", flexDirection: "column", gap: 14 }}>
            <h2 className="h2">Biến bài 1 thành video khoảng 2 phút</h2>
            <p className="muted" style={{ margin: 0 }}>Một người dẫn tiếng Việt, 6 cảnh, phụ đề đầy đủ. Mỗi cảnh lấy ý từ bài học và gắn nhãn nguồn ở góc. Bạn xem và sửa kịch bản trước khi dựng.</p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <span className="badge">6 cảnh</span>
              <span className="badge">Phụ đề tiếng Việt</span>
              <span className="badge">Giọng đọc trên trình duyệt</span>
            </div>
            <button type="button" className="btn btn-p t" onClick={writeScript} disabled={busy} style={{ alignSelf: "flex-start" }}>
              {busy && <Loader2 className="spin" aria-hidden />}
              {busy ? "Đang soạn kịch bản…" : "Soạn kịch bản"}
            </button>
          </div>
        </section>
      )}

      {step === "script" && video && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 1040 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <h2 className="h2">Kịch bản cảnh</h2>
              <span className="muted" style={{ fontSize: 14 }}>Sửa lời dẫn, mô tả hình và nguồn. Cảnh thiếu nguồn sẽ chặn việc dựng. Tổng khoảng {durationWords(total)}.</span>
            </div>
            <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
              <ModeBadges mode={video.mode} />
              {missing > 0 && <span className="badge err">{missing} cảnh thiếu nguồn</span>}
              <button type="button" className="btn btn-s t" onClick={writeScript} disabled={busy}><RotateCcw aria-hidden />Soạn lại</button>
              <button type="button" className="btn btn-p t" onClick={build} disabled={busy || missing > 0 || emptyText || scenes.length < 3}>Dựng video</button>
            </div>
          </div>
          <ol style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 12 }}>
            {scenes.map((sc, i) => {
              const bad = sc.source_id !== "plan" && !sourceIds.has(sc.source_id);
              return (
                <li key={i} className="card" style={{ padding: "16px 18px", display: "flex", gap: 14, boxShadow: "none", borderColor: bad ? "var(--err)" : "var(--border)" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, flex: "none" }}>
                    <button type="button" className="icon-btn t" style={{ width: 32, height: 32 }} onClick={() => move(i, -1)} disabled={i === 0} aria-label={`Đưa cảnh ${i + 1} lên`}><ArrowUp aria-hidden /></button>
                    <span style={{ fontWeight: 700, fontSize: 14 }}>{i + 1}</span>
                    <button type="button" className="icon-btn t" style={{ width: 32, height: 32 }} onClick={() => move(i, 1)} disabled={i === scenes.length - 1} aria-label={`Đưa cảnh ${i + 1} xuống`}><ArrowDown aria-hidden /></button>
                  </div>
                  <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 10 }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                      <span className="badge pri">{sc.kind}</span>
                      <span className="hint">{sc.dur} giây</span>
                      <label className="sr-only" htmlFor={`sc-src-${i}`}>Nguồn của cảnh {i + 1}</label>
                      <select id={`sc-src-${i}`} className="input t" style={{ width: "auto", minHeight: 32, padding: "2px 8px", fontSize: 13 }} value={sc.source_id} onChange={(e) => edit(i, { source_id: e.target.value })}>
                        <option value="plan">Lộ trình</option>
                        {course.sources.map((s) => <option key={s.id} value={s.id}>{s.id} · {s.title.slice(0, 40)}</option>)}
                        {bad && <option value={sc.source_id}>{sc.source_id} (không có)</option>}
                      </select>
                      {bad && <span className="err-t"><AlertTriangle aria-hidden style={{ width: 14, height: 14 }} />Thiếu nguồn</span>}
                    </div>
                    <label className="sr-only" htmlFor={`sc-h-${i}`}>Tiêu đề cảnh {i + 1}</label>
                    <input id={`sc-h-${i}`} className="input t" style={{ fontWeight: 600 }} value={sc.headline} onChange={(e) => edit(i, { headline: e.target.value })} />
                    <label className="lab" htmlFor={`sc-n-${i}`} style={{ fontSize: 13 }}>Lời dẫn</label>
                    <textarea id={`sc-n-${i}`} rows={2} className="input t" value={sc.narration} onChange={(e) => edit(i, { narration: e.target.value, dur: Math.min(30, Math.max(6, Math.round(e.target.value.length / 14))) })} />
                    <label className="lab" htmlFor={`sc-v-${i}`} style={{ fontSize: 13 }}>Mô tả hình</label>
                    <input id={`sc-v-${i}`} className="input t" value={sc.visual} onChange={(e) => edit(i, { visual: e.target.value })} />
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      )}

      {step === "build" && (
        <section className="card" style={{ padding: 28, display: "flex", flexDirection: "column", gap: 16, maxWidth: 640 }} aria-live="polite" aria-busy="true">
          <h2 className="h2">Đang dựng video</h2>
          <ol style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 12 }}>
            {BUILD_STEPS.map((label, i) => (
              <li key={label} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span className={`step-ic ${i < buildIndex ? "done" : i === buildIndex ? "active" : ""}`}>
                  {i < buildIndex ? <Check aria-hidden /> : i === buildIndex ? <Loader2 className="spin" aria-hidden /> : null}
                </span>
                <span style={{ fontWeight: i === buildIndex ? 600 : 500, color: i <= buildIndex ? "var(--text)" : "var(--muted)" }}>{label}</span>
              </li>
            ))}
          </ol>
        </section>
      )}

      {step === "player" && video && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              <h2 className="h2">Video tóm tắt · {dayTitle}</h2>
              <ModeBadges mode={video.mode} />
            </div>
            <button type="button" className="btn btn-s btn-sm t" onClick={() => setStep("script")}>Sửa kịch bản và dựng lại</button>
          </div>
          <VideoPlayer scenes={scenes} title={dayTitle} sources={course.sources} onCite={openSource} />
        </div>
      )}

      <SourceDialog source={source} onClose={() => setSource(null)} />
    </div>
  );
}
