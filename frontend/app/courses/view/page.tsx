import { CourseDetail } from "../../../components/features/courses/CourseDetail";
import { SAMPLE_COURSE } from "../../../lib/fixtures";

export default function CourseViewPage() {
  return <CourseDetail course={SAMPLE_COURSE} />;
}
