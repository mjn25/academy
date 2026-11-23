"use client";

import React from "react";
import { CommandDialog, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";
import { useRouter, Link } from "@/lib/app-context";
import { faNum } from "@/lib/format";
import { useStore } from "@/lib/store";
import { useAuth } from "@/lib/auth-context";
import { useCurrentStudentId, useCurrentTeacherId } from "@/lib/current-user";
import { EdcLogo } from "@/components/site/shared";
import { Bell, Search, LogOut, Menu, ArrowRight, FileText, BookOpenCheck, Users, GraduationCap as TeacherIcon, X, Home } from "lucide-react";

export interface PanelNavItem {
  key: string;
  label: string;
  icon: React.ElementType;
  href: string;
  badge?: number;
}

/** لوگوی سربرگ دروَر موبایل پنل — لوگوی کامل رسمی + لینک به ریشهٔ پنل */
function SiteLogoLink() {
  const { path } = useRouter();
  const panelRoot = path.startsWith("/teacher") ? "/teacher" : path.startsWith("/student") ? "/student" : "/admin";
  return (
    <Link href={panelRoot} className="flex items-center" ariaLabel="کلینیک آلمانی المیرا">
      <EdcLogo />
    </Link>
  );
}

/* --------------------------- پوسته مشترک پنل‌ها --------------------------- */

/* ------------------------------ منوی پنل -------------------------------- */

function PanelNavList({ nav, active, roleLabel, onNavigate }: { nav: PanelNavItem[]; active: string; roleLabel: string; onNavigate?: () => void }) {
  return (
    <nav className="flex flex-col gap-1 p-3" aria-label={`منوی ${roleLabel}`}>
      {nav.map((item) => {
        const isActive = active === item.key;
        return (
          <Link
            key={item.key}
            href={item.href}
            onClick={onNavigate}
            className={`relative flex items-center gap-3 rounded-[8px] px-3.5 py-2.5 text-sm transition-colors ${
              isActive ? "bg-canvas-soft font-bold text-navy-deep" : "text-ink-soft hover:bg-canvas-soft/60 hover:text-ink"
            }`}
          >
            {isActive && <span className="absolute end-2 top-1/2 -translate-y-1/2 size-1.5 rounded-full bg-rd-accent" aria-hidden />}
            <item.icon className={`size-5 shrink-0 transition-colors ${isActive ? "text-rd-accent" : ""}`} />
            <span className="flex-1">{item.label}</span>
            {item.badge ? (
              <span className="grid min-w-5 place-items-center rounded-full bg-navy-deep px-1 text-[11px] font-bold text-white">{faNum(item.badge)}</span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}

export function PanelShell({
  title,
  nav,
  active,
  children,
  roleLabel,
  userName,
  extraTop,
}: {
  title: string;
  nav: PanelNavItem[];
  active: string;
  children: React.ReactNode;
  roleLabel: string;
  userName: string;
  extraTop?: React.ReactNode;
}) {
  const { navigate, path } = useRouter();
  const { user, logout } = useAuth();
  const [mobileMenu, setMobileMenu] = React.useState(false);
  const [notifOpen, setNotifOpen] = React.useState(false);
  // لوگوی پنل همیشه داخل همان پنل می‌ماند (آدرس پنل از سایت جداست)
  const panelRoot = path.startsWith("/teacher") ? "/teacher" : path.startsWith("/student") ? "/student" : "/admin";
  // نام نمایشی — حساب لاگین‌شده مقدم بر دادهٔ دموی پنل است
  const name = user?.name || userName;

  React.useEffect(() => setMobileMenu(false), [path]);

  /* بستن دراپ‌داون اعلان‌ها با کلیک بیرون از آن (زنگ + پنل) */
  React.useEffect(() => {
    if (!notifOpen) return;
    const onDoc = (e: MouseEvent) => {
      const t = e.target as HTMLElement | null;
      if (!t?.closest("[data-notif-root]")) setNotifOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [notifOpen]);

  /* خروج واقعی از حساب — پاک کردن حساب دمو و برگشت به خانه */
  const doLogout = () => {
    logout();
    navigate("/");
  };


  const role = roleLabel === "پنل مدیریت" ? "admin" : roleLabel === "پنل استاد" ? "teacher" : "student";
  const teacherId = useCurrentTeacherId();
  const studentId = useCurrentStudentId();
  const userKey = role === "admin" ? "admin" : role === "teacher" ? "teacher:" + teacherId : "student:" + studentId;
  const { messages, assignments, submissions, students, teachers, courses, notificationReadIds, markNotificationsRead } = useStore();
  const notifications = React.useMemo(() => {
    const items: { id: string; title: string; desc: string; href: string; at: string }[] = [];
    const validDate = (value?: string) => !!value && Number.isFinite(Date.parse(value));
    if (role === "admin") {
      students.filter((item) => validDate(item.createdAt)).forEach((item) => items.push({
        id: "student-created:" + item.id, title: "دانشجوی جدید ثبت شد", desc: item.name,
        href: "/admin/students/" + item.id, at: item.createdAt!,
      }));
      teachers.filter((item) => validDate(item.createdAt)).forEach((item) => items.push({
        id: "teacher-created:" + item.id, title: "استاد جدید اضافه شد", desc: item.name,
        href: "/admin/teachers/" + item.id, at: item.createdAt!,
      }));
    }
    if (role === "teacher") {
      const myCourses = courses.filter((course) => course.teacherId === teacherId);
      const myCourseIds = myCourses.map((course) => course.id);
      messages.filter((message) => message.toRole === "teacher" && message.toId === teacherId).forEach((message) => items.push({
        id: "message:" + message.id, title: "پیام جدید از دانشجو", desc: message.fromName,
        href: "/teacher/messages", at: message.sentAt,
      }));
      submissions.filter((submission) => {
        const assignment = assignments.find((item) => item.id === submission.assignmentId);
        return !!assignment && myCourseIds.includes(assignment.courseId) && validDate(submission.submittedAt);
      }).forEach((submission) => {
        const assignment = assignments.find((item) => item.id === submission.assignmentId);
        const student = students.find((item) => item.id === submission.studentId);
        items.push({
          id: "submission:" + submission.id + ":" + submission.submittedAt, title: "پاسخ تکلیف جدید دریافت شد",
          desc: (student?.name ?? "دانشجو") + " · " + (assignment?.title ?? "تکلیف"),
          href: "/teacher/assignments", at: submission.submittedAt,
        });
      });
    }
    if (role === "student") {
      const myStudent = students.find((item) => item.id === studentId);
      const myCourses = courses.filter((course) => course.studentIds.includes(studentId) || !!myStudent?.courseIds.includes(course.id));
      const courseIds = myCourses.map((course) => course.id);
      assignments.filter((assignment) => courseIds.includes(assignment.courseId) && validDate(assignment.createdAt)).forEach((assignment) => items.push({
        id: "assignment:" + assignment.id, title: "تکلیف جدید اضافه شد", desc: assignment.title,
        href: "/student/assignments", at: assignment.createdAt,
      }));
      submissions.filter((submission) => submission.studentId === studentId && submission.status === "نمره‌داده‌شده" && validDate(submission.gradedAt)).forEach((submission) => {
        const assignment = assignments.find((item) => item.id === submission.assignmentId);
        items.push({
          id: "grade:" + submission.id + ":" + submission.gradedAt, title: "نمره جدید ثبت شد", desc: assignment?.title ?? "تکلیف",
          href: "/student/grades", at: submission.gradedAt!,
        });
      });
      messages.filter((message) =>
        (message.toRole === "student" && message.toId === studentId) ||
        (message.toRole === "student" && message.toId === "" && courseIds.includes(message.courseId))
      ).forEach((message) => items.push({
        id: "message:" + message.id, title: "پیام جدید از استاد", desc: message.fromName,
        href: "/student/messages", at: message.sentAt,
      }));
    }
    return items.filter((item) => validDate(item.at)).sort((a, b) => Date.parse(b.at) - Date.parse(a.at)).slice(0, 30);
  }, [role, teacherId, studentId, messages, assignments, submissions, students, teachers, courses]);
  const readIds = notificationReadIds[userKey] ?? [];
  const unreadCount = notifications.filter((item) => !readIds.includes(item.id)).length;
  const relativeTime = (value: string) => {
    const minutes = Math.max(0, Math.floor((Date.now() - Date.parse(value)) / 60000));
    if (minutes < 1) return "همین حالا";
    if (minutes < 60) return faNum(minutes) + " دقیقه پیش";
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return faNum(hours) + " ساعت پیش";
    return faNum(Math.floor(hours / 24)) + " روز پیش";
  };

  /* پانوشت سایدبار — خانه + خروج؛ بین سایدبار دسکتاپ و درِوَر موبایل مشترک است */
  const sidebarFooter = (
    <>
      <button
        onClick={() => navigate("/")}
        className="w-full flex items-center gap-3 rounded-full px-3.5 py-2.5 text-sm text-ink-soft hover:bg-canvas-soft hover:text-ink transition-colors"
      >
        <Home className="size-5" /> صفحهٔ خانهٔ سایت
      </button>
      <button
        onClick={doLogout}
        className="w-full flex items-center gap-3 rounded-full px-3.5 py-2.5 text-sm text-bad hover:bg-bad/10 transition-colors"
      >
        <LogOut className="size-5" /> خروج از حساب
      </button>
    </>
  );

  return (
    <div className="min-h-screen bg-canvas-soft/50 flex">
      {/* سایدبار دسکتاپ — سمت راست (RTL)؛ در موبایل همان منو با همبرگر هدر به‌صورت درِوَر باز می‌شود */}
      <aside className="hidden lg:flex fixed inset-y-0 start-0 w-64 flex-col border-e border-hairline-soft bg-white" aria-label="سایدبار پنل">
        <Link href={panelRoot} className="flex items-center px-5 h-16 border-b border-hairline-soft shrink-0">
          {/* لوگوی کامل رسمی کلینیک (فایل ارسالی logo.png) — درخواست کاربر «لوگوها در پنل لحاظ نشده»:
              همان لوگوی هدر سایت، هم‌اندازهٔ هدر (۳۴px) */}
          <EdcLogo />
        </Link>
        <div className="flex-1 overflow-y-auto scroll-thin py-2">
          <PanelNavList nav={nav} active={active} roleLabel={roleLabel} />
        </div>
        <div className="space-y-1 p-3 border-t border-hairline-soft">{sidebarFooter}</div>
      </aside>

      {/* محتوا */}
      <div className="flex-1 min-w-0 lg:ms-64 flex flex-col">
        {/* هدر پنل */}
        <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-hairline-soft h-16 flex items-center gap-3 px-4 lg:px-6">
          <div className="lg:hidden">
            <button onClick={() => setMobileMenu(true)} className="grid size-10 place-items-center rounded-full text-ink hover:bg-canvas-soft" aria-label="منو">
              <Menu className="size-6" />
            </button>
          </div>
          <h1 className="font-black-fa text-[16px] max-sm:text-[14.5px] text-ink truncate">{title}</h1>
          <div className="ms-auto flex items-center gap-2">
            <PanelSearch role={roleLabel === "پنل مدیریت" ? "admin" : roleLabel === "پنل استاد" ? "teacher" : "student"} />
            <div className="relative" data-notif-root>

              <button onClick={() => setNotifOpen((v) => !v)} className="relative grid size-10 place-items-center rounded-full text-ink hover:bg-canvas-soft" aria-label={unreadCount ? "اعلان‌ها، " + faNum(unreadCount) + " خوانده‌نشده" : "اعلان‌ها"} aria-expanded={notifOpen}>
                <Bell className="size-5" />
                {unreadCount > 0 && <span className="absolute top-1.5 end-1.5 min-w-2.5 h-2.5 rounded-full bg-bad border-2 border-white" />}
              </button>
              {notifOpen && (
                <div className="fixed top-16 end-2 z-20 w-80 max-w-[calc(100vw-1rem)] rounded-[8px] border border-hairline-soft bg-white shadow-[0_16px_40px_-16px_rgba(0,0,0,0.18)] p-3 animate-in-up" data-notif-panel>
                  <div className="flex items-center justify-between gap-2 px-2 pb-2">
                    <p className="text-xs font-bold text-ink">اعلان‌ها</p>
                    {unreadCount > 0 && <button className="text-[10px] font-bold text-rd-accent hover:underline" onClick={() => markNotificationsRead(userKey, notifications.map((item) => item.id))}>خواندن همه</button>}
                  </div>
                  <div className="space-y-1 max-h-[min(19rem,55dvh)] overflow-y-auto scroll-thin">
                    {notifications.length === 0 ? (
                      <p className="px-2 py-8 text-center text-xs text-ink-soft">فعلاً اعلانی ندارید.</p>
                    ) : notifications.map((item) => {
                      const isRead = readIds.includes(item.id);
                      return (
                        <button key={item.id} onClick={() => { markNotificationsRead(userKey, [item.id]); setNotifOpen(false); navigate(item.href); }} className={"w-full text-start rounded-[8px] p-2.5 transition-colors hover:bg-canvas-soft " + (isRead ? "opacity-65" : "bg-canvas-soft/70")}>
                          <span className="flex items-start gap-2">
                            {!isRead && <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-rd-accent" />}
                            <span className="min-w-0 flex-1">
                              <span className="block text-xs font-bold text-ink">{item.title}</span>
                              <span className="block text-[11px] text-ink-soft mt-0.5">{item.desc}</span>
                              <span className="block text-[10px] text-ink-faint mt-1">{relativeTime(item.at)}</span>
                            </span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
            <button
              onClick={() => navigate(roleLabel === "پنل مدیریت" ? "/admin" : roleLabel === "پنل استاد" ? "/teacher/profile" : "/student/profile")}
              className="flex items-center gap-2.5 rounded-full border border-hairline px-2 h-9 hover:bg-canvas-soft transition-colors"
              aria-label={roleLabel === "پنل مدیریت" ? "داشبورد مدیریت" : "پروفایل من"}
            >
              <span className="grid size-7 place-items-center rounded-full bg-navy-deep text-white text-xs font-black-fa">{name[0]}</span>
              <span className="hidden sm:block text-xs font-bold text-ink pe-1">{name}</span>
            </button>
          </div>
        </header>

        {extraTop}

        <main className="flex-1 p-4 lg:p-6 max-w-[1200px] w-full mx-auto">{children}</main>
      </div>

      {/* منوی کامل موبایل — از سمت راست باز می‌شود، هم‌سمت سایدبار دسکتاپ (فیکس RTL: قبلاً end-0 بود و در فارسی به چپ باز می‌شد) */}
      {mobileMenu && (
        <div className="fixed inset-0 z-[60] lg:hidden" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={() => setMobileMenu(false)} />
          <div className="absolute inset-y-0 start-0 w-72 max-w-[85vw] bg-white flex flex-col shadow-[16px_0_48px_-24px_rgba(0,0,0,0.25)]">
            <div className="flex items-center justify-between px-4 h-16 border-b border-hairline-soft">
              <SiteLogoLink />
              <button onClick={() => setMobileMenu(false)} className="grid size-9 place-items-center rounded-full border border-hairline-soft text-ink-soft transition-colors hover:bg-canvas-soft hover:text-ink" aria-label="بستن منو">
                <X className="size-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto scroll-thin">
              <PanelNavList nav={nav} active={active} roleLabel={roleLabel} onNavigate={() => setMobileMenu(false)} />
            </div>
            <div className="space-y-1 p-3 border-t border-hairline-soft">{sidebarFooter}</div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------ عناصر مشترک ------------------------------ */

export function PanelHeading({ title, desc, action }: { title: string; desc?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
      <div className="min-w-0 flex-1">
        <h2 className="text-[17px] font-black-fa text-ink">{title}</h2>
        {desc && <p className="mt-1 text-[13px] leading-6 text-ink-soft">{desc}</p>}
      </div>
      {action && <div className="flex w-full flex-wrap gap-2 sm:w-auto sm:shrink-0">{action}</div>}
    </div>
  );
}

/* ------------------- سرصفحهٔ صفحهٔ داخلی (breadcrumb + بازگشت) ------------------- */

export function PageHeader({
  crumbs,
  title,
  desc,
  actions,
}: {
  crumbs: { label: string; href?: string }[];
  title: string;
  desc?: string;
  actions?: React.ReactNode;
}) {
  const { navigate, back } = useRouter();
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 text-xs text-ink-soft mb-3 flex-wrap">
        <button
          onClick={back}
          className="flex items-center gap-1 rounded-full border border-hairline bg-white px-3 py-1.5 font-bold text-ink hover:bg-canvas-soft transition-colors"
          aria-label="بازگشت به صفحه قبل"
        >
          <ArrowRight className="size-3.5" /> بازگشت
        </button>
        <span className="opacity-40">/</span>
        {crumbs.map((c, i) => (
          <span key={i} className="flex items-center gap-2">
            {i > 0 && <span className="opacity-40">/</span>}
            {c.href ? (
              <button onClick={() => navigate(c.href!)} className="hover:text-ink font-medium">{c.label}</button>
            ) : (
              <span className="text-ink font-bold">{c.label}</span>
            )}
          </span>
        ))}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h2 className="text-[17px] font-black-fa text-ink">{title}</h2>
          {desc && <p className="mt-1 text-[13px] leading-6 text-ink-soft">{desc}</p>}
        </div>
        {actions && <div className="flex w-full flex-wrap gap-2 sm:w-auto sm:shrink-0">{actions}</div>}
      </div>
    </div>
  );
}

/* --------------------- جستجوی سراسری پنل (Ctrl+K) --------------------- */

export function PanelSearch({ role }: { role: "admin" | "teacher" | "student" }) {
  const { navigate } = useRouter();
  const [open, setOpen] = React.useState(false);
  const { students, teachers, courses, assignments } = useStore();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const run = (href: string) => {
    setOpen(false);
    navigate(href);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="hidden md:flex items-center gap-2 rounded-full bg-field px-4 h-10 w-56 text-start hover:bg-canvas-soft transition-colors"
        aria-label="جستجوی سراسری (Ctrl+K)"
      >
        <Search className="size-4 text-ink-soft shrink-0" />
        <span className="text-sm text-ink-faint flex-1">جستجو…</span>
        <kbd className="text-[10px] font-bold text-ink-soft border border-hairline rounded-full px-2 py-0.5 bg-white">Ctrl K</kbd>
      </button>
      <button onClick={() => setOpen(true)} className="md:hidden grid size-10 place-items-center rounded-full text-ink hover:bg-canvas-soft" aria-label="جستجو">
        <Search className="size-5" />
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="جستجوی دانشجو، استاد، دوره یا تکلیف…" />
        <CommandList>
          <CommandEmpty>نتیجه‌ای پیدا نشد.</CommandEmpty>
          {(role === "admin" || role === "teacher") && (
            <CommandGroup heading="دانشجویان">
              {students.slice(0, 6).map((s) => (
                <CommandItem key={s.id} onSelect={() => run(role === "admin" ? `/admin/students/${s.id}` : `/teacher/students/${s.id}`)}>
                  <Users className="size-4 me-2 text-ink-soft" /> {s.name}
                </CommandItem>
              ))}
            </CommandGroup>
          )}
          {role === "admin" && (
            <CommandGroup heading="اساتید">
              {teachers.slice(0, 5).map((t) => (
                <CommandItem key={t.id} onSelect={() => run(`/admin/teachers/${t.id}`)}>
                  <TeacherIcon className="size-4 me-2 text-ink-soft" /> {t.name}
                </CommandItem>
              ))}
            </CommandGroup>
          )}
          <CommandGroup heading="دوره‌ها">
            {courses.slice(0, 5).map((c) => (
              <CommandItem key={c.id} onSelect={() => run(role === "admin" ? `/admin/classes/${c.id}` : role === "teacher" ? `/teacher/classes/${c.id}` : `/student/class/${c.id}`)}>
                <BookOpenCheck className="size-4 me-2 text-ink-soft" /> {c.title}
              </CommandItem>
            ))}
          </CommandGroup>
          {role === "teacher" ? (
            <CommandGroup heading="تکالیف">
              {assignments.slice(0, 5).map((a) => (
                <CommandItem key={a.id} onSelect={() => run(`/teacher/assignments/${a.id}`)}>
                  <FileText className="size-4 me-2 text-ink-soft" /> {a.title}
                </CommandItem>
              ))}
            </CommandGroup>
          ) : role === "student" ? (
            <CommandGroup heading="تکالیف من">
              {assignments.slice(0, 5).map((a) => (
                <CommandItem key={a.id} onSelect={() => run(`/student/assignments/${a.id}`)}>
                  <FileText className="size-4 me-2 text-ink-soft" /> {a.title}
                </CommandItem>
              ))}
            </CommandGroup>
          ) : null}
        </CommandList>
      </CommandDialog>
    </>
  );
}

export function StatCard({ icon: Icon, label, value, trend, tint = "navy" }: { icon: React.ElementType; label: string; value: string; trend?: string; tint?: "navy" | "yellow" | "green" | "red" }) {
  /* تیلت آیکون هم‌زبان هوم‌پیج: اکسنت قرمز روی کانواس، برند زرد برای تأکید */
  const tints: Record<string, string> = {
    navy: "bg-canvas-soft text-rd-accent",
    yellow: "bg-brand-500/20 text-navy-800",
    green: "bg-ok/10 text-ok",
    red: "bg-bad/10 text-bad",
  };
  return (
    <div className="rd-inside rounded-[8px] border border-hairline-soft bg-white p-5">
      <div className="flex items-center justify-between">
        <span className={`grid size-10 place-items-center rounded-[8px] ${tints[tint]}`}>
          <Icon className="size-5" />
        </span>
        {trend && <span className="rounded-full bg-brand-500 px-2 py-0.5 text-[11px] font-bold text-navy-900">{trend}</span>}
      </div>
      <p className="mt-3 text-xl font-black-fa text-ink">{value}</p>
      <p className="text-xs text-ink-soft mt-0.5">{label}</p>
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    فعال: "bg-ok/10 text-ok",
    "در انتظار پرداخت": "bg-warn/10 text-warn",
    غیرفعال: "bg-bad/10 text-bad",
    جدید: "bg-turquoise-100 text-info",
    "در حال پیگیری": "bg-warn/10 text-warn",
    "پیشنهاد ارسال‌شده": "bg-canvas-soft text-ink",
    "ثبت‌نام‌شده": "bg-ok/10 text-ok",
    لغو: "bg-bad/10 text-bad",
    "پرداخت‌شده": "bg-ok/10 text-ok",
    "در انتظار": "bg-warn/10 text-warn",
    منقضی: "bg-bad/10 text-bad",
    "در حال آماده‌سازی": "bg-turquoise-100 text-info",
    "ارسال‌شده": "bg-canvas-soft text-ink",
    "تحویل‌شده": "bg-ok/10 text-ok",
    "در انتظار بررسی": "bg-warn/10 text-warn",
    "نمره‌داده‌شده": "bg-ok/10 text-ok",
    "پیش‌نویس": "bg-canvas-soft text-ink-soft",
  };
  return <span className={`rd-inside inline-block rounded-full px-2.5 py-1 text-[11px] font-bold ${map[status] ?? "bg-canvas-soft text-ink"}`}>{status}</span>;
}
