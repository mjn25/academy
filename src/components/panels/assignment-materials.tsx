"use client";

/* ------------------------------------------------------------------ */
/*  بخش مشترک «تمرین‌ها و ویدئوها» — در هر سه پنل استفاده می‌شود        */
/*  مدیر و استاد: آپلود منابع کلاس (تمرین + ویدئو)                      */
/*  دانشجو: مشاهده منابع کلاس + آپلود تمرین و ویدئوی خودش               */
/* ------------------------------------------------------------------ */

import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { fa } from "@/lib/format";
import { useStore, CURRENT_STUDENT_ID, CURRENT_TEACHER_ID, type MaterialKind, type StoreMaterial } from "@/lib/store";
import {
  Upload, FileText, Clapperboard, PlayCircle, Trash2, Paperclip, Info, Download, Eye,
} from "lucide-react";

/* ----------------------- رجیستری URL نشست جاری ----------------------- */
/* blob URL ها بعد از رفرش از بین می‌روند؛ متادیتا در استور می‌ماند      */

const sessionUrls = new Map<string, string>();

/** ثبت آدرس موقت فایل برای پیش‌نمایش در همین نشست */
export function registerFileUrl(id: string, file: File): string {
  const prev = sessionUrls.get(id);
  if (prev) URL.revokeObjectURL(prev);
  const url = URL.createObjectURL(file);
  sessionUrls.set(id, url);
  return url;
}

export function getFileUrl(id: string): string | undefined {
  return sessionUrls.get(id);
}

/* ------------------------------ کمکی‌ها ------------------------------ */

const ACCEPT: Record<MaterialKind, string> = {
  exercise: ".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.png,.jpg,.jpeg,.webp,.zip,.rar,.txt,audio/*",
  video: "video/*,.mp4,.mov,.webm,.m4v,.avi,.mkv",
};

