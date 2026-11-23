"use client";

import React from "react";

/* ------------------------------------------------------------------------
   نشان‌های شبکه مشبک — سبک readme.com، با ایده صلیب (+) لوگوی EDC
   • MeshPlus  — علامت مثبت (+) روی تقاطع‌های شبکه؛ همان صلیب داخل حباب لوگو
   • MeshNode  — نقطه گره مربعی کوچک روی تقاطع‌ها
   • MeshCorners — چهار نقطه گره در گوشه‌های کانتینر (مرز «کاغذ شطرنجی»)
   ------------------------------------------------------------------------ */

export function MeshPlus({
  className = "size-[15px] text-navy-800",
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      className={className}
      style={style}
      aria-hidden="true"
      focusable="false"
    >
      <path d="M8 1.5v13M1.5 8h13" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

export function MeshNode({ className = "size-[5px] bg-navy-800" }: { className?: string }) {
  return <span aria-hidden="true" className={`block rounded-[1.5px] ${className}`} />;
}

/** دات مربعی فیروزه‌ای روی تقاطع شبکه — مثل دات‌های هیرو readme */
export function MeshDot({
  className = "size-1.5 rounded-[1px] bg-hero-dot",
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return <span aria-hidden="true" className={`block ${className}`} style={style} />;
}

/** چهار نقطه گره در گوشه‌های کانتینرِ دارای mesh-rails — والد باید relative باشد */
export function MeshCorners({ dark = false }: { dark?: boolean }) {
  const dot = dark ? "bg-white/45" : "bg-navy-800";
  return (
    <span aria-hidden="true" className="pointer-events-none absolute inset-0">
      <MeshNode className={`absolute -start-[2.5px] -top-[2.5px] size-[5px] ${dot}`} />
      <MeshNode className={`absolute -end-[2.5px] -top-[2.5px] size-[5px] ${dot}`} />
      <MeshNode className={`absolute -start-[2.5px] -bottom-[2.5px] size-[5px] ${dot}`} />
      <MeshNode className={`absolute -end-[2.5px] -bottom-[2.5px] size-[5px] ${dot}`} />
    </span>
  );
}
