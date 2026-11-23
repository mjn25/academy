"use client";

/* ------------------------------------------------------------------ */
/*  پنل مدیریت — بخش تکالیف: تخصیص، لیست سراسری، جزئیات و نمره‌دهی      */
/* ------------------------------------------------------------------ */

import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle as AltTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { PanelShell, PageHeader, StatCard, StatusBadge, type PanelNavItem } from "@/components/panels/shell";
import { useRouter, Link } from "@/lib/app-context";
import { fa, faNum } from "@/lib/format";
import { useStore } from "@/lib/store";
import { adminNav, ADMIN_SHELL } from "@/components/admin/admin-nav";
import { AssignmentMaterialsSection, StudentMaterialsCell } from "@/components/panels/assignment-materials";
import {
  ClipboardList, Plus, Search, Trash2, Pencil, FileText, Users, Wallet,
  ArrowLeft, CheckCircle2, Clock, Send, Info, BookOpenCheck,
} from "lucide-react";

/* ------------------------------ Navigation ------------------------------ */

const nav = adminNav;

export function AdminAssignmentsPanel({ mode, id }: { mode: "list" | "new" | "detail"; id?: string }) {
  const titles = { list: "مدیریت تکالیف", new: "تخصیص تکلیف جدید", detail: "جزئیات تکلیف" };
  return (
    <PanelShell title={titles[mode]} nav={nav} active="assignments" roleLabel={ADMIN_SHELL.roleLabel} userName={ADMIN_SHELL.userName}>
      {mode === "list" && <AdminAssignmentsList />}
      {mode === "new" && <AdminAssignmentNew />}
      {mode === "detail" && <AdminAssignmentDetail id={id} />}
    </PanelShell>
  );
}

/* ------------------------------ لیست تکالیف ------------------------------ */

