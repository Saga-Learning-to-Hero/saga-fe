"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronDownIcon,
  MessageSquareMoreIcon,
  MoreHorizontalIcon,
  NetworkIcon,
  UsersIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import {
  lecturerCourseGraphPath,
  lecturerCoursePeerReviewsPath,
  lecturerCourseTeamPath,
} from "../lib/course-routes";
import {
  canOpenDashboardProject,
  formatChannelStatus,
  formatDashboardInstant,
  formatNullablePercent,
  formatRiskReason,
  formatSignedDelta,
  formatSyncJobStatus,
  hasCurrentSprintActivitySeries,
  RISK_LEVEL_LABELS,
  sortDashboardRiskReasons,
} from "../lib/lecturer-dashboard-format";
import type {
  LecturerDashboardRiskLevel,
  LecturerDashboardTeam,
} from "../types/lecturer-course-dashboard";
import { CourseDashboardSparkline } from "./course-dashboard-sparkline";

const RISK_BADGE_CLASS: Record<LecturerDashboardRiskLevel, string> = {
  HEALTHY: "border-chart-3/30 bg-chart-3/10 text-chart-3",
  WARNING: "border-chart-4/30 bg-chart-4/10 text-chart-4",
  CRITICAL: "border-destructive/30 bg-destructive/10 text-destructive",
  UNKNOWN: "border-border bg-muted text-muted-foreground",
};

interface CourseDashboardTeamCardProps {
  courseId: string;
  team: LecturerDashboardTeam;
  isHighlighted?: boolean;
}

