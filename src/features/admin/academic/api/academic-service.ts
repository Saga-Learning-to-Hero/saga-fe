import { apiClient } from "@/lib/axios";
import type {
  CreateSemesterRequest,
  PatchSemesterRequest,
  SemesterResponse,
  CreateAcademicClassRequest,
  PatchAcademicClassRequest,
  AcademicClassResponse,
} from "../types/academic-types";

export class AcademicService {
  static async getSemesters(): Promise<SemesterResponse[]> {
    const response = await apiClient.get<SemesterResponse[]>("/api/admin/semesters");
    return response.data;
  }

  static async getSemesterById(semesterId: string): Promise<SemesterResponse> {
    if (!semesterId || !semesterId.trim()) {
      throw new Error("Throw ValidationException: Semester ID is required");
    }
    const response = await apiClient.get<SemesterResponse>(
      `/api/admin/semesters/${encodeURIComponent(semesterId.trim())}`
    );
    return response.data;
  }

  static async getActiveSemester(): Promise<SemesterResponse | null> {
    const response = await apiClient.get<SemesterResponse | null>("/api/admin/semesters/active");
    return response.data;
  }

  static async setActiveSemester(semesterId: string): Promise<SemesterResponse> {
    if (!semesterId || !semesterId.trim()) {
      throw new Error("Throw ValidationException: Semester ID is required");
    }
    const response = await apiClient.put<SemesterResponse>("/api/admin/semesters/active", {
      semesterId: semesterId.trim(),
    });
    return response.data;
  }

  static async createSemester(data: CreateSemesterRequest): Promise<SemesterResponse> {
    if (!data.code || !data.code.trim()) {
      throw new Error("Throw ValidationException: Semester code is required");
    }
    if (!data.name || !data.name.trim()) {
      throw new Error("Throw ValidationException: Semester name is required");
    }
    if (!data.startDate) {
      throw new Error("Throw ValidationException: Start date is required");
    }
    if (!data.endDate) {
      throw new Error("Throw ValidationException: End date is required");
    }

    const payload: CreateSemesterRequest = {
      code: data.code.trim().toUpperCase(),
      name: data.name.trim(),
      startDate: data.startDate,
      endDate: data.endDate,
    };

    const response = await apiClient.post<SemesterResponse>("/api/admin/semesters", payload);
    return response.data;
  }

  static async patchSemester(
    semesterId: string,
    data: PatchSemesterRequest
  ): Promise<SemesterResponse> {
    if (!semesterId || !semesterId.trim()) {
      throw new Error("Throw ValidationException: Semester ID is required");
    }

    const payload: PatchSemesterRequest = {};
    if (data.code && data.code.trim()) {
      payload.code = data.code.trim().toUpperCase();
    }
    if (data.name && data.name.trim()) {
      payload.name = data.name.trim();
    }
    if (data.startDate) {
      payload.startDate = data.startDate;
    }
    if (data.endDate) {
      payload.endDate = data.endDate;
    }

    const response = await apiClient.patch<SemesterResponse>(
      `/api/admin/semesters/${encodeURIComponent(semesterId.trim())}`,
      payload
    );
    return response.data;
  }

  static async getClasses(): Promise<AcademicClassResponse[]> {
    const response = await apiClient.get<AcademicClassResponse[]>("/api/admin/classes");
    return response.data;
  }

  static async createClass(data: CreateAcademicClassRequest): Promise<AcademicClassResponse> {
    const classCodeVal = (data.classCode || data.code || "").trim().toUpperCase();
    if (!classCodeVal) {
      throw new Error("Throw ValidationException: Class code is required");
    }
    if (!data.name || !data.name.trim()) {
      throw new Error("Throw ValidationException: Class name is required");
    }
    if (!data.semesterId || !data.semesterId.trim()) {
      throw new Error("Throw ValidationException: Semester ID is required");
    }

    const payload = {
      classCode: classCodeVal,
      code: classCodeVal,
      name: data.name.trim(),
      semesterId: data.semesterId.trim(),
    };

    const response = await apiClient.post<AcademicClassResponse>("/api/admin/classes", payload);
    return response.data;
  }

  static async patchClass(
    classId: string,
    data: PatchAcademicClassRequest
  ): Promise<AcademicClassResponse> {
    if (!classId || !classId.trim()) {
      throw new Error("Throw ValidationException: Class ID is required");
    }

    const payload: PatchAcademicClassRequest = {};
    if (data.classCode && data.classCode.trim()) {
      payload.classCode = data.classCode.trim().toUpperCase();
    }
    if (data.name && data.name.trim()) {
      payload.name = data.name.trim();
    }

    const response = await apiClient.patch<AcademicClassResponse>(
      `/api/admin/classes/${encodeURIComponent(classId.trim())}`,
      payload
    );
    return response.data;
  }
}
