export async function api<T = Record<string, unknown>>(
  path: string,
  method = "GET",
  data?: unknown,
): Promise<T> {
  const res = await fetch(`/api/${path}`, {
    method,
    headers: data !== undefined ? { "Content-Type": "application/json" } : {},
    ...(data !== undefined ? { body: JSON.stringify(data) } : {}),
    cache: "no-store",
  });
  const result = await res.json();
  if (!res.ok)
    throw new Error(result.error || "Chưa thể kết nối. Hãy thử lại.");
  return result;
}
export const salary = (min: number, max: number) =>
  max === 0 ? "Lương thỏa thuận" : `${min}–${max} triệu`;
export const dateLabel = (date: string) =>
  new Date(date).toLocaleDateString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" });
export const statusNames: Record<string, string> = {
  pending: "Đã gửi",
  reviewing: "Đang xem xét",
  interview: "Mời phỏng vấn",
  rejected: "Chưa phù hợp",
  hired: "Đã tuyển",
};
