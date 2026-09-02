"use client";

import { SearchIcon, XIcon, FilterIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import type { ManagedRole, UserAccountStatus } from "../types/user-management";

interface UserToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  roleFilter: "ALL" | ManagedRole;
  onRoleFilterChange: (value: "ALL" | ManagedRole) => void;
  statusFilter: "ALL" | UserAccountStatus;
  onStatusFilterChange: (value: "ALL" | UserAccountStatus) => void;
  totalFiltered: number;
  totalOriginal: number;
}

export function UserToolbar({
  search,
  onSearchChange,
  roleFilter,
  onRoleFilterChange,
  statusFilter,
  onStatusFilterChange,
  totalFiltered,
  totalOriginal,
}: UserToolbarProps) {
  const isFiltered = search.trim() !== "" || roleFilter !== "ALL" || statusFilter !== "ALL";

  const handleReset = () => {
    onSearchChange("");
    onRoleFilterChange("ALL");
    onStatusFilterChange("ALL");
  };

  return (
    <Card className="rounded-2xl border border-border shadow-xs">
      <CardContent className="p-3.5 space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Search input với shadcn Input */}
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input
              type="text"
              placeholder="Tìm kiếm theo họ tên, email, MSSV..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9 pr-8 h-9.5 text-sm rounded-lg bg-background"
            />
            {search && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onSearchChange("")}
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground hover:text-foreground"
              >
                <XIcon className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 bg-muted/50 border border-border rounded-lg p-1">
              {(
                [
                  { value: "ALL", label: "Tất cả vai trò" },
                  { value: "LECTURER", label: "Giảng viên" },
                  { value: "STUDENT", label: "Sinh viên" },
                ] as const
              ).map((tab) => (
                <Button
                  key={tab.value}
                  variant={roleFilter === tab.value ? "default" : "ghost"}
                  size="sm"
                  onClick={() => onRoleFilterChange(tab.value)}
                  className={`h-7 px-2.5 text-xs font-medium rounded-md ${roleFilter === tab.value
                    ? "shadow-2xs"
                    : "text-muted-foreground hover:text-foreground"
                    }`}
                >
                  {tab.label}
                </Button>
              ))}
            </div>

            {/* Status filter tabs */}
            <div className="flex items-center gap-1 bg-muted/50 border border-border rounded-lg p-1">
              {(
                [
                  { value: "ALL", label: "Tất cả trạng thái" },
                  { value: "ACTIVE", label: "Hoạt động" },
                  { value: "PENDING", label: "Chờ đăng nhập" },
                  { value: "BANNED", label: "Đã khóa" },
                  { value: "INACTIVE", label: "Không hoạt động" },
                ] as const
              ).map((tab) => (
                <Button
                  key={tab.value}
                  variant={statusFilter === tab.value ? "default" : "ghost"}
                  size="sm"
                  onClick={() => onStatusFilterChange(tab.value)}
                  className={`h-7 px-2.5 text-xs font-medium rounded-md ${statusFilter === tab.value
                    ? "shadow-2xs"
                    : "text-muted-foreground hover:text-foreground"
                    }`}
                >
                  {tab.label}
                </Button>
              ))}
            </div>

            {/* Reset filter */}
            {isFiltered && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="h-8 px-2.5 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <XIcon className="w-3.5 h-3.5 mr-1" />
                Đặt lại
              </Button>
            )}
          </div>
        </div>

        {/* Result count indicator */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-border/60">
          <span className="flex items-center gap-1.5">
            <FilterIcon className="w-3.5 h-3.5" />
            Hiển thị <strong className="text-foreground">{totalFiltered}</strong> / {totalOriginal} người dùng
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
