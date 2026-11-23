"use client";

import React from "react";
import { ChevronDown, Clock3, Instagram, LayoutDashboard, LogOut, Mail, MessageCircle, Send, ShoppingBag, UserRound, X } from "lucide-react";
import { useRouter } from "@/lib/app-context";
import { useCart } from "@/lib/cart-context";
import { ROLE_FA, useAuth, panelHref } from "@/lib/auth-context";
import { faNum } from "@/lib/format";
import { contactAddress, contactChannels } from "@/lib/site-data";
import { LoginSheet } from "@/components/site/login-sheet";

/* ------------------------------ لوگوی EDC ------------------------------ */

/** نشان کلینیک — بازسازی وکتوری دقیق لوگوی واقعی EDC (فایل رسمی لوگو):
    حباب گفتگوی سرخابی با گوشه‌های گرد و دُم در پایین + صلیب سفید گردگوشه */
export function EdcMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true" focusable="false">
      <path
        d="M14 4 H34 A10 10 0 0 1 44 14 V24 A10 10 0 0 1 34 34 H23 L11.8 43.4 C10.6 44.4 8.8 43.5 8.8 42 V14 A10 10 0 0 1 14 4 Z"
        fill="#F00050"
      />
      <path
        d="M24 12.5v15M16.5 20h15"
        stroke="#ffffff"
        strokeWidth="7"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

export function EdcLogo({ dark = false, className }: { dark?: boolean; className?: string }) {
  // لوگوی رسمی — دقیقاً فایل ارسالی کلینیک، بدون هیچ جایگزینی (M4)؛
  // روی زمینهٔ تیره، همان فایل بدون تغییر روی یک چیپ سفید می‌نشیند تا متن سرمه‌ای فایل خوانا بماند
  const img = (
    <img
      src="/images/edc/logo.png"
      alt="کلینیک آلمانی المیرا — Elmira Deutsch Clinic"
      // هدر: ۸٪ بزرگ‌تر از نسخهٔ قبل (لوگوی جدید)؛ فوتر: اندازهٔ کامل داخل چیپ سفید
      className={`block w-auto ${dark ? "h-[43px]" : "h-[30px] sm:h-[34.5px]"} ${className ?? ""}`}
      draggable={false}
    />
  );
  if (!dark) return img;
  return <span className="inline-flex rounded-[8px] bg-white px-3 py-2">{img}</span>;
}

/* --------------------------- لینک داخلی سایت ---------------------------- */

/** لینک به صفحات سایت (روتر SPA) */
export function SiteLink({
  href,
  className,
  children,
  ariaLabel,
  title,
}: {
  href: string;
  className?: string;
  children: React.ReactNode;
  ariaLabel?: string;
  title?: string;
}) {
  const { navigate } = useRouter();
  return (
    <a
      href={href}
      aria-label={ariaLabel}
      title={title}
      className={className}
      onClick={(e) => {
        e.preventDefault();
        navigate(href);
      }}
    >
      {children}
    </a>
  );
}

/* --------------------------- اسکرول به سکشن ---------------------------- */

export function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function AnchorLink({
  id,
  className,
  children,
  ariaLabel,
  style,
}: {
  id: string;
  className?: string;
  children: React.ReactNode;
  ariaLabel?: string;
  style?: React.CSSProperties;
}) {
  const { path, navigate } = useRouter();
  const go = (e: React.MouseEvent) => {
    e.preventDefault();
    if (path !== "/") {
      // از صفحات دیگر: اول برگرد به خانه، بعد به سکشن اسکرول کن
      navigate("/");
      window.setTimeout(() => scrollToId(id), 120);
    } else {
      scrollToId(id);
    }
  };
  return (
    <a href={`#${id}`} aria-label={ariaLabel} className={className} style={style} onClick={go}>
      {children}
    </a>
  );
}

/* ------------------------------- هدر سایت ------------------------------ */

