import { chromium } from "@playwright/test";
import { createServer } from "node:http";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import assert from "node:assert/strict";

const root = path.resolve("site");
const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css",
  ".js": "text/javascript",
  ".json": "application/json",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
  ".webp": "image/webp",
};
const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, "http://localhost");
    const relative = decodeURIComponent(url.pathname.replace(/^\/HR\//, ""));
    const file = path.resolve(root, relative || "index.html");
    if (!file.startsWith(root + path.sep)) throw new Error();
    const bytes = await readFile(file);
    res.writeHead(200, {
      "Content-Type": types[path.extname(file)] || "application/octet-stream",
    });
    res.end(bytes);
  } catch {
    res.writeHead(404);
    res.end("Not found");
  }
});
await new Promise((resolve) => server.listen(3440, "127.0.0.1", resolve));
let browser;
try {
  const host = "http://127.0.0.1:3440/HR/";
  browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
    args: ["--no-sandbox"],
    headless: true,
  });
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
  });
  const errors = [],
    failed = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("response", (r) => {
    if (r.status() >= 400) failed.push(r.url());
  });
  const files = (await readdir(root)).filter((f) => f.endsWith(".html"));
  assert.equal(files.length, 17);
  for (const file of files) {
    await page.goto(host + file);
    await page.waitForLoadState("networkidle");
    assert.ok(await page.locator(".static-notice").isVisible());
    const links = await page
      .locator("a[href]")
      .evaluateAll((items) =>
        items
          .map((a) => a.getAttribute("href"))
          .filter(
            (h) =>
              !h.startsWith("http") &&
              !h.startsWith("#") &&
              !h.startsWith("mailto:"),
          ),
      );
    for (const link of links)
      await readFile(path.join(root, link.split(/[?#]/)[0]));
  }
  await page.goto(host + "index.html");
  await page.waitForLoadState("networkidle");
  await page.getByLabel("Tìm chức danh, kỹ năng hoặc công ty").fill("React");
  await page.getByRole("button", { name: "Tìm việc ngay" }).click();
  await page.waitForLoadState("networkidle");
  assert.equal(await page.locator(".job-card:visible").count(), 1);
  await page.getByLabel("Tìm việc làm", { exact: true }).fill("zzzzz_no_match");
  assert.equal(await page.locator(".job-card:visible").count(), 0);
  await page.goto(host + "cong-cu.html");
  await page.waitForLoadState("networkidle");
  for (let i = 0; i < 4; i++)
    await page.locator(`input[name=q${i}]`).first().check();
  await page.getByRole("button", { name: "Xem phong cách của tôi" }).click();
  assert.ok(
    await page.getByRole("heading", { name: "Kết nối & cộng tác" }).isVisible(),
  );
  await page.goto(host + "do-phu-hop.html?tab=astro");
  await page.waitForLoadState("networkidle");
  await page.getByLabel("Ngày sinh của bạn (dương lịch)").fill("1995-04-15");
  await page.getByLabel("Ngày sinh người kia (dương lịch)").fill("1990-08-10");
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Xem góc nhìn tham khảo" }).click();
  assert.ok(
    await page.getByText("Bạch Dương + Sư Tử", { exact: true }).isVisible(),
  );
  await page.goto(host + "do-phu-hop.html");
  await page.waitForLoadState("networkidle");
  await page.getByLabel("Kỹ năng của bạn").fill("React, TypeScript, CSS");
  await page.getByLabel("Địa điểm mong muốn").selectOption("Hà Nội");
  await page.getByRole("button", { name: "Khám phá kết quả" }).click();
  assert.ok(
    await page
      .getByRole("heading", { name: "Điểm tương đồng với việc làm minh họa" })
      .isVisible(),
  );
  await page.setViewportSize({ width: 390, height: 844 });
  for (const file of [
    "index.html",
    "viec-lam.html",
    "ho-so.html",
    "cong-cu.html",
    "do-phu-hop.html",
    "dang-tin.html",
  ]) {
    await page.goto(host + file);
    await page.waitForLoadState("networkidle");
    assert.ok(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      file + " overflows",
    );
  }
  await page.goto(host + "index.html");
  await page.getByRole("button", { name: "Mở menu" }).click();
  assert.ok(
    await page
      .getByRole("navigation")
      .getByRole("link", { name: "CV / Hồ sơ" })
      .isVisible(),
  );
  assert.deepEqual(errors, []);
  assert.deepEqual(failed, []);
  console.log(
    "PASS: 17 static HTML pages under /HR/, local links and assets, filters, quiz, both fit panels, six mobile layouts and menu; no browser or HTTP errors.",
  );
} finally {
  await browser?.close();
  await new Promise((resolve) => server.close(resolve));
}
