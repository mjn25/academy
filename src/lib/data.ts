/* ------------------------------------------------------------------ */
/*  داده‌های نمونه کلینیک آلمانی المیرا (دمو پنل‌ها)                    */
/*  هم‌دنیای سایت عمومی: دوره‌های آلمانی، BlitzJob، BlitzZertifikat،    */
/*  کلاب مکالمه و کتاب‌های Blitz — مدرس اصلی: المیرا معرفت‌پور          */
/* ------------------------------------------------------------------ */

export type CourseType = "online" | "offline";
export type Level = "مقدماتی" | "متوسط" | "پیشرفته";

export interface Teacher {
  id: string;
  name: string;
  title: string;
  degree: string;
  experience: number;
  rating: number;
  students: number;
  bio: string;
  image: string;
  languages: string[];
  courses: string[]; // course ids
}

export interface Course {
  id: string;
  slug: string;
  title: string;
  language: string;
  level: Level;
  type: CourseType;
  audience: string;
  price: number;
  oldPrice?: number;
  teacherId: string;
  durationHours: number;
  sessions: number;
  capacity?: number; // فقط حضوری
  enrolled?: number;
  rating: number;
  studentsCount: number;
  image: string;
  short: string;
  description: string;
  syllabus: { title: string; items: string[] }[];
  faqs: { q: string; a: string }[];
  featured?: boolean;
  startDate?: string;
  schedule?: string; // برای حضوری
}

export interface Post {
  id: string;
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  content: string[];
  image: string;
  author: string;
  date: string;
  readTime: number;
  tags: string[];
}

export interface Product {
  id: string;
  title: string;
  price: number;
  oldPrice?: number;
  category: string;
  image: string;
  stock: number;
  rating: number;
}

export interface Testimonial {
  id: string;
  name: string;
  course: string;
  text: string;
  rating: number;
}

export interface Honor {
  id: string;
  title: string;
  year: string;
  type: string;
  desc: string;
  image?: string;
}

/* ------------------------------- اساتید ------------------------------- */

export const teachers: Teacher[] = [
  {
    id: "t1",
    name: "المیرا معرفت‌پور",
    title: "بنیان‌گذار و مدرس اصلی کلینیک",
    degree: "گواهی DLL موسسه گوته — گواهی تدریس DSIT تهران",
    experience: 16,
    rating: 4.9,
    students: 1250,
    bio: "بنیان‌گذار کلینیک آلمانی المیرا و طراح روش Blitz؛ ۱۶ سال تدریس آلمانی از کلاس‌های کوچک تا سیستم آموزش کامل. متخصص چانک، رول‌پلی و آمادگی آزمون‌های رسمی Goethe، ÖSD و TestDaF. رویکرد او: زبان به‌شکل کل تمرین می‌شود، نه لغت‌های پراکنده.",
    image: "/images/teachers/t1.jpg",
    languages: ["آلمانی"],
    courses: ["a1", "b1", "blitzjob", "zertifikat", "konversation"],
  },
  {
    id: "t2",
    name: "آرمان شهبازی",
    title: "مدرس آلمانی روزمره و محیط کار",
    degree: "کارشناسی ارشد زبان آلمانی — دانشگاه علامه طباطبایی",
    experience: 11,
    rating: 4.8,
    students: 860,
    bio: "مدرس سطوح A2 و BlitzBusiness؛ تخصص او آماده‌سازی زبان‌آموزان برای موقعیت‌های واقعی کار در آلمان است — ایمیل اداری، جلسه و تماس با مشتری. کلاس‌هایش بر پایه رول‌پلی و بازخورد لحظه‌ای برگزار می‌شود.",
    image: "/images/teachers/t2.jpg",
    languages: ["آلمانی"],
    courses: ["a2", "blitzjob"],
  },
  {
    id: "t3",
    name: "سحر گلستانی",
    title: "مدرس آمادگی آزمون‌های رسمی",
    degree: "کارشناسی ارشد آموزش زبان — دانشگاه تهران",
    experience: 9,
    rating: 4.9,
    students: 720,
    bio: "مدرس BlitzZertifikat و دوره B2؛ نمره‌دهنده باتجربه آزمون‌های آزمایشی Goethe با کارنامه تفصیلی چهار مهارت. هر فصل یک آزمون آزمایشی کامل با شرایط واقعی برگزار می‌کند و نقشه مطالعه تا روز آزمون می‌دهد.",
    image: "/images/teachers/t3.jpg",
    languages: ["آلمانی"],
    courses: ["b1", "zertifikat"],
  },
  {
    id: "t4",
    name: "امیر فرهادی",
    title: "مدرس کلاب مکالمه",
    degree: "دوره تربیت مدرس — موسسه گوته",
    experience: 7,
    rating: 4.7,
    students: 540,
    bio: "میزبان کلاب مکالمه BlitzKonversation؛ هر جلسه یک موقعیت واقعی (خرید، آنتزالت، پزشک) و بیشترِ وقت کلاس اجراست. با سؤال‌های پیاپی شما را از جواب کوتاه به گفتگوی روان می‌رساند.",
    image: "/images/teachers/t4.jpg",
    languages: ["آلمانی"],
    courses: ["konversation", "a1"],
  },
];

export const teachersById = Object.fromEntries(teachers.map((t) => [t.id, t]));

/* ------------------------------- دوره‌ها ------------------------------ */

