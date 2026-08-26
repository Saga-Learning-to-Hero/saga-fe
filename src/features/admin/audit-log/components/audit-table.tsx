"use client";

import { EyeIcon, ShieldAlertIcon, InfoIcon, AlertTriangleIcon, CheckCircle2Icon, XCircleIcon } from "lucide-react";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { AuditLogItem, AuditActionType, AuditSeverity } from "../types/audit-log";

interface AuditTableProps {
  logs: AuditLogItem[];
  onSelectLog: (log: AuditLogItem) => void;
}

export function AuditTable({ logs, onSelectLog }: AuditTableProps) {
  const getActionBadge = (action: AuditActionType) => {
    switch (action) {
      case "USER_BAN":
        return <Badge className="bg-danger-muted text-danger border-0 font-semibold">Khóa tài khoản</Badge>;
      case "USER_UNBAN":
        return <Badge className="bg-warning-muted text-warning border-0 font-semibold">Mở khóa tài khoản</Badge>;
      case "USER_LOGIN":
        return <Badge variant="outline" className="text-muted-foreground border-border">Đăng nhập</Badge>;
      case "USER_LOGOUT":
        return <Badge variant="outline" className="text-muted-foreground border-border">Đăng xuất</Badge>;
      case "ROLE_CHANGE":
        return <Badge className="bg-primary/10 text-primary border-0 font-semibold">Đổi vai trò</Badge>;
      case "COURSE_CREATE":
        return <Badge className="bg-success-muted text-success border-0 font-semibold">Mở khóa học</Badge>;
      case "COURSE_UPDATE":
        return <Badge className="bg-info-muted text-info border-0 font-semibold">Sửa khóa học</Badge>;
      case "COURSE_DELETE":
        return <Badge className="bg-danger-muted text-danger border-0 font-semibold">Xóa khóa học</Badge>;
      case "STUDENTS_IMPORT":
        return <Badge className="bg-primary/10 text-primary border-0 font-semibold">Import sinh viên</Badge>;
      case "CLASS_CREATE":
        return <Badge className="bg-success-muted text-success border-0 font-semibold">Tạo lớp HC</Badge>;
      case "CLASS_UPDATE":
        return <Badge className="bg-info-muted text-info border-0 font-semibold">Sửa lớp HC</Badge>;
      case "CLASS_DELETE":
        return <Badge className="bg-danger-muted text-danger border-0 font-semibold">Xóa lớp HC</Badge>;
      default:
        return <Badge variant="secondary">{action}</Badge>;
    }
  };

  const getSeverityBadge = (sev: AuditSeverity) => {
    switch (sev) {
      case "CRITICAL":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-danger">
            <ShieldAlertIcon className="w-3.5 h-3.5" />
            Nghiêm trọng
          </span>
        );
      case "WARNING":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-warning">
            <AlertTriangleIcon className="w-3.5 h-3.5" />
            Cảnh báo
          </span>
        );
      case "INFO":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
            <InfoIcon className="w-3.5 h-3.5 text-primary" />
            Thông tin
          </span>
        );
    }
  };

  const formatRelativeTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Card className="rounded-2xl border border-border overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <Table className="w-full text-left text-xs border-collapse">
          <TableHeader className="bg-muted/40 border-b border-border">
            <TableRow>
              <TableHead className="py-3 px-4 text-xs font-semibold whitespace-nowrap w-[150px]">Thời gian</TableHead>
              <TableHead className="py-3 px-4 text-xs font-semibold min-w-[220px]">Người thực hiện (Actor)</TableHead>
              <TableHead className="py-3 px-4 text-xs font-semibold whitespace-nowrap w-[140px]">Hành động</TableHead>
              <TableHead className="py-3 px-4 text-xs font-semibold min-w-[220px]">Đối tượng tác động</TableHead>
              <TableHead className="py-3 px-4 text-xs font-semibold whitespace-nowrap w-[130px]">Mức độ</TableHead>
              <TableHead className="py-3 px-4 text-xs font-semibold whitespace-nowrap w-[90px]">Trạng thái</TableHead>
              <TableHead className="py-3 px-4 text-xs font-semibold whitespace-nowrap text-right w-[80px]">Chi tiết</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-border/60">
            {logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                  Không tìm thấy sự kiện kiểm toán nào phù hợp với bộ lọc.
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log) => (
                <TableRow key={log.id} className="hover:bg-muted/30 transition-colors">
                  {/* Timestamp */}
                  <TableCell className="py-3 px-4 whitespace-nowrap font-mono text-[11px] text-muted-foreground">
                    {formatRelativeTime(log.timestamp)}
                  </TableCell>

                  {/* Actor */}
                  <TableCell className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <Avatar className="w-7 h-7 rounded-lg border border-border shrink-0">
                        {log.actor.avatar && <AvatarImage src={log.actor.avatar} alt={log.actor.fullName} />}
                        <AvatarFallback className="text-[10px] font-bold bg-primary/10 text-primary">
                          {log.actor.fullName.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col min-w-0">
                        <span className="font-semibold text-foreground text-xs truncate">
                          {log.actor.fullName}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-mono truncate">
                          {log.actor.ipAddress} · {log.actor.role}
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  {/* Action Badge */}
                  <TableCell className="py-3 px-4 whitespace-nowrap">
                    {getActionBadge(log.action)}
                  </TableCell>

                  {/* Target Resource */}
                  <TableCell className="py-3 px-4">
                    <div className="flex flex-col min-w-0">
                      <span className="font-medium text-foreground text-xs truncate">
                        {log.target.name}
                      </span>
                      <span className="text-[10px] text-muted-foreground truncate">
                        {log.description}
                      </span>
                    </div>
                  </TableCell>

                  {/* Severity */}
                  <TableCell className="py-3 px-4 whitespace-nowrap">
                    {getSeverityBadge(log.severity)}
                  </TableCell>

                  {/* Status Success / Failed */}
                  <TableCell className="py-3 px-4 whitespace-nowrap">
                    {log.status === "SUCCESS" ? (
                      <span className="inline-flex items-center gap-1 text-[11px] text-success font-medium">
                        <CheckCircle2Icon className="w-3.5 h-3.5" />
                        Thành công
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] text-danger font-medium">
                        <XCircleIcon className="w-3.5 h-3.5" />
                        Thất bại
                      </span>
                    )}
                  </TableCell>

                  {/* View Details Button */}
                  <TableCell className="py-3 px-4 text-right whitespace-nowrap">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onSelectLog(log)}
                      className="h-7 w-7 p-0 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
                      title="Xem chi tiết sự kiện"
                    >
                      <EyeIcon className="w-3.5 h-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
