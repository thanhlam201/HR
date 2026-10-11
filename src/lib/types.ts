export type Role = "candidate" | "employer";
export type WorkStyle =
  "collaborative" | "independent" | "structured" | "flexible";
export const styles: Record<WorkStyle, string> = {
  collaborative: "Kết nối & cộng tác",
  independent: "Tự chủ & tập trung",
  structured: "Rõ ràng & có kế hoạch",
  flexible: "Linh hoạt & sáng tạo",
};
export type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
  company: string;
};
export type Profile = {
  user_id: string;
  headline: string;
  location: string;
  skills: string[];
  experience: string;
  work_style: WorkStyle;
  cv_name: string;
  cv_updated: string;
};
export type Job = {
  id: string;
  employer_id: string;
  title: string;
  company: string;
  location: string;
  category: string;
  type: string;
  salary_min: number;
  salary_max: number;
  description: string;
  requirements: string;
  benefits: string;
  skills: string[];
  work_style: WorkStyle;
  created_at: string;
  expires_at: string;
  is_demo: number;
  active: number;
};
export type Application = {
  id: string;
  job_id: string;
  candidate_id: string;
  cover_letter: string;
  status: string;
  created_at: string;
  title: string;
  company: string;
  name?: string;
  email?: string;
  cv_name?: string;
  headline?: string;
  skills?: string[];
  experience?: string;
  location?: string;
};
