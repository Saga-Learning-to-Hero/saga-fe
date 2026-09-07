import { apiClient } from "@/lib/axios";
import type {
  RosterItemResponse,
  CourseRosterResponse,
  CourseRosterEntry,
  RosterPreviewResponse,
  ConfirmRosterImportRequest,
  ConfirmRosterImportResponse,
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
      const mappedEntries = data.map((item) => ({
        kind: (item as unknown as { kind?: string }).kind || (item.status === "ENROLLED" ? "ENROLLMENT" : "INVITATION"),
        id: item.id,
        enrollmentId: item.id,
        invitationId: null,
        studentUserId: item.studentId,
        studentCode: item.studentCode || "",
        fullName: item.fullName || "",
        email: item.email || "",
        status: item.status || "ENROLLED",
        enrollmentStatus: item.status === "ENROLLED" ? "ACTIVE" : null,
        invitationStatus: item.status === "INVITED" ? "PENDING" : null,
        accountState: "REGISTERED",
        enrolledAt: item.enrolledAt,
      }));

      return {
        courseId,
        classCode: "",
        semesterCode: "",
        subjectCode: "",
        enrolledCount: mappedEntries.filter((x) => x.status === "ENROLLED").length,
        pendingInvitationCount: mappedEntries.filter((x) => x.status === "INVITED").length,
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

    return {
      courseId: data?.courseId || courseId,
      classCode: data?.classCode || "",
      semesterCode: data?.semesterCode || "",
      subjectCode: data?.subjectCode || "",
      enrolledCount: data?.enrolledCount ?? entries.filter((e) => e.kind === "ENROLLMENT" || e.enrollmentStatus === "ACTIVE").length,
      pendingInvitationCount: data?.pendingInvitationCount ?? entries.filter((e) => e.kind === "INVITATION" || e.invitationStatus === "PENDING").length,
      entries: entries.map((e) => ({
        ...e,
        id: e.id || e.enrollmentId || e.invitationId || `${e.studentCode}-${e.kind}`,
        status: e.status || (e.kind === "ENROLLMENT" || e.enrollmentStatus === "ACTIVE" ? "ENROLLED" : "INVITED"),
      })),
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
        headers: {
          "Content-Type": "multipart/form-data",
        },
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
}
