"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { ApiClientError, createCourse } from "../../../lib/api-client";
import { USE_FIXTURE } from "../../../lib/config";
import { LEARNER_GROUP_OPTIONS, SQL_EXAMPLE_INPUT } from "../../../lib/constants";
import {
  firstInvalidField,
  LIMITS,
  toRequest,
  validateForm,
  type FormErrors,
  type FormValues,
} from "../../../lib/validation";
import type { ErrorCode, ErrorDetail, ErrorField } from "../../../types/course";
import { Button } from "../../ui/Button";
import { CONTROL_CLASS, Field } from "../../ui/Field";
import { StatusMessage } from "./StatusMessage";

const EMPTY: FormValues = { learner_group: "university", topic: "", goal: "", level: "", minutes_per_day: "" };

/** Câu dẫn đứng trước thông điệp của server. Nội dung chính luôn là message server trả về. */
const LEAD_IN: Partial<Record<ErrorCode, string>> = {
  CLARIFICATION_REQUIRED: "Cần bạn nói rõ thêm một chút:",
  INSUFFICIENT_SOURCES: "Chưa soạn được vì thiếu nguồn:",
  OUT_OF_SCOPE: "Chủ đề này chưa được hỗ trợ:",
  REFUSED: "Yêu cầu này chưa thể thực hiện:",
};

const UNAVAILABLE =
  "Chưa tạo được lộ trình lúc này. Thông tin bạn nhập vẫn còn nguyên, bấm Thử lại khi sẵn sàng.";

/** Thông báo cho cả form, dùng khi lỗi không gắn với một trường. */
interface Banner {
  message: string;
  canRetry: boolean;
}

