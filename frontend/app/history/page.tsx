import { Suspense } from "react";
import { HistoryPage } from "../../components/pages/HistoryPage";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <HistoryPage />
    </Suspense>
  );
}
