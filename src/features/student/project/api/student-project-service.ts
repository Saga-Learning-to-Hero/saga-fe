import { apiClient } from "@/lib/axios";
import type {
  StudentTeamProjectResponse,
  ProjectTypeItem,
  CreateStudentProjectRequest,
  StudentCourseTeamResponse,
} from "../types/student-project";

export class StudentProjectService {
  /**
   * Lấy thông tin dự án nhóm của sinh viên trong một khóa học cụ thể
   * GET /api/student/courses/{courseId}/project
   *
   * @param courseId Mã định danh UUID của khóa học (Course ID)
   * @returns Dữ liệu dự án nhóm của sinh viên
   */
  static async getStudentTeamProject(courseId: string): Promise<StudentTeamProjectResponse> {
    if (!courseId || courseId.trim() === "") {
      throw new Error("Throw ValidationException: Course ID is required");
    }

    const cleanCourseId = courseId.trim();
    const response = await apiClient.get<StudentTeamProjectResponse>(
      `/api/student/courses/${encodeURIComponent(cleanCourseId)}/project`
    );

    return response.data;
  }

  /**
   * Lấy thông tin nhóm và danh sách thành viên của sinh viên trong môn học
   * GET /api/student/courses/{courseId}/team
   *
   * @param courseId Mã định danh UUID của môn học
   * @returns Dữ liệu nhóm, vai trò myRole và danh sách thành viên
   */
  static async getStudentTeam(courseId: string): Promise<StudentCourseTeamResponse> {
    if (!courseId || courseId.trim() === "") {
      throw new Error("Throw ValidationException: Course ID is required");
    }

    const cleanCourseId = courseId.trim();
    const response = await apiClient.get<StudentCourseTeamResponse>(
      `/api/student/courses/${encodeURIComponent(cleanCourseId)}/team`
    );

    return response.data;
  }

  /**
   * Lấy danh sách các Loại dự án (Seed Data)
   * GET /api/student/project-types
   *
   * @returns Danh sách các loại dự án có sẵn
   */
  static async getProjectTypes(): Promise<ProjectTypeItem[]> {
    const response = await apiClient.get<ProjectTypeItem[]>("/api/student/project-types");
    return response.data;
  }

  /**
   * Tạo dự án nhóm mới cho môn học (Chỉ dành cho Trưởng nhóm - Team Leader)
   * POST /api/student/courses/{courseId}/project
   *
   * @param courseId Mã định danh UUID của khóa học
   * @param payload Thông tin dự án mới (name, projectTypeId, description)
   * @returns Dự án nhóm vừa được khởi tạo thành công
   */
  static async createStudentProject(
    courseId: string,
    payload: CreateStudentProjectRequest
  ): Promise<StudentTeamProjectResponse> {
    if (!courseId || courseId.trim() === "") {
      throw new Error("Throw ValidationException: Course ID is required");
    }

    if (!payload.name || payload.name.trim() === "") {
      throw new Error("Throw ValidationException: Project name is required");
    }

    if (!payload.projectTypeId || payload.projectTypeId.trim() === "") {
      throw new Error("Throw ValidationException: Project type ID is required");
    }

    if (!payload.description || payload.description.trim() === "") {
      throw new Error("Throw ValidationException: Project description is required");
    }

    const cleanCourseId = courseId.trim();
    const cleanPayload: CreateStudentProjectRequest = {
      name: payload.name.trim(),
      projectTypeId: payload.projectTypeId.trim(),
      description: payload.description.trim(),
    };

    const response = await apiClient.post<StudentTeamProjectResponse>(
      `/api/student/courses/${encodeURIComponent(cleanCourseId)}/project`,
      cleanPayload
    );

    return response.data;
  }
}