export const courses: Course[] = [
  {
    id: "a1",
    slug: "german-a1",
    title: "دوره آلمانی A1 — از الفبا تا مکالمه واقعی",
    language: "آلمانی",
    level: "مقدماتی",
    type: "offline",
    audience: "بزرگسالان",
    price: 8900000,
    oldPrice: 10900000,
    teacherId: "t1",
    durationHours: 56,
    sessions: 28,
    capacity: 15,
    enrolled: 12,
    rating: 4.9,
    studentsCount: 640,
    image: "/images/classroom/c4.jpg",
    short: "از الفبا تا گفتگوی واقعی با چانک و رول‌پلی — مطابق چارچوب A1.",
    description:
      "دوره A1 کلینیک المیرا برای شروع واقعی طراحی شده است: هر جلسه با مجموعه چانک‌های آمادهٔ همان موقعیت شروع می‌شود و همان جلسه در نقش اجرا می‌گردد. تمام مهارت‌ها مطابق چارچوب مشترک اروپایی (CEFR) آموزش داده می‌شود و تمرین‌های گفتاری دقیقاً با فرمت آزمون‌های رسمی A1 برگزار می‌شود. بعد از هر فصل، کارنامه شفاف مهارت‌ها را می‌گیرید و می‌دانید کجا ایستاده‌اید.",
    syllabus: [
      { title: "فصل اول: Buchstabieren و معرفی", items: ["الفبا و تلفظ", "چانک‌های معرفی خود", "کشورها و زبان‌ها"] },
      { title: "فصل دوم: خرید و غذا", items: ["سوپرمارکت", "رستوران و سفارش", "اعداد و قیمت"] },
      { title: "فصل سوم: شهر و مسیر", items: ["حمل‌ونقل عمومی", "پرسیدن آدرس", "رول‌پلی آنتزالت"] },
      { title: "فصل چهارم: آمادگی آزمون", items: ["چهار ماژول آزمون A1", "تمرین رسمی", "شبیه‌سازی نهایی"] },
    ],
    faqs: [
      { q: "آیا با الفبای متفاوت مشکلی پیش نمی‌آید؟", a: "خیر؛ دو جلسه اول کاملاً به الفبا و تلفظ اختصاص دارد و منابع صوتی تمرین در پنل قرار می‌گیرد." },
      { q: "آزمون رسمی را از کجا بدهم؟", a: "کلینیک ثبت‌نام گروهی در مرکز Goethe تهران را هماهنگ می‌کند و دو آزمون آزمایشی کامل در همین دوره برگزار می‌شود." },
    ],
    featured: true,
    startDate: "۱۵ آبان ۱۴۰۴",
    schedule: "شنبه و دوشنبه — ۱۷:۳۰ تا ۱۹:۳۰",
  },
  {
    id: "a2",
    slug: "german-a2",
    title: "دوره آلمانی A2 — مکالمه روان روزمره",
    language: "آلمانی",
    level: "مقدماتی",
    type: "offline",
    audience: "بزرگسالان",
    price: 9600000,
    oldPrice: 11800000,
    teacherId: "t2",
    durationHours: 52,
    sessions: 26,
    capacity: 15,
    enrolled: 10,
    rating: 4.8,
    studentsCount: 470,
    image: "/images/classroom/c2.jpg",
    short: "از جمله به گفتگو؛ چانک‌های روزمره و رول‌پلی‌های موضوعی.",
    description:
      "در A2 زبان‌آموز از جمله‌های کوتاه به گفتگوی روان می‌رسد. هر فصل ۳۰ چانک کاربردی دارد — زبان آماده برای استفاده، نه لغت برای حفظ. موقعیت‌های پزشک، داروخانه، خرید و مسیر هر بار دو بار در نقش تمرین می‌شود و بین جلسات پرسش‌های شما بی‌جواب نمی‌ماند.",
    syllabus: [
      { title: "فصل اول: گذشته و برنامه", items: ["گفتگو درباره آخر هفته", "Perfekt در گفتار", "قرار گذاشتن"] },
      { title: "فصل دوم: پزشک و داروخانه", items: ["رول‌پلی ویزیت", "توصیه دارو", "سناریوی اورژانس ساده"] },
      { title: "فصل سوم: اداره و نامه‌ها", items: ["ایمیل رسمی ساده", "رول‌پلی آنتزالت", "تماس تلفنی"] },
      { title: "فصل چهارم: کارنامه و آزمون", items: ["آزمون فصلی", "کارنامه چهار مهارت", "شبیه‌سازی A2"] },
    ],
    faqs: [
      { q: "پیش‌نیاز دوره چیست؟", a: "تسلط به سطح A1 (یا گذراندن دوره A1 کلینیک). اگر مطمئن نیستید، در تعیین سطح رایگان شرکت کنید." },
    ],
    featured: true,
    startDate: "۲۰ آبان ۱۴۰۴",
    schedule: "یکشنبه و سه‌شنبه — ۱۰:۰۰ تا ۱۲:۰۰",
  },
  {
    id: "b1",
    slug: "german-b1",
    title: "دوره آلمانی B1 — استقلال زبانی",
    language: "آلمانی",
    level: "متوسط",
    type: "offline",
    audience: "بزرگسالان",
    price: 10800000,
    oldPrice: 13200000,
    teacherId: "t1",
    durationHours: 60,
    sessions: 30,
    capacity: 14,
    enrolled: 11,
    rating: 4.9,
    studentsCount: 380,
    image: "/images/classroom/c5.jpg",
    short: "جمله‌سازی طولانی، بحث و مصاحبه — سطح استقلال زبانی.",
    description:
      "B1 سطح استقلال زبانی است: بحث گروهی، مصاحبه کاری و ایمیل اداری. مدرس با پرسش‌های دقیق شما را به جمله‌سازی طولانی‌تر و دقیق‌تر می‌کشاند و هر هفته یک رول‌پلی ساختارمند برگزار می‌شود. چانک‌های اداری برای ایمیل، تلفن و جلسه آماده استفاده واقعی‌اند و گزارش پیشرفت فصلی نشان می‌دهد برای کار یا مدرک دقیقاً چه فاصله‌ای مانده.",
    syllabus: [
      { title: "فصل اول: نظر دادن و بحث", items: ["ساختار استدلال", "موافق/مخالف", "مناظره کوتاه"] },
      { title: "فصل دوم: کار و مصاحبه", items: ["Vorstellungsgespräch", "CV گفتاری", "پرسش‌های پرتکرار"] },
      { title: "فصل سوم: اداری و رسمی", items: ["ایمیل‌های قالبی", "شکایت و پیگیری", "رول‌پلی جلسه"] },
      { title: "فصل چهارم: آمادگی آزمون B1", items: ["چهار ماژول Goethe B1", "دو آزمون آزمایشی", "برنامه تا روز آزمون"] },
    ],
    faqs: [
      { q: "چه سطحی لازم دارد؟", a: "پایان A2 یا هم‌ارز آن؛ در تعیین سطح رایگان مشخص می‌شود." },
      { q: "آزمون آزمایشی جداگانه هزینه دارد؟", a: "خیر؛ دو آزمون آزمایشی کامل با کارنامه تفصیلی بخشی از همین دوره است." },
    ],
    featured: true,
    startDate: "۱۸ آبان ۱۴۰۴",
    schedule: "شنبه و چهارشنبه — ۱۹:۰۰ تا ۲۱:۰۰",
  },
  {
    id: "blitzjob",
    slug: "blitzjob",
    title: "دوره آلمانی بازار کار — BlitzJob",
    language: "آلمانی",
    level: "متوسط",
    type: "offline",
    audience: "بزرگسالان",
    price: 12400000,
    oldPrice: 15600000,
    teacherId: "t1",
    durationHours: 48,
    sessions: 24,
    capacity: 12,
    enrolled: 9,
    rating: 4.9,
    studentsCount: 260,
    image: "/images/classroom/c8.jpg",
    short: "از زبان تا اشتغال؛ مصاحبه واقعی، واژگان شغل شما و نقسه سه‌ماهه اول کار.",
    description:
      "BlitzJob برای کسانی طراحی شده که می‌خواهند در محیط کار آلمان بایستند: دو مصاحبه شبیه‌سازی‌شدهٔ کامل با ویدئو و بازخورد خط‌به‌خط، لیست واژگان تخصصی بر اساس رشته و شغل هدف شما، و سناریوهای واقعی ایمیل، تماس و جلسه. در پایان دوره نقشه زبانی سه ماه اول کارتان تحویل می‌گیرید.",
    syllabus: [
      { title: "فصل اول: ورود به بازار کار", items: ["آگهی شغلی خواندن", "چانک‌های تماس اولیه", "رول‌پلی درخواست کار"] },
      { title: "فصل دوم: مصاحبه", items: ["Vorstellung کاری", "۵ سؤال پرتکرار", "مصاحبه شبیه‌سازی‌شده کامل"] },
      { title: "فصل سوم: محیط کار", items: ["ایمیل و گزارش روزانه", "جلسه و Teams", "Krankmeldung و Urlaub"] },
      { title: "فصل چهارم: نقشه شخصی", items: ["واژگان تخصصی رشته", "بازخورد ویدئویی", "نقسه سه‌ماهه اول"] },
    ],
    faqs: [
      { q: "برای چه سطحی مناسب است؟", a: "A2 به بالا؛ واژگان تخصصی بر اساس شغل هدف از صفر ساخته می‌شود." },
    ],
    startDate: "۲۲ آبان ۱۴۰۴",
    schedule: "دوشنبه — ۱۷:۳۰ تا ۱۹:۳۰",
  },
  {
    id: "zertifikat",
    slug: "blitzzertifikat",
    title: "آمادگی آزمون‌های رسمی — BlitzZertifikat (Goethe / ÖSD / TestDaF)",
    language: "آلمانی",
    level: "پیشرفته",
    type: "online",
    audience: "بزرگسالان",
    price: 13800000,
    oldPrice: 16400000,
    teacherId: "t3",
    durationHours: 44,
    sessions: 0,
    rating: 4.8,
    studentsCount: 190,
    image: "/images/study/s3.jpg",
    short: "نتیجه‌محور برای مدرک؛ فرمت دقیق آزمون و دو آزمون آزمایشی کامل.",
    description:
      "BlitzZertifikat دوره‌ای نتیجه‌محور برای گرفتن مدرک رسمی است: همه تمرین‌ها طبق فرمت همان آزمون (Goethe، ÖSD یا TestDaF) طراحی می‌شوند — نه تمرین عمومی. دو آزمون آزمایشی کامل با شرایط واقعی، تصحیح استاندارد و کارنامه تفصیلی هر مهارت برگزار می‌شود، ضعف هر نفر جداگانه شناسایی می‌شود و برنامه مطالعه هفته‌به‌هفته تا روز آزمون با چک‌لیست نهایی می‌گیرید.",
    syllabus: [
      { title: "فصل اول: شناخت آزمون", items: ["ساختار ماژول‌ها", "معیارهای نمره‌دهی", "آزمون تعیین سطح اولیه"] },
      { title: "فصل دوم: Lesen و Hören", items: ["تکنیک پیش‌خوانی", "انواع سؤال", "مدیریت زمان"] },
      { title: "فصل سوم: Schreiben", items: ["قالب‌های نامه رسمی", "بانک عبارات", "بازخورد خط‌به‌خط"] },
      { title: "فصل چهارم: Sprechen", items: ["رول‌پلی فرمت آزمون", "ضبط و بازخورد", "شبیه‌سازی کامل"] },
    ],
    faqs: [
      { q: "کدام آزمون مناسب من است؟", a: "در جلسه تعیین سطح بر اساس هدف (کار، تحصیل، ویزا) بین Goethe، ÖSD و TestDaF انتخاب می‌کنیم." },
      { q: "دسترسی به محتوا چقدر است؟", a: "دسترسی ۱۸ ماه اعتبار دارد و آزمون‌های آزمایشی با تصحیح استاد برگزار می‌شود." },
    ],
    featured: true,
  },
  {
    id: "konversation",
    slug: "blitzkonversation",
    title: "کلاب مکالمه BlitzKonversation — از جواب کوتاه به گفتگوی روان",
    language: "آلمانی",
    level: "متوسط",
    type: "offline",
    audience: "بزرگسالان",
    price: 6400000,
    oldPrice: 7900000,
    teacherId: "t4",
    durationHours: 24,
    sessions: 16,
    capacity: 10,
    enrolled: 8,
    rating: 4.8,
    studentsCount: 310,
    image: "/images/classroom/c10.jpg",
    short: "هر هفته یک موقعیت واقعی؛ بیشترِ جلسه اجراست — بدون ترس از اشتباه.",
    description:
      "کلاب مکالمه یک کلاس سنتی نیست؛ هر هفته یک موقعیت واقعی (خرید، آنتزالت، پزشک، مهمانی) و بیشترِ جلسه اجراست: شما در نقش، مدرس در نقش مقابل، با بازخورد لحظه‌ای. هر موقعیت با مجموعه چانک‌های آمادهٔ همان موقعیت شروع می‌شود — جملهٔ کامل، نه لغت پراکنده. روانی، دقت و واکنش هر جلسه ثبت می‌شود و کارنامه‌اش را می‌بینید.",
    syllabus: [
      { title: "هفته‌های ۱ تا ۴: روزمره", items: ["خرید و قیمت", "رستوران", "مسیر و حمل‌ونقل"] },
      { title: "هفته‌های ۵ تا ۸: اداری", items: ["آنتزالت", "Anmeldung", "تماس تلفنی رسمی"] },
      { title: "هفته‌های ۹ تا ۱۶: بحث و موقعیت باز", items: ["بحث گروهی", "مهمانی و معرفی", "شبیه‌سازی موقعیت واقعی"] },
    ],
    faqs: [
      { q: "چه سطحی لازم دارد؟", a: "حداقل پایان A1؛ در تعیین سطح اگر آماده نباشید، دوره A1 را پیشنهاد می‌کنیم." },
    ],
    startDate: "۱۶ آبان ۱۴۰۴",
    schedule: "چهارشنبه — ۱۹:۰۰ تا ۲۰:۳۰",
  },
];

