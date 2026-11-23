"use client";

import React from "react";
import {
  ArrowLeft,
  Check,
  ClipboardCheck,
  CreditCard,
  MapPin,
  MessageCircle,
  Minus,
  Plus,
  ShoppingBag,
  Tag,
  Trash2,
  User,
} from "lucide-react";
import { useCart, type CartItem } from "@/lib/cart-context";
import {
  discountAmount,
  discountCodes,
  formatToman,
  freeShippingOver,
  shippingCost,
} from "@/lib/site-data";
import {
  CITIES_BY_PROVINCE,
  IRAN_PROVINCES,
  addAddress,
  addrOneLine,
  loadAddresses,
  removeAddress,
  type SavedAddress,
} from "@/lib/addresses";
import { SiteLink } from "@/components/site/shared";
import { faNum } from "@/components/site/pages-shared";
import { RdBand, RdSection, RdWrap } from "@/components/site/home";
import { useToast } from "@/hooks/use-toast";

const WA_NUMBER = "989120000000";
const ORDERS_KEY = "edc-orders";

/* سفارش ثبت‌شده — پس از ثبت در localStorage نگه داشته می‌شود (پروسهٔ ثبت سفارش) */
type PlacedOrder = {
  code: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  discountCode?: string;
  shipping: number;
  total: number;
  name: string;
  phone: string;
  addressTitle?: string;
  address?: string;
  province?: string;
  city?: string;
  postalCode?: string;
  addrNote?: string;
  note?: string;
  pay: "online" | "expert";
  at: string;
};

/* شماره موبایل فارسی/لاتین → فقط رقم لاتین برای اعتبارسنجی */
function normalizePhone(p: string) {
  return p.replace(/[\s\-()]/g, "").replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)));
}

function orderMessage(o: PlacedOrder) {
  const lines = o.items.map(
    (it, i) => `${faNum(i + 1)}) ${it.title}${it.qty > 1 ? ` × ${faNum(it.qty)}` : ""} — ${formatToman(it.price * it.qty)}`,
  );
  const place = [o.province, o.city].filter(Boolean).join("، ");
  return encodeURIComponent(
    `سلام! سفارش ${o.code} را ثبت کرده‌ام:\n${lines.join("\n")}\n` +
      (o.discount ? `تخفیف‌ها (${o.discountCode}): −${formatToman(o.discount)} تومان\n` : "") +
      (o.shipping ? `هزینه ارسال: ${formatToman(o.shipping)} تومان\n` : "") +
      `مبلغ کل: ${formatToman(o.total)} تومان\n` +
      `روش پرداخت: آنلاین\nنام: ${o.name}\nموبایل: ${o.phone}` +
      (o.addressTitle ? `\nعنوان آدرس: ${o.addressTitle}` : "") +
      (place ? `\nاستان/شهر: ${place}` : "") +
      (o.address ? `\nآدرس ارسال: ${o.address}` : "") +
      (o.note ? `\nتوضیحات: ${o.note}` : "") +
      `\nلطفاً برای تأیید سفارش راهنمایی بفرمایید.`,
  );
}

/* ردیف‌های جمع سفارش — مشترک بین کارت خلاصه و صفحهٔ موفقیت */
function SummaryLines({
  subtotal,
  discount,
  code,
  shipping,
  total,
  hasBooks,
  addressTitle,
}: {
  subtotal: number;
  discount: number;
  code?: string;
  shipping: number;
  total: number;
  hasBooks: boolean;
  addressTitle?: string;
}) {
  return (
    <ul className="space-y-2 text-[12.5px]">
      <li className="flex items-center justify-between gap-3 text-ink-soft">
        <span>کالاهای انتخابی</span>
        <span className="font-bold text-ink">{formatToman(subtotal)}</span>
      </li>
      {discount > 0 && (
        <li className="flex items-center justify-between gap-3 text-ok">
          <span>
            تخفیف‌ها
            {code && <span className="ms-1.5 text-[10.5px] font-bold">({code})</span>}
          </span>
          <span className="font-bold">−{formatToman(discount)}</span>
        </li>
      )}
      <li className="flex items-center justify-between gap-3 text-ink-soft">
        <span>
          هزینه ارسال
          {!hasBooks && <span className="ms-1.5 text-[10.5px] text-ink-faint">(فقط کتاب‌ها)</span>}
        </span>
        {shipping === 0 && hasBooks ? (
          <span className="font-bold text-ok">رایگان</span>
        ) : (
          <span className="font-bold text-ink">{formatToman(shipping)}</span>
        )}
      </li>
      {addressTitle && (
        <li className="flex items-center justify-between gap-3 text-ink-soft">
          <span>عنوان آدرس</span>
          <span className="max-w-[60%] truncate font-bold text-ink">{addressTitle}</span>
        </li>
      )}
      <li className="flex items-center justify-between gap-3 border-t border-hairline-soft pt-2.5">
        <span className="text-[13.5px] font-black-fa text-ink">مبلغ کل</span>
        <span className="text-[16px] font-black-fa text-ink">
          {formatToman(total)} <span className="text-[11px] font-bold text-ink-soft">تومان</span>
        </span>
      </li>
    </ul>
  );
}

