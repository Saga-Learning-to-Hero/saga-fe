import { describe, expect, vi, beforeEach } from "vitest";
import { CourseService } from "./course-service";
import { apiClient } from "@/lib/axios";
import { fptTest } from "@/testing/fpt-test-helper";

vi.mock("@/lib/axios");

describe("CourseService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockCourse = {
    id: "2bf1c497-71d4-43f2-a683-b74b7ad74327",
    courseCode: "SWP391-SE1705-FA26",
    name: "Software Development Project - SE1705",
    subjectId: "94ced810-3c75-4bfb-b188-c48c2f29651b",
    subjectCode: "SWP391",
    academicClassId: "63ae5684-036b-41bb-a205-2ae39f642c1b",
    classCode: "SE1705",
    semesterId: "b1c6e936-18cd-4b2b-a455-0d78f536dffe",
    semesterCode: "FA26",
    syllabusVersionId: "799bceba-46dc-4713-8161-0192d01275d2",
    lecturerId: "lec-profile-uuid-1",
    lecturerName: "Nguyen Van A",
    createdAt: "2026-09-01T00:00:00",
  };

  fptTest(
    {
      id: "UTCID01",
      type: "N",
      executedDate: "07/09/2026",
      description: "Lấy danh sách lớp học phần của Admin thành công",
    },
    async () => {
      vi.spyOn(apiClient, "get").mockResolvedValueOnce({ data: [mockCourse] });

      const res = await CourseService.getCourses({ semesterId: mockCourse.semesterId });

      expect(res).toHaveLength(1);
      expect(res[0].id).toBe(mockCourse.id);
    }
  );

  fptTest(
    {
      id: "UTCID02",
      type: "N",
      executedDate: "07/09/2026",
      description: "Lấy chi tiết lớp học phần theo courseId thành công",
    },
    async () => {
      vi.spyOn(apiClient, "get").mockResolvedValueOnce({ data: mockCourse });

      const res = await CourseService.getCourseById(mockCourse.id);

      expect(res.id).toBe(mockCourse.id);
      expect(res.courseCode).toBe(mockCourse.courseCode);
    }
  );

  fptTest(
    {
      id: "UTCID03",
      type: "N",
      executedDate: "07/09/2026",
      description: "Tạo lớp học phần mới thành công từ class, subject, published syllabus, lecturer",
    },
    async () => {
      vi.spyOn(apiClient, "post").mockResolvedValueOnce({ data: mockCourse });

      const res = await CourseService.createCourse({
        academicClassId: mockCourse.academicClassId,
        subjectId: mockCourse.subjectId,
        syllabusVersionId: mockCourse.syllabusVersionId,
        lecturerId: mockCourse.lecturerId,
        name: mockCourse.name,
      });

      expect(res.id).toBe(mockCourse.id);
    }
  );

  fptTest(
    {
      id: "UTCID04",
      type: "N",
      executedDate: "07/09/2026",
      description: "Cập nhật thông tin lớp học phần thành công",
    },
    async () => {
      vi.spyOn(apiClient, "patch").mockResolvedValueOnce({
        data: { ...mockCourse, name: "Updated Course Name" },
      });

      const res = await CourseService.patchCourse(mockCourse.id, {
        name: "Updated Course Name",
      });

      expect(res.name).toBe("Updated Course Name");
    }
  );

  fptTest(
    {
      id: "UTCID05",
      type: "A",
      executedDate: "07/09/2026",
      description: "Throw ValidationException khi tạo course thiếu academicClassId",
    },
    async () => {
      await expect(
        CourseService.createCourse({
          academicClassId: "",
          subjectId: mockCourse.subjectId,
          syllabusVersionId: mockCourse.syllabusVersionId,
          lecturerId: mockCourse.lecturerId,
        })
      ).rejects.toThrow("Throw ValidationException: Academic class ID is required");
    }
  );

  fptTest(
    {
      id: "UTCID06",
      type: "A",
      executedDate: "07/09/2026",
      description: "Throw ValidationException khi tạo course thiếu subjectId",
    },
    async () => {
      await expect(
        CourseService.createCourse({
          academicClassId: mockCourse.academicClassId,
          subjectId: "",
          syllabusVersionId: mockCourse.syllabusVersionId,
          lecturerId: mockCourse.lecturerId,
        })
      ).rejects.toThrow("Throw ValidationException: Subject ID is required");
    }
  );

  fptTest(
    {
      id: "UTCID07",
      type: "A",
      executedDate: "07/09/2026",
      description: "Throw ValidationException khi tạo course thiếu syllabusVersionId",
    },
    async () => {
      await expect(
        CourseService.createCourse({
          academicClassId: mockCourse.academicClassId,
          subjectId: mockCourse.subjectId,
          syllabusVersionId: "",
          lecturerId: mockCourse.lecturerId,
        })
      ).rejects.toThrow("Throw ValidationException: Published syllabus version ID is required");
    }
  );

  fptTest(
    {
      id: "UTCID08",
      type: "A",
      executedDate: "07/09/2026",
      description: "Throw ValidationException khi tạo course thiếu lecturerId",
    },
    async () => {
      await expect(
        CourseService.createCourse({
          academicClassId: mockCourse.academicClassId,
          subjectId: mockCourse.subjectId,
          syllabusVersionId: mockCourse.syllabusVersionId,
          lecturerId: "",
        })
      ).rejects.toThrow("Throw ValidationException: Lecturer ID is required");
    }
  );

  fptTest(
    {
      id: "UTCID09",
      type: "A",
      executedDate: "07/09/2026",
      description: "Xử lý lỗi khi đổi syllabus trên course đã có enrollment (COURSE_SYLLABUS_IMMUTABLE)",
    },
    async () => {
      vi.spyOn(apiClient, "patch").mockRejectedValueOnce(
        new Error("COURSE_SYLLABUS_IMMUTABLE")
      );

      await expect(
        CourseService.patchCourse(mockCourse.id, {
          syllabusVersionId: "new-version-id",
        })
      ).rejects.toThrow("COURSE_SYLLABUS_IMMUTABLE");
    }
  );

  fptTest(
    {
      id: "UTCID10",
      type: "B",
      executedDate: "07/09/2026",
      description: "Throw ValidationException khi courseId chỉ toàn khoảng trắng",
    },
    async () => {
      await expect(CourseService.getCourseById("   ")).rejects.toThrow(
        "Throw ValidationException: Course ID is required"
      );
    }
  );

  fptTest(
    {
      id: "UTCID11",
      type: "B",
      executedDate: "07/09/2026",
      description: "Tự động trim khoảng trắng cho các UUID tham số khi tạo",
    },
    async () => {
      const postSpy = vi.spyOn(apiClient, "post").mockResolvedValueOnce({
        data: mockCourse,
      });

      await CourseService.createCourse({
        academicClassId: `  ${mockCourse.academicClassId}  `,
        subjectId: `  ${mockCourse.subjectId}  `,
        syllabusVersionId: `  ${mockCourse.syllabusVersionId}  `,
        lecturerId: `  ${mockCourse.lecturerId}  `,
      });

      expect(postSpy).toHaveBeenCalledWith("/api/admin/courses", {
        academicClassId: mockCourse.academicClassId,
        subjectId: mockCourse.subjectId,
        syllabusVersionId: mockCourse.syllabusVersionId,
        lecturerId: mockCourse.lecturerId,
        courseCode: undefined,
        name: undefined,
      });
    }
  );
});
