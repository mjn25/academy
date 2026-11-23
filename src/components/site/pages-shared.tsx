"use client";

import React from "react";
import { Check, ChevronLeft, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { SiteLink } from "@/components/site/shared";
import { RdBand, RdSqFrame } from "@/components/site/home";

/* اعداد فارسی برای شمارنده‌ها */
export function faNum(n: number | string) {
  return String(n).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)]);
}

/* -------------------------------breadcrumb ----------------------------- */

/* نان‌ریزه — نسخهٔ تیره برای هیروی سرمه‌ای صفحات داخلی:
   لینک‌ها white/50، صفحهٔ فعلی sky2؛ نسخهٔ روشن مثل قبل با rd-accent */
export function Breadcrumb({
  items,
  dark = false,
}: {
  items: { label: string; href?: string }[];
  dark?: boolean;
}) {
  return (
    <nav
      aria-label="مسیر صفحه"
      className={`flex flex-wrap items-center gap-1.5 text-xs ${dark ? "text-white/50" : "text-ink-soft"}`}
    >
      <SiteLink
        href="/"
        className={dark ? "transition-colors hover:text-white" : "transition-colors hover:text-ink"}
      >
        خانه
      </SiteLink>
      {items.map((it) => (
        <span key={it.label} className="flex items-center gap-1.5">
          <ChevronLeft className={`size-3.5 ${dark ? "text-white/30" : "text-ink-faint"}`} />
          {it.href ? (
            <SiteLink
              href={it.href}
              className={dark ? "transition-colors hover:text-white" : "transition-colors hover:text-ink"}
            >
              {it.label}
            </SiteLink>
          ) : (
            <span className={`font-bold ${dark ? "text-rd-sky2" : "text-rd-accent"}`}>{it.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

/* ------------------------------ هدر صفحات ------------------------------ */

/* هیروی همهٔ صفحات داخلی — شبکهٔ مشبک به عرض کانتینر، بدون هیچ رنگ‌آمیزی (حذف هاله‌ها
   به درخواست کاربر)؛ محوِ شبکه بعد از هیرو انجام می‌شود: fadeTop روی اولین سکشن هر صفحه؛
   سلول سفید گرد با قاب چهارمربعی + ابروی مونو لاتین (dir=ltr)
   + تیتر آبی + توضیح؛ بردکرامپ بالای سلول و نوار مرز در لبهٔ پایین */
export function PageHero({
  eyebrow,
  title,
  accent,
  desc,
  breadcrumb,
  children,
  titleSize,
  titleMt,
  descClassName,
  padClassName,
}: {
  eyebrow?: string;
  title: string;
  accent?: string;
  desc?: string;
  breadcrumb: { label: string; href?: string }[];
  children?: React.ReactNode;
  /* اندازه و فاصله تیتر - اختیاری؛ بدون آن‌ها الگوی مشترک */
  titleSize?: string;
  titleMt?: string;
  descClassName?: string;
  padClassName?: string;
}) {
  return (
    <section className="relative overflow-hidden bg-white">
      {/* شبکهٔ مشبک هیرو — به عرض کانتینر و با قدرت کامل؛ محو آن بعد از هیرو و
          تا رسیدن به اولین کانتنت، در اولین سکشن هر صفحه (fadeTop) انجام می‌شود */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="mx-auto h-full w-full max-w-[1280px]">
          <div className="dc-grid-light h-full w-full" />
        </div>
      </div>
      <RdBand className="bottom-0" />
      <div className={`relative mx-auto w-full max-w-[1280px] px-4 sm:px-8 xl:px-10 ${padClassName ?? "pt-[12px] pb-[36px] sm:pt-[14px] sm:pb-[44px] xl:pt-[16px] xl:pb-[48px]"}`}>
        <Breadcrumb items={breadcrumb} />
        {/* سلول سفید سربرگ — مثل سلول سربرگ سکشن ۰۵ هوم: گرد، قاب چهارمربعی، محتوا وسط‌چین */}
        <div className="relative mx-auto mt-2.5 max-w-[640px] rounded-[8px] bg-white px-6 pb-4 text-center sm:px-10 xl:px-16">
          <RdSqFrame />
          {eyebrow && (
            <span
              className="dc-mono relative mx-auto mt-3 block w-max text-[12px] font-medium tracking-[0.08em] text-rd-title"
              dir="ltr"
            >
              {eyebrow}
            </span>
          )}
          <h1
            className={`${titleMt ?? "mt-3"} font-black-fa leading-[1.4] text-rd-title ${titleSize ?? "text-[22.8px] sm:text-[30px]"}`}
          >
            {title}
            {accent && <span className="text-ink"> {accent}</span>}
          </h1>
          {desc && (
            <p className={`mx-auto mt-2.5 max-w-[500px] text-[13px] leading-6 text-ink-soft ${descClassName ?? ""}`}>
              {desc}
            </p>
          )}
          {children}
        </div>
      </div>
    </section>
  );
}

/* ----------------------------- کپی‌کردن -------------------------------- */

export function CopyButton({
  value,
  className,
  label = "کپی",
}: {
  value: string | (() => string);
  className?: string;
  label?: string;
}) {
  const { toast } = useToast();
  const [done, setDone] = React.useState(false);

  const copy = async () => {
    const v = typeof value === "function" ? value() : value;
    try {
      await navigator.clipboard.writeText(v);
    } catch {
      try {
        const ta = document.createElement("textarea");
        ta.value = v;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      } catch {
        toast({ title: "کپی ناموفق بود — لطفاً دستی کپی کنید.", variant: "destructive" });
        return;
      }
    }
    setDone(true);
    toast({ title: "کپی شد ✔", description: v });
    window.setTimeout(() => setDone(false), 1600);
  };

  return (
    <button
      type="button"
      onClick={copy}
      title={label}
      aria-label={`${label} — ${value}`}
      className={
        className ??
        "grid size-8 shrink-0 place-items-center rounded-[8px] border border-hairline-soft bg-white text-ink-soft transition-colors hover:bg-canvas-soft hover:text-ink"
      }
    >
      {done ? <Check className="size-4 text-ok" strokeWidth={2.5} /> : <Copy className="size-4" />}
    </button>
  );
}

/* --------------------------- نوار اطلاعات پایه -------------------------- */

export function MetaChip({ icon, children, dir }: { icon?: React.ReactNode; children: React.ReactNode; dir?: "ltr" | "rtl" }) {
  return (
    <span dir={dir} className="rd-inside inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-[11px] font-bold text-ink-soft">
      {icon}
      {children}
    </span>
  );
}
