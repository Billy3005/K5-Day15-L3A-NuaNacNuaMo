import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Lộ trình tự học",
  description: "Tạo lộ trình tự học 5 ngày và bài đầu có trích dẫn nguồn công khai.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="vi">
      <body className="min-h-screen bg-[#F5F7FB] text-[#172334] antialiased">
        {children}
      </body>
    </html>
  );
}

