"use client";

import { useState, useMemo, useEffect } from "react";
import { AlertCircleIcon, RefreshCwIcon, UserCogIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserStats } from "@/features/admin/users/components/user-stats";
import { UserToolbar } from "@/features/admin/users/components/user-toolbar";
import { UserTable } from "@/features/admin/users/components/user-table";
import { UserStatusDialog } from "@/features/admin/users/components/user-status-dialog";
import { UserDetailDialog } from "@/features/admin/users/components/user-detail-dialog";
import {
  useAdminUsers,
  useUpdateAdminUserStatus,
} from "@/features/admin/users/hooks/use-admin-users";
import {
  mapAdminUserResponseToManagedUser,
  type ManagedRole,
  type ManagedUser,
  type UserAccountStatus,
} from "@/features/admin/users/types/user-management";

const PAGE_SIZE = 10;

export default function AdminUsersPage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"ALL" | ManagedRole>("ALL");
  const [statusFilter, setStatusFilter] = useState<"ALL" | UserAccountStatus>("ALL");
  const [page, setPage] = useState(1);

  const [selectedUser, setSelectedUser] = useState<ManagedUser | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [detailUserId, setDetailUserId] = useState<string | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const handleOpenDetailDialog = (user: ManagedUser) => {
    setDetailUserId(user.id);
    setIsDetailOpen(true);
  };

  // Debounce search input 350ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  // Reset về page 1 khi đổi bộ lọc
  const handleRoleChange = (role: "ALL" | ManagedRole) => {
    setRoleFilter(role);
    setPage(1);
  };

  const handleStatusChange = (status: "ALL" | UserAccountStatus) => {
    setStatusFilter(status);
    setPage(1);
  };

  // Query API thật
  const queryParams = useMemo(() => {
    return {
      q: debouncedSearch || undefined,
      role: roleFilter === "ALL" ? undefined : roleFilter,
      status: statusFilter === "ALL" ? undefined : statusFilter,
      page: page - 1, // Spring Boot 0-indexed
      size: PAGE_SIZE,
    };
  }, [debouncedSearch, roleFilter, statusFilter, page]);

  const { data, isLoading, isError, error, refetch, isFetching } =
    useAdminUsers(queryParams);

  const updateStatusMutation = useUpdateAdminUserStatus();

  const users: ManagedUser[] = useMemo(() => {
    if (!data?.items) return [];
    return data.items.map(mapAdminUserResponseToManagedUser);
  }, [data]);

  const totalUsers = data?.total ?? 0;

  const handleOpenStatusDialog = (user: ManagedUser) => {
    setSelectedUser(user);
    setIsDialogOpen(true);
  };

  const handleConfirmStatusChange = (
    userId: string,
    newStatus: "ACTIVE" | "INACTIVE"
  ) => {
    updateStatusMutation.mutate(
      { userId, status: newStatus },
      {
        onSuccess: () => {
          setIsDialogOpen(false);
          setSelectedUser(null);
        },
      }
    );
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in-0 duration-200">
      {/* 1. Header trang */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0 shadow-2xs">
            <UserCogIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-bold text-foreground tracking-tight">
                Quản lý Tài khoản (Giảng viên & Sinh viên)
              </h1>
              <Badge
                variant="outline"
                className="border-primary/30 bg-primary/10 text-primary text-[10px] font-mono font-bold"
              >
                REST API / Hệ thống IAM
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Quản trị danh sách tài khoản Giảng viên & Sinh viên chuyên ngành Kỹ thuật phần mềm (SE) và kiểm soát trạng thái truy cập.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading || isFetching}
            className="h-8.5 px-3 text-xs font-semibold rounded-xl gap-1.5 cursor-pointer shadow-2xs"
          >
            <RefreshCwIcon
              className={`w-3.5 h-3.5 ${isFetching ? "animate-spin text-primary" : ""}`}
            />
            <span>Làm mới</span>
          </Button>
        </div>
      </div>

      {/* 2. Trạng thái lỗi nếu có */}
      {isError && (
        <div className="p-6 rounded-2xl border border-dashed border-destructive/40 bg-destructive/5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertCircleIcon className="w-5 h-5 text-destructive shrink-0" />
            <div>
              <p className="text-sm font-bold text-foreground">
                Không thể tải danh sách tài khoản người dùng
              </p>
              <p className="text-xs text-muted-foreground">
                {(error as Error)?.message ||
                  "Đã có lỗi xảy ra trong quá trình kết nối đến máy chủ SAGA."}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="text-xs cursor-pointer shrink-0"
          >
            Thử lại
          </Button>
        </div>
      )}

      {/* 3. Thống kê KPI */}
      <UserStats users={users} totalCount={totalUsers} />

      {/* 4. Toolbar Bộ Lọc & Tìm Kiếm */}
      <UserToolbar
        search={search}
        onSearchChange={setSearch}
        roleFilter={roleFilter}
        onRoleFilterChange={handleRoleChange}
        statusFilter={statusFilter}
        onStatusFilterChange={handleStatusChange}
        totalFiltered={totalUsers}
        totalOriginal={totalUsers}
      />

      {/* 5. Bảng Dữ Liệu Phân Trang Server */}
      <UserTable
        users={users}
        onToggleStatus={handleOpenStatusDialog}
        onViewDetail={handleOpenDetailDialog}
        page={page}
        pageSize={PAGE_SIZE}
        totalItems={totalUsers}
        onPageChange={(newPage) => setPage(newPage)}
        isLoading={isLoading}
      />

      {/* 6. Dialog Xác Nhận Trạng Thái Tài Khoản */}
      <UserStatusDialog
        user={selectedUser}
        isOpen={isDialogOpen}
        onClose={() => {
          if (!updateStatusMutation.isPending) {
            setIsDialogOpen(false);
            setSelectedUser(null);
          }
        }}
        onConfirm={handleConfirmStatusChange}
        isPending={updateStatusMutation.isPending}
      />

      {/* 7. Dialog Xem Chi Tiết Người Dùng (GET /api/admin/users/{userId}) */}
      <UserDetailDialog
        userId={detailUserId}
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setDetailUserId(null);
        }}
      />
    </div>
  );
}
