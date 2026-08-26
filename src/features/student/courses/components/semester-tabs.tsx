"use client";

import { useMemo } from "react";
import { ChevronDownIcon, CalendarIcon, CheckIcon, HistoryIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { StudentSemester } from "../types/student-course";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface SemesterTabsProps {
  semesters: StudentSemester[];
  activeSemesterCode: string;
  onSelectSemester: (code: string) => void;
}

export function SemesterTabs({
  semesters,
  activeSemesterCode,
  onSelectSemester,
}: SemesterTabsProps) {
  // Tách 5 học kỳ đầu tiên (5 kỳ mới nhất) và các học kỳ còn lại (kỳ cũ hơn)
  const topSemesters = useMemo(() => semesters.slice(0, 5), [semesters]);
  const olderSemesters = useMemo(() => semesters.slice(5), [semesters]);

  // Kiểm tra xem kỳ hiện tại đang chọn có thuộc nhóm kỳ cũ hơn (trong Dropdown) không
  const activeOlderSemester = useMemo(
    () => olderSemesters.find((s) => s.code === activeSemesterCode),
    [olderSemesters, activeSemesterCode]
  );

  const isOlderActive = Boolean(activeOlderSemester);

  return (
    <div className="w-full bg-card/60 backdrop-blur-md p-1.5 rounded-2xl border border-border/80 shadow-xs">
      <nav className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth">
        {/* Render 5 kỳ mới nhất thành Categories Menu Tabs */}
        {topSemesters.map((sem) => {
          const isActive = sem.code === activeSemesterCode;
          return (
            <button
              key={sem.id}
              onClick={() => onSelectSemester(sem.code)}
              className={cn(
                "group relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-tight transition-all duration-200 cursor-pointer shrink-0 select-none",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm shadow-primary/25"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/70"
              )}
            >
              <CalendarIcon className={cn("w-3.5 h-3.5 opacity-80", isActive && "opacity-100")} />
              <span>{sem.name}</span>
              <span
                className={cn(
                  "font-mono text-[10px] px-1.5 py-0.5 rounded-md font-bold tracking-wider",
                  isActive
                    ? "bg-primary-foreground/20 text-primary-foreground"
                    : "bg-muted text-muted-foreground group-hover:bg-muted-foreground/15"
                )}
              >
                {sem.code}
              </span>

              {sem.status === "ACTIVE" && (
                <span className="relative flex h-2 w-2 ml-0.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              )}
            </button>
          );
        })}

        {/* Dropdown Menu cho các kỳ cũ hơn (index >= 5) */}
        {olderSemesters.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger
              className={cn(
                "group flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-tight transition-all duration-200 cursor-pointer shrink-0 select-none outline-none",
                isOlderActive
                  ? "bg-primary/15 text-primary border border-primary/30 shadow-xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/70 border border-transparent"
              )}
            >
              <HistoryIcon className="w-3.5 h-3.5 opacity-80" />
              <span>
                {isOlderActive ? `Kỳ khác: ${activeOlderSemester?.name}` : "Kỳ học cũ hơn"}
              </span>
              {isOlderActive && (
                <Badge className="bg-primary/20 text-primary border-0 text-[10px] px-1.5 py-0 font-mono">
                  {activeOlderSemester?.code}
                </Badge>
              )}
              <ChevronDownIcon className="w-3.5 h-3.5 opacity-70 group-hover:translate-y-0.5 transition-transform" />
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-56 p-1.5 rounded-xl">
              <DropdownMenuLabel className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-2 py-1.5 flex items-center gap-1.5">
                <HistoryIcon className="w-3 h-3" />
                Các học kỳ cũ hơn
              </DropdownMenuLabel>
              <DropdownMenuSeparator />

              {olderSemesters.map((sem) => {
                const isSelected = sem.code === activeSemesterCode;
                return (
                  <DropdownMenuItem
                    key={sem.id}
                    onClick={() => onSelectSemester(sem.code)}
                    className={cn(
                      "flex items-center justify-between text-xs py-2 px-2.5 rounded-lg cursor-pointer my-0.5",
                      isSelected && "bg-primary/10 text-primary font-semibold"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] font-bold px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                        {sem.code}
                      </span>
                      <span>{sem.name}</span>
                    </div>

                    {isSelected && <CheckIcon className="w-4 h-4 text-primary shrink-0" />}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </nav>
    </div>
  );
}
