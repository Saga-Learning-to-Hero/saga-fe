export type NotificationType =
  | "SYSTEM"
  | "COURSE"
  | "TEAM"
  | "TASK"
  | "ASSESSMENT"
  | "WARNING"
  | "INTEGRATION";

export interface NotificationItem {
  id: string;
  notificationType: string;
  title: string;
  message: string;
  actionUrl: string | null;
  readAt: string | null;
  createdAt: string;
}

export interface NotificationPageResponse {
  items: NotificationItem[];
  page: number;
  size: number;
  total: number;
}

export interface UnreadNotificationCountResponse {
  unreadCount: number;
}

export interface NotificationReadAllResponse {
  updatedCount: number;
  readAt: string;
}

export interface RegisterPushInstallationRequest {
  firebaseInstallationId: string;
  fcmToken: string;
  platform: "WEB";
}

export interface PushInstallationResponse {
  id: string;
  platform: string;
  active: boolean;
  lastRegisteredAt: string;
}

export interface ManualNotificationRequest {
  title: string;
  message: string;
  actionUrl?: string | null;
}

export interface NotificationSendResponse {
  sendId: string;
  scope: string;
  recipientCount: number;
  createdCount: number;
}

export interface NotificationQueryParams {
  page?: number;
  size?: number;
  unreadOnly?: boolean;
}
