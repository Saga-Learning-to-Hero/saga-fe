"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeftIcon, ChevronDownIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CourseQueryError } from "@/features/lecturer/courses/components/course-query-error";
import {
  useLecturerCourse,
  useLecturerCourseAccess,
} from "@/features/lecturer/courses/hooks/use-lecturer-courses";
import { useLecturerTeams } from "@/features/lecturer/teams/hooks/use-lecturer-teams";
import {
  lecturerCourseDashboardPath,
  lecturerCourseTeamPath,
  lecturerCourseTeamsPath,
  lecturerCoursesPath,
} from "@/features/lecturer/courses/lib/course-routes";
import {
  useContributionEvaluation,
  useOverrideContribution,
} from "../hooks/use-lecturer-contribution";
import type { ContributionMember } from "../types/contribution";
import {
  SLICE_WEIGHT_FIELDS,
  SLICE_WEIGHT_LABELS,
  contributionModeLabel,
  contributionRoleLabel,
  formatContributionNumber,
  formatContributionPercent,
} from "../lib/contribution-utils";
import { ContributionOverrideDialog } from "./contribution-override-dialog";
import { getApiErrorCode } from "@/lib/api-error";

interface ContributionEvaluationPageProps {
  courseId: string;
  teamId: string;
}

export function ContributionEvaluationPage({ courseId, teamId }: ContributionEvaluationPageProps) {
  const courseQuery = useLecturerCourse(courseId);
  const teamsQuery = useLecturerTeams(courseId);
  const evaluationQuery = useContributionEvaluation(teamId);
  const overrideMutation = useOverrideContribution(teamId);
  const courseAccess = useLecturerCourseAccess(courseQuery.isError, courseQuery.error);
  const teamsAccess = useLecturerCourseAccess(teamsQuery.isError, teamsQuery.error);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [overrideMember, setOverrideMember] = useState<ContributionMember | null>(null);

  const team = (teamsQuery.data?.teams ?? []).find((item) => item.teamId === teamId);
  const evaluation = evaluationQuery.data;
  const warnings = useMemo(
    () => (evaluation?.members ?? []).flatMap((member) => member.warnings),
    [evaluation?.members]
  );

  if (courseAccess.isAccessDenied || teamsAccess.isAccessDenied) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
        Đang chuyển về danh sách lớp...
      </div>
    );
  }

  if (courseQuery.isError) {
    return <CourseQueryError error={courseQuery.error} onRetry={() => void courseQuery.refetch()} />;
  }

  if (teamsQuery.isError) {
    return <CourseQueryError error={teamsQuery.error} onRetry={() => void teamsQuery.refetch()} />;
  }

  if (evaluationQuery.isError) {
    const code = getApiErrorCode(evaluationQuery.error);
    if (code === "TEAM_NOT_FOUND") {
      return (
        <Card className="mx-auto max-w-2xl rounded-2xl border border-dashed border-border p-8 text-center">
          <h1 className="text-lg font-bold">Không tìm thấy nhóm</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Định danh nhóm không còn trên máy chủ. Không dùng mock ID để mở đánh giá đóng góp.
          </p>
          <Link
            href={lecturerCourseTeamsPath(courseId)}
            prefetch={true}
            className={buttonVariants({ size: "sm", className: "mt-4 text-xs" })}
          >
            Về danh sách nhóm
          </Link>
        </Card>
      );
    }
    return (
      <CourseQueryError error={evaluationQuery.error} onRetry={() => void evaluationQuery.refetch()} />
    );
  }

  if (courseQuery.isLoading || teamsQuery.isLoading || evaluationQuery.isLoading) {
    return (
      <div className="mx-auto max-w-[1100px] space-y-4">
        <div className="h-8 w-64 animate-pulse rounded-xl bg-muted" />
        <div className="h-48 animate-pulse rounded-2xl bg-muted/60" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1100px] space-y-6 pb-12">
      <div className="flex items-center gap-3">
        <Link
          href={lecturerCourseTeamPath(courseId, teamId)}
          prefetch={true}
          aria-label="Quay lại thông tin nhóm"
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
            {courseQuery.data?.courseCode}
          </Link>
          <span>/</span>
          <span className="font-semibold text-foreground">
            {team?.teamName || "Đánh giá đóng góp"}
          </span>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
        <p className="text-[11px] font-bold tracking-widest text-muted-foreground uppercase">
          Đánh giá đóng góp nhóm
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <h1 className="text-xl font-extrabold tracking-tight">Tỷ lệ đóng góp thành viên</h1>
          <Badge variant="outline">{contributionModeLabel(evaluation?.configMode ?? "COURSE")}</Badge>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Số liệu hiển thị đúng như máy chủ trả về. Giao diện không tự tính lại tỷ lệ đóng góp.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {SLICE_WEIGHT_FIELDS.map((field) => (
          <Card key={field} className="rounded-2xl border border-border p-4">
            <p className="text-xs text-muted-foreground">{SLICE_WEIGHT_LABELS[field].title}</p>
            <p className="mt-1 font-mono text-lg font-bold">
              {formatContributionNumber(evaluation?.sliceWeights[field])}
            </p>
          </Card>
        ))}
      </div>

      {warnings.length > 0 && (
        <Card className="rounded-2xl border-amber-500/30 bg-amber-500/10 p-4">
          <p className="text-sm font-semibold">Cảnh báo từ máy chủ</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-muted-foreground">
            {warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        </Card>
      )}

      <Card className="overflow-hidden rounded-2xl border border-border shadow-xs">
        {(evaluation?.members ?? []).length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            Nhóm chưa có dữ liệu thành viên để đánh giá đóng góp.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Thành viên</TableHead>
                <TableHead>Vai trò</TableHead>
                <TableHead>Phát triển</TableHead>
                <TableHead>Kiểm thử</TableHead>
                <TableHead>Tài liệu</TableHead>
                <TableHead>Nghiên cứu</TableHead>
                <TableHead>Công việc</TableHead>
                <TableHead>Đánh giá chéo</TableHead>
                <TableHead>Tỷ lệ cuối</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {(evaluation?.members ?? []).map((member) => {
                const expanded = expandedId === member.studentProfileId;
                return (
                  <MemberRows
                    key={member.studentProfileId || member.studentCode}
                    member={member}
                    expanded={expanded}
                    onToggle={() =>
                      setExpandedId(expanded ? null : member.studentProfileId || member.studentCode)
                    }
                    onOverride={() => setOverrideMember(member)}
                  />
                );
              })}
            </TableBody>
          </Table>
        )}
      </Card>

      <ContributionOverrideDialog
        open={overrideMember !== null}
        member={overrideMember}
        isSaving={overrideMutation.isPending}
        onOpenChange={(open) => {
          if (!open) setOverrideMember(null);
        }}
        onSubmit={({ percentage, reason }) => {
          if (!overrideMember?.studentProfileId) return;
          overrideMutation.mutate(
            {
              studentProfileId: overrideMember.studentProfileId,
              percentage,
              reason,
            },
            {
              onSuccess: () => setOverrideMember(null),
            }
          );
        }}
      />
    </div>
  );
}

