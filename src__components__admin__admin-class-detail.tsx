"use client";

/* ------------------------------------------------------------------ */
/*  پنل مدیریت — صفحه جزئیات دوره: ویرایش، استاد، لیست دانشجویان، تکالیف */
/* ------------------------------------------------------------------ */

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle as AltTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { PanelShell, PageHeader, StatCard, StatusBadge, type PanelNavItem } from "@/components/panels/shell";
import { useRouter, Link } from "@/lib/app-context";
import { fa, faNum, faPrice } from "@/lib/format";
import { useStore } from "@/lib/store";
import { adminNav, ADMIN_SHELL } from "@/components/admin/admin-nav";
import { EmptyState } from "@/components/admin/admin-assignments";
import {
  BookOpenCheck, Users, Plus, Pencil, UserPlus, UserMinus,
  ArrowLeft, GraduationCap, Wallet, CalendarDays,
} from "lucide-react";

const nav = adminNav;

export function AdminClassPanel({ id }: { id?: string }) {
  return (
    <PanelShell title="جزئیات دوره" nav={nav} active="classes" roleLabel={ADMIN_SHELL.roleLabel} userName={ADMIN_SHELL.userName}>
      <AdminClassDetail id={id} />
    </PanelShell>
  );
}

function AdminClassDetail({ id }: { id?: string }) {
  const { navigate } = useRouter();
  const { toast } = useToast();
  const { courses, teachers, students, updateCourse, setCourseTeacher, addStudentToCourse, removeStudentFromCourse } = useStore();
  const c = courses.find((x) => x.id === id);

  const [editOpen, setEditOpen] = React.useState(false);
  const [teacherOpen, setTeacherOpen] = React.useState(false);
  const [addOpen, setAddOpen] = React.useState(false);
  const [pickTeacher, setPickTeacher] = React.useState("");
  const [pickStudent, setPickStudent] = React.useState("");
  const [form, setForm] = React.useState({ title: "", price: "", capacity: "", schedule: "", status: "فعال" });

  if (!c) {
    return (
      <div>
        <PageHeader crumbs={[{ label: "پنل مدیریت", href: "/admin" }, { label: "کلاس‌ها", href: "/admin/classes" }, { label: "یافت نشد" }]} title="دوره یافت نشد" />
        <EmptyState title="این دوره وجود ندارد" desc="ممکن است حذف شده باشد." action={<Button className="bg-navy-deep text-white hover:bg-navy-700" onClick={() => navigate("/admin/classes")}>بازگشت به لیست دوره‌ها</Button>} />
      </div>
    );
  }

  const teacher = teachers.find((t) => t.id === c.teacherId);
  const roster = c.studentIds.map((sid) => students.find((s) => s.id === sid)).filter(Boolean) as typeof students;
  const hasCapacity = !c.capacity || c.studentIds.length < c.capacity;
  const notInCourse = hasCapacity ? students.filter((s) => !c.studentIds.includes(s.id)) : [];

  const openEdit = () => {
    setForm({
      title: c.title,
      price: String(c.price),
      capacity: c.capacity ? String(c.capacity) : "",
      schedule: c.schedule ?? "",
      status: c.status,
    });
    setEditOpen(true);
  };

  return (
    <div>
      <PageHeader
        crumbs={[{ label: "پنل مدیریت", href: "/admin" }, { label: "کلاس‌ها", href: "/admin/classes" }, { label: c.title }]}
        title={c.title}
        desc={`${c.language} — سطح ${c.level} — ${c.type === "online" ? "آنلاین" : "حضوری"}`}
        actions={
          <>
            <Button variant="outline" className="border-hairline text-ink h-10" onClick={openEdit}>
              <Pencil className="size-4 me-1.5" /> ویرایش دوره
            </Button>
          </>
        }
      />

      {/* آمار */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-6">
        <StatCard icon={Users} label="دانشجویان ثبت‌نامی" value={`${faNum(roster.length)} نفر`} />
        <StatCard icon={Wallet} label="شهریه دوره" value={faPrice(c.price)} />
        <StatCard icon={CalendarDays} label="جلسات" value={`${faNum(c.sessions)} جلسه`} tint="green" />
      </div>

      {/* استاد دوره */}
      <div className="rd-inside rounded-[8px] border border-hairline-soft bg-white p-5 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <span className="grid size-14 place-items-center rounded-[8px] bg-canvas-soft text-rd-accent rd-inside"><GraduationCap className="size-7" /></span>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-ink-soft mb-0.5">استاد دوره</p>
            {teacher ? (
              <>
                <p className="font-bold text-ink">{teacher.name}</p>
                <p className="text-[11px] text-ink font-semibold">{teacher.title} — امتیاز {fa(teacher.rating)} از ۵</p>
              </>
            ) : (
              <p className="font-bold text-bad text-sm">بدون استاد — دوره نمی‌تواند فعال شود</p>
            )}
          </div>
          {teacher && (
            <Button size="sm" variant="outline" className="h-9 border-hairline text-ink" onClick={() => navigate(`/admin/teachers/${teacher.id}`)}>
              پرونده استاد <ArrowLeft className="size-3.5 me-1" />
            </Button>
          )}
          <Button size="sm" className="h-9 bg-navy-deep text-white hover:bg-navy-700" onClick={() => { setPickTeacher(c.teacherId ?? ""); setTeacherOpen(true); }}>
            {teacher ? "تغییر استاد" : "تخصیص استاد"}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2 mb-6">
        {/* اطلاعات */}
        <div className="rd-inside rounded-[8px] border border-hairline-soft bg-white p-5">
          <p className="font-bold text-ink text-sm mb-3">اطلاعات دوره</p>
          <div className="space-y-2 text-xs">
            {[
              ["نوع برگزاری", c.type === "online" ? "آنلاین ویدئویی" : "حضوری"],
              ["ظرفیت", c.capacity ? `${faNum(c.enrolled)} از ${faNum(c.capacity)}` : "نامحدود (آنلاین)"],
              ["برنامه هفتگی", c.schedule ?? "بدون برنامه ثابت"],
              ["شهریه", faPrice(c.price)],
              ["وضعیت", c.status],
              ["تاریخ شروع", c.startDate ?? "—"],
            ].map(([k, v]) => (
              <div key={k} className="flex items-center justify-between rounded-[8px] bg-canvas-soft px-3.5 py-2.5">
                <span className="text-ink-soft">{k}</span>
                <span className="font-bold text-ink">{v}</span>
              </div>
            ))}
          </div>
        </div>

      {/* لیست دانشجویان */}
      <div className="rd-inside rounded-[8px] border border-hairline-soft bg-white overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 p-5 pb-3">
          <p className="font-bold text-ink text-sm flex items-center gap-2"><Users className="size-4 text-ink" /> لیست دانشجویان ({faNum(roster.length)})</p>
          <Button size="sm" disabled={!hasCapacity || notInCourse.length === 0} className="h-9 bg-navy-deep text-white hover:bg-navy-700" onClick={() => { setPickStudent(""); setAddOpen(true); }}>
            <UserPlus className="size-4 me-1" /> افزودن دانشجو به دوره
          </Button>
        </div>
        {roster.length === 0 ? (
          <div className="p-5 pt-0">
            <EmptyState title="هنوز دانشجویی ثبت‌نام نشده" desc="با دکمه بالا، دانشجویان موجود را به این دوره اضافه کنید." />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="bg-canvas-soft text-ink-soft text-xs border-b border-hairline-soft">
                  <th className="text-start p-4 font-semibold">دانشجو</th>
                  <th className="text-start p-4 font-semibold">حضور</th>
                  <th className="text-start p-4 font-semibold">میانگین</th>
                  <th className="text-start p-4 font-semibold">وضعیت</th>
                  <th className="p-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {roster.map((s, i) => (
                  <tr key={s.id} className={`hover:bg-canvas-soft/60 transition-colors ${i % 2 ? "bg-canvas-soft/50" : ""}`}>
                    <td className="p-4">
                      <button onClick={() => navigate(`/admin/students/${s.id}`)} className="flex items-center gap-3 text-start hover:underline">
                        <span className="grid size-9 place-items-center rounded-full bg-canvas-soft text-ink text-xs font-black-fa">{s.name[0]}</span>
                        <span>
                          <span className="block font-bold text-ink">{s.name}</span>
                          <span className="block text-[11px] text-ink-soft" dir="ltr">{s.phone}</span>
                        </span>
                      </button>
                    </td>
                    <td className="p-4"><span className={`font-bold ${s.attendance >= 75 ? "text-ok" : s.attendance >= 50 ? "text-warn" : "text-bad"}`}>{s.attendance ? `${fa(s.attendance)}٪` : "—"}</span></td>
                    <td className="p-4 font-black-fa text-ink">{s.avg ? fa(s.avg.toFixed(1)) : "—"}</td>
                    <td className="p-4"><StatusBadge status={s.status} /></td>
                    <td className="p-4">
                      <div className="flex gap-1.5 justify-end">
                        <Button size="sm" variant="outline" className="h-8 border-hairline text-ink" onClick={() => navigate(`/admin/students/${s.id}`)}>پرونده</Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="outline" className="h-8 border-bad/30 text-bad hover:bg-bad/10" aria-label={`حذف ${s.name} از دوره`}>
                              <UserMinus className="size-3.5" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AltTitle className="font-black-fa text-ink">حذف از دوره</AltTitle>
                              <AlertDialogDescription>«{s.name}» از دوره «{c.title}» حذف شود؟ دسترسی به تکالیف و فایل‌های این دوره را از دست می‌دهد.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>انصراف</AlertDialogCancel>
                              <AlertDialogAction className="bg-bad text-white hover:bg-bad/90" onClick={() => { removeStudentFromCourse(c.id, s.id); toast({ title: "دانشجو از دوره حذف شد ✓" }); }}>
                                حذف
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ویرایش دوره */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-black-fa text-ink">ویرایش دوره</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>عنوان دوره</Label>
              <Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} className="mt-1.5 h-10" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>شهریه (تومان)</Label>
                <Input value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} dir="ltr" inputMode="numeric" className="mt-1.5 h-10" />
              </div>
              <div>
                <Label>ظرفیت (خالی = نامحدود)</Label>
                <Input value={form.capacity} onChange={(e) => setForm((f) => ({ ...f, capacity: e.target.value }))} dir="ltr" inputMode="numeric" className="mt-1.5 h-10" />
              </div>
            </div>
            <div>
              <Label>برنامه هفتگی</Label>
              <Input value={form.schedule} onChange={(e) => setForm((f) => ({ ...f, schedule: e.target.value }))} className="mt-1.5 h-10" placeholder="شنبه و دوشنبه ۱۷:۳۰" />
            </div>
            <div>
              <Label>وضعیت</Label>
              <Select value={form.status} onValueChange={(v) => setForm((f) => ({ ...f, status: v }))}>
                <SelectTrigger className="mt-1.5 h-10"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="فعال">فعال</SelectItem>
                  <SelectItem value="پیش‌نویس">پیش‌نویس</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              className="w-full h-11 bg-rd-deep text-primary-foreground hover:bg-navy-700 font-bold"
              onClick={() => {
                const nextTitle = form.title.trim();
                const nextPrice = Number(form.price.replace(/[^\d]/g, ""));
                const nextCapacity = form.capacity ? Number(form.capacity.replace(/[^\d]/g, "")) : undefined;
                if (!nextTitle) {
                  toast({ title: "عنوان دوره الزامی است", variant: "destructive" });
                  return;
                }
                if (!Number.isFinite(nextPrice) || nextPrice < 0) {
                  toast({ title: "شهریه معتبر نیست", description: "مبلغ را به‌صورت عدد صفر یا بیشتر وارد کنید.", variant: "destructive" });
                  return;
                }
                if (form.capacity && (!Number.isInteger(nextCapacity) || (nextCapacity ?? 0) < Math.max(1, roster.length))) {
                  toast({ title: "ظرفیت معتبر نیست", description: `ظرفیت نمی‌تواند کمتر از ${faNum(roster.length)} دانشجوی ثبت‌نام‌شده باشد.`, variant: "destructive" });
                  return;
                }
                if (form.status === "فعال" && !c.teacherId) {
                  toast({ title: "ابتدا استاد دوره را مشخص کنید", description: "دوره بدون استاد نمی‌تواند فعال شود.", variant: "destructive" });
                  return;
                }
                updateCourse(c.id, {
                  title: nextTitle,
                  price: nextPrice,
                  capacity: nextCapacity,
                  schedule: form.schedule.trim() || undefined,
                  status: form.status as "فعال" | "پیش‌نویس",
                });
                setEditOpen(false);
                toast({ title: "دوره ویرایش شد ✓", description: "تغییرات در سایت و پنل استاد هم اعمال می‌شود." });
              }}
            >
              ذخیره تغییرات
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* تغییر استاد */}
      <Dialog open={teacherOpen} onOpenChange={setTeacherOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-black-fa text-ink">تخصیص استاد به دوره</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>استاد</Label>
              <Select value={pickTeacher} onValueChange={setPickTeacher}>
                <SelectTrigger className="mt-1.5 h-11"><SelectValue placeholder="انتخاب استاد…" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">بدون استاد</SelectItem>
                  {teachers.filter((t) => t.status === "فعال" || t.id === c.teacherId).map((t) => (
                    <SelectItem key={t.id} value={t.id}>{t.name} — {t.title}{t.status !== "فعال" ? " (غیرفعال)" : ""}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              className="w-full h-11 bg-rd-deep text-primary-foreground hover:bg-navy-700 font-bold"
              onClick={() => {
                const nextTeacherId = pickTeacher === "__none__" || !pickTeacher ? null : pickTeacher;
                if (nextTeacherId && teachers.find((item) => item.id === nextTeacherId)?.status !== "فعال") {
                  toast({ title: "استاد انتخاب‌شده غیرفعال است", description: "برای تخصیص جدید، یک استاد فعال انتخاب کنید.", variant: "destructive" });
                  return;
                }
                setCourseTeacher(c.id, nextTeacherId);
                setTeacherOpen(false);
                toast({ title: nextTeacherId ? "استاد تخصیص یافت ✓" : "استاد از دوره برداشته شد", description: "اطلاعات دوره و پرونده استاد هم‌زمان به‌روزرسانی شد." });
              }}
            >
              تأیید تخصیص
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* افزودن دانشجو */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-black-fa text-ink">افزودن دانشجو به دوره</DialogTitle>
          </DialogHeader>
          {notInCourse.length === 0 ? (
            <p className="text-sm text-ink-soft py-4 text-center">{hasCapacity ? "همه دانشجویان ثبت‌نامی قبلاً عضو این دوره هستند." : "ظرفیت این دوره تکمیل شده است؛ ابتدا ظرفیت دوره را افزایش دهید."}</p>
          ) : (
            <div className="space-y-4">
              <div>
                <Label>دانشجو</Label>
                <Select value={pickStudent} onValueChange={setPickStudent}>
                  <SelectTrigger className="mt-1.5 h-11"><SelectValue placeholder="انتخاب دانشجو…" /></SelectTrigger>
                  <SelectContent>
                    {notInCourse.map((s) => (
                      <SelectItem key={s.id} value={s.id}>{s.name} — <span dir="ltr">{s.phone}</span></SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                className="w-full h-11 bg-rd-deep text-primary-foreground hover:bg-navy-700 font-bold"
                disabled={!pickStudent}
                onClick={() => {
                  addStudentToCourse(c.id, pickStudent);
                  const s = students.find((x) => x.id === pickStudent);
                  setAddOpen(false); setPickStudent("");
                  toast({ title: "دانشجو اضافه شد ✓", description: `${s?.name} به دوره «${c.title}» اضافه شد؛ شهریه ${faPrice(c.price)} به مانده حساب او افزوده شد و تکالیف را می‌بیند.` });
                }}
              >
                <UserPlus className="size-4 me-1.5" /> افزودن به دوره
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
