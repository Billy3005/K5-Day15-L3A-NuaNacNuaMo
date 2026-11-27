import type { ComponentProps } from "react";
import { cn } from "../../lib/utils";

const VARIANTS = {
  primary: "bg-action text-white border border-action",
  secondary: "bg-paper text-action border border-action",
  text: "text-action underline underline-offset-4",
} as const;

type ButtonProps = ComponentProps<"button"> & { variant?: keyof typeof VARIANTS };

/** Nút bấm cao tối thiểu 44px để dễ chạm trên điện thoại. Mặc định type="button". */
export function Button({ variant = "primary", type = "button", className, ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex min-h-11 items-center justify-center rounded-lg px-4 py-2 font-semibold disabled:cursor-wait disabled:opacity-60",
        VARIANTS[variant],
        className,
      )}
      {...props}
    />
  );
}
