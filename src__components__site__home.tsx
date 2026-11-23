"use client";

import React, { useEffect } from "react";
import {
  ArrowLeft,
  Award,
  BookOpen,
  BookOpenText,
  Briefcase,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Clock,
  Compass,
  Film,
  Gift,
  GraduationCap,
  Headphones,
  Instagram,
  LayoutDashboard,
  Mail,
  MessagesSquare,
  PenLine,
  Play,
  Search,
  TrendingUp,
  Users,
  Volume2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { AnchorLink, EdcMark, SiteLink, scrollToId } from "@/components/site/shared";
import { formatToman, siteCourses } from "@/lib/site-data";
import { MeshPlus } from "@/components/site/mesh";
import HeroCanvas from "@/components/site/hero-canvas";

/* ------------------------------------------------------------------------
   عناصر ساختاری مشترک — کپی جز به جز زبان طراحی readme.com
   منبع: باندل رسمی readme (کلاس‌های grid-overlay، inside-border،
   eyebrow-label، size-6 bg-primary-accent، FEA. [nn] و ...)
   • مربع تاکیدی ۶px، نوار مرز تمام‌عرض با دو مربع روی ریل‌ها، ابروی
     شماره‌دار مونو، سلول‌های سفید روی شبکه (سوراخ سفید)، قاب داخلی ۱px،
     برچسب فنی «CODE. [nn]» با خط مویی، دکمهٔ قرصی با overlay هاور
   ------------------------------------------------------------------------ */

/** فاصلهٔ ریل از مرکز — هم‌عرض کانتینر محتوای سکشن‌ها (max-w-1280) */
const RAIL = 640;

/** مربع ۶px تاکیدی — «size-6 rounded-[0.5px] bg-primary-accent» در readme */
export function RdSq({
  pos,
  dark = false,
  className = "",
}: {
  pos: "tl" | "tr" | "bl" | "br";
  dark?: boolean;
  className?: string;
}) {
  const p = {
    tl: "-top-[3px] -left-[3px]",
    tr: "-top-[3px] -right-[3px]",
    bl: "-bottom-[3px] -left-[3px]",
    br: "-bottom-[3px] -right-[3px]",
  }[pos];
  return (
    <span
      aria-hidden="true"
      className={`pointer-events-none absolute z-30 size-[6px] rounded-[0.5px] ${p} ${
        dark ? "bg-rd-sky2" : "bg-rd-accent"
      } ${className}`}
    />
  );
}

/** چهار مربع گوشهٔ یک بلوک — قاب تزئینی ابرو و شبکه‌ها */
export function RdSqFrame({ dark = false }: { dark?: boolean }) {
  return (
    <span aria-hidden="true" className="pointer-events-none absolute inset-0 z-30">
      <RdSq pos="tl" dark />
      <RdSq pos="tr" dark />
      <RdSq pos="bl" dark />
      <RdSq pos="br" dark />
    </span>
  );
}

/** نوار مرز سکشن — خط مویی تمام‌عرض + دو مربع روی ریل‌ها
    (الگوی «-top-0.5 left-[calc(50%-50vw)] h-1 w-screen bg-section-border») */
export function RdBand({
  dark = false,
  className = "",
}: {
  dark?: boolean;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={`rd-band ${dark ? "rd-band-dark" : ""} ${className}`}
    >
      <span
        className={`absolute top-1/2 hidden size-[6px] -translate-y-1/2 rounded-[0.5px] xl:block ${
          dark ? "bg-skyc" : "bg-rd-accent"
        }`}
        style={{ left: "calc(50% - " + (RAIL + 3) + "px)" }}
      />
      <span
        className={`absolute top-1/2 hidden size-[6px] -translate-y-1/2 rounded-[0.5px] xl:block ${
          dark ? "bg-skyc" : "bg-rd-accent"
        }`}
        style={{ left: "calc(50% + " + (RAIL - 3) + "px)" }}
      />
    </span>
  );
}

/** ابروی شماره‌دار — سلول سفید با شمارهٔ مونو و برچسب فارسی
    (الگوی «eyebrow-label + counter(eyebrow, decimal-leading-zero)»؛ عدد
    لاتین می‌ماند و برچسب فارسی، همان‌طور که در readme شماره جلوی برچسب است) */
export function RdEyebrow({
  num,
  label,
  dark = false,
  className = "",
}: {
  num: string;
  label: string;
  dark?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`relative inline-flex w-max items-center gap-2.5 px-5 pb-3 ${
        dark ? "bg-rd-night" : "bg-white"
      } ${className}`}
    >
      <span
        aria-hidden="true"
        className={`dc-mono text-[12px] font-medium tracking-[0.08em] ${
          dark ? "text-rd-sky2" : "text-rd-title"
        }`}
        dir="ltr"
      >
        {num}.
      </span>
      <span
        className={`text-[12px] font-bold ${
          dark ? "text-rd-sky2" : "text-rd-title"
        }`}
      >
        {label}
      </span>
    </div>
  );
}

/** برچسب فنی مونو با خط مویی — الگوی «FEA. [01]» در کارت‌های readme */
export function RdLabel({
  code,
  n,
  dark = false,
  className = "",
}: {
  code: string;
  n: string;
  dark?: boolean;
  className?: string;
}) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <span
        aria-hidden="true"
        className={`h-px flex-1 ${dark ? "bg-rd-night-line" : "bg-hairline-soft"}`}
      />
      <span
        className={`dc-mono text-[9px] tracking-[0.18em] ${
          dark ? "text-white/30" : "text-ink-faint"
        }`}
        dir="ltr"
      >
        {code}. [{n}]
      </span>
    </div>
  );
}

/** کارت قاب‌دار — سلول سفید با قاب داخلی ۱px و علامت‌های + روی گوشه‌ها
    (الگوی «before:inside-border + mark/white/…» در کارت‌های readme) */
export function RdCard({
  children,
  className = "",
  dark = false,
  marks = false,
  radius = "rounded-[8px]",
}: {
  children: React.ReactNode;
  className?: string;
  dark?: boolean;
  marks?: boolean;
  radius?: string;
}) {
  return (
    <div
      className={`rd-inside ${dark ? "rd-inside-dark" : ""} ${
        dark ? "bg-rd-night" : "bg-white"
      } ${radius} ${className}`}
    >
      {marks && (
        <span aria-hidden="true" className="pointer-events-none absolute inset-0 hidden xl:block">
          <MeshPlus className={`absolute -left-[7.5px] -top-[7.5px] size-[13px] ${dark ? "text-white/30" : "text-navy-800/30"}`} />
          <MeshPlus className={`absolute -right-[7.5px] -top-[7.5px] size-[13px] ${dark ? "text-white/30" : "text-navy-800/30"}`} />
          <MeshPlus className={`absolute -bottom-[7.5px] -left-[7.5px] size-[13px] ${dark ? "text-white/30" : "text-navy-800/30"}`} />
          <MeshPlus className={`absolute -bottom-[7.5px] -right-[7.5px] size-[13px] ${dark ? "text-white/30" : "text-navy-800/30"}`} />
        </span>
      )}
      {children}
    </div>
  );
}

/** دکمهٔ اصلی قرصی — «bg-blue-7 + overlay هاور» در readme */
export function RdBtnPrimary({
  children,
  className = "",
  href,
}: {
  children: React.ReactNode;
  className?: string;
  href?: string;
}) {
  const base =
    "group relative inline-flex h-10 items-center justify-center gap-2 rounded-full bg-rd-deep px-6 text-[13px] font-extrabold text-white transition-all duration-150 hover:bg-navy-700 active:scale-[0.985]";
  if (href) {
    return (
      <a href={href} className={`${base} ${className}`}>
        {children}
      </a>
    );
  }
  return <AnchorLink id="placement" className={`${base} ${className}`}>{children}</AnchorLink>;
}

/** دکمهٔ ثانویهٔ قاب‌دار — «before:inside-border» در readme */
export function RdBtnGhost({
  children,
  anchor,
  className = "",
  dark = false,
}: {
  children: React.ReactNode;
  anchor?: string;
  className?: string;
  dark?: boolean;
}) {
  const base = `rd-inside ${dark ? "rd-inside-dark" : ""} inline-flex h-10 items-center gap-2 rounded-full px-5 text-[13px] transition-colors ${
    dark ? "text-white/85 hover:bg-white/[0.04]" : "text-ink hover:bg-canvas-soft"
  } ${className}`;
  if (anchor) {
    return (
      <AnchorLink id={anchor} className={base}>
        {children}
      </AnchorLink>
    );
  }
  return <span className={base}>{children}</span>;
}

/** قالب سکشن — شبکهٔ ۵۶px روشن یا سرمه‌ای + کانتینر ۱۲۸۰؛ حالت flat: سفیدِ تخت بدون مشبک */
export function RdSection({
  id,
  dark = false,
  flat = false,
  fadeTop = false,
  className = "",
  children,
}: {
  id: string;
  dark?: boolean;
  /** سفید تخت بدون شبکهٔ مربعی — برای صفحات داخلی (درخواست کاربر) */
  flat?: boolean;
  /** محوِ شبکه بعد از هیرو — مستطیل سفید گرادیانی به عرض کانتینر روی ابتدای سکشن */
  fadeTop?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className={`relative scroll-mt-16 ${
        flat ? "bg-white" : dark ? "rd-grid-dark bg-rd-night" : "dc-grid-light bg-white"
      } ${className}`}
    >
      {fadeTop && (
        /* مستطیل محو شبکه — به عرض کانتینر؛ از لبهٔ هیرو شفاف و تا اولین کانتنت سفید کامل؛
           گرادیان در globals.css تعریف شده (موبایل: محو ۳۰٪ شدیدتر)؛
           قبل از children در DOM است تا محتوای سکشن روی آن بنشیند */
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0">
          <div className="grid-fade-rect mx-auto h-[150px] w-full max-w-[1280px]" />
        </div>
      )}
      {children}
    </section>
  );
}

/** کانتینر محتوای سکشن — ریتم عمودی؛ فاصلهٔ بین سکشن‌ها ۳۵٪ بیشتر از پیش‌فرض (از سکشن اول تا آخر) */
export function RdWrap({
  children,
  className = "",
  pb,
}: {
  children: React.ReactNode;
  className?: string;
  /** پدینگ پایین سفارشی — جایگزین کامل پیش‌فرض */
  pb?: string;
}) {
  return (
    <div
      className={`relative mx-auto w-full max-w-[1280px] px-4 pt-[32px] sm:px-8 sm:pt-[38px] xl:px-10 xl:pt-[43px] ${pb ?? "pb-[43px] sm:pb-[49px] xl:pb-[54px]"} ${className}`}
    >
      {children}
    </div>
  );
}

/* ------------------------------ مشترک ------------------------------ */

/** حباب گفتگو — هم در سکشن مهارت‌ها و هم مسیر «بازار کار» */
function Bubble({
  name,
  text,
  tone,
  anim,
  avatarClass,
  className = "",
}: {
  name: string;
  text: string;
  tone: "soft" | "white" | "navy";
  anim: string;
  avatarClass: string;
  className?: string;
}) {
  const tones = {
    soft: "bg-canvas-soft text-ink",
    white: "bg-white text-ink ring-1 ring-hairline-soft",
    navy: "bg-navy-800 text-white",
  };
  return (
    <div className={`flex items-end gap-2 ${anim} ${className}`}>
      <span className={`grid size-6 shrink-0 place-items-center rounded-full text-[10px] font-extrabold ${avatarClass}`}>
        {name}
      </span>
      <span className={`max-w-[80%] rounded-[8px] rounded-ss-[4px] px-2.5 py-1 text-[11.5px] leading-5 sm:max-w-none ${tones[tone]}`} dir="ltr">
        {text}
      </span>
    </div>
  );
}

/* ------------------------------ سکشن Hero ------------------------------ */
/* فول‌سکشن — سطح سرمه‌ای تمام‌عرض با شبکهٔ ۵۶px (#021259 روی #00033f)،
   بدون پنل توگرفته و بدون برش هلالی؛ لایه‌های متحرک در همهٔ عرض‌ها دیده
   می‌شوند (صحنهٔ ۱۲۳۲px مرکزچین که مثل canvas readme از دو طرف برش می‌خورد) */

/* عناصر قدیمی هیرو (تایپ‌رایتر نام دوره‌ها و خوشهٔ دایره‌ها) حذف شد —
   هیرو از فایل طراحی «هیرو کلینیک آلمانی المیرا» بازسازی شده است */

/* ماکت پنل زیر هیرو بر اساس نسخهٔ نهایی حذف شد — کارت هیرو خودش را تمام می‌کند */

