"use client";

import React from "react";
import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  MessageSquare,
  Search,
  Send,
  Share2,
  Tag,
  User,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { EdcMark, SiteLink } from "@/components/site/shared";
import { CopyButton, MetaChip, PageHero, faNum } from "@/components/site/pages-shared";
import { RdBand, RdSection, RdSqFrame, RdWrap } from "@/components/site/home";
import { blogCategories, blogPosts, getSitePost, postComments } from "@/lib/site-data";
import type { SitePost } from "@/lib/site-data";

const PAGE_SIZE = 6;

/* هیروی وبلاگ و همهٔ صفحات داخلی از PageHero مشترک pages-shared می‌آید —
   شبکهٔ مربعی روشن + سلول سفید قاب‌گوشه‌دار + ابروی مونو + تیتر آبی + نوار مرز پایین */

/* رنگ ابروی دسته‌بندی هر کارت — به سبک برچسب‌های رنگی readme */
const catTone: Record<string, string> = {
  "یادگیری آلمانی": "var(--color-rd-accent)",
  "آزمون‌های رسمی": "var(--color-ok)",
  "بازار کار آلمان": "var(--color-warn)",
  "روش Blitz": "var(--color-ink, #101828)",
};

function CatEyebrow({ cat }: { cat: string }) {
  const tone = catTone[cat] ?? "var(--color-rd-accent)";
  /* برچسب متنی خالص بدون نشان — دقیقاً مثل PRODUCT NEWS در عکس مرجع */
  return (
    <span className="inline-block text-[11px] font-black-fa tracking-[0.04em]" style={{ color: tone }}>
      {cat}
    </span>
  );
}

/* ------------------------------ کارت مقاله — گرید تخت با خط ۱px ------------------------------ */

function PostCard({ p }: { p: SitePost }) {
  return (
    <SiteLink
      href={`/blog/${p.slug}`}
      className={`group flex flex-col bg-white p-5 pb-7 transition-colors hover:bg-canvas-soft/60 max-sm:flex-row max-sm:items-start max-sm:gap-3.5 max-sm:p-4 sm:p-7 sm:pb-9`}
    >
      {/* کاور — دسکتاپ: عریض ۱۶:۱۰ بالای کارت؛ موبایل: مربع ۱۰۴px در انتهای ردیف (چپ در RTL)
          مثل لیست مجلهٔ ریدمی که متن راست و تصویر چپ است */}
      <div className="relative shrink-0 overflow-hidden rounded-[10px] max-sm:order-last max-sm:size-[104px] max-sm:rounded-[8px] sm:w-full">
        <img
          src={p.image}
          alt={p.title}
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03] max-sm:size-full sm:aspect-[16/10] sm:w-full"
          loading="lazy"
        />
      </div>
      {/* ستون متن — دسته‌بندی، عنوان و متا زیر هم؛ در موبایل کنار تصویر */}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="mt-5 max-sm:mt-0">
          <CatEyebrow cat={p.category} />
        </div>
        <h3 className="mt-2.5 font-black-fa text-[17.5px] leading-[1.7] text-ink transition-colors group-hover:text-rd-accent max-sm:mt-1.5 max-sm:text-[15px] max-sm:leading-[1.65] sm:text-[19px]">
          {p.title}
        </h3>
        {/* متا در لبهٔ پایین کارت — مثل کارت‌های ریدمی بدون خلاصه؛ در موبایل نام نویسنده حذف
            می‌شود تا متا یک‌خطی بماند و کلمه‌ای تنها در انتهای خط آویزان نشود */}
        <p className="mt-auto pt-5 text-[12.5px] text-ink-faint max-sm:pt-2 max-sm:text-[11px]">
          <span className="max-sm:hidden">{p.author} · </span>
          {p.date} · {faNum(p.readTime)} دقیقه مطالعه
        </p>
      </div>
    </SiteLink>
  );
}