/* ------------------------------ پکیج‌ها ------------------------------- */

export interface Pkg {
  id: string;
  title: string;
  type: "online" | "offline" | "combined";
  desc: string;
  price: number;
  oldPrice: number;
  items: string[];
  badge?: string;
}

export const packages: Pkg[] = [
  {
    id: "p1",
    title: "پکیج مسیر B1",
    type: "combined",
    desc: "دوره حضوری B1 + دوره آنلاین BlitzZertifikat + ۲ کتاب منتخب و ۲ آزمون آزمایشی اضافه.",
    price: 19900000,
    oldPrice: 24600000,
    items: ["دوره حضوری آلمانی B1", "دوره آنلاین BlitzZertifikat", "کتاب کار Blitz آلمانی A2", "بستهٔ آزمون‌های آزمایشی Goethe B1", "۲ آزمون آزمایشی اضافه"],
    badge: "پرفروش‌ترین",
  },
  {
    id: "p2",
    title: "پکیج مسیر شغلی",
    type: "combined",
    desc: "دوره حضوری BlitzJob + کلاب مکالمه + جزوه‌های تمرینی BlitzJob.",
    price: 16900000,
    oldPrice: 20400000,
    items: ["دوره حضوری BlitzJob", "کلاب مکالمه BlitzKonversation", "جزوه‌های تمرینی BlitzJob", "بستهٔ پادکست + متن درس‌ها"],
  },
  {
    id: "p3",
    title: "پکیج شروع آلمانی",
    type: "offline",
    desc: "دوره حضوری A1 + کتاب کار Blitz A1 + مجموعه چانک‌های روزمره.",
    price: 9900000,
    oldPrice: 12000000,
    items: ["دوره حضوری آلمانی A1", "کتاب کار Blitz آلمانی A1", "مجموعه چانک‌های روزمره آلمانی"],
  },
];

/* ------------------------------- محصولات ----------------------------- */

