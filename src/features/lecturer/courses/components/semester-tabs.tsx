"use client";

import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface LecturerSemester {
  id: string;
  code: string;
  name: string;
  isCurrent?: boolean;
  coursesCount: number;
}

interface SemesterTabsProps {
  semesters: LecturerSemester[];
  selectedSemesterCode: string;
  onSelectSemester: (code: string) => void;
}

export function SemesterTabs({
  semesters,
  selectedSemesterCode,
  onSelectSemester,
}: SemesterTabsProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
      {semesters.map((sem) => {
        const isSelected = sem.code === selectedSemesterCode;

        return (
          <button
            key={sem.id}
            onClick={() => onSelectSemester(sem.code)}
            className={cn(
              "relative flex items-center gap-2.5 px-4 py-2.5 rounded-2xl font-bold text-xs transition-all duration-200 shrink-0 cursor-pointer",
              "border",
              isSelected
                ? "bg-primary text-primary-foreground border-primary shadow-sm scale-100"
                : "bg-card/70 hover:bg-card text-muted-foreground hover:text-foreground border-border/80 hover:border-border"
            )}
          >
            <CalendarIcon className={cn("w-3.5 h-3.5", isSelected ? "text-primary-foreground" : "text-primary")} />

            <div className="flex flex-col items-start text-left leading-tight">
              <span className="font-extrabold">{sem.code}</span>
              <span className={cn("text-[10px] font-medium truncate max-w-[120px]", isSelected ? "text-primary-foreground/80" : "text-muted-foreground")}>
                {sem.name}
              </span>
            </div>

            {sem.isCurrent && (
              <Badge
                variant="secondary"
                className={cn(
                  "text-[9px] px-1.5 py-0 h-4 font-bold rounded-md ml-1",
                  isSelected
                    ? "bg-white/20 text-white border-0"
                    : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-0"
                )}
              >
                Hiện tại
              </Badge>
            )}

            <span
              className={cn(
                "text-[10px] font-mono px-1.5 py-0.5 rounded-full",
                isSelected
                  ? "bg-white/20 text-white font-bold"
                  : "bg-muted text-muted-foreground font-semibold"
              )}
            >
              {sem.coursesCount}
            </span>
          </button>
        );
      })}
    </div>
  );
}
