import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  // اجازه درخواست‌های /_next/* از دامنه پیش‌نمایش (پروکسی Caddy) + IP/لوکال‌هاست؛
  // بدون این، HMR و اسکریپت‌های dev برای اورجین‌های دیگر بلاک می‌شوند و
  // دکمه‌های سایت در پیش‌نمایش غیرفعال به نظر می‌رسند (Next 16)
  allowedDevOrigins: ["**.*"],
};

export default nextConfig;
