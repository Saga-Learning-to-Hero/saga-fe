"use client";

import {
  CalendarIcon,
  GraduationCapIcon,
  MailIcon,
  RefreshCwIcon,
  ShieldCheckIcon,
  UserCheckIcon,
  UserIcon,
  UserXIcon,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  useAdminUserDetail,
  useUpdateAdminUserStatus,
} from "../hooks/use-admin-users";

interface UserDetailDialogProps {
  userId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function UserDetailDialog({
  userId,
  isOpen,
  onClose,
}: UserDetailDialogProps) {
  const { data: userDetail, isLoading, isError, error, refetch } =
    useAdminUserDetail(userId || "", {
      enabled: isOpen && Boolean(userId),
    });

  const updateStatusMutation = useUpdateAdminUserStatus();
  const isUpdating = updateStatusMutation.isPending;

  if (!isOpen) return null;

  const handleToggleStatus = () => {
    if (!userDetail) return;
    const nextStatus = isInactive ? "ACTIVE" : "INACTIVE";
    updateStatusMutation.mutate({
      userId: userDetail.id,
      status: nextStatus,
    });
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return "Chưa có";
    try {
      return new Intl.DateTimeFormat("vi-VN", {
        dateStyle: "full",
        timeStyle: "medium",
      }).format(new Date(isoString));
    } catch {
      return isoString;
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .slice(-2)
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const isInactive = userDetail?.accountStatus?.toUpperCase() === "INACTIVE";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg p-0 rounded-3xl overflow-hidden border border-border shadow-2xl flex flex-col max-h-[90vh] gap-0">
        {/* 1. Dialog Header */}
        <DialogHeader className="p-6 pb-4 border-b border-border/60 bg-muted/20 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className="border-primary/30 bg-primary/10 text-primary text-[10px] font-mono font-bold"
              >
                Chi tiết tài khoản
              </Badge>
              {userDetail && (
                <Badge
                  className={`text-[10px] font-bold ${isInactive
                      ? "bg-muted text-muted-foreground border border-border"
                      : "bg-success-muted text-success border border-success/30"
                    }`}
                >
                  {isInactive ? "Không hoạt động" : "Đang hoạt động"}
                </Badge>
              )}
            </div>
          </div>
          <DialogTitle className="text-base font-bold text-foreground mt-2">
            Hồ sơ & Trạng thái người dùng
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Thông tin chi tiết tài khoản được đồng bộ từ cơ sở dữ liệu định danh máy chủ SAGA.
          </DialogDescription>
        </DialogHeader>

        {/* 2. Dialog Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1 min-h-0">
          {isLoading ? (
            <div className="space-y-4 animate-pulse">
              <div className="flex items-center gap-3.5">
                <div className="size-14 rounded-2xl bg-muted/60" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 w-40 rounded bg-muted/60" />
                  <div className="h-3 w-56 rounded bg-muted/40" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-16 rounded-xl bg-muted/30 border border-border/50" />
                ))}
              </div>
            </div>
          ) : isError ? (
            <div className="p-6 text-center space-y-3 rounded-2xl border border-destructive/30 bg-destructive/5">
              <p className="text-sm font-semibold text-destructive">
                {(error as Error)?.message || "Không thể tải chi tiết người dùng."}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                className="text-xs cursor-pointer"
              >
                Thử lại
              </Button>
            </div>
          ) : userDetail ? (
            <>
              {/* Profile Card Header */}
              <div className="flex items-center gap-4 p-4 rounded-2xl border border-border/70 bg-card shadow-2xs">
                <Avatar className="size-14 rounded-2xl border border-border shadow-xs shrink-0">
                  <AvatarImage src={userDetail.avatarUrl || undefined} alt={userDetail.fullName} />
                  <AvatarFallback className="text-sm font-bold bg-primary text-primary-foreground rounded-2xl">
                    {getInitials(userDetail.fullName)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-extrabold text-foreground truncate">
                      {userDetail.fullName || userDetail.username || "Chưa đặt tên"}
                    </h3>
                    <Badge
                      className={`text-[10px] font-semibold shrink-0 ${userDetail.role === "LECTURER"
                          ? "bg-primary/10 text-primary border-primary/20"
                          : "bg-muted text-muted-foreground border-border"
                        }`}
                    >
                      {userDetail.role === "LECTURER" ? "Giảng viên" : "Sinh viên"}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground truncate mt-0.5 flex items-center gap-1.5">
                    <MailIcon className="size-3 shrink-0" />
                    <span>{userDetail.email}</span>
                  </p>
                </div>
              </div>

              {/* Grid Thông Tin Chi Tiết */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {/* Tên đăng nhập Username */}
                <div className="p-3 rounded-xl border border-border/60 bg-muted/20 space-y-1">
                  <span className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5">
                    <UserIcon className="size-3.5" />
                    Tên đăng nhập (Username):
                  </span>
                  <p className="font-mono text-xs font-semibold text-foreground">
                    {userDetail.username || "—"}
                  </p>
                </div>

                {/* Mã Sinh viên hoặc Hồ sơ Giảng viên */}
                <div className="p-3 rounded-xl border border-border/60 bg-muted/20 space-y-1">
                  <span className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5">
                    <GraduationCapIcon className="size-3.5" />
                    {userDetail.role === "LECTURER" ? "Hồ sơ Giảng viên:" : "Mã số sinh viên (MSSV):"}
                  </span>
                  <p className="font-mono text-xs font-semibold text-primary">
                    {userDetail.role === "LECTURER"
                      ? userDetail.lecturerProfileId || "Chưa liên kết profile"
                      : userDetail.studentCode || "Chưa cấp MSSV"}
                  </p>
                </div>

                {/* Trạng thái tài khoản */}
                <div className="p-3 rounded-xl border border-border/60 bg-muted/20 space-y-1">
                  <span className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5">
                    {isInactive ? <UserXIcon className="size-3.5" /> : <ShieldCheckIcon className="size-3.5" />}
                    Trạng thái hệ thống:
                  </span>
                  <p className="font-semibold text-foreground">
                    {userDetail.accountStatus}
                  </p>
                </div>

                {/* Ngày tạo tài khoản */}
                <div className="p-3 rounded-xl border border-border/60 bg-muted/20 space-y-1">
                  <span className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5">
                    <CalendarIcon className="size-3.5" />
                    Ngày tạo tài khoản:
                  </span>
                  <p className="text-foreground">
                    {formatDate(userDetail.createdAt)}
                  </p>
                </div>
              </div>
            </>
          ) : null}
        </div>

        {/* 3. Dialog Footer */}
        <DialogFooter className="m-0 shrink-0 px-6 py-4 border-t border-border/60 bg-muted/20 flex flex-row items-center justify-between gap-3 rounded-none">
          <div>
            {userDetail && (
              <Button
                variant={isInactive ? "default" : "outline"}
                size="sm"
                disabled={isUpdating}
                onClick={handleToggleStatus}
                className="text-xs rounded-xl cursor-pointer"
              >
                {isUpdating ? (
                  <>
                    <RefreshCwIcon className="size-3.5 mr-1 animate-spin" />
                    Đang xử lý...
                  </>
                ) : isInactive ? (
                  <>
                    <UserCheckIcon className="size-3.5 mr-1" />
                    Kích hoạt tài khoản
                  </>
                ) : (
                  <>
                    <UserXIcon className="size-3.5 mr-1" />
                    Tạm ngưng tài khoản
                  </>
                )}
              </Button>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            disabled={isUpdating}
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
