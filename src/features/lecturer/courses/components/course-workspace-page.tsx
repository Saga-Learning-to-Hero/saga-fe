"use client";

import { useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { RefreshCwIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CourseRoster } from "./course-roster";
import { TeamList } from "@/features/lecturer/teams/components/team-list";
import { useLecturerCourse } from "../hooks/use-lecturer-courses";
import { lecturerCourseTeamsPath, resolveLecturerWorkspaceView } from "../lib/course-routes";
import { formatQueryUpdatedAt } from "../lib/format-query-updated-at";
import { LecturerPageShell } from "./lecturer-page-shell";
import { cn } from "@/lib/utils";

interface CourseWorkspacePageProps {
  courseId: string;
}

export function CourseWorkspacePage({ courseId }: CourseWorkspacePageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const view = resolveLecturerWorkspaceView(searchParams.get("view"));
  const { data: course, isLoading, isError, error, refetch, dataUpdatedAt, isFetching } =
    useLecturerCourse(courseId);

  const handleViewChange = useCallback(
    (next: string) => {
      const nextView = next === "teams" ? "teams" : "members";
      router.replace(`${lecturerCourseTeamsPath(courseId)}?view=${nextView}`, { scroll: false });
    },
    [courseId, router]
  );

  const updatedAt = useMemo(() => formatQueryUpdatedAt([dataUpdatedAt]), [dataUpdatedAt]);

  return (
    <LecturerPageShell
      title="Quản lý Sinh viên & Phân nhóm đồ án"
      description={`${course?.subjectCode || "Môn học"} · Danh sách sinh viên đang học và phân nhóm đồ án bằng Excel.`}
      badges={
        <>
          <Badge
            variant="outline"
            className="border-primary/20 bg-primary/10 font-mono text-xs font-bold text-primary"
          >
            {course?.courseCode || "Đang tải"}
          </Badge>
          <Badge variant="secondary" className="font-mono text-xs">
            {course?.classCode || "Chưa có lớp sinh viên niên khóa"}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {course?.semesterName || course?.semesterCode || "Chưa có học kỳ"}
          </Badge>
        </>
      }
      actions={
        <>
          {updatedAt ? (
            <p className="text-[11px] text-muted-foreground">Cập nhật lúc {updatedAt}</p>
          ) : null}
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-8 cursor-pointer text-xs"
            disabled={isFetching}
            onClick={() => void refetch()}
          >
            <RefreshCwIcon className={cn("size-3.5", isFetching && "animate-spin")} />
            Làm mới
          </Button>
        </>
      }
      isLoading={!course && isLoading}
      error={isError ? error : undefined}
      errorTitle="Không tải được thông tin lớp học phần"
      onRetry={() => void refetch()}
    >
      <Tabs value={view} onValueChange={handleViewChange} className="space-y-4">
        <TabsList>
          <TabsTrigger value="members">Sinh viên đang học</TabsTrigger>
          <TabsTrigger value="teams">Phân nhóm</TabsTrigger>
        </TabsList>
        <TabsContent value="members" keepMounted>
          <CourseRoster
            courseId={courseId}
            onSwitchToTeams={() => handleViewChange("teams")}
          />
        </TabsContent>
        <TabsContent value="teams" keepMounted>
          <TeamList courseId={courseId} courseCode={course?.courseCode} />
        </TabsContent>
      </Tabs>
    </LecturerPageShell>
  );
}
