import Link from "next/link";
import { ArrowLeftIcon, CalendarDaysIcon, MapPinIcon, RefreshCwIcon } from "lucide-react";
import { buttonVariants, Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { LecturerCourse } from "../../courses/types/course";

interface Props {
  course: LecturerCourse;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export function CourseDashboardHeader({ course, onRefresh, isRefreshing }: Props) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <div className="flex items-center gap-3 mb-4">
          <Link
            href="/lecturer/courses"
            aria-label="Quay lại danh sách lớp"
            className={buttonVariants({ variant: "ghost", size: "icon", className: "h-8 w-8 rounded-lg" })}
          >
            <ArrowLeftIcon className="size-4" />
          </Link>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Link href="/lecturer/courses" className="hover:text-foreground transition-colors">
              Lớp học của tôi
            </Link>
            <span>/</span>
            <span className="font-semibold text-foreground">{course.code}</span>
            <span>/</span>
            <span className="font-semibold text-foreground">Tổng quan</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Badge className="border-0 font-mono text-[10px] font-bold tracking-wider bg-primary/10 text-primary">
            {course.code}
          </Badge>
          <h1 className="text-xl font-extrabold tracking-tight sm:text-2xl">{course.name}</h1>
        </div>

        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-primary">
            Học kỳ {course.semesterId}
          </span>
          <span className="flex items-center gap-1.5">
            <CalendarDaysIcon className="size-3.5" />
            {course.schedule}
          </span>
          <span className="flex items-center gap-1.5">
            <MapPinIcon className="size-3.5" />
            {course.room}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Link
          href="/lecturer/courses"
          className={buttonVariants({ variant: "outline", size: "sm", className: "h-9 gap-1.5 text-xs font-semibold rounded-xl" })}
        >
          Đổi lớp
        </Link>
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="h-9 gap-1.5 text-xs font-semibold rounded-xl"
        >
          <RefreshCwIcon className={cn("w-3.5 h-3.5", isRefreshing && "animate-spin")} />
          Làm mới
        </Button>
      </div>
    </div>
  );
}
