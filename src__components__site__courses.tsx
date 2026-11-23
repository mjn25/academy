"use client";

import React from "react";
import {
  ArrowLeft,
  BadgeCheck,
  BookOpenText,
  Bookmark,
  CalendarDays,
  Check,
  ChevronLeft,
  CircleHelp,
  Clock3,
  FileText,
  GraduationCap,
  Headphones,
  History,
  Info,
  LifeBuoy,
  MessageCircle,
  MessageSquare,
  Monitor,
  Share2,
  ShoppingBag,
  Star,
  TrendingUp,
  Users,
  Video,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/lib/cart-context";
import { useRouter } from "@/lib/app-context";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { EdcMark, SiteLink, scrollToId } from "@/components/site/shared";
import { PageHero, faNum } from "@/components/site/pages-shared";
import {
  AparatModalVideo,
  PlayPill,
  RdBand,
  RdCard,
  RdHeadRow,
  RdLabel,
  RdSection,
  RdSqFrame,
  RdWrap,
} from "@/components/site/home";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { formatToman, getSiteCourse, siteCourses } from "@/lib/site-data";
import type { SiteCourse } from "@/lib/site-data";

const TRACK_META: Record<SiteCourse["track"], { label: string; chip: string }> = {
  blitzdeutsch: {
    label: "BlitzDeutsch — زبان",
    chip: "bg-white/95 text-ink",
  },
  blitzjob: {
    label: "BlitzJob — زبان و بازار کار",
    chip: "bg-white/95 text-ink",
  },
  blitzzertifikat: {
    label: "BlitzZertifikat — زبان با مدارک",
    chip: "bg-white/95 text-ink",
  },
};

const METHOD_ICON: Record<string, React.ElementType> = {
  chunks: MessageSquare,
  fragen: CircleHelp,
  rollenspiel: Users,
  report: TrendingUp,
  support: Headphones,
};

/* بازه سطح هر دوره — الگوی کارت دوره (مثل «A1+ تا A2») */
const LEVEL_RANGE: Record<SiteCourse["code"], string> = {
  A1: "از الفبا تا A1",
  A2: "از A1+ تا A2",
  B1: "از A2+ تا B1",
  B2: "از B1+ تا B2",
  JOB: "از سطح B1",
  CERT: "سطوح B1 تا B2",
  KON: "از سطح A2",
  BIZ: "از سطح B1",
};

/* امتیاز با ممیز فارسی — «۴٫۷» به‌جای نقطهٔ لاتین */
const faRate = (v: number) => faNum(v.toFixed(1)).replace(".", "٫");

/* ------------------------------ کارت دوره ------------------------------- */

/* کارت دوره — دقیقاً با الگوی کارت دورهٔ صفحهٔ اصلی (سکشن ۰۴):
    قاب مویی با مربع‌های تاکیدی گوشه‌ها، تصویر ۱۶:۹، ردیف «چیپ کد مونو + برچسب مسیر»،
    تیتر، توضیح دوخطی، چیپ‌های مشخصات، برچسب CRS و ردیف قیمت + دکمهٔ «جزئیات دوره» */
function CourseCard({ c, n }: { c: SiteCourse; n: string }) {
  return (
    <RdCard
      className="group flex min-w-0 flex-col p-2 transition-colors hover:bg-canvas-soft/70 sm:p-3"
      marks
      radius="rounded-[8px]"
    >
      <div className="overflow-hidden rounded-[8px]">
        <img
          src={c.image}
          alt={c.title}
          className="aspect-[16/9] w-full object-cover"
          loading="lazy"
        />
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
        <h3 className="mt-2 min-h-[2.5rem] line-clamp-2 text-[14px] font-black-fa leading-5 text-ink sm:mt-3 sm:min-h-[3rem] sm:text-[15px] sm:leading-6">
          {c.title}
        </h3>
        <p className="mt-1 line-clamp-2 text-[13px] leading-6 text-ink-soft max-sm:text-[12px] max-sm:leading-5">
          {c.short}
        </p>
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
        <RdLabel code="CRS" n={n} className="mb-2 sm:mb-3" />
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
}

/* --------------------------- لیست دوره‌ها ------------------------------- */

/* بنر تعیین سطح رایگان — نوار تیره با قاب مویی؛ پس از صفحه‌بندی فهرست، دکمهٔ سفید پرکنتراست */
function PlacementBanner() {
  return (
    <div className="relative my-8 overflow-hidden rounded-[8px] bg-rd-night p-6 sm:p-7">
      <RdSqFrame dark />
      <EdcMark className="pointer-events-none absolute -bottom-8 -end-8 size-36 opacity-[0.07]" />
      <div className="relative flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-[15px] font-black-fa text-white">مطمئن نیستید از کدام سطح شروع کنید؟</p>
          <p className="mt-1 text-[12.5px] leading-6 text-white/60">
            با آزمون تعیین سطح رایگان کلینیک، نقطه شروع دقیق شما در چند دقیقه مشخص می‌شود.
          </p>
        </div>
        <SiteLink
          href="/placement"
          className="inline-flex h-10 shrink-0 items-center gap-2 rounded-full bg-white px-6 text-[13px] font-extrabold text-navy-deep transition-colors hover:bg-canvas-soft"
        >
          تعیین سطح رایگان
          <ArrowLeft className="size-4" />
        </SiteLink>
      </div>
    </div>
  );
}

export function CoursesIndex() {
  /* نمایش همهٔ دوره‌ها در یک فهرست؛ بدون فیلتر و صفحه‌بندی */
  const pageItems = siteCourses.slice(0, 8);

  return (
    <>
<PageHero
        title="دوره‌های"
        accent="کلینیک"
        desc="از الفبا تا تسلط — با تمرین چهار مهارت، آزمون فصلی و گزارش پیشرفت مشخص؛ همه دوره‌ها با پرداخت آنلاین."
        breadcrumb={[{ label: "دوره‌ها" }]}
      />
      <RdSection id="courses-index" fadeTop>
        <RdBand className="top-0" />
        <RdWrap pb="pb-[62px] sm:pb-[72px] xl:pb-[79px]">
{/* فهرست همهٔ دوره‌ها — بدون فیلتر */}
          <div id="course-list" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-5">
            {pageItems.map((c, i) => (
              <CourseCard key={c.slug} c={c} n={String(i + 1).padStart(2, "0")} />
            ))}
          </div>

          {/* بنر تعیین سطح — پس از فهرست */}
          <PlacementBanner />

          {/* راهنمای شروع — متن تا تهِ کادر (تمام‌عرض)، هم‌ریتم سلول‌های سایت */}
          <div className="rd-inside mt-8 rounded-[8px] bg-white p-5 sm:p-7">
            <h3 className="font-black-fa text-[15px] text-ink">از کجا شروع کنم؟</h3>
            <p className="mt-2.5 text-justify text-[13px] leading-7 text-ink-soft">
              اگر آلمانی‌تان از صفر است، از دوره A1 شروع کنید؛ اگر قبلاً آلمانی خوانده‌اید، نتیجه آزمون تعیین سطح
              مشخص می‌کند مستقیم وارد کدام سطح شوید. برای هدف شغلی یا آزمون رسمی، دوره‌های BlitzJob و
              BlitzZertifikat در کنار مسیر اصلی یا بعد از سطح B1 انتخاب درستی هستند. مطمئن نیستید؟ در یک جلسه
              مشاوره رایگان، مسیر متناسب با هدف شما را می‌چینیم.
            </p>
          </div>
        </RdWrap>
      </RdSection>
    </>
  );
}

/* ------------------------------ صفحه دوره ------------------------------- */

/* لینک واتساپ مشاوره درباره همین دوره */
function courseWaLink(slug: string, code: string) {
  const text = encodeURIComponent(`سلام! درباره دوره آلمانی ${code} (/courses/${slug}) سؤال دارم.`);
  return `https://wa.me/989120000000?text=${text}`;
}

/* نوار تب‌ها با شمارنده و تب فعال (اسکرول-اسپای) */
function CourseTabBar({ c }: { c: SiteCourse }) {
  const tabs: { id: string; label: string; count?: number }[] = [
    { id: "course-about", label: "درباره دوره" },
    { id: "course-curriculum", label: "سرفصل‌ها", count: c.sessions },
    { id: "course-reviews", label: "نظرات زبان‌آموزان", count: c.reviews.length },
    { id: "course-faq", label: "سؤالات متداول" },
  ];
  const [active, setActive] = React.useState("course-about");
  /* فیکس باگ: کلیک روی تب، فعال‌سازی را فوری ست می‌کرد نمی‌کرد — با قفل ۸۰۰ms
     اسکرول-اسپای هم وسط اسکرول نرم پرش فعال‌سازی را ندارد (تب آخر بدون هایلایت نمی‌ماند) */
  const lockRef = React.useRef(0);
  React.useEffect(() => {
    const obs = new IntersectionObserver(
      (es) =>
        es.forEach((e) => {
          if (Date.now() > lockRef.current && e.isIntersecting) setActive(e.target.id);
        }),
      { rootMargin: "-25% 0px -65% 0px" },
    );
    tabs.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <nav
      role="tablist"
      aria-label="بخش‌های صفحه دوره"
      /* فیکس باگ استیکی: کلاس rd-inside با position:relative استایلِ sticky را خنثی می‌کرد
          (نوار هنگام اسکرول فیکس نمی‌شد) — جای آن بوردر مستقیم هم‌شکل همان قاب */
      className="sticky top-[68px] z-40 rounded-[8px] border border-hairline-soft bg-white px-2 py-1.5"
    >
      <div className="flex gap-1 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={active === t.id}
            aria-controls={t.id}
            onClick={() => {
              setActive(t.id);
              lockRef.current = Date.now() + 800;
              scrollToId(t.id);
            }}
            className={`relative h-9 shrink-0 rounded-full px-3.5 text-[12.5px] font-bold transition-colors ${
              active === t.id
                ? "bg-navy-deep text-white"
                : "text-ink-soft hover:bg-canvas-soft hover:text-ink"
            }`}
          >
            {t.label}
            {t.count ? (
              <span
                className={`ms-1.5 inline-grid place-items-center rounded-full px-1.5 text-[10px] font-bold ${
                  active === t.id ? "bg-white/15 text-white" : "bg-canvas-soft text-ink-soft"
                }`}
              >
                {faNum(t.count)}
              </span>
            ) : null}
          </button>
        ))}
      </div>
    </nav>
  );
}

