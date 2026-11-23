"use client";

/* ------------------------------------------------------------------ */
/*  پنل استاد — صفحات داخلی: جزئیات تکلیف/نمره‌دهی، پروفایل دانشجو،     */
/*  جزئیات کلاس و تعریف تکلیف جدید                                    */
/* ------------------------------------------------------------------ */

import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { PanelShell, PageHeader, StatCard, StatusBadge, type PanelNavItem } from "@/components/panels/shell";
import { useRouter, Link } from "@/lib/app-context";
import { fa, faNum } from "@/lib/format";
import { useStore, CURRENT_TEACHER_ID } from "@/lib/store";
import { EmptyState } from "@/components/admin/admin-assignments";
import { AssignmentMaterialsSection, StudentMaterialsCell } from "@/components/panels/assignment-materials";
import { grades as gradesData, studentSchedule } from "@/lib/data";
import {
  LayoutDashboard, BookOpenCheck, UserCheck, ClipboardList, Star, FolderOpen, Users,
  MessageSquare, UserCircle, FileText, CheckCircle2, Clock, ArrowLeft, Plus, Send,
  CalendarDays, TrendingUp, PhoneCall,
} from "lucide-react";

const nav: PanelNavItem[] = [
  { key: "dash", label: "داشبورد", icon: LayoutDashboard, href: "/teacher" },
  { key: "classes", label: "کلاس‌های من", icon: BookOpenCheck, href: "/teacher/classes" },
  { key: "attendance", label: "حضور و غیاب", icon: UserCheck, href: "/teacher/attendance" },
  { key: "assignments", label: "تکالیف و نمره‌دهی", icon: ClipboardList, href: "/teacher/assignments" },
  { key: "students", label: "دانشجویان", icon: Users, href: "/teacher/students" },
  { key: "content", label: "محتوای کلاس", icon: FolderOpen, href: "/teacher/content" },
  { key: "feedback", label: "بازخوردها", icon: Star, href: "/teacher/feedback" },
  { key: "messages", label: "پیام‌ها", icon: MessageSquare, href: "/teacher/messages" },
  { key: "profile", label: "پروفایل", icon: UserCircle, href: "/teacher/profile" },
];

export function TeacherPagesPanel({ mode, id }: { mode: string; id?: string }) {
  const { courses } = useStore();
  const me = useStore((s) => s.teachers.find((t) => t.id === CURRENT_TEACHER_ID));
  const titles: Record<string, string> = {
    "class": "جزئیات کلاس",
    "assignment": "نمره‌دهی تکلیف",
    "assignment-new": "تعریف تکلیف جدید",
    "student": "پروفایل تحصیلی دانشجو",
  };
  return (
    <PanelShell title={titles[mode] ?? "پنل استاد"} nav={nav} active={mode === "class" ? "classes" : mode.startsWith("assignment") ? "assignments" : "students"} roleLabel="پنل استاد" userName={me?.name ?? "استاد"}>
      {mode === "class" && <TeacherClassDetail id={id} />}
      {mode === "assignment" && <TeacherAssignmentDetail id={id} />}
      {mode === "assignment-new" && <TeacherAssignmentNew />}
      {mode === "student" && <TeacherStudentProfile id={id} />}
    </PanelShell>
  );
}

/** کلاس‌های استاد فعلی */
function useMyCourses() {
  const courses = useStore((s) => s.courses);
  return courses.filter((c) => c.teacherId === CURRENT_TEACHER_ID);
}

/* ========================= جزئیات تکلیف + نمره‌دهی ========================= */

