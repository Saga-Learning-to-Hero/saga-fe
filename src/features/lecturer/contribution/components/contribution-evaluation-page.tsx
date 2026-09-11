"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AlertTriangleIcon,
  ArrowUpRightIcon,
  BrainCircuitIcon,
  ChevronDownIcon,
  Code2Icon,
  CrownIcon,
  EllipsisIcon,
  FileTextIcon,
  FlaskConicalIcon,
  NetworkIcon,
  ShieldAlertIcon,
  SlidersHorizontalIcon,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
  lecturerCourseGraphPath,
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
  type SliceWeightField,
  appliedContributionModeLabel,
  canFetchContributionEvaluation,
  contributionRoleLabel,
  detectSliceWeightScale,
  formatContributionNumber,
  formatContributionPercent,
  formatContributionWarning,
  pickDefaultGradesTeamId,
  toDisplaySliceWeights,
} from "../lib/contribution-utils";
import { ContributionOverrideDialog } from "./contribution-override-dialog";
import { getApiErrorCode } from "@/lib/api-error";
import { cn } from "@/lib/utils";

interface ContributionEvaluationPageProps {
  courseId: string;
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0 || !parts[0]) return "SV";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function getSliceIcon(field: SliceWeightField) {
  switch (field) {
    case "codeWeight":
      return <Code2Icon className="size-4.5" />;
    case "testWeight":
      return <FlaskConicalIcon className="size-4.5" />;
    case "documentWeight":
      return <FileTextIcon className="size-4.5" />;
    case "researchWeight":
      return <BrainCircuitIcon className="size-4.5" />;
  }
}

