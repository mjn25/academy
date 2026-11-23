"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

/* ----------------------------- Mini Router ----------------------------- */

type RouterValue = {
  path: string;
  navigate: (to: string) => void;
  back: () => void;
};

/**
 * مسیرهای داخلی پنل‌ها: /admin، /teacher، /student
 * آدرس عمومی پنل‌ها همیشه با پیشوند /panel است:
 *   /panel/admin/... ، /panel/teacher/... ، /panel/student/...
 * state داخلی روتر همیشه بدون پیشوند است؛ تبدیل فقط در pushState/popstate انجام می‌شود.
 */
export function isPanelPath(p: string) {
  return p.startsWith("/admin") || p.startsWith("/teacher") || p.startsWith("/student");
}

export function toInternal(p: string) {
  return p.startsWith("/panel/") ? p.slice("/panel".length) : p;
}

function toDisplay(internal: string) {
  return isPanelPath(internal) ? "/panel" + internal : internal;
}

const RouterContext = createContext<RouterValue>({ path: "/", navigate: () => {}, back: () => {} });

export function RouterProvider({
  children,
  initialPath,
}: {
  children: React.ReactNode;
  initialPath?: string;
}) {
  // مسیر اولیه از سرور می‌آید تا خروجی SSR با اولین رندر کلاینت یکی باشد
  const [path, setPath] = useState(initialPath ?? "/");

  // پشتیبانی از بارگذاری مستقیم آدرس — بعد از mount (بدون خطای hydration)
  React.useEffect(() => {
    const raw = window.location.pathname;
    const internal = toInternal(raw);
    if (isPanelPath(internal)) {
      // پنل همیشه با آدرس /panel/... دیده می‌شود
      if (!raw.startsWith("/panel")) {
        try {
          window.history.replaceState({}, "", toDisplay(internal));
        } catch {}
      }
      setPath(internal);
    } else {
      setPath(raw || "/");
    }
  }, []);

  // همگام‌سازی با دکمه‌های back/forward مرورگر
  React.useEffect(() => {
    const onPop = () => setPath(toInternal(window.location.pathname || "/"));
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const navigate = useCallback((to: string) => {
    /* مسیرهای عمومی پنل (/panel/...) به مسیر داخلی تبدیل می‌شوند تا RouterSwitch
       پنل را رندر کند — «پنل من» هدر و ورود پس از لاگین همین شکل لینک می‌دهند */
    const internal = toInternal(to);
    setPath((prev) => {
      if (prev !== internal) {
        try {
          window.history.pushState({}, "", toDisplay(internal));
        } catch {}
      }
      return internal;
    });
    try {
      window.scrollTo({ top: 0, behavior: "auto" });
    } catch {}
  }, []);

  const back = useCallback(() => {
    try {
      if (window.history.length > 1) {
        window.history.back();
        return;
      }
    } catch {}
    setPath("/");
    try {
      window.scrollTo({ top: 0, behavior: "auto" });
    } catch {}
  }, []);

  const value = useMemo(() => ({ path, navigate, back }), [path, navigate, back]);
  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>;
}

export function useRouter() {
  return useContext(RouterContext);
}

export function Link({
  href,
  children,
  className,
  onClick,
  ariaLabel,
  style,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  ariaLabel?: string;
  style?: React.CSSProperties;
}) {
  const { navigate } = useRouter();
  return (
    <a
      href={href}
      aria-label={ariaLabel}
      className={className}
      style={style}
      onClick={(e) => {
        e.preventDefault();
        onClick?.();
        navigate(href);
      }}
    >
      {children}
    </a>
  );
}
