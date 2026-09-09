"use client";

import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CourseRoster } from "./course-roster";
import { TeamList } from "@/features/lecturer/teams/components/team-list";
import { CourseQueryError } from "./course-query-error";
import { useLecturerCourse, useLecturerCourseAccess } from "../hooks/use-lecturer-courses";
import { lecturerCoursesPath } from "../lib/course-routes";

interface CourseWorkspacePageProps {
  courseId: string;
  initialTab?: "roster" | "teams";
}

export function CourseWorkspacePage({
  courseId,
  initialTab = "roster",
}: CourseWorkspacePageProps) {
  const { data: course, isLoading, isError, error, refetch } = useLecturerCourse(courseId);
  const { isAccessDenied } = useLecturerCourseAccess(isError, error);

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
            Lớp học phần của tôi
          </Link>
          <span>/</span>
          <span className="font-mono font-semibold text-foreground">
            {isLoading ? "Đang tải..." : course?.courseCode}
          </span>
          <span>/</span>
          <span className="font-semibold text-foreground">Dự án nhóm</span>
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
                {course?.classCode || "Chưa có lớp sinh viên niên khóa"}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {course?.semesterName || course?.semesterCode || "Chưa có học kỳ"}
              </Badge>
            </div>
            <h1 className="text-xl font-extrabold tracking-tight sm:text-2xl">
              {course?.subjectName || course?.name}
            </h1>
            <p className="mt-1 text-xs text-muted-foreground">
              {course?.subjectCode} · Danh sách sinh viên đang học và phân nhóm bằng Excel.
            </p>
          </>
        )}
      </div>

      <Tabs defaultValue={initialTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="roster">Sinh viên đang học</TabsTrigger>
          <TabsTrigger value="teams">Phân nhóm</TabsTrigger>
        </TabsList>
        <TabsContent value="roster" keepMounted>
          <CourseRoster courseId={courseId} />
        </TabsContent>
        <TabsContent value="teams" keepMounted>
          <TeamList
            courseId={courseId}
            courseCode={course?.courseCode}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
