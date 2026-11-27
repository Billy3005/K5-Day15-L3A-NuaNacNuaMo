import "@fontsource/source-sans-3/400.css";
import "@fontsource/source-sans-3/600.css";
import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Lộ trình tự học",
  description: "Tạo lộ trình tự học 5 ngày và bài đầu có trích dẫn nguồn công khai.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="vi">
      <body className="min-h-screen bg-page font-sans text-ink antialiased">
        <header className="border-b border-line bg-paper">
          <nav aria-label="Chính" className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-x-4 px-4 py-2">
            <Link href="/" className="inline-flex min-h-11 items-center text-xl font-semibold">
              Lộ trình tự học
            </Link>
            <Link href="/courses" className="inline-flex min-h-11 items-center font-semibold text-action underline underline-offset-4">
              Khóa đã lưu
            </Link>
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}
