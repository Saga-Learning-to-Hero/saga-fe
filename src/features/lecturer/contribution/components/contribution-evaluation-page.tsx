"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronDownIcon, EllipsisIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CustomSelect } from "@/components/common/custom-select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CourseQueryError } from "@/features/lecturer/courses/components/course-query-error";
import { LecturerPageShell } from "@/features/lecturer/courses/components/lecturer-page-shell";
import { useLecturerCourse } from "@/features/lecturer/courses/hooks/use-lecturer-courses";
import { useLecturerTeams } from "@/features/lecturer/teams/hooks/use-lecturer-teams";
import {
  lecturerCourseDashboardPath,
  lecturerCourseGradesPath,
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
  appliedContributionModeLabel,
  canFetchContributionEvaluation,
  contributionRoleLabel,
  detectSliceWeightScale,
  formatContributionNumber,
  formatContributionPercent,
  pickDefaultGradesTeamId,
  toDisplaySliceWeights,
} from "../lib/contribution-utils";
import { ContributionOverrideDialog } from "./contribution-override-dialog";
import { getApiErrorCode } from "@/lib/api-error";
import { cn } from "@/lib/utils";

interface ContributionEvaluationPageProps {
  courseId: string;
}

export function ContributionEvaluationPage({ courseId }: ContributionEvaluationPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedTeamId = searchParams.get("teamId")?.trim() ?? "";
  const courseQuery = useLecturerCourse(courseId);
  const teamsQuery = useLecturerTeams(courseId);
  const teams = useMemo(
    () => [...(teamsQuery.data?.teams ?? [])].sort((a, b) => a.teamNo - b.teamNo),
    [teamsQuery.data?.teams]
  );
  const defaultTeamId = pickDefaultGradesTeamId(teams);
  const team = teams.find((item) => item.teamId === requestedTeamId);
  const teamBelongsToCourse = Boolean(team);
  const invalidTeamId = Boolean(requestedTeamId) && teamsQuery.isSuccess && !teamBelongsToCourse;
  const waitingForDefaultTeam =
    teamsQuery.isSuccess && teams.length > 0 && !requestedTeamId && Boolean(defaultTeamId);
  const evaluationQuery = useContributionEvaluation(requestedTeamId, {
    enabled:
      !invalidTeamId &&
      canFetchContributionEvaluation(teamsQuery.isSuccess, requestedTeamId, teams),
  });
  const overrideMutation = useOverrideContribution(requestedTeamId);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [overrideMember, setOverrideMember] = useState<ContributionMember | null>(null);

  useEffect(() => {
    if (!teamsQuery.isSuccess || requestedTeamId || !defaultTeamId) return;
    router.replace(lecturerCourseGradesPath(courseId, defaultTeamId), { scroll: false });
  }, [courseId, defaultTeamId, requestedTeamId, router, teamsQuery.isSuccess]);

  const evaluation = evaluationQuery.data;
  const sliceScale = evaluation ? detectSliceWeightScale(evaluation.sliceWeights) : 100;
  const displaySliceWeights = evaluation
    ? toDisplaySliceWeights(evaluation.sliceWeights, sliceScale)
    : null;
  const warnings = useMemo(
    () => [
      ...new Set((evaluation?.members ?? []).flatMap((member) => member.warnings)),
    ],
    [evaluation?.members]
  );

  const breadcrumbItems = [
    { label: "Lớp học phần", href: lecturerCoursesPath() },
    {
      label: courseQuery.data?.courseCode || "Mã lớp",
      href: lecturerCourseDashboardPath(courseId),
    },
    { label: "Bảng điểm đóng góp" },
  ];

  const handleSelectTeam = (teamId: string) => {
    router.replace(lecturerCourseGradesPath(courseId, teamId), { scroll: false });
    setExpandedId(null);
  };

  const teamSwitcher =
    teams.length > 0 ? (
      <div className="w-full min-w-[220px] sm:w-72">
        <Label htmlFor="grades-team" className="sr-only">
          Chọn nhóm
        </Label>
        <CustomSelect
          id="grades-team"
          value={teamBelongsToCourse ? requestedTeamId : ""}
          onChange={handleSelectTeam}
          placeholder="Chọn nhóm"
          options={teams.map((item) => ({
            value: item.teamId,
            label: item.teamName || `Nhóm ${item.teamNo}`,
            subLabel: `Mã nhóm ${item.teamNo}${item.projectId ? " · Đã có dự án" : " · Chưa có dự án"}`,
          }))}
        />
      </div>
    ) : null;

  if (teamsQuery.isError) {
    return (
      <LecturerPageShell
        breadcrumbItems={breadcrumbItems}
        title="Bảng điểm đóng góp theo nhóm"
        error={teamsQuery.error}
        errorTitle="Không tải được danh sách nhóm"
        onRetry={() => void teamsQuery.refetch()}
      />
    );
  }

  if (teamsQuery.isSuccess && teams.length === 0 && !requestedTeamId) {
    return (
      <LecturerPageShell
        breadcrumbItems={breadcrumbItems}
        title="Bảng điểm đóng góp theo nhóm"
        description="Bảng điểm đóng góp theo nhóm, chưa phải điểm tổng kết môn học."
      >
        <Card className="mx-auto max-w-2xl rounded-2xl border border-dashed border-border p-8 text-center">
          <h2 className="text-lg font-bold">Chưa có nhóm để xem bảng điểm</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Hãy phân nhóm trước khi xem tỷ lệ đóng góp của thành viên.
          </p>
          <Link
            href={lecturerCourseTeamsPath(courseId, "teams")}
            prefetch={true}
            className={cn(buttonVariants({ size: "sm" }), "mt-4 text-xs")}
          >
            Về danh sách nhóm
          </Link>
        </Card>
      </LecturerPageShell>
    );
  }

  if (invalidTeamId) {
    return (
      <LecturerPageShell
        breadcrumbItems={breadcrumbItems}
        title="Bảng điểm đóng góp theo nhóm"
        description="Bảng điểm đóng góp theo nhóm, chưa phải điểm tổng kết môn học."
        actions={teamSwitcher}
      >
        <Card className="mx-auto max-w-2xl rounded-2xl border border-dashed border-border p-8 text-center">
          <h2 className="text-lg font-bold">Nhóm không thuộc lớp học phần này</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Không gọi bảng điểm vì nhóm trên đường dẫn không thuộc lớp đang mở. Hãy chọn lại nhóm.
          </p>
          <Button
            type="button"
            size="sm"
            className="mt-4 cursor-pointer text-xs"
            disabled={!defaultTeamId}
            onClick={() => {
              if (defaultTeamId) handleSelectTeam(defaultTeamId);
            }}
          >
            Chọn lại nhóm
          </Button>
        </Card>
      </LecturerPageShell>
    );
  }

  if (evaluationQuery.isError) {
    const code = getApiErrorCode(evaluationQuery.error);
    if (code === "TEAM_NOT_FOUND") {
      return (
        <LecturerPageShell
          breadcrumbItems={breadcrumbItems}
          title="Bảng điểm đóng góp theo nhóm"
          actions={teamSwitcher}
        >
          <Card className="mx-auto max-w-2xl rounded-2xl border border-dashed border-border p-8 text-center">
            <h2 className="text-lg font-bold">Không tìm thấy nhóm</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Dữ liệu chưa sẵn sàng. Nhóm có thể chưa được khởi tạo trên máy chủ.
            </p>
            <Button
              type="button"
              size="sm"
              className="mt-4 cursor-pointer text-xs"
              disabled={!defaultTeamId}
              onClick={() => {
                if (defaultTeamId) handleSelectTeam(defaultTeamId);
              }}
            >
              Chọn lại nhóm
            </Button>
          </Card>
        </LecturerPageShell>
      );
    }
    return (
      <LecturerPageShell
        breadcrumbItems={breadcrumbItems}
        title="Bảng điểm đóng góp theo nhóm"
        actions={teamSwitcher}
      >
        <CourseQueryError
          title="Không tải được bảng điểm đóng góp"
          error={evaluationQuery.error}
          onRetry={() => void evaluationQuery.refetch()}
        />
      </LecturerPageShell>
    );
  }

  return (
    <LecturerPageShell
      breadcrumbItems={breadcrumbItems}
      title="Bảng điểm đóng góp theo nhóm"
      description="Số liệu đóng góp lấy từ máy chủ theo nhóm đang chọn. Đây chưa phải điểm tổng kết môn học."
      badges={
        <Badge variant="outline">
          {appliedContributionModeLabel(evaluation?.configMode ?? "COURSE")}
        </Badge>
      }
      actions={teamSwitcher}
      isLoading={
        courseQuery.isLoading ||
        teamsQuery.isLoading ||
        waitingForDefaultTeam ||
        (teamBelongsToCourse && evaluationQuery.isLoading)
      }
    >
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {SLICE_WEIGHT_FIELDS.map((field) => (
          <Card key={field} className="rounded-2xl border border-border p-4">
            <p className="text-xs text-muted-foreground">{SLICE_WEIGHT_LABELS[field].title}</p>
            <p className="mt-1 font-mono text-lg font-bold">
              {formatContributionPercent(displaySliceWeights?.[field])}
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
            Nhóm chưa có dữ liệu thành viên để lập bảng điểm đóng góp.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="sticky left-0 z-10 min-w-40 bg-card">Thành viên</TableHead>
                  <TableHead>Vai trò</TableHead>
                  <TableHead>Điểm lát cắt</TableHead>
                  <TableHead>Phát triển</TableHead>
                  <TableHead>Kiểm thử</TableHead>
                  <TableHead>Tài liệu</TableHead>
                  <TableHead>Nghiên cứu</TableHead>
                  <TableHead>Công việc</TableHead>
                  <TableHead>Đánh giá chéo</TableHead>
                  <TableHead>Tỷ lệ đóng góp cuối cùng</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
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
          </div>
        )}
      </Card>

      <ContributionOverrideDialog
        open={overrideMember !== null}
        member={overrideMember}
        isSaving={overrideMutation.isPending}
        onOpenChange={(open) => {
          if (overrideMutation.isPending && !open) return;
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
    </LecturerPageShell>
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
        <TableCell className="sticky left-0 z-10 bg-card">
          <p className="text-sm font-semibold">{member.fullName}</p>
          <p className="font-mono text-[11px] text-muted-foreground">{member.studentCode}</p>
        </TableCell>
        <TableCell>
          <Badge variant="outline" className="text-[10px]">
            {contributionRoleLabel(member.roleInTeam)}
          </Badge>
        </TableCell>
        <TableCell className="font-mono text-xs">
          {formatContributionNumber(member.sliceScore)}
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
        <TableCell className="text-right">
          <div className="hidden items-center justify-end gap-1 sm:flex">
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
          </div>
          <div className="sm:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger
                aria-label={`Thao tác với ${member.fullName || "thành viên"}`}
                className="inline-flex size-8 cursor-pointer items-center justify-center rounded-lg border border-transparent text-muted-foreground hover:border-border hover:bg-muted hover:text-foreground"
              >
                <EllipsisIcon className="size-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onToggle}>Xem chi tiết</DropdownMenuItem>
                <DropdownMenuItem disabled={!member.studentProfileId} onClick={onOverride}>
                  Điều chỉnh
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </TableCell>
      </TableRow>
      {expanded && (
        <TableRow>
          <TableCell colSpan={11} className="bg-muted/30">
            {member.warnings.length > 0 && (
              <ul className="mb-3 list-disc pl-5 text-xs text-amber-700 dark:text-amber-300">
                {member.warnings.map((warning) => (
                  <li key={warning}>{warning}</li>
                ))}
              </ul>
            )}
            {member.sprintBreakdowns.length === 0 ? (
              <p className="text-xs text-muted-foreground">Chưa có phân rã theo Sprint cho thành viên này.</p>
            ) : (
              <div className="space-y-2">
                {member.sprintBreakdowns.map((sprint) => (
                  <div
                    key={sprint.sprintId || sprint.sprintName}
                    className="grid gap-2 rounded-xl bg-background px-3 py-2 text-xs sm:grid-cols-4"
                  >
                    <span className="font-semibold">{sprint.sprintName || "Sprint"}</span>
                    <span className="font-mono">
                      Điểm lát cắt: {formatContributionNumber(sprint.sliceScore)}
                    </span>
                    <span className="font-mono">
                      Tỷ lệ trong lát cắt: {formatContributionPercent(sprint.sliceContributionPercentage)}
                    </span>
                    <span className="font-mono">
                      Tỷ lệ đóng góp Sprint: {formatContributionPercent(sprint.contributionPercentage)}
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
