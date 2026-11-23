"use client";

import React from "react";

/* حساب‌های کاربری دمو (localStorage) — ورود با کد پیامکی:
   چهار دسترسی ثابت با شمارهٔ ثبت‌شده + هر شمارهٔ موبایل معتبر دیگری
   به‌صورت حساب دانش‌آموز تازه‌وارد وارد می‌شود (رفع «لاگین کار نمی‌کند»):
   مدیر کلینیک (المیرا معرفت‌پور)، استاد، دانش‌آموز دارای دوره/کتاب و دانش‌آموز فقط-لاگین‌کرده.
   رمز مرحلهٔ دوم همهٔ حساب‌ها در نسخهٔ دمو همان کد پیامکی ۱۲۳۴ است */

export type AuthRole = "admin" | "teacher" | "student";

export type AuthUser = {
  name: string;
  phone: string;
  role: AuthRole;
  /** دانش‌آموز با دوره و کتاب — false یعنی فقط لاگین کرده و هیچ دوره یا کتابی ندارد */
  full?: boolean;
};

/** کد پیامکی دمو — در نسخهٔ واقعی از سرویس پیامک می‌آید */
export const DEMO_OTP = "1234";

/** چهار دسترسی دمو (شمارهٔ نرمال‌شده → حساب) — نام پنل ادمین: المیرا معرفت‌پور (درخواست کاربر) */
export const DEMO_ACCOUNTS: Record<string, { name: string; role: AuthRole; full?: boolean }> = {
  "09114004040": { name: "المیرا معرفت‌پور", role: "admin" },
  "09114005050": { name: "المیرا معرفت‌پور", role: "teacher" },
  "09114006060": { name: "سارا محمدی", role: "student", full: true },
  "09114007070": { name: "دانش‌آموز", role: "student", full: false },
};

/** برچسب فارسی هر نقش — برای توست خوش‌آمد و صفحهٔ دسترسی */
export const ROLE_FA: Record<AuthRole, string> = {
  admin: "مدیر کلینیک",
  teacher: "استاد",
  student: "دانش‌آموز",
};

/** آدرس ریشهٔ پنل هر نقش — مسیر عمومی با پیشوند /panel دیده می‌شود */
export const panelHref = (role: AuthRole) => `/panel/${role}`;

/** نرمال‌سازی شمارهٔ موبایل — ارقام فارسی/عربی و ۹۸ هم پذیرفته می‌شود */
export function normalizePhone(raw: string): string | null {
  const digits = raw
    .replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)))
    .replace(/\D/g, "");
  const withZero = digits.startsWith("98") && digits.length === 12 ? `0${digits.slice(2)}` : digits;
  if (/^09\d{9}$/.test(withZero)) return withZero;
  if (/^9\d{9}$/.test(withZero)) return `0${withZero}`;
  return null;
}

type AuthCtx = {
  user: AuthUser | null;
  /** ورود با شمارهٔ موبایل — نقش و نام از حساب‌های دمو خوانده می‌شود */
  login: (phone: string) => AuthUser | null;
  logout: () => void;
};

const AuthContext = React.createContext<AuthCtx>({
  user: null,
  login: () => null,
  logout: () => {},
});

const KEY = "edc-auth-user";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<AuthUser | null>(null);
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as AuthUser;
        /* سازگاری با حساب‌های قدیمی دمو — بدون نقش: دانش‌آموز تازه‌وارد */
        setUser(parsed.role ? parsed : { ...parsed, role: "student", full: false, phone: parsed.phone ?? "" });
      }
    } catch {
      /* localStorage در دسترس نیست — مهم نیست */
    }
  }, []);

  const login = (phone: string) => {
    /* شمارهٔ ثبت‌شده → حساب همان نقش؛ هر شمارهٔ معتبر دیگر → دانش‌آموز تازه‌وارد */
    const account = DEMO_ACCOUNTS[phone];
    const u: AuthUser = account
      ? { ...account, phone }
      : { name: "دانش‌آموز", role: "student", full: false, phone };
    setUser(u);
    try {
      localStorage.setItem(KEY, JSON.stringify(u));
    } catch {
      /* ignore */
    }
    return u;
  };

  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem(KEY);
    } catch {
      /* ignore */
    }
  };

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return React.useContext(AuthContext);
}
