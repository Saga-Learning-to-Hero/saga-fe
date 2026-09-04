"use client";

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
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import type { AuditLogItem } from "../types/audit-log";

interface AuditDetailDialogProps {
  log: AuditLogItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export function AuditDetailDialog({ log, isOpen, onClose }: AuditDetailDialogProps) {
  if (!log) return null;

  const renderSeverityIcon = () => {
    switch (log.severity) {
      case "CRITICAL":
        return <ShieldAlertIcon className="w-5 h-5 text-danger" />;
      case "WARNING":
        return <AlertTriangleIcon className="w-5 h-5 text-warning" />;
      case "INFO":
        return <InfoIcon className="w-5 h-5 text-primary" />;
    }
  };

  const renderSeverityBadge = () => {
    switch (log.severity) {
      case "CRITICAL":
        return <Badge className="bg-danger-muted text-danger border-0 font-semibold">Nghiêm trọng</Badge>;
      case "WARNING":
        return <Badge className="bg-warning-muted text-warning border-0 font-semibold">Cảnh báo</Badge>;
      case "INFO":
        return <Badge className="bg-primary/10 text-primary border-0 font-semibold">Thông tin</Badge>;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xl p-6 rounded-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center gap-3 space-y-0 text-left border-b border-border/60 pb-3">
          <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
            {renderSeverityIcon()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <DialogTitle className="text-base font-bold text-foreground">
                Chi tiết nhật ký hoạt động (Audit Detail)
              </DialogTitle>
              {renderSeverityBadge()}
            </div>
            <DialogDescription className="text-xs font-mono text-muted-foreground mt-0.5">
              Request ID: <strong className="text-foreground">{log.requestId}</strong>
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="space-y-4 pt-2 text-xs">
          {/* Status Alert */}
          {log.status === "FAILED" ? (
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-danger-muted/50 border border-danger/20 text-danger">
              <XCircleIcon className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-xs">Thao tác thất bại</p>
                <p className="text-[11px] mt-0.5 text-danger/90">{log.failureReason || "Không rõ nguyên nhân"}</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-success-muted/40 border border-success/20 text-success">
              <CheckCircle2Icon className="w-4 h-4 shrink-0" />
              <span className="font-medium">Thao tác thực thi thành công hoàn toàn.</span>
            </div>
          )}

          {/* Actor & Request Metadata */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-muted/40 border border-border/60 p-3.5 rounded-xl">
            <div className="space-y-1">
              <p className="font-semibold text-foreground flex items-center gap-1.5">
                <UserIcon className="w-3.5 h-3.5 text-primary" />
                Người thực hiện (Actor)
              </p>
              <p className="font-medium text-foreground text-xs">{log.actor.fullName}</p>
              <p className="text-muted-foreground text-[11px]">{log.actor.email}</p>
              <Badge variant="outline" className="text-[10px] border-border mt-1">
                Vai trò: {log.actor.role}
              </Badge>
            </div>

            <div className="space-y-1">
              <p className="font-semibold text-foreground flex items-center gap-1.5">
                <GlobeIcon className="w-3.5 h-3.5 text-primary" />
                Thông tin kết nối
              </p>
              <p className="text-foreground text-xs font-mono">IP: {log.actor.ipAddress}</p>
              {log.actor.userAgent && (
                <p className="text-muted-foreground text-[11px] line-clamp-2 mt-0.5">
                  Thiết bị: {log.actor.userAgent}
                </p>
              )}
              <p className="text-muted-foreground text-[11px] flex items-center gap-1 mt-1 font-mono">
                <CalendarIcon className="w-3 h-3" />
                {new Date(log.timestamp).toLocaleString("vi-VN")}
              </p>
            </div>
          </div>

          {/* Description & Target */}
          <div className="space-y-2">
            <p className="font-semibold text-foreground">Nội dung chi tiết sự kiện:</p>
            <div className="p-3 rounded-xl bg-muted/30 border border-border/60 text-xs text-foreground leading-relaxed">
              {log.description}
            </div>
          </div>

          {/* Target Resource */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-muted/20 border border-border/60">
            <div>
              <p className="text-[11px] text-muted-foreground">Đối tượng bị tác động (Target)</p>
              <p className="font-semibold text-foreground text-xs mt-0.5">{log.target.name}</p>
            </div>
            <Badge variant="secondary" className="text-xs">
              Loại: {log.target.type}
            </Badge>
          </div>

          {/* Changes / Diff Table (nếu có) */}
          {log.changes && log.changes.length > 0 && (
            <div className="space-y-2">
              <p className="font-semibold text-foreground flex items-center gap-1.5">
                <FileCodeIcon className="w-3.5 h-3.5 text-primary" />
                Dữ liệu thay đổi (State Diff):
              </p>
              <div className="border border-border/80 rounded-xl overflow-hidden">
                <Table className="text-xs">
                  <TableHeader className="bg-muted/40">
                    <TableRow>
                      <TableHead className="py-2 px-3">Trường dữ liệu</TableHead>
                      <TableHead className="py-2 px-3">Giá trị trước</TableHead>
                      <TableHead className="py-2 px-3">Giá trị sau</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-border/60">
                    {log.changes.map((change, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="py-2 px-3 font-mono font-semibold text-foreground">
                          {change.field}
                        </TableCell>
                        <TableCell className="py-2 px-3 text-muted-foreground font-mono text-[11px]">
                          {change.oldValue ? (
                            <span className="line-through text-destructive/80">{change.oldValue}</span>
                          ) : (
                            <span className="italic text-muted-foreground/60">Trống</span>
                          )}
                        </TableCell>
                        <TableCell className="py-2 px-3 text-foreground font-mono text-[11px] font-medium">
                          <span className="text-success inline-flex items-center gap-1">
                            <ArrowRightIcon className="w-3 h-3 shrink-0" />
                            {change.newValue}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="pt-3 border-t border-border/60">
          <Button type="button" size="sm" onClick={onClose} className="text-xs">
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
