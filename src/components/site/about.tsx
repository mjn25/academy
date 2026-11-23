"use client";

import React from "react";
import { ArrowLeft, Award, BadgeCheck, BookMarked, Check, GraduationCap, Languages, Quote, X, Zap } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { EdcMark, SiteLink } from "@/components/site/shared";
import { PageHero, faNum } from "@/components/site/pages-shared";
import { AparatModalVideo, PlayPill, RdBand, RdCard, RdEyebrow, RdSection, RdSqFrame, RdWrap } from "@/components/site/home";
import { aboutCredentials, aboutMilestones, blitzAiUses, dllToBlitz } from "@/lib/site-data";

/* ------------------------------ داستان بنیان‌گذار ------------------------ */

/* سکشن اول بعد از هیرو — دقیقاً هم‌الگوی سکشن «درباره ما» هوم (درخواست کاربر):
   تصویر پرتره با دکمهٔ پخش ویدئو، متن روی سلول‌های سفید، و فقط یک دکمهٔ «دیدن دوره» */
function Story() {
  const [videoOpen, setVideoOpen] = React.useState(false);
  return (
    <RdSection id="about-story" fadeTop>
      <RdBand className="top-0" />
      <RdWrap pb="pb-[62px] sm:pb-[72px] xl:pb-[79px]">
        <div className="relative">
          <RdSqFrame />
          <div className="relative grid grid-cols-1 gap-px overflow-hidden rounded-[8px] border border-hairline-soft bg-hairline-soft md:grid-cols-[2fr_3fr]">
            {/* سلول پرتره — عکس تا لبهٔ سلول + هاله‌های کمرنگ سه‌رنگ + دکمهٔ پخش ویدئو (مثل هوم)
                تصویر کوچک‌تر از قبل (درخواست کاربر): ستون باریک‌تر و ارتفاع کمتر */}
            <div className="relative min-h-[240px] overflow-hidden bg-white md:min-h-[340px]">
              <img
                src="/images/edc/founder-poster.png"
                alt="دکتر المیرا معرفت‌پور — بنیان‌گذار کلینیک تخصصی زبان آلمانی"
                className="absolute inset-0 size-full object-cover object-top"
                loading="lazy"
              />
              <div aria-hidden="true" className="pointer-events-none absolute inset-0">
                <span className="absolute -top-14 -left-12 size-60 rounded-full bg-skyc/10 blur-3xl" />
                <span className="absolute right-[12%] top-[30%] size-72 rounded-full bg-[#F70458]/10 blur-3xl" />
                <span className="absolute -bottom-20 left-[30%] size-80 rounded-full bg-navy-deep/10 blur-3xl" />
              </div>
              <PlayPill onClick={() => setVideoOpen(true)} />
            </div>

            {/* سلول داستان — متن روی بکگراند سفید + فقط یک دکمهٔ «دیدن دوره» */}
            <div className="flex flex-col bg-white p-5 sm:p-6">
              <RdEyebrow num="01" label="داستان بنیان‌گذار" className="ps-0" />
              <div className="mt-3 flex items-center gap-3">
                <span aria-hidden="true" className="h-10 w-1 shrink-0 rounded-[4px] bg-rd-accent" />
                <div>
                  <p className="text-[16px] font-black-fa leading-6 text-ink">دکتر المیرا معرفت‌پور</p>
                  <p className="mt-0.5 text-[12.5px] leading-5 text-ink-soft">بنیان‌گذار کلینیک تخصصی زبان آلمانی</p>
                </div>
              </div>
              <h2 className="mt-4 font-black-fa text-[22.8px] leading-[1.4] text-ink sm:text-[26px]">
                از زبان تا اشتغال <span className="text-rd-title">در آلمان</span>
              </h2>
              <p className="mt-4 text-justify text-[13.5px] leading-7 text-ink-soft">
                مسیر من با یک سؤال ساده شروع شد: چرا خیلی‌ها سال‌ها آلمانی می‌خوانند اما موقع صحبت کردن قفل می‌کنند؟
                ۱۶ سال پیش — سال ۱۳۸۹ — تدریس آلمانی را شروع کردم و از همان کلاس‌های اول فهمیدم مشکل «نمی‌دانم» نیست؛
                مشکل این است که دانش زبان هرگز به «می‌توانم» تبدیل نمی‌شود. از آن روز، همه تلاشم ساخت پلی بین این دو بود.
              </p>
              <p className="mt-3.5 text-justify text-[13.5px] leading-7 text-ink-soft">
                برای ساختن آن پل، مسیر حرفه‌ام را با ارزیابی‌های بین‌المللی محکم کردم: گواهی تدریس «Einführung in die
                Lehrtätigkeit» از مؤسسه زبان آلمانی تهران (DSIT)، مدرک «Deutsch Lehren Lernen» از موسسه گوته، کارگاه
                تخصصی ترجمه اسناد حقوقی آلمانی و کارگاه «AI in Translation» دانشگاه آزاد — مجموعاً صدها ساعت فورتبیلدونگ.
                از دل همین دوره‌ها، روش Blitz متولد شد: تبدیل آموخته‌های آکادمیک به یک سیستم اجرایی برای کلاس واقعی.
              </p>
              <p className="mt-3.5 text-justify text-[13.5px] leading-7 text-ink-soft">
                امروز کلینیک زبان آلمانی المیرا حاصل همین ۱۶ سال است: بیش از ۱۰٬۰۰۰ شاگرد که از الفبا شروع کردند و تا
                مصاحبه کاری، قرارداد کار و آزمون‌های رسمی رفتند. مأموریت ما یک جمله است — از زبان تا اشتغال در آلمان؛
                یعنی مسیر شما با تعیین سطح دقیق شروع می‌شود و تا روزی که واقعاً با آلمانی کار می‌کنید همراهتان است.
              </p>
              <div className="mt-auto flex flex-wrap items-center gap-2.5 pt-5">
                <SiteLink
                  href="/courses"
                  className="inline-flex h-10 items-center gap-2 rounded-full bg-rd-deep px-6 text-[13px] font-extrabold text-white transition-colors hover:bg-navy-700"
                >
                  دیدن دوره
                  <ArrowLeft className="size-4" />
                </SiteLink>
              </div>
            </div>
          </div>
        </div>
      </RdWrap>

      {/* مودال ویدئو — هم‌الگوی سکشن درباره ما هوم */}
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

/* ------------------------- چهار قدم روش Blitz --------------------------- */

const BLITZ_STEPS = [
  { n: "۱", title: "Chunks", fa: "عبارت‌های آماده و طبیعی", desc: "زبان به‌شکل ترکیب‌های کامل یاد گرفته می‌شود، نه لغت‌های پراکنده." },
  { n: "۲", title: "Fragen", fa: "سؤال‌های هدفمند", desc: "مدرس با پرسش‌های دقیق، همان چیزی را از شما می‌خواهد که در موقعیت واقعی لازم دارید." },
  { n: "۳", title: "Rollenspiel", fa: "استفاده در موقعیت واقعی", desc: "خرید، مصاحبه، تماس — هر مطلب همان جلسه در نقش اجرا می‌شود." },
  { n: "۴", title: "BlitzPerformance", fa: "توانایی واقعی در صحبت کردن", desc: "سنجش توانایی نه با حفظیات، بلکه با اجرا در سناریوهای واقعی." },
];

function Method() {
  return (
    <RdSection id="about-method">
      <RdBand className="top-0" />
      <RdWrap pb="pb-[62px] sm:pb-[72px] xl:pb-[79px]">
        <RdEyebrow num="02" label="روش آموزش" className="ps-0" />
        <h2 className="mt-3 font-black-fa text-[22.8px] leading-[1.4] text-ink sm:text-[30px]">
          این نگاه در Blitz <span className="text-rd-title">تبدیل شد به…</span>
        </h2>
        <p className="mt-3 max-w-2xl text-[13px] leading-6 text-ink-soft">
          چهار قدمی که در کلاس واقعی اجرا می‌شود — از دل دوره‌های حرفه‌ای تدریس، ساخته‌شده برای موقعیت واقعی:
        </p>
        <ol className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:mt-7">
          {BLITZ_STEPS.map((s) => (
            <li key={s.title} className="flex">
              <RdCard className="flex w-full flex-col p-5" marks radius="rounded-[8px]">
                <span className="grid size-10 place-items-center rounded-[8px] bg-rd-deep font-black-fa text-base text-white">{s.n}</span>
                <p className="mt-4 text-[15px] font-extrabold text-ink" dir="ltr">
                  {s.title}
                </p>
                <p className="mt-1 text-[12.5px] font-bold text-rd-accent">{s.fa}</p>
                <p className="mt-2.5 flex-1 text-[13px] leading-6 text-ink-soft">{s.desc}</p>
              </RdCard>
            </li>
          ))}
        </ol>
        {/* نقل قول هدف — نوار تیرهٔ هم‌ریتم سکشن‌های تیره */}
        <div className="rd-inside-dark relative mt-6 flex flex-col items-start gap-4 rounded-[8px] bg-rd-night p-7 sm:flex-row sm:items-center xl:mt-7">
          <span className="grid size-12 shrink-0 place-items-center rounded-[8px] bg-rd-accent text-white">
            <Zap className="size-6 fill-current" />
          </span>
          <p className="text-[14px] leading-8 text-white/85">
            هدف در Blitz این نیست که زبان‌آموز فقط «معنی کلمه را بلد باشد»؛ هدف این است که زبان‌آموز بداند آن را
            <span className="mx-1.5 font-black-fa text-rd-sky2">واقعاً چگونه به کار می‌برد</span> — Blitz یعنی
            تبدیل دانش زبان به کاربرد واقعی زبان.
          </p>
        </div>
      </RdWrap>
    </RdSection>
  );
}

/* --------------------- از DLL تا Blitz Method --------------------------- */

function DllToBlitz() {
  return (
    <RdSection id="about-dll">
      <RdBand className="top-0" />
      <RdWrap pb="pb-[62px] sm:pb-[72px] xl:pb-[79px]">
        <RdEyebrow num="03" label="خاستگاه علمی" className="ps-0" />
        <h2 className="mt-3 font-black-fa text-[22.8px] leading-[1.4] text-ink sm:text-[30px]">
          از DLL <span className="text-rd-title">تا Blitz Method</span>
        </h2>
        <p className="mt-3 max-w-2xl text-[13px] leading-6 text-ink-soft">
          چه چیزی از دوره‌های حرفه‌ای آموخته شد و چه چیزی از دل آن‌ها ساخته شد؟ — تبدیل آموخته‌های آکادمیک به یک
          سیستم اجرایی برای کلاس واقعی:
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:mt-7">
          {dllToBlitz.map((row) => (
            <RdCard key={row.dll.de} className="flex flex-col gap-3 p-5" radius="rounded-[8px]">
              <div>
                <p className="text-[13px] font-extrabold text-ink" dir="ltr">
                  {row.dll.de}
                </p>
                <p className="mt-1 text-[12.5px] leading-6 text-ink-soft">{row.dll.fa}</p>
                <p className="mt-2 text-[10px] font-extrabold tracking-widest text-ink-faint">در DLL آموختم</p>
              </div>
              <div className="flex items-center gap-2" aria-hidden="true">
                <span className="h-px flex-1 bg-hairline-soft" />
                <ArrowLeft className="size-4 rotate-180 text-rd-accent" />
                <span className="h-px flex-1 bg-hairline-soft" />
              </div>
              <div className="rounded-[8px] border border-hairline-soft bg-canvas-soft/60 p-4">
                <p className="text-[13px] font-extrabold text-ink" dir="ltr">
                  {row.blitz.de}
                </p>
                <p className="mt-1 text-[12.5px] leading-6 text-ink-soft">{row.blitz.fa}</p>
                <p className="mt-2 text-[10px] font-extrabold tracking-widest text-rd-accent">در Blitz ساختم</p>
              </div>
            </RdCard>
          ))}
        </div>
        <p className="mt-8 inline-flex items-center gap-2 rounded-full bg-rd-night px-5 py-2.5 text-[13px] font-bold text-white">
          <Award className="size-4 text-rd-sky2" />
          نتیجه: زبان‌آموزی که واقعاً می‌تواند آلمانی صحبت کند.
        </p>
      </RdWrap>
    </RdSection>
  );
}

/* ------------------ مدارک و ارزیابی‌های حرفه‌ای ------------------------- */

const CRED_ICONS = [GraduationCap, BadgeCheck, BookMarked, Languages, Zap];

function Credentials() {
  return (
    <RdSection id="about-credentials">
      <RdBand className="top-0" />
      <RdWrap pb="pb-[62px] sm:pb-[72px] xl:pb-[79px]">
        <div className="mx-auto max-w-2xl text-center">
          <RdEyebrow num="04" label="اعتبار" className="mx-auto" />
          <h2 className="mt-3 font-black-fa text-[22.8px] leading-[1.4] text-ink sm:text-[30px]">
            پشتوانه علمی <span className="text-rd-title">یک آموزش تخصصی</span>
          </h2>
          <p className="mt-3 text-[13px] leading-6 text-ink-soft">
            هر مدرک، یک بخش از روش امروز را ساخته — از اصول تدریس و واژگان و تلفظ تا زبان حقوقی و هوش مصنوعی.
          </p>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:mt-7 xl:gap-5">
          {aboutCredentials.map((c, i) => {
            const Icon = CRED_ICONS[i % CRED_ICONS.length];
            return (
              <figure key={c.de} className="flex">
                <RdCard className="flex w-full flex-col p-6" marks radius="rounded-[8px]">
                  <div className="flex items-center justify-between">
                    <span className="rd-inside grid size-10 place-items-center rounded-[8px] bg-white text-rd-accent">
                      <Icon className="size-5" />
                    </span>
                    <span className="rounded-full bg-canvas-soft px-3 py-1 text-[10.5px] font-black-fa text-navy-deep">{c.tag}</span>
                  </div>
                  <figcaption className="mt-4 flex flex-1 flex-col">
                    <p className="text-[13.5px] font-extrabold leading-5 text-rd-title" dir="ltr">
                      {c.de}
                    </p>
                    <h3 className="mt-1.5 text-[14.5px] font-black-fa leading-6 text-ink">{c.title}</h3>
                    <p className="mt-2 flex-1 text-[12.5px] leading-6 text-ink-soft">{c.desc}</p>
                    <p className="mt-4 w-fit rounded-full border border-hairline-soft bg-canvas-soft/70 px-3 py-1 text-[11px] font-bold text-ink-soft">
                      {c.meta}
                    </p>
                  </figcaption>
                </RdCard>
              </figure>
            );
          })}
        </div>
        <p className="mt-8 flex items-center justify-center gap-2 text-center text-xs text-ink-soft">
          <Award className="size-4 text-rd-accent" />
          مستندات کامل این مسیر، به‌صورت پست‌های آموزشی در صفحه اینستاگرام کلینیک منتشر می‌شود.
        </p>
      </RdWrap>
    </RdSection>
  );
}

/* ------------------ چرا فقط لغت درس نمی‌دهیم؟ --------------------------- */

function ChunkWhy() {
  return (
    <RdSection id="about-chunk">
      <RdBand className="top-0" />
      <RdWrap pb="pb-[62px] sm:pb-[72px] xl:pb-[79px]">
        <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <RdEyebrow num="05" label="منطق چانک" className="ps-0" />
            <h2 className="mt-3 font-black-fa text-[22.8px] leading-[1.4] text-ink sm:text-[30px]">
              چرا در Blitz <span className="text-rd-title">فقط لغت درس نمی‌دهیم؟</span>
            </h2>
            <div className="mt-6 space-y-3">
              <div className="flex items-center gap-3 rounded-[8px] bg-crimson-50 p-4">
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-crimson-500 text-white">
                  <X className="size-4" strokeWidth={3} />
                </span>
                <p dir="ltr" className="text-[14px]">
                  <span className="font-extrabold text-ink line-through decoration-crimson-400">Entscheidung</span>
                  <span className="ms-2 text-[12px] text-ink-soft">= تصمیم (به‌تنهایی بی‌استفاده)</span>
                </p>
              </div>
              <div className="flex items-center gap-3 rounded-[8px] bg-ok/10 p-4">
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-ok text-white">
                  <Check className="size-4" strokeWidth={3} />
                </span>
                <p dir="ltr" className="text-[14px]">
                  <span className="font-extrabold text-ink">eine Entscheidung treffen</span>
                  <span className="ms-2 text-[12px] text-ink-soft">= تصمیم گرفتن (چانک واقعی)</span>
                </p>
              </div>
            </div>
          </div>
          <p className="text-justify text-[14px] leading-8 text-ink-soft">
            چون دانستن معنی یک کلمه، به‌تنهایی برای صحبت کردن کافی نیست. در Blitz، زبان را به شکل چانک‌ها و
            ترکیب‌های واقعی یاد می‌گیرید — همان‌طور که آلمانی‌زبان‌ها از کودکی ذخیره می‌کنند. هر جلسه با ۵ تا ۸ چانک
            جدید شروع می‌شود و همان‌جا در رول‌پلی و سؤال‌های هدفمند تمرین می‌شود؛ نتیجه این است که جمله‌های شما از
            روز اول «شبیه آلمانی» می‌شود، نه ترجمه‌ای که از فارسی رد شده باشد.
          </p>
        </div>
      </RdWrap>
    </RdSection>
  );
}

/* ----------------------- جایگاه AI در Blitz ----------------------------- */

function AiBlitz() {
  return (
    <RdSection id="about-ai">
      <RdBand className="top-0" />
      <RdWrap pb="pb-[62px] sm:pb-[72px] xl:pb-[79px]">
        <EdcMark className="pointer-events-none absolute -bottom-14 -start-14 size-56 opacity-[0.05]" />
        <RdEyebrow num="06" label="فناوری" className="ps-0" />
        <h2 className="mt-3 font-black-fa text-[22.8px] leading-[1.4] text-ink sm:text-[30px]">
          AI قرار نیست <span className="text-rd-title">جای مدرس را بگیرد</span>
        </h2>
        <p className="mt-3 max-w-2xl text-[13px] leading-6 text-ink-soft">
          AI برای من یک ابزار قدرتمند برای طراحی آموزش است، نه جایگزین مدرس — دقیقاً در پنج جایگاه:
        </p>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:mt-7 xl:gap-5">
          {blitzAiUses.map((u, i) => (
            <li key={u.title} className="flex">
              <RdCard className="flex w-full items-start gap-3 p-5" radius="rounded-[8px]">
                <span className="grid size-9 shrink-0 place-items-center rounded-[8px] bg-rd-deep text-[13px] font-black-fa text-white">
                  {faNum(i + 1)}
                </span>
                <div>
                  <p className="text-[13.5px] font-black-fa text-ink">{u.title}</p>
                  <p className="mt-1 text-[12.5px] leading-6 text-ink-soft">{u.desc}</p>
                </div>
              </RdCard>
            </li>
          ))}
        </ul>
      </RdWrap>
    </RdSection>
  );
}

/* ------------------------------ گاه‌شمار -------------------------------- */

function Milestones() {
  return (
    <RdSection id="about-milestones">
      <RdBand className="top-0" />
      <RdWrap pb="pb-[62px] sm:pb-[72px] xl:pb-[79px]">
        <div className="mx-auto max-w-2xl text-center">
          <RdEyebrow num="07" label="گاه‌شمار" className="mx-auto" />
          <h2 className="mt-3 font-black-fa text-[22.8px] leading-[1.4] text-ink sm:text-[30px]">
            از کلاس کوچک <span className="text-rd-title">تا کلینیک</span>
          </h2>
        </div>
        <ol className="mx-auto mt-10 max-w-3xl space-y-0 border-s-2 border-hairline-soft ps-8">
          {aboutMilestones.map((m, i) => (
            <li key={m.year} className={`relative pb-8 ${i === aboutMilestones.length - 1 ? "pb-0" : ""}`}>
              <span className="absolute -start-[41px] top-0 grid size-7 place-items-center rounded-full bg-rd-deep font-black-fa text-[10px] text-white ring-4 ring-white">
                {faNum(i + 1)}
              </span>
              <div className="rounded-[8px] border border-hairline-soft bg-canvas-soft/60 p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-[15px] font-black-fa text-ink">{m.title}</h3>
                  <span className="rounded-full bg-white px-3 py-1 text-[12px] font-black-fa text-rd-accent" dir="ltr">
                    {m.year}
                  </span>
                </div>
                <p className="mt-2 text-[13.5px] leading-7 text-ink-soft">{m.desc}</p>
              </div>
            </li>
          ))}
        </ol>
      </RdWrap>
    </RdSection>
  );
}

/* ------------------------------ CTA پایانی ------------------------------ */

function FinalCta() {
  return (
    <RdSection id="about-cta">
      <RdBand className="top-0" />
      <RdWrap pb="pb-[62px] sm:pb-[72px] xl:pb-[79px]">
        <div className="rd-inside relative overflow-hidden rounded-[8px] bg-white p-8 text-center sm:p-12">
          <EdcMark className="pointer-events-none absolute -top-10 -start-10 size-40 opacity-[0.05]" />
          <Quote className="mx-auto size-8 rotate-180 text-rd-accent" />
          <h2 className="mt-4 text-[22px] font-black-fa leading-[1.5] text-ink sm:text-[26px]">
            «آموزش باید مثل یک درمان باشد — دقیق، شخصی و قابل اندازه‌گیری.»
          </h2>
          <p className="mt-2 text-[13px] font-black-fa text-ink-faint">دکتر المیرا معرفت‌پور</p>
          <p className="mx-auto mt-4 max-w-xl text-[13px] leading-7 text-ink-soft">
            مسیر شما از یک جلسه تعیین سطح رایگان شروع می‌شود؛ دقیقاً می‌فهمید در کدام سطح هستید و کدام مسیر برای
            هدف‌تان درست است.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <SiteLink
              href="/placement"
              className="inline-flex h-10 items-center gap-2 rounded-full bg-rd-deep px-7 text-[13px] font-extrabold text-white transition-colors hover:bg-navy-700"
            >
              رزرو تعیین سطح رایگان
              <ArrowLeft className="size-4" />
            </SiteLink>
            <SiteLink
              href="/contact"
              className="rd-inside inline-flex h-10 items-center gap-2 rounded-full bg-white px-6 text-[13px] text-ink transition-colors hover:bg-canvas-soft"
            >
              <Languages className="size-4 text-rd-accent" />
              تماس با کلینیک
            </SiteLink>
          </div>
        </div>
      </RdWrap>
    </RdSection>
  );
}

export function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="ABOUT EDC"
        title="درباره"
        accent="کلینیک"
        desc="۱۶ سال تجربه، بیش از ۱۰٬۰۰۰ شاگرد و یک ایده ثابت: زبان وقتی ارزش دارد که به کار و زندگی تبدیل شود — از زبان تا اشتغال در آلمان."
        breadcrumb={[{ label: "درباره ما" }]}
      />
      <Story />
      <Method />
      <DllToBlitz />
      <Credentials />
      <ChunkWhy />
      <AiBlitz />
      <Milestones />
      <FinalCta />
    </>
  );
}
