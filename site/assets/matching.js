export function normalize(value) {
  return value
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .toLowerCase();
}
export function careerMatch(profile, job) {
  const own = new Set(profile.skills.map(normalize));
  const matched = job.skills.filter((s) => own.has(normalize(s)));
  const missing = job.skills.filter((s) => !own.has(normalize(s)));
  const skillScore = job.skills.length
    ? Math.round((matched.length / job.skills.length) * 60)
    : 0;
  const styleScore = profile.work_style === job.work_style ? 25 : 0;
  const locationScore =
    normalize(job.location) === "remote" ||
    (!!profile.location &&
      normalize(profile.location) === normalize(job.location))
      ? 15
      : 0;
  return {
    score: skillScore + styleScore + locationScore,
    skillScore,
    styleScore,
    locationScore,
    matched,
    missing,
  };
}
export function zodiac(date) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
  const parsed = new Date(date + "T00:00:00Z");
  if (
    Number.isNaN(parsed.getTime()) ||
    parsed.toISOString().slice(0, 10) !== date
  )
    return null;
  const value = (parsed.getUTCMonth() + 1) * 100 + parsed.getUTCDate();
  const ranges = [
    [120, "Ma Kết", "Đất"],
    [219, "Bảo Bình", "Khí"],
    [321, "Song Ngư", "Nước"],
    [420, "Bạch Dương", "Lửa"],
    [521, "Kim Ngưu", "Đất"],
    [622, "Song Tử", "Khí"],
    [723, "Cự Giải", "Nước"],
    [823, "Sư Tử", "Lửa"],
    [923, "Xử Nữ", "Đất"],
    [1024, "Thiên Bình", "Khí"],
    [1123, "Bọ Cạp", "Nước"],
    [1222, "Nhân Mã", "Lửa"],
  ];
  const r = ranges.find(([end]) => value < end);
  return r ? { name: r[1], element: r[2] } : { name: "Ma Kết", element: "Đất" };
}
const elements = [
  "Kim",
  "Hỏa",
  "Mộc",
  "Thổ",
  "Kim",
  "Hỏa",
  "Thủy",
  "Thổ",
  "Kim",
  "Mộc",
  "Thủy",
  "Thổ",
  "Hỏa",
  "Mộc",
  "Thủy",
  "Kim",
  "Hỏa",
  "Mộc",
  "Thổ",
  "Kim",
  "Hỏa",
  "Thủy",
  "Thổ",
  "Kim",
  "Mộc",
  "Thủy",
  "Thổ",
  "Hỏa",
  "Mộc",
  "Thủy",
];
export function lunarElement(year) {
  if (!Number.isInteger(year) || year < 1900 || year > 2100) return null;
  return elements[Math.floor(((((year - 1984) % 60) + 60) % 60) / 2)];
}
export function elementRelation(a, b) {
  if (a === b) return "Cùng hành theo quan niệm truyền thống";
  const generating = {
    Mộc: "Hỏa",
    Hỏa: "Thổ",
    Thổ: "Kim",
    Kim: "Thủy",
    Thủy: "Mộc",
  };
  if (generating[a] === b) return `${a} sinh ${b} theo quan niệm truyền thống`;
  if (generating[b] === a) return `${b} sinh ${a} theo quan niệm truyền thống`;
  return "Có quan hệ tương khắc theo quan niệm truyền thống; không phản ánh khả năng cộng tác";
}
export function quizStyle(answers) {
  const counts = [0, 0, 0, 0];
  answers.forEach((a) => {
    if (a >= 0 && a < 4) counts[a]++;
  });
  return ["collaborative", "independent", "structured", "flexible"][
    counts.indexOf(Math.max(...counts))
  ];
}