/* -------------------- صفحه‌بندی عددی با بیضی ---------------------------- */

function pageNumbers(total: number, current: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const chosen = [...new Set([1, total, current - 1, current, current + 1])]
    .filter((p) => p >= 1 && p <= total)
    .sort((a, b) => a - b);
  const out: (number | "…")[] = [];
  let prev = 0;
  for (const p of chosen) {
    if (prev && p - prev > 1) out.push("…");
    out.push(p);
    prev = p;
  }
  return out;
}

/* ------------------------------ صفحه وبلاگ ------------------------------ */

export function BlogIndex() {
  const [query, setQuery] = React.useState("");
  const [cat, setCat] = React.useState("همه");
  const [page, setPage] = React.useState(1);
  /* موبایل: فیلد جستجو با آیکون باز/بسته می‌شود — مدل ریدمی */
  const [searchOpen, setSearchOpen] = React.useState(false);

  const catCounts = React.useMemo(() => {
    const m = new Map<string, number>();
    for (const p of blogPosts) m.set(p.category, (m.get(p.category) ?? 0) + 1);
    return m;
  }, []);

  const filtered = React.useMemo(() => {
    const q = query.trim();
    const items = blogPosts.filter((p) => {
      const okCat = cat === "همه" || p.category === cat;
      const okQ =
        !q ||
        p.title.includes(q) ||
        p.excerpt.includes(q) ||
        p.tags.some((t) => t.includes(q));
      return okCat && okQ;
    });
    return items;
  }, [query, cat]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * PAGE_SIZE;
  const list = filtered.slice(start, start + PAGE_SIZE);

  // سایدبار
  const latest = blogPosts.slice(0, 5);
  const pickCat = (c: string) => {
    setCat(c);
    setPage(1);
  };

  return (
    <>
      {/* هیروی وبلاگ — مدل مشترک همهٔ صفحات داخلی (PageHero) */}
      <PageHero
        eyebrow="EDC. MAGAZINE"
        title="آخرین مقاله‌ها"
        desc="آموزش آلمانی، آزمون‌های رسمی و بازار کار آلمان — هر هفته یک مقاله کاربردی از تجربه واقعی کلاس‌ها."
        breadcrumb={[{ label: "وبلاگ" }]}
      />

      {/* بخش محتوا روی شبکهٔ مربعی روشن — مشبک به درخواست کاربر برگرد */}
      <RdSection id="blog-index" fadeTop>
        <RdBand className="top-0" />
        <RdWrap pb="pb-[62px] sm:pb-[72px] xl:pb-[79px]">

          {/* لیست اصلی + سایدبار چپ — بدون mt اضافه؛ فاصلهٔ بالا فقط ریتم RdWrap (درخواست کاربر:
              «آخرین مقاله‌ها نسبت به بالا پدینگ زیادی دارد») */}
          <div className="grid items-start gap-8 lg:grid-cols-[1fr_300px]">
            <div className="min-w-0">
              {/* پنل سفید کارت‌ها مثل پنل گرید سکشن ۰۵ — قاب چهارمربعی + نوار تب‌ها در بالای سلول سفید (پشت تب‌ها سفید) */}
              <div className="rd-inside relative overflow-hidden rounded-[8px] bg-white">
                <RdSqFrame />
                {/* نوار فیلتر — مدل ریدمی: تب‌های متنی با خط زیر آبی + جستجو در انتهای ردیف؛
                    موبایل: فقط آیکون جستجو که فیلد را باز/بسته می‌کند */}
                <div className="border-b border-hairline-soft px-5 pt-4 sm:px-7">
                  <div className="flex items-center gap-2 sm:items-end sm:justify-between sm:gap-8">
                    <div className="flex min-w-0 flex-1 flex-nowrap gap-6 overflow-x-auto sm:flex-wrap sm:gap-7">
                      {blogCategories.map((c) => {
                        const active = cat === c;
                        return (
                          <button
                            key={c}
                            type="button"
                            aria-pressed={active}
                            onClick={() => pickCat(c)}
                            className={`relative -mx-1 whitespace-nowrap px-1 pb-3 text-[12px] font-black-fa transition-colors ${
                              active
                                ? "text-ink after:absolute after:inset-x-0 after:-bottom-px after:h-[3px] after:rounded-[2px] after:bg-rd-accent"
                                : "text-ink-soft hover:text-ink"
                            }`}
                          >
                            {c}
                          </button>
                        );
                      })}
                    </div>
                    {/* موبایل: آیکون جستجو در انتهای ردیف تب‌ها — مثل ریدمی */}
                    <button
                      type="button"
                      onClick={() => setSearchOpen((v) => !v)}
                      aria-expanded={searchOpen}
                      aria-label="جستجوی مقالات"
                      className={`grid size-9 shrink-0 place-items-center rounded-[8px] transition-colors sm:hidden ${
                        searchOpen ? "bg-canvas-soft text-rd-accent" : "text-ink-soft hover:bg-canvas-soft hover:text-ink"
                      }`}
                    >
                      <Search className="size-5" />
                    </button>
                    {/* دسکتاپ: فیلد جستجوی همیشه‌باز — آیکون با z-10 بالای پس‌زمینهٔ اینپوت */}
                    <label className="relative block shrink-0 pb-3 max-sm:hidden">
                      <Search className="pointer-events-none absolute start-3.5 top-1/2 z-10 size-4.5 -translate-y-1/2 text-ink-faint" />
                      <input
                        value={query}
                        onChange={(e) => {
                          setQuery(e.target.value);
                          setPage(1);
                        }}
                        placeholder="جستجو در مقالات…"
                        aria-label="جستجوی مقالات"
                        className="rd-inside h-10 w-full rounded-[8px] bg-white ps-10 pe-4 text-[13.5px] text-ink outline-none placeholder:text-ink-faint focus:border-rd-accent/60 focus:ring-2 focus:ring-rd-accent/25 sm:w-64"
                      />
                    </label>
                  </div>
                  {/* موبایل: فیلد جستجو با کلیک روی آیکون باز می‌شود */}
                  {searchOpen && (
                    <div className="pb-4 pt-1 sm:hidden">
                      <label className="relative block">
                        <Search className="pointer-events-none absolute start-3.5 top-1/2 z-10 size-4.5 -translate-y-1/2 text-ink-faint" />
                        <input
                          value={query}
                          onChange={(e) => {
                            setQuery(e.target.value);
                            setPage(1);
                          }}
                          placeholder="جستجو در مقالات…"
                          aria-label="جستجوی مقالات"
                          autoFocus
                          className="rd-inside h-10 w-full rounded-[8px] bg-white ps-10 pe-4 text-[13.5px] text-ink outline-none placeholder:text-ink-faint focus:border-rd-accent/60 focus:ring-2 focus:ring-rd-accent/25"
                        />
                      </label>
                    </div>
                  )}
                </div>

                {list.length > 0 ? (
                  /* گرید ۳ کارت در ردیف (درخواست کاربر) — خطوط مویی بین سلول‌ها با gap-px؛
                      سلول‌ها سفید و آخرین ردیف بدون خط پایین */
                  <div className="grid gap-px bg-hairline-soft sm:grid-cols-2 lg:grid-cols-3">
                    {list.map((p) => (
                      <PostCard key={p.id} p={p} />
                    ))}
                  </div>
                ) : (
                  <div className="m-5 rounded-[8px] border border-dashed border-hairline p-6 text-center">
                    <p className="font-black-fa text-ink">مقاله‌ای با این جستجو پیدا نشد.</p>
                    <p className="mt-2 text-sm text-ink-soft">عبارت دیگری امتحان کنید یا دسته‌بندی را تغییر دهید.</p>
                  </div>
                )}
              </div>

              {/* صفحه‌بندی عددی */}
              {totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-2" dir="ltr">
                  {pageNumbers(totalPages, safePage).map((n, i) =>
                    n === "…" ? (
                      <span key={`e${i}`} className="px-0.5 text-[12px] font-bold text-ink-faint">
                        …
                      </span>
                    ) : (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setPage(n)}
                        aria-label={`صفحه ${faNum(n)}`}
                        className={`grid size-[34px] place-items-center rounded-full text-[12px] font-black-fa transition-colors ${
                          safePage === n
                            ? "bg-rd-deep text-white"
                            : "bg-canvas-soft text-ink-soft hover:text-ink"
                        }`}
                      >
                        {faNum(n)}
                      </button>
                    ),
                  )}
                  {safePage < totalPages && (
                    <button
                      type="button"
                      onClick={() => setPage(safePage + 1)}
                      aria-label="صفحه بعد"
                      className="grid size-[34px] place-items-center rounded-full bg-canvas-soft text-ink-soft transition-colors hover:text-ink"
                    >
                      <ArrowLeft className="size-3.5" />
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* سایدبار چسبان چپ */}
            <aside className="space-y-5 lg:sticky lg:top-[80px]" aria-label="ابزارهای وبلاگ">
              <div className="rd-inside rounded-[8px] bg-white p-5">
                <h3 className="font-black-fa text-[15px] text-ink">دسته‌بندی‌ها</h3>
                <div className="mt-3 space-y-1.5">
                  <button
                    type="button"
                    onClick={() => pickCat("همه")}
                    className={`flex w-full items-center justify-between rounded-[8px] px-3.5 py-2.5 text-[13px] font-black-fa transition-colors ${
                      cat === "همه" ? "bg-rd-deep text-white" : "bg-canvas-soft/60 text-ink-soft hover:bg-canvas-soft hover:text-ink"
                    }`}
                  >
                    همه مقاله‌ها
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10.5px] font-extrabold ${
                        cat === "همه" ? "bg-white/15 text-white" : "bg-canvas-soft text-ink-faint"
                      }`}
                    >
                      {faNum(blogPosts.length)}
                    </span>
                  </button>
                  {blogCategories
                    .filter((c) => c !== "همه")
                    .map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => pickCat(c)}
                        className={`flex w-full items-center justify-between rounded-[8px] px-3.5 py-2.5 text-[13px] font-black-fa transition-colors ${
                          cat === c ? "bg-rd-deep text-white" : "bg-canvas-soft/60 text-ink-soft hover:bg-canvas-soft hover:text-ink"
                        }`}
                      >
                        {c}
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10.5px] font-extrabold ${
                            cat === c ? "bg-white/15 text-white" : "bg-canvas-soft text-ink-faint"
                          }`}
                        >
                          {faNum(catCounts.get(c) ?? 0)}
                        </span>
                      </button>
                    ))}
                </div>
              </div>

              <div className="rd-inside rounded-[8px] bg-white p-5">
                <h3 className="font-black-fa text-[15px] text-ink">تازه‌ترین مطالب</h3>
                <ul className="mt-3 space-y-3">
                  {latest.map((p) => (
                    <li key={p.id}>
                      <SiteLink href={`/blog/${p.slug}`} className="group block">
                        <p className="line-clamp-2 text-[12.5px] font-black-fa leading-6 text-ink transition-colors group-hover:text-rd-accent">
                          {p.title}
                        </p>
                        <p className="mt-1 flex items-center gap-1 text-[10.5px] text-ink-faint">
                          <CalendarDays className="size-3" />
                          {p.date}
                        </p>
                      </SiteLink>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="relative overflow-hidden rounded-[8px] bg-rd-night p-5">
                <RdSqFrame dark />
                <EdcMark className="pointer-events-none absolute -bottom-6 -end-6 size-24 opacity-10" />
                <div className="relative">
                  <p className="text-[14px] font-black-fa leading-7 text-white">دوره‌های جامع کلینیک</p>
                  <p className="mt-1.5 text-[12px] leading-6 text-white/60">
                    از الفبا تا آزمون رسمی و بازار کار — مسیر متناسب با سطح و هدف شما.
                  </p>
                  <SiteLink
                    href="/courses"
                    className="mt-4 grid h-10 place-items-center rounded-full bg-rd-deep text-[13px] font-extrabold text-white transition-colors hover:bg-navy-700"
                  >
                    مشاهده دوره‌ها
                  </SiteLink>
                </div>
              </div>
            </aside>
          </div>
        </RdWrap>
      </RdSection>
    </>
  );
}

/* -------------------- صفحه مقاله -------------------- */

/* ---------------------------- جزئیات مقاله ----------------------------- */

function ShareRow({ title }: { title: string }) {
  // لینک فقط هنگام کلیک ساخته می‌شود تا خروجی SSR و کلاینت یکی بماند
  const open = (kind: "tg" | "wa") => {
    const url = window.location.href;
    const to =
      kind === "tg"
        ? `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`
        : `https://wa.me/?text=${encodeURIComponent(`${title} — ${url}`)}`;
    window.open(to, "_blank", "noopener");
  };
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-ink-soft">
        <Share2 className="size-4" />
        اشتراک‌گذاری:
      </span>
      <CopyButton value={() => window.location.href} label="کپی لینک مقاله" />
      <button
        type="button"
        onClick={() => open("tg")}
        aria-label="اشتراک‌گذاری در تلگرام"
        title="اشتراک‌گذاری در تلگرام"
        className="inline-flex h-8 items-center gap-1.5 rounded-[8px] bg-canvas-soft px-2.5 text-[12px] font-bold text-ink-soft transition-colors hover:text-ink"
      >
        <Send className="size-3.5" />
        تلگرام
      </button>
      <button
        type="button"
        onClick={() => open("wa")}
        aria-label="اشتراک‌گذاری در واتساپ"
        title="اشتراک‌گذاری در واتساپ"
        className="inline-flex h-8 items-center gap-1.5 rounded-[8px] bg-ok/10 px-2.5 text-[12px] font-bold text-ok transition-colors hover:bg-ok/20"
      >
        واتساپ
      </button>
    </div>
  );
}

