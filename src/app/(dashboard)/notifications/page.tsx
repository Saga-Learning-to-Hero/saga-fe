import { NotificationCenterView } from "@/features/notification/components/notification-center-view";

export const metadata = {
  title: "Trung tâm thông báo | SAGA",
  description: "Xem và quản lý toàn bộ thông báo hệ thống, lớp học và nhóm đồ án của bạn",
};

export default function NotificationsPage() {
  return <NotificationCenterView />;
}
