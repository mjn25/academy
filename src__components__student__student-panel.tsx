"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { LineChart, Line, XAxis, YAxis, Tooltip as RTooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { PanelShell, PanelHeading, StatCard, StatusBadge, type PanelNavItem } from "@/components/panels/shell";
import { useRouter } from "@/lib/app-context";
import { useToast } from "@/hooks/use-toast";
import { useStore } from "@/lib/store";
import { useCurrentStudentId } from "@/lib/current-user";
import { useAuth, normalizePhone } from "@/lib/auth-context";
import { fa, faNum, faPrice } from "@/lib/format";
import {
  notificationsStudent,
} from "@/lib/data";
import {
  LayoutDashboard,
  BookOpenCheck,
  CalendarDays,
  ClipboardList,
  FolderOpen,
  Star,
  TrendingUp,
  MessageSquare,
  UserCircle,
  Play,
  Pause,
  Lock,
  CheckCircle2,
  XCircle,
  Award,
  RotateCcw,
  ArrowLeft,
  ArrowRight,
  FileText,
  Download,
  Bell,
  Clock,
  Video as VideoIcon,
  MapPin,
  Send,
  ShoppingBag,
  Trash2,
  Plus,
  Trophy,
  Timer,
} from "lucide-react";
import {
  CITIES_BY_PROVINCE,
  IRAN_PROVINCES,
  addAddress,
  addressStorageKey,
  addrOneLine,
  loadAddresses,
  removeAddress,
  type SavedAddress,
} from "@/lib/addresses";

/* ورودی متنی — هم‌الگوی فرم‌های سایت */
const fieldCls =
  "h-10 w-full rounded-[8px] bg-white px-3.5 text-[13px] text-ink outline-none ring-1 ring-hairline-soft placeholder:text-ink-faint focus:ring-2 focus:ring-rd-accent/40";

/* ------------------------------ منوی دانشجو ------------------------------ */

const nav: PanelNavItem[] = [
  { key: "dash", label: "داشبورد", icon: LayoutDashboard, href: "/student" },
  { key: "classes", label: "کلاس‌های من", icon: BookOpenCheck, href: "/student/classes" },
  { key: "schedule", label: "برنامه هفتگی", icon: CalendarDays, href: "/student/schedule" },
  { key: "assignments", label: "تکالیف", icon: ClipboardList, href: "/student/assignments" },
  { key: "files", label: "فایل‌های آموزشی", icon: FolderOpen, href: "/student/files" },
  { key: "grades", label: "نمرات", icon: Star, href: "/student/grades" },
  { key: "progress", label: "گزارش پیشرفت", icon: TrendingUp, href: "/student/progress" },
  { key: "messages", label: "پیام‌ها", icon: MessageSquare, href: "/student/messages" },
  { key: "addresses", label: "آدرس‌های من", icon: MapPin, href: "/student/addresses" },
  { key: "orders", label: "سفارش‌های من", icon: ShoppingBag, href: "/student/orders" },
  { key: "profile", label: "پروفایل", icon: UserCircle, href: "/student/profile" },
];

const titles: Record<string, string> = {
  dash: "داشبورد دانشجو",
  classes: "کلاس‌های من",
  class: "جزئیات کلاس",
  schedule: "برنامه هفتگی",
  assignments: "تکالیف",
  files: "فایل‌های آموزشی",
  grades: "نمرات",
  progress: "گزارش پیشرفت",
  messages: "پیام‌ها و اعلان‌ها",
  addresses: "آدرس‌های من",
  orders: "سفارش‌های من",
  profile: "پروفایل من",
};

export function StudentPanel({ section, param }: { section: string; param?: string }) {
  const currentStudentId = useCurrentStudentId();
  const me = useStore((s) => s.students.find((x) => x.id === currentStudentId));
  const { user } = useAuth();
  /* آدرس‌ها و سفارش‌ها به حساب وابسته‌اند نه دوره — برای هر حسابی فعال‌اند */
  const isAccountPage = section === "addresses" || section === "orders";
  /* دانش‌آموز فقط-لاگین‌کرده (درخواست کاربر) — حسابی که هیچ دوره یا کتابی ندارد:
     همهٔ بخش‌ها با حالت خالی و دعوت به دوره‌ها/فروشگاه رندر می‌شوند */
  if (user && user.role === "student" && user.full === false && !isAccountPage) {
    return <StudentEmptyPanel section={section} />;
  }
  return (
    <PanelShell title={titles[section] ?? "پنل دانشجو"} nav={nav} active={section === "class" ? "classes" : section} roleLabel="پنل دانشجو" userName={me?.name ?? "سارا محمدی"}>
      {section === "dash" && <StudentDashboard />}
      {section === "classes" && <StudentClasses />}
      {section === "class" && <StudentClassDetail classId={param} />}
      {section === "schedule" && <StudentSchedule />}
      {section === "assignments" && <StudentAssignments />}
      {section === "files" && <StudentFiles />}
      {section === "grades" && <StudentGrades />}
      {section === "progress" && <StudentProgress />}
      {section === "messages" && <StudentMessages />}
      {section === "addresses" && <StudentAddresses />}
      {section === "orders" && <StudentOrders />}
      {section === "profile" && <StudentProfile />}
    </PanelShell>
  );
}

/* ------------- دانش‌آموز فقط-لاگین‌کرده — همهٔ بخش‌ها حالت خالی ------------- */

/* حساب ۰۹۱۱۴۰۰۷۰۷۰ (درخواست کاربر): فقط لاگین کرده و هیچ دوره یا کتابی ندارد؛
   هر بخش از منو با حالت خالی و دکمهٔ ثبت‌نام/فروشگاه نشان داده می‌شود */
function StudentEmptyPanel({ section }: { section: string }) {
  const { navigate } = useRouter();
  const key = section === "class" ? "classes" : section;
  const item = nav.find((n) => n.key === key) ?? nav[0];
  const Icon = item.icon;
  return (
    <PanelShell title={titles[key] ?? "پنل دانشجو"} nav={nav} active={key} roleLabel="پنل دانشجو" userName="دانش‌آموز">
      <div className="rd-inside rounded-[8px] border border-hairline-soft bg-white p-8 text-center sm:p-12">
        <span className="mx-auto grid size-14 place-items-center rounded-full bg-canvas-soft text-ink">
          <Icon className="size-7" />
        </span>
        <h2 className="mt-4 font-black-fa text-[16px] text-ink">{titles[key] ?? "پنل دانشجو"} — هنوز خالی است</h2>
        <p className="mx-auto mt-2 max-w-[440px] text-[13px] leading-6 text-ink-soft">
          این حساب فقط وارد شده و هنوز هیچ دوره یا کتابی ندارد. با ثبت‌نام در یک دوره یا خرید از فروشگاه، داشبورد و
          تکالیف شما همین‌جا فعال می‌شود.
        </p>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          <Button className="bg-rd-deep font-bold text-white hover:bg-navy-700" onClick={() => navigate("/courses")}>
            مشاهدهٔ دوره‌ها
          </Button>
          <Button variant="outline" className="border-hairline bg-white font-bold text-ink hover:bg-canvas-soft" onClick={() => navigate("/shop")}>
            فروشگاه کتاب‌ها
          </Button>
        </div>
      </div>
    </PanelShell>
  );
}

/* ------------------------------- داشبورد -------------------------------- */

