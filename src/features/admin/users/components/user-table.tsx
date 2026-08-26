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
}

const PAGE_SIZE = 8;

export function UserTable({ users, onToggleStatus }: UserTableProps) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(users.length / PAGE_SIZE) || 1;
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const paginatedUsers = users.slice(startIndex, startIndex + PAGE_SIZE);

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
            Chờ đăng nhập
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

  if (users.length === 0) {
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
            <TableHead className="py-3 px-4 text-xs font-semibold">Người dùng</TableHead>
            <TableHead className="py-3 px-4 text-xs font-semibold">Mã số sinh viên (MSSV)</TableHead>
            <TableHead className="py-3 px-4 text-xs font-semibold">Khoa / Ngành</TableHead>
            <TableHead className="py-3 px-4 text-xs font-semibold">Vai trò</TableHead>
            <TableHead className="py-3 px-4 text-xs font-semibold">Trạng thái</TableHead>
            <TableHead className="py-3 px-4 text-xs font-semibold">Hoạt động gần nhất</TableHead>
            <TableHead className="py-3 px-4 text-xs font-semibold text-right">Thao tác</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {paginatedUsers.map((user) => {
            const isBanned = user.status === "BANNED";

            return (
              <TableRow
                key={user.id}
                className="hover:bg-muted/30 transition-colors duration-100"
              >
                {/* Avatar + Name + Email */}
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

                {/* Student Code (MSSV) */}
                <TableCell className="py-3 px-4">
                  {user.studentCode ? (
                    <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-md bg-muted text-foreground/90">
                      {user.studentCode}
                    </span>
                  ) : (
                    <span className="text-muted-foreground/60">—</span>
                  )}
                </TableCell>

                {/* Department */}
                <TableCell className="py-3 px-4 text-muted-foreground font-medium">
                  {user.department || "—"}
                </TableCell>

                {/* Role Badge */}
                <TableCell className="py-3 px-4">
                  {user.role === "LECTURER" ? (
                    <Badge className="bg-warning-muted text-warning border-0 font-semibold px-2 py-0.5 text-[11px]">
                      Giảng viên
                    </Badge>
                  ) : (
                    <Badge className="bg-info-muted text-info border-0 font-semibold px-2 py-0.5 text-[11px]">
                      Sinh viên
                    </Badge>
                  )}
                </TableCell>

                {/* Status Badge */}
                <TableCell className="py-3 px-4">{renderStatusBadge(user)}</TableCell>

                {/* Last Active */}
                <TableCell className="py-3 px-4 text-muted-foreground">
                  {formatDate(user.lastActiveAt)}
                </TableCell>

                {/* Action Button */}
                <TableCell className="py-3 px-4 text-right">
                  <Button
                    variant={isBanned ? "default" : "outline"}
                    size="sm"
                    onClick={() => onToggleStatus(user)}
                    className={`h-8 px-3 text-xs font-semibold rounded-lg cursor-pointer transition-colors ${isBanned
                        ? "bg-primary text-primary-foreground hover:bg-primary/90"
                        : "border-destructive/40 text-destructive hover:bg-destructive/10 hover:border-destructive"
                      }`}
                  >
                    {isBanned ? (
                      <>
                        <UnlockIcon className="w-3.5 h-3.5 mr-1" />
                        Mở khóa
                      </>
                    ) : (
                      <>
                        <LockIcon className="w-3.5 h-3.5 mr-1" />
                        Khóa
                      </>
                    )}
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {/* Pagination Footer */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/20 text-xs text-muted-foreground">
        <span>
          Trang <strong className="text-foreground">{currentPage}</strong> / {totalPages} (Tổng {users.length} người dùng)
        </span>
        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="icon"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="h-8 w-8 rounded-lg"
          >
            <ChevronLeftIcon className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="h-8 w-8 rounded-lg"
          >
            <ChevronRightIcon className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
