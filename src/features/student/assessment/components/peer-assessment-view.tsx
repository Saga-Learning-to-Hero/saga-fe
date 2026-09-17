"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AwardIcon,
  CalendarIcon,
  CheckCircle2Icon,
  ClockIcon,
  InfoIcon,
  LockIcon,
  ShieldCheckIcon,
  SparklesIcon,
  StarIcon,
  UserCheckIcon,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
          description="Bạn đã ghi danh môn học nhưng chưa được gán vào nhóm. Vui lòng chờ giảng viên sắp xếp nhóm."
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
          description="Tài khoản của bạn không nằm trong danh sách sinh viên của lớp học phần này."
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

  const completionRate =
    candidates.length > 0
      ? Math.min(100, Math.round((reviewedCount / candidates.length) * 100))
      : 0;

  return (
    <div className="mx-auto max-w-[1600px] space-y-6 pb-12">
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

      <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-4">
        <div className="rounded-2xl border border-border/70 bg-card/60 p-3.5 shadow-2xs backdrop-blur-xs">
          <div className="flex items-center gap-2 text-muted-foreground">
            <CalendarIcon className="size-4 text-primary" />
            <span className="text-[11px] font-semibold">Sprint đánh giá</span>
          </div>
          <p className="mt-2 truncate text-base font-extrabold text-foreground">
            {selectedSprint?.name || "Chưa chọn"}
          </p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            {selectedSprint ? formatSprintStateLabel(selectedSprint.state) : "—"}
          </p>
        </div>

        <div className="rounded-2xl border border-border/70 bg-card/60 p-3.5 shadow-2xs backdrop-blur-xs">
          <div className="flex items-center gap-2 text-muted-foreground">
            <ClockIcon className="size-4 text-primary" />
            <span className="text-[11px] font-semibold">Cửa sổ đánh giá</span>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <span
              className={cn(
                "size-2 rounded-full",
                windowOpen ? "animate-pulse bg-emerald-500" : "bg-amber-500",
              )}
            />
            <p className="text-base font-extrabold text-foreground">
              {windowOpen ? "Đang mở" : "Đang khóa"}
            </p>
          </div>
          <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
            {windowOpen
              ? "Sẵn sàng ghi nhận điểm"
              : selectedSprint && formatPeerReviewOpenAt(selectedSprint)
                ? `Mở lúc ${formatPeerReviewOpenAt(selectedSprint)}`
                : "Chỉ mở khi Sprint đã đóng"}
          </p>
        </div>

        <div className="rounded-2xl border border-border/70 bg-card/60 p-3.5 shadow-2xs backdrop-blur-xs">
          <div className="flex items-center gap-2 text-muted-foreground">
            <UserCheckIcon className="size-4 text-primary" />
            <span className="text-[11px] font-semibold">Tiến độ hoàn thành</span>
          </div>
          <p className="mt-2 text-base font-extrabold text-foreground">
            {windowOpen ? `${reviewedCount}/${candidates.length}` : "—"}
          </p>
          <div className="mt-1.5 flex items-center gap-2">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all duration-300"
                style={{ width: `${completionRate}%` }}
              />
            </div>
            <span className="font-mono text-[10px] font-bold text-muted-foreground">
              {completionRate}%
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-border/70 bg-card/60 p-3.5 shadow-2xs backdrop-blur-xs">
          <div className="flex items-center gap-2 text-muted-foreground">
            <AwardIcon className="size-4 text-primary" />
            <span className="text-[11px] font-semibold">Khung tiêu chí</span>
          </div>
          <p className="mt-2 text-base font-extrabold text-foreground">
            {rubric?.criteria.length || 0} mục
          </p>
          <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
            {rubric ? "Thang điểm 5 sao" : "Chưa tải rubric"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
        <div className="space-y-5 lg:col-span-4">
          <div className="relative z-20 rounded-3xl border border-border/70 bg-card/60 p-5 shadow-2xs backdrop-blur-xs">
            <div className="flex items-center justify-between gap-2 border-b border-border/50 pb-3">
              <div className="flex items-center gap-2">
                <div className="flex size-7 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <CalendarIcon className="size-4" />
                </div>
                <h2 className="text-sm font-bold text-foreground">Bộ chọn Sprint</h2>
              </div>
              {selectedSprint ? (
                <Badge variant="outline" className="text-[10px] font-medium">
                  {formatSprintStateLabel(selectedSprint.state)}
                </Badge>
              ) : null}
            </div>

            <div className="mt-4 space-y-2">
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

            {selectedSprint ? (
              <div className="mt-4 space-y-1.5 rounded-2xl border border-border/60 bg-muted/20 p-3 text-xs">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>Tên Sprint:</span>
                  <span className="font-semibold text-foreground">
                    {selectedSprint.name}
                  </span>
                </div>
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>Trạng thái đánh giá:</span>
                  <span
                    className={cn(
                      "font-semibold",
                      windowOpen
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-amber-600 dark:text-amber-400",
                    )}
                  >
                    {windowOpen ? "Đang mở cửa sổ" : "Đang khóa"}
                  </span>
                </div>
                {formatPeerReviewOpenAt(selectedSprint) ? (
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>Thời điểm mở:</span>
                    <span className="font-mono text-[11px] text-foreground">
                      {formatPeerReviewOpenAt(selectedSprint)}
                    </span>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>

          <div className="relative z-10 space-y-3 rounded-3xl border border-border/70 bg-card/60 p-5 shadow-2xs backdrop-blur-xs">
            <div className="flex items-center gap-2 border-b border-border/50 pb-3">
              <div className="flex size-7 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <ShieldCheckIcon className="size-4" />
              </div>
              <h2 className="text-sm font-bold text-foreground">Nguyên tắc bảo mật</h2>
            </div>

            <div className="flex items-start gap-2.5 rounded-2xl border border-primary/20 bg-primary/5 p-3.5 text-xs leading-relaxed text-muted-foreground">
              <InfoIcon className="mt-0.5 size-4 shrink-0 text-primary" />
              <p>
                Chỉ hiển thị trạng thái đánh giá do bạn gửi. Không tải bảng kết quả
                toàn nhóm để bảo vệ nội dung đánh giá của các thành viên.
              </p>
            </div>

            <div className="space-y-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <span className="size-1.5 shrink-0 rounded-full bg-primary" />
                <span>Đánh giá hoàn toàn ẩn danh giữa các thành viên sinh viên.</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="size-1.5 shrink-0 rounded-full bg-primary" />
                <span>Chấm điểm khách quan dựa trên đóng góp thực tế trong Sprint.</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="size-1.5 shrink-0 rounded-full bg-primary" />
                <span>Mọi thành viên đều có quyền đánh giá đồng đẳng như nhau.</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-5 lg:col-span-8">
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
            <div className="h-60 animate-pulse rounded-3xl bg-muted/60" />
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
            <>
              <div className="space-y-4 rounded-3xl border border-border/70 bg-card/60 p-5 shadow-2xs backdrop-blur-xs">
                <div className="flex flex-col gap-2 border-b border-border/50 pb-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-sm font-bold text-foreground">
                      Danh sách thành viên cần đánh giá ({candidates.length})
                    </h2>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                      Chấm điểm và phản hồi đóng góp công sức cho các thành viên cùng thực hiện Sprint
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className={cn(
                      "self-start font-mono text-xs font-semibold px-2.5 py-1 sm:self-auto",
                      reviewedCount === candidates.length && candidates.length > 0
                        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : "border-primary/30 bg-primary/10 text-primary",
                    )}
                  >
                    Hoàn thành {reviewedCount}/{candidates.length}
                  </Badge>
                </div>

                {candidatesQuery.isLoading ? (
                  <div className="space-y-3">
                    <div className="h-20 animate-pulse rounded-2xl bg-muted/60" />
                    <div className="h-20 animate-pulse rounded-2xl bg-muted/60" />
                  </div>
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
                  <div className="space-y-3">
                    {candidates.map((candidate) => {
                      const role = resolveCandidateTeamRole(
                        team?.members || [],
                        candidate.studentCode,
                      );
                      const initials = (candidate.fullName || "SV")
                        .split(" ")
                        .filter(Boolean)
                        .slice(-2)
                        .map((w) => w[0])
                        .join("")
                        .toUpperCase();
                      const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(candidate.studentCode || candidate.fullName)}`;

                      return (
                        <div
                          key={candidate.studentId}
                          className={cn(
                            "group relative flex flex-col gap-3 rounded-2xl border p-4 shadow-2xs transition-all duration-200 sm:flex-row sm:items-center sm:justify-between",
                            candidate.alreadyReviewed
                              ? "border-border/60 bg-muted/15"
                              : "border-border/80 bg-card hover:border-primary/40 hover:shadow-xs",
                          )}
                        >
                          <div className="flex items-center gap-3.5">
                            <Avatar
                              size="lg"
                              className="size-11 ring-2 ring-border/80 transition-all group-hover:ring-primary/40"
                            >
                              <AvatarImage src={avatarUrl} alt={candidate.fullName} />
                              <AvatarFallback className="bg-primary/10 text-xs font-bold text-primary">
                                {initials}
                              </AvatarFallback>
                            </Avatar>

                            <div>
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-bold text-foreground transition-colors group-hover:text-primary">
                                  {candidate.fullName}
                                </p>
                                {role ? <MemberRoleBadge role={role} size="sm" /> : null}
                              </div>
                              <div className="mt-0.5 flex items-center gap-2">
                                <span className="font-mono text-xs text-muted-foreground">
                                  {candidate.studentCode || candidate.studentId}
                                </span>
                                <span className="text-muted-foreground/30">·</span>
                                <span className="text-[11px] text-muted-foreground">
                                  {candidate.alreadyReviewed
                                    ? "Đã gửi đánh giá"
                                    : "Chờ bạn chấm điểm"}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-2.5 sm:justify-end">
                            {candidate.alreadyReviewed ? (
                              <Badge
                                variant="outline"
                                className="gap-1 border-primary/30 bg-primary/10 px-2.5 py-1 font-mono text-[11px] font-semibold text-primary"
                              >
                                <StarIcon className="size-3 fill-primary text-primary" />
                                Đã gửi · {candidate.existingTotalStarRating ?? "—"} /{" "}
                                {maxStars}
                              </Badge>
                            ) : (
                              <Badge
                                variant="outline"
                                className="gap-1 border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400"
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
                                className="h-8.5 rounded-xl border-emerald-500/30 bg-emerald-500/10 text-xs font-semibold text-emerald-600 disabled:opacity-100 dark:text-emerald-400"
                              >
                                <CheckCircle2Icon className="size-3.5" />
                                Đã đánh giá
                              </Button>
                            ) : (
                              <Button
                                type="button"
                                size="sm"
                                className="h-8.5 cursor-pointer gap-1.5 rounded-xl bg-primary text-xs font-semibold shadow-xs hover:bg-primary/90"
                                onClick={() => setSelectedCandidate(candidate)}
                              >
                                <StarIcon className="size-3.5 fill-current" />
                                Đánh giá
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {windowOpen &&
                  reviewedCount === candidates.length &&
                  candidates.length > 0 ? (
                  <div className="flex items-center gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-xs text-emerald-700 dark:text-emerald-300">
                    <div className="flex size-7 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20">
                      <SparklesIcon className="size-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <p className="font-semibold">
                      Bạn đã hoàn thành đánh giá chéo cho toàn bộ thành viên trong
                      Sprint này. Kết quả đã được hệ thống lưu trữ an toàn.
                    </p>
                  </div>
                ) : null}
              </div>

              <div className="rounded-3xl border border-border/70 bg-card/60 p-5 shadow-2xs backdrop-blur-xs">
                <div className="flex items-center justify-between gap-2 border-b border-border/50 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="flex size-7 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <AwardIcon className="size-4" />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-foreground">
                        Chi tiết tiêu chí ({rubric?.criteria.length || 0})
                      </h2>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Khung tiêu chuẩn đánh giá áp dụng cho toàn bộ thành viên nhóm
                      </p>
                    </div>
                  </div>
                  {rubric ? (
                    <Badge variant="secondary" className="text-[10px] font-medium">
                      Rubric đánh giá
                    </Badge>
                  ) : null}
                </div>

                <div className="mt-4">
                  {rubric?.criteria && rubric.criteria.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      {rubric.criteria.map((item, idx) => (
                        <div
                          key={item.rubricId || idx}
                          className="flex flex-col justify-between rounded-2xl border border-border/60 bg-muted/20 p-3.5 transition-all hover:border-primary/40 hover:bg-muted/30"
                        >
                          <div>
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <span className="flex size-5.5 shrink-0 items-center justify-center rounded-lg bg-primary/10 font-mono text-xs font-bold text-primary">
                                  {idx + 1}
                                </span>
                                <p className="text-xs font-bold text-foreground">
                                  {item.criteriaName}
                                </p>
                              </div>
                              <span className="inline-flex shrink-0 items-center gap-0.5 font-mono text-[11px] font-bold text-amber-500">
                                <StarIcon className="size-3 fill-amber-500 text-amber-500" />
                                1-5★
                              </span>
                            </div>
                            {item.description ? (
                              <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
                                {item.description}
                              </p>
                            ) : null}
                          </div>
                          <div className="mt-3 pt-2.5 border-t border-border/40 flex items-center justify-between text-[10px] text-muted-foreground">
                            <span>Thang điểm:</span>
                            <span className="font-semibold text-foreground">1 (thấp nhất) - 5 (cao nhất)</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="rounded-2xl border border-dashed border-border/80 p-4 text-center text-xs text-muted-foreground">
                      Chưa có thông tin tiêu chí đánh giá
                    </p>
                  )}
                </div>
              </div>

              <div className="rounded-3xl border border-border/70 bg-card/60 p-5 shadow-2xs backdrop-blur-xs">
                <div className="flex items-center gap-2 border-b border-border/50 pb-3">
                  <div className="flex size-7 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
                    <StarIcon className="size-4 fill-amber-500 text-amber-500" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-foreground">
                      Quy chuẩn xếp loại mức sao
                    </h2>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Hướng dẫn cho điểm khách quan theo mức độ hoàn thành nhiệm vụ
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                  <div className="rounded-2xl border border-border/60 bg-muted/20 p-2.5 text-center">
                    <p className="font-mono text-xs font-bold text-amber-600 dark:text-amber-400">1 Sao</p>
                    <p className="mt-1 text-[11px] font-semibold text-foreground">Cần cải thiện</p>
                    <p className="mt-0.5 text-[10px] text-muted-foreground">Chưa đạt cam kết</p>
                  </div>
                  <div className="rounded-2xl border border-border/60 bg-muted/20 p-2.5 text-center">
                    <p className="font-mono text-xs font-bold text-amber-600 dark:text-amber-400">2 Sao</p>
                    <p className="mt-1 text-[11px] font-semibold text-foreground">Chưa đạt kỳ vọng</p>
                    <p className="mt-0.5 text-[10px] text-muted-foreground">Chậm trễ tiến độ</p>
                  </div>
                  <div className="rounded-2xl border border-border/60 bg-muted/20 p-2.5 text-center">
                    <p className="font-mono text-xs font-bold text-amber-600 dark:text-amber-400">3 Sao</p>
                    <p className="mt-1 text-[11px] font-semibold text-foreground">Đạt yêu cầu</p>
                    <p className="mt-0.5 text-[10px] text-muted-foreground">Hoàn thành việc giao</p>
                  </div>
                  <div className="rounded-2xl border border-border/60 bg-muted/20 p-2.5 text-center">
                    <p className="font-mono text-xs font-bold text-amber-600 dark:text-amber-400">4 Sao</p>
                    <p className="mt-1 text-[11px] font-semibold text-foreground">Làm tốt</p>
                    <p className="mt-0.5 text-[10px] text-muted-foreground">Chất lượng cao</p>
                  </div>
                  <div className="col-span-2 sm:col-span-1 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-2.5 text-center">
                    <p className="font-mono text-xs font-bold text-amber-600 dark:text-amber-400">5 Sao</p>
                    <p className="mt-1 text-[11px] font-semibold text-foreground">Xuất sắc</p>
                    <p className="mt-0.5 text-[10px] text-muted-foreground">Đóng góp vượt trội</p>
                  </div>
                </div>
              </div>
            </>
          ) : null}
        </div>
      </div>

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

