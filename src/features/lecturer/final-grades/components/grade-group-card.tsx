"use client";

import { useState } from "react";
import { ChevronDownIcon, ChevronRightIcon, AlertTriangleIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { FinalGradebook, StudentFinalGrade } from "../types/final-grades";
import { LockIcon } from "lucide-react";
import { StatusBadge } from "./status-badge";

interface GradeGroupCardProps {
  groupId: string | null;
  groupName: string;
  projectName?: string;
  leaderName?: string;
  students: StudentFinalGrade[];
  components: FinalGradebook["components"];
  defaultExpanded?: boolean;
}

export function GradeGroupCard({
  groupId,
  groupName,
  projectName,
  leaderName,
  students,
  components,
  defaultExpanded = false
}: GradeGroupCardProps) {
  
  // A group is automatically expanded if it has issues
  const hasIssues = students.some(s => s.status === "INCOMPLETE" || s.status === "FAILED");
  const [expanded, setExpanded] = useState(defaultExpanded || hasIssues);
  
  const averageScore = students.filter(s => s.finalScore !== null).length > 0
    ? students.filter(s => s.finalScore !== null).reduce((sum, s) => sum + (s.finalScore || 0), 0) / students.filter(s => s.finalScore !== null).length
    : null;
    
  const incompleteCount = students.filter(s => s.status === "INCOMPLETE").length;
  const failedCount = students.filter(s => s.status === "FAILED").length;
  const sortedComponents = [...components].sort((a, b) => a.order - b.order);

  const isNoGroup = groupId === null;

  return (
    <div className={cn(
      "rounded-xl border transition-colors overflow-hidden",
      isNoGroup ? "border-dashed border-amber-500/40 bg-amber-500/5" : "border-border bg-card",
      expanded && !isNoGroup ? "shadow-saga-sm" : ""
    )}>
      {/* Header */}
      <button 
        type="button"
        className={cn(
          "flex items-center justify-between p-4 cursor-pointer hover:bg-muted/30 transition-colors w-full text-left",
          expanded && "border-b border-border/60 bg-muted/10"
        )}
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
      >
        <div className="flex items-center gap-3">
          <div className="p-1 rounded-md hover:bg-muted text-muted-foreground">
            {expanded ? <ChevronDownIcon className="size-4" /> : <ChevronRightIcon className="size-4" />}
          </div>
          
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h3 className={cn("font-bold", isNoGroup && "text-amber-600 dark:text-amber-500")}>
                {groupName}
              </h3>
              <span className="text-xs text-muted-foreground font-medium">· {students.length} thành viên</span>
              
              {isNoGroup && (
                <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-xs shadow-none">
                  <AlertTriangleIcon className="size-3 mr-1" />
                  Cần xử lý
                </Badge>
              )}
            </div>
            
            {!isNoGroup && (projectName || leaderName) && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                {projectName && <span className="truncate max-w-[200px]" title={projectName}>{projectName}</span>}
                {projectName && leaderName && <span>·</span>}
                {leaderName && (
                  <span>Trưởng nhóm: <span className="font-medium text-foreground">{leaderName}</span></span>
                )}
              </div>
            )}
            
            {isNoGroup && (
              <div className="text-xs text-muted-foreground mt-0.5">
                Sinh viên chưa được xếp nhóm nên chưa có điểm đồ án nhóm
              </div>
            )}
          </div>
        </div>
        
        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center gap-3">
             {averageScore !== null && !isNoGroup && (
               <div className="text-sm font-medium">
                 Điểm TB: <span className="font-mono font-bold text-primary">{averageScore.toFixed(2)}</span>
               </div>
             )}
          </div>
          
          <div className="flex gap-2">
            {incompleteCount > 0 && (
              <span className="text-[11px] font-medium text-amber-600 bg-amber-500/10 px-1.5 py-0.5 rounded">
                {incompleteCount} thiếu điểm
              </span>
            )}
            {failedCount > 0 && (
              <span className="text-[11px] font-medium text-rose-600 bg-rose-500/10 px-1.5 py-0.5 rounded">
                {failedCount} dưới chuẩn
              </span>
            )}
          </div>
        </div>
      </button>

      {/* Body Table */}
      {expanded && (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/30 text-muted-foreground border-b border-border/50">
              <tr>
                <th scope="col" className="sticky left-0 z-10 w-[240px] bg-muted/30 p-3 pl-4 font-bold backdrop-blur-md text-xs uppercase tracking-wider">
                  Sinh viên
                </th>
                {sortedComponents.map((comp) => (
                  <th key={comp.id} scope="col" className="p-3 text-right font-bold whitespace-nowrap text-xs uppercase tracking-wider">
                    <div className="flex flex-col items-end gap-0.5">
                      <span>{comp.name}</span>
                      <span className="text-[10px] font-medium text-muted-foreground lowercase normal-case">{comp.weight}%</span>
                    </div>
                  </th>
                ))}
                <th scope="col" className="p-3 text-right font-bold text-primary whitespace-nowrap text-xs uppercase tracking-wider">
                  Tổng kết
                </th>
                <th scope="col" className="p-3 pr-4 font-bold whitespace-nowrap text-xs uppercase tracking-wider">
                  Trạng thái
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {students.map((student) => (
                <tr key={student.studentId} className="hover:bg-muted/30 transition-colors group">
                  <td className="sticky left-0 z-10 bg-card group-hover:bg-muted/50 p-3 pl-4 transition-colors">
                    <div className="flex flex-col min-w-[180px]">
                      <span className="font-bold text-foreground text-sm">{student.fullName}</span>
                      <span className="text-xs font-mono text-muted-foreground">{student.studentCode}</span>
                    </div>
                  </td>

                  {sortedComponents.map((comp) => {
                    const scoreObj = student.componentScores.find((s) => s.componentId === comp.id);
                    const score = scoreObj?.score;

                    return (
                      <td key={comp.id} className="p-3 text-right">
                        {score !== undefined && score !== null ? (
                          <span className="font-mono text-sm font-medium">
                            {score.toFixed(1)}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                    );
                  })}

                  <td className="p-3 text-right bg-primary/5">
                    {student.finalScore !== null ? (
                      <div className="flex items-center justify-end gap-1.5">
                        {student.status === "LOCKED" && <LockIcon className="size-3 text-muted-foreground" />}
                        <span className="font-mono text-base font-extrabold text-primary">
                          {student.finalScore.toFixed(2)}
                        </span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>

                  <td className="p-3 pr-4 whitespace-nowrap">
                    <StatusBadge status={student.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
