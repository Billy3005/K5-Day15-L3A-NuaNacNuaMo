import { Suspense } from "react";
import { CreatePage } from "../../components/pages/CreatePage";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <CreatePage />
    </Suspense>
  );
}