const NAV = [
  { href: "/", label: "خانه" },
  { href: "/courses", label: "دوره‌ها" },
  { href: "/shop", label: "فروشگاه" },
  { href: "/placement", label: "تعیین سطح" },
  { href: "/blog", label: "وبلاگ" },
  { href: "/about", label: "درباره ما" },
  { href: "/contact", label: "تماس با ما" },
];

export function SiteHeader() {
  const { navigate, path } = useRouter();
  const { count } = useCart();
  const { user, logout } = useAuth();
  const [open, setOpen] = React.useState(false);
  const [loginOpen, setLoginOpen] = React.useState(false);
  /* دراپ‌داون حساب هدر — پس از ورود، کلیک روی دکمه به‌جای پرش مستقیم به پنل،
     منویی با «ورود به داشبورد» و «خروج» باز می‌کند (درخواست کاربر — نسخهٔ ۳۸)
     حالت هم‌ارز در پانوشت منوی موبایل: باز شدن درجا، بدون شناور */
  const [userMenu, setUserMenu] = React.useState(false);
  const [drawerUserMenu, setDrawerUserMenu] = React.useState(false);
  React.useEffect(() => setUserMenu(false), [path]);
  React.useEffect(() => setDrawerUserMenu(false), [open, path]);
  /* بستن دراپ‌داون حساب با کلیک بیرون از آن (دکمه + پنل) و با Esc — هم‌الگوی اعلان‌های پنل */
  React.useEffect(() => {
    if (!userMenu) return;
    const onDoc = (e: MouseEvent) => {
      const t = e.target as HTMLElement | null;
      if (!t?.closest("[data-user-menu-root]")) setUserMenu(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setUserMenu(false);
    };
    document.addEventListener("mousedown", onDoc);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      window.removeEventListener("keydown", onKey);
    };
  }, [userMenu]);
  const go = (href: string) => {
    setOpen(false);
    navigate(href);
  };
  /* منوی موبایل — با باز شدن دروَر، اسکرول بدنه قفل می‌شود و Esc بسته می‌کند
     (رفع مشکل «منو کار نمی‌کند» روی موبایل: اسکرول پس‌زمینه و حالت گیر کرده) */
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);
  return (
    <>
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-hairline-soft">
      {/* ارتفاع هدر ۸٪ بلندتر — ۵۲px → ۵۶px؛ خط زیرین هدر برقرار؛ خطوط عمودی (mesh-rails) حذف شد
          کانتینر هم‌اندازهٔ سکشن‌های سایت: max-w-[1280px] + پدینگ یکسان (هم‌ترازی آیتم‌ها با بریک‌پوینت صفحه) */}
      <div className="mx-auto max-w-[1280px] h-[56px] px-4 sm:px-8 xl:px-10 flex items-center gap-5">
        {/* همبرگر + لوگو — همبرگر چسبیده‌تر به لبهٔ راست (درخواست کاربر): -ms-3 خطوط را ~۱۶px از لبه می‌گذارد
            و ms-[11px] لوگو جای قبلی‌اش می‌ماند (فاصلهٔ دیداری تا لوگو ~۱۲px) */}
        <div className="flex shrink-0 items-center gap-0">
          <button
            type="button"
            aria-label={open ? "بستن منو" : "باز کردن منو"}
            aria-expanded={open}
            onClick={() => setOpen(!open)}
            /* فیدبک فشردن readme — scale ملایم هنگام active */
            className="-ms-3 grid size-[43px] place-items-center text-ink transition-transform duration-150 ease-out active:scale-[0.92] lg:hidden"
          >
            {/* همبرگر سه‌خطی — بدون ردیوس و بدون دایره (درخواست کاربر)؛
                با باز شدن، خط بالا و پایین به ضربدر مورف می‌شوند و خط وسط محو می‌شود */}
            <span aria-hidden="true" className="relative block h-6 w-6">
              <span
                className={`absolute left-1/2 top-[4px] h-[2px] w-4.5 -translate-x-1/2 bg-current transition-all duration-300 ease-[cubic-bezier(0.65,0,0.35,1)] ${
                  open ? "top-[11px] rotate-45" : ""
                }`}
              />
              <span
                className={`absolute left-1/2 top-[11px] h-[2px] w-4.5 -translate-x-1/2 bg-current transition-opacity duration-200 ${
                  open ? "opacity-0" : "opacity-100"
                }`}
              />
              <span
                className={`absolute left-1/2 bottom-[4px] h-[2px] w-4.5 -translate-x-1/2 bg-current transition-all duration-300 ease-[cubic-bezier(0.65,0,0.35,1)] ${
                  open ? "bottom-[11px] -rotate-45" : ""
                }`}
              />
            </span>
          </button>
          <SiteLink href="/" className="shrink-0 -ms-px">
            <EdcLogo />
          </SiteLink>
        </div>
        <nav className="hidden lg:flex items-center gap-6 mx-auto text-sm font-bold text-ink-soft" aria-label="منوی اصلی">
          {NAV.map((l) => (
            <SiteLink
              key={l.href}
              href={l.href}
              className={`transition-colors ${path === l.href ? "text-navy-deep" : "hover:text-ink"}`}
            >
              {l.label}
            </SiteLink>
          ))}
        </nav>
        {/* سبد خرید + ورود — یک خوشه در انتهای هدر (L3) */}
        <div className="ms-auto lg:ms-0 flex items-center gap-3">
          {/* سبد خرید — فعال: مستقیم به صفحهٔ سبد خرید می‌رود (رفع «سبد خرید فعال نیست») */}
          <button
            type="button"
            title="سبد خرید"
            aria-label="باز کردن سبد خرید"
            onClick={() => navigate("/cart")}
            className="relative grid size-9 shrink-0 place-items-center rounded-full border border-hairline-soft text-ink transition-colors hover:bg-canvas-soft"
          >
            <ShoppingBag className="size-[17px]" />
            {count > 0 && (
              <span className="absolute -end-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-brand-500 px-1 text-[10px] font-black text-navy-900">
                {faNum(count)}
              </span>
            )}
          </button>
          {/* ورود و ثبت‌نام — مهمان: دکمهٔ سرمه‌ای با آیکون ادمک و باز کردن پنجرهٔ ورود
              (درخواست کاربر — نسخهٔ ۳۸: رنگ دکمهٔ ورود سرمه‌ای شود، کنارش آیکون ادمک)
              لاگین‌شده: دکمهٔ سرمه‌ای «نام» با آیکون ادمک؛ کلیک، دراپ‌داون «ورود به داشبورد»
              و «خروج» را باز می‌کند — دیگر پرش مستقیم به پنل نیست */}
          {user ? (
            <div className="relative hidden sm:block" data-user-menu-root>
              <button
                type="button"
                aria-label={`حساب کاربری — ${user.name}`}
                aria-haspopup="menu"
                aria-expanded={userMenu}
                onClick={() => setUserMenu((v) => !v)}
                className="inline-flex h-9 max-w-[220px] items-center gap-2 rounded-full bg-navy-deep px-4 text-[13px] font-extrabold text-white transition-colors hover:bg-navy-700"
              >
                <UserRound className="size-4 shrink-0" />
                <span className="truncate">{user.name}</span>
                <ChevronDown
                  className={`size-3.5 shrink-0 opacity-80 transition-transform duration-200 ${userMenu ? "rotate-180" : ""}`}
                />
              </button>
              {userMenu && (
                <div
                  role="menu"
                  aria-label="منوی حساب کاربری"
                  className="absolute end-0 top-[calc(100%+10px)] w-56 rounded-[8px] border border-hairline-soft bg-white p-2 shadow-[0_16px_40px_-16px_rgba(0,0,0,0.18)] animate-in-up"
                >
                  {/* سربرگ — نام و نقش حساب */}
                  <div className="px-2 pb-2 pt-1">
                    <p className="truncate text-[13px] font-black-fa text-ink">{user.name}</p>
                    <p className="mt-0.5 text-[11px] text-ink-soft">{ROLE_FA[user.role]} — کلینیک المیرا</p>
                  </div>
                  <div aria-hidden="true" className="mb-1 h-px bg-hairline-soft" />
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setUserMenu(false);
                      navigate(panelHref(user.role));
                    }}
                    className="flex w-full items-center gap-2.5 rounded-[8px] px-2.5 py-2 text-[13px] font-bold text-ink transition-colors hover:bg-canvas-soft"
                  >
                    <LayoutDashboard className="size-4 shrink-0 text-ink-soft" />
                    ورود به داشبورد
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setUserMenu(false);
                      logout();
                      navigate("/");
                    }}
                    className="flex w-full items-center gap-2.5 rounded-[8px] px-2.5 py-2 text-[13px] font-bold text-bad transition-colors hover:bg-bad/10"
                  >
                    <LogOut className="size-4 shrink-0" />
                    خروج
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setLoginOpen(true)}
              className="hidden h-9 items-center gap-1.5 rounded-full bg-navy-deep px-4 text-[12px] font-extrabold text-white transition-colors hover:bg-navy-700 sm:inline-flex"
            >
              <UserRound className="size-4 shrink-0" />
              ورود و ثبت‌نام
            </button>
          )}
        </div>
      </div>
      </header>
      {/* منوی موبایل — درِوَر سمت راست، هم‌حالت سایدبار پنل‌ها (درخواست کاربر: یک حالت واحد
          برای لاگین‌شده و مهمان). عمداً بیرون از header است تا backdrop-blur هدر مختصاتش را نبرد */}
      {open && (
        <div className="fixed inset-0 z-[55] lg:hidden" role="dialog" aria-modal="true" aria-label="منوی سایت">
          <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 start-0 flex w-72 max-w-[85vw] flex-col bg-white shadow-[16px_0_48px_-24px_rgba(0,3,63,0.25)]">
            {/* سربرگ — لوگوی رسمی کلینیک (فایل ارسالی) + بستن؛ رفع «لوگو در سایدبار درست نیست» */}
            <div className="flex h-16 shrink-0 items-center justify-between border-b border-hairline-soft px-4">
              <SiteLink href="/" ariaLabel="کلینیک آلمانی المیرا — خانه" className="flex items-center">
                <EdcLogo />
              </SiteLink>
              <button
                onClick={() => setOpen(false)}
                className="grid size-9 place-items-center rounded-full border border-hairline-soft text-ink-soft transition-colors hover:bg-canvas-soft hover:text-ink"
                aria-label="بستن منو"
              >
                <X className="size-4" />
              </button>
            </div>
            {/* آیتم‌های منو — همان ترتیب و حالت فعال هدر دسکتاپ */}
            <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3 scroll-thin" aria-label="منوی موبایل">
              {NAV.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={(e) => {
                    e.preventDefault();
                    go(l.href);
                  }}
                  className={`rounded-[8px] px-3 py-2.5 text-sm font-bold transition-colors ${
                    path === l.href ? "bg-canvas-soft text-navy-deep" : "text-ink-soft hover:bg-canvas-soft hover:text-ink"
                  }`}
                >
                  {l.label}
                </a>
              ))}
            </nav>
            {/* پانوشت — مهمان: دکمهٔ سرمه‌ای «ورود و ثبت‌نام» با آیکون ادمک؛
                لاگین‌شده: دکمهٔ «نام» با آیکون ادمک، کلیک، گزینه‌های «ورود به داشبورد» و «خروج»
                را درجا باز می‌کند — هم‌حالت دراپ‌داون هدر (درخواست کاربر — نسخهٔ ۳۸) */}
            <div className="border-t border-hairline-soft p-3">
              {user ? (
                <div className="space-y-1.5">
                  <button
                    type="button"
                    aria-haspopup="menu"
                    aria-expanded={drawerUserMenu}
                    onClick={() => setDrawerUserMenu((v) => !v)}
                    className="flex h-10 w-full items-center justify-center gap-2 rounded-full bg-navy-deep text-sm font-extrabold text-white transition-colors hover:bg-navy-700"
                  >
                    <UserRound className="size-4 shrink-0" />
                    <span className="max-w-[150px] truncate">{user.name}</span>
                    <ChevronDown
                      className={`size-3.5 shrink-0 opacity-80 transition-transform duration-200 ${drawerUserMenu ? "rotate-180" : ""}`}
                    />
                  </button>
                  {drawerUserMenu && (
                    <div
                      role="menu"
                      aria-label="منوی حساب کاربری"
                      className="rounded-[8px] border border-hairline-soft bg-white p-1.5 shadow-[0_8px_24px_-12px_rgba(0,3,63,0.2)] animate-in-up"
                    >
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => go(panelHref(user.role))}
                        className="flex w-full items-center gap-2.5 rounded-[8px] px-3 py-2.5 text-[13px] font-bold text-ink transition-colors hover:bg-canvas-soft"
                      >
                        <LayoutDashboard className="size-4 shrink-0 text-ink-soft" />
                        ورود به داشبورد
                      </button>
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          setOpen(false);
                          logout();
                          navigate("/");
                        }}
                        className="flex w-full items-center gap-2.5 rounded-[8px] px-3 py-2.5 text-[13px] font-bold text-bad transition-colors hover:bg-bad/10"
                      >
                        <LogOut className="size-4 shrink-0" />
                        خروج
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    setLoginOpen(true);
                  }}
                  className="flex h-10 w-full items-center justify-center gap-1.5 rounded-full bg-navy-deep text-[12.5px] font-extrabold text-white transition-colors hover:bg-navy-700"
                >
                  <UserRound className="size-4 shrink-0" />
                  ورود و ثبت‌نام
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      {/* باتم‌شیت ورود و ثبت‌نام — از دکمهٔ هدر و منوی موبایل باز می‌شود */}
      <LoginSheet open={loginOpen} onOpenChange={setLoginOpen} />
    </>
  );
}

