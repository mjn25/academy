"use client";

import React from "react";
import { RouterProvider, useRouter, isPanelPath, toInternal } from "@/lib/app-context";
import { EdcLogo } from "@/components/site/shared";
import { SiteLanding } from "@/components/site/home";
import { SiteHeader, SiteFooter } from "@/components/site/shared";
import { BlogIndex, ArticlePage } from "@/components/site/blog";
import { CoursesIndex, CoursePage } from "@/components/site/courses";
import { AboutPage } from "@/components/site/about";
import { ContactPage } from "@/components/site/contact";
import { PlacementPage } from "@/components/site/placement";
import { ShopPage, ShopProductPage } from "@/components/site/shop";
import { CartPage } from "@/components/site/cart-page";
import { LoginPage } from "@/components/site/login";
import { FaqPage, PrivacyPage, TermsPage } from "@/components/site/pages-legal";
import { CartProvider } from "@/lib/cart-context";
import { AuthProvider, useAuth, panelHref, ROLE_FA, type AuthRole } from "@/lib/auth-context";
import { Fingerprint, ShieldAlert } from "lucide-react";
import { StudentPanel } from "@/components/student/student-panel";
import { StudentPagesPanel } from "@/components/student/student-pages";
import { TeacherPanel } from "@/components/teacher/teacher-panel";
import { TeacherPagesPanel } from "@/components/teacher/teacher-pages";
import { AdminPanel } from "@/components/admin/admin-panel";
import { AdminAssignmentsPanel } from "@/components/admin/admin-assignments";
import { AdminPeoplePanel } from "@/components/admin/admin-people";
import { AdminClassPanel } from "@/components/admin/admin-class-detail";

/* قاب مشترک همه صفحات عمومی: هدر و فوتر EDC */
function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <SiteHeader />
      {children}
      <SiteFooter />
    </div>
  );
}

