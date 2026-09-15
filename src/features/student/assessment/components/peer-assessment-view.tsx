"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  CalendarIcon,
  CheckCircle2Icon,
  InfoIcon,
  LockIcon,
  StarIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { MemberRoleBadge } from "@/components/common/leader-badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { CustomSelect } from "@/components/common/custom-select";
import { Label } from "@/components/ui/label";
import {
  useRefreshStudentCourses,
  useStudentMyTeam,
} from "@/features/student/courses/hooks/use-student-courses";
import { useStudentCourseContext } from "@/features/student/courses/hooks/use-student-course-context";
import { useProjectSprints } from "@/features/student/sprint-progress/hooks/use-project-sprints";
import { getApiErrorCode, getApiErrorMessage } from "@/lib/api-error";
import { cn } from "@/lib/utils";
import { PeerAssessmentHeader } from "./peer-assessment-header";
import { PeerReviewModal } from "./peer-review-modal";
import { getPeerAssessmentState } from "../lib/peer-assessment-state";
import {
  formatPeerReviewOpenAt,
  formatSprintStateLabel,
  isPeerReviewWindowOpen,
  isSprintClosed,
  pickDefaultPeerReviewSprintId,
} from "../lib/peer-review-window";
import {
  excludeSelfReviewCandidates,
  hasRubricCriteria,
  resolveCandidateTeamRole,
  resolvePeerReviewRubric,
  rubricSourceLabel,
  shouldFetchDefaultRubric,
} from "../lib/peer-review-payload";
import {
  useDefaultPeerReviewRubric,
  usePeerReviewCandidates,
  useTeamPeerReviewRubric,
} from "../hooks/use-peer-review";
import {
  PEER_REVIEW_STAR_MAX,
  type PeerReviewCandidate,
} from "../types/peer-review";

function StatusPanel({
  title,
  description,
  tone = "default",
  action,
}: {
  title: string;
  description: string;
  tone?: "default" | "warning" | "danger";
  action?: React.ReactNode;
}) {
  const toneClass =
    tone === "danger"
      ? "border-destructive/30 bg-destructive/5"
      : tone === "warning"
        ? "border-amber-500/40 bg-amber-500/5"
        : "border-dashed border-border/80 bg-card/50";
  return (
    <div
      className={`rounded-3xl border p-8 text-center shadow-2xs ${toneClass}`}
    >
      <p
        className={`text-sm font-bold ${tone === "danger" ? "text-destructive" : "text-foreground"}`}
      >
        {title}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      {action}
    </div>
  );
}