export function CourseForm({ headingId }: { headingId?: string }) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const bannerRef = useRef<HTMLDivElement>(null);
  // ref đổi ngay lập tức, chặn được hai lần gửi trong cùng một nhịp trước khi nút kịp khóa.
  const submittingRef = useRef(false);
  const [values, setValues] = useState<FormValues>(EMPTY);
  const [errors, setErrors] = useState<FormErrors>({});
  // Yêu cầu đưa focus. Chỉ tạo khi gửi form hoặc nhận lỗi, nên đang gõ không bị nhảy focus.
  const [focusRequest, setFocusRequest] = useState<{ target: ErrorField | "banner" } | null>(null);
  const [banner, setBanner] = useState<Banner | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!focusRequest) return;
    if (focusRequest.target === "banner") {
      bannerRef.current?.focus();
      return;
    }
    const control = formRef.current?.elements.namedItem(focusRequest.target);
    (control as HTMLElement | null)?.focus();
  }, [focusRequest]);

  function update(name: ErrorField, value: string) {
    setValues((previous) => ({ ...previous, [name]: value }));
    setErrors((previous) => ({ ...previous, [name]: undefined }));
    setBanner(null);
  }

  function fillExample() {
    setValues({ ...SQL_EXAMPLE_INPUT, minutes_per_day: String(SQL_EXAMPLE_INPUT.minutes_per_day) });
    setErrors({});
    setBanner(null);
  }

  /** Đặt lỗi server đúng chỗ. Không đụng tới values, nên dữ liệu đã nhập được giữ nguyên. */
  function showServerError(detail: ErrorDetail | null) {
    if (!detail || detail.code === "UPSTREAM_UNAVAILABLE") {
      setBanner({ message: UNAVAILABLE, canRetry: true });
      setFocusRequest({ target: "banner" });
      return;
    }
    const message = [LEAD_IN[detail.code], detail.message].filter(Boolean).join(" ");
    const field = detail.field ?? (detail.code === "CLARIFICATION_REQUIRED" ? "goal" : undefined);
    if (field) {
      setErrors({ [field]: message });
      setFocusRequest({ target: field });
    } else {
      setBanner({ message, canRetry: false });
      setFocusRequest({ target: "banner" });
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submittingRef.current) return;
    setBanner(null);

    const found = validateForm(values);
    setErrors(found);
    const first = firstInvalidField(found);
    if (first) {
      setFocusRequest({ target: first });
      return;
    }

    submittingRef.current = true;
    setLoading(true);
    try {
      const course = await createCourse(toRequest(values), { fixture: USE_FIXTURE });
      // Giữ trạng thái đang tạo cho đến khi chuyển trang, tránh gửi trùng.
      router.push(`/courses/view?id=${encodeURIComponent(course.id)}`);
    } catch (error) {
      submittingRef.current = false;
      setLoading(false);
      showServerError(error instanceof ApiClientError ? error.detail : null);
    }
  }

  const MINUTE_PRESETS = ["15", "20", "30", "45"];

  return (
    <form ref={formRef} onSubmit={handleSubmit} noValidate>
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line-soft px-5 py-5 sm:px-7">
        <div>
          <h2 id={headingId} className="text-[21px] font-bold tracking-tight">
            Tạo lộ trình của bạn
          </h2>
          <p className="mt-0.5 text-[15px] text-muted">
            Chưa biết điền gì?{" "}
            <button
              type="button"
              onClick={fillExample}
              disabled={loading}
              className="-my-2.5 inline-flex min-h-11 items-center rounded font-semibold text-action underline-offset-4 hover:underline disabled:opacity-60"
            >
              Dùng ví dụ SQL
            </button>
          </p>
        </div>
        {USE_FIXTURE && (
          <span
            title="Hệ thống luôn trả bài SQL mẫu, chưa soạn theo nội dung bạn nhập."
            className="inline-flex items-center gap-1.5 rounded-full bg-note px-3 py-1 text-[13px] font-semibold text-note-ink"
          >
            <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-note-ink/70" />
            Dữ liệu mẫu
            <span className="sr-only">: hệ thống luôn trả bài SQL mẫu, chưa soạn theo nội dung bạn nhập.</span>
          </span>
        )}
      </div>

      <div className="space-y-5 px-5 py-6 sm:px-7">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field id="learner_group" label="Bạn đang là ai?" error={errors.learner_group}>
            {(control) => (
              <div className="relative">
                <select
                  {...control}
                  name="learner_group"
                  value={values.learner_group}
                  onChange={(event) => update("learner_group", event.target.value)}
                  className={`${CONTROL_CLASS} appearance-none pr-10`}
                >
                  {LEARNER_GROUP_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <svg
                  aria-hidden="true"
                  viewBox="0 0 20 20"
                  className="pointer-events-none absolute right-3 top-1/2 mt-0.5 h-4 w-4 -translate-y-1/2 text-muted"
                >
                  <path d="M5 7.5l5 5 5-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            )}
          </Field>

          <Field id="topic" label="Chủ đề" error={errors.topic}>
            {(control) => (
              <input
                {...control}
                name="topic"
                type="text"
                maxLength={LIMITS.topic}
                placeholder="VD: SQL, Git, xác suất"
                value={values.topic}
                onChange={(event) => update("topic", event.target.value)}
                className={CONTROL_CLASS}
              />
            )}
          </Field>
        </div>

        <Field id="goal" label="Mục tiêu" hint="Càng cụ thể, lộ trình càng sát với bạn." error={errors.goal}>
          {(control) => (
            <textarea
              {...control}
              name="goal"
              rows={2}
              maxLength={LIMITS.goal}
              placeholder="VD: đọc được báo cáo doanh thu bằng SQL cho bài tập nhóm"
              value={values.goal}
              onChange={(event) => update("goal", event.target.value)}
              className={`${CONTROL_CLASS} resize-y`}
            />
          )}
        </Field>

        <div className="grid gap-5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <Field id="level" label="Trình độ hiện tại" error={errors.level}>
            {(control) => (
              <input
                {...control}
                name="level"
                type="text"
                maxLength={LIMITS.level}
                placeholder="VD: biết Excel, mới học SQL"
                value={values.level}
                onChange={(event) => update("level", event.target.value)}
                className={CONTROL_CLASS}
              />
            )}
          </Field>

          <Field
            id="minutes_per_day"
            label="Thời gian mỗi ngày"
            error={errors.minutes_per_day}
          >
            {(control) => (
              <div>
                <div className="relative">
                  <input
                    {...control}
                    name="minutes_per_day"
                    type="text"
                    inputMode="numeric"
                    placeholder="20"
                    value={values.minutes_per_day}
                    onChange={(event) => update("minutes_per_day", event.target.value)}
                    className={`${CONTROL_CLASS} pr-16`}
                  />
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute right-3.5 top-1/2 mt-0.5 -translate-y-1/2 text-[15px] text-muted"
                  >
                    phút
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap gap-x-1.5 gap-y-3" role="group" aria-label="Chọn nhanh số phút mỗi ngày">
                  {MINUTE_PRESETS.map((value) => {
                    const active = values.minutes_per_day === value;
                    return (
                      <button
                        key={value}
                        type="button"
                        aria-pressed={active}
                        onClick={() => update("minutes_per_day", value)}
                        className="group -my-1.5 inline-flex min-h-11 min-w-11 items-center justify-center rounded-full"
                      >
                        <span
                          className={
                            "flex min-h-8 min-w-11 items-center justify-center rounded-full border px-3 text-[14px] font-semibold transition-colors " +
                            (active
                              ? "border-action bg-action text-white"
                              : "border-line-soft bg-page text-muted group-hover:border-action/40 group-hover:text-action")
                          }
                        >
                          {value}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </Field>
        </div>
      </div>

      <div className="rounded-b-2xl border-t border-line-soft bg-page/60 px-5 py-5 sm:px-7">
        <Button type="submit" disabled={loading} className="min-h-12 w-full text-[17px]">
          {loading ? "Đang tạo…" : (
            <>
              Tạo lộ trình <span aria-hidden="true">→</span>
            </>
          )}
        </Button>
        <p className="mt-2.5 text-center text-[14px] text-muted">Khóa được lưu lại để bạn mở lại bất cứ lúc nào.</p>

        <div aria-live="polite" className="empty:hidden">
          {loading && (
            <p className="mt-3 flex items-center justify-center gap-2 text-[15px] text-muted">
              <span aria-hidden="true" className="h-2 w-2 animate-pulse rounded-full bg-action" />
              Đang tìm nguồn và soạn bài cho bạn… thường mất khoảng nửa phút.
            </p>
          )}
          {banner && (
            <div ref={bannerRef} tabIndex={-1} className="mt-4">
              <StatusMessage tone="error" action={banner.canRetry && <Button type="submit">Thử lại</Button>}>
                {banner.message}
              </StatusMessage>
            </div>
          )}
        </div>
      </div>
    </form>
  );
}
