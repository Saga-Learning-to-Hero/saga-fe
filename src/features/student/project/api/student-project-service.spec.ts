import { describe, expect, vi, beforeEach } from "vitest";
import { StudentProjectService } from "./student-project-service";
import { apiClient } from "@/lib/axios";
import { fptTest } from "@/testing/fpt-test-helper";
import type { StudentTeamProjectResponse } from "../types/student-project";

vi.mock("@/lib/axios");

describe("StudentProjectService - API Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockProjectResponse: StudentTeamProjectResponse = {
    projectId: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    courseId: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    teamId: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    teamNo: 1,
    teamName: "SAGA Development Team",
    name: "Hệ thống Đánh giá Công sức SAGA",
    description: "Nền tảng hỗ trợ minh bạch hóa đóng góp đồ án",
    projectType: { id: "pt-01", code: "CAPSTONE", name: "Đồ án Tốt nghiệp" },
    createdBy: { userId: "user-01", fullName: "Huỳnh Phước Thiện" },
    createdAt: "2026-09-07T07:09:47.882Z",
  };

  // --- GET /api/student/courses/{courseId}/project ---
  fptTest(
    { id: "UTCID01", type: "N", executedDate: "07/09/2026", description: "Lấy dự án nhóm thành công (HTTP 200)" },
    async () => {
      vi.spyOn(apiClient, "get").mockResolvedValueOnce({ data: mockProjectResponse });
      const res = await StudentProjectService.getStudentTeamProject("course-123");
      expect(apiClient.get).toHaveBeenCalledWith("/api/student/courses/course-123/project");
      expect(res.projectId).toBe(mockProjectResponse.projectId);
    }
  );

  fptTest(
    { id: "UTCID02", type: "A", executedDate: "07/09/2026", description: "Throw ValidationException khi courseId bị rỗng" },
    async () => {
      await expect(StudentProjectService.getStudentTeamProject("")).rejects.toThrow("Throw ValidationException: Course ID is required");
      await expect(StudentProjectService.getStudentTeamProject("   ")).rejects.toThrow("Throw ValidationException: Course ID is required");
    }
  );

  fptTest(
    { id: "UTCID03", type: "B", executedDate: "07/09/2026", description: "Cắt tỉa khoảng trắng 2 đầu courseId trước khi gọi API" },
    async () => {
      vi.spyOn(apiClient, "get").mockResolvedValueOnce({ data: mockProjectResponse });
      const res = await StudentProjectService.getStudentTeamProject("  course-123  ");
      expect(apiClient.get).toHaveBeenCalledWith("/api/student/courses/course-123/project");
      expect(res.name).toBe(mockProjectResponse.name);
    }
  );

  fptTest(
    { id: "UTCID04", type: "A", executedDate: "07/09/2026", description: "Ném lỗi ngoại lệ khi Backend trả về lỗi 404 hoặc 500" },
    async () => {
      vi.spyOn(apiClient, "get").mockRejectedValueOnce({ response: { status: 404, data: { message: "PROJECT_NOT_FOUND" } } });
      await expect(StudentProjectService.getStudentTeamProject("c-1")).rejects.toMatchObject({ response: { status: 404 } });

      vi.spyOn(apiClient, "get").mockRejectedValueOnce({ response: { status: 500 } });
      await expect(StudentProjectService.getStudentTeamProject("c-1")).rejects.toMatchObject({ response: { status: 500 } });
    }
  );

  // --- GET /api/student/project-types ---
  fptTest(
    { id: "UTCID05", type: "N", executedDate: "07/09/2026", description: "Lấy danh sách loại dự án (project types) thành công" },
    async () => {
      const mockTypes = [{ id: "pt-01", code: "CAPSTONE", name: "Đồ án Tốt nghiệp", description: "Mô tả" }];
      vi.spyOn(apiClient, "get").mockResolvedValueOnce({ data: mockTypes });
      const res = await StudentProjectService.getProjectTypes();
      expect(apiClient.get).toHaveBeenCalledWith("/api/student/project-types");
      expect(res).toEqual(mockTypes);
    }
  );

  // --- POST /api/student/courses/{courseId}/project ---
  fptTest(
    { id: "UTCID06", type: "N", executedDate: "07/09/2026", description: "Tạo dự án nhóm mới thành công với payload hợp lệ" },
    async () => {
      vi.spyOn(apiClient, "post").mockResolvedValueOnce({ data: mockProjectResponse });
      const payload = { name: "Hệ thống SAGA", projectTypeId: "pt-01", description: "Mô tả dự án" };
      const res = await StudentProjectService.createStudentProject("course-123", payload);
      expect(apiClient.post).toHaveBeenCalledWith("/api/student/courses/course-123/project", payload);
      expect(res.name).toBe(mockProjectResponse.name);
    }
  );

  fptTest(
    { id: "UTCID07", type: "A", executedDate: "07/09/2026", description: "Throw ValidationException khi thiếu các trường bắt buộc" },
    async () => {
      await expect(StudentProjectService.createStudentProject("", { name: "N", projectTypeId: "P", description: "D" }))
        .rejects.toThrow("Throw ValidationException: Course ID is required");
      await expect(StudentProjectService.createStudentProject("c-1", { name: "", projectTypeId: "P", description: "D" }))
        .rejects.toThrow("Throw ValidationException: Project name is required");
      await expect(StudentProjectService.createStudentProject("c-1", { name: "N", projectTypeId: "", description: "D" }))
        .rejects.toThrow("Throw ValidationException: Project type ID is required");
      await expect(StudentProjectService.createStudentProject("c-1", { name: "N", projectTypeId: "P", description: "" }))
        .rejects.toThrow("Throw ValidationException: Project description is required");
    }
  );

  fptTest(
    { id: "UTCID08", type: "B", executedDate: "07/09/2026", description: "Tự động cắt tỉa khoảng trắng các trường khi tạo dự án" },
    async () => {
      vi.spyOn(apiClient, "post").mockResolvedValueOnce({ data: mockProjectResponse });
      await StudentProjectService.createStudentProject("  course-123  ", {
        name: "  SAGA  ",
        projectTypeId: "  pt-01  ",
        description: "  Mô tả  ",
      });
      expect(apiClient.post).toHaveBeenCalledWith("/api/student/courses/course-123/project", {
        name: "SAGA",
        projectTypeId: "pt-01",
        description: "Mô tả",
      });
    }
  );
});
