import { chromium } from "@playwright/test";
import ts from "typescript";
import { spawn } from "node:child_process";
import { once } from "node:events";
import {
  readFile,
  writeFile,
  mkdir,
  copyFile,
  mkdtemp,
  rm,
} from "node:fs/promises";
import path from "node:path";
import os from "node:os";

// Render only a fresh, isolated demo database. Never export development user data.
const root = process.cwd();
const output = path.join(root, "site");
const temp = await mkdtemp(path.join(os.tmpdir(), "hopviec-html-"));
const host = "http://localhost:3300";
const server = spawn(
  process.execPath,
  [
    "node_modules/next/dist/bin/next",
    "start",
    "--hostname",
    "127.0.0.1",
    "--port",
    "3300",
  ],
  {
    cwd: root,
    stdio: ["ignore", "pipe", "pipe"],
    env: {
      ...process.env,
      DATABASE_URL: "",
      VERCEL: "",
      SQLITE_PATH: path.join(temp, "demo.sqlite"),
      SEED_DEMO: "true",
      NEXT_TELEMETRY_DISABLED: "1",
    },
  },
);
let browser;
const pages = [
  ["/", "index.html"],
  ["/viec-lam", "viec-lam.html"],
  ["/ho-so", "ho-so.html"],
  ["/cong-cu", "cong-cu.html"],
  ["/do-phu-hop", "do-phu-hop.html"],
  ["/dang-nhap", "dang-nhap.html"],
  ["/dang-ky", "dang-ky.html"],
  ["/nha-tuyen-dung", "nha-tuyen-dung.html"],
  ["/dang-tin", "dang-tin.html"],
  ...Array.from({ length: 8 }, (_, i) => [
    `/viec-lam/demo-${i + 1}`,
    `viec-lam-demo-${i + 1}.html`,
  ]),
];
const routes = Object.fromEntries(pages);
routes["/cv"] = "ho-so.html";
try {
  let healthy = false;
  for (let i = 0; i < 60; i++) {
    if (server.exitCode !== null)
      throw new Error("Export server stopped unexpectedly.");
    try {
      const response = await fetch(host + "/api/jobs");
      if (response.ok) {
        healthy = true;
        break;
      }
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  if (!healthy) throw new Error("Cannot start the isolated export server.");
  const { jobs } = await (await fetch(host + "/api/jobs")).json();
  if (jobs.length !== 8 || jobs.some((job) => job.is_demo !== 1))
    throw new Error("Export must contain only the eight illustrative jobs.");
  browser = await chromium.launch({
    headless: true,
    executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
    args: ["--no-sandbox"],
  });
  const publicContext = await browser.newContext({
    baseURL: host,
    viewport: { width: 1440, height: 1000 },
  });
  const candidate = await browser.newContext({
    baseURL: host,
    viewport: { width: 1440, height: 1000 },
  });
  const employer = await browser.newContext({
    baseURL: host,
    viewport: { width: 1440, height: 1000 },
  });
  for (const [context, role, email, name, company] of [
    [candidate, "candidate", "minhan@example.com", "Nguyễn Minh An", ""],
    [employer, "employer", "studio@example.com", "Lê Thanh Hà", "Lumi Studio"],
  ]) {
    const response = await context.request.post(host + "/api/auth/register", {
      headers: { origin: host },
      data: { role, email, name, company, password: "PreviewOnlyPassword123!" },
    });
    if (response.status() !== 201)
      throw new Error("Failed to initialize isolated preview account.");
  }
  await candidate.request.put(host + "/api/profile", {
    headers: { origin: host },
    data: {
      headline: "Product Designer (UI/UX)",
      location: "Hồ Chí Minh",
      skills: ["Figma", "UI/UX", "Prototyping"],
      experience:
        "Product Designer · Lumi Studio\nThiết kế trải nghiệm cho các sản phẩm số, xây dựng design system và phối hợp cùng đội ngũ phát triển.\n\nDự án: Nền tảng kết nối tuyển dụng\nNghiên cứu nhu cầu người dùng, tạo prototype và cải tiến giao diện dựa trên phản hồi.",
      work_style: "collaborative",
    },
  });
  await mkdir(path.join(output, "assets/fonts"), { recursive: true });
  let css = await readFile(path.join(root, "src/app/globals.css"), "utf8");
  for (const weight of [400, 500, 600, 700, 800]) {
    const source = await readFile(
      path.join(root, `node_modules/@fontsource/inter/${weight}.css`),
      "utf8",
    );
    for (const match of source.matchAll(/url\(\.\/files\/([^)]*)\)/g))
      await copyFile(
        path.join(root, "node_modules/@fontsource/inter/files", match[1]),
        path.join(output, "assets/fonts", match[1]),
      );
    css += "\n" + source.replaceAll("url(./files/", "url(./fonts/");
  }
  css +=
    "\n" +
    (await readFile(path.join(root, "scripts/static-extra.css"), "utf8"));
  await writeFile(path.join(output, "assets/styles.css"), css);
  await copyFile(
    path.join(root, "node_modules/@fontsource/inter/LICENSE"),
    path.join(output, "assets/fonts/LICENSE.txt"),
  );
  await copyFile(
    path.join(root, "scripts/static-site.js"),
    path.join(output, "assets/site.js"),
  );
  const matching = await readFile(
    path.join(root, "src/lib/matching.ts"),
    "utf8",
  );
  await writeFile(
    path.join(output, "assets/matching.js"),
    ts.transpileModule(matching, {
      compilerOptions: {
        target: ts.ScriptTarget.ES2022,
        module: ts.ModuleKind.ES2022,
      },
    }).outputText,
  );
  await writeFile(
    path.join(output, "assets/jobs.json"),
    JSON.stringify(jobs, null, 2),
  );
  const anon = await publicContext.newPage();
  await anon.goto(host + "/dang-nhap");
  await anon.getByRole("link", { name: "Đăng nhập", exact: true }).waitFor();
  const headerActions = await anon
    .locator(".header-actions")
    .evaluate((el) => el.outerHTML);
  await anon.close();
  for (const [route, file] of pages) {
    const context =
      route === "/ho-so"
        ? candidate
        : route === "/dang-tin"
          ? employer
          : publicContext;
    const page = await context.newPage();
    await page.goto(host + route);
    await page
      .getByRole("heading", { level: 1 })
      .first()
      .waitFor()
      .catch(() => {});
    if (route === "/" || route === "/viec-lam")
      await page.locator(".job-card").first().waitFor();
    if (route === "/ho-so")
      await page
        .getByRole("button", { name: "Lưu hồ sơ", exact: true })
        .waitFor();
    if (route === "/dang-tin")
      await page
        .getByRole("button", { name: "Đăng tin tuyển dụng", exact: true })
        .waitFor();
    if (route.startsWith("/viec-lam/"))
      await page.locator(".detail-top").waitFor();
    await page.evaluate(() => document.fonts.ready);
    const html = await page.evaluate(
      ({ routes, headerActions, file }) => {
        const doc = document.documentElement.cloneNode(true);
        const title = document.title;
        doc
          .querySelectorAll("script, nextjs-portal, link, style, .toast")
          .forEach((el) => el.remove());
        doc.querySelector("head").replaceChildren();
        const head = doc.querySelector("head");
        const meta = document.createElement("meta");
        meta.setAttribute("charset", "utf-8");
        head.append(meta);
        const viewport = document.createElement("meta");
        viewport.name = "viewport";
        viewport.content = "width=device-width, initial-scale=1";
        head.append(viewport);
        const t = document.createElement("title");
        t.textContent = title + " — Bản xem trước HTML";
        head.append(t);
        const stylesheet = document.createElement("link");
        stylesheet.rel = "stylesheet";
        stylesheet.href = "assets/styles.css";
        head.append(stylesheet);
        const script = document.createElement("script");
        script.type = "module";
        script.src = "assets/site.js";
        head.append(script);
        doc.querySelector(".header-actions").outerHTML = headerActions;
        doc.querySelectorAll("a[href]").forEach((a) => {
          const href = a.getAttribute("href");
          if (!href.startsWith("/") && !href.startsWith(location.origin))
            return;
          const url = new URL(href, location.origin);
          if (url.pathname.startsWith("/api/")) {
            a.setAttribute("href", "#");
            a.setAttribute("data-server-action", "");
            return;
          }
          a.setAttribute(
            "href",
            (routes[url.pathname] || "index.html") + url.search + url.hash,
          );
        });
        doc.querySelectorAll(".job-card").forEach((card) => {
          const link = card.querySelector(".job-title");
          if (link)
            card.setAttribute(
              "data-job-id",
              link
                .getAttribute("href")
                .replace("viec-lam-", "")
                .replace(".html", ""),
            );
        });
        const banner = document.createElement("div");
        banner.className = "static-notice";
        banner.innerHTML =
          '<span><strong>BẢN XEM TRƯỚC HTML</strong> · Dữ liệu minh họa. Đăng nhập, hồ sơ và ứng tuyển cần bản MVP có máy chủ.</span><a href="https://github.com/thanhlam201/HR">Mã nguồn ↗</a>';
        doc.querySelector("body").prepend(banner);
        doc.querySelector("body").setAttribute("data-page", file);
        doc.querySelectorAll('input[type="password"]').forEach((input) => {
          input.removeAttribute("value");
          input.value = "";
        });
        if (file === "ho-so.html") {
          const tabs = doc.querySelector(".tabs");
          tabs
            .querySelectorAll("button")
            .forEach((button, i) =>
              button.setAttribute(
                "data-profile-tab",
                ["profile", "applications", "saved"][i],
              ),
            );
          const content = doc.querySelector(".detail-layout");
          content.id = "static-profile";
          const sample = document.createElement("p");
          sample.className = "notice";
          sample.textContent =
            "Hồ sơ Nguyễn Minh An là hồ sơ mẫu để xem giao diện. Nội dung nhập ở đây không được lưu hoặc gửi đi.";
          content.before(sample);
        }
        return "<!doctype html>\n" + doc.outerHTML;
      },
      { routes, headerActions, file },
    );
    await writeFile(path.join(output, file), html);
    await page.close();
    console.log(`Exported ${file}`);
  }
  // Capture the voluntary astrology panel as an independent fragment for tabs.
  const astro = await publicContext.newPage();
  await astro.goto(host + "/do-phu-hop?tab=astro");
  await astro.getByRole("button", { name: "Xem góc nhìn tham khảo" }).waitFor();
  const astroPanel = await astro.locator(".page-content").evaluate((el) => {
    const clone = el.cloneNode(true);
    clone.querySelector(".match-tabs").remove();
    return clone.innerHTML;
  });
  let matchHtml = await readFile(path.join(output, "do-phu-hop.html"), "utf8");
  matchHtml = await astro.evaluate(
    ({ astroPanel, matchHtml }) => {
      const doc = new DOMParser().parseFromString(matchHtml, "text/html");
      const content = doc.querySelector(".page-content");
      const tabs = content.querySelector(".match-tabs");
      const career = document.createElement("div");
      career.id = "static-career";
      while (tabs.nextSibling) career.append(tabs.nextSibling);
      content.append(career);
      const astro = document.createElement("div");
      astro.id = "static-astro";
      astro.hidden = true;
      astro.innerHTML = astroPanel;
      content.append(astro);
      return "<!doctype html>\n" + doc.documentElement.outerHTML;
    },
    { astroPanel, matchHtml },
  );
  await writeFile(path.join(output, "do-phu-hop.html"), matchHtml);
  await writeFile(path.join(output, ".nojekyll"), "");
  console.log(
    "Static HTML export complete. Only isolated illustrative data was included.",
  );
} finally {
  await browser?.close();
  if (server.exitCode === null) {
    server.kill("SIGTERM");
    await Promise.race([
      once(server, "exit"),
      new Promise((resolve) => setTimeout(resolve, 5000)),
    ]);
    if (server.exitCode === null) server.kill("SIGKILL");
  }
  await rm(temp, { recursive: true, force: true });
}
