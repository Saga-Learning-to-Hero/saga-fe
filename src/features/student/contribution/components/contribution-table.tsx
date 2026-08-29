"use client";

import {
  CrownIcon,
  StarIcon,
  AlertTriangleIcon,
} from "lucide-react";
import type { MemberContribution, MemberStatusTag } from "../types/contribution";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ContributionTableProps {
  members: MemberContribution[];
  currentStudentCode: string;
}

export function ContributionTable({ members, currentStudentCode }: ContributionTableProps) {
  const getStatusBadge = (tag: MemberStatusTag) => {
    switch (tag) {
      case "EXCEEDED":
        return (
          <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[10px] font-bold">
            Vượt chỉ tiêu
          </Badge>
        );
      case "BALANCED":
        return (
          <Badge className="bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30 text-[10px] font-bold">
            Đạt chuẩn
          </Badge>
        );
      case "BEHIND":
        return (
          <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30 text-[10px] font-bold">
            Cần tăng tốc
          </Badge>
        );
      case "GHOSTING_RISK":
        return (
          <Badge className="bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30 text-[10px] font-bold gap-1">
            <AlertTriangleIcon className="w-3 h-3" />
            Cảnh báo thiếu hụt
          </Badge>
        );
    }
  };

  return (
    <Card className="rounded-2xl border border-border/80 shadow-2xs bg-card overflow-hidden">
      <CardHeader className="p-4 sm:p-5 pb-3 border-b border-border/60">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-sm sm:text-base font-bold text-foreground">
              Bảng So sánh Chi tiết Chỉ số Đóng góp Nhóm SAGA
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Tổng hợp đa nguồn từ GitHub, Jira, Đánh giá chéo và Ma vết Traceability
            </CardDescription>
          </div>

          <Badge variant="outline" className="text-[10px] font-mono font-semibold self-start sm:self-auto">
            Standard: 20% / Member
          </Badge>
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
              <th className="py-3 px-3 text-center">Ma vết (%)</th>
              <th className="py-3 px-4 min-w-[140px]">Tỷ lệ Đóng góp (%)</th>
              <th className="py-3 px-4 text-right">Trạng thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {members.map((m) => {
              const isSelf = m.studentCode === currentStudentCode;

              return (
                <tr
                  key={m.id}
                  className={`transition-colors ${
                    isSelf ? "bg-primary/5 hover:bg-primary/10" : "hover:bg-muted/30"
                  }`}
                >
                  {/* Member Info */}
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

                  {/* Jira Tasks */}
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

                  {/* GitHub Commits & Diff */}
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

                  {/* Peer Review Score */}
                  <td className="py-3.5 px-3 text-center">
                    <div className="inline-flex items-center gap-1 font-mono font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-lg text-xs">
                      <StarIcon className="w-3 h-3 fill-current" />
                      <span>{m.metrics.peerScore} ★</span>
                    </div>
                  </td>

                  {/* Traceability Rate */}
                  <td className="py-3.5 px-3 text-center">
                    <span
                      className={`font-mono font-bold text-xs ${
                        m.metrics.traceabilityRate >= 90
                          ? "text-emerald-600"
                          : m.metrics.traceabilityRate >= 75
                          ? "text-blue-600"
                          : "text-rose-600"
                      }`}
                    >
                      {m.metrics.traceabilityRate}%
                    </span>
                  </td>

                  {/* Contribution % Progress */}
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
                          className={`h-full rounded-full transition-all duration-500 ${
                            m.statusTag === "EXCEEDED"
                              ? "bg-emerald-500"
                              : m.statusTag === "BALANCED"
                              ? "bg-blue-500"
                              : m.statusTag === "BEHIND"
                              ? "bg-amber-500"
                              : "bg-rose-500"
                          }`}
                          style={{ width: `${Math.min(m.contributionPercentage * 3, 100)}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* Status Badge */}
                  <td className="py-3.5 px-4 text-right">
                    {getStatusBadge(m.statusTag)}
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
