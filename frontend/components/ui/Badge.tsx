import type { ComponentProps } from "react";
import { cn } from "../../lib/utils";

/** Nhãn trạng thái có chữ, nền vàng nhạt. */
export function Badge({ className, ...props }: ComponentProps<"span">) {
  return (
    <span
      className={cn("inline-block rounded-lg bg-note px-3 py-1 text-[15px] font-semibold text-note-ink", className)}
      {...props}
    />
  );
}
