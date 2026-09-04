"use client";

import { useMemo } from "react";
import {
  PieChartIcon,
  ShieldCheckIcon,
} from "lucide-react";
import { MOCK_CONTRIBUTION_MEMBERS } from "../data/mock-contribution-data";
import { ContributionKPICards } from "./contribution-kpi-cards";
import { ContributionCharts } from "./contribution-charts";
import { ContributionTable } from "./contribution-table";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { Badge } from "@/components/ui/badge";

export function ContributionView() {
  const authUser = useAuthStore((state) => state.user);
  const currentStudentCode = authUser?.studentCode || "HE170504";

  const activeCurrentMember = useMemo(() => {
    return (
      MOCK_CONTRIBUTION_MEMBERS.find((m) => m.studentCode === currentStudentCode) ||
      MOCK_CONTRIBUTION_MEMBERS[0]
    );
  }, [currentStudentCode]);

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-12">
      {/* Top Banner Header */}
      <div className="space-y-4 pb-2 border-b border-border/70">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shrink-0 shadow-xs font-bold text-lg">
              <PieChartIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
                  Tỷ Lệ Đóng Góp Nhóm (Contribution Analysis)
                </h1>
                <Badge className="bg-primary/15 text-primary border-primary/30 font-bold text-xs">
                  SLICING PIE MODEL
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Đánh giá tỷ lệ đóng góp (%) của từng thành viên dựa trên Git Commits, Jira Tasks, Peer Review và liên kết Traceability.
              </p>
            </div>
          </div>

          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 font-bold text-xs gap-1.5 self-start md:self-auto py-1 px-3">
            <ShieldCheckIcon className="w-4 h-4" />
            Minh bạch dữ liệu 100%
          </Badge>
        </div>
      </div>

      {/* Section 1: KPI Cards */}
      <ContributionKPICards currentMember={activeCurrentMember} />

      {/* Section 2: Recharts Analytics */}
      <ContributionCharts members={MOCK_CONTRIBUTION_MEMBERS} />

      {/* Section 3: Detailed Member Comparison Table */}
      <ContributionTable members={MOCK_CONTRIBUTION_MEMBERS} currentStudentCode={currentStudentCode} />
    </div>
  );
}
