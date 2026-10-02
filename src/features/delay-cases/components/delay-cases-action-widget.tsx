"use client";

import { useMemo, useState } from "react";
import { ArrowRightIcon, CheckCircle2Icon, ShieldAlertIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useDelayCases, useLecturerDelayQueue } from "../hooks/use-delay-cases";
import { DelayCaseDetailModal } from "./delay-case-detail-modal";


interface DelayCasesActionWidgetProps {
  projectId?: string;
  mode: "student" | "lecturer";
}

export function DelayCasesActionWidget({ projectId, mode }: DelayCasesActionWidgetProps) {
  const isStudent = mode === "student";
  const isLecturer = mode === "lecturer";

  const studentQuery = useDelayCases(projectId || "", undefined);
  const lecturerQuery = useLecturerDelayQueue({ status: "AWAITING_LECTURER" });

  const query = isStudent ? studentQuery : lecturerQuery;
  const isLoading = query.isLoading;
  const delayCases = query.data || [];

  const actionableCases = useMemo(() => {
    if (!delayCases) return [];
    if (isLecturer) {
      return delayCases.filter((c) => c.status === "AWAITING_LECTURER");
    }
    return delayCases.filter((c) => {
      if (c.status === "OPEN" && c.permissions?.canExplain) return true;
      if (c.status === "AWAITING_LEADER" && c.permissions?.canLeaderReview) return true;
      return false;
    });
  }, [delayCases, isLecturer]);

  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);

  if (!projectId && isStudent) return null;

  return (
    <>
      <Card className="rounded-xl border border-border/80 bg-card/90 shadow-xs flex flex-col h-full max-h-[500px]">
        <CardHeader className="p-4 pb-2 border-b border-border/60 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-orange-500/10 text-orange-500">
              <ShieldAlertIcon className="size-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-sm font-bold">Hồ sơ trễ hạn cần xử lý</CardTitle>
                {actionableCases.length > 0 && (
                  <Badge variant="destructive" className="font-mono text-xs px-1.5 py-0 h-4">
                    {actionableCases.length}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {isLecturer
                  ? "Các hồ sơ đang chờ giảng viên xét duyệt"
                  : "Các hồ sơ bạn hoặc trưởng nhóm cần giải trình/xét duyệt"}
              </p>
            </div>
          </div>

        </CardHeader>

        <CardContent className="p-4 flex-1 space-y-2.5 overflow-y-auto custom-scrollbar pr-2">
          {isLoading ? (
            <div className="py-8 text-center text-muted-foreground text-xs animate-pulse">
              Đang tải dữ liệu...
            </div>
          ) : actionableCases.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground space-y-2 flex flex-col items-center justify-center">
              <CheckCircle2Icon className="size-8 text-emerald-500/70" />
              <p className="text-xs">Không có hồ sơ nào cần xử lý ngay lúc này.</p>
            </div>
          ) : (
            actionableCases.map((delayCase) => (
              <div
                key={delayCase.id}
                className="p-3 rounded-xl border border-orange-500/30 bg-orange-500/5 hover:bg-orange-500/10 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer"
                onClick={() => setSelectedCaseId(delayCase.id)}
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-orange-600 dark:text-orange-400">
                      {delayCase.taskDetails.taskKey}
                    </span>
                    <Badge
                      variant="outline"
                      className="text-[10px] uppercase font-bold bg-orange-500/15 text-orange-700 dark:text-orange-300 border-orange-500/40"
                    >
                      {delayCase.status === "OPEN"
                        ? "Chờ giải trình"
                        : delayCase.status === "AWAITING_LEADER"
                          ? "Chờ trưởng nhóm"
                          : "Chờ giảng viên"}
                    </Badge>
                  </div>
                  <p className="text-xs text-foreground font-medium truncate" title={delayCase.taskDetails.taskSummary}>
                    {delayCase.taskDetails.taskSummary}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    Từ: <span className="font-semibold">{delayCase.taskDetails.assigneeName}</span> ({delayCase.taskDetails.assigneeStudentCode})
                  </p>
                </div>

                <div className="shrink-0 self-end sm:self-center">
                  <Button size="sm" variant="outline" className="h-7 text-xs border-orange-500/30 text-orange-700 hover:bg-orange-500/10">
                    Xử lý ngay <ArrowRightIcon className="ml-1 size-3" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {selectedCaseId && projectId && (
        <DelayCaseDetailModal
          projectId={projectId}
          caseId={selectedCaseId}
          onClose={() => setSelectedCaseId(null)}
        />
      )}

      {selectedCaseId && !projectId && isLecturer && (
        <DelayCaseDetailModal
          projectId={delayCases.find(c => c.id === selectedCaseId)?.taskDetails.projectId || ""}
          caseId={selectedCaseId}
          onClose={() => setSelectedCaseId(null)}
        />
      )}
    </>
  );
}
