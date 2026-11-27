import type { ComponentProps } from "react";
import { cn } from "../../lib/utils";

/** Khối trắng viền mảnh, bóng rất nhẹ. */
export function Card({ className, ...props }: ComponentProps<"div">) {
  return (
    <div className={cn("rounded-2xl border border-line-soft bg-paper p-5 shadow-card sm:p-7", className)} {...props} />
  );
}