export const products: Product[] = [
  { id: "b1", title: "کتاب کار Blitz آلمانی A1", price: 380000, oldPrice: 450000, category: "کتاب کار", image: "/images/books/b1.jpg", stock: 34, rating: 4.9 },
  { id: "b2", title: "مجموعه چانک‌های روزمره آلمانی", price: 290000, category: "چانک و مکالمه", image: "/images/books/b2.jpg", stock: 41, rating: 4.8 },
  { id: "b3", title: "آمادگی آزمون Goethe A1 — Start Deutsch 1", price: 420000, oldPrice: 490000, category: "آمادگی آزمون", image: "/images/books/b3.jpg", stock: 22, rating: 4.7 },
  { id: "b4", title: "فلش‌کارت واژگان A1 تا B1", price: 240000, category: "ابزار یادگیری", image: "/images/books/b4.jpg", stock: 58, rating: 4.6 },
  { id: "b5", title: "جزوه‌های تمرینی BlitzJob", price: 310000, category: "آلمانی محیط کار", image: "/images/books/b5.jpg", stock: 27, rating: 4.8 },
  { id: "b6", title: "پادکست + متن درس‌ها (بسته دیجیتال)", price: 190000, category: "بسته دیجیتال", image: "/images/books/b6.jpg", stock: 99, rating: 4.7 },
  { id: "b7", title: "کتاب کار Blitz آلمانی A2", price: 420000, oldPrice: 500000, category: "کتاب کار", image: "/images/books/b7.jpg", stock: 30, rating: 4.8 },
  { id: "b8", title: "بستهٔ آزمون‌های آزمایشی Goethe B1", price: 350000, oldPrice: 430000, category: "آمادگی آزمون", image: "/images/books/b8.jpg", stock: 18, rating: 4.9 },
];

/* ------------------------------- مقالات ------------------------------ */

export const posts: Post[] = [
  {
    id: "po1",
    slug: "chunks-logic",
    title: "چرا در Blitz لغت حفظ نمی‌کنیم؟ منطق چانک‌ها",
    category: "روش Blitz",
    excerpt: "جملهٔ کامل از روز اول؛ ببینید چانک‌ها چطور مکالمه را طبیعی می‌کنند.",
    content: [
      "حفظ لغت پراکنده، جمله نمی‌سازد. در روش Blitz هر مطلب با یک چانک شروع می‌شود — ترکیب آمادهٔ طبیعی زبان که همان جلسه در نقش اجرا می‌شود. نتیجه: از روز اول جمله می‌گویید، نه لغت.",
      "چانک مثل بلوک بازی است؛ قواعد گرامری در دل همان بلوک جذب می‌شوند. وقتی ده چانک موقعیت خرید را بلدید، گرامر «قیمت‌گویی» را هم بلدید — بدون جدول صرف.",
      "قانون تمرین: هر چانک سه بار بلند گفته شود؛ یک بار در نقش خودتان، یک بار در نقش مقابل و یک بار در موقعیت واقعی روزتان. بعد از هر فصل کارنامه چهار مهارت نشان می‌دهد کدام چانک‌ها تثبیت شده‌اند.",
    ],
    image: "/images/study/s1.jpg",
    author: "المیرا معرفت‌پور",
    date: "۲ مهر ۱۴۰۴",
    readTime: 5,
    tags: ["چانک", "روش Blitz", "مکالمه"],
  },
  {
    id: "po2",
    slug: "goethe-b1-guide",
    title: "راهنمای کامل آزمون Goethe B1: بخش‌ها، نمره‌گذاری و تمرین",
    category: "آزمون‌های رسمی",
    excerpt: "چهار ماژول، معیارهای نمره‌دهی و برنامهٔ تمرین تا روز آزمون.",
    content: [
      "آزمون Goethe B1 چهار ماژول دارد: Lesen، Hören، Schreiben و Sprechen. نمرهٔ قبولی در هر ماژول ۶۰ از ۱۰۰ است و برای مدرک کل، همهٔ ماژول‌ها باید قبول شوند.",
      "بیشترین نقطهٔ سقوط زبان‌آموزان، Sprechen است؛ چون تمرین عمومی کافی نیست. تمرین باید دقیقاً با فرمت آزمون باشد: معرفی، گفتگوی دوباره‌ای و بیان نظر. در BlitzZertifikat همهٔ تمرین‌ها با همین فرمت و با ضبط و بازخورد برگزار می‌شود.",
      "برنامهٔ پیشنهادی: هشت هفته قبل از آزمون، هفته‌ای یک ماژول کامل با تایمر واقعی؛ چهار هفته آخر، دو آزمون آزمایشی کامل با شرایط واقعی. کارنامهٔ تفصیلی بعد از هر آزمون نشان می‌دهد دقیقاً کدام مهارت را باید بیشتر تمرین کنید.",
    ],
    image: "/images/study/s2.jpg",
    author: "سحر گلستانی",
    date: "۲۵ شهریور ۱۴۰۴",
    readTime: 7,
    tags: ["Goethe B1", "آزمون", "BlitzZertifikat"],
  },
  {
    id: "po3",
    slug: "vorstellungsgespraech",
    title: "مصاحبه کاری آلمانی: از Vorstellungsgespräch تا قرارداد",
    category: "آلمانی بازار کار",
    excerpt: "پنج سؤال پرتکرار مصاحبه و چانک‌های پاسخ حرفه‌ای به هر کدام.",
    content: [
      "اولین سؤال هر مصاحبه در آلمان تقریباً همیشه «Erzählen Sie etwas von sich» است. پاسخ حرفه‌ای سه بخش دارد: مسیر تحصیلی، تجربهٔ مرتبط و چرایی این شغل — با سه چانک آماده می‌شود.",
      "سؤال دوم «Was sind Ihre Stärken und Schwächen؟» است؛ برای نقاط ضعف، چانک «قابلیت تبدیل به رشد» را تمرین کنید. سؤال‌های حقوق و شروع کار هم قالب آماده دارند: عبارت‌های مؤدبانهٔ مذاکرهٔ حقوق.",
      "در دوره BlitzJob دو مصاحبه شبیه‌سازی‌شدهٔ کامل با ویدئو و بازخورد خط‌به‌خط انجام می‌شود؛ یعنی روز مصاحبهٔ واقعی، این موقعیت برایتان تکرارشده است، نه اولین‌بار.",
    ],
    image: "/images/study/s3.jpg",
    author: "المیرا معرفت‌پور",
    date: "۱۸ شهریور ۱۴۰۴",
    readTime: 6,
    tags: ["BlitzJob", "مصاحبه کاری", "چانک"],
  },
  {
    id: "po4",
    slug: "online-vs-offline",
    title: "کلاس آنلاین یا حضوری؟ راهنمای انتخاب بر اساس هدف شما",
    category: "مشاوره",
    excerpt: "هدف، برنامهٔ هفتگی و سبک یادگیری؛ سه معیار انتخاب مسیر.",
    content: [
      "پرتکرارترین سؤال مشاورهٔ کلینیک: «آنلاین بهتر است یا حضوری؟» پاسخ صادقانه: بستگی به هدف و برنامهٔ شما دارد. سه معیار تصمیم‌گیری داریم.",
      "معیار اول هدف است: برای مدرک رسمی، BlitzZertifikat آنلاین با آزمون‌های آزمایشی واقعی کفایت می‌کند؛ برای مکالمه، اجرای در نقش حضوری مؤثرتر است. معیار دوم، برنامهٔ هفتگی شماست؛ برای کسانی که کار یا سفر زیاد دارند، ترکیب آنلاین + کلاب مکالمه هفتگی جواب می‌دهد.",
      "معیار سوم سبک یادگیری است. در جلسهٔ تعیین سطح رایگان، این سه معیار را می‌سنجیم و نقشهٔ راه شخصی بلافاصله بعد از جلسه تحویل می‌گیرید.",
    ],
    image: "/images/study/s4.jpg",
    author: "تیم مشاوره کلینیک",
    date: "۱۰ شهریور ۱۴۰۴",
    readTime: 4,
    tags: ["مشاوره", "تعیین سطح"],
  },
  {
    id: "po5",
    slug: "spaced-repetition",
    title: "مرور فاصله‌دار برای واژگان آلمانی: ۳۰ واژه در هفته، برای همیشه",
    category: "روش مطالعه",
    excerpt: "منحنی فراموشی و برنامهٔ ۱۵ دقیقه‌ای روزانه با فلش‌کارت.",
    content: [
      "بدون مرور، تا فردا ۷۰٪ واژهٔ تازه پریده است. راه‌حل علمی، مرور فاصله‌دار است: مرور هر واژه دقیقاً لحظه‌ای که در آستانهٔ فراموشی است.",
      "برنامهٔ عملی: واژهٔ جدید را امروز یاد بگیرید؛ فردا مرور کنید؛ سه روز بعد؛ یک هفته بعد؛ و دو هفته بعد. فلش‌کارت‌های A1 تا B1 کلینیک همین زمان‌بندی را روی کارت‌ها نشان می‌دهند.",
      "نکتهٔ دوم، یادگیری در بافت است. واژهٔ تنها نمی‌ماند؛ واژه در جملهٔ «مال شما» می‌ماند. قانون طلایی: هر واژهٔ جدید را با یک جمله دربارهٔ زندگی خودتان استفاده کنید.",
    ],
    image: "/images/study/s5.jpg",
    author: "آرمان شهبازی",
    date: "۲ شهریور ۱۴۰۴",
    readTime: 5,
    tags: ["واژگان", "روش مطالعه"],
  },
  {
    id: "po6",
    slug: "rollenspiel-method",
    title: "رول‌پلی چطور ترس گفتن را از بین می‌برد؟",
    category: "روش Blitz",
    excerpt: "دو بار تمرین در نقش، یک بار اجرای واقعی — فرمول اعتماد به نفس زبانی.",
    content: [
      "ترسِ اشتباه، بزرگ‌ترین مانع مکالمه است. رول‌پلی این ترس را در محیط امن کلاس خالی می‌کند: اول شما در نقش هستید، بعد نقش عوض می‌شود و در نهایت موقعیت واقعی روزتان تمرین می‌شود.",
      "در کلاب مکالمه BlitzKonversation بیشترِ هر جلسه اجراست؛ مدرس با سؤال‌های پیاپی زبان را از شما می‌خواهد — نه از جزوه. خطاها یادداشت و در پایان به‌شکل بازخورد گروهی برمی‌گردند.",
      "نتیجه در کارنامهٔ جلسه ثبت می‌شود: روانی، دقت و واکنش جداگانه اندازه‌گیری می‌شوند و پیشرفت از جلسه به جلسه قابل دیدن است.",
    ],
    image: "/images/study/s6.jpg",
    author: "امیر فرهادی",
    date: "۲۰ مرداد ۱۴۰۴",
    readTime: 3,
    tags: ["رول‌پلی", "مکالمه", "کلاب مکالمه"],
  },
];

