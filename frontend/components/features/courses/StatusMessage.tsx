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
    <div
      className={cn(
        "rounded-xl border p-5",
        tone === "error" ? "border-error/30 bg-error-soft" : "border-line-soft bg-paper shadow-card",
      )}
    >
      <p className={cn("leading-relaxed", tone === "error" && "font-semibold text-error")}>{children}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
