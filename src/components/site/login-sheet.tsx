"use client";

import React from "react";
import { KeyRound, Phone } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth, normalizePhone, DEMO_OTP } from "@/lib/auth-context";

type Step = "mobile" | "code";

/* ورود با کد پیامکی — دسکتاپ: مدال وسط صفحه؛ موبایل/تبلت کوچک: باتم‌شیت.
   هر شمارهٔ موبایل معتبر پذیرفته می‌شود؛ شماره‌های ثبت‌شدهٔ دمو نقش خودشان را دارند؛
   کد پیامکی دمو همه: ۱۲۳۴. پس از ورود، کاربر روی همان صفحه می‌ماند — دکمهٔ حساب در هدر
   دراپ‌داون «ورود به داشبورد» و «خروج» را باز می‌کند (درخواست کاربر — نسخهٔ ۳۸) */
export function LoginSheet({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { toast } = useToast();
  const { login } = useAuth();
  const isMobile = useIsMobile();
  const [step, setStep] = React.useState<Step>("mobile");
  const [phone, setPhone] = React.useState("");
  const [pending, setPending] = React.useState("");
  const [code, setCode] = React.useState("");

  /* مرحلهٔ ۱ — بررسی شماره و «ارسال کد پیامکی» — هر شمارهٔ موبایل معتبر پذیرفته می‌شود */
  const submitPhone = (e: React.FormEvent) => {
    e.preventDefault();
    const p = normalizePhone(phone);
    if (!p) {
      toast({ title: "شمارهٔ موبایل معتبر نیست — مثل ۰۹۱۲۰۰۰۰۰۰۰.", variant: "destructive" });
      return;
    }
    setPending(p);
    setStep("code");
    toast({ title: "کد پیامکی ارسال شد ✔", description: "در نسخهٔ دمو کد پیامکی ۱۲۳۴ است." });
  };

  /* مرحلهٔ ۲ — تأیید کد پیامکی و ورود به پنل نقش */
  const submitCode = (e: React.FormEvent) => {
    e.preventDefault();
    const norm = code
      .replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))
      .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)))
      .replace(/\D/g, "");
    if (!pending) {
      setStep("mobile");
      return;
    }
    if (norm !== DEMO_OTP) {
      toast({ title: "کد واردشده درست نیست.", description: "در نسخهٔ دمو کد پیامکی ۱۲۳۴ است.", variant: "destructive" });
      return;
    }
    const u = login(pending);
    if (!u) {
      toast({ title: "ورود انجام نشد — دوباره تلاش کنید.", variant: "destructive" });
      setStep("mobile");
      return;
    }
    toast({
      title: "خوش آمدید ✔",
      description: `${u.name} عزیز — ورود انجام شد؛ از دکمهٔ حساب در هدر وارد داشبورد شوید.`,
    });
    onOpenChange(false);
    setStep("mobile");
    setPhone("");
    setPending("");
    setCode("");
  };

  /* فرم مشترک — مرحلهٔ شماره یا مرحلهٔ کد؛ بین مدال و باتم‌شیت مشترک است */
  const form =
    step === "mobile" ? (
      <>
        <form onSubmit={submitPhone} aria-label="فرم ارسال کد ورود" className="space-y-3.5">
          <label className="block">
            <span className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-ink">
              <Phone className="size-3.5 text-ink-faint" />
              شمارهٔ موبایل
            </span>
            <input
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="۰۹۱۲ ۰۰۰ ۰۰۰۰"
              aria-label="شمارهٔ موبایل"
              className="h-11 w-full rounded-[8px] bg-white px-4 text-sm text-ink outline-none ring-1 ring-hairline-soft placeholder:text-ink-faint focus:ring-2 focus:ring-rd-accent/40"
            />
          </label>
          <button
            type="submit"
            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-full bg-rd-deep text-[13px] font-extrabold text-white transition-colors hover:bg-navy-700 active:scale-[0.99]"
          >
            ادامه و ارسال کد پیامکی
          </button>
        </form>
        <p className="mt-4 rounded-[8px] bg-canvas-soft/60 px-3.5 py-2.5 text-[11px] leading-5 text-ink-soft">
          با هر شمارهٔ موبایل معتبر وارد شوید؛ کد پیامکی نسخهٔ دمو ۱۲۳۴ است.
        </p>
      </>
    ) : (
      <form onSubmit={submitCode} aria-label="فرم تأیید کد پیامکی" className="space-y-3.5">
        <div className="rounded-[8px] bg-canvas-soft/60 px-3.5 py-2.5 text-center">
          <p className="text-[12px] leading-5 text-ink-soft">
            کد ۴ رقمی به شمارهٔ{" "}
            <span className="dc-mono font-bold text-ink" dir="ltr">
              {pending}
            </span>{" "}
            پیامک شد.
          </p>
          <button
            type="button"
            onClick={() => {
              setStep("mobile");
              setCode("");
            }}
            className="mt-1 text-[11px] font-bold text-rd-accent hover:underline"
          >
            تغییر شماره
          </button>
        </div>
        <label className="block">
          <span className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-ink">
            <KeyRound className="size-3.5 text-ink-faint" />
            کد پیامکی
          </span>
          <input
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/[^\d۰-۹٠-٩]/g, "").slice(0, 4))}
            placeholder="۱۲۳۴"
            aria-label="کد پیامکی"
            className="dc-mono h-11 w-full rounded-[8px] bg-white text-center text-[15px] tracking-[0.6em] text-ink outline-none ring-1 ring-hairline-soft placeholder:tracking-[0.2em] placeholder:text-ink-faint focus:ring-2 focus:ring-rd-accent/40"
          />
        </label>
        <button
          type="submit"
          className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-full bg-rd-deep text-[13px] font-extrabold text-white transition-colors hover:bg-navy-700 active:scale-[0.99]"
        >
          ورود به حساب
        </button>
        <p className="text-center text-[11px] leading-5 text-ink-faint">
          نسخهٔ دمو — کد پیامکی همهٔ حساب‌ها ۱۲۳۴ است.
        </p>
      </form>
    );

  /* دسکتاپ — مدال وسط صفحه */
  if (!isMobile) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-[400px] sm:max-w-[400px] gap-0 rounded-[12px] border-hairline-soft bg-white p-0 shadow-[0_24px_60px_-12px_rgba(0,3,63,0.25)]">
          <DialogHeader className="px-6 pt-5 text-start">
            <DialogTitle className="font-black-fa text-[16px] text-ink">ورود به حساب</DialogTitle>
            <DialogDescription className="text-[12px] leading-5 text-ink-soft">
              ورود با کد پیامکی — پس از ورود، از دکمهٔ حساب در هدر به داشبورد بروید.
            </DialogDescription>
          </DialogHeader>
          <div className="px-6 pb-6 pt-4">{form}</div>
        </DialogContent>
      </Dialog>
    );
  }

  /* موبایل / تبلت کوچک — باتم‌شیت از پایین */
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="mx-auto max-w-[560px] gap-0 rounded-t-[12px] border-hairline-soft bg-white p-0"
      >
        {/* دستگیرهٔ شیت */}
        <span aria-hidden="true" className="mx-auto mt-2.5 block h-1 w-10 rounded-full bg-hairline-soft" />
        <SheetHeader className="px-5 pt-3 text-start sm:px-6">
          <SheetTitle className="font-black-fa text-[16px] text-ink">ورود به حساب</SheetTitle>
          <SheetDescription className="text-[12px] leading-5 text-ink-soft">
            ورود با کد پیامکی — پس از ورود، از دکمهٔ حساب در هدر به داشبورد بروید.
          </SheetDescription>
        </SheetHeader>
        <div className="px-5 pb-8 pt-4 sm:px-6">{form}</div>
      </SheetContent>
    </Sheet>
  );
}