export function AdminAssignmentsList() {
  const { navigate } = useRouter();
  const { toast } = useToast();
  const { assignments, courses, teachers, submissions, deleteAssignment } = useStore();
  const [q, setQ] = React.useState("");
  const [courseFilter, setCourseFilter] = React.useState("all");

  const shown = assignments.filter((a) => {
    const okQ = !q || a.title.includes(q);
    const okC = courseFilter === "all" || a.courseId === courseFilter;
    return okQ && okC;
  });

  return (
    <div>
      <PageHeader
        crumbs={[{ label: "پنل مدیریت", href: "/admin" }, { label: "تکالیف" }]}
        title="مدیریت تکالیف"
        desc="تکالیف هر سه پنل اینجا یکجا دیده می‌شود — مدیر می‌تواند برای هر کلاسی تکلیف تخصیص دهد."
        actions={
          <Button className="bg-rd-deep text-primary-foreground hover:bg-navy-700 font-bold h-11" onClick={() => navigate("/admin/assignments/new")}>
            <Plus className="size-4 me-1.5" /> تخصیص تکلیف جدید
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3 mb-6">
        <StatCard icon={FileText} label="کل تکالیف" value={faNum(assignments.length)} />
        <StatCard icon={CheckCircle2} label="پاسخ‌های تحویل‌شده" value={`${faNum(submissions.length)} پاسخ`} tint="yellow" />
        <StatCard icon={Clock} label="در انتظار بررسی" value={`${faNum(submissions.filter((s) => s.status === "در انتظار بررسی").length)} پاسخ`} tint="red" />
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-52 max-w-sm">
          <Search className="size-4 absolute end-3 top-1/2 -translate-y-1/2 text-ink-soft" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="جستجوی عنوان تکلیف…" className="h-11 pe-9" />
        </div>
        <Select value={courseFilter} onValueChange={setCourseFilter}>
          <SelectTrigger className="h-11 w-56"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">همه دوره‌ها</SelectItem>
            {courses.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {shown.length === 0 ? (
        <EmptyState title="تکلیفی پیدا نشد" desc="فیلترها را تغییر دهید یا تکلیف جدیدی تخصیص دهید." action={
          <Button className="bg-rd-deep text-primary-foreground hover:bg-navy-700 font-bold" onClick={() => navigate("/admin/assignments/new")}>
            <Plus className="size-4 me-1.5" /> تخصیص تکلیف جدید
          </Button>
        } />
      ) : (
        <div className="rd-inside rounded-[8px] border border-hairline-soft bg-white overflow-hidden overflow-x-auto">
          <table className="w-full min-w-[880px] text-sm">
            <thead>
              <tr className="bg-canvas-soft text-ink-soft text-xs border-b border-hairline-soft">
                <th className="text-start p-4 font-semibold">تکلیف</th>
                <th className="text-start p-4 font-semibold">دوره</th>
                <th className="text-start p-4 font-semibold">استاد</th>
                <th className="text-start p-4 font-semibold">مهلت</th>
                <th className="text-start p-4 font-semibold">تحویل‌ها</th>
                <th className="text-start p-4 font-semibold">ایجاد توسط</th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {shown.map((a, i) => {
                const course = courses.find((c) => c.id === a.courseId);
                const teacher = course?.teacherId ? teachers.find((t) => t.id === course.teacherId)?.name ?? null : null;
                const subs = submissions.filter((s) => s.assignmentId === a.id);
                const total = course?.studentIds.length ?? 0;
                return (
                  <tr
                    key={a.id}
                    className={`cursor-pointer transition-colors hover:bg-canvas-soft/60 ${i % 2 ? "bg-canvas-soft/50" : ""}`}
                    onClick={() => navigate(`/admin/assignments/${a.id}`)}
                  >
                    <td className="p-4">
                      <p className="font-bold text-ink">{a.title}</p>
                      <p className="text-[11px] text-ink-soft mt-0.5 line-clamp-1 max-w-64">{a.desc}</p>
                    </td>
                    <td className="p-4 text-ink">{course?.title ?? "—"}</td>
                    <td className="p-4 text-ink-soft">{teacher ?? "—"}</td>
                    <td className="p-4 font-bold text-ink">{a.due}</td>
                    <td className="p-4">
                      <span className="font-bold text-ink">{faNum(subs.length)}</span>
                      <span className="text-ink-soft text-xs"> / {faNum(total)}</span>
                    </td>
                    <td className="p-4">
                      <Badge className={a.createdByRole === "admin" ? "bg-ink-strong text-white hover:bg-ink-strong" : "bg-canvas-soft text-ink hover:bg-canvas-soft"}>
                        {a.createdByRole === "admin" ? "مدیریت" : a.createdByName}
                      </Badge>
                    </td>
                    <td className="p-4" onClick={(e) => e.stopPropagation()}>
                      <div className="flex gap-1.5 justify-end">
                        <Button size="sm" variant="outline" className="h-8 border-hairline text-ink" onClick={() => navigate(`/admin/assignments/${a.id}`)}>
                          مشاهده
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="outline" className="h-8 border-bad/30 text-bad hover:bg-bad/10" aria-label={`حذف ${a.title}`}>
                              <Trash2 className="size-3.5" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AltTitle className="font-black-fa text-ink">حذف تکلیف</AltTitle>
                              <AlertDialogDescription>
                                «{a.title}» و همه پاسخ‌های آن حذف می‌شود. این عمل قابل بازگشت نیست.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>انصراف</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-bad text-white hover:bg-bad/90"
                                onClick={() => {
                                  deleteAssignment(a.id);
                                  toast({ title: "تکلیف حذف شد ✓", description: "لیست تکالیف به‌روزرسانی شد." });
                                }}
                              >
                                حذف قطعی
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
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

/* --------------------------- حالت خالی مشترک ----------------------------- */

export function EmptyState({ title, desc, action }: { title: string; desc?: string; action?: React.ReactNode }) {
  return (
    <div className="rounded-[8px] border border-dashed border-hairline-soft bg-white p-10 text-center">
      <span className="mx-auto grid size-14 place-items-center rounded-[8px] bg-canvas-soft text-ink-soft"><Search className="size-6" /></span>
      <p className="mt-4 font-bold text-ink">{title}</p>
      {desc && <p className="mt-1 text-sm text-ink-soft">{desc}</p>}
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  );
}

/* --------------------------- تخصیص تکلیف جدید ---------------------------- */

export function AdminAssignmentNew({ preCourse }: { preCourse?: string }) {
  const { navigate } = useRouter();
  const { toast } = useToast();
  const { courses, teachers, addAssignment } = useStore();
  const [courseId, setCourseId] = React.useState(preCourse ?? "");
  const [title, setTitle] = React.useState("");
  const [desc, setDesc] = React.useState("");
  const [due, setDue] = React.useState("");
  const [max, setMax] = React.useState("10");

  // پشتیبانی از ?course=<id> هنگام تخصیص تکلیف از صفحه یک دوره خاص
  React.useEffect(() => {
    if (!preCourse && !courseId) {
      try {
        const q = new URLSearchParams(window.location.search).get("course");
        if (q) setCourseId(q);
      } catch {}
    }
  }, []);

  const selCourse = courses.find((c) => c.id === courseId);
  const teacher = selCourse?.teacherId ? teachers.find((t) => t.id === selCourse.teacherId)?.name : null;

  const save = () => {
    if (!courseId || !title.trim()) {
      toast({ title: "تکمیل لازم است", description: "دوره و عنوان تکلیف را انتخاب/وارد کنید.", variant: "destructive" });
      return;
    }
    const numMax = Number(max.replace(/[^\d.]/g, "")) || 10;
    const id = addAssignment({
      courseId,
      title: title.trim(),
      desc: desc.trim() || "توضیح تکمیلی از سوی مدرس اعلام می‌شود.",
      due: due.trim() || "به‌زودی",
      max: numMax,
      createdByRole: "admin",
      createdByName: "المیرا معرفت‌پور",
    });
    toast({ title: "تکلیف تخصیص داده شد ✓", description: "بلافاصله در پنل استاد و پنل دانشجویان آن کلاس نمایش داده می‌شود." });
    navigate(`/admin/assignments/${id}`);
  };

  return (
    <div className="max-w-2xl">
      <PageHeader
        crumbs={[{ label: "پنل مدیریت", href: "/admin" }, { label: "تکالیف", href: "/admin/assignments" }, { label: "تخصیص تکلیف جدید" }]}
        title="تخصیص تکلیف جدید"
        desc="تکلیف را به هر دوره‌ای که می‌خواهید تخصیص دهید — حتی بدون استاد."
      />

      <div className="rounded-[8px] border border-info/30 bg-info/5 p-4 text-xs leading-6 text-ink flex items-start gap-2 mb-5">
        <Info className="size-4 text-info shrink-0 mt-0.5" />
        پس از ایجاد، تکلیف بلافاصله در «پنل استاد» (بخش نمره‌دهی) و «پنل دانشجویان همان کلاس» (بخش تکالیف) ظاهر می‌شود و اعلان ارسال می‌گردد.
      </div>

      <div className="rd-inside rounded-[8px] border border-hairline-soft bg-white p-6 space-y-5">
        <div>
          <Label>دوره / کلاس *</Label>
          <Select value={courseId} onValueChange={setCourseId}>
            <SelectTrigger className="mt-1.5 h-11"><SelectValue placeholder="انتخاب دوره…" /></SelectTrigger>
            <SelectContent>
              {courses.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {courseId && (
            <p className="mt-2 text-[11px] text-ink-soft">استاد دوره: <b className="text-ink">{teacher ?? "بدون استاد — تکلیف مستقیماً به دانشجویان می‌رسد"}</b></p>
          )}
        </div>
        <div>
          <Label>عنوان تکلیف *</Label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1.5 h-11" placeholder="مثلاً نگارش مقدمه Task 2" />
        </div>
        <div>
          <Label>توضیحات</Label>
          <Textarea value={desc} onChange={(e) => setDesc(e.target.value)} className="mt-1.5 min-h-28" placeholder="شرح تکلیف، منابع موردنیاز و معیارهای تصحیح…" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>مهلت تحویل</Label>
            <Input value={due} onChange={(e) => setDue(e.target.value)} className="mt-1.5 h-11" placeholder="۱۴۰۴/۰۸/۱۵" />
          </div>
          <div>
            <Label>نمره کل</Label>
            <Input value={max} onChange={(e) => setMax(e.target.value)} className="mt-1.5 h-11" inputMode="numeric" />
          </div>
        </div>
        <div className="flex gap-2 pt-2">
          <Button className="flex-1 h-11 bg-rd-deep text-primary-foreground hover:bg-navy-700 font-bold" onClick={save}>
            <Send className="size-4 me-1.5" /> ایجاد و اعلان به کلاس
          </Button>
          <Button variant="outline" className="h-11 border-hairline text-ink" onClick={() => navigate("/admin/assignments")}>انصراف</Button>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------- جزئیات تکلیف ------------------------------ */

export function AdminAssignmentDetail({ id }: { id?: string }) {
  const { navigate } = useRouter();
  const { toast } = useToast();
  const { assignments, courses, teachers, students, submissions, gradeSubmission, updateAssignment, deleteAssignment } = useStore();
  const a = assignments.find((x) => x.id === id);

  const [editOpen, setEditOpen] = React.useState(false);
  const [scores, setScores] = React.useState<Record<string, string>>({});
  const [feedbacks, setFeedbacks] = React.useState<Record<string, string>>({});

  if (!a) {
    return (
      <div>
        <PageHeader crumbs={[{ label: "پنل مدیریت", href: "/admin" }, { label: "تکالیف", href: "/admin/assignments" }, { label: "یافت نشد" }]} title="تکلیف یافت نشد" />
        <EmptyState title="این تکلیف وجود ندارد" desc="ممکن است حذف شده باشد." action={
          <Button className="bg-navy-deep text-white hover:bg-navy-700" onClick={() => navigate("/admin/assignments")}>بازگشت به لیست تکالیف</Button>
        } />
      </div>
    );
  }

  const course = courses.find((c) => c.id === a.courseId);
  const teacher = teachers.find((t) => t.id === course?.teacherId);
  const subs = submissions.filter((s) => s.assignmentId === a.id);
  const totalStudents = course?.studentIds.length ?? 0;
  const graded = subs.filter((s) => s.status === "نمره‌داده‌شده");
  const avg = graded.length ? graded.reduce((sum, s) => sum + (s.score ?? 0), 0) / graded.length : 0;

  const doGrade = (subId: string) => {
    const raw = scores[subId];
    const num = Number(raw?.replace(/[^\d.]/g, ""));
    if (raw === undefined || raw === "" || isNaN(num)) {
      toast({ title: "نمره وارد نشده", description: "ابتدا نمره بین ۰ تا نمره کل را وارد کنید.", variant: "destructive" });
      return;
    }
    gradeSubmission(subId, { score: num, feedback: feedbacks[subId] || undefined, byName: "المیرا معرفت‌پور", byRole: "admin" });
    toast({ title: "نمره ثبت شد ✓", description: "نمره در پنل دانشجو و کارنامه او نمایش داده می‌شود." });
  };

  return (
    <div>
      <PageHeader
        crumbs={[{ label: "پنل مدیریت", href: "/admin" }, { label: "تکالیف", href: "/admin/assignments" }, { label: a.title }]}
        title={a.title}
        desc={`دوره: ${course?.title ?? "—"} — ایجاد توسط: ${a.createdByRole === "admin" ? "مدیریت" : a.createdByName}`}
        actions={
          <>
            <Button variant="outline" className="border-hairline text-ink h-10" onClick={() => setEditOpen(true)}>
              <Pencil className="size-4 me-1.5" /> ویرایش تکلیف
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="border-bad/30 text-bad hover:bg-bad/10 h-10">
                  <Trash2 className="size-4 me-1.5" /> حذف
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AltTitle className="font-black-fa text-ink">حذف تکلیف</AltTitle>
                  <AlertDialogDescription>«{a.title}» و همه {faNum(subs.length)} پاسخ آن حذف می‌شود.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>انصراف</AlertDialogCancel>
                  <AlertDialogAction className="bg-bad text-white hover:bg-bad/90" onClick={() => { deleteAssignment(a.id); toast({ title: "تکلیف حذف شد ✓" }); navigate("/admin/assignments"); }}>
                    حذف قطعی
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>
        }
      />

      {/* اطلاعات کلی */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <StatCard icon={CheckCircle2} label="تحویل‌شده" value={`${faNum(subs.length)} از ${faNum(totalStudents)}`} tint="green" />
        <StatCard icon={Clock} label="در انتظار بررسی" value={`${faNum(subs.filter((s) => s.status === "در انتظار بررسی").length)} پاسخ`} tint="yellow" />
        <StatCard icon={ClipboardList} label="میانگین نمرات" value={graded.length ? fa(avg.toFixed(1)) : "—"} />
        <StatCard icon={Wallet} label="نمره کل" value={fa(a.max)} />
      </div>

      <div className="rd-inside rounded-[8px] border border-hairline-soft bg-white p-6 mb-6">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <h3 className="font-bold text-ink text-sm">شرح تکلیف</h3>
          <Badge className="bg-canvas-soft text-ink hover:bg-canvas-soft">مهلت: {a.due}</Badge>
          {course && (
            <Link href={`/admin/classes/${course.id}`} className="text-[11px] font-bold text-ink hover:underline">
              صفحه دوره <ArrowLeft className="size-3 inline" />
            </Link>
          )}
          {teacher && (
            <Link href={`/admin/teachers/${teacher.id}`} className="text-[11px] font-bold text-ink hover:underline">
              پرونده استاد: {teacher.name} <ArrowLeft className="size-3 inline" />
            </Link>
          )}
        </div>
        <p className="text-sm text-ink leading-7">{a.desc}</p>
        {totalStudents > 0 && (
          <div className="mt-4 max-w-xs">
            <div className="flex justify-between text-[11px] mb-1">
              <span className="text-ink-soft">نرخ تحویل</span>
              <span className="font-bold text-ink">{faNum(subs.length)}/{faNum(totalStudents)}</span>
            </div>
            <Progress value={(subs.length / totalStudents) * 100} className="h-2 bg-canvas-soft [&>div]:bg-rd-accent" />
          </div>
        )}
      </div>

      {/* تمرین‌ها و ویدئوها — آپلود توسط مدیریت، نمایش برای همه */}
      <AssignmentMaterialsSection assignmentId={a.id} role="admin" />

      {/* پاسخ‌ها */}
      <h3 className="font-bold text-ink mb-3 flex items-center gap-2"><FileText className="size-4 text-ink" /> پاسخ‌های دانشجویان ({faNum(subs.length)})</h3>
      {subs.length === 0 ? (
        <EmptyState title="هنوز پاسخی تحویل نشده" desc="به‌محض تحویل، پاسخ‌ها همین‌جا و در پنل استاد نمایش داده می‌شوند." />
      ) : (
        <div className="rd-inside rounded-[8px] border border-hairline-soft bg-white overflow-hidden overflow-x-auto">
          <table className="w-full min-w-[860px] text-sm">
            <thead>
              <tr className="bg-canvas-soft text-ink-soft text-xs border-b border-hairline-soft">
                <th className="text-start p-4 font-semibold">دانشجو</th>
                <th className="text-start p-4 font-semibold">پاسخ</th>
                <th className="text-start p-4 font-semibold">زمان تحویل</th>
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
                      <button onClick={() => navigate(`/admin/students/${s.studentId}`)} className="flex items-center gap-2.5 text-start hover:underline">
                        <span className="grid size-9 place-items-center rounded-full bg-canvas-soft text-ink text-xs font-black-fa">{st?.name[0] ?? "؟"}</span>
                        <span>
                          <span className="block font-bold text-ink">{st?.name ?? "—"}</span>
                          <span className="block text-[11px] text-ink-soft" dir="ltr">{st?.phone}</span>
                        </span>
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
                    <td className="p-4"><StatusBadge status={s.status === "نمره‌داده‌شده" ? "نمره‌داده‌شده" : "در انتظار بررسی"} /></td>
                    <td className="p-4">
                      {s.status === "نمره‌داده‌شده" ? (
                        <span className="font-black-fa text-ink">{fa(String(s.score))} <span className="text-ink-soft text-xs font-normal">/ {fa(a.max)}</span></span>
                      ) : (
                        <Input
                          dir="ltr"
                          inputMode="decimal"
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
                        <Button size="sm" className="bg-navy-deep text-white hover:bg-navy-700" onClick={() => doGrade(s.id)}>ثبت</Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ویرایش تکلیف */}
      <EditAssignmentDialog open={editOpen} onOpenChange={setEditOpen} assignment={a} onSave={(patch) => { updateAssignment(a.id, patch); toast({ title: "تکلیف ویرایش شد ✓", description: "تغییرات در هر سه پنل اعمال شد." }); }} />
    </div>
  );
}

function EditAssignmentDialog({ open, onOpenChange, assignment, onSave }: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  assignment: { title: string; desc: string; due: string; max: number };
  onSave: (patch: { title: string; desc: string; due: string; max: number }) => void;
}) {
  const [title, setTitle] = React.useState(assignment.title);
  const [desc, setDesc] = React.useState(assignment.desc);
  const [due, setDue] = React.useState(assignment.due);
  const [max, setMax] = React.useState(String(assignment.max));

  React.useEffect(() => {
    if (open) {
      setTitle(assignment.title);
      setDesc(assignment.desc);
      setDue(assignment.due);
      setMax(String(assignment.max));
    }
  }, [open, assignment]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-black-fa text-ink">ویرایش تکلیف</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>عنوان</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1.5 h-10" />
          </div>
          <div>
            <Label>توضیحات</Label>
            <Textarea value={desc} onChange={(e) => setDesc(e.target.value)} className="mt-1.5 min-h-24" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>مهلت</Label>
              <Input value={due} onChange={(e) => setDue(e.target.value)} className="mt-1.5 h-10" />
            </div>
            <div>
              <Label>نمره کل</Label>
              <Input value={max} onChange={(e) => setMax(e.target.value)} className="mt-1.5 h-10" inputMode="numeric" />
            </div>
          </div>
          <Button
            className="w-full h-11 bg-rd-deep text-primary-foreground hover:bg-navy-700 font-bold"
            onClick={() => {
              onSave({ title: title.trim() || assignment.title, desc, due, max: Number(max) || assignment.max });
              onOpenChange(false);
            }}
          >
            ذخیره تغییرات
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
