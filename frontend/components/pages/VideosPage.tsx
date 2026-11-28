"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Clapperboard } from "lucide-react";
import { learningApi } from "../../lib/api-client";
import { duration, relativeTime } from "../../lib/format";
import type { Video } from "../../types/learning";
import { EmptyBlock, ErrorBlock, LoadingCard, PageTitle } from "../nl/ui";

export function VideosPage() {
  const [videos, setVideos] = useState<Video[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    learningApi.videos().then(setVideos).catch((e: Error) => setError(e.message || "Chưa tải được thư viện video."));
  }, []);
  useEffect(load, [load]);

  return (
    <div className="page">
      <PageTitle eyebrow="Thư viện" title="Video" desc="Video tóm tắt bài học, mỗi cảnh gắn nguồn của bài." />
      {error && <ErrorBlock message={error} onRetry={() => { setError(null); load(); }} />}
      {!videos && !error && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(min(300px,100%),1fr))", gap: 16 }}>
          <LoadingCard /> <LoadingCard />
        </div>
      )}
      {videos && videos.length === 0 && (
        <EmptyBlock title="Chưa có video nào" desc="Mở một khóa học, vào tab Video để biến bài 1 thành video tóm tắt." action={<Link className="btn btn-s t" href="/courses">Mở khóa học</Link>} />
      )}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(min(300px,100%),1fr))", gap: 16 }}>
        {(videos ?? []).map((v) => (
          <Link key={v.id} href={`/courses/view?id=${encodeURIComponent(v.course_id)}&tab=video&video=${encodeURIComponent(v.id)}`} className="card t" style={{ padding: 0, overflow: "hidden", textDecoration: "none", color: "var(--text)" }}>
            <div className="slide" style={{ borderRadius: 0, display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: 18, gap: 6, background: "radial-gradient(120% 120% at 0% 0%, #26338A 0%, #0F1530 55%, #0B1020 100%)" }}>
              <Clapperboard aria-hidden style={{ position: "absolute", top: 16, left: 16, width: 22, height: 22, color: "#AAB6F5" }} />
              <span style={{ position: "absolute", top: 14, right: 14, fontSize: 12, fontWeight: 700, padding: "3px 8px", borderRadius: 6, background: "rgba(0,0,0,.45)", color: "#fff" }} className="mono">{duration(v.duration_s)}</span>
              <strong style={{ fontSize: 18, lineHeight: 1.25 }}>{v.scenes[0]?.headline ?? "Video tóm tắt"}</strong>
            </div>
            <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 8 }}>
              <strong style={{ fontSize: 15, overflowWrap: "anywhere" }}>{v.course_title} · Ngày {v.day}</strong>
              <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                {v.status === "ready" ? <span className="badge ok">Sẵn sàng</span> : <span className="badge warn">Bản nháp kịch bản</span>}
                <span className="badge">{v.scenes.length} cảnh</span>
                <span className="hint">{relativeTime(v.updated_at)}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
