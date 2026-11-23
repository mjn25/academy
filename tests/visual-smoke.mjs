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
const adminUser = { name: "المیرا معرفت‌پور", role: "admin", phone: "09114004040" };
const teacherUser = { name: "المیرا معرفت‌پور", role: "teacher", phone: "09114005050" };
const studentUser = { name: "سارا محمدی", role: "student", full: true, phone: "09114006060" };
const routes = [
  { path: "/", name: "home" },
  { path: "/courses", name: "courses" },
  { path: "/shop", name: "shop" },
  { path: "/admin", name: "admin", user: adminUser },
  { path: "/teacher", name: "teacher", user: teacherUser },
  { path: "/student", name: "student", user: studentUser },
  { path: "/admin/students/new", name: "admin-student-new", user: adminUser, viewports: [viewports[0], viewports[4]] },
  { path: "/admin/teachers/new", name: "admin-teacher-new", user: adminUser, viewports: [viewports[0], viewports[4]] },
  { path: "/admin/classes", name: "admin-classes", user: adminUser, viewports: [viewports[0], viewports[4]] },
  { path: "/teacher/attendance", name: "teacher-attendance", user: teacherUser, viewports: [viewports[0], viewports[4]] },
  { path: "/teacher/assignments/new", name: "teacher-assignment-new", user: teacherUser, viewports: [viewports[0], viewports[4]] },
  { path: "/teacher/classes", name: "teacher-classes", user: teacherUser, viewports: [viewports[0], viewports[4]] },
  { path: "/student/classes", name: "student-classes", user: studentUser, viewports: [viewports[0], viewports[4]] },
  { path: "/student/assignments", name: "student-assignments", user: studentUser, viewports: [viewports[0], viewports[4]] },
  { path: "/student/grades", name: "student-grades", user: studentUser, viewports: [viewports[0], viewports[4]] },
  { path: "/student/addresses", name: "student-addresses", user: studentUser, viewports: [viewports[0], viewports[4]] },
  { path: "/student/orders", name: "student-orders", user: studentUser, viewports: [viewports[0], viewports[4]] },
];

await fs.mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true });
const failures = [];
const report = [];

try {
  for (const route of routes) {
    for (const viewport of (route.viewports ?? viewports)) {
      const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height }, deviceScaleFactor: 1 });
      if (route.user) {
        await context.addInitScript((user) => localStorage.setItem("edc-auth-user", JSON.stringify(user)), route.user);
      }
      const page = await context.newPage();
      const pageErrors = [];
      page.on("pageerror", (error) => pageErrors.push(error.message));
      const response = await page.goto(baseURL + route.path, { waitUntil: "domcontentloaded", timeout: 30000 });
      await page.waitForTimeout(350);
      const state = await page.evaluate(() => ({
        dir: document.documentElement.getAttribute("dir"),
        lang: document.documentElement.getAttribute("lang"),
        width: window.innerWidth,
        documentWidth: Math.max(document.documentElement.scrollWidth, document.body?.scrollWidth ?? 0),
        bodyText: (document.body?.innerText ?? "").trim().slice(0, 240),
        overflowElements: Array.from(document.querySelectorAll("body *"))
          .map((element) => {
            const rect = element.getBoundingClientRect();
            const style = getComputedStyle(element);
            return {
              tag: element.tagName,
              className: typeof element.className === "string" ? element.className.slice(0, 180) : "",
              text: (element.textContent ?? "").trim().replace(/\s+/g, " ").slice(0, 70),
              left: Math.round(rect.left),
              right: Math.round(rect.right),
              width: Math.round(rect.width),
              position: style.position,
              display: style.display,
              scrollWidth: element.scrollWidth,
            };
          })
          .filter((element) => element.display !== "none" && element.width > 0 && (element.right > window.innerWidth + 2 || element.left < -2))
          .sort((a, b) => b.right - a.right)
          .slice(0, 12),
      }));
      if (route.user && viewport.width < 1024 && ["/admin", "/teacher", "/student"].includes(route.path)) {
        try {
          await page.getByRole("button", { name: "منو" }).click();
          const drawer = page.locator('[role="dialog"][aria-modal="true"]');
          await drawer.waitFor({ state: "visible", timeout: 5000 });
          const expectedLink = route.path === "/admin" ? "دانشجویان" : "کلاس‌های من";
          if (!(await drawer.getByRole("link", { name: expectedLink }).isVisible())) {
            failures.push(`${route.path} @ ${viewport.name}: mobile drawer is missing ${expectedLink}`);
          }
          await page.screenshot({ path: path.join(output, `${route.name}-menu-${viewport.name}.png`), animations: "disabled" });
          await drawer.getByRole("button", { name: "بستن منو" }).click();
          await drawer.waitFor({ state: "hidden", timeout: 5000 });
        } catch (error) {
          failures.push(`${route.path} @ ${viewport.name}: mobile menu interaction failed — ${error.message}`);
        }
      }
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
  const flowResults = [];
  for (const flow of [
    { name: "admin-create-teacher", path: "/admin/teachers/new", user: adminUser, nameValue: "آزمایش استاد مرورگر", phone: "09129998887", namePlaceholder: "مثلاً دکتر امیر کاظمی", submit: "ایجاد استاد", expectedPath: "/panel/admin/teachers/" },
    { name: "admin-create-student", path: "/admin/students/new", user: adminUser, nameValue: "آزمایش دانشجو مرورگر", phone: "09129998886", namePlaceholder: "مثلاً الهام کریمی", submit: "ثبت‌نام دانشجو", expectedPath: "/panel/admin/students/" },
  ]) {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
    await context.addInitScript((user) => localStorage.setItem("edc-auth-user", JSON.stringify(user)), flow.user);
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    try {
      await page.goto(baseURL + flow.path, { waitUntil: "domcontentloaded", timeout: 30000 });
      await page.getByPlaceholder(flow.namePlaceholder).fill(flow.nameValue);
      await page.getByPlaceholder("09xxxxxxxxx").fill(flow.phone);
      await page.getByRole("button", { name: flow.submit }).click();
      await page.getByText(flow.nameValue, { exact: true }).waitFor({ state: "visible", timeout: 10000 });
      const currentPath = new URL(page.url()).pathname;
      const ok = currentPath.startsWith(flow.expectedPath) && errors.length === 0;
      flowResults.push({ name: flow.name, ok, path: currentPath, errors });
      if (!ok) failures.push(`${flow.name}: profile navigation or rendering failed (${currentPath}) ${errors.join("; ")}`);
      await page.screenshot({ path: path.join(output, `${flow.name}.png`), fullPage: true, animations: "disabled" });
    } catch (error) {
      flowResults.push({ name: flow.name, ok: false, error: error.message, errors });
      failures.push(`${flow.name}: ${error.message}`);
    } finally {
      await context.close();
    }
  }
  await fs.writeFile(path.join(output, "flows.json"), JSON.stringify(flowResults, null, 2));
} finally {
  await browser.close();
}

await fs.writeFile(path.join(output, "report.json"), JSON.stringify({ report, failures }, null, 2));
console.log(JSON.stringify({ tested: report.length, failures }, null, 2));
if (failures.length) process.exit(1);
