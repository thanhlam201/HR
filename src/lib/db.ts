import { DatabaseSync } from "node:sqlite";
import { Pool } from "pg";
import { mkdirSync } from "node:fs";
import path from "node:path";
import type { Job, Profile } from "./types";

type Row = Record<string, unknown>;
type Db = { sqlite?: DatabaseSync; pool?: Pool; ready?: Promise<void> };
const globalDb = globalThis as unknown as { hopDb?: Db };
function connection(): Db {
  if (globalDb.hopDb) return globalDb.hopDb;
  if (process.env.DATABASE_URL) {
    // pg honors sslmode in the URL. Explicit PG_TLS enables strict verification.
    globalDb.hopDb = {
      pool: new Pool({
        connectionString: process.env.DATABASE_URL,
        max: 5,
        ...(process.env.PG_TLS === "true"
          ? { ssl: { rejectUnauthorized: true } }
          : {}),
      }),
    };
  } else {
    if (process.env.VERCEL)
      throw new Error("Vercel requires DATABASE_URL for persistent data.");
    const file =
      process.env.SQLITE_PATH ||
      path.join(process.cwd(), ".data/hopviec.sqlite");
    mkdirSync(path.dirname(file), { recursive: true });
    const sqlite = new DatabaseSync(file);
    sqlite.exec(
      "PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON; PRAGMA busy_timeout=5000;",
    );
    globalDb.hopDb = { sqlite };
  }
  return globalDb.hopDb;
}
async function raw(
  sql: string,
  params: (string | number | null)[] = [],
): Promise<Row[]> {
  const db = connection();
  if (db.pool) {
    let n = 0;
    return (
      await db.pool.query(
        sql.replace(/\?/g, () => `$${++n}`),
        params,
      )
    ).rows;
  }
  return db.sqlite!.prepare(sql).all(...params) as Row[];
}
const schema = [
  `CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL UNIQUE, password_hash TEXT NOT NULL, role TEXT NOT NULL, company TEXT NOT NULL DEFAULT '', created_at TEXT NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS sessions (token_hash TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE, expires_at TEXT NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS profiles (user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE, headline TEXT NOT NULL DEFAULT '', location TEXT NOT NULL DEFAULT '', skills TEXT NOT NULL DEFAULT '[]', experience TEXT NOT NULL DEFAULT '', work_style TEXT NOT NULL DEFAULT 'collaborative', cv_name TEXT NOT NULL DEFAULT '', cv_data TEXT NOT NULL DEFAULT '', cv_updated TEXT NOT NULL DEFAULT '')`,
  `CREATE TABLE IF NOT EXISTS jobs (id TEXT PRIMARY KEY, employer_id TEXT NOT NULL REFERENCES users(id), title TEXT NOT NULL, company TEXT NOT NULL, location TEXT NOT NULL, category TEXT NOT NULL, type TEXT NOT NULL, salary_min REAL NOT NULL, salary_max REAL NOT NULL, description TEXT NOT NULL, requirements TEXT NOT NULL, benefits TEXT NOT NULL, skills TEXT NOT NULL, work_style TEXT NOT NULL, created_at TEXT NOT NULL, expires_at TEXT NOT NULL, is_demo INTEGER NOT NULL DEFAULT 0, active INTEGER NOT NULL DEFAULT 1)`,
  `CREATE TABLE IF NOT EXISTS applications (id TEXT PRIMARY KEY, job_id TEXT NOT NULL REFERENCES jobs(id), candidate_id TEXT NOT NULL REFERENCES users(id), cover_letter TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'pending', created_at TEXT NOT NULL, cv_name TEXT NOT NULL DEFAULT '', cv_data TEXT NOT NULL DEFAULT '', profile_snapshot TEXT NOT NULL DEFAULT '{}', UNIQUE(job_id,candidate_id))`,
  `CREATE TABLE IF NOT EXISTS saved_jobs (user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE, job_id TEXT NOT NULL REFERENCES jobs(id) ON DELETE CASCADE, PRIMARY KEY(user_id,job_id))`,
  `CREATE TABLE IF NOT EXISTS rate_limits (key TEXT PRIMARY KEY, count INTEGER NOT NULL, expires_at TEXT NOT NULL)`,
  `CREATE INDEX IF NOT EXISTS idx_apps_candidate ON applications(candidate_id)`,
  `CREATE INDEX IF NOT EXISTS idx_jobs_employer ON jobs(employer_id)`,
  `CREATE INDEX IF NOT EXISTS idx_sessions_expiry ON sessions(expires_at)`,
];
async function initialize() {
  for (const sql of schema) await raw(sql);
  if (process.env.SEED_DEMO === "false") return;
  const created = new Date().toISOString();
  await raw(
    "INSERT INTO users (id,name,email,password_hash,role,company,created_at) VALUES (?,?,?,?,?,?,?) ON CONFLICT(id) DO NOTHING",
    [
      "demo-employer",
      "Nhà tuyển dụng minh họa",
      "demo@hopviec.invalid",
      "disabled",
      "employer",
      "Hợp Việc Demo",
      created,
    ],
  );
  const examples = [
    [
      "Product Designer (UI/UX)",
      "Lumi Studio",
      "Hồ Chí Minh",
      "Thiết kế",
      18,
      30,
      ["Figma", "UI/UX", "Prototyping"],
      "collaborative",
    ],
    [
      "Frontend Developer",
      "GreenTech",
      "Hà Nội",
      "Công nghệ",
      20,
      35,
      ["React", "TypeScript", "CSS"],
      "flexible",
    ],
    [
      "Chuyên viên Digital Marketing",
      "Mây Agency",
      "Hồ Chí Minh",
      "Marketing",
      12,
      20,
      ["SEO", "Content", "Google Ads"],
      "collaborative",
    ],
    [
      "Chuyên viên Nhân sự",
      "Bloom People",
      "Đà Nẵng",
      "Nhân sự",
      10,
      18,
      ["Tuyển dụng", "Giao tiếp", "Excel"],
      "structured",
    ],
    [
      "Business Analyst",
      "Blue Ocean",
      "Hà Nội",
      "Kinh doanh",
      18,
      28,
      ["SQL", "Phân tích", "Giao tiếp"],
      "structured",
    ],
    [
      "Content Creator",
      "Nhà Của Mơ",
      "Remote",
      "Marketing",
      10,
      16,
      ["Content", "Viết", "Canva"],
      "flexible",
    ],
    [
      "Backend Developer",
      "GreenTech",
      "Remote",
      "Công nghệ",
      22,
      40,
      ["Node.js", "SQL", "TypeScript"],
      "independent",
    ],
    [
      "Chuyên viên Kinh doanh",
      "An Việt",
      "Hồ Chí Minh",
      "Kinh doanh",
      12,
      25,
      ["Giao tiếp", "Đàm phán", "CRM"],
      "collaborative",
    ],
  ];
  for (let i = 0; i < examples.length; i++) {
    const [title, company, location, category, min, max, skills, style] =
      examples[i];
    await raw(
      `INSERT INTO jobs (id,employer_id,title,company,location,category,type,salary_min,salary_max,description,requirements,benefits,skills,work_style,created_at,expires_at,is_demo,active) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(id) DO NOTHING`,
      [
        `demo-${i + 1}`,
        "demo-employer",
        String(title),
        String(company),
        String(location),
        String(category),
        "Toàn thời gian",
        Number(min),
        Number(max),
        "Tham gia xây dựng những sản phẩm có ý nghĩa, phối hợp với đội nhóm để giải quyết vấn đề thực tế.\nChủ động đề xuất ý tưởng và cải tiến quy trình làm việc.\nĐóng góp vào mục tiêu chung với tinh thần cởi mở và trách nhiệm.",
        "Có kinh nghiệm phù hợp với vị trí và những kỹ năng được liệt kê.\nSẵn sàng học hỏi, chia sẻ kiến thức và trao đổi phản hồi một cách xây dựng.",
        "Môi trường làm việc tôn trọng sự khác biệt.\nThời gian linh hoạt, cơ hội học tập và phát triển.\nChế độ phúc lợi được trao đổi rõ trong phỏng vấn.",
        JSON.stringify(skills),
        String(style),
        created,
        "2099-12-31",
        1,
        1,
      ],
    );
  }
}
export async function query<T = Row>(
  sql: string,
  params: (string | number | null)[] = [],
): Promise<T[]> {
  const db = connection();
  db.ready ||= initialize().catch((error) => {
    db.ready = undefined;
    throw error;
  });
  await db.ready;
  return (await raw(sql, params)) as T[];
}
export function asJob(row: Row): Job {
  return {
    ...row,
    salary_min: Number(row.salary_min),
    salary_max: Number(row.salary_max),
    skills: JSON.parse(String(row.skills)),
  } as Job;
}
export function asProfile(row: Row): Profile {
  const { cv_data: _private, ...rest } = row;
  return { ...rest, skills: JSON.parse(String(row.skills)) } as Profile;
}
