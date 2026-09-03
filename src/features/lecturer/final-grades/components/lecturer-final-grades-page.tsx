"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ChevronRightIcon, DownloadIcon, FileSpreadsheetIcon, SaveIcon, SendIcon, SearchIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { GradeSummaryCards } from "./grade-summary-cards";
import { GradebookTable } from "./gradebook-table";
import { GradeGroupCard } from "./grade-group-card";
import type { LecturerCourse } from "../../courses/types/course";
import type { FinalGradebook, StudentFinalGrade } from "../types/final-grades";
import { CustomSelect } from "@/components/common/custom-select";

interface LecturerFinalGradesPageProps {
  course: LecturerCourse;
  gradebook: FinalGradebook;
}

export function LecturerFinalGradesPage({ course, gradebook }: LecturerFinalGradesPageProps) {
  const [viewMode, setViewMode] = useState<"GROUPED" | "ALL">("GROUPED");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const statusLabels = {
    DRAFT: { label: "Bản nháp", cls: "bg-muted text-muted-foreground" },
    READY_TO_PUBLISH: { label: "Chờ công bố", cls: "bg-amber-500/15 text-amber-600" },
    PUBLISHED: { label: "Đã công bố", cls: "bg-emerald-500/15 text-emerald-600" },
    LOCKED: { label: "Đã khóa", cls: "bg-muted text-muted-foreground" },
  };
  const statusConfig = statusLabels[gradebook.status];

  // Group students
  const groupedData = useMemo(() => {
    const groups: Record<string, {
      groupId: string;
      groupName: string;
      students: StudentFinalGrade[];
    }> = {};
    const noGroupStudents: StudentFinalGrade[] = [];

    gradebook.students.forEach(student => {
      // Filter logic here just applies to the students inside the group (or we can filter groups entirely)
      // Usually, it's better to filter the students, and if a group has 0 students after filter, we can hide the group or just show it empty.
      // Let's filter students first
      let matchesSearch = true;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        matchesSearch = Boolean(
          student.fullName.toLowerCase().includes(q) || 
          student.studentCode.toLowerCase().includes(q) || 
          (student.groupName && student.groupName.toLowerCase().includes(q))
        );
      }
      
      let matchesStatus = true;
      if (statusFilter !== "all") {
        matchesStatus = student.status === statusFilter;
      }

      if (!matchesSearch || !matchesStatus) return;

      if (student.groupId) {
        if (!groups[student.groupId]) {
          groups[student.groupId] = {
            groupId: student.groupId,
            groupName: student.groupName || `Nhóm ${student.groupId}`,
            students: []
          };
        }
        groups[student.groupId].students.push(student);
      } else {
        noGroupStudents.push(student);
      }
    });

    return {
      groups: Object.values(groups).sort((a, b) => a.groupName.localeCompare(b.groupName)),
      noGroupStudents
    };
  }, [gradebook.students, searchQuery, statusFilter]);

  // Flat data for table
  const filteredStudents = useMemo(() => {
    return gradebook.students.filter(student => {
      let matchesSearch = true;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        matchesSearch = Boolean(
          student.fullName.toLowerCase().includes(q) || 
          student.studentCode.toLowerCase().includes(q) || 
          (student.groupName && student.groupName.toLowerCase().includes(q))
        );
      }
      
      let matchesStatus = true;
      if (statusFilter !== "all") {
        matchesStatus = student.status === statusFilter;
      }

      return matchesSearch && matchesStatus;
    });
  }, [gradebook.students, searchQuery, statusFilter]);

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="border-b border-border bg-card px-4 py-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {/* Breadcrumbs */}
          <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/lecturer/courses" className="transition-colors hover:text-foreground">
              Khóa học của tôi
            </Link>
            <ChevronRightIcon className="size-4" />
            <Link href={`/lecturer/courses/${course.id}/dashboard`} className="transition-colors hover:text-foreground">
              {course.code}
            </Link>
            <ChevronRightIcon className="size-4" />
            <span className="font-medium text-foreground">Bảng điểm</span>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-2">
              <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Bảng điểm tổng kết</h1>
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold">{course.name}</span>
                  <span className="text-muted-foreground font-mono">({course.code})</span>
                </div>
                <div className="h-4 w-px bg-border" />
                <Badge className={cn("border-0 text-xs shadow-none font-bold", statusConfig.cls)}>
                  {statusConfig.label}
                </Badge>
                <div className="h-4 w-px bg-border" />
                <div className="text-muted-foreground">
                  Cập nhật: {new Date(gradebook.updatedAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })} bởi {gradebook.updatedBy}
                </div>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-3">
              <Button variant="outline" size="sm" className="hidden sm:flex gap-2 bg-background">
                <DownloadIcon className="size-4" />
                Xuất file
              </Button>
              <Button variant="outline" size="sm" className="hidden sm:flex gap-2 bg-background">
                <SaveIcon className="size-4" />
                Lưu nháp
              </Button>
              <Button size="sm" className="gap-2">
                <SendIcon className="size-4" />
                Công bố điểm
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl space-y-8">
          <GradeSummaryCards gradebook={gradebook} />

          {/* Gradebook Section */}
          <div className="space-y-4">
            {/* Header & Tabs */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-bold text-foreground">Danh sách sinh viên</h2>
                <Badge variant="outline" className="font-mono">{gradebook.summary.totalStudents}</Badge>
              </div>
              
              <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "GROUPED" | "ALL")}>
                <TabsList className="bg-muted/50 border border-border/50">
                  <TabsTrigger value="GROUPED" className="text-xs font-semibold data-[state=active]:bg-background">
                    Theo nhóm
                  </TabsTrigger>
                  <TabsTrigger value="ALL" className="text-xs font-semibold data-[state=active]:bg-background">
                    Tất cả sinh viên
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Toolbar (Sticky visually if needed, but here just a standard bar) */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-muted/20 p-4 rounded-xl border border-border/50 sticky top-0 z-20 backdrop-blur-md">
              <div className="relative w-full sm:w-80">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Tìm họ tên, MSSV, tên nhóm..." 
                  className="pl-9 bg-background"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="w-full sm:w-48">
                  <CustomSelect
                    value={statusFilter}
                    onChange={setStatusFilter}
                    options={[
                      { value: "all", label: "Tất cả trạng thái" },
                      { value: "COMPLETE", label: "Hoàn chỉnh" },
                      { value: "INCOMPLETE", label: "Thiếu điểm" },
                      { value: "FAILED", label: "Dưới chuẩn" },
                      { value: "MANUALLY_ADJUSTED", label: "Đã chỉnh sửa" },
                      { value: "LOCKED", label: "Đã khóa" },
                      { value: "NOT_GRADED", label: "Chưa chấm" }
                    ]}
                  />
                </div>
                
                <Button variant="outline" size="icon" className="shrink-0 bg-background" title="Công thức tính điểm">
                  <FileSpreadsheetIcon className="size-4" />
                </Button>
              </div>
            </div>

            {/* Content */}
            {viewMode === "GROUPED" ? (
              <div className="space-y-4">
                {groupedData.groups.map(group => (
                  <GradeGroupCard
                    key={group.groupId}
                    groupId={group.groupId}
                    groupName={group.groupName}
                    students={group.students}
                    components={gradebook.components}
                  />
                ))}
                
                {groupedData.noGroupStudents.length > 0 && (
                  <div className="mt-8">
                    <GradeGroupCard
                      groupId={null}
                      groupName="Chưa có nhóm"
                      students={groupedData.noGroupStudents}
                      components={gradebook.components}
                    />
                  </div>
                )}

                {groupedData.groups.length === 0 && groupedData.noGroupStudents.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground bg-muted/10 rounded-xl border border-dashed">
                    Không tìm thấy sinh viên nào khớp với điều kiện lọc.
                  </div>
                )}
              </div>
            ) : (
              <GradebookTable gradebook={{ ...gradebook, students: filteredStudents }} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
