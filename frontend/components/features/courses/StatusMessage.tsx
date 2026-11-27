import type { ReactNode } from "react";
import { cn } from "../../../lib/utils";

interface StatusMessageProps {
  tone?: "info" | "error";
  children: ReactNode;
  /** Nút hoặc link giúp người dùng đi tiếp. */
  action?: ReactNode;
}

/** Khung thông báo dùng chung cho đang tải, lỗi và trạng thái rỗng. Vùng aria-live đặt ở nơi gọi. */
export function StatusMessage({ tone = "info", children, action }: StatusMessageProps) {
  return (
    <div className={cn("rounded-lg border bg-paper p-4", tone === "error" ? "border-error" : "border-line")}>
      <p className={cn(tone === "error" && "text-error")}>{children}</p>
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}
