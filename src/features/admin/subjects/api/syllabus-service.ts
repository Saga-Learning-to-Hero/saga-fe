import { apiClient } from "@/lib/axios";
import type {
  CreateSyllabusRequest,
  PatchSyllabusRequest,
  ReplaceSyllabusStructureRequest,
  SyllabusSummaryResponse,
  SyllabusDetailResponse,
} from "../types/syllabus-types";

export class SyllabusService {
  static async getSyllabi(subjectId: string): Promise<SyllabusSummaryResponse[]> {
    if (!subjectId || !subjectId.trim()) {
      throw new Error("Throw ValidationException: Subject ID is required");
    }
    const response = await apiClient.get<SyllabusSummaryResponse[]>(
      `/api/admin/subjects/${subjectId.trim()}/syllabi`
    );
    return response.data;
  }

  static async getSyllabusDetail(
    subjectId: string,
    versionId: string
  ): Promise<SyllabusDetailResponse> {
    if (!subjectId || !subjectId.trim()) {
      throw new Error("Throw ValidationException: Subject ID is required");
    }
    if (!versionId || !versionId.trim()) {
      throw new Error("Throw ValidationException: Syllabus version ID is required");
    }
    const response = await apiClient.get<SyllabusDetailResponse>(
      `/api/admin/subjects/${subjectId.trim()}/syllabi/${versionId.trim()}`
    );
    return response.data;
  }

  static async createDraft(
    subjectId: string,
    data: CreateSyllabusRequest
  ): Promise<SyllabusSummaryResponse> {
    if (!subjectId || !subjectId.trim()) {
      throw new Error("Throw ValidationException: Subject ID is required");
    }
    if (!data.versionLabel || !data.versionLabel.trim()) {
      throw new Error("Throw ValidationException: Version label is required");
    }

    const payload: CreateSyllabusRequest = {
      ...data,
      versionLabel: data.versionLabel.trim(),
    };

    const response = await apiClient.post<SyllabusSummaryResponse>(
      `/api/admin/subjects/${subjectId.trim()}/syllabi`,
      payload
    );
    return response.data;
  }

  static async updateMetadata(
    subjectId: string,
    versionId: string,
    data: PatchSyllabusRequest
  ): Promise<SyllabusSummaryResponse> {
    if (!subjectId || !subjectId.trim()) {
      throw new Error("Throw ValidationException: Subject ID is required");
    }
    if (!versionId || !versionId.trim()) {
      throw new Error("Throw ValidationException: Syllabus version ID is required");
    }

    const response = await apiClient.patch<SyllabusSummaryResponse>(
      `/api/admin/subjects/${subjectId.trim()}/syllabi/${versionId.trim()}`,
      data
    );
    return response.data;
  }

  static async replaceStructure(
    subjectId: string,
    versionId: string,
    data: ReplaceSyllabusStructureRequest
  ): Promise<SyllabusDetailResponse> {
    if (!subjectId || !subjectId.trim()) {
      throw new Error("Throw ValidationException: Subject ID is required");
    }
    if (!versionId || !versionId.trim()) {
      throw new Error("Throw ValidationException: Syllabus version ID is required");
    }
    if (!data.learningOutcomes || data.learningOutcomes.length === 0) {
      throw new Error("Throw ValidationException: At least one learning outcome is required");
    }
    if (!data.phases || data.phases.length === 0) {
      throw new Error("Throw ValidationException: At least one phase is required");
    }

    const payload = {
      learningOutcomes: data.learningOutcomes.map((lo, idx) => ({
        code: lo.code.trim().toUpperCase(),
        name: lo.name.trim(),
        description: lo.description?.trim() || null,
        orderIndex: lo.orderIndex || idx + 1,
      })),
      learningUnits: (data.learningUnits || []).map((u, idx) => ({
        code: u.code.trim().toUpperCase(),
        name: u.name.trim(),
        description: u.description?.trim() || null,
        orderIndex: u.orderIndex || idx + 1,
        learningOutcomeCodes: u.learningOutcomeCodes || [],
      })),
      phases: data.phases.map((p, idx) => ({
        code: p.code.trim().toUpperCase(),
        name: p.name.trim(),
        description: p.description?.trim() || null,
        orderIndex: p.orderIndex || idx + 1,
        learningOutcomeCodes: p.learningOutcomeCodes || [],
        activities: (p.activities || []).map((a, aIdx) => ({
          code: a.code.trim().toUpperCase(),
          name: a.name.trim(),
          description: a.description?.trim() || null,
          orderIndex: a.orderIndex || aIdx + 1,
        })),
        deliverables: (p.deliverables || []).map((d, dIdx) => ({
          code: d.code.trim().toUpperCase(),
          name: d.name.trim(),
          description: d.description?.trim() || null,
          orderIndex: d.orderIndex || dIdx + 1,
          learningOutcomeCodes: d.learningOutcomeCodes || [],
        })),
      })),
    };

    const response = await apiClient.put<SyllabusDetailResponse>(
      `/api/admin/subjects/${subjectId.trim()}/syllabi/${versionId.trim()}/structure`,
      payload
    );
    return response.data;
  }

  static async publish(subjectId: string, versionId: string): Promise<void> {
    if (!subjectId || !subjectId.trim()) {
      throw new Error("Throw ValidationException: Subject ID is required");
    }
    if (!versionId || !versionId.trim()) {
      throw new Error("Throw ValidationException: Syllabus version ID is required");
    }

    await apiClient.post(
      `/api/admin/subjects/${subjectId.trim()}/syllabi/${versionId.trim()}/publish`
    );
  }

  static async archive(subjectId: string, versionId: string): Promise<void> {
    if (!subjectId || !subjectId.trim()) {
      throw new Error("Throw ValidationException: Subject ID is required");
    }
    if (!versionId || !versionId.trim()) {
      throw new Error("Throw ValidationException: Syllabus version ID is required");
    }

    await apiClient.post(
      `/api/admin/subjects/${subjectId.trim()}/syllabi/${versionId.trim()}/archive`
    );
  }
}
