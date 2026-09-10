"use client";

import Link from "next/link";
import { BarChart3Icon, GitGraphIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLecturerCourse } from "../hooks/use-lecturer-courses";
import {
  lecturerCourseDashboardPath,
  lecturerCourseTeamsPath,
  lecturerCoursesPath,
} from "../lib/course-routes";
import { LecturerPageShell } from "./lecturer-page-shell";
import { cn } from "@/lib/utils";

type MonitoringKind = "grades" | "graph";

const COPY: Record<
  MonitoringKind,
  { title: string; eyebrow: string; sections: { title: string; body: string }[] }
> = {
  grades: {
    title: "Bảng điểm",
    eyebrow: "Theo dõi và đánh giá",
    sections: [
      {
        title: "Điểm dự án nhóm",
        body: "Dữ liệu chưa sẵn sàng. Khi có bảng điểm, khu vực này sẽ hiển thị điểm quá trình và điểm dự án nhóm.",
      },
      {
        title: "Tổng kết lớp",
        body: "Khi dữ liệu đánh giá sẵn sàng, khu vực này sẽ hiển thị điểm quá trình, Sprint và điểm dự án nhóm theo lớp học phần.",
      },
    ],
  },
  graph: {
    title: "Đồ thị",
    eyebrow: "Theo dõi và đánh giá",
    sections: [
      {
        title: "Liên kết công việc và commit",
        body: "Dữ liệu chưa sẵn sàng. Đồ thị liên kết công việc và commit sẽ xuất hiện khi máy chủ cung cấp snapshot.",
      },
      {
        title: "Cảnh báo đóng góp",
        body: "Các cảnh báo về đóng góp sẽ xuất hiện tại đây khi máy chủ cung cấp dữ liệu đồ thị.",
      },
    ],
  },
};

interface LecturerMonitoringPreviewProps {
  courseId: string;
  kind: MonitoringKind;
}

export function LecturerMonitoringPreview({ courseId, kind }: LecturerMonitoringPreviewProps) {
  const { data: course, isLoading } = useLecturerCourse(courseId);
  const copy = COPY[kind];
  const Icon = kind === "graph" ? GitGraphIcon : BarChart3Icon;

  return (
    <LecturerPageShell
      breadcrumbItems={[
        { label: "Lớp học phần", href: lecturerCoursesPath() },
        { label: course?.courseCode || "Mã lớp", href: lecturerCourseDashboardPath(courseId) },
        { label: copy.title },
      ]}
      title={copy.title}
      description={`${course?.subjectName || course?.name || copy.eyebrow} · Dữ liệu chưa sẵn sàng.`}
      badges={
        <>
          <Badge variant="outline" className="font-mono text-xs">
            {course?.courseCode}
          </Badge>
          <Badge variant="secondary" className="font-mono text-xs">
            {course?.classCode || "Chưa có lớp sinh viên niên khóa"}
          </Badge>
        </>
      }
      isLoading={!course && isLoading}
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {copy.sections.map((section) => (
          <Card key={section.title} className="rounded-2xl border border-dashed border-border p-5">
            <div className="mb-3 flex items-center gap-2 text-primary">
              <Icon className="size-5" />
              <h2 className="text-sm font-bold text-foreground">{section.title}</h2>
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">{section.body}</p>
          </Card>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <Link
          href={lecturerCourseDashboardPath(courseId)}
          prefetch={true}
          className={cn(buttonVariants({ size: "sm" }), "text-xs")}
        >
          Về tổng quan lớp
        </Link>
        <Link
          href={lecturerCourseTeamsPath(courseId, "teams")}
          prefetch={true}
          className={cn(buttonVariants({ variant: "outline", size: "sm" }), "text-xs")}
        >
          Dự án nhóm
        </Link>
      </div>
    </LecturerPageShell>
  );
}
