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
import { SubjectDialog } from "./subject-dialog";
import { ConfirmDeleteDialog } from "@/components/common/confirm-delete-dialog";
import type { Subject } from "../types/academic-management";

interface SubjectManagementProps {
  subjects: Subject[];
  onAddSubject: (subject: Omit<Subject, "id" | "totalCourses">) => void;
  onEditSubject: (id: string, subject: Partial<Subject>) => void;
  onDeleteSubject: (id: string) => void;
}

export function SubjectManagement({
  subjects,
  onAddSubject,
  onEditSubject,
  onDeleteSubject,
}: SubjectManagementProps) {
  const [search, setSearch] = useState("");

  // Modal Thêm / Sửa
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

  // Modal Xóa
  const [deletingSubject, setDeletingSubject] = useState<Subject | null>(null);

  const filteredSubjects = subjects.filter(
    (s) =>
      s.code.toLowerCase().includes(search.toLowerCase()) ||
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.department.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenAdd = () => {
    setEditingSubject(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (subject: Subject) => {
    setEditingSubject(subject);
    setIsFormOpen(true);
  };

  const handleFormSubmit = (data: Omit<Subject, "id" | "totalCourses">) => {
    if (editingSubject) {
      onEditSubject(editingSubject.id, data);
    } else {
      onAddSubject(data);
    }
  };

  const handleConfirmDelete = () => {
    if (deletingSubject) {
      onDeleteSubject(deletingSubject.id);
      setDeletingSubject(null);
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
            placeholder="Tìm theo mã môn (SWP490), tên môn..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-xs"
          />
        </div>
        <Button onClick={handleOpenAdd} size="sm" className="h-9 gap-1.5 text-xs font-semibold cursor-pointer">
          <PlusIcon className="w-4 h-4" />
          Thêm môn học mới
        </Button>
      </div>

      {/* Table */}
      <Card className="rounded-2xl border border-border overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <Table className="w-full text-left text-xs border-collapse">
            <TableHeader className="bg-muted/40 border-b border-border">
              <TableRow>
                <TableHead className="py-3 px-4 text-xs font-semibold whitespace-nowrap w-[110px]">Mã môn</TableHead>
                <TableHead className="py-3 px-4 text-xs font-semibold min-w-[280px]">Tên môn học</TableHead>
                <TableHead className="py-3 px-4 text-xs font-semibold whitespace-nowrap w-[100px]">Tín chỉ</TableHead>
                <TableHead className="py-3 px-4 text-xs font-semibold whitespace-nowrap w-[220px]">Bộ môn / Khoa</TableHead>
                <TableHead className="py-3 px-4 text-xs font-semibold whitespace-nowrap w-[140px]">Số khóa học</TableHead>
                <TableHead className="py-3 px-4 text-xs font-semibold whitespace-nowrap text-right w-[100px]">Thao tác</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-border/60">
              {filteredSubjects.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Không tìm thấy môn học nào.
                  </TableCell>
                </TableRow>
              ) : (
                filteredSubjects.map((sub) => (
                  <TableRow key={sub.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="py-3 px-4 whitespace-nowrap font-mono font-bold text-foreground">
                      <Badge variant="outline" className="font-mono text-xs font-bold text-primary border-primary/30">
                        {sub.code}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-3 px-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-foreground text-xs">{sub.name}</span>
                        {sub.description && (
                          <span className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                            {sub.description}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="py-3 px-4 whitespace-nowrap font-semibold text-foreground">
                      {sub.credits} TC
                    </TableCell>
                    <TableCell className="py-3 px-4 whitespace-nowrap text-muted-foreground font-medium">
                      {sub.department}
                    </TableCell>
                    <TableCell className="py-3 px-4 whitespace-nowrap font-semibold text-foreground">
                      {sub.totalCourses} khóa học
                    </TableCell>
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
                            onClick={() => handleOpenEdit(sub)}
                            className="flex items-center gap-2 px-2.5 py-1.5 text-xs font-medium cursor-pointer"
                          >
                            <EditIcon className="w-3.5 h-3.5 text-muted-foreground" />
                            <span>Chỉnh sửa môn học</span>
                          </DropdownMenuItem>

                          <DropdownMenuSeparator />

                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => setDeletingSubject(sub)}
                            className="flex items-center gap-2 px-2.5 py-1.5 text-xs font-medium text-destructive cursor-pointer"
                          >
                            <Trash2Icon className="w-3.5 h-3.5" />
                            <span>Xóa môn học</span>
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

      {/* Modal Thêm / Sửa môn học tách riêng */}
      <SubjectDialog
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        editingSubject={editingSubject}
      />

      {/* Modal Xác nhận Xóa tái sử dụng */}
      <ConfirmDeleteDialog
        isOpen={!!deletingSubject}
        onClose={() => setDeletingSubject(null)}
        onConfirm={handleConfirmDelete}
        itemType="môn học"
        itemName={deletingSubject ? `${deletingSubject.code} - ${deletingSubject.name}` : undefined}
      />
    </div>
  );
}
