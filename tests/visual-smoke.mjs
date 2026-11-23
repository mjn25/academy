import { chromium } from "playwright";
import fs from "node:fs/promises";
import path from "node:path";

const baseURL = process.env.BASE_URL ?? "http://127.0.0.1:3000";
const output = "artifacts/visual";
const viewports = [
  { name: "360", width: 360, height: 800 },
  { name: "390", width: 390, height: 844 },
  { name: "768", width: 768, height: 1024 },
  { name: "1024", width: 1024, height: 900 },
  { name: "1440", width: 1440, height: 1000 },
];
const routes = [
  { path: "/", name: "home" },
  { path: "/courses", name: "courses" },
  { path: "/shop", name: "shop" },
  { path: "/admin", name: "admin", user: { name: "المیرا معرفت‌پور", role: "admin", phone: "09114004040" } },
  { path: "/teacher", name: "teacher", user: { name: "المیرا معرفت‌پور", role: "teacher", phone: "09114005050" } },
  { path: "/student", name: "student", user: { name: "سارا محمدی", role: "student", full: true, phone: "09114006060" } },
];

await fs.mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true });
const failures = [];
const report = [];

try {
  for (const route of routes) {
    for (const viewport of viewports) {
      const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height }, deviceScaleFactor: 1 });
      if (route.user) {
        await context.addInitScript((user) => localStorage.setItem("edc-auth-user", JSON.stringify(user)), route.user);
      }
      const page = await context.newPage();
      const pageErrors = [];
      page.on("pageerror", (error) => pageErrors.push(error.message));
      const response = await page.goto(baseURL + route.path, { waitUntil: "networkidle", timeout: 60000 });
      await page.waitForTimeout(1200);
      const state = await page.evaluate(() => ({
        dir: document.documentElement.getAttribute("dir"),
        lang: document.documentElement.getAttribute("lang"),
        width: window.innerWidth,
        documentWidth: Math.max(document.documentElement.scrollWidth, document.body?.scrollWidth ?? 0),
        bodyText: (document.body?.innerText ?? "").trim().slice(0, 240),
      }));
      const screenshotPath = path.join(output, `${route.name}-${viewport.name}.png`);
      await page.screenshot({ path: screenshotPath, fullPage: true, animations: "disabled" });
      report.push({ route: route.path, viewport: viewport.name, status: response?.status() ?? null, ...state, pageErrors, screenshot: screenshotPath });
      if (!response?.ok()) failures.push(`${route.path} @ ${viewport.name}: HTTP ${response?.status()}`);
      if (state.dir !== "rtl") failures.push(`${route.path} @ ${viewport.name}: html dir is ${state.dir}`);
      if (!state.bodyText) failures.push(`${route.path} @ ${viewport.name}: empty page`);
      if (state.documentWidth > viewport.width + 2) failures.push(`${route.path} @ ${viewport.name}: horizontal overflow ${state.documentWidth}px > ${viewport.width}px`);
      for (const error of pageErrors) failures.push(`${route.path} @ ${viewport.name}: ${error}`);
      await context.close();
    }
  }
} finally {
  await browser.close();
}

await fs.writeFile(path.join(output, "report.json"), JSON.stringify({ report, failures }, null, 2));
console.log(JSON.stringify({ tested: report.length, failures }, null, 2));
if (failures.length) process.exit(1);
