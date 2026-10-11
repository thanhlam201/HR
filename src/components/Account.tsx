"use client";
import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowRight,
  ArrowUpRight,
  BriefcaseBusiness,
  Check,
  Download,
  Eye,
  EyeOff,
  FileText,
  LoaderCircle,
  Plus,
  Upload,
  Users,
  Sparkles,
  Building2,
  Trash2,
  Mail,
} from "lucide-react";
import { api, dateLabel, statusNames, salary } from "@/lib/client";
import { styles, type Profile, type Application, type Job } from "@/lib/types";
import { Empty, Gate, JobCard, Loading, PageIntro, useApp } from "./App";
export function Auth({ register }: { register: boolean }) {
  const { user, refreshUser, notify } = useApp();
  const params = useSearchParams(),
    router = useRouter();
  const [role, setRole] = useState(
      params.get("role") === "employer" ? "employer" : "candidate",
    ),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [visible, setVisible] = useState(false);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const data = Object.fromEntries(new FormData(e.currentTarget));
    try {
      const response = await api<{ user: { role: string } }>(
        `auth/${register ? "register" : "login"}`,
        "POST",
        { ...data, role },
      );
      await refreshUser();
      notify(
        register ? "Chào mừng bạn đến với Hợp Việc!" : "Đăng nhập thành công.",
      );
      const next = params.get("next");
      router.push(
        next &&
          next.startsWith("/") &&
          !next.startsWith("//") &&
          !next.includes("\\")
          ? next
          : response.user.role === "employer"
            ? "/nha-tuyen-dung"
            : "/ho-so",
      );
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  if (user)
    return (
      <div className="container page-content">
        <Empty
          title={`Chào ${user.name}!`}
          text="Bạn đã đăng nhập và có thể tiếp tục hành trình của mình."
        >
          <Link
            href={user.role === "employer" ? "/nha-tuyen-dung" : "/ho-so"}
            className="btn primary"
          >
            Đến không gian của tôi <ArrowRight size={17} />
          </Link>
        </Empty>
      </div>
    );
  return (
    <section className="auth-layout container">
      <div className="auth-story">
        <span className="eyebrow">MỘT KHỞI ĐẦU CÓ Ý NGHĨA</span>
        <h1>
          Điều phù hợp
          <br />
          đang chờ bạn<span className="accent-dot">.</span>
        </h1>
        <p>
          Một nơi để bạn thể hiện thế mạnh, tìm cơ hội và kết nối với những
          người muốn cùng phát triển.
        </p>
        <div className="auth-art">
          <span>
            <Users size={46} />
          </span>
          <i />
          <div>
            <Sparkles size={25} /> Đúng người. Đúng cơ hội.
          </div>
        </div>
        <ul className="check-list">
          <li>
            <Check size={17} />
            Hồ sơ được chia sẻ khi bạn ứng tuyển
          </li>
          <li>
            <Check size={17} />
            Theo dõi hành trình ứng tuyển của bạn
          </li>
          <li>
            <Check size={17} />
            Khám phá đội nhóm cùng phong cách
          </li>
        </ul>
      </div>
      <div className="auth-form card">
        <h2>{register ? "Bắt đầu cùng Hợp Việc" : "Chào bạn trở lại"}</h2>
        <p>
          {register
            ? "Tạo tài khoản để mở ra những kết nối mới."
            : "Đăng nhập để tiếp tục những cơ hội của bạn."}
        </p>
        {register && (
          <div className="segmented">
            <button
              type="button"
              className={role === "candidate" ? "selected" : ""}
              onClick={() => setRole("candidate")}
            >
              <Users size={16} />
              Tìm việc
            </button>
            <button
              type="button"
              className={role === "employer" ? "selected" : ""}
              onClick={() => setRole("employer")}
            >
              <Building2 size={16} />
              Tuyển dụng
            </button>
          </div>
        )}
        <form onSubmit={submit}>
          {register && (
            <label>
              Họ và tên
              <input
                name="name"
                autoComplete="name"
                required
                minLength={2}
                maxLength={100}
                placeholder="Tên của bạn"
              />
            </label>
          )}
          {register && role === "employer" && (
            <label>
              Tên doanh nghiệp
              <input
                name="company"
                required
                minLength={2}
                maxLength={120}
                autoComplete="organization"
                placeholder="Tên đội nhóm / công ty"
              />
            </label>
          )}
          <label>
            Email
            <input
              name="email"
              type="email"
              autoComplete="email"
              required
              maxLength={254}
              placeholder="ban@example.com"
            />
          </label>
          <label>
            Mật khẩu
            <div className="password-input">
              <input
                name="password"
                type={visible ? "text" : "password"}
                autoComplete={register ? "new-password" : "current-password"}
                required
                minLength={10}
                maxLength={128}
                placeholder="Tối thiểu 10 ký tự"
              />
              <button
                type="button"
                aria-label={visible ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                onClick={() => setVisible(!visible)}
              >
                {visible ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </label>
          {register && (
            <label className="check-label">
              <input type="checkbox" required />
              Tôi đồng ý chia sẻ hồ sơ và CV với nhà tuyển dụng khi chủ động gửi
              đơn ứng tuyển.
            </label>
          )}
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          <button className="btn primary full" disabled={busy}>
            {busy ? (
              <LoaderCircle size={18} className="spin" />
            ) : (
              <ArrowRight size={18} />
            )}{" "}
            {register ? "Tạo tài khoản" : "Đăng nhập"}
          </button>
        </form>
        <p className="auth-switch">
          {register ? "Bạn đã có tài khoản?" : "Chưa có tài khoản?"}{" "}
          <Link
            href={`${register ? "/dang-nhap" : "/dang-ky"}${params.get("next") ? `?next=${encodeURIComponent(params.get("next")!)}` : ""}`}
          >
            {register ? "Đăng nhập" : "Đăng ký miễn phí"}
          </Link>
        </p>
      </div>
    </section>
  );
}
export function ProfilePage() {
  return (
    <>
      <PageIntro
        label="KHÔNG GIAN CỦA BẠN"
        title="Một hồ sơ. Nhiều cơ hội."
        description="Kể câu chuyện của bạn và theo dõi những kết nối mới."
      />
      <div className="container page-content">
        <Gate role="candidate">
          <ProfileEditor />
        </Gate>
      </div>
    </>
  );
}
function ProfileEditor() {
  const { user, notify, jobs, saved } = useApp();
  const [profile, setProfile] = useState<Profile | null>(null),
    [applications, setApplications] = useState<Application[]>([]),
    [tab, setTab] = useState("profile"),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [uploading, setUploading] = useState(false),
    [skillText, setSkillText] = useState("");
  async function load() {
    try {
      const [p, a] = await Promise.all([
        api<{ profile: Profile }>("profile"),
        api<{ applications: Application[] }>("applications"),
      ]);
      setProfile(p.profile);
      setSkillText(p.profile.skills.join(", "));
      setApplications(a.applications);
      setError("");
    } catch (e) {
      setError((e as Error).message);
    }
  }
  useEffect(() => {
    void load();
  }, []);
  async function save(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await api("profile", "PUT", {
        ...profile,
        skills: skillText
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      });
      notify("Hồ sơ của bạn đã được lưu.");
    } catch (e) {
      notify((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function upload(file?: File) {
    if (!file) return;
    if (
      file.size > 2 * 1024 * 1024 ||
      !file.name.toLowerCase().endsWith(".pdf")
    ) {
      notify("Chọn một CV PDF tối đa 2 MB.");
      return;
    }
    setUploading(true);
    try {
      const data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result).split(",")[1]);
        reader.onerror = () => reject(new Error("Chưa đọc được file CV."));
        reader.readAsDataURL(file);
      });
      await api("profile/cv", "POST", { name: file.name, data });
      await load();
      notify("CV đã được tải lên và lưu riêng tư.");
    } catch (e) {
      notify((e as Error).message);
    } finally {
      setUploading(false);
    }
  }
  if (error)
    return (
      <Empty title="Chưa tải được hồ sơ" text={error}>
        <button className="btn primary" onClick={load}>
          Thử lại
        </button>
      </Empty>
    );
  if (!profile) return <Loading />;
  const completion = Math.round(
    ([
      !!profile.headline,
      !!profile.location,
      !!profile.skills.length,
      !!profile.experience,
      !!profile.cv_name,
    ].filter(Boolean).length /
      5) *
      100,
  );
  return (
    <>
      <div className="profile-summary card">
        <span className="avatar large">{user!.name.slice(0, 1)}</span>
        <div>
          <h2>{user!.name}</h2>
          <p>{profile.headline || "Thêm chức danh để giới thiệu về bạn"}</p>
          <span className="small-muted">{user!.email}</span>
        </div>
        <div className="profile-completion">
          <strong>Hồ sơ hoàn thiện {completion}%</strong>
          <div className="progress">
            <i style={{ width: completion + "%" }} />
          </div>
        </div>
      </div>
      <div className="tabs">
        <button
          className={tab === "profile" ? "active" : ""}
          onClick={() => setTab("profile")}
        >
          CV / Hồ sơ
        </button>
        <button
          className={tab === "applications" ? "active" : ""}
          onClick={() => setTab("applications")}
        >
          Đã ứng tuyển <span>{applications.length}</span>
        </button>
        <button
          className={tab === "saved" ? "active" : ""}
          onClick={() => setTab("saved")}
        >
          Việc đã lưu <span>{saved.length}</span>
        </button>
      </div>
      {tab === "profile" ? (
        <div className="detail-layout">
          <form className="card form-card" onSubmit={save}>
            <h2>Thế mạnh & câu chuyện của bạn</h2>
            <div className="form-grid">
              <label>
                Chức danh / Mục tiêu nghề nghiệp
                <input
                  value={profile.headline}
                  onChange={(e) =>
                    setProfile({ ...profile, headline: e.target.value })
                  }
                  maxLength={150}
                  placeholder="VD: Frontend Developer"
                />
              </label>
              <label>
                Địa điểm mong muốn
                <select
                  value={profile.location}
                  onChange={(e) =>
                    setProfile({ ...profile, location: e.target.value })
                  }
                >
                  <option value="">Chọn địa điểm</option>
                  {["Hồ Chí Minh", "Hà Nội", "Đà Nẵng", "Remote", "Khác"].map(
                    (s) => (
                      <option key={s}>{s}</option>
                    ),
                  )}
                </select>
              </label>
            </div>
            <label>
              Kỹ năng (ngăn cách bằng dấu phẩy)
              <input
                value={skillText}
                onChange={(e) => setSkillText(e.target.value)}
                placeholder="React, TypeScript, CSS…"
              />
              <span className="field-help">
                Dùng tên kỹ năng cụ thể để đối chiếu với yêu cầu công việc.
              </span>
            </label>
            <label>
              Kinh nghiệm & dự án
              <textarea
                rows={6}
                maxLength={8000}
                value={profile.experience}
                onChange={(e) =>
                  setProfile({ ...profile, experience: e.target.value })
                }
                placeholder="Những điều bạn đã làm, kết quả và điều bạn muốn tiếp tục phát triển…"
              />
            </label>
            <label>
              Phong cách làm việc
              <select
                value={profile.work_style}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    work_style: e.target.value as Profile["work_style"],
                  })
                }
              >
                {Object.entries(styles).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </label>
            <button className="btn primary" disabled={busy}>
              {busy ? (
                <LoaderCircle size={17} className="spin" />
              ) : (
                <Check size={17} />
              )}
              Lưu hồ sơ
            </button>
          </form>
          <aside>
            <section className="card form-card">
              <span className="section-icon">
                <FileText size={23} />
              </span>
              <h3>CV của bạn</h3>
              <p className="small-muted">
                PDF tối đa 2 MB. Chỉ bạn và nhà tuyển dụng nhận đơn mới có quyền
                truy cập.
              </p>
              <label className="upload-zone">
                <Upload size={24} />
                <strong>{uploading ? "Đang tải lên…" : "Chọn file CV"}</strong>
                <span>PDF · tối đa 2 MB</span>
                <input
                  type="file"
                  accept="application/pdf,.pdf"
                  disabled={uploading}
                  onChange={(e) => {
                    void upload(e.target.files?.[0]);
                    e.target.value = "";
                  }}
                />
              </label>
              {profile.cv_name && (
                <div className="cv-file">
                  <FileText size={19} />
                  <span>
                    {profile.cv_name}
                    <small>{dateLabel(profile.cv_updated)}</small>
                  </span>
                  <a
                    href="/api/profile/cv"
                    className="icon-btn"
                    aria-label="Tải CV"
                  >
                    <Download size={17} />
                  </a>
                  <button
                    className="icon-btn"
                    type="button"
                    aria-label="Xóa CV"
                    onClick={async () => {
                      try {
                        await api("profile/cv", "DELETE");
                        await load();
                        notify(
                          "Đã xóa CV hiện tại. Bản đã gửi trong đơn ứng tuyển vẫn được giữ.",
                        );
                      } catch (e) {
                        notify((e as Error).message);
                      }
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              )}
              <Link href="/cv" target="_blank" className="btn secondary full">
                <FileText size={16} /> Tạo bản CV từ hồ sơ
              </Link>
              <p className="field-help">
                Lưu hồ sơ trước, sau đó mở bản CV và chọn In → Lưu PDF.
              </p>
            </section>
            <section className="fit-card">
              <Sparkles size={23} />
              <h3>Hiểu phong cách của mình</h3>
              <p>
                Bài khám phá ngắn giúp bạn chọn mô tả gần với cách mình làm
                việc.
              </p>
              <Link href="/cong-cu" className="text-link">
                Khám phá ngay <ArrowRight size={15} />
              </Link>
            </section>
          </aside>
        </div>
      ) : tab === "applications" ? (
        <Applications applications={applications} />
      ) : (
        <div className="job-grid">
          {jobs
            .filter((j) => saved.includes(j.id))
            .map((j, i) => (
              <JobCard job={j} index={i} key={j.id} />
            ))}
          {!jobs.some((j) => saved.includes(j.id)) && (
            <Empty
              title="Chưa có việc làm đang mở được lưu"
              text="Bấm biểu tượng dấu trang trên công việc bạn quan tâm."
            >
              <Link href="/viec-lam" className="btn primary">
                Khám phá việc làm
              </Link>
            </Empty>
          )}
        </div>
      )}
    </>
  );
}
function Applications({
  applications,
  employer = false,
  onRefresh,
}: {
  applications: Application[];
  employer?: boolean;
  onRefresh?: () => Promise<void>;
}) {
  const { notify } = useApp();
  const [updating, setUpdating] = useState("");
  if (!applications.length)
    return (
      <Empty
        title={
          employer ? "Chưa có hồ sơ ứng tuyển" : "Bạn chưa gửi đơn ứng tuyển"
        }
        text={
          employer
            ? "Hồ sơ sẽ xuất hiện ở đây khi ứng viên gửi đơn vào tin của bạn."
            : "Tìm một cơ hội phù hợp và gửi lời giới thiệu của bạn."
        }
      >
        {!employer && (
          <Link href="/viec-lam" className="btn primary">
            Tìm việc ngay
          </Link>
        )}
      </Empty>
    );
  return (
    <div className="applications-list">
      {applications.map((a) => (
        <article className="card application-card" key={a.id}>
          <div className="application-head">
            <div>
              <Link href={`/viec-lam/${a.job_id}`}>
                <h3>{a.title}</h3>
              </Link>
              <p>
                {employer ? `${a.name} · ${a.email}` : a.company}{" "}
                <span>· {dateLabel(a.created_at)}</span>
              </p>
            </div>
            {employer ? (
              <select
                aria-label={`Trạng thái hồ sơ ${a.name}`}
                disabled={updating === a.id}
                value={a.status}
                onChange={async (e) => {
                  setUpdating(a.id);
                  try {
                    await api(`applications/${a.id}`, "PATCH", {
                      status: e.target.value,
                    });
                    await onRefresh?.();
                    notify("Đã cập nhật trạng thái hồ sơ.");
                  } catch (e) {
                    notify((e as Error).message);
                  } finally {
                    setUpdating("");
                  }
                }}
              >
                {Object.entries(statusNames).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            ) : (
              <span className={`status ${a.status}`}>
                {statusNames[a.status]}
              </span>
            )}
          </div>
          {employer && (
            <>
              <p>
                <strong>{a.headline}</strong> · {a.location}
              </p>
              <div className="chips">
                {a.skills?.map((s) => (
                  <span key={s}>{s}</span>
                ))}
              </div>
              {a.experience && (
                <details>
                  <summary>Kinh nghiệm ứng viên</summary>
                  <p className="multiline">{a.experience}</p>
                </details>
              )}
            </>
          )}
          <p className="multiline cover-letter">{a.cover_letter}</p>
          <div className="application-footer">
            <a className="text-link" href={`/api/applications/${a.id}/cv`}>
              <Download size={16} />
              CV đã gửi
            </a>
            {employer && (
              <a className="text-link" href={`mailto:${a.email}`}>
                <Mail size={16} />
                Liên hệ ứng viên
              </a>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}
export function Employer() {
  const { user, authLoading } = useApp();
  return (
    <>
      <PageIntro
        label="DÀNH CHO NHÀ TUYỂN DỤNG"
        title="Tìm mảnh ghép cho đội nhóm."
        description="Đăng cơ hội, nhận hồ sơ và xây dựng những kết nối có ý nghĩa."
      />
      {authLoading ? (
        <Loading />
      ) : user ? (
        <div className="container page-content">
          <Gate role="employer">
            <EmployerDashboard />
          </Gate>
        </div>
      ) : (
        <div className="container employer-landing">
          <div className="card">
            <Building2 size={42} />
            <h2>Đội nhóm tốt bắt đầu từ đúng người.</h2>
            <p>
              Đăng tin với yêu cầu rõ ràng, giới thiệu phong cách làm việc và
              quản lý hồ sơ ứng tuyển tại một nơi.
            </p>
            <Link href="/dang-ky?role=employer" className="btn primary">
              Tạo tài khoản nhà tuyển dụng <ArrowRight size={17} />
            </Link>
            <Link href="/dang-nhap?next=/nha-tuyen-dung" className="text-link">
              Đã có tài khoản? Đăng nhập
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
function EmployerDashboard() {
  const { notify, refreshJobs } = useApp();
  const [jobs, setJobs] = useState<(Job & { applicants: number })[]>([]),
    [apps, setApps] = useState<Application[]>([]),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [tab, setTab] = useState("jobs");
  async function load() {
    try {
      const [j, a] = await Promise.all([
        api<{ jobs: (Job & { applicants: number })[] }>("employer/jobs"),
        api<{ applications: Application[] }>("applications"),
      ]);
      setJobs(j.jobs);
      setApps(a.applications);
      setError("");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    void load();
  }, []);
  if (loading) return <Loading />;
  if (error)
    return (
      <Empty title="Chưa tải được dữ liệu tuyển dụng" text={error}>
        <button className="btn primary" onClick={load}>
          Thử lại
        </button>
      </Empty>
    );
  return (
    <>
      <div className="dashboard-stats">
        <div className="card">
          <BriefcaseBusiness />
          <strong>
            {
              jobs.filter(
                (j) =>
                  j.active &&
                  j.expires_at >= new Date().toISOString().slice(0, 10),
              ).length
            }
          </strong>
          <span>Tin đang tuyển</span>
        </div>
        <div className="card">
          <Users />
          <strong>{apps.length}</strong>
          <span>Hồ sơ nhận được</span>
        </div>
        <div className="card">
          <Check />
          <strong>{apps.filter((a) => a.status === "interview").length}</strong>
          <span>Được mời phỏng vấn</span>
        </div>
        <Link href="/dang-tin" className="btn primary">
          <Plus size={19} />
          Đăng tin mới
        </Link>
      </div>
      <div className="tabs">
        <button
          className={tab === "jobs" ? "active" : ""}
          onClick={() => setTab("jobs")}
        >
          Tin tuyển dụng
        </button>
        <button
          className={tab === "apps" ? "active" : ""}
          onClick={() => setTab("apps")}
        >
          Hồ sơ ứng tuyển <span>{apps.length}</span>
        </button>
      </div>
      {tab === "apps" ? (
        <Applications applications={apps} employer onRefresh={load} />
      ) : jobs.length ? (
        <div className="applications-list">
          {jobs.map((j) => (
            <article className="card employer-job" key={j.id}>
              <div>
                <Link href={`/viec-lam/${j.id}`}>
                  <h3>{j.title}</h3>
                </Link>
                <p>
                  {j.location} · {salary(j.salary_min, j.salary_max)} ·{" "}
                  {j.applicants} hồ sơ
                </p>
                <small>Hạn ứng tuyển: {dateLabel(j.expires_at)}</small>
              </div>
              <span className={`status ${j.active ? "reviewing" : "rejected"}`}>
                {j.active ? "Đang mở" : "Đã đóng"}
              </span>
              <button
                className="btn secondary small"
                onClick={async () => {
                  try {
                    await api(`jobs/${j.id}`, "PATCH", {
                      active: j.active ? 0 : 1,
                    });
                    await load();
                    await refreshJobs();
                    notify(
                      j.active
                        ? "Đã đóng tin tuyển dụng."
                        : "Đã mở lại tin tuyển dụng.",
                    );
                  } catch (e) {
                    notify((e as Error).message);
                  }
                }}
              >
                {j.active ? "Đóng tin" : "Mở lại"}
              </button>
            </article>
          ))}
        </div>
      ) : (
        <Empty
          title="Một cơ hội mới bắt đầu từ bạn"
          text="Đăng tin đầu tiên và giới thiệu điều đội nhóm đang tìm kiếm."
        >
          <Link href="/dang-tin" className="btn primary">
            <Plus size={17} />
            Đăng tin tuyển dụng
          </Link>
        </Empty>
      )}
    </>
  );
}
export function PostJob() {
  return (
    <>
      <PageIntro
        label="TẠO MỘT KẾT NỐI MỚI"
        title="Giới thiệu cơ hội của bạn."
        description="Thông tin rõ ràng giúp ứng viên hiểu công việc và đội nhóm."
      />
      <div className="container page-content narrow">
        <Gate role="employer">
          <PostJobForm />
        </Gate>
      </div>
    </>
  );
}
function PostJobForm() {
  const { notify, refreshJobs, user } = useApp();
  const router = useRouter();
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const form = Object.fromEntries(new FormData(e.currentTarget));
    try {
      const { id } = await api<{ id: string }>("jobs", "POST", {
        ...form,
        salary_min: Number(form.salary_min),
        salary_max: Number(form.salary_max),
        skills: String(form.skills)
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      });
      await refreshJobs();
      notify("Tin tuyển dụng đã được đăng.");
      router.push(`/viec-lam/${id}`);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <form className="card form-card" onSubmit={submit}>
      <div className="notice">
        Đăng tin dưới tên <strong>{user!.company}</strong>. Thông tin phong thủy
        không được dùng để lọc hoặc loại ứng viên.
      </div>
      <label>
        Chức danh tuyển dụng
        <input
          name="title"
          required
          minLength={5}
          maxLength={120}
          placeholder="VD: Frontend Developer"
        />
      </label>
      <div className="form-grid">
        <label>
          Địa điểm
          <select name="location">
            {["Hồ Chí Minh", "Hà Nội", "Đà Nẵng", "Remote", "Khác"].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
        <label>
          Lĩnh vực
          <select name="category">
            {[
              "Công nghệ",
              "Marketing",
              "Thiết kế",
              "Nhân sự",
              "Kinh doanh",
              "Tài chính",
              "Vận hành",
              "Khác",
            ].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
        <label>
          Hình thức làm việc
          <select name="type">
            {["Toàn thời gian", "Bán thời gian", "Thực tập", "Freelance"].map(
              (s) => (
                <option key={s}>{s}</option>
              ),
            )}
          </select>
        </label>
        <label>
          Hạn ứng tuyển
          <input
            name="expires_at"
            type="date"
            required
            min={new Date().toISOString().slice(0, 10)}
            defaultValue={new Date(Date.now() + 30 * 86400000)
              .toISOString()
              .slice(0, 10)}
          />
        </label>
        <label>
          Lương từ (triệu VNĐ/tháng)
          <input
            type="number"
            name="salary_min"
            min={0}
            max={1000}
            step="0.5"
            required
            placeholder="15"
          />
        </label>
        <label>
          Lương đến (triệu VNĐ/tháng)
          <input
            type="number"
            name="salary_max"
            min={0}
            max={1000}
            step="0.5"
            required
            placeholder="25"
          />
        </label>
      </div>
      <span className="field-help">
        Nhập 0 ở cả hai ô nếu mức lương thỏa thuận.
      </span>
      <label>
        Mô tả công việc
        <textarea
          name="description"
          rows={5}
          required
          minLength={30}
          maxLength={8000}
          placeholder="Ứng viên sẽ làm gì? Những mục tiêu và trách nhiệm chính…"
        />
      </label>
      <label>
        Yêu cầu ứng viên
        <textarea
          name="requirements"
          rows={4}
          required
          minLength={10}
          maxLength={8000}
          placeholder="Kinh nghiệm và những điều thực sự cần thiết…"
        />
      </label>
      <label>
        Quyền lợi
        <textarea
          name="benefits"
          rows={4}
          required
          minLength={10}
          maxLength={8000}
          placeholder="Phúc lợi, cơ hội phát triển và môi trường làm việc…"
        />
      </label>
      <label>
        Kỹ năng cần thiết (ngăn cách bằng dấu phẩy)
        <input name="skills" required placeholder="React, TypeScript, CSS" />
      </label>
      <label>
        Phong cách làm việc của đội nhóm
        <select name="work_style">
          {Object.entries(styles).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
      </label>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      <button className="btn primary" disabled={busy}>
        {busy ? (
          <LoaderCircle className="spin" size={18} />
        ) : (
          <Plus size={18} />
        )}
        Đăng tin tuyển dụng
      </button>
    </form>
  );
}
