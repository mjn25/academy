"use client";

/* ------------------------------------------------------------------ */
/*  منوی مشترک پنل مدیریت — در تمام صفحات مدیریت یکسان نمایش داده می‌شود */
/*  تا مدیر از هر صفحه‌ای به همه‌ی بخش‌ها دسترسی داشته باشد.              */
/* ------------------------------------------------------------------ */

import {
  LayoutDashboard,
  BookOpenCheck,
  Users,
  GraduationCap,
  ShoppingBag,
} from "lucide-react";
import type { PanelNavItem } from "@/components/panels/shell";

export const adminNav: PanelNavItem[] = [
  { key: "dash", label: "داشبورد", icon: LayoutDashboard, href: "/admin" },
  { key: "classes", label: "کلاس‌ها و دوره‌ها", icon: BookOpenCheck, href: "/admin/classes" },
  { key: "students", label: "دانشجویان", icon: Users, href: "/admin/students" },
  { key: "teachers", label: "اساتید", icon: GraduationCap, href: "/admin/teachers" },
  { key: "shop", label: "فروشگاه", icon: ShoppingBag, href: "/admin/shop" },
];

export const adminTitles: Record<string, string> = {
  dash: "داشبورد مدیریت",
  classes: "کلاس‌ها و دوره‌ها",
  students: "مدیریت دانشجویان",
  teachers: "مدیریت اساتید",
  shop: "مدیریت فروشگاه",
};

export const ADMIN_SHELL = {
  roleLabel: "پنل مدیریت",
  userName: "المیرا معرفت‌پور",
} as const;
