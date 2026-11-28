"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Captions, CaptionsOff, Download, Pause, Play, SkipBack, SkipForward, Volume2, VolumeX } from "lucide-react";
import type { Source } from "../../types/course";
import type { Scene } from "../../types/learning";
import { duration } from "../../lib/format";

function pickVoice(): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  return voices.find((v) => v.lang.toLowerCase().startsWith("vi")) ?? null;
}

function srtTime(totalSeconds: number) {
  const ms = Math.round(totalSeconds * 1000);
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  const r = ms % 1000;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")},${String(r).padStart(3, "0")}`;
}

export function toSrt(scenes: Scene[]): string {
  let t = 0;
  return scenes
    .map((s, i) => {
      const start = t;
      t += s.dur;
      return `${i + 1}\n${srtTime(start)} --> ${srtTime(t)}\n${s.narration}\n`;
    })
    .join("\n");
}

export function Slide({ scene, title, onCite }: { scene: Scene; title: string; onCite?: (id: string) => void }) {
  const isCode = scene.kind === "Ví dụ" && !!scene.big;
  return (
    <div className="slide" style={{ display: "flex", flexDirection: "column", justifyContent: "center", padding: "6% 7%", gap: 14, background: "radial-gradient(120% 120% at 0% 0%, #26338A 0%, #0F1530 55%, #0B1020 100%)" }}>
      <span style={{ position: "absolute", top: 16, left: 20, fontSize: 12, letterSpacing: ".08em", textTransform: "uppercase", color: "#AAB6F5" }}>{scene.kind} · {title}</span>
      {scene.source_id === "plan" ? (
        <span style={{ position: "absolute", top: 14, right: 16, fontSize: 12, fontWeight: 700, padding: "3px 8px", borderRadius: 6, background: "rgba(255,255,255,.1)", color: "#C7D0FF" }}>Lộ trình</span>
      ) : (
        <button type="button" onClick={() => onCite?.(scene.source_id)} aria-label={`Mở nguồn ${scene.source_id}`} style={{ position: "absolute", top: 14, right: 16, fontSize: 12, fontWeight: 700, padding: "3px 8px", borderRadius: 6, background: "#3A2A0E", color: "#F5C26B", border: "1px solid #5C4417" }}>
          {scene.source_id}
        </button>
      )}
      <strong style={{ fontSize: "clamp(18px, 3.2vw, 34px)", lineHeight: 1.2, maxWidth: "90%" }}>{scene.headline}</strong>
      {scene.big && (
        isCode ? (
          <pre className="mono" style={{ margin: 0, padding: "12px 16px", borderRadius: 10, background: "rgba(0,0,0,.35)", color: "#E2E8F0", fontSize: "clamp(12px, 1.6vw, 17px)", whiteSpace: "pre-wrap", overflowWrap: "anywhere", maxWidth: "92%" }}>{scene.big}</pre>
        ) : (
          <blockquote style={{ margin: 0, paddingLeft: 14, borderLeft: "3px solid #F5C26B", fontSize: "clamp(13px, 1.7vw, 19px)", color: "#E6EAF2", maxWidth: "88%" }}>“{scene.big}”</blockquote>
        )
      )}
      {scene.visual && <span style={{ position: "absolute", bottom: 14, left: 20, fontSize: 12, color: "#8C97C9", fontStyle: "italic" }}>Hình: {scene.visual}</span>}
    </div>
  );
}