function StudentDashboard() {
  const currentStudentId = useCurrentStudentId();
  const { navigate } = useRouter();
  const { assignments, submissions, courses, teachers } = useStore();
  const me = useStore((state) => state.students.find((student) => student.id === currentStudentId));
  const myCourseIds = me?.courseIds ?? [];
  const myCourses = courses.filter((course) => myCourseIds.includes(course.id));
  const myAssignments = assignments.filter((assignment) => myCourseIds.includes(assignment.courseId));
  const mySubmissions = submissions.filter((submission) => submission.studentId === currentStudentId);
  const submittedAssignmentIds = new Set(mySubmissions.map((submission) => submission.assignmentId));
  const toDo = myAssignments
    .filter((assignment) => !submittedAssignmentIds.has(assignment.id))
    .sort((a, b) => (faDateVal(a.due) ?? 99999999) - (faDateVal(b.due) ?? 99999999));
  const awaitingGrade = mySubmissions.filter((submission) => submission.status === "در انتظار بررسی").length;
  const graded = mySubmissions
    .filter((submission) => submission.status === "نمره‌داده‌شده")
    .sort((a, b) => (Date.parse(b.gradedAt ?? b.submittedAt ?? "") || 0) - (Date.parse(a.gradedAt ?? a.submittedAt ?? "") || 0));
  const latestGrades = graded.slice(0, 3);

  return (
    <div className="space-y-6">
      <section className="rd-inside rounded-[8px] border border-hairline-soft bg-white p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm text-ink-soft">سلام {me?.name ?? "دانشجو"}، خوش اومدی</p>
            <h2 className="mt-1 text-[17px] font-black-fa text-ink">از همین‌جا ادامه بده</h2>
            <p className="mt-1 text-xs leading-6 text-ink-soft">کلاس‌ها و کارهای آموزشی‌ات را یک‌جا دنبال کن.</p>
          </div>
          <Button className="bg-rd-deep text-white hover:bg-navy-700" onClick={() => navigate(myCourses.length ? "/student/classes" : "/courses")}>
            <BookOpenCheck className="me-1.5 size-4" /> {myCourses.length ? "مشاهده کلاس‌ها" : "دیدن دوره‌ها"}
          </Button>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={BookOpenCheck} label="دوره‌های من" value={faNum(myCourses.length) + " دوره"} />
        <StatCard icon={ClipboardList} label="تکالیف تحویل‌نداده" value={faNum(toDo.length) + " مورد"} tint="yellow" />
        <StatCard icon={Clock} label="در انتظار نمره" value={faNum(awaitingGrade) + " مورد"} />
        <StatCard icon={Award} label="نمره‌های ثبت‌شده" value={faNum(graded.length) + " مورد"} tint="green" />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <section className="rd-inside rounded-[8px] border border-hairline-soft bg-white p-5">
          <div className="mb-3 flex items-center justify-between gap-2">
            <p className="text-sm font-bold text-ink">کلاس‌های من</p>
            <Button size="sm" variant="ghost" onClick={() => navigate("/student/classes")}>همه کلاس‌ها</Button>
          </div>
          {myCourses.length ? (
            <div className="space-y-2">
              {myCourses.slice(0, 4).map((course) => (
                <button key={course.id} onClick={() => navigate("/student/class/" + course.id)} className="flex w-full items-center gap-3 rounded-[8px] border border-hairline-soft p-3 text-start transition-colors hover:border-navy-deep hover:bg-canvas-soft/40">
                  <span className="grid size-10 shrink-0 place-items-center rounded-[8px] bg-canvas-soft text-rd-accent"><BookOpenCheck className="size-5" /></span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-xs font-bold text-ink">{course.title}</span>
                    <span className="mt-1 block text-[11px] text-ink-soft">{teachers.find((teacher) => teacher.id === course.teacherId)?.name ?? "استاد تعیین نشده"} · {course.type === "online" ? "آنلاین" : "حضوری"}</span>
                  </span>
                  <ArrowLeft className="size-4 shrink-0 text-ink-soft" />
                </button>
              ))}
            </div>
          ) : (
            <div className="rounded-[8px] border border-dashed border-hairline-soft bg-canvas-soft/40 p-5 text-center">
              <BookOpenCheck className="mx-auto size-7 text-ink-faint" />
              <p className="mt-2 text-sm font-bold text-ink">هنوز در دوره‌ای ثبت‌نام نکرده‌ای</p>
              <p className="mt-1 text-xs leading-6 text-ink-soft">بعد از ثبت‌نام، کلاس‌ها و جزئیاتشان در همین بخش نمایش داده می‌شود.</p>
              <Button className="mt-3 bg-rd-deep text-white hover:bg-navy-700" onClick={() => navigate("/courses")}>مشاهده دوره‌ها</Button>
            </div>
          )}
        </section>

        <section className="rd-inside rounded-[8px] border border-hairline-soft bg-white p-5">
          <div className="mb-3 flex items-center justify-between gap-2">
            <p className="text-sm font-bold text-ink">کارهای بعدی</p>
            <Badge className="bg-warn/10 text-warn hover:bg-warn/10">{faNum(toDo.length)} مورد</Badge>
          </div>
          {toDo.length ? (
            <div className="space-y-2">
              {toDo.slice(0, 5).map((assignment) => (
                <button key={assignment.id} onClick={() => navigate("/student/assignments/" + assignment.id)} className="flex w-full items-center gap-3 rounded-[8px] border border-hairline-soft p-3 text-start transition-colors hover:border-navy-deep hover:bg-canvas-soft/40">
                  <span className="grid size-9 shrink-0 place-items-center rounded-[8px] bg-canvas-soft text-ink"><FileText className="size-4" /></span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-xs font-bold text-ink">{assignment.title}</span>
                    <span className="mt-1 block text-[11px] text-ink-soft">مهلت: {assignment.due}</span>
                  </span>
                  <ArrowLeft className="size-4 shrink-0 text-ink-soft" />
                </button>
              ))}
            </div>
          ) : (
            <p className="rounded-[8px] bg-canvas-soft/60 p-5 text-center text-xs leading-6 text-ink-soft">
              {myAssignments.length ? "فعلاً تکلیف تحویل‌نداده‌ای نداری." : "تکلیف‌های دوره‌هایت پس از تعریف استاد اینجا نمایش داده می‌شود."}
            </p>
          )}
          {awaitingGrade > 0 && <p className="mt-3 rounded-[8px] bg-info/5 p-3 text-xs text-ink-soft">{faNum(awaitingGrade)} پاسخ در انتظار بررسی استاد است.</p>}
        </section>

        <section className="rd-inside rounded-[8px] border border-hairline-soft bg-white p-5 xl:col-span-2">
          <div className="mb-3 flex items-center justify-between gap-2">
            <p className="text-sm font-bold text-ink">آخرین نمره‌ها</p>
            <Button size="sm" variant="ghost" onClick={() => navigate("/student/grades")}>مشاهده کارنامه</Button>
          </div>
          {latestGrades.length ? (
            <div className="grid gap-2 sm:grid-cols-3">
              {latestGrades.map((submission) => {
                const assignment = myAssignments.find((item) => item.id === submission.assignmentId);
                return (
                  <div key={submission.id} className="rounded-[8px] bg-canvas-soft/60 p-3">
                    <p className="truncate text-xs font-bold text-ink">{assignment?.title ?? "تکلیف"}</p>
                    <p className="mt-1 text-sm font-black-fa text-ink">{fa(submission.score ?? 0)} از {fa(assignment?.max ?? 10)}</p>
                    <p className="mt-1 text-[10px] text-ink-soft">{assignment?.courseId ? myCourses.find((course) => course.id === assignment.courseId)?.title : ""}</p>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="rounded-[8px] bg-canvas-soft/60 p-4 text-center text-xs text-ink-soft">هنوز نمره‌ای برای نمایش ثبت نشده است.</p>
          )}
        </section>
      </div>
    </div>
  );
}

/* ------------------------------ کلاس‌های من ------------------------------ */

function StudentClasses() {
  const { navigate } = useRouter();
  const currentStudentId = useCurrentStudentId();
  const { courses: allCourses, teachers, students } = useStore();
  const me = students.find((student) => student.id === currentStudentId);
  const myCourses = allCourses.filter((course) => (me?.courseIds ?? []).includes(course.id));

  return (
    <div>
      <PanelHeading title="کلاس‌های من" desc="دوره‌هایی که در آن‌ها ثبت‌نام کرده‌ای." />
      {myCourses.length ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {myCourses.map((course) => {
            const teacher = teachers.find((item) => item.id === course.teacherId);
            const enrolled = course.studentIds.length;
            return (
              <button
                key={course.id}
                onClick={() => navigate("/student/class/" + course.id)}
                className="group flex min-w-0 flex-col overflow-hidden rounded-[8px] rd-inside border border-hairline-soft bg-white text-start transition-colors hover:border-navy-deep"
              >
                <div className="flex flex-1 items-start gap-3 p-4 sm:gap-4">
                  <span className="grid size-12 shrink-0 place-items-center rounded-[8px] bg-canvas-soft text-rd-accent sm:size-14">
                    <BookOpenCheck className="size-6" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge className={course.type === "online" ? "bg-rd-deep text-white hover:bg-rd-deep text-[10px]" : "bg-canvas-soft text-ink hover:bg-canvas-soft text-[10px]"}>
                        {course.type === "online" ? "آنلاین" : "حضوری"}
                      </Badge>
                      <StatusBadge status={course.status} />
                    </div>
                    <h3 className="mt-2 truncate text-sm font-bold text-ink">{course.title}</h3>
                    <p className="mt-1 text-[11px] text-ink-soft">{teacher?.name ?? "استاد تعیین نشده"} · سطح {course.level}</p>
                    <p className="mt-1 text-[11px] text-ink-faint">{course.schedule || (course.type === "online" ? "برنامه آنلاین" : "زمان‌بندی اعلام نشده")} · {faNum(enrolled)} دانشجو</p>
                  </div>
                </div>
                <div className="flex items-center justify-between border-t border-hairline-soft bg-canvas-soft/50 px-4 py-3">
                  <span className="text-[11px] text-ink-soft">مشاهده جزئیات کلاس</span>
                  <span className="flex items-center gap-1 text-xs font-bold text-ink">ورود به کلاس <ArrowLeft className="size-3.5" /></span>
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="rd-inside rounded-[8px] border border-dashed border-hairline-soft bg-white p-7 text-center sm:p-10">
          <BookOpenCheck className="mx-auto size-9 text-ink-faint" />
          <p className="mt-3 text-sm font-bold text-ink">هنوز در دوره‌ای ثبت‌نام نکرده‌ای</p>
          <p className="mx-auto mt-1 max-w-md text-xs leading-6 text-ink-soft">بعد از ثبت‌نام توسط مدیریت، دوره‌ها و اطلاعات کلاس‌ها در این صفحه نمایش داده می‌شوند.</p>
          <Button className="mt-4 bg-rd-deep text-white hover:bg-navy-700" onClick={() => navigate("/courses")}>مشاهده دوره‌ها</Button>
        </div>
      )}
    </div>
  );
}

/* ---------------------- موتور آزمون ویدئویی (فلگ‌شیپ) --------------------- */



function StudentClassDetail({ classId }: { classId?: string }) {
  const currentStudentId = useCurrentStudentId();
  const { navigate } = useRouter();
  const { courses: allCourses, students, teachers, assignments, submissions, materials } = useStore();
  const student = students.find((item) => item.id === currentStudentId);
  const course = allCourses.find((item) => item.id === classId);
  const hasAccess = Boolean(course && student?.courseIds.includes(course.id));
  const courseAssignments = course ? assignments.filter((assignment) => assignment.courseId === course.id) : [];
  const assignmentIds = courseAssignments.map((assignment) => assignment.id);
  const mySubmissions = submissions.filter((submission) => submission.studentId === currentStudentId && assignmentIds.includes(submission.assignmentId));
  const courseMaterials = materials.filter((material) => assignmentIds.includes(material.assignmentId) && (!material.studentId || material.studentId === currentStudentId));
  const graded = mySubmissions.filter((submission) => submission.status === "نمره‌داده‌شده");
  const pending = mySubmissions.filter((submission) => submission.status === "در انتظار بررسی");
  const teacher = course ? teachers.find((item) => item.id === course.teacherId) : undefined;

  if (!course || !hasAccess) {
    return (
      <div className="rd-inside rounded-[8px] border border-hairline-soft bg-white p-6 text-center sm:p-10">
        <BookOpenCheck className="mx-auto size-9 text-ink-faint" />
        <h2 className="mt-3 text-sm font-bold text-ink">{course ? "این کلاس در فهرست دوره‌های شما نیست" : "کلاس پیدا نشد"}</h2>
        <p className="mx-auto mt-2 max-w-md text-xs leading-6 text-ink-soft">فقط کلاس‌هایی که در آن‌ها ثبت‌نام کرده‌اید از این بخش قابل مشاهده‌اند.</p>
        <Button className="mt-4 bg-rd-deep text-white hover:bg-navy-700" onClick={() => navigate("/student/classes")}>بازگشت به کلاس‌های من</Button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <button onClick={() => navigate("/student/classes")} className="flex items-center gap-1.5 text-sm text-ink-soft transition-colors hover:text-ink">
        <ArrowRight className="size-4" /> بازگشت به کلاس‌ها
      </button>
      <section className="rd-inside rounded-[8px] border border-hairline-soft bg-white p-4 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <Badge className={course.type === "online" ? "bg-rd-deep text-white hover:bg-rd-deep" : "bg-canvas-soft text-ink hover:bg-canvas-soft"}>{course.type === "online" ? "آنلاین" : "حضوری"}</Badge>
              <Badge variant="outline" className="border-hairline-soft text-ink-soft">سطح {course.level}</Badge>
              <StatusBadge status={course.status} />
            </div>
            <h1 className="text-lg font-black-fa text-ink sm:text-xl">{course.title}</h1>
            <p className="mt-1.5 text-xs text-ink-soft">{teacher?.name ?? "استاد تعیین نشده"} · {course.schedule || "زمان‌بندی اعلام نشده"}</p>
          </div>
          <div className="grid min-w-[112px] grid-cols-2 gap-2 sm:min-w-[180px]">
            <div className="rounded-[8px] bg-canvas-soft/70 p-3 text-center"><p className="text-lg font-black-fa text-ink">{faNum(courseAssignments.length)}</p><p className="mt-0.5 text-[10px] text-ink-soft">تکلیف</p></div>
            <div className="rounded-[8px] bg-canvas-soft/70 p-3 text-center"><p className="text-lg font-black-fa text-ink">{faNum(graded.length)}</p><p className="mt-0.5 text-[10px] text-ink-soft">نمره ثبت‌شده</p></div>
          </div>
        </div>
        {pending.length > 0 && <p className="mt-4 rounded-[8px] bg-info/5 px-3.5 py-2.5 text-xs text-ink-soft">{faNum(pending.length)} پاسخ در انتظار بررسی استاد است.</p>}
      </section>

      <Tabs defaultValue="tasks" className="rounded-[8px] rd-inside border border-hairline-soft bg-white">
        <TabsList className="flex h-auto w-full flex-wrap justify-start rounded-none border-b border-hairline-soft bg-transparent p-0">
          {[{ value: "tasks", label: "تکالیف" }, { value: "files", label: "فایل‌های آموزشی" }, { value: "grades", label: "نمرات من" }].map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value} className="rounded-none border-b-2 border-transparent px-4 py-3 text-xs text-ink-soft data-[state=active]:border-ink data-[state=active]:text-ink data-[state=active]:shadow-none sm:px-5 sm:text-sm">{tab.label}</TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value="tasks" className="space-y-3 p-4 sm:p-5">
          {courseAssignments.length ? courseAssignments.map((assignment) => {
            const submission = mySubmissions.find((item) => item.assignmentId === assignment.id);
            return (
              <button key={assignment.id} onClick={() => navigate("/student/assignments/" + assignment.id)} className="flex w-full flex-wrap items-center gap-3 rounded-[8px] border border-hairline-soft p-3.5 text-start transition-colors hover:border-navy-deep hover:bg-canvas-soft/30 sm:p-4">
                <span className="grid size-10 shrink-0 place-items-center rounded-[8px] bg-canvas-soft text-ink"><ClipboardList className="size-5" /></span>
                <span className="min-w-0 flex-1"><span className="block truncate text-sm font-bold text-ink">{assignment.title}</span><span className="mt-1 block text-[11px] text-ink-soft">مهلت تحویل: {assignment.due} · نمره کل: {fa(assignment.max)}</span></span>
                {submission ? <StatusBadge status={submission.status} /> : <Badge className="bg-warn/10 text-warn hover:bg-warn/10">تحویل‌نداده</Badge>}
                <ArrowLeft className="size-4 shrink-0 text-ink-faint" />
              </button>
            );
          }) : <div className="rounded-[8px] border border-dashed border-hairline-soft bg-canvas-soft/40 p-7 text-center"><ClipboardList className="mx-auto size-7 text-ink-faint" /><p className="mt-2 text-sm font-bold text-ink">هنوز تکلیفی برای این کلاس تعریف نشده</p><p className="mt-1 text-xs text-ink-soft">وقتی استاد تکلیفی ثبت کند، از همین بخش می‌توانید آن را ببینید.</p></div>}
        </TabsContent>
        <TabsContent value="files" className="space-y-2 p-4 sm:p-5">
          {courseMaterials.length ? courseMaterials.map((material) => (
            <div key={material.id} className="flex items-center gap-3 rounded-[8px] border border-hairline-soft p-3.5">
              <span className="grid size-10 shrink-0 place-items-center rounded-[8px] bg-canvas-soft text-ink"><FileText className="size-5" /></span>
              <span className="min-w-0 flex-1"><span className="block truncate text-sm font-bold text-ink">{material.name}</span><span className="mt-1 block text-[11px] text-ink-soft">{material.uploadedByName} · {material.uploadedAt}{material.size ? " · " + material.size : ""}</span></span>
              <Badge variant="outline" className="shrink-0 border-hairline-soft text-ink-soft">{material.kind === "video" ? "ویدئو" : "تمرین"}</Badge>
            </div>
          )) : <div className="rounded-[8px] border border-dashed border-hairline-soft bg-canvas-soft/40 p-7 text-center"><FolderOpen className="mx-auto size-7 text-ink-faint" /><p className="mt-2 text-sm font-bold text-ink">فایلی برای این کلاس ثبت نشده</p><p className="mt-1 text-xs text-ink-soft">فایل‌های بارگذاری‌شده توسط استاد در این بخش نمایش داده می‌شوند.</p></div>}
          <p className="pt-1 text-[10px] leading-5 text-ink-faint">در این نسخه فقط فایل‌هایی نمایش داده می‌شوند که در پرونده تکلیف ثبت شده‌اند.</p>
        </TabsContent>
        <TabsContent value="grades" className="space-y-2 p-4 sm:p-5">
          {graded.length ? graded.map((submission) => {
            const assignment = courseAssignments.find((item) => item.id === submission.assignmentId);
            return <div key={submission.id} className="flex flex-wrap items-center justify-between gap-3 rounded-[8px] border border-hairline-soft p-3.5"><div className="min-w-0"><p className="text-sm font-bold text-ink">{assignment?.title ?? "تکلیف"}</p><p className="mt-1 text-[11px] text-ink-soft">بازخورد استاد: {submission.feedback || "بازخوردی ثبت نشده"}</p></div><p className="shrink-0 text-base font-black-fa text-ink">{fa(submission.score ?? 0)} <span className="text-xs font-normal text-ink-soft">از {fa(assignment?.max ?? 10)}</span></p></div>;
          }) : <div className="rounded-[8px] border border-dashed border-hairline-soft bg-canvas-soft/40 p-7 text-center"><Award className="mx-auto size-7 text-ink-faint" /><p className="mt-2 text-sm font-bold text-ink">هنوز نمره‌ای ثبت نشده</p><p className="mt-1 text-xs text-ink-soft">پس از بررسی پاسخ‌ها توسط استاد، نمره‌ها اینجا نمایش داده می‌شوند.</p></div>}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function StudentSchedule() {
  const currentStudentId = useCurrentStudentId();
  const { navigate } = useRouter();
  const { courses, assignments } = useStore();
  const student = useStore((state) => state.students.find((item) => item.id === currentStudentId));
  const myCourses = courses.filter((course) => student?.courseIds.includes(course.id));
  const myAssignments = assignments
    .filter((assignment) => student?.courseIds.includes(assignment.courseId))
    .sort((a, b) => (faDateVal(a.due) ?? Number.MAX_SAFE_INTEGER) - (faDateVal(b.due) ?? Number.MAX_SAFE_INTEGER));

  return (
    <div className="space-y-5">
      <PanelHeading title="برنامه هفتگی" desc="زمان‌بندی اعلام‌شده کلاس‌ها و مهلت تکالیف دوره‌های شما." />
      <section className="rd-inside rounded-[8px] border border-hairline-soft bg-white p-5">
        <h3 className="mb-3 text-sm font-bold text-ink">کلاس‌های من</h3>
        {myCourses.length ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {myCourses.map((course) => (
              <button key={course.id} onClick={() => navigate("/student/class/" + course.id)} className="rounded-[8px] border border-hairline-soft p-4 text-start transition-colors hover:border-navy-deep">
                <span className="block text-sm font-bold text-ink">{course.title}</span>
                <span className="mt-1 block text-xs text-ink-soft">{course.schedule || "زمان‌بندی هنوز اعلام نشده"}</span>
                <span className="mt-2 block text-[11px] text-ink-faint">{course.type === "online" ? "آنلاین" : "حضوری"}</span>
              </button>
            ))}
          </div>
        ) : (
          <p className="rounded-[8px] bg-canvas-soft p-4 text-center text-xs text-ink-soft">هنوز دوره‌ای برای این حساب ثبت نشده است.</p>
        )}
      </section>
      <section className="rd-inside rounded-[8px] border border-hairline-soft bg-white p-5">
        <h3 className="mb-3 text-sm font-bold text-ink">مهلت تکالیف</h3>
        {myAssignments.length ? (
          <div className="space-y-2">
            {myAssignments.map((assignment) => (
              <div key={assignment.id} className="flex flex-wrap items-center justify-between gap-2 rounded-[8px] bg-canvas-soft/60 p-3">
                <span className="min-w-0 flex-1 text-xs font-bold text-ink">{assignment.title}</span>
                <span className="text-[11px] text-ink-soft">مهلت: {assignment.due}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="rounded-[8px] bg-canvas-soft p-4 text-center text-xs text-ink-soft">برای دوره‌های شما هنوز تکلیفی ثبت نشده است.</p>
        )}
      </section>
    </div>
  );
}

/* -------------------------------- تکالیف -------------------------------- */

function StudentAssignments() {
  const currentStudentId = useCurrentStudentId();
  const { navigate } = useRouter();
  const { assignments, courses, submissions } = useStore();
  const me = useStore((s) => s.students.find((x) => x.id === currentStudentId));
  const myCourseIds = me?.courseIds ?? [];
  const list = assignments.filter((a) => myCourseIds.includes(a.courseId)).sort((a, b) => (faDateVal(a.due) ?? Number.MAX_SAFE_INTEGER) - (faDateVal(b.due) ?? Number.MAX_SAFE_INTEGER));

  return (
    <div>
      <PanelHeading title="تکالیف" desc="تکالیف استاد و مدیریت — بر اساس نزدیک‌ترین مهلت. برای جزئیات و ارسال پاسخ کلیک کنید." />
      {list.length === 0 ? (
        <div className="rounded-[8px] border border-dashed border-hairline-soft bg-white p-6 sm:p-10 text-center">
          <p className="font-bold text-ink">تکلیفی برای کلاس‌های شما نیست</p>
          <p className="mt-1 text-sm text-ink-soft">به‌محض تخصیص تکلیف جدید، همین‌جا نمایش داده می‌شود.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {list.map((a) => {
            const sub = submissions.find((s) => s.assignmentId === a.id && s.studentId === currentStudentId);
            const status = sub?.status === "نمره‌داده‌شده" ? "graded" : sub ? "submitted" : isPastDue(a.due) ? "late" : "new";
            const course = courses.find((c) => c.id === a.courseId);
            return (
              <button
                key={a.id}
                onClick={() => navigate(`/student/assignments/${a.id}`)}
                className={`w-full text-start rounded-[8px] border p-5 transition-colors hover:border-navy-deep ${status === "new" ? "border-hairline bg-canvas-soft/50" : "border-hairline-soft bg-white"}`}
              >
                <div className="flex flex-wrap items-start gap-3">
                  <span className={`grid size-12 shrink-0 place-items-center rounded-[8px] ${status === "graded" ? "bg-ok/10 text-ok" : status === "late" ? "bg-bad/10 text-bad" : "bg-canvas-soft text-ink"}`}>
                    <FileText className="size-6" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold text-ink text-sm">{a.title}</h3>
                      <Badge className="bg-canvas-soft text-ink hover:bg-canvas-soft">{course?.title ?? "—"}</Badge>
                      {status === "graded" && <Badge className="bg-ok/10 text-ok hover:bg-ok/10">نمره {fa(String(sub!.score))} از {fa(a.max)}</Badge>}
                      {status === "late" && <Badge className="bg-bad/10 text-bad hover:bg-bad/10">مهلت گذشته</Badge>}
                      {status === "submitted" && <Badge className="bg-warn/10 text-warn hover:bg-warn/10"><Clock className="size-3 me-1" /> تحویل‌شده — در حال بررسی</Badge>}
                      {status === "new" && <Badge className="bg-warn/10 text-warn hover:bg-warn/10"><Clock className="size-3 me-1" /> مهلت: {a.due}</Badge>}
                    </div>
                    <p className="mt-1.5 text-xs text-ink-soft leading-6 line-clamp-2">{a.desc}</p>
                    {status === "graded" && sub?.feedback && (
                      <p className="mt-2 rounded-[8px] bg-canvas-soft p-3 text-xs leading-6 text-ink"><b className="text-ink">بازخورد استاد: </b>{sub.feedback}</p>
                    )}
                  </div>
                  <span className="flex items-center gap-1.5 shrink-0">
                    {(status === "new" || status === "late" || status === "submitted") && (
                      <span className="rounded-[8px] bg-rd-deep px-4 py-2.5 text-xs font-bold text-white">{status === "submitted" ? "مشاهده / ویرایش" : "ارسال پاسخ"}</span>
                    )}
                    <ArrowLeft className="size-4 text-ink-soft" />
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/** مقدار عددی تاریخ شمسی برای مرتب‌سازی */
function faDateVal(due: string): number | null {
  const m = due.replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d))).match(/(\d{4})\/(\d{1,2})\/(\d{1,2})/);
  return m ? Number(m[1]) * 10000 + Number(m[2]) * 100 + Number(m[3]) : null;
}

/** تشخیص مهلت گذشته با تاریخ شمسی روز؛ بدون تاریخ ثابت دمو */
function isPastDue(due: string): boolean {
  const match = due.replace(/[۰-۹]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit))).match(/(\d{4})\/(\d{1,2})\/(\d{1,2})/);
  if (!match) return false;
  try {
    const parts = new Intl.DateTimeFormat("en-US-u-ca-persian-nu-latn", {
      year: "numeric",
      month: "numeric",
      day: "numeric",
    }).formatToParts(new Date());
    const value = (type: string) => Number(parts.find((part) => part.type === type)?.value ?? 0);
    const today = value("year") * 10000 + value("month") * 100 + value("day");
    const deadline = Number(match[1]) * 10000 + Number(match[2]) * 100 + Number(match[3]);
    return deadline < today;
  } catch {
    return false;
  }
}

/* --------------------------- فایل‌های آموزشی ----------------------------- */

function StudentFiles() {
  const currentStudentId = useCurrentStudentId();
  const { navigate } = useRouter();
  const { materials, assignments, courses } = useStore();
  const student = useStore((state) => state.students.find((item) => item.id === currentStudentId));
  const courseIds = student?.courseIds ?? [];
  const visibleMaterials = materials.filter((material) => {
    const assignment = assignments.find((item) => item.id === material.assignmentId);
    return !!assignment && courseIds.includes(assignment.courseId) && (!material.studentId || material.studentId === currentStudentId);
  });

  return (
    <div>
      <PanelHeading title="فایل‌های آموزشی" desc="فایل‌هایی که استاد یا مدیریت در تکالیف دوره‌های شما ثبت کرده‌اند." />
      {visibleMaterials.length ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {visibleMaterials.map((material) => {
            const assignment = assignments.find((item) => item.id === material.assignmentId);
            const course = courses.find((item) => item.id === assignment?.courseId);
            return (
              <button key={material.id} onClick={() => navigate("/student/assignments/" + material.assignmentId)} className="flex min-w-0 items-center gap-3 rounded-[8px] rd-inside border border-hairline-soft bg-white p-4 text-start transition-colors hover:border-navy-deep">
                <span className="grid size-11 shrink-0 place-items-center rounded-[8px] bg-canvas-soft text-ink">
                  {material.kind === "video" ? <VideoIcon className="size-5" /> : <FileText className="size-5" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-bold text-ink">{material.name}</span>
                  <span className="mt-1 block truncate text-[11px] text-ink-soft">{course?.title ?? "دوره"} · {assignment?.title ?? "تکلیف"}</span>
                  {material.size && <span className="mt-1 block text-[10px] text-ink-faint">{material.size}</span>}
                </span>
                <ArrowLeft className="size-4 shrink-0 text-ink-soft" />
              </button>
            );
          })}
        </div>
      ) : (
        <div className="rounded-[8px] border border-dashed border-hairline-soft bg-white p-8 text-center">
          <FolderOpen className="mx-auto size-8 text-ink-faint" />
          <p className="mt-3 text-sm font-bold text-ink">فایلی برای نمایش وجود ندارد</p>
          <p className="mt-1 text-xs leading-6 text-ink-soft">فایل‌های پیوست تکالیف دوره‌های شما پس از ثبت در این بخش دیده می‌شوند.</p>
        </div>
      )}
    </div>
  );
}

/* -------------------------------- نمرات ---------------------------------- */

function StudentGrades() {
  const currentStudentId = useCurrentStudentId();
  const { assignments, submissions, courses } = useStore();
  const graded = submissions.filter((submission) => submission.studentId === currentStudentId && submission.status === "نمره‌داده‌شده" && typeof submission.score === "number");
  const courseGroups = courses.map((course) => {
    const rows = graded
      .filter((submission) => assignments.find((assignment) => assignment.id === submission.assignmentId)?.courseId === course.id)
      .map((submission) => ({ submission, assignment: assignments.find((assignment) => assignment.id === submission.assignmentId)! }));
    return { course, rows };
  }).filter((group) => group.rows.length > 0);

  return (
    <div className="space-y-5">
      <PanelHeading title="نمرات" desc="نمره‌ها و بازخوردهایی که برای پاسخ‌های شما ثبت شده‌اند." />
      {courseGroups.length ? courseGroups.map(({ course, rows }) => {
        const average = rows.reduce((sum, row) => sum + ((row.submission.score ?? 0) / Math.max(1, row.assignment.max)) * 100, 0) / rows.length;
        return (
          <section key={course.id} className="rounded-[8px] rd-inside border border-hairline-soft bg-white overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-hairline-soft bg-canvas-soft px-5 py-4">
              <p className="text-sm font-bold text-ink">{course.title}</p>
              <Badge className="bg-rd-deep text-white hover:bg-rd-deep">میانگین {fa(average.toFixed(1))}٪</Badge>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-sm">
                <thead><tr className="border-b border-hairline-soft text-xs text-ink-soft">
                  <th className="p-3.5 text-start font-semibold">تکلیف</th>
                  <th className="p-3.5 text-start font-semibold">نمره</th>
                  <th className="p-3.5 text-start font-semibold">بازخورد</th>
                </tr></thead>
                <tbody className="divide-y divide-line">
                  {rows.map(({ submission, assignment }) => (
                    <tr key={submission.id}>
                      <td className="p-3.5 font-bold text-ink">{assignment.title}</td>
                      <td className="p-3.5 font-black-fa text-ink">{fa(submission.score ?? 0)} / {fa(assignment.max)}</td>
                      <td className="p-3.5 text-xs leading-6 text-ink-soft">{submission.feedback || "بازخوردی ثبت نشده"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        );
      }) : (
        <div className="rounded-[8px] border border-dashed border-hairline-soft bg-white p-8 text-center">
          <Award className="mx-auto size-8 text-ink-faint" />
          <p className="mt-3 text-sm font-bold text-ink">هنوز نمره‌ای ثبت نشده است</p>
          <p className="mt-1 text-xs text-ink-soft">پس از بررسی پاسخ‌ها توسط استاد، نمره‌ها در این بخش نمایش داده می‌شوند.</p>
        </div>
      )}
    </div>
  );
}

/* ----------------------------- گزارش پیشرفت ------------------------------ */

function StudentProgress() {
  const currentStudentId = useCurrentStudentId();
  const { assignments, submissions, courses } = useStore();
  const student = useStore((state) => state.students.find((item) => item.id === currentStudentId));
  const graded = submissions
    .filter((submission) => submission.studentId === currentStudentId && submission.status === "نمره‌داده‌شده" && typeof submission.score === "number")
    .map((submission) => {
      const assignment = assignments.find((item) => item.id === submission.assignmentId);
      return assignment ? { submission, assignment } : null;
    })
    .filter((item): item is { submission: (typeof submissions)[number]; assignment: (typeof assignments)[number] } => !!item)
    .sort((a, b) => Date.parse(a.submission.gradedAt ?? a.submission.submittedAt ?? "") - Date.parse(b.submission.gradedAt ?? b.submission.submittedAt ?? ""));
  const average = graded.length ? graded.reduce((sum, item) => sum + ((item.submission.score ?? 0) / Math.max(1, item.assignment.max)) * 100, 0) / graded.length : null;
  const chartData = graded.map((item) => ({
    date: new Intl.DateTimeFormat("fa-IR", { month: "short", day: "numeric" }).format(new Date(item.submission.gradedAt ?? item.submission.submittedAt)),
    score: Math.round(((item.submission.score ?? 0) / Math.max(1, item.assignment.max)) * 100),
  }));
  const myCourses = courses.filter((course) => student?.courseIds.includes(course.id));

  return (
    <div className="space-y-6">
      <PanelHeading title="گزارش پیشرفت" desc="خلاصه‌ای از عملکرد ثبت‌شده شما در تکالیف و کلاس‌ها." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard icon={TrendingUp} label="میانگین نمرات ثبت‌شده" value={average === null ? "—" : fa(average.toFixed(1)) + "٪"} />
        <StatCard icon={CheckCircle2} label="تکالیف نمره‌داده‌شده" value={faNum(graded.length) + " مورد"} tint="yellow" />
        <StatCard icon={BookOpenCheck} label="دوره‌های فعال من" value={faNum(myCourses.length) + " دوره"} tint="green" />
      </div>
      {chartData.length >= 2 ? (
        <section className="rounded-[8px] rd-inside border border-hairline-soft bg-white p-5">
          <p className="mb-4 text-sm font-bold text-ink">روند نمره پاسخ‌های بررسی‌شده</p>
          <div className="h-64" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 8, left: 8, right: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#D9DEE8" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 12, fontFamily: "IRANSans" }} stroke="#5B6475" />
                <YAxis tick={{ fontSize: 12, fontFamily: "IRANSans" }} stroke="#5B6475" domain={[0, 100]} />
                <RTooltip contentStyle={{ fontFamily: "IRANSans", borderRadius: 8, border: "1px solid #D9DEE8" }} />
                <Line type="monotone" dataKey="score" name="نمره" stroke="#f80559" strokeWidth={3} dot={{ r: 5, fill: "#f80559" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>
      ) : (
        <div className="rounded-[8px] border border-dashed border-hairline-soft bg-white p-8 text-center">
          <TrendingUp className="mx-auto size-8 text-ink-faint" />
          <p className="mt-3 text-sm font-bold text-ink">داده کافی برای نمودار پیشرفت وجود ندارد</p>
          <p className="mt-1 text-xs leading-6 text-ink-soft">با ثبت و بررسی چند تکلیف، روند نمره‌ها در این بخش نمایش داده می‌شود.</p>
        </div>
      )}
      <section className="rounded-[8px] border border-hairline-soft bg-white p-5">
        <h3 className="mb-3 text-sm font-bold text-ink">وضعیت دوره‌ها</h3>
        {myCourses.length ? (
          <div className="space-y-2">
            {myCourses.map((course) => (
              <div key={course.id} className="flex flex-wrap items-center justify-between gap-2 rounded-[8px] bg-canvas-soft/60 p-3">
                <span className="text-xs font-bold text-ink">{course.title}</span>
                <span className="text-[11px] text-ink-soft">{faNum(submissions.filter((submission) => submission.studentId === currentStudentId && assignments.find((assignment) => assignment.id === submission.assignmentId)?.courseId === course.id).length)} پاسخ ثبت‌شده</span>
              </div>
            ))}
          </div>
        ) : <p className="text-xs text-ink-soft">دوره‌ای برای نمایش ثبت نشده است.</p>}
      </section>
    </div>
  );
}

/* -------------------------------- پیام‌ها -------------------------------- */

function StudentMessages() {
  const currentStudentId = useCurrentStudentId();
  const { students, courses, teachers, messages, sendMessage } = useStore();
  const me = students.find((student) => student.id === currentStudentId);
  const myCourses = courses.filter((course) => course.studentIds.includes(currentStudentId) || me?.courseIds.includes(course.id));
  const [courseId, setCourseId] = React.useState(myCourses[0]?.id ?? "");
  const [text, setText] = React.useState("");
  const visibleMessages = messages
    .filter((message) =>
      (message.fromRole === "student" && message.fromId === currentStudentId) ||
      (message.toRole === "student" && message.toId === currentStudentId) ||
      (message.toRole === "student" && message.toId === "" && myCourses.some((course) => course.id === message.courseId))
    )
    .sort((a, b) => a.sentAt.localeCompare(b.sentAt));
  const send = () => {
    const course = myCourses.find((item) => item.id === courseId);
    const teacher = teachers.find((item) => item.id === course?.teacherId);
    if (!course || !teacher || !text.trim()) return;
    sendMessage({
      courseId: course.id,
      fromId: currentStudentId,
      fromRole: "student",
      fromName: me?.name ?? "دانشجو",
      toId: teacher.id,
      toRole: "teacher",
      text: text.trim(),
    });
    setText("");
  };
  const availableCourses = myCourses.filter((course) => teachers.some((teacher) => teacher.id === course.teacherId));
  return (
    <div>
      <PanelHeading title="پیام‌ها" desc="گفتگو با استاد دوره؛ پیام‌های شما در پنل استاد هم نمایش داده می‌شوند." />
      {availableCourses.length === 0 ? (
        <div className="rounded-[8px] border border-dashed border-hairline-soft bg-white p-6 text-center">
          <p className="font-bold text-ink">هنوز استادی برای گفتگو در دسترس نیست</p>
          <p className="mt-1 text-sm text-ink-soft">پس از ثبت‌نام در دوره‌ای که استاد دارد، امکان ارسال پیام فعال می‌شود.</p>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2 rounded-[8px] rd-inside border border-hairline-soft bg-white p-5 space-y-3 max-h-[480px] overflow-y-auto scroll-thin">
            {visibleMessages.length === 0 ? (
              <p className="py-8 text-center text-sm text-ink-soft">هنوز پیامی در گفتگوهای شما ثبت نشده است.</p>
            ) : visibleMessages.map((message) => (
              <div key={message.id} className={message.fromRole === "student" ? "flex justify-start" : "flex justify-end"}>
                <div className={`max-w-[88%] rounded-[8px] p-3.5 text-sm leading-7 ${message.fromRole === "student" ? "bg-navy-deep text-white" : "bg-canvas-soft text-ink"}`}>
                  <p className={`mb-1 text-[11px] font-bold ${message.fromRole === "student" ? "text-white/70" : "text-ink-soft"}`}>{message.fromName}</p>
                  <p>{message.text}</p>
                  <p className="mt-2 text-[10px] opacity-60" dir="ltr">{new Date(message.sentAt).toLocaleString("fa-IR")}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="rounded-[8px] rd-inside border border-hairline-soft bg-white p-5 flex flex-col">
            <p className="font-bold text-ink text-sm mb-3">پیام جدید</p>
            <label htmlFor="student-message-course" className="text-xs font-semibold text-ink mb-1.5">دوره</label>
            <select id="student-message-course" value={courseId} onChange={(event) => setCourseId(event.target.value)} className="mb-3 h-10 w-full rounded-[8px] border border-input bg-white px-3 text-xs">
              {availableCourses.map((course) => <option key={course.id} value={course.id}>{course.title} — {teachers.find((teacher) => teacher.id === course.teacherId)?.name}</option>)}
            </select>
            <Textarea value={text} onChange={(event) => setText(event.target.value)} placeholder="پیامت را بنویس…" className="flex-1 min-h-32" />
            <Button className="mt-3 bg-rd-deep text-white hover:bg-navy-700 font-bold" disabled={!courseId || !text.trim()} onClick={send}>
              <Send className="size-4 me-1.5" /> ارسال
            </Button>
          </div>
        </div>
      )}
      <p className="mt-3 rounded-[8px] bg-canvas-soft p-4 text-xs leading-6 text-ink-soft">این پیام‌رسان نسخه نمایشی فرانت‌اند است؛ پیام‌ها فقط در localStorage همین مرورگر ذخیره می‌شوند. ارسال پیامک یا ارتباط با سرور انجام نمی‌شود.</p>
    </div>
  );
}

/* -------------------------------- پروفایل -------------------------------- */

function StudentProfile() {
  const currentStudentId = useCurrentStudentId();
  const { navigate } = useRouter();
  const me = useStore((s) => s.students.find((x) => x.id === currentStudentId));
  const addressKey = addressStorageKey(me?.phone);
  const [addrCount, setAddrCount] = React.useState(0);
  const [orderCount, setOrderCount] = React.useState(0);

  React.useEffect(() => {
    setAddrCount(loadAddresses(addressKey).length);
    try {
      const raw = window.localStorage.getItem("edc-orders");
      const list = raw ? (JSON.parse(raw) as { phone?: string }[]) : [];
      setOrderCount(Array.isArray(list) ? list.filter((order) => normalizePhone(order.phone ?? "") === normalizePhone(me?.phone ?? "")).length : 0);
    } catch {
      setOrderCount(0);
    }
  }, [addressKey, me?.phone]);
  return (
    <div className="max-w-2xl">
      <PanelHeading title="پروفایل من" desc="اطلاعات شخصی و تنظیمات حساب." />
      <div className="rounded-[8px] rd-inside border border-hairline-soft bg-white p-4 sm:p-6 space-y-5">
        <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-4">
          <span className="grid size-16 shrink-0 place-items-center rounded-[8px] bg-rd-deep text-white text-xl font-black-fa sm:size-20 sm:text-2xl">{(me?.name ?? "س")[0]}</span>
          <div className="min-w-0 flex-1">
            <p className="font-black-fa text-ink text-[16px]">{me?.name ?? "سارا محمدی"}</p>
            <p className="text-sm leading-6 text-ink-soft">سطح فعلی: A1 — هدف: B1 برای کار در آلمان</p>
          </div>
          <Button className="w-full shrink-0 bg-rd-deep text-white hover:bg-navy-700 sm:ms-auto sm:w-auto" onClick={() => navigate("/student/profile/edit")}>
            <UserCircle className="size-4 me-1.5" /> ویرایش اطلاعات
          </Button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            { l: "شماره موبایل", v: me?.phone ?? "—", hint: "تغییر با تأیید کد پیامکی" },
            { l: "ایمیل", v: me?.email || "—", hint: "" },
            { l: "زبان در حال یادگیری", v: "آلمانی", hint: "" },
            { l: "عضویت از", v: me?.joinedAt ?? "شهریور ۱۴۰۴", hint: "" },
            { l: "دوره‌های من", v: `${me ? fa(me.courseIds.length) : "۰"} دوره فعال`, hint: "" },
            { l: "میانگین نمره", v: me?.avg ? fa(me.avg.toFixed(1)) : "—", hint: "" },
          ].map((f) => (
            <div key={f.l} className="min-w-0 rounded-[8px] bg-canvas-soft p-3.5 sm:p-4">
              <p className="text-xs text-ink-soft">{f.l}</p>
              <p className="mt-1 break-words font-bold text-ink">{f.v}</p>
              {f.hint && <p className="text-[10px] text-ink mt-1">{f.hint}</p>}
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" className="border-hairline text-ink" onClick={() => navigate("/student/assignments")}>تکالیف من</Button>
          <Button variant="outline" className="border-hairline text-ink" onClick={() => navigate("/student/grades")}>کارنامه من</Button>
          <Button variant="outline" className="border-hairline text-ink" onClick={() => navigate("/student/addresses")}>
            <MapPin className="size-4 me-1.5" /> آدرس‌های من{addrCount > 0 ? ` (${fa(addrCount)})` : ""}
          </Button>
          <Button variant="outline" className="border-hairline text-ink" onClick={() => navigate("/student/orders")}>
            <ShoppingBag className="size-4 me-1.5" /> سفارش‌های من{orderCount > 0 ? ` (${fa(orderCount)})` : ""}
          </Button>
        </div>
      </div>
      <p className="mt-4 text-[11px] text-ink-soft leading-6">
        اطلاعات پروفایل شما در پنل مدیریت و برای اساتید کلاس‌هایتان (بدون اطلاعات مالی) نمایش داده می‌شود.
      </p>
    </div>
  );
}

/* ------------------------------- آدرس‌های من ------------------------------ */

function StudentAddresses() {
  const { toast } = useToast();
  const { user } = useAuth();
  const addressKey = addressStorageKey(user?.phone);
  const [list, setList] = React.useState<SavedAddress[]>([]);
  const [showForm, setShowForm] = React.useState(false);
  const [fTitle, setFTitle] = React.useState("");
  const [fProvince, setFProvince] = React.useState("گیلان");
  const [fCity, setFCity] = React.useState("رشت");
  const [fLine, setFLine] = React.useState("");
  const [fPostal, setFPostal] = React.useState("");
  const [fNote, setFNote] = React.useState("");

  React.useEffect(() => setList(loadAddresses(addressKey)), [addressKey]);

  const save = () => {
    if (!fTitle.trim()) {
      toast({ title: "عنوان آدرس را وارد کنید.", variant: "destructive" });
      return;
    }
    if (!fLine.trim()) {
      toast({ title: "نشانی پستی را وارد کنید.", variant: "destructive" });
      return;
    }
    const next = addAddress({
      title: fTitle.trim(),
      province: fProvince,
      city: fCity,
      line: fLine.trim(),
      postal: fPostal.trim() || undefined,
      note: fNote.trim() || undefined,
    }, addressKey);
    setList(next);
    setFTitle("");
    setFLine("");
    setFPostal("");
    setFNote("");
    setShowForm(false);
    toast({ title: "آدرس ذخیره شد ✔", description: "در سبد خرید هم به‌عنوان آدرس قبلی نمایش داده می‌شود." });
  };

  return (
    <div className="max-w-2xl">
      <PanelHeading
        title="آدرس‌های من"
        desc="آدرس‌های ذخیره‌شده برای ارسال کتاب‌ها — در سبد خرید هم قابل انتخاب‌اند."
        action={
          <Button className="bg-rd-deep text-white hover:bg-navy-700" onClick={() => setShowForm((v) => !v)}>
            <Plus className="size-4 me-1.5" /> افزودن آدرس
          </Button>
        }
      />
      {list.length === 0 && !showForm ? (
        <div className="rd-inside rounded-[8px] border border-hairline-soft bg-white p-6 sm:p-10 text-center">
          <span className="mx-auto grid size-12 place-items-center rounded-full bg-canvas-soft text-ink">
            <MapPin className="size-6" />
          </span>
          <p className="mt-3 text-sm font-bold text-ink">هنوز آدرسی ذخیره نکرده‌اید</p>
          <p className="mt-1.5 text-[12.5px] leading-6 text-ink-soft">
            برای ارسال کتاب‌ها، یک آدرس ذخیره کنید تا هنگام خرید سریع انتخاب شود.
          </p>
          <Button className="mt-4 bg-rd-deep text-white hover:bg-navy-700" onClick={() => setShowForm(true)}>
            <Plus className="size-4 me-1.5" /> افزودن آدرس
          </Button>
        </div>
      ) : (
        <ul className="space-y-3">
          {list.map((a) => (
            <li key={a.id} className="rd-inside rounded-[8px] border border-hairline-soft bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="flex items-center gap-2 text-[13.5px] font-bold text-ink">
                    <MapPin className="size-4 shrink-0 text-rd-accent" />
                    {a.title}
                    {a.postal && <span className="text-[10.5px] font-normal text-ink-faint">کد پستی {fa(a.postal)}</span>}
                  </p>
                  <p className="mt-1.5 text-[12.5px] leading-6 text-ink-soft">{addrOneLine(a)}</p>
                  {a.note && <p className="mt-1 text-[11px] text-ink-faint">توضیحات: {a.note}</p>}
                </div>
                <button
                  type="button"
                  title="حذف آدرس"
                  aria-label={`حذف آدرس ${a.title}`}
                  onClick={() => {
                    setList(removeAddress(a.id, addressKey));
                    toast({ title: "آدرس حذف شد" });
                  }}
                  className="grid size-9 shrink-0 place-items-center rounded-full border border-hairline-soft text-ink-soft transition-colors hover:border-bad/30 hover:bg-bad/10 hover:text-bad"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {showForm && (
        <div className="rd-inside mt-4 rounded-[8px] border border-hairline-soft bg-white p-5">
          <p className="mb-3.5 text-[13px] font-black-fa text-ink">آدرس جدید</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-xs font-bold text-ink">عنوان آدرس *</span>
              <input
                value={fTitle}
                onChange={(e) => setFTitle(e.target.value)}
                placeholder="مثلاً خانه یا محل کار"
                aria-label="عنوان آدرس"
                className={fieldCls}
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-bold text-ink">کد پستی</span>
              <input
                value={fPostal}
                onChange={(e) => setFPostal(e.target.value)}
                inputMode="numeric"
                placeholder="مثلاً ۴۱۵۳۹"
                aria-label="کد پستی"
                className={fieldCls}
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-bold text-ink">استان *</span>
              <select
                value={fProvince}
                onChange={(e) => {
                  setFProvince(e.target.value);
                  setFCity(CITIES_BY_PROVINCE[e.target.value]?.[0] ?? "");
                }}
                aria-label="انتخاب استان"
                className={fieldCls}
              >
                {IRAN_PROVINCES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-bold text-ink">شهر *</span>
              <select
                value={fCity}
                onChange={(e) => setFCity(e.target.value)}
                aria-label="انتخاب شهر"
                className={fieldCls}
              >
                {(CITIES_BY_PROVINCE[fProvince] ?? []).map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label className="mt-3 block">
            <span className="mb-1.5 block text-xs font-bold text-ink">نشانی پستی *</span>
            <textarea
              value={fLine}
              onChange={(e) => setFLine(e.target.value)}
              rows={2}
              placeholder="خیابان، کوچه، پلاک و واحد"
              aria-label="نشانی پستی"
              className="w-full resize-none rounded-[8px] bg-white px-3.5 py-2.5 text-[13px] leading-6 text-ink outline-none ring-1 ring-hairline-soft placeholder:text-ink-faint focus:ring-2 focus:ring-rd-accent/40"
            />
          </label>
          <label className="mt-3 block">
            <span className="mb-1.5 block text-xs font-bold text-ink">
              توضیحات آدرس <span className="font-normal text-ink-faint">(اختیاری)</span>
            </span>
            <input
              value={fNote}
              onChange={(e) => setFNote(e.target.value)}
              placeholder="مثلاً طبقه دوم، زنگ ۳"
              aria-label="توضیحات آدرس"
              className={fieldCls}
            />
          </label>
          <div className="mt-4 flex gap-2">
            <Button className="flex-1 bg-rd-deep text-white hover:bg-navy-700 font-bold" onClick={save}>
              <CheckCircle2 className="size-4 me-1.5" /> ذخیره آدرس
            </Button>
            <Button variant="outline" className="border-hairline text-ink" onClick={() => setShowForm(false)}>انصراف</Button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------- سفارش‌های من ----------------------------- */

type PlacedOrder = {
  code: string;
  items: { type: "course" | "book"; id: string; title: string; price: number; image: string; qty: number }[];
  subtotal: number;
  discount: number;
  discountCode?: string;
  shipping: number;
  total: number;
  name: string;
  phone: string;
  addressTitle?: string;
  address?: string;
  note?: string;
  pay: string;
  at: string;
};

function StudentOrders() {
  const currentStudentId = useCurrentStudentId();
  const me = useStore((state) => state.students.find((student) => student.id === currentStudentId));
  const [orders, setOrders] = React.useState<PlacedOrder[]>([]);
  React.useEffect(() => {
    try {
      const raw = window.localStorage.getItem("edc-orders");
      const list = raw ? (JSON.parse(raw) as PlacedOrder[]) : [];
      setOrders(Array.isArray(list) ? [...list].filter((order) => normalizePhone(order.phone) === normalizePhone(me?.phone ?? "")).reverse() : []);
    } catch {
      setOrders([]);
    }
  }, [me?.phone]);

  return (
    <div className="max-w-2xl">
      <PanelHeading title="سفارش‌های من" desc="دوره‌ها و کتاب‌هایی که از فروشگاه ثبت کرده‌اید." />
      {orders.length === 0 ? (
        <div className="rd-inside rounded-[8px] border border-hairline-soft bg-white p-6 sm:p-10 text-center">
          <span className="mx-auto grid size-12 place-items-center rounded-full bg-canvas-soft text-ink">
            <ShoppingBag className="size-6" />
          </span>
          <p className="mt-3 text-sm font-bold text-ink">هنوز سفارشی ثبت نکرده‌اید</p>
          <p className="mt-1.5 text-[12.5px] leading-6 text-ink-soft">
            از فروشگاه کتاب‌ها یا صفحهٔ دوره‌ها ثبت سفارش کنید؛ فهرست سفارش‌ها همین‌جا نمایش داده می‌شود.
          </p>
        </div>
      ) : (
        <ul className="space-y-4">
          {orders.map((o) => (
            <li key={o.code} className="rd-inside rounded-[8px] border border-hairline-soft bg-white p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="flex items-center gap-2 text-[13.5px] font-bold text-ink">
                  <ShoppingBag className="size-4 shrink-0 text-rd-accent" />
                  کد سفارش{" "}
                  <span className="dc-mono rounded-[6px] bg-canvas-soft px-2 py-0.5 text-[12px] font-bold text-rd-accent" dir="ltr">
                    {o.code}
                  </span>
                </p>
                <span className="flex items-center gap-2">
                  <span className="text-[11px] text-ink-faint">{o.at}</span>
                  <span className="rounded-full bg-warn/10 px-2.5 py-1 text-[11px] font-bold text-warn">
                    ثبت آزمایشی
                  </span>
                </span>
              </div>
              <ul className="mt-3 space-y-2">
                {o.items.map((it) => (
                  <li key={it.id} className="flex items-center gap-3 rounded-[8px] bg-canvas-soft/60 px-3 py-2">
                    <img src={it.image} alt="" className="size-10 shrink-0 rounded-[8px] object-cover" />
                    <span className="min-w-0 flex-1 truncate text-[12.5px] font-bold text-ink">
                      {it.title}
                      {it.qty > 1 && <span className="text-[11px] font-normal text-ink-faint"> × {faNum(it.qty)}</span>}
                    </span>
                    <span className="shrink-0 text-[12px] font-bold text-ink-soft">{faPrice(it.price * it.qty)}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-3 space-y-1.5 border-t border-hairline-soft pt-2.5 text-[12px] text-ink-soft">
                {o.discount > 0 && (
                  <p className="flex items-center justify-between">
                    <span>تخفیف‌ها{o.discountCode ? ` (${o.discountCode})` : ""}</span>
                    <span className="font-bold text-ok">−{faPrice(o.discount)}</span>
                  </p>
                )}
                {o.items.some((it) => it.type === "book") && (
                  <p className="flex items-center justify-between">
                    <span>هزینه ارسال</span>
                    <span className="font-bold text-ink">{o.shipping === 0 ? "رایگان" : faPrice(o.shipping)}</span>
                  </p>
                )}
                <p className="flex items-center justify-between">
                  <span className="font-black-fa text-[13px] text-ink">مبلغ کل</span>
                  <span className="text-[13.5px] font-black-fa text-ink">{faPrice(o.total)}</span>
                </p>
                {(o.addressTitle || o.address) && (
                  <p className="pt-1">
                    <span className="font-bold text-ink">{o.addressTitle}</span>
                    {o.address ? ` — ${o.address}` : ""}
                  </p>
                )}
                {o.note && <p>توضیحات: {o.note}</p>}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
