import type { ComponentProps } from "react";
import { cn } from "../../lib/utils";

/** Khối trắng viền mảnh, không đổ bóng. */
export function Card({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("rounded-lg border border-line bg-paper p-4 sm:p-6", className)} {...props} />;
}