function Comments({ slug }: { slug: string }) {
  const { toast } = useToast();
  const [items, setItems] = React.useState(postComments[slug] ?? []);
  const [name, setName] = React.useState("");
  const [text, setText] = React.useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !text.trim()) {
      toast({ title: "لطفاً نام و متن دیدگاه را وارد کنید.", variant: "destructive" });
      return;
    }
    setItems((prev) => [{ name: name.trim(), date: "همین حالا", text: text.trim() }, ...prev]);
    setName("");
    setText("");
    toast({ title: "دیدگاه شما ثبت شد ✔", description: "پس از بررسی، برای دیگران نمایش داده می‌شود." });
  };

  return (
    <section aria-label="نظرات کاربران" className="mt-12">
      <h2 className="flex items-center gap-2 font-black-fa text-ink">
        <MessageSquare className="size-5 text-rd-accent" />
        نظرات کاربران
        <span className="text-sm font-extrabold text-ink-faint">({faNum(items.length)})</span>
      </h2>

      <div className="mt-5 space-y-4">
        {items.map((c, i) => (
          <article key={`${c.name}-${i}`} className="rd-inside rounded-[8px] bg-white p-5">
            <div className="flex items-center gap-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-navy-deep text-sm font-black-fa text-white">
                {c.name.trim().charAt(0)}
              </span>
              <div className="leading-tight">
                <p className="text-sm font-black-fa text-ink">{c.name}</p>
                <p className="mt-0.5 text-[11px] text-ink-faint">{c.date}</p>
              </div>
            </div>
            <p className="mt-3 text-[13.5px] leading-7 text-ink-soft">{c.text}</p>
          </article>
        ))}
      </div>

      <form
        onSubmit={submit}
        className="rd-inside mt-6 rounded-[8px] bg-white p-5"
        aria-label="فرم ثبت دیدگاه"
      >
        <p className="font-black-fa text-ink">دیدگاه شما</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_2fr]">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="نام شما"
            aria-label="نام شما"
            className="h-11 w-full rounded-[8px] bg-white px-4 text-sm text-ink outline-none ring-1 ring-hairline-soft placeholder:text-ink-faint focus:ring-2 focus:ring-rd-accent/40"
          />
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="متن دیدگاه…"
            aria-label="متن دیدگاه"
            className="h-11 w-full rounded-[8px] bg-white px-4 text-sm text-ink outline-none ring-1 ring-hairline-soft placeholder:text-ink-faint focus:ring-2 focus:ring-rd-accent/40"
          />
        </div>
        <button
          type="submit"
          className="mt-4 h-10 w-full rounded-full bg-rd-deep text-[13px] font-extrabold text-white transition-colors hover:bg-navy-700 sm:w-40"
        >
          ثبت دیدگاه
        </button>
      </form>
    </section>
  );
}

