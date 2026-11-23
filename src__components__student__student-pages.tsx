"use client";

/* ------------------------------------------------------------------ */
/*  پنل دانشجو — صفحات داخلی: جزئیات تکلیف با فرم ارسال کامل و         */
/*  ویرایش پروفایل                                                   */
/* ------------------------------------------------------------------ */

import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { PanelShell, PageHeader, StatusBadge, type PanelNavItem } from "@/components/panels/shell";
import { useRouter, Link } from "@/lib/app-context";
import { fa, faNum } from "@/lib/format";
import { useStore } from "@/lib/store";
import { useCurrentStudentId } from "@/lib/current-user";
import { EmptyState } from "@/components/admin/admin-assignments";
import { AssignmentMaterialsSection } from "@/components/panels/assignment-materials";
import {
  LayoutDashboard, BookOpenCheck, CalendarDays, ClipboardList, FolderOpen, Star, TrendingUp,
  MessageSquare, ShoppingBag, UserCircle, FileText, Clock, Send, CheckCircle2, ArrowLeft,
  PhoneCall, Mail, Info, Paperclip, MapPin,
} from "lucide-react";

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

export function StudentPagesPanel({ mode, id }: { mode: string; id?: string }) {
  const currentStudentId = useCurrentStudentId();
  const me = useStore((s) => s.students.find((x) => x.id === currentStudentId));
  const titles: Record<string, string> = { assignment: "جزئیات تکلیف", "profile-edit": "ویرایش پروفایل" };
  return (
    <PanelShell title={titles[mode] ?? "پنل دانشجو"} nav={nav} active={mode === "assignment" ? "assignments" : "profile"} roleLabel="پنل دانشجو" userName={me?.name ?? "دانشجو"}>
      {mode === "assignment" && <StudentAssignmentDetail id={id} />}
      {mode === "profile-edit" && <StudentProfileEdit />}
    </PanelShell>
  );
}

/* ======================= جزئیات تکلیف + ارسال پاسخ ======================= */

