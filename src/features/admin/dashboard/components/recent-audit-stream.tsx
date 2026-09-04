"use client";

import Link from "next/link";
import { ScrollTextIcon, ArrowRightIcon, UserCogIcon, BookOpenIcon, DatabaseIcon, ShieldCheckIcon } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MOCK_AUDIT_LOGS } from "@/features/admin/audit-log/data/mock-audit-logs";

export function RecentAuditAndQuickActionsSection() {
  const recentLogs = MOCK_AUDIT_LOGS.slice(0, 5);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card className="rounded-2xl border border-border shadow-xs bg-card lg:col-span-2">
        <CardHeader className="p-4 pb-3 border-b border-border/60 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <ScrollTextIcon className="w-4 h-4" />
            </div>
            <div>
              <CardTitle className="text-sm font-bold text-foreground">
                Nhật ký hệ thống gần đây (Audit Stream)
              </CardTitle>
              <CardDescription className="text-[11px] text-muted-foreground">
                Lịch sử thao tác quản trị, sự kiện an ninh và phân quyền ghi nhận từ MongoDB
              </CardDescription>
            </div>
          </div>

          <Link
            href="/admin/audit-log"
            className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1 cursor-pointer"
          >
            Xem tất cả
            <ArrowRightIcon className="w-3.5 h-3.5" />
          </Link>
        </CardHeader>

        <CardContent className="p-4 space-y-3">
          {recentLogs.map((log) => (
            <div
              key={log.id}
              className="flex items-start justify-between gap-3 pb-3 border-b border-border/40 last:border-0 last:pb-0"
            >
              <div className="space-y-0.5 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-foreground text-xs truncate">
                    {log.actor.fullName}
                  </span>
                  <Badge variant="outline" className="text-[10px] py-0 px-1.5 border-border">
                    {log.actor.role}
                  </Badge>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    {log.actor.ipAddress}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-1">
                  {log.description}
                </p>
              </div>

              <div className="shrink-0 text-right space-y-1">
                {log.severity === "CRITICAL" && (
                  <Badge className="bg-danger-muted text-danger border-0 text-[10px] font-semibold">
                    Nghiêm trọng
                  </Badge>
                )}
                {log.severity === "WARNING" && (
                  <Badge className="bg-warning-muted text-warning border-0 text-[10px] font-semibold">
                    Cảnh báo
                  </Badge>
                )}
                {log.severity === "INFO" && (
                  <Badge className="bg-primary/10 text-primary border-0 text-[10px] font-semibold">
                    Thông tin
                  </Badge>
                )}
                <p className="text-[10px] text-muted-foreground font-mono">
                  {new Date(log.timestamp).toLocaleTimeString("vi-VN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="rounded-2xl border border-border shadow-xs bg-card flex flex-col justify-between">
        <CardHeader className="p-4 pb-3 border-b border-border/60">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <ShieldCheckIcon className="w-4 h-4" />
            </div>
            <div>
              <CardTitle className="text-sm font-bold text-foreground">
                Lối tắt điều hành (Quick Actions)
              </CardTitle>
              <CardDescription className="text-[11px] text-muted-foreground">
                Truy cập nhanh các phân hệ quản trị
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 space-y-2.5 flex-1 flex flex-col justify-around">
          <Link
            href="/admin/users"
            className="flex items-center justify-between p-3 rounded-xl bg-muted/40 hover:bg-muted/70 transition-colors border border-border/60 group cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <UserCogIcon className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-foreground">Tài khoản & Phân quyền</p>
                <p className="text-[11px] text-muted-foreground">User Accounts & IAM Policy</p>
              </div>
            </div>
            <ArrowRightIcon className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-transform group-hover:translate-x-0.5" />
          </Link>

          <Link
            href="/admin/academic"
            className="flex items-center justify-between p-3 rounded-xl bg-muted/40 hover:bg-muted/70 transition-colors border border-border/60 group cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-success-muted text-success flex items-center justify-center">
                <DatabaseIcon className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-foreground">Cấu trúc học thuật & Lớp</p>
                <p className="text-[11px] text-muted-foreground">Học phần, Lớp hành chính, Học kỳ</p>
              </div>
            </div>
            <ArrowRightIcon className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-transform group-hover:translate-x-0.5" />
          </Link>

          <Link
            href="/admin/subjects"
            className="flex items-center justify-between p-3 rounded-xl bg-muted/40 hover:bg-muted/70 transition-colors border border-border/60 group cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-info-muted text-info flex items-center justify-center">
                <BookOpenIcon className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-foreground">Chương trình đào tạo (FLM)</p>
                <p className="text-[11px] text-muted-foreground">Syllabus, Tín chỉ, Cơ cấu điểm</p>
              </div>
            </div>
            <ArrowRightIcon className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-transform group-hover:translate-x-0.5" />
          </Link>

          <Link
            href="/admin/audit-log"
            className="flex items-center justify-between p-3 rounded-xl bg-muted/40 hover:bg-muted/70 transition-colors border border-border/60 group cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-warning-muted text-warning flex items-center justify-center">
                <ScrollTextIcon className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-foreground">Nhật ký hệ thống (Audit Log)</p>
                <p className="text-[11px] text-muted-foreground">Audit Trail & Security Logs</p>
              </div>
            </div>
            <ArrowRightIcon className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-transform group-hover:translate-x-0.5" />
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
