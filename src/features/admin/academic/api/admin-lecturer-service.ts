import { apiClient } from "@/lib/axios";
import type {
  AdminLecturerResponse,
  GetAdminLecturersParams,
  AdminLecturerPageResponse,
} from "../types/course-roster-types";

export class AdminLecturerService {
  static async getLecturers(params?: GetAdminLecturersParams): Promise<AdminLecturerResponse[]> {
    const response = await apiClient.get<AdminLecturerResponse[]>("/api/admin/lecturers", {
      params,
    });
    return response.data;
  }

  static async getPagedLecturers(params?: GetAdminLecturersParams): Promise<AdminLecturerPageResponse> {
    const queryParams: GetAdminLecturersParams = {
      page: 0,
      size: 50,
      ...params,
    };
    const response = await apiClient.get<AdminLecturerPageResponse>("/api/admin/lecturers/paged", {
      params: queryParams,
    });
    return response.data;
  }
}
