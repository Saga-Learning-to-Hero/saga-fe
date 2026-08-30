"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  PlusIcon,
  EditIcon,
  Trash2Icon,
  SearchIcon,
  UsersIcon,
  MoreHorizontalIcon,
  GraduationCapIcon,
} from "lucide-react";
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
import { CourseDialog } from "./course-dialog";
import { ConfirmDeleteDialog } from "@/components/common/confirm-delete-dialog";
import type { Course, Subject, Semester, CourseStatus, AdminClass } from "../types/academic-management";

interface CourseManagementProps {
  courses: Course[];
  subjects: Subject[];
  semesters: Semester[];
  adminClasses: AdminClass[];
  onAddCourse: (cls: Omit<Course, "id" | "studentsCount" | "groupsCount" | "createdAt">) => void;
  onEditCourse: (id: string, cls: Partial<Course>) => void;
  onDeleteCourse: (id: string) => void;
}

export function CourseManagement({
  courses,
  subjects,
  semesters,
  adminClasses,
  onAddCourse,
  onEditCourse,
  onDeleteCourse,
}: CourseManagementProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");

  // Modal Form
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  // Modal Xóa
  const [deletingCourse, setDeletingCourse] = useState<Course | null>(null);

  const filteredCourses = courses.filter(
    (c) =>
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.subjectName.toLowerCase().includes(search.toLowerCase()) ||
      c.lecturer.fullName.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenAdd = () => {
    setEditingCourse(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (crs: Course) => {
    setEditingCourse(crs);
    setIsFormOpen(true);
  };

  const handleFormSubmit = (data: {
    code: string;
    name: string;
    subjectCode: string;
    subjectName: string;
    semesterCode: string;
    semesterName: string;
    status: CourseStatus;
    lecturer: { id: string; fullName: string; email: string };
  }) => {
    if (editingCourse) {
      onEditCourse(editingCourse.id, data);
    } else {
      onAddCourse(data);
    }
  };

  const handleConfirmDelete = () => {
    if (deletingCourse) {
      onDeleteCourse(deletingCourse.id);
      setDeletingCourse(null);
    }
  };

  const renderStatusBadge = (status: CourseStatus) => {
    switch (status) {
      case "IN_PROGRESS":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-success-muted text-success whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
            Đang học / Làm đồ án
          </span>
        );
      case "UPCOMING":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-info-muted text-info whitespace-nowrap">
            Sắp diễn ra
          </span>
        );
      case "COMPLETED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-muted text-muted-foreground whitespace-nowrap border border-border">
            Đã hoàn thành
          </span>
        );
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
            placeholder="Tìm theo mã khóa học (SWP490_FA26), giảng viên..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-xs"
          />
        </div>
        <Button onClick={handleOpenAdd} size="sm" className="h-9 gap-1.5 text-xs font-semibold cursor-pointer">
          <PlusIcon className="w-4 h-4" />
          Mở Khóa học / Học phần mới
        </Button>
      </div>

      {/* Table */}
      <Card className="rounded-2xl border border-border overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <Table className="w-full text-left text-xs border-collapse">
            <TableHeader className="bg-muted/40 border-b border-border">
              <TableRow>
                <TableHead className="py-3 px-4 text-xs font-semibold whitespace-nowrap w-[130px]">Mã khóa học</TableHead>
                <TableHead className="py-3 px-4 text-xs font-semibold min-w-[260px]">Khóa học / Học phần</TableHead>
                <TableHead className="py-3 px-4 text-xs font-semibold whitespace-nowrap w-[120px]">Học kỳ</TableHead>
                <TableHead className="py-3 px-4 text-xs font-semibold whitespace-nowrap min-w-[220px]">Giảng viên phụ trách</TableHead>
                <TableHead className="py-3 px-4 text-xs font-semibold whitespace-nowrap w-[180px]">Sĩ số sinh viên</TableHead>
                <TableHead className="py-3 px-4 text-xs font-semibold whitespace-nowrap text-center w-[160px]">Trạng thái</TableHead>
                <TableHead className="py-3 px-4 text-xs font-semibold whitespace-nowrap text-right w-[80px]">Thao tác</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-border/60">
              {filteredCourses.map((crs) => (
                <TableRow key={crs.id} className="hover:bg-muted/30 transition-colors">
                  {/* Course Code */}
                  <TableCell className="py-3 px-4 whitespace-nowrap font-mono font-bold text-foreground">
                    <Badge variant="outline" className="font-mono text-xs font-bold text-primary border-primary/30">
                      {crs.code}
                    </Badge>
                  </TableCell>

                  {/* Course Name & Subject */}
                  <TableCell className="py-3 px-4">
                    <div className="flex flex-col">
                      <span className="font-semibold text-foreground text-xs">{crs.name}</span>
                      <span className="text-[11px] font-mono text-muted-foreground">{crs.subjectName}</span>
                    </div>
                  </TableCell>

                  {/* Semester */}
                  <TableCell className="py-3 px-4 whitespace-nowrap font-medium text-foreground">
                    <Badge variant="secondary" className="text-[11px]">
                      {crs.semesterName}
                    </Badge>
                  </TableCell>

                  {/* Lecturer */}
                  <TableCell className="py-3 px-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="font-semibold text-foreground text-xs">{crs.lecturer.fullName}</span>
                      <span className="text-[11px] text-muted-foreground">{crs.lecturer.email}</span>
                    </div>
                  </TableCell>

                  {/* Stats */}
                  <TableCell className="py-3 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-1.5 text-xs">
                      <UsersIcon className="w-3.5 h-3.5 text-muted-foreground" />
                      <strong className="text-foreground">{crs.studentsCount}</strong> sinh viên ·{" "}
                      <strong className="text-foreground">{crs.groupsCount}</strong> nhóm
                    </div>
                  </TableCell>

                  {/* Status */}
                  <TableCell className="py-3 px-4 whitespace-nowrap text-center">
                    {renderStatusBadge(crs.status)}
                  </TableCell>

                  {/* Actions Dropdown Menu */}
                  <TableCell className="py-3 px-4 text-right whitespace-nowrap">
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors cursor-pointer outline-none"
                        title="Tùy chọn thao tác"
                      >
                        <MoreHorizontalIcon className="w-4 h-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 p-1">
                        <DropdownMenuItem
                          onClick={() => router.push(`/admin/academic/courses/${crs.id}`)}
                          className="flex items-center gap-2 px-2.5 py-1.5 text-xs font-medium cursor-pointer"
                        >
                          <GraduationCapIcon className="w-3.5 h-3.5 text-primary" />
                          <span>Xem DS Sinh viên</span>
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          onClick={() => handleOpenEdit(crs)}
                          className="flex items-center gap-2 px-2.5 py-1.5 text-xs font-medium cursor-pointer"
                        >
                          <EditIcon className="w-3.5 h-3.5 text-muted-foreground" />
                          <span>Chỉnh sửa khóa học</span>
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => setDeletingCourse(crs)}
                          className="flex items-center gap-2 px-2.5 py-1.5 text-xs font-medium text-destructive cursor-pointer"
                        >
                          <Trash2Icon className="w-3.5 h-3.5" />
                          <span>Xóa khóa học</span>
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

      {/* Modal Thêm / Sửa Khóa học tách riêng */}
      <CourseDialog
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        editingCourse={editingCourse}
        subjects={subjects}
        semesters={semesters}
        adminClasses={adminClasses}
      />

      {/* Modal Xác nhận Xóa tái sử dụng */}
      <ConfirmDeleteDialog
        isOpen={!!deletingCourse}
        onClose={() => setDeletingCourse(null)}
        onConfirm={handleConfirmDelete}
        itemType="khóa học"
        itemName={deletingCourse?.name}
      />
    </div>
  );
}