/* ------------------------------ سایر داده‌ها -------------------------- */

export const testimonials: Testimonial[] = [
  { id: "r1", name: "الهام کریمی", course: "دوره آلمانی B1", text: "بعد از دو سال درنگ، با روش چانک بالاخره حرف زدنم روان شد. رول‌پلی‌های هفتگی تفاوت اصلی بود.", rating: 5 },
  { id: "r2", name: "رضا شریفی", course: "BlitzZertifikat", text: "انتظار نداشتم دورهٔ آزمون این‌قدر ساختارمند باشد. دو آزمون آزمایشی کامل و کارنامهٔ تفصیلی؛ در آزمون اصلی Goethe B1 قبول شدم.", rating: 5 },
  { id: "r3", name: "مریم صادقی", course: "دوره آلمانی A1", text: "از صفر شروع کردم؛ دو جلسه اول الفبا و بعد چانک‌های معرفی. حالا در فروشگاه و دکتر به آلمانی جواب می‌دهم.", rating: 5 },
  { id: "r4", name: "آرش نوروزی", course: "دوره آلمانی A1", text: "برای ویزای همراه A1 لازم داشتم؛ سه ماهه قبول شدم. نقشهٔ راه شخصی بعد از تعیین سطح واقعاً به کار آمد.", rating: 4 },
  { id: "r5", name: "سحر بابایی", course: "پکیج مسیر شغلی", text: "BlitzJob + کلاب مکالمه گرفتم؛ مصاحبهٔ شبیه‌سازی‌شده همان‌قدر واقعی بود که در مصاحبهٔ اصلی استرس نداشتم.", rating: 5 },
  { id: "r6", name: "مهدی قاسمی", course: "BlitzJob", text: "واژگان تخصصی بر اساس رشتهٔ من ساخته شد و ایمیل‌های محیط کار قالب آماده دارد. سه ماه اول کارم در آلمان روان گذشت.", rating: 5 },
];

export const honors: Honor[] = [
  { id: "h1", title: "گواهی DLL موسسه گوته", year: "۲۰۲۴", type: "گواهینامه", desc: "گواهی ارزیابی حرفه‌ای بین‌المللی تدریس آلمانی — Deutsche Lehramtsprüfung weiterentwickelt.", image: "/images/teachers/t1.jpg" },
  { id: "h2", title: "گواهی اصول تدریس DSIT تهران", year: "۲۰۲۴", type: "گواهینامه", desc: "گواهی اصول تدریس از مؤسسه زبان آلمانی تهران (DSIT)." },
  { id: "h3", title: "کارگاه ترجمه اسناد حقوقی آلمانی", year: "۲۰۲۴", type: "کارگاه تخصصی", desc: "تخصص ترجمهٔ رسمی اسناد برای پرونده‌های مهاجرتی و کاری." },
  { id: "h4", title: "کارگاه هوش مصنوعی در ترجمه", year: "۲۰۲۴", type: "کارگاه تخصصی", desc: "به‌کارگیری ابزارهای AI در فرایند ترجمه و آموزش." },
  { id: "h5", title: "۱۶ سال تدریس آلمانی", year: "۱۳۸۹–اکنون", type: "سابقهٔ آموزشی", desc: "از کلاس‌های کوچک تا سیستم آموزش کامل روش Blitz با چهار ستون Chunks، Fragen، Rollenspiel و BlitzPerformance." },
  { id: "h6", title: "تولد روش Blitz", year: "۲۰۲۵", type: "نوآوری آموزشی", desc: "تبدیل تجربهٔ فورتبیلدونگ آلمان به متد آموزشی ساختارمند برای سه مسیر BlitzDeutsch، BlitzJob و BlitzZertifikat." },
];

export const stats = [
  { label: "سال تدریس آلمانی", value: 16, suffix: "+" },
  { label: "زبان‌آموز تا امروز", value: 1250, suffix: "+" },
  { label: "ستون روش Blitz", value: 4, suffix: "" },
  { label: "رضایت زبان‌آموزان", value: 96, suffix: "٪" },
];

export const services = [
  { id: "s1", icon: "school", title: "دوره‌های حضوری", desc: "کلاس‌های حضوری با ظرفیت محدود و اجرای در نقش در هر جلسه", href: "/courses" },
  { id: "s2", icon: "video", title: "دوره آنلاین آزمون‌ها", desc: "BlitzZertifikat برای Goethe، ÖSD و TestDaF با آزمون آزمایشی واقعی", href: "/courses" },
  { id: "s3", icon: "package", title: "پکیج‌های مسیر", desc: "بسته‌های ترکیبی دوره + کتاب با قیمت اقتصادی", href: "/courses" },
  { id: "s4", icon: "compass", title: "تعیین سطح و نقشه راه", desc: "جلسه تعیین سطح بر اساس چارچوب A1 تا B2 و نقشهٔ راه شخصی", href: "/placement" },
  { id: "s5", icon: "clipboard", title: "کارنامه فصلی", desc: "گزارش شفاف چهار مهارت بعد از هر فصل", href: "/courses" },
  { id: "s6", icon: "book", title: "فروشگاه کتاب‌ها", desc: "کتاب کار، چانک، فلش‌کارت و بسته‌های آزمون", href: "/shop" },
];