export function CourseDashboardTeamCard({
  courseId,
  team,
  isHighlighted = false,
}: CourseDashboardTeamCardProps) {
  const router = useRouter();
  const canOpenProject = canOpenDashboardProject(team.projectId);
  const reasons = sortDashboardRiskReasons(team.risk.reasons);
  const visibleReasons = reasons.slice(0, 2);
  const remainingReasons = Math.max(0, reasons.length - visibleReasons.length);
  const setupNotices = getSetupNotices(team);
  const completionPercent = team.progress?.completionPercent;
  const teamPath = lecturerCourseTeamPath(courseId, team.teamId);
  const graphPath = lecturerCourseGraphPath(courseId, team.teamId);
  const peerReviewPath = lecturerCoursePeerReviewsPath(courseId, {
    teamId: team.teamId,
    sprintId: team.currentSprint?.sprintId,
  });

  return (
    <Card
      data-team-id={team.teamId}
      className={cn(
        "overflow-hidden rounded-2xl border border-border/80 bg-card shadow-xs transition-all duration-200",
        isHighlighted && "border-primary/60 bg-primary/5 ring-2 ring-primary/20"
      )}
    >
      <div className="grid gap-4 p-4 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1.15fr)_minmax(15rem,1fr)_auto] lg:items-center">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-primary/10 px-2 py-0.5 font-mono text-[11px] font-bold text-primary">
              Nhóm {team.teamNo}
            </span>
            <h3 className="truncate text-sm font-extrabold text-foreground">{team.teamName}</h3>
          </div>
          <p className="mt-1 truncate text-xs text-muted-foreground">
            {team.projectName || "Chưa có tên dự án"}
          </p>
          <p className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
            <UsersIcon className="size-3" /> {team.memberCount} thành viên
          </p>
        </div>

        <div className="min-w-0 space-y-2">
          <Badge
            variant="outline"
            className={cn("font-semibold", RISK_BADGE_CLASS[team.risk.level])}
          >
            {RISK_LEVEL_LABELS[team.risk.level]}
          </Badge>
          {visibleReasons.length > 0 ? (
            <ul className="space-y-1 text-xs text-muted-foreground">
              {visibleReasons.map((reason, index) => (
                <li key={`${reason.code}-${index}`} className="flex min-w-0 gap-2">
                  <span aria-hidden="true" className="mt-1.5 size-1.5 shrink-0 rounded-full bg-current opacity-60" />
                  <span className="truncate">{formatRiskReason(reason)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-muted-foreground">Không có vấn đề cần xử lý.</p>
          )}
        </div>

        <div className="min-w-0">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                Tiến độ Sprint
              </p>
              <p className="mt-0.5 font-mono text-sm font-black text-foreground">
                {team.progress ? `${team.progress.done}/${team.progress.totalTasks}` : "—"}
                <span className="ml-2 text-xs font-medium text-muted-foreground">
                  {formatNullablePercent(completionPercent)}
                </span>
              </p>
            </div>
            {hasCurrentSprintActivitySeries(team) && team.activity ? (
              <CourseDashboardSparkline series={team.activity.series} />
            ) : null}
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
            {completionPercent !== null && completionPercent !== undefined ? (
              <div
                className="h-full rounded-full bg-primary transition-[width]"
                style={{ width: `${Math.min(100, Math.max(0, completionPercent))}%` }}
              />
            ) : null}
          </div>
          <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
            {team.progress ? (
              <>
                <span>{team.progress.overdue} quá hạn</span>
                <span>{team.progress.blocked} bị chặn</span>
              </>
            ) : (
              <span>Chưa có dữ liệu công việc</span>
            )}
            <span>
              Hoạt động gần nhất: {formatDashboardInstant(team.activity?.lastActivityAt, "chưa có")}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 lg:pl-2">
          <Link
            href={teamPath}
            prefetch={true}
            className={cn(buttonVariants({ size: "sm" }), "h-8 px-3 text-xs")}
          >
            Xem nhóm
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger
              aria-label={`Thao tác với ${team.teamName}`}
              className="inline-flex size-8 cursor-pointer items-center justify-center rounded-lg border border-border bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <MoreHorizontalIcon className="size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuLabel className="text-[11px]">Xem thông tin nhóm</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {canOpenProject ? (
                <DropdownMenuItem
                  className="cursor-pointer gap-2 text-xs"
                  onClick={() => router.push(graphPath)}
                >
                  <NetworkIcon className="size-3.5" /> Xem đồ thị
                </DropdownMenuItem>
              ) : null}
              {team.peerReview ? (
                <DropdownMenuItem
                  className="cursor-pointer gap-2 text-xs"
                  onClick={() => router.push(peerReviewPath)}
                >
                  <MessageSquareMoreIcon className="size-3.5" /> Xem đánh giá chéo
                </DropdownMenuItem>
              ) : null}
              {!canOpenProject && !team.peerReview ? (
                <DropdownMenuItem disabled className="text-xs">Chưa có dữ liệu chi tiết</DropdownMenuItem>
              ) : null}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {(remainingReasons > 0 || setupNotices.length > 0 || team.previousSprintComparison || team.traceability || team.peerReview) ? (
        <details className="group border-t border-border/70 bg-muted/15">
          <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-2.5 text-xs font-semibold text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground">
            <span>{remainingReasons > 0 ? `+${remainingReasons} vấn đề và thông tin chi tiết` : "Thông tin chi tiết"}</span>
            <ChevronDownIcon className="size-4 transition-transform group-open:rotate-180" />
          </summary>
          <div className="grid gap-4 border-t border-border/50 px-4 py-4 text-xs sm:grid-cols-2 xl:grid-cols-4">
            <DetailBlock label="Truy vết công việc" value={formatNullablePercent(team.traceability?.taskCommitLinkRate)} hint={team.traceability ? `${team.traceability.completedTasksWithCommit}/${team.traceability.completedTasks} công việc có commit` : "Chưa có dữ liệu"} />
            <DetailBlock label="Đánh giá chéo" value={team.peerReview ? `${team.peerReview.submittedReviews}/${team.peerReview.expectedReviews}` : "—"} hint={team.peerReview ? `${team.peerReview.pendingStudentCount} thành viên chưa nộp` : "Chưa có dữ liệu"} />
            <DetailBlock label="Chênh lệch tiến độ" value={formatSignedDelta(team.progress?.scheduleGapPercentagePoints, " điểm %")} hint={team.currentSprint?.sprintName || "Chưa có Sprint hiện tại"} />
            <DetailBlock label="So với Sprint trước" value={formatSignedDelta(team.previousSprintComparison?.completionDeltaPercentagePoints, " điểm %")} hint={team.previousSprintComparison?.sprintName || "Chưa có dữ liệu so sánh"} />
            {remainingReasons > 0 ? (
              <ul className="space-y-1 rounded-xl bg-muted/50 p-3 text-muted-foreground sm:col-span-2">
                {reasons.slice(2).map((reason, index) => <li key={`${reason.code}-${index}`}>• {formatRiskReason(reason)}</li>)}
              </ul>
            ) : null}
            {setupNotices.length > 0 ? (
              <div className="rounded-xl border border-chart-4/25 bg-chart-4/10 p-3 text-muted-foreground sm:col-span-2">
                <p className="font-bold text-foreground">Thiết lập cần hoàn tất</p>
                {setupNotices.map((notice) => <p key={notice} className="mt-1">• {notice}</p>)}
              </div>
            ) : null}
          </div>
        </details>
      ) : null}
    </Card>
  );
}

function getSetupNotices(team: LecturerDashboardTeam): string[] {
  const notices: string[] = [];
  if (team.configuration.contributionMode === "PROJECT_GROUP" && !team.configuration.contributionWeightsConfigured) notices.push("Chưa cấu hình trọng số riêng cho nhóm");
  if (team.sync?.jiraStatus !== undefined && team.sync?.jiraStatus !== "ACTIVE") notices.push(`Jira: ${formatChannelStatus(team.sync?.jiraStatus)}`);
  else if (team.sync?.jiraSyncStatus === "FAILED") notices.push(`Jira: ${formatSyncJobStatus(team.sync.jiraSyncStatus)}`);
  if (team.sync?.githubStatus !== undefined && team.sync?.githubStatus !== "ACTIVE") notices.push(`GitHub: ${formatChannelStatus(team.sync?.githubStatus)}`);
  else if (team.sync?.githubSyncStatus === "FAILED") notices.push(`GitHub: ${formatSyncJobStatus(team.sync.githubSyncStatus)}`);
  return notices;
}

function DetailBlock({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="rounded-xl border border-border/70 bg-card p-3">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className="mt-1 font-mono text-sm font-bold text-foreground">{value}</p>
      <p className="mt-1 text-[11px] text-muted-foreground">{hint}</p>
    </div>
  );
}
