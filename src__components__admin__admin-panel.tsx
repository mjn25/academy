"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { PanelShell, PanelHeading, StatCard, StatusBadge, type PanelNavItem } from "@/components/panels/shell";
import { useRouter } from "@/lib/app-context";
import { fa, faNum, faPrice } from "@/lib/format";
import { useStore, type StorePayment } from "@/lib/store";
import { adminNav, adminTitles, ADMIN_SHELL } from "@/components/admin/admin-nav";
import {
  courses,
  products,
  shopOrders,
} from "@/lib/data";
import type { ShopOrder } from "@/lib/data";
import {
  LayoutDashboard,
  BookOpenCheck,
  Users,
  UserCheck,
  GraduationCap,
  ClipboardCheck,
  ShoppingBag,
  FileText,
  TrendingUp,
  TriangleAlert,
  Plus,
  Search,
  PackageCheck,
  Eye,
  ArrowLeft,
  Zap,
  Info,
} from "lucide-react";

const nav = adminNav;

const titles = adminTitles;

/* بخش‌های حذف‌شده (مشاوره، مالی، محتوا، پیام و...) — مسیرهای قدیمی به داشبورد برمی‌گردند */
const KNOWN_SECTIONS = ["dash", "classes", "students", "teachers", "shop"];

export function AdminPanel({ section }: { section: string }) {
  const known = KNOWN_SECTIONS.includes(section);
  return (
    <PanelShell title={known ? titles[section] ?? "پنل مدیریت" : "پنل مدیریت"} nav={nav} active={known ? section : "dash"} roleLabel={ADMIN_SHELL.roleLabel} userName={ADMIN_SHELL.userName}>
      {section === "dash" && <AdminDashboard />}
      {section === "classes" && <AdminClasses />}
      {section === "students" && <AdminStudents />}
      {section === "teachers" && <AdminTeachers />}
      {section === "shop" && <AdminShop />}
      {!known && <AdminDashboard />}
    </PanelShell>
  );
}

/* -------------------------------- داشبورد -------------------------------- */

