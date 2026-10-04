"use client";

import { GitGraphIcon, AlertTriangleIcon, LayersIcon, CheckCircle2Icon, FilterIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { GraphMeta } from "../types/graph";

interface GraphStatsSummaryProps {
  totalNodes: number;
  totalEdges: number;
  anomalyCount: number;
  meta?: GraphMeta;
  canLoadMore?: boolean;
  isLoadingMore?: boolean;
  onLoadMore?: () => void;
}

export function GraphStatsSummary({
  totalNodes,
  totalEdges,
  anomalyCount,
  meta,
  canLoadMore = false,
  isLoadingMore = false,
  onLoadMore,
}: GraphStatsSummaryProps) {
  const isTruncated = meta?.truncated || (meta && meta.returnedNodes < meta.totalNodes);

  return (
    <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 rounded-xl border border-border/80 bg-card/95 p-3 px-4 text-xs shadow-2xs backdrop-blur-sm sm:px-5">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
          <LayersIcon className="w-4 h-4" />
        </div>
        <div>
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
            Thống kê cấu trúc Graph
          </span>
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-black text-foreground font-mono">
              {meta ? meta.returnedNodes : totalNodes}
            </span>
            <span className="text-xs font-semibold text-muted-foreground">
              {meta && meta.totalNodes > meta.returnedNodes ? `/ ${meta.totalNodes} Nodes` : "Nodes"}
            </span>
          </div>
        </div>
      </div>

      <div className="hidden sm:block w-px h-7 bg-border/60" />

      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
          <GitGraphIcon className="w-4 h-4" />
        </div>
        <div>
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
            Mạng lưới quan hệ
          </span>
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-black text-foreground font-mono">
              {meta ? meta.returnedEdges : totalEdges}
            </span>
            <span className="text-xs font-semibold text-muted-foreground">
              {meta && meta.totalEdges > meta.returnedEdges ? `/ ${meta.totalEdges} Edges` : "Edges"}
            </span>
          </div>
        </div>
      </div>

      <div className="hidden sm:block w-px h-7 bg-border/60" />

      <div className="flex items-center gap-3">
        <div
          className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${anomalyCount > 0
            ? "bg-red-500/15 text-red-600 dark:text-red-400"
            : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
            }`}
        >
          {anomalyCount > 0 ? (
            <AlertTriangleIcon className="w-4 h-4" />
          ) : (
            <CheckCircle2Icon className="w-4 h-4" />
          )}
        </div>
        <div>
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
            Phát hiện bất thường
          </span>
          <div className="flex items-center gap-2 mt-0.5">
            {anomalyCount > 0 ? (
              <Badge className="bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30 text-xs font-mono font-bold animate-pulse">
                {anomalyCount} node bất thường
              </Badge>
            ) : (
              <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-xs font-mono font-bold">
                0 bất thường
              </Badge>
            )}
          </div>
        </div>
      </div>

      {isTruncated && (
        <>
          <div className="hidden sm:block w-px h-7 bg-border/60" />
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <FilterIcon className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block">
                Cắt tỉa Subgraph
              </span>
              <span className="text-xs font-medium text-muted-foreground">
                Tối ưu tải mạng lưới lớn
              </span>
              {canLoadMore && onLoadMore && (
                <button
                  type="button"
                  onClick={onLoadMore}
                  disabled={isLoadingMore}
                  className="mt-1 rounded-lg border border-border bg-background px-2 py-1 text-xs font-bold text-foreground cursor-pointer disabled:opacity-60"
                >
                  {isLoadingMore ? "Đang tải..." : "Tải thêm"}
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