function Hero() {
  /* حالت کاربر-محور قرص اعلان حذف شد — useAuth دیگر در هیرو لازم نیست (نسخهٔ ۳۹) */

  return (
    <section id="top" className="relative scroll-mt-16 bg-white p-3">
      <div className="relative mx-auto w-full max-w-[1240px]">
        {/* کارت هیرو — پورت فایل طراحی «هیرو کلینیک آلمانی المیرا» با فاصله‌های
            فشرده‌شده به درخواست کاربر (زیرتیتر/جستجو/ردیف ثانویه نزدیک‌تر شده‌اند):
            زمینهٔ سرمه‌ای #00033F، گردگوشهٔ ۲۴px در موبایل و ۴۰px در دسکتاپ (≥۹۰۱px)؛
            بکگراند جدید (درخواست کاربر: «این دو شبکه رو جایگزین قبلی کن»):
            دسکتاپ → فایل طراحی d.svg (hero-desktop-v3.svg: شبکهٔ سفید ۰٫۰۶ + شش
            نقطهٔ آبی + قاب ثابت کارت‌ها + نوار مرکزی) زیر بوم؛ canvas فقط موشن
            (دو کارت انیمیشنی + جرقه‌ها) را روی آن می‌کشد؛ حلقه با try/catch +
            نگهبان + visibilitychange مقاوم شده تا موشن هیچ‌وقت برای همیشه نمیرد؛
            v30: دات‌های دسکتاپ ۳۰٪ کوچک‌تر شدند (۱۰٫۴۳→۷٫۳۰px حول مراکز تقاطع‌ها؛
            درخواست کاربر «دات در دسکتاپ 30درصد کوچک»)؛
            موبایل → پس‌زمینهٔ کاربر (hero-mobile-v11.svg؛ همان فایل طراحی M.svg ۳۹۰×۶۴۰؛
            دات‌های آبی حول مرکز تقاطع‌های شبکه: ۱۰٫۴۳→۸٫۸۷→۵٫۳۲→۶٫۳۸px —
            v30: ۲۰٪ بزرگ‌تر از v29 به درخواست کاربر «دات در موبایل 20درصد بزرگ شود»؛
            v33: چشمک‌زدن دات‌ها فقط موبایل، داخل خود SVG با @keyframes — کف ۰٫۳۵،
            سیکل ۲٫۷s، تأخیر پلکانی ۰٫۴۵s؛ reduced-motion → خاموش). لایهٔ بوم/پس‌زمینه
            همچنان بدون هیچ جرقه‌ای (درخواست قدیمی «تو موبایل هم جرقهٔ آبی نگذار»؛
            v34: جرقهٔ دور قرص اعلان هم به درخواست کاربر کلاً حذف شد).
            v28: ارتفاع هیروی موبایل ۱۰٪ کمتر شد (min-h ۶۲۶→۵۶۳؛ ۶۲۶×۰٫۹≈۵۶۳٫۴) —
            بوم ۶۴۰ با bg-cover/bg-center از بالا و پایین به‌طور متقارن بریده می‌شود
            و هر شش دات داخل کادر می‌مانند.
            وسط‌چینی عمودی («محتوای داخل هیرو سنتر نیست»): بلوک محتوای دسکتاپ
            ۱۰۷px پایین‌تر منتقل شده (اعلان ۱۶۹ / تیتر ۲۴۹ / زیرتیتر ۳۶۴ / قرص‌ها ۴۲۹)
            تا مرکز بلوک = مرکز کارت ۶۴۰px شود و فاصلهٔ بالا/پایین برابر ۱۶۹px باشد؛
            نوار ماسک سرمه‌ای پشت اعلان در d.svg هم به y=۱۶۹ منتقل و فایل نسخه‌دار
            v2 شد (دور زدن کش). موبایل: ستون محتوا با justify-center و پدینگ متقارن
            py-۵۶ داخل min-h-626 وسط‌چین شد (pt-۸۰/pb-۶۴ قدیمی حذف) */}
        <div
          className="relative overflow-hidden rounded-[24px] bg-[#00033F] text-white min-[901px]:h-[640px] min-[901px]:rounded-[40px]"
          style={{ "--in": "36px" } as React.CSSProperties}
        >
          {/* پس‌زمینهٔ موبایل — فایل طراحی کاربر (نسخهٔ ۱۱: M.svg کاربر + دات‌های آبی
              ۱۵٪+۴۰٪ ریزتر و سپس ۲۰٪ بزرگ‌تر روی همان تقاطع‌ها + چشمک ملایم دات‌ها)؛
              نام نسخه‌دار برای دور زدن کش */}
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-cover bg-center min-[901px]:hidden"
            style={{ backgroundImage: "url(/images/edc/hero-mobile-v11.svg)" }}
          />
          {/* پس‌زمینهٔ دسکتاپ — فایل طراحی کاربر d.svg (v3: دات‌ها ۳۰٪ کوچک‌تر)؛ مرکزچین با برش دوطرفه مثل قاب ۱۳۶۶ */}
          <div
            aria-hidden="true"
            className="absolute inset-0 hidden min-[901px]:block"
            style={{
              backgroundImage: "url(/images/edc/hero-desktop-v3.svg)",
              backgroundSize: "auto 100%",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }}
          />
          <HeroCanvas />

          {/* ستون محتوا — موبایل: جریان عادی، justify-center داخل min-h-563 (وسط عمودی؛
              ۱۰٪ کمتر از ۶۲۶ قبلی — درخواست کاربر)؛
              دسکتاپ: قفل روی قاب ۵۵۶px مرکزچین (۴۰۵..۹۶۲ قاب پس‌زمینه) */}
          <div className="relative z-[1] flex flex-col items-center justify-center px-[calc(var(--in,36px)+12px)] py-[56px] text-center max-[900px]:min-h-[563px] min-[901px]:absolute min-[901px]:left-1/2 min-[901px]:top-0 min-[901px]:-ml-[278px] min-[901px]:block min-[901px]:h-[640px] min-[901px]:w-[556px] min-[901px]:p-0">
            {/* قرص اعلان هیرو — حالت عادی برای همه: خبر ثبت‌نام؛ حالت کاربر-محور
                «خوش برگشتی — نام — ادامهٔ یادگیری» حذف شد (درخواست کاربر:
                «اینو به همون حالت عادی برگردان» — نسخهٔ ۳۹)؛
                (جای «پیل خوش‌آمد» ردیف قدیمی که با حذف آن ردیف اینجا آمد)؛
                v34: به درخواست کاربر («در موبایل به حالت قبل برگردان») از بالای ردیف CTA
                به همین جایگاه قبلی (ابتدای ستون در موبایل) برگشت و «جرقهٔ آبی گردان»
                کلاً حذف شد — دسکتاپ همان بلوک مطلقِ تاپ ۱۶۹ می‌ماند؛
                v42: فاصلهٔ «باتن بالا» تا متنِ تیتر در دسکتاپ ۱۵٪ کمتر شد (درخواست کاربر
                «فاصله باتن بالا و باتنهای پایین هم نسبت به متون 15درصد کمتر بشن.فقط دسکتاپ»)
                — گپ ۴۸→۴۰٫۸px؛ قرص ۷٫۲px پایین‌تر: تاپ ۱۶۹→۱۷۶٫۲px (موبایل دست‌نخورده) */}
            <AnchorLink id="courses" className="inline-flex h-[32px] shrink-0 items-center gap-[10px] whitespace-nowrap rounded-full border border-white/20 bg-[#00033F] pe-[10px] ps-[12px] text-[12.5px] text-[#E4E9F7] transition-opacity hover:opacity-90 min-[901px]:absolute min-[901px]:left-1/2 min-[901px]:top-[176.2px] min-[901px]:-translate-x-1/2">
                <b className="rounded-full bg-[#00C0F0] px-[9px] py-px text-[11px] font-extrabold leading-[1.4] text-[#00033F]">
                  جدید
                </b>
                <span>ثبت‌نام دوره‌های کلینیک شروع شد</span>
                <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" aria-hidden="true" className="h-[14px] w-[14px] stroke-[#9FB0D6]">
                  <path d="M15 6l-6 6 6 6" />
                </svg>
            </AnchorLink>

            {/* تیتر — clamp موبایل و ۳۴٫۲px در دسکتاپ؛ اندازهٔ فونت به درخواست کاربر
                ۲۰٪ در موبایل و ۱۰٪ در دسکتاپ کوچک‌تر شده؛ متن (حذف «در آلمان») و
                بلوک تیتر در دسکتاپ ۳۰px پایین‌تر منتقل شده — زیرتیتر/جستجو/ردیف ثانویه
                هم با همان ۳۰px جابه‌جا شده‌اند تا ریتم طراحی حفظ بماند.
                v29: تیتر ۶٪ بزرگ‌تر شد (درخواست کاربر) — موبایل clamp(۲۲٫۹px، ۶٫۲۸vw، ۳۳٫۹px) و
                دسکتاپ ۳۶٫۳px/۵۳٫۱px (×۱٫۰۶)؛ تاپ‌های وسط‌چینی ثابت مانده‌اند.
                رنگ تأکیدی هیرو از خانوادهٔ فیروزه‌ای برند است؛ در متن روی سرمه‌ای
                از طیف روشن‌تر فیروزه‌ای استفاده شده تا خوانایی حفظ شود.
                v30: تیتر ۵٪ بزرگ‌تر شد (درخواست کاربر «در دسکتاپ و موبایل 5درصد بزرگتر») —
                موبایل clamp(۲۴٫۰۵px، ۶٫۵۹vw، ۳۵٫۶px) و دسکتاپ ۳۸٫۱px؛ لاین‌هیت فقط در
                موبایل ۴٪ بیشتر (۱٫۵→۱٫۵۶ — درخواست «لاین هایت هم در موبایل 4درصد بیشتر»)
                و در دسکتاپ همان ۵۳٫۱px ماند؛ تاپ‌های وسط‌چینی ثابت.
                تأکید تیتر با فیروزه‌ای روشن برند نمایش داده می‌شود؛ لاین‌هیت هر دو ۸٪
                بیشتر: ۱٫۵۶→۱٫۶۸۵ و ۵۳٫۱→۵۷٫۳px —
                بلوک دسکتاپ با ۲×۵۷٫۳=۱۱۴٫۶px تا ۳۶۳٫۶ می‌رسد و زیرتیتر ۳۶۴ دست‌نخورده.
                v42: لاین‌هیت دسکتاپ ۵۷٫۳→۵۶٫۳px (درخواست صریح کاربر «در دسکتاپ
                lineheight:56.3px»؛ موبایل همان ۱٫۶۸۵) — بلوک ۲×۵۶٫۳=۱۱۲٫۶px؛ تاپ ۲۴۹ ثابت */}
            <h1 className="mt-[22px] text-[clamp(24.05px,6.59vw,35.6px)] font-extrabold leading-[1.685] min-[901px]:absolute min-[901px]:inset-x-0 min-[901px]:top-[249px] min-[901px]:m-0 min-[901px]:text-[38.1px] min-[901px]:leading-[56.3px]">
              آلمانی را <em className="not-italic text-[#4DD6F6] min-[901px]:text-[#99E7FA]">از صفر شروع کن؛</em>
              <br />
              برای زندگی، تحصیل و کار
            </h1>

            {/* زیرتیتر — v33: فاصلهٔ این جمله تا متنِ بالای آن (تیتر) — دسکتاپ ۲۰٪ بیشتر و
                موبایل ۲۰٪ کمتر (درخواست کاربر؛ قرارداد v32 ادامه دارد: درصد روی فاصلهٔ پایهٔ
                ۱۶px حساب و دلتای حاصل به مقدار فعلی اعمال می‌شود) — موبایل mt ۱۷٫۶→۱۴٫۴px
                (−۳٫۲px)؛ دسکتاپ چون بلوک مطلق است، تاپ ۳۶۵٫۶→۳۶۸٫۸px (+۳٫۲px؛
                ۳۶۸٫۸+۲۵٫۲=۳۹۴ < ۴۲۹ قرص‌ها — بدون هم‌پوشانی). تاریخچه: v32 همین فاصله را
                ۱۰٪ بیشتر کرده بود (mt ۱۶→۱۷٫۶ و تاپ ۳۶۴→۳۶۵٫۶).
                v42: «متن 20درصد از بالا فاصله بگیرد» (دسکتاپ) — طبق قرارداد همان پایهٔ ۱۶px
                ×۲۰٪ = +۳٫۲px؛ تاپ ۳۶۸٫۸→۳۷۲px (موبایل mt-[14.4px] دست‌نخورده).
                گپ ردیف CTA هم با تاپ جدید آن (۴۲۶٫۹۵px) دوباره ۱۵٪ کم شد */}
            <p className="mt-[14.4px] max-w-[460px] text-[12px] leading-[1.95] text-[#A9B4D0] min-[901px]:absolute min-[901px]:left-1/2 min-[901px]:top-[372px] min-[901px]:m-0 min-[901px]:w-[460px] min-[901px]:max-w-none min-[901px]:-translate-x-1/2 min-[901px]:text-[13.5px] min-[901px]:leading-[25.2px]">
              آموزش تمام سطوح زبان آلمانی، دقیقاً متناسب با هدف شما — همه با گزارش پیشرفت.
            </p>

            {/* دو دکمهٔ CTA — بازطراحی رادیکال با بررسی دقیق readme.com (درخواست کاربر:
                «طراحی دو باتن حس سرچ را دارد و بولد و زشت است؛ readme.com بسیار ریز و
                مینیمال کارکرده») — کپی وفادار از زبان CTA خودِ readme:
                • قرص‌های گردکامل کوچک با متن ۱۴px/وزن معمولی (هم‌الگوی text-body-button
                  با line-height ۲۰px و font-weight ۴۰۰) — بدون هیچ آیکون، فلش، جداکننده،
                  توضیح یا خوشهٔ چیپ؛ عرض ثابت ۱۷۶px در دسکتاپ مثل قرص ثابت ۱۶۰px
                  «Book a demo» و «Learn more» readme؛ در موبایل هم دو قرص هم‌اندازهٔ
                  کنار هم (flex-1) — هیچ‌جا عرض کامل ندارند تا دیگر حس نوار سرچ نباشند؛
                • قرص توپر سفید = وارونهٔ الگوی قرص توپر readme (bg-blue-7 متن سفید روی
                  زمینهٔ روشن) روی زمینهٔ سرمه‌ای ما؛ hover فقط یک tint آرام + ترنزیشن
                  ۱۵۰ms؛ هیچ سایه و هیچ حرکت اضافه‌ای ندارد؛
                • قرص دوم = الگوی دقیق قرص‌های hero سرمه‌ای readme («Import by URL»):
                  فقط حلقهٔ داخلی مویین (ring-inset) + متن ملایم؛ hover فقط متن و حلقه
                  روشن‌تر می‌شوند — بدون تغییر پس‌زمینه؛
                • وسط‌چینی دقیق («وسط در وسط»): ردیف با left-1/2 + -translate-x-1/2 روی
                  همان محور تیتر و زیرتیتر (ستون ۵۵۶px قاب پس‌زمینهٔ d.svg: ۴۰۵..۹۶۲)
                  قفل شده؛ فشردن active:scale-[0.985] active:duration-50 و حلقهٔ فوکوس
                  دولایه = کپی shadow-button-focus (۱٫۲۵px + ۳px)؛
                • v29 — آیکون: هر قرص یک آیکون خطی بدون بکگراند ۲۰×۲۰ گرفت (درخواست کاربر
                  «دو آیکون بدون بکگراند 20در 20»): BookOpen برای دوره‌ها و ClipboardList
                  برای تعیین سطح؛ با currentColor رنگ متن قرص را می‌گیرند (قرص دوم در
                  hover سفید می‌شود) و گپ ۸px با متن دارند — متن همان ۱۴px/۴۰۰ readme
                • v30 — آیکون‌ها ۳۰٪ کوچک‌تر شدند (۲۰→۱۴px؛ درخواست کاربر) و هر قرص
                  پدینگ افقی ۸px گرفت («دکمه پدینگ ندارد در موبایل»)؛ ردیف در موبایل با
                  ‎-mx-۱۲px از اینست ۴۸px ستون فرار می‌کند تا پدینگ واقعی بدون سرریز متن
                  جا شود (اندازه‌گیری واقعی در ۳۹۰px: متن «تعیین سطح رایگان» ۱۰۲٫۹px و
                  قرص ۱۳۲٫۳px — با آیکون ۲۰px فقط ۰٫۷px هوا می‌ماند)
                • v31 — موبایل: آیکون‌ها ۲۵٪ دیگر کوچک‌تر (۱۴→۱۰٫۵px) و ارتفاع قرص ۱۵٪ کمتر
                  (۴۲→۳۵٫۷px) — درخواست کاربر؛ دسکتاپ همان ۱۴px/۴۲px (با min-[901px] بازگردانده)
                • v32 — موبایل: آیکون‌ها کلاً حذف شدند (درخواست کاربر «آیکون دکمه‌ها در موبایل
                  حذف شود») — hidden تا ۹۰۰px؛ دسکتاپ همان آیکون ۱۴px با hidden/block
                • v42 — دسکتاپ: فاصلهٔ «باتنهای پایین» تا زیرتیتر ۱۵٪ کمتر شد (درخواست کاربر)
                  — گپ ۳۵→۲۹٫۷۵px؛ ردیف ۲٫۰۵px بالاتر: تاپ ۴۲۹→۴۲۶٫۹۵px (زیرتیتر با +۳٫۲px
                  به ۳۷۲ رفته؛ ۳۷۲+۲۵٫۲+۲۹٫۷۵=۴۲۶٫۹۵) — موبایل همان mt-[24px] جریان عادی */}
            <div className="-mx-[12px] mt-[24px] flex w-[calc(100%+24px)] gap-[10px] min-[561px]:mt-[34px] min-[561px]:justify-center min-[561px]:gap-[12px] min-[901px]:absolute min-[901px]:left-1/2 min-[901px]:top-[426.95px] min-[901px]:m-0 min-[901px]:w-auto min-[901px]:max-w-none min-[901px]:-translate-x-1/2">
              <SiteLink
                href="/courses"
                ariaLabel="مشاهدهٔ همهٔ دوره‌ها"
                className="flex h-[35.7px] min-[901px]:h-[42px] px-[8px] flex-1 basis-0 items-center justify-center gap-[8px] whitespace-nowrap rounded-full bg-white text-[14px] font-normal leading-[20px] text-[#00033F] transition-all duration-150 hover:bg-[#E9F1FC] active:scale-[0.985] active:bg-[#DFEAF9] active:duration-50 focus-visible:outline-none focus-visible:shadow-[0_0_0_1.25px_#00033F,0_0_0_3.25px_#00AEDA] motion-reduce:transition-none min-[561px]:w-[176px] min-[561px]:flex-none min-[561px]:basis-auto"
              >
                <BookOpen strokeWidth={2} aria-hidden="true" className="hidden size-[14px] shrink-0 min-[901px]:block" />
                مشاهدهٔ دوره‌ها
              </SiteLink>
              <AnchorLink
                id="placement"
                ariaLabel="تعیین سطح رایگان"
                className="flex h-[35.7px] min-[901px]:h-[42px] px-[8px] flex-1 basis-0 items-center justify-center gap-[8px] whitespace-nowrap rounded-full text-[14px] font-normal leading-[20px] text-[#A9B4D0] ring-1 ring-inset ring-white/[0.24] transition-all duration-150 hover:text-white hover:ring-[#00C0F0]/60 active:scale-[0.985] active:duration-50 focus-visible:outline-none focus-visible:shadow-[0_0_0_1.25px_#00033F,0_0_0_3.25px_#00AEDA] motion-reduce:transition-none min-[561px]:w-[176px] min-[561px]:flex-none min-[561px]:basis-auto"
              >
                <ClipboardList strokeWidth={2} aria-hidden="true" className="hidden size-[14px] shrink-0 min-[901px]:block" />
                تعیین سطح رایگان
              </AnchorLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* --------------------- سکشن سه مسیر — یک سکشنِ جمع‌وجور --------------------- */

type PathItem = {
  latin: string;
  fa: string;
  tagline: string;
  desc: string;
  features: string[];
  icon: React.ElementType;
  cta: string;
};

const PATHS: PathItem[] = [
  {
    latin: "BLITZDEUTSCH",
    fa: "زبان",
    tagline: "از الفبا تا تسلط در چهار مهارت",
    desc: "آموزش کامل زبان آلمانی از پایه؛ هر سطح یک پله مشخص با تمرین چهار مهارت و گزارش پیشرفت منظم. اگر هدف کلی شما «یاد گرفتن آلمانی» است، این مسیر برای شماست.",
    features: ["کلاس حضوری یا آنلاین از A1 تا B2", "تمرین چهار مهارت در هر جلسه", "گزارش پیشرفت بعد از هر فصل"],
    icon: GraduationCap,
    cta: "شروع با تعیین سطح",
  },
  {
    latin: "BLITZJOB",
    fa: "زبان و بازار کار",
    tagline: "برای کار، مصاحبه و محیط آلمانی‌زبان",
    desc: "آلمانی‌ای که در کار به آن نیاز دارید: مصاحبه شبیه‌سازی‌شده، ایمیل و مکالمه رسمی اداری و واژگان تخصصی شغل شما — از رزومه تا روز اول کار.",
    features: ["مصاحبه کاری شبیه‌سازی‌شده", "ایمیل و مکالمه رسمی اداری", "واژگان تخصصی بر اساس شغل شما"],
    icon: Briefcase,
    cta: "شروع با تعیین سطح",
  },
  {
    latin: "BLITZZERTIFIKAT",
    fa: "زبان با مدارک",
    tagline: "آمادگی آزمون‌های رسمی Goethe ،ÖSD و TestDaF",
    desc: "اگر مدرک رسمی لازم دارید، دقیقاً طبق فرمت همان آزمون تمرین می‌کنید؛ با آزمون آزمایشی، رفع اشکال هدفمند و برنامه مطالعه تا روز آزمون.",
    features: ["تمرین طبق فرمت دقیق آزمون", "آزمون آزمایشی با بازخورد", "برنامه مطالعه تا روز آزمون"],
    icon: Award,
    cta: "شروع با تعیین سطح",
  },
];

/* ------------- سربرگ مشترک سکشن‌ها — تیتر چسبیده به بدنه ------------- */

export function RdHeadRow({
  num,
  label,
  title,
  accent,
  desc,
  dark = false,
  flushBadge = false,
  tightTitle = false,
  titleSize,
  descEnd = false,
  action,
}: {
  num: string;
  label: string;
  title: string;
  accent?: string;
  desc?: string;
  dark?: boolean;
  /** بج سربرگ بدون پدینگ شروع — چسبیده به لبهٔ محتوا (نسخهٔ نهایی درباره ما) */
  flushBadge?: boolean;
  /** تیتر بدون فاصلهٔ از بج — چسبیده زیر سربرگ (نسخهٔ نهایی درباره ما) */
  tightTitle?: boolean;
  /** کلاس اندازهٔ تیتر — پیش‌فرض ۲۴/۳۲/۳۶ (موبایل ۵٪ کوچک‌تر: ۲۲٫۸)؛ «درباره ما» ۳۰ پیکسل */
  titleSize?: string;
  /** توضیح در دسکتاپ تا لبهٔ مقابل پرتاب شود (سمت چپ در RTL) — سکشن مسیرها */
  descEnd?: boolean;
  /** دکمهٔ انتهای سربرگ — دسکتاپ: انتها‌ی ردیف تیتر/توضیح؛ موبایل: زیر توضیح (سکشن دوره‌ها) */
  action?: React.ReactNode;
}) {
  return (
    <div
      className={`relative rounded-[8px] ${dark ? "bg-rd-night" : "bg-white"} px-5 pb-3 sm:px-7 sm:pb-3.5 xl:px-8`}
    >
      <RdSqFrame dark={dark} />
      {/* بج بالای ردیف تیتر — تا تیتر و متن توضیح در دسکتاپ دقیقاً هم‌سطح شروع شوند */}
      <RdEyebrow num={num} label={label} dark={dark} className={flushBadge ? "ps-0" : ""} />
      <div className={`xl:flex xl:items-start xl:gap-12 ${descEnd || action ? "xl:justify-between" : ""}`}>
        <h2
          className={`${tightTitle ? "" : "mt-3"} max-w-[460px] font-black-fa leading-[1.4] xl:w-[480px] xl:shrink-0 ${
            titleSize ?? "text-[22.8px] sm:text-[32px] xl:text-[36px]"
          } ${dark ? "text-white" : "text-ink"}`}
        >
          {title}{" "}
          {accent && <span className={dark ? "text-rd-sky2" : "text-rd-title"}>{accent}</span>}
        </h2>
        {desc && (
          <p
            className={`mt-2.5 max-w-[448px] text-[13px] leading-6 xl:max-w-none ${tightTitle ? "" : "xl:mt-3"} ${
              dark ? "text-white/65" : "text-ink-soft"
            }`}
          >
            {desc}
          </p>
        )}
        {action && <div className="mt-3.5 shrink-0 xl:mt-1.5">{action}</div>}
      </div>
    </div>
  );
}

function PathCard({ p, index, className = "" }: { p: PathItem; index: number; className?: string }) {
  const Icon = p.icon;
  return (
    <RdCard className={`flex flex-col p-5 ${className}`} marks radius="rounded-[8px]">
      <div className="flex items-center justify-between">
        <span className="rd-inside grid size-10 place-items-center rounded-[8px] text-rd-accent">
          <Icon className="size-5" />
        </span>
        <span
          className="rd-inside dc-mono rounded-full px-3 py-1.5 text-[10px] font-medium tracking-[0.18em] text-ink-soft"
          dir="ltr"
        >
          {p.latin}
        </span>
      </div>
      <h3 className="mt-4 text-xl font-black-fa text-ink">{p.fa}</h3>
      <p className="mt-1 text-[13px] font-bold text-ink-soft">{p.tagline}</p>
      <p className="mt-2 text-[13px] leading-6 text-ink-soft">{p.desc}</p>
      <ul className="mt-3 space-y-1.5">
        {p.features.map((f) => (
          <li key={f} className="flex items-start gap-2.5 text-[13px] text-ink-soft">
            <Check className="mt-0.5 size-4 shrink-0 text-rd-accent" strokeWidth={2.5} />
            {f}
          </li>
        ))}
      </ul>
      <div className="mt-auto pt-4">
        <RdLabel code="PTH" n={`0${index + 1}`} className="mb-3" />
        <AnchorLink
          id="placement"
          className="rd-inside grid h-10 place-items-center rounded-full text-[13px] font-bold text-ink transition-colors hover:bg-canvas-soft"
        >
          {p.cta}
        </AnchorLink>
      </div>
    </RdCard>
  );
}

/** اسلایدر مسیرها — موبایل: هر بار یک کارت + بولت زیرین + پخش خودکار هر ۴ ثانیه؛
    دسکتاپ: همان گرید سه‌ستونهٔ قبلی */
function PathsSlider() {
  const trackRef = React.useRef<HTMLDivElement>(null);
  const [active, setActive] = React.useState(0);
  // تغییر این شمارنده تایمر پخش خودکار را از نو شروع می‌کند (بعد از تعامل کاربر)
  const [timerKey, setTimerKey] = React.useState(0);
  const debounceRef = React.useRef(0);

  const isMobile = () => window.matchMedia("(max-width: 767px)").matches;

  // اسکرول افقی به کارت فعال — فقط موبایل؛ بدون scrollIntoView تا صفحه عمودی جابه‌جا نشود
  React.useEffect(() => {
    if (!isMobile()) return;
    const track = trackRef.current;
    const el = track?.children[active] as HTMLElement | undefined;
    if (!track || !el) return;
    const delta =
      el.getBoundingClientRect().left + el.getBoundingClientRect().width / 2 -
      (track.getBoundingClientRect().left + track.clientWidth / 2);
    track.scrollTo({ left: track.scrollLeft + delta, behavior: "smooth" });
  }, [active]);

  // پخش خودکار هر ۴ ثانیه
  React.useEffect(() => {
    const t = window.setInterval(() => {
      if (isMobile()) setActive((a) => (a + 1) % PATHS.length);
    }, 4000);
    return () => window.clearInterval(t);
  }, [timerKey]);

  // تشخیص کارت فعال هنگام سوایپ — با تاخیر کوتاه تا اسکرول جا بیفتد
  const onScroll = () => {
    window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => {
      const track = trackRef.current;
      if (!track || !isMobile()) return;
      const box = track.getBoundingClientRect();
      const center = box.left + box.width / 2;
      const idx = Array.from(track.children).findIndex((c) => {
        const r = c.getBoundingClientRect();
        return r.left <= center && r.right >= center;
      });
      if (idx >= 0 && idx !== active) {
        setActive(idx);
        setTimerKey((k) => k + 1);
      }
    }, 140);
  };
  React.useEffect(() => () => window.clearTimeout(debounceRef.current), []);

  return (
    <>
      {/* ردیف کارت‌ها — موبایل: اسلایدر اسنپ؛ دسکتاپ: گرید سه‌ستونه */}
      <div
        ref={trackRef}
        onScroll={onScroll}
        className="mt-3.5 gap-5 md:grid md:grid-cols-3 xl:mt-4 xl:gap-6 max-md:flex max-md:snap-x max-md:snap-mandatory max-md:overflow-x-auto rd-no-scrollbar"
      >
        {PATHS.map((p, i) => (
          <PathCard key={p.latin} p={p} index={i} className="max-md:w-full max-md:shrink-0 max-md:snap-center" />
        ))}
      </div>
      {/* بولت‌های اسلایدر — فقط موبایل، زیر کارت‌ها */}
      <div
        className="mt-4 flex items-center justify-center gap-1.5 md:hidden"
        role="tablist"
        aria-label="انتخاب مسیر یادگیری"
      >
        {PATHS.map((p, i) => (
          <button
            key={p.latin}
            type="button"
            role="tab"
            aria-selected={i === active}
            aria-label={p.fa}
            onClick={() => {
              setActive(i);
              setTimerKey((k) => k + 1);
            }}
            className={`h-1.5 rounded-full transition-all duration-200 ${
              i === active ? "w-5 bg-rd-accent" : "w-1.5 bg-ink-faint/50 hover:bg-ink-faint"
            }`}
          />
        ))}
      </div>
    </>
  );
}

function Paths() {
  return (
    <RdSection id="paths">
      <RdBand className="top-0" />
      {/* فاصلهٔ استاندارد سکشن‌ها — مثل سکشن ۱ (درباره ما) */}
      <RdWrap pb="pb-[62px] sm:pb-[72px] xl:pb-[79px]">
        <RdHeadRow
          num="02"
          label="مسیرهای یادگیری"
          title="کدام مسیر"
          accent="مال شماست؟"
          desc="سه هدف، سه مسیر مشخص. تعیین سطح رایگان نشان می‌دهد از کدام نقطه شروع کنید."
          flushBadge
          tightTitle
          titleSize="text-[22.8px] sm:text-[30px]"
          descEnd
        />
        <PathsSlider />
      </RdWrap>
    </RdSection>
  );
}

/* ------------------ سکشن چهار مهارت — الگوی features ------------------ */

const LESEN_TEXT =
  "Maria ist 24 Jahre alt und kommt aus Spanien. Sie wohnt seit drei Monaten in Berlin. Sie lernt Deutsch an einer Sprachschule. Jeden Morgen steht Maria um sieben Uhr auf. Sie frühstückt zu Hause und trinkt eine Tasse Kaffee. Um acht Uhr fährt sie mit dem Bus zur Schule. Der Deutschkurs beginnt um neun Uhr. Maria lernt neue Wörter, liest kurze Texte und spricht mit ihren Mitschülern. Nach dem Kurs geht sie manchmal in ein Café. Dort trinkt sie einen Tee und liest ein Buch.";

function LesenDemo() {
  return (
    <div className="relative h-[86.4px] overflow-hidden rounded-[8px] border border-hairline-soft bg-white sm:h-[132px] xl:h-[146px]" dir="ltr">
      <div className="dc-scroll p-3 pe-14 text-[12.5px] leading-6 text-ink-soft">
        <p>{LESEN_TEXT}</p>
        <p aria-hidden="true">{LESEN_TEXT}</p>
      </div>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-white to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-white to-transparent" />
    </div>
  );
}

function SprechenDemo() {
  return (
    <div className="relative flex h-[86.4px] flex-col justify-center gap-1.5 overflow-hidden rounded-[8px] border border-hairline-soft bg-canvas-soft/60 p-2 sm:h-[132px] sm:gap-2 sm:p-3 xl:h-[146px]">
      <Bubble name="A" text="Hallo! Wie heißt du?" tone="soft" anim="dc-pop-a" avatarClass="bg-navy-100 text-navy-700" />
      <Bubble name="A" text="Ich heiße Anna. Woher kommst du?" tone="white" anim="dc-pop-b" avatarClass="bg-turquoise-100 text-turquoise-800" />
      <Bubble name="M" text="Ich heiße Max. Und du?" tone="navy" anim="dc-pop-c" avatarClass="bg-white text-navy-800 ring-1 ring-hairline-soft" className="max-sm:hidden" />
    </div>
  );
}

function SchreibenDemo() {
  return (
    <div className="relative h-[86.4px] overflow-hidden rounded-[8px] border border-hairline-soft bg-white p-2.5 sm:h-[132px] sm:p-3 xl:h-[146px]" dir="ltr">
      <span className="dc-chip absolute start-3 top-2.5 inline-flex items-center gap-1.5 rounded-full bg-ok/10 px-2.5 py-1 text-[10.5px] font-extrabold text-ok">
        <Check className="size-3" strokeWidth={3} />
        Correct
      </span>
      <div className="mt-5 space-y-2 text-[11.5px] leading-[1.6] sm:mt-7">
        <p className="text-ink-faint">Seit sechs Monaten lebt Amir in Deutschland.</p>
        <p className="font-medium text-ink">
          Er kommt{" "}
          <span className="relative inline-block text-ink-soft">
            zu Hause
            <span className="dc-strike absolute inset-x-0 top-1/2 h-[2px] -translate-y-1/2 rounded-full bg-crimson-500" />
          </span>{" "}
          <span className="dc-fixed font-extrabold text-ok">aus dem Iran</span>.
        </p>
        <p className="hidden text-ink-faint sm:block">Jetzt wohnt er in Hamburg.</p>
      </div>
    </div>
  );
}

const WAVE_BARS = [55, 80, 45, 95, 60, 85, 40, 75, 90, 50, 70, 45];

function HörenDemo() {
  return (
    <div className="relative grid h-[86.4px] place-items-center rounded-[8px] border border-hairline-soft bg-canvas-soft/60 p-3 sm:h-[132px] xl:h-[146px]" dir="ltr">
      <div className="flex w-full max-w-[260px] items-center gap-3 rounded-full bg-navy-900 py-2 pe-4 ps-2 text-white">
        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-brand-500 text-navy-900">
          <Play className="size-4 fill-current" />
        </span>
        <span className="flex h-5 flex-1 items-center gap-[3px]" aria-hidden="true">
          {WAVE_BARS.map((h, i) => (
            <span
              key={i}
              className="dc-wave w-[3px] shrink-0 rounded-full bg-turquoise-300"
              style={{ height: `${h}%`, animationDelay: `${i * 0.12}s` }}
            />
          ))}
        </span>
        <span className="text-[11px] font-bold tabular-nums text-navy-200">0:05</span>
        <Volume2 className="size-4 shrink-0 text-navy-200" />
      </div>
    </div>
  );
}

const SKILLS = [
  { icon: BookOpenText, de: "Lesen", fa: "خواندن", desc: "درک متون، معانی و اطلاعات نوشتاری.", Demo: LesenDemo },
  { icon: MessagesSquare, de: "Sprechen", fa: "صحبت کردن", desc: "توانایی مکالمه و بیان منظور و احساسات.", Demo: SprechenDemo },
  { icon: PenLine, de: "Schreiben", fa: "نوشتن", desc: "نوشتن جملات، پیام‌ها، ایمیل‌ها و متن‌های ساده.", Demo: SchreibenDemo },
  { icon: Headphones, de: "Hören", fa: "شنیدن", desc: "درک مکالمات و گفتگوهای روزمره به زبان آلمانی.", Demo: HörenDemo },
];

/** سلول مهارت — خطوط جداکنندهٔ شبکه مثل جدول features readme؛
    کلاس مرز هر سلول بر اساس موقعیت در شبکهٔ ۱/۲/۴ ستونه */
/* مرزهای گرید مهارت‌ها — موبایل: زیرهم با خط افقی؛ تبلت ۲×۲؛ دسکتاپ ۴تایی در یک ردیف */
const SKILL_BORDER = [
  "border-b sm:border-e",
  "border-b xl:border-e",
  "border-b sm:border-b-0 sm:border-e",
  "border-b sm:border-b-0",
];

function Skills() {
  return (
    <RdSection id="skills">
      <RdBand className="top-0" />
      <RdWrap pb="pb-[62px] sm:pb-[72px] xl:pb-[79px]">
        {/* سربرگ — از الگوی سربرگ مشترک سکشن‌های ۱ تا ۴ (v31: هم‌راستا و هم‌پدینگ بقیه؛
            سربرگ وسط‌چین ۶۴۰px قبلی حذف شد — درخواست کاربر «مثل سکشن 1و2و3و4») */}
        <RdHeadRow
          num="05"
          label="روش کلینیک"
          title="چهار مهارت،"
          accent="یک مسیر یادگیری"
          desc="با تقویت مهارت‌های شنیدن، گفتن، خواندن و نوشتن، زبان را کامل و کاربردی یاد بگیرید."
          flushBadge
          tightTitle
          titleSize="text-[22.8px] sm:text-[30px]"
          descEnd
        />

        {/* شبکهٔ مهارت‌ها — موبایل: زیرهمِ جمع‌وجور؛ تبلت ۲×۲؛ دسکتاپ ۴تایی — با قاب داخلی و خطوط جداکننده */}
        <div className="rd-inside relative mt-3.5 grid overflow-hidden rounded-[8px] bg-white sm:grid-cols-2 xl:mt-4 xl:grid-cols-4">
          <RdSqFrame />
          {SKILLS.map((s, i) => (
            <div
              key={s.de}
              className={`relative flex flex-col border-hairline-soft p-2.5 sm:p-5 ${SKILL_BORDER[i]}`}
            >
              {/* ردیف آیکون و بج — فقط تبلت/دسکتاپ؛ در موبایل آیکون داخل عنوان می‌آید */}
              <div className="flex items-center justify-between max-sm:hidden">
                <s.icon className="size-5 text-rd-accent" strokeWidth={1.8} />
                <span className="dc-mono rounded-[4px] bg-white px-1 text-[9px] tracking-[0.18em] text-ink-faint" dir="ltr">
                  SKL. [0{i + 1}]
                </span>
              </div>
              <h3 className="mt-3 flex items-baseline gap-2 max-sm:mt-0">
                <s.icon className="size-4 shrink-0 self-center text-rd-accent sm:hidden" strokeWidth={1.8} />
                <span className="text-lg font-black-fa text-ink max-sm:text-[15.5px]" dir="ltr">
                  {s.de}
                </span>
                <span className="text-[14px] font-bold text-ink max-sm:text-[12.5px]">— {s.fa}</span>
              </h3>
              <p className="mt-0.5 sm:mt-1 text-[13px] leading-6 text-ink-soft max-sm:line-clamp-2 max-sm:text-[12px] max-sm:leading-5">
                {s.desc}
              </p>
              {/* دموی هر مهارت — با mt-auto ته کارت می‌چسبد تا ارتفاع محتوا در هر چهار کارت هم‌تراز شود؛
                  موشن‌ها (اسکرول متن، حباب‌های گفتگو، تصحیح جمله، موج صوت) در موبایل هم دیده می‌شوند؛
                  v42: ارتفاع کارت دمو در موبایل ۸٪ بیشتر شد (درخواست کاربر «موبایل:چهار مهارت،
                  یک مسیر یادگیری: 8درصد ارتفاع کارتها زیاد شود») — ۸۰→۸۶٫۴px؛ تبلت/دسکتاپ همان */}
              <div className="mt-auto pt-1.5 sm:pt-3">
                <s.Demo />
              </div>
            </div>
          ))}
        </div>
      </RdWrap>
    </RdSection>
  );
}

/* ------------------ سکشن بنیان‌گذار — الگوی نقل‌قول ------------------ */

/* ------------------------------------------------------------------------
   ویدئوی آپارات — کد رسمی embed آپارات (L4): تگ div با شناسهٔ
   78141906945 و اسکریپت embed با data[rnddiv] هم‌شناسه؛ اسکریپت، iframe
   واکنش‌گرا را داخل همین div می‌سازد. تا لحظهٔ بارگذاری iframe، تصویر
   به‌جای iframe همیشه‌روشن، عکس شخص + بج چرخان PLAY VIDEO است؛ با کلیک،
   مودال باز می‌شود و ویدئو داخل همان مودال پخش می‌شود (P) — بدون
   نوشتهٔ «لینک به …» و بدون بوردر و +
   ------------------------------------------------------------------------ */

/** ویدئوی آپارات داخل مودال — کد رسمی embed آپارات (L4/P): با باز شدن مودال
    تزریق می‌شود و پس از بستن، Radix آن را unmount می‌کند */
export function AparatModalVideo() {
  const hostRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    const host = hostRef.current;
    if (!host || host.childElementCount > 0) return; // جلوگیری از تزریق دوباره
    const s = document.createElement("script");
    s.type = "text/JavaScript";
    s.src =
      "https://www.aparat.com/embed/skm8811?data[rnddiv]=78141906945&data[responsive]=yes&muted=true&startTime=1";
    host.appendChild(s);
  }, []);

  return <div ref={hostRef} id="78141906945" className="aparat-host" />;
}

