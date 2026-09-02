"use client";

import { useState } from "react";
import { PlusIcon, EditIcon, Trash2Icon, MoreHorizontalIcon } from "lucide-react";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { SemesterDialog } from "./semester-dialog";
import { ConfirmDeleteDialog } from "@/components/common/confirm-delete-dialog";
import type { Semester, SemesterStatus } from "../types/academic-management";

interface SemesterManagementProps {
  semesters: Semester[];
  onAddSemester: (semester: Omit<Semester, "id" | "totalCourses">) => void;
  onEditSemester: (id: string, semester: Partial<Semester>) => void;
  onDeleteSemester: (id: string) => void;
}

export function SemesterManagement({
  semesters,
  onAddSemester,
  onEditSemester,
  onDeleteSemester,
}: SemesterManagementProps) {
  // Modal Form
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSemester, setEditingSemester] = useState<Semester | null>(null);

  // Modal Xóa
  const [deletingSemester, setDeletingSemester] = useState<Semester | null>(null);

  const handleOpenAdd = () => {
    setEditingSemester(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (sem: Semester) => {
    setEditingSemester(sem);
    setIsFormOpen(true);
  };

  const handleFormSubmit = (data: Omit<Semester, "id" | "totalCourses">) => {
    if (editingSemester) {
      onEditSemester(editingSemester.id, data);
    } else {
      onAddSemester(data);
    }
  };

  const handleConfirmDelete = () => {
    if (deletingSemester) {
      onDeleteSemester(deletingSemester.id);
      setDeletingSemester(null);
    }
  };

  const renderStatusBadge = (status: SemesterStatus) => {
    switch (status) {
      case "ACTIVE":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-success-muted text-success whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
            Đang diễn ra
          </span>
        );
      case "UPCOMING":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-info-muted text-info whitespace-nowrap">
            Sắp diễn ra
          </span>
        );
      case "CLOSED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-muted text-muted-foreground whitespace-nowrap border border-border">
            Đã kết thúc
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          Quản trị các học kỳ đào tạo và mốc thời gian thực hiện đồ án tốt nghiệp Capstone.
        </p>
        <Button onClick={handleOpenAdd} size="sm" className="h-9 gap-1.5 text-xs font-semibold cursor-pointer">
          <PlusIcon className="w-4 h-4" />
          Thêm học kỳ đào tạo
        </Button>
      </div>

      <Card className="rounded-2xl border border-border overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <Table className="w-full text-left text-xs border-collapse">
            <TableHeader className="bg-muted/40 border-b border-border">
              <TableRow>
                <TableHead className="py-3 px-4 text-xs font-semibold whitespace-nowrap w-[110px]">Mã học kỳ (Semester Code)</TableHead>
                <TableHead className="py-3 px-4 text-xs font-semibold min-w-[200px]">Tên học kỳ (Semester Name)</TableHead>
                <TableHead className="py-3 px-4 text-xs font-semibold whitespace-nowrap w-[220px]">Thời gian (Duration)</TableHead>
                <TableHead className="py-3 px-4 text-xs font-semibold whitespace-nowrap w-[160px]">Trạng thái (Status)</TableHead>
                <TableHead className="py-3 px-4 text-xs font-semibold whitespace-nowrap w-[150px]">Lớp mở (Active Sections)</TableHead>
                <TableHead className="py-3 px-4 text-xs font-semibold whitespace-nowrap text-right w-[100px]">Thao tác</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-border/60">
              {semesters.map((sem) => (
                <TableRow key={sem.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="py-3 px-4 whitespace-nowrap font-mono font-bold text-foreground w-[110px]">
                    <Badge variant="outline" className="font-mono text-xs font-bold border-border">
                      {sem.code}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-3 px-4 font-semibold text-foreground text-xs min-w-[200px]">
                    {sem.name}
                  </TableCell>
                  <TableCell className="py-3 px-4 whitespace-nowrap text-muted-foreground font-mono text-xs w-[220px]">
                    {sem.startDate} → {sem.endDate}
                  </TableCell>
                  <TableCell className="py-3 px-4 whitespace-nowrap w-[160px]">
                    {renderStatusBadge(sem.status)}
                  </TableCell>
                  <TableCell className="py-3 px-4 whitespace-nowrap font-semibold text-foreground text-xs w-[150px]">
                    {sem.totalCourses} khóa học
                  </TableCell>
                  <TableCell className="py-3 px-4 text-right whitespace-nowrap w-[80px]">
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors cursor-pointer outline-none"
                        title="Tùy chọn thao tác"
                      >
                        <MoreHorizontalIcon className="w-4 h-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44 p-1">
                        <DropdownMenuItem
                          onClick={() => handleOpenEdit(sem)}
                          className="flex items-center gap-2 px-2.5 py-1.5 text-xs font-medium cursor-pointer"
                        >
                          <EditIcon className="w-3.5 h-3.5 text-muted-foreground" />
                          <span>Chỉnh sửa học kỳ</span>
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => setDeletingSemester(sem)}
                          className="flex items-center gap-2 px-2.5 py-1.5 text-xs font-medium text-destructive cursor-pointer"
                        >
                          <Trash2Icon className="w-3.5 h-3.5" />
                          <span>Xóa học kỳ</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Modal Thêm / Sửa học kỳ tách riêng */}
      <SemesterDialog
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        editingSemester={editingSemester}
      />

      {/* Modal Xác nhận Xóa tái sử dụng */}
      <ConfirmDeleteDialog
        isOpen={!!deletingSemester}
        onClose={() => setDeletingSemester(null)}
        onConfirm={handleConfirmDelete}
        itemType="học kỳ"
        itemName={deletingSemester?.name}
      />
    </div>
  );
}