export const processSteps = [
  { n: 1, title: "تعیین سطح", desc: "در جلسهٔ تعیین سطح، چهار مهارت بر اساس چارچوب A1 تا B2 سنجیده می‌شود." },
  { n: 2, title: "نقشه راه شخصی", desc: "نتیجه و نقشهٔ راه شخصی، بلافاصله بعد از جلسه تحویل می‌گیرید." },
  { n: 3, title: "انتخاب دوره", desc: "BlitzDeutsch، BlitzJob یا BlitzZertifikat — متناسب با هدف شما." },
  { n: 4, title: "شروع یادگیری", desc: "هر جلسه با چانک شروع می‌شود و همان جلسه در نقش اجرا می‌شود." },
  { n: 5, title: "تمرین و کارنامه", desc: "بعد از هر فصل، کارنامهٔ شفاف مهارت‌ها را می‌بینید." },
  { n: 6, title: "مدرک یا اشتغال", desc: "آزمون رسمی، مصاحبهٔ کاری یا مسیر بعدی — بسته به هدف شما." },
];

/* -------------------------- داده‌های پنل‌ها -------------------------- */

export interface Video {
  id: string;
  title: string;
  duration: string;
  watched: number; // درصد
  hasQuiz: boolean;
  quiz?: QuizQuestion[];
  passScore?: number;
  locked?: boolean;
}

export interface QuizQuestion {
  q: string;
  options: string[];
  answer: number; // index
  explain: string;
}

export const quizBank: Record<string, QuizQuestion[]> = {
  v1: [
    { q: "در روش Blitz هر مطلب با چه چیزی شروع می‌شود؟", options: ["جدول صرف افعال", "چانک‌های آمادهٔ همان موقعیت", "لیست لغت", "متن بلند خواندنی"], answer: 1, explain: "هر جلسه با مجموعه چانک‌های آمادهٔ همان موقعیت شروع می‌شود — زبان به‌شکل کل، نه لغت پراکنده." },
    { q: "«Ich hätte gern ein Brötchen» چه چانکی است؟", options: ["خداحافظی", "سفارش دادن در نانوایی", "معرفی خود", "پرسیدن مسیر"], answer: 1, explain: "«hätte gern …» چانک اصلی سفارش دادن مؤدبانه در خرید و رستوران است." },
    { q: "بعد از هر فصل چه چیزی می‌گیرید؟", options: ["هیچ‌چیز", "کارنامهٔ شفاف چهار مهارت", "فقط نمرهٔ کلاسی", "گواهی پایان دوره"], answer: 1, explain: "بعد از هر فصل کارنامهٔ شفاف مهارت‌ها را می‌گیرید و می‌دانید کجا ایستاده‌اید." },
    { q: "رول‌پلی در کلاس یعنی چه؟", options: ["خواندن متن", "اجرای موقعیت واقعی در نقش", "نوشتن دیکته", "حفظ قاعده"], answer: 1, explain: "خرید، رزرو، معرفی — هر مطلب همان جلسه در نقش اجرا می‌شود." },
    { q: "الفبای آلمانی چند حرف اضافه بر انگلیسی دارد؟", options: ["هیچ", "۳ حرف (ä، ö، ü) به‌علاوهٔ ß", "۵ حرف", "۱ حرف"], answer: 1, explain: "ä، ö، ü و ß چهار نشان اضافی آلمانی‌اند که در دو جلسهٔ اول تمرین می‌شوند." },
  ],
  v2: [
    { q: "کدام چانک برای معرفی خود درست است؟", options: ["Ich bin aus Iran", "Mir ist kalt", "Das kostet fünf Euro", "Wo ist der Bahnhof؟"], answer: 0, explain: "«Ich bin aus …» چانک معرفی کشور و تبار شماست." },
    { q: "حرف تعریف واژهٔ «Buch» کدام است؟", options: ["der", "die", "das", "den"], answer: 2, explain: "das Buch — اسم‌های خنثی با «das» می‌آیند؛ اسم‌ها همیشه با حرف تعریف حفظ می‌شوند." },
    { q: "«Wie viel kostet das؟» در چه موقعیتی می‌گویید؟", options: ["در اداره", "هنگام پرسیدن قیمت", "در پزشک", "هنگام خداحافظی"], answer: 1, explain: "این چانک برای پرسیدن قیمت است؛ پاسخش با «Das kostet …» می‌آید." },
    { q: "بهترین روش حفظ اسم‌ها در آلمانی چیست؟", options: ["حفظ اسم تنها", "حفظ اسم با حرف تعریف‌اش", "نوشتن ۱۰ بار", "خواندن سریع"], answer: 1, explain: "اسم‌ها را همیشه با حرف تعریف‌شان (der/die/das) حفظ کنید؛ همین عادت نصف دردسر گرامری را حذف می‌کند." },
    { q: "«Entschuldigung» برای چیست؟", options: ["تشکر", "جلب توجه و عذرخواهی", "خداحافظی", "پرسیدن ساعت"], answer: 1, explain: "«Entschuldigung» چانک شروع هر تماس با غریبه است — در اداره، فروشگاه و مسیر." },
  ],
  v3: [
    { q: "افعال جدایی (Trennbare Verben) در جملهٔ اصلی کجا جدا می‌شوند؟", options: ["اول جمله", "پایان جمله به‌شکل پیشوند جدا", "وسط فعل کمکی", "هرگز جدا نمی‌شوند"], answer: 1, explain: "در جملهٔ اصلی، پیشوند از فعل جدا و به پایان جمله می‌رود: «Ich stehe um sieben auf.»" },
    { q: "کدام یک رول‌پلی موقعیت اداری است؟", options: ["سفارش غذا", "Ausbildung و آنتزالت", "خرید بلیت", "دعوت به مهمانی"], answer: 1, explain: "موقعیت‌های اداری مثل آنتزالت و ثبت‌نام در فصل‌های رول‌پلی تمرین می‌شوند." },
    { q: "«ein Termin beim Arzt» یعنی چه؟", options: ["یک بلیت قطار", "یک نوبت پزشک", "یک سفارش خرید", "یک قرارداد کار"], answer: 1, explain: "«Termin» نوبت است؛ رول‌پلی پزشک و داروخانه در فصل پزشکی تمرین می‌شود." },
    { q: "اگر نمره آزمون ویدئو مردود شود چه می‌شود؟", options: ["حساب بسته می‌شود", "ویدئوی بعدی باز نمی‌شود تا تلاش مجدد", "کل دوره ریست می‌شود", "هیچ‌چیز"], answer: 1, explain: "طبق قوانین دوره، ویدئوی بعدی تا قبولی قفل می‌ماند؛ تلاش مجدد آزاد است." },
    { q: "کدام عبارت برای شروع ایمیل رسمی درست است؟", options: ["Hallo du!", "Sehr geehrte Damen und Herren", "Bis bald", "Liebe Oma"], answer: 1, explain: "«Sehr geehrte Damen und Herren» چانک آغاز ایمیل رسمی اداری است." },
  ],
};

