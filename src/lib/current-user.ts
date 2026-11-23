"use client";

import React from "react";
import { normalizePhone, useAuth } from "@/lib/auth-context";
import { useStore, CURRENT_STUDENT_ID, CURRENT_TEACHER_ID } from "@/lib/store";

export function useCurrentTeacherId() {
  const { user } = useAuth();
  const teachers = useStore((state) => state.teachers);
  return React.useMemo(() => {
    const phone = normalizePhone(user?.phone ?? "");
    const matched = user?.role === "teacher" && phone
      ? teachers.find((teacher) => normalizePhone(teacher.phone) === phone)
      : undefined;
    return matched?.id ?? (phone === normalizePhone("09114005050") ? CURRENT_TEACHER_ID : "");
  }, [teachers, user?.phone, user?.role]);
}

export function useCurrentStudentId() {
  const { user } = useAuth();
  const students = useStore((state) => state.students);
  return React.useMemo(() => {
    const phone = normalizePhone(user?.phone ?? "");
    const matched = user?.role === "student" && phone
      ? students.find((student) => normalizePhone(student.phone) === phone)
      : undefined;
    return matched?.id ?? (phone === normalizePhone("09114006060") ? CURRENT_STUDENT_ID : "");
  }, [students, user?.phone, user?.role]);
}
