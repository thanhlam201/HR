import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { asJob, asProfile, query } from "@/lib/db";
import {
  createSession,
  currentUser,
  hashPassword,
  logout,
  verifyPassword,
} from "@/lib/auth";
import type { User } from "@/lib/types";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
type Data = Record<string, unknown>;
function text(b: Data, key: string, min = 0, max = 500): string {
  const value = typeof b[key] === "string" ? (b[key] as string).trim() : "";
  if (value.length < min || value.length > max)
    throw new ApiError(
      400,
      `Thông tin ${key} chưa hợp lệ (${min}–${max} ký tự).`,
    );
  return value;
}
function skills(b: Data): string[] {
  if (
    !Array.isArray(b.skills) ||
    b.skills.length > 20 ||
    b.skills.some(
      (s) => typeof s !== "string" || s.trim().length < 1 || s.length > 60,
    )
  )
    throw new ApiError(
      400,
      "Nhập tối đa 20 kỹ năng, mỗi kỹ năng tối đa 60 ký tự.",
    );
  return [...new Set(b.skills.map((s) => s.trim()))];
}
function style(b: Data) {
  if (
    !["collaborative", "independent", "structured", "flexible"].includes(
      String(b.work_style),
    )
  )
    throw new ApiError(400, "Hãy chọn phong cách làm việc.");
  return String(b.work_style);
}
async function body(req: NextRequest): Promise<Data> {
  const reader = req.body?.getReader();
  let total = 0;
  const parts: Uint8Array[] = [];
  if (!reader) throw new ApiError(400, "Thiếu dữ liệu.");
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > 3_000_000) {
      await reader.cancel();
      throw new ApiError(413, "Dữ liệu quá lớn. CV PDF tối đa 2 MB.");
    }
    parts.push(value);
  }
  try {
    const value = JSON.parse(Buffer.concat(parts).toString());
    if (!value || Array.isArray(value) || typeof value !== "object")
      throw new Error();
    return value;
  } catch {
    throw new ApiError(400, "Dữ liệu gửi lên chưa đúng định dạng.");
  }
}
async function requireUser(role?: string) {
  const user = await currentUser();
  if (!user) throw new ApiError(401, "Vui lòng đăng nhập để tiếp tục.");
  if (role && user.role !== role)
    throw new ApiError(
      403,
      "Tài khoản của bạn không có quyền thực hiện thao tác này.",
    );
  return user;
}
async function limit(key: string, maximum: number, seconds: number) {
  const now = new Date().toISOString(),
    expires = new Date(Date.now() + seconds * 1000).toISOString();
  const rows = await query<{ count: number }>(
    `INSERT INTO rate_limits (key,count,expires_at) VALUES (?,1,?) ON CONFLICT(key) DO UPDATE SET count=CASE WHEN rate_limits.expires_at<? THEN 1 ELSE rate_limits.count+1 END, expires_at=CASE WHEN rate_limits.expires_at<? THEN excluded.expires_at ELSE rate_limits.expires_at END RETURNING count`,
    [key, expires, now, now],
  );
  if (rows[0].count > maximum)
    throw new ApiError(
      429,
      "Bạn đã thử nhiều lần. Vui lòng thử lại sau ít phút.",
    );
}
function result(data: unknown, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}
function pdf(name: string, data: string) {
  return new NextResponse(Buffer.from(data, "base64"), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="cv.pdf"; filename*=UTF-8''${encodeURIComponent(name)}`,
      "Cache-Control": "private, no-store",
    },
  });
}
async function dispatch(req: NextRequest, segments: string[]) {
  const route = segments.join("/");
  const method = req.method;
  if (method !== "GET") {
    const origin = req.headers.get("origin");
    if (
      !origin ||
      ![req.nextUrl.host, req.headers.get("host")].includes(
        new URL(origin).host,
      )
    )
      throw new ApiError(403, "Yêu cầu phải được gửi từ website Hợp Việc.");
  }
  if (route === "me" && method === "GET")
    return result({ user: await currentUser() });
  if (route === "auth/logout" && method === "POST") {
    await logout();
    return result({ ok: true });
  }
  if (["auth/register", "auth/login"].includes(route) && method === "POST") {
    const b = await body(req);
    const email = text(b, "email", 5, 254).toLowerCase();
    const password = text(b, "password", 10, 128);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      throw new ApiError(400, "Email chưa đúng định dạng.");
    // A global window plus per-account limits cannot be bypassed with arbitrary forwarded IPs.
    await limit("auth-global", 300, 60);
    await limit(`auth:${email}`, 12, 15 * 60);
    if (route === "auth/register") {
      const name = text(b, "name", 2, 100),
        role = text(b, "role");
      if (!["candidate", "employer"].includes(role))
        throw new ApiError(400, "Hãy chọn loại tài khoản.");
      const company = text(b, "company", role === "employer" ? 2 : 0, 120);
      const id = randomUUID();
      const rows = await query(
        "INSERT INTO users (id,name,email,password_hash,role,company,created_at) VALUES (?,?,?,?,?,?,?) ON CONFLICT(email) DO NOTHING RETURNING id",
        [
          id,
          name,
          email,
          await hashPassword(password),
          role,
          company,
          new Date().toISOString(),
        ],
      );
      if (!rows.length)
        throw new ApiError(409, "Email này đã được đăng ký. Hãy đăng nhập.");
      if (role === "candidate")
        await query(
          "INSERT INTO profiles (user_id) VALUES (?) ON CONFLICT(user_id) DO NOTHING",
          [id],
        );
      await createSession(id);
      return result({ user: { id, name, email, role, company } }, 201);
    }
    const rows = await query<User & { password_hash: string }>(
      "SELECT * FROM users WHERE email=?",
      [email],
    );
    const user = rows[0];
    if (!user || !(await verifyPassword(password, user.password_hash)))
      throw new ApiError(401, "Email hoặc mật khẩu chưa đúng.");
    await createSession(user.id);
    return result({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        company: user.company,
      },
    });
  }
  if (route === "jobs" && method === "GET") {
    const rows = await query(
      "SELECT * FROM jobs WHERE active=1 AND expires_at>=? ORDER BY is_demo ASC,created_at DESC",
      [new Date().toISOString().slice(0, 10)],
    );
    return result({ jobs: rows.map(asJob) });
  }
  if (route === "jobs" && method === "POST") {
    const user = await requireUser("employer"),
      b = await body(req);
    await limit(`post:${user.id}`, 20, 3600);
    const title = text(b, "title", 5, 120),
      location = text(b, "location", 2, 100),
      category = text(b, "category", 2, 80),
      type = text(b, "type", 2, 50);
    const min = Number(b.salary_min),
      max = Number(b.salary_max);
    if (
      !Number.isFinite(min) ||
      !Number.isFinite(max) ||
      min < 0 ||
      max < min ||
      max > 1000
    )
      throw new ApiError(
        400,
        "Khoảng lương chưa hợp lệ (triệu VNĐ/tháng). Bạn có thể nhập 0–0 nếu thỏa thuận.",
      );
    const deadline = text(b, "expires_at", 10, 10);
    const date = new Date(deadline + "T00:00:00Z");
    if (
      Number.isNaN(date.getTime()) ||
      date.toISOString().slice(0, 10) !== deadline ||
      deadline < new Date().toISOString().slice(0, 10)
    )
      throw new ApiError(400, "Hạn ứng tuyển phải từ hôm nay trở đi.");
    const list = skills(b);
    if (!list.length)
      throw new ApiError(400, "Nhập ít nhất một kỹ năng cần thiết.");
    const id = randomUUID();
    await query(
      `INSERT INTO jobs (id,employer_id,title,company,location,category,type,salary_min,salary_max,description,requirements,benefits,skills,work_style,created_at,expires_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        id,
        user.id,
        title,
        user.company,
        location,
        category,
        type,
        min,
        max,
        text(b, "description", 30, 8000),
        text(b, "requirements", 10, 8000),
        text(b, "benefits", 10, 8000),
        JSON.stringify(list),
        style(b),
        new Date().toISOString(),
        deadline,
      ],
    );
    return result({ id }, 201);
  }
  if (segments[0] === "jobs" && segments.length === 2) {
    const rows = await query("SELECT * FROM jobs WHERE id=?", [segments[1]]);
    if (!rows[0]) throw new ApiError(404, "Không tìm thấy việc làm này.");
    if (method === "GET") return result({ job: asJob(rows[0]) });
    if (method === "PATCH") {
      const user = await requireUser("employer");
      if (rows[0].employer_id !== user.id)
        throw new ApiError(403, "Bạn chỉ có thể quản lý tin của mình.");
      const b = await body(req);
      if (![0, 1].includes(Number(b.active)))
        throw new ApiError(400, "Trạng thái chưa hợp lệ.");
      await query("UPDATE jobs SET active=? WHERE id=?", [
        Number(b.active),
        segments[1],
      ]);
      return result({ ok: true });
    }
  }
  if (route === "profile") {
    const user = await requireUser("candidate");
    if (method === "GET") {
      const rows = await query("SELECT * FROM profiles WHERE user_id=?", [
        user.id,
      ]);
      return result({ profile: asProfile(rows[0]) });
    }
    if (method === "PUT") {
      const b = await body(req);
      await query(
        "UPDATE profiles SET headline=?,location=?,skills=?,experience=?,work_style=? WHERE user_id=?",
        [
          text(b, "headline", 0, 150),
          text(b, "location", 0, 100),
          JSON.stringify(skills(b)),
          text(b, "experience", 0, 8000),
          style(b),
          user.id,
        ],
      );
      return result({ ok: true });
    }
  }
  if (route === "profile/cv") {
    const user = await requireUser("candidate");
    if (method === "GET") {
      const rows = await query(
        "SELECT cv_name,cv_data FROM profiles WHERE user_id=?",
        [user.id],
      );
      if (!rows[0]?.cv_data) throw new ApiError(404, "Chưa có CV.");
      return pdf(String(rows[0].cv_name), String(rows[0].cv_data));
    }
    if (method === "POST") {
      const b = await body(req),
        name = text(b, "name", 1, 180),
        data = text(b, "data", 1, 2_800_000);
      if (
        !name.toLowerCase().endsWith(".pdf") ||
        !/^[A-Za-z0-9+/]+={0,2}$/.test(data)
      )
        throw new ApiError(400, "Chỉ nhận CV định dạng PDF.");
      const buffer = Buffer.from(data, "base64");
      if (
        buffer.length > 2 * 1024 * 1024 ||
        buffer.subarray(0, 5).toString() !== "%PDF-"
      )
        throw new ApiError(400, "CV phải là file PDF hợp lệ, tối đa 2 MB.");
      await query(
        "UPDATE profiles SET cv_name=?,cv_data=?,cv_updated=? WHERE user_id=?",
        [name, data, new Date().toISOString(), user.id],
      );
      return result({ ok: true });
    }
    if (method === "DELETE") {
      await query(
        "UPDATE profiles SET cv_name='',cv_data='',cv_updated='' WHERE user_id=?",
        [user.id],
      );
      return result({ ok: true });
    }
  }
  if (route === "saved") {
    const user = await requireUser("candidate");
    if (method === "GET") {
      const rows = await query<{ job_id: string }>(
        "SELECT job_id FROM saved_jobs WHERE user_id=?",
        [user.id],
      );
      return result({ ids: rows.map((r) => r.job_id) });
    }
    if (method === "POST" || method === "DELETE") {
      const b = await body(req),
        id = text(b, "job_id", 1, 100);
      if (!(await query("SELECT id FROM jobs WHERE id=?", [id])).length)
        throw new ApiError(404, "Không tìm thấy việc làm.");
      if (method === "POST")
        await query(
          "INSERT INTO saved_jobs (user_id,job_id) VALUES (?,?) ON CONFLICT(user_id,job_id) DO NOTHING",
          [user.id, id],
        );
      else
        await query("DELETE FROM saved_jobs WHERE user_id=? AND job_id=?", [
          user.id,
          id,
        ]);
      return result({ ok: true });
    }
  }
  if (route === "applications" && method === "POST") {
    const user = await requireUser("candidate"),
      b = await body(req);
    await limit(`apply:${user.id}`, 30, 3600);
    const id = text(b, "job_id", 1, 100),
      cover = text(b, "cover_letter", 20, 4000);
    const jobs = await query(
      "SELECT * FROM jobs WHERE id=? AND active=1 AND expires_at>=?",
      [id, new Date().toISOString().slice(0, 10)],
    );
    if (!jobs.length)
      throw new ApiError(404, "Tin tuyển dụng đã đóng hoặc hết hạn.");
    const profile = (
      await query("SELECT * FROM profiles WHERE user_id=?", [user.id])
    )[0];
    if (!profile?.cv_data || !profile.headline)
      throw new ApiError(
        400,
        "Hãy bổ sung chức danh và tải CV PDF trong Hồ sơ trước khi ứng tuyển.",
      );
    const rows = await query(
      "INSERT INTO applications (id,job_id,candidate_id,cover_letter,created_at,cv_name,cv_data,profile_snapshot) VALUES (?,?,?,?,?,?,?,?) ON CONFLICT(job_id,candidate_id) DO NOTHING RETURNING id",
      [
        randomUUID(),
        id,
        user.id,
        cover,
        new Date().toISOString(),
        String(profile.cv_name),
        String(profile.cv_data),
        JSON.stringify(asProfile(profile)),
      ],
    );
    if (!rows.length)
      throw new ApiError(409, "Bạn đã ứng tuyển vị trí này rồi.");
    return result({ ok: true, is_demo: jobs[0].is_demo }, 201);
  }
  if (route === "applications" && method === "GET") {
    const user = await requireUser();
    const rows = await query(
      `SELECT a.id,a.job_id,a.candidate_id,a.cover_letter,a.status,a.created_at,a.cv_name,a.profile_snapshot,j.title,j.company,j.is_demo,u.name,u.email FROM applications a JOIN jobs j ON j.id=a.job_id JOIN users u ON u.id=a.candidate_id WHERE ${user.role === "candidate" ? "a.candidate_id" : "j.employer_id"}=? ORDER BY a.created_at DESC`,
      [user.id],
    );
    return result({
      applications: rows.map(({ profile_snapshot, ...r }) => ({
        ...r,
        ...JSON.parse(String(profile_snapshot)),
      })),
    });
  }
  if (segments[0] === "applications" && segments.length >= 2) {
    const user = await requireUser();
    const rows = await query(
      "SELECT a.*,j.employer_id FROM applications a JOIN jobs j ON j.id=a.job_id WHERE a.id=?",
      [segments[1]],
    );
    const application = rows[0];
    if (!application)
      throw new ApiError(404, "Không tìm thấy hồ sơ ứng tuyển.");
    if (
      application.candidate_id !== user.id &&
      application.employer_id !== user.id
    )
      throw new ApiError(403, "Bạn không có quyền xem hồ sơ này.");
    if (segments[2] === "cv" && method === "GET")
      return pdf(String(application.cv_name), String(application.cv_data));
    if (segments.length === 2 && method === "PATCH") {
      if (user.id !== application.employer_id)
        throw new ApiError(
          403,
          "Chỉ nhà tuyển dụng nhận hồ sơ có thể cập nhật trạng thái.",
        );
      const b = await body(req),
        status = text(b, "status");
      if (
        !["pending", "reviewing", "interview", "rejected", "hired"].includes(
          status,
        )
      )
        throw new ApiError(400, "Trạng thái chưa hợp lệ.");
      await query("UPDATE applications SET status=? WHERE id=?", [
        status,
        application.id as string,
      ]);
      return result({ ok: true });
    }
  }
  if (route === "employer/jobs" && method === "GET") {
    const user = await requireUser("employer");
    const rows = await query(
      "SELECT j.*,(SELECT COUNT(*) FROM applications a WHERE a.job_id=j.id) AS applicants FROM jobs j WHERE j.employer_id=? ORDER BY j.created_at DESC",
      [user.id],
    );
    return result({
      jobs: rows.map((r) => ({
        ...asJob(r),
        applicants: Number(r.applicants),
      })),
    });
  }
  throw new ApiError(404, "Không tìm thấy chức năng này.");
}
async function handler(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  try {
    return await dispatch(req, (await context.params).path);
  } catch (error) {
    if (error instanceof ApiError)
      return result({ error: error.message }, error.status);
    console.error(
      "API operation failed",
      error instanceof Error ? error.message : "unknown",
    );
    return result(
      { error: "Chưa thể xử lý yêu cầu. Vui lòng thử lại sau." },
      500,
    );
  }
}
export {
  handler as GET,
  handler as POST,
  handler as PUT,
  handler as PATCH,
  handler as DELETE,
};
