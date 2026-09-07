import { describe, expect, vi, beforeEach } from "vitest";
import { AcademicService } from "./academic-service";
import { apiClient } from "@/lib/axios";
import { fptTest } from "@/testing/fpt-test-helper";

vi.mock("@/lib/axios");

describe("AcademicService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockSemester = {
    id: "b1c6e936-18cd-4b2b-a455-0d78f536dffe",
    code: "FA26",
    name: "Fall 2026",
    startDate: "2026-09-01",
    endDate: "2026-12-31",
    active: true,
    createdAt: "2026-08-01T00:00:00",
  };

  const mockClass = {
    id: "63ae5684-036b-41bb-a205-2ae39f642c1b",
    classCode: "SE1705",
    code: "SE1705",
    name: "Software Engineering 1705",
    semesterId: "b1c6e936-18cd-4b2b-a455-0d78f536dffe",
    semesterCode: "FA26",
    createdAt: "2026-08-15T00:00:00",
  };

  fptTest(
    {
      id: "UTCID01",
      type: "N",
      executedDate: "07/09/2026",
      description: "Lấy danh sách học kỳ thành công",
    },
    async () => {
      vi.spyOn(apiClient, "get").mockResolvedValueOnce({ data: [mockSemester] });

      const res = await AcademicService.getSemesters();

      expect(res).toHaveLength(1);
      expect(res[0].code).toBe("FA26");
    }
  );

  fptTest(
    {
      id: "UTCID02",
      type: "N",
      executedDate: "07/09/2026",
      description: "Tạo học kỳ mới thành công với thông tin hợp lệ",
    },
    async () => {
      vi.spyOn(apiClient, "post").mockResolvedValueOnce({ data: mockSemester });

      const res = await AcademicService.createSemester({
        code: "fa26",
        name: "Fall 2026",
        startDate: "2026-09-01",
        endDate: "2026-12-31",
      });

      expect(res.code).toBe("FA26");
    }
  );

  fptTest(
    {
      id: "UTCID03",
      type: "N",
      executedDate: "07/09/2026",
      description: "Lấy danh sách lớp hành chính thành công",
    },
    async () => {
      vi.spyOn(apiClient, "get").mockResolvedValueOnce({ data: [mockClass] });

      const res = await AcademicService.getClasses();

      expect(res).toHaveLength(1);
      expect(res[0].code).toBe("SE1705");
    }
  );

  fptTest(
    {
      id: "UTCID04",
      type: "N",
      executedDate: "07/09/2026",
      description: "Tạo lớp hành chính mới thành công gắn với semesterId",
    },
    async () => {
      vi.spyOn(apiClient, "post").mockResolvedValueOnce({ data: mockClass });

      const res = await AcademicService.createClass({
        code: "se1705",
        name: "Software Engineering 1705",
        semesterId: mockSemester.id,
      });

      expect(res.code).toBe("SE1705");
    }
  );

  fptTest(
    {
      id: "UTCID05",
      type: "A",
      executedDate: "07/09/2026",
      description: "Throw ValidationException khi tạo học kỳ thiếu mã kỳ",
    },
    async () => {
      await expect(
        AcademicService.createSemester({
          code: "",
          name: "Fall 2026",
          startDate: "2026-09-01",
          endDate: "2026-12-31",
        })
      ).rejects.toThrow("Throw ValidationException: Semester code is required");
    }
  );

  fptTest(
    {
      id: "UTCID06",
      type: "A",
      executedDate: "07/09/2026",
      description: "Throw ValidationException khi tạo học kỳ thiếu startDate hoặc endDate",
    },
    async () => {
      await expect(
        AcademicService.createSemester({
          code: "FA26",
          name: "Fall 2026",
          startDate: "",
          endDate: "2026-12-31",
        })
      ).rejects.toThrow("Throw ValidationException: Start date is required");
    }
  );

  fptTest(
    {
      id: "UTCID07",
      type: "A",
      executedDate: "07/09/2026",
      description: "Throw ValidationException khi tạo lớp hành chính thiếu semesterId",
    },
    async () => {
      await expect(
        AcademicService.createClass({
          code: "SE1705",
          name: "Class 1705",
          semesterId: "",
        })
      ).rejects.toThrow("Throw ValidationException: Semester ID is required");
    }
  );

  fptTest(
    {
      id: "UTCID08",
      type: "A",
      executedDate: "07/09/2026",
      description: "Xử lý lỗi khi mã học kỳ đã tồn tại",
    },
    async () => {
      vi.spyOn(apiClient, "post").mockRejectedValueOnce(
        new Error("SEMESTER_CODE_ALREADY_EXISTS")
      );

      await expect(
        AcademicService.createSemester({
          code: "FA26",
          name: "Fall 2026",
          startDate: "2026-09-01",
          endDate: "2026-12-31",
        })
      ).rejects.toThrow("SEMESTER_CODE_ALREADY_EXISTS");
    }
  );

  fptTest(
    {
      id: "UTCID09",
      type: "B",
      executedDate: "07/09/2026",
      description: "Tự động trim khoảng trắng và uppercase mã học kỳ khi tạo",
    },
    async () => {
      const postSpy = vi.spyOn(apiClient, "post").mockResolvedValueOnce({
        data: mockSemester,
      });

      await AcademicService.createSemester({
        code: "  sp26  ",
        name: "  Spring 2026  ",
        startDate: "2026-01-01",
        endDate: "2026-05-30",
      });

      expect(postSpy).toHaveBeenCalledWith("/api/admin/semesters", {
        code: "SP26",
        name: "Spring 2026",
        startDate: "2026-01-01",
        endDate: "2026-05-30",
      });
    }
  );

  fptTest(
    {
      id: "UTCID10",
      type: "B",
      executedDate: "07/09/2026",
      description: "Tự động trim khoảng trắng và uppercase mã lớp hành chính khi tạo",
    },
    async () => {
      const postSpy = vi.spyOn(apiClient, "post").mockResolvedValueOnce({
        data: mockClass,
      });

      await AcademicService.createClass({
        code: "  se1801  ",
        name: "  Cohort Class 1801  ",
        semesterId: "  sem-123  ",
      });

      expect(postSpy).toHaveBeenCalledWith("/api/admin/classes", {
        classCode: "SE1801",
        code: "SE1801",
        name: "Cohort Class 1801",
        semesterId: "sem-123",
      });
    }
  );

  fptTest(
    {
      id: "UTCID11",
      type: "N",
      executedDate: "07/09/2026",
      description: "Cập nhật mã lớp và tên lớp hành chính thành công qua PATCH",
    },
    async () => {
      const updatedMockClass = {
        ...mockClass,
        classCode: "SE1705_NEW",
        name: "Lớp SE1705 Đã Đổi Tên",
      };
      vi.spyOn(apiClient, "patch").mockResolvedValueOnce({ data: updatedMockClass });

      const res = await AcademicService.patchClass(mockClass.id, {
        classCode: "SE1705_NEW",
        name: "Lớp SE1705 Đã Đổi Tên",
      });

      expect(res.classCode).toBe("SE1705_NEW");
      expect(res.name).toBe("Lớp SE1705 Đã Đổi Tên");
    }
  );

  fptTest(
    {
      id: "UTCID12",
      type: "A",
      executedDate: "07/09/2026",
      description: "Throw ValidationException khi classId rỗng khi patch lớp hành chính",
    },
    async () => {
      await expect(
        AcademicService.patchClass("", {
          name: "Ten moi",
        })
      ).rejects.toThrow("Throw ValidationException: Class ID is required");
    }
  );

  fptTest(
    {
      id: "UTCID13",
      type: "A",
      executedDate: "07/09/2026",
      description: "Xử lý lỗi khi trùng mã lớp hành chính lúc patch (ACADEMIC_CLASS_CODE_DUPLICATE)",
    },
    async () => {
      vi.spyOn(apiClient, "patch").mockRejectedValueOnce(
        new Error("ACADEMIC_CLASS_CODE_DUPLICATE")
      );

      await expect(
        AcademicService.patchClass(mockClass.id, {
          classCode: "SE1802",
        })
      ).rejects.toThrow("ACADEMIC_CLASS_CODE_DUPLICATE");
    }
  );

  fptTest(
    {
      id: "UTCID14",
      type: "B",
      executedDate: "07/09/2026",
      description: "Tự động trim khoảng trắng và uppercase mã lớp hành chính khi patch",
    },
    async () => {
      const patchSpy = vi.spyOn(apiClient, "patch").mockResolvedValueOnce({
        data: mockClass,
      });

      await AcademicService.patchClass(mockClass.id, {
        classCode: "  se1705_edit  ",
        name: "  Ten Lop Trim  ",
      });

      expect(patchSpy).toHaveBeenCalledWith(
        `/api/admin/classes/${mockClass.id}`,
        {
          classCode: "SE1705_EDIT",
          name: "Ten Lop Trim",
        }
      );
    }
  );

  fptTest(
    {
      id: "UTCID15",
      type: "N",
      executedDate: "07/09/2026",
      description: "Lấy chi tiết học kỳ theo ID thành công",
    },
    async () => {
      vi.spyOn(apiClient, "get").mockResolvedValueOnce({ data: mockSemester });

      const res = await AcademicService.getSemesterById(mockSemester.id);

      expect(res.id).toBe(mockSemester.id);
      expect(res.code).toBe("FA26");
    }
  );

  fptTest(
    {
      id: "UTCID16",
      type: "A",
      executedDate: "07/09/2026",
      description: "Throw ValidationException khi semesterId rỗng khi lấy chi tiết",
    },
    async () => {
      await expect(AcademicService.getSemesterById("")).rejects.toThrow(
        "Throw ValidationException: Semester ID is required"
      );
    }
  );

  fptTest(
    {
      id: "UTCID17",
      type: "N",
      executedDate: "07/09/2026",
      description: "Lấy học kỳ active của nền tảng thành công",
    },
    async () => {
      vi.spyOn(apiClient, "get").mockResolvedValueOnce({ data: mockSemester });

      const res = await AcademicService.getActiveSemester();

      expect(res).not.toBeNull();
      expect(res?.active).toBe(true);
    }
  );

  fptTest(
    {
      id: "UTCID18",
      type: "N",
      executedDate: "07/09/2026",
      description: "Kích hoạt học kỳ làm active semester thành công qua PUT",
    },
    async () => {
      const putSpy = vi.spyOn(apiClient, "put").mockResolvedValueOnce({
        data: { ...mockSemester, active: true },
      });

      const res = await AcademicService.setActiveSemester(mockSemester.id);

      expect(putSpy).toHaveBeenCalledWith("/api/admin/semesters/active", {
        semesterId: mockSemester.id,
      });
      expect(res.active).toBe(true);
    }
  );

  fptTest(
    {
      id: "UTCID19",
      type: "A",
      executedDate: "07/09/2026",
      description: "Throw ValidationException khi semesterId rỗng khi setActiveSemester",
    },
    async () => {
      await expect(AcademicService.setActiveSemester("   ")).rejects.toThrow(
        "Throw ValidationException: Semester ID is required"
      );
    }
  );

  fptTest(
    {
      id: "UTCID20",
      type: "N",
      executedDate: "07/09/2026",
      description: "Cập nhật học kỳ thành công qua PATCH",
    },
    async () => {
      const updatedSemester = {
        ...mockSemester,
        name: "Fall 2026 Extended",
        endDate: "2027-01-15",
      };
      vi.spyOn(apiClient, "patch").mockResolvedValueOnce({ data: updatedSemester });

      const res = await AcademicService.patchSemester(mockSemester.id, {
        name: "Fall 2026 Extended",
        endDate: "2027-01-15",
      });

      expect(res.name).toBe("Fall 2026 Extended");
      expect(res.endDate).toBe("2027-01-15");
    }
  );

  fptTest(
    {
      id: "UTCID21",
      type: "A",
      executedDate: "07/09/2026",
      description: "Throw ValidationException khi semesterId rỗng khi patchSemester",
    },
    async () => {
      await expect(
        AcademicService.patchSemester("", { name: "Name" })
      ).rejects.toThrow("Throw ValidationException: Semester ID is required");
    }
  );

  fptTest(
    {
      id: "UTCID22",
      type: "B",
      executedDate: "07/09/2026",
      description: "Tự động trim và uppercase mã học kỳ khi patchSemester",
    },
    async () => {
      const patchSpy = vi.spyOn(apiClient, "patch").mockResolvedValueOnce({
        data: mockSemester,
      });

      await AcademicService.patchSemester(mockSemester.id, {
        code: "  fa26_edit  ",
        name: "  Fall 2026 Trim  ",
      });

      expect(patchSpy).toHaveBeenCalledWith(
        `/api/admin/semesters/${mockSemester.id}`,
        {
          code: "FA26_EDIT",
          name: "Fall 2026 Trim",
        }
      );
    }
  );
});
