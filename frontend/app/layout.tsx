import "@fontsource/source-sans-3/400.css";
import "@fontsource/source-sans-3/600.css";
import "@fontsource/source-sans-3/700.css";
import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { LogoMark } from "../components/ui/Logo";
import { NavLink } from "../components/ui/NavLink";

export const metadata: Metadata = {
  title: "Lộ trình tự học",
  description: "Tạo lộ trình tự học 5 ngày và bài đầu có trích dẫn nguồn công khai.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="vi">
      <body className="flex min-h-screen flex-col bg-page font-sans text-ink antialiased">
        <a
          href="#noi-dung"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-paper focus:px-4 focus:py-2 focus:shadow-card"
        >
          Bỏ qua, tới nội dung chính
        </a>

        <header className="sticky top-0 z-40 border-b border-line-soft bg-paper/90 backdrop-blur">
          <nav aria-label="Chính" className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-2 sm:px-6">
            <Link href="/" aria-label="Lộ trình tự học, về trang chủ" className="inline-flex min-h-11 min-w-11 shrink-0 items-center gap-2.5 rounded-lg">
              <LogoMark />
              <span className="hidden whitespace-nowrap text-[19px] font-bold tracking-tight min-[420px]:inline">Lộ trình tự học</span>
            </Link>
            <div className="flex items-center gap-1">
              <NavLink href="/">Tạo mới</NavLink>
              <NavLink href="/courses">Khóa đã lưu</NavLink>
            </div>
          </nav>
        </header>

        <div id="noi-dung" className="flex-1">
          {children}
        </div>

        <footer className="border-t border-line-soft">
          <div className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-6 text-[15px] text-muted sm:flex-row sm:justify-between sm:px-6">
            <p>Phần giải thích trong bài có trích nguồn để bạn tự kiểm chứng.</p>
            <p>Mini Hackathon AI20K · nhóm Nửa Nạc Nửa Mỡ</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
