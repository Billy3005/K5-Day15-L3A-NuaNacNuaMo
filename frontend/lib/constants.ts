import type { CreateCourseRequest, LearnerGroup } from "../types/course";

export const LEARNER_GROUP_OPTIONS: ReadonlyArray<{
  value: LearnerGroup;
  label: string;
}> = [
  { value: "middle_school", label: "Học sinh THCS" },
  { value: "high_school", label: "Học sinh THPT" },
  { value: "university", label: "Sinh viên" },
  { value: "working_adult", label: "Người đi làm" },
];

export const SQL_EXAMPLE_INPUT: CreateCourseRequest = {
  learner_group: "university",
  topic: "SQL",
  goal: "Phân tích doanh thu cho bài tập nhóm",
  level: "Biết Excel, mới học SQL",
  minutes_per_day: 20,
};

