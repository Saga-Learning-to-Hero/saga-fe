import { describe, expect, vi, beforeEach } from "vitest";
import { SubjectService } from "./subject-service";
import { apiClient } from "@/lib/axios";
import { fptTest } from "@/testing/fpt-test-helper";

vi.mock("@/lib/axios");

describe("SubjectService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockSubject = {
    id: "94ced810-3c75-4bfb-b188-c48c2f29651b",
    code: "SWP391",
    nameEnglish: "Software Development Project",
    nameVietnamese: "Dự án phát triển phần mềm",
    status: "ACTIVE" as const,
    createdAt: "2026-09-01T00:00:00",
    updatedAt: "2026-09-01T00:00:00",
  };

  fptTest(
    {
      id: "UTCID01",
      type: "N",
      executedDate: "07/09/2026",
      description: "Lấy danh sách môn học thành công",
    },
    async () => {
      vi.spyOn(apiClient, "get").mockResolvedValueOnce({ data: [mockSubject] });

      const res = await SubjectService.getSubjects({ status: "ACTIVE" });

      expect(res).toHaveLength(1);
      expect(res[0].code).toBe("SWP391");
    }
  );

  fptTest(
    {
      id: "UTCID02",
      type: "N",
      executedDate: "07/09/2026",
      description: "Lấy chi tiết môn học thành công theo ID",
    },
    async () => {
      vi.spyOn(apiClient, "get").mockResolvedValueOnce({ data: mockSubject });

      const res = await SubjectService.getSubjectById("94ced810-3c75-4bfb-b188-c48c2f29651b");

      expect(res.id).toBe("94ced810-3c75-4bfb-b188-c48c2f29651b");
      expect(res.nameEnglish).toBe("Software Development Project");
    }
  );

  fptTest(
    {
      id: "UTCID03",
      type: "N",
      executedDate: "07/09/2026",
      description: "Tạo môn học mới thành công với thông tin hợp lệ",
    },
    async () => {
      vi.spyOn(apiClient, "post").mockResolvedValueOnce({ data: mockSubject });

      const res = await SubjectService.createSubject({
        code: "swp391",
        nameEnglish: "Software Development Project",
        nameVietnamese: "Dự án phát triển phần mềm",
      });

      expect(res.code).toBe("SWP391");
    }
  );

  fptTest(
    {
      id: "UTCID04",
      type: "N",
      executedDate: "07/09/2026",
      description: "Cập nhật tên và trạng thái môn học thành công",
    },
    async () => {
      vi.spyOn(apiClient, "patch").mockResolvedValueOnce({
        data: { ...mockSubject, status: "INACTIVE" },
      });

      const res = await SubjectService.updateSubject(mockSubject.id, {
        status: "INACTIVE",
      });

      expect(res.status).toBe("INACTIVE");
    }
  );

  fptTest(
    {
      id: "UTCID05",
      type: "A",
      executedDate: "07/09/2026",
      description: "Throw ValidationException khi mã môn bị để trống",
    },
    async () => {
      await expect(
        SubjectService.createSubject({
          code: "",
          nameEnglish: "Software Project",
        })
      ).rejects.toThrow("Throw ValidationException: Subject code is required");
    }
  );

  fptTest(
    {
      id: "UTCID06",
      type: "A",
      executedDate: "07/09/2026",
      description: "Throw ValidationException khi tên tiếng Anh bị để trống",
    },
    async () => {
      await expect(
        SubjectService.createSubject({
          code: "SWP391",
          nameEnglish: "",
        })
      ).rejects.toThrow("Throw ValidationException: English name is required");
    }
  );

  fptTest(
    {
      id: "UTCID07",
      type: "A",
      executedDate: "07/09/2026",
      description: "Throw ValidationException khi subject ID rỗng",
    },
    async () => {
      await expect(SubjectService.getSubjectById("   ")).rejects.toThrow(
        "Throw ValidationException: Subject ID is required"
      );
    }
  );

  fptTest(
    {
      id: "UTCID08",
      type: "A",
      executedDate: "07/09/2026",
      description: "Xử lý lỗi 409 khi mã môn học đã tồn tại trong hệ thống",
    },
    async () => {
      vi.spyOn(apiClient, "post").mockRejectedValueOnce(
        new Error("SUBJECT_CODE_ALREADY_EXISTS")
      );

      await expect(
        SubjectService.createSubject({
          code: "SWP391",
          nameEnglish: "Duplicate Subject",
        })
      ).rejects.toThrow("SUBJECT_CODE_ALREADY_EXISTS");
    }
  );

  fptTest(
    {
      id: "UTCID09",
      type: "A",
      executedDate: "07/09/2026",
      description: "Xử lý lỗi khi máy chủ gặp sự cố HTTP 500",
    },
    async () => {
      vi.spyOn(apiClient, "get").mockRejectedValueOnce(new Error("Internal Server Error"));

      await expect(SubjectService.getSubjects()).rejects.toThrow("Internal Server Error");
    }
  );

  fptTest(
    {
      id: "UTCID10",
      type: "B",
      executedDate: "07/09/2026",
      description: "Throw ValidationException khi mã môn chỉ chứa toàn khoảng trắng",
    },
    async () => {
      await expect(
        SubjectService.createSubject({
          code: "    ",
          nameEnglish: "Valid Name",
        })
      ).rejects.toThrow("Throw ValidationException: Subject code is required");
    }
  );

  fptTest(
    {
      id: "UTCID11",
      type: "B",
      executedDate: "07/09/2026",
      description: "Tự động trim khoảng trắng và chuyển uppercase cho mã môn khi tạo",
    },
    async () => {
      const postSpy = vi.spyOn(apiClient, "post").mockResolvedValueOnce({
        data: { ...mockSubject, code: "PRN211" },
      });

      await SubjectService.createSubject({
        code: "  prn211  ",
        nameEnglish: "  Basic Cross-Platform  ",
      });

      expect(postSpy).toHaveBeenCalledWith("/api/admin/subjects", {
        code: "PRN211",
        nameEnglish: "Basic Cross-Platform",
        nameVietnamese: null,
      });
    }
  );

  fptTest(
    {
      id: "UTCID12",
      type: "B",
      executedDate: "07/09/2026",
      description: "Throw ValidationException khi cập nhật tên tiếng Anh bằng chuỗi rỗng",
    },
    async () => {
      await expect(
        SubjectService.updateSubject(mockSubject.id, {
          nameEnglish: "   ",
        })
      ).rejects.toThrow("Throw ValidationException: English name cannot be empty");
    }
  );
});
