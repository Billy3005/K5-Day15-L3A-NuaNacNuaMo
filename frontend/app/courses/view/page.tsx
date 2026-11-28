import { Suspense } from "react";
import { CoursePage } from "../../../components/pages/CoursePage";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <CoursePage />
    </Suspense>
  );
}