function RouterSwitch({ ready }: { ready: boolean }) {
  const { path } = useRouter();

  // پنل‌ها فقط سمت کلاینت رندر می‌شوند (بدون hydration) — اول اسپلش
  if (isPanelPath(path) && !ready) return <PanelSplash />;

  /* ------------------------------ پنل دانشجو ------------------------------ */
  if (path.startsWith("/student")) {
    const rest = path.replace("/student", "");
    let el: React.ReactNode;
    if (rest.startsWith("/class/")) {
      el = <StudentPanel section="class" param={rest.split("/")[2]} />;
    } else if (rest.startsWith("/assignments/")) {
      el = <StudentPagesPanel mode="assignment" id={rest.split("/")[2]} />;
    } else if (rest === "/profile/edit") {
      el = <StudentPagesPanel mode="profile-edit" />;
    } else {
      el = <StudentPanel section={rest.replace("/", "") || "dash"} />;
    }
    return (
      <PanelGate need="student" ready={ready}>
        {el}
      </PanelGate>
    );
  }

  /* ------------------------------ پنل استاد ------------------------------- */
  if (path.startsWith("/teacher")) {
    const rest = path.replace("/teacher", "");
    let el: React.ReactNode;
    if (rest.startsWith("/classes/")) {
      el = <TeacherPagesPanel mode="class" id={rest.split("/")[2]} />;
    } else if (rest === "/assignments/new") {
      el = <TeacherPagesPanel mode="assignment-new" />;
    } else if (rest.startsWith("/assignments/")) {
      el = <TeacherPagesPanel mode="assignment" id={rest.split("/")[2]} />;
    } else if (rest.startsWith("/students/")) {
      el = <TeacherPagesPanel mode="student" id={rest.split("/")[2]} />;
    } else {
      el = <TeacherPanel section={rest.replace("/", "") || "dash"} />;
    }
    return (
      <PanelGate need="teacher" ready={ready}>
        {el}
      </PanelGate>
    );
  }

  /* ----------------------------- پنل مدیریت ------------------------------- */
  if (path.startsWith("/admin")) {
    const rest = path.replace("/admin", "");
    let el: React.ReactNode;
    if (rest === "/assignments" || rest === "/assignments/") {
      el = <AdminAssignmentsPanel mode="list" />;
    } else if (rest === "/assignments/new") {
      el = <AdminAssignmentsPanel mode="new" />;
    } else if (rest.startsWith("/assignments/")) {
      el = <AdminAssignmentsPanel mode="detail" id={rest.split("/")[2]} />;
    } else if (rest === "/students/new") {
      el = <AdminPeoplePanel mode="student-new" />;
    } else if (rest.startsWith("/students/")) {
      const tail = rest.replace("/students/", "");
      if (tail.endsWith("/edit")) {
        el = <AdminPeoplePanel mode="student-edit" id={tail.replace("/edit", "")} />;
      } else {
        el = <AdminPeoplePanel mode="student" id={tail} />;
      }
    } else if (rest === "/teachers/new") {
      el = <AdminPeoplePanel mode="teacher-new" />;
    } else if (rest.startsWith("/teachers/")) {
      const tail = rest.replace("/teachers/", "");
      if (tail.endsWith("/edit")) {
        el = <AdminPeoplePanel mode="teacher-edit" id={tail.replace("/edit", "")} />;
      } else {
        el = <AdminPeoplePanel mode="teacher" id={tail} />;
      }
    } else if (rest.startsWith("/classes/")) {
      el = <AdminClassPanel id={rest.split("/")[2]} />;
    } else {
      el = <AdminPanel section={rest.replace("/", "") || "dash"} />;
    }
    return (
      <PanelGate need="admin" ready={ready}>
        {el}
      </PanelGate>
    );
  }

  /* --------------------------- سایت عمومی (EDC) --------------------------- */
  if (path === "/blog" || path.startsWith("/blog/")) {
    const slug = path.replace("/blog", "").replace(/^\//, "");
    return <SiteShell>{slug ? <ArticlePage slug={slug} /> : <BlogIndex />}</SiteShell>;
  }
  if (path === "/courses" || path.startsWith("/courses/")) {
    const slug = path.replace("/courses", "").replace(/^\//, "");
    return <SiteShell>{slug ? <CoursePage slug={slug} /> : <CoursesIndex />}</SiteShell>;
  }
  if (path === "/shop" || path.startsWith("/shop/")) {
    const slug = path.replace("/shop", "").replace(/^\//, "");
    return <SiteShell>{slug ? <ShopProductPage id={slug} /> : <ShopPage />}</SiteShell>;
  }
  if (path === "/login") return <SiteShell><LoginPage /></SiteShell>;
  if (path === "/cart") return <SiteShell><CartPage /></SiteShell>;
  if (path === "/faq") return <SiteShell><FaqPage /></SiteShell>;
  if (path === "/privacy") return <SiteShell><PrivacyPage /></SiteShell>;
  if (path === "/terms") return <SiteShell><TermsPage /></SiteShell>;
  if (path === "/about") return <SiteShell><AboutPage /></SiteShell>;
  if (path === "/contact") return <SiteShell><ContactPage /></SiteShell>;
  if (path === "/placement") return <SiteShell><PlacementPage /></SiteShell>;
  return <SiteShell><SiteLanding /></SiteShell>;
}

/* ------------ اسپلش اولیه — پنل‌ها فقط سمت کلاینت رندر می‌شوند ------------ */

function PanelSplash() {
  return (
    <div className="min-h-screen grid place-items-center bg-canvas-soft/50">
      {/* لوگوی کامل رسمی — هم‌لوگوی هدر سایت و پنل‌ها */}
      <EdcLogo />
    </div>
  );
}

/* ------------ گیت دسترسی پنل‌ها — ورود + تطبیق نقش (درخواست کاربر) ------------ */

function PanelGate({ need, ready, children }: { need: AuthRole; ready: boolean; children: React.ReactNode }) {
  const { user } = useAuth();
  const { navigate } = useRouter();

  if (!ready) return <PanelSplash />;

  /* مهمان — دعوت به ورود با کد پیامکی */
  if (!user) {
    return (
      <div className="grid min-h-screen place-items-center bg-canvas-soft/50 p-6">
        <div className="rd-inside w-full max-w-[420px] rounded-[8px] border border-hairline-soft bg-white p-8 text-center">
          <span className="mx-auto grid size-12 place-items-center rounded-full bg-canvas-soft text-ink">
            <Fingerprint className="size-6" />
          </span>
          <p className="mt-4 font-black-fa text-[15px] text-ink">برای دیدن این پنل وارد شوید</p>
          <p className="mt-1.5 text-[12.5px] leading-6 text-ink-soft">
            دسترسی به پنل‌ها با شمارهٔ موبایل و کد پیامکی انجام می‌شود.
          </p>
          <button
            onClick={() => navigate("/login")}
            className="mt-5 inline-flex h-10 items-center gap-2 rounded-full bg-rd-deep px-6 text-[13px] font-extrabold text-white transition-colors hover:bg-navy-700"
          >
            <Fingerprint className="size-4" />
            ورود به حساب
          </button>
        </div>
      </div>
    );
  }

  /* نقش اشتباه — هدایت به پنل خودش */
  if (user.role !== need) {
    return (
      <div className="grid min-h-screen place-items-center bg-canvas-soft/50 p-6">
        <div className="rd-inside w-full max-w-[420px] rounded-[8px] border border-hairline-soft bg-white p-8 text-center">
          <span className="mx-auto grid size-12 place-items-center rounded-full bg-bad/10 text-bad">
            <ShieldAlert className="size-6" />
          </span>
          <p className="mt-4 font-black-fa text-[15px] text-ink">این بخش برای دسترسی شما فعال نیست</p>
          <p className="mt-1.5 text-[12.5px] leading-6 text-ink-soft">
            شما با دسترسی «{ROLE_FA[user.role]}» وارد شده‌اید.
          </p>
          <button
            onClick={() => navigate(panelHref(user.role))}
            className="mt-5 inline-flex h-10 items-center gap-2 rounded-full bg-rd-deep px-6 text-[13px] font-extrabold text-white transition-colors hover:bg-navy-700"
          >
            رفتن به پنل من
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export default function AppRoot({ initialPath }: { initialPath?: string }) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  return (
    <AuthProvider>
      <RouterProvider initialPath={initialPath ? toInternal(initialPath) : undefined}>
        <CartProvider>
          <RouterSwitch ready={mounted} />
        </CartProvider>
      </RouterProvider>
    </AuthProvider>
  );
}