/** دکمهٔ پخش ویدئو — قرص سفید مثل قبل: دایرهٔ زرد برند (هم‌رنگ دکمهٔ کارت Hören؛
    درخواست کاربر) + نوشتهٔ «پخش ویدئو» + آیکون فیلم؛ گوشهٔ پایین-چپ عکس،
    با کلیک مودال ویدئو باز می‌شود؛ هاور: زرد تیرهٔ برند (brand-600) */
export function PlayPill({
  onClick,
  label = "پخش ویدئو",
  ariaLabel,
}: {
  onClick: () => void;
  label?: string;
  ariaLabel?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel ?? label}
      className="group absolute bottom-3 left-3 z-10 flex h-10 items-center gap-2 rounded-full border border-hairline-soft bg-white ps-1.5 pe-3.5 transition-all duration-150 hover:bg-canvas-soft active:scale-[0.98]"
    >
      <span className="play-click grid size-7 place-items-center rounded-full bg-brand-500 text-navy-900 transition-all duration-150 group-hover:scale-105 group-hover:bg-brand-600 group-hover:animate-none">
        <Play className="size-3 -ms-px fill-current" />
      </span>
      <span className="text-[12px] font-extrabold text-ink">{label}</span>
      {/* آیکون ویدئو — هم‌رنگ بقیهٔ آیکون‌های سایت (ink-soft)، نه کم‌رنگ */}
      <Film className="size-4 text-ink-soft" />
    </button>
  );
}

