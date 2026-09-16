"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  BellIcon,
  BellOffIcon,
  CheckCheckIcon,
  ExternalLinkIcon,
  RefreshCwIcon,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  useNotifications,
  useUnreadNotificationCount,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
} from "../hooks/use-notifications";
import {
  formatFullDateTime,
  formatRelativeTime,
  getNotificationVisualConfig,
  isValidInternalActionUrl,
} from "../lib/notification-utils";
import { NotificationCenterSheet } from "./notification-center-sheet";
import { cn } from "@/lib/utils";

interface NotificationBellProps {
  className?: string;
}

export function NotificationBell({ className }: NotificationBellProps) {
  const router = useRouter();
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);

  const { data: unreadData } = useUnreadNotificationCount();
  const unreadCount = unreadData?.unreadCount ?? 0;

  const {
    data: previewData,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useNotifications({ page: 0, size: 5 });

  const { mutate: markRead } = useMarkNotificationRead();
  const { mutate: markAllRead, isPending: isMarkingAll } = useMarkAllNotificationsRead();

  const previewItems = previewData?.items || [];

  const handleNotificationClick = (item: { id: string; actionUrl: string | null; readAt: string | null }) => {
    if (!item.readAt) {
      markRead(item.id);
    }
    setPopoverOpen(false);
    if (isValidInternalActionUrl(item.actionUrl)) {
      router.push(item.actionUrl as string);
    }
  };

  const handleOpenSheet = () => {
    setPopoverOpen(false);
    setSheetOpen(true);
  };

  return (
    <>
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger
          className={cn(
            "relative flex items-center justify-center size-8.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors cursor-pointer border border-transparent hover:border-border outline-none",
            popoverOpen && "bg-muted/80 border-border text-foreground",
            className
          )}
          aria-label="Thông báo"
        >
          <BellIcon className="size-4.5" />
          {unreadCount > 0 && (
            <span
              className={cn(
                "absolute -top-1 -right-1 flex items-center justify-center min-w-4.5 h-4.5 px-1 rounded-full text-[10px] font-extrabold bg-primary text-primary-foreground shadow-xs animate-in zoom-in-50",
                unreadCount > 99 && "text-[9px] px-1"
              )}
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </PopoverTrigger>

        <PopoverContent
          align="end"
          sideOffset={8}
          className="w-80 sm:w-96 p-0 rounded-2xl shadow-xl border-border bg-card overflow-hidden"
        >
          <div className="p-3.5 border-b border-border/80 bg-muted/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-foreground">Thông báo</span>
              {unreadCount > 0 && (
                <Badge className="bg-primary/15 text-primary border-primary/30 text-[10px] px-1.5 py-0 font-bold">
                  {unreadCount} mới
                </Badge>
              )}
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-muted-foreground hover:text-foreground cursor-pointer px-2"
              disabled={isMarkingAll || unreadCount === 0}
              onClick={() => markAllRead()}
            >
              <CheckCheckIcon className="size-3.5 mr-1 text-primary" />
              Đọc tất cả
            </Button>
          </div>

          <div className="max-h-[380px] overflow-y-auto divide-y divide-border/40 p-1">
            {isLoading && (
              <div className="p-3 space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-2.5 p-2 rounded-xl bg-muted/40 animate-pulse">
                    <div className="size-8 rounded-lg bg-muted shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3 bg-muted rounded-md w-2/3" />
                      <div className="h-2.5 bg-muted rounded-md w-full" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {isError && !isLoading && (
              <div className="py-8 text-center space-y-2">
                <p className="text-xs font-semibold text-destructive">Không thể tải thông báo</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => void refetch()}
                  disabled={isFetching}
                  className="h-7 text-xs cursor-pointer"
                >
                  <RefreshCwIcon className={cn("size-3 mr-1", isFetching && "animate-spin")} />
                  Thử lại
                </Button>
              </div>
            )}

            {!isLoading && !isError && previewItems.length === 0 && (
              <div className="py-10 text-center space-y-2">
                <div className="mx-auto size-10 rounded-xl bg-muted/60 flex items-center justify-center text-muted-foreground">
                  <BellOffIcon className="size-5" />
                </div>
                <p className="text-xs font-bold text-foreground">Không có thông báo nào</p>
                <p className="text-[11px] text-muted-foreground">Bạn đã cập nhật mọi thông tin mới nhất.</p>
              </div>
            )}

            {!isLoading &&
              !isError &&
              previewItems.map((item) => {
                const visual = getNotificationVisualConfig(item.notificationType);
                const VisualIcon = visual.icon;
                const isUnread = !item.readAt;

                return (
                  <div
                    key={item.id}
                    onClick={() => handleNotificationClick(item)}
                    className={cn(
                      "p-2.5 rounded-xl transition-all duration-150 cursor-pointer flex gap-2.5 relative group",
                      isUnread
                        ? "bg-primary/5 hover:bg-primary/10 border border-primary/20"
                        : "hover:bg-muted/60 border border-transparent"
                    )}
                  >
                    <div
                      className={cn(
                        "size-8 rounded-lg flex items-center justify-center shrink-0 border border-border/40",
                        visual.iconBgClassName,
                        visual.iconColorClassName
                      )}
                    >
                      <VisualIcon className="size-4" />
                    </div>

                    <div className="flex-1 min-w-0 space-y-0.5">
                      <div className="flex items-center justify-between gap-1.5">
                        <span className="text-xs font-bold text-foreground truncate">{item.title}</span>
                        <Badge className={cn("text-[8px] px-1 py-0 border shrink-0", visual.badgeClassName)}>
                          {visual.label}
                        </Badge>
                      </div>

                      <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed break-words">
                        {item.message}
                      </p>

                      <div className="flex items-center justify-between pt-0.5">
                        <Tooltip>
                          <TooltipTrigger className="text-[10px] text-muted-foreground/80 font-medium">
                            {formatRelativeTime(item.createdAt)}
                          </TooltipTrigger>
                          <TooltipContent side="top">
                            {formatFullDateTime(item.createdAt)}
                          </TooltipContent>
                        </Tooltip>

                        {isUnread && (
                          <span className="size-1.5 rounded-full bg-primary ring-2 ring-primary/30" />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>

          <div className="p-2 border-t border-border/80 bg-muted/20">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleOpenSheet}
              className="w-full text-xs font-semibold justify-center h-8 hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer"
            >
              Xem tất cả thông báo
              <ExternalLinkIcon className="size-3.5 ml-1" />
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      <NotificationCenterSheet open={sheetOpen} onOpenChange={setSheetOpen} />
    </>
  );
}