function humanSize(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${fa((bytes / (1024 * 1024)).toFixed(1))} MB`;
  return `${fa(Math.max(1, Math.round(bytes / 1024)))} KB`;
}

const isImage = (name: string) => /\.(png|jpe?g|webp|gif|bmp)$/i.test(name);

const roleBadge: Record<StoreMaterial["uploadedByRole"], { label: string; cls: string }> = {
  admin: { label: "مدیریت", cls: "bg-ink-strong text-white hover:bg-ink-strong" },
  teacher: { label: "استاد", cls: "bg-canvas-soft text-ink hover:bg-canvas-soft" },
  student: { label: "دانشجو", cls: "bg-info/10 text-info hover:bg-info/10" },
};

/* --------------------------- نمایشگر فایل ---------------------------- */

export function MaterialViewerDialog({ material, open, onOpenChange }: {
  material: StoreMaterial | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const url = material ? getFileUrl(material.id) : undefined;
  if (!material) return null;
  const badge = roleBadge[material.uploadedByRole];
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-black-fa text-ink flex items-center gap-2 text-base">
            {material.kind === "video" ? <Clapperboard className="size-5 text-ink" /> : <FileText className="size-5 text-ink" />}
            {material.name}
          </DialogTitle>
        </DialogHeader>

        {material.kind === "video" && url ? (
          <video src={url} controls className="w-full rounded-2xl border border-hairline-soft bg-black max-h-[60vh]" aria-label={`پخش ${material.name}`} />
        ) : isImage(material.name) && url ? (
          <img src={url} alt={material.name} className="w-full rounded-2xl border border-hairline-soft max-h-[60vh] object-contain bg-canvas-soft" />
        ) : url && material.kind === "exercise" ? (
          <div className="rounded-2xl border border-hairline-soft bg-canvas-soft p-6 text-center">
            <FileText className="size-10 mx-auto text-ink-soft" />
            <p className="mt-2 text-sm font-bold text-ink">پیش‌نمایش داخلی برای این نوع فایل فعال نیست</p>
            <p className="mt-1 text-xs text-ink-soft">می‌توانید فایل را دانلود کنید.</p>
          </div>
        ) : (
          <div className="rounded-2xl border border-warn/30 bg-warn/5 p-6 text-center">
            <Info className="size-8 mx-auto text-warn" />
            <p className="mt-2 text-sm font-bold text-ink">پیش‌نمایش فقط در همین نشست ممکن است</p>
            <p className="mt-1 text-xs text-ink-soft leading-6">
              فایل پس از رفرش صفحه حذف می‌شود (نسخه نمایشی)؛ اما نام و مشخصات آن در لیست تکلیف باقی می‌ماند. برای پیش‌نمایش، فایل را دوباره آپلود کنید.
            </p>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2 text-xs text-ink-soft">
          <Badge className={badge.cls}>{badge.label}</Badge>
          <span>آپلودکننده: <b className="text-ink">{material.uploadedByName}</b></span>
          {material.size && <span>· حجم: {material.size}</span>}
          <span>· {material.uploadedAt}</span>
          {url && (
            <a
              href={url}
              download={material.name}
              className="ms-auto inline-flex items-center gap-1 rounded-[8px] border border-hairline-soft bg-white px-2.5 py-1.5 font-bold text-ink hover:bg-canvas-soft transition-colors"
            >
              <Download className="size-3.5" /> دانلود
            </a>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ---------------------------- ناحیه آپلود ---------------------------- */

function UploadZone({ kind, label, hint, onFiles, multiple = true }: {
  kind: MaterialKind;
  label: string;
  hint: string;
  onFiles: (files: File[]) => void;
  multiple?: boolean;
}) {
  const id = React.useId();
  const Icon = kind === "video" ? Clapperboard : FileText;
  return (
    <label
      htmlFor={id}
      className="flex cursor-pointer flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-hairline-soft bg-canvas-soft/50 p-6 text-center transition-colors hover:border-ink hover:bg-canvas-soft/50"
    >
      <input
        id={id}
        type="file"
        className="hidden"
        multiple={multiple}
        accept={ACCEPT[kind]}
        onChange={(e) => {
          const files = Array.from(e.target.files ?? []);
          if (files.length) onFiles(files);
          e.target.value = "";
        }}
      />
      <span className="grid size-11 place-items-center rounded-[8px] bg-white border border-hairline-soft text-ink">
        <Icon className="size-5" />
      </span>
      <span className="text-sm font-bold text-ink flex items-center gap-1.5">
        <Upload className="size-4 text-ink-soft" /> {label}
      </span>
      <span className="text-[11px] text-ink-soft leading-5">{hint}</span>
    </label>
  );
}

/* -------------------------- ردیف یک فایل ----------------------------- */

function MaterialRow({ m, canDelete, onDelete, onView }: {
  m: StoreMaterial;
  canDelete: boolean;
  onDelete: () => void;
  onView: () => void;
}) {
  const badge = roleBadge[m.uploadedByRole];
  const playable = m.kind === "video" && !!getFileUrl(m.id);
  return (
    <div className="flex flex-wrap items-center gap-2.5 rounded-[8px] border border-hairline-soft bg-white px-3.5 py-2.5">
      <span className={`grid size-9 shrink-0 place-items-center rounded-[8px] ${m.kind === "video" ? "bg-canvas-soft text-ink" : "bg-canvas-soft text-ink"}`}>
        {m.kind === "video" ? <Clapperboard className="size-4.5" /> : <FileText className="size-4.5" />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-xs font-bold text-ink" dir="auto">{m.name}</span>
        <span className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[10px] text-ink-soft">
          <Badge className={`px-1.5 py-0 text-[9px] ${badge.cls}`}>{badge.label}</Badge>
          {m.size && <span>{m.size}</span>}
          <span>· {m.uploadedAt}</span>
        </span>
      </span>
      <Button size="sm" variant="outline" className="h-8 gap-1 border-hairline text-ink" onClick={onView}>
        <Eye className="size-3.5" /> {playable ? "پخش" : "مشاهده"}
      </Button>
      {canDelete && (
        <Button size="sm" variant="outline" className="h-8 border-bad/30 text-bad hover:bg-bad/10" onClick={onDelete} aria-label={`حذف ${m.name}`}>
          <Trash2 className="size-3.5" />
        </Button>
      )}
    </div>
  );
}

/* --------------------- بخش کامل تمرین‌ها و ویدئوها -------------------- */

export function AssignmentMaterialsSection({ assignmentId, role }: {
  assignmentId: string;
  role: "admin" | "teacher" | "student";
}) {
  const { toast } = useToast();
  const { materials, addMaterial, removeMaterial, teachers, students } = useStore();
  const [viewing, setViewing] = React.useState<StoreMaterial | null>(null);

  const myStudentId = role === "student" ? CURRENT_STUDENT_ID : undefined;
  const isStudent = role === "student";

  const classMaterials = materials.filter(
    (m) => m.assignmentId === assignmentId && (m.uploadedByRole === "admin" || m.uploadedByRole === "teacher")
  );
  const studentMaterials = materials.filter(
    (m) => m.assignmentId === assignmentId && m.uploadedByRole === "student" && (!isStudent || m.studentId === myStudentId)
  );

  const teacherName = teachers.find((t) => t.id === CURRENT_TEACHER_ID)?.name ?? "استاد";
  const studentName = students.find((s) => s.id === CURRENT_STUDENT_ID)?.name ?? "دانشجو";
  const uploaderName = isStudent ? studentName : role === "admin" ? "المیرا معرفت‌پور" : teacherName;

  const handleFiles = (kind: MaterialKind, files: File[]) => {
    files.forEach((f) => {
      const realId = addMaterial({
        assignmentId,
        studentId: myStudentId,
        kind,
        name: f.name,
        size: humanSize(f.size),
        uploadedByRole: role,
        uploadedByName: uploaderName,
      });
      registerFileUrl(realId, f);
    });
    const kindFa = kind === "video" ? "ویدئو" : "تمرین";
    toast({
      title: `${kindFa} آپلود شد ✓`,
      description: isStudent
        ? "فایل شما به پاسخ این تکلیف پیوست شد و برای استاد و مدیریت قابل مشاهده است."
        : `${kindFa} برای دانشجویان این کلاس در پنل دانشجو نمایش داده می‌شود.`,
    });
  };

  const canDelete = (m: StoreMaterial) => {
    if (!isStudent) return true; // مدیر و استاد همه را می‌توانند حذف کنند
    return m.uploadedByRole === "student" && m.studentId === myStudentId;
  };

  return (
    <div className="rounded-3xl border border-hairline-soft bg-white p-6 mb-6" data-testid="assignment-materials">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
        <h3 className="font-bold text-ink text-sm flex items-center gap-2">
          <Paperclip className="size-4 text-ink" />
          تمرین‌ها و ویدئوهای تکلیف
        </h3>
        <span className="text-[11px] text-ink-soft">
          {fa(classMaterials.length)} فایل کلاس · {fa(studentMaterials.length)} {isStudent ? "فایل من" : "ارسال دانشجویان"}
        </span>
      </div>
      <p className="text-xs text-ink-soft mb-5 leading-6">
        {isStudent
          ? "تمرین‌ها و ویدئوهایی که استاد یا مدیریت برای این تکلیف آپلود کرده‌اند را ببینید و کار خودتان را آپلود کنید."
          : "تمرین‌ها و ویدئوهایی که اینجا آپلود می‌کنید، بلافاصله در پنل دانشجویان همین کلاس نمایش داده می‌شوند."}
      </p>

      {/* فایل‌های کلاس (مدیریت/استاد) */}
      {classMaterials.length > 0 ? (
        <div className="space-y-2 mb-5">
          <p className="text-[11px] font-bold text-ink-soft">منابع استاد / مدیریت</p>
          {classMaterials.map((m) => (
            <MaterialRow
              key={m.id}
              m={m}
              canDelete={canDelete(m)}
              onDelete={() => { removeMaterial(assignmentId, m.id); toast({ title: "فایل حذف شد" }); }}
              onView={() => setViewing(m)}
            />
          ))}
        </div>
      ) : (
        <p className="mb-5 rounded-[8px] bg-canvas-soft border border-hairline-soft px-4 py-3 text-xs text-ink-soft">
          هنوز فایلی از سوی {isStudent ? "استاد یا مدیریت" : "کلاس"} آپلود نشده است.
        </p>
      )}

      {/* ارسال‌های دانشجویان — فقط برای مدیر و استاد */}
      {!isStudent && studentMaterials.length > 0 && (
        <div className="space-y-2 mb-5">
          <p className="text-[11px] font-bold text-ink-soft">ارسال‌های دانشجویان</p>
          {studentMaterials.map((m) => (
            <MaterialRow
              key={m.id}
              m={m}
              canDelete
              onDelete={() => { removeMaterial(assignmentId, m.id); toast({ title: "فایل حذف شد" }); }}
              onView={() => setViewing(m)}
            />
          ))}
        </div>
      )}

      {/* فایل‌های خود دانشجو */}
      {isStudent && studentMaterials.length > 0 && (
        <div className="space-y-2 mb-5">
          <p className="text-[11px] font-bold text-ink-soft">فایل‌های من</p>
          {studentMaterials.map((m) => (
            <MaterialRow
              key={m.id}
              m={m}
              canDelete={canDelete(m)}
              onDelete={() => { removeMaterial(assignmentId, m.id); toast({ title: "فایل حذف شد" }); }}
              onView={() => setViewing(m)}
            />
          ))}
        </div>
      )}

      {/* آپلود — هر سه نقش */}
      <div className={`grid gap-3 ${isStudent ? "sm:grid-cols-2" : "sm:grid-cols-2"}`}>
        <UploadZone
          kind="exercise"
          label={isStudent ? "آپلود تمرین من" : "آپلود تمرین"}
          hint={isStudent ? "PDF، عکس، فایل صوتی… — چند فایل" : "برگه تمرین، کاربرگ PDF، عکس… — چند فایل"}
          onFiles={(files) => handleFiles("exercise", files)}
        />
        <UploadZone
          kind="video"
          label={isStudent ? "آپلود ویدئوی من" : "آپلود ویدئو"}
          hint={isStudent ? "ویدئوی تمرین یا ارائه خودتان — MP4، MOV…" : "ویدئوی آموزشی مرتبط با تکلیف — MP4، MOV…"}
          onFiles={(files) => handleFiles("video", files)}
        />
      </div>

      {isStudent && (
        <p className="mt-3 text-[11px] text-ink-soft flex items-center gap-1.5">
          <Info className="size-3.5 text-info shrink-0" />
          فایل‌های آپلودشده در صفحه تکلیف استاد و مدیریت با نشان «ارسال‌های دانشجویان» دیده می‌شوند.
        </p>
      )}

      <MaterialViewerDialog material={viewing} open={!!viewing} onOpenChange={(v) => !v && setViewing(null)} />
    </div>
  );
}

/* ------------- سلول «فایل‌های دانشجو» در جدول پاسخ‌ها ---------------- */

export function StudentMaterialsCell({ assignmentId, studentId }: {
  assignmentId: string;
  studentId: string;
}) {
  const all = useStore((s) => s.materials);
  const materials = React.useMemo(
    () => all.filter((m) => m.assignmentId === assignmentId && m.studentId === studentId),
    [all, assignmentId, studentId]
  );
  const [viewing, setViewing] = React.useState<StoreMaterial | null>(null);
  if (materials.length === 0) return null;
  return (
    <>
      <div className="flex flex-wrap gap-1.5 mt-1.5">
        {materials.map((m) => (
          <button
            key={m.id}
            onClick={() => setViewing(m)}
            className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold transition-colors ${
              m.kind === "video" ? "border-hairline bg-canvas-soft text-ink hover:bg-canvas-soft" : "border-hairline bg-canvas-soft text-ink hover:bg-canvas-soft"
            }`}
          >
            {m.kind === "video" ? <PlayCircle className="size-3" /> : <Paperclip className="size-3" />}
            <span className="max-w-32 truncate" dir="auto">{m.name}</span>
          </button>
        ))}
      </div>
      <MaterialViewerDialog material={viewing} open={!!viewing} onOpenChange={(v) => !v && setViewing(null)} />
    </>
  );
}