/* ------------------------------ فوتر سایت ------------------------------ */

/* فوتر — هم‌ریتم و هم‌زبان سکشن‌های سایت: سرمه‌ای با شبکهٔ ۵۶px (rd-grid-dark
   مثل سکشن پنل و نظرات)، سلول‌های قاب‌دار با خط مویی تیره مثل گرید «درباره ما»،
   سربرگ مونو با خط مویی و مربع‌های تاکیدی روی گوشه‌ها */

/** سربرگ ستون فوتر — برچسب مونو + خط مویی + تیتر فارسی، هم‌الگوی RdLabel سکشن‌ها */
function FootHead({ code, title }: { code: string; title: string }) {
  return (
    <div className="mb-4 flex items-center gap-2.5">
      <span className="dc-mono text-[9px] tracking-[0.18em] text-white/35" dir="ltr">
        {code}
      </span>
      <span aria-hidden="true" className="h-px w-6 bg-white/15" />
      <h3 className="text-[13px] font-black-fa text-white">{title}</h3>
    </div>
  );
}

/** لینک سادهٔ ستون فوتر */
function FootLink({
  children,
  className = "",
  ...rest
}: React.ComponentProps<"a">) {
  return (
    <a
      {...rest}
      className={`inline-flex w-max items-center gap-1.5 text-[13px] leading-6 text-white/60 transition-colors hover:text-white ${className}`}
    >
      {children}
    </a>
  );
}