/* ورودی متنی — هم‌الگوی فرم ثبت سفارش و همهٔ فرم‌های سایت */
const fieldCls =
  "h-10 w-full rounded-[8px] bg-white px-3.5 text-[13px] text-ink outline-none ring-1 ring-hairline-soft placeholder:text-ink-faint focus:ring-2 focus:ring-rd-accent/40";

export function CartPage() {
  const { items, remove, setQty, clear, total } = useCart();
  const { toast } = useToast();
  /* فرم ثبت سفارش */
  const [name, setName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [note, setNote] = React.useState("");
  /* آدرس‌های ذخیره‌شده + انتخاب + فرم آدرس جدید */
  const [addresses, setAddresses] = React.useState<SavedAddress[]>([]);
  const [selectedId, setSelectedId] = React.useState<string>("");
  const [showNew, setShowNew] = React.useState(false);
  const [fTitle, setFTitle] = React.useState("");
  const [fProvince, setFProvince] = React.useState("گیلان");
  const [fCity, setFCity] = React.useState("رشت");
  const [fLine, setFLine] = React.useState("");
  const [fPostal, setFPostal] = React.useState("");
  const [fNote, setFNote] = React.useState("");
  const [saveAddr, setSaveAddr] = React.useState(true);
  /* کد تخفیف */
  const [promo, setPromo] = React.useState("");
  const [applied, setApplied] = React.useState<string | null>(null);
  /* سفارش تازه ثبت‌شده — صفحهٔ موفقیت را نشان می‌دهد */
  const [placed, setPlaced] = React.useState<PlacedOrder | null>(null);
  /* سفارش در انتظار پرداخت در درگاه نمایشی */
  const [gw, setGw] = React.useState<PlacedOrder | null>(null);

  /* آدرس‌های ذخیره‌شده از localStorage — مشترک با «آدرس‌های من» پنل دانشجو */
  React.useEffect(() => {
    const list = loadAddresses();
    setAddresses(list);
    if (list.length > 0) setSelectedId(list[0].id);
  }, []);

  const hasBooks = items.some((it) => it.type === "book");
  const subtotal = total;
  const discount = applied ? discountAmount(applied, subtotal) : 0;
  const afterDiscount = subtotal - discount;
  const shipping = hasBooks ? (afterDiscount >= freeShippingOver ? 0 : shippingCost) : 0;
  const grand = afterDiscount + shipping;

  /* آدرس فعال — ذخیره‌شده یا فرم جدید */
  const selectedSaved = addresses.find((a) => a.id === selectedId);
  const addrTitle = selectedSaved ? selectedSaved.title : showNew || selectedId === "new" ? fTitle : "";
  const fullAddress = selectedSaved ? addrOneLine(selectedSaved) : "";

  const applyPromo = () => {
    const code = promo.trim().toUpperCase();
    if (!code) return;
    if (!discountCodes[code]) {
      toast({ title: "کد تخفیف معتبر نیست.", description: "کد را بررسی کنید و دوباره امتحان کنید.", variant: "destructive" });
      return;
    }
    setApplied(code);
    setPromo("");
    toast({ title: "کد تخفیف اعمال شد ✔", description: discountCodes[code].label });
  };

  /* اعتبارسنجی آدرس جدید — برای ارسال کتاب لازم است */
  const validateNewAddr = (): SavedAddress | null => {
    if (!fTitle.trim()) {
      toast({ title: "عنوان آدرس را وارد کنید.", description: "مثلاً خانه یا محل کار", variant: "destructive" });
      return null;
    }
    if (!fProvince || !fCity) {
      toast({ title: "استان و شهر را انتخاب کنید.", variant: "destructive" });
      return null;
    }
    if (!fLine.trim()) {
      toast({ title: "نشانی پستی را وارد کنید.", variant: "destructive" });
      return null;
    }
    return {
      id: "new",
      title: fTitle.trim(),
      province: fProvince,
      city: fCity,
      line: fLine.trim(),
      postal: fPostal.trim() || undefined,
      note: fNote.trim() || undefined,
    };
  };

  const buildOrder = (): PlacedOrder | null => {
    if (!name.trim()) {
      toast({ title: "لطفاً نام و نام خانوادگی را وارد کنید.", variant: "destructive" });
      return null;
    }
    if (!/^0?9\d{9}$/.test(normalizePhone(phone))) {
      toast({ title: "شماره موبایل معتبر نیست.", description: "مثلاً 0912 000 0000", variant: "destructive" });
      return null;
    }
    if (hasBooks && !selectedSaved && (showNew || selectedId === "new" || addresses.length === 0)) {
      const a = validateNewAddr();
      if (!a) return null;
      if (saveAddr) {
        const next = addAddress(a);
        setAddresses(next);
      }
      return {
        code: `EDC-${String(Date.now()).slice(-6)}`,
        items,
        subtotal,
        discount,
        discountCode: applied ?? undefined,
        shipping,
        total: grand,
        name: name.trim(),
        phone: normalizePhone(phone),
        addressTitle: a.title,
        address: addrOneLine(a),
        province: a.province,
        city: a.city,
        postalCode: a.postal,
        addrNote: a.note,
        note: note.trim() || undefined,
        pay: "online",
        at: new Date().toLocaleDateString("fa-IR"),
      };
    }
    if (hasBooks && !selectedSaved) {
      toast({ title: "برای ارسال کتاب، آدرس را انتخاب کنید.", variant: "destructive" });
      return null;
    }
    return {
      code: `EDC-${String(Date.now()).slice(-6)}`,
      items,
      subtotal,
      discount,
      discountCode: applied ?? undefined,
      shipping,
      total: grand,
      name: name.trim(),
      phone: normalizePhone(phone),
      addressTitle: selectedSaved?.title,
      address: selectedSaved ? addrOneLine(selectedSaved) : undefined,
      province: selectedSaved?.province,
      city: selectedSaved?.city,
      postalCode: selectedSaved?.postal,
      addrNote: selectedSaved?.note,
      note: note.trim() || undefined,
      pay: "online",
      at: new Date().toLocaleDateString("fa-IR"),
    };
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const order = buildOrder();
    if (!order) return;
    setGw(order);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const place = (order: PlacedOrder) => {
    try {
      const raw = window.localStorage.getItem(ORDERS_KEY);
      const list = raw ? (JSON.parse(raw) as PlacedOrder[]) : [];
      list.push(order);
      window.localStorage.setItem(ORDERS_KEY, JSON.stringify(list));
    } catch {
      /* localStorage در دسترس نیست — سفارش در همین نشست معتبر می‌ماند */
    }
    setGw(null);
    setPlaced(order);
    clear();
    toast({
      title: "سفارش شما ثبت شد ✔",
      description: `کد سفارش ${order.code}`,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <RdSection id="cart" fadeTop>
        <RdBand className="top-0" />
        <RdWrap pb="pb-[62px] sm:pb-[72px] xl:pb-[79px]">
          <div className="mx-auto max-w-[980px] space-y-5">
            {/* ------------------------ درگاه پرداخت نمایشی ------------------------ */}
            {gw ? (
              <div className="rd-inside mx-auto max-w-[480px] rounded-[8px] bg-white p-6 text-center sm:p-10">
                <span className="mx-auto grid size-14 place-items-center rounded-full bg-rd-accent/10 text-rd-accent">
                  <CreditCard className="size-7" />
                </span>
                <h1 className="mt-4 flex items-center justify-center gap-2 font-black-fa text-[18px] text-ink">
                  درگاه پرداخت آنلاین
                  <span className="rounded-full bg-canvas-soft px-2.5 py-0.5 text-[10.5px] font-bold text-ink-faint">نمایشی</span>
                </h1>
                <p className="dc-mono mt-2 text-[12px] text-ink-faint" dir="ltr">
                  ELMIRA DEUTSCH CLINIC
                </p>
                <div className="rd-inside mt-5 rounded-[8px] bg-canvas-soft/60 p-4 text-start">
                  <p className="text-[12px] text-ink-faint">کد سفارش</p>
                  <p className="dc-mono text-[13px] font-bold text-rd-accent" dir="ltr">
                    {gw.code}
                  </p>
                  <p className="mt-3 text-[12px] text-ink-faint">مبلغ قابل پرداخت</p>
                  <p className="text-[20px] font-black-fa text-ink">
                    {formatToman(gw.total)} <span className="text-[12px] font-bold text-ink-soft">تومان</span>
                  </p>
                </div>
                <div className="mt-5 flex gap-2">
                  <button
                    type="button"
                    onClick={() => place(gw)}
                    className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-rd-deep text-[13.5px] font-extrabold text-white transition-colors hover:bg-navy-700 active:scale-[0.99]"
                  >
                    <Check className="size-4" strokeWidth={3} />
                    پرداخت
                  </button>
                  <button
                    type="button"
                    onClick={() => setGw(null)}
                    className="rd-inside inline-flex h-11 flex-1 items-center justify-center rounded-full bg-white text-[13px] font-bold text-ink transition-colors hover:bg-canvas-soft"
                  >
                    انصراف
                  </button>
                </div>
                <p className="mt-3 text-[10.5px] leading-5 text-ink-faint">
                  این درگاه فقط برای نمایش مراحل خرید است؛ پرداخت واقعی انجام نمی‌شود.
                </p>
              </div>
            ) : placed ? (
              /* ------------------------- صفحهٔ موفقیت ثبت سفارش ------------------------- */
              <div className="rd-inside rounded-[8px] bg-white p-6 text-center sm:p-10">
                <span className="mx-auto grid size-14 place-items-center rounded-full bg-ok/10 text-ok">
                  <ClipboardCheck className="size-7" />
                </span>
                <h1 className="mt-4 font-black-fa text-[20px] text-ink">سفارش شما ثبت شد ✔</h1>
                <p className="mt-2 text-[13px] text-ink-soft">
                  کد سفارش:{" "}
                  <span className="dc-mono rounded-[6px] bg-canvas-soft px-2 py-0.5 font-bold text-rd-accent" dir="ltr">
                    {placed.code}
                  </span>
                  <span className="ms-2 text-[12px] text-ink-faint">({placed.at})</span>
                </p>
                <p className="mx-auto mt-3 max-w-[520px] text-[12.5px] leading-6 text-ink-soft">
                  پرداخت آنلاین نمایشی انجام شد؛ کارشناس کلینیک برای نهایی‌کردن ثبت‌نام با شما تماس می‌گیرد.
                </p>
                {/* خلاصهٔ سفارش — کالاهای انتخابی + تخفیف/ارسال/مبلغ کل */}
                <div className="rd-inside mx-auto mt-5 max-w-[560px] rounded-[8px] bg-canvas-soft/60 p-4 text-start">
                  <SummaryLines
                    subtotal={placed.subtotal}
                    discount={placed.discount}
                    code={placed.discountCode}
                    shipping={placed.shipping}
                    total={placed.total}
                    hasBooks={placed.items.some((it) => it.type === "book")}
                    addressTitle={placed.addressTitle}
                  />
                </div>
                <ul className="mx-auto mt-3 max-w-[560px] space-y-2 text-start">
                  {placed.items.map((it) => (
                    <li
                      key={it.id}
                      className="flex items-center justify-between gap-3 rounded-[8px] border border-hairline-soft px-3.5 py-2.5"
                    >
                      <span className="min-w-0 truncate text-[13px] font-bold text-ink">
                        {it.title}
                        {it.qty > 1 && <span className="ms-1.5 text-[11px] font-normal text-ink-faint">× {faNum(it.qty)}</span>}
                      </span>
                      <span className="shrink-0 text-[12.5px] font-bold text-ink-soft">
                        {formatToman(it.price * it.qty)}
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="rd-inside mx-auto mt-4 max-w-[560px] rounded-[8px] bg-canvas-soft/60 p-4 text-start text-[12px] leading-6 text-ink-soft">
                  {placed.address && (
                    <p>
                      {placed.addressTitle && <span className="font-bold text-ink">{placed.addressTitle} — </span>}
                      آدرس: {placed.address}
                    </p>
                  )}
                  {placed.addrNote && <p className="mt-1.5">توضیحات آدرس: {placed.addrNote}</p>}
                  {placed.note && <p className="mt-1.5">توضیحات سفارش: {placed.note}</p>}
                </div>
                <div className="mt-5 flex flex-wrap justify-center gap-2">
                  <a
                    href={`https://wa.me/${WA_NUMBER}?text=${orderMessage(placed)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-10 items-center gap-2 rounded-full bg-rd-deep px-5 text-[13px] font-extrabold text-white transition-colors hover:bg-navy-700"
                  >
                    <MessageCircle className="size-4" />
                    ارسال سفارش به واتساپ
                  </a>
                  <SiteLink
                    href="/shop"
                    className="rd-inside inline-flex h-10 items-center gap-2 rounded-full bg-white px-5 text-[13px] font-bold text-ink transition-colors hover:bg-canvas-soft"
                  >
                    ادامهٔ خرید
                    <ArrowLeft className="size-4" />
                  </SiteLink>
                </div>
                <p className="mt-3 text-[11px] text-ink-faint">
                  فهرست سفارش به‌صورت آماده در پیام واتساپ نوشته می‌شود؛ فقط دکمهٔ ارسال را بزنید.
                </p>
              </div>
            ) : (
              <>
                {/* --------------- سربرگ کوتاه صفحه — بدون هیروسکشن --------------- */}
                <div className="flex flex-wrap items-end justify-between gap-2">
                  <h1 className="flex items-center gap-2.5 font-black-fa text-[20px] text-ink">
                    <ShoppingBag className="size-5 text-rd-accent" />
                    سبد خرید
                    {items.length > 0 && (
                      <span className="text-sm font-medium text-ink-faint">({faNum(items.length)} مورد)</span>
                    )}
                  </h1>
                  <p className="text-[12px] text-ink-faint">دوره‌ها و کتاب‌های انتخابی شما — پرداخت آنلاین</p>
                </div>
                {items.length === 0 ? (
                  /* ------------------------------ سبد خالی ------------------------------ */
                  <div className="rd-inside rounded-[8px] bg-white p-10 text-center">
                    <p className="text-sm font-bold text-ink">سبد خرید شما خالی است.</p>
                    <p className="mt-2 text-[12.5px] leading-6 text-ink-soft">
                      دوره‌ها و کتاب‌های مورد نظرتان را انتخاب کنید؛ ثبت سفارش و پرداخت آنلاین از همین سبد انجام می‌شود.
                    </p>
                    <div className="mt-5 flex flex-wrap justify-center gap-2">
                      <SiteLink
                        href="/courses"
                        className="inline-flex h-10 items-center gap-2 rounded-full bg-rd-deep px-5 text-[13px] font-extrabold text-white transition-colors hover:bg-navy-700"
                      >
                        مشاهده دوره‌ها
                        <ArrowLeft className="size-4" />
                      </SiteLink>
                      <SiteLink
                        href="/shop"
                        className="rd-inside inline-flex h-10 items-center rounded-full bg-white px-5 text-[13px] text-ink transition-colors hover:bg-canvas-soft"
                      >
                        فروشگاه کتاب‌ها
                      </SiteLink>
                    </div>
                  </div>
                ) : (
                  /* ------------------- کالاهای انتخابی + فرم ثبت سفارش ------------------- */
                  <div className="mt-1 grid gap-5 lg:grid-cols-[1fr_320px] lg:items-start">
                    <div className="space-y-5">
                      {/* کالاهای انتخابی */}
                      <section aria-label="کالاهای انتخابی">
                        <h2 className="text-[13px] font-black-fa text-ink">کالاهای انتخابی</h2>
                        <ul className="mt-2.5 space-y-3">
                          {items.map((it) => (
                            <li
                              key={it.id}
                              className="flex flex-wrap items-center gap-3 rounded-[8px] border border-hairline-soft p-3.5 sm:flex-nowrap sm:gap-4"
                            >
                              <img
                                src={it.image}
                                alt={it.title}
                                className="size-20 shrink-0 rounded-[8px] object-cover"
                              />
                              {/* در موبایل حداقل‌عرض بلوک متن، استپر/حذف را به خط دوم می‌برد تا عنوان تریده نشود */}
                              <div className="min-w-0 flex-1 max-sm:min-w-[calc(100%-92px)]">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span
                                    className={`rounded-full px-2.5 py-0.5 text-[10.5px] font-bold ${
                                      it.type === "course" ? "bg-canvas-soft text-ink-soft" : "bg-canvas-soft text-rd-accent"
                                    }`}
                                  >
                                    {it.type === "course" ? "دوره" : "کتاب"}
                                  </span>
                                </div>
                                <p className="mt-1.5 truncate text-[13.5px] font-bold text-ink">{it.title}</p>
                                <p className="mt-1 text-[12.5px] font-bold text-ink-soft">
                                  {formatToman(it.price)}
                                  <span className="text-ink-faint"> × {faNum(it.qty)} = {formatToman(it.price * it.qty)}</span>
                                </p>
                              </div>
                              {/* استپر تعداد — هم‌الگوی صفحهٔ محصول */}
                              <div className="flex shrink-0 items-center gap-1 rounded-full border border-hairline-soft p-1">
                                <button
                                  type="button"
                                  onClick={() => setQty(it.id, it.qty - 1)}
                                  aria-label="کاهش تعداد"
                                  className="grid size-7 place-items-center rounded-full text-ink transition-colors hover:bg-canvas-soft"
                                >
                                  <Minus className="size-3.5" />
                                </button>
                                <span className="min-w-6 text-center text-[13px] font-black-fa text-ink">
                                  {faNum(it.qty)}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setQty(it.id, it.qty + 1)}
                                  aria-label="افزایش تعداد"
                                  className="grid size-7 place-items-center rounded-full text-ink transition-colors hover:bg-canvas-soft"
                                >
                                  <Plus className="size-3.5" />
                                </button>
                              </div>
                              <button
                                type="button"
                                title="حذف از سبد"
                                onClick={() => {
                                  remove(it.id);
                                  toast({ title: "از سبد خرید حذف شد" });
                                }}
                                className="grid size-9 shrink-0 place-items-center rounded-full border border-hairline-soft text-ink-soft transition-colors hover:border-bad/30 hover:bg-bad/10 hover:text-bad"
                              >
                                <Trash2 className="size-4" />
                              </button>
                            </li>
                          ))}
                        </ul>
                      </section>

                      {/* اطلاعات تماس — نام و موبایل برای پیگیری سفارش */}
                      <section aria-label="اطلاعات تماس" className="rounded-[8px] border border-hairline-soft p-4">
                        <h2 className="flex items-center gap-2 text-[13px] font-black-fa text-ink">
                          <User className="size-4 text-rd-accent" />
                          اطلاعات تماس
                        </h2>
                        <div className="mt-3.5 space-y-3">
                          <label className="block">
                            <span className="mb-1.5 block text-xs font-bold text-ink">نام و نام خانوادگی *</span>
                            <input
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                              placeholder="مثلاً سارا محمدی"
                              aria-label="نام و نام خانوادگی"
                              className={fieldCls}
                            />
                          </label>
                          <label className="block">
                            <span className="mb-1.5 block text-xs font-bold text-ink">شماره موبایل *</span>
                            <input
                              value={phone}
                              onChange={(e) => setPhone(e.target.value)}
                              inputMode="tel"
                              dir="ltr"
                              placeholder="0912 000 0000"
                              aria-label="شماره موبایل"
                              className={`${fieldCls} text-start`}
                            />
                          </label>
                          <label className="block">
                            <span className="mb-1.5 block text-xs font-bold text-ink">
                              توضیحات سفارش <span className="font-normal text-ink-faint">(اختیاری)</span>
                            </span>
                            <input
                              value={note}
                              onChange={(e) => setNote(e.target.value)}
                              placeholder="مثلاً ساعت مناسب تماس"
                              aria-label="توضیحات سفارش"
                              className={fieldCls}
                            />
                          </label>
                        </div>
                      </section>

                      {/* آدرس ارسال — انتخاب از آدرس‌های قبلی یا افزودن آدرس جدید (استان/شهر/نشانی/توضیحات) */}
                      <section aria-label="آدرس ارسال" className="rounded-[8px] border border-hairline-soft p-4">
                        <h2 className="flex items-center gap-2 text-[13px] font-black-fa text-ink">
                          <MapPin className="size-4 text-rd-accent" />
                          آدرس ارسال
                          <span className="text-[11px] font-normal text-ink-faint">
                            {hasBooks ? "(برای ارسال کتاب لازم است)" : "(اختیاری)"}
                          </span>
                        </h2>

                        {/* لیست آدرس‌های قبلی — انتخاب با رادیو */}
                        {addresses.length > 0 && (
                          <ul className="mt-3.5 space-y-2.5">
                            {addresses.map((a) => (
                              <li key={a.id}>
                                <label
                                  className={`flex cursor-pointer items-start gap-2.5 rounded-[8px] border p-3 transition-colors ${
                                    selectedId === a.id ? "border-rd-accent/50 bg-rd-accent/[0.04]" : "border-hairline-soft hover:bg-canvas-soft/60"
                                  }`}
                                >
                                  <input
                                    type="radio"
                                    name="saved-address"
                                    checked={selectedId === a.id}
                                    onChange={() => {
                                      setSelectedId(a.id);
                                      setShowNew(false);
                                    }}
                                    className="mt-0.5 accent-[#f80559]"
                                    aria-label={`انتخاب آدرس ${a.title}`}
                                  />
                                  <span className="min-w-0 flex-1">
                                    <span className="flex items-center gap-2">
                                      <span className="text-[12.5px] font-bold text-ink">{a.title}</span>
                                      {a.postal && <span className="text-[10px] text-ink-faint">کد پستی {faNum(a.postal)}</span>}
                                    </span>
                                    <span className="mt-0.5 block truncate text-[11.5px] leading-5 text-ink-soft">
                                      {addrOneLine(a)}
                                    </span>
                                    {a.note && <span className="mt-0.5 block text-[10.5px] text-ink-faint">توضیحات: {a.note}</span>}
                                  </span>
                                  <button
                                    type="button"
                                    title="حذف این آدرس"
                                    aria-label={`حذف آدرس ${a.title}`}
                                    onClick={(e) => {
                                      e.preventDefault();
                                      const next = removeAddress(a.id);
                                      setAddresses(next);
                                      if (selectedId === a.id) setSelectedId(next[0]?.id ?? "");
                                      toast({ title: "آدرس حذف شد" });
                                    }}
                                    className="grid size-7 shrink-0 place-items-center rounded-full text-ink-soft transition-colors hover:bg-bad/10 hover:text-bad"
                                  >
                                    <Trash2 className="size-3.5" />
                                  </button>
                                </label>
                              </li>
                            ))}
                          </ul>
                        )}

                        {/* افزودن آدرس جدید */}
                        {showNew || addresses.length === 0 ? (
                          <div className="mt-3.5 space-y-3 rounded-[8px] bg-canvas-soft/40 p-3.5">
                            <p className="text-[12px] font-black-fa text-ink">افزودن آدرس جدید</p>
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
                            <label className="block">
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
                            <label className="block">
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
                            <label className="flex items-center gap-2 text-[12px] text-ink-soft">
                              <input
                                type="checkbox"
                                checked={saveAddr}
                                onChange={(e) => setSaveAddr(e.target.checked)}
                                className="accent-[#f80559]"
                              />
                              ذخیره در «آدرس‌های من» برای خریدهای بعدی
                            </label>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setShowNew(true);
                              setSelectedId("new");
                            }}
                            className="mt-3.5 inline-flex h-9 items-center gap-2 rounded-full border border-hairline bg-white px-4 text-[12.5px] font-bold text-ink transition-colors hover:bg-canvas-soft"
                          >
                            <Plus className="size-4 text-rd-accent" />
                            افزودن آدرس جدید
                          </button>
                        )}

                        {hasBooks && (
                          <p className="mt-3 text-[10.5px] text-ink-faint">
                            کتاب‌های سبد با پست پیشتاز ارسال می‌شود.
                          </p>
                        )}
                      </section>

                      {/* کد تخفیف دارید؟ — درج کد در همین بخش */}
                      <section aria-label="کد تخفیف" className="rounded-[8px] border border-hairline-soft p-4">
                        <h2 className="flex items-center gap-2 text-[13px] font-black-fa text-ink">
                          <Tag className="size-4 text-rd-accent" />
                          کد تخفیف دارید؟
                        </h2>
                        {applied ? (
                          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-[8px] bg-ok/10 px-3.5 py-2.5">
                            <p className="text-[12.5px] font-bold text-ok">
                              <span className="dc-mono me-1.5" dir="ltr">{applied}</span>
                              {discountCodes[applied].label} اعمال شد
                            </p>
                            <button
                              type="button"
                              onClick={() => setApplied(null)}
                              className="text-[11.5px] font-bold text-ink-soft underline underline-offset-2 transition-colors hover:text-bad"
                            >
                              حذف کد
                            </button>
                          </div>
                        ) : (
                          <div className="mt-3 flex gap-2">
                            <input
                              value={promo}
                              onChange={(e) => setPromo(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  applyPromo();
                                }
                              }}
                              placeholder="مثلاً SALAM10"
                              aria-label="کد تخفیف"
                              dir="ltr"
                              className={`${fieldCls} flex-1 text-start dc-mono`}
                            />
                            <button
                              type="button"
                              onClick={applyPromo}
                              className="rd-inside h-10 shrink-0 rounded-[8px] bg-white px-5 text-[13px] font-bold text-ink transition-colors hover:bg-canvas-soft"
                            >
                              درج کد
                            </button>
                          </div>
                        )}
                      </section>
                    </div>

                    {/* جمع سفارش + تایید نهایی — پرداخت فقط آنلاین */}
                    <form
                      onSubmit={submit}
                      className="rd-inside rounded-[8px] bg-white p-5 lg:sticky lg:top-[80px]"
                      aria-label="جمع سفارش و ثبت"
                    >
                      <p className="text-[13px] font-black-fa text-ink">جمع سفارش</p>
                      <div className="mt-3">
                        <SummaryLines
                          subtotal={subtotal}
                          discount={discount}
                          code={applied ?? undefined}
                          shipping={shipping}
                          total={grand}
                          hasBooks={hasBooks}
                          addressTitle={selectedSaved?.title ?? (addrTitle || undefined)}
                        />
                      </div>
                      {/* روش پرداخت — فقط آنلاین (درخواست کاربر) */}
                      <div className="mt-4 flex items-center gap-2.5 rounded-[8px] border border-rd-accent/40 bg-rd-accent/[0.04] p-3">
                        <CreditCard className="size-4 shrink-0 text-rd-accent" />
                        <span className="min-w-0">
                          <span className="block text-[12.5px] font-bold text-ink">پرداخت آنلاین</span>
                          <span className="mt-0.5 block text-[11px] leading-5 text-ink-faint">
                            تسویه فوری در درگاه پرداخت امن
                          </span>
                        </span>
                      </div>
                      <button
                        type="submit"
                        className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-rd-deep text-[13.5px] font-extrabold text-white transition-colors hover:bg-navy-700 active:scale-[0.99]"
                      >
                        <Check className="size-4" strokeWidth={3} />
                        تایید نهایی و پرداخت
                      </button>
                      <p className="mt-2.5 text-center text-[10.5px] leading-5 text-ink-faint">
                        پس از تأیید، به درگاه پرداخت هدایت می‌شوید.
                      </p>
                      <div className="mt-3 flex gap-2 border-t border-hairline-soft pt-3">
                        <SiteLink
                          href="/courses"
                          className="rd-inside inline-flex h-9 flex-1 items-center justify-center rounded-full bg-white text-[12.5px] font-bold text-ink transition-colors hover:bg-canvas-soft"
                        >
                          دوره‌ها
                        </SiteLink>
                        <SiteLink
                          href="/shop"
                          className="rd-inside inline-flex h-9 flex-1 items-center justify-center rounded-full bg-white text-[12.5px] font-bold text-ink transition-colors hover:bg-canvas-soft"
                        >
                          فروشگاه
                        </SiteLink>
                      </div>
                    </form>
                  </div>
                )}
              </>
            )}
          </div>
        </RdWrap>
      </RdSection>
    </>
  );
}
