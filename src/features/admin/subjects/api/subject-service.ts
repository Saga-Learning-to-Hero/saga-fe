import { apiClient } from "@/lib/axios";
import type {
  CreateSubjectRequest,
  PatchSubjectRequest,
  SubjectResponse,
  GetSubjectsParams,
} from "../types/subject-types";

export class SubjectService {
  static async getSubjects(params?: GetSubjectsParams): Promise<SubjectResponse[]> {
    const response = await apiClient.get<SubjectResponse[]>("/api/admin/subjects", {
      params,
    });
    return response.data;
  }

  static async getSubjectById(id: string): Promise<SubjectResponse> {
    if (!id || !id.trim()) {
      throw new Error("Throw ValidationException: Subject ID is required");
    }
    const response = await apiClient.get<SubjectResponse>(`/api/admin/subjects/${id.trim()}`);
    return response.data;
  }

  static async createSubject(data: CreateSubjectRequest): Promise<SubjectResponse> {
    if (!data.code || !data.code.trim()) {
      throw new Error("Throw ValidationException: Subject code is required");
    }
    if (!data.nameEnglish || !data.nameEnglish.trim()) {
      throw new Error("Throw ValidationException: English name is required");
    }

    const payload: CreateSubjectRequest = {
      code: data.code.trim().toUpperCase(),
      nameEnglish: data.nameEnglish.trim(),
      nameVietnamese: data.nameVietnamese?.trim() || null,
    };

    const response = await apiClient.post<SubjectResponse>("/api/admin/subjects", payload);
    return response.data;
  }

  static async updateSubject(id: string, data: PatchSubjectRequest): Promise<SubjectResponse> {
    if (!id || !id.trim()) {
      throw new Error("Throw ValidationException: Subject ID is required");
    }

    const payload: PatchSubjectRequest = {};
    if (data.nameEnglish !== undefined) {
      if (!data.nameEnglish.trim()) {
        throw new Error("Throw ValidationException: English name cannot be empty");
      }
      payload.nameEnglish = data.nameEnglish.trim();
    }
    if (data.nameVietnamese !== undefined) {
      payload.nameVietnamese = data.nameVietnamese ? data.nameVietnamese.trim() : null;
    }
    if (data.status !== undefined) {
      payload.status = data.status;
    }

    const response = await apiClient.patch<SubjectResponse>(
      `/api/admin/subjects/${id.trim()}`,
      payload
    );
    return response.data;
  }
}
