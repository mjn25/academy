"use client";

/* صفحات عمومی: پرسش‌های متداول، حریم خصوصی و قوانین — هم‌ریتم سایر صفحات سایت */

import React from "react";
import { Check, ChevronDown, CreditCard, HelpCircle, MapPin, ScrollText, ShieldCheck, Tag, Truck } from "lucide-react";
import { PageHero, faNum } from "@/components/site/pages-shared";
import { RdBand, RdSection, RdWrap } from "@/components/site/home";

/* ---------------------------- پرسش‌های متداول ---------------------------- */

const SITE_FAQS: { q: string; a: string; icon: React.ElementType }[] = [
  {
    q: "چطور سطحم را تعیین کنم؟",
    a: "به صفحه تعیین سطح بروید؛ چهار مهارت بر اساس چارچوب A1 تا B2 سنجیده می‌شود و نتیجه و نقشه راه شخصی بلافاصله بعد از جلسه تحویل می‌گیرید.",
    icon: HelpCircle,
  },
  {
    q: "پرداخت چطور انجام می‌شود؟",
    a: "پرداخت فقط آنلاین است؛ پس از تایید نهایی در سبد خرید، به درگاه پرداخت امن هدایت می‌شوید و دسترسی یا رسید ثبت‌نام بلافاصله صادر می‌شود.",
    icon: CreditCard,
  },
  {
    q: "کد تخفیف چطور اعمال می‌شود؟",
    a: "در سبد خرید بخش «کد تخفیف دارید؟» کد را وارد و «درج کد» را بزنید؛ تخفیف بلافاصله در جمع سفارش محاسبه می‌شود.",
    icon: Tag,
  },
  {
    q: "کتاب‌ها کِی و چطور ارسال می‌شود؟",
    a: "کتاب‌های سبد با پست پیشتاز به سراسر کشور ارسال می‌شود؛ هزینه ارسال در جمع سفارش نمایش داده می‌شود و بالای آستانهٔ مشخص، رایگان است.",
    icon: Truck,
  },
  {
    q: "کلاس‌ها کجا برگزار می‌شود؟",
    a: "کلاس‌های حضوری در کلاس‌های کلینیک برگزار می‌شود؛ برنامه هفتگی هر دوره در صفحه همان دوره و در پنل شما ثبت می‌شود.",
    icon: MapPin,
  },
];

