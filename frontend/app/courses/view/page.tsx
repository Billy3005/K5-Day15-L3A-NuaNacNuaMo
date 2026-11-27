import { Suspense } from "react";
import { CourseView } from "../../../components/features/courses/CourseView";

/** /courses/view?id=… (dùng ?id= vì bản build tĩnh không tạo được route cho ID động). */
export default function CourseViewPage() {
  return (
    <Suspense fallback={<p className="mx-auto max-w-3xl px-4 py-12 text-muted sm:px-6">Đang mở khóa…</p>}>
      <CourseView />
    </Suspense>
  );
}