function Founder() {
  const [videoOpen, setVideoOpen] = React.useState(false);
  // «توضیحات بیشتر» موبایل — برش از سکشن IN NUMBERS: سلول آمار و سلول داستان جمع می‌شوند؛
  // دکمهٔ آیکونی (محو سفید + فلش) زیر سلول بنیان‌گذار است؛ دسکتاپ همیشه کامل
  const [storyOpen, setStoryOpen] = React.useState(false);
  return (
    <RdSection id="founder">
      {/* نوار مرز بالای سکشن — هم‌ریتم سکشن‌های دیگر */}
      <RdBand className="top-0" />
      {/* فاصله تا سکشن «کدام مسیر» — گپ کامل = پدینگ پایین این سکشن + پدینگ بالای سکشن بعد */}
      <RdWrap pb="pb-[62px] sm:pb-[72px] xl:pb-[79px]">
        {/* سربرگ سکشن — الگوی سربرگ مشترک سایت */}
        <RdHeadRow
          num="01"
          label="درباره ما"
          title="یادگیری اصولی زبان"
          accent="آلمانی"
          flushBadge
          tightTitle
          titleSize="text-[25.5px] sm:text-[30px]"
        />

        {/* خوشهٔ شبکه‌ای درباره ما — الگوی لوگوگرید readme.com: سلول‌های سفید
            با خط مویی داخلی، گوشه‌های گرد بیرونی و مربع‌های تاکیدی روی تقاطع‌ها */}
        <div className="relative mt-3.5 xl:mt-4">
          <RdSqFrame />
          <div className="grid grid-cols-1 gap-px overflow-hidden rounded-[8px] border border-hairline-soft bg-hairline-soft md:grid-cols-2 xl:grid-cols-6">
            {/* سلول پرتره — عکس تا لبهٔ سلول + هاله‌های کمرنگ سه‌رنگ + دکمهٔ پخش */}
            <div className="relative min-h-[320px] overflow-hidden bg-white md:col-span-2 xl:col-span-2 xl:row-span-2">
              <img
                src="/images/edc/founder-poster.png"
                alt="دکتر المیرا معرفت‌پور — بنیان‌گذار کلینیک تخصصی زبان آلمانی"
                className="absolute inset-0 size-full object-cover object-top"
                loading="lazy"
              />
              {/* هاله‌های خیلی کمرنگ سه رنگ اصلی — سرمه‌ای، آبی آسمانی، صورتی */}
              <div aria-hidden="true" className="pointer-events-none absolute inset-0">
                <span className="absolute -top-14 -left-12 size-60 rounded-full bg-skyc/10 blur-3xl" />
                <span className="absolute right-[12%] top-[30%] size-72 rounded-full bg-[#F70458]/10 blur-3xl" />
                <span className="absolute -bottom-20 left-[30%] size-80 rounded-full bg-navy-deep/10 blur-3xl" />
              </div>
              <PlayPill onClick={() => setVideoOpen(true)} />
            </div>

            {/* سلول بنیان‌گذار — نام، سمت و بیو کوتاه، همیشه باز */}
            <div className="flex flex-col bg-white p-5 sm:p-6 xl:col-span-2">
              {/* محتوای سلول — وقتی جمع است، خط‌های پایانی (بیو و برچسب) خط‌به‌خط در سفید محو می‌شوند؛
                  دسکتاپ و حالت باز، کامل و بدون ماسک */}
              <div className={`flex flex-1 flex-col ${storyOpen ? "" : "dissolve-bottom"}`}>
                <span className="text-[11px] font-extrabold tracking-[0.3em] text-ink-faint" dir="ltr">
                  FOUNDER
                </span>
                <div className="mt-4 flex items-center gap-3">
                  <span aria-hidden="true" className="h-10 w-1 shrink-0 rounded-[4px] bg-rd-accent" />
                  <div>
                    <p className="text-[16px] font-black-fa leading-6 text-ink">دکتر المیرا معرفت‌پور</p>
                    <p className="mt-0.5 text-[12.5px] leading-5 text-ink-soft">بنیان‌گذار کلینیک تخصصی زبان آلمانی</p>
                  </div>
                </div>
                {/* بیو کوتاه — همیشه باز */}
                <p className="mt-3 text-[12.5px] leading-[1.75] text-ink-soft">
                  از سال ۱۳۸۹ کنار زبان‌آموزان — با گواهی تدریس DSIT تهران، مدرک «Deutsch Lehren Lernen» گوته و تخصص
                  ترجمهٔ اسناد حقوقی آلمانی.
                </p>
                <RdLabel code="FDR" n="01" className="mt-auto pt-4" />
              </div>
              {/* دکمهٔ آیکونی باز کردن — روی محل برش، بدون بوردر و بدون شدو (فقط موبایل و فقط وقتی جمع است)؛
                  انیمیشن dc-tap: فشردن و رهایش فنری — حس لمس کردن می‌دهد */}
              {!storyOpen && (
                <button
                  type="button"
                  onClick={() => setStoryOpen((v) => !v)}
                  aria-expanded={false}
                  aria-label="نمایش ادامهٔ توضیحات"
                  className="dc-tap mx-auto mt-2 flex size-8 items-center justify-center rounded-full bg-white text-ink-soft transition-colors hover:bg-canvas-soft hover:text-ink sm:hidden"
                >
                  <ChevronDown className="size-4" />
                </button>
              )}
            </div>

            {/* سلول آمار — الگوی متریک readme: عدد درشت + برچسب؛ در موبایل جزو «توضیحات بیشتر» */}
            <div
              className={`flex flex-col bg-white p-5 sm:p-6 xl:col-span-2 ${
                storyOpen ? "" : "max-sm:hidden"
              }`}
            >
              <span className="text-[11px] font-extrabold tracking-[0.3em] text-ink-faint" dir="ltr">
                IN NUMBERS
              </span>
              <div className="mt-4 flex items-center gap-3">
                <span className="rd-inside grid size-10 shrink-0 place-items-center rounded-[8px] text-rd-accent">
                  <Award className="size-[18px]" />
                </span>
                <div>
                  <p className="text-[20px] font-black-fa leading-none text-ink">+۱۶</p>
                  <p className="mt-1.5 text-[12.5px] leading-none text-ink-soft">سال تجربه تدریس آلمانی</p>
                </div>
              </div>
              <span aria-hidden="true" className="my-3.5 h-px bg-hairline-soft" />
              <div className="flex items-center gap-3">
                <span className="rd-inside grid size-10 shrink-0 place-items-center rounded-[8px] text-rd-accent">
                  <Users className="size-[18px]" />
                </span>
                <div>
                  {/* بدون dir=ltr تا عدد راست‌چین، هم‌لبهٔ متن زیرش باشد */}
                  <p className="text-[20px] font-black-fa leading-none text-ink">+۱۰٬۰۰۰</p>
                  <p className="mt-1.5 text-[12.5px] leading-none text-ink-soft">شاگرد در این مسیر</p>
                </div>
              </div>
              <RdLabel code="MET" n="02" className="mt-auto pt-4" />
            </div>

            {/* سلول داستان — متن بنیان‌گذار + دکمهٔ مشاهدهٔ کامل؛ در موبایل جزو «توضیحات بیشتر» */}
            <div
              className={`flex flex-col bg-white p-5 sm:p-6 md:col-span-2 xl:col-span-4 ${
                storyOpen ? "" : "max-sm:hidden"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold tracking-[0.3em] text-ink-faint" dir="ltr">
                  FOUNDER STORY
                </span>
                <span className="dc-mono text-[9px] tracking-[0.18em] text-ink-faint" dir="ltr">
                  STRY. [01]
                </span>
              </div>
              <p className="mt-3.5 max-w-[780px] text-justify text-[12.5px] leading-[1.85] text-ink-soft">
                «مسیر من با یک سؤال ساده شروع شد: چرا خیلی‌ها سال‌ها آلمانی می‌خوانند اما موقع صحبت کردن قفل می‌کنند؟ از
                سال ۱۳۸۹ تدریس آلمانی را شروع کردم و از دل همان کلاس‌ها، روش{" "}
                <span dir="ltr" className="inline-block font-bold text-ink">
                  Blitz
                </span>{" "}
                متولد شد؛ روشی که دانش زبان را به ‹می‌توانم› واقعی تبدیل می‌کند — حرف زدن، نه حفظ کردن. حالا بعد از
                سال‌ها تمرین، خطا و ساختن برنامه‌های درس‌به‌درس، به نقطه‌ای رسیده‌ایم که می‌توان با اطمینان گفت یادگیری
                آلمانی در این مسیر، از همان هفته‌های اول به حرف زدن واقعی ختم می‌شود؛ کافی است از روز اول جنس کلاس را
                عوض کنیم و شما هم...»
              </p>
              <div className="mt-auto flex flex-wrap items-center gap-2.5 pt-5">
                <SiteLink
                  href="/about"
                  className="rd-inside inline-flex h-10 shrink-0 items-center gap-2 rounded-full bg-white px-5 text-[13px] text-ink transition-colors hover:bg-canvas-soft"
                >
                  مشاهدهٔ کامل درباره ما
                  <ArrowLeft className="size-4 text-ink-faint" />
                </SiteLink>
              </div>
              {/* دکمهٔ آیکونی بستن — انتها، پس از «مشاهدهٔ کامل درباره ما» (موبایل، فقط وقتی باز است) */}
              {storyOpen && (
                <button
                  type="button"
                  onClick={() => setStoryOpen((v) => !v)}
                  aria-expanded={true}
                  aria-label="بستن توضیحات"
                  className="mx-auto mt-3 flex size-8 items-center justify-center rounded-full bg-white text-ink-soft transition-colors hover:bg-canvas-soft hover:text-ink sm:hidden"
                >
                  <ChevronDown className="size-4 rotate-180" />
                </button>
              )}
            </div>
          </div>
        </div>
      </RdWrap>

      {/* مودال ویدئو — با کلیک روی بج PLAY VIDEO باز می‌شود و ویدئو داخلش پخش می‌شود */}
      <Dialog open={videoOpen} onOpenChange={setVideoOpen}>
        <DialogContent className="max-w-[900px] sm:max-w-[900px] overflow-hidden border-0 bg-black p-0 text-white">
          <DialogTitle className="sr-only">ویدئوی معرفی دکتر المیرا معرفت‌پور</DialogTitle>
          <DialogDescription className="sr-only">ویدئوی معرفی کلینیک تخصصی زبان آلمانی المیرا</DialogDescription>
          <div className="aparat-embed w-full bg-black">
            <AparatModalVideo />
          </div>
        </DialogContent>
      </Dialog>
    </RdSection>
  );
}

/* --------------------- ماکت پنل دانشجو --------------------- */

/** عنوان‌های پنل — هر چند ثانیه یکی می‌شود: داشبورد → دوره‌های من → … (K3) */
const PANEL_NAV = [
  { label: "داشبورد", Icon: LayoutDashboard },
  { label: "دوره‌های من", Icon: BookOpen },
  { label: "تکالیف", Icon: ClipboardList },
  { label: "آزمون‌ها", Icon: PenLine },
];

/** رنگ آیتم‌های پنل — سبز، آبی اشباع‌تر (rd-sky2، پرکنندهٔ بلند روی سرمه‌ای)، سرخابی و زرد برند */
const PANEL_COLORS = ["#12224a", "#00c0f0", "#f80559", "#ffc20e"];

/** دادهٔ واقعی زبانه‌های پنل — آمار با آیکون، تایم‌لاین هفته، برنامهٔ پیش رو، دوره‌ها، تکالیف، آزمون‌ها، مهارت‌ها */
const PANEL_STATS = [
  { l: "سطح فعلی", v: "B1", c: 0, Icon: GraduationCap, ltr: true },
  { l: "پیشرفت کل", v: "۶۸٪", c: 1, Icon: TrendingUp, ltr: false },
  { l: "تکالیف باز", v: "۲", c: 2, Icon: ClipboardList, ltr: false },
  { l: "امتیاز کل", v: "۴۸۰", c: 3, Icon: Award, ltr: false },
];

/** فعالیت هفته — روز، ساعت مطالعه (برچسب روی میله) و نشانگر امروز */
const PANEL_WEEK = [
  { d: "ش", t: "۱٫۵", h: 1.5 },
  { d: "ی", t: "۲", h: 2 },
  { d: "د", t: "۱", h: 1 },
  { d: "س", t: "۲٫۵", h: 2.5 },
  { d: "چ", t: "۱٫۸", h: 1.8 },
  { d: "پ", t: "۲٫۸", h: 2.8, today: true },
  { d: "ج", t: "۱٫۲", h: 1.2 },
];

/** برنامهٔ پیش رو — جلسه، تکلیف و آزمون بعدی با آیکون */
const PANEL_SCHEDULE = [
  { t: "جلسهٔ گروهی A2 — مکالمه", w: "شنبه ۱۰:۰۰", c: 1, Icon: MessagesSquare },
  { t: "تحویل تکلیف: ایمیل رسمی", w: "فردا ۲۳:۰۰", c: 2, Icon: ClipboardList },
  { t: "آزمون آزمایشی Goethe B1", w: "۱۲ آذر", c: 0, Icon: PenLine },
];

const PANEL_COURSES = [
  { name: "آلمانی از الفبا تا تسلط", meta: "A2 → B1", w: "64%", c: 0, Icon: BookOpen, next: "فصل ۶ — مکالمهٔ روزمره" },
  { name: "زبان و بازار کار", meta: "مصاحبهٔ کاری", w: "38%", c: 1, Icon: Briefcase, next: "شبیه‌سازی مصاحبه" },
  { name: "زبان با مدارک", meta: "Goethe B1", w: "82%", c: 2, Icon: Award, next: "آزمون آزمایشی B1" },
];

const PANEL_TASKS = [
  { t: "ایمیل رسمی به همکار آلمانی", due: "مهلت: فردا", done: false, Icon: Mail },
  { t: "شبیه‌سازی مصاحبهٔ کاری", due: "تحویل شده", done: true, Icon: MessagesSquare },
  { t: "واژگان فصل ۵ — ۳۰ لغت", due: "مهلت: ۳ روز", done: false, Icon: BookOpen },
  { t: "تمرین مکالمهٔ هفتگی", due: "بازخورد داده شد", done: true, Icon: Users },
];

const PANEL_EXAMS = [
  { t: "آزمون آزمایشی Goethe B1", d: "۱۲ آذر", s: "رزرو شده", c: 1, Icon: PenLine },
  { t: "مصاحبهٔ شفاهی ÖSD", d: "۱۹ آذر", s: "رزرو شده", c: 2, Icon: MessagesSquare },
  { t: "آزمون پایان فصل ۴", d: "۲۴ آبان", s: "نمره ۸۴٪", c: 0, Icon: ClipboardList },
];

/** محتوای هر زبانه — همگام با عنوان چرخشی سایدبار؛ ردیف‌های جمع‌وجور با متن واقعی */
function PanelView({ active }: { active: number }) {
  const rowCls =
    "flex items-center gap-2.5 rounded-[8px] border border-white/[0.08] px-3 py-2.5 transition-colors hover:border-white/[0.16]";
  const chip =
    "dc-mono hidden shrink-0 rounded-full border border-white/10 px-2 py-0.5 text-[10px] text-white/45 sm:block";

  if (active === 0) {
    /* داشبورد — چهار کارت آمار با آیکون + تایم‌لاین هفته با برچسب ساعت + برنامهٔ پیش رو */
    return (
      <>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {PANEL_STATS.map((s) => (
            <div key={s.l} className="rounded-[8px] border border-white/[0.08] bg-white/[0.03] p-2">
              <span className="flex items-center gap-1.5">
                <span
                  className="grid size-5 shrink-0 place-items-center rounded-[5px]"
                  style={{ background: `${PANEL_COLORS[s.c]}3d`, color: PANEL_COLORS[s.c] }}
                >
                  <s.Icon className="size-3" />
                </span>
                <span className="truncate text-[10px] text-white/40">{s.l}</span>
              </span>
              <span dir={s.ltr ? "ltr" : undefined} className="mt-1 block text-[12px] font-black-fa text-white">
                {s.v}
              </span>
            </div>
          ))}
        </div>

        {/* فعالیت هفته — ستون‌های روزانه با برچسب ساعت روی هر میله، نشانگر امروز و جمع/میانگین */}
        <div className="mt-2 rounded-[8px] border border-white/[0.08] bg-white/[0.03] p-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-white">فعالیت این هفته</span>
            <span className="dc-mono text-[9px] tracking-[0.14em] text-white/35" dir="ltr">
              WEEK. 48
            </span>
          </div>
          <div className="mt-2 flex items-end gap-1.5">
            {PANEL_WEEK.map((d, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-1">
                <span
                  className={`dc-mono text-[8px] leading-none ${d.today ? "font-bold text-[#00c0f0]" : "text-white/35"}`}
                  dir="ltr"
                >
                  {d.t}
                </span>
                <span
                  aria-hidden="true"
                  className={`w-full rounded-[3px] ${d.today ? "bg-[#00c0f0]" : "bg-white/20"}`}
                  style={{ height: `${Math.max(4, (d.h / 2.8) * 20)}px` }}
                />
                <span className={`text-[9px] leading-none ${d.today ? "font-bold text-white" : "text-white/40"}`}>
                  {d.d}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-2 flex items-center justify-between border-t border-white/[0.08] pt-1.5 text-[9px] text-white/40">
            <span>مجموع: ۱۲٫۸ ساعت مطالعه</span>
            <span className="font-bold text-white/70">میانگین روزانه: ۱٫۸ ساعت</span>
          </div>
        </div>

        {/* برنامهٔ پیش رو — جلسه، تکلیف و آزمون بعدی */}
        <div className="mt-2 rounded-[8px] border border-white/[0.08] bg-white/[0.03] p-1">
          {PANEL_SCHEDULE.map((s) => (
            <div
              key={s.t}
              className="flex items-center gap-2 rounded-[6px] px-1.5 py-1 transition-colors hover:bg-white/[0.04]"
            >
              <span
                className="grid size-5 shrink-0 place-items-center rounded-[6px]"
                style={{ background: `${PANEL_COLORS[s.c]}3d`, color: PANEL_COLORS[s.c] }}
              >
                <s.Icon className="size-3" />
              </span>
              <span className="min-w-0 flex-1 truncate text-[11px] text-white">{s.t}</span>
              <span className="shrink-0 rounded-full bg-white/[0.07] px-2 py-0.5 text-[9px] font-bold text-white/60">
                {s.w}
              </span>
            </div>
          ))}
        </div>
      </>
    );
  }

  if (active === 1) {
    /* دوره‌های من — نوار خلاصه + آیکون مسیر + جلسهٔ بعد هر دوره + ادامهٔ یادگیری */
    return (
      <>
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-white">۳ دورهٔ فعال</span>
          <span className="rounded-full bg-white/[0.07] px-2 py-0.5 text-[9px] font-bold text-white/60">میانگین پیشرفت ۶۱٪</span>
        </div>
        <div className="mt-2 space-y-1.5">
          {PANEL_COURSES.map((k) => (
            <div key={k.name} className={rowCls}>
              <span
                className="grid size-7 shrink-0 place-items-center rounded-[8px]"
                style={{ background: `${PANEL_COLORS[k.c]}3d`, color: PANEL_COLORS[k.c] }}
              >
                <k.Icon className="size-3.5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[12px] font-bold text-white">{k.name}</span>
                <span className="mt-0.5 block truncate text-[10px] text-white/40">جلسهٔ بعد: {k.next}</span>
              </span>
              <span className="h-1.5 w-12 shrink-0 overflow-hidden rounded-[4px] bg-white/10 sm:w-20">
                <span className="block h-full rounded-[4px]" style={{ width: k.w, background: PANEL_COLORS[k.c] }} />
              </span>
              <span className="w-8 shrink-0 text-end text-[10px] font-bold text-white/70" dir="ltr">
                {k.w}
              </span>
            </div>
          ))}
        </div>
        {/* ادامهٔ یادگیری — جلسهٔ بعدی با نوار پیشرفت فصل */}
        <div className="mt-2 flex items-center gap-2.5 rounded-[8px] bg-white/[0.05] px-3 py-2.5">
          <Play className="size-3.5 shrink-0 text-[#00c0f0]" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[11px] font-bold text-white">ادامهٔ یادگیری — فصل ۶: مکالمهٔ روزمره</p>
            <div className="mt-1 h-1 overflow-hidden rounded-full bg-white/10">
              <span className="block h-full w-[64%] rounded-full bg-[#00c0f0]" />
            </div>
          </div>
          <span className="shrink-0 rounded-full bg-white/[0.07] px-2 py-1 text-[10px] font-bold text-white">۲۴ دقیقه</span>
        </div>
      </>
    );
  }

  if (active === 2) {
    /* تکالیف — فیلتر وضعیت + ردیف‌ها با آیکون و مهلت */
    return (
      <>
        <div className="flex items-center gap-1.5">
          <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-bold text-rd-night">همه — ۸</span>
          <span className="rounded-full border border-white/[0.12] px-2.5 py-1 text-[10px] font-bold text-white/60">در انتظار — ۲</span>
          <span className="rounded-full border border-white/[0.12] px-2.5 py-1 text-[10px] font-bold text-white/60">انجام شده — ۶</span>
        </div>
        <div className="mt-2 space-y-1.5">
          {PANEL_TASKS.map((k) => (
            <div key={k.t} className={rowCls}>
              <span
                className="grid size-6 shrink-0 place-items-center rounded-[6px]"
                style={{
                  background: `${PANEL_COLORS[k.done ? 0 : 1]}3d`,
                  color: PANEL_COLORS[k.done ? 0 : 1],
                }}
              >
                <k.Icon className="size-3" />
              </span>
              <span className="min-w-0 flex-1 truncate text-[12px] text-white">{k.t}</span>
              <span className={chip}>{k.due}</span>
              <span
                className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold ${
                  k.done ? "bg-[#00c9483d] text-[#00c948]" : "bg-white/10 text-white/60"
                }`}
              >
                {k.done ? "انجام شد" : "در انتظار"}
              </span>
            </div>
          ))}
        </div>
      </>
    );
  }

  if (active === 3) {
    /* آزمون‌ها — آیکون + تاریخ + شمارش معکوس آزمون بعدی */
    return (
      <>
        <div className="space-y-1.5">
          {PANEL_EXAMS.map((k) => (
            <div key={k.t} className={rowCls}>
              <span
                className="grid size-6 shrink-0 place-items-center rounded-[6px]"
                style={{ background: `${PANEL_COLORS[k.c]}3d`, color: PANEL_COLORS[k.c] }}
              >
                <k.Icon className="size-3" />
              </span>
              <span className="min-w-0 flex-1 truncate text-[12px] font-bold text-white">{k.t}</span>
              <span className="hidden shrink-0 text-[10px] text-white/40 sm:block">{k.d}</span>
              <span
                className="shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold"
                style={{ background: `${PANEL_COLORS[k.c]}3d`, color: PANEL_COLORS[k.c] }}
              >
                {k.s}
              </span>
            </div>
          ))}
        </div>
        {/* شمارش معکوس آزمون بعدی */}
        <div className="mt-2 flex items-center gap-2 rounded-[8px] bg-white/[0.05] px-3 py-2">
          <Clock className="size-3.5 shrink-0 text-[#00c0f0]" />
          <span className="min-w-0 flex-1 truncate text-[11px] text-white/60">آزمون بعدی: آزمون آزمایشی Goethe B1</span>
          <span className="shrink-0 text-[10px] font-bold text-white">۱۸ روز مانده</span>
        </div>
      </>
    );
  }

  /* زبانهٔ «گزارش پیشرفت» طبق نسخهٔ نهایی حذف شد */
  return null;
}

