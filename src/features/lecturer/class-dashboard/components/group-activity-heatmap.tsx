"use client";

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { GroupHealth } from "../types/course-dashboard";
import { cn } from "@/lib/utils";

interface Props {
  groups: GroupHealth[];
  selectedTeamId: string | null;
  onSelectTeam: (id: string | null) => void;
  weeksCount?: number;
}

export function GroupActivityHeatmap({ groups, selectedTeamId, onSelectTeam }: Props) {
  // Mock 8 weeks for dashboard view
  const weeks = Array.from({ length: 8 }, (_, i) => i + 1);

  // Determine max commits to normalize colors
  let maxCommits = 0;
  groups.forEach(g => {
    if (g.weeklyCommits) {
      g.weeklyCommits.forEach(c => {
        if (c > maxCommits) maxCommits = c;
      });
    }
  });

  return (
    <div className="flex h-full flex-col">
      <div className="mb-4">
        <h3 className="text-base font-bold text-foreground">Mức độ hoạt động theo tuần</h3>
        <p className="text-xs text-muted-foreground">Phân bổ cập nhật mã nguồn trong 8 tuần gần nhất</p>
      </div>
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-4">
        <span>Ít</span>
        <div className="flex gap-1">
          <div className="size-3 rounded-sm bg-muted/30 border border-border/50" />
          <div className="size-3 rounded-sm bg-primary/20" />
          <div className="size-3 rounded-sm bg-primary/40" />
          <div className="size-3 rounded-sm bg-primary/70" />
          <div className="size-3 rounded-sm bg-primary" />
        </div>
        <span>Nhiều</span>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[600px]">
          <div className="flex flex-col min-w-max">
            {/* Header row */}
            <div className="flex mb-2">
              <div className="w-24 shrink-0 text-[10px] font-bold text-muted-foreground uppercase sticky left-0 bg-card z-10 py-1">Nhóm</div>
              {weeks.map(w => (
                <div key={w} className="w-8 shrink-0 text-center text-[10px] font-bold text-muted-foreground">T{w}</div>
              ))}
            </div>

            {/* Matrix */}
            <TooltipProvider delay={200}>
              <div className="flex flex-col gap-1.5">
                {groups.map(g => {
                  const isSelected = g.id === selectedTeamId;
                  const isCritical = g.status === "CRITICAL";
                  return (
                    <div 
                      key={g.id} 
                      className={cn(
                        "flex items-center group cursor-pointer rounded overflow-hidden transition-all",
                        isSelected ? "ring-2 ring-primary bg-muted/30" : "hover:bg-muted/10"
                      )}
                      onClick={() => onSelectTeam(isSelected ? null : g.id)}
                    >
                      <div className={cn("w-24 shrink-0 text-xs font-semibold px-2 py-1.5 sticky left-0 bg-card z-10 truncate", isSelected ? "text-primary" : "text-foreground group-hover:text-primary")}>
                        {g.name}
                      </div>
                      {weeks.map((w, idx) => {
                        const count = g.weeklyCommits?.[idx] || 0;
                        // Determine color scale
                        let bgColor = "bg-muted/40";
                        if (count > 0 && count <= 5) bgColor = "bg-primary/20";
                        else if (count > 5 && count <= 15) bgColor = "bg-primary/40";
                        else if (count > 15 && count <= 30) bgColor = "bg-primary/60";
                        else if (count > 30) bgColor = "bg-primary";
                        
                        // Critical warning if zero commits for a critical group
                        const borderClass = (count === 0 && isCritical) ? "ring-1 ring-inset ring-destructive/80" : "";
                        
                        return (
                          <Tooltip key={w}>
                            <TooltipTrigger 
                              render={
                                <div className="w-8 shrink-0 p-0.5">
                                  <div className={cn("w-full h-6 rounded-sm transition-colors", bgColor, borderClass)} />
                                </div>
                              } 
                            />
                            <TooltipContent>
                              <div className="text-xs">
                                <span className="font-bold">{g.name}</span> — Tuần {w}
                                <div className="mt-1">{count} lần cập nhật</div>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </TooltipProvider>
          </div>
        </div>
      </div>
    </div>
  );
}
