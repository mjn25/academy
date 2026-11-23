"use client";

import React from "react";
import { ArrowLeft, BookOpenText, Check, MessageCircle, Minus, Plus, Share2, ShoppingBag } from "lucide-react";
import { shopProducts, formatToman, type ShopProduct } from "@/lib/site-data";
import { PageHero, faNum } from "@/components/site/pages-shared";
import { RdBand, RdCard, RdLabel, RdSection, RdWrap } from "@/components/site/home";
import { SiteLink } from "@/components/site/shared";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/lib/cart-context";

/* مشاوره واتساپ درباره همین کتاب */
function productWaLink(title: string) {
  const text = encodeURIComponent(`سلام! درباره کتاب «${title}» (/shop) سؤال دارم.`);
  return `https://wa.me/989120000000?text=${text}`;
}

/* کارت محصول فروشگاه — هم‌الگوی کارت دوره‌ها (درخواست کاربر): RdCard با قاب چهارمربعی،
   تصویر ۱۶:۹، چیپ مونو برچسب، عنوان، توضیح دومخط، چیپ‌ها، RdLabel و قیمت + دکمهٔ جزئیات */
function ProductCard({ p, n }: { p: ShopProduct; n: string }) {
  const off = p.oldPrice ? Math.round((1 - p.price / p.oldPrice) * 100) : 0;
  return (
    <RdCard
      className="group flex min-w-0 flex-col p-2 transition-colors hover:bg-canvas-soft/70 sm:p-3"
      marks
      radius="rounded-[8px]"
    >
      <div className="relative overflow-hidden rounded-[8px]">
        <SiteLink href={`/shop/${p.id}`} ariaLabel={p.title}>
          <img src={p.image} alt={p.title} className="aspect-[16/9] w-full object-cover" loading="lazy" />
        </SiteLink>
        {off > 0 && (
          /* بج ریز تخفیف — کوچک‌تر از قبل (درخواست کاربر) */
          <span className="absolute start-3 top-3 rounded-full bg-brand-500 px-2 py-0.5 text-[9.5px] font-extrabold text-navy-900">
            {faNum(off)}٪ تخفیف
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col px-2.5 pt-2 sm:px-3.5 sm:pt-3">
        <div className="flex items-center justify-between">
          {/* تگ محصول — فونت فارسی عادی (مونو برای فارسی ناخوانا بود — درخواست کاربر) */}
          <span
            className="rd-inside rounded-[8px] px-3 py-1.5 text-[12.5px] font-bold text-rd-accent max-sm:px-2.5 max-sm:py-1 max-sm:text-[12px]"
          >
            {p.tag}
          </span>
          <span className="dc-mono text-[10px] font-medium tracking-[0.18em] text-ink-faint max-sm:text-[9px]" dir="ltr">
            EDC SHOP
          </span>
        </div>
        <h3 className="mt-2 min-h-[2.5rem] line-clamp-2 text-[14px] font-black-fa leading-5 text-ink sm:mt-3 sm:min-h-[3rem] sm:text-[15px] sm:leading-6">
          {p.title}
        </h3>
        <p className="mt-1 line-clamp-2 text-[13px] leading-6 text-ink-soft max-sm:text-[12px] max-sm:leading-5">
          {p.desc}
        </p>
        <ul className="mt-2.5 flex flex-wrap gap-1.5 sm:mt-3">
          {["ارسال سراسری", "پرداخت آنلاین"].map((chip) => (
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
        <RdLabel code="PRD" n={n} className="mb-2 sm:mb-3" />
        <div className="flex items-center justify-between gap-3 pb-1.5">
          <div className="min-w-0 leading-tight">
            <p className="whitespace-nowrap text-[17.5px] font-black-fa text-ink max-sm:text-[15.5px]">
              {formatToman(p.price)}
              <span className="ms-1 text-[10px] font-normal text-ink-faint">تومان</span>
            </p>
            {p.oldPrice ? (
              <p className="dc-mono mt-0.5 truncate text-right text-[12px] text-ink-faint line-through" dir="ltr">
                {formatToman(p.oldPrice)}
              </p>
            ) : null}
          </div>
          <SiteLink
            href={`/shop/${p.id}`}
            className="rd-inside flex h-10 items-center gap-1.5 rounded-full px-4 text-[13px] font-bold text-ink transition-colors hover:bg-canvas-soft max-sm:h-9 max-sm:px-3.5 max-sm:text-[12px]"
          >
            جزئیات محصول
            <ArrowLeft className="size-3.5 text-ink-faint" />
          </SiteLink>
        </div>
      </div>
    </RdCard>
  );
}

export function ShopPage() {
  const products = shopProducts;

  return (
    <>
      <PageHero
        eyebrow="SHOP"
        title="فروشگاه"
        accent="منابع آموزشی"
        desc="کتاب‌ها، جزوه‌ها و منابع تمرینی هماهنگ با روش Blitz — همه با امکان پرداخت آنلاین و ارسال به سراسر کشور."
        breadcrumb={[{ label: "فروشگاه" }]}
      />
      <RdSection id="shop-index" fadeTop>
        <RdBand className="top-0" />
        <RdWrap pb="pb-[62px] sm:pb-[72px] xl:pb-[79px]">
          <div id="shop-product-list" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-5">
            {products.map((p, i) => (
              <ProductCard key={p.id} p={p} n={faNum(i + 1)} />
            ))}
          </div>
        </RdWrap>
      </RdSection>
    </>
  );
}

/* ------------------------ صفحهٔ محصول (داخل‌صفحهٔ هر کارت) ------------------------ */

export function ShopProductPage({ id }: { id: string }) {
  const { toast } = useToast();
  const { add } = useCart();
  /* تعداد انتخابی برای «افزودن تعداد به سبد» (درخواست کاربر) */
  const [qty, setQty] = React.useState(1);
  const p = shopProducts.find((x) => x.id === id);

  if (!p) {
    return (
      <>
        {/* هیروسکشن حذف شد (درخواست کاربر) — مثل صفحهٔ محصول */}
        <RdSection id="shop-not-found" fadeTop>
          <RdBand className="top-0" />
          <RdWrap pb="pb-[62px] sm:pb-[72px] xl:pb-[79px]">
            <div className="rd-inside rounded-[8px] bg-white p-8 text-center sm:p-10">
              <p className="font-black-fa text-ink">این محصول در فهرست فروشگاه نیست.</p>
              <SiteLink
                href="/shop"
                className="mt-5 inline-flex h-10 items-center gap-2 rounded-full bg-rd-deep px-6 text-[13px] font-extrabold text-white transition-colors hover:bg-navy-700"
              >
                بازگشت به فروشگاه
                <ArrowLeft className="size-4" />
              </SiteLink>
            </div>
          </RdWrap>
        </RdSection>
      </>
    );
  }

  const off = p.oldPrice ? Math.round((1 - p.price / p.oldPrice) * 100) : 0;
  const related = shopProducts.filter((x) => x.id !== p.id).slice(0, 3);

  /* افزودن به سبد — با تعداد انتخابی کاربر؛ ثبت سفارش در /cart ادامه می‌یابد */
  const addToCart = () => {
    add({ type: "book", id: p.id, title: p.title, price: p.price, image: p.image }, qty);
    toast({ title: "به سبد خرید اضافه شد ✔", description: p.title });
  };

  /* سرتیتر سکشن — هم‌الگوی CourseHead پروفایل دوره */
  const ProductHead = ({ icon, title }: { icon: React.ReactNode; title: string }) => (
    <div className="flex items-center gap-3">
      <span className="rd-inside grid size-10 shrink-0 place-items-center rounded-[8px] bg-white text-rd-accent">
        <span className="[&_svg]:size-4">{icon}</span>
      </span>
      <h2 className="font-black-fa text-[16px] text-ink">{title}</h2>
    </div>
  );

  /* استپر تعداد — الگوی استپر فروشگاه‌ها: + راست، عدد وسط، − چپ (RTL) */
  const qtyStepper = (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        onClick={() => setQty((q) => Math.min(10, q + 1))}
        aria-label="افزایش تعداد"
        className="rd-inside grid size-9 place-items-center rounded-full bg-white text-ink transition-colors hover:bg-canvas-soft"
      >
        <Plus className="size-4" />
      </button>
      <span className="min-w-[52px] text-center text-[13.5px] font-black-fa text-ink">{faNum(qty)} عدد</span>
      <button
        type="button"
        onClick={() => setQty((q) => Math.max(1, q - 1))}
        aria-label="کاهش تعداد"
        className="rd-inside grid size-9 place-items-center rounded-full bg-white text-ink transition-colors hover:bg-canvas-soft"
      >
        <Minus className="size-4" />
      </button>
    </div>
  );

  return (
    <>
      {/* هیروسکشن صفحه محصول حذف شد (درخواست کاربر) — ساختار دقیقاً مثل پروفایل دوره:
          گرید محتوا + کارت قیمت چسبان، تصویر ۵۰٪ کوچک‌تر، سکشن «معرفی کتاب» و تعداد به سبد */}
      <RdSection id="shop-product" fadeTop>
        <RdBand className="top-0" />
        {/* معرفی فشرده محصول برای روشن‌شدن هویت و کاربرد آن از ابتدای صفحه */}
        <RdWrap pb="pb-[110px] lg:pb-[62px] xl:pb-[79px]">
        <section className="mb-5 rounded-[8px] border border-hairline-soft bg-white p-4 sm:p-5">
          <span className="inline-flex rounded-full bg-canvas-soft px-3 py-1 text-[11px] font-bold text-rd-accent">{p.tag}</span>
          <h1 className="mt-3 font-black-fa text-[19px] leading-8 text-ink sm:text-[24px]">{p.title}</h1>
          <p className="mt-1.5 max-w-4xl text-[12.5px] leading-7 text-ink-soft sm:text-[13px]">{p.desc}</p>
          <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-ink-soft">
            <span className="rounded-full bg-canvas-soft px-3 py-1">ارسال سراسری</span>
            <span className="rounded-full bg-canvas-soft px-3 py-1">افزودن به سبد خرید</span>
          </div>
        </section>
        <div className="grid gap-6 lg:grid-cols-[1fr_340px] lg:items-start">
          <div className="min-w-0 space-y-5">
            {/* کارت رسانه محصول — هم‌الگوی کارت ویدئوی پروفایل دوره؛ تصویر ۵۰٪ کوچک‌تر (وسط‌چین) */}
            <RdCard className="p-2" marks radius="rounded-[8px]">
              <div className="flex items-center justify-between gap-3 px-1.5 pb-2 pt-1 sm:px-2.5">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="rd-inside grid size-10 shrink-0 place-items-center rounded-[8px] text-rd-accent">
                    <ShoppingBag className="size-5" />
                  </span>
                  <div className="min-w-0">
                    <h2 className="truncate text-[14px] font-black-fa text-ink max-sm:text-[13px]">{p.title}</h2>
                    <p className="mt-0.5 text-[10.5px] text-ink-faint">معرفی کتاب فروشگاه کلینیک</p>
                  </div>
                </div>
                <button
                  type="button"
                  title="کپی لینک محصول"
                  onClick={() => {
                    try {
                      navigator.clipboard.writeText(window.location.href);
                    } catch {}
                    toast({ title: "لینک محصول کپی شد ✔", description: "می‌توانید آن را برای دوستانتان بفرستید." });
                  }}
                  className="rd-inside grid size-9 shrink-0 place-items-center rounded-full bg-white text-ink transition-colors hover:bg-canvas-soft"
                >
                  <Share2 className="size-4" />
                </button>
              </div>
              <div className="relative overflow-hidden rounded-[8px] bg-canvas-soft/50 py-4">
                {/* تصویر ۵۰٪ کوچک‌تر از پروفایل دوره — وسط‌چین با عرض نصف کارت */}
                <div className="relative mx-auto w-full max-w-[72%] max-sm:max-w-[92%]">
                  <img src={p.image} alt={p.title} className="aspect-[4/3] w-full rounded-[8px] object-cover" />
                  {off > 0 && (
                    <span className="absolute start-3 top-3 rounded-full bg-brand-500 px-2 py-0.5 text-[9.5px] font-extrabold text-navy-900">
                      {faNum(off)}٪ تخفیف
                    </span>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap gap-2 px-1.5 pb-1 pt-2.5 sm:px-2.5">
                {["ارسال سراسری", "پرداخت آنلاین"].map((chip) => (
                  <span key={chip} className="rd-inside rounded-full bg-white px-3 py-1 text-[11px] font-bold text-ink-soft">
                    {chip}
                  </span>
                ))}
              </div>
            </RdCard>

            {/* معرفی کتاب — توضیح کامل + چک‌لیست ویژگی‌ها، هم‌الگوی سکشن «درباره‌ی دوره» */}
            <section id="book-intro" className="rd-inside scroll-mt-28 rounded-[8px] bg-white p-5 sm:p-6">
              <ProductHead icon={<BookOpenText className="size-5" />} title="معرفی کتاب" />
              <p className="mt-4 text-justify text-[12.5px] leading-7 text-ink-soft">{p.long}</p>
              <div className="my-4 border-t border-hairline-soft" />
              <ul className="mt-2 space-y-2">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-[12.5px] leading-7 text-ink">
                    <span className="mt-2.5 shrink-0 text-rd-accent">
                      <Check className="size-3.5" strokeWidth={2.5} />
                    </span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <RdLabel code="BOK" n="01" className="mt-4" />
            </section>
          </div>

          {/* کارت خرید — جدا و چسبان (فقط دسکتاپ؛ در موبایل نوار ثابت پایین صفحه) */}
          <div className="hidden lg:block lg:sticky lg:top-[80px]">
            <RdCard className="p-5" marks radius="rounded-[8px]">
              <h2 className="font-black-fa text-[16px] leading-7 text-ink">{p.title}</h2>
              <div className="mt-2.5 flex items-center justify-between gap-2">
                <span className="rd-inside rounded-[8px] px-3 py-1 text-[12.5px] font-bold text-rd-accent">{p.tag}</span>
                {off > 0 && (
                  <span className="rounded-full bg-brand-500 px-2 py-0.5 text-[9.5px] font-extrabold text-navy-900">
                    {faNum(off)}٪ تخفیف
                  </span>
                )}
              </div>
              {/* قیمت — ردیف هم‌ریتم کارت دورهٔ صفحهٔ اصلی */}
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-hairline-soft pt-3.5">
                <div className="min-w-0 leading-tight">
                  <p className="whitespace-nowrap text-[17.5px] font-black-fa text-ink">
                    {formatToman(p.price)}
                    <span className="ms-1 text-[10px] font-normal text-ink-faint">تومان</span>
                  </p>
                  {p.oldPrice ? (
                    <p className="dc-mono mt-0.5 text-[12px] text-ink-faint line-through" dir="ltr">
                      {formatToman(p.oldPrice)}
                    </p>
                  ) : null}
                </div>
              </div>
              {/* افزودن تعداد به سبد (درخواست کاربر) */}
              <div className="mt-3.5 flex items-center justify-between gap-3 rounded-[8px] bg-canvas-soft/60 p-2.5">
                <span className="text-[12.5px] font-bold text-ink">تعداد</span>
                {qtyStepper}
              </div>
              <button
                type="button"
                onClick={addToCart}
                className="mt-3.5 inline-flex h-10 w-full items-center justify-center gap-2 rounded-full bg-rd-deep text-[13px] font-extrabold text-white transition-colors hover:bg-navy-700 active:scale-[0.985]"
              >
                <ShoppingBag className="size-4" />
                افزودن به سبد خرید
              </button>
              <a
                href={productWaLink(p.title)}
                target="_blank"
                rel="noreferrer"
                className="rd-inside mt-2 inline-flex h-10 w-full items-center justify-center gap-2 rounded-full text-[13px] font-bold text-ink transition-colors hover:bg-canvas-soft"
              >
                <MessageCircle className="size-4 text-ink-faint" />
                مشاوره واتساپ دربارهٔ این کتاب
              </a>
              <RdLabel code="PAY" n="01" className="mt-4" />
            </RdCard>
          </div>
        </div>

        {/* سایر منابع فروشگاه — گرید کارت‌های محصول */}
        <div id="shop-related" className="scroll-mt-28 pt-8">
          <h2 className="font-black-fa text-[16px] text-ink">سایر منابع فروشگاه</h2>
          <div className="mt-3.5 grid gap-3.5 sm:mt-4 sm:grid-cols-2 lg:grid-cols-3 xl:gap-5">
            {related.map((rp, i) => (
              <ProductCard key={rp.id} p={rp} n={faNum(i + 1)} />
            ))}
          </div>
        </div>
        </RdWrap>
      </RdSection>

      {/* قیمت + تعداد + افزودن — فیکس در انتهای صفحه در موبایل؛ هم‌الگوی پروفایل دوره */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-hairline-soft bg-white/95 px-2.5 pb-[max(10px,env(safe-area-inset-bottom))] pt-2.5 backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-1">
          <div className="min-w-0 leading-tight">
            <p className="text-[10px] text-ink-faint">هزینه</p>
            <p className="whitespace-nowrap text-[13px] font-black-fa leading-6 text-ink">
              {formatToman(p.price)} <span className="text-[10px] font-bold text-ink-soft">تومان</span>
            </p>
          </div>
          <div className="shrink-0 [&_button]:size-8 [&_span]:min-w-[44px] [&_span]:text-[12px]">{qtyStepper}</div>
          <button
            type="button"
            onClick={addToCart}
            className="inline-flex h-10 shrink-0 items-center justify-center gap-1 rounded-full bg-rd-deep px-2.5 text-[11.5px] font-extrabold text-white transition-colors hover:bg-navy-700 active:scale-[0.985]"
          >
            <ShoppingBag className="size-4" />
            افزودن
          </button>
        </div>
      </div>
    </>
  );
}
