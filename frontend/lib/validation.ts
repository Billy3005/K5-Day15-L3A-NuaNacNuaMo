import type { CreateCourseRequest, ErrorField, LearnerGroup } from "../types/course";
import { LEARNER_GROUP_OPTIONS } from "./constants";

/** Chép từ docs/openapi.json → components.schemas.CreateCourse. Đổi hợp đồng thì sửa ở đây. */
export const LIMITS = {
  topic: 120,
  goal: 500,
  level: 250,
  minutesMin: 1,
  minutesMax: 240,
} as const;

/** Ô nhập trên form luôn giữ chuỗi; chỉ đổi sang số khi gửi. */
export type FormValues = Record<ErrorField, string>;
export type FormErrors = Partial<Record<ErrorField, string>>;

/** Thứ tự hiển thị, cũng là thứ tự tìm "trường lỗi đầu tiên". */
export const FIELD_ORDER: ErrorField[] = ["learner_group", "topic", "goal", "level", "minutes_per_day"];

const REQUIRED_TEXT = [
  { name: "topic", empty: "Bạn chưa nhập chủ đề.", label: "Chủ đề" },
  { name: "goal", empty: "Bạn chưa nhập mục tiêu.", label: "Mục tiêu" },
  { name: "level", empty: "Bạn chưa nhập trình độ hiện tại.", label: "Trình độ" },
] as const;

/** Kiểm ở trình duyệt để báo sớm. Backend vẫn kiểm lại. */
export function validateForm(values: FormValues): FormErrors {
  const errors: FormErrors = {};

  if (!LEARNER_GROUP_OPTIONS.some((option) => option.value === values.learner_group)) {
    errors.learner_group = "Bạn hãy chọn nhóm người học.";
  }

  for (const { name, empty, label } of REQUIRED_TEXT) {
    const text = values[name].trim();
    if (!text) errors[name] = empty;
    else if (text.length > LIMITS[name]) errors[name] = `${label} tối đa ${LIMITS[name]} ký tự.`;
  }

  const minutes = values.minutes_per_day.trim();
  const isWholeNumber = /^\d+$/.test(minutes);
  if (!isWholeNumber || Number(minutes) < LIMITS.minutesMin || Number(minutes) > LIMITS.minutesMax) {
    errors.minutes_per_day = `Nhập số phút nguyên từ ${LIMITS.minutesMin} đến ${LIMITS.minutesMax}.`;
  }

  return errors;
}

export function firstInvalidField(errors: FormErrors): ErrorField | undefined {
  return FIELD_ORDER.find((name) => errors[name]);
}

/** Chỉ gọi sau khi validateForm không còn lỗi. */
export function toRequest(values: FormValues): CreateCourseRequest {
  return {
    learner_group: values.learner_group as LearnerGroup,
    topic: values.topic.trim(),
    goal: values.goal.trim(),
    level: values.level.trim(),
    minutes_per_day: Number(values.minutes_per_day), // backend chỉ nhận số, không nhận chuỗi
  };
}
