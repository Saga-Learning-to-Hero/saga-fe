"use client";

import { UserCheckIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface PeerAssessmentHeaderProps {
  completedCount: number;
  totalMembersToReview: number;
  currentSprintName: string;
}

export function PeerAssessmentHeader({
  completedCount,
  totalMembersToReview,
  currentSprintName,
}: PeerAssessmentHeaderProps) {
  const percent = Math.round((completedCount / totalMembersToReview) * 100);

  return (
    <div className="space-y-4 pb-2 border-b border-border/70">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-xs font-bold text-lg">
            <UserCheckIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
                Đánh giá Chéo Đồng đội (Peer Assessment)
              </h1>
              <Badge className="bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30 font-bold text-xs">
                SWP490_SAGA
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Đánh giá đóng góp của đồng đội trong <strong>{currentSprintName}</strong> (Không tự đánh giá bản thân)
            </p>
          </div>
        </div>

        {/* Progress Badge */}
        <div className="flex items-center gap-3 bg-muted/60 p-2.5 px-4 rounded-2xl border border-border/60 shrink-0">
          <div className="text-right">
            <span className="text-[11px] font-semibold text-muted-foreground block">
              Tiến độ đánh giá Sprint:
            </span>
            <span className="text-xs font-bold font-mono text-foreground">
              {completedCount}/{totalMembersToReview} thành viên ({percent}%)
            </span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-600 font-bold font-mono text-xs flex items-center justify-center shrink-0 border border-purple-500/20">
            {percent}%
          </div>
        </div>
      </div>
    </div>
  );
}
