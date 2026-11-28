"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { BookOpen, ClipboardCheck, Clapperboard, ListChecks } from "lucide-react";
import { ApiClientError, getCourse, learningApi } from "../../lib/api-client";
import type { Course } from "../../types/course";
import { EmptyBlock, ErrorBlock, LoadingCard, ModeBadges, ProgressRing } from "../nl/ui";
import { LessonTab } from "../course/LessonTab";
import { PlanTab } from "../course/PlanTab";
import { QuizTab } from "../course/QuizTab";
import { VideoTab } from "../course/VideoTab";

export type TabKey = "plan" | "lesson" | "quiz" | "video";

const TABS: Array<{ key: TabKey; label: string; icon: typeof BookOpen }> = [
  { key: "plan", label: "Lộ trình", icon: ListChecks },
  { key: "lesson", label: "Bài học", icon: BookOpen },
  { key: "quiz", label: "Kiểm tra", icon: ClipboardCheck },
  { key: "video", label: "Video", icon: Clapperboard },
];

export function CoursePage() {
  const params = useSearchParams();
  const id = params.get("id") ?? "";
  const tabParam = params.get("tab") as TabKey | null;
  const tab: TabKey = tabParam && TABS.some((t) => t.key === tabParam) ? tabParam : "plan";
  // key={id}: đổi khóa trên cùng route thì dựng lại toàn bộ state (khóa, lỗi, bài kiểm tra, video đang làm).
  return <CourseView key={id} id={id} tab={tab} videoId={params.get("video")} />;
}

function CourseView({ id, tab, videoId }: { id: string; tab: TabKey; videoId: string | null }) {
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [daysDone, setDaysDone] = useState<number[]>([]);
  const [error, setError] = useState<{ notFound: boolean; message: string } | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const load = useCallback(() => {
    if (!id) return () => undefined;
    let alive = true;
    Promise.all([getCourse(id), learningApi.progress(id)])
      .then(([c, p]) => {
        if (!alive) return;
        setCourse(c);
        setDaysDone(p.days_done);
      })
      .catch((e) => alive && setError({ notFound: e instanceof ApiClientError && e.status === 404, message: e.message || "Chưa tải được khóa học." }));
    return () => {
      alive = false;
    };
  }, [id]);
  useEffect(load, [load]);

  const go = (key: TabKey) => router.replace(`/courses/view?id=${encodeURIComponent(id)}&tab=${key}`, { scroll: false });

  // Đổi từng ngày một (không thay cả danh sách bằng phản hồi), nên phản hồi về muộn không xoá thao tác mới hơn.
  const applyDay = (day: number, done: boolean) =>
    setDaysDone((d) => (done ? [...new Set([...d, day])].sort((a, b) => a - b) : d.filter((x) => x !== day)));

  const toggleDay = async (day: number, done: boolean) => {
    setSaveError(null);
    applyDay(day, done);
    try {
      await learningApi.setDay(id, day, done);
    } catch (e) {
      applyDay(day, !done);
      setSaveError(e instanceof ApiClientError ? e.message : `Chưa lưu được tiến độ ngày ${day}. Bạn thử lại.`);
    }
  };

  if (!id || error?.notFound) {
    return (
      <div className="page">
        <EmptyBlock title="Không tìm thấy khóa này" desc="Khóa có thể đã bị xoá hoặc đường dẫn chưa đúng." action={<Link className="btn btn-s t" href="/courses">Về danh sách khóa học</Link>} />
      </div>
    );
  }
  if (error) return <div className="page"><ErrorBlock message={error.message} onRetry={() => { setError(null); load(); }} /></div>;
  if (!course) return <div className="page"><LoadingCard lines={4} /><LoadingCard lines={6} /></div>;

  return (
    <div className="page" style={{ gap: 20 }}>
      <div style={{ display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap" }}>
        <ProgressRing done={daysDone.length} total={course.plan.length} size={64} />
        <div style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 0, flex: 1 }}>
          <p className="eyebrow">Khóa học · {course.minutes_per_day} phút/ngày</p>
          <h1 className="h1" style={{ overflowWrap: "anywhere" }}>{course.title}</h1>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <ModeBadges mode={course.mode} sourceMode={course.source_mode} />
          </div>
        </div>
      </div>

      <div className="tabs" role="tablist" aria-label="Nội dung khóa học">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button key={key} type="button" role="tab" id={`tab-${key}`} aria-selected={tab === key} aria-controls={`panel-${key}`} className={`tab t ${tab === key ? "on" : ""}`} onClick={() => go(key)}>
            <Icon aria-hidden />
            {label}
          </button>
        ))}
      </div>

      {saveError && <ErrorBlock message={saveError} />}

      <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`}>
        {tab === "plan" && <PlanTab course={course} daysDone={daysDone} onToggle={toggleDay} onOpenLesson={() => go("lesson")} />}
        {tab === "lesson" && <LessonTab course={course} daysDone={daysDone} onToggle={toggleDay} go={go} />}
        {tab === "quiz" && <QuizTab course={course} daysDone={daysDone} onToggle={toggleDay} go={go} />}
        {tab === "video" && <VideoTab course={course} videoId={videoId} />}
      </div>
    </div>
  );
}
