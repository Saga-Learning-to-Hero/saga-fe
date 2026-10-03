import { apiClient } from "@/lib/axios";
import { requireRemovalReason } from "@/lib/removal-reason";
import {
  isActiveEnrollment,
  isPendingInvitation,
  normalizeRosterEntry,
  normalizeRosterStatus,
} from "../lib/roster-status";
import type {
  RosterItemResponse,
  CourseRosterResponse,
  CourseRosterEntry,
  RosterPreviewResponse,
  ConfirmRosterImportRequest,
  ConfirmRosterImportResponse,
  AddStudentToCourseRequest,
} from "../types/course-roster-types";

export class RosterService {
  static async getRosterTemplate(courseId: string): Promise<Blob> {
    if (!courseId || !courseId.trim()) {
      throw new Error("Throw ValidationException: Course ID is required");
    }

    const response = await apiClient.get<Blob>(
      `/api/admin/courses/${courseId.trim()}/roster/template`,
      {
        responseType: "blob",
        adapter: "fetch",
      }
    );
    return response.data;
  }

  static async getRoster(courseId: string): Promise<CourseRosterResponse> {
    if (!courseId || !courseId.trim()) {
      throw new Error("Throw ValidationException: Course ID is required");
    }

    const response = await apiClient.get<CourseRosterResponse | RosterItemResponse[]>(
      `/api/admin/courses/${courseId.trim()}/roster`
    );
    const data = response.data;
    if (Array.isArray(data)) {
      const mappedEntries = data.map((item) => {
        const rawEnrollmentStatus = normalizeRosterStatus(
          (item as unknown as { enrollmentStatus?: string | null }).enrollmentStatus
        );
        const enrollmentStatus =
          rawEnrollmentStatus ||
          (item.status === "ENROLLED" ? "ACTIVE" : item.status === "DROPPED" ? "WITHDRAWN" : null);
        return normalizeRosterEntry({
          kind:
            (item as unknown as { kind?: string }).kind ||
            (item.status === "INVITED" ? "INVITATION" : "ENROLLMENT"),
          id: item.id,
          enrollmentId: item.id,
          invitationId: null,
          studentUserId: item.studentId,
          studentCode: item.studentCode || "",
          fullName: item.fullName || "",
          email: item.email || "",
          status: item.status,
          enrollmentStatus,
          invitationStatus:
            (item as unknown as { invitationStatus?: string | null }).invitationStatus ||
            (item.status === "INVITED" ? "PENDING" : null),
          accountState: "REGISTERED",
          enrolledAt: item.enrolledAt,
          avatarUrl: item.avatarUrl ?? item.avatar ?? null,
          avatar: item.avatar ?? null,
        });
      });

      return {
        courseId,
        classCode: "",
        semesterCode: "",
        subjectCode: "",
        enrolledCount: mappedEntries.filter(isActiveEnrollment).length,
        pendingInvitationCount: mappedEntries.filter(isPendingInvitation).length,
        entries: mappedEntries,
      };
    }

    const entries = Array.isArray(data?.entries)
      ? data.entries
      : Array.isArray((data as unknown as { items?: CourseRosterEntry[] })?.items)
        ? (data as unknown as { items: CourseRosterEntry[] }).items
        : Array.isArray((data as unknown as { content?: CourseRosterEntry[] })?.content)
          ? (data as unknown as { content: CourseRosterEntry[] }).content
          : [];

    const normalizedEntries = entries.map((e) =>
      normalizeRosterEntry({
        ...e,
        id: e.id || e.enrollmentId || e.invitationId || `${e.studentCode}-${e.kind}`,
      })
    );

    return {
      courseId: data?.courseId || courseId,
      classCode: data?.classCode || "",
      semesterCode: data?.semesterCode || "",
      subjectCode: data?.subjectCode || "",
      enrolledCount: normalizedEntries.filter(isActiveEnrollment).length,
      pendingInvitationCount: normalizedEntries.filter(isPendingInvitation).length,
      entries: normalizedEntries,
    };
  }