export const videos: Video[] = [
  { id: "v1", title: "معرفی دوره و منطق چانک‌ها", duration: "۱۴:۲۲", watched: 100, hasQuiz: true, quiz: quizBank.v1, passScore: 70 },
  { id: "v2", title: "معرفی خود و کشور — چانک‌های Vorstellen", duration: "۲۱:۴۵", watched: 100, hasQuiz: true, quiz: quizBank.v2, passScore: 70 },
  { id: "v3", title: "Einkaufen — خرید، قیمت و سفارش", duration: "۱۸:۰۳", watched: 45, hasQuiz: true, quiz: quizBank.v3, passScore: 70 },
  { id: "v4", title: "Trennbare Verben — افعال جدایی در گفتگو", duration: "۲۲:۱۰", watched: 0, hasQuiz: true, passScore: 70, locked: true },
  { id: "v5", title: "Rollenspiel: در رستوران و داروخانه", duration: "۱۶:۳۸", watched: 0, hasQuiz: true, passScore: 70, locked: true },
];

export interface Assignment {
  id: string;
  courseId: string;
  title: string;
  due: string;
  dueLabel: string;
  status: "new" | "submitted" | "graded" | "late";
  score?: number;
  max: number;
  feedback?: string;
  desc: string;
}

export const assignments: Assignment[] = [
  { id: "a1", courseId: "a1", title: "متن معرفی خود — Vorstellung (۱۰ جمله)", due: "۱۴۰۴/۰۸/۰۵", dueLabel: "۲ روز مانده", status: "new", max: 10, desc: "با چانک‌های جلسهٔ معرفی، ده جمله دربارهٔ خودتان بنویسید: نام، کشور، شغل، خانواده و هدف یادگیری آلمانی." },
  { id: "a2", courseId: "a1", title: "ضبط صوت ۲ دقیقه‌ای: چانک‌های خرید", due: "۱۴۰۴/۰۸/۰۸", dueLabel: "۵ روز مانده", status: "new", max: 10, desc: "رول‌پلی خرید در سوپرمارکت را با ضبط صوت انجام دهید: سلام، پرسیدن قیمت، سفارش و خداحافظی." },
  { id: "a3", courseId: "b1", title: "ایمیل رسمی به Vermieter (صاحب‌خانه)", due: "۱۴۰۴/۰۷/۲۲", dueLabel: "تحویل‌شده", status: "graded", score: 9, max: 10, feedback: "عالی! فقط در پاراگراف دوم می‌توانستید چانک «Sehr geehrte…» را کامل‌تر به‌کار ببرید.", desc: "با قالب ایمیل رسمی فصل اداری، درخواست تعمیر بخاری را بنویسید." },
  { id: "a4", courseId: "b1", title: "ضبط ویدئو: معرفی خانواده", due: "۱۴۰۴/۰۷/۱۸", dueLabel: "دیرکرد", status: "late", max: 10, desc: "با موبایل خود را ضبط کنید و با چانک‌های فصل خانواده، دو دقیقه دربارهٔ خانواده‌تان صحبت کنید." },
];

export interface GradeRow {
  item: string;
  type: string;
  score: number;
  max: number;
  feedback?: string;
}

export const grades: Record<string, GradeRow[]> = {
  a1: [
    { item: "آزمون ویدئوی ۱ (چانک‌ها)", type: "آزمون", score: 90, max: 100 },
    { item: "آزمون ویدئوی ۲ (معرفی)", type: "آزمون", score: 80, max: 100 },
    { item: "تکلیف Vorstellung", type: "تکلیف", score: 9, max: 10, feedback: "بسیار خوب؛ حرف تعریف «das» را در جمله‌های بعدی هم چک کن." },
    { item: "آزمون فصل Einkaufen", type: "آزمون", score: 85, max: 100, feedback: "زمان‌بندی گفتار را رعایت کن." },
  ],
  b1: [
    { item: "آزمون فصل ۱ (بحث و نظر)", type: "آزمون", score: 70, max: 100 },
    { item: "تکلیف ایمیل رسمی", type: "تکلیف", score: 6, max: 10, feedback: "قالب رسمی هنوز تردید دارد؛ چانک‌های فصل اداری را روزانه تمرین کن." },
  ],
};

export interface StudentScheduleItem {
  day: string;
  time: string;
  course: string;
  room: string;
  color: string;
}

export const studentSchedule: StudentScheduleItem[] = [
  { day: "شنبه", time: "۱۷:۳۰–۱۹:۳۰", course: "آلمانی A1", room: "کلاس ۲۰۴ — طبقه دوم", color: "navy" },
  { day: "یکشنبه", time: "۱۰:۰۰–۱۲:۰۰", course: "آلمانی B1", room: "کلاس ۱۰۵ — طبقه اول", color: "yellow" },
  { day: "دوشنبه", time: "۱۷:۳۰–۱۹:۳۰", course: "آلمانی A1", room: "کلاس ۲۰۴ — طبقه دوم", color: "navy" },
  { day: "سه‌شنبه", time: "۱۰:۰۰–۱۲:۰۰", course: "آلمانی B1", room: "کلاس ۱۰۵ — طبقه اول", color: "yellow" },
  { day: "چهارشنبه", time: "۱۹:۰۰–۲۰:۳۰", course: "کلاب مکالمه", room: "اتاق سمینار", color: "green" },
];

export interface StudentRow {
  id: string;
  name: string;
  phone: string;
  course: string;
  attendance: number;
  avg: number;
  status: "فعال" | "غیرفعال" | "در انتظار پرداخت";
  balance: number;
}

export const students: StudentRow[] = [
  { id: "st1", name: "الهام کریمی", phone: "۰۹۱۲۳۴۵۶۷۸۹", course: "آلمانی B1", attendance: 92, avg: 18.4, status: "فعال", balance: 0 },
  { id: "st2", name: "رضا شریفی", phone: "۰۹۳۵۱۱۲۲۳۳۴", course: "BlitzZertifikat", attendance: 100, avg: 19.2, status: "فعال", balance: 0 },
  { id: "st3", name: "مریم صادقی", phone: "۰۹۰۲۷۷۸۸۹۹۰۰", course: "آلمانی A1", attendance: 85, avg: 17.8, status: "فعال", balance: 0 },
  { id: "st4", name: "آرش نوروزی", phone: "۰۹۱۹۸۸۷۷۶۶۵", course: "آلمانی A1", attendance: 64, avg: 15.1, status: "فعال", balance: 1800000 },
  { id: "st5", name: "سحر بابایی", phone: "۰۹۱۲۱۲۳۴۵۶۷", course: "BlitzJob", attendance: 0, avg: 0, status: "در انتظار پرداخت", balance: 9900000 },
  { id: "st6", name: "مهدی قاسمی", phone: "۰۹۳۵۵۵۵۴۴۳۳", course: "BlitzJob", attendance: 100, avg: 18.9, status: "فعال", balance: 0 },
  { id: "st7", name: "نگار موسوی", phone: "۰۹۰۱۹۹۹۸۸۷۷", course: "آلمانی B1", attendance: 78, avg: 16.5, status: "فعال", balance: 0 },
  { id: "st8", name: "کیوان رستمی", phone: "۰۹۱۴۴۵۵۶۶۷۷", course: "کلاب مکالمه", attendance: 40, avg: 14.2, status: "غیرفعال", balance: 0 },
];

