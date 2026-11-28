import "./globals.css";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AppShell } from "../components/shell/AppShell";

export const metadata: Metadata = {
  title: "NewLearn — Lộ trình tự học, mỗi ý đều có nguồn",
  description: "Nhập mục tiêu, nhận lộ trình 5 ngày và bài hôm nay. Mỗi ý giải thích đều gắn nguồn công khai để bạn kiểm chứng.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="vi">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
        />
      </head>
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
