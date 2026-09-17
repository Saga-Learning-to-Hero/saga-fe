"use client";

import {
  EyeIcon,
  ShieldAlertIcon,
  InfoIcon,
  AlertTriangleIcon,
  CheckCircle2Icon,
  XCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type {
  AuditLogItem,
  AuditActionType,
  AuditSeverity,
} from "../types/audit-log";
import { useAuditNameResolver } from "../hooks/use-audit-name-resolver";

interface AuditTableProps {
  logs: AuditLogItem[];
  onSelectLog: (log: AuditLogItem) => void;
  page?: number;
  pageSize?: number;
  totalItems?: number;
  onPageChange?: (newPage: number) => void;
  isLoading?: boolean;
}

const DEFAULT_PAGE_SIZE = 10;

function toSafeString(val: unknown): string {
  if (val === null || val === undefined) return "";
  if (typeof val === "object") {
    try {
      return JSON.stringify(val);
    } catch {
      return String(val);
    }
  }
  return String(val);
}

export function AuditTable({
  logs,
  onSelectLog,
  page = 1,
  pageSize = DEFAULT_PAGE_SIZE,
  totalItems,
  onPageChange,
  isLoading = false,
}: AuditTableProps) {
  const {
    resolveTargetName,
    resolveTargetSubtext,
    resolveActorName,
    resolveUserInfo,
    resolveCourseName,
    resolveClassName,
  } = useAuditNameResolver();

  const isServer = Boolean(onPageChange && totalItems !== undefined);
  const effectiveTotal = isServer ? (totalItems ?? logs.length) : logs.length;
  const totalPages = Math.max(1, Math.ceil(effectiveTotal / pageSize));

  const getActionBadge = (action: AuditActionType) => {
    const act = (action || "").toUpperCase();
    if (act.includes("BAN") || act.includes("LOCK") || act.includes("INACTIVE")) {
      return (
        <Badge className="bg-danger-muted text-danger border-0 font-semibold">
          {action === "USER_BAN" ? "Khóa tài khoản" : action}
        </Badge>
      );
    }
    if (act.includes("UNBAN") || act.includes("ACTIVE")) {
      return (
        <Badge className="bg-success-muted text-success border-0 font-semibold">
          {action === "USER_UNBAN" ? "Mở tài khoản" : action}
        </Badge>
      );
    }
    if (act.includes("LOGIN")) {
      return (
        <Badge variant="outline" className="text-muted-foreground border-border">
          Đăng nhập
        </Badge>
      );
    }
    if (act.includes("LOGOUT")) {
      return (
        <Badge variant="outline" className="text-muted-foreground border-border">
          Đăng xuất
        </Badge>
      );
    }
    if (act.includes("ROLE") || act.includes("PERMISSION")) {
      return (
        <Badge className="bg-primary/10 text-primary border-0 font-semibold">
          Phân quyền
        </Badge>
      );
    }
    if (act.includes("CREATE")) {
      return (
        <Badge className="bg-success-muted text-success border-0 font-semibold">
          Tạo mới ({action})
        </Badge>
      );
    }
    if (act.includes("UPDATE") || act.includes("STATUS")) {
      return (
        <Badge className="bg-info-muted text-info border-0 font-semibold">
          Cập nhật ({action})
        </Badge>
      );
    }
    if (act.includes("DELETE")) {
      return (
        <Badge className="bg-danger-muted text-danger border-0 font-semibold">
          Xóa ({action})
        </Badge>
      );
    }
    if (act.includes("IMPORT")) {
      return (
        <Badge className="bg-primary/10 text-primary border-0 font-semibold">
          Import dữ liệu
        </Badge>
      );
    }
    return <Badge variant="secondary">{action}</Badge>;
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
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
            <InfoIcon className="w-3.5 h-3.5 text-primary" />
            Thông tin
          </span>
        );
    }
  };

  const formatRelativeTime = (iso: string) => {
    if (!iso) return "—";
    try {
      const d = new Date(iso);
      return d.toLocaleString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    } catch {
      return iso;
    }
  };

  if (isLoading) {
    return (
      <Card className="rounded-2xl border border-border overflow-hidden shadow-xs">
        <Table className="w-full text-left text-xs">
          <TableHeader className="bg-muted/40 border-b border-border">
            <TableRow>
              <TableHead className="py-3 px-4 text-xs font-semibold">Thời gian</TableHead>
              <TableHead className="py-3 px-4 text-xs font-semibold">Người thực hiện</TableHead>
              <TableHead className="py-3 px-4 text-xs font-semibold">Hành động</TableHead>
              <TableHead className="py-3 px-4 text-xs font-semibold">Đối tượng</TableHead>
              <TableHead className="py-3 px-4 text-xs font-semibold">Mức độ</TableHead>
              <TableHead className="py-3 px-4 text-xs font-semibold">Trạng thái</TableHead>
              <TableHead className="py-3 px-4 text-xs font-semibold text-right">Chi tiết</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 6 }).map((_, idx) => (
              <TableRow key={idx} className="animate-pulse">
                <TableCell className="py-3 px-4">
                  <div className="w-28 h-3.5 rounded bg-muted/60" />
                </TableCell>
                <TableCell className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <div className="size-7 rounded-lg bg-muted/60 shrink-0" />
                    <div className="space-y-1">
                      <div className="w-24 h-3.5 rounded bg-muted/60" />
                      <div className="w-32 h-2.5 rounded bg-muted/40" />
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-3 px-4">
                  <div className="w-20 h-5 rounded-full bg-muted/50" />
                </TableCell>
                <TableCell className="py-3 px-4">
                  <div className="w-36 h-3.5 rounded bg-muted/50" />
                </TableCell>
                <TableCell className="py-3 px-4">
                  <div className="w-16 h-4 rounded bg-muted/50" />
                </TableCell>
                <TableCell className="py-3 px-4">
                  <div className="w-16 h-4 rounded bg-muted/50" />
                </TableCell>
                <TableCell className="py-3 px-4 text-right">
                  <div className="w-7 h-7 rounded-lg bg-muted/50 ml-auto" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl border border-border overflow-hidden shadow-xs flex flex-col">
      <div className="overflow-x-auto">
        <Table className="w-full text-left text-xs border-collapse">
          <TableHeader className="bg-muted/40 border-b border-border">
            <TableRow>
              <TableHead className="py-3 px-4 text-xs font-semibold whitespace-nowrap w-[160px]">
                Thời gian (Timestamp)
              </TableHead>
              <TableHead className="py-3 px-4 text-xs font-semibold min-w-[220px]">
                Tài khoản thực hiện (Actor & IP)
              </TableHead>
              <TableHead className="py-3 px-4 text-xs font-semibold whitespace-nowrap w-[150px]">
                Hành động (Action)
              </TableHead>
              <TableHead className="py-3 px-4 text-xs font-semibold min-w-[220px]">
                Đối tượng tác động (Target)
              </TableHead>
              <TableHead className="py-3 px-4 text-xs font-semibold whitespace-nowrap w-[130px]">
                Mức độ (Severity)
              </TableHead>
              <TableHead className="py-3 px-4 text-xs font-semibold whitespace-nowrap w-[90px]">
                Trạng thái (Status)
              </TableHead>
              <TableHead className="py-3 px-4 text-xs font-semibold whitespace-nowrap text-right w-[80px]">
                Chi tiết
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-border/60">
            {logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                  Không tìm thấy nhật ký hoạt động nào phù hợp với bộ lọc.
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log) => {
                const resolvedActorName = resolveActorName(log.actor.id, log.actor.fullName);
                const actorUserInfo = resolveUserInfo(log.actor.id);
                const actorStudentCode = log.actor.studentCode || actorUserInfo?.studentCode;

                const displayTargetName = resolveTargetName(
                  log.target.type,
                  log.target.id,
                  log.target.name
                );
                const resolvedCourseName =
                  resolveCourseName(log.context?.courseId) || log.context?.courseName;
                const resolvedClassName =
                  resolveClassName(log.context?.classId) ||
                  log.context?.className ||
                  log.context?.classCode;

                let targetContextLabel = "";
                if (log.context?.classCode) {
                  targetContextLabel = ` • ${log.context.classCode}`;
                } else if (resolvedClassName) {
                  targetContextLabel = ` • ${resolvedClassName}`;
                } else if (resolvedCourseName) {
                  targetContextLabel = ` • ${resolvedCourseName}`;
                }

                const displaySubtext = resolveTargetSubtext(
                  log.target.type,
                  log.target.id,
                  `${toSafeString(log.target.type)}${targetContextLabel}`
                );

                return (
                  <TableRow key={log.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="py-3 px-4 whitespace-nowrap font-mono text-[11px] text-muted-foreground">
                      {formatRelativeTime(log.timestamp)}
                    </TableCell>

                    <TableCell className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <Avatar className="w-7 h-7 rounded-lg border border-border shrink-0">
                          {log.actor.avatar && (
                            <AvatarImage src={log.actor.avatar} alt={resolvedActorName} />
                          )}
                          <AvatarFallback className="text-[10px] font-bold bg-primary/10 text-primary">
                            {resolvedActorName.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col min-w-0">
                          <span className="font-semibold text-foreground text-xs truncate">
                            {resolvedActorName}
                          </span>
                          <span className="text-[10px] text-muted-foreground font-mono truncate">
                            {log.actor.ipAddress} &bull; {log.actor.role}
                            {actorStudentCode ? ` (${actorStudentCode})` : ""}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="py-3 px-4 whitespace-nowrap">
                      {getActionBadge(log.action)}
                    </TableCell>

                    <TableCell className="py-3 px-4">
                      <div className="flex flex-col min-w-0">
                        <span className="font-medium text-foreground text-xs truncate">
                          {displayTargetName}
                        </span>
                        <span className="text-[10px] text-muted-foreground truncate font-mono">
                          {displaySubtext}
                        </span>
                      </div>
                    </TableCell>

                  <TableCell className="py-3 px-4 whitespace-nowrap">
                    {getSeverityBadge(log.severity)}
                  </TableCell>

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
              );
            })
          )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Footer */}
      {isServer && totalPages > 1 && onPageChange && (
        <div className="p-3 border-t border-border/60 bg-muted/20 flex items-center justify-between text-xs text-muted-foreground">
          <div>
            Hiển thị trang <strong className="text-foreground">{page}</strong> /{" "}
            <strong className="text-foreground">{totalPages}</strong> (Tổng cộng{" "}
            <strong className="text-foreground">{effectiveTotal}</strong> nhật ký)
          </div>
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
              className="h-7 px-2 text-xs rounded-lg gap-1 cursor-pointer"
            >
              <ChevronLeftIcon className="size-3.5" />
              <span>Trước</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
              className="h-7 px-2 text-xs rounded-lg gap-1 cursor-pointer"
            >
              <span>Sau</span>
              <ChevronRightIcon className="size-3.5" />
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
