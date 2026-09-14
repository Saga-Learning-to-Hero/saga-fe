"use client";

import { UsersIcon } from "lucide-react";
import { LeaderBadge, MemberRoleBadge } from "@/components/common/leader-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { ProjectProgressMemberSummary } from "@/features/student/project/types/student-project";
import { cn } from "@/lib/utils";
import { formatLinkedCommitRatio } from "../lib/progress-format";

interface ProgressMemberTableProps {
  members: ProjectProgressMemberSummary[];
  selectedStudentId?: string | null;
  onSelectMember: (studentId: string) => void;
  isLoading?: boolean;
}

export function ProgressMemberTable({
  members,
  selectedStudentId,
  onSelectMember,
  isLoading,
}: ProgressMemberTableProps) {
  const sorted = [...members].sort((a, b) => {
    const roleRank = (role: string) => (role.toUpperCase() === "LEADER" ? 0 : 1);
    const rankDiff = roleRank(a.teamRole) - roleRank(b.teamRole);
    if (rankDiff !== 0) return rankDiff;
    return a.studentCode.localeCompare(b.studentCode, "vi");
  });

  return (
    <Card className="rounded-2xl border border-border/80 shadow-xs">
      <CardHeader className="border-b border-border/60 p-4 sm:p-5">
        <div className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <UsersIcon className="size-4" />
          </div>
          <div>
            <CardTitle className="text-sm font-bold sm:text-base">Tiến độ thành viên</CardTitle>
            <CardDescription className="text-[11px]">
              Số liệu do máy chủ tổng hợp. Chọn một thành viên để xem chi tiết task đã giao.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="space-y-2 p-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="h-14 animate-pulse rounded-xl bg-muted/60" />
            ))}
          </div>
        ) : sorted.length === 0 ? (
          <p className="p-6 text-center text-xs text-muted-foreground">
            Chưa có thành viên nào trong bảng tiến độ.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border/60 bg-muted/30 text-muted-foreground">
                  <th className="px-4 py-3 font-semibold">Thành viên</th>
                  <th className="px-4 py-3 font-semibold">Vai trò</th>
                  <th className="px-4 py-3 font-semibold">Task đã giao</th>
                  <th className="px-4 py-3 font-semibold">Commit</th>
                  <th className="px-4 py-3 font-semibold">Commit đã liên kết task</th>
                  <th className="px-4 py-3 font-semibold">Xác nhận</th>
                  <th className="px-4 py-3 text-right font-semibold">Chi tiết</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {sorted.map((member) => {
                  const isLeader = member.teamRole.toUpperCase() === "LEADER";
                  const isSelected = selectedStudentId === member.studentId;
                  return (
                    <tr
                      key={member.studentId}
                      className={cn(
                        "transition-colors hover:bg-muted/20",
                        isSelected && "bg-primary/5"
                      )}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-foreground">{member.fullName}</span>
                          {isLeader ? <LeaderBadge variant="icon-only" /> : null}
                        </div>
                        <p className="font-mono text-[11px] text-muted-foreground">
                          {member.studentCode}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <MemberRoleBadge role={member.teamRole} />
                      </td>
                      <td className="px-4 py-3 font-mono">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-foreground">
                              {member.tasks.completed}/{member.tasks.assigned}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              ({member.tasks.incomplete} chưa xong)
                            </span>
                          </div>
                          {member.tasks.assigned > 0 && (
                            <div className="h-1.5 w-24 overflow-hidden rounded-full bg-muted border border-border/40">
                              <div
                                className="h-full rounded-full bg-emerald-500 transition-all duration-300"
                                style={{
                                  width: `${Math.min(
                                    100,
                                    Math.round((member.tasks.completed / member.tasks.assigned) * 100)
                                  )}%`,
                                }}
                              />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono">{member.commits.total}</td>
                      <td className="px-4 py-3 font-mono">
                        {member.commits.linkedToTasks}/{member.commits.total}{" "}
                        <span className="text-muted-foreground">
                          ({formatLinkedCommitRatio(member.commits.linkedToTasks, member.commits.total)})
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono">{member.evidenceConfirmations}</td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          type="button"
                          size="sm"
                          variant={isSelected ? "default" : "outline"}
                          className="h-7 cursor-pointer text-[11px]"
                          onClick={() => onSelectMember(member.studentId)}
                        >
                          Xem chi tiết
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
