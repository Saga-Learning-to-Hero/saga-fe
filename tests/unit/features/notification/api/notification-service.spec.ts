import { describe, it, expect, vi, beforeEach } from "vitest";
import { NotificationService } from "@/features/notification/api/notification-service";
import { apiClient } from "@/lib/axios";

vi.mock("@/lib/axios", () => ({
  apiClient: {
    get: vi.fn(),
    patch: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe("NotificationService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getNotifications", () => {
    it("UTCID01 - [N] Normal: Lay danh sach thong bao thanh cong voi query params", async () => {
      const mockData = {
        items: [
          {
            id: "notif-1",
            notificationType: "SYSTEM",
            title: "Bảo trì",
            message: "Hệ thống bảo trì lúc 23:00",
            actionUrl: "/student/dashboard",
            readAt: null,
            createdAt: "2026-09-16T08:00:00Z",
          },
        ],
        page: 0,
        size: 10,
        total: 1,
      };
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockData });

      const res = await NotificationService.getNotifications({ page: 0, size: 10, unreadOnly: true });
      expect(res.items).toHaveLength(1);
      expect(res.total).toBe(1);
      expect(apiClient.get).toHaveBeenCalledWith("/api/users/me/notifications?page=0&size=10&unreadOnly=true");
    });

    it("UTCID02 - [B] Boundary: Server tra ve du lieu null/rong, fallback gia tri an toan", async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: null });

      const res = await NotificationService.getNotifications();
      expect(res.items).toEqual([]);
      expect(res.page).toBe(0);
      expect(res.size).toBe(20);
      expect(res.total).toBe(0);
      expect(apiClient.get).toHaveBeenCalledWith("/api/users/me/notifications");
    });

    it("UTCID03 - [A] Abnormal: Server Backend loi 500 thi nem loi", async () => {
      vi.mocked(apiClient.get).mockRejectedValueOnce(new Error("Server Internal Error"));

      await expect(NotificationService.getNotifications()).rejects.toThrow("Server Internal Error");
    });
  });

  describe("getUnreadCount", () => {
    it("UTCID04 - [N] Normal: Dem so luong thong bao chua doc thanh cong", async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: { unreadCount: 5 } });

      const res = await NotificationService.getUnreadCount();
      expect(res.unreadCount).toBe(5);
      expect(apiClient.get).toHaveBeenCalledWith("/api/users/me/notifications/unread-count");
    });

    it("UTCID05 - [B] Boundary: Server tra ve unreadCount khong phai so, fallback 0", async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: {} });

      const res = await NotificationService.getUnreadCount();
      expect(res.unreadCount).toBe(0);
    });
  });

  describe("markAsRead", () => {
    it("UTCID06 - [N] Normal: Danh dau mot thong bao da doc thanh cong", async () => {
      const mockUpdated = {
        id: "notif-1",
        notificationType: "TASK",
        title: "Task mới",
        message: "Bạn có task mới",
        actionUrl: "/student/sprint-progress",
        readAt: "2026-09-16T09:00:00Z",
        createdAt: "2026-09-16T08:00:00Z",
      };
      vi.mocked(apiClient.patch).mockResolvedValueOnce({ data: mockUpdated });

      const res = await NotificationService.markAsRead("notif-1");
      expect(res.readAt).toBe("2026-09-16T09:00:00Z");
      expect(apiClient.patch).toHaveBeenCalledWith("/api/users/me/notifications/notif-1/read");
    });

    it("UTCID07 - [A] Abnormal: Notification ID rong nem Error", async () => {
      await expect(NotificationService.markAsRead("")).rejects.toThrow("Mã thông báo không được để trống.");
      await expect(NotificationService.markAsRead("   ")).rejects.toThrow("Mã thông báo không được để trống.");
    });
  });

  describe("markAllAsRead", () => {
    it("UTCID08 - [N] Normal: Danh dau tat ca thong bao da doc thanh cong", async () => {
      vi.mocked(apiClient.patch).mockResolvedValueOnce({
        data: { updatedCount: 4, readAt: "2026-09-16T09:10:00Z" },
      });

      const res = await NotificationService.markAllAsRead();
      expect(res.updatedCount).toBe(4);
      expect(apiClient.patch).toHaveBeenCalledWith("/api/users/me/notifications/read-all");
    });
  });

  describe("registerPushInstallation", () => {
    it("UTCID09 - [N] Normal: Dang ky Push Installation thanh cong voi FID va FCM Token", async () => {
      const mockResponse = {
        id: "install-uuid-123",
        platform: "WEB",
        active: true,
        lastRegisteredAt: "2026-09-16T09:00:00Z",
      };
      vi.mocked(apiClient.put).mockResolvedValueOnce({ data: mockResponse });

      const res = await NotificationService.registerPushInstallation({
        firebaseInstallationId: "fid-xyz",
        fcmToken: "fcm-token-abc",
        platform: "WEB",
      });

      expect(res.id).toBe("install-uuid-123");
      expect(apiClient.put).toHaveBeenCalledWith("/api/users/me/push-installations", {
        firebaseInstallationId: "fid-xyz",
        fcmToken: "fcm-token-abc",
        platform: "WEB",
      });
    });

    it("UTCID10 - [A] Abnormal: Thieu FID hoac FCM Token nem loi", async () => {
      await expect(
        NotificationService.registerPushInstallation({
          firebaseInstallationId: "",
          fcmToken: "token",
          platform: "WEB",
        })
      ).rejects.toThrow("Firebase Installation ID không được để trống.");

      await expect(
        NotificationService.registerPushInstallation({
          firebaseInstallationId: "fid",
          fcmToken: "   ",
          platform: "WEB",
        })
      ).rejects.toThrow("FCM token không được để trống.");
    });
  });

  describe("revokePushInstallation", () => {
    it("UTCID11 - [N] Normal: Thu hoi thiet bi push thanh cong", async () => {
      vi.mocked(apiClient.delete).mockResolvedValueOnce({ status: 204 });

      await NotificationService.revokePushInstallation("install-123");
      expect(apiClient.delete).toHaveBeenCalledWith("/api/users/me/push-installations/install-123");
    });

    it("UTCID12 - [A] Abnormal: Installation ID bi rong nem loi", async () => {
      await expect(NotificationService.revokePushInstallation("")).rejects.toThrow(
        "Mã thiết bị thông báo không được để trống."
      );
    });
  });

  describe("sendAdminSystem", () => {
    it("UTCID13 - [N] Normal: Admin gui thong bao he thong kem Idempotency-Key thanh cong", async () => {
      const mockResponse = {
        sendId: "send-1",
        scope: "SYSTEM",
        recipientCount: 150,
        createdCount: 150,
      };
      vi.mocked(apiClient.post).mockResolvedValueOnce({ data: mockResponse });

      const res = await NotificationService.sendAdminSystem(
        {
          title: "Thông báo chung",
          message: "Lịch thi bảo vệ Capstone",
          actionUrl: "/student/courses",
        },
        "idempotency-key-123"
      );

      expect(res.recipientCount).toBe(150);
      expect(apiClient.post).toHaveBeenCalledWith(
        "/api/admin/notifications/system",
        {
          title: "Thông báo chung",
          message: "Lịch thi bảo vệ Capstone",
          actionUrl: "/student/courses",
        },
        { headers: { "Idempotency-Key": "idempotency-key-123" } }
      );
    });

    it("UTCID14 - [A] Abnormal: Thieu title hoac message thi nem loi validation", async () => {
      await expect(
        NotificationService.sendAdminSystem({ title: "", message: "NoiDung" })
      ).rejects.toThrow("Tiêu đề thông báo không được để trống.");

      await expect(
        NotificationService.sendAdminSystem({ title: "TieuDe", message: "  " })
      ).rejects.toThrow("Nội dung thông báo không được để trống.");
    });
  });

  describe("sendLecturer Scopes", () => {
    it("UTCID15 - [N] Normal: Giang vien gui thong bao all-courses thanh cong", async () => {
      vi.mocked(apiClient.post).mockResolvedValueOnce({
        data: { sendId: "send-all", scope: "ALL_COURSES", recipientCount: 60, createdCount: 60 },
      });

      const res = await NotificationService.sendLecturerAllCourses(
        { title: "Nộp bài", message: "Hạn nộp SRS tuần này" },
        "key-all"
      );
      expect(res.recipientCount).toBe(60);
      expect(apiClient.post).toHaveBeenCalledWith(
        "/api/lecturer/notifications/all-courses",
        { title: "Nộp bài", message: "Hạn nộp SRS tuần này", actionUrl: null },
        { headers: { "Idempotency-Key": "key-all" } }
      );
    });

    it("UTCID16 - [N] Normal: Giang vien gui thong bao theo course thanh cong", async () => {
      vi.mocked(apiClient.post).mockResolvedValueOnce({
        data: { sendId: "send-course", scope: "COURSE", recipientCount: 30, createdCount: 30 },
      });

      const res = await NotificationService.sendLecturerCourse(
        "course-1",
        { title: "Lớp SE1705", message: "Hôm nay học offline tại phòng 301" },
        "key-course"
      );
      expect(res.recipientCount).toBe(30);
      expect(apiClient.post).toHaveBeenCalledWith(
        "/api/lecturer/courses/course-1/notifications",
        { title: "Lớp SE1705", message: "Hôm nay học offline tại phòng 301", actionUrl: null },
        { headers: { "Idempotency-Key": "key-course" } }
      );
    });

    it("UTCID17 - [N] Normal: Giang vien gui thong bao theo team thanh cong", async () => {
      vi.mocked(apiClient.post).mockResolvedValueOnce({
        data: { sendId: "send-team", scope: "TEAM", recipientCount: 5, createdCount: 5 },
      });

      const res = await NotificationService.sendLecturerTeam(
        "team-1",
        { title: "Nhóm 1", message: "Cần cập nhật Jira backlog" },
        "key-team"
      );
      expect(res.recipientCount).toBe(5);
      expect(apiClient.post).toHaveBeenCalledWith(
        "/api/lecturer/teams/team-1/notifications",
        { title: "Nhóm 1", message: "Cần cập nhật Jira backlog", actionUrl: null },
        { headers: { "Idempotency-Key": "key-team" } }
      );
    });

    it("UTCID18 - [N] Normal: Giang vien gui thong bao theo student thanh cong", async () => {
      vi.mocked(apiClient.post).mockResolvedValueOnce({
        data: { sendId: "send-student", scope: "STUDENT", recipientCount: 1, createdCount: 1 },
      });

      const res = await NotificationService.sendLecturerStudent(
        "course-1",
        "student-1",
        { title: "Sinh viên HE170504", message: "Vui lòng liên hệ giảng viên" },
        "key-student"
      );
      expect(res.recipientCount).toBe(1);
      expect(apiClient.post).toHaveBeenCalledWith(
        "/api/lecturer/courses/course-1/students/student-1/notifications",
        { title: "Sinh viên HE170504", message: "Vui lòng liên hệ giảng viên", actionUrl: null },
        { headers: { "Idempotency-Key": "key-student" } }
      );
    });

    it("UTCID19 - [A] Abnormal: Thieu courseId hoac studentId/teamId nem loi", async () => {
      await expect(
        NotificationService.sendLecturerCourse("", { title: "T", message: "M" })
      ).rejects.toThrow("Mã lớp học phần không được để trống.");

      await expect(
        NotificationService.sendLecturerTeam("", { title: "T", message: "M" })
      ).rejects.toThrow("Mã nhóm không được để trống.");

      await expect(
        NotificationService.sendLecturerStudent("c1", "", { title: "T", message: "M" })
      ).rejects.toThrow("Mã sinh viên không được để trống.");
    });
  });
});
