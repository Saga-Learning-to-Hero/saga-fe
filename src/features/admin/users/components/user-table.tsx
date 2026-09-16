"use client";

import { useState } from "react";
import {
  LockIcon,
  UnlockIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  InboxIcon,
  ClockIcon,
  UserXIcon,
  EyeIcon,
} from "lucide-react";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ManagedUser } from "../types/user-management";

interface UserTableProps {
  users: ManagedUser[];
  onToggleStatus: (user: ManagedUser) => void;
  onViewDetail?: (user: ManagedUser) => void;
  page?: number;
  pageSize?: number;
  totalItems?: number;
  onPageChange?: (newPage: number) => void;
  isLoading?: boolean;
}

const DEFAULT_PAGE_SIZE = 8;

export function UserTable({
  users,
  onToggleStatus,
  onViewDetail,
  page,
  pageSize = DEFAULT_PAGE_SIZE,
  totalItems,
  onPageChange,
  isLoading = false,
}: UserTableProps) {
  const [localPage, setLocalPage] = useState(1);

  const isServer = Boolean(onPageChange && totalItems !== undefined);
  const currentPage = isServer ? (page ?? 1) : localPage;
  const effectiveTotal = isServer ? (totalItems ?? users.length) : users.length;
  const totalPages = Math.max(1, Math.ceil(effectiveTotal / pageSize));

  const displayUsers = isServer
    ? users
    : users.slice((localPage - 1) * pageSize, localPage * pageSize);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    if (isServer) {
      onPageChange?.(newPage);
    } else {
      setLocalPage(newPage);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .slice(-2)
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const formatDate = (iso?: string) => {
    if (!iso) return "Chưa có";
    try {
      const d = new Date(iso);
      return d.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch {
      return iso;
    }
  };

  const renderStatusBadge = (user: ManagedUser) => {
    switch (user.status) {
      case "ACTIVE":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-success-muted text-success">
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
            Hoạt động
          </span>
        );
      case "PENDING":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-warning-muted text-warning">
            <ClockIcon className="w-3 h-3" />
            Chờ kích hoạt
          </span>
        );
      case "INACTIVE":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-muted text-muted-foreground border border-border">
            <UserXIcon className="w-3 h-3" />
            Không hoạt động
          </span>
        );
      case "BANNED":
        return (
          <div className="flex flex-col items-start gap-0.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-danger-muted text-danger">
              <span className="w-1.5 h-1.5 rounded-full bg-danger" />
              Đã khóa
            </span>
            {user.banReason && (
              <span
                className="text-[10px] text-muted-foreground truncate max-w-[150px]"
                title={user.banReason}
              >
                {user.banReason}
              </span>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <Card className="rounded-2xl border border-border overflow-hidden shadow-xs">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow className="border-b border-border">
              <TableHead className="py-3 px-4 text-xs font-semibold">Người dùng (User)</TableHead>
              <TableHead className="py-3 px-4 text-xs font-semibold">Mã định danh (MSSV / Staff ID)</TableHead>
              <TableHead className="py-3 px-4 text-xs font-semibold">Vai trò (Role)</TableHead>
              <TableHead className="py-3 px-4 text-xs font-semibold">Trạng thái (Status)</TableHead>
              <TableHead className="py-3 px-4 text-xs font-semibold">Hoạt động gần nhất</TableHead>
              <TableHead className="py-3 px-4 text-xs font-semibold text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 6 }).map((_, idx) => (
              <TableRow key={idx} className="animate-pulse">
                <TableCell className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-muted/60" />
                    <div className="space-y-1.5">
                      <div className="w-28 h-3.5 rounded bg-muted/60" />
                      <div className="w-36 h-3 rounded bg-muted/40" />
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-3 px-4"><div className="w-20 h-4 rounded bg-muted/50" /></TableCell>
                <TableCell className="py-3 px-4"><div className="w-16 h-5 rounded-full bg-muted/50" /></TableCell>
                <TableCell className="py-3 px-4"><div className="w-20 h-5 rounded-full bg-muted/50" /></TableCell>
                <TableCell className="py-3 px-4"><div className="w-20 h-4 rounded bg-muted/50" /></TableCell>
                <TableCell className="py-3 px-4 text-right"><div className="w-16 h-7 rounded-lg bg-muted/50 ml-auto" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    );
  }

  if (displayUsers.length === 0) {
    return (
      <Card className="rounded-2xl border border-border shadow-xs">
        <CardContent className="p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mx-auto text-muted-foreground">
            <InboxIcon className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-semibold text-foreground">Không tìm thấy người dùng phù hợp</p>
            <p className="text-xs text-muted-foreground">
              Hãy thử thay đổi từ khóa tìm kiếm hoặc điều chỉnh lại bộ lọc vai trò/trạng thái.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl border border-border overflow-hidden shadow-xs">
      <Table>
        <TableHeader className="bg-muted/40">
          <TableRow className="border-b border-border">
            <TableHead className="py-3 px-4 text-xs font-semibold">Người dùng (User)</TableHead>
            <TableHead className="py-3 px-4 text-xs font-semibold">Mã định danh (MSSV / Staff ID)</TableHead>
            <TableHead className="py-3 px-4 text-xs font-semibold">Vai trò (Role)</TableHead>
            <TableHead className="py-3 px-4 text-xs font-semibold">Trạng thái (Status)</TableHead>
            <TableHead className="py-3 px-4 text-xs font-semibold">Hoạt động gần nhất</TableHead>
            <TableHead className="py-3 px-4 text-xs font-semibold text-right">Thao tác</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {displayUsers.map((user) => {
            const isInactive = user.status === "BANNED" || user.status === "INACTIVE";

            return (
              <TableRow
                key={user.id}
                className="hover:bg-muted/30 transition-colors duration-100"
              >
                <TableCell className="py-3 px-4">
                  <div className="flex items-center gap-3 min-w-[200px]">
                    <Avatar className="w-9 h-9 rounded-xl shrink-0">
                      <AvatarImage src={user.avatar} alt={user.fullName} />
                      <AvatarFallback className="text-xs font-bold bg-primary text-primary-foreground rounded-xl">
                        {getInitials(user.fullName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col min-w-0">
                      <span className="font-semibold text-foreground truncate text-sm">
                        {user.fullName}
                      </span>
                      <span className="text-xs text-muted-foreground truncate">
                        {user.email}
                      </span>
                    </div>
                  </div>
                </TableCell>

                <TableCell className="py-3 px-4 font-mono text-xs">
                  {user.studentCode || user.lecturerCode ? (
                    <Badge variant="outline" className="font-mono text-[11px] font-medium border-border">
                      {user.studentCode || user.lecturerCode}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground text-xs italic">Chưa cấp</span>
                  )}
                </TableCell>

                <TableCell className="py-3 px-4">
                  <Badge
                    className={`text-[11px] font-semibold ${
                      user.role === "LECTURER"
                        ? "bg-primary/10 text-primary border-primary/20"
                        : "bg-muted text-muted-foreground border-border"
                    }`}
                  >
                    {user.role === "LECTURER" ? "Giảng viên" : "Sinh viên"}
                  </Badge>
                </TableCell>

                <TableCell className="py-3 px-4">{renderStatusBadge(user)}</TableCell>

                <TableCell className="py-3 px-4 text-muted-foreground">
                  {formatDate(user.lastActiveAt || user.createdAt)}
                </TableCell>

                <TableCell className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    {onViewDetail && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewDetail(user)}
                        className="h-8 px-2.5 text-xs font-semibold rounded-lg cursor-pointer hover:bg-muted text-muted-foreground hover:text-foreground"
                        title="Xem chi tiết tài khoản"
                      >
                        <EyeIcon className="size-3.5 mr-1" />
                        Chi tiết
                      </Button>
                    )}
                    <Button
                      variant={isInactive ? "default" : "outline"}
                      size="sm"
                      onClick={() => onToggleStatus(user)}
                      className={`h-8 px-3 text-xs font-semibold rounded-lg cursor-pointer transition-colors ${
                        isInactive
                          ? "bg-primary text-primary-foreground hover:bg-primary/90"
                          : "border-destructive/40 text-destructive hover:bg-destructive/10 hover:border-destructive"
                      }`}
                    >
                      {isInactive ? (
                        <>
                          <UnlockIcon className="w-3.5 h-3.5 mr-1" />
                          Kích hoạt
                        </>
                      ) : (
                        <>
                          <LockIcon className="w-3.5 h-3.5 mr-1" />
                          Tạm ngưng
                        </>
                      )}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/20 text-xs text-muted-foreground">
        <span>
          Trang <strong className="text-foreground">{currentPage}</strong> / {totalPages} (Tổng {effectiveTotal} người dùng)
        </span>
        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="icon"
            disabled={currentPage === 1}
            onClick={() => handlePageChange(currentPage - 1)}
            className="h-8 w-8 rounded-lg cursor-pointer"
          >
            <ChevronLeftIcon className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            disabled={currentPage === totalPages}
            onClick={() => handlePageChange(currentPage + 1)}
            className="h-8 w-8 rounded-lg cursor-pointer"
          >
            <ChevronRightIcon className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
