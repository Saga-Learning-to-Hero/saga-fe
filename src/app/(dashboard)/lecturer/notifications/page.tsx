import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LecturerNotificationComposer } from "@/features/lecturer/notifications/components/lecturer-notification-composer";

export const metadata = {
  title: "Gửi thông báo lớp học | SAGA Giảng viên",
  description: "Gửi thông báo tới lớp học phần, nhóm dự án hoặc sinh viên phụ trách",
};

export default function LecturerNotificationsPage() {
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Link
            href="/lecturer/courses"
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground gap-1.5 rounded-xl cursor-pointer"
            )}
          >
            <ArrowLeftIcon className="size-4" />
            <span>Quay lại danh sách lớp</span>
          </Link>
          <span className="text-muted-foreground/40">•</span>
          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            Giảng viên phụ trách
          </span>
        </div>

        <div className="space-y-1">
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
            Gửi thông báo lớp học
          </h1>
          <p className="text-sm text-muted-foreground">
            Soạn và gửi thông báo trực tiếp tới các lớp học phần, nhóm dự án hoặc sinh viên bạn đang phụ trách.
          </p>
        </div>
      </div>

      <LecturerNotificationComposer />
    </div>
  );
}
