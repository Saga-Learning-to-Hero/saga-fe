"use client";

import Link from "next/link";
import { ArrowLeftIcon, BarChart3Icon, GitGraphIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AwaitingServerDataBadge } from "./awaiting-server-data-badge";
import { CourseQueryError } from "./course-query-error";
import { useLecturerCourse, useLecturerCourseAccess } from "../hooks/use-lecturer-courses";
import {
  lecturerCourseDashboardPath,
  lecturerCourseTeamsPath,
  lecturerCoursesPath,
} from "../lib/course-routes";

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
        body: "Backend chưa công bố API chấm điểm và gradebook cho giảng viên. Không hiện nút Lưu, Xuất điểm hay Công bố điểm.",
      },
      {
        title: "Tổng kết lớp",
        body: "Khi có API đánh giá, khu vực này sẽ hiển thị điểm quá trình, Sprint và điểm dự án nhóm theo lớp học phần.",
      },
    ],
  },
  graph: {
    title: "Đồ thị",
    eyebrow: "Theo dõi và đánh giá",
    sections: [
      {
        title: "Traceability & SNA",
        body: "API đồ thị mạng lưới chưa thuộc phạm vi đọc của giảng viên. Không vẽ minh họa bằng mock ID nhóm.",
      },
      {
        title: "Cảnh báo đóng góp",
        body: "Các cảnh báo Ghosting hay MSR sẽ xuất hiện tại đây khi máy chủ cung cấp snapshot đồ thị.",
      },
    ],
  },
};

interface LecturerMonitoringPreviewProps {
  courseId: string;
  kind: MonitoringKind;
}

export function LecturerMonitoringPreview({ courseId, kind }: LecturerMonitoringPreviewProps) {
  const { data: course, isLoading, isError, error, refetch } = useLecturerCourse(courseId);
  const { isAccessDenied } = useLecturerCourseAccess(isError, error);
  const copy = COPY[kind];
  const Icon = kind === "graph" ? GitGraphIcon : BarChart3Icon;

  if (isAccessDenied) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
        Đang chuyển về danh sách lớp...
      </div>
    );
  }

  if (isError) {
    return <CourseQueryError error={error} onRetry={() => void refetch()} />;
  }

  return (
    <div className="mx-auto max-w-[1100px] space-y-6 pb-12">
      <div className="flex items-center gap-3">
        <Link
          href={lecturerCourseDashboardPath(courseId)}
          prefetch={true}
          aria-label="Quay lại tổng quan lớp"
          className={buttonVariants({ variant: "ghost", size: "icon", className: "h-8 w-8 rounded-lg" })}
        >
          <ArrowLeftIcon className="size-4" />
        </Link>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Link href={lecturerCoursesPath()} prefetch={true} className="transition-colors hover:text-foreground">
            Lớp học phần của tôi
          </Link>
          <span>/</span>
          <Link
            href={lecturerCourseDashboardPath(courseId)}
            prefetch={true}
            className="font-mono font-semibold text-foreground"
          >
            {isLoading ? "..." : course?.courseCode}
          </Link>
          <span>/</span>
          <span className="font-semibold text-foreground">{copy.title}</span>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
        <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">{copy.eyebrow}</p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <h1 className="text-xl font-extrabold tracking-tight">{copy.title}</h1>
          <AwaitingServerDataBadge />
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          {course?.subjectName || course?.name} · giao diện xem trước, chưa lấy dữ liệu đánh giá từ máy chủ.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Badge variant="outline" className="font-mono text-xs">
            {course?.courseCode}
          </Badge>
          <Badge variant="secondary" className="font-mono text-xs">
            {course?.classCode || "Chưa có lớp sinh viên niên khóa"}
          </Badge>
        </div>
      </div>

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
          className={buttonVariants({ size: "sm", className: "text-xs" })}
        >
          Về tổng quan lớp
        </Link>
        <Link
          href={lecturerCourseTeamsPath(courseId)}
          prefetch={true}
          className={buttonVariants({ variant: "outline", size: "sm", className: "text-xs" })}
        >
          Dự án nhóm
        </Link>
      </div>
    </div>
  );
}
