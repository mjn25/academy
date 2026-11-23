"use client";

import React from "react";
import { LogIn } from "lucide-react";
import { PageHero } from "@/components/site/pages-shared";
import { RdBand, RdSection, RdWrap } from "@/components/site/home";
import { LoginSheet } from "@/components/site/login-sheet";

/* مسیر /login — پنجرهٔ ورود خودکار باز می‌شود (ورود با کد پیامکی، بدون ثبت‌نام — درخواست کاربر) */
export function LoginPage() {
  const [open, setOpen] = React.useState(true);
  return (
    <>
      <PageHero
        eyebrow="LOGIN"
        title="ورود به"
        accent="حساب کاربری"
        desc="پنجرهٔ ورود به‌صورت خودکار باز شده است؛ اگر بسته شده، با دکمهٔ زیر دوباره بازش کنید."
        breadcrumb={[{ label: "ورود" }]}
      />
      <RdSection id="login-main" fadeTop>
        <RdBand className="top-0" />
        <RdWrap pb="pb-[62px] sm:pb-[72px] xl:pb-[79px]">
          <div className="rd-inside mx-auto max-w-[560px] rounded-[8px] bg-white p-8 text-center sm:p-10">
            <p className="font-black-fa text-ink">پنجرهٔ ورود بسته است؟</p>
            <p className="mt-1.5 text-[12.5px] leading-6 text-ink-soft">
              با باز کردن دوبارهٔ پنجره، با شمارهٔ موبایل و کد پیامکی وارد شوید؛ پس از ورود، از دکمهٔ حساب در هدر به داشبورد بروید.
            </p>
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="mt-5 inline-flex h-10 items-center gap-2 rounded-full bg-rd-deep px-6 text-[13px] font-extrabold text-white transition-colors hover:bg-navy-700"
            >
              <LogIn className="size-4" />
              باز کردن پنجرهٔ ورود
            </button>
          </div>
        </RdWrap>
      </RdSection>
      <LoginSheet open={open} onOpenChange={setOpen} />
    </>
  );
}
