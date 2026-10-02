"use client";

import { useState } from "react";
import { formatDateOnly } from "../lib/time-utils";
import {
  getStatusConfig,
} from "../lib/delay-case-constants";
import type { DelayCaseResponse } from "../types/delay-cases";
import { Badge } from "@/components/ui/badge";
import { User, Calendar, GitCommit, Search, ShieldAlert, CheckCircle2, AlertCircle } from "lucide-react";
import { DelayCaseDetailModal } from "./delay-case-detail-modal";
import { Button } from "@/components/ui/button";

interface DelayCaseCardProps {
  delayCase: DelayCaseResponse;
}

export function DelayCaseCard({ delayCase }: DelayCaseCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const statusConfig = getStatusConfig(delayCase.status);

  // Determine the primary action button label
  let primaryActionLabel = "Xem chi tiết";
  let primaryActionIcon = <Search className="w-4 h-4" />;
  let primaryActionVariant: "default" | "outline" | "secondary" = "outline";

  if (delayCase.permissions.canExplain) {
    primaryActionLabel = "Viết giải trình";
    primaryActionIcon = <AlertCircle className="w-4 h-4" />;
    primaryActionVariant = "default";
  } else if (delayCase.permissions.canLeaderReview) {
    primaryActionLabel = "Trưởng nhóm duyệt";
    primaryActionIcon = <CheckCircle2 className="w-4 h-4" />;
    primaryActionVariant = "default";
  } else if (delayCase.permissions.canLecturerReview) {
    primaryActionLabel = "Giảng viên phán quyết";
    primaryActionIcon = <ShieldAlert className="w-4 h-4" />;
    primaryActionVariant = "default";
  }

  return (
    <>
      <div
        className="bg-card border border-border/60 rounded-xl overflow-hidden flex flex-col shadow-sm transition-all hover:shadow-md hover:border-primary/30"
      >
        <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-3 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="font-mono bg-blue-500/10 text-blue-700 hover:bg-blue-500/20 border border-blue-500/20 rounded-md">
                {delayCase.task?.externalKey}
              </Badge>
              <h3 className="text-base font-bold text-foreground">
                {delayCase.task?.title}
              </h3>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <User className="w-4 h-4" />
                <span className="font-medium text-foreground">{delayCase.student?.fullName}</span>
                <span className="text-xs">({delayCase.student?.studentCode})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                <span>Hạn:</span>
                <span className="font-medium text-foreground">{formatDateOnly(delayCase.dueDate)}</span>
              </div>
            </div>

            {/* Quick system signals */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <Badge variant="outline" className="text-[10px] sm:text-xs font-normal border-border/50 text-muted-foreground bg-muted/20 flex items-center gap-1">
                <GitCommit className="w-3 h-3" /> {delayCase.signals.commitCount} Commits
              </Badge>
              {delayCase.signals.currentlyBlocked && (
                <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-[10px] sm:text-xs font-normal">Đang bị chặn</Badge>
              )}
              {delayCase.signals.otherOpenTasksNearDue > 0 && (
                <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-[10px] sm:text-xs font-normal">
                  +{delayCase.signals.otherOpenTasksNearDue} Task gần hạn
                </Badge>
              )}
            </div>
          </div>

          <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-4 sm:gap-3 shrink-0">
            <Badge variant="outline" className={`shrink-0 text-sm px-3 py-1 shadow-sm ${statusConfig.colorClass}`}>
              {statusConfig.label}
            </Badge>
            <Button
              variant={primaryActionVariant}
              size="sm"
              className="gap-1.5 w-full sm:w-auto"
              onClick={() => setIsModalOpen(true)}
            >
              {primaryActionIcon} {primaryActionLabel}
            </Button>
          </div>
        </div>
      </div>

      <DelayCaseDetailModal
        delayCase={delayCase}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
