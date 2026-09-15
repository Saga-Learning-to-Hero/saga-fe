"use client";

import { useMemo } from "react";
import {
  PieChart as PieChartIcon,
  BarChart3Icon,
  CalculatorIcon,
  InfoIcon,
  CrownIcon,
  SparklesIcon,
} from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";
import type { ContributionMember } from "../types/contribution";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MemberRoleBadge } from "@/components/common/leader-badge";
import {
  formatContributionNumber,
  formatContributionPercent,
} from "@/features/lecturer/contribution/lib/contribution-utils";
import {
  cleanMemberName,
  calculateTotalSliceScore,
  hasPeerReviewAdjustment,
} from "../lib/contribution-view-utils";
import { cn } from "@/lib/utils";

interface ContributionChartsProps {
  members: ContributionMember[];
}

const PALETTE = ["#4F46E5", "#06B6D4", "#10B981", "#F59E0B", "#8B5CF6", "#EC4899"];

export function ContributionCharts({ members }: ContributionChartsProps) {
  const sortedMembers = useMemo(() => {
    return [...members].sort(
      (a, b) => (Number(b.finalContributionPercentage) || 0) - (Number(a.finalContributionPercentage) || 0)
    );
  }, [members]);

  const totalSliceScore = useMemo(() => calculateTotalSliceScore(members), [members]);
  const hasAdjustment = useMemo(() => hasPeerReviewAdjustment(members), [members]);

  const topMember = sortedMembers[0];
  const topMemberName = topMember ? cleanMemberName(topMember.fullName) || topMember.studentCode : "—";
  const topMemberPct = topMember ? Number(topMember.finalContributionPercentage) || 0 : 0;

  const activeMembersCount = useMemo(() => {
    return members.filter((m) => (Number(m.finalContributionPercentage) || 0) > 0).length;
  }, [members]);
  const zeroMembersCount = members.length - activeMembersCount;

  const pieData = useMemo(() => {
    return members
      .map((m) => ({
        name: cleanMemberName(m.fullName) || m.studentCode,
        fullName: cleanMemberName(m.fullName),
        studentCode: m.studentCode,
        value: Number(m.finalContributionPercentage) || 0,
      }))
      .filter((d) => d.value > 0);
  }, [members]);

  const hasAnyResearch = useMemo(() => {
    return members.some((m) => (Number(m.researchContributionPercentage) || 0) > 0);
  }, [members]);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch">
        <Card className="rounded-2xl border border-border/80 shadow-2xs bg-card flex flex-col overflow-hidden">
          <CardHeader className="p-4 sm:p-5 pb-3.5 border-b border-border/60 bg-muted/20">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="size-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <PieChartIcon className="size-4.5" />
                </div>
                <div>
                  <CardTitle className="text-sm sm:text-base font-bold text-foreground">
                    Phân chia đóng góp hiện tại
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">
                    Tỷ lệ cổ phần công sức cuối cùng của các thành viên trong nhóm
                  </CardDescription>
                </div>
              </div>
              <Badge variant="outline" className="font-mono text-[10px] font-bold">
                {members.length} thành viên
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="p-4 sm:p-5 flex-1 flex flex-col justify-between gap-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-border/60 bg-muted/20 p-3 space-y-1">
                <span className="text-[11px] text-muted-foreground font-medium block">
                  Đóng góp dẫn đầu
                </span>
                <div className="flex items-center justify-between gap-1.5 min-w-0">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <CrownIcon className="size-4 text-amber-500 shrink-0" />
                    <span className="font-bold text-foreground text-xs truncate">
                      {topMemberName}
                    </span>
                  </div>
                  <span className="font-mono text-xs font-black text-primary shrink-0">
                    {formatContributionPercent(topMemberPct)}
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground">
                  Thành viên có tỷ lệ đóng góp cao nhất
                </p>
              </div>

              <div className="rounded-xl border border-border/60 bg-muted/20 p-3 space-y-1">
                <span className="text-[11px] text-muted-foreground font-medium block">
                  Ghi nhận đóng góp
                </span>
                <span className="font-mono text-xl font-black text-foreground">
                  {activeMembersCount} / {members.length} thành viên
                </span>
                <p className="text-[10px] text-muted-foreground">
                  {zeroMembersCount > 0
                    ? `${zeroMembersCount} thành viên chưa có slice score`
                    : "Toàn bộ thành viên đều đã có đóng góp"}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 flex-1">
              <div className="size-44 shrink-0 flex items-center justify-center">
                {pieData.length === 0 ? (
                  <div className="size-36 rounded-full border border-dashed border-border flex items-center justify-center text-center p-3 text-[11px] text-muted-foreground">
                    Chưa có dữ liệu phân bổ
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={46}
                        outerRadius={70}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {pieData.map((_, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={PALETTE[index % PALETTE.length]}
                            stroke="transparent"
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(val, _name, item) => {
                          const payload = item.payload as { fullName?: string; studentCode?: string };
                          const label = `${payload.fullName || "Thành viên"} (${payload.studentCode || ""})`;
                          return [`${formatContributionPercent(Number(val) || 0)}`, label];
                        }}
                        contentStyle={{
                          borderRadius: "12px",
                          backgroundColor: "var(--color-card)",
                          borderColor: "var(--color-border)",
                          fontSize: "12px",
                          fontWeight: "bold",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>

              <div className="flex-1 w-full space-y-2">
                {sortedMembers.map((member, idx) => {
                  const finalPct = Number(member.finalContributionPercentage) || 0;
                  const cleanedName = cleanMemberName(member.fullName) || member.studentCode;
                  const isZero = finalPct === 0;

                  return (
                    <div
                      key={member.studentProfileId || member.studentCode}
                      className="rounded-xl border border-border/60 bg-muted/20 p-2.5 space-y-1.5 transition-colors hover:border-border"
                    >
                      <div className="flex items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className={cn(
                              "flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] font-black",
                              idx === 0
                                ? "bg-amber-500/20 text-amber-700 dark:text-amber-300"
                                : idx === 1
                                  ? "bg-primary/15 text-primary"
                                  : "bg-muted text-muted-foreground"
                            )}
                          >
                            #{idx + 1}
                          </span>
                          <span
                            className="size-2 rounded-full shrink-0"
                            style={{ backgroundColor: PALETTE[idx % PALETTE.length] }}
                          />
                          <span className="font-bold text-foreground truncate">
                            {cleanedName}
                          </span>
                          <span className="font-mono text-[10px] text-muted-foreground shrink-0">
                            {member.studentCode}
                          </span>
                        </div>
                        <span className="font-mono font-black text-foreground shrink-0">
                          {formatContributionPercent(finalPct)}
                        </span>
                      </div>

                      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.min(Math.max(finalPct, 0), 100)}%`,
                            backgroundColor: isZero ? "transparent" : PALETTE[idx % PALETTE.length],
                          }}
                        />
                      </div>

                      {isZero && (
                        <p className="text-[10px] text-amber-700 dark:text-amber-300 font-medium">
                          Chưa có slice score được ghi nhận
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex items-start gap-2 rounded-xl border border-border/60 bg-muted/20 p-3 text-xs text-muted-foreground">
              <SparklesIcon className="size-4 text-primary shrink-0 mt-0.5" />
              <p className="text-[11px] leading-relaxed">
                Cổ phần Slicing Pie phản ánh tỷ trọng đóng góp động. Tỷ lệ này sẽ tiếp tục biến động theo các đầu việc Jira, commits Git và minh chứng nộp trong các Sprint tiếp theo.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-border/80 shadow-2xs bg-card flex flex-col overflow-hidden">
          <CardHeader className="p-4 sm:p-5 pb-3.5 border-b border-border/60 bg-muted/20">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="size-9 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                  <CalculatorIcon className="size-4.5" />
                </div>
                <div>
                  <CardTitle className="text-sm sm:text-base font-bold text-foreground">
                    Cách tính Slicing Pie & Đối soát điều chỉnh
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">
                    Minh bạch công thức quy đổi từ Slice Score sang tỷ lệ phân chia cuối cùng
                  </CardDescription>
                </div>
              </div>
              <Badge
                variant="outline"
                className={cn(
                  "font-mono text-[10px] font-bold",
                  hasAdjustment
                    ? "border-purple-500/30 bg-purple-500/10 text-purple-700 dark:text-purple-300"
                    : "border-border/70 text-muted-foreground"
                )}
              >
                {hasAdjustment ? "Đã điều chỉnh Peer Review" : "Chưa áp dụng điều chỉnh"}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="p-4 sm:p-5 flex-1 flex flex-col justify-between gap-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-border/60 bg-muted/20 p-3 space-y-1">
                <span className="text-[11px] text-muted-foreground font-medium block">
                  Tổng Slice Score nhóm
                </span>
                <span className="font-mono text-xl font-black text-foreground">
                  {formatContributionNumber(totalSliceScore)}
                </span>
                <p className="text-[10px] text-muted-foreground">
                  Đơn vị công sức quy đổi từ tất cả đầu việc
                </p>
              </div>

              <div className="rounded-xl border border-border/60 bg-muted/20 p-3 space-y-1">
                <span className="text-[11px] text-muted-foreground font-medium block">
                  Hệ số Đánh giá chéo
                </span>
                <span className="font-mono text-xl font-black text-foreground">
                  {hasAdjustment ? "Đã áp dụng" : "1.00 ×"}
                </span>
                <p className="text-[10px] text-muted-foreground">
                  Điều chỉnh theo kết quả Peer Review
                </p>
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-border/60">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/50 text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border/60">
                  <tr>
                    <th className="p-2.5 pl-3">Thành viên</th>
                    <th className="p-2.5 text-right font-mono">Slice Score</th>
                    <th className="p-2.5 text-right font-mono">Trước Peer</th>
                    <th className="p-2.5 text-right font-mono">Hệ số</th>
                    <th className="p-2.5 text-right font-mono pr-3">Cuối cùng</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60 font-medium">
                  {members.map((member) => {
                    const cleanedName = cleanMemberName(member.fullName) || member.studentCode;
                    return (
                      <tr key={member.studentProfileId || member.studentCode} className="hover:bg-muted/30">
                        <td className="p-2.5 pl-3">
                          <div className="font-bold text-foreground truncate max-w-[130px]">
                            {cleanedName}
                          </div>
                          <div className="font-mono text-[10px] text-muted-foreground">
                            {member.studentCode}
                          </div>
                        </td>
                        <td className="p-2.5 text-right font-mono font-bold text-foreground">
                          {formatContributionNumber(member.sliceScore)}
                        </td>
                        <td className="p-2.5 text-right font-mono text-muted-foreground">
                          {formatContributionPercent(member.sliceContributionPercentage)}
                        </td>
                        <td className="p-2.5 text-right font-mono text-muted-foreground">
                          × {formatContributionNumber(member.peerReviewScore)}
                        </td>
                        <td className="p-2.5 text-right font-mono font-black text-primary pr-3">
                          {formatContributionPercent(member.finalContributionPercentage)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex items-start gap-2 rounded-xl border border-border/60 bg-muted/20 p-3 text-xs text-muted-foreground">
              <InfoIcon className="size-4 text-primary shrink-0 mt-0.5" />
              <p className="text-[11px] leading-relaxed">
                {hasAdjustment
                  ? "Tỷ lệ cuối cùng đã được nhân với hệ số đánh giá chéo (Peer Review Multiplier) của từng thành viên và chuẩn hóa lại theo tổng công sức."
                  : "Chưa có điều chỉnh peer review được áp dụng. Tỷ lệ hiện tại đang được tính trực tiếp từ tỷ trọng Slice score của từng cá nhân."}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl border border-border/80 shadow-2xs bg-card overflow-hidden">
        <CardHeader className="p-4 sm:p-5 pb-3.5 border-b border-border/60 bg-muted/20">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="size-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <BarChart3Icon className="size-4.5" />
              </div>
              <div>
                <CardTitle className="text-sm sm:text-base font-bold text-foreground">
                  Đóng góp theo loại công sức
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Phân rã tỷ lệ đóng góp trong từng tiêu chuẩn: Lập trình, Kiểm thử, Tài liệu
                  {hasAnyResearch ? " và Nghiên cứu" : ""}
                </CardDescription>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1 text-muted-foreground">
                <span className="size-2.5 rounded-full bg-blue-500" />
                Lập trình
              </span>
              <span className="flex items-center gap-1 text-muted-foreground">
                <span className="size-2.5 rounded-full bg-emerald-500" />
                Kiểm thử
              </span>
              <span className="flex items-center gap-1 text-muted-foreground">
                <span className="size-2.5 rounded-full bg-amber-500" />
                Tài liệu
              </span>
              {hasAnyResearch && (
                <span className="flex items-center gap-1 text-muted-foreground">
                  <span className="size-2.5 rounded-full bg-purple-500" />
                  Nghiên cứu
                </span>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-5">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {members.map((member) => {
              const cleanedName = cleanMemberName(member.fullName) || member.studentCode;
              const codePct = Number(member.codeContributionPercentage) || 0;
              const testPct = Number(member.testContributionPercentage) || 0;
              const docPct = Number(member.documentContributionPercentage) || 0;
              const researchPct = Number(member.researchContributionPercentage) || 0;

              return (
                <div
                  key={member.studentProfileId || member.studentCode}
                  className="rounded-xl border border-border/70 bg-card p-4 space-y-3 shadow-2xs"
                >
                  <div className="flex items-center justify-between gap-2 border-b border-border/50 pb-2.5">
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-foreground truncate">
                        {cleanedName}
                      </h4>
                      <span className="font-mono text-[10px] text-muted-foreground">
                        {member.studentCode}
                      </span>
                    </div>
                    <MemberRoleBadge role={member.roleInTeam} />
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-muted-foreground">Lập trình (Code):</span>
                        <span className="font-mono font-bold text-foreground">
                          {formatContributionPercent(codePct)}
                        </span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full bg-blue-500 transition-all duration-300"
                          style={{ width: `${Math.min(Math.max(codePct, 0), 100)}%` }}
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-muted-foreground">Kiểm thử (Testing):</span>
                        <span className="font-mono font-bold text-foreground">
                          {formatContributionPercent(testPct)}
                        </span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full bg-emerald-500 transition-all duration-300"
                          style={{ width: `${Math.min(Math.max(testPct, 0), 100)}%` }}
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-muted-foreground">Tài liệu (Documentation):</span>
                        <span className="font-mono font-bold text-foreground">
                          {formatContributionPercent(docPct)}
                        </span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full bg-amber-500 transition-all duration-300"
                          style={{ width: `${Math.min(Math.max(docPct, 0), 100)}%` }}
                        />
                      </div>
                    </div>

                    {hasAnyResearch && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px]">
                          <span className="text-muted-foreground">Nghiên cứu (Research):</span>
                          <span className="font-mono font-bold text-foreground">
                            {formatContributionPercent(researchPct)}
                          </span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full rounded-full bg-purple-500 transition-all duration-300"
                            style={{ width: `${Math.min(Math.max(researchPct, 0), 100)}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
