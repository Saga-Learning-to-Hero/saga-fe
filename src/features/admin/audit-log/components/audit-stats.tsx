"use client";

import { ShieldAlertIcon, ScrollTextIcon, LockIcon, DatabaseIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { AuditLogItem } from "../types/audit-log";

interface AuditStatsProps {
  logs: AuditLogItem[];
}

export function AuditStats({ logs }: AuditStatsProps) {
  const totalLogs = logs.length;
  const securityLogs = logs.filter((l) => l.category === "AUTH_SECURITY").length;
  const academicLogs = logs.filter((l) => l.category === "ACADEMIC").length;
  const alertLogs = logs.filter((l) => l.severity === "WARNING" || l.severity === "CRITICAL").length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
      <Card className="rounded-2xl border border-border shadow-xs bg-card">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="space-y-0.5">
            <p className="text-xs font-medium text-muted-foreground">Tổng số sự kiện</p>
            <p className="text-2xl font-bold text-foreground tracking-tight">{totalLogs}</p>
            <p className="text-[11px] text-muted-foreground">Nhật ký đã ghi nhận</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <ScrollTextIcon className="w-5 h-5" />
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border border-border shadow-xs bg-card">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="space-y-0.5">
            <p className="text-xs font-medium text-muted-foreground">Bảo mật & Tài khoản</p>
            <p className="text-2xl font-bold text-foreground tracking-tight">{securityLogs}</p>
            <p className="text-[11px] text-muted-foreground">Đăng nhập, Khóa / Mở khóa</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-info-muted flex items-center justify-center text-info shrink-0">
            <LockIcon className="w-5 h-5" />
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border border-border shadow-xs bg-card">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="space-y-0.5">
            <p className="text-xs font-medium text-muted-foreground">Dữ liệu học thuật</p>
            <p className="text-2xl font-bold text-foreground tracking-tight">{academicLogs}</p>
            <p className="text-[11px] text-muted-foreground">Khóa học, Lớp, Import Excel</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-success-muted flex items-center justify-center text-success shrink-0">
            <DatabaseIcon className="w-5 h-5" />
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border border-border shadow-xs bg-card">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="space-y-0.5">
            <p className="text-xs font-medium text-muted-foreground">Cảnh báo & Nghiêm trọng</p>
            <p className="text-2xl font-bold text-danger tracking-tight">{alertLogs}</p>
            <p className="text-[11px] text-muted-foreground">Cần quản trị viên lưu ý</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-danger-muted flex items-center justify-center text-danger shrink-0">
            <ShieldAlertIcon className="w-5 h-5" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
