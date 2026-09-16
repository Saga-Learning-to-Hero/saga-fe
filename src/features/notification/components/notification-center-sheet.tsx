"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  BellOffIcon,
  CheckCheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  InfoIcon,
  LoaderCircleIcon,
  RefreshCwIcon,
  SettingsIcon,
} from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  getNotificationVisualConfig,
  isValidInternalActionUrl,
} from "../lib/notification-utils";
import { cn } from "@/lib/utils";

interface NotificationCenterSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NotificationCenterSheet({ open, onOpenChange }: NotificationCenterSheetProps) {
  const router = useRouter();
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [page, setPage] = useState(0);
  const pageSize = 10;

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

  const items = data?.items || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / pageSize);

  const handleNotificationClick = (item: { id: string; actionUrl: string | null; readAt: string | null }) => {
    if (!item.readAt) {
      markRead(item.id);
    }
    if (isValidInternalActionUrl(item.actionUrl)) {
      onOpenChange(false);
      router.push(item.actionUrl as string);
    }
  };

  const handleTabChange = (onlyUnread: boolean) => {
    setUnreadOnly(onlyUnread);
    setPage(0);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col bg-card border-border shadow-2xl">
        <SheetHeader className="p-4 sm:p-5 border-b border-border/80 bg-muted/20 shrink-0">
          <div className="flex items-center justify-between gap-3">
            <SheetTitle className="text-base sm:text-lg font-bold text-foreground">
              Trung tâm thông báo
            </SheetTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                disabled={isMarkingAll || isLoading}
                onClick={() => markAllRead()}
              >
                <CheckCheckIcon className="size-3.5 mr-1 text-primary" />
                Đọc tất cả
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-1.5 pt-2">
            <button
              onClick={() => handleTabChange(false)}
              className={cn(
                "px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer",
                !unreadOnly
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              Tất cả {total > 0 && !unreadOnly && `(${total})`}
            </button>
            <button
              onClick={() => handleTabChange(true)}
              className={cn(
                "px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer",
                unreadOnly
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              Chưa đọc
            </button>
          </div>
        </SheetHeader>

        {permission === "default" && (
          <div className="mx-4 mt-3 p-3 rounded-xl bg-primary/10 border border-primary/20 flex items-start gap-3 shrink-0">
            <InfoIcon className="size-4 text-primary shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0 space-y-1.5">
              <p className="text-xs font-semibold text-foreground">Bật thông báo trình duyệt</p>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Nhận cảnh báo công việc, hạn nộp và cập nhật nhóm tức thì ngay cả khi không mở tab.
              </p>
              <Button
                size="sm"
                className="h-7 text-xs px-2.5 cursor-pointer"
                disabled={isRegistering}
                onClick={() => void requestPermissionAndRegister()}
              >
                {isRegistering ? (
                  <>
                    <LoaderCircleIcon className="size-3 animate-spin mr-1" />
                    Đang kích hoạt...
                  </>
                ) : (
                  "Bật thông báo ngay"
                )}
              </Button>
            </div>
          </div>
        )}

        {permission === "denied" && (
          <div className="mx-4 mt-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3 shrink-0">
            <SettingsIcon className="size-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0 space-y-1">
              <p className="text-xs font-semibold text-amber-700 dark:text-amber-300">
                Thông báo trình duyệt đã bị chặn
              </p>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Vui lòng mở Cài đặt trình duyệt (biểu tượng ổ khóa cạnh thanh địa chỉ) để cho phép nhận thông báo từ SAGA.
              </p>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4 space-y-2.5 divide-y divide-border/40">
          {isLoading && (
            <div className="space-y-3 py-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex gap-3 p-3 rounded-xl bg-muted/40 animate-pulse">
                  <div className="size-9 rounded-xl bg-muted shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3.5 bg-muted rounded-md w-3/4" />
                    <div className="h-3 bg-muted rounded-md w-full" />
                    <div className="h-2.5 bg-muted rounded-md w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {isError && !isLoading && (
            <div className="py-12 text-center space-y-3">
              <p className="text-sm font-semibold text-destructive">Không thể tải thông báo</p>
              <p className="text-xs text-muted-foreground">Vui lòng kiểm tra kết nối mạng và thử lại.</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => void refetch()}
                disabled={isFetching}
                className="cursor-pointer"
              >
                <RefreshCwIcon className={cn("size-3.5 mr-1.5", isFetching && "animate-spin")} />
                Thử lại
              </Button>
            </div>
          )}

          {!isLoading && !isError && items.length === 0 && (
            <div className="py-16 text-center space-y-3">
              <div className="mx-auto size-12 rounded-2xl bg-muted/60 flex items-center justify-center text-muted-foreground">
                <BellOffIcon className="size-6" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-foreground">Không có thông báo nào</p>
                <p className="text-xs text-muted-foreground">
                  {unreadOnly ? "Bạn đã đọc hết tất cả thông báo mới." : "Hộp thư thông báo của bạn đang trống."}
                </p>
              </div>
            </div>
          )}

          {!isLoading &&
            !isError &&
            items.map((item) => {
              const visual = getNotificationVisualConfig(item.notificationType);
              const VisualIcon = visual.icon;
              const isUnread = !item.readAt;

              return (
                <div
                  key={item.id}
                  onClick={() => handleNotificationClick(item)}
                  className={cn(
                    "p-3 rounded-2xl transition-all duration-150 cursor-pointer flex gap-3 relative group",
                    isUnread
                      ? "bg-primary/5 hover:bg-primary/10 border border-primary/20"
                      : "hover:bg-muted/60 border border-transparent"
                  )}
                >
                  <div
                    className={cn(
                      "size-9 rounded-xl flex items-center justify-center shrink-0 border border-border/40",
                      visual.iconBgClassName,
                      visual.iconColorClassName
                    )}
                  >
                    <VisualIcon className="size-4.5" />
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-foreground truncate">{item.title}</span>
                      <Badge className={cn("text-[9px] px-1.5 py-0 border shrink-0", visual.badgeClassName)}>
                        {visual.label}
                      </Badge>
                    </div>

                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed break-words">
                      {item.message}
                    </p>

                    <div className="flex items-center justify-between pt-1">
                      <Tooltip>
                        <TooltipTrigger className="text-[10px] text-muted-foreground/80 font-medium">
                          {formatRelativeTime(item.createdAt)}
                        </TooltipTrigger>
                        <TooltipContent side="top">
                          {formatFullDateTime(item.createdAt)}
                        </TooltipContent>
                      </Tooltip>

                      {isUnread && (
                        <span className="size-2 rounded-full bg-primary ring-2 ring-primary/30" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
        </div>

        {totalPages > 1 && (
          <div className="p-3 border-t border-border/80 bg-muted/20 flex items-center justify-between shrink-0">
            <span className="text-xs text-muted-foreground font-medium">
              Trang {page + 1} / {totalPages}
            </span>
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="icon"
                className="size-7 rounded-lg cursor-pointer"
                disabled={page === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
              >
                <ChevronLeftIcon className="size-3.5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="size-7 rounded-lg cursor-pointer"
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              >
                <ChevronRightIcon className="size-3.5" />
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
