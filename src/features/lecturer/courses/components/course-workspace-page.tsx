"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeftIcon } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CourseRoster } from "./course-roster";
import { TeamList } from "@/features/lecturer/teams/components/team-list";
import { useLecturerCourse } from "../hooks/use-lecturer-courses";
import { lecturerCoursesPath } from "../lib/course-routes";
import { getApiErrorCode, getApiErrorMessage } from "@/lib/api-error";

interface CourseWorkspacePageProps {
  courseId: string;
  initialTab?: "roster" | "teams";
}

export function CourseWorkspacePage({
  courseId,
  initialTab = "roster",
}: CourseWorkspacePageProps) {
  const router = useRouter();
  const { data: course, isLoading, isError, error } = useLecturerCourse(courseId);
  const errorCode = getApiErrorCode(error);

  useEffect(() => {
    if (!isError) return;

    if (errorCode === "LECTURER_COURSE_FORBIDDEN") {
      toast.error("Bạn không có quyền truy cập lớp học phần này.");
      router.replace(lecturerCoursesPath());
      return;
    }

    if (errorCode === "COURSE_NOT_FOUND") {
      toast.error("Lớp học phần không còn tồn tại.");
      router.replace(lecturerCoursesPath());
    }
  }, [errorCode, isError, router]);

  const handleForbidden = () => {
    router.replace(lecturerCoursesPath());
  };

  if (isError && (errorCode === "LECTURER_COURSE_FORBIDDEN" || errorCode === "COURSE_NOT_FOUND")) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
        Đang chuyển về danh sách lớp...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-2xl border border-dashed border-destructive/30 p-8 text-center">
        <p className="text-sm font-semibold">Không tải được thông tin lớp</p>
        <p className="mt-1 text-xs text-muted-foreground">
          {getApiErrorMessage(error, "Vui lòng quay lại danh sách lớp.")}
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href={lecturerCoursesPath()}
          prefetch={true}
          aria-label="Quay lại danh sách lớp"
          className={buttonVariants({ variant: "ghost", size: "icon", className: "h-8 w-8 rounded-lg" })}
        >
          <ArrowLeftIcon className="size-4" />
        </Link>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Link href={lecturerCoursesPath()} prefetch={true} className="transition-colors hover:text-foreground">
            Khóa học của tôi
          </Link>
          <span>/</span>
          <span className="font-mono font-semibold text-foreground">
            {isLoading ? "Đang tải..." : course?.courseCode}
          </span>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
        {isLoading && !course ? (
          <div className="space-y-3 animate-pulse">
            <div className="h-5 w-40 rounded bg-muted" />
            <div className="h-7 w-72 rounded bg-muted" />
            <div className="h-4 w-56 rounded bg-muted" />
          </div>
        ) : (
          <>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <Badge
                variant="outline"
                className="border-primary/20 bg-primary/10 font-mono text-xs font-bold text-primary"
              >
                {course?.courseCode}
              </Badge>
              <Badge variant="secondary" className="font-mono text-xs">
                {course?.classCode || "Chưa có lớp niên khóa"}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {course?.semesterName || course?.semesterCode || "Chưa có học kỳ"}
              </Badge>
            </div>
            <h1 className="text-xl font-extrabold tracking-tight sm:text-2xl">
              {course?.subjectName || course?.name}
            </h1>
            <p className="mt-1 text-xs text-muted-foreground">
              {course?.subjectCode} · Không gian lớp chỉ gồm roster ACTIVE và phân nhóm Excel.
            </p>
          </>
        )}
      </div>

      <Tabs defaultValue={initialTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="roster">Sinh viên ACTIVE</TabsTrigger>
          <TabsTrigger value="teams">Nhóm đồ án</TabsTrigger>
        </TabsList>
        <TabsContent value="roster" keepMounted>
          <CourseRoster courseId={courseId} />
        </TabsContent>
        <TabsContent value="teams" keepMounted>
          <TeamList
            courseId={courseId}
            courseCode={course?.courseCode}
            onForbidden={handleForbidden}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
