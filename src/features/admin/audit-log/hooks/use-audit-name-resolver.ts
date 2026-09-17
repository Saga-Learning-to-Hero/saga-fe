"use client";

import { useMemo } from "react";
import { useCourses, useAdminClasses } from "@/features/admin/academic/hooks/use-academic";
import { useAdminUsers } from "@/features/admin/users/hooks/use-admin-users";
import { useSubjects } from "@/features/admin/subjects/hooks/use-subjects";

export interface ResolvedUser {
  fullName: string;
  email: string;
  studentCode?: string;
  role?: string;
}

export function useAuditNameResolver() {
  // Lấy dữ liệu danh mục từ cache TanStack Query (staleTime 5 phút)
  const coursesQuery = useCourses(undefined, { enabled: true });
  const classesQuery = useAdminClasses({ enabled: true });
  const usersQuery = useAdminUsers({ size: 100 }, { enabled: true });
  const subjectsQuery = useSubjects(undefined, { enabled: true });

  // Map khóa học (Course ID -> Tên khóa học)
  const courseMap = useMemo(() => {
    const map = new Map<string, string>();
    if (coursesQuery.data && Array.isArray(coursesQuery.data)) {
      for (const c of coursesQuery.data) {
        if (!c.id) continue;
        const code = c.courseCode?.trim();
        const name = c.name?.trim();
        const display = code && name && code !== name ? `${code} - ${name}` : name || code || c.id;
        map.set(c.id, display);
      }
    }
    return map;
  }, [coursesQuery.data]);

  // Map lớp sinh viên / niên khóa (Class ID -> Tên lớp & Mã lớp)
  const classMap = useMemo(() => {
    const map = new Map<string, string>();
    if (classesQuery.data && Array.isArray(classesQuery.data)) {
      for (const cl of classesQuery.data) {
        if (!cl.id) continue;
        const code = (cl.code || cl.classCode || "").trim();
        const name = (cl.name || "").trim();
        const display = name && code && name !== code ? `${name} (${code})` : name || code || cl.id;
        map.set(cl.id, display);
      }
    }
    return map;
  }, [classesQuery.data]);

  // Map người dùng hệ thống (User ID -> Chi tiết họ tên, email, MSSV)
  const userMap = useMemo(() => {
    const map = new Map<string, ResolvedUser>();
    if (usersQuery.data?.items && Array.isArray(usersQuery.data.items)) {
      for (const u of usersQuery.data.items) {
        if (!u.id) continue;
        map.set(u.id, {
          fullName: u.fullName || u.username || u.email,
          email: u.email,
          studentCode: u.studentCode || undefined,
          role: u.role,
        });
      }
    }
    return map;
  }, [usersQuery.data]);

  // Map môn học (Subject ID -> Mã môn & Tên môn học)
  const subjectMap = useMemo(() => {
    const map = new Map<string, string>();
    if (subjectsQuery.data && Array.isArray(subjectsQuery.data)) {
      for (const s of subjectsQuery.data) {
        if (!s.id) continue;
        const code = s.code?.trim();
        const name = (s.nameVietnamese || s.nameEnglish || "").trim();
        const display = code && name && code !== name ? `${code} - ${name}` : name || code || s.id;
        map.set(s.id, display);
      }
    }
    return map;
  }, [subjectsQuery.data]);

  /**
   * Giải mã tên Course từ Course ID
   */
  const resolveCourseName = (courseId?: string | null): string | null => {
    if (!courseId) return null;
    return courseMap.get(courseId) || null;
  };

  /**
   * Giải mã tên Class từ Class ID
   */
  const resolveClassName = (classId?: string | null): string | null => {
    if (!classId) return null;
    return classMap.get(classId) || null;
  };

  /**
   * Giải mã thông tin User từ User ID
   */
  const resolveUserInfo = (userId?: string | null): ResolvedUser | null => {
    if (!userId) return null;
    return userMap.get(userId) || null;
  };

  /**
   * Giải mã tên Subject từ Subject ID
   */
  const resolveSubjectName = (subjectId?: string | null): string | null => {
    if (!subjectId) return null;
    return subjectMap.get(subjectId) || null;
  };

  /**
   * Giải mã tên Actor (người thực hiện) nếu tên snapshot bị thiếu hoặc chung chung
   */
  const resolveActorName = (actorUserId?: string | null, fallbackName?: string): string => {
    if (!actorUserId) return fallbackName || "Hệ thống SAGA";
    const user = userMap.get(actorUserId);
    if (user && user.fullName) return user.fullName;
    return fallbackName || "Hệ thống SAGA";
  };

  /**
   * Giải mã tên đối tượng tác động (Target) từ entityType & entityId
   */
  const resolveTargetName = (
    entityType?: string,
    entityId?: string,
    fallbackName?: string
  ): string => {
    if (!entityId) return fallbackName || "Hệ thống";

    const type = (entityType || "").toUpperCase();

    if (type.includes("USER")) {
      const user = userMap.get(entityId);
      if (user) return user.fullName;
    } else if (type.includes("COURSE")) {
      const course = courseMap.get(entityId);
      if (course) return course;
    } else if (type.includes("CLASS")) {
      const cls = classMap.get(entityId);
      if (cls) return cls;
    } else if (type.includes("SUBJECT")) {
      const sub = subjectMap.get(entityId);
      if (sub) return sub;
    }

    if (fallbackName && fallbackName !== entityId && !fallbackName.includes("#")) {
      return fallbackName;
    }

    if (type.includes("USER")) return "Tài khoản người dùng";
    if (type.includes("COURSE")) return "Lớp học phần";
    if (type.includes("CLASS")) return "Lớp sinh viên";
    if (type.includes("SUBJECT")) return "Môn học";

    return fallbackName?.replace(/#[a-f0-9-]+/i, "").trim() || entityType || "Thực thể";
  };

  /**
   * Trả về dòng phụ chú giải cho Target (như email, mã lớp, mã môn)
   */
  const resolveTargetSubtext = (
    entityType?: string,
    entityId?: string,
    fallbackSubtext?: string
  ): string => {
    const type = (entityType || "").toUpperCase();
    if (type.includes("USER") && entityId) {
      const user = userMap.get(entityId);
      if (user?.email) {
        return user.studentCode ? `MSSV: ${user.studentCode} • ${user.email}` : user.email;
      }
    }
    return fallbackSubtext || type || "SYSTEM";
  };

  /**
   * Kiểm tra xem một chuỗi có phải là UUID/ID kỹ thuật thô hay không
   */
  const isRawId = (val?: string | null): boolean => {
    if (!val) return false;
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val.trim());
  };

  /**
   * Giải mã giá trị trường bất kỳ (VD: userId, courseId trong State Diff) sang Tên
   */
  const resolveValueToName = (field: string, val: string | null): string | null => {
    if (!val) return null;
    const f = field.toLowerCase();
    if (f.includes("course")) {
      const c = resolveCourseName(val);
      if (c) return c;
    }
    if (f.includes("class")) {
      const cl = resolveClassName(val);
      if (cl) return cl;
    }
    if (f.includes("user") || f.includes("lecturer") || f.includes("actor")) {
      const u = resolveUserInfo(val);
      if (u) return `${u.fullName} (${u.email})`;
    }
    if (f.includes("subject")) {
      const s = resolveSubjectName(val);
      if (s) return s;
    }
    return null;
  };

  return {
    resolveCourseName,
    resolveClassName,
    resolveUserInfo,
    resolveSubjectName,
    resolveActorName,
    resolveTargetName,
    resolveTargetSubtext,
    resolveValueToName,
    isRawId,
    isLoading:
      coursesQuery.isLoading ||
      classesQuery.isLoading ||
      usersQuery.isLoading ||
      subjectsQuery.isLoading,
  };
}
