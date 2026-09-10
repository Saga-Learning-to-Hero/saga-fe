"use client";

import { useState, useMemo } from "react";
import {
  CrownIcon,
  StarIcon,
  CheckCircle2Icon,
  FilterIcon,
} from "lucide-react";
import type { MemberContribution } from "../types/contribution";
import {
  COMPLETED_SPRINTS,
  MOCK_SPRINT_CONTRIBUTIONS,
  MOCK_CONTRIBUTION_MEMBERS,
} from "../data/mock-contribution-data";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CustomSelect, type CustomSelectOption } from "@/components/common/custom-select";

interface ContributionTableProps {
  members?: MemberContribution[];
  currentStudentCode: string;
}

export function ContributionTable({ members, currentStudentCode }: ContributionTableProps) {
  const [selectedSprintId, setSelectedSprintId] = useState<string>("all-completed");

  const sprintOptions: CustomSelectOption[] = useMemo(() => [
    {
      value: "all-completed",
      label: "Tất cả Sprint đã hoàn thành (Tổng hợp)",
      subLabel: "Lũy kế Sprint 1 + Sprint 2 (Đã đóng)",
    },
    ...COMPLETED_SPRINTS.map((s) => ({
      value: s.id,
      label: s.name,
      subLabel: s.subLabel,
    })),
  ], []);

  const activeMembers = useMemo(() => {
    return MOCK_SPRINT_CONTRIBUTIONS[selectedSprintId] || members || MOCK_CONTRIBUTION_MEMBERS;
  }, [selectedSprintId, members]);

  const maxContribution = Math.max(1, ...activeMembers.map((m) => m.contributionPercentage));

  const activeSprintInfo = COMPLETED_SPRINTS.find((s) => s.id === selectedSprintId);

  return (
    <Card className="rounded-2xl border border-border/80 shadow-2xs bg-card overflow-hidden">
      <CardHeader className="p-4 sm:p-5 pb-4 border-b border-border/60">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm sm:text-base font-bold text-foreground">
                Bảng So Sánh Chỉ Số Đóng Góp Nhóm
              </CardTitle>
              <Badge
                variant="outline"
                className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[11px] font-bold gap-1"
              >
                <CheckCircle2Icon className="w-3.5 h-3.5" />
                Sprint đã đóng
              </Badge>
            </div>
            <CardDescription className="text-xs text-muted-foreground">
              {activeSprintInfo
                ? `Dữ liệu đối soát chốt sổ cho ${activeSprintInfo.name} (Hoàn thành ${activeSprintInfo.completedDate}).`
                : "Tổng hợp đối soát từ các Sprint đã hoàn thành (GitHub Commits, Jira Tasks, Peer Review & Traceability)."}
            </CardDescription>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs text-muted-foreground font-semibold flex items-center gap-1 shrink-0">
                <FilterIcon className="w-3.5 h-3.5 text-primary" />
                Lọc Sprint:
              </span>
              <div className="w-full sm:w-[320px]">
                <CustomSelect
                  id="contribution-completed-sprint-filter"
                  value={selectedSprintId}
                  onChange={setSelectedSprintId}
                  options={sprintOptions}
                  className="text-xs"
                />
              </div>
            </div>

            <Badge variant="outline" className="text-[10px] font-mono font-semibold hidden xl:inline-flex py-1 px-2.5">
              Standard: 20% / Member
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0 overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse min-w-[700px]">
          <thead>
            <tr className="border-b border-border/60 bg-muted/40 text-muted-foreground text-[11px] font-semibold">
              <th className="py-3 px-4">Thành viên</th>
              <th className="py-3 px-3">Task Jira &amp; SP</th>
              <th className="py-3 px-3">Commit &amp; Code Diff</th>
              <th className="py-3 px-3 text-center">Đánh giá Chéo</th>
              <th className="py-3 px-3 text-center">Traceability (%)</th>
              <th className="py-3 px-4 min-w-[160px] text-right">Tỷ lệ Đóng góp (%)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {activeMembers.map((m) => {
              const isSelf = m.studentCode === currentStudentCode;

              return (
                <tr
                  key={m.id}
                  className={`transition-colors ${isSelf ? "bg-primary/5 hover:bg-primary/10" : "hover:bg-muted/30"
                    }`}
                >
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-9 h-9 border border-background shadow-xs shrink-0">
                        <AvatarImage src={m.avatar} alt={m.name} />
                        <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                          {m.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-foreground truncate text-xs">
                            {m.name}
                          </span>
                          {m.role === "LEADER" && (
                            <CrownIcon className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          )}
                          {isSelf && (
                            <Badge className="bg-primary/20 text-primary border-primary/30 text-[9px] px-1 py-0 font-bold">
                              Bản thân
                            </Badge>
                          )}
                        </div>
                        <span className="text-[10px] text-muted-foreground font-mono block">
                          MSSV: {m.studentCode}
                        </span>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-3">
                    <div className="space-y-0.5 font-mono">
                      <span className="font-bold text-foreground text-xs block">
                        {m.metrics.tasksDone} Tasks
                      </span>
                      <span className="text-[10px] text-muted-foreground block">
                        {m.metrics.storyPoints} Story Points
                      </span>
                    </div>
                  </td>

                  <td className="py-3.5 px-3">
                    <div className="space-y-0.5 font-mono">
                      <span className="font-bold text-foreground text-xs block">
                        {m.metrics.codeCommits} Commits
                      </span>
                      <span className="text-[10px] block">
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">+{m.metrics.linesAdded}</span>{" "}
                        <span className="text-rose-600 dark:text-rose-400 font-bold">-{m.metrics.linesDeleted}</span>
                      </span>
                    </div>
                  </td>

                  <td className="py-3.5 px-3 text-center">
                    <div className="inline-flex items-center gap-1 font-mono font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-lg text-xs">
                      <StarIcon className="w-3 h-3 fill-current" />
                      <span>{m.metrics.peerScore} ★</span>
                    </div>
                  </td>

                  <td className="py-3.5 px-3 text-center">
                    <span
                      className={`font-mono font-bold text-xs ${m.metrics.traceabilityRate >= 90
                        ? "text-emerald-600 dark:text-emerald-400"
                        : m.metrics.traceabilityRate >= 75
                          ? "text-blue-600 dark:text-blue-400"
                          : "text-rose-600 dark:text-rose-400"
                        }`}
                    >
                      {m.metrics.traceabilityRate}%
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-mono font-extrabold text-foreground">
                          {m.contributionPercentage}%
                        </span>
                        <span className="text-[10px] text-muted-foreground font-mono">
                          Score: {m.weightedScore}
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${m.statusTag === "EXCEEDED"
                            ? "bg-emerald-500"
                            : m.statusTag === "BALANCED"
                              ? "bg-blue-500"
                              : m.statusTag === "BEHIND"
                                ? "bg-amber-500"
                                : "bg-rose-500"
                            }`}
                          style={{
                            width: `${Math.min((m.contributionPercentage / maxContribution) * 100, 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
