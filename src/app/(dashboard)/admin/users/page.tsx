"use client";

import { useState, useMemo } from "react";
import { UserCogIcon } from "lucide-react";
import { UserStats } from "@/features/admin/users/components/user-stats";
import { UserToolbar } from "@/features/admin/users/components/user-toolbar";
import { UserTable } from "@/features/admin/users/components/user-table";
import { UserStatusDialog } from "@/features/admin/users/components/user-status-dialog";
import { MOCK_MANAGED_USERS } from "@/features/admin/users/data/mock-users";
import type { ManagedUser, ManagedRole, UserAccountStatus } from "@/features/admin/users/types/user-management";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<ManagedUser[]>(MOCK_MANAGED_USERS);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"ALL" | ManagedRole>("ALL");
  const [statusFilter, setStatusFilter] = useState<"ALL" | UserAccountStatus>("ALL");

  // Dialog State
  const [selectedUser, setSelectedUser] = useState<ManagedUser | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Filtered list
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchSearch =
        search.trim() === "" ||
        u.fullName.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        (u.studentCode && u.studentCode.toLowerCase().includes(search.toLowerCase())) ||
        (u.department && u.department.toLowerCase().includes(search.toLowerCase()));

      const matchRole = roleFilter === "ALL" || u.role === roleFilter;
      const matchStatus = statusFilter === "ALL" || u.status === statusFilter;

      return matchSearch && matchRole && matchStatus;
    });
  }, [users, search, roleFilter, statusFilter]);

  // Handle Action Trigger
  const handleOpenStatusDialog = (user: ManagedUser) => {
    setSelectedUser(user);
    setIsDialogOpen(true);
  };

  // Handle Confirm Ban/Unban
  const handleConfirmStatusChange = (
    userId: string,
    newStatus: "ACTIVE" | "BANNED",
    reason?: string
  ) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId
          ? {
            ...u,
            status: newStatus,
            banReason: newStatus === "BANNED" ? reason : undefined,
            lastActiveAt: new Date().toISOString(),
          }
          : u
      )
    );
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in-0 duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0 shadow-2xs">
            <UserCogIcon className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground tracking-tight">
              Quản lý Tài khoản (Giảng viên & Sinh viên)
            </h1>
            <p className="text-xs text-muted-foreground">
              Quản trị danh sách tài khoản Giảng viên & Sinh viên chuyên ngành Kỹ thuật phần mềm (SE) và kiểm soát trạng thái truy cập.
            </p>
          </div>
        </div>
      </div>

      <UserStats users={users} />

      {/* ── Search & Filter Toolbar ── */}
      <UserToolbar
        search={search}
        onSearchChange={setSearch}
        roleFilter={roleFilter}
        onRoleFilterChange={setRoleFilter}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        totalFiltered={filteredUsers.length}
        totalOriginal={users.length}
      />

      {/* ── Data Table ── */}
      <UserTable
        users={filteredUsers}
        onToggleStatus={handleOpenStatusDialog}
      />

      {/* ── Status Confirmation Dialog ── */}
      <UserStatusDialog
        user={selectedUser}
        isOpen={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
          setSelectedUser(null);
        }}
        onConfirm={handleConfirmStatusChange}
      />
    </div>
  );
}
