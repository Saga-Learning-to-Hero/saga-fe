"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  RotateCwIcon,
  CheckCircle2Icon,
  AlertTriangleIcon,
  ClockIcon,
  ActivityIcon,
} from "lucide-react";
import { useProjectSyncStatus } from "../hooks/useProjectSync";

interface ProjectSyncStatusCardProps {
  projectId: string;
}

function formatDateTime(dateStr?: string | null): string {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "—";
    return new Intl.DateTimeFormat("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour12: false,
    }).format(d);
  } catch {
    return dateStr;
  }
}

function renderStatusBadge(status?: string) {
  const s = (status || "").toUpperCase();
  if (s === "SUCCESS" || s === "COMPLETED" || s === "DONE") {
    return (
      <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 gap-1.5 text-xs font-semibold">
        <CheckCircle2Icon className="w-3.5 h-3.5" />
        <span>Thành công</span>
      </Badge>
    );
  }
  if (s === "IN_PROGRESS" || s === "RUNNING" || s === "SYNCING") {
    return (
      <Badge className="bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30 gap-1.5 text-xs font-semibold animate-pulse">
        <RotateCwIcon className="w-3.5 h-3.5 animate-spin" />
        <span>Đang xử lý</span>
      </Badge>
    );
  }
  if (s === "FAILED" || s === "ERROR") {
    return (
      <Badge className="bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30 gap-1.5 text-xs font-semibold">
        <AlertTriangleIcon className="w-3.5 h-3.5" />
        <span>Thất bại</span>
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="text-muted-foreground border-border gap-1.5 text-xs font-medium">
      <ClockIcon className="w-3.5 h-3.5" />
      <span>{status || "Đang chờ"}</span>
    </Badge>
  );
}

function renderProviderBadge(provider?: string) {
  const p = (provider || "").toLowerCase();
  if (p.includes("jira")) {
    return (
      <div className="flex items-center gap-2 font-semibold text-foreground text-xs">
        <div className="w-6 h-6 rounded-lg bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-500/20 font-mono text-[11px] font-black">
          J
        </div>
        <span>Jira Software</span>
      </div>
    );
  }
  if (p.includes("github")) {
    return (
      <div className="flex items-center gap-2 font-semibold text-foreground text-xs">
        <div className="w-6 h-6 rounded-lg bg-slate-500/15 text-foreground flex items-center justify-center border border-border font-mono text-[11px] font-black">
          G
        </div>
        <span>GitHub Repositories</span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2 font-semibold text-foreground text-xs">
      <div className="w-6 h-6 rounded-lg bg-primary/15 text-primary flex items-center justify-center border border-primary/20 font-mono text-[11px] font-black">
        {provider?.slice(0, 1).toUpperCase() || "?"}
      </div>
      <span>{provider || "N/A"}</span>
    </div>
  );
}

export function ProjectSyncStatusCard({ projectId }: ProjectSyncStatusCardProps) {
  const {
    data: syncStatuses = [],
    isLoading,
    isRefetching,
    refetch,
  } = useProjectSyncStatus(projectId, {
    enabled: Boolean(projectId && projectId.trim()),
    refetchInterval: 10000,
  });

  return (
    <Card className="rounded-2xl border border-border/80 shadow-xs bg-card overflow-hidden">
      <CardHeader className="p-4 sm:p-5 bg-muted/20 border-b border-border/60">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center shrink-0 shadow-2xs">
              <ActivityIcon className="w-4.5 h-4.5" />
            </div>
            <div>
              <CardTitle className="text-sm sm:text-base font-bold text-foreground flex items-center gap-2">
                <span>Nhật ký &amp; Trạng thái Đồng bộ Nền tảng</span>
                <Badge variant="outline" className="font-mono text-[10px] bg-background">
                  {syncStatuses.length} providers
                </Badge>
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">
                Theo dõi tiến trình đồng bộ dữ liệu gần nhất từ Jira và GitHub cho dự án
              </CardDescription>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => void refetch()}
            disabled={isLoading || isRefetching}
            className="h-8 text-xs font-semibold rounded-xl gap-1.5 cursor-pointer shrink-0"
          >
            <RotateCwIcon className={`w-3.5 h-3.5 ${isRefetching ? "animate-spin" : ""}`} />
            <span>Làm mới</span>
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {isLoading ? (
          <div className="p-8 text-center text-xs text-muted-foreground space-y-2">
            <RotateCwIcon className="w-5 h-5 animate-spin mx-auto text-primary" />
            <p>Đang tải nhật ký trạng thái đồng bộ...</p>
          </div>
        ) : syncStatuses.length === 0 ? (
          <div className="p-8 text-center text-xs text-muted-foreground space-y-2">
            <ClockIcon className="w-6 h-6 mx-auto text-muted-foreground/60" />
            <p className="font-medium text-foreground">Chưa có nhật ký đồng bộ nào</p>
            <p className="text-[11px]">
              Dữ liệu đồng bộ sẽ tự động xuất hiện tại đây khi dự án thực hiện quét dữ liệu Jira hoặc GitHub.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border/60 hover:bg-transparent bg-muted/10">
                  <TableHead className="text-xs font-bold text-muted-foreground">Nền tảng</TableHead>
                  <TableHead className="text-xs font-bold text-muted-foreground">Trạng thái</TableHead>
                  <TableHead className="text-xs font-bold text-muted-foreground">Bắt đầu</TableHead>
                  <TableHead className="text-xs font-bold text-muted-foreground">Hoàn thành</TableHead>
                  <TableHead className="text-xs font-bold text-muted-foreground text-center">Đã xử lý</TableHead>
                  <TableHead className="text-xs font-bold text-muted-foreground text-center">Thất bại</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {syncStatuses.map((item, idx) => (
                  <TableRow key={`${item.projectId}-${item.provider}-${idx}`} className="border-border/40 hover:bg-muted/30">
                    <TableCell className="py-3">{renderProviderBadge(item.provider)}</TableCell>
                    <TableCell className="py-3">{renderStatusBadge(item.status)}</TableCell>
                    <TableCell className="py-3 font-mono text-xs text-muted-foreground">
                      {formatDateTime(item.startedAt)}
                    </TableCell>
                    <TableCell className="py-3 font-mono text-xs text-muted-foreground">
                      {formatDateTime(item.completedAt)}
                    </TableCell>
                    <TableCell className="py-3 text-center">
                      <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                        {item.itemsProcessed ?? 0}
                      </span>
                    </TableCell>
                    <TableCell className="py-3 text-center">
                      <span
                        className={`font-mono text-xs font-bold px-2 py-0.5 rounded-md ${
                          (item.itemsFailed ?? 0) > 0
                            ? "text-red-600 dark:text-red-400 bg-red-500/10"
                            : "text-muted-foreground bg-muted/50"
                        }`}
                      >
                        {item.itemsFailed ?? 0}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