export function SiteFooter() {
  const { navigate } = useRouter();
  const wa = contactChannels.find((c) => c.id === "whatsapp");
  const tg = contactChannels.find((c) => c.id === "telegram");
  const phone = contactChannels.find((c) => c.id === "phone");
  const email = contactChannels.find((c) => c.id === "email");
  const instagram = contactChannels.find((c) => c.id === "instagram");

  const socials = [
    { icon: Instagram, href: instagram?.href ?? "#", label: "اینستاگرام" },
    { icon: Send, href: tg?.href ?? "#", label: "تلگرام" },
    { icon: MessageCircle, href: wa?.href ?? "#", label: "واتساپ" },
    { icon: Mail, href: email?.href ?? "#", label: "ایمیل" },
  ];

  return (
    <footer className="relative overflow-hidden rd-grid-dark bg-rd-night text-white">
      {/* نوار مرز بالای فوتر — هم‌الگوی نوار مرز سکشن‌ها، با دو مربع روی ریل‌ها */}
      <span aria-hidden="true" className="rd-band rd-band-dark">
        <span
          className="absolute top-1/2 hidden size-[6px] -translate-y-1/2 rounded-[0.5px] bg-skyc xl:block"
          style={{ left: "calc(50% - 643px)" }}
        />
        <span
          className="absolute top-1/2 hidden size-[6px] -translate-y-1/2 rounded-[0.5px] bg-skyc xl:block"
          style={{ left: "calc(50% + 637px)" }}
        />
      </span>

      <div className="relative mx-auto w-full max-w-[1280px] px-4 pt-[32px] pb-[34px] sm:px-8 sm:pt-[38px] sm:pb-[40px] xl:px-10 xl:pt-[43px] xl:pb-[45px]">
        {/* سلول برند + پشتیبانی — قاب مویی تیره با مربع‌های تاکیدی روی گوشه‌ها */}
        <div className="relative rounded-[8px] border border-white/[0.14] bg-rd-night p-5 sm:p-7">
          {/* چهار مربع گوشه — الگوی مربع‌های تاکیدی سکشن‌ها */}
          <span aria-hidden="true" className="pointer-events-none absolute inset-0">
            <span className="absolute -top-[3px] -left-[3px] size-[6px] rounded-[0.5px] bg-rd-sky2" />
            <span className="absolute -top-[3px] -right-[3px] size-[6px] rounded-[0.5px] bg-rd-sky2" />
            <span className="absolute -bottom-[3px] -left-[3px] size-[6px] rounded-[0.5px] bg-rd-sky2" />
            <span className="absolute -bottom-[3px] -right-[3px] size-[6px] rounded-[0.5px] bg-rd-sky2" />
          </span>
          <div className="flex flex-wrap items-start justify-between gap-x-8 gap-y-5">
            <div className="max-w-xl">
              <div className="flex items-center gap-3.5">
                {/* نام کوتاه کلینیک — ۵٪ ریزتر از قبل */}
                <span className="font-black-fa text-[18px] leading-7 text-white sm:text-[20px]">
                  کلینیک آلمانی <span className="text-skyc">المیرا</span>
                </span>
                <span
                  className="dc-mono hidden rounded-full border border-white/10 px-3 py-1.5 text-[10px] font-medium tracking-[0.18em] text-white/50 sm:block"
                  dir="ltr"
                >
                  EST. 1389
                </span>
              </div>
              <p className="mt-3.5 text-[13px] leading-6 text-white/60">
                کلینیک تخصصی زبان آلمانی المیرا بستری است برای یادگیری اصولی آلمانی — سه مسیر مشخص برای سه هدف: یادگیری
                زبان، بازار کار و مدارک رسمی؛ همه با تعیین سطح دقیق و تمرین چهار مهارت در هر جلسه.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <a
                href={wa?.href ?? "#"}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-10 items-center gap-2 rounded-full border border-white/[0.14] px-5 text-[13px] font-extrabold text-white transition-colors hover:bg-white/[0.06]"
              >
                <MessageCircle className="size-4 text-skyc" />
                پشتیبانی واتساپ
              </a>
              <a
                href={tg?.href ?? "#"}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-10 items-center gap-2 rounded-full border border-white/[0.14] px-5 text-[13px] font-extrabold text-white transition-colors hover:bg-white/[0.06]"
              >
                <Send className="size-4 text-skyc" />
                پشتیبانی تلگرام
              </a>
            </div>
          </div>
        </div>

        {/* سه ستون لینک — ستون «شروع یادگیری» حذف شد؛ گرید سلول‌سفارتی تیره با خطوط مویی، مثل گرید «درباره ما» */}
        <div className="mt-3.5 grid grid-cols-1 gap-px overflow-hidden rounded-[8px] border border-white/[0.14] bg-white/[0.14] sm:grid-cols-2 xl:mt-4 xl:grid-cols-3">
          <div className="bg-rd-night p-5 sm:p-6">
            <FootHead code="NAV. [01]" title="دسترسی سریع" />
            {/* لینک‌ها دوستونه — تا فضای خالی سلول پر شود */}
            <ul className="grid grid-cols-2 gap-x-5 gap-y-2.5">
              {NAV.map((l) => (
                <li key={l.href}>
                  <FootLink href={l.href} onClick={(e) => { e.preventDefault(); navigate(l.href); }}>
                    {l.label}
                  </FootLink>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-rd-night p-5 sm:p-6">
            <FootHead code="CNT. [02]" title="تماس با ما" />
            <ul className="space-y-2">
              <li>
                <FootLink href={phone?.href ?? "#"} dir="ltr" className="tabular-nums">
                  {phone?.value}
                </FootLink>
              </li>
              <li>
                <FootLink href={email?.href ?? "#"} dir="ltr">
                  {email?.value}
                </FootLink>
              </li>
              <li className="text-[13px] leading-6 text-white/60">{contactAddress.lines[1]}</li>
              <li className="text-[11.5px] leading-5 text-white/35">پاسخگویی: شنبه تا پنجشنبه ۹ تا ۱۹</li>
            </ul>
          </div>
          <div className="bg-rd-night p-5 sm:p-6">
            <FootHead code="SOC. [03]" title="ما را دنبال کنید" />
            <div className="flex flex-wrap gap-2">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={s.label}
                  title={s.label}
                  className="grid size-10 place-items-center rounded-full border border-white/[0.14] text-white/60 transition-colors hover:border-skyc/50 hover:text-skyc"
                >
                  <s.icon className="size-4" />
                </a>
              ))}
            </div>
            <p className="mt-4 text-[11.5px] leading-5 text-white/35">
              هر روز یک نکتهٔ آموزشی جدید — چانک‌ها، تمرین مکالمه و نکات آزمون‌ها.
            </p>
          </div>
        </div>

        {/* نوار کپی‌رایت — قاب مویی هم‌ریتم سلول‌ها */}
        <div className="mt-3.5 flex flex-wrap items-center justify-between gap-3 rounded-[8px] border border-white/[0.14] px-5 py-3.5 sm:px-6">
          <span className="text-[12px] text-white/50">© ۱۴۰۵ کلینیک تخصصی زبان آلمانی المیرا — همه‌ی حقوق محفوظ است.</span>
          <span className="dc-mono text-[10px] font-medium tracking-[0.22em] text-white/30" dir="ltr">
            ELMIRA DEUTSCH CLINIC
          </span>
        </div>
        {/* امضای طراحی و توسعه — انتهای فوتر، به انگلیسی */}
        <p className="mt-3 text-center text-[11px] text-white/35" dir="ltr">
          Designed &amp; developed by Shahrara Online Solutions
        </p>
      </div>
    </footer>
  );
}
