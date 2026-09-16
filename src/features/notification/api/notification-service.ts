import { apiClient } from "@/lib/axios";
import type {
  NotificationItem,
  NotificationPageResponse,
  UnreadNotificationCountResponse,
  NotificationReadAllResponse,
  RegisterPushInstallationRequest,
  PushInstallationResponse,
  ManualNotificationRequest,
  NotificationSendResponse,
  NotificationQueryParams,
} from "../types/notification";

export class NotificationService {
  static async getNotifications(params?: NotificationQueryParams): Promise<NotificationPageResponse> {
    const query = new URLSearchParams();
    if (typeof params?.page === "number") {
      query.set("page", params.page.toString());
    }
    if (typeof params?.size === "number") {
      query.set("size", params.size.toString());
    }
    if (typeof params?.unreadOnly === "boolean") {
      query.set("unreadOnly", params.unreadOnly ? "true" : "false");
    }

    const qs = query.toString();
    const endpoint = `/api/users/me/notifications${qs ? `?${qs}` : ""}`;
    const response = await apiClient.get<NotificationPageResponse>(endpoint);

    const data = response.data;
    return {
      items: Array.isArray(data?.items) ? data.items : [],
      page: typeof data?.page === "number" ? data.page : 0,
      size: typeof data?.size === "number" ? data.size : 20,
      total: typeof data?.total === "number" ? data.total : 0,
    };
  }

  static async getUnreadCount(): Promise<UnreadNotificationCountResponse> {
    const response = await apiClient.get<UnreadNotificationCountResponse>(
      "/api/users/me/notifications/unread-count"
    );
    return {
      unreadCount: typeof response.data?.unreadCount === "number" ? response.data.unreadCount : 0,
    };
  }

  static async markAsRead(notificationId: string): Promise<NotificationItem> {
    const id = notificationId?.trim();
    if (!id) {
      throw new Error("Mã thông báo không được để trống.");
    }
    const response = await apiClient.patch<NotificationItem>(
      `/api/users/me/notifications/${encodeURIComponent(id)}/read`
    );
    return response.data;
  }

  static async markAllAsRead(): Promise<NotificationReadAllResponse> {
    const response = await apiClient.patch<NotificationReadAllResponse>(
      "/api/users/me/notifications/read-all"
    );
    return {
      updatedCount: typeof response.data?.updatedCount === "number" ? response.data.updatedCount : 0,
      readAt: response.data?.readAt || new Date().toISOString(),
    };
  }

  static async registerPushInstallation(
    request: RegisterPushInstallationRequest
  ): Promise<PushInstallationResponse> {
    if (!request?.firebaseInstallationId?.trim()) {
      throw new Error("Firebase Installation ID không được để trống.");
    }
    if (!request?.fcmToken?.trim()) {
      throw new Error("FCM token không được để trống.");
    }
    const response = await apiClient.put<PushInstallationResponse>(
      "/api/users/me/push-installations",
      {
        firebaseInstallationId: request.firebaseInstallationId.trim(),
        fcmToken: request.fcmToken.trim(),
        platform: "WEB",
      }
    );
    return response.data;
  }

  static async revokePushInstallation(installationId: string): Promise<void> {
    const id = installationId?.trim();
    if (!id) {
      throw new Error("Mã thiết bị thông báo không được để trống.");
    }
    await apiClient.delete(`/api/users/me/push-installations/${encodeURIComponent(id)}`);
  }

  static async sendAdminSystem(
    request: ManualNotificationRequest,
    idempotencyKey?: string
  ): Promise<NotificationSendResponse> {
    this.validateManualRequest(request);
    const headers: Record<string, string> = {};
    if (idempotencyKey?.trim()) {
      headers["Idempotency-Key"] = idempotencyKey.trim();
    }
    const response = await apiClient.post<NotificationSendResponse>(
      "/api/admin/notifications/system",
      this.formatManualPayload(request),
      { headers }
    );
    return response.data;
  }

  static async sendLecturerAllCourses(
    request: ManualNotificationRequest,
    idempotencyKey?: string
  ): Promise<NotificationSendResponse> {
    this.validateManualRequest(request);
    const headers: Record<string, string> = {};
    if (idempotencyKey?.trim()) {
      headers["Idempotency-Key"] = idempotencyKey.trim();
    }
    const response = await apiClient.post<NotificationSendResponse>(
      "/api/lecturer/notifications/all-courses",
      this.formatManualPayload(request),
      { headers }
    );
    return response.data;
  }

  static async sendLecturerCourse(
    courseId: string,
    request: ManualNotificationRequest,
    idempotencyKey?: string
  ): Promise<NotificationSendResponse> {
    const id = courseId?.trim();
    if (!id) {
      throw new Error("Mã lớp học phần không được để trống.");
    }
    this.validateManualRequest(request);
    const headers: Record<string, string> = {};
    if (idempotencyKey?.trim()) {
      headers["Idempotency-Key"] = idempotencyKey.trim();
    }
    const response = await apiClient.post<NotificationSendResponse>(
      `/api/lecturer/courses/${encodeURIComponent(id)}/notifications`,
      this.formatManualPayload(request),
      { headers }
    );
    return response.data;
  }

  static async sendLecturerTeam(
    teamId: string,
    request: ManualNotificationRequest,
    idempotencyKey?: string
  ): Promise<NotificationSendResponse> {
    const id = teamId?.trim();
    if (!id) {
      throw new Error("Mã nhóm không được để trống.");
    }
    this.validateManualRequest(request);
    const headers: Record<string, string> = {};
    if (idempotencyKey?.trim()) {
      headers["Idempotency-Key"] = idempotencyKey.trim();
    }
    const response = await apiClient.post<NotificationSendResponse>(
      `/api/lecturer/teams/${encodeURIComponent(id)}/notifications`,
      this.formatManualPayload(request),
      { headers }
    );
    return response.data;
  }

  static async sendLecturerStudent(
    courseId: string,
    studentId: string,
    request: ManualNotificationRequest,
    idempotencyKey?: string
  ): Promise<NotificationSendResponse> {
    const cId = courseId?.trim();
    const sId = studentId?.trim();
    if (!cId) {
      throw new Error("Mã lớp học phần không được để trống.");
    }
    if (!sId) {
      throw new Error("Mã sinh viên không được để trống.");
    }
    this.validateManualRequest(request);
    const headers: Record<string, string> = {};
    if (idempotencyKey?.trim()) {
      headers["Idempotency-Key"] = idempotencyKey.trim();
    }
    const response = await apiClient.post<NotificationSendResponse>(
      `/api/lecturer/courses/${encodeURIComponent(cId)}/students/${encodeURIComponent(sId)}/notifications`,
      this.formatManualPayload(request),
      { headers }
    );
    return response.data;
  }

  private static validateManualRequest(request: ManualNotificationRequest): void {
    if (!request?.title?.trim()) {
      throw new Error("Tiêu đề thông báo không được để trống.");
    }
    if (!request?.message?.trim()) {
      throw new Error("Nội dung thông báo không được để trống.");
    }
  }

  private static formatManualPayload(request: ManualNotificationRequest): {
    title: string;
    message: string;
    actionUrl: string | null;
  } {
    return {
      title: request.title.trim(),
      message: request.message.trim(),
      actionUrl: request.actionUrl?.trim() || null,
    };
  }
}
