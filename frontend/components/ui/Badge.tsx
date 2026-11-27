import type { ComponentProps } from "react";
import { cn } from "../../lib/utils";

const TONES = {
  note: "bg-note text-note-ink",
  neutral: "bg-page text-muted border border-line-soft",
  action: "bg-action-soft text-action",
} as const;

type BadgeProps = ComponentProps<"span"> & { tone?: keyof typeof TONES };

/** Nhãn trạng thái luôn có chữ. Mặc định nền vàng nhạt cho "dữ liệu mẫu". */
export function Badge({ className, tone = "note", ...props }: BadgeProps) {
  return (
    <span
      className={cn("inline-flex items-center rounded-full px-3 py-0.5 text-[14px] font-semibold", TONES[tone], className)}
      {...props}
    />
  );
}
