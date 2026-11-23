"use client";

import React from "react";
import {
  ChevronLeft,
  Instagram,
  Mail,
  MapPin,
  MessageCircle,
  Navigation,
  Phone,
  Send,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { EdcMark, SiteLink, scrollToId } from "@/components/site/shared";
import { CopyButton, PageHero } from "@/components/site/pages-shared";
import { RdBand, RdCard, RdEyebrow, RdSection, RdWrap } from "@/components/site/home";
import { contactAddress, contactChannels, contactFaqs, responseHours } from "@/lib/site-data";

const CHANNEL_ICON: Record<string, React.ElementType> = {
  phone: Phone,
  whatsapp: MessageCircle,
  telegram: Send,
  instagram: Instagram,
  email: Mail,
};

/* راه ارتباطی: یک ردیف متنی — عنوان بولد + مقدار سرمه‌ای تیترها (#060b75، به درخواست کاربر؛ قبلاً سبز بود) + یک خط توضیح */
function ChannelRow({ ch }: { ch: (typeof contactChannels)[number] }) {
  const Icon = CHANNEL_ICON[ch.id] ?? Phone;
  return (
    <div className="flex items-center gap-3 px-4 py-4">
      <span className="rd-inside grid size-10 shrink-0 place-items-center rounded-[8px] bg-white text-rd-accent">
        <Icon className="size-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[13.5px] font-bold leading-6 text-ink">
          {ch.label}:{" "}
          <a
            href={ch.href}
            target={ch.href.startsWith("http") ? "_blank" : undefined}
            rel="noreferrer"
            dir="ltr"
            className="ms-1 font-medium text-rd-title transition-colors hover:text-rd-title/80 hover:underline"
          >
            {ch.value}
          </a>
        </p>
        <p className="mt-0.5 text-[12px] leading-5 text-ink-soft">{ch.note}</p>
      </div>
      <CopyButton
        value={ch.ltr}
        label={`کپی ${ch.label}`}
        className="grid size-8 shrink-0 place-items-center rounded-[8px] border border-hairline-soft bg-white text-ink-soft transition-colors hover:bg-canvas-soft hover:text-ink"
      />
    </div>
  );
}

export function ContactPage() {
  return (
    <>
      {/* هیروی سرمه‌ای — هم‌ریتم هیروی همهٔ صفحات داخلی */}
      <PageHero
        eyebrow="CONTACT"
        title="راههای ارتباط"
        accent="با ما"
        desc="از هر طریقی که راحت‌ترید، با ما در ارتباط باشید. راه‌های ارتباطی مختلف در دسترس شماست و می‌تونید با یک کلیک وارد بشید یا اطلاعات تماس رو کپی کنید."
        breadcrumb={[{ label: "تماس با ما" }]}
      />

      {/* سکشن ۱ — راه‌های ارتباطی (راست، بدون استیکی) + ساعات پاسخگویی (چپ، استیکی) */}
      <RdSection id="channels" fadeTop>
        <RdBand className="top-0" />
        <RdWrap pb="pb-[62px] sm:pb-[72px] xl:pb-[79px]">
          <div className="grid gap-10 lg:grid-cols-[1.35fr_1fr]">
            <div>
              <RdEyebrow num="01" label="راه‌های ارتباطی" className="ps-0" />
              {/* همه راه‌های ارتباطی داخل یک کانتینر */}
              <div className="rd-inside mt-4 rounded-[8px] bg-white">
                <div className="divide-y divide-hairline-soft">
                  {contactChannels.map((ch) => (
                    <ChannelRow key={ch.id} ch={ch} />
                  ))}
                  {/* آدرس — مثل بقیه راه‌های ارتباطی، فقط آیکون مسیریاب رو به چپ */}
                  <div className="flex items-center gap-3 px-4 py-4">
                    <span className="rd-inside grid size-10 shrink-0 place-items-center rounded-[8px] bg-white text-rd-accent">
                      <MapPin className="size-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13.5px] font-bold leading-6 text-ink">
                        آدرس: <span>{contactAddress.lines[1]}</span>
                      </p>
                      <p className="mt-0.5 text-[12px] leading-5 text-ink-soft">محل برگزاری کلاس‌های حضوری</p>
                    </div>
                    <a
                      href={contactAddress.maps[0].url}
                      target="_blank"
                      rel="noreferrer"
                      aria-label="مسیریابی تا کلینیک روی نقشه"
                      title="مسیریابی روی نقشه"
                      className="grid size-8 shrink-0 place-items-center rounded-[8px] text-ink-soft transition-colors hover:bg-canvas-soft hover:text-ink"
                    >
                      <Navigation className="size-4 -scale-x-100" />
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* ساعات پاسخگویی — عنوان بیرون کانتینر، هم‌تراز ستون راست؛ ستون چپ استیکی */}
            <aside className="self-start lg:sticky lg:top-[80px]">
              <RdEyebrow num="02" label="ساعات پاسخگویی" className="ps-0" />
              <div className="rd-inside mt-4 rounded-[8px] bg-white p-4">
                <dl className="divide-y divide-hairline-soft">
                  {responseHours.map((h) => (
                    /* ستون‌بندی ثابت — روز و ساعت در همهٔ ردیف‌ها دقیقاً هم‌لبه (فیکس align) */
                    <div key={h.day} className="grid grid-cols-[1fr_auto] items-center gap-3 py-3">
                      <dt className="text-[13px] font-bold text-ink">{h.day}</dt>
                      <dd className="min-w-[96px] text-start text-[13px] font-bold tabular-nums text-ink-soft" dir="ltr">
                        {h.hours}
                      </dd>
                    </div>
                  ))}
                </dl>
                <p className="mt-3 px-1 text-[12px] leading-6 text-ink-soft">
                  پیام‌های خارج از ساعات کاری ذخیره می‌شود و اولین روز کاری پاسخ داده خواهد شد.
                </p>
              </div>

              <RdCard className="relative mt-8 overflow-hidden p-6" radius="rounded-[8px]">
                <EdcMark className="pointer-events-none absolute -top-6 -end-6 size-24 opacity-[0.08]" />
                <p className="text-[14px] font-bold text-ink">از کجا شروع کنم؟</p>
                <p className="mt-2 text-[12.5px] leading-6 text-ink-soft">
                  فرم تعیین سطح را پر کنید؛ مشاوره اولیه رایگان است و مسیر دقیق‌تان را می‌چینیم.
                </p>
                <SiteLink
                  href="/placement"
                  className="mt-4 inline-flex h-10 items-center rounded-full bg-rd-deep px-5 text-[13px] font-extrabold text-white transition-colors hover:bg-navy-700"
                >
                  تعیین سطح رایگان
                </SiteLink>
              </RdCard>
            </aside>
          </div>
        </RdWrap>
      </RdSection>

      {/* سکشن ۲ — سؤالات متداول تماس (مقدمه راست بدون استیکی، آکاردئون چپ استیکی) */}
      <RdSection id="contact-faq">
        <RdBand className="top-0" />
        <RdWrap pb="pb-[62px] sm:pb-[72px] xl:pb-[79px]">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.7fr]">
            <div>
              <RdEyebrow num="03" label="سؤالات متداول تماس" className="ps-0" />
              <h2 className="mt-3 font-black-fa text-[22.8px] leading-[1.4] text-ink sm:text-[30px]">
                پاسخ سؤالات رایج <span className="text-rd-title">اینجاست</span>
              </h2>
              <p className="mt-3 max-w-xs text-[13px] leading-7 text-ink-soft">
                هنوز سؤالی دارید؟ راه‌های ارتباطی بالای صفحه در دسترس شماست.
              </p>
              <button
                type="button"
                onClick={() => scrollToId("channels")}
                className="rd-inside mt-5 inline-flex h-10 items-center gap-2 rounded-full bg-white px-4 text-[13px] text-ink transition-colors hover:bg-canvas-soft"
              >
                مشاهده راه‌های ارتباطی
                <ChevronLeft className="size-3.5 text-ink-faint" />
              </button>
            </div>
            <div className="self-start lg:sticky lg:top-[80px]">
              <Accordion type="single" collapsible className="rd-inside rounded-[8px] bg-white px-6 py-3">
                {contactFaqs.map((f, i) => (
                  <AccordionItem key={i} value={`c-${i}`} className="border-hairline-soft">
                    <AccordionTrigger className="text-start text-[13px] font-bold text-ink hover:no-underline">
                      <span className="flex items-start gap-3 text-start">
                        <span className="dc-mono mt-px text-[11px] font-medium text-rd-accent" dir="ltr">
                          {String(i + 1).padStart(2, "0")}.
                        </span>
                        <span>{f.q}</span>
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="text-[13px] leading-7 text-ink-soft">{f.a}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </RdWrap>
      </RdSection>
    </>
  );
}