export function VideoPlayer({ scenes, title, sources, onCite }: { scenes: Scene[]; title: string; sources: Source[]; onCite: (id: string) => void }) {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [captions, setCaptions] = useState(true);
  const [muted, setMuted] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  // Tăng mỗi lần chọn chương để effect phát chạy lại cả khi chọn đúng chương đang phát.
  const [run, setRun] = useState(0);
  const timer = useRef<number | null>(null);
  const tick = useRef<number | null>(null);
  const hasSpeech = typeof window !== "undefined" && "speechSynthesis" in window;
  const total = scenes.reduce((sum, s) => sum + s.dur, 0);
  const before = scenes.slice(0, index).reduce((sum, s) => sum + s.dur, 0);

  const clear = useCallback(() => {
    if (timer.current) window.clearTimeout(timer.current);
    if (tick.current) window.clearInterval(tick.current);
    timer.current = null;
    tick.current = null;
    if (hasSpeech) window.speechSynthesis.cancel();
  }, [hasSpeech]);

  useEffect(() => clear, [clear]);

  useEffect(() => {
    if (!playing) {
      clear();
      return;
    }
    const scene = scenes[index];
    if (!scene) return;
    // Mỗi lượt phát một cảnh có cờ riêng: callback của lượt đã huỷ (onend/onerror khi cancel) bị bỏ qua.
    let cancelled = false;
    const startedAt = Date.now();
    tick.current = window.setInterval(() => setElapsed(Math.min(scene.dur, (Date.now() - startedAt) / 1000)), 200);
    const advance = () => {
      if (cancelled) return;
      if (index < scenes.length - 1) {
        setElapsed(0);
        setIndex((i) => i + 1);
      }
      else {
        setPlaying(false);
        setElapsed(scene.dur);
      }
    };
    if (hasSpeech && !muted) {
      const utter = new SpeechSynthesisUtterance(scene.narration);
      utter.lang = "vi-VN";
      const voice = pickVoice();
      if (voice) utter.voice = voice;
      utter.rate = 1;
      utter.onend = advance;
      utter.onerror = () => {
        if (cancelled) return;
        timer.current = window.setTimeout(advance, scene.dur * 1000);
      };
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utter);
    } else {
      timer.current = window.setTimeout(advance, scene.dur * 1000);
    }
    return () => {
      cancelled = true;
      clear();
    };
  }, [playing, index, run, muted, scenes, hasSpeech, clear]);

  const jump = (i: number) => {
    setIndex(Math.max(0, Math.min(scenes.length - 1, i)));
    setElapsed(0);
    setRun((n) => n + 1);
  };

  const download = () => {
    const blob = new Blob([toSrt(scenes)], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "newlearn-video-phu-de.srt";
    a.click();
    URL.revokeObjectURL(url);
  };

  const scene = scenes[index];
  const sourceTitle = (id: string) => sources.find((s) => s.id === id)?.title ?? id;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 300px", gap: 20, alignItems: "start" }} className="player-grid">
      <style>{`@media (max-width:900px){.player-grid{grid-template-columns:minmax(0,1fr)!important}}`}</style>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, minWidth: 0 }}>
        <div style={{ position: "relative" }}>
          {scene && <Slide scene={scene} title={title} onCite={onCite} />}
          {captions && scene && (
            <div aria-live="polite" style={{ position: "absolute", left: "6%", right: "6%", bottom: 40, textAlign: "center" }}>
              <span style={{ display: "inline", padding: "4px 10px", borderRadius: 6, background: "rgba(0,0,0,.72)", color: "#fff", fontSize: "clamp(12px,1.5vw,16px)", lineHeight: 1.7, boxDecorationBreak: "clone", WebkitBoxDecorationBreak: "clone" }}>{scene.narration}</span>
            </div>
          )}
        </div>
        <div style={{ height: 6, borderRadius: 999, background: "var(--surface2)", overflow: "hidden" }} role="progressbar" aria-label="Tiến độ video" aria-valuemin={0} aria-valuemax={total} aria-valuenow={Math.round(before + elapsed)}>
          <div style={{ height: "100%", width: `${total ? ((before + elapsed) / total) * 100 : 0}%`, background: "var(--primary)" }} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <button type="button" className="icon-btn t" onClick={() => jump(index - 1)} disabled={index === 0} aria-label="Cảnh trước"><SkipBack aria-hidden /></button>
          <button type="button" className="btn btn-p t" onClick={() => setPlaying((p) => !p)} aria-label={playing ? "Tạm dừng" : "Phát"} style={{ minWidth: 104 }}>
            {playing ? <Pause aria-hidden /> : <Play aria-hidden />}
            {playing ? "Tạm dừng" : "Phát"}
          </button>
          <button type="button" className="icon-btn t" onClick={() => jump(index + 1)} disabled={index === scenes.length - 1} aria-label="Cảnh sau"><SkipForward aria-hidden /></button>
          <span className="hint mono" style={{ marginLeft: 4 }}>{duration(before + elapsed)} / {duration(total)}</span>
          <div style={{ flex: 1 }} />
          {hasSpeech && (
            <button type="button" className="icon-btn t" onClick={() => setMuted((m) => !m)} aria-label={muted ? "Bật giọng đọc" : "Tắt giọng đọc"} aria-pressed={muted}>
              {muted ? <VolumeX aria-hidden /> : <Volume2 aria-hidden />}
            </button>
          )}
          <button type="button" className="icon-btn t" onClick={() => setCaptions((c) => !c)} aria-label={captions ? "Tắt phụ đề" : "Bật phụ đề"} aria-pressed={captions}>
            {captions ? <Captions aria-hidden /> : <CaptionsOff aria-hidden />}
          </button>
          <button type="button" className="btn btn-s btn-sm t" onClick={download}><Download aria-hidden />Tải phụ đề</button>
        </div>
        {!hasSpeech && <p className="hint">Trình duyệt này không có giọng đọc, video chạy theo phụ đề và thời lượng từng cảnh.</p>}
      </div>
      <nav aria-label="Chương" className="card" style={{ padding: 8, display: "flex", flexDirection: "column", gap: 2, boxShadow: "none" }}>
        <span className="eyebrow" style={{ padding: "8px 10px" }}>Chương</span>
        {scenes.map((s, i) => (
          <button key={i} type="button" className={`row-btn t ${i === index ? "on" : ""}`} onClick={() => jump(i)} aria-current={i === index ? "true" : undefined} style={{ alignItems: "flex-start" }}>
            <span className="mono hint" style={{ minWidth: 38 }}>{duration(scenes.slice(0, i).reduce((sum, x) => sum + x.dur, 0))}</span>
            <span style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
              <span style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.35 }}>{s.headline}</span>
              <span className="hint">{s.kind}{s.source_id !== "plan" ? ` · ${s.source_id} ${sourceTitle(s.source_id).slice(0, 28)}` : ""}</span>
            </span>
          </button>
        ))}
      </nav>
    </div>
  );
}
