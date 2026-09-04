"use client";

import Link from "next/link";
import { ExternalLinkIcon } from "lucide-react";
import type { GroupHealth } from "../types/course-dashboard";

interface Props {
  groups: GroupHealth[];
  selectedTeamId: string | null;
  courseId: string;
}

export function MiniSnaGraph({ groups, selectedTeamId, courseId }: Props) {
  const selectedTeam = groups.find(g => g.id === selectedTeamId);

  if (!selectedTeam) {
    return null;
  }

  return (
    <div className="flex h-full flex-col relative overflow-hidden">
      <div className="mb-2">
        <h3 className="text-base font-bold text-foreground">Đồ thị quan hệ nhóm</h3>
        <p className="text-[11px] text-muted-foreground">Tương tác nội bộ của {selectedTeam.name}</p>
      </div>

      <div className="flex-1 w-full bg-muted/20 rounded-xl border border-border/50 relative overflow-hidden flex items-center justify-center">
        {/* Placeholder for Mini Graph */}
        <div className="relative size-40">
          {/* Central Node */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-12 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center z-10 shadow-lg">
            <span className="text-[10px] font-bold text-primary">{selectedTeam.name}</span>
          </div>

          {/* Member Nodes */}
          {Array.from({ length: selectedTeam.memberCount }).map((_, i) => {
            const angle = (i * (360 / selectedTeam.memberCount)) * (Math.PI / 180);
            const radius = 60;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            
            // Randomly simulate a disconnected member
            const isDisconnected = selectedTeam.status === "CRITICAL" && i === 0;
            const nodeColor = isDisconnected ? "bg-destructive border-destructive" : "bg-card border-muted-foreground";

            return (
              <div key={i}>
                {/* Edge */}
                {!isDisconnected && (
                  <svg className="absolute inset-0 size-full pointer-events-none">
                    <line 
                      x1="50%" y1="50%" 
                      x2={`calc(50% + ${x}px)`} y2={`calc(50% + ${y}px)`} 
                      stroke="currentColor" 
                      strokeWidth="1.5"
                      className="text-muted-foreground/30"
                    />
                  </svg>
                )}
                {/* Node */}
                <div 
                  className={`absolute top-1/2 left-1/2 size-6 rounded-full border-2 flex items-center justify-center shadow-sm z-20 ${nodeColor}`}
                  style={{ transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))` }}
                >
                  <span className="text-[8px] font-bold">M{i+1}</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="absolute inset-0 bg-background/20 backdrop-blur-[1px] opacity-0 hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
          <Link 
            href={`/lecturer/courses/${courseId}/graph?team=${selectedTeam.id}`}
            className="flex items-center gap-2 bg-background border border-border px-4 py-2 rounded-full text-xs font-bold text-foreground shadow-lg hover:bg-muted transition-colors"
          >
            Mở đồ thị chi tiết
            <ExternalLinkIcon className="size-3" />
          </Link>
          <span className="text-[10px] text-muted-foreground bg-background/80 px-2 py-0.5 rounded-full border border-border/50">
            Kích thước node thể hiện mức đóng góp
          </span>
        </div>
      </div>
    </div>
  );
}
