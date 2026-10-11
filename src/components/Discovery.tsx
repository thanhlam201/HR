"use client";
import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowRight,
  Check,
  Compass,
  FileText,
  Leaf,
  Sparkles,
  Stars,
  Users,
  ShieldCheck,
} from "lucide-react";
import { Empty, JobCard, Loading, PageIntro, useApp } from "./App";
import { api } from "@/lib/client";
import {
  careerMatch,
  zodiac,
  lunarElement,
  elementRelation,
  quizStyle,
} from "@/lib/matching";
import { styles, type Profile } from "@/lib/types";
export function MatchPage() {
  const params = useSearchParams();
  const [tab, setTab] = useState(
    params.get("tab") === "astro" ? "astro" : "career",
  );
  return (
    <>
      <PageIntro
        label="HIỂU MÌNH HƠN. CHỌN ĐÚNG HƠN."
        title="Khám phá sự phù hợp."
        description="Hai góc nhìn riêng biệt. Bạn chọn điều muốn khám phá."
      />
      <div className="container page-content">
        <div className="match-tabs">
          <button
            className={tab === "career" ? "selected" : ""}
            onClick={() => setTab("career")}
          >
            <BriefcaseIcon />
            <span>
              <strong>Phù hợp nghề nghiệp</strong>
              <small>Kỹ năng · phong cách · địa điểm</small>
            </span>
          </button>
          <button
            className={tab === "astro" ? "selected" : ""}
            onClick={() => setTab("astro")}
          >
            <Stars size={24} />
            <span>
              <strong>Tham khảo phong thủy</strong>
              <small>Cung hoàng đạo · ngũ hành nạp âm</small>
            </span>
          </button>
        </div>
        {tab === "career" ? <Career /> : <Astro />}
      </div>
    </>
  );
}
function BriefcaseIcon() {
  return <Compass size={24} />;
}
function Career() {
  const { jobs, jobsLoading, user, notify, error } = useApp();
  const [input, setInput] = useState({
      skills: "",
      location: "",
      work_style: "collaborative" as Profile["work_style"],
    }),
    [ready, setReady] = useState(false);
  useEffect(() => {
    if (user?.role === "candidate")
      void api<{ profile: Profile }>("profile")
        .then(({ profile }) => {
          setInput({
            skills: profile.skills.join(", "),
            location: profile.location,
            work_style: profile.work_style,
          });
          setReady(profile.skills.length > 0);
        })
        .catch((e) => notify(e.message));
  }, [user]);
  const profile = {
    ...input,
    skills: input.skills
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
  };
  const results = jobs
    .map((job) => ({ job, match: careerMatch(profile, job) }))
    .sort((a, b) => b.match.score - a.match.score);
  return (
    <>
      <div className="career-layout">
        <form
          className="card form-card"
          onSubmit={(e) => {
            e.preventDefault();
            setReady(true);
          }}
        >
          <span className="section-icon">
            <Users size={23} />
          </span>
          <h2>Bắt đầu từ chính bạn</h2>
          <p className="small-muted">
            Thông tin ở đây dùng để khám phá, không tự thay đổi hồ sơ đã lưu.
          </p>
          <label>
            Kỹ năng của bạn
            <input
              value={input.skills}
              onChange={(e) => {
                setInput({ ...input, skills: e.target.value });
                setReady(false);
              }}
              required
              placeholder="React, TypeScript, CSS…"
            />
            <span className="field-help">
              Ngăn cách bằng dấu phẩy; đối chiếu tên kỹ năng, không phân biệt
              hoa/thường và dấu.
            </span>
          </label>
          <label>
            Phong cách làm việc
            <select
              value={input.work_style}
              onChange={(e) => {
                setInput({
                  ...input,
                  work_style: e.target.value as Profile["work_style"],
                });
                setReady(false);
              }}
            >
              {Object.entries(styles).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </label>
          <label>
            Địa điểm mong muốn
            <select
              value={input.location}
              onChange={(e) => {
                setInput({ ...input, location: e.target.value });
                setReady(false);
              }}
            >
              <option value="">Chọn địa điểm</option>
              {["Hồ Chí Minh", "Hà Nội", "Đà Nẵng", "Remote", "Khác"].map(
                (s) => (
                  <option key={s}>{s}</option>
                ),
              )}
            </select>
          </label>
          <button className="btn primary">
            <Sparkles size={17} />
            Khám phá kết quả
          </button>
        </form>
        <section className="career-explanation">
          <span className="eyebrow">RÕ RÀNG TỪ CÁCH TÍNH</span>
          <h2>
            Điểm tương đồng,
            <br />
            để mở đầu cuộc trò chuyện.
          </h2>
          <p>
            Đây là phép đối chiếu thông tin tự khai báo, không phải dự đoán hiệu
            suất hay đánh giá tính cách chuyên môn.
          </p>
          <div className="weight-row">
            <strong>
              60<span>%</span>
            </strong>
            <div>
              <h4>Kỹ năng cần thiết</h4>
              <p>Tỷ lệ kỹ năng trong tin tuyển dụng bạn đã khai báo.</p>
            </div>
          </div>
          <div className="weight-row">
            <strong>
              25<span>%</span>
            </strong>
            <div>
              <h4>Phong cách làm việc</h4>
              <p>Cùng lựa chọn với mô tả của đội nhóm.</p>
            </div>
          </div>
          <div className="weight-row">
            <strong>
              15<span>%</span>
            </strong>
            <div>
              <h4>Địa điểm</h4>
              <p>Trùng địa điểm mong muốn hoặc công việc Remote.</p>
            </div>
          </div>
          <div className="notice">
            Kết quả không sử dụng ngày sinh, giới tính, cung hoàng đạo hay thông
            tin phong thủy.
          </div>
        </section>
      </div>
      {jobsLoading ? (
        <Loading />
      ) : error ? (
        <Empty title="Chưa có dữ liệu để đối chiếu" text={error} />
      ) : ready ? (
        <section className="section">
          <div className="section-head">
            <div>
              <span className="eyebrow">DỰA TRÊN THÔNG TIN BẠN VỪA NHẬP</span>
              <h2>Những điểm chung để khám phá</h2>
            </div>
            <span className="small-muted">{results.length} công việc</span>
          </div>
          <div className="job-grid">
            {results.map(({ job, match }, i) => (
              <div className="match-result" key={job.id}>
                <JobCard job={job} index={i} match={match.score} />
                <div className="match-details">
                  <span>
                    Kỹ năng {match.skillScore}/60 · Phong cách{" "}
                    {match.styleScore}/25 · Địa điểm {match.locationScore}/15
                  </span>
                  <p>
                    {match.matched.length
                      ? `Đã có: ${match.matched.join(", ")}`
                      : "Chưa trùng kỹ năng được liệt kê."}
                  </p>
                  {match.missing.length > 0 && (
                    <p>Cần tìm hiểu thêm: {match.missing.join(", ")}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
          {!results.length && (
            <Empty
              title="Chưa có tin tuyển dụng đang mở"
              text="Quay lại khi có cơ hội mới để khám phá điểm tương đồng."
            />
          )}
        </section>
      ) : (
        <div className="notice">
          <Sparkles size={18} />
          Nhập kỹ năng rồi chọn “Khám phá kết quả” để xem đối chiếu với các công
          việc đang mở.
        </div>
      )}
    </>
  );
}
function Astro() {
  const [result, setResult] = useState<{
      a: ReturnType<typeof zodiac>;
      b: ReturnType<typeof zodiac>;
      ea: string | null;
      eb: string | null;
      relation: string;
    } | null>(null),
    [error, setError] = useState("");
  function calculate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget));
    const a = zodiac(String(data.date_a)),
      b = zodiac(String(data.date_b));
    if (!a || !b) {
      setError("Hãy nhập hai ngày sinh dương lịch hợp lệ.");
      return;
    }
    const ea = data.year_a ? lunarElement(Number(data.year_a)) : null,
      eb = data.year_b ? lunarElement(Number(data.year_b)) : null;
    setError("");
    setResult({ a, b, ea, eb, relation: String(data.relation) });
  }
  return (
    <>
      <div className="notice blue-notice">
        <ShieldCheck size={21} />
        <div>
          <strong>Một góc nhìn văn hóa, hoàn toàn tự nguyện.</strong>
          <p>
            Không có cơ sở khoa học để dự đoán hiệu suất hay khả năng cộng tác
            từ ngày sinh. Thông tin bạn nhập chỉ được tính trong trình duyệt,
            không lưu vào hồ sơ và không gửi đến nhà tuyển dụng.
          </p>
        </div>
      </div>
      <div className="career-layout">
        <form className="card form-card" onSubmit={calculate}>
          <span className="section-icon blue">
            <Stars size={23} />
          </span>
          <h2>Cùng khám phá một góc nhìn</h2>
          <label>
            Người bạn muốn tham khảo
            <select name="relation">
              <option>Quản lý trực tiếp</option>
              <option>Đồng nghiệp</option>
            </select>
          </label>
          <div className="form-grid">
            <label>
              Ngày sinh của bạn (dương lịch)
              <input
                name="date_a"
                type="date"
                required
                max={new Date().toISOString().slice(0, 10)}
              />
            </label>
            <label>
              Ngày sinh người kia (dương lịch)
              <input
                name="date_b"
                type="date"
                required
                max={new Date().toISOString().slice(0, 10)}
              />
            </label>
            <label>
              Năm sinh âm lịch của bạn
              <input
                name="year_a"
                type="number"
                min={1900}
                max={2100}
                placeholder="Tùy chọn, VD: 1995"
              />
            </label>
            <label>
              Năm sinh âm lịch người kia
              <input
                name="year_b"
                type="number"
                min={1900}
                max={2100}
                placeholder="Tùy chọn, VD: 1990"
              />
            </label>
          </div>
          <p className="field-help">
            Nhập đúng năm âm lịch nếu muốn xem ngũ hành nạp âm; người sinh trước
            Tết có thể thuộc năm âm lịch trước. Công cụ không tự chuyển lịch và
            không lập lá số tử vi.
          </p>
          <label className="check-label">
            <input type="checkbox" required />
            Tôi chỉ sử dụng ngày sinh được người đó tự nguyện chia sẻ và hiểu
            kết quả chỉ để tham khảo.
          </label>
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          <button className="btn primary">
            <Stars size={17} />
            Xem góc nhìn tham khảo
          </button>
        </form>
        <section className="astro-output card">
          {result ? (
            <>
              <span className="eyebrow">THAM KHẢO · KHÔNG CHẤM ĐIỂM</span>
              <h2>Hai cá tính, một cuộc trò chuyện.</h2>
              <div className="zodiac-pair">
                <div>
                  <span className="zodiac-icon">✧</span>
                  <small>Bạn</small>
                  <strong>{result.a!.name}</strong>
                  <span>Nhóm nguyên tố {result.a!.element}</span>
                  {result.ea && <span>Nạp âm: hành {result.ea}</span>}
                </div>
                <span className="pair-plus">+</span>
                <div>
                  <span className="zodiac-icon">✦</span>
                  <small>{result.relation}</small>
                  <strong>{result.b!.name}</strong>
                  <span>Nhóm nguyên tố {result.b!.element}</span>
                  {result.eb && <span>Nạp âm: hành {result.eb}</span>}
                </div>
              </div>
              <p className="astro-reading">
                {result.a!.element === result.b!.element
                  ? "Hai cung cùng nhóm nguyên tố theo cách phân loại chiêm tinh phương Tây."
                  : "Hai cung thuộc các nhóm nguyên tố khác nhau theo cách phân loại chiêm tinh phương Tây."}
              </p>
              {result.ea && result.eb && (
                <p className="astro-reading">
                  {elementRelation(result.ea, result.eb)}.
                </p>
              )}
              <div className="notice">
                Hãy dùng góc nhìn này để mở đầu cuộc trò chuyện. Hỏi nhau về
                cách phản hồi, sự tự chủ và kỳ vọng thực tế sẽ giúp hiểu đội
                nhóm hơn.
              </div>
            </>
          ) : (
            <>
              <span className="astro-star">✳</span>
              <h2>
                Một chút tò mò.
                <br />
                Thêm một góc nhìn.
              </h2>
              <p>
                Khám phá cung hoàng đạo theo ngày sinh dương lịch và ngũ hành
                nạp âm theo năm âm lịch do bạn nhập.
              </p>
              <span className="pill">Không ảnh hưởng điểm nghề nghiệp</span>
            </>
          )}
        </section>
      </div>
    </>
  );
}
const questions = [
  {
    q: "Khi bắt đầu một dự án, bạn thường…",
    a: [
      "Trao đổi với đội nhóm để cùng thống nhất",
      "Tự nghiên cứu rồi đề xuất hướng đi",
      "Lập kế hoạch và chia từng bước rõ ràng",
      "Thử nhanh vài ý tưởng để tìm hướng mới",
    ],
  },
  {
    q: "Một ngày làm việc dễ chịu với bạn là…",
    a: [
      "Có nhiều kết nối và hỗ trợ lẫn nhau",
      "Có khoảng thời gian tập trung không gián đoạn",
      "Có lịch trình và ưu tiên rõ ràng",
      "Được linh hoạt lựa chọn cách thực hiện",
    ],
  },
  {
    q: "Khi gặp một vấn đề khó, bạn muốn…",
    a: [
      "Cùng đồng nghiệp thảo luận giải pháp",
      "Có không gian tự tìm hiểu và giải quyết",
      "Có dữ liệu, quy trình và tiêu chí rõ ràng",
      "Thử cách khác và thay đổi khi cần",
    ],
  },
  {
    q: "Bạn thích nhận phản hồi theo cách nào?",
    a: [
      "Trao đổi trực tiếp, cởi mở với đội nhóm",
      "Nhận ghi chú để tự suy nghĩ và cải thiện",
      "Có tiêu chí cụ thể và bước tiếp theo",
      "Có gợi ý mở để tự thử nghiệm",
    ],
  },
];
export function ToolsPage() {
  const { user, notify } = useApp();
  const [answers, setAnswers] = useState<number[]>(Array(4).fill(-1)),
    [done, setDone] = useState(false),
    [saving, setSaving] = useState(false);
  const style = quizStyle(answers);
  async function saveStyle() {
    setSaving(true);
    try {
      const { profile } = await api<{ profile: Profile }>("profile");
      await api("profile", "PUT", { ...profile, work_style: style });
      notify("Đã lưu phong cách làm việc vào hồ sơ.");
    } catch (e) {
      notify((e as Error).message);
    } finally {
      setSaving(false);
    }
  }
  return (
    <>
      <PageIntro
        label="HÀNH TRANG CHO BƯỚC TIẾP THEO"
        title="Hiểu mình. Sẵn sàng hơn."
        description="Những công cụ nhỏ để bạn chuẩn bị cho một cơ hội lớn."
      />
      <div className="container page-content">
        <div className="tool-grid">
          <Link href="/ho-so" className="tool-card">
            <span className="category-icon green">
              <FileText size={26} />
            </span>
            <h3>Tạo CV từ hồ sơ</h3>
            <p>
              Biến câu chuyện và kinh nghiệm của bạn thành một bản CV gọn gàng,
              có thể lưu PDF.
            </p>
            <span className="text-link">
              Tạo hồ sơ <ArrowRight size={16} />
            </span>
          </Link>
          <a href="#quiz" className="tool-card">
            <span className="category-icon blue">
              <Compass size={26} />
            </span>
            <h3>Phong cách làm việc</h3>
            <p>
              Bốn câu hỏi về sở thích làm việc để tìm mô tả gần với chính bạn.
            </p>
            <span className="text-link">
              Khám phá bản thân <ArrowRight size={16} />
            </span>
          </a>
          <Link href="/do-phu-hop?tab=astro" className="tool-card">
            <span className="category-icon purple">
              <Stars size={26} />
            </span>
            <h3>Góc nhìn phong thủy</h3>
            <p>
              Khám phá cung hoàng đạo và ngũ hành ở một không gian tham khảo
              riêng biệt.
            </p>
            <span className="text-link">
              Xem góc nhìn <ArrowRight size={16} />
            </span>
          </Link>
        </div>
        <section className="quiz card" id="quiz">
          <div className="section-head">
            <div>
              <span className="eyebrow">BÀI KHÁM PHÁ NGẮN · 4 CÂU HỎI</span>
              <h2>Bạn thích làm việc theo cách nào?</h2>
              <p>
                Không có đúng hay sai. Chọn điều gần nhất với thói quen của bạn.
              </p>
            </div>
            <span className="quiz-count">
              {answers.filter((a) => a >= 0).length}/4
            </span>
          </div>
          {done ? (
            <div className="quiz-result">
              <span className="section-icon">
                <Sparkles size={28} />
              </span>
              <span className="eyebrow">
                MÔ TẢ GẦN NHẤT VỚI LỰA CHỌN CỦA BẠN
              </span>
              <h2>{styles[style]}</h2>
              <p>
                Đây là gợi ý từ các lựa chọn của bạn, không phải bài trắc nghiệm
                tâm lý được chuẩn hóa. Khi bằng điểm, công cụ chọn nhóm xuất
                hiện trước. Bạn có thể tự chọn lại phong cách trong hồ sơ.
              </p>
              <div className="button-row">
                {user?.role === "candidate" ? (
                  <button
                    className="btn primary"
                    disabled={saving}
                    onClick={saveStyle}
                  >
                    <Check size={17} />
                    Lưu vào hồ sơ
                  </button>
                ) : (
                  <Link href="/dang-ky" className="btn primary">
                    Tạo hồ sơ của bạn <ArrowRight size={16} />
                  </Link>
                )}
                <button
                  className="btn secondary"
                  onClick={() => {
                    setDone(false);
                    setAnswers(Array(4).fill(-1));
                  }}
                >
                  Làm lại
                </button>
              </div>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setDone(true);
              }}
            >
              {questions.map((question, i) => (
                <fieldset className="quiz-question" key={question.q}>
                  <legend>
                    <span>0{i + 1}</span>
                    {question.q}
                  </legend>
                  <div className="quiz-options">
                    {question.a.map((answer, j) => (
                      <label
                        className={answers[i] === j ? "chosen" : ""}
                        key={answer}
                      >
                        <input
                          type="radio"
                          name={`q${i}`}
                          required
                          checked={answers[i] === j}
                          onChange={() =>
                            setAnswers((old) =>
                              old.map((a, n) => (n === i ? j : a)),
                            )
                          }
                        />
                        {answer}
                      </label>
                    ))}
                  </div>
                </fieldset>
              ))}
              <button
                className="btn primary"
                disabled={answers.some((a) => a < 0)}
              >
                Xem phong cách của tôi <ArrowRight size={17} />
              </button>
            </form>
          )}
        </section>
        <section className="interview-tips">
          <span className="eyebrow">MANG THEO NHỮNG CÂU HỎI TỐT</span>
          <h2>Hiểu đội nhóm trong buổi phỏng vấn</h2>
          <div className="tips-grid">
            {[
              "Đội nhóm thường trao đổi phản hồi như thế nào?",
              "Thành công trong 90 ngày đầu được đánh giá ra sao?",
              "Công việc này có mức độ tự chủ như thế nào?",
              "Khi có bất đồng, đội nhóm giải quyết theo cách nào?",
            ].map((t, i) => (
              <div className="card" key={t}>
                <span>0{i + 1}</span>
                <p>{t}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