export function ArticlePage({ slug }: { slug: string }) {
  const post = getSitePost(slug);

  if (!post) {
    return (
      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-24 text-center">
          <EdcMark className="mx-auto size-12 opacity-40" />
          <h1 className="mt-5 font-black-fa text-ink">مقاله پیدا نشد</h1>
          <p className="mt-3 text-sm text-ink-soft">ممکن است آدرس تغییر کرده باشد.</p>
          <SiteLink
            href="/blog"
            className="mt-6 inline-flex h-10 items-center gap-2 rounded-full bg-rd-deep px-6 text-[13px] font-extrabold text-white transition-colors hover:bg-navy-700"
          >
            بازگشت به وبلاگ
            <ArrowLeft className="size-4" />
          </SiteLink>
        </div>
      </section>
    );
  }

  const related = blogPosts.filter((p) => p.slug !== post.slug && p.category === post.category).slice(0, 3);
  const relatedPool =
    related.length > 0
      ? related
      : blogPosts.filter((p) => p.slug !== post.slug).slice(0, 3);

  return (
    <>
      {/* هیروسکشن مقاله حذف شد (درخواست کاربر) — بدنهٔ مقاله مستقیم بعد از هدر */}

      {/* بدنهٔ مقاله روی شبکهٔ مربعی روشن — هماهنگ با صفحهٔ فهرست وبلاگ */}
      <RdSection id="article-body" fadeTop>
        <RdBand className="top-0" />
        <RdWrap pb="pb-[62px] sm:pb-[72px] xl:pb-[79px]">
          <div className="grid items-start gap-10 lg:grid-cols-[1fr_320px]">
            {/* ستون اصلی مقاله — شیت سفید روی شبکهٔ ملایم */}
            <article className="rd-inside min-w-0 rounded-[8px] bg-white p-5 sm:p-7 xl:p-8">
              {/* نویسنده و متا */}
              <div className="flex flex-wrap items-center gap-4 pb-6">
                <span className="grid size-11 shrink-0 place-items-center rounded-full bg-navy-deep text-base font-black-fa text-white">
                  {post.author.charAt(0)}
                </span>
                <div className="leading-tight">
                  <p className="text-sm font-black-fa text-ink">{post.author}</p>
                  <p className="mt-0.5 text-[11px] text-ink-faint">{post.authorRole}</p>
                </div>
                <div className="ms-auto flex flex-wrap items-center gap-2">
                  <MetaChip icon={<CalendarDays className="size-3.5" />}>{post.date}</MetaChip>
                  <MetaChip icon={<Clock3 className="size-3.5" />}>{faNum(post.readTime)} دقیقه مطالعه</MetaChip>
                </div>
              </div>

              {/* تصویر اصلی — حذف شد (خواستهٔ کاربر)؛ بدنهٔ مقاله مستقیم بعد از هدر نویسنده */}

              {/* محتوای اصلی */}
              <div className="mt-8 space-y-5">
                {post.content.map((par, i) => (
                  <p key={i} className="text-justify text-[15px] leading-8 text-ink-soft">
                    {par}
                  </p>
                ))}
              </div>

              {/* تگ‌ها */}
              <div className="mt-10 flex flex-wrap items-center gap-2 border-t border-hairline-soft pt-6">
                <Tag className="size-4 text-ink-faint" />
                {post.tags.map((t) => (
                  <span key={t} className="rd-inside rounded-full bg-white px-3 py-1 text-[12px] font-bold text-ink-soft">
                    #{t}
                  </span>
                ))}
              </div>

              <Comments slug={post.slug} />
            </article>

            {/* سایدبار چسبان — مقالات مرتبط و اشتراک‌گذاری */}
            <aside className="space-y-5 lg:sticky lg:top-[80px]" aria-label="مقالات مرتبط و اشتراک‌گذاری">
              <div className="rd-inside rounded-[8px] bg-white p-5">
                <h2 className="flex items-center justify-between font-black-fa text-[15px] text-ink">
                  مقالات مرتبط
                  <SiteLink href="/blog" className="text-[11px] font-extrabold text-rd-accent hover:text-rd-accent">
                    همه مقالات
                  </SiteLink>
                </h2>
                <div className="mt-4 space-y-3">
                  {relatedPool.map((p) => (
                    <SiteLink
                      key={p.id}
                      href={`/blog/${p.slug}`}
                      className="group flex gap-3 rounded-[8px] bg-white rd-inside p-3 transition-colors hover:bg-canvas-soft/70"
                    >
                      <img
                        src={p.image}
                        alt={p.title}
                        loading="lazy"
                        className="size-20 shrink-0 rounded-[8px] object-cover"
                      />
                      <div className="min-w-0">
                        <p className="line-clamp-2 text-[13px] font-black-fa leading-6 text-ink transition-colors group-hover:text-rd-accent">
                          {p.title}
                        </p>
                        <p className="mt-1.5 flex items-center gap-2 text-[10.5px] text-ink-faint">
                          <Clock3 className="size-3" />
                          {faNum(p.readTime)} دقیقه · {p.date}
                        </p>
                      </div>
                    </SiteLink>
                  ))}
                </div>
              </div>

              <div className="rd-inside rounded-[8px] bg-white p-5">
                <p className="text-[13px] font-black-fa text-ink">این مقاله را به اشتراک بگذارید</p>
                <div className="mt-3">
                  <ShareRow title={post.title} />
                </div>
              </div>

              <div className="relative overflow-hidden rounded-[8px] bg-rd-night p-5">
                <RdSqFrame dark />
                <EdcMark className="pointer-events-none absolute -bottom-6 -end-6 size-24 opacity-10" />
                <div className="relative">
                  <p className="text-[14px] font-black-fa leading-7 text-white">
                    می‌خواهید آلمانی را واقعی یاد بگیرید؟
                  </p>
                  <p className="mt-1.5 text-[12px] leading-6 text-white/60">
                    با تعیین سطح رایگان، نقطه شروع دقیق‌تان مشخص می‌شود.
                  </p>
                  <SiteLink
                    href="/placement"
                    className="mt-4 grid h-10 place-items-center rounded-full bg-rd-deep text-[13px] font-extrabold text-white transition-colors hover:bg-navy-700"
                  >
                    تعیین سطح رایگان
                  </SiteLink>
                </div>
              </div>
            </aside>
          </div>
        </RdWrap>
      </RdSection>
    </>
  );
}
