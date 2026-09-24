"use client";

import { useMemo, useState } from "react";
import {
  SparklesIcon,
  FileTextIcon,
  KeyRoundIcon,
  GraduationCapIcon,
  LayersIcon,
  BotIcon,
  RefreshCwIcon,
  CheckCircle2Icon,
  AlertCircleIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LecturerPageShell } from "@/features/lecturer/courses/components/lecturer-page-shell";
import { useLecturerCourse } from "@/features/lecturer/courses/hooks/use-lecturer-courses";
import {
  lecturerCourseDashboardPath,
  lecturerCoursesPath,
} from "@/features/lecturer/courses/lib/course-routes";
import {
  useCourseAcademicClassifications,
  useCourseAiCredential,
  useCourseAiSettings,
} from "../../hooks/use-lecturer-ai";
import { CourseAiSettingsCard } from "./course-ai-settings-card";
import { CourseAiCredentialsCard } from "./course-ai-credentials-card";
import { CourseAiProgressTab } from "./course-ai-progress-tab";
import { CourseAiAcademicReviewTab } from "./course-ai-academic-review-tab";
import { cn } from "@/lib/utils";

interface LecturerAiHubPageProps {
  courseId: string;
}

export function LecturerAiHubPage({ courseId }: LecturerAiHubPageProps) {
  const [activeTab, setActiveTab] = useState<"progress" | "academic" | "credentials">("progress");

  const courseQuery = useLecturerCourse(courseId);
  const course = courseQuery.data;

  const credentialQuery = useCourseAiCredential(courseId, "PRIMARY");
  const credential = credentialQuery.data;

  const settingsQuery = useCourseAiSettings(courseId);
  const settings = settingsQuery.data;

  const proposedClassificationsQuery = useCourseAcademicClassifications(courseId, {
    status: "PROPOSED",
    page: 0,
    size: 1,
  });
  const proposedCount = proposedClassificationsQuery.data?.total ?? 0;

  const breadcrumbItems = useMemo(
    () => [
      { label: "Lớp học phần", href: lecturerCoursesPath() },
      {
        label: course?.courseCode || "Mã lớp",
        href: lecturerCourseDashboardPath(courseId),
      },
      { label: "SAGA AI Hub" },
    ],
    [course?.courseCode, courseId]
  );

  const handleRefreshAll = () => {
    void courseQuery.refetch();
    void credentialQuery.refetch();
    void settingsQuery.refetch();
    void proposedClassificationsQuery.refetch();
  };

  const isRefreshing =
    courseQuery.isFetching ||
    credentialQuery.isFetching ||
    settingsQuery.isFetching ||
    proposedClassificationsQuery.isFetching;

  return (
    <LecturerPageShell
      breadcrumbItems={breadcrumbItems}
      title="SAGA AI Hub — Giám sát Tiến độ và Rủi ro"
      description="Tự động phân tích code diff, commit, tiến độ Jira Sprint, đối soát mục tiêu đề cương và phát hiện sớm rủi ro dự án."
      badges={
        <>
          <Badge
            variant="outline"
            className="border-primary/25 bg-primary/10 font-mono text-xs font-bold text-primary"
          >
            {course?.courseCode || "Đang tải"}
          </Badge>
          {course?.subjectCode ? (
            <Badge variant="secondary" className="font-mono text-xs">
              {course.subjectCode}
            </Badge>
          ) : null}
          <Badge variant="secondary" className="font-mono text-xs">
            {course?.classCode || "Chưa gắn lớp sinh viên"}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {course?.semesterCode || "Học kỳ hiện tại"}
          </Badge>
        </>
      }
      actions={
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="h-8 cursor-pointer text-xs gap-1.5"
          disabled={isRefreshing}
          onClick={handleRefreshAll}
        >
          <RefreshCwIcon className={cn("size-3.5", isRefreshing && "animate-spin")} />
          Làm mới dữ liệu
        </Button>
      }
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Card className="rounded-2xl border border-border/80 bg-card p-4 shadow-xs">
            <CardContent className="p-0 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">Mô hình phân tích chính</span>
                <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
                  <SparklesIcon className="size-4" />
                </div>
              </div>
              <div>
                <div className="text-xl font-black text-foreground font-mono">
                  {credential?.provider ? credential.provider.toUpperCase() : "OPENAI"}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {credential?.configured ? `BYOK (•••• ${credential.lastFour})` : "Dự phòng hệ thống"}
                </p>
              </div>
              <div className="pt-1">
                {credential?.configured ? (
                  <Badge variant="outline" className="text-[11px] gap-1 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 bg-emerald-500/10">
                    <CheckCircle2Icon className="size-3" />
                    Khóa riêng đang hoạt động
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-[11px] gap-1 text-muted-foreground">
                    <AlertCircleIcon className="size-3" />
                    Cấu hình mặc định
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border border-border/80 bg-card p-4 shadow-xs">
            <CardContent className="p-0 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">Phạm vi giám sát</span>
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                  <LayersIcon className="size-4" />
                </div>
              </div>
              <div>
                <div className="text-xl font-black text-foreground font-mono">
                  3 Cấp độ
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Khóa học · Nhóm dự án · Cá nhân
                </p>
              </div>
              <div className="pt-1">
                <Badge variant="outline" className="text-[11px] text-blue-600 dark:text-blue-400 border-blue-500/30 bg-blue-500/10">
                  Tiến độ và Rủi ro
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border border-border/80 bg-card p-4 shadow-xs">
            <CardContent className="p-0 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">Phân loại đề cương</span>
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <GraduationCapIcon className="size-4" />
                </div>
              </div>
              <div>
                <div className="text-xl font-black text-foreground font-mono">
                  {proposedCount} <span className="text-xs font-normal text-muted-foreground">đề xuất</span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Giai đoạn và Sản phẩm bàn giao
                </p>
              </div>
              <div className="pt-1">
                {proposedCount > 0 ? (
                  <Badge variant="outline" className="text-[11px] text-amber-600 dark:text-amber-400 border-amber-500/30 bg-amber-500/10 animate-pulse">
                    Có đề xuất chờ duyệt
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-[11px] text-muted-foreground">
                    Đã đồng bộ đầy đủ
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border border-border/80 bg-card p-4 shadow-xs">
            <CardContent className="p-0 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">Tự động hóa phân tích</span>
                <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                  <BotIcon className="size-4" />
                </div>
              </div>
              <div>
                <div className="text-xl font-black text-foreground">
                  {settings?.automationEnabled ? "Đang bật" : "Thủ công"}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {settings?.allowPlatformFallback ? "Khóa nền tảng: Cho phép thủ công" : "Khóa nền tảng: Tắt"}
                </p>
              </div>
              <div className="pt-1">
                <Badge variant="outline" className="text-[11px] text-purple-600 dark:text-purple-400 border-purple-500/30 bg-purple-500/10">
                  {settings?.automationEnabled ? "Tự chạy khi có Commit hoặc Task mới" : "Kích hoạt thủ công"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 p-2 rounded-2xl bg-muted/40 border border-border/80">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setActiveTab("progress")}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer",
                activeTab === "progress"
                  ? "bg-card text-foreground shadow-xs border border-border/60"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
              )}
            >
              <FileTextIcon className="w-3.5 h-3.5 text-primary" />
              <span>Báo cáo Tiến độ và Rủi ro</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("academic")}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer relative",
                activeTab === "academic"
                  ? "bg-card text-foreground shadow-xs border border-border/60"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
              )}
            >
              <GraduationCapIcon className="w-3.5 h-3.5 text-emerald-500" />
              <span>Đối soát phân loại đề cương</span>
              {proposedCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-amber-500 text-white">
                  {proposedCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("credentials")}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer",
                activeTab === "credentials"
                  ? "bg-card text-foreground shadow-xs border border-border/60"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
              )}
            >
              <KeyRoundIcon className="w-3.5 h-3.5 text-purple-500" />
              <span>Cấu hình khóa API riêng</span>
              {credential?.configured ? (
                <span className="size-1.5 rounded-full bg-emerald-500" />
              ) : null}
            </button>
          </div>
        </div>

        {activeTab === "progress" && (
          <CourseAiProgressTab
            courseId={courseId}
            onNavigateToCredentials={() => setActiveTab("credentials")}
          />
        )}

        {activeTab === "academic" && <CourseAiAcademicReviewTab courseId={courseId} />}

        {activeTab === "credentials" && (
          <div className="space-y-6">
            <CourseAiSettingsCard courseId={courseId} />
            <CourseAiCredentialsCard
              courseId={courseId}
              role="PRIMARY"
              title="Khóa API chính (PRIMARY - Bắt buộc cho Tự động hóa)"
              description="Khóa API chính của khóa học, dùng cho Commit Intelligence, Task Intelligence và phân tích rủi ro tự động."
            />
            <CourseAiCredentialsCard
              courseId={courseId}
              role="SECONDARY"
              title="Khóa API đối chứng phụ (SECONDARY - Tùy chọn)"
              description="Chỉ dùng cho Secondary Brain / mô hình đối chứng. Không bắt buộc để hệ thống AI chính hoạt động."
            />
          </div>
        )}
      </div>
    </LecturerPageShell>
  );
}
