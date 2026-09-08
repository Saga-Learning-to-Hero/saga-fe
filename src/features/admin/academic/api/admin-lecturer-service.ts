import { apiClient } from "@/lib/axios";
import type {
  AdminLecturerResponse,
  GetAdminLecturersParams,
} from "../types/course-roster-types";

export class AdminLecturerService {
  static async getLecturers(params?: GetAdminLecturersParams): Promise<AdminLecturerResponse[]> {
    const response = await apiClient.get<AdminLecturerResponse[]>("/api/admin/lecturers", {
      params,
    });
    return response.data;
  }
}
