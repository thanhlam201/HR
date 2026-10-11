"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Search,
  MapPin,
  SlidersHorizontal,
  ArrowRight,
  ArrowUpRight,
  BriefcaseBusiness,
  Banknote,
  CalendarDays,
  Bookmark,
  Sparkles,
  ArrowLeft,
  Check,
  Send,
  LoaderCircle,
  X,
} from "lucide-react";
import { CompanyLogo, Empty, JobCard, Loading, PageIntro, useApp } from "./App";
import { api, dateLabel, salary } from "@/lib/client";
import { normalize, careerMatch } from "@/lib/matching";
import { styles, type Job, type Profile, type Application } from "@/lib/types";
export function Jobs() {
  const params = useSearchParams();
  const { jobs, jobsLoading, error, refreshJobs, saved } = useApp();
  const [q, setQ] = useState(params.get("q") || ""),
    [location, setLocation] = useState(params.get("location") || ""),
    [category, setCategory] = useState(params.get("category") || ""),
    [type, setType] = useState(""),
    [minimum, setMinimum] = useState(""),
    [onlySaved, setOnlySaved] = useState(false),
    [sort, setSort] = useState("latest");
  const filtered = jobs
    .filter(
      (j) =>
        (!q ||
          normalize([j.title, j.company, ...j.skills].join(" ")).includes(
            normalize(q),
          )) &&
        (!location || j.location === location) &&
        (!category || j.category === category) &&
        (!type || j.type === type) &&
        (!minimum || j.salary_max >= Number(minimum)) &&
        (!onlySaved || saved.includes(j.id)),
    )
    .sort((a, b) =>
      sort === "salary"
        ? b.salary_max - a.salary_max
        : b.created_at.localeCompare(a.created_at),
    );
  function clear() {
    setQ("");
    setLocation("");
    setCategory("");
    setType("");
    setMinimum("");
    setOnlySaved(false);
  }
  return (
    <>
      <PageIntro
        label="CƠ HỘI MỚI ĐANG CHỜ BẠN"
        title="Tìm việc hợp với bạn."
        description="Một công việc tốt bắt đầu từ những điều bạn quan tâm."
      />
      <div className="container page-content">
        <div className="listing-search">
          <Search size={20} />
          <input
            aria-label="Tìm việc làm"
            placeholder="Chức danh, kỹ năng, công ty…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <span className="result-count">{filtered.length} cơ hội</span>
        </div>
        <div className="listing-layout">
          <aside className="filter-panel">
            <div className="filter-title">
              <h3>
                <SlidersHorizontal size={18} /> Bộ lọc
              </h3>
              <button className="text-button" onClick={clear}>
                Đặt lại
              </button>
            </div>
            <label>
              Địa điểm
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              >
                <option value="">Tất cả địa điểm</option>
                {[
                  ...new Set([
                    ...jobs.map((j) => j.location),
                    "Hồ Chí Minh",
                    "Hà Nội",
                    "Đà Nẵng",
                    "Remote",
                  ]),
                ].map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </label>
            <label>
              Lĩnh vực
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="">Tất cả lĩnh vực</option>
                {[...new Set(jobs.map((j) => j.category))].map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </label>
            <label>
              Hình thức
              <select value={type} onChange={(e) => setType(e.target.value)}>
                <option value="">Tất cả hình thức</option>
                {[
                  "Toàn thời gian",
                  "Bán thời gian",
                  "Thực tập",
                  "Freelance",
                ].map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </label>
            <label>
              Mức lương mong muốn
              <select
                value={minimum}
                onChange={(e) => setMinimum(e.target.value)}
              >
                <option value="">Không giới hạn</option>
                <option value="10">Từ 10 triệu/tháng</option>
                <option value="20">Từ 20 triệu/tháng</option>
                <option value="30">Từ 30 triệu/tháng</option>
              </select>
            </label>
            <label className="check-label">
              <input
                type="checkbox"
                checked={onlySaved}
                onChange={(e) => setOnlySaved(e.target.checked)}
              />
              Chỉ hiện việc đã lưu
            </label>
            <div className="filter-tip">
              <Sparkles size={21} />
              <h4>Hiểu mình, chọn đúng.</h4>
              <p>
                Khám phá độ phù hợp từ kỹ năng và phong cách làm việc của bạn.
              </p>
              <Link href="/do-phu-hop" className="text-link">
                Khám phá ngay <ArrowRight size={15} />
              </Link>
            </div>
          </aside>
          <section>
            <div className="results-head">
              <span>
                <strong>{filtered.length}</strong> việc làm phù hợp bộ lọc
              </span>
              <label className="sort-select">
                Sắp xếp
                <select
                  aria-label="Sắp xếp việc làm"
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                >
                  <option value="latest">Mới nhất</option>
                  <option value="salary">Lương cao nhất</option>
                </select>
              </label>
            </div>
            {jobsLoading ? (
              <Loading />
            ) : error ? (
              <Empty title="Chưa tải được việc làm" text={error}>
                <button className="btn primary" onClick={refreshJobs}>
                  Thử lại
                </button>
              </Empty>
            ) : filtered.length ? (
              <>
                <div className="job-grid two">
                  {filtered.map((j, i) => (
                    <JobCard job={j} index={i} key={j.id} />
                  ))}
                </div>
                <p className="demo-note">
                  Tin minh họa được đánh dấu rõ trên từng thẻ; đơn ứng tuyển vào
                  tin này chỉ phục vụ trải nghiệm.
                </p>
              </>
            ) : (
              <Empty
                title="Chưa tìm thấy cơ hội tương ứng"
                text="Thử một từ khóa khác hoặc mở rộng bộ lọc của bạn."
              >
                <button className="btn secondary" onClick={clear}>
                  Xóa bộ lọc
                </button>
              </Empty>
            )}
          </section>
        </div>
      </div>
    </>
  );
}
export function JobDetail({ id }: { id: string }) {
  const { user, saved, toggleSave, notify } = useApp();
  const router = useRouter();
  const [job, setJob] = useState<Job | null>(null),
    [error, setError] = useState(""),
    [profile, setProfile] = useState<Profile | null>(null),
    [applied, setApplied] = useState(false),
    [showApply, setShowApply] = useState(false),
    [cover, setCover] = useState(""),
    [busy, setBusy] = useState(false);
  useEffect(() => {
    void api<{ job: Job }>(`jobs/${id}`)
      .then((d) => setJob(d.job))
      .catch((e) => setError(e.message));
  }, [id]);
  useEffect(() => {
    if (user?.role === "candidate") {
      void api<{ profile: Profile }>("profile")
        .then((d) => setProfile(d.profile))
        .catch((e) => notify(e.message));
      void api<{ applications: Application[] }>("applications")
        .then((d) => setApplied(d.applications.some((a) => a.job_id === id)))
        .catch((e) => notify(e.message));
    }
  }, [user, id]);
  async function apply(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await api("applications", "POST", { job_id: id, cover_letter: cover });
      setApplied(true);
      setShowApply(false);
      notify(
        job?.is_demo
          ? "Đã lưu đơn trải nghiệm. Tin minh họa không gửi đến doanh nghiệp bên ngoài."
          : "Đã gửi hồ sơ đến nhà tuyển dụng. Theo dõi tại Hồ sơ của bạn.",
      );
    } catch (e) {
      notify((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  if (error)
    return (
      <div className="container page-content">
        <Empty title="Không thể mở việc làm" text={error}>
          <Link href="/viec-lam" className="btn primary">
            Quay lại việc làm
          </Link>
        </Empty>
      </div>
    );
  if (!job) return <Loading />;
  const match = profile?.skills.length ? careerMatch(profile, job) : null;
  const closed =
    !job.active || job.expires_at < new Date().toISOString().slice(0, 10);
  return (
    <div className="container page-content">
      <Link href="/viec-lam" className="back-link">
        <ArrowLeft size={16} /> Tất cả việc làm
      </Link>
      {job.is_demo === 1 && (
        <div className="notice">
          Tin minh họa để trải nghiệm Hợp Việc. Đơn ứng tuyển được lưu trong hệ
          thống, không gửi tới một doanh nghiệp thực tế.
        </div>
      )}
      <div className="detail-top card">
        <CompanyLogo company={job.company} large />
        <div>
          <span className="eyebrow">{job.company}</span>
          <h1>{job.title}</h1>
          <div className="job-meta">
            <span>
              <MapPin size={15} />
              {job.location}
            </span>
            <span>
              <BriefcaseBusiness size={15} />
              {job.type}
            </span>
            <span>
              <CalendarDays size={15} />
              Đến {dateLabel(job.expires_at)}
            </span>
          </div>
        </div>
        <div className="detail-actions">
          <button
            className="btn primary"
            disabled={applied || closed || user?.role === "employer"}
            onClick={() => {
              if (!user)
                router.push(
                  `/dang-nhap?next=${encodeURIComponent("/viec-lam/" + id)}`,
                );
              else setShowApply(true);
            }}
          >
            {closed ? (
              "Đã đóng tuyển dụng"
            ) : applied ? (
              <>
                <Check size={17} />
                Đã ứng tuyển
              </>
            ) : (
              <>
                Ứng tuyển ngay <ArrowUpRight size={17} />
              </>
            )}
          </button>
          <button className="btn secondary" onClick={() => toggleSave(id)}>
            <Bookmark size={16} />
            {saved.includes(id) ? "Đã lưu" : "Lưu việc làm"}
          </button>
        </div>
      </div>
      <div className="detail-layout">
        <div>
          <section className="card detail-section">
            <h2>Câu chuyện công việc</h2>
            <p className="multiline">{job.description}</p>
            <h3>Điều đội nhóm tìm kiếm</h3>
            <p className="multiline">{job.requirements}</p>
            <h3>Những điều bạn nhận được</h3>
            <p className="multiline">{job.benefits}</p>
            <h3>Kỹ năng cần thiết</h3>
            <div className="chips">
              {job.skills.map((s) => (
                <span key={s}>{s}</span>
              ))}
            </div>
          </section>
          {showApply && (
            <section className="card detail-section" id="apply">
              <div className="section-head compact">
                <h2>Gửi một lời chào</h2>
                <button
                  className="icon-btn"
                  aria-label="Đóng biểu mẫu ứng tuyển"
                  onClick={() => setShowApply(false)}
                >
                  <X size={18} />
                </button>
              </div>
              <p>
                CV và hồ sơ hiện tại của bạn được đính kèm thành bản lưu tại
                thời điểm gửi.
              </p>
              {!profile?.cv_name || !profile?.headline ? (
                <div className="notice">
                  Bạn cần bổ sung chức danh và CV PDF trước khi gửi.{" "}
                  <Link href="/ho-so">
                    Hoàn thiện hồ sơ <ArrowRight size={14} />
                  </Link>
                </div>
              ) : (
                <form onSubmit={apply}>
                  <div className="attached-cv">
                    <FileIcon /> {profile.cv_name}
                  </div>
                  <label>
                    Lời giới thiệu
                    <textarea
                      minLength={20}
                      maxLength={4000}
                      rows={5}
                      required
                      placeholder="Chia sẻ lý do bạn quan tâm đến công việc và điều bạn có thể đóng góp…"
                      value={cover}
                      onChange={(e) => setCover(e.target.value)}
                    />
                  </label>
                  <button className="btn primary" disabled={busy}>
                    {busy ? (
                      <LoaderCircle className="spin" size={17} />
                    ) : (
                      <Send size={17} />
                    )}
                    Gửi hồ sơ{job.is_demo ? " trải nghiệm" : ""}
                  </button>
                </form>
              )}
            </section>
          )}
        </div>
        <aside>
          <section className="card detail-section">
            <h3>Thông tin công việc</h3>
            <div className="info-row">
              <Banknote />
              <div>
                <span>Mức lương / tháng</span>
                <strong>{salary(job.salary_min, job.salary_max)}</strong>
              </div>
            </div>
            <div className="info-row">
              <BriefcaseBusiness />
              <div>
                <span>Lĩnh vực</span>
                <strong>{job.category}</strong>
              </div>
            </div>
            <div className="info-row">
              <Sparkles />
              <div>
                <span>Phong cách đội nhóm</span>
                <strong>{styles[job.work_style]}</strong>
              </div>
            </div>
            <div className="info-row">
              <CalendarDays />
              <div>
                <span>Ngày đăng</span>
                <strong>{dateLabel(job.created_at)}</strong>
              </div>
            </div>
          </section>
          <section className="fit-card">
            <Sparkles size={24} />
            <h3>Bạn và công việc này</h3>
            {match ? (
              <>
                <div className="fit-score">
                  {match.score}
                  <span>%</span>
                </div>
                <p>Điểm tương đồng theo thông tin tự khai báo.</p>
                <ul className="score-breakdown">
                  <li>
                    Kỹ năng <b>{match.skillScore}/60</b>
                  </li>
                  <li>
                    Phong cách <b>{match.styleScore}/25</b>
                  </li>
                  <li>
                    Địa điểm <b>{match.locationScore}/15</b>
                  </li>
                </ul>
              </>
            ) : (
              <p>
                Thêm kỹ năng và phong cách làm việc vào hồ sơ để khám phá điểm
                tương đồng.
              </p>
            )}
            <Link href="/do-phu-hop" className="btn secondary">
              Khám phá chi tiết <ArrowRight size={15} />
            </Link>
          </section>
        </aside>
      </div>
    </div>
  );
}
function FileIcon() {
  return <BriefcaseBusiness size={18} />;
}
