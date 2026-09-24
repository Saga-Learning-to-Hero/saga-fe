"use client";

import { useEffect, useMemo, type ReactNode } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { CustomSelect } from "@/components/common/custom-select";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { CourseQueryError } from "@/features/lecturer/courses/components/course-query-error";
import { LecturerPageShell } from "@/features/lecturer/courses/components/lecturer-page-shell";
import { useLecturerCourse, useLecturerCourseAccess } from "@/features/lecturer/courses/hooks/use-lecturer-courses";
import {
  lecturerCourseDashboardPath,
  lecturerCoursePeerReviewsPath,
  lecturerCourseTeamsPath,
  lecturerCoursesPath,
} from "@/features/lecturer/courses/lib/course-routes";
import { pickDefaultGradesTeamId } from "@/features/lecturer/contribution/lib/contribution-utils";
import { useLecturerTeams } from "@/features/lecturer/teams/hooks/use-lecturer-teams";
import { useProjectSprints } from "@/features/student/sprint-progress/hooks/use-project-sprints";
import { useTaskOptions } from "@/features/student/sprint-progress/hooks/use-project-tasks";
import { scopeSprintsToJiraSource } from "@/features/student/sprint-progress/lib/jira-source-scope";
import { JiraSourceSwitcher } from "@/features/student/project/components/jira-source-switcher";
import { useProjectJiraSourceSelection } from "@/features/student/project/hooks/use-project-jira-source-selection";
import { getApiErrorCode } from "@/lib/api-error";
import { cn } from "@/lib/utils";
import { useLecturerPeerReviewRubric, useLecturerSprintPeerReviews } from "../hooks/use-lecturer-peer-review";
import {
  formatSprintState,
  formatTeamOptionLabel,
  joinReviewCriteria,
  pickDefaultLecturerPeerReviewSprintId,
  resolvePeerReviewViewState,
} from "../lib/lecturer-peer-review";
import { PeerReviewWorkspace } from "./peer-review-workspace";

interface LecturerPeerReviewPageProps {
  courseId: string;
}

function PeerReviewSummarySkeleton() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" data-testid="peer-review-skeleton" aria-hidden>
      {Array.from({ length: 4 }, (_, index) => (
        <div key={index} className="h-20 animate-pulse rounded-2xl bg-muted/60" />
      ))}
    </div>
  );
}

