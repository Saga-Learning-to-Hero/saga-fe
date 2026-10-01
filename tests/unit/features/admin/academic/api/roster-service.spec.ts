import { describe, expect, vi, beforeEach } from "vitest";
import { RosterService } from "@/features/admin/academic/api/roster-service";
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
      id: "UTCID21",
      type: "N",
      executedDate: "30/09/2026",
      description: "Map roster mang tran giu avatarUrl va avatar",
    },
    async () => {
      vi.spyOn(apiClient, "get").mockResolvedValueOnce({
        data: [
          {
            ...mockRosterItem,
            avatarUrl: "https://cdn.example.com/hai.png",
            avatar: "https://cdn.example.com/legacy.png",
          },
        ],
      });

      const res = await RosterService.getRoster(mockCourseId);
      expect(res.entries[0].avatarUrl).toBe("https://cdn.example.com/hai.png");
      expect(res.entries[0].avatar).toBe("https://cdn.example.com/legacy.png");
    }
  );

  fptTest(
    {
      id: "UTCID22",
      type: "A",
      executedDate: "30/09/2026",
      description: "Invitation hoac thieu avatarUrl map thanh null",
    },
    async () => {
      vi.spyOn(apiClient, "get").mockResolvedValueOnce({
        data: [{ ...mockRosterItem, status: "INVITED", avatarUrl: null }],
      });

      const res = await RosterService.getRoster(mockCourseId);
      expect(res.entries[0].avatarUrl).toBeNull();
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

  fptTest(
    {
      id: "UTCID15",
      type: "N",
      executedDate: "12/09/2026",
      description: "Rut ten sinh vien da co tai khoan khoi lop thanh cong",
    },
    async () => {
      const mockResult = {
        kind: "ENROLLMENT",
        id: "enr-1",
        enrollmentId: "enr-1",
        studentCode: "SE170504",
        fullName: "Le Hoang Hai",
        email: "hailhse170504@fpt.edu.vn",
        enrollmentStatus: "WITHDRAWN",
      };

      const deleteSpy = vi.spyOn(apiClient, "delete").mockResolvedValueOnce({ data: mockResult });

      const res = await RosterService.removeEnrollment(mockCourseId, "enr-1", "Rút do bảo lưu");

      expect(deleteSpy).toHaveBeenCalledWith(
        `/api/admin/courses/${mockCourseId}/roster/enrollments/enr-1`,
        { data: { reason: "Rút do bảo lưu" } }
      );
      expect(res.enrollmentStatus).toBe("WITHDRAWN");
      expect(res.enrollmentId).toBe("enr-1");
    }
  );

  fptTest(
    {
      id: "UTCID16",
      type: "A",
      executedDate: "12/09/2026",
      description: "Nem ValidationException khi courseId hoac enrollmentId bi rong khi rut ten",
    },
    async () => {
      await expect(RosterService.removeEnrollment("", "enr-1", "Rút do bảo lưu")).rejects.toThrow(
        "Throw ValidationException: Course ID is required"
      );

      await expect(RosterService.removeEnrollment("   ", "enr-1", "Rút do bảo lưu")).rejects.toThrow(
        "Throw ValidationException: Course ID is required"
      );

      await expect(RosterService.removeEnrollment(mockCourseId, "", "Rút do bảo lưu")).rejects.toThrow(
        "Throw ValidationException: Enrollment ID is required"
      );

      await expect(RosterService.removeEnrollment(mockCourseId, "   ", "Rút do bảo lưu")).rejects.toThrow(
        "Throw ValidationException: Enrollment ID is required"
      );
    }
  );

  fptTest(
    {
      id: "UTCID17",
      type: "A",
      executedDate: "12/09/2026",
      description: "Nem loi khi Backend tra ve ma loi TEAM_LEADER_REMOVAL_REQUIRES_REASSIGNMENT",
    },
    async () => {
      vi.spyOn(apiClient, "delete").mockRejectedValueOnce(
        new Error("TEAM_LEADER_REMOVAL_REQUIRES_REASSIGNMENT")
      );

      await expect(
        RosterService.removeEnrollment(mockCourseId, "enr-leader", "Rút trưởng nhóm")
      ).rejects.toThrow("TEAM_LEADER_REMOVAL_REQUIRES_REASSIGNMENT");
    }
  );

  fptTest(
    {
      id: "UTCID18",
      type: "N",
      executedDate: "12/09/2026",
      description: "Huy thu moi sinh vien chua dang ky tham gia lop thanh cong",
    },
    async () => {
      const mockResult = {
        kind: "INVITATION",
        id: "inv-1",
        invitationId: "inv-1",
        studentCode: "SE180001",
        fullName: "Nguyen Van A",
        email: "anvse180001@fpt.edu.vn",
        invitationStatus: "CANCELLED",
      };

      vi.spyOn(apiClient, "delete").mockResolvedValueOnce({ data: mockResult });

      const res = await RosterService.cancelInvitation(mockCourseId, "inv-1");

      expect(res.invitationStatus).toBe("CANCELLED");
      expect(res.invitationId).toBe("inv-1");
    }
  );

  fptTest(
    {
      id: "UTCID19",
      type: "A",
      executedDate: "12/09/2026",
      description: "Nem ValidationException khi courseId hoac invitationId bi rong khi huy thu moi",
    },
    async () => {
      await expect(RosterService.cancelInvitation("", "inv-1")).rejects.toThrow(
        "Throw ValidationException: Course ID is required"
      );

      await expect(RosterService.cancelInvitation("   ", "inv-1")).rejects.toThrow(
        "Throw ValidationException: Course ID is required"
      );

      await expect(RosterService.cancelInvitation(mockCourseId, "")).rejects.toThrow(
        "Throw ValidationException: Invitation ID is required"
      );

      await expect(RosterService.cancelInvitation(mockCourseId, "   ")).rejects.toThrow(
        "Throw ValidationException: Invitation ID is required"
      );
    }
  );

  fptTest(
    {
      id: "UTCID20",
      type: "B",
      executedDate: "12/09/2026",
      description: "Trim khoang trang o courseId, enrollmentId va invitationId truoc khi goi API",
    },
    async () => {
      const deleteSpy = vi.spyOn(apiClient, "delete").mockResolvedValue({ data: {} });

      await RosterService.removeEnrollment(`  ${mockCourseId}  `, "  enr-99  ", "  Rút do bảo lưu  ");
      expect(deleteSpy).toHaveBeenCalledWith(
        `/api/admin/courses/${mockCourseId}/roster/enrollments/enr-99`,
        { data: { reason: "Rút do bảo lưu" } }
      );

      await RosterService.cancelInvitation(`  ${mockCourseId}  `, "  inv-99  ");
      expect(deleteSpy).toHaveBeenCalledWith(
        `/api/admin/courses/${mockCourseId}/roster/invitations/inv-99`
      );
    }
  );

  fptTest(
    {
      id: "UTCID21",
      type: "A",
      executedDate: "01/10/2026",
      description: "Nem ValidationException khi ly do rut ten rong",
    },
    async () => {
      await expect(RosterService.removeEnrollment(mockCourseId, "enr-1", "")).rejects.toThrow(
        "Throw ValidationException: Reason is required"
      );
    }
  );

  fptTest(
    {
      id: "UTCID22",
      type: "A",
      executedDate: "01/10/2026",
      description: "Nem ValidationException khi ly do chi gom khoang trang",
    },
    async () => {
      await expect(RosterService.removeEnrollment(mockCourseId, "enr-1", "   ")).rejects.toThrow(
        "Throw ValidationException: Reason is required"
      );
    }
  );

  fptTest(
    {
      id: "UTCID23",
      type: "B",
      executedDate: "01/10/2026",
      description: "Nem ValidationException khi ly do dai hon 500 ky tu",
    },
    async () => {
      const tooLong = "x".repeat(501);
      await expect(RosterService.removeEnrollment(mockCourseId, "enr-1", tooLong)).rejects.toThrow(
        "Throw ValidationException: Reason must be at most 500 characters"
      );
    }
  );

  fptTest(
    {
      id: "UTCID24",
      type: "B",
      executedDate: "01/10/2026",
      description: "Chap nhan ly do dung 500 ky tu sau khi trim",
    },
    async () => {
      const exactReason = "x".repeat(500);
      const deleteSpy = vi.spyOn(apiClient, "delete").mockResolvedValueOnce({ data: {} });

      await RosterService.removeEnrollment(mockCourseId, "enr-1", `  ${exactReason}  `);

      expect(deleteSpy).toHaveBeenCalledWith(
        `/api/admin/courses/${mockCourseId}/roster/enrollments/enr-1`,
        { data: { reason: exactReason } }
      );
    }
  );

  fptTest(
    {
      id: "UTCID25",
      type: "A",
      executedDate: "01/10/2026",
      description: "Khong nuot loi khi Backend tra ve REQUEST_INVALID",
    },
    async () => {
      vi.spyOn(apiClient, "delete").mockRejectedValueOnce(new Error("REQUEST_INVALID"));

      await expect(
        RosterService.removeEnrollment(mockCourseId, "enr-1", "Ly do khong hop le")
      ).rejects.toThrow("REQUEST_INVALID");
    }
  );

  fptTest(
    {
      id: "UTCID26",
      type: "A",
      executedDate: "01/10/2026",
      description: "Khong nuot loi khi Backend tra ve TEAM_LEADER_INVALID",
    },
    async () => {
      vi.spyOn(apiClient, "delete").mockRejectedValueOnce(new Error("TEAM_LEADER_INVALID"));

      await expect(
        RosterService.removeEnrollment(mockCourseId, "enr-leader", "Rut truong nhom")
      ).rejects.toThrow("TEAM_LEADER_INVALID");
    }
  );

  fptTest(
    {
      id: "UTCID27",
      type: "N",
      executedDate: "01/10/2026",
      description: "Object roster ACTIVE van tinh enrolledCount va status ENROLLED",
    },
    async () => {
      vi.spyOn(apiClient, "get").mockResolvedValueOnce({
        data: {
          courseId: mockCourseId,
          classCode: "SE1705",
          semesterCode: "FA26",
          subjectCode: "SWP391",
          enrolledCount: 99,
          pendingInvitationCount: 0,
          entries: [
            {
              kind: "ENROLLMENT",
              enrollmentId: "enr-active",
              studentCode: "SE170504",
              fullName: "Le Hoang Hai",
              email: "hailhse170504@fpt.edu.vn",
              enrollmentStatus: "ACTIVE",
            },
          ],
        },
      });

      const res = await RosterService.getRoster(mockCourseId);

      expect(res.entries[0].enrollmentStatus).toBe("ACTIVE");
      expect(res.entries[0].status).toBe("ENROLLED");
      expect(res.enrolledCount).toBe(1);
    }
  );

  fptTest(
    {
      id: "UTCID28",
      type: "A",
      executedDate: "01/10/2026",
      description: "Object roster WITHDRAWN map DROPPED va khong cong enrolledCount",
    },
    async () => {
      vi.spyOn(apiClient, "get").mockResolvedValueOnce({
        data: {
          courseId: mockCourseId,
          entries: [
            {
              kind: "ENROLLMENT",
              enrollmentId: "enr-out",
              studentCode: "SE170504",
              fullName: "Le Hoang Hai",
              email: "hailhse170504@fpt.edu.vn",
              enrollmentStatus: "WITHDRAWN",
            },
            {
              kind: "ENROLLMENT",
              enrollmentId: "enr-in",
              studentCode: "SE180001",
              fullName: "Nguyen Van A",
              email: "anvse180001@fpt.edu.vn",
              enrollmentStatus: "ACTIVE",
            },
          ],
        },
      });

      const res = await RosterService.getRoster(mockCourseId);

      expect(res.entries[0].status).toBe("DROPPED");
      expect(res.entries[0].enrollmentStatus).toBe("WITHDRAWN");
      expect(res.entries[1].status).toBe("ENROLLED");
      expect(res.enrolledCount).toBe(1);
    }
  );

  fptTest(
    {
      id: "UTCID29",
      type: "B",
      executedDate: "01/10/2026",
      description: "Trim khoang trang enrollmentStatus ACTIVE truoc khi phan loai",
    },
    async () => {
      vi.spyOn(apiClient, "get").mockResolvedValueOnce({
        data: {
          courseId: mockCourseId,
          entries: [
            {
              kind: "ENROLLMENT",
              enrollmentId: "enr-space",
              studentCode: "SE170504",
              fullName: "Le Hoang Hai",
              email: "hailhse170504@fpt.edu.vn",
              enrollmentStatus: "  ACTIVE  ",
            },
          ],
        },
      });

      const res = await RosterService.getRoster(mockCourseId);

      expect(res.entries[0].enrollmentStatus).toBe("ACTIVE");
      expect(res.entries[0].status).toBe("ENROLLED");
      expect(res.enrolledCount).toBe(1);
    }
  );
});


