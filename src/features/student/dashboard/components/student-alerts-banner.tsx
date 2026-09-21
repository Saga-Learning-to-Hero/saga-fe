"use client";

import Link from "next/link";
import { AlertCircleIcon, AlertTriangleIcon, ArrowRightIcon, InfoIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { studentCoursePath } from "@/features/student/courses/hooks/use-student-course-context";
import { cn } from "@/lib/utils";
import type { StudentDashboardActionableAlert } from "../types/student-dashboard-types";

interface StudentAlertsBannerProps {
  alerts: StudentDashboardActionableAlert[];
  courseId: string;
}

export function StudentAlertsBanner({ alerts, courseId }: StudentAlertsBannerProps) {
  if (!alerts || alerts.length === 0) return null;

  return (
    <div className="space-y-3">
      {alerts.map((alert) => {
        const isCritical = alert.severity?.toUpperCase() === "CRITICAL";
        const isWarning = alert.severity?.toUpperCase() === "WARNING";

        // Xác định link hành động dựa trên type hoặc targetIds
        let targetHref = studentCoursePath("/student/sprint-progress", courseId);
        let actionLabel = "Xem chi tiết";

        const alertType = alert.type?.toUpperCase();
        if (alertType.includes("MSR") || alertType.includes("COMMIT")) {
          targetHref = studentCoursePath("/student/commits", courseId);
          actionLabel = "Đối soát commit";
        } else if (alertType.includes("PEER") || alertType.includes("REVIEW")) {
          targetHref = studentCoursePath("/student/assessment", courseId);
          actionLabel = "Chấm điểm chéo";
        } else if (alertType.includes("TRACEABILITY") || alertType.includes("GRAPH")) {
          targetHref = studentCoursePath("/student/graph", courseId);
          actionLabel = "Xem đồ thị";
        }

        return (
          <div
            key={alert.id}
            className={cn(
              "flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl border shadow-xs transition-all",
              isCritical
                ? "bg-red-500/10 border-red-500/30 text-red-950 dark:text-red-200"
                : isWarning
                  ? "bg-amber-500/10 border-amber-500/30 text-amber-950 dark:text-amber-200"
                  : "bg-sky-500/10 border-sky-500/30 text-sky-950 dark:text-sky-200"
            )}
          >
            <div className="flex items-start gap-3">
              <div
                className={cn(
                  "p-2 rounded-xl shrink-0 mt-0.5",
                  isCritical
                    ? "bg-red-500/20 text-red-600 dark:text-red-400"
                    : isWarning
                      ? "bg-amber-500/20 text-amber-600 dark:text-amber-400"
                      : "bg-sky-500/20 text-sky-600 dark:text-sky-400"
                )}
              >
                {isCritical ? (
                  <AlertCircleIcon className="size-4" />
                ) : isWarning ? (
                  <AlertTriangleIcon className="size-4" />
                ) : (
                  <InfoIcon className="size-4" />
                )}
              </div>
              <div className="space-y-0.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold">{alert.title}</span>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[10px] px-2 py-0.5 uppercase tracking-wide",
                      isCritical
                        ? "border-red-500/40 bg-red-500/15 text-red-700 dark:text-red-300"
                        : isWarning
                          ? "border-amber-500/40 bg-amber-500/15 text-amber-700 dark:text-amber-300"
                          : "border-sky-500/40 bg-sky-500/15 text-sky-700 dark:text-sky-300"
                    )}
                  >
                    {alert.type}
                  </Badge>
                  {typeof alert.remainingPeers === "number" && alert.remainingPeers > 0 && (
                    <Badge variant="secondary" className="text-[10px]">
                      Còn {alert.remainingPeers} bạn
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{alert.message}</p>
              </div>
            </div>

            <Link
              href={targetHref}
              prefetch={true}
              className={cn(
                buttonVariants({ size: "sm", variant: isCritical ? "destructive" : "outline" }),
                "shrink-0 text-xs gap-1.5 cursor-pointer self-end sm:self-center"
              )}
            >
              <span>{actionLabel}</span>
              <ArrowRightIcon className="size-3.5" />
            </Link>
          </div>
        );
      })}
    </div>
  );
}
