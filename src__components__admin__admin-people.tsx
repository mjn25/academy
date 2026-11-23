"use client";

/* ------------------------------------------------------------------ */
/*  پنل مدیریت — پرونده کامل دانشجو/استاد + صفحه ویرایش + ثبت‌نام جدید  */
/* ------------------------------------------------------------------ */

import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle as AltTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { PanelShell, PageHeader, StatCard, StatusBadge, type PanelNavItem } from "@/components/panels/shell";
import { useRouter } from "@/lib/app-context";
import { normalizePhone, DEMO_ACCOUNTS } from "@/lib/auth-context";
import { fa, faNum, faPrice } from "@/lib/format";
import { useStore, type UserStatus, type StoreStudent, type StoreTeacher, type StorePayment } from "@/lib/store";
import { feedbackComments, grades as gradesData } from "@/lib/data";
import { EmptyState } from "@/components/admin/admin-assignments";
import { adminNav, ADMIN_SHELL } from "@/components/admin/admin-nav";
import {
  Users, GraduationCap, BookOpenCheck, ClipboardList, Pencil, Wallet, UserPlus,
  PhoneCall, Mail, CalendarDays, Star, CheckCircle2, Send, ArrowLeft,
  TrendingUp, FileText, MessageSquare, ShieldCheck, Plus, UserMinus, Receipt, Info, Check,
} from "lucide-react";

const nav = adminNav;

export function AdminPeoplePanel({ mode, id }: { mode: string; id?: string }) {
  const titles: Record<string, string> = {
    "student": "پرونده دانشجو",
    "student-edit": "ویرایش دانشجو",
    "student-new": "ثبت‌نام دستی دانشجو",
    "teacher": "پرونده استاد",
    "teacher-edit": "ویرایش استاد",
    "teacher-new": "استاد جدید",
  };
  return (
    <PanelShell title={titles[mode] ?? "پنل مدیریت"} nav={nav} active={mode.startsWith("student") ? "students" : "teachers"} roleLabel={ADMIN_SHELL.roleLabel} userName={ADMIN_SHELL.userName}>
      {mode === "student" && <AdminStudentProfile id={id} />}
      {mode === "student-edit" && <AdminStudentEdit id={id ?? null} />}
      {mode === "student-new" && <AdminStudentEdit id={null} />}
      {mode === "teacher" && <AdminTeacherProfile id={id} />}
      {mode === "teacher-edit" && <AdminTeacherEdit id={id ?? null} />}
      {mode === "teacher-new" && <AdminTeacherEdit id={null} />}
    </PanelShell>
  );
}

/* ============================ پرونده دانشجو ============================ */

