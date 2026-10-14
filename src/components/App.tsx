"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  Suspense,
  type ReactNode,
} from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  ArrowUpRight,
  ArrowRight,
  Search,
  MapPin,
  Sparkles,
  Bookmark,
  BriefcaseBusiness,
  Users,
  FileText,
  Menu,
  X,
  Check,
  ChevronDown,
  Heart,
  Leaf,
  LogOut,
  LoaderCircle,
  SlidersHorizontal,
  Compass,
  CodeXml,
  Megaphone,
  Palette,
  Building2,
  ShieldCheck,
  CircleCheck,
  Mail,
  MoveUpRight,
} from "lucide-react";
import { api, salary } from "@/lib/client";
import type { Job, User } from "@/lib/types";
import { Jobs, JobDetail } from "./Jobs";
import { Auth, ProfilePage, Employer, PostJob } from "./Account";
import { MatchPage, ToolsPage } from "./Discovery";
type Context = {
  user: User | null;
  authLoading: boolean;
  jobs: Job[];
  jobsLoading: boolean;
  error: string;
  saved: string[];
  notify: (text: string) => void;
  refreshUser: () => Promise<void>;
  refreshJobs: () => Promise<void>;
  toggleSave: (id: string) => Promise<void>;
};
const AppContext = createContext<Context>(null!);
export const useApp = () => useContext(AppContext);
export const Logo = () => (
  <Link href="/" className="brand" aria-label="Hợp Việc — Trang chủ">
    <span className="brand-mark">
      <i />
      <i />
      <i />
      <i />
    </span>
    hợp<span>việc</span>
    <span className="brand-dot">.</span>
  </Link>
);
const nav = [
  ["/", "Trang chủ"],
  ["/viec-lam", "Việc làm"],
  ["/ho-so", "CV / Hồ sơ"],
  ["/cong-cu", "Công cụ"],
  ["/do-phu-hop", "Đánh giá độ phù hợp"],
];
function Header() {
  const { user, authLoading, refreshUser, notify } = useApp();
  const path = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [path]);
  async function signout() {
    try {
      await api("auth/logout", "POST");
      await refreshUser();
      router.push("/");
      notify("Bạn đã đăng xuất.");
    } catch (e) {
      notify((e as Error).message);
    }
  }
  return (
    <>
      <div className="topline">
        <span>
          <Leaf size={12} /> Một nơi để làm việc. Một nơi để thuộc về.
        </span>
        <Link href="/nha-tuyen-dung">
          Dành cho nhà tuyển dụng <ArrowUpRight size={13} />
        </Link>
      </div>
      <header className="header">
        <div className="header-inner">
          <Logo />
          <nav
            className={open ? "nav open" : "nav"}
            aria-label="Điều hướng chính"
          >
            {nav.map(([href, label]) => (
              <Link
                key={href}
                href={href}
                className={path === href ? "active" : ""}
              >
                {label}
                {href === "/do-phu-hop" && <span className="new-tag">Mới</span>}
              </Link>
            ))}
          </nav>
          <div className="header-actions">
            {user ? (
              <>
                <Link
                  className="user-pill"
                  href={user.role === "employer" ? "/nha-tuyen-dung" : "/ho-so"}
                >
                  <span className="avatar tiny">{user.name.slice(0, 1)}</span>
                  <span>{user.name.split(" ").slice(-1)}</span>
                </Link>
                <button
                  className="icon-btn"
                  aria-label="Đăng xuất"
                  onClick={signout}
                >
                  <LogOut size={18} />
                </button>
              </>
            ) : (
              <>
                <Link href="/dang-nhap" className="login-link">
                  {authLoading ? "…" : "Đăng nhập"}
                </Link>
                <Link href="/dang-ky" className="btn primary small">
                  Đăng ký
                </Link>
              </>
            )}
            <button
              className="icon-btn mobile-toggle"
              aria-label={open ? "Đóng menu" : "Mở menu"}
              aria-expanded={open}
              onClick={() => setOpen(!open)}
            >
              {open ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </header>
    </>
  );
}
function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div>
          <Logo />
          <p>
            Kết nối đúng người.
            <br />
            Cùng nhau phát triển.
          </p>
          <span className="footer-note">
            Một khởi đầu mới, hợp với chính bạn.
          </span>
        </div>
        <div>
          <h4>Dành cho ứng viên</h4>
          <Link href="/viec-lam">Khám phá việc làm</Link>
          <Link href="/ho-so">CV / Hồ sơ của tôi</Link>
          <Link href="/do-phu-hop">Đánh giá độ phù hợp</Link>
        </div>
        <div>
          <h4>Dành cho doanh nghiệp</h4>
          <Link href="/nha-tuyen-dung">Quản lý tuyển dụng</Link>
          <Link href="/dang-tin">Đăng tin tuyển dụng</Link>
          <Link href="/dang-ky?role=employer">Tạo tài khoản doanh nghiệp</Link>
        </div>
        <div>
          <h4>Cùng hiểu mình hơn</h4>
          <Link href="/cong-cu">Khám phá phong cách làm việc</Link>
          <Link href="/do-phu-hop?tab=astro">Tham khảo phong thủy</Link>
          <p className="small-muted">
            Kết nối bằng năng lực.
            <br />
            Đồng hành bằng sự thấu hiểu.
          </p>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© {new Date().getFullYear()} Hợp Việc. Một nơi để bắt đầu.</span>
        <span>
          Thiết kế cho những kết nối có ý nghĩa <Heart size={13} />
        </span>
      </div>
    </footer>
  );
}
export function PageIntro({
  label,
  title,
  description,
  children,
}: {
  label: string;
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <section className="page-intro">
      <div className="container">
        <div>
          <span className="eyebrow">{label}</span>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
        {children}
      </div>
    </section>
  );
}
export function Loading() {
  return (
    <div className="loading">
      <LoaderCircle className="spin" size={24} />
      <span>Đang tải…</span>
    </div>
  );
}
export function Empty({
  title,
  text,
  children,
}: {
  title: string;
  text: string;
  children?: ReactNode;
}) {
  return (
    <div className="empty">
      <Compass size={38} />
      <h3>{title}</h3>
      <p>{text}</p>
      {children}
    </div>
  );
}
export function Gate({
  role,
  children,
}: {
  role?: string;
  children: ReactNode;
}) {
  const { user, authLoading } = useApp();
  const path = usePathname();
  if (authLoading) return <Loading />;
  if (!user)
    return (
      <Empty
        title="Bắt đầu bằng một tài khoản"
        text="Đăng nhập để lưu hồ sơ và tiếp tục hành trình của bạn."
      >
        <Link
          href={`/dang-nhap?next=${encodeURIComponent(path)}`}
          className="btn primary"
        >
          Đăng nhập <ArrowRight size={16} />
        </Link>
      </Empty>
    );
  if (role && user.role !== role)
    return (
      <Empty
        title={
          role === "employer"
            ? "Không gian dành cho nhà tuyển dụng"
            : "Không gian dành cho ứng viên"
        }
        text="Chức năng này sử dụng loại tài khoản tương ứng."
      >
        <Link
          href={user.role === "employer" ? "/nha-tuyen-dung" : "/viec-lam"}
          className="btn primary"
        >
          Đến không gian của tôi
        </Link>
      </Empty>
    );
  return <>{children}</>;
}
const companyColors = [
  "#edecff",
  "#e6f5ea",
  "#fff1e7",
  "#e7f1ff",
  "#e4f4f5",
  "#fce9f2",
];
export function CompanyLogo({
  company,
  index = 0,
  large = false,
}: {
  company: string;
  index?: number;
  large?: boolean;
}) {
  const brandIndex =
    [...company].reduce((sum, letter) => sum + letter.charCodeAt(0), 0) %
    companyColors.length;
  const mark =
    company === "Lumi Studio" ? (
      <Sparkles />
    ) : company === "GreenTech" ? (
      <Leaf />
    ) : company === "Mây Agency" ? (
      <Megaphone />
    ) : company === "Bloom People" ? (
      <Users />
    ) : company === "Blue Ocean" ? (
      <Compass />
    ) : null;
  return (
    <span
      className={`company-logo ${large ? "large" : ""}`}
      style={{ background: companyColors[brandIndex] }}
    >
      {mark ||
        company
          .split(" ")
          .map((v) => v[0])
          .slice(0, 2)
          .join("")
          .toUpperCase()}
    </span>
  );
}
export function JobCard({
  job,
  index = 0,
  match,
}: {
  job: Job;
  index?: number;
  match?: number;
}) {
  const { saved, toggleSave } = useApp();
  return (
    <article className="job-card">
      <div className="job-top">
        <CompanyLogo company={job.company} index={index} />
        <div className="job-company">
          <span>{job.company}</span>
          <span className="small-muted">
            {job.is_demo ? "Doanh nghiệp minh họa" : "Đang tuyển dụng"}
          </span>
        </div>
        <button
          className={`bookmark ${saved.includes(job.id) ? "selected" : ""}`}
          aria-label={
            saved.includes(job.id) ? `Bỏ lưu ${job.title}` : `Lưu ${job.title}`
          }
          onClick={() => toggleSave(job.id)}
        >
          <Bookmark
            size={19}
            fill={saved.includes(job.id) ? "currentColor" : "none"}
          />
        </button>
      </div>
      <div className="job-kicker">{job.category}</div>
      <Link className="job-title" href={`/viec-lam/${job.id}`}>
        {job.title}
      </Link>
      <div className="job-meta">
        <span>
          <MapPin size={14} />
          {job.location}
        </span>
        <span>{job.type}</span>
      </div>
      <div className="chips">
        {job.skills.slice(0, 3).map((s) => (
          <span key={s}>{s}</span>
        ))}
      </div>
      <div className="job-bottom">
        <strong>
          {salary(job.salary_min, job.salary_max)}
          <small> / tháng</small>
        </strong>
        {match !== undefined ? (
          <span className="match-badge">
            <Sparkles size={12} />
            {match}% phù hợp
          </span>
        ) : (
          <Link
            href={`/viec-lam/${job.id}`}
            className="job-arrow"
            aria-label={`Xem ${job.title}`}
          >
            <span>Xem chi tiết</span>
            <ArrowUpRight size={18} />
          </Link>
        )}
      </div>
    </article>
  );
}
function Home() {
  const { jobs, jobsLoading, error, refreshJobs } = useApp();
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");
  const router = useRouter();
  const categories = [
    { icon: CodeXml, name: "Công nghệ", class: "blue" },
    { icon: Megaphone, name: "Marketing", class: "orange" },
    { icon: Palette, name: "Thiết kế", class: "purple" },
    { icon: Users, name: "Nhân sự", class: "green" },
    { icon: BriefcaseBusiness, name: "Kinh doanh", class: "cyan" },
  ];
  return (
    <>
      <section className="hero">
        <div className="hero-orb orb-one" />
        <div className="hero-orb orb-two" />
        <div className="container hero-grid">
          <div className="hero-copy">
            <span className="hero-label">
              <span className="live-dot" /> MỘT CÔNG VIỆC. MỘT KẾT NỐI ĐÚNG.
            </span>
            <h1>
              Đúng công việc.
              <br />
              <span>Hợp chính mình.</span>
              <svg viewBox="0 0 390 18" aria-hidden="true">
                <path d="M3 13 Q190 -5 386 10" />
              </svg>
            </h1>
            <p>
              Không chỉ tìm một công việc. Tìm một nơi bạn được là mình, phát
              huy thế mạnh và cùng những người phù hợp tiến xa hơn.
            </p>
            <div className="hero-cta">
              <Link href="/viec-lam" className="btn primary">
                Khám phá cơ hội <ArrowUpRight size={18} />
              </Link>
              <Link href="/do-phu-hop" className="hero-fit-link">
                <span>
                  <Sparkles size={18} />
                </span>
                Tìm sự phù hợp <ArrowRight size={15} />
              </Link>
            </div>
            <div className="hero-highlights">
              <span>
                <CircleCheck size={16} /> Cơ hội đúng năng lực
              </span>
              <span>
                <CircleCheck size={16} /> Đội nhóm cùng tần số
              </span>
            </div>
          </div>
          <div
            className="hero-visual"
            aria-label="Minh họa kết nối ứng viên và đội nhóm"
          >
            <div className="visual-halo" aria-hidden="true" />
            <div className="visual-ring" aria-hidden="true" />
            <div className="career-photo">
              <Image
                src="/images/career-portrait.webp"
                width={640}
                height={800}
                alt="Hình minh họa một người trẻ tự tin bắt đầu hành trình nghề nghiệp"
                unoptimized
                loading="eager"
                fetchPriority="high"
              />
              <div className="photo-caption">
                <span className="live-dot" /> Một khởi đầu, thật là bạn.
              </div>
            </div>
            <div className="opportunity-note">
              <span className="note-icon">
                <BriefcaseBusiness size={22} />
              </span>
              <div>
                <span>CƠ HỘI MỚI</span>
                <strong>Product Designer</strong>
                <small>
                  <MapPin size={11} /> Hồ Chí Minh <i>Minh họa</i>
                </small>
              </div>
              <ArrowUpRight size={18} />
            </div>
            <div className="connection-note">
              <span className="note-spark">
                <Sparkles size={24} />
              </span>
              <span className="eyebrow">BẮT ĐẦU TỪ SỰ THẤU HIỂU</span>
              <strong>
                Hợp việc.
                <br />
                Hợp cả đội nhóm.
              </strong>
              <div className="connection-tags">
                <span>Kỹ năng</span>
                <span>Phong cách</span>
              </div>
            </div>
            <span className="visual-daisy" aria-hidden="true">
              ✳
            </span>
            <span className="visual-label">
              Tìm nơi bạn thuộc về <Heart size={13} />
            </span>
          </div>
        </div>
        <div className="container search-wrap">
          <form
            className="search-box"
            onSubmit={(e) => {
              e.preventDefault();
              router.push(
                `/viec-lam?q=${encodeURIComponent(query)}&location=${encodeURIComponent(location)}`,
              );
            }}
          >
            <div className="search-input">
              <Search size={21} />
              <input
                aria-label="Tìm chức danh, kỹ năng hoặc công ty"
                placeholder="Chức danh, kỹ năng hoặc công ty"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <div className="search-location">
              <MapPin size={20} />
              <select
                aria-label="Chọn địa điểm"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              >
                <option value="">Tất cả địa điểm</option>
                {["Hồ Chí Minh", "Hà Nội", "Đà Nẵng", "Remote"].map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
              <ChevronDown size={16} />
            </div>
            <button className="btn primary" type="submit">
              <Search size={18} /> Tìm việc ngay
            </button>
          </form>
          <div className="popular">
            <span>Tìm kiếm phổ biến:</span>
            {["UI/UX", "Marketing", "React", "Nhân sự"].map((s) => (
              <Link href={`/viec-lam?q=${encodeURIComponent(s)}`} key={s}>
                {s}
              </Link>
            ))}
          </div>
        </div>
      </section>
      <section className="value-strip container">
        <div>
          <BriefcaseBusiness />
          <span>
            <strong>Cơ hội phù hợp</strong>
            <small>Kết nối bằng kỹ năng thực tế</small>
          </span>
        </div>
        <div>
          <Users />
          <span>
            <strong>Đội nhóm đồng điệu</strong>
            <small>Thấu hiểu cách làm việc của nhau</small>
          </span>
        </div>
        <div>
          <ShieldCheck />
          <span>
            <strong>Hồ sơ do bạn làm chủ</strong>
            <small>Chia sẻ CV khi bạn ứng tuyển</small>
          </span>
        </div>
      </section>
      <section className="section container">
        <div className="section-head">
          <div>
            <span className="eyebrow">BẮT ĐẦU TỪ THẾ MẠNH CỦA BẠN</span>
            <h2>
              Khám phá theo lĩnh vực<span className="accent-dot">.</span>
            </h2>
          </div>
          <Link href="/viec-lam" className="text-link">
            Tất cả lĩnh vực <ArrowRight size={17} />
          </Link>
        </div>
        <div className="category-grid">
          {categories.map(({ icon: Icon, name, class: color }) => (
            <Link
              href={`/viec-lam?category=${encodeURIComponent(name)}`}
              className="category-card"
              key={name}
            >
              <span className={`category-icon ${color}`}>
                <Icon size={24} />
              </span>
              <strong>{name}</strong>
              <span>
                {jobs.filter((j) => j.category === name).length} cơ hội{" "}
                <ArrowUpRight size={15} />
              </span>
            </Link>
          ))}
        </div>
      </section>
      <section className="section jobs-section">
        <div className="container">
          <div className="section-head">
            <div>
              <span className="eyebrow">
                MỘT BƯỚC GẦN HƠN ĐẾN CÔNG VIỆC MỚI
              </span>
              <h2>
                Những cơ hội dành cho bạn<span className="accent-dot">.</span>
                <span className="pill">Khám phá</span>
              </h2>
              <p>
                Đọc kỹ công việc. Hiểu rõ đội nhóm. Chọn nơi bạn muốn đồng hành.
              </p>
            </div>
            <Link href="/viec-lam" className="text-link">
              Xem tất cả <ArrowRight size={17} />
            </Link>
          </div>
          {jobsLoading ? (
            <Loading />
          ) : error ? (
            <Empty title="Chưa tải được việc làm" text={error}>
              <button className="btn secondary" onClick={refreshJobs}>
                Thử lại
              </button>
            </Empty>
          ) : (
            <>
              <div className="job-grid">
                {jobs.slice(0, 6).map((job, i) => (
                  <JobCard job={job} index={i} key={job.id} />
                ))}
              </div>
              {jobs.some((j) => j.is_demo === 1) && (
                <p className="demo-note">
                  Các tin ghi “Doanh nghiệp minh họa” dùng để trải nghiệm, không
                  đại diện cho vị trí tuyển dụng thực tế.
                </p>
              )}
            </>
          )}
          <div className="center">
            <Link href="/viec-lam" className="btn secondary">
              Khám phá thêm việc làm <ArrowRight size={17} />
            </Link>
          </div>
        </div>
      </section>
      <section className="container match-banner">
        <div className="banner-copy">
          <span className="light-eyebrow">
            <Sparkles size={15} /> HIỂU MÌNH HƠN. CHỌN ĐÚNG HƠN.
          </span>
          <h2>
            Khi phù hợp,
            <br />
            mọi thứ đi xa hơn.
          </h2>
          <p>
            Khám phá sự tương đồng về kỹ năng và phong cách làm việc. Một góc
            nhìn mới để bắt đầu cuộc trò chuyện với đội nhóm tương lai.
          </p>
          <Link href="/do-phu-hop" className="btn mint">
            Khám phá độ phù hợp <MoveUpRight size={18} />
          </Link>
          <span className="banner-small">
            Tham khảo phong thủy được trình bày riêng, hoàn toàn tự nguyện.
          </span>
        </div>
        <div className="banner-graphic">
          <div className="venn venn-left">
            <span>
              <span className="venn-icon">
                <Users />
              </span>
              Thế mạnh
              <br />
              của bạn
            </span>
          </div>
          <div className="venn venn-right">
            <span>
              <span className="venn-icon">
                <Building2 />
              </span>
              Văn hóa
              <br />
              đội nhóm
            </span>
          </div>
          <span className="venn-center">
            <Sparkles size={27} />
          </span>
          <span className="banner-bubble">
            Một kết nối có ý nghĩa <Heart size={13} />
          </span>
        </div>
      </section>
      <section className="section container how-section">
        <div className="section-head">
          <div>
            <span className="eyebrow">
              HÀNH TRÌNH MỚI, BẮT ĐẦU THẬT ĐƠN GIẢN
            </span>
            <h2>Ba bước. Một khởi đầu tốt hơn.</h2>
          </div>
        </div>
        <div className="steps-grid">
          {[
            [
              FileText,
              "01",
              "Kể câu chuyện của bạn",
              "Tạo hồ sơ, thêm kỹ năng và CV để nhà tuyển dụng hiểu bạn hơn.",
            ],
            [
              Compass,
              "02",
              "Tìm sự phù hợp",
              "Khám phá cơ hội theo năng lực và phong cách làm việc của bạn.",
            ],
            [
              Heart,
              "03",
              "Bắt đầu một kết nối",
              "Ứng tuyển, theo dõi hồ sơ và trao đổi cùng nhà tuyển dụng.",
            ],
          ].map(([Icon, n, title, desc]) => {
            const I = Icon as typeof FileText;
            return (
              <div className="step" key={n as string}>
                <div>
                  <span className="step-icon">
                    <I size={24} />
                  </span>
                  <span className="step-number">{n as string}</span>
                </div>
                <h3>{title as string}</h3>
                <p>{desc as string}</p>
              </div>
            );
          })}
        </div>
      </section>
      <section className="employer-strip container">
        <span className="employer-strip-icon">
          <Building2 size={32} />
        </span>
        <div>
          <h3>Bạn đang tìm mảnh ghép cho đội nhóm?</h3>
          <p>
            Đăng tin tuyển dụng và gặp những ứng viên muốn đồng hành cùng bạn.
          </p>
        </div>
        <Link href="/nha-tuyen-dung" className="btn secondary">
          Dành cho nhà tuyển dụng <ArrowUpRight size={17} />
        </Link>
      </section>
    </>
  );
}
export default function App({ view, jobId }: { view: string; jobId?: string }) {
  const [user, setUser] = useState<User | null>(null),
    [authLoading, setAuthLoading] = useState(true),
    [jobs, setJobs] = useState<Job[]>([]),
    [jobsLoading, setJobsLoading] = useState(true),
    [error, setError] = useState(""),
    [saved, setSaved] = useState<string[]>([]),
    [toast, setToast] = useState("");
  const router = useRouter();
  async function refreshUser() {
    try {
      const data = await api<{ user: User | null }>("me");
      setUser(data.user);
      if (data.user?.role === "candidate")
        setSaved((await api<{ ids: string[] }>("saved")).ids);
      else setSaved([]);
    } finally {
      setAuthLoading(false);
    }
  }
  async function refreshJobs() {
    setJobsLoading(true);
    try {
      setJobs((await api<{ jobs: Job[] }>("jobs")).jobs);
      setError("");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setJobsLoading(false);
    }
  }
  useEffect(() => {
    void refreshUser().catch((e) => setToast((e as Error).message));
    void refreshJobs();
  }, []);
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);
  async function toggleSave(id: string) {
    if (!user) {
      router.push(`/dang-nhap?next=${encodeURIComponent("/viec-lam/" + id)}`);
      return;
    }
    if (user.role !== "candidate") {
      setToast("Lưu việc làm dành cho tài khoản ứng viên.");
      return;
    }
    try {
      const exists = saved.includes(id);
      await api("saved", exists ? "DELETE" : "POST", { job_id: id });
      setSaved((current) =>
        exists ? current.filter((s) => s !== id) : [...current, id],
      );
      setToast(exists ? "Đã bỏ lưu việc làm." : "Đã lưu vào hồ sơ của bạn.");
    } catch (e) {
      setToast((e as Error).message);
    }
  }
  const context = {
    user,
    authLoading,
    jobs,
    jobsLoading,
    error,
    saved,
    notify: setToast,
    refreshUser,
    refreshJobs,
    toggleSave,
  };
  return (
    <AppContext.Provider value={context}>
      <a className="skip-link" href="#main">
        Đến nội dung chính
      </a>
      <Header />
      <main id="main">
        <Suspense fallback={<Loading />}>
          {view === "home" ? (
            <Home />
          ) : view === "viec-lam" ? (
            <Jobs />
          ) : view === "job" ? (
            <JobDetail id={jobId!} />
          ) : view === "ho-so" ? (
            <ProfilePage />
          ) : view === "dang-nhap" || view === "dang-ky" ? (
            <Auth register={view === "dang-ky"} />
          ) : view === "nha-tuyen-dung" ? (
            <Employer />
          ) : view === "dang-tin" ? (
            <PostJob />
          ) : view === "do-phu-hop" ? (
            <MatchPage />
          ) : (
            <ToolsPage />
          )}
        </Suspense>
      </main>
      <Footer />
      {toast && (
        <div className="toast" role="status">
          <CircleCheck size={19} />
          <span>{toast}</span>
          <button aria-label="Đóng thông báo" onClick={() => setToast("")}>
            <X size={16} />
          </button>
        </div>
      )}
    </AppContext.Provider>
  );
}
