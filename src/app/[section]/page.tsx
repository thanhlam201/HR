import App from "@/components/App";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
const sections: Record<string, string> = {
  "viec-lam": "Việc làm",
  "ho-so": "CV / Hồ sơ",
  "cong-cu": "Công cụ",
  "do-phu-hop": "Đánh giá mức độ phù hợp",
  "dang-nhap": "Đăng nhập",
  "dang-ky": "Đăng ký",
  "nha-tuyen-dung": "Nhà tuyển dụng",
  "dang-tin": "Đăng tin tuyển dụng",
};
export const dynamic = "force-dynamic";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ section: string }>;
}): Promise<Metadata> {
  return { title: sections[(await params).section] || "Hợp Việc" };
}
export default async function Page({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  if (!sections[section]) notFound();
  return <App view={section} />;
}
