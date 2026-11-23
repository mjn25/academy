"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { PanelShell, PanelHeading, StatCard, StatusBadge, type PanelNavItem } from "@/components/panels/shell";
import { useRouter } from "@/lib/app-context";
import { fa, faNum } from "@/lib/format";
import { useStore } from "@/lib/store";
import { useCurrentTeacherId } from "@/lib/current-user";
import {
  LayoutDashboard,
  BookOpenCheck,
  UserCheck,
  ClipboardList,
  Star,
  Users,
  MessageSquare,
  UserCircle,
  Check,
  X,
  MinusCircle,
  Clock,
  Users2,
  FileText,
  Send,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Trophy,
  Plus,
} from "lucide-react";

const nav: PanelNavItem[] = [
  { key: "dash", label: "داشبورد", icon: LayoutDashboard, href: "/teacher" },
  { key: "classes", label: "کلاس‌های من", icon: BookOpenCheck, href: "/teacher/classes" },
  { key: "attendance", label: "حضور و غیاب", icon: UserCheck, href: "/teacher/attendance" },
  { key: "assignments", label: "تکالیف و نمره‌دهی", icon: ClipboardList, href: "/teacher/assignments" },
  { key: "students", label: "دانشجویان", icon: Users, href: "/teacher/students" },
  { key: "feedback", label: "بازخوردها", icon: Star, href: "/teacher/feedback" },
  { key: "messages", label: "پیام‌ها", icon: MessageSquare, href: "/teacher/messages" },
  { key: "profile", label: "پروفایل", icon: UserCircle, href: "/teacher/profile" },
];

const titles: Record<string, string> = {
  dash: "داشبورد استاد",
  classes: "کلاس‌های من",
  attendance: "حضور و غیاب",
  assignments: "تکالیف و نمره‌دهی",
  students: "لیست دانشجویان",
  feedback: "بازخوردهای دانشجویان",
  messages: "پیام‌ها",
  profile: "پروفایل من",
};

export function TeacherPanel({ section }: { section: string }) {
  const currentTeacherId = useCurrentTeacherId();
  const me = useStore((s) => s.teachers.find((t) => t.id === currentTeacherId));
  /* بخش حذف‌شده (محتوای کلاس — محتواگذاری با پنل مدیریت) → داشبورد */
  const sec = section === "content" ? "dash" : section;
  return (
    <PanelShell title={titles[sec] ?? "پنل استاد"} nav={nav} active={sec} roleLabel="پنل استاد" userName={me?.name ?? "استاد"}>
      {sec === "dash" && <TeacherDashboard />}
      {sec === "classes" && <TeacherClasses />}
      {sec === "attendance" && <TeacherAttendance />}
      {sec === "assignments" && <TeacherAssignments />}
      {sec === "students" && <TeacherStudents />}
      {sec === "feedback" && <TeacherFeedback />}
      {sec === "messages" && <TeacherMessages />}
      {sec === "profile" && <TeacherProfile />}
    </PanelShell>
  );
}

/* -------------------------------- داشبورد -------------------------------- */

