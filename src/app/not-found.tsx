import Link from "next/link";
export default function NotFound() {
  return (
    <main className="standalone">
      <span className="eyebrow">404 · ĐI LẠC MỘT CHÚT</span>
      <h1>Trang này chưa có ở đây.</h1>
      <p>Cùng quay lại và tìm một cơ hội phù hợp với bạn.</p>
      <Link className="btn primary" href="/">
        Về trang chủ
      </Link>
    </main>
  );
}