function PanelMockup() {
  // عنوان فعال هر ۲٫۶ ثانیه جلو می‌رود
  const [active, setActive] = React.useState(0);
  React.useEffect(() => {
    const t = window.setInterval(() => setActive((a) => (a + 1) % PANEL_NAV.length), 2600);
    return () => window.clearInterval(t);
  }, []);

  return (
    /* ماکت تیره — ۴٪ روشن‌تر از بکگراند سکشن (#00033f → #0a0d47)؛ با قاب مویی روشن متمایز می‌شود */
    <div className="mx-auto w-full overflow-hidden rounded-[8px] border border-white/[0.16] bg-[#0a0d47]">
      {/* نوار بالا — عنوان چرخشی + جستجو؛ «مشاور هوشمند» حذف شده */}
      <div className="flex h-12 items-center gap-2.5 border-b border-white/[0.08] px-4">
        <span key={active} className="dc-rot text-[13px] font-black-fa text-white">
          {PANEL_NAV[active].label}
        </span>
        <span className="dc-mono text-[9px] tracking-[0.18em] text-white/35" dir="ltr">
          PNL. [0{active + 1}]
        </span>
        <span
          className="ms-auto hidden h-8 w-[190px] items-center gap-2 rounded-full border border-white/10 px-2.5 text-[12px] text-white/40 sm:flex"
          dir="ltr"
        >
          <Search className="size-3.5" />
          <span>Search</span>
          <kbd className="dc-mono ms-auto rounded-[4px] border border-white/10 px-1 text-[10px]">⌘K</kbd>
        </span>
      </div>
      {/* بدنه — ارتفاع ~۲۰٪ کمتر از قبل؛ سایدبار تیره با آیتم‌های رنگی + محتوای واقعی همگام با عنوان چرخشی */}
      <div className="relative flex h-[320px] max-sm:h-[348px]">
        <aside className="hidden w-44 shrink-0 flex-col gap-0.5 border-e border-white/[0.08] p-3 sm:flex">
          {PANEL_NAV.map(({ label, Icon }, i) => (
            <span
              key={label}
              className={`flex cursor-pointer items-center gap-2 rounded-[8px] px-2.5 py-2 text-[12px] transition-colors ${
                i === active ? "bg-white/[0.06] font-bold text-white" : "text-white/55 hover:bg-white/[0.04]"
              }`}
            >
              <span
                aria-hidden="true"
                className="size-2 shrink-0 rounded-[2px]"
                style={{ background: PANEL_COLORS[i % PANEL_COLORS.length], opacity: i === active ? 1 : 0.35 }}
              />
              <Icon className="size-3.5" />
              {label}
            </span>
          ))}
        </aside>
        <div className="min-w-0 flex-1 overflow-hidden p-4">
          <div key={active} className="dc-rot">
            <PanelView active={active} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------- سکشن پنل اختصاصی — کل سکشن روی بکگراند سرمه‌ای var(--color-navy-deep) -------- */

function PanelSection() {
  return (
    <RdSection id="panel" dark>
      <RdBand className="top-0" dark />
      <RdWrap pb="pb-[62px] sm:pb-[72px] xl:pb-[79px]">
        {/* سربرگ — هم‌اندازه و هم‌جایگاه سکشن «کدام مسیر مال شماست؟» */}
        <RdHeadRow
          num="03"
          label="پنل دانشجو"
          title="همه‌چیز در"
          accent="پنل اختصاصی"
          desc="با خرید دوره، به آموزش‌ها، تکالیف، آزمون‌ها و به‌روزرسانی‌ها در پنل اختصاصی دسترسی دارید."
          dark
          flushBadge
          tightTitle
          titleSize="text-[22.8px] sm:text-[30px]"
          descEnd
        />

        {/* ماکت — هم‌رنگ بکگراند سکشن؛ با مربع‌های تاکیدی و قاب مویی متمایز */}
        <div className="relative mt-3.5 xl:mt-4">
          <RdSqFrame dark />
          <PanelMockup />
        </div>
      </RdWrap>
    </RdSection>
  );
}

/* ------------- سکشن دوره‌ها — سه کارت با عکس، با تایتل ------------- */

/** سه دورهٔ صفحهٔ اصلی — یک دوره از هر مسیر + عکس اختصاصی هر کارت */
const HOME_COURSES = [
  { slug: "german-a1", img: "/images/classroom/c5.jpg", alt: "کلاس گروهی دوره آلمانی A1" },
  { slug: "blitz-job", img: "/images/study/s3.jpg", alt: "تمرین آلمانی برای کار و مصاحبه" },
  { slug: "blitz-zertifikat", img: "/images/books/b4.jpg", alt: "کتاب‌های آمادگی آزمون‌های رسمی آلمانی" },
];

function Courses() {
  const trackRef = React.useRef<HTMLDivElement>(null);
  const [active, setActive] = React.useState(0);
  // تغییر این شمارنده تایمر پخش خودکار را از نو شروع می‌کند (بعد از تعامل کاربر)
  const [timerKey, setTimerKey] = React.useState(0);
  const debounceRef = React.useRef(0);

  const isMobile = () => window.matchMedia("(max-width: 639px)").matches;

  // اسکرول به کارت فعال — لبهٔ شروع (راست در RTL) کارت روی لبهٔ ریلی؛ ۱۵٪ از کارت بعدی در سمت چپ پیدا است
  React.useEffect(() => {
    if (!isMobile()) return;
    const track = trackRef.current;
    const el = track?.children[active] as HTMLElement | undefined;
    if (!track || !el) return;
    const box = el.getBoundingClientRect();
    const tr = track.getBoundingClientRect();
    // کارت آخر با لبهٔ پایان صاف می‌شود تا نواری خالی در انتهای لیست نماند
    const delta =
      active === HOME_COURSES.length - 1
        ? box.left - tr.left
        : box.left + box.width - (tr.left + tr.width);
    track.scrollTo({ left: track.scrollLeft + delta, behavior: "smooth" });
  }, [active]);

  // پخش خودکار هر ۴ ثانیه — فقط موبایل
  React.useEffect(() => {
    const t = window.setInterval(() => {
      if (isMobile()) setActive((a) => (a + 1) % HOME_COURSES.length);
    }, 4000);
    return () => window.clearInterval(t);
  }, [timerKey]);

  // تشخیص کارت فعال هنگام سوایپ — با تاخیر کوتاه تا اسکرول جا بیفتد
  const onScroll = () => {
    window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => {
      const track = trackRef.current;
      if (!track || !isMobile()) return;
      const box = track.getBoundingClientRect();
      const center = box.left + box.width / 2;
      const idx = Array.from(track.children).findIndex((c) => {
        const r = c.getBoundingClientRect();
        return r.left <= center && r.right >= center;
      });
      if (idx >= 0 && idx !== active) {
        setActive(idx);
        setTimerKey((k) => k + 1);
      }
    }, 140);
  };
  React.useEffect(() => () => window.clearTimeout(debounceRef.current), []);

  return (
    <RdSection id="courses">
      <RdBand className="top-0" />
      {/* فاصلهٔ استاندارد سکشن‌ها — مثل سکشن ۱ (بدون اورراید پدینگ بالا) */}
      <RdWrap pb="pb-[62px] sm:pb-[72px] xl:pb-[79px]">
        {/* سربرگ سکشن — هم‌اندازه و هم‌جایگاه سکشن‌های ۱ تا ۳ */}
        <RdHeadRow
          num="04"
          label="دوره‌ها"
          title="دورهٔ متناسب با"
          accent="هدف شما"
          desc="سه دورهٔ منتخب از سه مسیر یادگیری؛ جزئیات کامل هر دوره در صفحهٔ خودش."
          flushBadge
          tightTitle
          titleSize="text-[22.8px] sm:text-[30px]"
          descEnd
        />

        {/* ردیف کارت‌ها — موبایل: اسلایدر اسنپ با ۱۵٪ پیش‌نمایش کارت بعدی؛ دسکتاپ: گرید */}
        <div
          ref={trackRef}
          onScroll={onScroll}
          className="mt-3.5 gap-3.5 max-sm:flex max-sm:snap-x max-sm:snap-mandatory max-sm:overflow-x-auto rd-no-scrollbar sm:grid sm:grid-cols-2 sm:gap-5 xl:mt-4 xl:grid-cols-3 xl:gap-5"
        >
          {HOME_COURSES.map(({ slug, img, alt }, i) => {
            const c = siteCourses.find((x) => x.slug === slug);
            if (!c) return null;
            return (
              <RdCard
                key={c.slug}
                className={`group flex min-w-0 flex-col p-2 transition-colors hover:bg-canvas-soft/70 sm:p-3 max-sm:w-[83%] max-sm:shrink-0 ${
                  i === HOME_COURSES.length - 1 ? "max-sm:snap-end" : "max-sm:snap-start"
                }`}
                marks
                radius="rounded-[8px]"
              >
                <div className="overflow-hidden rounded-[8px]">
                  <img src={img} alt={alt} loading="lazy" className="aspect-[16/9] w-full max-sm:aspect-[2/1] object-cover" />
                </div>
                <div className="flex flex-1 flex-col px-2.5 pt-2 sm:px-3.5 sm:pt-3">
                  <div className="flex items-center justify-between">
                    <span
                      className="rd-inside dc-mono rounded-[8px] px-3 py-1.5 text-[15px] font-bold tracking-[0.06em] text-rd-accent max-sm:px-2.5 max-sm:py-1 max-sm:text-[13px]"
                      dir="ltr"
                    >
                      {c.code}
                    </span>
                    <span
                      className="dc-mono text-[10px] font-medium tracking-[0.18em] text-ink-faint max-sm:text-[9px]"
                      dir="ltr"
                    >
                      {c.trackLabel}
                    </span>
                  </div>
                  <h3 className="mt-2 text-[15px] font-black-fa leading-6 text-ink sm:mt-3 sm:truncate max-sm:line-clamp-2 max-sm:text-[14px] max-sm:leading-5">{c.title}</h3>
                  <p className="mt-1 line-clamp-2 text-[13px] leading-6 text-ink-soft max-sm:text-[12px] max-sm:leading-5">{c.short}</p>
                  <ul className="mt-2.5 flex flex-wrap gap-1.5 sm:mt-3">
                    {[`ترکیبی`, `۲۰ جلسه`].map((chip) => (
                      <li
                        key={chip}
                        className="rd-inside rounded-full px-3 py-1 text-[11px] font-bold text-ink-soft max-sm:px-2.5 max-sm:py-0.5 max-sm:text-[10px]"
                      >
                        {chip}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-auto px-2.5 pt-2.5 sm:px-3.5 sm:pt-4">
                  <RdLabel code="CRS" n={`0${i + 1}`} className="mb-2 sm:mb-3" />
                  <div className="flex items-center justify-between gap-3 pb-1.5">
                    <div className="min-w-0 leading-tight">
                      <p className="whitespace-nowrap text-[17.5px] font-black-fa text-ink max-sm:text-[15.5px]">
                        {formatToman(c.price)}
                        <span className="ms-1 text-[10px] font-normal text-ink-faint">تومان</span>
                      </p>
                      {c.oldPrice ? (
                        <p className="dc-mono mt-0.5 truncate text-right text-[12px] text-ink-faint line-through" dir="ltr">
                          {formatToman(c.oldPrice)}
                        </p>
                      ) : null}
                    </div>
                    <SiteLink
                      href={`/courses/${c.slug}`}
                      className="rd-inside flex h-10 items-center gap-1.5 rounded-full px-4 text-[13px] font-bold text-ink transition-colors hover:bg-canvas-soft max-sm:h-9 max-sm:px-3.5 max-sm:text-[12px]"
                    >
                      جزئیات دوره
                      <ArrowLeft className="size-3.5 text-ink-faint" />
                    </SiteLink>
                  </div>
                </div>
              </RdCard>
            );
          })}
        </div>
        {/* بولت‌های اسلایدر دوره‌ها — فقط موبایل، زیر کارت‌ها */}
        <div
          className="mt-4 flex items-center justify-center gap-1.5 sm:hidden"
          role="tablist"
          aria-label="انتخاب دوره"
        >
          {HOME_COURSES.map(({ slug }, i) => (
            <button
              key={slug}
              type="button"
              role="tab"
              aria-selected={i === active}
              aria-label={siteCourses.find((x) => x.slug === slug)?.title}
              onClick={() => {
                setActive(i);
                setTimerKey((k) => k + 1);
              }}
              className={`h-1.5 rounded-full transition-all duration-200 ${
                i === active ? "w-5 bg-rd-accent" : "w-1.5 bg-ink-faint/50 hover:bg-ink-faint"
              }`}
            />
          ))}
        </div>
        {/* دکمهٔ مشاهدهٔ لیست کامل دوره‌ها — زیر کارت‌ها، همهٔ سایزها */}
        <div className="mt-4 flex justify-center sm:mt-5">
          <SiteLink
            href="/courses"
            className="rd-inside inline-flex h-10 items-center gap-2 rounded-full bg-white px-5 text-[13px] text-ink transition-colors hover:bg-canvas-soft"
          >
            مشاهدهٔ لیست دوره‌ها
            <ArrowLeft className="size-4 text-ink-faint" />
          </SiteLink>
        </div>
      </RdWrap>
    </RdSection>
  );
}

/* -------------------- سکشن مسیر عضویت — سلول‌های سه‌ستونه -------------------- */

const STEPS = [
  {
    icon: ClipboardList,
    num: "01",
    title: "تعیین سطح رایگان",
    desc: "یک جلسه کوتاه حضوری یا آنلاین؛ دقیقاً مشخص می‌شود از کجا شروع کنید.",
  },
  {
    icon: Compass,
    num: "02",
    title: "دوره متناسب با هدف",
    desc: "زبان، بازار کار یا مدرک — بسته به هدف شما مسیر مشخص می‌شود.",
  },
  {
    icon: TrendingUp,
    num: "03",
    title: "تمرین و گزارش پیشرفت",
    desc: "هر فصل می‌دانید چه یاد گرفتید و قدم بعدی مسیر چیست.",
  },
];

/** بدنهٔ سلول قدم — مشترک بین گرید دسکتاپ و اسلایدر موبایل
    (v32: نسخهٔ تیره — کل سکشن «در سه قدم» سرمه‌ای شد؛ رنگ‌های روی تیره هم‌الگوی
    کارت تیرهٔ فرم تعیین سطح: آیکون/شماره skyc، تیتر سفید، توضیح white/60) */
function StepBody({ s }: { s: (typeof STEPS)[number] }) {
  const Icon = s.icon;
  return (
    <>
      <div className="flex items-center justify-between">
        <Icon className="size-5 text-skyc" strokeWidth={1.8} />
        <span className="dc-mono text-[12px] font-medium text-skyc" dir="ltr">
          {s.num}.
        </span>
      </div>
      <h3 className="mt-4 font-black-fa text-white">{s.title}</h3>
      <p className="mt-2 max-w-[16rem] text-[13px] leading-6 text-white/60">{s.desc}</p>
      <RdLabel code="STP" n={s.num} dark className="mt-auto pt-6" />
    </>
  );
}

/** اسلایدر قدم‌ها — موبایل: هر بار یک کارت + بولت زیرین + پخش خودکار هر ۴ ثانیه؛
    دسکتاپ مخفی (گرید سه‌ستونه جای آن را می‌گیرد) */
function ProcessSlider() {
  const trackRef = React.useRef<HTMLDivElement>(null);
  const [active, setActive] = React.useState(0);
  // تغییر این شمارنده تایمر پخش خودکار را از نو شروع می‌کند (بعد از تعامل کاربر)
  const [timerKey, setTimerKey] = React.useState(0);
  const debounceRef = React.useRef(0);

  const isMobile = () => window.matchMedia("(max-width: 767px)").matches;

  // اسکرول افقی به کارت فعال — فقط موبایل؛ بدون scrollIntoView تا صفحه عمودی جابه‌جا نشود
  React.useEffect(() => {
    if (!isMobile()) return;
    const track = trackRef.current;
    const el = track?.children[active] as HTMLElement | undefined;
    if (!track || !el) return;
    const delta =
      el.getBoundingClientRect().left + el.getBoundingClientRect().width / 2 -
      (track.getBoundingClientRect().left + track.clientWidth / 2);
    track.scrollTo({ left: track.scrollLeft + delta, behavior: "smooth" });
  }, [active]);

  // پخش خودکار هر ۴ ثانیه
  React.useEffect(() => {
    const t = window.setInterval(() => {
      if (isMobile()) setActive((a) => (a + 1) % STEPS.length);
    }, 4000);
    return () => window.clearInterval(t);
  }, [timerKey]);

  // تشخیص کارت فعال هنگام سوایپ — با تاخیر کوتاه تا اسکرول جا بیفتد
  const onScroll = () => {
    window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => {
      const track = trackRef.current;
      if (!track || !isMobile()) return;
      const box = track.getBoundingClientRect();
      const center = box.left + box.width / 2;
      const idx = Array.from(track.children).findIndex((c) => {
        const r = c.getBoundingClientRect();
        return r.left <= center && r.right >= center;
      });
      if (idx >= 0 && idx !== active) {
        setActive(idx);
        setTimerKey((k) => k + 1);
      }
    }, 140);
  };
  React.useEffect(() => () => window.clearTimeout(debounceRef.current), []);

  return (
    <>
      {/* ردیف کارت‌ها — موبایل: اسلایدر اسنپ */}
      <div
        ref={trackRef}
        onScroll={onScroll}
        className="mt-3.5 flex snap-x snap-mandatory gap-3.5 overflow-x-auto rd-no-scrollbar md:hidden xl:mt-4"
      >
        {STEPS.map((s) => (
          <div
            key={s.num}
            className="relative flex w-[86%] shrink-0 snap-center flex-col rounded-[8px] border border-rd-night-line bg-rd-night p-5"
          >
            <StepBody s={s} />
          </div>
        ))}
      </div>
      {/* بولت‌های اسلایدر — فقط موبایل، زیر کارت‌ها */}
      <div
        className="mt-4 flex items-center justify-center gap-1.5 md:hidden"
        role="tablist"
        aria-label="انتخاب قدم عضویت"
      >
        {STEPS.map((s, i) => (
          <button
            key={s.num}
            type="button"
            role="tab"
            aria-selected={i === active}
            aria-label={s.title}
            onClick={() => {
              setActive(i);
              setTimerKey((k) => k + 1);
            }}
            className={`h-1.5 rounded-full transition-all duration-200 ${
              i === active ? "w-5 bg-rd-sky2" : "w-1.5 bg-white/25 hover:bg-white/50"
            }`}
          />
        ))}
      </div>
    </>
  );
}

function Process() {
  return (
    /* v32: کل سکشن «در سه قدم شروع کنید» سرمه‌ای شد (درخواست کاربر) — همان الگوی
       سکشن‌های تیرهٔ پنل/تعیین سطح: rd-grid-dark + بج/تیتر/سلول‌ها/اسلایدر تیره؛
       دکمهٔ CTA هم قرص سفید شد چون bg-rd-deep روی سرمه‌ای ناپدید می‌شد */
    <RdSection id="how" dark>
      <RdBand className="top-0" dark />
      <RdWrap pb="pb-[62px] sm:pb-[72px] xl:pb-[79px]">
        {/* سربرگ — از الگوی سربرگ مشترک سکشن‌های ۱ تا ۴ (v31؛ بدون توضیح مثل سکشن ۱) */}
        <RdHeadRow
          num="09"
          label="مسیر عضویت"
          title="در سه قدم"
          accent="شروع کنید"
          flushBadge
          tightTitle
          titleSize="text-[22.8px] sm:text-[30px]"
          dark
        />

        {/* دسکتاپ: سه سلول با خطوط جداکننده — بدون دایرهٔ رنگی و خط‌چین (v32: تیره) */}
        <div className="rd-inside rd-inside-dark relative mt-3.5 hidden overflow-hidden rounded-[8px] bg-rd-night md:grid md:grid-cols-3 xl:mt-4">
          <RdSqFrame dark />
          {STEPS.map((s, i) => (
            <div
              key={s.num}
              className={`relative flex flex-col border-rd-night-line p-5 sm:p-6 ${
                i === 0 ? "border-b md:border-b-0 md:border-e" : i === 1 ? "border-b md:border-b-0 md:border-e" : ""
              }`}
            >
              <StepBody s={s} />
            </div>
          ))}
        </div>

        {/* موبایل: اسلایدر با پخش خودکار */}
        <ProcessSlider />

        {/* v32: دکمهٔ اصلی روی زمینهٔ سرمه‌ای قرص سفید شد — bg-rd-deep (#00033f) روی
            بکگراند هم‌رنگ دیده نمی‌شد؛ هم‌الگوی قرص سفید هیرو (هاور/اکتیو همان) */}
        <div className="mt-5 text-center">
          <AnchorLink
            id="placement"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-white px-6 text-[13px] font-extrabold text-navy-deep transition-all duration-150 hover:bg-[#E9F1FC] active:scale-[0.985] active:bg-[#DFEAF9] focus-visible:outline-none focus-visible:shadow-[0_0_0_1.25px_#00033F,0_0_0_3.25px_#00AEDA] motion-reduce:transition-none"
          >
            شروع با تعیین سطح رایگان
            <ArrowLeft className="size-4" />
          </AnchorLink>
        </div>
      </RdWrap>
    </RdSection>
  );
}

/* ------------------- سکشن تعیین سطح — الگوی CTA روشن ------------------- */

function Placement() {
  const { toast } = useToast();
  const [name, setName] = React.useState("");
  const [phone, setPhone] = React.useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      toast({ title: "لطفاً نام و شماره موبایل را وارد کنید.", variant: "destructive" });
      return;
    }
    toast({ title: "درخواست شما ثبت شد ✔", description: "برای هماهنگی جلسه تعیین سطح با شما تماس می‌گیریم." });
    setName("");
    setPhone("");
  };

  // هدیهٔ رایگان — داخل فرم؛ از شمارهٔ موبایل ثبت‌شدهٔ همان فرم استفاده می‌کند
  const giftSubmit = () => {
    const digits = phone.replace(/[\s\-()]/g, "").replace(/[۰-۹]/g, (d) => "۰۱۲۳۴۵۶۷۸۹".indexOf(d).toString());
    if (!/^0?9\d{9}$/.test(digits)) {
      toast({ title: "اول شمارهٔ موبایل را در فرم وارد کنید.", description: "مثلاً 0912 000 0000", variant: "destructive" });
      return;
    }
    toast({
      title: "هدیهٔ رایگان شما ثبت شد ✔",
      description: "دانلود جزوهٔ چانک‌های گفتگوی روزمره شروع شد.",
    });
    const a = document.createElement("a");
    a.href = "/downloads/jazveh-chunks.pdf";
    a.download = "jazveh-chunks.pdf";
    a.click();
  };

  return (
    <RdSection id="placement" dark>
      <RdBand className="top-0" dark />
      <RdWrap pb="pb-[62px] sm:pb-[72px] xl:pb-[79px]">
        <div className="grid items-center gap-6 lg:grid-cols-2 xl:gap-8">
          {/* ستون متن — کارت تیرهٔ توپر هم‌الگوی سربرگ سکشن‌های تیره (پنل/نظرات)؛
              شبکهٔ شطرنجی پشت متن‌ها دیده نمی‌شود و اکسنت با rd-sky2 هم‌رنگ بقیهٔ سکشن‌های تیره است */}
          <div className="relative rounded-[8px] bg-rd-night px-5 pb-5 sm:px-7">
            <RdSqFrame dark />
            <RdEyebrow num="06" label="قدم اول مسیر" dark className="ps-0" />
            <h2 className="mt-3 max-w-[460px] text-[22.8px] font-black-fa leading-[1.4] text-white sm:text-[30px]">
              شروع یادگیری با <span className="text-rd-sky2">تعیین سطح</span>
            </h2>
            <p className="mt-2.5 max-w-[440px] text-[13px] leading-6 text-white/60">
              در یک جلسهٔ کوتاه حضوری یا آنلاین دقیق می‌فهمیم در کدام سطح هستید و مسیر یادگیری شما چیست — بدون سردرگمی و
              کلاس اضافه.
            </p>
            {/* فهرست سه‌گانهٔ تعیین سطح — v35: به درخواست کاربر («حذف تو موبایل») هر سه مورد
                در موبایل حذف شدند (max-[900px]:hidden) و در دسکتاپ ≥۹۰۱px هر سه نمایش داده می‌شوند */}
            <ul className="mt-4 space-y-2.5 text-[13px] leading-6 text-white/60 max-[900px]:hidden">
              {[
                "سنجش چهار مهارت بر اساس چارچوب A1 تا B2",
                "نتیجه و نقشه راه شخصی، بلافاصله بعد از جلسه",
                "معرفی دوره‌ی متناسب با هدف شما",
              ].map((it) => (
                <li key={it} className="flex items-start gap-2.5">
                  <Check className="mt-1 size-4 shrink-0 text-skyc" strokeWidth={2.5} />
                  {it}
                </li>
              ))}
            </ul>
          </div>

          {/* فرم در پنل گرد-۸ — کارت تیره هم‌الگوی کارت‌های سکشن نظرات؛ کل سکشن یکدست سرمه‌ای */}
          <form
            onSubmit={submit}
            className="rd-inside rd-inside-dark relative rounded-[8px] bg-rd-night p-5 sm:p-7"
            aria-label="فرم رزرو تعیین سطح"
          >
            <div className="flex items-center gap-2.5">
              {/* آیکون هدیه به‌جای لوگو — دایرهٔ روشنِ نیمه‌شفاف هم‌الگوی آواتارها */}
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-white/[0.06] text-skyc">
                <Gift className="size-4" />
              </span>
              <h3 className="font-black-fa text-white">رزرو جلسه تعیین سطح</h3>
            </div>
            <p className="mt-1 text-xs text-white/55">فرم را پر کنید تا برای هماهنگی جلسه با شما تماس بگیریم.</p>
            <div className="mt-4 space-y-3.5">
              <label className="block">
                <span className="mb-1.5 block text-xs font-bold text-white/85">نام و نام خانوادگی</span>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="مثلاً سارا محمدی"
                  className="h-11 w-full rounded-[8px] border border-white/[0.12] bg-white/[0.06] px-4 text-sm text-white outline-none placeholder:text-white/35 focus:border-skyc/50 focus:ring-2 focus:ring-skyc/25"
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-bold text-white/85">شماره موبایل</span>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  inputMode="tel"
                  dir="ltr"
                  placeholder="0912 000 0000"
                  className="h-11 w-full rounded-[8px] border border-white/[0.12] bg-white/[0.06] px-4 text-start text-sm text-white outline-none placeholder:text-white/35 focus:border-skyc/50 focus:ring-2 focus:ring-skyc/25"
                />
              </label>
              {/* دو دکمه کنار هم — ثبت تعیین سطح و دانلود جزوهٔ رایگان؛ دکمهٔ جزوه بدون آیکون */}
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="submit"
                  className="h-11 rounded-full bg-white text-[13px] font-extrabold text-navy-deep transition-all hover:bg-canvas-soft active:scale-[0.99]"
                >
                  تعیین سطح
                </button>
                <button
                  type="button"
                  onClick={giftSubmit}
                  className="inline-flex h-11 items-center justify-center rounded-full border border-white/[0.14] px-2 text-[13px] font-extrabold text-white transition-all hover:bg-white/[0.06] active:scale-[0.99]"
                >
                  دانلود جزوهٔ رایگان
                </button>
              </div>
              <p className="text-center text-[11px] leading-5 text-white/40">
                اطلاعات شما فقط برای هماهنگی جلسه استفاده می‌شود؛ جزوهٔ رایگان هم با ثبت همین شماره دانلود می‌شود.
              </p>
            </div>
          </form>
        </div>
      </RdWrap>
    </RdSection>
  );
}

/* ------------------------------------------------------------------------
   سکشن ریلزها — «هر روز یک نکته جدید»؛ ردیف ریلزها ۵۰٪ کوچک‌تر از قبل
   (عرض محدود ۸۸۰px + نسبت ۳/۴)، موبایل اسلایدر اسنپ؛ با کلیک، ویدئو
   داخل مودال سکشن بنیان‌گذار پخش می‌شود. متن هدیهٔ جزوه از این سکشن حذف شد.
   ------------------------------------------------------------------------ */

const REELS = [
  {
    img: "/images/study/s4.jpg",
    de: "Könnten Sie das bitte wiederholen?",
    fa: "می‌شود لطفاً دوباره تکرار کنید؟",
    tag: "چانک امروز",
    dur: "0:35",
  },
  {
    img: "/images/study/s7.jpg",
    de: "Ich hätte gern einen Termin.",
    fa: "می‌خواهم نوبت رزرو کنم.",
    tag: "چانک خرید",
    dur: "0:42",
  },
  {
    img: "/images/study/s6.jpg",
    de: "Das passt mir super!",
    fa: "خیلی خوب جور درمی‌آید!",
    tag: "چانک گفتگو",
    dur: "0:28",
  },
  {
    img: "/images/study/s1.jpg",
    de: "Wie viel kostet das?",
    fa: "قیمتش چند است؟",
    tag: "چانک خرید",
    dur: "0:31",
  },
  {
    img: "/images/study/s2.jpg",
    de: "Können wir einen neuen Termin vereinbaren?",
    fa: "می‌شود قرار دیگری گذاشت؟",
    tag: "چانک کاری",
    dur: "0:44",
  },
  {
    img: "/images/study/s3.jpg",
    de: "Entschuldigung, ich habe das nicht verstanden.",
    fa: "ببخشید، متوجه نشدم.",
    tag: "چانک گفتگو",
    dur: "0:26",
  },
  {
    img: "/images/study/s5.jpg",
    de: "Sprechen Sie Englisch?",
    fa: "انگلیسی صحبت می‌کنید؟",
    tag: "چانک امروز",
    dur: "0:22",
  },
  {
    img: "/images/study/s8.jpg",
    de: "Ich hätte gern einen Kaffee, bitte.",
    fa: "یک قهوه لطفاً.",
    tag: "چانک کافه",
    dur: "0:30",
  },
];

function Reels() {
  const [videoOpen, setVideoOpen] = React.useState(false);
  const trackRef = React.useRef<HTMLDivElement>(null);
  const [active, setActive] = React.useState(0);
  const debounceRef = React.useRef(0);

  // تشخیص کارت فعال هنگام اسکرول اسلایدر — دسکتاپ و موبایل
  const onScroll = () => {
    window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => {
      const track = trackRef.current;
      if (!track) return;
      const box = track.getBoundingClientRect();
      const center = box.left + box.width / 2;
      const idx = Array.from(track.children).findIndex((c) => {
        const r = c.getBoundingClientRect();
        return r.left <= center && r.right >= center;
      });
      if (idx >= 0) setActive(idx);
    }, 120);
  };
  React.useEffect(() => () => window.clearTimeout(debounceRef.current), []);

  // پیمایش با فلش‌ها — اسکرول نرم تا کارت هدف (RTL-سازگار با scrollIntoView)
  const go = (idx: number) => {
    const clamped = Math.max(0, Math.min(idx, REELS.length - 1));
    const el = trackRef.current?.children[clamped] as HTMLElement | undefined;
    el?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "start" });
    setActive(clamped);
  };

  return (
    <RdSection id="chunks">
      <RdBand className="top-0" />
      <RdWrap pb="pb-[62px] sm:pb-[72px] xl:pb-[79px]">
        {/* تیتر سکشن — «هر روز یک نکته جدید» + اندازهٔ تیتر سکشن ۱ (v31: num 07 +
            descEnd مثل سکشن‌های ۲-۴ — درخواست کاربر «align مثل سکشن 1و2و3و4») */}
        <RdHeadRow
          num="07"
          label="اینستاگرام کلینیک"
          title="هر روز یک"
          accent="نکته جدید"
          desc="ویدئوهای کوتاه آموزش آلمانی — ترکیب‌های آمادهٔ گفتگوهای روزمره را هر روز در اینستاگرام تمرین کنید."
          flushBadge
          tightTitle
          titleSize="text-[22.8px] sm:text-[30px]"
          descEnd
        />

        {/* ردیف پروفایل اینستاگرام — ارتفاع بیشتر؛ نشان رسمی لوگو (فایل رسمی) هم‌اندازهٔ چیپ؛
            v40: لوگو ۳۰٪ کوچکتر شد (درخواست کاربر «elmiradeutschclinic اینجا لوگو 30درصد
            کوچکتر بشه») — چیپ 44→30.8≈31px و تصویر 40→28px؛
            v41: بکگراند لوگو حذف شد (درخواست کاربر «بکگراند لوگو را حذف کن») — چیپ
            bg-canvas-soft کلاً برداشته شد؛ نشان شفاف مستقیم روی کارت سفید */}
        <RdCard className="mt-3.5 flex flex-wrap items-center gap-3 p-3 pe-4 xl:mt-4" marks radius="rounded-[8px]">
          <img
            src="/images/edc/logo-mark.png"
            alt="نشان کلینیک آلمانی المیرا"
            className="size-[28px] shrink-0 object-contain"
            draggable={false}
          />
          <div className="leading-tight">
            <p className="text-[15px] font-extrabold text-ink" dir="ltr">
              elmiradeutschclinic
            </p>
            <p className="mt-0.5 text-xs text-ink-faint">کلینیک تخصصی زبان آلمانی</p>
          </div>
          <a
            href="https://instagram.com/elmiradeutschclinic"
            target="_blank"
            rel="noreferrer"
            className="ms-auto inline-flex h-10 items-center gap-2 rounded-full bg-rd-deep px-5 text-[13px] font-extrabold text-white transition-all hover:bg-navy-700 active:scale-[0.985]"
          >
            <Instagram className="size-4" />
            دنبال کردن
          </a>
        </RdCard>

        {/* فلش‌های اسلایدر — دسکتاپ؛ در RTL «بعدی» به سمت چپ می‌رود */}
        <div className="mt-3.5 hidden items-center justify-end gap-2 sm:flex">
          <button
            type="button"
            aria-label="ریلز قبلی"
            disabled={active === 0}
            onClick={() => go(active - 1)}
            className="grid size-8 place-items-center rounded-full border border-hairline-soft text-ink transition-colors hover:bg-canvas-soft disabled:pointer-events-none disabled:opacity-30"
          >
            <ChevronRight className="size-4" />
          </button>
          <button
            type="button"
            aria-label="ریلز بعدی"
            disabled={active === REELS.length - 1}
            onClick={() => go(active + 1)}
            className="grid size-8 place-items-center rounded-full border border-hairline-soft text-ink transition-colors hover:bg-canvas-soft disabled:pointer-events-none disabled:opacity-30"
          >
            <ChevronLeft className="size-4" />
          </button>
        </div>

        {/* هشت ریلز — اسلایدر در همهٔ سایزها؛ ۵۰٪ کوچک‌تر، بدون بوردر، نسبت واقعی اینستاگرام ۹/۱۶ */}
        <div
          ref={trackRef}
          onScroll={onScroll}
          className="mt-3.5 flex snap-x snap-mandatory gap-3 overflow-x-auto rd-no-scrollbar"
          aria-label="اسلایدر ریلزهای اینستاگرام"
        >
          {REELS.map((r, i) => (
            <button
              key={r.de}
              type="button"
              onClick={() => setVideoOpen(true)}
              aria-label={`پخش ریلز: ${r.fa}`}
              className="group relative block w-[38%] shrink-0 snap-start overflow-hidden rounded-[8px] text-start sm:w-[136px] xl:w-[145px]"
            >
              <div className="relative aspect-[9/16] w-full overflow-hidden rounded-[8px]">
                <img
                  src={r.img}
                  alt={r.fa}
                  loading="lazy"
                  className="absolute inset-0 size-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                />
                {/* گرادیان پایین برای خوانایی کپشن */}
                <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-navy-deep/85 via-navy-deep/30 to-transparent sm:h-20" />
                {/* بج REEL و مدت ویدئو */}
                <span
                  className="dc-mono absolute start-1.5 top-1.5 rounded-full bg-white/90 px-1.5 py-0.5 text-[8px] font-bold tracking-[0.14em] text-navy-deep"
                  dir="ltr"
                >
                  REEL. [0{i + 1}]
                </span>
                <span className="dc-mono absolute end-1.5 top-1.5 rounded-full bg-black/55 px-1.5 py-0.5 text-[9px] font-bold text-white" dir="ltr">
                  {r.dur}
                </span>
                {/* دکمهٔ پخش مرکزی — زرد برند، هم‌سبک با دکمهٔ «پخش ویدئو» و کارت Hören (درخواست کاربر) */}
                <span className="absolute inset-0 grid place-items-center">
                  <span className="grid size-7 place-items-center rounded-full bg-brand-500 text-navy-900 shadow-[0_10px_30px_-10px_rgba(0,3,63,0.6)] transition-all duration-150 group-hover:scale-105 group-hover:bg-brand-600 sm:size-9">
                    <Play className="size-3 -ms-px fill-current sm:size-3.5" />
                  </span>
                </span>
                {/* کپشن پایین ریلز */}
                <span className="absolute inset-x-2 bottom-2 block">
                  <span className="line-clamp-2 block text-[10px] font-extrabold leading-4 text-white" dir="ltr">
                    {r.de}
                  </span>
                  <span className="mt-1 hidden items-center gap-1 text-[9px] text-white/75 sm:flex">
                    <Film className="size-2.5" />
                    {r.tag}
                  </span>
                </span>
              </div>
            </button>
          ))}
        </div>
      </RdWrap>

      {/* مودال ویدئو — با کلیک روی هر ریلز باز می‌شود و ویدئو داخلش پخش می‌شود */}
      <Dialog open={videoOpen} onOpenChange={setVideoOpen}>
        <DialogContent className="max-w-[440px] sm:max-w-[440px] overflow-hidden border-0 bg-black p-0 text-white">
          <DialogTitle className="sr-only">ویدئوی ریلز آموزش آلمانی</DialogTitle>
          <DialogDescription className="sr-only">ویدئوهای کوتاه آموزش آلمانی در اینستاگرام کلینیک</DialogDescription>
          <div className="aparat-embed w-full bg-black">
            <AparatModalVideo />
          </div>
        </DialogContent>
      </Dialog>
    </RdSection>
  );
}

