import type { Metadata } from "next";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import "@fontsource/inter/800.css";
import "./globals.css";
import "./design.css";
export const metadata: Metadata = {
  title: {
    default: "Hợp Việc — Đúng công việc. Hợp chính mình.",
    template: "%s | Hợp Việc",
  },
  description:
    "Kết nối ứng viên và nhà tuyển dụng qua kỹ năng, phong cách làm việc và sự thấu hiểu. Tìm việc, tạo hồ sơ CV và khám phá độ phù hợp cùng Hợp Việc.",
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" data-scroll-behavior="smooth">
      <body>{children}</body>
    </html>
  );
}