export function TeacherAssignmentDetail({ id }: { id?: string }) {
  const { navigate } = useRouter();
  const { toast } = useToast();
  const { assignments, courses, students, submissions, gradeSubmission } = useStore();
  const a = assignments.find((x) => x.id === id);
  const [scores, setScores] = React.useState<Record<string, string>>({});
  const [feedbacks, setFeedbacks] = React.useState<Record<string, string>>({});

  if (!a) {
    return (
      <div>
        <PageHeader crumbs={[{ label: "پنل استاد", href: "/teacher" }, { label: "تکالیف", href: "/teacher/assignments" }, { label: "یافت نشد" }]} title="تکلیف یافت نشد" />
        <EmptyState title="این تکلیف وجود ندارد" desc="ممکن است حذف شده باشد." action={<Button className="bg-navy-deep text-white hover:bg-navy-700" onClick={() => navigate("/teacher/assignments")}>بازگشت به تکالیف</Button>} />
      </div>
    );
  }

  const course = courses.find((c) => c.id === a.courseId);
  const roster = course?.studentIds ?? [];
  const subs = submissions.filter((s) => s.assignmentId === a.id);
  const graded = subs.filter((s) => s.status === "نمره‌داده‌شده");
  const pending = subs.filter((s) => s.status === "در انتظار بررسی");
  const avg = graded.length ? graded.reduce((sum, s) => sum + (s.score ?? 0), 0) / graded.length : 0;

  const doGrade = (subId: string) => {
    const raw = scores[subId];
    const num = Number(raw?.replace(/[^\d.]/g, ""));
    if (raw === undefined || raw === "" || isNaN(num)) {
      toast({ title: "نمره وارد نشده", description: `نمره بین ۰ تا ${a.max} وارد کنید.`, variant: "destructive" });
      return;
    }
    gradeSubmission(subId, { score: num, feedback: feedbacks[subId] || undefined });
    toast({ title: "نمره ثبت شد ✓", description: "نمره و بازخورد در پنل دانشجو نمایش داده می‌شود." });
  };

  return (
    <div>
      <PageHeader
        crumbs={[{ label: "پنل استاد", href: "/teacher" }, { label: "تکالیف", href: "/teacher/assignments" }, { label: a.title }]}
        title={a.title}
        desc={`دوره: ${course?.title ?? "—"} — مهلت: ${a.due} — نمره کل: ${fa(a.max)}`}
        actions={
          course && (
            <Link href={`/teacher/classes/${course.id}`}>
              <Button variant="outline" className="border-hairline text-ink h-10">
                <BookOpenCheck className="size-4 me-1.5" /> صفحه کلاس
              </Button>
            </Link>
          )
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <StatCard icon={Users} label="دانشجویان کلاس" value={`${faNum(roster.length)} نفر`} />
        <StatCard icon={CheckCircle2} label="تحویل‌شده" value={`${faNum(subs.length)} پاسخ`} tint="green" />
        <StatCard icon={Clock} label="در انتظار نمره" value={`${faNum(pending.length)} پاسخ`} tint="red" />
        <StatCard icon={Star} label="میانگین نمرات" value={graded.length ? fa(avg.toFixed(1)) : "—"} tint="yellow" />
      </div>

      <div className="rd-inside rounded-[8px] border border-hairline-soft bg-white p-6 mb-6">
        <h3 className="font-bold text-ink text-sm mb-2">شرح تکلیف</h3>
        <p className="text-sm text-ink leading-7">{a.desc}</p>
        <p className="mt-3 text-[11px] text-ink-soft">
          ایجاد توسط: {a.createdByRole === "admin" ? <Badge className="bg-ink-strong text-white hover:bg-ink-strong">مدیریت</Badge> : a.createdByName}
          {a.createdByRole === "admin" && <span className="ms-1">(تخصیص از پنل مدیریت)</span>}
        </p>
      </div>

      {/* تمرین‌ها و ویدئوها — آپلود توسط استاد، نمایش برای همه */}
      <AssignmentMaterialsSection assignmentId={a.id} role="teacher" />

      <h3 className="font-bold text-ink mb-3 flex items-center gap-2"><FileText className="size-4 text-ink" /> پاسخ‌ها و نمره‌دهی</h3>
      {subs.length === 0 ? (
        <EmptyState title="هنوز پاسخی تحویل نشده" desc="پاسخ‌های دانشجویان این کلاس به‌محض ثبت، اینجا نمایش داده می‌شود." />
      ) : (
        <div className="rd-inside rounded-[8px] border border-hairline-soft bg-white overflow-hidden overflow-x-auto">
          <table className="w-full min-w-[860px] text-sm">
            <thead>
              <tr className="bg-canvas-soft text-ink-soft text-xs border-b border-hairline-soft">
                <th className="text-start p-4 font-semibold">دانشجو</th>
                <th className="text-start p-4 font-semibold">پاسخ</th>
                <th className="text-start p-4 font-semibold">زمان</th>
                <th className="text-start p-4 font-semibold">وضعیت</th>
                <th className="text-start p-4 font-semibold">نمره (از {fa(a.max)})</th>
                <th className="text-start p-4 font-semibold">بازخورد</th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {subs.map((s, i) => {
                const st = students.find((x) => x.id === s.studentId);
                return (
                  <tr key={s.id} className={i % 2 ? "bg-canvas-soft/50" : ""}>
                    <td className="p-4">
                      <button onClick={() => navigate(`/teacher/students/${s.studentId}`)} className="flex items-center gap-2.5 text-start hover:underline">
                        <span className="grid size-9 place-items-center rounded-full bg-canvas-soft text-ink text-xs font-black-fa">{st?.name[0] ?? "؟"}</span>
                        <span className="font-bold text-ink">{st?.name ?? "—"}</span>
                      </button>
                    </td>
                    <td className="p-4">
                      {s.file ? (
                        <span className="flex items-center gap-1 text-info text-xs"><FileText className="size-4" /> {s.file}</span>
                      ) : (
                        <span className="text-xs text-ink-soft line-clamp-2 max-w-48">{s.text}</span>
                      )}
                      <StudentMaterialsCell assignmentId={a.id} studentId={s.studentId} />
                    </td>
                    <td className="p-4 text-xs text-ink-soft">{s.submittedAt}{s.late && <Badge className="bg-bad/10 text-bad hover:bg-bad/10 ms-1.5">دیرکرد</Badge>}</td>
                    <td className="p-4"><StatusBadge status={s.status} /></td>
                    <td className="p-4">
                      {s.status === "نمره‌داده‌شده" ? (
                        <span className="font-black-fa text-ink">{fa(String(s.score))} <span className="text-xs font-normal text-ink-soft">/ {fa(a.max)}</span></span>
                      ) : (
                        <Input
                          dir="ltr" inputMode="decimal"
                          className="w-20 h-9 text-center font-bold"
                          value={scores[s.id] ?? ""}
                          onChange={(e) => setScores((sc) => ({ ...sc, [s.id]: e.target.value.replace(/[^\d.]/g, "").slice(0, 4) }))}
                          placeholder="0-10"
                          aria-label={`نمره ${st?.name}`}
                        />
                      )}
                    </td>
                    <td className="p-4">
                      {s.status === "نمره‌داده‌شده" ? (
                        <span className="text-xs text-ink-soft line-clamp-2 max-w-48">{s.feedback ?? "—"}</span>
                      ) : (
                        <Textarea className="min-h-9 h-9 py-1.5 text-xs max-w-48" placeholder="بازخورد کوتاه…" value={feedbacks[s.id] ?? ""} onChange={(e) => setFeedbacks((f) => ({ ...f, [s.id]: e.target.value }))} aria-label={`بازخورد ${st?.name}`} />
                      )}
                    </td>
                    <td className="p-4">
                      {s.status === "نمره‌داده‌شده" ? (
                        <Badge className="bg-ok/10 text-ok hover:bg-ok/10"><CheckCircle2 className="size-3.5 me-1" /> ثبت شد</Badge>
                      ) : (
                        <Button size="sm" className="bg-navy-deep text-white hover:bg-navy-700" onClick={() => doGrade(s.id)}>ثبت نمره</Button>
                      )}
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

/* ========================== تعریف تکلیف جدید (استاد) ========================== */

export function TeacherAssignmentNew() {
  const { navigate } = useRouter();
  const { toast } = useToast();
  const { addAssignment } = useStore();
  const myCourses = useMyCourses();
  const [courseId, setCourseId] = React.useState(myCourses[0]?.id ?? "");
  const [title, setTitle] = React.useState("");
  const [desc, setDesc] = React.useState("");
  const [due, setDue] = React.useState("");
  const [max, setMax] = React.useState("10");
  const me = useStore((s) => s.teachers.find((t) => t.id === CURRENT_TEACHER_ID));

  const save = () => {
    if (!courseId || !title.trim()) {
      toast({ title: "تکمیل لازم است", description: "کلاس و عنوان تکلیف الزامی است.", variant: "destructive" });
      return;
    }
    const id = addAssignment({
      courseId,
      title: title.trim(),
      desc: desc.trim() || "شرح تکلیف در کلاس اعلام می‌شود.",
      due: due.trim() || "به‌زودی",
      max: Number(max.replace(/[^\d.]/g, "")) || 10,
      createdByRole: "teacher",
      createdByName: me?.name ?? "استاد",
    });
    toast({ title: "تکلیف ایجاد شد ✓", description: "دانشجویان کلاس اعلان را دریافت می‌کنند و در پنل مدیریت هم قابل مشاهده است." });
    navigate(`/teacher/assignments/${id}`);
  };

  return (
    <div className="max-w-2xl">
      <PageHeader
        crumbs={[{ label: "پنل استاد", href: "/teacher" }, { label: "تکالیف", href: "/teacher/assignments" }, { label: "تکلیف جدید" }]}
        title="تعریف تکلیف جدید"
        desc="تکلیف برای کلاس‌های تخصیص‌یافته شما ساخته می‌شود."
      />
      <div className="rd-inside rounded-[8px] border border-hairline-soft bg-white p-6 space-y-5">
        <div>
          <Label>کلاس *</Label>
          <select
            value={courseId}
            onChange={(e) => setCourseId(e.target.value)}
            className="mt-1.5 h-11 w-full rounded-[8px] border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ink"
            aria-label="انتخاب کلاس"
          >
            {myCourses.map((c) => (
              <option key={c.id} value={c.id}>{c.title} — {faNum(c.studentIds.length)} دانشجو</option>
            ))}
          </select>
        </div>
        <div>
          <Label>عنوان تکلیف *</Label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1.5 h-11" placeholder="مثلاً نگارش مقدمه Task 2" />
        </div>
        <div>
          <Label>توضیحات</Label>
          <Textarea value={desc} onChange={(e) => setDesc(e.target.value)} className="mt-1.5 min-h-28" placeholder="توضیح تکلیف و انتظارات…" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>مهلت تحویل</Label>
            <Input value={due} onChange={(e) => setDue(e.target.value)} className="mt-1.5 h-11" placeholder="۱۴۰۴/۰۸/۱۵" />
          </div>
          <div>
            <Label>نمره کل</Label>
            <Input value={max} onChange={(e) => setMax(e.target.value)} dir="ltr" inputMode="numeric" className="mt-1.5 h-11" />
          </div>
        </div>
        <div className="flex gap-2 pt-2">
          <Button className="flex-1 h-11 bg-rd-deep text-primary-foreground hover:bg-navy-700 font-bold" onClick={save}>
            <Send className="size-4 me-1.5" /> ایجاد و اعلان به دانشجویان
          </Button>
          <Button variant="outline" className="h-11 border-hairline text-ink" onClick={() => navigate("/teacher/assignments")}>انصراف</Button>
        </div>
      </div>
    </div>
  );
}

/* ========================== پروفایل تحصیلی دانشجو ========================== */

export function TeacherStudentProfile({ id }: { id?: string }) {
  const { navigate } = useRouter();
  const { students, courses, submissions, assignments } = useStore();
  const s = students.find((x) => x.id === id);

  if (!s) {
    return (
      <div>
        <PageHeader crumbs={[{ label: "پنل استاد", href: "/teacher" }, { label: "دانشجویان", href: "/teacher/students" }, { label: "یافت نشد" }]} title="دانشجو یافت نشد" />
        <EmptyState title="این دانشجو وجود ندارد" desc="ممکن است حذف شده باشد." action={<Button className="bg-navy-deep text-white hover:bg-navy-700" onClick={() => navigate("/teacher/students")}>بازگشت به لیست</Button>} />
      </div>
    );
  }

  const sharedCourses = courses.filter((c) => c.teacherId === CURRENT_TEACHER_ID && s.courseIds.includes(c.id));
  const mySubs = submissions.filter((x) => x.studentId === s.id);

  return (
    <div>
      <PageHeader
        crumbs={[{ label: "پنل استاد", href: "/teacher" }, { label: "دانشجویان", href: "/teacher/students" }, { label: s.name }]}
        title={`پروفایل تحصیلی ${s.name}`}
        desc="اطلاعات مالی این صفحه نمایش داده نمی‌شود."
      />

      <div className="rd-inside rounded-[8px] border border-hairline-soft bg-white p-6 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <span className="grid size-16 place-items-center rounded-[8px] bg-canvas-soft text-ink rd-inside text-2xl font-black-fa">{s.name[0]}</span>
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-black-fa text-ink">{s.name}</h3>
            <div className="mt-1.5 flex flex-wrap gap-x-5 gap-y-1 text-xs text-ink-soft">
              <span className="flex items-center gap-1" dir="ltr"><PhoneCall className="size-3.5" /> {s.phone}</span>
              <span className="flex items-center gap-1"><CalendarDays className="size-3.5" /> عضویت: {s.joinedAt}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3 mb-6">
        <StatCard icon={BookOpenCheck} label="کلاس‌های مشترک با شما" value={`${faNum(sharedCourses.length)} کلاس`} />
        <StatCard icon={TrendingUp} label="درصد حضور" value={s.attendance ? `${fa(s.attendance)}٪` : "—"} tint="yellow" />
        <StatCard icon={Star} label="میانگین نمره" value={s.avg ? fa(s.avg.toFixed(1)) : "—"} tint="green" />
      </div>

      {/* کلاس‌های مشترک */}
      <div className="grid gap-4 md:grid-cols-2 mb-6">
        {sharedCourses.map((c) => {
          const rows = gradesData[c.id] ?? [];
          return (
            <div key={c.id} className="rd-inside rounded-[8px] border border-hairline-soft bg-white p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="font-bold text-ink text-sm">{c.title}</p>
                <Link href={`/teacher/classes/${c.id}`} className="text-[11px] font-bold text-ink">صفحه کلاس</Link>
              </div>
              {rows.length === 0 ? (
                <p className="text-xs text-ink-soft">هنوز کارنامه‌ای برای این دوره ثبت نشده است.</p>
              ) : (
                <div className="space-y-2">
                  {rows.map((g) => (
                    <div key={g.item} className="flex items-center justify-between rounded-[8px] bg-canvas-soft px-3.5 py-2 text-xs">
                      <span className="font-bold text-ink">{g.item}</span>
                      <span className="font-black-fa text-ink">{fa(String(g.score))}<span className="text-ink-soft font-normal"> / {fa(String(g.max))}</span></span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
        {sharedCourses.length === 0 && <EmptyState title="کلاس مشترکی ندارید" desc="این دانشجو در کلاس‌های فعال شما نیست." />}
      </div>

      {/* پاسخ‌های تکالیف */}
      <h3 className="font-bold text-ink mb-3 flex items-center gap-2"><ClipboardList className="size-4 text-ink" /> پاسخ‌های تکالیف ({faNum(mySubs.length)})</h3>
      {mySubs.length === 0 ? (
        <EmptyState title="پاسخی ثبت نشده" />
      ) : (
        <div className="space-y-3">
          {mySubs.map((sub) => {
            const a = assignments.find((x) => x.id === sub.assignmentId);
            return (
              <button key={sub.id} onClick={() => navigate(`/teacher/assignments/${sub.assignmentId}`)} className="w-full text-start rd-inside rounded-[8px] border border-hairline-soft bg-white p-4 hover:border-navy-deep transition-colors flex flex-wrap items-center gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-[8px] bg-canvas-soft text-ink"><FileText className="size-5" /></span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-bold text-ink truncate">{a?.title ?? "—"}</span>
                  <span className="block text-[11px] text-ink-soft">تحویل: {sub.submittedAt}</span>
                </span>
                {sub.status === "نمره‌داده‌شده" ? (
                  <Badge className="bg-ok/10 text-ok hover:bg-ok/10">نمره {fa(String(sub.score))}</Badge>
                ) : (
                  <StatusBadge status="در انتظار بررسی" />
                )}
                <ArrowLeft className="size-4 text-ink-soft" />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ============================== جزئیات کلاس ============================== */

export function TeacherClassDetail({ id }: { id?: string }) {
  const { navigate } = useRouter();
  const { courses, students, assignments, submissions } = useStore();
  const c = courses.find((x) => x.id === id);

  if (!c) {
    return (
      <div>
        <PageHeader crumbs={[{ label: "پنل استاد", href: "/teacher" }, { label: "کلاس‌های من", href: "/teacher/classes" }, { label: "یافت نشد" }]} title="کلاس یافت نشد" />
        <EmptyState title="این کلاس وجود ندارد" action={<Button className="bg-navy-deep text-white hover:bg-navy-700" onClick={() => navigate("/teacher/classes")}>بازگشت به کلاس‌ها</Button>} />
      </div>
    );
  }

  const roster = c.studentIds.map((sid) => students.find((s) => s.id === sid)).filter(Boolean) as typeof students;
  const courseAssignments = assignments.filter((a) => a.courseId === c.id);
  const isMine = c.teacherId === CURRENT_TEACHER_ID;

  return (
    <div>
      <PageHeader
        crumbs={[{ label: "پنل استاد", href: "/teacher" }, { label: "کلاس‌های من", href: "/teacher/classes" }, { label: c.title }]}
        title={c.title}
        desc={`${c.language} — سطح ${c.level} — ${c.type === "online" ? "آنلاین" : "حضوری"} — ${c.schedule ?? "بدون برنامه ثابت"}`}
        actions={
          <>
            {!isMine && <Badge className="bg-warn/10 text-warn hover:bg-warn/10 h-8">این کلاس توسط مدیریت به استاد دیگری تخصیص یافته</Badge>}
            <Button variant="outline" className="border-hairline text-ink h-10" onClick={() => navigate("/teacher/attendance")}>
              <UserCheck className="size-4 me-1.5" /> حضور و غیاب
            </Button>
            <Button className="bg-rd-deep text-primary-foreground hover:bg-navy-700 font-bold h-10" onClick={() => navigate("/teacher/assignments/new")}>
              <Plus className="size-4 me-1.5" /> تکلیف جدید
            </Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3 mb-6">
        <StatCard icon={Users} label="دانشجویان کلاس" value={`${faNum(roster.length)} نفر`} />
        <StatCard icon={ClipboardList} label="تکالیف این دوره" value={faNum(courseAssignments.length)} tint="yellow" />
        <StatCard icon={CheckCircle2} label="پاسخ‌های تحویل‌شده" value={faNum(submissions.filter((s) => courseAssignments.some((a) => a.id === s.assignmentId)).length)} tint="green" />
      </div>

      {/* تکالیف کلاس */}
      <h3 className="font-bold text-ink mb-3 flex items-center gap-2"><ClipboardList className="size-4 text-ink" /> تکالیف این کلاس</h3>
      {courseAssignments.length === 0 ? (
        <div className="mb-6"><EmptyState title="تکلیفی تعریف نشده" desc="برای این کلاس تکلیف جدید تعریف کنید." /></div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-3 mb-6">
          {courseAssignments.map((a) => {
            const subs = submissions.filter((s) => s.assignmentId === a.id);
            const pending = subs.filter((s) => s.status === "در انتظار بررسی").length;
            return (
              <button key={a.id} onClick={() => navigate(`/teacher/assignments/${a.id}`)} className="text-start rd-inside rounded-[8px] border border-hairline-soft bg-white p-4 hover:border-navy-deep transition-colors">
                <p className="font-bold text-ink text-xs leading-6">{a.title}</p>
                <p className="text-[11px] text-ink-soft mt-1">مهلت: {a.due}</p>
                <div className="mt-2.5">
                  <div className="flex justify-between text-[10px] mb-1">
                    <span className="text-ink-soft">{faNum(subs.length)} تحویل — {faNum(pending)} منتظر نمره</span>
                  </div>
                  <Progress value={roster.length ? (subs.length / roster.length) * 100 : 0} className="h-1.5 bg-canvas-soft [&>div]:bg-rd-accent" />
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* لیست دانشجویان */}
      <h3 className="font-bold text-ink mb-3 flex items-center gap-2"><Users className="size-4 text-ink" /> دانشجویان کلاس ({faNum(roster.length)})</h3>
      {roster.length === 0 ? (
        <EmptyState title="دانشجویی ثبت‌نام نشده" desc="مدیریت دانشجویان را از پنل مدیریت اضافه می‌کند." />
      ) : (
        <div className="rd-inside rounded-[8px] border border-hairline-soft bg-white overflow-hidden overflow-x-auto">
          <table className="w-full min-w-[680px] text-sm">
            <thead>
              <tr className="bg-canvas-soft text-ink-soft text-xs border-b border-hairline-soft">
                <th className="text-start p-4 font-semibold">دانشجو</th>
                <th className="text-start p-4 font-semibold">حضور</th>
                <th className="text-start p-4 font-semibold">میانگین نمره</th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {roster.map((s, i) => (
                <tr key={s.id} className={`hover:bg-canvas-soft/60 transition-colors ${i % 2 ? "bg-canvas-soft/50" : ""}`}>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <span className="grid size-9 place-items-center rounded-full bg-canvas-soft text-ink text-xs font-black-fa">{s.name[0]}</span>
                      <div>
                        <p className="font-bold text-ink">{s.name}</p>
                        <p className="text-[11px] text-ink-soft" dir="ltr">{s.phone}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4"><span className={`font-bold ${s.attendance >= 75 ? "text-ok" : s.attendance >= 50 ? "text-warn" : "text-bad"}`}>{fa(s.attendance)}٪</span></td>
                  <td className="p-4 font-black-fa text-ink">{s.avg ? fa(s.avg.toFixed(1)) : "—"}</td>
                  <td className="p-4 text-end">
                    <Button size="sm" variant="outline" className="h-8 border-hairline text-ink" onClick={() => navigate(`/teacher/students/${s.id}`)}>پروفایل تحصیلی</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="mt-4 text-[11px] text-ink-soft leading-6">
        برنامه این کلاس در تقویم هفتگی دانشجویان: {studentSchedule.filter((x) => x.course.includes(c.title.slice(0, 6))).map((x) => `${x.day} ${x.time}`).join("، ") || "—"}
      </p>
    </div>
  );
}
