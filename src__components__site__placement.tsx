"use client";

import React from "react";
import { Check, Gift, Target } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { EdcMark } from "@/components/site/shared";
import { PageHero, faNum } from "@/components/site/pages-shared";
import { RdBand, RdEyebrow, RdSection, RdSqFrame, RdWrap } from "@/components/site/home";

/* صفحهٔ تعیین سطح — آزمون آنلاین حذف شده (درخواست کاربر: «آنلاین نیست»)؛
   صفحه فقط مسیر واقعی تعیین سطح (۵ گام) + فرم ثبت درخواست را نشان می‌دهد */

export function PlacementPage() {
  const { toast } = useToast();
  /* فرم رزرو جلسه — هم‌الگوی فرم سکشن تعیین سطح هوم */
  const [formName, setFormName] = React.useState("");
  const [formPhone, setFormPhone] = React.useState("");

  const startSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formPhone.trim()) {
      toast({ title: "لطفاً نام و شماره موبایل را وارد کنید.", variant: "destructive" });
      return;
    }
    toast({
      title: "درخواست شما ثبت شد ✔",
      description: "برای هماهنگی جلسه تعیین سطح با شما تماس می‌گیریم.",
    });
    setFormName("");
    setFormPhone("");
  };

  const giftSubmit = () => {
    const digits = formPhone.replace(/[\s\-()]/g, "").replace(/[۰-۹]/g, (d) => "۰۱۲۳۴۵۶۷۸۹".indexOf(d).toString());
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
    <>
      <PageHero
        eyebrow="PLACEMENT TEST"
        title="تعیین سطح"
        accent="رایگان"
        desc="تعیین سطح دقیق چهار مهارت در یک جلسهٔ حضوری یا آنلاین انجام می‌شود — درخواست خود را ثبت کنید تا جلسهٔ رایگان برایتان هماهنگ شود."
        breadcrumb={[{ label: "تعیین سطح" }]}
      />

      <RdSection id="placement-main" fadeTop>
        <RdBand className="top-0" />
        <RdWrap pb="pb-[62px] sm:pb-[72px] xl:pb-[79px]">
          <div className="mx-auto max-w-3xl">
            <div className="rd-inside relative overflow-hidden rounded-[8px] bg-white p-6 sm:p-8">
              <EdcMark className="pointer-events-none absolute -bottom-10 -end-10 size-44 opacity-[0.05]" />
              <h2 className="flex items-center gap-2.5 font-black-fa text-lg text-ink">
                <Target className="size-5 text-rd-accent" />
                نحوه تعیین سطح
              </h2>
              <p className="mt-2 text-[12.5px] leading-6 text-ink-soft">
                تعیین سطح پس از ثبت درخواست به این ترتیب انجام می‌شود:
              </p>
              {/* ۵ گام تعیین سطح پس از ثبت درخواست — فهرست شماره‌دار عمودی */}
              <ol className="mt-5 space-y-2.5">
                {[
                  { t: "ثبت درخواست", d: "فرم رزرو تعیین سطح را پر می‌کنید تا پروندهٔ شما ساخته شود." },
                  { t: "یک جلسه حضوری یا آنلاین", d: "برای هماهنگی، یک جلسه تعیین سطح حضوری یا آنلاین تعیین وقت می‌شود." },
                  { t: "پاسخ به سؤالات مطرح‌شده", d: "در همان جلسه به سؤالات سطح‌بندی گفتار، شنیدار، خواندن و نوشتن پاسخ می‌دهید." },
                  { t: "بررسی", d: "نتایج توسط مدرس بررسی و سطح دقیق زبانی شما مشخص می‌شود." },
                  { t: "اطلاع از طریق واتساپ، تلگرام", d: "نتیجه تعیین سطح و مسیر پیشنهادی از طریق واتساپ یا تلگرام برای شما ارسال می‌شود." },
                ].map((s, i) => (
                  <li key={s.t} className="flex items-start gap-3 rounded-[8px] bg-canvas-soft/60 p-3.5">
                    <span className="grid size-8 shrink-0 place-items-center rounded-full bg-rd-deep font-black-fa text-[13px] text-white">
                      {faNum(i + 1)}
                    </span>
                    <div className="min-w-0">
                      <p className="text-[13.5px] font-black-fa leading-6 text-ink">{s.t}</p>
                      <p className="mt-0.5 text-[12px] leading-6 text-ink-soft">{s.d}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </RdWrap>
      </RdSection>

      {/* توضیح + فرم مربوطه — یک توضیح و یک فرم روی بکگراند سفید (درخواست کاربر: سرمه‌ای نباشد) */}
      <RdSection id="placement-form">
        <RdBand className="top-0" />
        <RdWrap pb="pb-[62px] sm:pb-[72px] xl:pb-[79px]">
          <div className="grid gap-4 lg:grid-cols-2 xl:gap-5">
            {/* کارت توضیح */}
            <div className="rd-inside relative overflow-hidden rounded-[8px] bg-white p-6 sm:p-7">
              <RdSqFrame />
              <RdEyebrow num="01" label="تعیین سطح" className="ps-0" />
              <h2 className="mt-1 font-black-fa text-[21px] leading-8 text-ink sm:text-[25px] sm:leading-10">
                چرا تعیین سطح، <span className="text-rd-title">قدم اول</span> است؟
              </h2>
              <ul className="mt-4 space-y-2.5">
                {[
                  "کلاس اشتباه یعنی زمان و انگیزه‌ای که می‌سوزد؛ اول سطح درست، بعد مسیر درست.",
                  "در جلسه رایگان کلینیک، چهار مهارت واقعاً سنجیده می‌شود — گفتن، شنیدن، خواندن و نوشتن.",
                  "بر اساس هدف شما (زبان، بازار کار یا مدرک رسمی) مسیر و برنامه دقیق پیشنهاد می‌شود.",
                ].map((t) => (
                  <li key={t} className="flex items-start gap-2.5 text-[13px] leading-6 text-ink-soft">
                    <Check className="mt-1 size-4 shrink-0 text-rd-accent" strokeWidth={2.5} />
                    {t}
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-[12px] leading-6 text-ink-faint">
                تعیین سطح ما آنلاین و خودکار نیست تا سطح شما واقعاً دقیق سنجیده شود؛ قدم واقعی، همان جلسهٔ رایگان است که نتیجه‌اش را در قالب یک نقشه راه مشخص می‌گیرید.
              </p>
            </div>

            {/* فرم مربوطه — کارت سفید */}
            <form
              onSubmit={startSubmit}
              className="rd-inside relative rounded-[8px] bg-white p-5 sm:p-7"
              aria-label="فرم رزرو تعیین سطح"
            >
              <div className="flex items-center gap-2.5">
                <span className="rd-inside grid size-9 shrink-0 place-items-center rounded-full bg-white text-rd-accent">
                  <Gift className="size-4" />
                </span>
                <h3 className="font-black-fa text-ink">رزرو جلسه تعیین سطح</h3>
              </div>
              <p className="mt-1 text-xs text-ink-soft">فرم را پر کنید تا برای هماهنگی جلسه با شما تماس بگیریم.</p>
              <div className="mt-4 space-y-3.5">
                <label className="block">
                  <span className="mb-1.5 block text-xs font-bold text-ink">نام و نام خانوادگی</span>
                  <input
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="مثلاً سارا محمدی"
                    aria-label="نام و نام خانوادگی"
                    className="h-11 w-full rounded-[8px] bg-white px-4 text-sm text-ink outline-none ring-1 ring-hairline-soft placeholder:text-ink-faint focus:ring-2 focus:ring-rd-accent/40"
                  />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-bold text-ink">شماره موبایل</span>
                  <input
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    inputMode="tel"
                    dir="ltr"
                    placeholder="0912 000 0000"
                    aria-label="شماره موبایل"
                    className="h-11 w-full rounded-[8px] bg-white px-4 text-start text-sm text-ink outline-none ring-1 ring-hairline-soft placeholder:text-ink-faint focus:ring-2 focus:ring-rd-accent/40"
                  />
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="submit"
                    className="h-11 rounded-full bg-rd-deep text-[13px] font-extrabold text-white transition-all hover:bg-navy-700 active:scale-[0.99]"
                  >
                    تعیین سطح
                  </button>
                  <button
                    type="button"
                    onClick={giftSubmit}
                    className="rd-inside inline-flex h-11 items-center justify-center rounded-full bg-white px-2 text-[13px] font-extrabold text-ink transition-all hover:bg-canvas-soft active:scale-[0.99]"
                  >
                    دانلود جزوهٔ رایگان
                  </button>
                </div>
                <p className="text-center text-[11px] leading-5 text-ink-faint">
                  اطلاعات شما فقط برای هماهنگی جلسه استفاده می‌شود و در اختیار هیچ دیگری قرار نمی‌گیرد.
                </p>
              </div>
            </form>
          </div>
        </RdWrap>
      </RdSection>
    </>
  );
}
