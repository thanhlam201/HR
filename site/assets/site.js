import {
  normalize,
  careerMatch,
  quizStyle,
  zodiac,
  lunarElement,
  elementRelation,
} from "./matching.js";
const page = document.body.dataset.page;
const styles = {
  collaborative: "Kết nối & cộng tác",
  independent: "Tự chủ & tập trung",
  structured: "Rõ ràng & có kế hoạch",
  flexible: "Linh hoạt & sáng tạo",
};
const message =
  "Đây là bản xem trước HTML. Chức năng này hoạt động trong bản MVP có máy chủ; dữ liệu của bạn chưa được lưu hoặc gửi đi.";
function toast(text = message) {
  document.querySelector(".toast")?.remove();
  const box = document.createElement("div");
  box.className = "toast";
  box.setAttribute("role", "status");
  const content = document.createElement("span");
  content.textContent = text;
  box.append(content);
  const close = document.createElement("button");
  close.textContent = "×";
  close.setAttribute("aria-label", "Đóng thông báo");
  close.onclick = () => box.remove();
  box.append(close);
  document.body.append(box);
  setTimeout(() => box.remove(), 6500);
}
function escape(value) {
  return String(value).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
}
const toggle = document.querySelector(".mobile-toggle");
toggle?.addEventListener("click", () => {
  const open = document.querySelector(".nav").classList.toggle("open");
  toggle.setAttribute("aria-expanded", String(open));
  toggle.setAttribute("aria-label", open ? "Đóng menu" : "Mở menu");
});
document.querySelectorAll("[data-server-action]").forEach((a) =>
  a.addEventListener("click", (event) => {
    event.preventDefault();
    toast();
  }),
);
document
  .querySelectorAll(
    ".bookmark, .detail-actions button, .upload-zone input, .cv-file button",
  )
  .forEach((button) => {
    if (button.matches('input[type="file"]')) {
      button.disabled = true;
      return;
    }
    button.addEventListener("click", () => toast());
  });
if (
  ["dang-nhap.html", "dang-ky.html", "dang-tin.html", "ho-so.html"].includes(
    page,
  )
) {
  document.querySelectorAll("form").forEach((form) =>
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      toast();
    }),
  );
}
document
  .querySelector(".password-input button")
  ?.addEventListener("click", () => {
    const input = document.querySelector('input[name="password"]');
    input.type = input.type === "password" ? "text" : "password";
  });
document.querySelectorAll(".segmented button").forEach((button, index) =>
  button.addEventListener("click", () => {
    document
      .querySelectorAll(".segmented button")
      .forEach((b) => b.classList.toggle("selected", b === button));
    const form = document.querySelector(".auth-form form");
    const existing = form.querySelector('[name="company"]')?.closest("label");
    if (index === 1 && !existing) {
      const label = document.createElement("label");
      label.textContent = "Tên doanh nghiệp";
      const input = document.createElement("input");
      input.name = "company";
      input.required = true;
      input.placeholder = "Tên đội nhóm / công ty";
      label.append(input);
      form.children[0].after(label);
    }
    if (index === 0) existing?.remove();
  }),
);
if (new URLSearchParams(location.search).get("role") === "employer")
  document.querySelectorAll(".segmented button")[1]?.click();
