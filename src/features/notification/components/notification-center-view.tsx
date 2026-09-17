"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeftIcon,
  BellIcon,
  BellOffIcon,
  CheckCheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ExternalLinkIcon,
  RefreshCwIcon,
  SearchIcon,
  CheckIcon,
  SparklesIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  useNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
} from "../hooks/use-notifications";
import { usePushNotifications } from "../hooks/use-push-notifications";
import {
  formatFullDateTime,
  formatRelativeTime,
  formatVietnamShortDateTime,
  getNotificationVisualConfig,
  isValidInternalActionUrl,
} from "../lib/notification-utils";
import { cn } from "@/lib/utils";

type NotificationTypeFilter = "ALL" | "COURSE" | "TEAM" | "SYSTEM";

export function NotificationCenterView() {
  const router = useRouter();
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [typeFilter, setTypeFilter] = useState<NotificationTypeFilter>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const pageSize = 12;

  const {
    data,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useNotifications({ page, size: pageSize, unreadOnly });

  const { mutate: markRead } = useMarkNotificationRead();
  const { mutate: markAllRead, isPending: isMarkingAll } = useMarkAllNotificationsRead();
  const { permission, requestPermissionAndRegister, isRegistering } = usePushNotifications();

  const rawItems = useMemo(() => data?.items ?? [], [data?.items]);
  const total = data?.total || 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const filteredItems = useMemo(() => {
    return rawItems.filter((item) => {
      if (typeFilter !== "ALL") {
        if (typeFilter === "COURSE" && !item.notificationType.includes("COURSE")) return false;
        if (typeFilter === "TEAM" && !item.notificationType.includes("TEAM")) return false;
        if (typeFilter === "SYSTEM" && !item.notificationType.includes("SYSTEM")) return false;
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchTitle = item.title.toLowerCase().includes(query);
        const matchMsg = item.message.toLowerCase().includes(query);
        if (!matchTitle && !matchMsg) return false;
      }
      return true;
    });
  }, [rawItems, typeFilter, searchQuery]);

  const handleNotificationClick = (item: { id: string; actionUrl: string | null; readAt: string | null }) => {
    if (!item.readAt) {
      markRead(item.id);
    }
    if (isValidInternalActionUrl(item.actionUrl)) {
      router.push(item.actionUrl as string);
    }
  };

  const handleTabChange = (onlyUnread: boolean) => {
    setUnreadOnly(onlyUnread);
    setPage(0);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground gap-1.5 rounded-xl cursor-pointer"
            >
              <ArrowLeftIcon className="size-4" />
              <span>Quay lại</span>
            </Button>
            <span className="text-muted-foreground/40">•</span>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
              <BellIcon className="size-3.5" />
              <span>Hệ thống thông báo</span>
            </div>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
            Trung tâm thông báo
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Xem toàn bộ thông báo phát sóng từ giảng viên, nhóm dự án và quản trị hệ thống.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {permission === "default" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => void requestPermissionAndRegister()}
              disabled={isRegistering}
              className="h-9 text-xs rounded-xl gap-1.5 cursor-pointer border-primary/30 text-primary hover:bg-primary/10"
            >
              <SparklesIcon className="size-3.5" />
              <span>Bật thông báo Web</span>
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => void refetch()}
            disabled={isFetching}
            className="h-9 text-xs rounded-xl gap-1.5 cursor-pointer"
          >
            <RefreshCwIcon className={cn("size-3.5", isFetching && "animate-spin")} />
            <span>Làm mới</span>
          </Button>

          <Button
            variant="default"
            size="sm"
            onClick={() => markAllRead()}
            disabled={isMarkingAll || rawItems.length === 0}
            className="h-9 text-xs rounded-xl gap-1.5 cursor-pointer"
          >
            <CheckCheckIcon className="size-3.5" />
            <span>Đọc tất cả</span>
          </Button>
        </div>
      </div>

      <div className="bg-card border border-border/80 rounded-2xl p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 bg-muted/50 p-1 rounded-xl w-fit">
            <button
              onClick={() => handleTabChange(false)}
              className={cn(
                "px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer",
                !unreadOnly
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Tất cả {total > 0 && !unreadOnly && `(${total})`}
            </button>
            <button
              onClick={() => handleTabChange(true)}
              className={cn(
                "px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer",
                unreadOnly
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Chưa đọc
            </button>
          </div>

          <div className="flex items-center gap-2 flex-1 sm:max-w-xs">
            <div className="relative w-full">
              <SearchIcon className="size-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm nội dung thông báo..."
                className="h-8.5 pl-8.5 text-xs rounded-xl bg-muted/30"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-0.5 scrollbar-none text-xs">
          <span className="text-muted-foreground text-[11px] font-medium shrink-0 mr-1">Lọc theo:</span>
          {(
            [
              { key: "ALL", label: "Tất cả nguồn" },
              { key: "COURSE", label: "Lớp học phần" },
              { key: "TEAM", label: "Nhóm dự án" },
              { key: "SYSTEM", label: "Hệ thống SAGA" },
            ] as const
          ).map((t) => (
            <button
              key={t.key}
              onClick={() => setTypeFilter(t.key)}
              className={cn(
                "px-2.5 py-1 rounded-lg text-xs font-medium transition-colors shrink-0 cursor-pointer",
                typeFilter === t.key
                  ? "bg-primary/15 text-primary border border-primary/30"
                  : "text-muted-foreground hover:bg-muted/60"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-card border border-border/80 rounded-2xl shadow-xs overflow-hidden divide-y divide-border/50">
        {isLoading && (
          <div className="p-6 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex gap-4 p-4 rounded-xl bg-muted/30 animate-pulse">
                <div className="size-11 rounded-2xl bg-muted shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded-md w-1/3" />
                  <div className="h-3 bg-muted rounded-md w-3/4" />
                  <div className="h-3 bg-muted rounded-md w-1/4" />
                </div>
              </div>
            ))}
          </div>
        )}

        {isError && !isLoading && (
          <div className="py-16 text-center space-y-3">
            <div className="mx-auto size-12 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center">
              <BellOffIcon className="size-6" />
            </div>
            <p className="text-sm font-bold text-destructive">Không thể kết nối máy chủ để tải thông báo</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => void refetch()}
              className="h-8 text-xs cursor-pointer"
            >
              Thử tải lại
            </Button>
          </div>
        )}

        {!isLoading && !isError && filteredItems.length === 0 && (
          <div className="py-16 text-center space-y-3">
            <div className="mx-auto size-12 rounded-2xl bg-muted/60 text-muted-foreground flex items-center justify-center">
              <BellOffIcon className="size-6" />
            </div>
            <p className="text-sm font-bold text-foreground">
              {searchQuery || typeFilter !== "ALL" || unreadOnly
                ? "Không tìm thấy thông báo phù hợp bộ lọc"
                : "Hộp thư thông báo của bạn đang trống"}
            </p>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              {searchQuery || typeFilter !== "ALL" || unreadOnly
                ? "Hãy thử thay đổi từ khóa tìm kiếm hoặc chọn lại bộ lọc nguồn tin khác."
                : "Mọi thông báo từ giảng viên và nhóm dự án sẽ được hiển thị đầy đủ tại đây."}
            </p>
          </div>
        )}

        {!isLoading &&
          !isError &&
          filteredItems.map((item) => {
            const visual = getNotificationVisualConfig(item.notificationType);
            const VisualIcon = visual.icon;
            const isUnread = !item.readAt;

            return (
              <div
                key={item.id}
                className={cn(
                  "p-4 sm:p-5 transition-colors flex items-start gap-4 relative group",
                  isUnread
                    ? "bg-primary/[0.03] hover:bg-primary/[0.06]"
                    : "hover:bg-muted/40"
                )}
              >
                <div
                  className={cn(
                    "size-10 sm:size-11 rounded-2xl flex items-center justify-center shrink-0 border border-border/40 shadow-xs",
                    visual.iconBgClassName,
                    visual.iconColorClassName
                  )}
                >
                  <VisualIcon className="size-5" />
                </div>

                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <h3
                        onClick={() => handleNotificationClick(item)}
                        className={cn(
                          "text-sm leading-snug cursor-pointer hover:text-primary transition-colors",
                          isUnread ? "font-bold text-foreground" : "font-medium text-foreground/90"
                        )}
                      >
                        {item.title}
                      </h3>
                      {isUnread && (
                        <span className="size-2 rounded-full bg-primary ring-2 ring-primary/20 shrink-0" />
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Badge className={cn("text-[10px] px-2 py-0.5 border font-medium", visual.badgeClassName)}>
                        {visual.label}
                      </Badge>
                      <Tooltip>
                        <TooltipTrigger className="text-[11px] text-muted-foreground/80 font-medium flex items-center gap-1.5 cursor-pointer">
                          <span className="font-mono text-foreground/80">{formatVietnamShortDateTime(item.createdAt)}</span>
                          <span className="text-muted-foreground/40">&bull;</span>
                          <span>{formatRelativeTime(item.createdAt)}</span>
                        </TooltipTrigger>
                        <TooltipContent side="top">
                          {formatFullDateTime(item.createdAt)} (GMT+7)
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed break-words">
                    {item.message}
                  </p>

                  <div className="flex items-center justify-between pt-1">
                    {isValidInternalActionUrl(item.actionUrl) ? (
                      <button
                        onClick={() => handleNotificationClick(item)}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline cursor-pointer"
                      >
                        <span>Xem chi tiết liên kết</span>
                        <ExternalLinkIcon className="size-3" />
                      </button>
                    ) : (
                      <div />
                    )}

                    {isUnread && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => markRead(item.id)}
                        className="h-7 text-xs text-muted-foreground hover:text-foreground cursor-pointer gap-1 px-2 rounded-lg"
                      >
                        <CheckIcon className="size-3 text-primary" />
                        <span>Đánh dấu đã đọc</span>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-2 pt-2 text-xs text-muted-foreground">
          <span>
            Trang {page + 1} / {totalPages} ({total} thông báo)
          </span>
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 0 || isLoading}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              className="h-8 px-3 rounded-xl gap-1 text-xs cursor-pointer"
            >
              <ChevronLeftIcon className="size-3.5" />
              <span>Trước</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages - 1 || isLoading}
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              className="h-8 px-3 rounded-xl gap-1 text-xs cursor-pointer"
            >
              <span>Sau</span>
              <ChevronRightIcon className="size-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
