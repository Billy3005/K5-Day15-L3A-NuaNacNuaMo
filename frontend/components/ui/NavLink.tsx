"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { cn } from "../../lib/utils";

/** Link điều hướng ở header, tự đánh dấu trang đang mở. */
export function NavLink({ href, children }: { href: string; children: ReactNode }) {
  const pathname = usePathname();
  const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "inline-flex min-h-11 items-center whitespace-nowrap rounded-lg px-2.5 text-[15px] font-semibold transition-colors sm:px-3 sm:text-[16px]",
        active ? "bg-action-soft text-action" : "text-muted hover:bg-page hover:text-ink",
      )}
    >
      {children}
    </Link>
  );
}