document.querySelector(".search-box")?.addEventListener("submit", (event) => {
  event.preventDefault();
  const params = new URLSearchParams({
    q: document.querySelector(".search-input input").value,
    location: document.querySelector(".search-location select").value,
  });
  location.href = "viec-lam.html?" + params;
});
let jobs = [];
try {
  const response = await fetch("assets/jobs.json");
  if (!response.ok) throw new Error();
  jobs = await response.json();
} catch {
  toast(
    "Không tải được dữ liệu minh họa. Vui lòng mở bản HTML bằng một máy chủ tĩnh hoặc GitHub Pages.",
  );
}
if (page === "viec-lam.html") {
  const q = document.querySelector(".listing-search input"),
    selects = [...document.querySelectorAll(".filter-panel select")],
    sort = document.querySelector(".sort-select select"),
    saved = document.querySelector('.filter-panel input[type="checkbox"]');
  const params = new URLSearchParams(location.search);
  q.value = params.get("q") || "";
  selects[0].value = params.get("location") || "";
  selects[1].value = params.get("category") || "";
  const cards = [...document.querySelectorAll(".job-card")];
  const grid = document.querySelector(".job-grid");
  const empty = document.createElement("div");
  empty.className = "empty";
  empty.textContent =
    "Chưa có việc làm minh họa phù hợp. Thử từ khóa khác hoặc đặt lại bộ lọc.";
  empty.hidden = true;
  grid.after(empty);
  function filter() {
    const visible = jobs
      .filter(
        (j) =>
          (!q.value ||
            normalize([j.title, j.company, ...j.skills].join(" ")).includes(
              normalize(q.value),
            )) &&
          (!selects[0].value || j.location === selects[0].value) &&
          (!selects[1].value || j.category === selects[1].value) &&
          (!selects[2].value || j.type === selects[2].value) &&
          (!selects[3].value || j.salary_max >= Number(selects[3].value)) &&
          !saved.checked,
      )
      .sort((a, b) =>
        sort.value === "salary"
          ? b.salary_max - a.salary_max
          : b.created_at.localeCompare(a.created_at),
      );
    const ids = visible.map((j) => j.id);
    cards.forEach((card) => {
      card.hidden = !ids.includes(card.dataset.jobId);
    });
    ids.forEach((id) => grid.append(cards.find((c) => c.dataset.jobId === id)));
    document.querySelector(".result-count").textContent =
      `${visible.length} cơ hội`;
    document.querySelector(".results-head>span").textContent =
      `${visible.length} việc làm phù hợp bộ lọc`;
    empty.hidden = visible.length > 0;
  }
  [q, ...selects, sort, saved].forEach((input) =>
    input.addEventListener("input", filter),
  );
  document.querySelector(".text-button").addEventListener("click", () => {
    q.value = "";
    selects.forEach((s) => (s.value = ""));
    saved.checked = false;
    filter();
  });
  filter();
}
if (page === "ho-so.html") {
  const profile = document.querySelector("#static-profile");
  const note = document.createElement("div");
  note.className = "empty";
  note.hidden = true;
  profile.after(note);
  document.querySelectorAll("[data-profile-tab]").forEach((button) =>
    button.addEventListener("click", () => {
      document
        .querySelectorAll("[data-profile-tab]")
        .forEach((b) => b.classList.toggle("active", b === button));
      profile.hidden = button.dataset.profileTab !== "profile";
      note.hidden = !profile.hidden;
      note.textContent =
        button.dataset.profileTab === "applications"
          ? "Chưa có đơn ứng tuyển. Đây là hồ sơ minh họa; gửi đơn cần bản MVP có máy chủ."
          : "Chưa có việc đã lưu. Lưu việc làm cần tài khoản trong bản MVP có máy chủ.";
    }),
  );
}
if (page === "cong-cu.html") {
  const form = document.querySelector("#quiz form"),
    count = document.querySelector(".quiz-count"),
    result = document.createElement("div");
  result.className = "quiz-result";
  result.hidden = true;
  form.after(result);
  form.addEventListener("change", () => {
    const checked = [...form.querySelectorAll('input[type="radio"]:checked')];
    count.textContent = `${checked.length}/4`;
    form.querySelector('button[type="submit"],button:not([type])').disabled =
      checked.length !== 4;
    form
      .querySelectorAll(".quiz-options label")
      .forEach((label) =>
        label.classList.toggle("chosen", label.querySelector("input").checked),
      );
  });
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const answers = Array.from({ length: 4 }, (_, i) =>
      [...form.querySelectorAll(`[name="q${i}"]`)].findIndex((r) => r.checked),
    );
    const style = quizStyle(answers);
    form.hidden = true;
    result.hidden = false;
    result.innerHTML = `<span class="eyebrow">MÔ TẢ GẦN NHẤT VỚI LỰA CHỌN CỦA BẠN</span><h2>${escape(styles[style])}</h2><p>Gợi ý từ các sở thích tự khai báo, không phải trắc nghiệm tâm lý chuẩn hóa. Khi bằng điểm, công cụ chọn nhóm xuất hiện trước.</p><button class="btn secondary" type="button">Làm lại</button>`;
    result.querySelector("button").onclick = () => {
      form.reset();
      form.hidden = false;
      result.hidden = true;
      form.dispatchEvent(new Event("change"));
    };
  });
}
if (page === "do-phu-hop.html") {
  const tabs = [...document.querySelectorAll(".match-tabs button")];
  tabs.forEach((button, index) =>
    button.addEventListener("click", () => {
      tabs.forEach((b) => b.classList.toggle("selected", b === button));
      document.querySelector("#static-career").hidden = index !== 0;
      document.querySelector("#static-astro").hidden = index !== 1;
    }),
  );
  if (new URLSearchParams(location.search).get("tab") === "astro")
    tabs[1].click();
  const career = document.querySelector("#static-career form");
  const results = document.createElement("section");
  results.className = "static-result section";
  career.closest(".career-layout").after(results);
  career.addEventListener("submit", (event) => {
    event.preventDefault();
    const input = career.querySelector("input"),
      selects = career.querySelectorAll("select");
    const profile = {
      skills: input.value
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      work_style: selects[0].value,
      location: selects[1].value,
    };
    const ranked = jobs
      .map((job) => ({ job, match: careerMatch(profile, job) }))
      .sort((a, b) => b.match.score - a.match.score);
    results.innerHTML =
      '<h2>Điểm tương đồng với việc làm minh họa</h2><div class="applications-list static-result">' +
      ranked
        .map(
          ({ job, match }) =>
            `<article class="card application-card"><div class="application-head"><div><h3><a href="viec-lam-${escape(job.id)}.html">${escape(job.title)}</a></h3><p>${escape(job.company)} · ${escape(job.location)}</p></div><span class="match-badge">${match.score}% phù hợp</span></div><p>Kỹ năng ${match.skillScore}/60 · Phong cách ${match.styleScore}/25 · Địa điểm ${match.locationScore}/15</p><p>Đã có: ${escape(match.matched.join(", ") || "Chưa trùng kỹ năng")}</p></article>`,
        )
        .join("") +
      "</div>";
    results.scrollIntoView({ behavior: "smooth", block: "start" });
  });
  const astro = document.querySelector("#static-astro form");
  astro.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(astro)),
      a = zodiac(data.date_a),
      b = zodiac(data.date_b);
    if (!a || !b) {
      toast("Hãy nhập ngày sinh hợp lệ.");
      return;
    }
    const ea = data.year_a ? lunarElement(Number(data.year_a)) : null,
      eb = data.year_b ? lunarElement(Number(data.year_b)) : null;
    document.querySelector(".astro-output").innerHTML =
      `<span class="eyebrow">THAM KHẢO · KHÔNG CHẤM ĐIỂM</span><h2>Hai cá tính, một cuộc trò chuyện.</h2><div class="static-pair"><strong>${escape(a.name)} + ${escape(b.name)}</strong><p>Bạn: nguyên tố ${escape(a.element)} · ${escape(data.relation)}: nguyên tố ${escape(b.element)}</p>${ea && eb ? `<p>Nạp âm: ${escape(ea)} + ${escape(eb)}</p><p>${escape(elementRelation(ea, eb))}.</p>` : ""}</div><div class="notice">Thông tin chỉ tính tại trình duyệt, không lưu hoặc gửi đi. Kết quả là góc nhìn văn hóa, không dự đoán hiệu suất hay khả năng cộng tác.</div>`;
  });
}
