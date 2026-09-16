import { AdminNotificationComposer } from "@/features/admin/notifications/components/admin-notification-composer";

export const metadata = {
  title: "Thông báo hệ thống | SAGA Admin",
  description: "Soạn và phát thông báo hệ thống tới giảng viên và sinh viên",
};

export default function AdminNotificationsPage() {
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="space-y-1">
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
          Trung tâm phát thông báo hệ thống
        </h1>
        <p className="text-sm text-muted-foreground">
          Gửi thông báo broadcast tức thời tới toàn bộ người dùng đang hoạt động trong hệ thống SAGA.
        </p>
      </div>

      <AdminNotificationComposer />
    </div>
  );
}
