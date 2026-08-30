"use client";

import Link from "next/link";
import { ChevronRightIcon, DownloadIcon, FileSpreadsheetIcon, FilterIcon, SaveIcon, SendIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { GradeSummaryCards } from "./grade-summary-cards";
import { GradebookTable } from "./gradebook-table";
import type { LecturerCourse } from "../../courses/types/course";
import type { FinalGradebook } from "../types/final-grades";

interface LecturerFinalGradesPageProps {
  course: LecturerCourse;
  gradebook: FinalGradebook;
}

export function LecturerFinalGradesPage({ course, gradebook }: LecturerFinalGradesPageProps) {

  // Example status mapping for header
  const statusLabels = {
    DRAFT: { label: "Bản nháp", cls: "bg-muted text-muted-foreground" },
    READY_TO_PUBLISH: { label: "Chờ công bố", cls: "bg-amber-500/15 text-amber-600" },
    PUBLISHED: { label: "Đã công bố", cls: "bg-emerald-500/15 text-emerald-600" },
    LOCKED: { label: "Đã khóa", cls: "bg-muted text-muted-foreground" },
  };
  const statusConfig = statusLabels[gradebook.status];

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
            {/* Toolbar */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-bold text-foreground">Bảng điểm sinh viên</h2>
                <Badge variant="outline" className="font-mono">{gradebook.summary.totalStudents}</Badge>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm" className="gap-2">
                  <FilterIcon className="size-4" />
                  Bộ lọc
                </Button>
                <Button variant="outline" size="sm" className="gap-2">
                  <FileSpreadsheetIcon className="size-4" />
                  Công thức
                </Button>
              </div>
            </div>

            <GradebookTable gradebook={gradebook} />
          </div>

        </div>
      </div>
    </div>
  );
}
