import { LecturerNotificationComposer } from "@/features/lecturer/notifications/components/lecturer-notification-composer";

export const metadata = {
  title: "Gửi thông báo lớp học | SAGA Giảng viên",
  description: "Gửi thông báo tới lớp học phần, nhóm dự án hoặc sinh viên phụ trách",
};

export default function LecturerNotificationsPage() {
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="space-y-1">
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
          Gửi thông báo lớp học
        </h1>
        <p className="text-sm text-muted-foreground">
          Soạn và gửi thông báo trực tiếp tới các lớp học phần, nhóm dự án hoặc sinh viên bạn đang phụ trách.
        </p>
      </div>

      <LecturerNotificationComposer />
    </div>
  );
}