function AdminDashboard() {
  const { navigate } = useRouter();
  const { students, teachers, courses, assignments, submissions, activity } = useStore();

  const roleBadge: Record<string, { label: string; cls: string }> = {
    admin: { label: "مدیریت", cls: "bg-navy-deep text-white" },
    teacher: { label: "استاد", cls: "bg-canvas-soft text-ink" },
    student: { label: "دانشجو", cls: "bg-info/10 text-info" },
    system: { label: "سیستم", cls: "bg-canvas-soft text-ink" },
  };

  return (
    <div className="space-y-6">
      {/* کارت‌های آماری */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={UserCheck} label="ثبت‌نام جدید (این هفته)" value="۱۸ نفر" trend="+۲۳٪" />
        <StatCard icon={Users} label="دانشجویان فعال" value={`${faNum(students.filter((s) => s.status === "فعال").length)} نفر`} tint="yellow" />
        <StatCard icon={FileText} label="تکالیف فعال" value={`${faNum(assignments.length)} تکلیف — ${faNum(submissions.length)} پاسخ`} />
        <StatCard icon={BookOpenCheck} label="کلاس‌های در حال برگزاری" value={`${faNum(courses.filter((c) => c.status === "فعال").length)} کلاس`} />
      </div>

      {/* دسترسی سریع */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { t: "ثبت‌نام دستی دانشجو", d: "پرداخت حضوری / نقدی", href: "/admin/students/new", icon: Plus },
          { t: "افزودن استاد", d: "ساخت حساب کاربری استاد", href: "/admin/teachers/new", icon: GraduationCap },
        ].map((qa) => (
          <button key={qa.t} onClick={() => navigate(qa.href)} className="text-start rd-inside rounded-[8px] border border-hairline-soft bg-white p-4 hover:border-navy-deep hover:bg-canvas-soft/40 transition-colors">
            <span className="grid size-10 place-items-center rounded-[8px] bg-canvas-soft text-rd-accent rd-inside mb-3"><qa.icon className="size-5" /></span>
            <p className="text-sm font-bold text-ink">{qa.t}</p>
            <p className="text-[11px] text-ink-soft mt-0.5">{qa.d}</p>
          </button>
        ))}
      </div>

      {/* Bento داشبورد */}
      <div className="grid gap-4 md:grid-cols-4">
        {/* هشدارها */}
        <div className="md:col-span-2 rounded-[8px] border border-warn/30 bg-warn/5 p-5">
          <p className="font-bold text-ink text-sm flex items-center gap-1.5 mb-3"><TriangleAlert className="size-4 text-warn" /> هشدارها و اقدامات</p>
          <div className="space-y-2.5">
            {[
              { t: "ظرفیت کلاس آلمانی A1 رو به پرشدن است", d: "۱۲ از ۱۵ نفر ثبت‌نام کرده‌اند", href: "/admin/classes/a1" },
              { t: "۳ سفارش فروشگاه در انتظار ارسال", d: "از دیروز بدون تحویل به پست", href: "/admin/shop" },
              { t: "پرداخت ناموفق — آرش نوروزی", d: "پیش‌فاکتور PF-1043 منقضی شد", href: "/admin/students/st4" },
            ].map((w) => (
              <div key={w.t} className="flex flex-wrap items-center gap-2 rounded-[8px] bg-white border border-warn/20 px-3.5 py-2.5">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-ink">{w.t}</p>
                  <p className="text-[11px] text-ink-soft">{w.d}</p>
                </div>
                <Button size="sm" variant="outline" className="h-8 border-warn/40 text-warn text-[11px]" onClick={() => navigate(w.href)}>اقدام</Button>
              </div>
            ))}
          </div>
        </div>

        {/* فعالیت زنده سه پنل */}
        <div className="md:col-span-2 rd-inside rounded-[8px] border border-hairline-soft bg-white p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="font-bold text-ink text-sm flex items-center gap-1.5"><Zap className="size-4 text-ink" /> فعالیت زنده هر سه پنل</p>
            <span className="text-[10px] rounded-full bg-ok/10 text-ok px-2 py-0.5 font-bold">اتصال کامل</span>
          </div>
          <div className="space-y-2 max-h-52 overflow-y-auto scroll-thin">
            {activity.slice(0, 8).map((a) => (
              <button key={a.id} onClick={() => a.href && navigate(a.href)} className="w-full text-start flex items-center gap-3 rounded-[8px] border border-hairline-soft p-3 hover:border-navy-deep transition-colors">
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${roleBadge[a.role]?.cls ?? roleBadge.system.cls}`}>{roleBadge[a.role]?.label ?? "سیستم"}</span>
                <span className="min-w-0 flex-1">
                  <span className="block text-xs text-ink truncate">{a.text}</span>
                  <span className="block text-[10px] text-ink-soft">{a.actor} • {a.time}</span>
                </span>
                {a.href && <ArrowLeft className="size-3.5 text-ink-soft shrink-0" />}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------ کلاس‌ها ---------------------------------- */

function AdminClasses() {
  const { navigate } = useRouter();
  const { toast } = useToast();
  const { courses, teachers, addCourse } = useStore();
  const [open, setOpen] = React.useState(false);
  const [form, setForm] = React.useState({ title: "", type: "offline", capacity: "", price: "", teacherId: "" });

  return (
    <div>
      <PanelHeading
        title="کلاس‌ها و دوره‌ها"
        desc="مدیریت کلاس‌ها، ظرفیت، شهریه و تخصیص استاد — برای جزئیات روی هر ردیف کلیک کنید."
        action={
          <Button className="bg-rd-deep text-primary-foreground hover:bg-navy-700 font-bold" onClick={() => { setForm({ title: "", type: "offline", capacity: "", price: "", teacherId: "" }); setOpen(true); }}>
            <Plus className="size-4 me-1.5" /> کلاس جدید
          </Button>
        }
      />
      <div className="rd-inside rounded-[8px] border border-hairline-soft bg-white overflow-hidden overflow-x-auto">
        <table className="w-full min-w-[860px] text-sm">
          <thead>
            <tr className="bg-canvas-soft text-ink-soft text-xs border-b border-hairline-soft">
              <th className="text-start p-4 font-semibold">دوره</th>
              <th className="text-start p-4 font-semibold">نوع</th>
              <th className="text-start p-4 font-semibold">استاد</th>
              <th className="text-start p-4 font-semibold">ظرفیت</th>
              <th className="text-start p-4 font-semibold">شهریه</th>
              <th className="text-start p-4 font-semibold">وضعیت</th>
              <th className="p-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {courses.map((c, i) => (
              <tr
                key={c.id}
                className={`cursor-pointer transition-colors hover:bg-canvas-soft/60 ${i % 2 ? "bg-canvas-soft/50" : ""}`}
                onClick={() => navigate(`/admin/classes/${c.id}`)}
              >
                <td className="p-4">
                  <p className="font-bold text-ink">{c.title}</p>
                  <p className="text-[11px] text-ink-soft mt-0.5">{c.language} — سطح {c.level}</p>
                </td>
                <td className="p-4">
                  <Badge className={c.type === "online" ? "bg-ink-strong text-white hover:bg-ink-strong" : "bg-canvas-soft text-ink hover:bg-canvas-soft"}>
                    {c.type === "online" ? "آنلاین" : "حضوری"}
                  </Badge>
                </td>
                <td className="p-4 text-ink">{teachers.find((t) => t.id === c.teacherId)?.name ?? <span className="text-bad text-xs font-bold">بدون استاد</span>}</td>
                <td className="p-4">
                  {c.capacity ? (
                    <span className={`font-bold ${c.enrolled / c.capacity > 0.8 ? "text-bad" : "text-ink"}`}>
                      {faNum(c.enrolled)}/{faNum(c.capacity)}
                    </span>
                  ) : (
                    <span className="text-ink-soft text-xs">نامحدود</span>
                  )}
                </td>
                <td className="p-4 font-extrabold text-ink">{faPrice(c.price)}</td>
                <td className="p-4"><StatusBadge status={c.status} /></td>
                <td className="p-4" onClick={(e) => e.stopPropagation()}>
                  <div className="flex gap-1.5 justify-end">
                    <Button size="sm" variant="outline" className="h-8 border-hairline text-ink" onClick={() => navigate(`/admin/classes/${c.id}`)}>
                      مدیریت
                    </Button>
                    <Button size="sm" variant="outline" className="h-8 border-hairline text-ink" onClick={() => navigate(`/admin/classes/${c.id}`)}>
                      لیست دانشجویان
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-[11px] text-ink-soft leading-6">
        قوانین ظرفیت: با پر شدن ظرفیت، ثبت‌نام خودکار بسته می‌شود و فرم «لیست انتظار» فعال می‌گردد. دوره آنلاین محدودیت ظرفیت ندارد.
      </p>

      {/* فرم دوره جدید */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-black-fa text-ink">تعریف کلاس جدید</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <Label>عنوان دوره</Label>
                <Input className="mt-1.5 h-10" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="مثلاً زبان ترکی A1" />
              </div>
              <div>
                <Label>نوع</Label>
                <Select value={form.type} onValueChange={(v) => setForm((f) => ({ ...f, type: v }))}>
                  <SelectTrigger className="mt-1.5 h-10"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="offline">حضوری</SelectItem>
                    <SelectItem value="online">آنلاین ویدئویی</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>ظرفیت (فقط حضوری)</Label>
                <Input className="mt-1.5 h-10" value={form.capacity} onChange={(e) => setForm((f) => ({ ...f, capacity: e.target.value.replace(/[^\d]/g, "") }))} placeholder="۱۵" dir="ltr" inputMode="numeric" disabled={form.type === "online"} />
              </div>
              <div>
                <Label>شهریه (تومان)</Label>
                <Input className="mt-1.5 h-10" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value.replace(/[^\d]/g, "") }))} placeholder="۵٬۰۰۰٬۰۰۰" dir="ltr" inputMode="numeric" />
              </div>
              <div>
                <Label>استاد</Label>
                <Select value={form.teacherId} onValueChange={(v) => setForm((f) => ({ ...f, teacherId: v }))}>
                  <SelectTrigger className="mt-1.5 h-10"><SelectValue placeholder="انتخاب" /></SelectTrigger>
                  <SelectContent>
                    {teachers.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <p className="text-[11px] text-ink-soft">کلاس بدون استاد نمی‌تواند فعال شود. برای دوره آنلاین، پس از انتشار می‌توانید ویدئوها را آپلود کنید.</p>
            <Button
              className="w-full h-11 bg-rd-deep text-primary-foreground hover:bg-navy-700 font-bold"
              onClick={() => {
                if (!form.title.trim()) {
                  toast({ title: "عنوان دوره الزامی است", variant: "destructive" });
                  return;
                }
                const id = addCourse({
                  title: form.title.trim(),
                  type: form.type as "online" | "offline",
                  capacity: form.capacity ? Number(form.capacity) : undefined,
                  price: Number(form.price) || 0,
                  teacherId: form.teacherId || null,
                });
                setOpen(false);
                toast({ title: "دوره ساخته شد ✓", description: "اکنون دانشجویان و تکالیف را از صفحه دوره مدیریت کنید." });
                navigate(`/admin/classes/${id}`);
              }}
            >
              ایجاد دوره
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ------------------------------ دانشجویان -------------------------------- */

function AdminStudents() {
  const { navigate } = useRouter();
  const { students } = useStore();
  const [q, setQ] = React.useState("");
  const [filter, setFilter] = React.useState("all");
  const list = students.filter((s) => (!q || s.name.includes(q)) && (filter === "all" || s.status === filter));
  return (
    <div>
      <PanelHeading
        title="مدیریت دانشجویان"
        desc="پرونده هر دانشجو: کلاس‌ها، پرداخت‌ها، حضور و نمرات — برای مشاهده پرونده روی هر ردیف کلیک کنید."
        action={
          <Button className="bg-rd-deep text-primary-foreground hover:bg-navy-700 font-bold" onClick={() => navigate("/admin/students/new")}>
            <Plus className="size-4 me-1.5" /> ثبت‌نام دستی
          </Button>
        }
      />
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-52 max-w-sm">
          <Search className="size-4 absolute end-3 top-1/2 -translate-y-1/2 text-ink-soft" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="جستجوی نام…" className="h-11 pe-9" />
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="h-11 w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">همه وضعیت‌ها</SelectItem>
            <SelectItem value="فعال">فعال</SelectItem>
            <SelectItem value="در انتظار پرداخت">در انتظار پرداخت</SelectItem>
            <SelectItem value="غیرفعال">غیرفعال</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {list.length === 0 ? (
        <div className="rounded-[8px] border border-dashed border-hairline-soft bg-white p-10 text-center">
          <p className="font-bold text-ink">دانشجویی پیدا نشد</p>
          <p className="mt-1 text-sm text-ink-soft">جستجو یا فیلتر را تغییر دهید.</p>
        </div>
      ) : (
      <div className="rd-inside rounded-[8px] border border-hairline-soft bg-white overflow-hidden overflow-x-auto">
        <table className="w-full min-w-[820px] text-sm">
          <thead>
            <tr className="bg-canvas-soft text-ink-soft text-xs border-b border-hairline-soft">
              <th className="text-start p-4 font-semibold">دانشجو</th>
              <th className="text-start p-4 font-semibold">دوره‌ها</th>
              <th className="text-start p-4 font-semibold">حضور</th>
              <th className="text-start p-4 font-semibold">میانگین</th>
              <th className="text-start p-4 font-semibold">مانده حساب</th>
              <th className="text-start p-4 font-semibold">وضعیت</th>
              <th className="p-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {list.map((s, i) => (
              <tr
                key={s.id}
                className={`cursor-pointer transition-colors hover:bg-canvas-soft/60 ${i % 2 ? "bg-canvas-soft/50" : ""}`}
                onClick={() => navigate(`/admin/students/${s.id}`)}
              >
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <span className="grid size-9 place-items-center rounded-full bg-canvas-soft text-ink text-xs font-black-fa">{s.name[0]}</span>
                    <div>
                      <p className="font-bold text-ink">{s.name}</p>
                      <p className="text-[11px] text-ink-soft" dir="ltr">{s.phone}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4 text-ink-soft">{s.courseIds.length ? faNum(s.courseIds.length) : "—"} دوره</td>
                <td className="p-4 font-bold text-ink">{s.attendance ? `${fa(s.attendance)}٪` : "—"}</td>
                <td className="p-4 font-black-fa text-ink">{s.avg ? fa(s.avg.toFixed(1)) : "—"}</td>
                <td className={`p-4 font-bold ${s.balance > 0 ? "text-bad" : "text-ok"}`}>{s.balance ? faPrice(s.balance) : "تسویه"}</td>
                <td className="p-4"><StatusBadge status={s.status} /></td>
                <td className="p-4" onClick={(e) => e.stopPropagation()}>
                  <div className="flex gap-1.5 justify-end">
                    <Button size="sm" variant="outline" className="h-8 border-hairline text-ink" onClick={() => navigate(`/admin/students/${s.id}`)}>پرونده</Button>
                    <Button size="sm" variant="outline" className="h-8 border-hairline text-ink" onClick={() => navigate(`/admin/students/${s.id}/edit`)}>ویرایش</Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      )}
    </div>
  );
}

/* -------------------------------- اساتید --------------------------------- */

function AdminTeachers() {
  const { navigate } = useRouter();
  const { teachers, courses } = useStore();
  return (
    <div>
      <PanelHeading
        title="مدیریت اساتید"
        desc="پرونده کامل هر استاد: دوره‌ها، دانشجویان، تکالیف و بازخوردها."
        action={
          <Button className="bg-rd-deep text-primary-foreground hover:bg-navy-700 font-bold" onClick={() => navigate("/admin/teachers/new")}>
            <Plus className="size-4 me-1.5" /> استاد جدید
          </Button>
        }
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {teachers.map((t) => (
          <div key={t.id} className="rd-inside rounded-[8px] border border-hairline-soft bg-white p-5 hover:border-hairline transition-colors">
            <button onClick={() => navigate(`/admin/teachers/${t.id}`)} className="flex items-center gap-3 text-start w-full">
              <img src={t.image} alt={t.name} className="size-14 rounded-[8px] object-cover" />
              <div className="min-w-0">
                <p className="font-bold text-ink text-sm truncate">{t.name}</p>
                <p className="text-[11px] text-ink font-semibold">{t.title}</p>
                <p className="text-[11px] text-ink-soft mt-0.5">امتیاز {fa(t.rating)} — {faNum(courses.filter((c) => c.teacherId === t.id).length)} دوره</p>
              </div>
            </button>
            <div className="mt-4 flex gap-2">
              <Button size="sm" variant="outline" className="flex-1 h-9 border-hairline text-ink" onClick={() => navigate(`/admin/teachers/${t.id}`)}>پرونده و تخصیص کلاس</Button>
              <Button size="sm" variant="outline" className="flex-1 h-9 border-hairline text-ink" onClick={() => navigate(`/admin/teachers/${t.id}/edit`)}>ویرایش</Button>
            </div>
            <p className="mt-3 text-[10px] text-ink-soft">
              تداخل زمانی کلاس‌های حضوری: <span className="text-ok font-bold">ندارد</span>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* -------------------------------- فروشگاه -------------------------------- */

type LocalCheckoutOrder = {
  code: string;
  items: { type: "course" | "book"; title: string; price: number; qty: number }[];
  total: number;
  name: string;
  phone: string;
  address?: string;
  at: string;
};

function AdminShop() {
  const { toast } = useToast();
  const [orders, setOrders] = React.useState(shopOrders);
  const [checkoutOrders, setCheckoutOrders] = React.useState<LocalCheckoutOrder[]>([]);

  React.useEffect(() => {
    try {
      const raw = window.localStorage.getItem("edc-orders");
      if (!raw) return;
      const parsed: unknown = JSON.parse(raw);
      if (Array.isArray(parsed)) setCheckoutOrders(parsed as LocalCheckoutOrder[]);
    } catch {
      setCheckoutOrders([]);
    }
  }, []);

  const nextShip: Partial<Record<ShopOrder["shipping"], ShopOrder["shipping"]>> = { "در حال آماده‌سازی": "ارسال‌شده", "ارسال‌شده": "تحویل‌شده" };
  const advance = (id: string) => {
    setOrders((os) => os.map((o) => (o.id === id && o.shipping in nextShip ? { ...o, shipping: nextShip[o.shipping]! } : o)));
    toast({ title: "وضعیت ارسال به‌روزرسانی شد ✓" });
  };

  return (
    <div className="space-y-6">
      <div>
        <PanelHeading
          title="سفارش‌های ثبت‌شده"
          desc="سفارش‌های ثبت‌شده از سبد خرید در همین مرورگر؛ وضعیت پرداخت نمایشی است."
        />
        {checkoutOrders.length === 0 ? (
          <div className="rd-inside rounded-[8px] border border-hairline-soft bg-white px-5 py-8 text-center text-[12px] text-ink-soft">
            هنوز سفارشی از فرایند خرید ثبت نشده است.
          </div>
        ) : (
          <div className="grid gap-3">
            {[...checkoutOrders].reverse().map((order) => (
              <article key={order.code} className="rd-inside rounded-[8px] border border-hairline-soft bg-white p-4 sm:p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-[12px] font-bold text-ink">{order.name}</p>
                    <p className="dc-mono mt-0.5 text-[10px] text-rd-accent" dir="ltr">{order.code}</p>
                  </div>
                  <span className="rounded-full bg-warn/10 px-2.5 py-1 text-[10px] font-bold text-warn">پرداخت نمایشی</span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {order.items.map((item, index) => (
                    <span key={`${item.type}-${item.title}-${index}`} className="rounded-full bg-canvas-soft px-2.5 py-1 text-[11px] text-ink-soft">
                      {item.type === "course" ? "دوره" : "کتاب"}: {item.title}{item.qty > 1 ? ` × ${faNum(item.qty)}` : ""}
                    </span>
                  ))}
                </div>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-hairline-soft pt-3 text-[11px] text-ink-soft">
                  <span dir="ltr">{order.phone}</span>
                  <span>{order.at}</span>
                  <strong className="text-[13px] text-ink">{faPrice(order.total)}</strong>
                </div>
                {order.address && <p className="mt-2 text-[11px] leading-6 text-ink-soft">آدرس ارسال: {order.address}</p>}
              </article>
            ))}
          </div>
        )}
      </div>

      <div>
        <PanelHeading
          title="سفارش‌های فروشگاه"
          desc="مدیریت وضعیت ارسال و ثبت شماره مرسوله."
          action={
            <Button variant="outline" className="border-hairline text-ink" onClick={() => toast({ title: "خروجی اکسل آماده شد ✓" })}>
              خروجی اکسل
            </Button>
          }
        />
        <div className="rd-inside rounded-[8px] border border-hairline-soft bg-white overflow-hidden overflow-x-auto">
          <table className="w-full min-w-[780px] text-sm">
            <thead>
              <tr className="bg-canvas-soft text-ink-soft text-xs border-b border-hairline-soft">
                <th className="text-start p-4 font-semibold">سفارش</th>
                <th className="text-start p-4 font-semibold">خریدار</th>
                <th className="text-start p-4 font-semibold">اقلام</th>
                <th className="text-start p-4 font-semibold">مبلغ</th>
                <th className="text-start p-4 font-semibold">پرداخت</th>
                <th className="text-start p-4 font-semibold">ارسال</th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {orders.map((o, i) => (
                <tr key={o.id} className={i % 2 ? "bg-canvas-soft/50" : ""}>
                  <td className="p-4 font-bold text-ink">{o.id}</td>
                  <td className="p-4">{o.customer}</td>
                  <td className="p-4 text-ink-soft">{o.items}</td>
                  <td className="p-4 font-extrabold text-ink">{faPrice(o.total)}</td>
                  <td className="p-4"><StatusBadge status={o.payment === "پرداخت‌شده" ? "پرداخت‌شده" : "در انتظار"} /></td>
                  <td className="p-4">
                    <StatusBadge status={o.shipping} />
                    {o.tracking && <p className="text-[10px] text-ink-soft mt-1" dir="ltr">{o.tracking}</p>}
                  </td>
                  <td className="p-4">
                    {nextShip[o.shipping] ? (
                      <Button size="sm" className="h-8 bg-navy-deep text-white hover:bg-navy-700" onClick={() => advance(o.id)}>
                        <ArrowLeft className="size-3.5 me-1" /> {nextShip[o.shipping]}
                      </Button>
                    ) : (
                      <span className="text-[11px] text-ok font-bold">تکمیل</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <PanelHeading title="محصولات و موجودی" desc="هشدار کمبود موجودی فعال است." />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((p) => (
            <div key={p.id} className="flex items-center gap-3 rd-inside rounded-[8px] border border-hairline-soft bg-white p-3.5">
              <img src={p.image} alt="" className="size-14 rounded-[8px] object-cover shrink-0" loading="lazy" />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-ink truncate">{p.title}</p>
                <p className="text-[11px] text-ink-soft">{faPrice(p.price)}</p>
                <p className={`text-[10px] font-bold mt-0.5 ${p.stock < 20 ? "text-bad" : "text-ok"}`}>
                  موجودی: {faNum(p.stock)} {p.stock < 20 && "— کم!"}
                </p>
              </div>
              <PackageCheck className="size-4 text-ink-soft shrink-0" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

