"use client";

import {
  GitGraphIcon,
  AlertTriangleIcon,
  LayersIcon,
  ShieldCheckIcon,
  CheckCircle2Icon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface GraphStatsSummaryProps {
  totalNodes: number;
  totalEdges: number;
  traceabilityRate: number;
  msrCount: number;
}

export function GraphStatsSummary({
  totalNodes,
  totalEdges,
  traceabilityRate,
  msrCount,
}: GraphStatsSummaryProps) {
  return (
    <div className="p-3 px-4 sm:px-5 rounded-2xl bg-card/95 backdrop-blur-md border border-border/80 shadow-2xs flex flex-wrap items-center justify-between gap-y-3 gap-x-6 text-xs">
      <div className="flex items-center gap-3 min-w-[200px]">
        <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
          <ShieldCheckIcon className="w-4 h-4" />
        </div>
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              Tỷ Lệ Truy Xuất:
            </span>
            <span className="text-sm font-black text-foreground font-mono">
              {traceabilityRate}%
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-20 bg-muted h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${traceabilityRate}%` }}
              />
            </div>
            <span className="text-[10px] text-muted-foreground font-mono">Verified</span>
          </div>
        </div>
      </div>

      <div className="hidden lg:block w-px h-7 bg-border/60" />

      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
          <LayersIcon className="w-4 h-4" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              Quy Mô Đồ Thị:
            </span>
            <span className="text-sm font-black text-foreground font-mono">
              {totalNodes}
            </span>
            <span className="text-[11px] font-semibold text-muted-foreground">Đỉnh</span>
          </div>
          <span className="text-[10px] text-muted-foreground block font-mono">
            5 SV · 8 Task · 7 Commit
          </span>
        </div>
      </div>

      <div className="hidden lg:block w-px h-7 bg-border/60" />

      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
          <GitGraphIcon className="w-4 h-4" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              Cạnh Quan Hệ:
            </span>
            <span className="text-sm font-black text-foreground font-mono">
              {totalEdges}
            </span>
            <span className="text-[11px] font-semibold text-muted-foreground">Cạnh</span>
          </div>
          <span className="text-[10px] text-muted-foreground block font-mono">
            Neo4j AuraDB · Deterministic
          </span>
        </div>
      </div>

      <div className="hidden lg:block w-px h-7 bg-border/60" />

      <div className="flex items-center gap-3 min-w-[200px]">
        <div
          className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${msrCount > 0
              ? "bg-red-500/15 text-red-600 dark:text-red-400"
              : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
            }`}
        >
          {msrCount > 0 ? (
            <AlertTriangleIcon className="w-4 h-4" />
          ) : (
            <CheckCircle2Icon className="w-4 h-4" />
          )}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              Cảnh Báo MSR:
            </span>
            {msrCount > 0 ? (
              <Badge className="bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30 text-[10px] font-mono font-bold animate-pulse">
                {msrCount} Bất thường (SAGA-24)
              </Badge>
            ) : (
              <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold">
                Nhất quán 100%
              </Badge>
            )}
          </div>
          <span className="text-[10px] text-muted-foreground block">
            {msrCount > 0 ? "Task DONE thiếu commit" : "Khớp nối hợp lệ"}
          </span>
        </div>
      </div>
    </div>
  );
}
