"use client";

import { useState } from "react";
import { PlusIcon, EditIcon, Trash2Icon, SearchIcon, MoreHorizontalIcon } from "lucide-react";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { AdminClassDialog } from "./admin-class-dialog";
import { ConfirmDeleteDialog } from "@/components/common/confirm-delete-dialog";
import type { AdminClass } from "../types/academic-management";

interface AdminClassManagementProps {
  adminClasses: AdminClass[];
  onAddClass: (cls: Omit<AdminClass, "id" | "createdAt">) => void;
  onEditClass: (id: string, cls: Partial<AdminClass>) => void;
  onDeleteClass: (id: string) => void;
}

export function AdminClassManagement({
  adminClasses,
  onAddClass,
  onEditClass,
  onDeleteClass,
}: AdminClassManagementProps) {
  const [search, setSearch] = useState("");

  // Modal Form
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<AdminClass | null>(null);

  // Modal Xóa
  const [deletingClass, setDeletingClass] = useState<AdminClass | null>(null);

  const filteredClasses = adminClasses.filter(
    (c) =>
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.department.toLowerCase().includes(search.toLowerCase()) ||
      c.academicYear.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenAdd = () => {
    setEditingClass(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (cls: AdminClass) => {
    setEditingClass(cls);
    setIsFormOpen(true);
  };

  const handleFormSubmit = (data: Omit<AdminClass, "id" | "createdAt">) => {
    if (editingClass) {
      onEditClass(editingClass.id, data);
    } else {
      onAddClass(data);
    }
  };

  const handleConfirmDelete = () => {
    if (deletingClass) {
      onDeleteClass(deletingClass.id);
      setDeletingClass(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Tìm theo mã lớp (SE1701), tên lớp, niên khóa..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-xs"
          />
        </div>
        <Button onClick={handleOpenAdd} size="sm" className="h-9 gap-1.5 text-xs font-semibold cursor-pointer">
          <PlusIcon className="w-4 h-4" />
          Thêm lớp hành chính mới
        </Button>
      </div>

      {/* Table */}
      <Card className="rounded-2xl border border-border overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <Table className="w-full text-left text-xs border-collapse">
            <TableHeader className="bg-muted/40 border-b border-border">
              <TableRow>
                <TableHead className="py-3 px-4 text-xs font-semibold whitespace-nowrap w-[120px]">Mã lớp</TableHead>
                <TableHead className="py-3 px-4 text-xs font-semibold min-w-[280px]">Tên lớp hành chính</TableHead>
                <TableHead className="py-3 px-4 text-xs font-semibold whitespace-nowrap w-[220px]">Chuyên ngành / Khoa</TableHead>
                <TableHead className="py-3 px-4 text-xs font-semibold whitespace-nowrap w-[180px]">Niên khóa</TableHead>
                <TableHead className="py-3 px-4 text-xs font-semibold whitespace-nowrap text-right w-[80px]">Thao tác</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-border/60">
              {filteredClasses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    Không tìm thấy lớp hành chính nào.
                  </TableCell>
                </TableRow>
              ) : (
                filteredClasses.map((cls) => (
                  <TableRow key={cls.id} className="hover:bg-muted/30 transition-colors">
                    {/* Class Code */}
                    <TableCell className="py-3 px-4 whitespace-nowrap font-mono font-bold text-foreground">
                      <Badge variant="outline" className="font-mono text-xs font-bold text-primary border-primary/30">
                        {cls.code}
                      </Badge>
                    </TableCell>

                    {/* Name */}
                    <TableCell className="py-3 px-4 font-semibold text-foreground text-xs">
                      {cls.name}
                    </TableCell>

                    {/* Department */}
                    <TableCell className="py-3 px-4 whitespace-nowrap text-muted-foreground font-medium">
                      {cls.department}
                    </TableCell>

                    {/* Academic Year */}
                    <TableCell className="py-3 px-4 whitespace-nowrap">
                      <Badge variant="secondary" className="text-[11px]">
                        {cls.academicYear}
                      </Badge>
                    </TableCell>

                    {/* Actions Dropdown */}
                    <TableCell className="py-3 px-4 text-right whitespace-nowrap">
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors cursor-pointer outline-none"
                          title="Tùy chọn thao tác"
                        >
                          <MoreHorizontalIcon className="w-4 h-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44 p-1">
                          <DropdownMenuItem
                            onClick={() => handleOpenEdit(cls)}
                            className="flex items-center gap-2 px-2.5 py-1.5 text-xs font-medium cursor-pointer"
                          >
                            <EditIcon className="w-3.5 h-3.5 text-muted-foreground" />
                            <span>Chỉnh sửa lớp</span>
                          </DropdownMenuItem>

                          <DropdownMenuSeparator />

                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => setDeletingClass(cls)}
                            className="flex items-center gap-2 px-2.5 py-1.5 text-xs font-medium text-destructive cursor-pointer"
                          >
                            <Trash2Icon className="w-3.5 h-3.5" />
                            <span>Xóa lớp học</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Modal Thêm / Sửa Lớp hành chính */}
      <AdminClassDialog
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        editingClass={editingClass}
      />

      {/* Modal Xác nhận Xóa */}
      <ConfirmDeleteDialog
        isOpen={!!deletingClass}
        onClose={() => setDeletingClass(null)}
        onConfirm={handleConfirmDelete}
        itemType="lớp hành chính"
        itemName={deletingClass ? `${deletingClass.code} (${deletingClass.name})` : undefined}
      />
    </div>
  );
}