export function FaqPage() {
  const [open, setOpen] = React.useState<number>(0);
  return (
    <>
      <PageHero
        eyebrow="FAQ"
        title="پرسش‌های متداول"
        desc="پاسخ کوتاه و دقیق پرتکرارترین پرسش‌های زبان‌آموزان کلینیک."
        breadcrumb={[{ label: "پرسش‌های متداول" }]}
      />
      <RdSection id="faq-page" fadeTop>
        <RdBand className="top-0" />
        <RdWrap pb="pb-[62px] sm:pb-[72px] xl:pb-[79px]">
          <div className="mx-auto max-w-[760px] space-y-2.5">
            {SITE_FAQS.map((f, i) => {
              const Icon = f.icon;
              const isOpen = open === i;
              return (
                <div key={f.q} className="rd-inside rounded-[8px] bg-white">
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? -1 : i)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center gap-3 p-4 text-start"
                  >
                    <span className="grid size-9 shrink-0 place-items-center rounded-[8px] bg-canvas-soft text-ink">
                      <Icon className="size-4" />
                    </span>
                    <span className="min-w-0 flex-1 text-[13.5px] font-bold text-ink">{f.q}</span>
                    <ChevronDown
                      className={`size-4 shrink-0 text-ink-soft transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                  {isOpen && (
                    <p className="border-t border-hairline-soft px-4 py-3.5 text-[12.5px] leading-6 text-ink-soft">{f.a}</p>
                  )}
                </div>
              );
            })}
          </div>
        </RdWrap>
      </RdSection>
    </>
  );
}

/* ------------------------------ حریم خصوصی ------------------------------ */

const PRIVACY_ITEMS: { t: string; a: string }[] = [
  {
    t: "چه اطلاعاتی جمع می‌کنیم؟",
    a: "فقط اطلاعاتی که برای ثبت‌نام و ارسال سفارش لازم است: نام، شمارهٔ موبایل، ایمیل (اختیاری) و آدرس پستی برای کتاب‌ها.",
  },
  {
    t: "استفاده از اطلاعات",
    a: "اطلاعات شما فقط برای پیگیری کلاس‌ها، تکالیف و ارسال سفارش استفاده می‌شود و در اختیار هیچ شخص ثالثی قرار نمی‌گیرد.",
  },
  {
    t: "اطلاعات مالی",
    a: "پرداخت‌ها در درگاه بانکی انجام می‌شود؛ کلینیک به شماره کارت یا رمز پرداخت شما دسترسی ندارد.",
  },
  {
    t: "حذف حساب",
    a: "با درخواست از طریق پشتیبانی، حساب و اطلاعات شما حذف می‌شود؛ فرایند حداکثر تا ۷۲ ساعت کامل می‌شود.",
  },
];

export function PrivacyPage() {
  return (
    <>
      <PageHero
        eyebrow="PRIVACY"
        title="حریم خصوصی"
        desc="چه اطلاعاتی نگه می‌داریم و فقط برای چه کاری استفاده می‌شود."
        breadcrumb={[{ label: "حریم خصوصی" }]}
      />
      <RdSection id="privacy" fadeTop>
        <RdBand className="top-0" />
        <RdWrap pb="pb-[62px] sm:pb-[72px] xl:pb-[79px]">
          <div className="mx-auto max-w-[760px]">
            <div className="rd-inside rounded-[8px] bg-white p-5 sm:p-7">
              <span className="grid size-11 place-items-center rounded-[8px] bg-canvas-soft text-rd-accent">
                <ShieldCheck className="size-5" />
              </span>
              <h2 className="mt-3.5 font-black-fa text-[16px] text-ink">تعهد ما</h2>
              <p className="mt-1.5 text-[13px] leading-7 text-ink-soft">
                اطلاعات زبان‌آموزان و خریداران، دارایی کلینیک است نه محصول. هر داده فقط برای آموزش و ارسال سفارش کاربرد دارد.
              </p>
              <div className="mt-5 space-y-3">
                {PRIVACY_ITEMS.map((p, i) => (
                  <div key={p.t} className="rounded-[8px] bg-canvas-soft/60 p-4">
                    <p className="flex items-center gap-2 text-[13px] font-bold text-ink">
                      <Check className="size-4 shrink-0 text-rd-accent" strokeWidth={3} />
                      {p.t}
                    </p>
                    <p className="mt-1.5 ps-6 text-[12.5px] leading-6 text-ink-soft">{p.a}</p>
                    <span className="sr-only">{faNum(i + 1)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </RdWrap>
      </RdSection>
    </>
  );
}

/* --------------------------- قوانین و مقررات --------------------------- */

const TERMS_ITEMS: { t: string; a: string }[] = [
  {
    t: "ثبت‌نام و دسترسی",
    a: "با پرداخت آنلاین، ثبت‌نام قطعی می‌شود و دسترسی دوره یا جلسات کلاس بر اساس برنامهٔ همان دوره فعال می‌گردد.",
  },
  {
    t: "پرداخت",
    a: "پرداخت فقط آنلاین و از طریق درگاه امن سایت انجام می‌شود؛ رسید پرداخت بلافاصله برای شما ثبت می‌شود.",
  },
  {
    t: "ارسال کتاب‌ها",
    a: "سفارش‌های فروشگاه با پست پیشتاز ارسال می‌شود؛ هزینهٔ ارسال در جمع سفارش پیش از پرداخت شفاف نمایش داده می‌شود.",
  },
  {
    t: "انصراف و جابه‌جایی",
    a: "تا شروع دوره، انتقال به دورهٔ دیگر یا ذخیرهٔ اعتبار برای دورهٔ بعدی با هماهنگی پشتیبانی امکان‌پذیر است.",
  },
  {
    t: "مالکیت محتوا",
    a: "جزوه‌ها، چانک‌ها و ویدئوهای دوره‌ها فقط برای استفادهٔ شخصی زبان‌آموز است؛ بازنشر بدون اجازهٔ کلینیک ممنوع است.",
  },
];

export function TermsPage() {
  return (
    <>
      <PageHero
        eyebrow="TERMS"
        title="قوانین و مقررات"
        desc="قواعد ثبت‌نام، پرداخت آنلاین و ارسال — کوتاه و شفاف."
        breadcrumb={[{ label: "قوانین" }]}
      />
      <RdSection id="terms" fadeTop>
        <RdBand className="top-0" />
        <RdWrap pb="pb-[62px] sm:pb-[72px] xl:pb-[79px]">
          <div className="mx-auto max-w-[760px]">
            <div className="rd-inside rounded-[8px] bg-white p-5 sm:p-7">
              <span className="grid size-11 place-items-center rounded-[8px] bg-canvas-soft text-rd-accent">
                <ScrollText className="size-5" />
              </span>
              <h2 className="mt-3.5 font-black-fa text-[16px] text-ink">شرایط استفاده از خدمات کلینیک</h2>
              <div className="mt-5 space-y-3">
                {TERMS_ITEMS.map((p, i) => (
                  <div key={p.t} className="rounded-[8px] bg-canvas-soft/60 p-4">
                    <p className="flex items-center gap-2 text-[13px] font-bold text-ink">
                      <span className="dc-mono text-[11px] font-bold text-rd-accent" dir="ltr">{`0${i + 1}`}</span>
                      {p.t}
                    </p>
                    <p className="mt-1.5 ps-7 text-[12.5px] leading-6 text-ink-soft">{p.a}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </RdWrap>
      </RdSection>
    </>
  );
}
