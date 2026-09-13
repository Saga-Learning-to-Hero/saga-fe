"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AlertTriangleIcon,
  ArrowUpRightIcon,
  ChevronDownIcon,
  CrownIcon,
  NetworkIcon,
  ShieldAlertIcon,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  contributionRoleLabel,
  formatContributionNumber,
  formatContributionPercent,
  formatContributionWarning,
} from "@/features/lecturer/contribution/lib/contribution-utils";
import type { ContributionMember } from "../types/contribution";
import { cn } from "@/lib/utils";

interface ContributionTableProps {
  members: ContributionMember[];
  currentStudentCode?: string;
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0 || !parts[0]) return "SV";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function ContributionTable({ members, currentStudentCode }: ContributionTableProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <Card className="rounded-2xl border border-border/80 shadow-2xs bg-card overflow-hidden">
      <CardHeader className="p-4 sm:p-5 pb-4 border-b border-border/60">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-sm sm:text-base font-bold text-foreground">
              Bảng Đánh Giá Tỷ Lệ Đóng Góp Nhóm
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-0.5">
              Tính toán minh bạch từ SAGA-BE-V2 dựa trên 4 trụ cột công sức, liên kết bằng chứng và điểm đánh giá chéo.
            </CardDescription>
          </div>
          <Badge variant="outline" className="text-[10px] font-mono font-bold self-start sm:self-auto py-1 px-2.5">
            DEC-092 Live Evaluation
          </Badge>
        </div>
      </CardHeader>

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
              <TableHead className="text-xs font-bold text-muted-foreground">Trước Peer</TableHead>
              <TableHead className="min-w-40 text-xs font-bold text-muted-foreground">
                Tỷ lệ đóng góp cuối cùng
              </TableHead>
              <TableHead className="text-right text-xs font-bold text-muted-foreground">Chi tiết</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-border/60">
            {members.length === 0 ? (
              <TableRow>
                <TableCell colSpan={12} className="h-32 text-center text-xs text-muted-foreground">
                  Nhóm chưa có dữ liệu thành viên để lập bảng điểm đóng góp.
                </TableCell>
              </TableRow>
            ) : (
              members.map((member) => {
                const isCurrent = currentStudentCode && member.studentCode === currentStudentCode;
                const isLeader = member.roleInTeam === "LEADER";
                const expanded = expandedId === member.studentProfileId || expandedId === member.studentCode;
                const finalPercentage = Number(member.finalContributionPercentage) || 0;
                const hasNoEvidence = member.warnings.includes("NO_EVIDENCE");
                const hasWarnings = member.warnings.length > 0;

                return (
                  <TableRowGroup
                    key={member.studentProfileId || member.studentCode}
                    member={member}
                    isCurrent={Boolean(isCurrent)}
                    isLeader={isLeader}
                    expanded={expanded}
                    finalPercentage={finalPercentage}
                    hasNoEvidence={hasNoEvidence}
                    hasWarnings={hasWarnings}
                    onToggle={() =>
                      setExpandedId(expanded ? null : member.studentProfileId || member.studentCode)
                    }
                  />
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}

function TableRowGroup({
  member,
  isCurrent,
  isLeader,
  expanded,
  finalPercentage,
  hasNoEvidence,
  hasWarnings,
  onToggle,
}: {
  member: ContributionMember;
  isCurrent: boolean;
  isLeader: boolean;
  expanded: boolean;
  finalPercentage: number;
  hasNoEvidence: boolean;
  hasWarnings: boolean;
  onToggle: () => void;
}) {
  return (
    <>
      <TableRow className={cn("transition-colors hover:bg-muted/20", isCurrent && "bg-primary/5")}>
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
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-bold text-foreground">{member.fullName}</p>
                {isCurrent && (
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 text-[9px] px-1 py-0 font-bold">
                    Tôi
                  </Badge>
                )}
              </div>
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
        <TableCell className="font-mono text-xs text-muted-foreground">
          {formatContributionPercent(member.sliceContributionPercentage)}
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
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-8 cursor-pointer text-xs font-semibold hover:bg-muted/50"
            onClick={onToggle}
          >
            Minh chứng
            <ChevronDownIcon
              className={cn("ml-1 size-3.5 transition-transform duration-200", expanded && "rotate-180")}
            />
          </Button>
        </TableCell>
      </TableRow>

      {expanded && (
        <TableRow>
          <TableCell colSpan={12} className="bg-muted/20 p-4">
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
                  href="/student/graph"
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
