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
import { Badge } from "../../ui/Badge";
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

export function CourseForm() {
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

  return (
    <form ref={formRef} onSubmit={handleSubmit} noValidate className="space-y-5">
      {USE_FIXTURE && (
        <Badge className="block">
          Chế độ dữ liệu mẫu: hệ thống luôn trả bài SQL mẫu, chưa soạn theo nội dung bạn nhập.
        </Badge>
      )}

      <Button variant="secondary" onClick={fillExample} disabled={loading}>
        Dùng ví dụ SQL
      </Button>

      <Field id="learner_group" label="Bạn đang là ai?" error={errors.learner_group}>
        {(control) => (
          <select
            {...control}
            name="learner_group"
            value={values.learner_group}
            onChange={(event) => update("learner_group", event.target.value)}
            className={CONTROL_CLASS}
          >
            {LEARNER_GROUP_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )}
      </Field>

      <Field id="topic" label="Chủ đề" hint="Ví dụ: SQL, Git, xác suất." error={errors.topic}>
        {(control) => (
          <input
            {...control}
            name="topic"
            type="text"
            maxLength={LIMITS.topic}
            value={values.topic}
            onChange={(event) => update("topic", event.target.value)}
            className={CONTROL_CLASS}
          />
        )}
      </Field>

      <Field
        id="goal"
        label="Mục tiêu"
        hint="Càng cụ thể càng tốt, ví dụ: đọc được báo cáo doanh thu bằng SQL."
        error={errors.goal}
      >
        {(control) => (
          <textarea
            {...control}
            name="goal"
            rows={3}
            maxLength={LIMITS.goal}
            value={values.goal}
            onChange={(event) => update("goal", event.target.value)}
            className={CONTROL_CLASS}
          />
        )}
      </Field>

      <Field id="level" label="Trình độ hiện tại" hint="Ví dụ: biết Excel, mới học SQL." error={errors.level}>
        {(control) => (
          <input
            {...control}
            name="level"
            type="text"
            maxLength={LIMITS.level}
            value={values.level}
            onChange={(event) => update("level", event.target.value)}
            className={CONTROL_CLASS}
          />
        )}
      </Field>

      <Field
        id="minutes_per_day"
        label="Phút học mỗi ngày"
        hint={`Từ ${LIMITS.minutesMin} đến ${LIMITS.minutesMax} phút.`}
        error={errors.minutes_per_day}
      >
        {(control) => (
          <input
            {...control}
            name="minutes_per_day"
            type="text"
            inputMode="numeric"
            value={values.minutes_per_day}
            onChange={(event) => update("minutes_per_day", event.target.value)}
            className={CONTROL_CLASS}
          />
        )}
      </Field>

      <Button type="submit" disabled={loading} className="w-full sm:w-auto">
        {loading ? "Đang tạo…" : "Tạo lộ trình"}
      </Button>

      <div aria-live="polite">
        {loading && <p className="text-muted">Đang tìm nguồn và soạn bài cho bạn… thường mất khoảng nửa phút.</p>}
        {banner && (
          <div ref={bannerRef} tabIndex={-1}>
            <StatusMessage tone="error" action={banner.canRetry && <Button type="submit">Thử lại</Button>}>
              {banner.message}
            </StatusMessage>
          </div>
        )}
      </div>
    </form>
  );
}
