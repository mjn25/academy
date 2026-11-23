/* ------------------------------------------------------------------ */
/*  استور سراسری — منبع واحد حقیقت برای هر سه پنل                      */
/*  هر تغییری در یک پنل، بلافاصله در دو پنل دیگر هم دیده می‌شود.        */
/* ------------------------------------------------------------------ */

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  courses as coursesSeed,
  students as studentsSeed,
  teachers as teachersSeed,
  assignments as assignmentsSeed,
  invoices as invoicesSeed,
} from "@/lib/data";

/* ------------------------------- Types ------------------------------- */

export type UserStatus = "فعال" | "غیرفعال" | "در انتظار پرداخت";

export interface StoreStudent {
  id: string;
  name: string;
  phone: string;
  email: string;
  status: UserStatus;
  balance: number;
  courseIds: string[];
  attendance: number;
  avg: number;
  joinedAt: string;
}

export interface StoreTeacher {
  id: string;
  name: string;
  title: string;
  phone: string;
  email: string;
  degree: string;
  experience: number;
  rating: number;
  bio: string;
  image: string;
  languages: string[];
  status: "فعال" | "غیرفعال";
  courseIds: string[];
}

export interface StoreCourse {
  id: string;
  title: string;
  language: string;
  level: string;
  type: "online" | "offline";
  teacherId: string | null;
  studentIds: string[];
  capacity?: number;
  enrolled: number;
  price: number;
  schedule?: string;
  status: "فعال" | "پیش‌نویس";
  sessions: number;
  startDate?: string;
}

export interface StoreAssignment {
  id: string;
  courseId: string;
  title: string;
  desc: string;
  due: string;
  max: number;
  createdByRole: "admin" | "teacher";
  createdByName: string;
  createdAt: string;
}

export interface StoreSubmission {
  id: string;
  assignmentId: string;
  studentId: string;
  text?: string;
  file?: string;
  submittedAt: string;
  late: boolean;
  status: "در انتظار بررسی" | "نمره‌داده‌شده";
  score?: number;
  feedback?: string;
}

/** فایل‌های پیوست تکلیف — تمرین‌ها و ویدئوهایی که هر سه نقش آپلود می‌کنند */
export type MaterialKind = "exercise" | "video";

export interface StoreMaterial {
  id: string;
  assignmentId: string;
  /** اگر توسط دانشجو آپلود شده باشد، شناسه او */
  studentId?: string;
  kind: MaterialKind;
  name: string;
  /** اندازه‌ی خوانا، مثلاً «۲.۴ MB» */
  size?: string;
  uploadedByRole: "admin" | "teacher" | "student";
  uploadedByName: string;
  uploadedAt: string;
}

export interface StoreInvoice {
  id: string;
  studentId: string;
  studentName: string;
  items: string;
  amount: number;
  status: "پرداخت‌شده" | "در انتظار" | "منقضی";
  link: string;
  expires: string;
}

/** پرداخت‌های دستی ثبت‌شده توسط مدیریت (اقساط نقدی / کارتخوان / کارت به کارت) */
export interface StorePayment {
  id: string;
  studentId: string;
  amount: number;
  note: string;
  method: "نقدی" | "کارتخوان" | "کارت به کارت" | "لینک پرداخت";
  date: string;
}

export interface ActivityItem {
  id: string;
  text: string;
  actor: string;
  role: "admin" | "teacher" | "student" | "system";
  time: string;
  href?: string;
}

/* ------------------------------ Identity ----------------------------- */

/** کاربر فعلی دمو */
export const CURRENT_STUDENT_ID = "st9"; // سارا محمدی
export const CURRENT_TEACHER_ID = "t1"; // المیرا معرفت‌پور

/* ------------------------------ ID helper ---------------------------- */

