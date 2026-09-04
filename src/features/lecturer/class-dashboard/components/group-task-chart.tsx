"use client";

import { useRouter, useParams } from "next/navigation";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AlertCircleIcon, CheckCircle2Icon, AlertTriangleIcon } from "lucide-react";
import type { GroupHealth, GroupHealthStatus } from "../types/course-dashboard";
import { cn } from "@/lib/utils";

export function GroupTaskChart({ groups }: { groups: GroupHealth[] }) {
  const router = useRouter();
  const params = useParams();
  const courseId = params.courseId as string;

  // Sort groups: CRITICAL first, WARNING second, then by percentage
  const sortedGroups = [...groups].sort((a, b) => {
    const statusWeight = { CRITICAL: 3, WARNING: 2, HEALTHY: 1 };
    if (statusWeight[a.status] !== statusWeight[b.status]) {
      return statusWeight[b.status] - statusWeight[a.status];
    }
    const aPercent = a.tasksCompleted / a.totalTasks;
    const bPercent = b.tasksCompleted / b.totalTasks;
    return bPercent - aPercent;
  });

  const getStatusConfig = (status: GroupHealthStatus) => {
    switch (status) {
      case "HEALTHY":
        return { color: "bg-emerald-500", icon: CheckCircle2Icon, label: "Ổn định", textColor: "text-emerald-500" };
      case "WARNING":
        return { color: "bg-amber-500", icon: AlertTriangleIcon, label: "Cần chú ý", textColor: "text-amber-500" };
      case "CRITICAL":
        return { color: "bg-destructive", icon: AlertCircleIcon, label: "Nguy cơ cao", textColor: "text-destructive" };
      default:
        return { color: "bg-muted-foreground", icon: CheckCircle2Icon, label: "Không xác định", textColor: "text-muted-foreground" };
    }
  };

  return (
    <div className="flex h-full flex-col">
      <div className="mb-4">
        <h3 className="text-base font-bold text-foreground">Tiến độ công việc theo nhóm</h3>
        <p className="text-xs text-muted-foreground">So sánh tiến độ giữa các nhóm dự án</p>
      </div>

      <div className="flex-1 flex flex-col gap-4 overflow-y-auto pr-2 pb-2">
        <TooltipProvider delay={300}>
          {sortedGroups.map((group) => {
            const percent = group.totalTasks > 0 ? Math.round((group.tasksCompleted / group.totalTasks) * 100) : 0;
            const config = getStatusConfig(group.status);
            const StatusIcon = config.icon;

            return (
              <Tooltip key={group.id}>
                <TooltipTrigger
                  render={
                    <div
                      className="flex flex-col gap-1.5 group cursor-pointer hover:bg-muted/30 p-2 -mx-2 rounded-lg transition-colors"
                      onClick={() => router.push(`/lecturer/courses/${courseId}/teams/${group.id}`)}
                    />
                  }
                >
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <StatusIcon className={cn("size-4", config.textColor)} />
                      <span className="font-bold text-foreground group-hover:text-primary transition-colors">
                        {group.name} <span className="text-muted-foreground font-normal hidden sm:inline">— {group.projectName}</span>
                      </span>
                    </div>
                    <span className="font-medium text-xs whitespace-nowrap">
                      {group.tasksCompleted}/{group.totalTasks} công việc · {percent}%
                    </span>
                  </div>
                  <div className="relative w-full h-3 bg-muted rounded-full overflow-hidden">
                    <div
                      className={cn("h-full transition-all duration-500", config.color)}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top" className="flex flex-col gap-1 text-xs">
                  <div className="font-bold mb-1">{group.projectName}</div>
                  <div>Trạng thái: <span className={config.textColor}>{config.label}</span></div>
                  <div>Đợt phát triển: {group.currentSprint}</div>
                  <div>Cập nhật mã nguồn (7 ngày): {group.commitsLast7Days} lần</div>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </TooltipProvider>
      </div>
    </div>
  );
}