export function PeerAssessmentView() {
  const refreshCourses = useRefreshStudentCourses();
  const {
    course: effectiveCourse,
    courseId,
    isLoading: isCoursesLoading,
    isInvalidCourse,
  } = useStudentCourseContext();
  const {
    data: team,
    isLoading: isTeamLoading,
    isError: isTeamError,
    error: teamError,
    refetch: refetchTeam,
    isWaitingForTeam,
  } = useStudentMyTeam(courseId, { enabled: Boolean(courseId) });

  const forbiddenCode =
    getApiErrorCode(teamError) === "STUDENT_COURSE_FORBIDDEN";

  useEffect(() => {
    if (forbiddenCode) void refreshCourses();
  }, [forbiddenCode, refreshCourses]);

  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const [selectedSprintId, setSelectedSprintId] = useState<string>("");
  const [selectedCandidate, setSelectedCandidate] =
    useState<PeerReviewCandidate | null>(null);

  const assessmentState = getPeerAssessmentState({
    courseId,
    isCoursesLoading,
    isInvalidCourse,
    isTeamLoading,
    isWaitingForTeam,
    forbidden: forbiddenCode,
    isTeamError,
    hasTeam: Boolean(team),
    projectId: team?.projectId,
  });

  const projectId = team?.projectId || null;
  const teamId = team?.teamId || null;
  const sprintsQuery = useProjectSprints(projectId, {
    enabled: assessmentState === "READY" && Boolean(projectId),
  });
  const sprints = sprintsQuery.data || [];
  const defaultSprintId =
    pickDefaultPeerReviewSprintId(sprints, now) || sprints[0]?.id || "";
  const effectiveSprintId = sprints.some(
    (sprint) => sprint.id === selectedSprintId,
  )
    ? selectedSprintId
    : defaultSprintId;
  const selectedSprint =
    sprints.find((sprint) => sprint.id === effectiveSprintId) || null;
  const windowOpen = selectedSprint
    ? isPeerReviewWindowOpen(selectedSprint, now)
    : false;

  const teamRubricQuery = useTeamPeerReviewRubric(teamId, {
    enabled: assessmentState === "READY" && Boolean(teamId),
  });
  const defaultRubricQuery = useDefaultPeerReviewRubric({
    enabled: shouldFetchDefaultRubric(
      teamRubricQuery.data,
      teamRubricQuery.isSuccess,
    ),
  });
  const rubric = resolvePeerReviewRubric(
    teamRubricQuery.data,
    defaultRubricQuery.data,
  );
  const candidatesQuery = usePeerReviewCandidates(teamId, effectiveSprintId, {
    enabled: Boolean(teamId && effectiveSprintId && windowOpen),
  });

  const candidates = useMemo(
    () =>
      excludeSelfReviewCandidates(
        candidatesQuery.data?.candidates || [],
        candidatesQuery.data?.reviewerId,
      ),
    [candidatesQuery.data],
  );
  const reviewedCount = candidates.filter(
    (item) => item.alreadyReviewed,
  ).length;
  const maxStars = (rubric?.criteria.length || 0) * PEER_REVIEW_STAR_MAX;
  const isRubricFallbackPending =
    teamRubricQuery.isSuccess &&
    !hasRubricCriteria(teamRubricQuery.data) &&
    defaultRubricQuery.isFetching;
  const showRubricSkeleton =
    teamRubricQuery.isLoading || isRubricFallbackPending;
  const showEmptyRubric =
    teamRubricQuery.isSuccess &&
    defaultRubricQuery.isSuccess &&
    !hasRubricCriteria(teamRubricQuery.data) &&
    !hasRubricCriteria(defaultRubricQuery.data);

  if (assessmentState === "LOADING_COURSE") {
    return (
      <div className="mx-auto max-w-[1600px] space-y-4 pb-12">
        <div className="h-16 animate-pulse rounded-3xl bg-muted/60" />
        <div className="h-48 animate-pulse rounded-3xl bg-muted/60" />
      </div>
    );
  }

  if (assessmentState === "NO_COURSE") {
    return (
      <div className="mx-auto max-w-[1600px] space-y-6 pb-12">
        <PeerAssessmentHeader />
        <StatusPanel
          title="Chưa chọn lớp học phần"
          description="Hãy chọn lớp đang học trước khi xem đánh giá chéo theo Sprint."
          action={
            <Link
              href="/student/courses"
              prefetch={true}
              className={cn(
                buttonVariants({ size: "sm" }),
                "mt-4 rounded-xl text-xs font-semibold",
              )}
            >
              Chọn lớp học phần
            </Link>
          }
        />
      </div>
    );
  }

  if (assessmentState === "INVALID_COURSE") {
    return (
      <div className="mx-auto max-w-[1600px] space-y-6 pb-12">
        <PeerAssessmentHeader />
        <StatusPanel
          tone="warning"
          title="Lớp học phần không còn khả dụng"
          description="Hãy chọn lại lớp học phần trước khi xem đánh giá chéo."
          action={
            <Link
              href="/student/courses"
              prefetch={true}
              className={cn(
                buttonVariants({ size: "sm", variant: "outline" }),
                "mt-4 rounded-xl text-xs font-semibold",
              )}
            >
              Chọn lớp học phần
            </Link>
          }
        />
      </div>
    );
  }

  if (assessmentState === "LOADING_TEAM") {
    return (
      <div className="mx-auto max-w-[1600px] space-y-4 pb-12">
        <PeerAssessmentHeader courseCode={effectiveCourse?.code} />
        <div className="h-20 animate-pulse rounded-3xl bg-muted/60" />
        <div className="h-56 animate-pulse rounded-3xl bg-muted/60" />
      </div>
    );
  }

  if (assessmentState === "WAITING_FOR_TEAM") {
    return (
      <div className="mx-auto max-w-[1600px] space-y-6 pb-12">
        <PeerAssessmentHeader courseCode={effectiveCourse?.code} />
        <StatusPanel
          title="Đang chờ giảng viên phân nhóm"
          description="Bạn đã ghi danh nhưng chưa được gán vào nhóm. Đây không phải lỗi hệ thống."
        />
      </div>
    );
  }

  if (assessmentState === "FORBIDDEN") {
    return (
      <div className="mx-auto max-w-[1600px] space-y-6 pb-12">
        <PeerAssessmentHeader />
        <StatusPanel
          tone="danger"
          title="Bạn không thuộc lớp học phần này"
          description="Danh sách lớp sẽ được làm mới. Không thử ID của sinh viên khác."
          action={
            <Link
              href="/student/courses"
              prefetch={true}
              className={cn(
                buttonVariants({ size: "sm", variant: "outline" }),
                "mt-4 rounded-xl text-xs font-semibold",
              )}
            >
              Về danh sách lớp
            </Link>
          }
        />
      </div>
    );
  }

  if (assessmentState === "TEAM_ERROR") {
    return (
      <div className="mx-auto max-w-[1600px] space-y-6 pb-12">
        <PeerAssessmentHeader courseCode={effectiveCourse?.code} />
        <StatusPanel
          tone="danger"
          title="Không tải được nhóm"
          description={getApiErrorMessage(teamError, "Vui lòng thử lại.")}
          action={
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="mt-4 cursor-pointer rounded-xl text-xs font-semibold"
              onClick={() => void refetchTeam()}
            >
              Thử lại
            </Button>
          }
        />
      </div>
    );
  }

  if (assessmentState === "NO_PROJECT") {
    return (
      <div className="mx-auto max-w-[1600px] space-y-6 pb-12">
        <PeerAssessmentHeader
          teamName={team?.teamName}
          courseCode={effectiveCourse?.code}
          myRole={team?.myRole}
        />
        <StatusPanel
          tone="warning"
          title="Nhóm chưa có dự án"
          description="Đánh giá chéo theo Sprint chỉ mở khi nhóm đã có dự án."
        />
      </div>
    );
  }

  const sprintOptions = sprints.map((sprint) => {
    const open = isPeerReviewWindowOpen(sprint, now);
    const openAt = formatPeerReviewOpenAt(sprint);
    return {
      value: sprint.id,
      label: sprint.name,
      subLabel: open
        ? isSprintClosed(sprint)
          ? "Sprint đã đóng · được chấm"
          : "Trong cửa sổ đánh giá"
        : openAt
          ? `Mở lúc ${openAt}`
          : "Chỉ chấm khi Sprint đã đóng",
    };
  });

  return (
    <div className="mx-auto max-w-[1600px] space-y-5 pb-12">
      <PeerAssessmentHeader
        teamName={team?.teamName}
        courseCode={effectiveCourse?.code}
        myRole={team?.myRole}
        sprintName={selectedSprint?.name}
        sprintStateLabel={
          selectedSprint ? formatSprintStateLabel(selectedSprint.state) : null
        }
        rubricSource={rubric ? rubricSourceLabel(rubric) : null}
        criteriaCount={rubric ? rubric.criteria.length : null}
        reviewedCount={windowOpen ? reviewedCount : null}
        candidateCount={windowOpen ? candidates.length : null}
      />

      <div className="rounded-3xl border border-border/70 bg-card/60 p-5 shadow-2xs">
        <div className="max-w-md space-y-1.5">
          <Label
            htmlFor="peer-sprint"
            className="text-[11px] font-semibold text-muted-foreground"
          >
            <span className="inline-flex items-center gap-1">
              <CalendarIcon className="size-3 text-primary" />
              Sprint đánh giá chéo
            </span>
          </Label>
          {sprintsQuery.isLoading ? (
            <div className="h-10 animate-pulse rounded-xl bg-muted" />
          ) : sprintsQuery.isError ? (
            <StatusPanel
              tone="danger"
              title="Không tải được Sprint"
              description={getApiErrorMessage(
                sprintsQuery.error,
                "Vui lòng thử lại.",
              )}
              action={
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="mt-3 cursor-pointer text-xs"
                  onClick={() => void sprintsQuery.refetch()}
                >
                  Thử lại
                </Button>
              }
            />
          ) : sprints.length === 0 ? (
            <StatusPanel
              title="Chưa có Sprint"
              description="Dự án nhóm chưa có Sprint để mở đánh giá chéo."
            />
          ) : (
            <CustomSelect
              id="peer-sprint"
              value={effectiveSprintId}
              onChange={setSelectedSprintId}
              options={sprintOptions}
            />
          )}
        </div>
      </div>

      {sprints.length > 0 && selectedSprint && !windowOpen ? (
        <StatusPanel
          tone="warning"
          title="Sprint chưa đến hạn đánh giá"
          description={
            formatPeerReviewOpenAt(selectedSprint)
              ? `Form bị khóa đến ${formatPeerReviewOpenAt(selectedSprint)}. Trang sẽ tự mở khi đến cửa sổ 48 giờ.`
              : "Sprint này chưa có ngày kết thúc nên chỉ được chấm sau khi đã đóng."
          }
        />
      ) : null}

      {windowOpen && showRubricSkeleton ? (
        <div className="h-40 animate-pulse rounded-3xl bg-muted/60" />
      ) : null}

      {windowOpen && teamRubricQuery.isError ? (
        <StatusPanel
          tone="danger"
          title="Không tải được tiêu chí đánh giá"
          description={getApiErrorMessage(
            teamRubricQuery.error,
            "Vui lòng thử lại.",
          )}
          action={
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="mt-3 cursor-pointer text-xs"
              onClick={() => void teamRubricQuery.refetch()}
            >
              Thử lại
            </Button>
          }
        />
      ) : null}

      {windowOpen &&
      teamRubricQuery.isSuccess &&
      !hasRubricCriteria(rubric) &&
      defaultRubricQuery.isError ? (
        <StatusPanel
          tone="danger"
          title="Không tải được tiêu chí mặc định"
          description={getApiErrorMessage(
            defaultRubricQuery.error,
            "Vui lòng thử lại.",
          )}
          action={
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="mt-3 cursor-pointer text-xs"
              onClick={() => void defaultRubricQuery.refetch()}
            >
              Thử lại
            </Button>
          }
        />
      ) : null}

      {windowOpen && !showRubricSkeleton && showEmptyRubric ? (
        <StatusPanel
          title="Chưa có tiêu chí đánh giá"
          description="Nhóm chưa có rubric và rubric mặc định cũng chưa có tiêu chí."
        />
      ) : null}

      {windowOpen && !showRubricSkeleton && hasRubricCriteria(rubric) ? (
        <div className="space-y-3 rounded-3xl border border-border/70 bg-card/60 p-5 shadow-2xs">
          <div className="flex items-start gap-2 rounded-2xl border border-primary/15 bg-primary/5 px-3.5 py-3 text-xs text-muted-foreground">
            <InfoIcon className="mt-0.5 size-3.5 shrink-0 text-primary" />
            <p>
              Chỉ hiển thị trạng thái đánh giá do bạn gửi. Không tải bảng kết quả
              toàn nhóm để bảo vệ nội dung đánh giá của các thành viên.
            </p>
          </div>
          {candidatesQuery.isLoading ? (
            <div className="h-32 animate-pulse rounded-2xl bg-muted/60" />
          ) : candidatesQuery.isError ? (
            <StatusPanel
              tone="danger"
              title="Không tải được danh sách đánh giá"
              description={getApiErrorMessage(
                candidatesQuery.error,
                "Vui lòng thử lại.",
              )}
              action={
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="mt-3 cursor-pointer text-xs"
                  onClick={() => void candidatesQuery.refetch()}
                >
                  Thử lại
                </Button>
              }
            />
          ) : candidates.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-border p-8 text-center text-xs text-muted-foreground">
              Không có thành viên nào để đánh giá trong Sprint này.
            </p>
          ) : (
            <div className="grid gap-2">
              {candidates.map((candidate) => {
                const role = resolveCandidateTeamRole(
                  team?.members || [],
                  candidate.studentCode,
                );
                return (
                  <div
                    key={candidate.studentId}
                    className="flex flex-col gap-2 rounded-2xl border border-border/60 bg-muted/20 px-3.5 py-2.5 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="text-xs font-bold text-foreground">
                        {candidate.fullName}
                      </p>
                      <p className="font-mono text-[11px] text-muted-foreground">
                        {candidate.studentCode || candidate.studentId}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                      {role ? <MemberRoleBadge role={role} size="sm" /> : null}
                      {candidate.alreadyReviewed ? (
                        <Badge variant="outline" className="gap-1 text-[10px]">
                          <StarIcon className="size-3 fill-primary text-primary" />
                          Đã gửi · {candidate.existingTotalStarRating ?? "—"} /{" "}
                          {maxStars}
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="gap-1 text-[10px] text-muted-foreground"
                        >
                          <LockIcon className="size-2.5" />
                          Chưa đánh giá
                        </Badge>
                      )}
                      {candidate.alreadyReviewed ? (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          disabled
                          className="h-8 rounded-xl text-xs disabled:opacity-100"
                        >
                          <CheckCircle2Icon className="size-3.5 text-emerald-600" />
                          Đã đánh giá
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          size="sm"
                          className="h-8 cursor-pointer rounded-xl text-xs"
                          onClick={() => setSelectedCandidate(candidate)}
                        >
                          Đánh giá
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : null}

      <PeerReviewModal
        key={selectedCandidate?.studentId || "closed"}
        open={Boolean(selectedCandidate && !selectedCandidate.alreadyReviewed)}
        teamId={teamId || ""}
        sprintId={effectiveSprintId}
        candidate={selectedCandidate}
        rubric={rubric}
        reviewerId={candidatesQuery.data?.reviewerId}
        allowedRevieweeIds={candidates.map((item) => item.studentId)}
        sprintWindowOpen={windowOpen}
        onOpenChange={(open) => {
          if (!open) setSelectedCandidate(null);
        }}
      />
    </div>
  );
}