function getSliceBoxStyle(field: SliceWeightField) {
  switch (field) {
    case "codeWeight":
      return {
        boxClass: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20",
        borderClass: "border-blue-500/20",
      };
    case "testWeight":
      return {
        boxClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20",
        borderClass: "border-emerald-500/20",
      };
    case "documentWeight":
      return {
        boxClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20",
        borderClass: "border-amber-500/20",
      };
    case "researchWeight":
      return {
        boxClass: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20",
        borderClass: "border-purple-500/20",
      };
  }
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
          Chọn nhóm đồ án
        </Label>
        <CustomSelect
          id="grades-team"
          value={teamBelongsToCourse ? requestedTeamId : ""}
          onChange={handleSelectTeam}
          placeholder="Chọn nhóm đồ án"
          options={teams.map((item) => ({
            value: item.teamId,
            label: item.teamName ? `Team #${item.teamNo} — ${item.teamName}` : `Nhóm ${item.teamNo}`,
            subLabel: item.projectId ? "Đã liên kết dự án Jira/GitHub" : "Chưa liên kết dự án",
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

  if (teamsQuery.isSuccess && teams.length === 0) {
    return (
      <LecturerPageShell
        breadcrumbItems={breadcrumbItems}
        title="Bảng điểm đóng góp theo nhóm"
      >
        <Card className="rounded-2xl border border-dashed border-border/80 p-8 text-center shadow-xs">
          <p className="text-sm font-semibold text-foreground">
            Lớp học phần chưa có nhóm đồ án nào
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Vui lòng phân nhóm trước khi xem và đánh giá bảng điểm Slicing Pie.
          </p>
          <Link
            href={lecturerCourseTeamsPath(courseId, "teams")}
            className={cn(
              buttonVariants({ size: "sm" }),
              "mt-4 text-xs font-bold shadow-xs"
            )}
          >
            Đến trang phân nhóm
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
        actions={teamSwitcher}
      >
        <Card className="rounded-2xl border border-border/80 bg-card p-6 shadow-xs">
          <p className="text-sm font-semibold text-foreground">
            Nhóm không thuộc lớp học phần này
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Mã nhóm trên liên kết không khớp với danh sách nhóm của lớp. Hãy chọn một nhóm hợp lệ.
          </p>
          <Button
            type="button"
            size="sm"
            className="mt-4 cursor-pointer text-xs font-bold"
            disabled={!defaultTeamId}
            onClick={() => {
              if (defaultTeamId) handleSelectTeam(defaultTeamId);
            }}
          >
            Chọn nhóm mặc định
          </Button>
        </Card>
      </LecturerPageShell>
    );
  }

  if (teamBelongsToCourse && evaluationQuery.isError) {
    const errorCode = getApiErrorCode(evaluationQuery.error);
    if (errorCode === "PROJECT_NOT_FOUND" || errorCode === "PROJECT_REQUIRED") {
      return (
        <LecturerPageShell
          breadcrumbItems={breadcrumbItems}
          title="Bảng điểm đóng góp theo nhóm"
          actions={teamSwitcher}
        >
          <Card className="rounded-2xl border border-dashed border-border/80 p-8 text-center shadow-xs">
            <p className="text-sm font-semibold text-foreground">
              Nhóm chưa được liên kết dự án
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Nhóm này chưa có dự án Jira/GitHub nên chưa thể tính toán số liệu Slicing Pie.
            </p>
            <Link
              href={lecturerCourseTeamsPath(courseId, "teams")}
              className={cn(
                buttonVariants({ size: "sm" }),
                "mt-4 text-xs font-bold shadow-xs"
              )}
            >
              Xem danh sách nhóm
            </Link>
          </Card>
        </LecturerPageShell>
      );
    }
    if (errorCode === "TEAM_NOT_FOUND") {
      return (
        <LecturerPageShell
          breadcrumbItems={breadcrumbItems}
          title="Bảng điểm đóng góp theo nhóm"
          actions={teamSwitcher}
        >
          <Card className="rounded-2xl border border-border/80 bg-card p-6 shadow-xs">
            <p className="text-sm font-semibold text-foreground">
              Không tìm thấy thông tin nhóm
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Nhóm có thể đã bị xóa hoặc thay đổi mã định danh.
            </p>
            <Button
              type="button"
              size="sm"
              className="mt-4 cursor-pointer text-xs font-bold"
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
      title="Bảng điểm đối soát & Chứng minh đóng góp Slicing Pie"
      description="Đối soát minh chứng công sức (Jira Tasks, Git Commits, Tài liệu & Đánh giá chéo) và xác thực tỷ lệ cổ phần Slicing Pie của từng thành viên."
      badges={
        <Badge
          variant="outline"
          className="border-primary/25 bg-primary/10 font-mono text-xs font-bold text-primary"
        >
          {appliedContributionModeLabel(evaluation?.configMode ?? "COURSE")}
        </Badge>
      }
      actions={
        <div className="flex flex-wrap items-center gap-2.5">
          {teamSwitcher}
          {requestedTeamId && (
            <Link
              href={`${lecturerCourseGraphPath(courseId)}?teamId=${requestedTeamId}`}
              prefetch={true}
              className={buttonVariants({
                variant: "outline",
                size: "sm",
                className: "h-9 gap-1.5 rounded-xl border-border/80 bg-card px-3 text-xs font-bold shadow-xs hover:bg-muted/50 cursor-pointer",
              })}
              title="Mở đồ thị Traceability Graph để đối soát minh chứng"
            >
              <NetworkIcon className="size-3.5 text-primary" />
              <span className="hidden sm:inline">Đồ thị Traceability Graph</span>
            </Link>
          )}
        </div>
      }
      isLoading={
        courseQuery.isLoading ||
        teamsQuery.isLoading ||
        waitingForDefaultTeam ||
        (teamBelongsToCourse && evaluationQuery.isLoading)
      }
    >
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {SLICE_WEIGHT_FIELDS.map((field) => {
          const style = getSliceBoxStyle(field);
          const info = SLICE_WEIGHT_LABELS[field];
          return (
            <Card
              key={field}
              className={cn(
                "rounded-2xl border bg-card p-4 shadow-xs transition-all hover:shadow-md hover:-translate-y-0.5",
                style.borderClass
              )}
            >
              <CardContent className="space-y-3 p-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground">
                    {info.title}
                  </span>
                  <div
                    className={cn(
                      "flex size-8 items-center justify-center rounded-xl",
                      style.boxClass
                    )}
                  >
                    {getSliceIcon(field)}
                  </div>
                </div>
                <div>
                  <span className="font-mono text-2xl font-black text-foreground">
                    {formatContributionPercent(displaySliceWeights?.[field])}
                  </span>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    {info.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {warnings.length > 0 && (
        <Card className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-400">
              <AlertTriangleIcon className="size-5" />
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-extrabold text-amber-900 dark:text-amber-200">
                  Cảnh báo đối soát minh chứng công sức ({warnings.length})
                </h4>
                <span className="rounded-full bg-amber-500/20 px-2 py-0.5 font-mono text-[10px] font-bold text-amber-800 dark:text-amber-300">
                  Cần giảng viên lưu ý
                </span>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {warnings.map((warning) => {
                  const parsed = formatContributionWarning(warning);
                  const isHigh = parsed.severity === "high";
                  return (
                    <div
                      key={warning}
                      className={cn(
                        "rounded-xl border p-2.5 text-xs space-y-0.5",
                        isHigh
                          ? "border-red-500/30 bg-red-500/5 text-red-800 dark:text-red-300"
                          : "border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-300"
                      )}
                    >
                      <div className="flex items-center gap-1.5 font-bold">
                        <span
                          className={cn(
                            "size-1.5 rounded-full shrink-0",
                            isHigh ? "bg-red-500" : "bg-amber-500"
                          )}
                        />
                        <span>{parsed.title}</span>
                      </div>
                      <p className="text-[11px] leading-relaxed opacity-90 pl-3">
                        {parsed.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </Card>
      )}

      <Card className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-xs">
        {(evaluation?.members ?? []).length === 0 ? (
          <div className="p-10 text-center text-sm text-muted-foreground">
            Nhóm chưa có dữ liệu thành viên để lập bảng điểm đóng góp.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow className="border-b border-border/60">
                  <TableHead className="sticky left-0 z-10 min-w-48 bg-card text-xs font-bold text-muted-foreground">
                    Thành viên & Minh chứng
                  </TableHead>
                  <TableHead className="text-xs font-bold text-muted-foreground">Vai trò</TableHead>
                  <TableHead className="text-xs font-bold text-muted-foreground">Điểm SP</TableHead>
                  <TableHead className="text-xs font-bold text-muted-foreground">Code</TableHead>
                  <TableHead className="text-xs font-bold text-muted-foreground">Testing</TableHead>
                  <TableHead className="text-xs font-bold text-muted-foreground">Document</TableHead>
                  <TableHead className="text-xs font-bold text-muted-foreground">Research</TableHead>
                  <TableHead className="text-xs font-bold text-muted-foreground">Công việc</TableHead>
                  <TableHead className="text-xs font-bold text-muted-foreground">Đánh giá chéo</TableHead>
                  <TableHead className="min-w-40 text-xs font-bold text-muted-foreground">
                    Tỷ lệ đóng góp cuối cùng
                  </TableHead>
                  <TableHead className="text-right text-xs font-bold text-muted-foreground">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-border/60">
                {(evaluation?.members ?? []).map((member) => {
                  const expanded = expandedId === member.studentProfileId;
                  return (
                    <MemberRows
                      key={member.studentProfileId || member.studentCode}
                      member={member}
                      expanded={expanded}
                      courseId={courseId}
                      teamId={requestedTeamId}
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
  courseId,
  teamId,
  onToggle,
  onOverride,
}: {
  member: ContributionMember;
  expanded: boolean;
  courseId: string;
  teamId: string;
  onToggle: () => void;
  onOverride: () => void;
}) {
  const isLeader = member.roleInTeam === "LEADER";
  const finalPercentage = Number(member.finalContributionPercentage) || 0;
  const hasNoEvidence = member.warnings.includes("NO_EVIDENCE");
  const hasWarnings = member.warnings.length > 0;

  return (
    <>
      <TableRow className="transition-colors hover:bg-muted/20">
        <TableCell className="sticky left-0 z-10 bg-card">
          <div className="flex items-center gap-2.5">
            <Avatar size="sm" className="border border-border/60">
              <AvatarFallback
                className={cn(
                  "font-mono text-[11px] font-bold",
                  isLeader
                    ? "bg-amber-500/20 text-amber-700 dark:text-amber-300"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {getInitials(member.fullName)}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-0.5">
              <p className="text-xs font-bold text-foreground">{member.fullName}</p>
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="inline-block rounded bg-primary/10 px-1.5 py-0.2 font-mono text-[10px] font-bold text-primary">
                  {member.studentCode}
                </span>
                {hasNoEvidence ? (
                  <span className="inline-flex items-center gap-0.5 rounded border border-destructive/30 bg-destructive/10 px-1.5 py-0.2 text-[9px] font-bold text-destructive">
                    <ShieldAlertIcon className="size-2.5" />
                    Chưa có minh chứng
                  </span>
                ) : hasWarnings ? (
                  <span className="inline-flex items-center gap-0.5 rounded border border-amber-500/30 bg-amber-500/10 px-1.5 py-0.2 text-[9px] font-bold text-amber-700 dark:text-amber-300">
                    <AlertTriangleIcon className="size-2.5" />
                    Cần đối soát
                  </span>
                ) : null}
              </div>
            </div>
          </div>
        </TableCell>
        <TableCell>
          <Badge
            variant="outline"
            className={cn(
              "font-mono text-[10px] font-bold gap-1",
              isLeader
                ? "border-amber-500/30 bg-amber-500/15 text-amber-700 dark:text-amber-300"
                : "border-border/60 bg-muted/60 text-muted-foreground"
            )}
          >
            {isLeader && <CrownIcon className="size-2.5 text-amber-500" />}
            {contributionRoleLabel(member.roleInTeam)}
          </Badge>
        </TableCell>
        <TableCell className="font-mono text-xs font-semibold">
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
        <TableCell className="font-mono text-xs font-semibold text-foreground">
          × {formatContributionNumber(member.peerReviewScore)}
        </TableCell>
        <TableCell>
          <div className="space-y-1">
            <span className="font-mono text-xs font-black text-primary">
              {formatContributionPercent(member.finalContributionPercentage)}
            </span>
            <div className="h-1.5 w-28 overflow-hidden rounded-full bg-muted">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-300",
                  finalPercentage > 0
                    ? "bg-gradient-to-r from-primary to-primary/80"
                    : "bg-muted"
                )}
                style={{ width: `${Math.min(Math.max(finalPercentage, 0), 100)}%` }}
              />
            </div>
          </div>
        </TableCell>
        <TableCell className="text-right">
          <div className="hidden items-center justify-end gap-1.5 sm:flex">
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="h-8 cursor-pointer text-xs font-semibold hover:bg-muted/50"
              onClick={onToggle}
            >
              Minh chứng
              <ChevronDownIcon
                className={`ml-1 size-3.5 transition-transform duration-200 ${expanded ? "rotate-180" : ""
                  }`}
              />
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-8 cursor-pointer gap-1 text-xs font-semibold shadow-xs"
              disabled={!member.studentProfileId}
              onClick={onOverride}
            >
              <SlidersHorizontalIcon className="size-3" />
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
                <DropdownMenuItem onClick={onToggle}>Xem minh chứng</DropdownMenuItem>
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
          <TableCell colSpan={11} className="bg-muted/20 p-4">
            <div className="space-y-4">
              {member.warnings.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-xs font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                    <AlertTriangleIcon className="size-3.5 shrink-0" />
                    Cảnh báo đối soát minh chứng của thành viên:
                  </p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {member.warnings.map((w) => {
                      const parsed = formatContributionWarning(w);
                      const isHigh = parsed.severity === "high";
                      return (
                        <div
                          key={w}
                          className={cn(
                            "rounded-xl border p-2.5 text-xs space-y-0.5",
                            isHigh
                              ? "border-red-500/30 bg-red-500/5 text-red-800 dark:text-red-300"
                              : "border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-300"
                          )}
                        >
                          <div className="flex items-center gap-1.5 font-bold">
                            <span
                              className={cn(
                                "size-1.5 rounded-full shrink-0",
                                isHigh ? "bg-red-500" : "bg-amber-500"
                              )}
                            />
                            <span>{parsed.title}</span>
                          </div>
                          <p className="text-[11px] leading-relaxed opacity-90 pl-3">
                            {parsed.description}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {member.sprintBreakdowns.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  Chưa có phân rã theo Sprint cho thành viên này.
                </p>
              ) : (
                <div className="space-y-2">
                  <p className="text-xs font-bold text-foreground">
                    Phân rã minh chứng & đóng góp qua từng Sprint:
                  </p>
                  <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
                    {member.sprintBreakdowns.map((sprint) => (
                      <div
                        key={sprint.sprintId || sprint.sprintName}
                        className="rounded-xl border border-border/70 bg-card p-3 shadow-xs space-y-2"
                      >
                        <div className="flex items-center justify-between border-b border-border/50 pb-1.5">
                          <span className="text-xs font-bold text-foreground">
                            {sprint.sprintName || "Sprint"}
                          </span>
                          <span className="font-mono text-xs font-black text-primary">
                            {formatContributionPercent(sprint.contributionPercentage)}
                          </span>
                        </div>
                        <div className="space-y-1 text-[11px] text-muted-foreground">
                          <div className="flex justify-between">
                            <span>Điểm SP:</span>
                            <span className="font-mono font-bold text-foreground">
                              {formatContributionNumber(sprint.sliceScore)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Tỷ lệ SP:</span>
                            <span className="font-mono font-bold text-foreground">
                              {formatContributionPercent(sprint.sliceContributionPercentage)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end border-t border-border/40 pt-3">
                <Link
                  href={`${lecturerCourseGraphPath(courseId)}?teamId=${teamId}`}
                  prefetch={true}
                  className={buttonVariants({
                    variant: "outline",
                    size: "sm",
                    className: "h-8 gap-1.5 rounded-lg text-xs font-bold text-primary border-primary/30 hover:bg-primary/10 cursor-pointer",
                  })}
                >
                  <NetworkIcon className="size-3.5" />
                  Đối soát trên Đồ thị (Traceability Graph)
                  <ArrowUpRightIcon className="size-3.5" />
                </Link>
              </div>
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}