/* سرتیتر سکشن — آیکون رد-اکسنت + تیتر درشت، هم‌ریتم سربرگ‌های صفحهٔ اصلی */
function CourseHead({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="rd-inside grid size-10 shrink-0 place-items-center rounded-[8px] bg-white text-rd-accent">
        <span className="[&_svg]:size-4">{icon}</span>
      </span>
      <h2 className="font-black-fa text-[16px] text-ink">{title}</h2>
    </div>
  );
}

export function CoursePage({ slug }: { slug: string }) {
  const c = getSiteCourse(slug);
  const tm = c ? TRACK_META[c.track] : null;
  const { toast } = useToast();
  const { add } = useCart();
  const { navigate } = useRouter();
  const [showAllRev, setShowAllRev] = React.useState(false);
  const [rate, setRate] = React.useState<number | null>(null);
  const [aboutOpen, setAboutOpen] = React.useState(false);
  // ویدئوی معرفی — مودال آپارات، هم‌الگوی سکشن «درباره ما» صفحهٔ اصلی
  const [videoOpen, setVideoOpen] = React.useState(false);

  if (!c || !tm) {
    return (
      <RdSection id="course-not-found">
        <RdBand className="top-0" />
        <RdWrap pb="pb-24">
          <div className="flex flex-col items-center py-20 text-center">
            <EdcMark className="mx-auto size-12 opacity-40" />
            <h1 className="mt-5 font-bold text-ink">دوره پیدا نشد</h1>
            <p className="mt-3 text-sm text-ink-soft">ممکن است آدرس تغییر کرده باشد.</p>
            <SiteLink
              href="/courses"
              className="mt-6 inline-flex h-10 items-center gap-2 rounded-full bg-rd-deep px-6 text-[13px] font-extrabold text-white transition-colors hover:bg-navy-700"
            >
              بازگشت به لیست دوره‌ها
              <ArrowLeft className="size-4" />
            </SiteLink>
          </div>
        </RdWrap>
      </RdSection>
    );
  }

  const avg = c.reviews.reduce((a, r) => a + r.rating, 0) / c.reviews.length;
  /* دوره‌های مشابه — اول هم‌مسیرها، بعد بقیه؛ سقف ۴ کارت هم‌ریتم گرید صفحهٔ فهرست */
  const others = [
    ...siteCourses.filter((o) => o.slug !== c.slug && o.track === c.track),
    ...siteCourses.filter((o) => o.slug !== c.slug && o.track !== c.track),
  ].slice(0, 4);
  const shown = rate ? c.reviews.filter((r) => r.rating === rate) : c.reviews;
  const buy = () => {
    /* افزودن دوره به سبد — ثبت سفارش و پرداخت در صفحهٔ /cart ادامه می‌یابد */
    add({ type: "course", id: c.slug, title: c.title, price: c.price, image: c.image });
    toast({ title: "به سبد خرید اضافه شد ✔", description: "برای ثبت سفارش به سبد خرید می‌رویم." });
    navigate("/cart");
  };

  /* تیتر دورنگ هیرو حذف شد — عنوان کامل دوره در کارت قیمت و sr-only h1 می‌آید */

  /* کاشی جدولی مشخصات/خدمات — هم‌ریتم سلول‌های صفحهٔ اصلی: آیکون + برچسب + مقدار
      وسط‌چین (درخواست کاربر: آیکون‌ها center) */
  const tile = (icon: React.ReactNode, label: string, value: string, wide?: boolean) => (
    <div key={label} className={`flex flex-col items-center bg-white p-4 text-center ${wide ? "sm:col-span-full" : ""}`}>
      <span className="rd-inside grid size-10 place-items-center rounded-[8px] bg-white text-rd-accent">{icon}</span>
      <p className="mt-2.5 text-[12px] font-bold text-ink">{label}</p>
      <p className="mt-1 text-[11.5px] leading-5 text-ink-faint">{value}</p>
    </div>
  );

  return (
    <>
      {/* هیروسکشن صفحه دوره حذف شد (درخواست کاربر) — صفحه مستقیم با نوار تب‌ها و سکشن‌ها شروع می‌شود */}
      <RdSection id="course-detail" fadeTop>
        <RdBand className="top-0" />
        {/* معرفی فشرده و قابل‌دیدن دوره؛ بدون بازگشت به هیروی بزرگ */}
        <RdWrap pb="pb-[110px] lg:pb-[62px] xl:pb-[79px]">
        <section className="mb-5 rounded-[8px] border border-hairline-soft bg-white p-4 sm:p-5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-navy-deep px-3 py-1 text-[11px] font-extrabold text-white">{c.code}</span>
            <span className="rounded-full bg-canvas-soft px-3 py-1 text-[11px] font-bold text-ink-soft">{c.trackLabel}</span>
            <span className="ms-auto inline-flex items-center gap-1 text-[11px] font-bold text-ink-soft">
              <Star className="size-3.5 fill-brand-500 text-brand-500" /> {faRate(avg)} از {faNum(c.reviews.length)} نظر
            </span>
          </div>
          <h1 className="mt-3 font-black-fa text-[19px] leading-8 text-ink sm:text-[24px]">{c.title}</h1>
          <p className="mt-1.5 max-w-4xl text-[12.5px] leading-7 text-ink-soft sm:text-[13px]">{c.short}</p>
          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-[11px] text-ink-soft">
            <span className="inline-flex items-center gap-1.5"><GraduationCap className="size-3.5 text-rd-accent" /> {c.teacher}</span>
            <span className="inline-flex items-center gap-1.5"><Clock3 className="size-3.5 text-rd-accent" /> {c.months}</span>
            <span className="inline-flex items-center gap-1.5"><Users className="size-3.5 text-rd-accent" /> {faNum(c.sessions)} جلسه</span>
          </div>
        </section>
        <div className="mb-5"><CourseTabBar c={c} /></div>
        {/* گرید محتوا و کارت قیمت چسبان */}
        <div className="grid gap-6 lg:grid-cols-[1fr_340px] lg:items-start">
          <div className="min-w-0 space-y-5">
          {/* ویدئو معرفی — سلول قاب‌دار با مربع‌های تاکیدی: سربرگ مونو + عکس + دکمهٔ پخش
              + مودال آپارات، دقیقاً هم‌الگوی سلول پرترهٔ سکشن «درباره ما» صفحهٔ اصلی */}
          <RdCard className="p-2" marks radius="rounded-[8px]">
            <div className="flex items-center justify-between gap-3 px-1.5 pb-2 pt-1 sm:px-2.5">
              <div className="flex min-w-0 items-center gap-3">
                <span className="rd-inside grid size-10 shrink-0 place-items-center rounded-[8px] text-rd-accent">
                  <Video className="size-5" />
                </span>
                <div className="min-w-0">
                  <h2 className="truncate text-[14px] font-black-fa text-ink max-sm:text-[13px]">{c.introVideo.title}</h2>
                  <p className="mt-0.5 text-[10.5px] text-ink-faint">
                    ویدیو معرفی دوره {c.code} — مدت {faNum(c.introVideo.duration)}
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  title="کپی لینک دوره"
                  onClick={() => {
                    try {
                      navigator.clipboard.writeText(window.location.href);
                    } catch {}
                    toast({ title: "لینک دوره کپی شد ✔", description: "می‌توانید آن را برای دوستانتان بفرستید." });
                  }}
                  className="rd-inside grid size-9 place-items-center rounded-full bg-white text-ink transition-colors hover:bg-canvas-soft"
                >
                  <Share2 className="size-4" />
                </button>
                <button
                  type="button"
                  title="ذخیره دوره"
                  onClick={() =>
                    toast({ title: "دوره ذخیره شد ✔", description: "در جلسه مشاوره رایگان، دوره‌های ذخیره‌شده را با هم مرور می‌کنیم." })
                  }
                  className="rd-inside grid size-9 place-items-center rounded-full bg-white text-ink transition-colors hover:bg-canvas-soft"
                >
                  <Bookmark className="size-4" />
                </button>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-[8px]">
              <img
                src={c.introVideo.poster}
                alt={c.introVideo.title}
                className="aspect-video w-full object-cover"
              />
              <PlayPill onClick={() => setVideoOpen(true)} ariaLabel={`پخش ویدئوی معرفی دوره ${c.code}`} />
            </div>
            {/* بولت‌های ویدئو — چیپ‌های مویی زیر عکس (دادهٔ بلااستفادهٔ قبلی اکنون نمایش داده می‌شود) */}
            <div className="flex flex-wrap gap-2 px-1.5 pb-1 pt-2.5 sm:px-2.5">
              {c.introVideo.bullets.map((b) => (
                <span key={b} className="rd-inside rounded-full bg-white px-3 py-1 text-[11px] font-bold text-ink-soft">
                  {b}
                </span>
              ))}
            </div>
          </RdCard>

            {/* کاشی‌های مشخصات + خدمات آموزشی — یک بوردر، بدون کاشی خاکستری خالی */}
            <section className="rd-inside rounded-[8px] bg-white p-3 sm:p-4">
              <div className="grid grid-cols-2 gap-px overflow-hidden rounded-[8px] bg-hairline-soft sm:grid-cols-4">
                {tile(<Monitor className="size-4" />, "نحوه برگزاری", c.type)}
                {tile(<BadgeCheck className="size-4" />, "وضعیت دوره", "ثبت‌نام باز است")}
                {tile(<TrendingUp className="size-4" />, "سطح‌بندی زبانی", LEVEL_RANGE[c.code] ?? `سطح ${c.code}`)}
                {tile(<LifeBuoy className="size-4" />, "روش پشتیبانی", "واتساپ / تلگرام")}
                {tile(<BookOpenText className="size-4" />, "خدمات آموزشی", "جزوه و تمرین هر جلسه")}
                {tile(<Clock3 className="size-4" />, "دسترسی جلسات", "رکورد جلسات")}
                {tile(<History className="size-4" />, "مکمل آموزشی", "آزمون و کارنامه هر فصل")}
                {tile(<CalendarDays className="size-4" />, "شروع دوره", c.startDate)}
              </div>
            </section>

            {/* درباره‌ی دوره — توضیحات رنگ عادی؛ فقط آپدیت‌ها سبز */}
            <section id="course-about" className="rd-inside scroll-mt-28 rounded-[8px] bg-white p-5 sm:p-6">
              <CourseHead icon={<Info className="size-5" />} title="درباره‌ی دوره" />
              <p className="mt-4 text-justify text-[12.5px] leading-7 text-ink-soft">{c.short}</p>
              <div className="my-4 border-t border-hairline-soft" />
              {/* آپدیت‌های دوره — تنها بخشی که سبز می‌ماند */}
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-bold text-[12.5px] text-ok">آپدیت‌های دوره</h3>
                <span className="inline-flex items-center gap-1 rounded-full bg-ok/10 px-2 py-0.5 text-[10.5px] font-bold text-ok">
                  <Check className="size-3" strokeWidth={3} />
                  آپدیت
                </span>
              </div>
              <div className="mt-2 space-y-1.5">
                {c.updates.map((u) => (
                  <p key={u.title} className="flex items-start gap-2 text-[11.5px] leading-6 text-ink-soft">
                    <span className="mt-2.5 size-1.5 shrink-0 rounded-full bg-ok" />
                    <span>
                      <span className="font-bold text-ok">{u.title}</span> — {u.desc}{" "}
                      <span className="text-ink-faint">({u.date})</span>
                    </span>
                  </p>
                ))}
              </div>
              {aboutOpen && (
                <>
                  <p className="mt-4 text-justify text-[12px] leading-7 text-ink-soft">
                    این دوره با روش Blitz برگزار می‌شود: هر جلسه ساختار ثابت دارد — چانک‌های واقعی زبان یاد می‌گیرید، با سؤال‌وپاسخ و
                    نقش‌آفرینی همان‌جا به کار می‌گیرید و در پایان جلسه گزارش پیشرفت مشخص دریافت می‌کنید. همه تمرین‌ها طبق فرمت
                    آزمون‌های رسمی چیده شده‌اند تا هیچ جزوه‌ای بی‌استفاده نماند.
                  </p>
                  <p className="mt-3 text-justify text-[12px] leading-7 text-ink-soft">
                    در کنار کلاس‌های زنده، برای مرور، تمرین و تثبیت مطالب این بخش‌ها در اختیار شماست:
                  </p>
                  <ul className="mt-2.5 space-y-2">
                    {c.includes.map((it) => (
                      <li key={it} className="flex items-start gap-2 text-[12px] leading-7 text-ink-soft">
                        <span className="mt-2.5 shrink-0 text-rd-accent">
                          <Check className="size-3.5" strokeWidth={2.5} />
                        </span>
                        <span>{it}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-4 font-bold text-[12px] text-ink">ساختار هر جلسه در روش Blitz</p>
                  <div className="mt-2.5 flex flex-wrap items-center gap-2">
                    {c.classMethod.map((m, i) => (
                      <React.Fragment key={m.title}>
                        {i > 0 && <ChevronLeft className="size-3 text-ink-faint" />}
                        <span className="rd-inside rounded-full bg-white px-3 py-1.5 text-[11.5px] font-bold text-ink-soft">
                          {m.title}
                        </span>
                      </React.Fragment>
                    ))}
                  </div>
                  <p className="mt-4 font-bold text-[12px] text-ink">پس از پایان این دوره، مسیر ادامه دارد:</p>
                  <div className="mt-2.5 flex flex-wrap items-center gap-2">
                    {siteCourses.map((o, i) => (
                      <React.Fragment key={o.slug}>
                        {i > 0 && <ChevronLeft className="size-3 text-ink-faint" />}
                        <SiteLink
                          href={`/courses/${o.slug}`}
                          className="rd-inside rounded-full bg-white px-3 py-1.5 text-[11.5px] font-bold text-ink-soft transition-colors hover:bg-canvas-soft hover:text-ink"
                        >
                          {o.code}
                        </SiteLink>
                      </React.Fragment>
                    ))}
                  </div>
                </>
              )}
              {/* دکمه «ادامه متن» — هم‌استایل دکمه‌های «مشاهدهٔ …» هوم (h-10/px-5/13px) */}
              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={() => setAboutOpen((v) => !v)}
                  className="rd-inside inline-flex h-10 items-center gap-2 rounded-full bg-white px-5 text-[13px] text-ink transition-colors hover:bg-canvas-soft"
                >
                  {aboutOpen ? "نمایش کمتر" : "ادامه متن..."}
                  <ArrowLeft className={`size-4 text-ink-faint transition-transform ${aboutOpen ? "rotate-90" : "-rotate-90"}`} />
                </button>
              </div>
              <RdLabel code="ABT" n="01" className="mt-4" />
            </section>

            {/* مدرس دوره */}
            <section className="rd-inside rounded-[8px] bg-white p-5 sm:p-6">
              <div className="flex items-start gap-4">
                <img src="/images/edc/founder.png" alt={c.teacher} className="size-16 shrink-0 rounded-full object-cover object-top" />
                <div className="min-w-0 flex-1">
                  <h2 className="flex items-center gap-1.5 font-black-fa text-[15px] text-ink">
                    {c.teacher}
                    <BadgeCheck className="size-4 text-rd-accent" />
                  </h2>
                  <p className="mt-0.5 text-[11px] font-bold text-ink-soft">{c.teacherTitle}</p>
                  <p className="mt-2.5 text-[12.5px] leading-7 text-ink-soft">
                    ۱۶ سال تجربه تدریس آلمانی، مدرک DLL موسسه گوته و گواهی تدریس DSIT تهران؛ طراح روش Blitz — همین روشی که این
                    دوره با آن برگزار می‌شود.
                  </p>
                  <SiteLink
                    href="/about"
                    className="mt-2.5 inline-flex items-center gap-1.5 text-[11.5px] font-bold text-ink-soft transition-colors hover:text-ink"
                  >
                    آشنایی با مدرس
                    <ArrowLeft className="size-3.5" />
                  </SiteLink>
                </div>
              </div>
              <RdLabel code="TCH" n="02" className="mt-4" />
            </section>

            {/* سرفصل‌های دوره — مثل سؤالات متداول: یک کانتینر با جداکننده، بدون بوردر جدا */}
            <section id="course-curriculum" className="rd-inside scroll-mt-28 rounded-[8px] bg-white p-5 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <CourseHead icon={<BookOpenText className="size-5" />} title="سرفصل‌های دوره" />
                <p className="text-[12px] text-ink-faint">
                  {faNum(c.curriculum.length)} بخش، {faNum(c.sessions)} جلسه
                </p>
              </div>
              <Accordion type="single" collapsible className="mt-2">
                {c.curriculum.map((ch, i) => (
                  <AccordionItem key={ch.chapter} value={`ch-${i}`} className="border-hairline-soft">
                    <AccordionTrigger className="gap-3 py-3.5 text-start hover:no-underline">
                      <span className="flex items-center gap-3">
                        <span className="rd-inside grid size-10 shrink-0 place-items-center rounded-[8px] bg-white text-rd-accent">
                          <FileText className="size-4" />
                        </span>
                        <span>
                          <span className="block text-[12.5px] font-bold text-ink">{ch.chapter}</span>
                          <span className="mt-0.5 block text-[10.5px] text-ink-faint">{faNum(ch.items.length)} جلسه</span>
                        </span>
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="pb-4">
                      <ul className="space-y-2">
                        {ch.items.map((it, j) => (
                          <li
                            key={it}
                            className="flex items-center gap-3 rounded-[8px] bg-canvas-soft px-4 py-2.5 text-[12px]"
                          >
                            <FileText className="size-3.5 shrink-0 text-rd-accent" />
                            <span className="min-w-0 flex-1 text-ink-soft">{it}</span>
                            <span className="shrink-0 text-[10px] font-bold text-ink-faint">جلسه‌ی {faNum(j + 1)}</span>
                          </li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
              <RdLabel code="CUR" n="03" className="mt-4" />
            </section>

            {/* نظرات زبان‌آموزان — فشرده */}
            <section id="course-reviews" className="rd-inside scroll-mt-28 rounded-[8px] bg-white p-5 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <CourseHead icon={<MessageSquare className="size-5" />} title="نظرات زبان‌آموزان" />
                <p className="text-[12px] text-ink-faint">{faNum(c.reviews.length)} نظر</p>
              </div>
              <div className="mt-3.5 flex flex-wrap items-center justify-between gap-3 rounded-[8px] bg-canvas-soft px-4 py-3">
                <div className="flex flex-wrap items-center gap-2.5">
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star key={i} className={`size-3.5 ${i < Math.round(avg) ? "fill-brand-500 text-brand-500" : "text-hairline"}`} />
                    ))}
                  </div>
                  <span className="text-[14px] font-extrabold text-ink">{faRate(avg)}</span>
                  <span className="text-[10.5px] text-ink-faint">از ۵ — بر اساس {faNum(c.reviews.length)} نظرِ زبان‌آموزان این دوره</span>
                </div>
                <div className="flex gap-1">
                  {([null, 5, 4, 3] as const).map((v) => (
                    <button
                      key={v === null ? "all" : v}
                      type="button"
                      onClick={() => setRate(v)}
                      className={`h-7 min-w-7 rounded-full px-2.5 text-[11.5px] font-bold transition-colors ${
                        rate === v ? "bg-navy-deep text-white" : "border border-hairline-soft bg-white text-ink-soft hover:text-ink"
                      }`}
                    >
                      {v === null ? "همه" : faNum(v)}
                    </button>
                  ))}
                </div>
              </div>
              <div className="mt-3.5 space-y-3">
                {(showAllRev ? shown : shown.slice(0, 2)).map((r) => (
                  <figure key={r.name} className="rd-inside rounded-[8px] bg-white p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-canvas-soft text-[13px] font-bold text-ink">
                          {r.name.trim().charAt(0)}
                        </span>
                        <div>
                          <figcaption className="text-[11.5px] font-bold text-ink">{r.name}</figcaption>
                          <div className="mt-0.5 flex items-center gap-0.5">
                            {Array.from({ length: 5 }, (_, i) => (
                              <Star key={i} className={`size-3 ${i < r.rating ? "fill-brand-500 text-brand-500" : "text-hairline"}`} />
                            ))}
                          </div>
                        </div>
                      </div>
                      <span className="select-none font-serif text-2xl leading-none text-hairline" aria-hidden>
                        ”
                      </span>
                    </div>
                    <blockquote className="mt-2 text-[11.5px] leading-6 text-ink-soft">{r.text}</blockquote>
                  </figure>
                ))}
                {shown.length === 0 && (
                  <p className="rounded-[8px] border border-dashed border-hairline-soft p-4 text-center text-[12.5px] text-ink-faint">
                    هنوز نظری با این امتیاز ثبت نشده است.
                  </p>
                )}
              </div>
              {shown.length > 2 && (
                <div className="mt-3.5 text-center">
                  <button
                    type="button"
                    onClick={() => setShowAllRev((v) => !v)}
                    className="rd-inside inline-flex h-10 items-center gap-2 rounded-full bg-white px-5 text-[13px] text-ink transition-colors hover:bg-canvas-soft"
                  >
                    {showAllRev ? "نمایش کمتر" : `نمایش ${faNum(shown.length - 2)} نظر دیگر`}
                    <ArrowLeft className={`size-4 text-ink-faint transition-transform ${showAllRev ? "rotate-90" : "-rotate-90"}`} />
                  </button>
                </div>
              )}
              <RdLabel code="REV" n="04" className="mt-4" />
            </section>

            {/* سؤالات متداول — مثل هوم و تماس: یک کانتینر با جداکننده ساده */}
            <section id="course-faq" className="rd-inside scroll-mt-28 rounded-[8px] bg-white px-5 py-4 sm:px-6">
              <div className="px-1 py-2">
                <CourseHead icon={<CircleHelp className="size-5" />} title="سؤالات متداول" />
              </div>
              <Accordion type="single" collapsible>
                {c.faqs.map((f, i) => (
                  <AccordionItem key={f.q} value={f.q} className="border-hairline-soft">
                    <AccordionTrigger className="text-start text-[12px] font-bold text-ink hover:no-underline">
                      <span className="flex items-start gap-3 text-start">
                        <span className="dc-mono mt-px text-[11px] font-medium text-rd-accent" dir="ltr">
                          {String(i + 1).padStart(2, "0")}.
                        </span>
                        <span>{f.q}</span>
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="text-[11.5px] leading-7 text-ink-soft">{f.a}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
              <RdLabel code="FAQ" n="05" className="mt-3" />
            </section>
          </div>

          {/* کارت قیمت — جدا و چسبان (فقط دسکتاپ؛ در موبایل نوار ثابت پایین صفحه):
              کارت قاب‌دار با مربع‌های تاکیدی (RdCard marks)، قیمت بدون قاب داخلی تکراری،
              چیپ تخفیف با رنگ اکسنت (سبز فقط مخصوص «آپدیت‌های دوره» است) و دکمهٔ ثانویهٔ واتساپ */}
          <div className="hidden lg:block lg:sticky lg:top-[80px]">
            <RdCard className="p-5" marks radius="rounded-[8px]">
              <h2 className="font-black-fa text-[16px] leading-7 text-ink">{c.title}</h2>
              <span className="mt-2.5 inline-block w-max rounded-full bg-canvas-soft px-2.5 py-0.5 text-[10px] font-bold text-ink-soft">
                {c.type}
              </span>
              <div className="mt-3 flex items-center gap-2">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star key={i} className={`size-3 ${i < Math.round(avg) ? "fill-brand-500 text-brand-500" : "text-hairline"}`} />
                ))}
                <span className="text-[12px] font-bold text-ink">{faRate(avg)}</span>
                <span className="text-[11px] text-ink-faint">(از {faNum(c.reviews.length)} رأی)</span>
              </div>
              <dl className="mt-3 divide-y divide-hairline-soft border-t border-hairline-soft text-[12px]">
                <div className="flex items-center justify-between gap-3 py-2.5">
                  <dt className="font-medium text-ink-soft">مدت دوره</dt>
                  <dd className="font-bold text-ink">{c.months}</dd>
                </div>
                <div className="flex items-center justify-between gap-3 py-2.5">
                  <dt className="font-medium text-ink-soft">تعداد جلسات</dt>
                  <dd className="font-bold text-ink">{faNum(c.sessions)} جلسه</dd>
                </div>
                <div className="flex items-center justify-between gap-3 py-2.5">
                  <dt className="font-medium text-ink-soft">سطح دوره</dt>
                  <dd className="font-bold text-ink">{LEVEL_RANGE[c.code] ?? `سطح ${c.code}`}</dd>
                </div>
              </dl>
              {/* قیمت — ردیف هم‌ریتم کارت دورهٔ صفحهٔ اصلی: قیمت درشت + قیمت قبلی خط‌خورده زیرش */}
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-hairline-soft pt-3.5">
                <div className="min-w-0 leading-tight">
                  <p className="whitespace-nowrap text-[17.5px] font-black-fa text-ink">
                    {formatToman(c.price)}
                    <span className="ms-1 text-[10px] font-normal text-ink-faint">تومان</span>
                  </p>
                  <p className="dc-mono mt-0.5 text-[12px] text-ink-faint line-through" dir="ltr">
                    {formatToman(c.oldPrice)}
                  </p>
                </div>
                <span className="rounded-full bg-rd-accent/10 px-2 py-0.5 text-[10px] font-bold text-rd-accent">
                  ٪{faNum(Math.round((1 - c.price / c.oldPrice) * 100))} تخفیف
                </span>
              </div>
              <button
                type="button"
                onClick={buy}
                className="mt-3.5 inline-flex h-10 w-full items-center justify-center gap-2 rounded-full bg-rd-deep text-[13px] font-extrabold text-white transition-colors hover:bg-navy-700 active:scale-[0.985]"
              >
                <GraduationCap className="size-4" />
                ثبت نام در دوره آموزشی
              </button>
              {/* مشاوره واتساپ — دکمهٔ ثانویهٔ قرصی هم‌الگوی دکمه‌های ghost صفحهٔ اصلی؛ لینک واقعی با کد دوره */}
              <a
                href={courseWaLink(c.slug, c.code)}
                target="_blank"
                rel="noreferrer"
                className="rd-inside mt-2 inline-flex h-10 w-full items-center justify-center gap-2 rounded-full text-[13px] font-bold text-ink transition-colors hover:bg-canvas-soft"
              >
                <MessageCircle className="size-4 text-ink-faint" />
                مشاوره واتساپ دربارهٔ این دوره
              </a>
              <RdLabel code="PAY" n="01" className="mt-4" />
            </RdCard>
          </div>
        </div>

        {/* دوره‌های مشابه — سربرگ هم‌الگوی سکشن‌های صفحهٔ اصلی + گرید کارت‌های دوره */}
        <div id="course-similar" className="scroll-mt-28 pt-8">
          <RdHeadRow
            num="06"
            label="دوره‌ها"
            title="دوره‌های"
            accent="مشابه"
            flushBadge
            tightTitle
            titleSize="text-[22.8px] sm:text-[30px]"
          />
          <div className="mt-3.5 grid gap-3.5 sm:mt-4 sm:grid-cols-2 lg:grid-cols-4 xl:gap-5">
            {others.map((o, i) => (
              <CourseCard key={o.slug} c={o} n={String(i + 1).padStart(2, "0")} />
            ))}
          </div>
        </div>
        </RdWrap>
      </RdSection>

      {/* قیمت + دکمه ثبت — فیکس در انتهای صفحه در موبایل؛ پدینگ پایین با safe-area */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-hairline-soft bg-white/95 px-4 pb-[max(12px,env(safe-area-inset-bottom))] pt-3 backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] text-ink-faint">هزینه‌ی دوره</p>
            <p className="text-[15px] font-black-fa leading-6 text-ink">
              {formatToman(c.price)} <span className="text-[10px] font-bold text-ink-soft">تومان</span>
              <span className="dc-mono ms-1.5 text-[10px] font-medium text-ink-faint line-through">{formatToman(c.oldPrice)}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={buy}
            className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-full bg-rd-deep px-5 text-[13px] font-extrabold text-white transition-colors hover:bg-navy-700 active:scale-[0.985]"
          >
            <GraduationCap className="size-4" />
            ثبت نام در دوره
          </button>
        </div>
      </div>

      {/* مودال ویدئو — با کلیک روی قرص پخش، ویدئوی معرفی داخل مودال آپارات اجرا می‌شود */}
      <Dialog open={videoOpen} onOpenChange={setVideoOpen}>
        <DialogContent className="max-w-[900px] sm:max-w-[900px] overflow-hidden border-0 bg-black p-0 text-white">
          <DialogTitle className="sr-only">{c.introVideo.title}</DialogTitle>
          <DialogDescription className="sr-only">
            ویدئوی معرفی دورهٔ {c.code} کلینیک تخصصی زبان آلمانی المیرا
          </DialogDescription>
          <div className="aparat-embed w-full bg-black">
            <AparatModalVideo />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
