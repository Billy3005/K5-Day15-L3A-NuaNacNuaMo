import type { ComponentProps } from "react";
import { cn } from "../../lib/utils";

const VARIANTS = {
  primary: "bg-action text-white border border-action hover:bg-action-hover hover:border-action-hover",
  secondary: "bg-paper text-ink border border-line hover:border-action hover:text-action",
  soft: "bg-action-soft text-action border border-transparent hover:border-action/30",
  text: "text-action underline-offset-4 hover:underline",
} as const;

type Variant = keyof typeof VARIANTS;
type ButtonProps = ComponentProps<"button"> & { variant?: Variant };

/** Lớp CSS dùng chung cho nút và cho link trông như nút. */
export function buttonClass(variant: Variant = "primary", className?: string) {
  return cn(
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 py-2 font-semibold transition-colors duration-150 disabled:cursor-wait disabled:opacity-60",
    VARIANTS[variant],
    className,
  );
}

/** Nút bấm cao tối thiểu 44px để dễ chạm trên điện thoại. Mặc định type="button". */
export function Button({ variant, type = "button", className, ...props }: ButtonProps) {
  return <button type={type} className={buttonClass(variant, className)} {...props} />;
}