/* -------------------- سکشن نظرات — الگوی نقل‌قول تیره -------------------- */

const TESTIMONIALS = [
  {
    quote:
      "کلاس آنلاین با گزارش پیشرفت هفتگی دقیقاً همان چیزی بود که می‌خواستم؛ هر هفته می‌دانستم کجا ایستاده‌ام.",
    name: "محمد کریمی",
    level: "B1",
  },
  {
    quote: "برای آزمون رسمی آماده شدم؛ تمرین‌های چهار مهارت واقعاً نتیجه داد و با اضطراب امتحان خداحافظی کردم.",
    name: "نگار موسوی",
    level: "B2",
  },
];

function Testimonials() {
  return (
    <RdSection id="testimonials">
      <RdBand className="top-0" />
      <RdWrap pb="pb-[62px] sm:pb-[72px] xl:pb-[79px]">
        {/* ابرو — سلول سفید روی شبکهٔ روشن با چهار مربع گوشه (بدون تیتر و توضیح) */}
        <div className="relative w-max rounded-[8px] bg-white">
          <RdSqFrame />
          <RdEyebrow num="08" label="نظرات دانشجوها" />
        </div>

        {/* دو نقل‌قول — چیدمان جمع، دو کارت کنار هم؛ هم‌الگوی کارت‌های روشن سایت */}
        <div className="mt-3.5 grid gap-4 md:grid-cols-2 xl:mt-4 xl:gap-5">
          {TESTIMONIALS.map((r, i) => (
            <RdCard key={r.name} className="p-4 sm:p-4.5" marks radius="rounded-[8px]">
              <RdLabel code="TST" n={`0${i + 1}`} className="mb-2" />
              <blockquote className="text-[13.5px] leading-[1.6] text-ink-soft">«{r.quote}»</blockquote>
              <figcaption className="mt-3 flex items-center gap-3">
                <span className="grid size-8 place-items-center rounded-full bg-canvas-soft text-sm font-black-fa text-ink">
                  {r.name[0]}
                </span>
                <span className="text-sm font-black-fa text-ink">{r.name}</span>
                <span className="dc-mono ms-auto rounded-[4px] border border-hairline-soft px-2 py-0.5 text-[10px] font-bold text-ink-soft" dir="ltr">
                  {r.level}
                </span>
              </figcaption>
            </RdCard>
          ))}
        </div>
      </RdWrap>
    </RdSection>
  );
}