  static async previewImport(courseId: string, file: File): Promise<RosterPreviewResponse> {
    if (!courseId || !courseId.trim()) {
      throw new Error("Throw ValidationException: Course ID is required");
    }
    if (!file) {
      throw new Error("Throw ValidationException: Excel file is required");
    }

    const formData = new FormData();
    formData.append("file", file);

    const response = await apiClient.post<RosterPreviewResponse>(
      `/api/admin/courses/${courseId.trim()}/roster/import/preview`,
      formData,
      {
        transformRequest: [
          (data, headers) => {
            if (typeof FormData !== "undefined" && data instanceof FormData) {
              headers.delete("Content-Type");
            }
            return data;
          },
        ],
      }
    );

    return response.data;
  }

  static async confirmImport(
    courseId: string,
    data: ConfirmRosterImportRequest
  ): Promise<ConfirmRosterImportResponse> {
    if (!courseId || !courseId.trim()) {
      throw new Error("Throw ValidationException: Course ID is required");
    }
    if (!data.previewToken || !data.previewToken.trim()) {
      throw new Error("Throw ValidationException: Preview token is required");
    }

    const response = await apiClient.post<ConfirmRosterImportResponse>(
      `/api/admin/courses/${courseId.trim()}/roster/import/confirm`,
      { previewToken: data.previewToken.trim() }
    );
    return response.data;
  }

  static async addStudent(
    courseId: string,
    data: AddStudentToCourseRequest
  ): Promise<CourseRosterEntry> {
    if (!courseId || !courseId.trim()) {
      throw new Error("Throw ValidationException: Course ID is required");
    }
    if (!data.studentCode || !data.studentCode.trim()) {
      throw new Error("Throw ValidationException: Student code is required");
    }
    if (!data.fullName || !data.fullName.trim()) {
      throw new Error("Throw ValidationException: Full name is required");
    }
    if (!data.email || !data.email.trim()) {
      throw new Error("Throw ValidationException: Email is required");
    }
    if (!data.memberCode || !data.memberCode.trim()) {
      throw new Error("Throw ValidationException: Member code is required");
    }

    const payload: AddStudentToCourseRequest = {
      studentCode: data.studentCode.trim().toUpperCase(),
      fullName: data.fullName.trim(),
      email: data.email.trim().toLowerCase(),
      memberCode: data.memberCode.trim(),
    };

    const response = await apiClient.post<CourseRosterEntry>(
      `/api/admin/courses/${courseId.trim()}/roster/students`,
      payload
    );
    return response.data;
  }

  static async removeEnrollment(
    courseId: string,
    enrollmentId: string,
    reason: string
  ): Promise<CourseRosterEntry> {
    if (!courseId || !courseId.trim()) {
      throw new Error("Throw ValidationException: Course ID is required");
    }
    if (!enrollmentId || !enrollmentId.trim()) {
      throw new Error("Throw ValidationException: Enrollment ID is required");
    }
    const trimmedReason = requireRemovalReason(reason);

    const response = await apiClient.delete<CourseRosterEntry>(
      `/api/admin/courses/${encodeURIComponent(courseId.trim())}/roster/enrollments/${encodeURIComponent(enrollmentId.trim())}`,
      { data: { reason: trimmedReason } }
    );
    return response.data;
  }

  static async cancelInvitation(
    courseId: string,
    invitationId: string
  ): Promise<CourseRosterEntry> {
    if (!courseId || !courseId.trim()) {
      throw new Error("Throw ValidationException: Course ID is required");
    }
    if (!invitationId || !invitationId.trim()) {
      throw new Error("Throw ValidationException: Invitation ID is required");
    }

    const response = await apiClient.delete<CourseRosterEntry>(
      `/api/admin/courses/${encodeURIComponent(courseId.trim())}/roster/invitations/${encodeURIComponent(invitationId.trim())}`
    );
    return response.data;
  }
}

