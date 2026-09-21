import { BellRingIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AdminNotificationComposer } from "@/features/admin/notifications/components/admin-notification-composer";

export const metadata = {
  title: "Thông báo hệ thống | SAGA Admin",
  description: "Soạn và phát thông báo hệ thống tới giảng viên và sinh viên",
};

export default function AdminNotificationsPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in-0 duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0 shadow-2xs border border-primary/20">
            <BellRingIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-bold text-foreground tracking-tight">
                Trung Tâm Phát Thông Báo Hệ Thống
              </h1>
              <Badge
                variant="outline"
                className="border-primary/25 bg-primary/10 font-mono text-[11px] font-bold text-primary"
              >
                SYSTEM BROADCAST
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Gửi thông báo broadcast tức thời tới toàn bộ người dùng đang hoạt động trong hệ thống SAGA.
            </p>
          </div>
        </div>
      </div>

      <AdminNotificationComposer />
    </div>
  );
}