export function StudentAssignmentDetail({ id }: { id?: string }) {
  const currentStudentId = useCurrentStudentId();
  const { navigate } = useRouter();
  const { toast } = useToast();
  const { assignments, courses, submissions, submitAnswer, teachers, materials } = useStore();
  const a = assignments.find((x) => x.id === id);

  const [text, setText] = React.useState("");

  if (!a) {
    return (
      <div>
        <PageHeader crumbs={[{ label: "پنل دانشجو", href: "/student" }, { label: "تکالیف", href: "/student/assignments" }, { label: "یافت نشد" }]} title="تکلیف یافت نشد" />
        <EmptyState title="این تکلیف وجود ندارد" desc="ممکن است حذف شده باشد." action={<Button className="bg-rd-deep text-white hover:bg-navy-700" onClick={() => navigate("/student/assignments")}>بازگشت به تکالیف</Button>} />
      </div>
    );
  }

  const myMaterials = materials.filter((m) => m.assignmentId === a.id && m.studentId === currentStudentId);
  const mySub = submissions.find((s) => s.assignmentId === a.id && s.studentId === currentStudentId);
  const course = courses.find((c) => c.id === a.courseId);
  const teacher = teachers.find((t) => t.id === course?.teacherId);
  const isLate = a.due.includes("گذشته");
  const canSubmit = !mySub || mySub.status !== "نمره‌داده‌شده";

  const doSubmit = () => {
    if (!text.trim() && myMaterials.length === 0) {
      toast({ title: "پاسخ خالی است", description: "متن پاسخ را بنویسید یا از بخش «تمرین‌ها و ویدئوها» تمرین/ویدئو آپلود کنید.", variant: "destructive" });
      return;
    }
    submitAnswer({
      assignmentId: a.id,
      studentId: currentStudentId,
      text: text.trim() || undefined,
      file: myMaterials.length ? `${faNum(myMaterials.length)} پیوست` : undefined,
      late: isLate,
    });
    setText("");
    toast({ title: "پاسخ ثبت و ارسال شد ✓", description: "استاد و مدیریت به‌محض ثبت، پاسخ و پیوست‌های شما را می‌بینند." });
  };

  return (
    <div>
      <PageHeader
        crumbs={[{ label: "پنل دانشجو", href: "/student" }, { label: "تکالیف", href: "/student/assignments" }, { label: a.title }]}
        title={a.title}
        desc={`${course?.title ?? "دوره"} — استاد: ${teacher?.name ?? "—"} — مهلت: ${a.due}`}
        actions={
          <Link href="/student/assignments">
            <Button variant="outline" className="border-hairline text-ink h-10">همه تکالیف</Button>
          </Link>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3 mb-6">
        {/* شرح تکلیف */}
        <div className="lg:col-span-2 rounded-[8px] rd-inside border border-hairline-soft bg-white p-6">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <h3 className="font-bold text-ink text-sm">شرح تکلیف</h3>
            {isLate ? <Badge className="bg-bad/10 text-bad hover:bg-bad/10"><Clock className="size-3 me-1" /> مهلت گذشته</Badge> : <Badge className="bg-warn/10 text-warn hover:bg-warn/10"><Clock className="size-3 me-1" /> مهلت: {a.due}</Badge>}
            <Badge className="bg-canvas-soft text-ink hover:bg-canvas-soft">نمره کل: {fa(a.max)}</Badge>
          </div>
          <p className="text-sm text-ink leading-7">{a.desc}</p>
          {teacher && (
            <Link href={`/student/class/${course?.id}`} className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-ink">
              صفحه کلاس {course?.title} <ArrowLeft className="size-3.5" />
            </Link>
          )}
        </div>

        {/* وضعیت من */}
        <div className={`rounded-[8px] border p-6 ${mySub?.status === "نمره‌داده‌شده" ? "border-ok/30 bg-ok/5" : mySub ? "border-info/30 bg-info/5" : "border-warn/30 bg-warn/5"}`}>
          <p className="font-bold text-ink text-sm mb-3">وضعیت من</p>
          {!mySub ? (
            <>
              <StatusBadge status="در انتظار بررسی" />
              <p className="mt-3 text-xs text-ink-soft leading-6">هنوز پاسخی ارسال نکرده‌اید. فرم ارسال در پایین همین صفحه آماده است.</p>
            </>
          ) : mySub.status === "نمره‌داده‌شده" ? (
            <>
              <p className="text-3xl font-black-fa text-ok">{fa(String(mySub.score))}<span className="text-base text-ink-soft"> از {fa(a.max)}</span></p>
              <p className="mt-2 text-xs leading-6 text-ink">بازخورد استاد: {mySub.feedback ?? "—"}</p>
            </>
          ) : (
            <>
              <StatusBadge status="در انتظار بررسی" />
              <p className="mt-3 text-xs text-ink-soft leading-6">پاسخ شما در {mySub.submittedAt} ثبت شده و در انتظار بررسی استاد است.</p>
              {mySub.file && <p className="mt-2 text-xs flex items-center gap-1 text-info"><FileText className="size-3.5" /> {mySub.file}</p>}
            </>
          )}
        </div>
      </div>

      {/* تمرین‌ها و ویدئوها — منابع کلاس + آپلود کار دانشجو */}
      <AssignmentMaterialsSection assignmentId={a.id} role="student" />

      {/* فرم ارسال — صفحه کامل، نه شیت */}
      {canSubmit ? (
        <div className="rounded-[8px] rd-inside border border-hairline-soft bg-white p-6">
          <h3 className="font-bold text-ink text-sm mb-1.5">{mySub ? "ویرایش و ارسال مجدد پاسخ" : "ارسال پاسخ تکلیف"}</h3>
          <p className="text-xs text-ink-soft mb-5 flex items-center gap-1.5"><Info className="size-3.5 text-info" /> تا قبل از نمره‌دهی می‌توانید پاسخ را دوباره ارسال کنید.</p>
          <div className="space-y-5">
            <div>
              <Label>پاسخ متنی</Label>
              <Textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="پاسخ‌ات را اینجا بنویس…" className="mt-1.5 min-h-36" />
            </div>
            <div>
              <Label>پیوست‌های تمرین و ویدئو</Label>
              <div className="mt-1.5 rounded-[8px] border border-hairline-soft bg-canvas-soft p-4">
                <p className="text-xs font-bold text-ink flex items-center gap-1.5">
                  <Paperclip className="size-3.5 text-ink" />
                  پیوست‌شده: {faNum(myMaterials.length)} فایل
                </p>
                <p className="mt-1.5 text-[11px] text-ink-soft leading-5">
                  برای افزودن تمرین یا ویدئو، از دو ناحیه «آپلود تمرین من» و «آپلود ویدئوی من» در بخش «تمرین‌ها و ویدئوهای تکلیف» (بالای همین صفحه) استفاده کنید؛ فایل‌ها بلافاصله به همین لیست اضافه و همراه پاسخ برای استاد ارسال می‌شوند.
                </p>
              </div>
            </div>
            <Button className="w-full h-12 bg-rd-deep text-white hover:bg-navy-700 font-bold text-base" onClick={doSubmit}>
              <Send className="size-5 me-1.5" /> {mySub ? "به‌روزرسانی و ارسال مجدد" : "ثبت و ارسال پاسخ"}
            </Button>
            {isLate && <p className="text-[11px] text-bad text-center">مهلت تحویل گذشته — پاسخ شما با نشان «دیرکرد» ثبت می‌شود.</p>}
          </div>
        </div>
      ) : (
        <div className="rounded-[8px] border border-ok/30 bg-ok/5 p-6 text-center">
          <CheckCircle2 className="size-8 text-ok mx-auto" />
          <p className="mt-2 font-bold text-ink">این تکلیف نمره‌دهی شده است</p>
          <p className="mt-1 text-sm text-ink-soft">نمره و بازخورد استاد در کارت «وضعیت من» و بخش نمرات نمایش داده می‌شود.</p>
        </div>
      )}
    </div>
  );
}

/* ============================ ویرایش پروفایل ============================ */

export function StudentProfileEdit() {
  const currentStudentId = useCurrentStudentId();
  const { navigate } = useRouter();
  const { toast } = useToast();
  const { students, updateStudent } = useStore();
  const me = students.find((x) => x.id === currentStudentId);

  const [name, setName] = React.useState(me?.name ?? "");
  const [phone, setPhone] = React.useState(me?.phone ?? "");
  const [email, setEmail] = React.useState(me?.email ?? "");

  return (
    <div className="max-w-2xl">
      <PageHeader
        crumbs={[{ label: "پنل دانشجو", href: "/student" }, { label: "پروفایل", href: "/student/profile" }, { label: "ویرایش" }]}
        title="ویرایش پروفایل"
        desc="اطلاعات حساب کاربری خود را به‌روزرسانی کنید."
      />
      <div className="rounded-[8px] rd-inside border border-hairline-soft bg-white p-4 sm:p-6 space-y-5">
        <div className="flex items-center gap-3 sm:gap-4">
          <span className="grid size-14 shrink-0 place-items-center rounded-[8px] bg-rd-deep text-white text-xl font-black-fa sm:size-16 sm:text-2xl">{(name || "س")[0]}</span>
          <div className="min-w-0 flex-1">
            <p className="break-words font-black-fa text-ink">{name || "—"}</p>
            <p className="text-xs text-ink-soft mt-0.5">سطح فعلی: A1 — هدف: B1 برای کار در آلمان</p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>نام و نام خانوادگی</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} className="mt-1.5 h-11" />
          </div>
          <div>
            <Label>شماره موبایل</Label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} dir="ltr" inputMode="tel" className="mt-1.5 h-11" />
            <p className="text-[10px] text-ink mt-1">تغییر شماره با تأیید کد پیامکی انجام می‌شود.</p>
          </div>
          <div>
            <Label>ایمیل</Label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} dir="ltr" className="mt-1.5 h-11" />
          </div>
        </div>
        <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row">
          <Button
            className="flex-1 h-11 bg-rd-deep text-white hover:bg-navy-700 font-bold"
            onClick={() => {
              if (!name.trim()) {
                toast({ title: "نام را وارد کنید", variant: "destructive" });
                return;
              }
              updateStudent(currentStudentId, { name: name.trim(), phone: phone.trim(), email: email.trim() });
              toast({ title: "پروفایل به‌روزرسانی شد ✓", description: "نام جدید در پنل مدیریت هم نمایش داده می‌شود." });
              navigate("/student/profile");
            }}
          >
            <CheckCircle2 className="size-4 me-1.5" /> ذخیره تغییرات
          </Button>
          <Button variant="outline" className="h-11 border-hairline text-ink" onClick={() => navigate("/student/profile")}>انصراف</Button>
        </div>
      </div>
      <div className="mt-4 rounded-[8px] bg-canvas-soft border border-hairline-soft p-4 text-xs text-ink-soft leading-6 flex items-start gap-2">
        <PhoneCall className="size-4 shrink-0 text-ink" />
        برای تغییر شماره موبایل، کد تأیید به شماره جدید پیامک می‌شود و پس از تأیید، جایگزین می‌گردد.
        <Mail className="hidden" />
      </div>
    </div>
  );
}