export interface Consultation {
  id: string;
  name: string;
  phone: string;
  language: string;
  level: string;
  goal: string;
  time: string;
  status: "جدید" | "در حال پیگیری" | "پیشنهاد ارسال‌شده" | "ثبت‌نام‌شده" | "لغو";
  note?: string;
  date: string;
}

export const consultations: Consultation[] = [
  { id: "c1", name: "فاطمه ابراهیمی", phone: "۰۹۱۲۳۴۵۶۷۰۰", language: "آلمانی", level: "مقدماتی", goal: "ویزای همراه — آزمون A1", time: "عصر — بعد از ۱۷", status: "جدید", date: "۲۸ مهر" },
  { id: "c2", name: "علی پاکدل", phone: "۰۹۳۵۱۱۲۲۳۰۰", language: "آلمانی", level: "مقدماتی", goal: "ویزای کار آلمان", time: "صبح", status: "در حال پیگیری", note: "تماس اول انجام شد؛ منتظر تأیید بودجه.", date: "۲۷ مهر" },
  { id: "c3", name: "زهرا حسینی", phone: "۰۹۰۲۷۷۸۸۹۹۱۱", language: "آلمانی", level: "متوسط", goal: "مهاجرت تحصیلی — TestDaF", time: "هر زمان", status: "پیشنهاد ارسال‌شده", note: "پیش‌فاکتور BlitzZertifikat ارسال شد.", date: "۲۵ مهر" },
  { id: "c4", name: "حسین یزدانی", phone: "۰۹۱۹۸۸۷۷۶۶۰۰", language: "آلمانی", level: "متوسط", goal: "اشتغال در آلمان — BlitzJob", time: "ظهر", status: "ثبت‌نام‌شده", note: "پرداخت آنلاین انجام شد.", date: "۲۲ مهر" },
  { id: "c5", name: "سمیرا جلالی", phone: "۰۹۱۲۱۲۳۴۵۰۰", language: "آلمانی", level: "مقدماتی", goal: "سفر و علاقهٔ شخصی", time: "شب", status: "لغو", note: "فعلاً منصرف شد؛ برای دورهٔ بعد تماس بگیریم.", date: "۱۹ مهر" },
];

export interface Invoice {
  id: string;
  student: string;
  items: string;
  amount: number;
  status: "پرداخت‌شده" | "در انتظار" | "منقضی";
  link: string;
  expires: string;
}

export const invoices: Invoice[] = [
  { id: "PF-1041", student: "حسین یزدانی", items: "دورهٔ BlitzJob", amount: 12400000, status: "پرداخت‌شده", link: "pay.edc-clinic.ir/pf1041", expires: "—" },
  { id: "PF-1042", student: "زهرا حسینی", items: "BlitzZertifikat (TestDaF)", amount: 13800000, status: "در انتظار", link: "pay.edc-clinic.ir/pf1042", expires: "۳۰ مهر ۱۴۰۴" },
  { id: "PF-1043", student: "آرش نوروزی", items: "قسط دوم — آلمانی A1", amount: 1800000, status: "منقضی", link: "pay.edc-clinic.ir/pf1043", expires: "۲۴ مهر ۱۴۰۴" },
];

export interface ShopOrder {
  id: string;
  customer: string;
  items: string;
  total: number;
  payment: "پرداخت‌شده" | "در انتظار پرداخت";
  shipping: "در حال آماده‌سازی" | "ارسال‌شده" | "تحویل‌شده";
  tracking?: string;
  date: string;
}

export const shopOrders: ShopOrder[] = [
  { id: "SO-2201", customer: "الهام کریمی", items: "کتاب کار Blitz آلمانی A2", total: 420000, payment: "پرداخت‌شده", shipping: "در حال آماده‌سازی", date: "۲۹ مهر" },
  { id: "SO-2202", customer: "مهدی قاسمی", items: "جزوه‌های تمرینی BlitzJob", total: 310000, payment: "پرداخت‌شده", shipping: "ارسال‌شده", tracking: "۲۳۴۵۶۷۸۹", date: "۲۷ مهر" },
  { id: "SO-2203", customer: "نگار موسوی", items: "فلش‌کارت واژگان A1 تا B1", total: 240000, payment: "در انتظار پرداخت", shipping: "در حال آماده‌سازی", date: "۲۶ مهر" },
  { id: "SO-2204", customer: "رضا شریفی", items: "بستهٔ آزمون‌های آزمایشی Goethe B1", total: 350000, payment: "پرداخت‌شده", shipping: "تحویل‌شده", tracking: "۲۳۴۵۶۷۱۲", date: "۲۰ مهر" },
];

export const revenueMonthly = [
  { month: "اردیبهشت", دوره: 168, فروشگاه: 22, پکیج: 45 },
  { month: "خرداد", دوره: 185, فروشگاه: 28, پکیج: 52 },
  { month: "تیر", دوره: 150, فروشگاه: 19, پکیج: 38 },
  { month: "مرداد", دوره: 172, فروشگاه: 25, پکیج: 47 },
  { month: "شهریور", دوره: 210, فروشگاه: 34, پکیج: 61 },
  { month: "مهر", دوره: 248, فروشگاه: 41, پکیج: 74 },
];

export const notificationsStudent = [
  { id: "n1", title: "نمرهٔ تکلیف ایمیل رسمی ثبت شد", desc: "استاد: بازخورد جدید دارد.", time: "۱ ساعت پیش", unread: true, icon: "grade" },
  { id: "n2", title: "کلاس فردا یادت نره", desc: "آلمانی A1 — شنبه ۱۷:۳۰، کلاس ۲۰۴", time: "۳ ساعت پیش", unread: true, icon: "class" },
  { id: "n3", title: "تکلیف جدید اضافه شد", desc: "ضبط صوت چانک‌های خرید — مهلت ۸ آبان", time: "دیروز", unread: false, icon: "task" },
  { id: "n4", title: "پیام پشتیبانی", desc: "پاسخ سؤال شما درباره تمدید دسترسی.", time: "۲ روز پیش", unread: false, icon: "message" },
];

export const feedbackComments = [
  { id: "f1", student: "الهام کریمی", course: "آلمانی B1", score: 5, text: "صبور و دقیق؛ بازخورد خط‌به‌خط ایمیل‌های اداری واقعاً نجات‌بخش بود.", criteria: { تدریس: 5, نظم: 5, پاسخ‌گویی: 5 } },
  { id: "f2", student: "نگار موسوی", course: "آلمانی B1", score: 4, text: "کلاس خوب بود ولی آرزو می‌کردم رول‌پلی‌ها ضبط هم بشه.", criteria: { تدریس: 5, نظم: 4, پاسخ‌گویی: 3 } },
  { id: "f3", student: "کیوان رستمی", course: "کلاب مکالمه", score: 5, text: "بهترین بخش هفته‌ام؛ بدون ترس اشتباه به آلمانی صحبت می‌کنم.", criteria: { تدریس: 5, نظم: 4, پاسخ‌گویی: 5 } },
];

export const todayClassesTeacher = [
  { id: "tc1", title: "آلمانی A1 — جلسه ۱۹", time: "۱۷:۳۰–۱۹:۳۰", room: "کلاس ۲۰۴", students: 11, attendanceDone: false },
  { id: "tc2", title: "آلمانی B1 — جلسه ۲۲", time: "۱۰:۰۰–۱۲:۰۰", room: "کلاس ۱۰۵", students: 9, attendanceDone: true },
];
