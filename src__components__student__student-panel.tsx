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
import { PanelShell, PanelHeading, StatCard, type PanelNavItem } from "@/components/panels/shell";
import { useRouter } from "@/lib/app-context";
import { useToast } from "@/hooks/use-toast";
import { useStore } from "@/lib/store";
import { useCurrentStudentId } from "@/lib/current-user";
import { useAuth, normalizePhone } from "@/lib/auth-context";
import { fa, faNum, faPrice } from "@/lib/format";
import {
  videos,
  assignments as assignmentsData,
  grades as gradesData,
  studentSchedule,
  notificationsStudent,
  courses,
  type Video,
  type QuizQuestion,
  teachersById,
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
  { key: "assignments", label: "تکالیف", icon: ClipboardList, href: "/student/assignments", badge: 2 },
  { key: "files", label: "فایل‌های آموزشی", icon: FolderOpen, href: "/student/files" },
  { key: "grades", label: "نمرات", icon: Star, href: "/student/grades" },
  { key: "progress", label: "گزارش پیشرفت", icon: TrendingUp, href: "/student/progress" },
  { key: "messages", label: "پیام‌ها", icon: MessageSquare, href: "/student/messages", badge: 2 },
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

type QuizPhase = "intro" | "quiz" | "result" | "review";

function QuizEngine({
  video,
  onPass,
  onClose,
}: {
  video: Video;
  onPass: () => void;
  onClose: () => void;
}) {
  const questions: QuizQuestion[] = video.quiz ?? [];
  const [phase, setPhase] = React.useState<QuizPhase>("intro");
  const [qIndex, setQIndex] = React.useState(0);
  const [answers, setAnswers] = React.useState<number[]>(Array(questions.length).fill(-1));
  const [answered, setAnswered] = React.useState<boolean[]>(Array(questions.length).fill(false));
  const [seconds, setSeconds] = React.useState(0);
  const correctCount = answers.filter((a, i) => a === questions[i].answer).length;
  const score = Math.round((correctCount / questions.length) * 100);
  const passed = score >= (video.passScore ?? 70);

  React.useEffect(() => {
    if (phase !== "quiz") return;
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [phase]);

  const timeLabel = `${fa(Math.floor(seconds / 60))}:${fa(String(seconds % 60).padStart(2, "0"))}`;

  const pick = (opt: number) => {
    setAnswers((prev) => prev.map((a, i) => (i === qIndex ? opt : a)));
    setAnswered((prev) => prev.map((a, i) => (i === qIndex ? true : a)));
  };

  const submit = () => {
    if (passed) onPass();
    setPhase("result");
  };

  const unanswered = answers.filter((a) => a === -1).length;

  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-xl p-0 overflow-hidden gap-0">
        {phase === "intro" && (
          <div className="p-8 text-center">
            <span className="inline-grid size-16 place-items-center rounded-[8px] bg-canvas-soft text-ink">
              <Timer className="size-8" />
            </span>
            <DialogHeader className="mt-4">
              <DialogTitle className="text-center text-[16px] font-black-fa text-ink">آزمون این ویدئو</DialogTitle>
            </DialogHeader>
            <p className="mt-2 text-sm text-ink-soft leading-7">
              {faNum(questions.length)} سؤال، حدود {fa(3)} دقیقه — نمره قبولی {fa(video.passScore ?? 70)}٪.
              <br />ترتیب سؤال‌ها تصادفی است و در صورت مردود شدن، تلاش مجدد داری.
            </p>
            <div className="mt-6 flex gap-3 justify-center">
              <Button className="bg-rd-deep text-white hover:bg-navy-700 font-bold h-11 px-8" onClick={() => setPhase("quiz")}>
                شروع آزمون
              </Button>
              <Button variant="outline" className="h-11 border-hairline text-ink" onClick={onClose}>
                مرور ویدئو
              </Button>
            </div>
          </div>
        )}

        {phase === "quiz" && (
          <div>
            <div className="px-6 pt-5 pb-4 border-b border-hairline-soft">
              <div className="flex items-center justify-between text-xs text-ink-soft mb-2.5">
                <span className="font-bold text-ink">سؤال {fa(qIndex + 1)} از {faNum(questions.length)}</span>
                <span className="flex items-center gap-1"><Timer className="size-3.5" /> {timeLabel}</span>
              </div>
              <Progress value={((qIndex + 1) / questions.length) * 100} className="h-2 bg-canvas-soft [&>div]:bg-rd-accent" />
            </div>
            <div className="p-6">
              <p className="font-bold text-ink leading-7 mb-5">{questions[qIndex].q}</p>
              <div className="space-y-2.5">
                {questions[qIndex].options.map((opt, oi) => (
                  <button
                    key={oi}
                    onClick={() => pick(oi)}
                    className={`w-full flex items-center gap-3 rounded-[8px] border-2 p-3.5 text-start text-sm transition-all min-h-12 ${
                      answers[qIndex] === oi ? "border-ink bg-canvas-soft font-bold" : "border-hairline-soft hover:border-hairline bg-white"
                    }`}
                  >
                    <span className={`grid size-7 shrink-0 place-items-center rounded-[8px] text-xs font-black-fa ${answers[qIndex] === oi ? "bg-rd-deep text-white" : "bg-canvas-soft text-ink"}`}>
                      {fa(oi + 1)}
                    </span>
                    {opt}
                  </button>
                ))}
              </div>
            </div>
            <div className="px-6 py-4 border-t border-hairline-soft flex items-center justify-between">
              <Button variant="outline" className="border-hairline text-ink" disabled={qIndex === 0} onClick={() => setQIndex((i) => i - 1)}>
                <ArrowRight className="size-4 me-1" /> قبلی
              </Button>
              {qIndex < questions.length - 1 ? (
                <Button className="bg-rd-deep text-white hover:bg-navy-700" onClick={() => setQIndex((i) => i + 1)}>
                  بعدی <ArrowLeft className="size-4 ms-1" />
                </Button>
              ) : (
                <Button className="bg-rd-deep text-white hover:bg-navy-700 font-bold" onClick={submit}>
                  ثبت نهایی {unanswered > 0 && `(${faNum(unanswered)} سؤال بی‌پاسخ)`}
                </Button>
              )}
            </div>
          </div>
        )}

        {phase === "result" && (
          <div className="p-8 text-center">
            <span className={`inline-grid size-20 place-items-center rounded-full ${passed ? "bg-ok/15 text-ok" : "bg-bad/10 text-bad"}`}>
              {passed ? <Award className="size-10" /> : <XCircle className="size-10" />}
            </span>
            <p className="mt-4 text-4xl font-black-fa text-ink">{fa(score)}٪</p>
            <p className={`mt-1.5 font-bold ${passed ? "text-ok" : "text-bad"}`}>
              {passed ? "قبول شدی! عالی بود 🎉" : "یک قدم تا قبولی؛ دوباره تلاش کن!"}
            </p>
            <div className="mt-5 grid grid-cols-3 gap-3 max-w-sm mx-auto">
              <div className="rounded-[8px] bg-ok/10 p-3">
                <p className="text-lg font-black-fa text-ok">{fa(correctCount)}</p>
                <p className="text-[11px] text-ink-soft">پاسخ صحیح</p>
              </div>
              <div className="rounded-[8px] bg-bad/10 p-3">
                <p className="text-lg font-black-fa text-bad">{fa(questions.length - correctCount)}</p>
                <p className="text-[11px] text-ink-soft">پاسخ غلط</p>
              </div>
              <div className="rounded-[8px] bg-canvas-soft p-3">
                <p className="text-lg font-black-fa text-ink">{timeLabel}</p>
                <p className="text-[11px] text-ink-soft">زمان پاسخ</p>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-2.5 justify-center">
              {!passed && (
                <Button
                  className="bg-rd-deep text-white hover:bg-navy-700 font-bold"
                  onClick={() => {
                    setAnswers(Array(questions.length).fill(-1));
                    setQIndex(0);
                    setSeconds(0);
                    setPhase("quiz");
                  }}
                >
                  <RotateCcw className="size-4 me-1.5" /> تلاش مجدد
                </Button>
              )}
              <Button variant="outline" className="border-hairline text-ink" onClick={() => setPhase("review")}>
                مرور پاسخ‌ها
              </Button>
              <Button
                variant="ghost"
                className="text-ink"
                onClick={() => {
                  onClose();
                  if (passed) onPass();
                }}
              >
                بستن
              </Button>
            </div>
          </div>
        )}

        {phase === "review" && (
          <div>
            <div className="px-6 py-4 border-b border-hairline-soft flex items-center justify-between">
              <p className="font-black-fa text-ink">مرور پاسخ‌ها</p>
              <Button size="sm" variant="outline" className="border-hairline text-ink" onClick={() => setPhase("result")}>بازگشت</Button>
            </div>
            <div className="p-6 space-y-5 max-h-[55vh] overflow-y-auto scroll-thin">
              {questions.map((q, qi) => {
                const my = answers[qi];
                const ok = my === q.answer;
                return (
                  <div key={qi} className="rounded-[8px] border border-hairline-soft p-4">
                    <p className="text-sm font-bold text-ink leading-6 mb-3">
                      {fa(qi + 1)}. {q.q}
                    </p>
                    <div className="space-y-1.5">
                      {q.options.map((opt, oi) => (
                        <p
                          key={oi}
                          className={`rounded-[8px] px-3 py-2 text-xs flex items-center gap-2 ${
                            oi === q.answer ? "bg-ok/10 text-ok font-bold" : oi === my ? "bg-bad/10 text-bad" : "text-ink-soft"
                          }`}
                        >
                          {oi === q.answer ? <CheckCircle2 className="size-4 shrink-0" /> : oi === my ? <XCircle className="size-4 shrink-0" /> : <span className="size-4 shrink-0" />}
                          {opt}
                          {oi === my && <span className="ms-auto text-[10px]">پاسخ تو</span>}
                        </p>
                      ))}
                    </div>
                    <p className="mt-3 rounded-[8px] bg-canvas-soft p-3 text-[11px] leading-6 text-ink">
                      <b className="text-ink">توضیح: </b>
                      {q.explain}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

/* -------------------------- جزئیات کلاس (فلگ‌شیپ) ------------------------- */

function StudentClassDetail({ classId }: { classId?: string }) {
  const course = classId ? courses.find((c) => c.id === classId) : undefined;
  const { navigate } = useRouter();
  const [watchedMap, setWatchedMap] = React.useState<Record<string, number>>({ v1: 100, v2: 100, v3: 45, v4: 0, v5: 0 });
  const [quizOpen, setQuizOpen] = React.useState<Video | null>(null);
  const [quizUnlocked, setQuizUnlocked] = React.useState<Record<string, boolean>>({});
  const [playing, setPlaying] = React.useState<string | null>(null);
  const [ratingSent, setRatingSent] = React.useState(false);

  // شبیه‌ساز پخش ویدئو: هر نیم‌ثانیه ۳٪ جلو می‌رود
  React.useEffect(() => {
    if (!playing) return;
    const t = setInterval(() => {
      setWatchedMap((m) => {
        const next = Math.min(100, (m[playing] ?? 0) + 3);
        return { ...m, [playing]: next };
      });
    }, 500);
    return () => clearInterval(t);
  }, [playing]);

  React.useEffect(() => {
    Object.entries(watchedMap).forEach(([vid, pct]) => {
      if (pct >= 90) setQuizUnlocked((u) => (u[vid] ? u : { ...u, [vid]: true }));
    });
    if (playing && watchedMap[playing] >= 100) setPlaying(null);
  }, [watchedMap, playing]);

  if (!course) {
    return (
      <div className="rd-inside rounded-[8px] border border-hairline-soft bg-white p-6 sm:p-10 text-center">
        <BookOpenCheck className="mx-auto size-9 text-ink-faint" />
        <h2 className="mt-3 text-sm font-bold text-ink">محتوای آموزشی این کلاس هنوز آماده نیست</h2>
        <p className="mx-auto mt-2 max-w-md text-xs leading-6 text-ink-soft">اطلاعات ثبت‌نام شما در فهرست کلاس‌ها نمایش داده می‌شود؛ اما محتوای جلسات و فایل‌های این دوره هنوز در نسخه فعلی تعریف نشده است.</p>
        <Button className="mt-4 bg-rd-deep text-white hover:bg-navy-700" onClick={() => navigate("/student/classes")}>بازگشت به کلاس‌ها</Button>
      </div>
    );
  }

  const isOnline = course.type === "online";
  const overall = Math.round(Object.values(watchedMap).reduce((a, b) => a + b, 0) / Object.keys(watchedMap).length);

  return (
    <div className="space-y-6">
      <button onClick={() => navigate("/student/classes")} className="flex items-center gap-1.5 text-sm text-ink-soft hover:text-ink">
        <ArrowRight className="size-4" /> بازگشت به کلاس‌ها
      </button>

      <div className="rd-inside rounded-[8px] bg-white p-6 flex flex-wrap items-center gap-4 justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Badge className={isOnline ? "bg-rd-deep text-white hover:bg-navy-700" : "bg-canvas-soft text-ink hover:bg-canvas-soft"}>
              {isOnline ? "آنلاین ویدئویی" : "حضوری"}
            </Badge>
            <Badge variant="outline" className="border-hairline-soft text-ink-soft">سطح {course.level}</Badge>
          </div>
          <h2 className="text-[17px] font-black-fa text-ink">{course.title}</h2>
          <p className="text-sm text-ink-soft mt-1">{teachersById[course.teacherId]?.name} — {isOnline ? `پیشرفت کلی: ${fa(overall)}٪` : course.schedule}</p>
        </div>
        {isOnline && (
          <div className="w-full sm:w-52">
            <div className="flex justify-between text-[11px] mb-1.5">
              <span className="text-ink-soft">تکمیل ویدئوها</span>
              <span className="font-bold text-ink">{fa(overall)}٪</span>
            </div>
            <Progress value={overall} className="h-2 bg-canvas-soft [&>div]:bg-rd-accent" />
          </div>
        )}
      </div>

      <Tabs defaultValue={isOnline ? "videos" : "sessions"} className="rounded-[8px] rd-inside border border-hairline-soft bg-white">
        <TabsList className="w-full justify-start rounded-none border-b border-hairline-soft bg-transparent p-0 h-auto flex-wrap">
          {[
            isOnline ? { v: "videos", l: "ویدئوها و آزمون‌ها" } : { v: "sessions", l: "جلسات و حضور و غیاب" },
            { v: "files", l: "فایل‌ها" },
            { v: "tasks", l: "تکالیف" },
            { v: "scores", l: "نمرات" },
            { v: "rate", l: "امتیاز به استاد" },
          ].map((t) => (
            <TabsTrigger
              key={t.v}
              value={t.v}
              className="rounded-none border-b-2 border-transparent px-5 py-3.5 text-sm data-[state=active]:border-ink data-[state=active]:text-ink data-[state=active]:shadow-none text-ink-soft"
            >
              {t.l}
            </TabsTrigger>
          ))}
        </TabsList>

        {isOnline && (
          <TabsContent value="videos" className="p-5 space-y-4">
            {videos.map((v, i) => {
              const watched = watchedMap[v.id] ?? 0;
              const locked = v.locked && !(quizUnlocked[videos[i - 1]?.id ?? ""] ?? false) && watched === 0;
              const canQuiz = quizUnlocked[v.id] || watched >= 90;
              return (
                <div key={v.id} className={`rounded-[8px] rd-inside border p-4 ${locked ? "border-hairline-soft bg-canvas-soft/60 opacity-75" : "border-hairline-soft bg-white"}`}>
                  <div className="flex items-start gap-4">
                    {/* پخش‌کننده ساده */}
                    <button
                      disabled={locked}
                      onClick={() => setPlaying(playing === v.id ? null : v.id)}
                      className={`relative grid place-items-center size-20 rounded-[8px] overflow-hidden shrink-0 ${locked ? "bg-canvas-soft" : "bg-ink cursor-pointer group"}`}
                      aria-label={locked ? "قفل" : "پخش ویدئو"}
                    >
                      {locked ? (
                        <Lock className="size-6 text-ink-soft" />
                      ) : (
                        <>
                          {playing === v.id ? (
                            <Pause className="size-7 text-white fill-white/30" />
                          ) : (
                            <Play className="size-7 text-white fill-white/30 transition-transform group-hover:scale-110" />
                          )}
                          <span className="absolute bottom-0 inset-x-0 bg-ink/80 text-[9px] text-white py-0.5">{fa(v.duration)}</span>
                        </>
                      )}
                    </button>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-bold text-ink text-sm">{fa(i + 1)}. {v.title}</p>
                        {watched >= 100 && <CheckCircle2 className="size-4 text-ok" />}
                      </div>
                      <div className="mt-2 max-w-md">
                        <div className="flex justify-between text-[10px] mb-1">
                          <span className="text-ink-soft">
                            {watched === 0 ? "شروع نشده" : playing === v.id ? "در حال پخش…" : watched >= 100 ? "دیده‌شده" : `تا ${fa(watched)}٪ دیده‌ای — ادامه بده`}
                          </span>
                          <span className="font-bold text-ink">{fa(watched)}٪</span>
                        </div>
                        <Progress value={watched} className="h-1.5 bg-canvas-soft [&>div]:bg-rd-accent" />
                      </div>
                      <p className="text-[10px] text-ink-soft mt-1.5">پخش داخل پنل با ذخیره نقطه توقف — محافظت‌شده در برابر دانلود</p>
                    </div>
                    {/* دکمه آزمون */}
                    {v.hasQuiz && (
                      <div className="shrink-0 sm:w-40">
                        {canQuiz ? (
                          <Button className="w-full bg-rd-deep text-white hover:bg-navy-700 font-bold" onClick={() => setQuizOpen(v)}>
                            {quizUnlocked[v.id] && watched < 100 ? "شروع آزمون" : watched >= 100 ? "آزمون دوباره" : "آزمون فعال شد!"}
                          </Button>
                        ) : (
                          <p className="text-[10px] text-ink-soft text-center leading-5 rounded-[8px] bg-canvas-soft p-2">
                            «شروع آزمون» پس از دیدن ۹۰٪ ویدئو فعال می‌شود
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                  {playing === v.id && (
                    <div className="mt-3 rounded-[8px] bg-ink p-4 text-center">
                      <p className="text-xs text-navy-200/70 leading-6">
                        پخش‌کننده ویدئو (دمو) — ویدئو در حال پخش شبیه‌سازی‌شده است و پیشرفت شما ذخیره می‌شود.
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </TabsContent>
        )}

        {!isOnline && (
          <TabsContent value="sessions" className="p-5 space-y-3">
            {[
              { n: 22, t: "جلسه ۲۲ — مرور Writing", d: "سه‌شنبه ۱ آبان", att: "حاضر" },
              { n: 21, t: "جلسه ۲۱ — Speaking تست", d: "یکشنبه ۳۱ مهر", att: "حاضر" },
              { n: 20, t: "جلسه ۲۰ — Reading پیشرفته", d: "شنبه ۲۹ مهر", att: "حاضر" },
              { n: 19, t: "جلسه ۱۹ — آزمون میان‌ترم", d: "چهارشنبه ۲۶ مهر", att: "غایب (موجه)" },
              { n: 18, t: "جلسه ۱۸ — Listening", d: "دوشنبه ۲۴ مهر", att: "حاضر" },
            ].map((s) => (
              <div key={s.n} className="flex items-center gap-4 rounded-[8px] border border-hairline-soft p-4">
                <span className="grid size-12 shrink-0 place-items-center rounded-[8px] bg-canvas-soft text-ink font-black-fa">{fa(s.n)}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-ink">{s.t}</p>
                  <p className="text-xs text-ink-soft mt-0.5">{s.d} — کلاس ۱۰۵</p>
                </div>
                <Badge className={s.att === "حاضر" ? "bg-ok/10 text-ok hover:bg-ok/10" : "bg-warn/10 text-warn hover:bg-warn/10"}>{s.att}</Badge>
              </div>
            ))}
          </TabsContent>
        )}

        <TabsContent value="files" className="p-5 grid gap-3 sm:grid-cols-2">
          {[
            { t: "جزوه کامل Reading — PDF", s: "۲٫۴ MB", d: true },
            { t: "فایل صوتی تمرین Listening جلسه ۱۸", s: "۱۲٫۱ MB", d: true },
            { t: "ویدئوی تحلیل نمونه سؤال", s: "۹۸ MB", d: false },
            { t: "کاربرگ تمرین Writing Task 1", s: "۸۶۰ KB", d: true },
          ].map((f) => (
            <div key={f.t} className="flex items-center gap-3 rounded-[8px] border border-hairline-soft p-4">
              <span className="grid size-11 shrink-0 place-items-center rounded-[8px] bg-canvas-soft text-ink"><FileText className="size-5" /></span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-ink truncate">{f.t}</p>
                <p className="text-[11px] text-ink-soft mt-0.5">{f.s} — {f.d ? "قابل دانلود" : "فقط پخش آنلاین"}</p>
              </div>
              {f.d && <Button size="sm" variant="outline" className="border-hairline text-ink shrink-0"><Download className="size-4" /></Button>}
            </div>
          ))}
        </TabsContent>

        <TabsContent value="tasks" className="p-5 space-y-3">
          {assignmentsData.filter((a) => a.courseId === course.id || a.courseId === "toefl").slice(0, 3).map((a) => (
            <div key={a.id} className="flex flex-wrap items-center gap-3 rounded-[8px] border border-hairline-soft p-4">
              <span className="grid size-11 shrink-0 place-items-center rounded-[8px] bg-canvas-soft text-ink"><ClipboardList className="size-5" /></span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-ink">{a.title}</p>
                <p className="text-xs text-ink-soft mt-0.5">مهلت {a.due} — بارم {fa(a.max)}</p>
              </div>
              <Badge className={a.status === "graded" ? "bg-ok/10 text-ok hover:bg-ok/10" : a.status === "late" ? "bg-bad/10 text-bad hover:bg-bad/10" : "bg-warn/10 text-warn hover:bg-warn/10"}>
                {a.status === "graded" ? `نمره: ${fa(a.score!)}` : a.status === "late" ? "دیرکرد" : "در انتظار تحویل"}
              </Badge>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="scores" className="p-5">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-ink-soft text-xs border-b border-hairline-soft">
                <th className="text-start p-3 font-semibold">مورد</th>
                <th className="text-start p-3 font-semibold">نوع</th>
                <th className="text-start p-3 font-semibold">نمره</th>
                <th className="text-start p-3 font-semibold">بازخورد استاد</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {(gradesData[course.id] ?? gradesData.a1).map((g, i) => (
                <tr key={i} className={i % 2 ? "bg-canvas-soft/50" : ""}>
                  <td className="p-3 font-bold text-ink">{g.item}</td>
                  <td className="p-3 text-ink-soft">{g.type}</td>
                  <td className="p-3 font-black-fa text-ink">{fa(g.score)}/{fa(g.max)}</td>
                  <td className="p-3 text-xs text-ink-soft">{g.feedback ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </TabsContent>

        <TabsContent value="rate" className="p-5">
          {ratingSent ? (
            <div className="text-center py-10">
              <Trophy className="size-12 mx-auto text-ink" />
              <p className="mt-3 font-bold text-ink">امتیازت ثبت شد، ممنون!</p>
              <p className="text-sm text-ink-soft mt-1">نظر تو به بهتر شدن کلاس کمک می‌کند.</p>
            </div>
          ) : (
            <div className="max-w-md mx-auto space-y-4">
              <p className="text-sm text-ink-soft leading-7 text-center">به استاد این کلاس امتیاز بده؛ نظرات برای ارزیابی آموزش استفاده می‌شود.</p>
              {["کیفیت تدریس", "نظم و برنامه", "پاسخ‌گویی"].map((c) => (
                <div key={c} className="flex items-center justify-between rounded-[8px] border border-hairline-soft p-4">
                  <span className="text-sm font-semibold text-ink">{c}</span>
                  <div className="flex gap-1" role="radiogroup" aria-label={c}>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className="size-6 cursor-pointer text-brand-600 fill-brand-200 hover:fill-brand-400" />
                    ))}
                  </div>
                </div>
              ))}
              <Textarea placeholder="نظر متنی (اختیاری)…" className="min-h-20" />
              <Button className="w-full bg-rd-deep text-white hover:bg-navy-700 font-bold" onClick={() => setRatingSent(true)}>ثبت امتیاز</Button>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {quizOpen && (
        <QuizEngine
          video={quizOpen}
          onPass={() => {
            // باز کردن ویدئوی بعدی
            setQuizUnlocked((u) => ({ ...u }));
            setWatchedMap((m) => m);
          }}
          onClose={() => setQuizOpen(null)}
        />
      )}
    </div>
  );
}

/* ----------------------------- برنامه هفتگی ------------------------------ */

function StudentSchedule() {
  const colorMap: Record<string, string> = {
    navy: "bg-rd-deep text-white",
    yellow: "bg-canvas-soft text-ink border border-hairline",
    green: "bg-ok/10 text-ok",
  };
  return (
    <div>
      <PanelHeading title="برنامه هفتگی" desc="کلاس‌های حضوری و مهلت تکالیف در یک نگاه." />
      <div className="rounded-[8px] rd-inside border border-hairline-soft bg-white p-5 overflow-x-auto">
        <div className="grid grid-cols-6 gap-3 min-w-[720px]">
          {["شنبه", "یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنجشنبه"].map((d) => (
            <div key={d}>
              <p className="text-center text-xs font-bold text-ink-soft pb-2 border-b border-hairline-soft mb-3">{d}</p>
              <div className="space-y-2.5 min-h-[260px]">
                {studentSchedule.filter((s) => s.day === d).map((s, i) => (
                  <div key={i} className={`rounded-[8px] p-3 text-xs leading-6 ${colorMap[s.color]}`}>
                    <p className="font-bold">{s.course}</p>
                    <p className="opacity-80 mt-0.5">{s.time}</p>
                    <p className="opacity-70 text-[10px]">{s.room}</p>
                  </div>
                ))}
                {d === "دوشنبه" && (
                  <div className="rounded-[8px] border-2 border-dashed border-hairline bg-canvas-soft p-3 text-xs leading-6">
                    <p className="font-bold text-ink">مهلت تکلیف</p>
                    <p className="text-ink-soft text-[10px]">نگارش بادی‌پاراگراف — ۲۳:۵۹</p>
                  </div>
                )}
                {d === "پنجشنبه" && (
                  <div className="rounded-[8px] border border-hairline-soft bg-canvas-soft p-3 text-[11px] text-ink-soft text-center leading-6">
                    بدون کلاس
                    <br />وقت مطالعه آزاد 😉
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      <p className="mt-4 text-xs text-ink-soft text-center">یادآوری پیامکی کلاس‌ها فعال است (فاز پیامک هوشمند).</p>
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
  const list = assignments.filter((a) => myCourseIds.includes(a.courseId));

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

/** تشخیص گذشته بودن مهلت شمسی (دمو بر مبنای آبان ۱۴۰۴) */
function isPastDue(due: string): boolean {
  const m = due.replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d))).match(/(\d{4})\/(\d{1,2})\/(\d{1,2})/);
  if (!m) return false;
  const v = Number(m[1]) * 10000 + Number(m[2]) * 100 + Number(m[3]);
  return v < 14040804;
}

/* --------------------------- فایل‌های آموزشی ----------------------------- */

function StudentFiles() {
  const [cat, setCat] = React.useState("همه");
  const files = [
    { t: "جزوه کامل چانک‌های A1", c: "آلمانی A1 — فصل ۲", k: "PDF", d: true },
    { t: "ویدئوی جلسه ۱۸ کیفیت بالا", c: "آلمانی A1 — فصل ۳", k: "ویدئو", d: false },
    { t: "فایل صوتی تمرین شنیداری", c: "آلمانی A1 — فصل ۳", k: "صوت", d: true },
    { t: "کاربرگ رول‌پلی خرید", c: "آلمانی B1 — فصل ۱", k: "PDF", d: true },
    { t: "بانک چانک‌های اداری", c: "آلمانی B1 — فصل ۳", k: "PDF", d: true },
  ];
  const cats = ["همه", ...Array.from(new Set(files.map((f) => f.k)))];
  const list = cat === "همه" ? files : files.filter((f) => f.k === cat);

  return (
    <div>
      <PanelHeading title="فایل‌های آموزشی" desc="کتابخانه فایل‌ها بر اساس دوره و فصل." />
      <div className="flex gap-2 mb-5 flex-wrap">
        {cats.map((c) => (
          <button key={c} onClick={() => setCat(c)} className={`rounded-full px-4 py-1.5 text-xs font-bold ${cat === c ? "bg-rd-deep text-white" : "bg-white border border-hairline-soft text-ink"}`}>
            {c}
          </button>
        ))}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {list.map((f, i) => (
          <div key={i} className="flex items-center gap-3 rounded-[8px] rd-inside border border-hairline-soft bg-white p-4">
            <span className="grid size-12 shrink-0 place-items-center rounded-[8px] bg-canvas-soft text-ink">
              {f.k === "ویدئو" ? <VideoIcon className="size-5" /> : f.k === "صوت" ? <Play className="size-5" /> : <FileText className="size-5" />}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-ink truncate">{f.t}</p>
              <p className="text-[11px] text-ink-soft mt-0.5">{f.c}</p>
            </div>
            {f.d ? (
              <Button size="sm" variant="outline" className="border-hairline text-ink shrink-0"><Download className="size-4" /></Button>
            ) : (
              <Button size="sm" className="bg-rd-deep text-white hover:bg-navy-700 shrink-0"><Play className="size-4" /></Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* -------------------------------- نمرات ---------------------------------- */

function StudentGrades() {
  return (
    <div className="space-y-6">
      <PanelHeading title="نمرات" desc="نمرات تکالیف و آزمون‌ها به تفکیک کلاس." />
      {Object.entries(gradesData).map(([courseId, rows]) => {
        const course = courses.find((c) => c.id === courseId);
        const avg = Math.round(rows.reduce((s, r) => s + (r.score / r.max) * 100, 0) / rows.length);
        return (
          <div key={courseId} className="rounded-[8px] rd-inside border border-hairline-soft bg-white overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-4 bg-canvas-soft border-b border-hairline-soft">
              <p className="font-bold text-ink text-sm">{course?.title ?? courseId}</p>
              <Badge className="bg-rd-deep text-white hover:bg-rd-deep">میانگین: {fa(avg)}٪</Badge>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-ink-soft text-xs border-b border-hairline-soft">
                  <th className="text-start p-3.5 font-semibold">مورد</th>
                  <th className="text-start p-3.5 font-semibold">نوع</th>
                  <th className="text-start p-3.5 font-semibold">نمره</th>
                  <th className="text-start p-3.5 font-semibold">بازخورد</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rows.map((g, i) => (
                  <tr key={i} className={i % 2 ? "bg-canvas-soft/50" : ""}>
                    <td className="p-3.5 font-bold text-ink">{g.item}</td>
                    <td className="p-3.5 text-ink-soft">{g.type}</td>
                    <td className="p-3.5 font-black-fa text-ink">{fa(g.score)}/{fa(g.max)}</td>
                    <td className="p-3.5 text-xs text-ink-soft">{g.feedback ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      })}
    </div>
  );
}

/* ----------------------------- گزارش پیشرفت ------------------------------ */

function StudentProgress() {
  const trend = [
    { m: "مرداد", نمره: 62 },
    { m: "شهریور", نمره: 68 },
    { m: "مهر", نمره: 74 },
    { m: "آبان", نمره: 81 },
  ];

  return (
    <div className="space-y-6">
      <PanelHeading title="گزارش پیشرفت" desc="روند نمرات و میزان تکمیل دوره‌ها." />
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard icon={TrendingUp} label="روند نمرات (۳ ماه اخیر)" value="+۱۹٪" trend="صعودی" />
        <StatCard icon={CheckCircle2} label="تکمیل ویدئوها (آلمانی A1)" value="۶۲٪" tint="yellow" />
        <StatCard icon={UserCircle} label="حضور کلاس‌های حضوری" value="۹۲٪" tint="green" />
      </div>

      <div className="rounded-[8px] rd-inside border border-hairline-soft bg-white p-5">
        <p className="font-bold text-ink text-sm mb-4">روند نمره کل</p>
        <div className="h-64" dir="ltr">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trend} margin={{ top: 8, left: 8, right: 8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#D9DEE8" vertical={false} />
              <XAxis dataKey="m" tick={{ fontSize: 12, fontFamily: "IRANSans" }} stroke="#5B6475" />
              <YAxis tick={{ fontSize: 12, fontFamily: "IRANSans" }} stroke="#5B6475" domain={[50, 100]} />
              <RTooltip contentStyle={{ fontFamily: "IRANSans", borderRadius: 8, border: "1px solid #D9DEE8" }} />
              <Line type="monotone" dataKey="نمره" stroke="#f80559" strokeWidth={3} dot={{ r: 5, fill: "#f80559" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-[8px] rd-inside border border-hairline-soft bg-white p-5">
        <div className="flex items-center justify-between mb-4">
          <p className="font-bold text-ink text-sm">کارنامه دوره آلمانی A1</p>
          <Button size="sm" variant="outline" className="border-hairline text-ink"><Download className="size-4 me-1" /> دانلود PDF</Button>
        </div>
        {[
          { l: "میانگین آزمون‌های ویدئو", v: "۸۵٪" },
          { l: "ویدئوهای تکمیل‌شده", v: "۳ از ۵" },
          { l: "تکالیف تحویل‌شده", v: "۲ از ۳" },
          { l: "نقاط ضعف شناسایی‌شده", v: "حرف تعریف اسم‌ها (der/die/das)" },
          { l: "وضعیت قبولی", v: "در جریان — ۲ فصل مانده" },
        ].map((r) => (
          <div key={r.l} className="flex justify-between py-2.5 border-b border-hairline-soft last:border-0 text-sm">
            <span className="text-ink-soft">{r.l}</span>
            <span className="font-bold text-ink">{r.v}</span>
          </div>
        ))}
      </div>
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
