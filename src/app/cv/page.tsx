import Link from "next/link";
import { currentUser } from "@/lib/auth";
import { query, asProfile } from "@/lib/db";
import { styles } from "@/lib/types";
import PrintButton from "./print";
export const dynamic = "force-dynamic";
export default async function CV() {
  const user = await currentUser();
  if (!user || user.role !== "candidate")
    return (
      <main className="standalone">
        <h1>CV dành cho ứng viên</h1>
        <p>Đăng nhập tài khoản ứng viên để tạo CV từ hồ sơ.</p>
        <Link href="/dang-nhap?next=/cv" className="btn primary">
          Đăng nhập
        </Link>
      </main>
    );
  const rows = await query("SELECT * FROM profiles WHERE user_id=?", [user.id]);
  const profile = asProfile(rows[0]);
  return (
    <main className="cv-page">
      <div className="cv-toolbar">
        <Link href="/ho-so" className="text-link">
          ← Về hồ sơ
        </Link>
        <PrintButton />
      </div>
      <article className="cv-paper">
        <header>
          <div className="cv-monogram">{user.name.slice(0, 1)}</div>
          <h1>{user.name}</h1>
          <h2>{profile.headline || "Mục tiêu nghề nghiệp"}</h2>
          <p>
            {user.email}
            {profile.location ? ` · ${profile.location}` : ""}
          </p>
        </header>
        <section>
          <h3>Kinh nghiệm & dự án</h3>
          <p className="multiline">
            {profile.experience ||
              "Bổ sung kinh nghiệm trong hồ sơ để bản CV đầy đủ hơn."}
          </p>
        </section>
        <section>
          <h3>Kỹ năng</h3>
          <div className="chips">
            {profile.skills.map((s) => (
              <span key={s}>{s}</span>
            ))}
          </div>
        </section>
        <section>
          <h3>Phong cách làm việc</h3>
          <p>{styles[profile.work_style]}</p>
        </section>
        <footer>Hồ sơ được tạo cùng Hợp Việc</footer>
      </article>
    </main>
  );
}