export function AdminStudentProfile({ id }: { id?: string }) {
  const { navigate } = useRouter();
  const { toast } = useToast();
  const { students, teachers, courses, submissions, assignments, invoices, payments, updateStudent, markInvoicePaid, addStudentToCourse, removeStudentFromCourse, addManualPayment } = useStore();
  const s = students.find((x) => x.id === id);

  const [invoiceOpen, setInvoiceOpen] = React.useState(false);
  const [msgOpen, setMsgOpen] = React.useState(false);
  const [invAmount, setInvAmount] = React.useState("");
  const [invItems, setInvItems] = React.useState("");
  const [msg, setMsg] = React.useState("");
  /* دراپ‌داون افزودن دوره */
  const [addCourseId, setAddCourseId] = React.useState("");
  /* ثبت پرداخت دستی */
  const [payOpen, setPayOpen] = React.useState(false);
  const [payAmount, setPayAmount] = React.useState("");
  const [payNote, setPayNote] = React.useState("");
  const [payMethod, setPayMethod] = React.useState("نقدی");

  if (!s) {
    return (
      <div>
        <PageHeader crumbs={[{ label: "پنل مدیریت", href: "/admin" }, { label: "دانشجویان", href: "/admin/students" }, { label: "یافت نشد" }]} title="دانشجو یافت نشد" />
        <EmptyState title="این دانشجو وجود ندارد" desc="ممکن است حذف شده باشد." action={<Button className="bg-navy-deep text-white hover:bg-navy-700" onClick={() => navigate("/admin/students")}>بازگشت به لیست</Button>} />
      </div>
    );
  }

  const myCourses = courses.filter((c) => s.courseIds.includes(c.id));
  const mySubs = submissions.filter((x) => x.studentId === s.id);
  const myInvoices = invoices.filter((i) => i.studentId === s.id);
  const myPayments = payments.filter((p) => p.studentId === s.id);
  const availableCourses = courses.filter((c) => !s.courseIds.includes(c.id));
  const totalFee = myCourses.reduce((sum, c) => sum + c.price, 0);

  const addCourse = () => {
    if (!addCourseId) return;
    const c = courses.find((x) => x.id === addCourseId);
    addStudentToCourse(addCourseId, s.id);
    setAddCourseId("");
    toast({ title: "دوره اضافه شد ✓", description: `«${c?.title}» به پرونده ${s.name} اضافه شد و شهریه ${faPrice(c?.price ?? 0)} به مانده حساب او افزوده شد.` });
  };

  const setStatus = (status: UserStatus) => {
    updateStudent(s.id, { status });
    toast({ title: "وضعیت تغییر کرد ✓", description: `${s.name} → ${status}` });
  };

  return (
    <div>
      <PageHeader
        crumbs={[{ label: "پنل مدیریت", href: "/admin" }, { label: "دانشجویان", href: "/admin/students" }, { label: s.name }]}
        title={`پرونده ${s.name}`}
        desc="دسترسی کامل مدیر: کلاس‌ها، تکالیف، نمرات و مالی این دانشجو"
        actions={
          <>
            <Button variant="outline" className="border-hairline text-ink h-10" onClick={() => navigate(`/admin/students/${s.id}/edit`)}>
              <Pencil className="size-4 me-1.5" /> ویرایش پرونده
            </Button>
            <Select value={s.status} onValueChange={(v) => setStatus(v as UserStatus)}>
              <SelectTrigger className="h-10 w-44"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="فعال">وضعیت: فعال</SelectItem>
                <SelectItem value="در انتظار پرداخت">وضعیت: در انتظار پرداخت</SelectItem>
                <SelectItem value="غیرفعال">وضعیت: غیرفعال</SelectItem>
              </SelectContent>
            </Select>
          </>
        }
      />

      {/* کارت شناسایی */}
      <div className="rd-inside rounded-[8px] border border-hairline-soft bg-white p-6 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <span className="grid size-16 place-items-center rounded-[8px] bg-canvas-soft text-ink rd-inside text-2xl font-black-fa">{s.name.replace("دکتر ", "")[0]}</span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-black-fa text-ink">{s.name}</h3>
              <StatusBadge status={s.status} />
            </div>
            <div className="mt-1.5 flex flex-wrap gap-x-5 gap-y-1 text-xs text-ink-soft">
              <span className="flex items-center gap-1" dir="ltr"><PhoneCall className="size-3.5" /> {s.phone}</span>
              <span className="flex items-center gap-1" dir="ltr"><Mail className="size-3.5" /> {s.email}</span>
              <span className="flex items-center gap-1"><CalendarDays className="size-3.5" /> عضویت: {s.joinedAt}</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" className="h-9 bg-rd-deep text-primary-foreground hover:bg-navy-700 font-bold" onClick={() => setInvoiceOpen(true)}>
              <Wallet className="size-4 me-1" /> صدور پیش‌فاکتور
            </Button>
            <Button size="sm" variant="outline" className="h-9 border-hairline text-ink" onClick={() => setMsgOpen(true)}>
              <MessageSquare className="size-4 me-1" /> پیام
            </Button>
          </div>
        </div>
      </div>

      {/* آمار */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <StatCard icon={BookOpenCheck} label="دوره‌های فعال" value={`${faNum(myCourses.length)} دوره`} />
        <StatCard icon={TrendingUp} label="درصد حضور" value={s.attendance ? `${fa(s.attendance)}٪` : "—"} tint="yellow" />
        <StatCard icon={Star} label="میانگین نمره" value={s.avg ? fa(s.avg.toFixed(1)) : "—"} tint="green" />
        <StatCard icon={Wallet} label="مانده حساب" value={s.balance > 0 ? faPrice(s.balance) : "تسویه"} tint={s.balance > 0 ? "red" : "green"} />
      </div>

      <Tabs defaultValue="courses" className="w-full">
        <TabsList className="mb-4 bg-canvas-soft h-11 p-1">
          <TabsTrigger value="courses" className="data-[state=active]:bg-white">دوره‌ها</TabsTrigger>
          <TabsTrigger value="assignments" className="data-[state=active]:bg-white">تکالیف و پاسخ‌ها</TabsTrigger>
          <TabsTrigger value="grades" className="data-[state=active]:bg-white">کارنامه</TabsTrigger>
          <TabsTrigger value="finance" className="data-[state=active]:bg-white">مالی</TabsTrigger>
        </TabsList>

        <TabsContent value="courses" className="mt-0">
          {/* افزودن دوره با دراپ‌داون + قیمت */}
          <div className="rd-inside rounded-[8px] border border-hairline-soft bg-white p-5 mb-4">
            <div className="flex flex-wrap items-end gap-3">
              <div className="flex-1 min-w-56">
                <Label>افزودن دوره به این دانشجو</Label>
                <Select value={addCourseId} onValueChange={setAddCourseId}>
                  <SelectTrigger className="mt-1.5 h-11"><SelectValue placeholder="انتخاب دوره…" /></SelectTrigger>
                  <SelectContent>
                    {availableCourses.length === 0 ? (
                      <div className="px-3 py-2 text-xs text-ink-soft">همه دوره‌ها قبلاً اضافه شده‌اند</div>
                    ) : (
                      availableCourses.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.title} — {faPrice(c.price)}</SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <Button className="h-11 bg-navy-deep text-white hover:bg-navy-700" disabled={!addCourseId} onClick={addCourse}>
                <UserPlus className="size-4 me-1.5" /> افزودن به دوره
              </Button>
            </div>
            <p className="mt-2.5 text-[11px] text-ink-soft leading-6 flex items-start gap-1.5">
              <Info className="size-3.5 shrink-0 mt-0.5 text-info" />
              با افزودن هر دوره، قیمت آن بالافاصله در همین صفحه نمایش داده می‌شود، شهریه به مانده حساب دانشجو اضافه شده و ثبت‌نام در پنل استاد و پنل دانشجو هم دیده می‌شود.
            </p>
          </div>

          {myCourses.length === 0 ? (
            <EmptyState title="در هیچ دوره‌ای ثبت‌نام نشده" desc="از دراپ‌داون بالا، دوره موردنظر را به این دانشجو اضافه کنید." />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {myCourses.map((c) => {
                const t = teachers.find((x) => x.id === c.teacherId);
                return (
                  <div key={c.id} className="rd-inside rounded-[8px] border border-hairline-soft bg-white p-4">
                    <button onClick={() => navigate(`/admin/classes/${c.id}`)} className="text-start w-full">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-bold text-ink text-sm">{c.title}</p>
                        <StatusBadge status={c.status} />
                      </div>
                      <p className="mt-1.5 text-[11px] text-ink-soft">استاد: {t?.name ?? "—"} • {faNum(c.enrolled)} دانشجو • {c.schedule ?? "بدون برنامه"}</p>
                    </button>
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-hairline-soft pt-3">
                      <span className="text-xs font-extrabold text-ink">شهریه: {faPrice(c.price)}</span>
                      <div className="flex gap-1.5">
                        <Button size="sm" variant="outline" className="h-8 border-hairline text-ink" onClick={() => navigate(`/admin/classes/${c.id}`)}>
                          مدیریت دوره
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="outline" className="h-8 border-bad/30 text-bad hover:bg-bad/10" aria-label={`حذف ${c.title}`}>
                              <UserMinus className="size-3.5" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AltTitle className="font-black-fa text-ink">حذف از دوره</AltTitle>
                              <AlertDialogDescription>
                                «{s.name}» از دوره «{c.title}» حذف شود؟ شهریه {faPrice(c.price)} از مانده حساب او کم می‌شود.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>انصراف</AlertDialogCancel>
                              <AlertDialogAction className="bg-bad text-white hover:bg-bad/90" onClick={() => { removeStudentFromCourse(c.id, s.id); toast({ title: "از دوره حذف شد ✓", description: `شهریه ${faPrice(c.price)} از مانده حساب کم شد.` }); }}>
                                حذف
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="assignments" className="mt-0">
          {mySubs.length === 0 ? (
            <EmptyState title="پاسخی ثبت نشده" desc="پاسخ‌های این دانشجو به تکالیف اینجا نمایش داده می‌شود." />
          ) : (
            <div className="space-y-3">
              {mySubs.map((sub) => {
                const a = assignments.find((x) => x.id === sub.assignmentId);
                return (
                  <button key={sub.id} onClick={() => navigate(a?.courseId ? `/admin/classes/${a.courseId}` : `/admin/students/${s.id}`)} className="w-full text-start rd-inside rounded-[8px] border border-hairline-soft bg-white p-4 hover:border-navy-deep transition-colors flex flex-wrap items-center gap-3">
                    <span className="grid size-10 shrink-0 place-items-center rounded-[8px] bg-canvas-soft text-ink"><FileText className="size-5" /></span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-bold text-ink truncate">{a?.title ?? "—"}</span>
                      <span className="block text-[11px] text-ink-soft mt-0.5">{a?.due} • تحویل: {sub.submittedAt}</span>
                    </span>
                    {sub.status === "نمره‌داده‌شده" ? (
                      <Badge className="bg-ok/10 text-ok hover:bg-ok/10">نمره {fa(String(sub.score))} از {fa(a?.max ?? 10)}</Badge>
                    ) : (
                      <StatusBadge status="در انتظار بررسی" />
                    )}
                    <ArrowLeft className="size-4 text-ink-soft" />
                  </button>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="grades" className="mt-0">
          {s.courseIds.length === 0 ? (
            <EmptyState title="کارنامه‌ای وجود ندارد" desc="ابتدا دانشجو را در یک دوره ثبت‌نام کنید." />
          ) : (
            <div className="space-y-4">
              {s.courseIds.map((cid) => {
                const rows = gradesData[cid];
                const course = courses.find((c) => c.id === cid);
                if (!rows) return null;
                return (
                  <div key={cid} className="rd-inside rounded-[8px] border border-hairline-soft bg-white p-5">
                    <p className="font-bold text-ink text-sm mb-3 flex items-center gap-2"><ShieldCheck className="size-4 text-ink" /> کارنامه {course?.title ?? cid}</p>
                    <div className="space-y-2">
                      {rows.map((g) => (
                        <div key={g.item} className="flex flex-wrap items-center gap-3 rounded-[8px] bg-canvas-soft px-3.5 py-2.5">
                          <span className="text-xs font-bold text-ink flex-1 min-w-40">{g.item}</span>
                          <span className="text-[10px] rounded-full bg-white px-2 py-0.5 text-ink-soft border border-hairline-soft">{g.type}</span>
                          <span className="text-xs font-black-fa text-ink">{fa(String(g.score))} <span className="text-ink-soft font-normal">از {fa(String(g.max))}</span></span>
                          <span className={`text-[11px] font-bold ${g.score / g.max >= 0.8 ? "text-ok" : g.score / g.max >= 0.6 ? "text-warn" : "text-bad"}`}>{fa(Math.round((g.score / g.max) * 100))}٪</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="finance" className="mt-0">
          {/* خلاصه مالی */}
          <div className="grid gap-4 sm:grid-cols-3 mb-5">
            <StatCard icon={Wallet} label="جمع شهریه دوره‌ها" value={totalFee ? faPrice(totalFee) : "—"} />
            <StatCard icon={Receipt} label="اقساط ثبت‌شده" value={`${faNum(myPayments.length)} پرداخت`} tint="green" />
            <StatCard icon={CheckCircle2} label="مانده حساب" value={s.balance > 0 ? faPrice(s.balance) : "تسویه"} tint={s.balance > 0 ? "red" : "green"} />
          </div>

          {/* اقساط دستی */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <p className="font-bold text-ink text-sm flex items-center gap-2"><Receipt className="size-4 text-ink" /> اقساط و پرداخت‌های دستی</p>
            <Button size="sm" className="h-9 bg-rd-deep text-primary-foreground hover:bg-navy-700 font-bold" onClick={() => { setPayAmount(""); setPayNote(""); setPayMethod("نقدی"); setPayOpen(true); }}>
              <Plus className="size-4 me-1" /> ثبت پرداخت دستی
            </Button>
          </div>
          {myPayments.length === 0 ? (
            <EmptyState title="پرداختی ثبت نشده" desc="پرداخت‌های نقدی و اقساط این دانشجو را دستی وارد کنید — مانده حساب خودکار به‌روزرسانی می‌شود." action={
              <Button className="bg-rd-deep text-primary-foreground hover:bg-navy-700 font-bold" onClick={() => setPayOpen(true)}>ثبت پرداخت دستی</Button>
            } />
          ) : (
            <div className="rd-inside rounded-[8px] border border-hairline-soft bg-white overflow-hidden overflow-x-auto">
              <table className="w-full min-w-[560px] text-sm">
                <thead>
                  <tr className="bg-canvas-soft text-ink-soft text-xs border-b border-hairline-soft">
                    <th className="text-start p-4 font-semibold">تاریخ</th>
                    <th className="text-start p-4 font-semibold">شرح</th>
                    <th className="text-start p-4 font-semibold">روش</th>
                    <th className="text-start p-4 font-semibold">مبلغ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {myPayments.map((p, i) => (
                    <tr key={p.id} className={i % 2 ? "bg-canvas-soft/50" : ""}>
                      <td className="p-4 text-ink-soft text-xs">{p.date}</td>
                      <td className="p-4 text-ink">{p.note}</td>
                      <td className="p-4"><Badge className="bg-canvas-soft text-ink hover:bg-canvas-soft">{p.method}</Badge></td>
                      <td className="p-4 font-extrabold text-ok">+{faPrice(p.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* پیش‌فاکتورها */}
          <p className="font-bold text-ink text-sm mt-8 mb-3">پیش‌فاکتورها و لینک‌های پرداخت</p>
          {myInvoices.length === 0 ? (
            <EmptyState title="پیش‌فاکتوری صادر نشده" desc="با دکمه «صدور پیش‌فاکتور» برای این دانشجو فاکتور بسازید." action={
              <Button className="bg-rd-deep text-primary-foreground hover:bg-navy-700 font-bold" onClick={() => setInvoiceOpen(true)}>صدور پیش‌فاکتور</Button>
            } />
          ) : (
            <div className="rd-inside rounded-[8px] border border-hairline-soft bg-white overflow-hidden overflow-x-auto">
              <table className="w-full min-w-[640px] text-sm">
                <thead>
                  <tr className="bg-canvas-soft text-ink-soft text-xs border-b border-hairline-soft">
                    <th className="text-start p-4 font-semibold">شماره</th>
                    <th className="text-start p-4 font-semibold">اقلام</th>
                    <th className="text-start p-4 font-semibold">مبلغ</th>
                    <th className="text-start p-4 font-semibold">وضعیت</th>
                    <th className="p-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {myInvoices.map((inv) => (
                    <tr key={inv.id}>
                      <td className="p-4 font-bold text-ink">{inv.id}</td>
                      <td className="p-4 text-ink-soft">{inv.items}</td>
                      <td className="p-4 font-extrabold text-ink">{faPrice(inv.amount)}</td>
                      <td className="p-4"><StatusBadge status={inv.status} /></td>
                      <td className="p-4">
                        {inv.status === "در انتظار" && (
                          <Button size="sm" className="h-8 bg-navy-deep text-white hover:bg-navy-700" onClick={() => { markInvoicePaid(inv.id); toast({ title: "پرداخت ثبت شد ✓", description: "مانده حساب دانشجو به‌روزرسانی شد." }); }}>
                            ثبت پرداخت
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* صدور پیش‌فاکتور */}
      <Dialog open={invoiceOpen} onOpenChange={setInvoiceOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-black-fa text-ink">صدور پیش‌فاکتور برای {s.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>شرح اقلام</Label>
              <Input value={invItems} onChange={(e) => setInvItems(e.target.value)} className="mt-1.5 h-11" placeholder="مثلاً قسط دوم — آلمانی A1" />
            </div>
            <div>
              <Label>مبلغ (تومان)</Label>
              <Input value={invAmount} onChange={(e) => setInvAmount(e.target.value)} inputMode="numeric" dir="ltr" className="mt-1.5 h-11" placeholder="1800000" />
            </div>
            <Button
              className="w-full h-11 bg-rd-deep text-primary-foreground hover:bg-navy-700 font-bold"
              onClick={() => {
                const amount = Number(invAmount.replace(/[^\d]/g, ""));
                if (!invItems.trim() || !amount) {
                  toast({ title: "اطلاعات ناقص", description: "شرح اقلام و مبلغ را وارد کنید.", variant: "destructive" });
                  return;
                }
                const invId = useStore.getState().addInvoice({ studentId: s.id, items: invItems.trim(), amount, expires: "۱۴۰۴/۰۸/۲۰" });
                setInvoiceOpen(false);
                setInvItems(""); setInvAmount("");
                toast({ title: `پیش‌فاکتور ${invId} صادر شد ✓`, description: "لینک پرداخت یکتا برای دانشجو پیامک می‌شود." });
              }}
            >
              صدور پیش‌فاکتور
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* پیام */}
      <Dialog open={msgOpen} onOpenChange={setMsgOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-black-fa text-ink">پیام به {s.name}</DialogTitle>
          </DialogHeader>
          <Textarea value={msg} onChange={(e) => setMsg(e.target.value)} className="min-h-28" placeholder="متن پیام…" />
          <Button
            className="w-full h-11 bg-rd-deep text-primary-foreground hover:bg-navy-700 font-bold"
            disabled={!msg.trim()}
            onClick={() => {
              useStore.getState().pushActivity({ text: `پیام مستقیم برای «${s.name}» ارسال شد`, actor: "المیرا معرفت‌پور", role: "admin", href: `/admin/students/${s.id}` });
              setMsgOpen(false); setMsg("");
              toast({ title: "پیام ارسال شد ✓", description: "دانشجو در پنل خود اعلان را می‌بیند." });
            }}
          >
            <Send className="size-4 me-1.5" /> ارسال پیام
          </Button>
        </DialogContent>
      </Dialog>

      {/* ثبت پرداخت دستی قسط */}
      <Dialog open={payOpen} onOpenChange={setPayOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-black-fa text-ink">ثبت پرداخت دستی — {s.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="rounded-[8px] bg-canvas-soft border border-hairline-soft p-3 flex items-center justify-between text-xs">
              <span className="text-ink-soft">مانده حساب فعلی</span>
              <span className={`font-bold ${s.balance > 0 ? "text-bad" : "text-ok"}`}>{s.balance > 0 ? faPrice(s.balance) : "تسویه"}</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>مبلغ پرداخت (تومان) *</Label>
                <Input value={payAmount} onChange={(e) => setPayAmount(e.target.value.replace(/[^\d]/g, ""))} dir="ltr" inputMode="numeric" className="mt-1.5 h-11" placeholder="1800000" />
              </div>
              <div>
                <Label>روش پرداخت</Label>
                <Select value={payMethod} onValueChange={setPayMethod}>
                  <SelectTrigger className="mt-1.5 h-11"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="نقدی">نقدی</SelectItem>
                    <SelectItem value="کارتخوان">کارتخوان</SelectItem>
                    <SelectItem value="کارت به کارت">کارت به کارت</SelectItem>
                    <SelectItem value="لینک پرداخت">لینک پرداخت</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>شرح قسط</Label>
              <Input value={payNote} onChange={(e) => setPayNote(e.target.value)} className="mt-1.5 h-11" placeholder="مثلاً قسط دوم — آلمانی A1" />
            </div>
            <p className="rounded-[8px] bg-info/5 border border-info/30 p-3 text-[11px] leading-6 text-ink">
              ورود دستی پرداخت است (بدون فعال‌سازی درگاه قسطی) — پس از ثبت، مانده حساب در هر سه پنل به‌روزرسانی می‌شود.
            </p>
            <Button
              className="w-full h-11 bg-rd-deep text-primary-foreground hover:bg-navy-700 font-bold"
              onClick={() => {
                const amount = Number(payAmount.replace(/[^\d]/g, ""));
                if (!amount) {
                  toast({ title: "مبلغ را وارد کنید", variant: "destructive" });
                  return;
                }
                addManualPayment({ studentId: s.id, amount, note: payNote, method: payMethod as StorePayment["method"] });
                setPayOpen(false);
                setPayAmount(""); setPayNote("");
                toast({ title: "پرداخت ثبت شد ✓", description: "مانده حساب دانشجو به‌روزرسانی شد." });
              }}
            >
              <Receipt className="size-4 me-1.5" /> ثبت پرداخت
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ========================== ویرایش / ثبت دانشجو ========================== */

export function AdminStudentEdit({ id }: { id: string | null }) {
  const { navigate } = useRouter();
  const { toast } = useToast();
  const { students, teachers, courses, addStudent, updateStudent, addStudentToCourse, removeStudentFromCourse } = useStore();
  const existing = id ? students.find((x) => x.id === id) : null;

  const [name, setName] = React.useState(existing?.name ?? "");
  const [phone, setPhone] = React.useState(existing?.phone ?? "");
  const [email, setEmail] = React.useState(existing?.email ?? "");
  const [status, setStatus] = React.useState<UserStatus>(existing?.status ?? "فعال");
  const [courseIds, setCourseIds] = React.useState<string[]>(existing?.courseIds ?? []);
  const [pickCourse, setPickCourse] = React.useState("");

  if (id && !existing) {
    return (
      <div>
        <PageHeader crumbs={[{ label: "پنل مدیریت", href: "/admin" }, { label: "دانشجویان", href: "/admin/students" }, { label: "یافت نشد" }]} title="دانشجو یافت نشد" />
        <EmptyState title="این دانشجو وجود ندارد" desc="ممکن است حذف شده باشد." action={<Button className="bg-navy-deep text-white hover:bg-navy-700" onClick={() => navigate("/admin/students")}>بازگشت به لیست</Button>} />
      </div>
    );
  }

  const selectedCourses = courses.filter((c) => courseIds.includes(c.id));
  const selectableCourses = courses.filter((c) => !courseIds.includes(c.id));
  const totalFee = selectedCourses.reduce((sum, c) => sum + c.price, 0);

  /** افزودن دوره انتخاب‌شده — جمع شهریه در جدول پایین به‌روز می‌شود */
  const addCourseToSelection = () => {
    if (!pickCourse) return;
    const c = courses.find((x) => x.id === pickCourse);
    if (!c) return;
    setCourseIds((ids) => [...ids, c.id]);
    setPickCourse("");
  };

  /** حذف دوره از انتخاب‌ها */
  const removeCourseFromSelection = (cid: string) => {
    setCourseIds((ids) => ids.filter((x) => x !== cid));
  };

  const save = () => {
    const normalizedPhone = normalizePhone(phone);
    if (!name.trim() || !normalizedPhone) {
      toast({ title: "اطلاعات ناقص", description: "نام و شماره موبایل معتبر الزامی است.", variant: "destructive" });
      return;
    }
    const duplicateStudent = students.some((item) => item.id !== existing?.id && normalizePhone(item.phone) === normalizedPhone);
    const duplicateTeacher = teachers.some((item) => normalizePhone(item.phone) === normalizedPhone);
    const reservedDemoPhone = Boolean(DEMO_ACCOUNTS[normalizedPhone] && normalizePhone(existing?.phone ?? "") !== normalizedPhone);
    if (duplicateStudent || duplicateTeacher || reservedDemoPhone) {
      toast({ title: "این شماره قبلاً ثبت شده", description: "برای هر حساب، شماره موبایل باید یکتا باشد.", variant: "destructive" });
      return;
    }
    /* مانده حساب خودکار = جمع شهریه دوره‌های انتخابی */
    const patch = {
      name: name.trim(),
      phone: normalizedPhone,
      email: email.trim(),
      status,
      balance: totalFee,
      courseIds,
    };
    if (existing) {
      /* سنکرون‌سازی دوطرفه: لیست دانشجویان هر دوره هم به‌روز می‌شود (پنل استاد و دانشجو) */
      const added = courseIds.filter((cid) => !existing.courseIds.includes(cid));
      const removed = existing.courseIds.filter((cid) => !courseIds.includes(cid));
      added.forEach((cid) => addStudentToCourse(cid, existing.id));
      removed.forEach((cid) => removeStudentFromCourse(cid, existing.id));
      updateStudent(existing.id, patch);
      toast({ title: "پرونده ویرایش شد ✓", description: "تغییرات در پنل استاد و دانشجو هم اعمال می‌شود." });
      navigate(`/admin/students/${existing.id}`);
    } else {
      /* ثبت‌نام جدید — مانده حساب از صفر شروع می‌شود؛ addStudentToCourse شهریهٔ هر دوره را خودش اضافه می‌کند (جمع = totalFee) */
      const newId = addStudent({ ...patch, balance: 0, courseIds: [] });
      courseIds.forEach((cid) => addStudentToCourse(cid, newId));
      toast({ title: "ثبت‌نام انجام شد ✓", description: `${name.trim()} به لیست دانشجویان و دوره‌های انتخابی اضافه شد.` });
      navigate(`/admin/students/${newId}`);
    }
  };

  return (
    <div className="max-w-2xl">
      <PageHeader
        crumbs={[{ label: "پنل مدیریت", href: "/admin" }, { label: "دانشجویان", href: "/admin/students" }, { label: existing ? "ویرایش پرونده" : "ثبت‌نام دستی" }]}
        title={existing ? `ویرایش پرونده ${existing.name}` : "ثبت‌نام دستی دانشجو"}
        desc={existing ? "اطلاعات هویتی و وضعیت مالی دانشجو را ویرایش کنید." : "برای پرداخت حضوری/نقدی، دانشجو را مستقیم ثبت‌نام کنید."}
      />
      <div className="rd-inside rounded-[8px] border border-hairline-soft bg-white p-4 sm:p-6 space-y-5">
        <section>
          <div className="mb-3 flex items-center gap-2">
            <span className="grid size-7 place-items-center rounded-full bg-navy-deep text-[11px] font-bold text-white">۱</span>
            <div>
              <h2 className="text-sm font-black-fa text-ink">اطلاعات دانشجو</h2>
              <p className="text-[11px] text-ink-soft">مشخصات تماس و وضعیت پرونده را وارد کنید.</p>
            </div>
          </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label>نام و نام خانوادگی *</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} className="mt-1.5 h-11" placeholder="مثلاً الهام کریمی" />
          </div>
          <div>
            <Label>موبایل *</Label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} dir="ltr" inputMode="tel" className="mt-1.5 h-11" placeholder="09xxxxxxxxx" />
          </div>
          <div>
            <Label>ایمیل</Label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} dir="ltr" className="mt-1.5 h-11" placeholder="name@email.com" />
          </div>
          <div>
            <Label>وضعیت</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as UserStatus)}>
              <SelectTrigger className="mt-1.5 h-11"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="فعال">فعال</SelectItem>
                <SelectItem value="در انتظار پرداخت">در انتظار پرداخت</SelectItem>
                <SelectItem value="غیرفعال">غیرفعال</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        </section>

        {/* ثبت‌نام در دوره‌ها — بخش دوم فرایند */}
        <section>
        <div className="rounded-[8px] border border-hairline-soft bg-canvas-soft/40 p-4">
          <div className="mb-3 flex items-center gap-2">
            <span className="grid size-7 place-items-center rounded-full bg-navy-deep text-[11px] font-bold text-white">۲</span>
            <div>
              <h2 className="text-sm font-black-fa text-ink">انتخاب دوره‌ها</h2>
              <p className="text-[11px] text-ink-soft">دوره‌های موردنظر را اضافه کنید؛ جمع شهریه پایین همین بخش محاسبه می‌شود.</p>
            </div>
          </div>
          <p className="mt-1 text-[11.5px] leading-5 text-ink-soft">یک یا چند دوره را انتخاب و اضافه کنید؛ جمع شهریه به‌صورت خودکار محاسبه می‌شود.</p>
          <div className="mt-3 flex flex-wrap items-end gap-3">
            <div className="flex-1 min-w-56">
              <Select value={pickCourse} onValueChange={setPickCourse}>
                <SelectTrigger className="h-11 bg-white"><SelectValue placeholder="یک دوره انتخاب کنید…" /></SelectTrigger>
                <SelectContent>
                  {selectableCourses.length === 0 ? (
                    <div className="px-3 py-2 text-xs text-ink-soft">همه دوره‌ها اضافه شده‌اند</div>
                  ) : (
                    selectableCourses.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.title} — {faPrice(c.price)}</SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <Button type="button" variant="outline" className="h-11 border-hairline bg-white text-ink" disabled={!pickCourse} onClick={addCourseToSelection}>
              <Plus className="size-4 me-1.5" /> افزودن دوره
            </Button>
          </div>

          {selectedCourses.length > 0 ? (
            <div className="mt-3 rd-inside rounded-[8px] border border-hairline-soft bg-white overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-canvas-soft text-ink-soft text-xs border-b border-hairline-soft">
                    <th className="text-start p-3 font-semibold">دوره انتخاب‌شده</th>
                    <th className="text-start p-3 font-semibold">شهریه</th>
                    <th className="p-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {selectedCourses.map((c) => (
                    <tr key={c.id}>
                      <td className="p-3 font-bold text-ink">{c.title}</td>
                      <td className="p-3 font-bold text-ink">{faPrice(c.price)}</td>
                      <td className="p-3 text-end">
                        <button type="button" onClick={() => removeCourseFromSelection(c.id)} className="text-xs font-bold text-bad hover:underline">حذف</button>
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-canvas-soft/60">
                    <td className="p-3 font-black-fa text-ink">جمع شهریه دوره‌ها</td>
                    <td className="p-3 font-black-fa text-ink">{faPrice(totalFee)}</td>
                    <td></td>
                  </tr>
                </tbody>
              </table>
            </div>
          ) : (
            <p className="mt-3 rounded-[8px] border border-dashed border-hairline-soft bg-white px-4 py-3 text-xs text-ink-soft">هنوز دوره‌ای اضافه نشده — یک دوره از لیست بالا انتخاب کنید و «افزودن دوره» را بزنید.</p>
          )}
          <p className="mt-2 text-[11px] text-ink-soft leading-6">
            مانده حساب دانشجو برابر جمع شهریه دوره‌های انتخابی محاسبه می‌شود. پس از ذخیره، دانشجو در لیست هر دوره (پنل استاد و پنل دانشجو) هم ثبت می‌شود.
          </p>
        </div>
        </section>

        <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row">
          <Button className="flex-1 h-11 bg-rd-deep text-primary-foreground hover:bg-navy-700 font-bold" onClick={save}>
            <UserPlus className="size-4 me-1.5" /> {existing ? "ذخیره تغییرات" : "ثبت‌نام دانشجو"}
          </Button>
          <Button variant="outline" className="h-11 border-hairline text-ink" onClick={() => navigate(existing ? `/admin/students/${existing.id}` : "/admin/students")}>انصراف</Button>
        </div>
      </div>
    </div>
  );
}

/* ============================ پرونده استاد ============================ */

export function AdminTeacherProfile({ id }: { id?: string }) {
  const { navigate } = useRouter();
  const { toast } = useToast();
  const { teachers, courses, students, assignments, updateTeacher, setCourseTeacher } = useStore();
  const t = teachers.find((x) => x.id === id);

  const [assignOpen, setAssignOpen] = React.useState(false);
  const [pickCourse, setPickCourse] = React.useState("");

  if (!t) {
    return (
      <div>
        <PageHeader crumbs={[{ label: "پنل مدیریت", href: "/admin" }, { label: "اساتید", href: "/admin/teachers" }, { label: "یافت نشد" }]} title="استاد یافت نشد" />
        <EmptyState title="این استاد وجود ندارد" desc="ممکن است حذف شده باشد." action={<Button className="bg-navy-deep text-white hover:bg-navy-700" onClick={() => navigate("/admin/teachers")}>بازگشت به لیست</Button>} />
      </div>
    );
  }

  const myCourses = courses.filter((c) => c.teacherId === t.id);
  const rosterIds = Array.from(new Set(myCourses.flatMap((c) => c.studentIds)));
  const myAssignments = assignments.filter((a) => myCourses.some((c) => c.id === a.courseId));
  const myFeedback = feedbackComments.filter((f) => myCourses.some((c) => c.title === f.course));
  const unassigned = courses.filter((c) => !c.teacherId);

  const doAssign = () => {
    if (!pickCourse) return;
    setCourseTeacher(pickCourse, t.id);
    const c = courses.find((x) => x.id === pickCourse);
    setAssignOpen(false); setPickCourse("");
    toast({ title: "تخصیص انجام شد ✓", description: `دوره «${c?.title}» به ${t.name} واگذار شد.` });
  };

  return (
    <div>
      <PageHeader
        crumbs={[{ label: "پنل مدیریت", href: "/admin" }, { label: "اساتید", href: "/admin/teachers" }, { label: t.name }]}
        title={`پرونده ${t.name}`}
        desc="دسترسی کامل مدیر: دوره‌ها، دانشجویان، تکالیف و بازخوردهای این استاد"
        actions={
          <>
            <Button variant="outline" className="border-hairline text-ink h-10" onClick={() => navigate(`/admin/teachers/${t.id}/edit`)}>
              <Pencil className="size-4 me-1.5" /> ویرایش پرونده
            </Button>
            <Button className="bg-rd-deep text-primary-foreground hover:bg-navy-700 font-bold h-10" onClick={() => setAssignOpen(true)}>
              <BookOpenCheck className="size-4 me-1.5" /> تخصیص کلاس
            </Button>
          </>
        }
      />

      {/* کارت شناسایی */}
      <div className="rd-inside rounded-[8px] border border-hairline-soft bg-white p-6 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <img src={t.image} alt={t.name} className="size-16 rounded-[8px] object-cover" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-black-fa text-ink">{t.name}</h3>
              <StatusBadge status={t.status} />
            </div>
            <p className="text-xs font-semibold text-ink mt-0.5">{t.title}</p>
            <div className="mt-1.5 flex flex-wrap gap-x-5 gap-y-1 text-xs text-ink-soft">
              <span className="flex items-center gap-1" dir="ltr"><PhoneCall className="size-3.5" /> {t.phone}</span>
              <span className="flex items-center gap-1" dir="ltr"><Mail className="size-3.5" /> {t.email}</span>
              <span className="flex items-center gap-1"><Star className="size-3.5 fill-brand-500 text-brand-600" /> امتیاز {fa(t.rating)} از ۵</span>
            </div>
          </div>
        </div>
        <p className="mt-4 rounded-[8px] bg-canvas-soft p-3.5 text-xs leading-6 text-ink">{t.bio}</p>
      </div>

      {/* آمار */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <StatCard icon={BookOpenCheck} label="دوره‌های در حال تدریس" value={`${faNum(myCourses.length)} دوره`} />
        <StatCard icon={Users} label="دانشجویان مستقیم" value={`${faNum(rosterIds.length)} نفر`} tint="yellow" />
        <StatCard icon={ClipboardList} label="تکالیف ایجادشده" value={faNum(myAssignments.length)} />
        <StatCard icon={TrendingUp} label="سابقه تدریس" value={`${fa(t.experience)} سال`} tint="green" />
      </div>

      <Tabs defaultValue="courses" className="w-full">
        <TabsList className="mb-4 bg-canvas-soft h-11 p-1">
          <TabsTrigger value="courses" className="data-[state=active]:bg-white">دوره‌های من</TabsTrigger>
          <TabsTrigger value="students" className="data-[state=active]:bg-white">دانشجویان</TabsTrigger>
          <TabsTrigger value="assignments" className="data-[state=active]:bg-white">تکالیف</TabsTrigger>
          <TabsTrigger value="feedback" className="data-[state=active]:bg-white">بازخوردها</TabsTrigger>
        </TabsList>

        <TabsContent value="courses" className="mt-0">
          {myCourses.length === 0 ? (
            <EmptyState title="دوره‌ای تخصیص نیافته" desc="با دکمه «تخصیص کلاس» یک دوره به این استاد واگذار کنید." action={
              <Button className="bg-rd-deep text-primary-foreground hover:bg-navy-700 font-bold" onClick={() => setAssignOpen(true)}>تخصیص کلاس</Button>
            } />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {myCourses.map((c) => (
                <button key={c.id} onClick={() => navigate(`/admin/classes/${c.id}`)} className="text-start rd-inside rounded-[8px] border border-hairline-soft bg-white p-4 hover:border-navy-deep transition-colors">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-bold text-ink text-sm">{c.title}</p>
                    <StatusBadge status={c.status} />
                  </div>
                  <p className="mt-1.5 text-[11px] text-ink-soft">{faNum(c.enrolled)} دانشجو • {c.schedule ?? "بدون برنامه"}</p>
                  <span className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-ink">مدیریت دوره <ArrowLeft className="size-3" /></span>
                </button>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="students" className="mt-0">
          {rosterIds.length === 0 ? (
            <EmptyState title="دانشجویی ندارد" desc="دانشجویان دوره‌های این استاد اینجا دیده می‌شوند." />
          ) : (
            <div className="rd-inside rounded-[8px] border border-hairline-soft bg-white overflow-hidden overflow-x-auto">
              <table className="w-full min-w-[640px] text-sm">
                <thead>
                  <tr className="bg-canvas-soft text-ink-soft text-xs border-b border-hairline-soft">
                    <th className="text-start p-4 font-semibold">دانشجو</th>
                    <th className="text-start p-4 font-semibold">دوره</th>
                    <th className="text-start p-4 font-semibold">حضور</th>
                    <th className="p-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {rosterIds.map((sid) => {
                    const s = students.find((x) => x.id === sid);
                    if (!s) return null;
                    const cs = courses.filter((c) => c.teacherId === t.id && c.studentIds.includes(sid));
                    return (
                      <tr key={sid} className="hover:bg-canvas-soft/60 transition-colors">
                        <td className="p-4 font-bold text-ink">{s.name}</td>
                        <td className="p-4 text-ink-soft">{cs.map((c) => c.title).join("، ")}</td>
                        <td className="p-4"><span className={`font-bold ${s.attendance >= 75 ? "text-ok" : s.attendance >= 50 ? "text-warn" : "text-bad"}`}>{fa(s.attendance)}٪</span></td>
                        <td className="p-4 text-end">
                          <Button size="sm" variant="outline" className="h-8 border-hairline text-ink" onClick={() => navigate(`/admin/students/${sid}`)}>پرونده</Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>

        <TabsContent value="assignments" className="mt-0">
          {myAssignments.length === 0 ? (
            <EmptyState title="تکلیفی ایجاد نشده" desc="تکالیف این استاد یا تکالیفی که مدیریت برای دوره‌های او تخصیص داده اینجا دیده می‌شود." />
          ) : (
            <div className="space-y-3">
              {myAssignments.map((a) => (
                <button key={a.id} onClick={() => navigate(`/admin/classes/${a.courseId}`)} className="w-full text-start rd-inside rounded-[8px] border border-hairline-soft bg-white p-4 hover:border-navy-deep transition-colors flex items-center gap-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-[8px] bg-canvas-soft text-ink"><ClipboardList className="size-5" /></span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-bold text-ink truncate">{a.title}</span>
                    <span className="block text-[11px] text-ink-soft">{courses.find((c) => c.id === a.courseId)?.title} • مهلت {a.due}</span>
                  </span>
                  <ArrowLeft className="size-4 text-ink-soft" />
                </button>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="feedback" className="mt-0">
          {myFeedback.length === 0 ? (
            <EmptyState title="بازخوردی ثبت نشده" desc="نظرات دانشجویان درباره این استاد اینجا نمایش داده می‌شود." />
          ) : (
            <div className="space-y-3">
              {myFeedback.map((f) => (
                <div key={f.id} className="rd-inside rounded-[8px] border border-hairline-soft bg-white p-5">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="grid size-10 place-items-center rounded-full bg-canvas-soft text-ink font-black-fa">{f.student[0]}</span>
                    <div>
                      <p className="text-sm font-bold text-ink">{f.student}</p>
                      <p className="text-[11px] text-ink-soft">{f.course}</p>
                    </div>
                    <span className="ms-auto flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`size-4 ${i < f.score ? "fill-brand-500 text-brand-600" : "text-navy-200"}`} />
                      ))}
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-ink leading-7">{f.text}</p>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* تخصیص کلاس */}
      <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-black-fa text-ink">تخصیص کلاس به {t.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>انتخاب دوره</Label>
              <Select value={pickCourse} onValueChange={setPickCourse}>
                <SelectTrigger className="mt-1.5 h-11"><SelectValue placeholder="انتخاب دوره…" /></SelectTrigger>
                <SelectContent>
                  {unassigned.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.title} — بدون استاد</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {unassigned.length === 0 && <p className="mt-2 text-[11px] leading-5 text-ink-soft">در حال حاضر دورهٔ بدون استاد وجود ندارد. برای جابه‌جایی، ابتدا دوره را از پرونده استاد فعلی بردارید.</p>}
            </div>
            <Button className="w-full h-11 bg-rd-deep text-primary-foreground hover:bg-navy-700 font-bold" disabled={!pickCourse || unassigned.length === 0} onClick={doAssign}>
              <CheckCircle2 className="size-4 me-1.5" /> تخصیص دوره
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* =========================== ویرایش استاد =========================== */

export function AdminTeacherEdit({ id }: { id: string | null }) {
  const { navigate } = useRouter();
  const { toast } = useToast();
  const { teachers, students, courses, addTeacher, updateTeacher, setCourseTeacher } = useStore();
  const existing = id ? teachers.find((x) => x.id === id) : null;

  /* درخواست کاربر: فرم استاد فقط نام + موبایل + درس‌هایی که تدریس می‌کند — ایمیل/مدرک/سابقه/بیوگرافی نیست */
  const [name, setName] = React.useState(existing?.name ?? "");
  const [phone, setPhone] = React.useState(existing?.phone ?? "");
  const [teachCourseIds, setTeachCourseIds] = React.useState<string[]>(
    existing ? courses.filter((c) => c.teacherId === existing.id).map((c) => c.id) : [],
  );

  if (id && !existing) {
    return (
      <div>
        <PageHeader crumbs={[{ label: "پنل مدیریت", href: "/admin" }, { label: "اساتید", href: "/admin/teachers" }, { label: "یافت نشد" }]} title="استاد یافت نشد" />
        <EmptyState title="این استاد وجود ندارد" desc="ممکن است حذف شده باشد." action={<Button className="bg-navy-deep text-white hover:bg-navy-700" onClick={() => navigate("/admin/teachers")}>بازگشت به لیست</Button>} />
      </div>
    );
  }

  const save = () => {
    const normalizedPhone = normalizePhone(phone);
    if (!name.trim() || !normalizedPhone) {
      toast({ title: "اطلاعات ناقص", description: "نام و شماره موبایل معتبر الزامی است.", variant: "destructive" });
      return;
    }
    const duplicateTeacher = teachers.some((item) => item.id !== existing?.id && normalizePhone(item.phone) === normalizedPhone);
    const duplicateStudent = students.some((item) => normalizePhone(item.phone) === normalizedPhone);
    const reservedDemoPhone = Boolean(DEMO_ACCOUNTS[normalizedPhone] && normalizePhone(existing?.phone ?? "") !== normalizedPhone);
    if (duplicateTeacher || duplicateStudent || reservedDemoPhone) {
      toast({ title: "این شماره قبلاً ثبت شده", description: "برای هر حساب، شماره موبایل باید یکتا باشد.", variant: "destructive" });
      return;
    }
    /* بقیهٔ مشخصات استاد (عنوان، مدرک، سابقه، بیوگرافی) دست‌نخورده می‌ماند */
    const patch = {
      name: name.trim(),
      title: existing?.title || "مدرس",
      phone: normalizedPhone,
      email: existing?.email ?? "",
      degree: existing?.degree ?? "",
      experience: existing?.experience ?? 1,
      bio: existing?.bio ?? "",
    };
    let teacherId: string;
    if (existing) {
      updateTeacher(existing.id, patch);
      teacherId = existing.id;
      toast({ title: "پرونده استاد ویرایش شد ✓" });
    } else {
      teacherId = addTeacher(patch as Partial<StoreTeacher> & { name: string });
      toast({ title: "استاد جدید اضافه شد ✓", description: "حساب کاربری استاد ساخته شد." });
    }
    /* تخصیص درس‌ها: دوره‌های انتخابی به استاد داده می‌شود و از دوره‌های دیگرِ او برداشته می‌شود */
    courses.forEach((c) => {
      if (teachCourseIds.includes(c.id)) setCourseTeacher(c.id, teacherId);
      else if (c.teacherId === teacherId) setCourseTeacher(c.id, null);
    });
    navigate(`/admin/teachers/${teacherId}`);
  };

  return (
    <div className="max-w-2xl">
      <PageHeader
        crumbs={[{ label: "پنل مدیریت", href: "/admin" }, { label: "اساتید", href: "/admin/teachers" }, { label: existing ? "ویرایش پرونده" : "استاد جدید" }]}
        title={existing ? `ویرایش پرونده ${existing.name}` : "افزودن استاد جدید"}
        desc={existing ? "نام، موبایل و درس‌های تدریس استاد را ویرایش کنید." : "فقط نام، موبایل و درس‌های تدریس — پس از ثبت، حساب کاربری استاد ساخته می‌شود."}
      />
      <div className="rd-inside rounded-[8px] border border-hairline-soft bg-white p-4 sm:p-6 space-y-5">
        <section>
          <div className="mb-3 flex items-center gap-2">
            <span className="grid size-7 place-items-center rounded-full bg-navy-deep text-[11px] font-bold text-white">۱</span>
            <div><h2 className="text-sm font-black-fa text-ink">اطلاعات استاد</h2><p className="text-[11px] text-ink-soft">نام و شماره تماس استاد را وارد کنید.</p></div>
          </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label>نام و نام خانوادگی *</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} className="mt-1.5 h-11" placeholder="مثلاً دکتر امیر کاظمی" />
          </div>
          <div>
            <Label>موبایل *</Label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} dir="ltr" inputMode="tel" className="mt-1.5 h-11" placeholder="09xxxxxxxxx" />
          </div>
        </div>
        </section>

        {/* درس‌های تدریس — انتخاب مستقیم با تیک، بدون دراپ‌داون گم‌شده */}
        <section className="rounded-[8px] border border-hairline-soft bg-canvas-soft/40 p-4">
          <div className="mb-3 flex items-center gap-2">
            <span className="grid size-7 place-items-center rounded-full bg-navy-deep text-[11px] font-bold text-white">۲</span>
            <div><h2 className="text-sm font-black-fa text-ink">تخصیص دوره‌ها</h2><p className="text-[11px] text-ink-soft">فقط دوره‌های بدون استاد یا دوره‌های فعلی همین استاد قابل انتخاب‌اند.</p></div>
          </div>
          <div className="mt-3 grid sm:grid-cols-2 gap-2">
            {courses.map((c) => {
              const on = teachCourseIds.includes(c.id);
              const assignedElsewhere = Boolean(c.teacherId && c.teacherId !== existing?.id);
              const assignedName = assignedElsewhere ? teachers.find((teacher) => teacher.id === c.teacherId)?.name : null;
              return (
                <button
                  type="button"
                  key={c.id}
                  disabled={assignedElsewhere}
                  onClick={() => setTeachCourseIds((v) => (on ? v.filter((x) => x !== c.id) : [...v, c.id]))}
                  className={`flex items-center gap-2.5 rounded-[8px] border bg-white px-3.5 py-3 text-start transition-colors disabled:cursor-not-allowed disabled:opacity-55 ${
                    on ? "border-rd-accent/50 ring-1 ring-rd-accent/30" : "border-hairline-soft hover:bg-canvas-soft"
                  }`}
                >
                  <span className={`grid size-5 shrink-0 place-items-center rounded-[6px] border transition-colors ${on ? "border-rd-accent bg-rd-accent text-white" : "border-hairline bg-white text-transparent"}`}>
                    <Check className="size-3.5" />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-bold text-ink">{c.title}</span>
                    <span className="block text-[11px] text-ink-soft">{assignedElsewhere ? `در اختیار ${assignedName ?? "استاد دیگر"}` : c.level}</span>
                  </span>
                </button>
              );
            })}
          </div>
          {teachCourseIds.length > 0 && (
            <p className="mt-2.5 text-[11px] font-bold text-ink">{faNum(teachCourseIds.length)} دوره انتخاب شده — با ذخیره به پروندهٔ استاد اضافه می‌شود.</p>
          )}
        </section>

        <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row">
          <Button className="flex-1 h-11 bg-rd-deep text-primary-foreground hover:bg-navy-700 font-bold" onClick={save}>
            <UserPlus className="size-4 me-1.5" /> {existing ? "ذخیره تغییرات" : "ایجاد استاد"}
          </Button>
          <Button variant="outline" className="h-11 border-hairline text-ink" onClick={() => navigate(existing ? `/admin/teachers/${existing.id}` : "/admin/teachers")}>انصراف</Button>
        </div>
      </div>
    </div>
  );
}
