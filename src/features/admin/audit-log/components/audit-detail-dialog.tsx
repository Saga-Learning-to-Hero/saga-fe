"use client";

import { useState } from "react";
import {
  ShieldAlertIcon,
  InfoIcon,
  AlertTriangleIcon,
  UserIcon,
  GlobeIcon,
  CalendarIcon,
  FileCodeIcon,
  CheckCircle2Icon,
  XCircleIcon,
  ArrowRightIcon,
  GraduationCapIcon,
  CodeIcon,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import type { AuditLogItem } from "../types/audit-log";
import { ExpandableId } from "./expandable-id";
import { useAuditNameResolver } from "../hooks/use-audit-name-resolver";
import { formatVietnamDateTime } from "@/lib/utils";

interface AuditDetailDialogProps {
  log: AuditLogItem | null;
  isOpen: boolean;
  onClose: () => void;
}

function renderSafeValue(val: unknown): string {
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

export function AuditDetailDialog({
  log,
  isOpen,
  onClose,
}: AuditDetailDialogProps) {
  const [showRawJson, setShowRawJson] = useState(false);
  const {
    resolveCourseName,
    resolveClassName,
    resolveUserInfo,
    resolveTargetName,
    resolveValueToName,
  } = useAuditNameResolver();

  if (!log) return null;

  // Giải mã Actor
  const actorUserInfo = resolveUserInfo(log.actor.id);
  const actorFullName =
    log.actor.fullName && log.actor.fullName !== "Hệ thống SAGA"
      ? log.actor.fullName
      : actorUserInfo?.fullName || log.actor.fullName || "Hệ thống SAGA";
  const actorEmail =
    log.actor.email && log.actor.email !== "system@saga.local"
      ? log.actor.email
      : actorUserInfo?.email || log.actor.email;
  const actorStudentCode = log.actor.studentCode || actorUserInfo?.studentCode;

  // Giải mã Context
  const resolvedCourseName =
    resolveCourseName(log.context?.courseId) || log.context?.courseName;
  const resolvedClassName =
    resolveClassName(log.context?.classId) || log.context?.className;

  // Giải mã Target
  const displayTargetName = resolveTargetName(
    log.target.type,
    log.target.id,
    log.target.name
  );
  const targetUserInfo =
    log.target.type.toUpperCase().includes("USER") && log.target.id
      ? resolveUserInfo(log.target.id)
      : null;

  const renderSeverityIcon = () => {
    switch (log.severity) {
      case "CRITICAL":
        return <ShieldAlertIcon className="w-5 h-5 text-danger" />;
      case "WARNING":
        return <AlertTriangleIcon className="w-5 h-5 text-warning" />;
      case "INFO":
      default:
        return <InfoIcon className="w-5 h-5 text-primary" />;
    }
  };

  const renderSeverityBadge = () => {
    switch (log.severity) {
      case "CRITICAL":
        return (
          <Badge className="bg-danger-muted text-danger border-0 font-semibold text-[10px]">
            Nghiêm trọng
          </Badge>
        );
      case "WARNING":
        return (
          <Badge className="bg-warning-muted text-warning border-0 font-semibold text-[10px]">
            Cảnh báo
          </Badge>
        );
      case "INFO":
      default:
        return (
          <Badge className="bg-primary/10 text-primary border-0 font-semibold text-[10px]">
            Thông tin
          </Badge>
        );
    }
  };

  const hasContext =
    log.context &&
    (log.context.classCode ||
      log.context.className ||
      log.context.classId ||
      log.context.courseId ||
      log.context.courseName ||
      log.context.teamId ||
      log.context.teamName ||
      log.context.projectId ||
      log.context.projectName ||
      log.context.source);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl p-0 rounded-3xl overflow-hidden border border-border shadow-2xl flex flex-col max-h-[90vh] gap-0">
        {/* 1. Header */}
        <DialogHeader className="p-6 pb-4 border-b border-border/60 bg-muted/20 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-muted/80 flex items-center justify-center shrink-0 border border-border/60">
              {renderSeverityIcon()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <DialogTitle className="text-base font-bold text-foreground truncate">
                  Chi tiết nhật ký kiểm toán (Audit Detail)
                </DialogTitle>
                {renderSeverityBadge()}
              </div>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Nhật ký hoạt động ghi nhận lúc {formatVietnamDateTime(log.timestamp)} (GMT+7)
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* 2. Body */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1 min-h-0 text-xs">
          {/* Status banner */}
          {log.status === "FAILED" ? (
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-danger-muted/50 border border-danger/20 text-danger">
              <XCircleIcon className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-xs">Thao tác thất bại</p>
                <p className="text-[11px] mt-0.5 text-danger/90">
                  {log.failureReason || "Không rõ nguyên nhân"}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-success-muted/40 border border-success/20 text-success">
              <CheckCircle2Icon className="w-4 h-4 shrink-0" />
              <span className="font-medium">
                Thao tác kiểm toán đã được ghi nhận và lưu trữ thành công.
              </span>
            </div>
          )}

          {/* Actor & Connection info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-muted/30 border border-border/60 p-3.5 rounded-2xl">
            <div className="space-y-1">
              <p className="font-semibold text-foreground flex items-center gap-1.5">
                <UserIcon className="w-3.5 h-3.5 text-primary" />
                Tài khoản thực hiện (Actor)
              </p>
              <p className="font-bold text-foreground text-xs">{actorFullName}</p>
              <p className="text-muted-foreground text-[11px]">{actorEmail}</p>
              <div className="flex items-center gap-1.5 pt-1 flex-wrap">
                <Badge variant="outline" className="text-[10px] border-border">
                  Vai trò: {log.actor.role}
                </Badge>
                {actorStudentCode && (
                  <Badge
                    variant="outline"
                    className="text-[10px] font-mono border-primary/30 text-primary"
                  >
                    MSSV: {actorStudentCode}
                  </Badge>
                )}
                {!actorFullName && log.actor.id && (
                  <ExpandableId id={log.actor.id} prefix="ID: " badge />
                )}
              </div>
            </div>

            <div className="space-y-1">
              <p className="font-semibold text-foreground flex items-center gap-1.5">
                <GlobeIcon className="w-3.5 h-3.5 text-primary" />
                Thông tin kết nối máy chủ
              </p>
              <p className="text-foreground text-xs font-mono">
                IP: <span className="font-semibold">{log.actor.ipAddress}</span>
              </p>
              {log.actor.userAgent && (
                <p className="text-muted-foreground text-[11px] line-clamp-2 mt-0.5">
                  User Agent: {log.actor.userAgent}
                </p>
              )}
              <p className="text-muted-foreground text-[11px] flex items-center gap-1 mt-1 font-mono">
                <CalendarIcon className="w-3 h-3" />
                {formatVietnamDateTime(log.timestamp)} (GMT+7)
              </p>
            </div>
          </div>

          {/* Academic Context (if available) */}
          {hasContext && (
            <div className="bg-primary/5 border border-primary/20 p-3.5 rounded-2xl space-y-2">
              <p className="font-semibold text-primary flex items-center gap-1.5">
                <GraduationCapIcon className="w-3.5 h-3.5" />
                Ngữ cảnh học thuật (Academic Context)
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                {(resolvedClassName || log.context?.classCode || log.context?.classId) && (
                  <div className="flex justify-between items-center gap-2">
                    <span className="text-muted-foreground shrink-0">Lớp niên khóa:</span>
                    <div className="flex items-center gap-1.5 flex-wrap justify-end">
                      {resolvedClassName || log.context?.classCode ? (
                        <span className="font-semibold text-foreground">
                          {resolvedClassName || log.context?.classCode}
                          {log.context?.classCode && resolvedClassName && !resolvedClassName.includes(log.context.classCode)
                            ? ` (${log.context.classCode})`
                            : ""}
                        </span>
                      ) : (
                        log.context?.classId && <ExpandableId id={log.context.classId} badge />
                      )}
                    </div>
                  </div>
                )}
                {(resolvedCourseName || log.context?.courseId) && (
                  <div className="flex justify-between items-center gap-2">
                    <span className="text-muted-foreground shrink-0">Lớp học phần:</span>
                    <div className="flex items-center gap-1.5 flex-wrap justify-end">
                      {resolvedCourseName ? (
                        <span className="font-semibold text-foreground">{resolvedCourseName}</span>
                      ) : (
                        log.context?.courseId && <ExpandableId id={log.context.courseId} badge />
                      )}
                    </div>
                  </div>
                )}
                <div className="flex justify-between items-center gap-2">
                  <span className="text-muted-foreground shrink-0">Nhóm dự án:</span>
                  <div className="flex items-center gap-1.5 flex-wrap justify-end">
                    {log.context?.teamName ? (
                      <span className="font-semibold text-foreground">
                        {log.context.teamNo != null &&
                          !log.context.teamName.toLowerCase().includes("nhóm") &&
                          !log.context.teamName.toLowerCase().includes("team")
                          ? `Nhóm ${log.context.teamNo} - ${log.context.teamName}`
                          : log.context.teamName}
                      </span>
                    ) : (
                      <span className="italic text-muted-foreground/80">Không có</span>
                    )}
                  </div>
                </div>
                <div className="flex justify-between items-center gap-2">
                  <span className="text-muted-foreground shrink-0">Dự án:</span>
                  <div className="flex items-center gap-1.5 flex-wrap justify-end">
                    {log.context?.projectName ? (
                      <span className="font-semibold text-foreground">{log.context.projectName}</span>
                    ) : (
                      <span className="italic text-muted-foreground/80">Không có</span>
                    )}
                  </div>
                </div>
                {log.context?.source && (
                  <div className="flex justify-between col-span-1 sm:col-span-2">
                    <span className="text-muted-foreground">Nguồn phát sinh:</span>
                    <Badge variant="outline" className="font-mono text-[10px]">
                      {log.context.source}
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Description & Target */}
          <div className="space-y-2">
            <p className="font-semibold text-foreground">Nội dung chi tiết sự kiện:</p>
            <div className="p-3 rounded-xl bg-muted/30 border border-border/60 text-xs text-foreground leading-relaxed">
              Thao tác [{log.action}] trên {log.target.type}: {displayTargetName}
            </div>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-muted/20 border border-border/60">
            <div className="min-w-0 flex-1 pr-2">
              <p className="text-[11px] text-muted-foreground">Đối tượng bị tác động (Target):</p>
              <p className="font-semibold text-foreground text-xs mt-0.5 truncate">{displayTargetName}</p>
              {targetUserInfo && (
                <p className="text-[10px] text-muted-foreground font-mono mt-0.5 truncate">
                  {targetUserInfo.email} {targetUserInfo.studentCode ? `• MSSV: ${targetUserInfo.studentCode}` : ""}
                </p>
              )}
            </div>
            <div className="flex items-center gap-1.5 flex-wrap justify-end shrink-0">
              <Badge variant="secondary" className="text-[11px]">
                Loại: {renderSafeValue(log.target.type)}
              </Badge>
              {/* Chỉ hiển thị ID nếu hoàn toàn không có tên thay thế */}
              {(!displayTargetName || displayTargetName === log.target.id || displayTargetName.includes("#")) && log.target.id && (
                <ExpandableId
                  id={renderSafeValue(log.target.id)}
                  prefix="ID: "
                  badge
                />
              )}
            </div>
          </div>

          {/* Changes / State Diff */}
          {log.changes && log.changes.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-foreground flex items-center gap-1.5">
                  <FileCodeIcon className="w-3.5 h-3.5 text-primary" />
                  Dữ liệu thay đổi (State Diff):
                </p>
                {(log.rawBefore || log.rawAfter || log.rawMetadata) && (
                  <button
                    type="button"
                    onClick={() => setShowRawJson(!showRawJson)}
                    className="text-[11px] text-primary hover:underline inline-flex items-center gap-1 cursor-pointer font-medium"
                  >
                    <CodeIcon className="size-3" />
                    <span>{showRawJson ? "Ẩn JSON thô" : "Xem JSON thô"}</span>
                  </button>
                )}
              </div>

              <div className="border border-border/80 rounded-xl overflow-hidden shadow-2xs">
                <Table className="text-xs">
                  <TableHeader className="bg-muted/40">
                    <TableRow>
                      <TableHead className="py-2 px-3">Trường dữ liệu</TableHead>
                      <TableHead className="py-2 px-3">Giá trị trước (Before)</TableHead>
                      <TableHead className="py-2 px-3">Giá trị sau (After)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-border/60">
                    {log.changes.map((change, idx) => {
                      const oldResolved = resolveValueToName(change.field, change.oldValue);
                      const newResolved = resolveValueToName(change.field, change.newValue);
                      const displayOld = oldResolved || change.oldValue;
                      const displayNew = newResolved || change.newValue;

                      return (
                        <TableRow key={idx}>
                          <TableCell className="py-2 px-3 font-mono font-semibold text-foreground">
                            {renderSafeValue(change.field)}
                          </TableCell>
                          <TableCell className="py-2 px-3 text-muted-foreground font-mono text-[11px]">
                            {displayOld ? (
                              <span className="line-through text-destructive/80">
                                {renderSafeValue(displayOld)}
                              </span>
                            ) : (
                              <span className="italic text-muted-foreground/60">Trống</span>
                            )}
                          </TableCell>
                          <TableCell className="py-2 px-3 text-foreground font-mono text-[11px] font-medium">
                            <span className="text-success inline-flex items-center gap-1">
                              <ArrowRightIcon className="w-3 h-3 shrink-0" />
                              {renderSafeValue(displayNew)}
                            </span>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {showRawJson && (
                <div className="space-y-2 pt-2 animate-in fade-in-0 duration-150">
                  {log.rawBefore && (
                    <div>
                      <span className="text-[11px] font-semibold text-muted-foreground">Before JSON:</span>
                      <pre className="p-2.5 rounded-xl bg-muted/60 font-mono text-[11px] overflow-x-auto border border-border/60 mt-1">
                        {renderSafeValue(log.rawBefore)}
                      </pre>
                    </div>
                  )}
                  {log.rawAfter && (
                    <div>
                      <span className="text-[11px] font-semibold text-muted-foreground">After JSON:</span>
                      <pre className="p-2.5 rounded-xl bg-muted/60 font-mono text-[11px] overflow-x-auto border border-border/60 mt-1">
                        {renderSafeValue(log.rawAfter)}
                      </pre>
                    </div>
                  )}
                  {log.rawMetadata && (
                    <div>
                      <span className="text-[11px] font-semibold text-muted-foreground">Metadata JSON:</span>
                      <pre className="p-2.5 rounded-xl bg-muted/60 font-mono text-[11px] overflow-x-auto border border-border/60 mt-1">
                        {renderSafeValue(log.rawMetadata)}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* 3. Footer */}
        <DialogFooter className="m-0 shrink-0 px-6 py-4 border-t border-border/60 bg-muted/20 flex justify-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            className="text-xs rounded-xl cursor-pointer"
          >
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
