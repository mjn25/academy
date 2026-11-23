import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  metadataBase: new URL("https://elmira-deutsch-clinic.example.com"),
  title: "کلینیک تخصصی زبان آلمانی المیرا | Elmira Deutsch Clinic",
  description:
    "آموزش تمام سطوح زبان آلمانی از A1 تا B2؛ دوره‌های حضوری و آنلاین با تعیین سطح رایگان و گزارش پیشرفت — کلینیک تخصصی زبان آلمانی دکتر المیرا معرفت‌پور.",
  icons: { icon: "/images/edc/logo.png" },
  openGraph: {
    title: "کلینیک تخصصی زبان آلمانی المیرا",
    description: "آموزش تمام سطوح زبان آلمانی، دوره‌های حضوری و آنلاین — همه با گزارش پیشرفت.",
    images: ["/images/edc/logo.png"],
    siteName: "Elmira Deutsch Clinic",
    type: "website",
    locale: "fa_IR",
  },
};

export const viewport: Viewport = {
  themeColor: "#0b1633",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <body className="antialiased bg-background text-foreground min-h-screen flex flex-col">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