function MemberRows({
  member,
  expanded,
  onToggle,
  onOverride,
}: {
  member: ContributionMember;
  expanded: boolean;
  onToggle: () => void;
  onOverride: () => void;
}) {
  return (
    <>
      <TableRow>
        <TableCell>
          <p className="text-sm font-semibold">{member.fullName}</p>
          <p className="font-mono text-[11px] text-muted-foreground">{member.studentCode}</p>
        </TableCell>
        <TableCell>
          <Badge variant="outline" className="text-[10px]">
            {contributionRoleLabel(member.roleInTeam)}
          </Badge>
        </TableCell>
        <TableCell className="font-mono text-xs">
          {formatContributionPercent(member.codeContributionPercentage)}
        </TableCell>
        <TableCell className="font-mono text-xs">
          {formatContributionPercent(member.testContributionPercentage)}
        </TableCell>
        <TableCell className="font-mono text-xs">
          {formatContributionPercent(member.documentContributionPercentage)}
        </TableCell>
        <TableCell className="font-mono text-xs">
          {formatContributionPercent(member.researchContributionPercentage)}
        </TableCell>
        <TableCell className="font-mono text-xs">
          {formatContributionPercent(member.taskContributionPercentage)}
        </TableCell>
        <TableCell className="font-mono text-xs">{formatContributionNumber(member.peerReviewScore)}</TableCell>
        <TableCell className="font-mono text-xs font-bold">
          {formatContributionPercent(member.finalContributionPercentage)}
        </TableCell>
        <TableCell className="space-x-1 text-right">
          <Button type="button" size="sm" variant="ghost" className="h-8 cursor-pointer text-xs" onClick={onToggle}>
            Chi tiết
            <ChevronDownIcon className={`ml-1 size-3.5 transition ${expanded ? "rotate-180" : ""}`} />
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-8 cursor-pointer text-xs"
            disabled={!member.studentProfileId}
            onClick={onOverride}
          >
            Điều chỉnh
          </Button>
        </TableCell>
      </TableRow>
      {expanded && (
        <TableRow>
          <TableCell colSpan={10} className="bg-muted/30">
            {member.warnings.length > 0 && (
              <ul className="mb-3 list-disc pl-5 text-xs text-amber-700 dark:text-amber-300">
                {member.warnings.map((warning) => (
                  <li key={warning}>{warning}</li>
                ))}
              </ul>
            )}
            {member.sprintBreakdowns.length === 0 ? (
              <p className="text-xs text-muted-foreground">Máy chủ chưa trả phân rã theo sprint cho thành viên này.</p>
            ) : (
              <div className="space-y-2">
                {member.sprintBreakdowns.map((sprint) => (
                  <div
                    key={sprint.sprintId || sprint.sprintName}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-background px-3 py-2 text-xs"
                  >
                    <span className="font-semibold">{sprint.sprintName || "Sprint"}</span>
                    <span className="font-mono">
                      {formatContributionPercent(sprint.contributionPercentage)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </TableCell>
        </TableRow>
      )}
    </>
  );
}