/** شناسه یکتا — مقاوم در برابر ری‌لود و بازیابی از localStorage */
const nid = (prefix: string) =>
  `${prefix}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;

/* ------------------------------- Seeding ----------------------------- */

const titleToCourseId: Record<string, string> = {
  "آلمانی A1": "a1",
  "آلمانی A2": "a2",
  "آلمانی B1": "b1",
  "BlitzJob": "blitzjob",
  "BlitzZertifikat": "zertifikat",
  "کلاب مکالمه": "konversation",
};

const seedStudents: StoreStudent[] = [
  ...studentsSeed.map<StoreStudent>((s) => ({
    id: s.id,
    name: s.name,
    phone: s.phone,
    email: `${s.id}@edc-clinic.ir`,
    status: s.status,
    balance: s.balance,
    courseIds: titleToCourseId[s.course] ? [titleToCourseId[s.course]] : [],
    attendance: s.attendance,
    avg: s.avg,
    joinedAt: "مهر ۱۴۰۴",
  })),
  {
    id: CURRENT_STUDENT_ID,
    name: "سارا محمدی",
    phone: "۰۹۱۲۳۴۵۶۷۸۱",
    email: "sara@edc-clinic.ir",
    status: "فعال",
    balance: 0,
    courseIds: ["a1", "b1", "konversation"],
    attendance: 96,
    avg: 18.7,
    joinedAt: "شهریور ۱۴۰۴",
  },
];

const teacherContacts: Record<string, { phone: string; email: string }> = {
  t1: { phone: "۰۹۱۲۱۱۱۰۰۱۱", email: "elmira@edc-clinic.ir" },
  t2: { phone: "۰۹۱۲۱۱۱۰۰۲۲", email: "a.shahbazi@edc-clinic.ir" },
  t3: { phone: "۰۹۱۲۱۱۱۰۰۳۳", email: "s.golestani@edc-clinic.ir" },
  t4: { phone: "۰۹۱۲۱۱۱۰۰۴۴", email: "a.farhadi@edc-clinic.ir" },
};

const seedTeachers: StoreTeacher[] = teachersSeed.map<StoreTeacher>((t) => ({
  id: t.id,
  name: t.name,
  title: t.title,
  phone: teacherContacts[t.id]?.phone ?? "—",
  email: teacherContacts[t.id]?.email ?? "info@edc-clinic.ir",
  degree: t.degree,
  experience: t.experience,
  rating: t.rating,
  bio: t.bio,
  image: t.image,
  languages: t.languages,
  status: "فعال",
  courseIds: [...t.courses],
}));

const seedCourses: StoreCourse[] = coursesSeed.map<StoreCourse>((c) => {
  const roster = seedStudents.filter((s) => s.courseIds.includes(c.id)).map((s) => s.id);
  return {
    id: c.id,
    title: c.title,
    language: c.language,
    level: c.level,
    type: c.type,
    teacherId: c.teacherId,
    studentIds: roster,
    capacity: c.capacity,
    enrolled: Math.max(c.enrolled ?? 0, roster.length),
    price: c.price,
    schedule: c.schedule,
    status: "فعال",
    sessions: c.sessions,
    startDate: c.startDate,
  };
});

const teacherNameOf = (courseId: string) => {
  const c = coursesSeed.find((x) => x.id === courseId);
  const t = teachersSeed.find((x) => x.id === c?.teacherId);
  return t?.name ?? "مدیریت";
};

const seedAssignments: StoreAssignment[] = assignmentsSeed.map<StoreAssignment>((a) => ({
  id: a.id,
  courseId: a.courseId,
  title: a.title,
  desc: a.desc,
  due: a.due,
  max: a.max,
  createdByRole: "teacher",
  createdByName: teacherNameOf(a.courseId),
  createdAt: "۱۴۰۴/۰۷/۲۰",
}));

const seedSubmissions: StoreSubmission[] = [
  { id: "sub1", assignmentId: "a1", studentId: "st1", text: "پاسخ متنی ارسال شد.", file: "elham-vorstellung.pdf", submittedAt: "۱۴۰۴/۰۸/۰۲ — ۲۱:۱۰", late: false, status: "در انتظار بررسی" },
  { id: "sub2", assignmentId: "a1", studentId: "st2", file: "reza-vorstellung.pdf", submittedAt: "۱۴۰۴/۰۸/۰۲ — ۱۸:۴۵", late: false, status: "در انتظار بررسی" },
  { id: "sub3", assignmentId: "a1", studentId: "st7", file: "negar-vorstellung.pdf", submittedAt: "۱۴۰۴/۰۸/۰۳ — ۱۰:۰۲", late: false, status: "در انتظار بررسی" },
  { id: "sub4", assignmentId: "a1", studentId: CURRENT_STUDENT_ID, text: "متن معرفی خودم با چانک‌های جلسه…", file: "sara-vorstellung.pdf", submittedAt: "۱۴۰۴/۰۸/۰۳ — ۲۰:۳۰", late: false, status: "در انتظار بررسی" },
  { id: "sub5", assignmentId: "a3", studentId: CURRENT_STUDENT_ID, text: "ایمیل رسمی به Vermieter…", submittedAt: "۱۴۰۴/۰۷/۲۱ — ۱۹:۰۰", late: false, status: "نمره‌داده‌شده", score: 9, feedback: "عالی! فقط در پاراگراف دوم می‌توانستید چانک «Sehr geehrte…» را کامل‌تر به‌کار ببرید." },
  { id: "sub6", assignmentId: "a3", studentId: "st4", file: "arash-email.docx", submittedAt: "۱۴۰۴/۰۷/۲۱ — ۲۲:۱۵", late: true, status: "نمره‌داده‌شده", score: 7.5, feedback: "دیرکرد؛ ولی محتوا قابل قبول است." },
  { id: "sub7", assignmentId: "a4", studentId: "st1", file: "elham-familie-video.mp4", submittedAt: "۱۴۰۴/۰۷/۲۰ — ۱۵:۰۰", late: true, status: "در انتظار بررسی" },
];

const seedMaterials: StoreMaterial[] = [
  { id: "mat1", assignmentId: "a1", kind: "exercise", name: "vorstellung-chunks-worksheet.pdf", size: "۱.۲ MB", uploadedByRole: "teacher", uploadedByName: teacherNameOf("a1"), uploadedAt: "۱۴۰۴/۰۷/۳۰" },
  { id: "mat2", assignmentId: "a1", kind: "video", name: "vorstellen-rollenspiel-demo.mp4", size: "۴۸ MB", uploadedByRole: "teacher", uploadedByName: teacherNameOf("a1"), uploadedAt: "۱۴۰۴/۰۷/۳۰" },
  { id: "mat3", assignmentId: "a1", studentId: CURRENT_STUDENT_ID, kind: "video", name: "sara-vorstellung-uebung.mp4", size: "۳۶ MB", uploadedByRole: "student", uploadedByName: "سارا محمدی", uploadedAt: "۱۴۰۴/۰۸/۰۳" },
  { id: "mat4", assignmentId: "a4", kind: "video", name: "familie-chunks-lesson.mp4", size: "۶۲ MB", uploadedByRole: "admin", uploadedByName: "المیرا معرفت‌پور", uploadedAt: "۱۴۰۴/۰۷/۱۸" },
];

const seedInvoices: StoreInvoice[] = invoicesSeed.map<StoreInvoice>((inv) => ({
  id: inv.id,
  studentId: seedStudents.find((s) => s.name === inv.student)?.id ?? "st1",
  studentName: inv.student,
  items: inv.items,
  amount: inv.amount,
  status: inv.status,
  link: inv.link,
  expires: inv.expires,
}));

const seedPayments: StorePayment[] = [
  { id: "pay1", studentId: "st4", amount: 1800000, note: "قسط اول — آلمانی A1", method: "نقدی", date: "۱۴۰۴/۰۷/۱۰" },
  { id: "pay2", studentId: "st1", amount: 5400000, note: "قسط ۱ — آلمانی B1", method: "کارتخوان", date: "۱۴۰۴/۰۷/۰۲" },
  { id: "pay3", studentId: "st5", amount: 2100000, note: "پیش‌پرداخت پکیج مسیر شغلی", method: "کارت به کارت", date: "۱۴۰۴/۰۶/۲۸" },
];

const seedActivity: ActivityItem[] = [
  { id: "ac1", text: "تکلیف «متن معرفی خود — Vorstellung» برای دورهٔ آلمانی A1 ایجاد شد", actor: teacherNameOf("a1"), role: "teacher", time: "۲ ساعت پیش", href: "/admin/classes" },
  { id: "ac2", text: "پاسخ تکلیف معرفی خود تحویل شد", actor: "سارا محمدی", role: "student", time: "۳ ساعت پیش", href: "/admin/classes" },
  { id: "ac3", text: "پیش‌فاکتور PF-1042 صادر و لینک پرداخت ارسال شد", actor: "المیرا معرفت‌پور", role: "admin", time: "دیروز", href: "/admin/students" },
  { id: "ac4", text: "نمرهٔ تکلیف ایمیل رسمی برای ۲ دانشجو ثبت شد", actor: teacherNameOf("b1"), role: "teacher", time: "دیروز", href: "/admin/classes" },
];

/* -------------------------------- Store ------------------------------ */

interface AppState {
  students: StoreStudent[];
  teachers: StoreTeacher[];
  courses: StoreCourse[];
  assignments: StoreAssignment[];
  submissions: StoreSubmission[];
  /** تمرین‌ها و ویدئوهای هر تکلیف — از هر سه پنل قابل آپلود */
  materials: StoreMaterial[];
  invoices: StoreInvoice[];
  payments: StorePayment[];
  activity: ActivityItem[];

  /* کاربران */
  addStudent: (s: Partial<StoreStudent> & { name: string }) => string;
  updateStudent: (id: string, patch: Partial<StoreStudent>) => void;
  setStudentStatus: (id: string, status: UserStatus) => void;
  addTeacher: (t: Partial<StoreTeacher> & { name: string }) => string;
  updateTeacher: (id: string, patch: Partial<StoreTeacher>) => void;
  setTeacherStatus: (id: string, status: "فعال" | "غیرفعال") => void;

  /* دوره‌ها */
  addCourse: (c: Partial<StoreCourse> & { title: string }) => string;
  updateCourse: (id: string, patch: Partial<StoreCourse>) => void;
  setCourseTeacher: (courseId: string, teacherId: string | null) => void;
  addStudentToCourse: (courseId: string, studentId: string) => void;
  removeStudentFromCourse: (courseId: string, studentId: string) => void;

  /* تکالیف */
  addAssignment: (a: { courseId: string; title: string; desc: string; due: string; max: number; createdByRole: "admin" | "teacher"; createdByName: string }) => string;
  updateAssignment: (id: string, patch: Partial<StoreAssignment>) => void;
  deleteAssignment: (id: string) => void;

  /* تمرین‌ها و ویدئوها */
  addMaterial: (m: { assignmentId: string; studentId?: string; kind: MaterialKind; name: string; size?: string; uploadedByRole: StoreMaterial["uploadedByRole"]; uploadedByName: string }) => string;
  removeMaterial: (assignmentId: string, materialId: string) => void;

  /* پاسخ‌ها و نمره‌دهی */
  submitAnswer: (s: { assignmentId: string; studentId: string; text?: string; file?: string; late?: boolean }) => void;
  gradeSubmission: (id: string, g: { score: number; feedback?: string; byName?: string; byRole?: "admin" | "teacher" }) => void;

  /* مالی */
  addInvoice: (i: { studentId: string; items: string; amount: number; expires: string }) => string;
  markInvoicePaid: (id: string) => void;
  /** ثبت دستی پرداخت قسط توسط مدیریت — مانده حساب دانشجو را کم می‌کند */
  addManualPayment: (p: { studentId: string; amount: number; note?: string; method?: StorePayment["method"]; date?: string }) => void;

  /* فعالیت */
  pushActivity: (a: Omit<ActivityItem, "id" | "time"> & { time?: string }) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
  students: seedStudents,
  teachers: seedTeachers,
  courses: seedCourses,
  assignments: seedAssignments,
  submissions: seedSubmissions,
  materials: seedMaterials,
  invoices: seedInvoices,
  payments: seedPayments,
  activity: seedActivity,

  addStudent: (s) => {
    const id = nid("st");
    set((st) => ({
      students: [
        ...st.students,
        {
          id,
          name: s.name,
          phone: s.phone ?? "—",
          email: s.email ?? "",
          status: s.status ?? "فعال",
          balance: s.balance ?? 0,
          courseIds: s.courseIds ?? [],
          attendance: s.attendance ?? 100,
          avg: s.avg ?? 0,
          joinedAt: s.joinedAt ?? "آبان ۱۴۰۴",
        },
      ],
      activity: [
        { id: nid("ac"), text: `دانشجوی جدید «${s.name}» ثبت‌نام شد`, actor: "المیرا معرفت‌پور", role: "admin", time: "همین حالا", href: `/admin/students/${id}` },
        ...st.activity,
      ],
    }));
    return id;
  },

  updateStudent: (id, patch) =>
    set((st) => ({
      students: st.students.map((s) => (s.id === id ? { ...s, ...patch } : s)),
      activity:
        patch.name || patch.phone || patch.email || patch.status
          ? [
              { id: nid("ac"), text: `پرونده دانشجوی «${st.students.find((s) => s.id === id)?.name ?? id}» ویرایش شد`, actor: "المیرا معرفت‌پور", role: "admin", time: "همین حالا", href: `/admin/students/${id}` },
              ...st.activity,
            ]
          : st.activity,
    })),

  setStudentStatus: (id, status) => {
    get().updateStudent(id, { status });
  },

  addTeacher: (t) => {
    const id = nid("t");
    set((st) => ({
      teachers: [
        ...st.teachers,
        {
          id,
          name: t.name,
          title: t.title ?? "مدرس",
          phone: t.phone ?? "—",
          email: t.email ?? "",
          degree: t.degree ?? "—",
          experience: t.experience ?? 1,
          rating: t.rating ?? 5,
          bio: t.bio ?? "",
          image: t.image ?? "/images/teachers/t2.jpg",
          languages: t.languages ?? ["آلمانی"],
          status: t.status ?? "فعال",
          courseIds: t.courseIds ?? [],
        },
      ],
      activity: [
        { id: nid("ac"), text: `استاد جدید «${t.name}» اضافه شد`, actor: "المیرا معرفت‌پور", role: "admin", time: "همین حالا", href: `/admin/teachers/${id}` },
        ...st.activity,
      ],
    }));
    return id;
  },

  updateTeacher: (id, patch) =>
    set((st) => ({
      teachers: st.teachers.map((t) => (t.id === id ? { ...t, ...patch } : t)),
      activity: [
        { id: nid("ac"), text: `اطلاعات استاد «${st.teachers.find((t) => t.id === id)?.name ?? id}» به‌روزرسانی شد`, actor: "المیرا معرفت‌پور", role: "admin", time: "همین حالا", href: `/admin/teachers/${id}` },
        ...st.activity,
      ],
    })),

  setTeacherStatus: (id, status) => {
    get().updateTeacher(id, { status });
  },

  addCourse: (c) => {
    const id = nid("cs");
    set((st) => ({
      courses: [
        ...st.courses,
        {
          id,
          title: c.title,
          language: c.language ?? "آلمانی",
          level: c.level ?? "مقدماتی",
          type: c.type ?? "offline",
          teacherId: c.teacherId ?? null,
          studentIds: [],
          capacity: c.capacity,
          enrolled: 0,
          price: c.price ?? 0,
          schedule: c.schedule,
          status: c.status ?? "پیش‌نویس",
          sessions: c.sessions ?? 16,
        },
      ],
      activity: [
        { id: nid("ac"), text: `دوره جدید «${c.title}» ساخته شد`, actor: "المیرا معرفت‌پور", role: "admin", time: "همین حالا", href: `/admin/classes/${id}` },
        ...st.activity,
      ],
    }));
    return id;
  },

  updateCourse: (id, patch) =>
    set((st) => ({
      courses: st.courses.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    })),

  setCourseTeacher: (courseId, teacherId) => {
    const state = get();
    const course = state.courses.find((c) => c.id === courseId);
    const teacher = state.teachers.find((t) => t.id === teacherId);
    set((st) => ({
      courses: st.courses.map((c) => (c.id === courseId ? { ...c, teacherId } : c)),
      teachers: st.teachers.map((t) => {
        if (t.id === teacherId && !t.courseIds.includes(courseId)) return { ...t, courseIds: [...t.courseIds, courseId] };
        if (!teacherId || (teacher && t.id !== teacherId && t.courseIds.includes(courseId) && course?.teacherId === t.id))
          return { ...t, courseIds: t.courseIds.filter((x) => x !== courseId) };
        return t;
      }),
      activity: [
        {
          id: nid("ac"),
          text: teacher ? `استاد «${teacher.name}» به دوره «${course?.title ?? courseId}» تخصیص یافت` : `استاد دوره «${course?.title ?? courseId}» برداشته شد`,
          actor: "المیرا معرفت‌پور",
          role: "admin",
          time: "همین حالا",
          href: `/admin/classes/${courseId}`,
        },
        ...st.activity,
      ],
    }));
  },

  addStudentToCourse: (courseId, studentId) => {
    const state = get();
    const course = state.courses.find((c) => c.id === courseId);
    if (!course) return;
    const already = state.students.find((s) => s.id === studentId)?.courseIds.includes(courseId);
    set((st) => ({
      courses: st.courses.map((c) =>
        c.id === courseId && !c.studentIds.includes(studentId)
          ? { ...c, studentIds: [...c.studentIds, studentId], enrolled: c.enrolled + 1 }
          : c
      ),
      students: st.students.map((s) =>
        s.id === studentId && !s.courseIds.includes(courseId)
          ? { ...s, courseIds: [...s.courseIds, courseId], balance: s.balance + course.price }
          : s
      ),
      activity: already
        ? st.activity
        : [
            {
              id: nid("ac"),
              text: `«${st.students.find((s) => s.id === studentId)?.name ?? "دانشجو"}» در دوره «${course.title}» ثبت‌نام شد`,
              actor: "المیرا معرفت‌پور",
              role: "admin",
              time: "همین حالا",
              href: `/admin/students/${studentId}`,
            },
            ...st.activity,
          ],
    }));
  },

  removeStudentFromCourse: (courseId, studentId) => {
    const course = get().courses.find((c) => c.id === courseId);
    set((st) => ({
      courses: st.courses.map((c) =>
        c.id === courseId && c.studentIds.includes(studentId)
          ? { ...c, studentIds: c.studentIds.filter((x) => x !== studentId), enrolled: Math.max(0, c.enrolled - 1) }
          : c
      ),
      students: st.students.map((s) =>
        s.id === studentId
          ? { ...s, courseIds: s.courseIds.filter((x) => x !== courseId), balance: Math.max(0, s.balance - (course?.price ?? 0)) }
          : s
      ),
    }));
  },

  addAssignment: (a) => {
    const id = nid("as");
    set((st) => ({
      assignments: [
        ...st.assignments,
        { ...a, id, createdAt: "۱۴۰۴/۰۸/۰۴", due: a.due || "—" },
      ],
      activity: [
        {
          id: nid("ac"),
          text: `تکلیف «${a.title}» برای دوره «${st.courses.find((c) => c.id === a.courseId)?.title ?? a.courseId}» تخصیص داده شد`,
          actor: a.createdByName,
          role: a.createdByRole,
          time: "همین حالا",
          href: `/admin/classes/${a.courseId}`,
        },
        ...st.activity,
      ],
    }));
    return id;
  },

  updateAssignment: (id, patch) =>
    set((st) => ({
      assignments: st.assignments.map((a) => (a.id === id ? { ...a, ...patch } : a)),
    })),

  deleteAssignment: (id) =>
    set((st) => ({
      assignments: st.assignments.filter((a) => a.id !== id),
      submissions: st.submissions.filter((s) => s.assignmentId !== id),
      materials: st.materials.filter((m) => m.assignmentId !== id),
      activity: [
        { id: nid("ac"), text: `تکلیف «${st.assignments.find((a) => a.id === id)?.title ?? id}» حذف شد`, actor: "المیرا معرفت‌پور", role: "admin", time: "همین حالا" },
        ...st.activity,
      ],
    })),

  addMaterial: (m) => {
    const id = nid("mat");
    set((st) => {
      const asg = st.assignments.find((a) => a.id === m.assignmentId);
      const kindFa = m.kind === "video" ? "ویدئو" : "تمرین";
      return {
        materials: [
          ...st.materials,
          { ...m, id, uploadedAt: "همین حالا" },
        ],
        activity: [
          {
            id: nid("ac"),
            text: `${kindFa} «${m.name}» به تکلیف «${asg?.title ?? m.assignmentId}» اضافه شد`,
            actor: m.uploadedByName,
            role: m.uploadedByRole,
            time: "همین حالا",
            href: m.uploadedByRole === "student" ? `/student/assignments/${m.assignmentId}` : m.uploadedByRole === "teacher" ? `/teacher/assignments/${m.assignmentId}` : `/admin/classes/${asg?.courseId ?? ""}`,
          },
          ...st.activity,
        ],
      };
    });
    return id;
  },

  removeMaterial: (assignmentId, materialId) =>
    set((st) => ({
      materials: st.materials.filter((m) => !(m.id === materialId && m.assignmentId === assignmentId)),
    })),

  submitAnswer: (s) =>
    set((st) => {
      const existing = st.submissions.find((x) => x.assignmentId === s.assignmentId && x.studentId === s.studentId);
      const asg = st.assignments.find((a) => a.id === s.assignmentId);
      if (existing) {
        return {
          submissions: st.submissions.map((x) =>
            x.id === existing.id
              ? { ...x, text: s.text ?? x.text, file: s.file ?? x.file, submittedAt: "همین حالا", status: "در انتظار بررسی" as const }
              : x
          ),
          activity: [
            { id: nid("ac"), text: `پاسخ تکلیف «${asg?.title ?? s.assignmentId}» به‌روزرسانی شد`, actor: st.students.find((x) => x.id === s.studentId)?.name ?? "دانشجو", role: "student", time: "همین حالا", href: `/admin/classes/${asg?.courseId ?? ""}` },
            ...st.activity,
          ],
        };
      }
      return {
        submissions: [
          ...st.submissions,
          {
            id: nid("sub"),
            assignmentId: s.assignmentId,
            studentId: s.studentId,
            text: s.text,
            file: s.file,
            submittedAt: "همین حالا",
            late: s.late ?? false,
            status: "در انتظار بررسی",
          },
        ],
        activity: [
          { id: nid("ac"), text: `پاسخ جدید برای تکلیف «${asg?.title ?? s.assignmentId}» تحویل شد`, actor: st.students.find((x) => x.id === s.studentId)?.name ?? "دانشجو", role: "student", time: "همین حالا", href: `/admin/classes/${asg?.courseId ?? ""}` },
          ...st.activity,
        ],
      };
    }),

  gradeSubmission: (id, g) =>
    set((st) => {
      const sub = st.submissions.find((x) => x.id === id);
      const asg = st.assignments.find((a) => a.id === sub?.assignmentId);
      return {
        submissions: st.submissions.map((x) => (x.id === id ? { ...x, score: g.score, feedback: g.feedback, status: "نمره‌داده‌شده" as const } : x)),
        activity: [
          {
            id: nid("ac"),
            text: `نمره ${g.score} از ${asg?.max ?? 10} برای «${st.students.find((s) => s.id === sub?.studentId)?.name ?? "دانشجو"}» در تکلیف «${asg?.title ?? ""}» ثبت شد`,
            actor: g.byName ?? "المیرا معرفت‌پور",
            role: g.byRole ?? "teacher",
            time: "همین حالا",
            href: `/admin/classes/${asg?.courseId ?? ""}`,
          },
          ...st.activity,
        ],
      };
    }),

  addInvoice: (i) => {
    const id = nid("PF-10");
    const student = get().students.find((s) => s.id === i.studentId);
    set((st) => ({
      invoices: [
        { id, studentId: i.studentId, studentName: student?.name ?? "—", items: i.items, amount: i.amount, status: "در انتظار", link: `pay.edc-clinic.ir/${id.toLowerCase()}`, expires: i.expires },
        ...st.invoices,
      ],
      activity: [
        { id: nid("ac"), text: `پیش‌فاکتور ${id} برای «${student?.name ?? "—"}» صادر شد`, actor: "المیرا معرفت‌پور", role: "admin", time: "همین حالا", href: "/admin/finance" },
        ...st.activity,
      ],
    }));
    return id;
  },

  markInvoicePaid: (id) =>
    set((st) => ({
      invoices: st.invoices.map((i) => (i.id === id ? { ...i, status: "پرداخت‌شده" } : i)),
      students: st.students.map((s) => {
        const inv = st.invoices.find((i) => i.id === id);
        if (s.id === inv?.studentId) return { ...s, balance: Math.max(0, s.balance - inv.amount), status: s.balance - inv.amount <= 0 ? "فعال" : s.status };
        return s;
      }),
    })),

  addManualPayment: (p) => {
    const state = get();
    const student = state.students.find((s) => s.id === p.studentId);
    if (!student || p.amount <= 0) return;
    const payment: StorePayment = {
      id: nid("pay"),
      studentId: p.studentId,
      amount: p.amount,
      note: p.note?.trim() || "پرداخت قسط",
      method: p.method ?? "نقدی",
      date: p.date || "۱۴۰۴/۰۸/۰۴",
    };
    set((st) => ({
      payments: [payment, ...st.payments],
      students: st.students.map((s) => {
        if (s.id !== p.studentId) return s;
        const newBalance = Math.max(0, s.balance - p.amount);
        return { ...s, balance: newBalance, status: newBalance <= 0 && s.status === "در انتظار پرداخت" ? "فعال" : s.status };
      }),
      activity: [
        {
          id: nid("ac"),
          text: `پرداخت دستی ${p.method ?? "نقدی"} به مبلغ ${p.amount.toLocaleString("en-US").replace(/,/g, "٬")} تومان برای «${student.name}» ثبت شد`,
          actor: "المیرا معرفت‌پور",
          role: "admin",
          time: "همین حالا",
          href: `/admin/students/${p.studentId}`,
        },
        ...st.activity,
      ],
    }));
  },

  pushActivity: (a) =>
    set((st) => ({
      activity: [{ id: nid("ac"), time: a.time ?? "همین حالا", ...a } as ActivityItem, ...st.activity].slice(0, 40),
    })),
    }),
    {
      name: "edc-clinic-v1",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

/* ----------------------------- Selectors ----------------------------- */

export const useStudent = (id: string) => useStore((s) => s.students.find((x) => x.id === id));
export const useTeacher = (id: string) => useStore((s) => s.teachers.find((x) => x.id === id));
export const useCourse = (id: string) => useStore((s) => s.courses.find((x) => x.id === id));
