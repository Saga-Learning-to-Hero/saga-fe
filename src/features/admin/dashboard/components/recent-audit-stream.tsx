import { useMemo } from "react";
import Link from "next/link";
import { ArrowRightIcon, ScrollTextIcon } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAdminAuditLogs } from "@/features/admin/audit-log/hooks/use-admin-audit";
import { mapAdminAuditLogResponseToItem } from "@/features/admin/audit-log/types/audit-log";

export function RecentAuditSection() {
  const { data, isLoading, isError, refetch } = useAdminAuditLogs({
    page: 0,
    size: 5,
  });

  const recentLogs = useMemo(() => {
    if (!data?.items) return [];
    return data.items.map(mapAdminAuditLogResponseToItem);
  }, [data]);

  return (
    <Card className="rounded-2xl border border-border bg-card shadow-xs">
      <CardHeader className="flex flex-row items-center justify-between border-b border-border/60 p-4 pb-3">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <ScrollTextIcon className="size-4" />
          </div>
          <div>
            <CardTitle className="text-sm font-bold text-foreground">
              Nhật ký gần đây
            </CardTitle>
            <CardDescription className="text-[11px] text-muted-foreground">
              Thao tác quản trị và sự kiện bảo mật mới nhất.
            </CardDescription>
          </div>
        </div>

        <Link
          href="/admin/audit-log"
          className="inline-flex cursor-pointer items-center gap-1 text-xs font-semibold text-primary hover:underline"
        >
          Xem tất cả
          <ArrowRightIcon className="size-3.5" />
        </Link>
      </CardHeader>

      <CardContent className="space-y-3 p-4">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((index) => (
              <div
                key={index}
                className="h-12 animate-pulse rounded-xl bg-muted/40"
              />
            ))}
          </div>
        ) : isError ? (
          <div className="rounded-xl border border-danger/25 bg-danger-muted/30 p-5 text-center">
            <p className="text-xs text-muted-foreground">
              Không thể tải nhật ký gần đây.
            </p>
            <button
              type="button"
              onClick={() => void refetch()}
              className="mt-2 text-xs font-semibold text-primary hover:underline"
            >
              Thử tải lại
            </button>
          </div>
        ) : recentLogs.length === 0 ? (
          <div className="py-8 text-center text-xs text-muted-foreground">
            Chưa có sự kiện nào được ghi nhận.
          </div>
        ) : (
          recentLogs.map((log) => (
            <div
              key={log.id}
              className="flex items-start justify-between gap-3 border-b border-border/40 pb-3 last:border-0 last:pb-0"
            >
              <div className="min-w-0 space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="truncate text-xs font-semibold text-foreground">
                    {log.actor.fullName}
                  </span>
                  <Badge
                    variant="outline"
                    className="border-border px-1.5 py-0 text-[10px]"
                  >
                    {log.actor.role}
                  </Badge>
                  <span className="font-mono text-[10px] text-muted-foreground">
                    {log.actor.ipAddress}
                  </span>
                </div>
                <p className="line-clamp-1 text-xs text-muted-foreground">
                  {log.description}
                </p>
              </div>

              <div className="shrink-0 space-y-1 text-right">
                <SeverityBadge severity={log.severity} />
                <p className="font-mono text-[10px] text-muted-foreground">
                  {new Date(log.timestamp).toLocaleTimeString("vi-VN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

function SeverityBadge({ severity }: { severity: string }) {
  if (severity === "CRITICAL") {
    return (
      <Badge className="border-0 bg-destructive/15 text-[10px] font-semibold text-destructive">
        Nghiêm trọng
      </Badge>
    );
  }

  if (severity === "WARNING") {
    return (
      <Badge className="border-0 bg-amber-500/15 text-[10px] font-semibold text-amber-600 dark:text-amber-400">
        Cảnh báo
      </Badge>
    );
  }

  return (
    <Badge className="border-0 bg-primary/10 text-[10px] font-semibold text-primary">
      Thông tin
    </Badge>
  );
}
