import { describe, expect, vi, beforeEach } from "vitest";
import { RosterService } from "./roster-service";
import { apiClient } from "@/lib/axios";
import { fptTest } from "@/testing/fpt-test-helper";

vi.mock("@/lib/axios");

describe("RosterService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockCourseId = "2bf1c497-71d4-43f2-a683-b74b7ad74327";

  const mockRosterItem = {
    id: "enr-1",
    studentId: "stu-1",
    studentCode: "SE170504",
    email: "hailhse170504@fpt.edu.vn",
    fullName: "Le Hoang Hai",
    status: "ENROLLED" as const,
    enrolledAt: "2026-09-01T00:00:00",
  };

  const mockPreviewResponse = {
    previewToken: "opaque-preview-token-xyz",
    courseId: mockCourseId,
    classCode: "SE1705",
    summary: {
      totalRows: 30,
      validCount: 29,
      errorCount: 1,
      existingAccountsCount: 25,
      newInvitesCount: 4,
    },
    rows: [],
  };

  fptTest(
    {
      id: "UTCID01",
      type: "N",
      executedDate: "07/09/2026",
      description: "Tải file Excel mẫu Roster thành công dạng Blob",
    },
    async () => {
      const mockBlob = new Blob(["fake-excel-content"], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      vi.spyOn(apiClient, "get").mockResolvedValueOnce({ data: mockBlob });

      const res = await RosterService.getRosterTemplate(mockCourseId);

      expect(res).toBeInstanceOf(Blob);
    }
  );

  fptTest(
    {
      id: "UTCID02",
      type: "N",
      executedDate: "07/09/2026",
      description: "Lấy danh sách sinh viên hiện tại trong lớp thành công",
    },
    async () => {
      vi.spyOn(apiClient, "get").mockResolvedValueOnce({ data: [mockRosterItem] });

      const res = await RosterService.getRoster(mockCourseId);

      expect(res.entries).toHaveLength(1);
      expect(res.entries[0].studentCode).toBe("SE170504");
    }
  );

  fptTest(
    {
      id: "UTCID03",
      type: "N",
      executedDate: "07/09/2026",
      description: "Upload xem trước file Excel import thành công, nhận previewToken",
    },
    async () => {
      vi.spyOn(apiClient, "post").mockResolvedValueOnce({ data: mockPreviewResponse });

      const fakeFile = new File(["dummy"], "students.xlsx", {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const res = await RosterService.previewImport(mockCourseId, fakeFile);

      expect(res.previewToken).toBe("opaque-preview-token-xyz");
      expect(res.summary.validCount).toBe(29);
    }
  );

  fptTest(
    {
      id: "UTCID04",
      type: "N",
      executedDate: "07/09/2026",
      description: "Xác nhận import Roster sinh viên thành công",
    },
    async () => {
      vi.spyOn(apiClient, "post").mockResolvedValueOnce({
        data: { courseId: mockCourseId, enrolled: 25, invited: 4 },
      });

      const res = await RosterService.confirmImport(mockCourseId, {
        previewToken: "opaque-preview-token-xyz",
      });

      expect(res.enrolled).toBe(25);
      expect(res.invited).toBe(4);
    }
  );

  fptTest(
    {
      id: "UTCID05",
      type: "A",
      executedDate: "07/09/2026",
      description: "Throw ValidationException khi tải template mà courseId rỗng",
    },
    async () => {
      await expect(RosterService.getRosterTemplate("")).rejects.toThrow(
        "Throw ValidationException: Course ID is required"
      );
    }
  );

  fptTest(
    {
      id: "UTCID06",
      type: "A",
      executedDate: "07/09/2026",
      description: "Throw ValidationException khi upload preview mà thiếu file",
    },
    async () => {
      await expect(
        RosterService.previewImport(mockCourseId, null as unknown as File)
      ).rejects.toThrow("Throw ValidationException: Excel file is required");
    }
  );

  fptTest(
    {
      id: "UTCID07",
      type: "A",
      executedDate: "07/09/2026",
      description: "Throw ValidationException khi confirm import mà thiếu previewToken",
    },
    async () => {
      await expect(
        RosterService.confirmImport(mockCourseId, { previewToken: "" })
      ).rejects.toThrow("Throw ValidationException: Preview token is required");
    }
  );

  fptTest(
    {
      id: "UTCID08",
      type: "A",
      executedDate: "07/09/2026",
      description: "Xử lý lỗi khi file Excel sai định dạng hoặc hỏng",
    },
    async () => {
      vi.spyOn(apiClient, "post").mockRejectedValueOnce(
        new Error("INVALID_EXCEL_FORMAT")
      );

      const fakeFile = new File(["bad"], "bad.xlsx");

      await expect(
        RosterService.previewImport(mockCourseId, fakeFile)
      ).rejects.toThrow("INVALID_EXCEL_FORMAT");
    }
  );

  fptTest(
    {
      id: "UTCID09",
      type: "B",
      executedDate: "07/09/2026",
      description: "Throw ValidationException khi courseId chỉ toàn khoảng trắng",
    },
    async () => {
      await expect(RosterService.getRoster("    ")).rejects.toThrow(
        "Throw ValidationException: Course ID is required"
      );
    }
  );

  fptTest(
    {
      id: "UTCID10",
      type: "B",
      executedDate: "07/09/2026",
      description: "Gửi đúng formData với part name là file",
    },
    async () => {
      const postSpy = vi.spyOn(apiClient, "post").mockResolvedValueOnce({
        data: mockPreviewResponse,
      });

      const fakeFile = new File(["test"], "roster.xlsx");
      await RosterService.previewImport(mockCourseId, fakeFile);

      expect(postSpy).toHaveBeenCalledTimes(1);
      const [url, body] = postSpy.mock.calls[0];
      expect(url).toBe(`/api/admin/courses/${mockCourseId}/roster/import/preview`);
      expect(body).toBeInstanceOf(FormData);
      expect((body as FormData).get("file")).toBe(fakeFile);
    }
  );

  fptTest(
    {
      id: "UTCID11",
      type: "N",
      executedDate: "08/09/2026",
      description: "Them thu cong mot sinh vien vao lop hoc phan thanh cong",
    },
    async () => {
      const mockNewStudent = {
        id: "enr-new",
        studentCode: "SE183904",
        fullName: "Le Hoang Hai",
        email: "hailhse183904@fpt.edu.vn",
        memberCode: "HaiLHSE183904",
        status: "ENROLLED" as const,
      };

      vi.spyOn(apiClient, "post").mockResolvedValueOnce({ data: mockNewStudent });

      const res = await RosterService.addStudent(mockCourseId, {
        studentCode: "SE183904",
        fullName: "Le Hoang Hai",
        email: "hailhse183904@fpt.edu.vn",
        memberCode: "HaiLHSE183904",
      });

      expect(res.studentCode).toBe("SE183904");
      expect(res.fullName).toBe("Le Hoang Hai");
    }
  );

  fptTest(
    {
      id: "UTCID12",
      type: "A",
      executedDate: "08/09/2026",
      description: "Nem ValidationException khi thieu thong tin bat buoc",
    },
    async () => {
      await expect(
        RosterService.addStudent(mockCourseId, {
          studentCode: "",
          fullName: "Le Hoang Hai",
          email: "hailhse183904@fpt.edu.vn",
          memberCode: "HaiLHSE183904",
        })
      ).rejects.toThrow("Throw ValidationException: Student code is required");

      await expect(
        RosterService.addStudent(mockCourseId, {
          studentCode: "SE183904",
          fullName: "",
          email: "hailhse183904@fpt.edu.vn",
          memberCode: "HaiLHSE183904",
        })
      ).rejects.toThrow("Throw ValidationException: Full name is required");

      await expect(
        RosterService.addStudent(mockCourseId, {
          studentCode: "SE183904",
          fullName: "Le Hoang Hai",
          email: "",
          memberCode: "HaiLHSE183904",
        })
      ).rejects.toThrow("Throw ValidationException: Email is required");

      await expect(
        RosterService.addStudent(mockCourseId, {
          studentCode: "SE183904",
          fullName: "Le Hoang Hai",
          email: "hailhse183904@fpt.edu.vn",
          memberCode: "",
        })
      ).rejects.toThrow("Throw ValidationException: Member code is required");
    }
  );

  fptTest(
    {
      id: "UTCID13",
      type: "A",
      executedDate: "08/09/2026",
      description: "Nem loi khi server backend tra ve ma loi sinh vien da ton tai",
    },
    async () => {
      vi.spyOn(apiClient, "post").mockRejectedValueOnce(new Error("STUDENT_ALREADY_ENROLLED"));

      await expect(
        RosterService.addStudent(mockCourseId, {
          studentCode: "SE183904",
          fullName: "Le Hoang Hai",
          email: "hailhse183904@fpt.edu.vn",
          memberCode: "HaiLHSE183904",
        })
      ).rejects.toThrow("STUDENT_ALREADY_ENROLLED");
    }
  );

  fptTest(
    {
      id: "UTCID14",
      type: "B",
      executedDate: "08/09/2026",
      description: "Chuan hoa ma sinh vien in hoa va email in thuong khi gui payload",
    },
    async () => {
      const postSpy = vi.spyOn(apiClient, "post").mockResolvedValueOnce({ data: {} });

      await RosterService.addStudent(mockCourseId, {
        studentCode: "  se183904  ",
        fullName: "  Le Hoang Hai  ",
        email: "  HaiLHSE183904@FPT.EDU.VN  ",
        memberCode: "  HaiLHSE183904  ",
      });

      expect(postSpy).toHaveBeenCalledWith(
        `/api/admin/courses/${mockCourseId}/roster/students`,
        {
          studentCode: "SE183904",
          fullName: "Le Hoang Hai",
          email: "hailhse183904@fpt.edu.vn",
          memberCode: "HaiLHSE183904",
        }
      );
    }
  );
});