function TeacherDashboard() {
  const currentTeacherId = useCurrentTeacherId();
  const { navigate } = useRouter();
  const { assignments, submissions, courses } = useStore();
  const myCourses = courses.filter((course) => course.teacherId === currentTeacherId);
  const myCourseIds = myCourses.map((course) => course.id);
  const myAssignments = assignments.filter((assignment) => myCourseIds.includes(assignment.courseId));
  const pending = myAssignments
    .map((assignment) => ({
      assignment,
      count: submissions.filter((submission) => submission.assignmentId === assignment.id && submission.status === "در انتظار بررسی").length,
    }))
    .filter((item) => item.count > 0)
    .sort((a, b) => b.count - a.count);
  const studentCount = new Set(myCourses.flatMap((course) => course.studentIds)).size;
  const pendingCount = pending.reduce((total, item) => total + item.count, 0);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard icon={BookOpenCheck} label="کلاس‌های شما" value={faNum(myCourses.length) + " کلاس"} />
        <StatCard icon={Users2} label="دانشجویان کلاس‌ها" value={faNum(studentCount) + " نفر"} tint="yellow" />
        <StatCard icon={ClipboardList} label="پاسخ‌های منتظر بررسی" value={faNum(pendingCount) + " مورد"} tint="red" />
      </div>

      <div className="grid min-w-0 gap-4 xl:grid-cols-2">
        <section className="rd-inside min-w-0 rounded-[8px] border border-hairline-soft bg-white p-5">
          <div className="mb-3 flex items-center justify-between gap-2">
            <p className="text-sm font-bold text-ink">کلاس‌های تخصیص‌یافته</p>
            <Button size="sm" variant="ghost" onClick={() => navigate("/teacher/classes")}>همه کلاس‌ها</Button>
          </div>
          {myCourses.length ? (
            <div className="space-y-2">
              {myCourses.slice(0, 5).map((course) => {
                const count = new Set(course.studentIds).size;
                return (
                  <button key={course.id} onClick={() => navigate("/teacher/classes/" + course.id)} className="flex w-full items-center gap-3 rounded-[8px] border border-hairline-soft p-3 text-start transition-colors hover:border-navy-deep hover:bg-canvas-soft/40">
                    <span className="grid size-10 shrink-0 place-items-center rounded-[8px] bg-canvas-soft text-rd-accent"><BookOpenCheck className="size-5" /></span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-xs font-bold text-ink">{course.title}</span>
                      <span className="mt-1 block text-[11px] text-ink-soft">{faNum(count)} دانشجو · {course.type === "online" ? "آنلاین" : "حضوری"}</span>
                    </span>
                    <ArrowLeft className="size-4 shrink-0 text-ink-soft" />
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="rounded-[8px] border border-dashed border-hairline-soft bg-canvas-soft/40 p-5 text-center">
              <BookOpenCheck className="mx-auto size-7 text-ink-faint" />
              <p className="mt-2 text-sm font-bold text-ink">هنوز کلاسی به شما تخصیص داده نشده</p>
              <p className="mt-1 text-xs leading-6 text-ink-soft">بعد از تخصیص دوره از طرف مدیریت، کلاس‌ها در این بخش نمایش داده می‌شوند.</p>
            </div>
          )}
        </section>

        <section className="rd-inside min-w-0 rounded-[8px] border border-hairline-soft bg-white p-5">
          <div className="mb-3 flex items-center justify-between gap-2">
            <p className="text-sm font-bold text-ink">پاسخ‌های منتظر نمره‌دهی</p>
            <Badge className="bg-warn/10 text-warn hover:bg-warn/10">{faNum(pendingCount)} مورد</Badge>
          </div>
          {pending.length ? (
            <div className="space-y-2">
              {pending.slice(0, 5).map(({ assignment, count }) => (
                <button key={assignment.id} onClick={() => navigate("/teacher/assignments/" + assignment.id)} className="flex w-full items-center gap-3 rounded-[8px] border border-hairline-soft p-3 text-start transition-colors hover:border-navy-deep hover:bg-canvas-soft/40">
                  <span className="grid size-9 shrink-0 place-items-center rounded-[8px] bg-canvas-soft text-ink"><FileText className="size-4" /></span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-xs font-bold text-ink">{assignment.title}</span>
                    <span className="mt-1 block text-[11px] text-ink-soft">{faNum(count)} پاسخ · {myCourses.find((course) => course.id === assignment.courseId)?.title ?? "دوره"}</span>
                  </span>
                  <ArrowLeft className="size-4 shrink-0 text-ink-soft" />
                </button>
              ))}
            </div>
          ) : (
            <p className="rounded-[8px] bg-canvas-soft/60 p-5 text-center text-xs leading-6 text-ink-soft">
              {myAssignments.length ? "پاسخی برای نمره‌دهی باقی نمانده است." : "با ساخت اولین تکلیف، پاسخ‌های دانشجویان در این بخش نمایش داده می‌شود."}
            </p>
          )}
          <Button className="mt-4 w-full bg-rd-deep text-white hover:bg-navy-700" onClick={() => navigate("/teacher/assignments/new")} disabled={!myCourses.length}>
            <Plus className="me-1.5 size-4" /> ایجاد تکلیف جدید
          </Button>
        </section>
      </div>
    </div>
  );
}

/* ------------------------------ کلاس‌های من ------------------------------ */

function TeacherClasses() {
  const currentTeacherId = useCurrentTeacherId();
  const { navigate } = useRouter();
  const { courses } = useStore();
  const myClasses = courses.filter((c) => c.teacherId === currentTeacherId);
  return (
    <div>
      <PanelHeading title="کلاس‌های من" desc="فقط کلاس‌هایی که مدیریت به شما تخصیص داده است — برای مدیریت روی هر کلاس کلیک کنید." />
      {myClasses.length === 0 ? (
        <div className="rounded-[8px] border border-dashed border-hairline-soft bg-white p-6 sm:p-10 text-center">
          <p className="font-bold text-ink">کلاسی به شما تخصیص نیافته</p>
          <p className="mt-1 text-sm text-ink-soft">مدیریت از پنل مدیریت کلاس‌ها را به شما واگذار می‌کند.</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
          {myClasses.map((c) => (
            <button key={c.id} onClick={() => navigate(`/teacher/classes/${c.id}`)} className="text-start rd-inside rounded-[8px] border border-hairline-soft bg-white p-5 hover:border-navy-deep transition-colors">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-bold text-ink text-sm">{c.title}</h3>
                <StatusBadge status={c.status} />
              </div>
              <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-ink-soft">
                <span>{c.type === "online" ? "آنلاین ضبط‌شده" : "حضوری"}</span>
                <span>{faNum(c.studentIds.length)} دانشجو</span>
                <span>{c.schedule ?? "بدون برنامه (ویدئویی)"}</span>
              </div>
              <div className="mt-3 text-xs font-bold text-ink flex items-center gap-1">مدیریت کلاس <ArrowLeft className="size-3.5" /></div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* --------------------------- حضور و غیاب (فلگ‌شیپ) ------------------------ */

type AttStatus = "present" | "absent" | "excused" | "late";

function TeacherAttendance() {
  const currentTeacherId = useCurrentTeacherId();
  const { toast } = useToast();
  const { students, courses } = useStore();
  const myCourses = React.useMemo(
    () => courses.filter((c) => c.teacherId === currentTeacherId && c.type === "offline" && c.status === "فعال"),
    [courses, currentTeacherId],
  );
  const [cls, setCls] = React.useState(myCourses[0]?.id ?? "");
  const activeCourse = myCourses.find((c) => c.id === cls) ?? myCourses[0];
  const session = activeCourse?.schedule ?? "زمان‌بندی ثبت نشده";
  const roster = (activeCourse?.studentIds ?? [])
    .map((id) => students.find((student) => student.id === id))
    .filter(Boolean) as typeof students;
  const [marks, setMarks] = React.useState<Record<string, AttStatus>>({});
  const [saved, setSaved] = React.useState(false);
  const unmarked = roster.filter((student) => !marks[student.id]).length;

  React.useEffect(() => {
    if (!activeCourse) {
      setMarks({});
      setSaved(false);
      return;
    }
    try {
      const raw = window.localStorage.getItem(`edc-attendance:${activeCourse.id}`);
      const record = raw ? JSON.parse(raw) as { marks?: Record<string, AttStatus> } : null;
      const normalizedMarks: Record<string, AttStatus> = {};
      roster.forEach((student) => {
        const status = record?.marks?.[student.id] ?? record?.marks?.[student.name];
        if (status) normalizedMarks[student.id] = status;
      });
      setMarks(normalizedMarks);
      setSaved(Boolean(record));
    } catch {
      setMarks({});
      setSaved(false);
    }
  }, [activeCourse?.id, students]);

  const setAll = (status: AttStatus) => {
    setMarks(Object.fromEntries(roster.map((student) => [student.id, status])));
    setSaved(false);
  };

  const options: { k: AttStatus; l: string; icon: React.ElementType; cls: string }[] = [
    { k: "present", l: "حاضر", icon: Check, cls: "bg-ok text-white hover:bg-ok/90" },
    { k: "absent", l: "غایب", icon: X, cls: "bg-bad text-white hover:bg-bad/90" },
    { k: "excused", l: "موجه", icon: MinusCircle, cls: "bg-info text-white hover:bg-info/90" },
    { k: "late", l: "تأخیر", icon: Clock, cls: "bg-warn text-white hover:bg-warn/90" },
  ];

  const saveAttendance = () => {
    if (!activeCourse || unmarked > 0) {
      toast({ title: "حضور همه دانشجویان مشخص نشده", description: `${faNum(unmarked)} نفر بدون وضعیت هستند.`, variant: "destructive" });
      return;
    }
    try {
      window.localStorage.setItem(`edc-attendance:${activeCourse.id}`, JSON.stringify({
        courseId: activeCourse.id,
        session: activeCourse.schedule ?? "",
        marks,
        savedAt: new Date().toISOString(),
      }));
      setSaved(true);
      toast({
        title: "حضور و غیاب در این مرورگر ذخیره شد ✓",
        description: `${faNum(Object.values(marks).filter((m) => m === "present").length)} حاضر، ${faNum(Object.values(marks).filter((m) => m === "absent").length)} غایب`,
      });
    } catch {
      toast({ title: "ذخیره انجام نشد", description: "امکان ذخیره در این مرورگر وجود ندارد.", variant: "destructive" });
    }
  };

  if (myCourses.length === 0) {
    return (
      <div className="rounded-[8px] border border-dashed border-hairline-soft bg-white p-6 sm:p-10 text-center">
        <p className="font-bold text-ink">کلاس حضوری فعالی به شما تخصیص داده نشده</p>
        <p className="mt-1 text-sm leading-6 text-ink-soft">حضور و غیاب فقط برای کلاس‌های حضوری فعال است. برای تخصیص کلاس با مدیریت هماهنگ کنید.</p>
      </div>
    );
  }

  return (
    <div>
      <PanelHeading
        title="حضور و غیاب"
        desc="فقط کلاس‌های حضوری شما نمایش داده می‌شوند؛ ثبت این نسخه در همین مرورگر ذخیره می‌شود."
        action={
          <Button
            className="bg-rd-deep text-primary-foreground hover:bg-navy-700 font-bold"
            disabled={!roster.length || unmarked > 0}
            onClick={saveAttendance}
          >
            <Check className="size-4 me-1.5" /> ثبت و ذخیره
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 mb-5">
        <div className="rd-inside rounded-[8px] border border-hairline-soft bg-white p-4">
          <p className="text-xs text-ink-soft mb-2">انتخاب کلاس</p>
          <div className="flex flex-wrap gap-2">
            {myCourses.map((course) => (
              <button
                key={course.id}
                onClick={() => setCls(course.id)}
                className={`rounded-full px-4 py-2 text-xs font-bold transition-colors ${(activeCourse?.id === course.id) ? "bg-navy-deep text-white" : "bg-canvas-soft text-ink"}`}
                aria-pressed={activeCourse?.id === course.id}
              >
                {course.title}
              </button>
            ))}
          </div>
        </div>
        <div className="rd-inside rounded-[8px] border border-hairline-soft bg-white p-4">
          <p className="text-xs text-ink-soft mb-2">برنامه کلاس</p>
          <p className="font-bold text-ink text-sm">{session}</p>
          {saved && <Badge className="mt-2 bg-ok/10 text-ok hover:bg-ok/10">ذخیره‌شده در این مرورگر</Badge>}
        </div>
      </div>

      <div className="rd-inside rounded-[8px] border border-hairline-soft bg-white p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-4 border-b border-hairline-soft">
          <div>
            <p className="text-sm font-bold text-ink">{faNum(roster.length)} دانشجو</p>
            <p className="mt-1 text-[11px] text-ink-soft">{unmarked ? `${faNum(unmarked)} نفر هنوز وضعیت ندارند` : "وضعیت همه مشخص شده است"}</p>
          </div>
          <Button variant="outline" className="border-ok text-ok hover:bg-ok/10 h-10" onClick={() => setAll("present")}>
            <Check className="size-4 me-1.5" /> همه حاضر
          </Button>
        </div>
        {roster.length === 0 ? (
          <p className="rounded-[8px] border border-dashed border-hairline-soft p-5 text-center text-sm text-ink-soft">هنوز دانشجویی در این کلاس ثبت‌نام نشده است.</p>
        ) : (
          <div className="space-y-2.5">
            {roster.map((student) => (
              <div key={student.id} className={`flex flex-wrap items-center gap-3 rounded-[8px] border p-3.5 transition-colors ${marks[student.id] === "absent" ? "border-bad/40 bg-bad/5" : marks[student.id] === "present" ? "border-ok/40 bg-ok/5" : "border-hairline-soft bg-white"}`}>
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-canvas-soft text-ink text-sm font-black-fa">{student.name.replace("دکتر ", "")[0]}</span>
                <p className="text-sm font-bold text-ink flex-1 min-w-32">{student.name}</p>
                <div className="flex gap-1.5 flex-wrap">
                  {options.map((option) => (
                    <button
                      key={option.k}
                      onClick={() => { setMarks((current) => ({ ...current, [student.id]: option.k })); setSaved(false); }}
                      className={`flex items-center gap-1.5 rounded-[8px] px-3.5 py-2.5 text-xs font-bold transition-all min-h-10 ${marks[student.id] === option.k ? `${option.cls} shadow` : "bg-canvas-soft text-ink hover:bg-canvas-soft"}`}
                      aria-pressed={marks[student.id] === option.k}
                    >
                      <option.icon className="size-3.5" /> {option.l}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
        <p className="mt-4 text-[11px] text-ink-soft leading-6">
          برای فعال‌شدن دکمه ثبت، وضعیت همه دانشجویان را مشخص کنید. این نسخه اطلاعات را فقط در مرورگر فعلی نگه می‌دارد و جایگزین ثبت در سامانه مرکزی نیست.
        </p>
      </div>
    </div>
  );
}

/* ---------------------------- نمره‌دهی تکالیف ----------------------------- */

function TeacherAssignments() {
  const currentTeacherId = useCurrentTeacherId();
  const { navigate } = useRouter();
  const { toast } = useToast();
  const { assignments, submissions, courses, gradeSubmission } = useStore();
  const [scores, setScores] = React.useState<Record<string, string>>({});
  const [feedbacks, setFeedbacks] = React.useState<Record<string, string>>({});
  const [savedIds, setSavedIds] = React.useState<string[]>([]);

  const myCourses = courses.filter((c) => c.teacherId === currentTeacherId);
  const myAssignments = assignments.filter((a) => myCourses.some((c) => c.id === a.courseId));
  const mySubs = submissions.filter((s) => myAssignments.some((a) => a.id === s.assignmentId));
  const gradeable = mySubs.filter((s) => s.status === "در انتظار بررسی");

  const doGrade = (subId: string) => {
    const sub = mySubs.find((x) => x.id === subId);
    const a = myAssignments.find((x) => x.id === sub?.assignmentId);
    const raw = scores[subId];
    const num = Number(raw?.replace(/[^\d.]/g, ""));
    const maxScore = a?.max ?? 10;
    if (raw === undefined || raw === "" || !Number.isFinite(num) || num < 0 || num > maxScore) {
      toast({ title: "نمره معتبر نیست", description: `نمره باید عددی بین ۰ تا ${maxScore} باشد.`, variant: "destructive" });
      return;
    }
    gradeSubmission(subId, { score: num, feedback: feedbacks[subId] || undefined });
    setSavedIds((ids) => [...ids, subId]);
    toast({ title: "نمره ثبت شد ✓", description: "نمره در پنل دانشجو و پنل مدیریت قابل مشاهده است." });
  };

  return (
    <div>
      <PanelHeading
        title="تکالیف و نمره‌دهی"
        desc="بررسی پاسخ‌ها و ثبت نمره درجا — نتیجه بلافاصله در پنل دانشجو دیده می‌شود."
        action={
          <Button className="bg-rd-deep text-primary-foreground hover:bg-navy-700 font-bold" onClick={() => navigate("/teacher/assignments/new")}>
            <Plus className="size-4 me-1.5" /> تعریف تکلیف جدید
          </Button>
        }
      />

      {/* تکالیف فعال */}
      {myAssignments.length === 0 ? (
        <div className="mb-6 rounded-[8px] border border-dashed border-hairline-soft bg-white p-6 sm:p-10 text-center">
          <p className="font-bold text-ink">تکلیفی برای کلاس‌های شما تعریف نشده</p>
          <p className="mt-1 text-sm text-ink-soft">اولین تکلیف را تعریف کنید یا منتظر تخصیص از مدیریت بمانید.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-3 mb-6">
          {myAssignments.map((t) => {
            const delivered = submissions.filter((s) => s.assignmentId === t.id).length;
            const total = courses.find((c) => c.id === t.courseId)?.studentIds.length ?? 0;
            return (
              <button key={t.id} onClick={() => navigate(`/teacher/assignments/${t.id}`)} className="text-start rd-inside rounded-[8px] border border-hairline-soft bg-white p-4 hover:border-navy-deep transition-colors">
                <p className="font-bold text-ink text-xs leading-6">{t.title}</p>
                <p className="text-[11px] text-ink-soft mt-1">{courses.find((c) => c.id === t.courseId)?.title} — مهلت: {t.due}</p>
                <div className="mt-2.5">
                  <div className="flex justify-between text-[10px] mb-1">
                    <span className="text-ink-soft">{faNum(delivered)} از {faNum(total)} تحویل داده‌اند</span>
                  </div>
                  <Progress value={total ? (delivered / total) * 100 : 0} className="h-1.5 bg-canvas-soft [&>div]:bg-rd-accent" />
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* جدول نمره‌دهی */}
      {gradeable.length === 0 ? (
        <div className="rounded-[8px] border border-dashed border-hairline-soft bg-white p-6 sm:p-10 text-center">
          <p className="font-bold text-ink">پاسخی در انتظار نمره‌دهی نیست ✓</p>
          <p className="mt-1 text-sm text-ink-soft">به‌محض تحویل دانشجویان، پاسخ‌ها اینجا ظاهر می‌شوند.</p>
        </div>
      ) : (
        <div className="rd-inside rounded-[8px] border border-hairline-soft bg-white overflow-hidden overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="bg-canvas-soft text-ink-soft text-xs border-b border-hairline-soft">
                <th className="text-start p-4 font-semibold">دانشجو</th>
                <th className="text-start p-4 font-semibold">تکلیف</th>
                <th className="text-start p-4 font-semibold">فایل پاسخ</th>
                <th className="text-start p-4 font-semibold">نمره (از ۱۰)</th>
                <th className="text-start p-4 font-semibold">بازخورد</th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {gradeable.map((s, i) => {
                const st = useStore.getState().students.find((x) => x.id === s.studentId);
                const a = myAssignments.find((x) => x.id === s.assignmentId);
                return (
                  <tr key={s.id} className={i % 2 ? "bg-canvas-soft/50" : ""}>
                    <td className="p-4">
                      <button onClick={() => navigate(`/teacher/students/${s.studentId}`)} className="font-bold text-ink hover:underline">{st?.name ?? "—"}</button>
                    </td>
                    <td className="p-4 text-ink-soft">{a?.title}</td>
                    <td className="p-4">
                      <button onClick={() => navigate(`/teacher/assignments/${s.assignmentId}`)} className="flex items-center gap-1 text-info hover:underline text-xs"><FileText className="size-4" /> {s.file ?? "پاسخ متنی"}</button>
                    </td>
                    <td className="p-4">
                      <Input
                        dir="ltr"
                        inputMode="decimal"
                        className="w-20 h-9 text-center font-bold"
                        value={scores[s.id] ?? ""}
                        onChange={(e) => setScores((sc) => ({ ...sc, [s.id]: e.target.value.replace(/[^\d.]/g, "").slice(0, 4) }))}
                        placeholder="0-10"
                        aria-label={`نمره ${st?.name}`}
                      />
                    </td>
                    <td className="p-4">
                      <Textarea className="min-h-9 h-9 py-1.5 text-xs" placeholder="بازخورد کوتاه…" value={feedbacks[s.id] ?? ""} onChange={(e) => setFeedbacks((f) => ({ ...f, [s.id]: e.target.value }))} aria-label={`بازخورد ${st?.name}`} />
                    </td>
                    <td className="p-4">
                      {savedIds.includes(s.id) ? (
                        <Badge className="bg-ok/10 text-ok hover:bg-ok/10"><CheckCircle2 className="size-3.5 me-1" /> ثبت شد</Badge>
                      ) : (
                        <Button size="sm" className="bg-navy-deep text-white hover:bg-navy-700" onClick={() => doGrade(s.id)}>
                          ثبت
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-4 text-[11px] text-ink-soft">نمرات آزمون‌های موسسه توسط مدیریت ثبت می‌شود و برای شما فقط قابل مشاهده است (نیازمند تأیید نهایی).</p>
    </div>
  );
}

/* ------------------------------ دانشجویان -------------------------------- */

function TeacherStudents() {
  const currentTeacherId = useCurrentTeacherId();
  const { navigate } = useRouter();
  const { students, courses, assignments, submissions } = useStore();
  const [q, setQ] = React.useState("");
  const myCourses = courses.filter((c) => c.teacherId === currentTeacherId);
  const myCourseIds = myCourses.map((course) => course.id);
  const myAssignmentIds = assignments.filter((assignment) => myCourseIds.includes(assignment.courseId)).map((assignment) => assignment.id);
  const rosterIds = Array.from(new Set(myCourses.flatMap((c) => c.studentIds)));
  const roster = rosterIds.map((id) => students.find((s) => s.id === id)!).filter(Boolean);
  const list = roster.filter((s) => !q || s.name.includes(q));
  return (
    <div>
      <PanelHeading title="لیست دانشجویان" desc="اطلاعات مالی و پرداخت دانشجویان برای شما نمایش داده نمی‌شود — برای پروفایل تحصیلی روی هر ردیف کلیک کنید." />
      <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="جستجوی نام…" className="h-11 max-w-xs mb-4" />
      {list.length === 0 ? (
        <div className="rounded-[8px] border border-dashed border-hairline-soft bg-white p-6 sm:p-10 text-center">
          <p className="font-bold text-ink">دانشجویی پیدا نشد</p>
          <p className="mt-1 text-sm text-ink-soft">دانشجویان کلاس‌های شما اینجا نمایش داده می‌شوند.</p>
        </div>
      ) : (
        <div className="rd-inside rounded-[8px] border border-hairline-soft bg-white overflow-hidden overflow-x-auto">
          <table className="w-full min-w-[680px] text-sm">
            <thead>
              <tr className="bg-canvas-soft text-ink-soft text-xs border-b border-hairline-soft">
                <th className="text-start p-4 font-semibold">دانشجو</th>
                <th className="text-start p-4 font-semibold">کلاس</th>
                <th className="text-start p-4 font-semibold">پاسخ‌ها</th>
                <th className="text-start p-4 font-semibold">میانگین نمره</th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {list.map((s, i) => {
                const studentSubs = submissions.filter((submission) => submission.studentId === s.id && myAssignmentIds.includes(submission.assignmentId));
                const gradedSubs = studentSubs.filter((submission) => submission.status === "نمره‌داده‌شده" && typeof submission.score === "number");
                const average = gradedSubs.length ? gradedSubs.reduce((sum, submission) => {
                  const assignment = assignments.find((item) => item.id === submission.assignmentId);
                  return sum + ((submission.score ?? 0) / Math.max(1, assignment?.max ?? 10)) * 100;
                }, 0) / gradedSubs.length : null;
                return (
                <tr key={s.id} className={`cursor-pointer transition-colors hover:bg-canvas-soft/60 ${i % 2 ? "bg-canvas-soft/50" : ""}`} onClick={() => navigate(`/teacher/students/${s.id}`)}>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <span className="grid size-9 place-items-center rounded-full bg-canvas-soft text-ink text-xs font-black-fa">{s.name[0]}</span>
                      <div>
                        <p className="font-bold text-ink">{s.name}</p>
                        <p className="text-[11px] text-ink-soft" dir="ltr">{s.phone}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-ink-soft">{myCourses.filter((c) => c.studentIds.includes(s.id)).map((c) => c.title).join("، ")}</td>
                  <td className="p-4 text-ink-soft">{faNum(studentSubs.length)} پاسخ</td>
                  <td className="p-4 font-black-fa text-ink">{average === null ? "—" : fa(average.toFixed(1)) + "٪"}</td>
                  <td className="p-4" onClick={(e) => e.stopPropagation()}>
                    <Button size="sm" variant="outline" className="border-hairline text-ink" onClick={() => navigate(`/teacher/students/${s.id}`)}>پروفایل تحصیلی</Button>
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* -------------------------------- بازخوردها ------------------------------- */

function TeacherFeedback() {
  return (
    <div>
      <PanelHeading title="بازخوردها" desc="بازخوردهای ثبت‌شده دانشجویان درباره کلاس‌های شما." />
      <div className="rounded-[8px] border border-dashed border-hairline-soft bg-white p-8 text-center">
        <Star className="mx-auto size-8 text-ink-faint" />
        <p className="mt-3 text-sm font-bold text-ink">بازخورد ثبت‌شده‌ای وجود ندارد</p>
        <p className="mt-1 text-xs leading-6 text-ink-soft">در نسخه فعلی، فرم ثبت و ذخیره بازخورد دانشجو در داده‌های پروژه پیاده‌سازی نشده است؛ برای جلوگیری از نمایش امتیازها و نظرات نمونه، این بخش خالی نمایش داده می‌شود.</p>
      </div>
    </div>
  );
}

/* -------------------------------- پیام‌ها -------------------------------- */

function TeacherMessages() {
  const currentTeacherId = useCurrentTeacherId();
  const { courses, students, teachers, messages, sendMessage } = useStore();
  const myCourses = courses.filter((course) => course.teacherId === currentTeacherId);
  const myStudentIds = Array.from(new Set(myCourses.flatMap((course) => course.studentIds)));
  const myStudents = students.filter((student) => myStudentIds.includes(student.id));
  const [target, setTarget] = React.useState("");
  const [text, setText] = React.useState("");
  const me = teachers.find((teacher) => teacher.id === currentTeacherId);
  const visibleMessages = messages
    .filter((message) =>
      (message.fromRole === "teacher" && message.fromId === currentTeacherId) ||
      (message.toRole === "teacher" && message.toId === currentTeacherId)
    )
    .sort((a, b) => a.sentAt.localeCompare(b.sentAt));
  const send = () => {
    const [kind, id] = target.split(":");
    const course = myCourses.find((item) => item.id === id);
    const student = myStudents.find((item) => item.id === id);
    if (!text.trim() || !kind || (kind === "course" && !course) || (kind === "student" && !student)) return;
    sendMessage({
      courseId: kind === "course" ? course!.id : (myCourses.find((item) => item.studentIds.includes(student!.id))?.id ?? ""),
      fromId: currentTeacherId,
      fromRole: "teacher",
      fromName: me?.name ?? "استاد",
      toId: kind === "student" ? student!.id : "",
      toRole: "student",
      text: text.trim(),
    });
    setText("");
  };
  return (
    <div className="max-w-3xl">
      <PanelHeading title="پیام‌ها" desc="پیام‌ها در همین مرورگر ذخیره می‌شوند و در پنل طرف مقابل هم قابل مشاهده‌اند." />
      {myCourses.length === 0 ? (
        <div className="rounded-[8px] border border-dashed border-hairline-soft bg-white p-6 text-center"><p className="font-bold text-ink">کلاسی برای ارسال پیام ندارید</p><p className="mt-1 text-sm text-ink-soft">بعد از تخصیص دوره، می‌توانید به دانشجویان همان کلاس پیام بدهید.</p></div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2 rounded-[8px] rd-inside border border-hairline-soft bg-white p-5 space-y-3 max-h-[520px] overflow-y-auto scroll-thin">
            {visibleMessages.length === 0 ? (
              <p className="py-8 text-center text-sm text-ink-soft">هنوز پیامی در گفتگوهای شما ثبت نشده است.</p>
            ) : visibleMessages.map((message) => (
              <div key={message.id} className={message.fromRole === "teacher" ? "flex justify-start" : "flex justify-end"}>
                <div className={`max-w-[88%] rounded-[8px] p-3.5 text-sm leading-7 ${message.fromRole === "teacher" ? "bg-navy-deep text-white" : "bg-canvas-soft text-ink"}`}>
                  <p className={`mb-1 text-[11px] font-bold ${message.fromRole === "teacher" ? "text-white/70" : "text-ink-soft"}`}>{message.fromName}</p>
                  <p>{message.text}</p>
                  <p className="mt-2 text-[10px] opacity-60" dir="ltr">{new Date(message.sentAt).toLocaleString("fa-IR")}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="rounded-[8px] rd-inside border border-hairline-soft bg-white p-5 flex flex-col">
            <p className="font-bold text-ink text-sm mb-3">پیام جدید</p>
            <label className="text-xs font-semibold text-ink mb-1.5" htmlFor="teacher-message-target">گیرنده</label>
            <select id="teacher-message-target" value={target} onChange={(event) => setTarget(event.target.value)} className="mb-3 h-10 w-full rounded-[8px] border border-input bg-white px-3 text-xs">
              <option value="">انتخاب کلاس یا دانشجو</option>
              {myCourses.map((course) => <option key={course.id} value={`course:${course.id}`}>کل کلاس: {course.title}</option>)}
              {myStudents.map((student) => <option key={student.id} value={`student:${student.id}`}>{student.name}</option>)}
            </select>
            <Textarea value={text} onChange={(event) => setText(event.target.value)} placeholder="پیامت را بنویس…" className="min-h-32" />
            <Button className="mt-3 bg-rd-deep text-white hover:bg-navy-700 font-bold" disabled={!target || !text.trim()} onClick={send}>
              <Send className="size-4 me-1.5" /> ارسال پیام
            </Button>
          </div>
        </div>
      )}
      <p className="mt-3 text-xs leading-6 text-ink-soft">این پیام‌رسان نسخه نمایشی فرانت‌اند است؛ داده‌ها فقط در localStorage همین مرورگر ذخیره می‌شوند و به سرور یا دستگاه دیگر ارسال نمی‌شوند.</p>
    </div>
  );
}

/* -------------------------------- پروفایل -------------------------------- */

function TeacherProfile() {
  const currentTeacherId = useCurrentTeacherId();
  const { toast } = useToast();
  const me = useStore((s) => s.teachers.find((t) => t.id === currentTeacherId));
  const updateTeacher = useStore((s) => s.updateTeacher);
  const [name, setName] = React.useState(me?.name ?? "");
  const [title, setTitle] = React.useState(me?.title ?? "");
  const [phone, setPhone] = React.useState(me?.phone ?? "");
  const [bio, setBio] = React.useState(me?.bio ?? "");

  return (
    <div className="max-w-2xl">
      <PanelHeading title="پروفایل من" desc="این اطلاعات در صفحه عمومی اساتید سایت نمایش داده می‌شود (با تأیید مدیریت)." />
      <div className="rd-inside rounded-[8px] border border-hairline-soft bg-white p-4 sm:p-6 space-y-5">
        <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-4">
          <img src={me?.image ?? "/images/teachers/t1.jpg"} alt="" className="size-16 shrink-0 rounded-[8px] object-cover sm:size-20" />
          <div className="min-w-0 flex-1">
            <p className="font-black-fa text-ink text-lg">{name || "—"}</p>
            <p className="text-sm text-ink-soft">{title || "—"} — {fa(me?.experience ?? 0)} سال سابقه</p>
          </div>
        </div>
        <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
          <div>
            <Label className="text-xs font-semibold text-ink">نام و نام خانوادگی</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} className="mt-1.5 h-11" />
          </div>
          <div>
            <Label className="text-xs font-semibold text-ink">عنوان تخصصی</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1.5 h-11" />
          </div>
          <div>
            <Label className="text-xs font-semibold text-ink">شماره موبایل</Label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} dir="ltr" inputMode="tel" disabled className="mt-1.5 h-11 disabled:cursor-not-allowed disabled:opacity-60" />
            <p className="text-[10px] text-ink mt-1">برای تغییر شماره باید تأیید پیامکی انجام شود؛ این امکان در نسخه فعلی فعال نیست.</p>
          </div>
          <div>
            <Label className="text-xs font-semibold text-ink">کلاس‌های تخصیص‌یافته</Label>
            <p className="mt-3 text-sm font-bold text-ink">{fa(me?.courseIds.length ?? 0)} کلاس فعال</p>
          </div>
          <div className="sm:col-span-2">
            <Label className="text-xs font-semibold text-ink">رزومه کوتاه (نمایش عمومی)</Label>
            <Textarea value={bio} onChange={(e) => setBio(e.target.value)} className="mt-1.5 min-h-24" />
          </div>
        </div>
        <Button
          className="w-full h-11 bg-rd-deep text-white hover:bg-navy-700 font-bold"
          onClick={() => {
            if (!name.trim()) {
              toast({ title: "نام را وارد کنید", variant: "destructive" });
              return;
            }
            updateTeacher(currentTeacherId, { name: name.trim(), title: title.trim(), phone: phone.trim(), bio: bio.trim() });
            toast({ title: "پروفایل ذخیره شد ✓", description: "تغییرات پس از تأیید مدیریت در سایت عمومی نمایش داده می‌شود." });
          }}
        >
          <Check className="size-4 me-1.5" /> ذخیره تغییرات
        </Button>
      </div>
    </div>
  );
}