/* ---------------- سکشن سؤالات پرتکرار — روشن (آکاردئون) ---------------- */

const FAQS = [
  {
    q: "تعیین سطح چطور انجام می‌شود و چقدر طول می‌کشد؟",
    a: "یک جلسه کوتاه حضوری یا آنلاین است (حدود ۲۰ دقیقه). چند سؤال گفتاری و نوشتاری از شما پرسیده می‌شود و در پایان، سطح فعلی و نقشه راه پیشنهادی شما را همان‌جا دریافت می‌کنید.",
  },
  {
    q: "کلاس‌ها حضوری هستند یا آنلاین؟",
    a: "هر دو حالت برقرار است. بعد از تعیین سطح پیشنهاد می‌کنیم کدام شکل برای شرایط و هدف شما مناسب‌تر است.",
  },
  {
    q: "اگر هدفم کار یا مصاحبه کاری باشد، کدام مسیر مناسب است؟",
    a: "مسیر «زبان و بازار کار»؛ شامل تمرین مصاحبه شبیه‌سازی‌شده، ایمیل و مکالمه رسمی اداری و واژگان تخصصی شغل شماست.",
  },
  {
    q: "برای آزمون‌های Goethe ،ÖSD یا TestDaF هم آماده می‌کنید؟",
    a: "بله؛ مسیر «زبان با مدارک» دقیقاً برای همین طراحی شده: تمرین طبق فرمت همان آزمون، آزمون آزمایشی و رفع اشکال هدفمند قبل از روز آزمون.",
  },
];

