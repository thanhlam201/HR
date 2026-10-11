import { test, expect, type APIRequestContext } from "@playwright/test";
import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
const origin = "http://localhost:3100";
const headers = { origin };
const pdf = readFileSync("tests/fixtures/cv.pdf");
async function register(request: APIRequestContext, role = "candidate") {
  const email = `${randomUUID()}@test.example`;
  const response = await request.post("/api/auth/register", {
    headers,
    data: {
      name: "Nguyễn Minh An",
      email,
      password: "StrongPass123!",
      role,
      company: role === "employer" ? "Công ty Kiểm thử" : "",
    },
  });
  expect(response.status()).toBe(201);
  return (await response.json()).user;
}
test("complete recruitment workflow through the UI", async ({
  page,
  browser,
}) => {
  const recruiterEmail = `employer-${randomUUID()}@test.example`;
  const candidateEmail = `candidate-${randomUUID()}@test.example`;
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/dang-ky?role=employer");
  await page.getByLabel("Họ và tên").fill("Lê Thanh Hà");
  await page.getByLabel("Tên doanh nghiệp").fill("Công ty Kết Nối");
  await page.getByLabel("Email", { exact: true }).fill(recruiterEmail);
  await page.getByLabel("Mật khẩu", { exact: true }).fill("StrongPass123!");
  await page.getByRole("checkbox").check();
  await page
    .getByRole("button", { name: "Tạo tài khoản", exact: true })
    .click();
  await expect(page).toHaveURL(/nha-tuyen-dung/);
  await page.getByRole("link", { name: "Đăng tin mới" }).click();
  await page.getByLabel("Chức danh tuyển dụng").fill("Frontend Developer E2E");
  await page
    .getByRole("combobox", { name: "Lĩnh vực", exact: true })
    .selectOption("Công nghệ");
  await page.getByLabel("Lương từ").fill("20");
  await page.getByLabel("Lương đến").fill("30");
  await page
    .getByLabel("Mô tả công việc")
    .fill(
      "Phát triển website kết nối tuyển dụng với React và TypeScript, phối hợp cùng đội nhóm.",
    );
  await page
    .getByLabel("Yêu cầu ứng viên")
    .fill("Có kỹ năng React, TypeScript và CSS.");
  await page
    .getByLabel("Quyền lợi", { exact: true })
    .fill("Được học tập, phát triển và làm việc linh hoạt.");
  await page.getByLabel("Kỹ năng cần thiết").fill("React, TypeScript, CSS");
  await page
    .getByRole("button", { name: "Đăng tin tuyển dụng", exact: true })
    .click();
  await expect(page).toHaveURL(/viec-lam\/[^/]+$/);
  const jobId = new URL(page.url()).pathname.split("/").pop()!;
  await page.getByRole("button", { name: "Đăng xuất" }).click();
  await page.goto("/dang-ky");
  await page.getByLabel("Họ và tên").fill("Nguyễn Minh An");
  await page.getByLabel("Email", { exact: true }).fill(candidateEmail);
  await page.getByLabel("Mật khẩu", { exact: true }).fill("StrongPass123!");
  await page.getByRole("checkbox").check();
  await page
    .getByRole("button", { name: "Tạo tài khoản", exact: true })
    .click();
  await expect(page).toHaveURL(/ho-so/);
  await page
    .getByLabel("Chức danh / Mục tiêu nghề nghiệp")
    .fill("Frontend Developer");
  await page.getByLabel("Địa điểm mong muốn").selectOption("Hồ Chí Minh");
  await page
    .getByLabel("Kỹ năng (ngăn cách bằng dấu phẩy)")
    .fill("React, TypeScript, CSS");
  await page
    .getByLabel("Kinh nghiệm & dự án")
    .fill("Xây dựng giao diện React và tích hợp API cho các ứng dụng web.");
  await page.getByRole("button", { name: "Lưu hồ sơ", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("đã được lưu");
  await page.locator('input[type="file"]').setInputFiles({
    name: "minh-an.pdf",
    mimeType: "application/pdf",
    buffer: pdf,
  });
  await expect(page.locator(".cv-file")).toContainText("minh-an.pdf");
  await page.goto(`/viec-lam/${jobId}`);
  await expect(page.locator(".fit-score")).toContainText("100");
  await page.getByRole("button", { name: "Lưu việc làm", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Đã lưu", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Ứng tuyển ngay" }).click();
  await page
    .getByLabel("Lời giới thiệu")
    .fill(
      "Tôi mong muốn đóng góp kỹ năng React và TypeScript để cùng đội nhóm phát triển sản phẩm.",
    );
  await page.getByRole("button", { name: "Gửi hồ sơ", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Đã ứng tuyển" }),
  ).toBeVisible();
  await page.goto("/ho-so");
  await page.getByRole("button", { name: /Đã ứng tuyển/ }).click();
  await expect(page.getByText("Đã gửi", { exact: true })).toBeVisible();
  const recruiter = await browser.newContext({ baseURL: origin });
  const rp = await recruiter.newPage();
  await rp.goto(origin + "/dang-nhap");
  await rp.getByLabel("Email", { exact: true }).fill(recruiterEmail);
  await rp.getByLabel("Mật khẩu", { exact: true }).fill("StrongPass123!");
  await rp.getByRole("button", { name: "Đăng nhập", exact: true }).click();
  await expect(rp).toHaveURL(/nha-tuyen-dung/);
  await rp.getByRole("button", { name: /Hồ sơ ứng tuyển/ }).click();
  await expect(rp.getByText(candidateEmail, { exact: false })).toBeVisible();
  await rp
    .getByLabel("Trạng thái hồ sơ Nguyễn Minh An")
    .selectOption("interview");
  await expect(rp.getByRole("status")).toContainText("Đã cập nhật");
  const apps = await page.request.get("/api/applications");
  const application = (await apps.json()).applications[0];
  expect(application.status).toBe("interview");
  const download = await rp.request.get(
    `/api/applications/${application.id}/cv`,
  );
  expect(download.status()).toBe(200);
  expect((await download.body()).subarray(0, 5).toString()).toBe("%PDF-");
  expect(
    (
      await page.request.patch(`/api/applications/${application.id}`, {
        headers,
        data: { status: "hired" },
      })
    ).status(),
  ).toBe(403);
  const outsider = await browser.newContext({ baseURL: origin });
  await register(outsider.request, "employer");
  expect(
    (
      await outsider.request.get(`/api/applications/${application.id}/cv`)
    ).status(),
  ).toBe(403);
  await outsider.close();
  expect(
    (
      await page.request.post("/api/applications", {
        headers,
        data: {
          job_id: jobId,
          cover_letter: "Tôi muốn ứng tuyển lại công việc này.",
        },
      })
    ).status(),
  ).toBe(409);
  // Later CV changes do not alter the copy already sent to the employer.
  expect(
    (await page.request.delete("/api/profile/cv", { headers })).status(),
  ).toBe(200);
  expect(
    (await rp.request.get(`/api/applications/${application.id}/cv`)).status(),
  ).toBe(200);
  await recruiter.close();
  expect(errors).toEqual([]);
});
test("input validation, authentication and origin protections", async ({
  request,
}) => {
  expect((await request.get("/api/profile")).status()).toBe(401);
  expect(
    (
      await request.post("/api/auth/register", {
        headers: { origin: "https://untrusted.example" },
        data: {},
      })
    ).status(),
  ).toBe(403);
  const user = await register(request);
  expect(
    (await request.post("/api/jobs", { headers, data: {} })).status(),
  ).toBe(403);
  expect(
    (
      await request.post("/api/profile/cv", {
        headers,
        data: {
          name: "bad.pdf",
          data: Buffer.from("not a pdf").toString("base64"),
        },
      })
    ).status(),
  ).toBe(400);
  expect(
    (
      await request.post("/api/applications", {
        headers,
        data: {
          job_id: "demo-1",
          cover_letter: "Tôi muốn tham gia đội nhóm này.",
        },
      })
    ).status(),
  ).toBe(400);
  const sessions = await request.get("/api/me");
  expect((await sessions.json()).user.id).toBe(user.id);
  await request.post("/api/auth/logout", { headers });
  expect((await (await request.get("/api/me")).json()).user).toBe(null);
});
test("search, style quiz, voluntary astrology and responsive layout", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Đúng công việc. Hợp chính mình." }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Product Designer (UI/UX)", exact: true }),
  ).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({
    path: "test-results/home-desktop.png",
    fullPage: true,
  });
  await page.getByLabel("Tìm chức danh, kỹ năng hoặc công ty").fill("React");
  await page.getByRole("button", { name: "Tìm việc ngay" }).click();
  await expect(
    page.getByRole("link", { name: "Frontend Developer", exact: true }),
  ).toBeVisible();
  await page.getByLabel("Tìm việc làm", { exact: true }).fill("NO_MATCH_12345");
  await expect(page.getByText("Chưa tìm thấy cơ hội tương ứng")).toBeVisible();
  await page.goto("/cong-cu");
  for (let i = 0; i < 4; i++)
    await page.locator(`input[name="q${i}"]`).first().check();
  await page.getByRole("button", { name: "Xem phong cách của tôi" }).click();
  await expect(
    page.getByRole("heading", { name: "Kết nối & cộng tác" }),
  ).toBeVisible();
  await page.goto("/do-phu-hop?tab=astro");
  await page.getByLabel("Ngày sinh của bạn (dương lịch)").fill("1995-04-15");
  await page.getByLabel("Ngày sinh người kia (dương lịch)").fill("1990-08-10");
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Xem góc nhìn tham khảo" }).click();
  await expect(page.getByText("Bạch Dương", { exact: true })).toBeVisible();
  await expect(page.getByText("Sư Tử", { exact: true })).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: "Mở menu" }).click();
  await expect(
    page.getByRole("navigation").getByRole("link", { name: "CV / Hồ sơ" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Đóng menu" }).click();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: "test-results/home-mobile.png",
    fullPage: true,
  });
});
