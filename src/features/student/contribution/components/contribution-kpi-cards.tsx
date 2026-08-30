"use client";

import {
  PieChartIcon,
  AwardIcon,
  ScaleIcon,
  GitGraphIcon,
  TrendingUpIcon,
  CheckCircle2Icon,
} from "lucide-react";
import type { MemberContribution } from "../types/contribution";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ContributionKPICardsProps {
  currentMember: MemberContribution;
}

export function ContributionKPICards({ currentMember }: ContributionKPICardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* KPI 1: Tỷ lệ đóng góp cá nhân (%) */}
      <Card className="rounded-2xl border border-border/80 bg-card p-4 sm:p-5 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
            <PieChartIcon className="w-4 h-4 text-primary" />
            Tỷ lệ Đóng góp Cá nhân
          </span>
          <Badge className="bg-primary/15 text-primary border-primary/30 font-mono font-bold text-[10px]">
            Chuẩn: 20.0%
          </Badge>
        </div>

        <div className="flex items-baseline justify-between">
          <div>
            <span className="text-2xl sm:text-3xl font-extrabold text-foreground font-mono">
              {currentMember.contributionPercentage}%
            </span>
            <p className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1">
              <TrendingUpIcon className="w-3 h-3 text-emerald-500" />
              Cao hơn trung bình +{(currentMember.contributionPercentage - 20).toFixed(1)}%
            </p>
          </div>

          <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-xs font-bold">
            Vượt chỉ tiêu
          </Badge>
        </div>
      </Card>

      {/* KPI 2: Điểm đóng góp tổng hợp */}
      <Card className="rounded-2xl border border-border/80 bg-card p-4 sm:p-5 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
            <AwardIcon className="w-4 h-4 text-purple-500" />
            Điểm Đóng góp Quy đổi
          </span>
          <Badge variant="outline" className="text-[10px] font-mono font-bold">
            Thang 10
          </Badge>
        </div>

        <div className="flex items-baseline justify-between">
          <div>
            <span className="text-2xl sm:text-3xl font-extrabold text-purple-600 dark:text-purple-400 font-mono">
              {currentMember.weightedScore}
            </span>
            <span className="text-xs text-muted-foreground font-mono font-semibold"> / 10.0</span>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Dựa trên Slicing Pie multi-source
            </p>
          </div>

          <Badge className="bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30 text-xs font-bold">
            Xuất sắc
          </Badge>
        </div>
      </Card>

      {/* KPI 3: Chỉ số cân bằng nhóm */}
      <Card className="rounded-2xl border border-border/80 bg-card p-4 sm:p-5 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
            <ScaleIcon className="w-4 h-4 text-blue-500" />
            Độ Cân bằng Nhóm
          </span>
          <Badge className="bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30 text-[10px] font-mono font-bold">
            Gini: 0.12
          </Badge>
        </div>

        <div className="flex items-baseline justify-between">
          <div>
            <span className="text-lg sm:text-xl font-bold text-foreground">
              Khá cân bằng
            </span>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              4/5 thành viên đóng góp tốt
            </p>
          </div>

          <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/30 text-xs font-bold">
            Ổn định
          </Badge>
        </div>
      </Card>

      {/* KPI 4: Tỷ lệ Traceability ma vết */}
      <Card className="rounded-2xl border border-border/80 bg-card p-4 sm:p-5 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
            <GitGraphIcon className="w-4 h-4 text-emerald-500" />
            Tỷ lệ Ma vết (Traceability)
          </span>
          <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/30 text-[10px] font-mono font-bold">
            Verified
          </Badge>
        </div>

        <div className="flex items-baseline justify-between">
          <div>
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
              {currentMember.metrics.traceabilityRate}%
            </span>
            <p className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1">
              <CheckCircle2Icon className="w-3 h-3 text-emerald-500" />
              98% Task có Commit đối ứng
            </p>
          </div>

          <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-xs font-bold">
            Tin cậy
          </Badge>
        </div>
      </Card>
    </div>
  );
}