function Faq() {
  return (
    <RdSection id="faq">
      <RdBand className="top-0" />
      <RdWrap pb="pb-[62px] sm:pb-[72px] xl:pb-[79px]">
        <div className="grid gap-6 lg:grid-cols-[1fr_1.7fr] xl:gap-8">
          {/* ستون معرفی — سلول روشن */}
          <div className="relative rounded-[8px] bg-white px-5 pb-5 lg:sticky lg:top-20 lg:self-start">
            <RdEyebrow num="10" label="سؤالات پرتکرار" className="ps-0" />
            <h2 className="mt-3 max-w-[360px] text-[22.8px] font-black-fa leading-[1.4] text-ink sm:text-[30px]">
              پاسخ همه سؤالات شما، <span className="text-rd-title">همین‌جاست</span>
            </h2>
            <p className="mt-3 max-w-[320px] text-[13px] leading-6 text-ink-soft">
              اگر جواب سؤال شما اینجا نبود، در جلسه تعیین سطح یا در اینستاگرام بپرسید.
            </p>
          </div>

          {/* آکاردئون — مرزهای مویی روشن؛ سؤال‌ها راست‌چین با وزن مدیوم */}
          <div className="rd-inside rounded-[8px] bg-white px-6 sm:px-8">
            <Accordion type="single" collapsible>
              {FAQS.map((f, i) => (
                <AccordionItem key={i} value={`f-${i}`} className="border-hairline-soft">
                  <AccordionTrigger className="rounded-[8px] text-right text-[12px] font-medium leading-6 text-ink hover:no-underline sm:text-[13.5px] [&>svg]:mt-1.5 [&>svg]:text-ink-faint">
                    {/* سؤال و شماره در یک ردیف — راست‌چین واقعی؛ موبایل ۸٪ بزرگتر */}
                    <span className="flex items-start gap-3 text-start">
                      <span className="dc-mono mt-px text-[11px] font-medium text-rd-accent sm:text-[12px]" dir="ltr">
                        {String(i + 1).padStart(2, "0")}.
                      </span>
                      <span>{f.q}</span>
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="text-right text-[13px] leading-7 text-ink-soft">{f.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </RdWrap>
    </RdSection>
  );
}

/* ------------------------------ صفحه اصلی ------------------------------ */

export function SiteLanding() {
  useEffect(() => {
    const h = window.location.hash?.slice(1);
    if (h) requestAnimationFrame(() => scrollToId(h));
  }, []);

  return (
    <main className="flex-1">
      {/* ترتیب (v31): «مسیر عضویت / در سه قدم» بعد از «نظرات دانشجوها» رفت (درخواست کاربر) —
          شماره‌ها ترتیبی شدند: تعیین سطح ۰۶، اینستاگرام ۰۷، نظرات ۰۸، سه قدم ۰۹ */}
      <Hero />
      <Founder />
      <Paths />
      <PanelSection />
      <Courses />
      <Skills />
      <Placement />
      <Reels />
      <Testimonials />
      <Process />
      <Faq />
    </main>
  );
}
