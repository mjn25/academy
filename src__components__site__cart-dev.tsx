"use client";

import React from "react";
import { Wrench } from "lucide-react";
import { PageHero } from "@/components/site/pages-shared";
import { RdBand, RdSection, RdWrap } from "@/components/site/home";
import { SiteLink } from "@/components/site/shared";

/* سبد خرید — فعلاً «در حال توسعه» (درخواست کاربر). صفحهٔ کامل cart-page.tsx محفوظ مانده
   و بعد از فعال‌سازی خرید، همین مسیر /cart دوباره به آن وصل می‌شود */
export function CartDevPage() {
  return (
    <>
      <PageHero
        eyebrow="CART"
        title="سبد خرید"
        desc="این بخش به‌زودی فعال می‌شود — فعلاً خرید و ثبت سفارش غیرفعال است."
        breadcrumb={[{ label: "سبد خرید" }]}
      />
      <RdSection id="cart" fadeTop>
        <RdBand className="top-0" />
        <RdWrap pb="pb-[62px] sm:pb-[72px] xl:pb-[79px]">
          <div className="mx-auto max-w-[640px]">
            <div className="rd-inside rounded-[8px] bg-white p-8 text-center sm:p-12">
              <span className="mx-auto grid size-14 place-items-center rounded-full bg-rd-accent/10 text-rd-accent">
                <Wrench className="size-7" />
              </span>
              <h1 className="mt-4 font-black-fa text-[18px] text-ink">سبد خرید در حال توسعه است</h1>
              <p className="mx-auto mt-2 max-w-[420px] text-[13px] leading-6 text-ink-soft">
                خرید دوره‌ها و کتاب‌ها به‌زودی از همین‌جا فعال می‌شود. تا آن زمان برای ثبت‌نام و مشاوره با ما در تماس باشید.
              </p>
              <SiteLink
                href="/contact"
                className="mt-5 inline-flex h-10 items-center gap-2 rounded-full bg-rd-deep px-6 text-[13px] font-extrabold text-white transition-colors hover:bg-navy-700"
              >
                تماس با ما
              </SiteLink>
            </div>
          </div>
        </RdWrap>
      </RdSection>
    </>
  );
}