export function LecturerPeerReviewPage({ courseId }: LecturerPeerReviewPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedTeamId = searchParams.get("teamId")?.trim() ?? "";
  const requestedSprintId = searchParams.get("sprintId")?.trim() ?? "";
  const requestedRevieweeId = searchParams.get("revieweeId")?.trim() ?? "";
  const courseQuery = useLecturerCourse(courseId);
  const teamsQuery = useLecturerTeams(courseId);
  useLecturerCourseAccess(teamsQuery.isError, teamsQuery.error);
  const teams = useMemo(
    () => [...(teamsQuery.data?.teams ?? [])].sort((a, b) => a.teamNo - b.teamNo),
    [teamsQuery.data?.teams]
  );

  const defaultTeamId = pickDefaultGradesTeamId(teams);
  const teamBelongsToCourse = teams.some((team) => team.teamId === requestedTeamId);
  const effectiveTeamId = teamBelongsToCourse ? requestedTeamId : defaultTeamId || "";
  const team = teams.find((item) => item.teamId === effectiveTeamId) || null;
  const hasProject = Boolean(team?.projectId);

  const jiraSource = useProjectJiraSourceSelection(team?.projectId, { readerMode: true });
  const sprintsQuery = useProjectSprints(team?.projectId, jiraSource.effectiveSourceId, {
    enabled: hasProject,
  });
  const taskOptionsQuery = useTaskOptions(team?.projectId, {
    enabled: Boolean(hasProject && jiraSource.effectiveSourceId),
    jiraIntegrationId: jiraSource.effectiveSourceId,
  });
  const sprints = useMemo(
    () =>
      jiraSource.effectiveSourceId
        ? scopeSprintsToJiraSource(
          sprintsQuery.data || [],
          taskOptionsQuery.data?.sprints,
          undefined,
          jiraSource.effectiveSourceId
        )
        : sprintsQuery.data || [],
    [jiraSource.effectiveSourceId, sprintsQuery.data, taskOptionsQuery.data?.sprints]
  );
  const defaultSprintId = pickDefaultLecturerPeerReviewSprintId(sprints);
  const sprintBelongsToProject = sprints.some((sprint) => sprint.id === requestedSprintId);
  const effectiveSprintId = sprintBelongsToProject ? requestedSprintId : defaultSprintId || "";

  const canLoadReviews = Boolean(hasProject && effectiveTeamId && effectiveSprintId);
  const rubricQuery = useLecturerPeerReviewRubric(effectiveTeamId, { enabled: canLoadReviews });
  const reviewsQuery = useLecturerSprintPeerReviews(effectiveTeamId, effectiveSprintId, {
    enabled: canLoadReviews,
  });

  const reviews = useMemo(
    () => joinReviewCriteria(reviewsQuery.data?.reviews || [], rubricQuery.isError ? null : rubricQuery.data),
    [reviewsQuery.data?.reviews, rubricQuery.data, rubricQuery.isError]
  );

  const availableRevieweeIds = useMemo(() => {
    const ids = new Set((team?.members || []).map((member) => member.studentProfileId));
    for (const review of reviews) ids.add(review.revieweeId);
    return ids;
  }, [reviews, team?.members]);
  const revieweeBelongsToTeam = availableRevieweeIds.has(requestedRevieweeId);
  const effectiveRevieweeId = revieweeBelongsToTeam ? requestedRevieweeId : "";
  const selectedSprintName =
    reviewsQuery.data?.sprintName ||
    sprints.find((sprint) => sprint.id === effectiveSprintId)?.name ||
    "";

  const usingPlaceholder = Boolean(reviewsQuery.isPlaceholderData);
  const hasReviewsData = Boolean(reviewsQuery.data) && (!usingPlaceholder || !reviewsQuery.isError);
  const viewState = resolvePeerReviewViewState({
    canLoad: canLoadReviews,
    hasReviewsData,
    reviewsError: reviewsQuery.isError && !hasReviewsData,
    reviewsEmpty: hasReviewsData && reviews.length === 0,
    rubricError: Boolean(rubricQuery.isError && hasReviewsData && reviews.length > 0),
  });
  const isUpdating =
    (reviewsQuery.isFetching || rubricQuery.isFetching) &&
    (viewState === "success" || viewState === "partial" || viewState === "empty");
  const isStale = usingPlaceholder && reviewsQuery.isFetching && hasReviewsData;

  useEffect(() => {
    if (!teamsQuery.isSuccess || teams.length === 0) return;
    const teamId = teamBelongsToCourse ? requestedTeamId : defaultTeamId;
    if (!teamId) return;
    const selectedTeam = teams.find((item) => item.teamId === teamId);
    const projectReady = Boolean(selectedTeam?.projectId);

    if (!projectReady) {
      const next = lecturerCoursePeerReviewsPath(courseId, { teamId });
      const current = lecturerCoursePeerReviewsPath(courseId, {
        teamId: requestedTeamId || undefined,
        sprintId: requestedSprintId || undefined,
        revieweeId: requestedRevieweeId || undefined,
      });
      if (next !== current) router.replace(next, { scroll: false });
      return;
    }

    if (!sprintsQuery.isSuccess) {
      if (!requestedTeamId || requestedTeamId !== teamId) {
        const next = lecturerCoursePeerReviewsPath(courseId, { teamId });
        const current = lecturerCoursePeerReviewsPath(courseId, {
          teamId: requestedTeamId || undefined,
          sprintId: requestedSprintId || undefined,
          revieweeId: requestedRevieweeId || undefined,
        });
        if (next !== current) router.replace(next, { scroll: false });
      }
      return;
    }

    const sprintId = sprintBelongsToProject ? requestedSprintId : defaultSprintId || "";
    const revieweeId = requestedTeamId === teamId ? requestedRevieweeId : "";
    const next = lecturerCoursePeerReviewsPath(courseId, {
      teamId,
      sprintId: sprintId || undefined,
      revieweeId: revieweeId || undefined,
    });
    const current = lecturerCoursePeerReviewsPath(courseId, {
      teamId: requestedTeamId || undefined,
      sprintId: requestedSprintId || undefined,
      revieweeId: requestedRevieweeId || undefined,
    });
    if (next !== current) router.replace(next, { scroll: false });
  }, [
    courseId,
    defaultSprintId,
    defaultTeamId,
    requestedRevieweeId,
    requestedSprintId,
    requestedTeamId,
    router,
    sprintBelongsToProject,
    sprintsQuery.isSuccess,
    teamBelongsToCourse,
    teams,
    teamsQuery.isSuccess,
  ]);

  useEffect(() => {
    if (!requestedRevieweeId || !effectiveTeamId || requestedTeamId !== effectiveTeamId) return;
    if (revieweeBelongsToTeam) return;
    if (canLoadReviews && !hasReviewsData && !reviewsQuery.isError) return;

    router.replace(
      lecturerCoursePeerReviewsPath(courseId, {
        teamId: effectiveTeamId,
        sprintId: effectiveSprintId || undefined,
      }),
      { scroll: false }
    );
  }, [
    canLoadReviews,
    courseId,
    effectiveSprintId,
    effectiveTeamId,
    hasReviewsData,
    requestedRevieweeId,
    requestedTeamId,
    revieweeBelongsToTeam,
    reviewsQuery.isError,
    router,
  ]);

  const breadcrumbItems = [
    { label: "Lớp học phần", href: lecturerCoursesPath() },
    {
      label: courseQuery.data?.courseCode || "Mã lớp",
      href: lecturerCourseDashboardPath(courseId),
    },
    { label: "Đánh giá chéo" },
  ];

  const handleSelectTeam = (teamId: string) => {
    router.replace(lecturerCoursePeerReviewsPath(courseId, { teamId }), { scroll: false });
  };

  const handleSelectSprint = (sprintId: string) => {
    router.replace(
      lecturerCoursePeerReviewsPath(courseId, {
        teamId: effectiveTeamId,
        sprintId,
        revieweeId: effectiveRevieweeId || undefined,
      }),
      { scroll: false }
    );
  };

  const handleSelectReviewee = (revieweeId: string) => {
    router.replace(
      lecturerCoursePeerReviewsPath(courseId, {
        teamId: effectiveTeamId,
        sprintId: effectiveSprintId,
        revieweeId: revieweeId || undefined,
      }),
      { scroll: false }
    );
  };

  if (teamsQuery.isError) {
    const code = getApiErrorCode(teamsQuery.error);
    return (
      <LecturerPageShell
        breadcrumbItems={breadcrumbItems}
        title="Đánh giá chéo theo Sprint"
        error={teamsQuery.error}
        errorTitle={
          code === "LECTURER_COURSE_FORBIDDEN"
            ? "Bạn không được xem đánh giá chéo của lớp này"
            : "Không tải được danh sách nhóm"
        }
        onRetry={() => void teamsQuery.refetch()}
      />
    );
  }

  if (teamsQuery.isLoading || (teamsQuery.isSuccess && teams.length > 0 && !effectiveTeamId)) {
    return <LecturerPageShell breadcrumbItems={breadcrumbItems} title="Đánh giá chéo theo Sprint" isLoading />;
  }

  if (teamsQuery.isSuccess && teams.length === 0) {
    return (
      <LecturerPageShell breadcrumbItems={breadcrumbItems} title="Đánh giá chéo theo Sprint">
        <Card className="rounded-2xl border border-dashed border-border/80 p-8 text-center shadow-xs">
          <p className="text-sm font-semibold text-foreground">Lớp học phần chưa có nhóm nào</p>
          <p className="mt-1 text-xs text-muted-foreground">Phân nhóm trước khi xem đánh giá chéo.</p>
          <Link
            href={lecturerCourseTeamsPath(courseId, "teams")}
            prefetch={true}
            className={cn(buttonVariants({ size: "sm" }), "mt-4 text-xs font-bold shadow-xs")}
          >
            Đến trang phân nhóm
          </Link>
        </Card>
      </LecturerPageShell>
    );
  }

  const filters = (
    <div
      className={cn(
        "grid gap-3",
        jiraSource.hasMultipleSources
          ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
          : "grid-cols-1 sm:grid-cols-2"
      )}
    >
      <div className="min-w-0 space-y-1.5">
        <Label htmlFor="peer-review-team" className="text-[11px] font-semibold text-muted-foreground">
          Nhóm
        </Label>
        <CustomSelect
          id="peer-review-team"
          value={effectiveTeamId}
          onChange={handleSelectTeam}
          options={teams.map((item) => ({
            value: item.teamId,
            label: formatTeamOptionLabel(item.teamNo, item.teamName),
            subLabel: item.projectId ? "Đã có dự án" : "Chưa có dự án",
          }))}
        />
      </div>
      {jiraSource.hasMultipleSources && (
        <div className="min-w-0 space-y-1.5">
          <Label className="text-[11px] font-semibold text-muted-foreground">
            Nguồn Jira
          </Label>
          <JiraSourceSwitcher
            compact
            sources={jiraSource.activeSources}
            value={jiraSource.effectiveSourceId}
            onChange={(integrationId) => {
              jiraSource.selectSource(integrationId);
              router.replace(
                lecturerCoursePeerReviewsPath(courseId, { teamId: effectiveTeamId })
              );
            }}
          />
        </div>
      )}
      <div className="min-w-0 space-y-1.5">
        <Label htmlFor="peer-review-sprint" className="text-[11px] font-semibold text-muted-foreground">
          Sprint
        </Label>
        {sprintsQuery.isLoading && !sprintsQuery.data ? (
          <div className="h-10 animate-pulse rounded-xl bg-muted" />
        ) : (
          <CustomSelect
            id="peer-review-sprint"
            value={effectiveSprintId}
            onChange={handleSelectSprint}
            disabled={!hasProject || sprints.length === 0}
            placeholder={hasProject ? "Chọn Sprint" : "Cần có dự án nhóm"}
            options={sprints.map((sprint) => ({
              value: sprint.id,
              label: sprint.name,
              subLabel: formatSprintState(sprint.state),
            }))}
          />
        )}
      </div>
    </div>
  );

  let mainContent: ReactNode = null;
  if (!hasProject) {
    mainContent = (
      <Card className="rounded-2xl border border-dashed border-border/80 p-8 text-center shadow-xs">
        <p className="text-sm font-semibold text-foreground">Nhóm chưa có dự án</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Đánh giá chéo theo Sprint chỉ mở khi nhóm đã có dự án.
        </p>
      </Card>
    );
  } else if (sprintsQuery.isError) {
    mainContent = (
      <CourseQueryError
        title="Không tải được Sprint"
        error={sprintsQuery.error}
        onRetry={() => void sprintsQuery.refetch()}
      />
    );
  } else if (!sprintsQuery.isSuccess) {
    mainContent = <PeerReviewSummarySkeleton />;
  } else if (sprintsQuery.isSuccess && sprints.length === 0) {
    mainContent = (
      <Card className="rounded-2xl border border-dashed border-border/80 p-8 text-center shadow-xs">
        <p className="text-sm font-semibold text-foreground">Dự án chưa có Sprint</p>
        <p className="mt-1 text-xs text-muted-foreground">Đồng bộ Jira hoặc tạo Sprint trước khi xem đánh giá chéo.</p>
      </Card>
    );
  } else if (viewState === "loading") {
    mainContent = <PeerReviewSummarySkeleton />;
  } else if (viewState === "reviewsError") {
    mainContent = (
      <CourseQueryError
        title="Không tải được đánh giá chéo"
        error={reviewsQuery.error}
        onRetry={() => void reviewsQuery.refetch()}
      />
    );
  } else if (viewState === "success" || viewState === "partial" || viewState === "empty") {
    mainContent = (
      <div className={cn("space-y-3", isStale && "pointer-events-none opacity-60")}>
        {isUpdating ? <p className="text-xs font-medium text-muted-foreground">Đang cập nhật…</p> : null}
        {hasReviewsData && reviewsQuery.isError ? (
          <Card className="flex flex-col gap-2 rounded-2xl border border-dashed border-border/80 p-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-muted-foreground">Không cập nhật được dữ liệu mới. Nội dung cũ vẫn được giữ.</p>
            <Button
              size="sm"
              variant="outline"
              className="cursor-pointer text-xs"
              onClick={() => void reviewsQuery.refetch()}
            >
              Thử lại
            </Button>
          </Card>
        ) : null}
        <PeerReviewWorkspace
          reviews={reviews}
          rubric={rubricQuery.data || null}
          members={team?.members || []}
          selectedRevieweeId={effectiveRevieweeId}
          fallbackSprintName={selectedSprintName}
          rubricError={viewState === "partial"}
          filters={filters}
          onSelectReviewee={handleSelectReviewee}
          onRetryRubric={() => void rubricQuery.refetch()}
        />
      </div>
    );
  }

  return (
    <LecturerPageShell
      breadcrumbItems={breadcrumbItems}
      title="Đánh giá chéo theo Sprint"
      description="Chọn một nhóm, rồi chọn Sprint của đúng dự án nhóm đó. Giảng viên chỉ xem, không nộp đánh giá."
    >
      <div className="relative z-0">{mainContent}</div>
    </LecturerPageShell>
  );
}
