"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { LEARNER_GROUP_OPTIONS, SQL_EXAMPLE_INPUT } from "../../../lib/constants";
import { firstInvalidField, LIMITS, validateForm, type FormErrors, type FormValues } from "../../../lib/validation";
import type { ErrorField } from "../../../types/course";
import { Button } from "../../ui/Button";
import { CONTROL_CLASS, Field } from "../../ui/Field";

const EMPTY: FormValues = { learner_group: "university", topic: "", goal: "", level: "", minutes_per_day: "" };

export function CourseForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [values, setValues] = useState<FormValues>(EMPTY);
  const [errors, setErrors] = useState<FormErrors>({});
  // Yêu cầu đưa focus vào một trường. Chỉ tạo khi gửi form, nên đang gõ không bị nhảy focus.
  const [focusRequest, setFocusRequest] = useState<{ field: ErrorField } | null>(null);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (!focusRequest) return;
    const control = formRef.current?.elements.namedItem(focusRequest.field);
    (control as HTMLElement | null)?.focus();
  }, [focusRequest]);

  function update(name: ErrorField, value: string) {
    setValues((previous) => ({ ...previous, [name]: value }));
    setErrors((previous) => ({ ...previous, [name]: undefined }));
    setNotice("");
  }

  function fillExample() {
    setValues({ ...SQL_EXAMPLE_INPUT, minutes_per_day: String(SQL_EXAMPLE_INPUT.minutes_per_day) });
    setErrors({});
    setNotice("");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const found = validateForm(values);
    setErrors(found);
    const first = firstInvalidField(found);
    if (first) {
      setFocusRequest({ field: first });
      return;
    }
    setNotice("Thông tin hợp lệ. Phần gửi sẽ được nối ở bước tiếp theo.");
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} noValidate className="space-y-5">
      <Button variant="secondary" onClick={fillExample}>
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

      <Button type="submit" className="w-full sm:w-auto">
        Tạo lộ trình
      </Button>

      <p aria-live="polite" className="text-muted">
        {notice}
      </p>
    </form>
  );
}
