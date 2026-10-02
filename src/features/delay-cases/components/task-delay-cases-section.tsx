"use client";

import { useDelayCases } from "../hooks/use-delay-cases";
import { DelayCaseCard } from "./delay-case-card";
import { Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TaskDelayCasesSectionProps {
  projectId: string;
  taskId: string;
}

export function TaskDelayCasesSection({ projectId, taskId }: TaskDelayCasesSectionProps) {
  const { data: delayCases, isLoading, isError, refetch } = useDelayCases(projectId, { taskId });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-muted-foreground gap-2">
        <Loader2 className="w-6 h-6 animate-spin" />
        <span className="text-sm">Đang tải hồ sơ trễ hạn...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 text-red-600 rounded-lg p-4 flex flex-col items-center justify-center gap-3">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          <span className="font-medium">Đã có lỗi xảy ra khi tải hồ sơ</span>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} className="border-red-500/30 text-red-600 hover:bg-red-500/10">
          Thử lại
        </Button>
      </div>
    );
  }

  if (!delayCases || delayCases.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-muted-foreground gap-2 bg-muted/20 rounded-lg border border-border/50">
        <span className="text-sm">Chưa có hồ sơ trễ hạn.</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {delayCases.map((delayCase) => (
        <DelayCaseCard key={delayCase.id} delayCase={delayCase} />
      ))}
    </div>
  );
}
