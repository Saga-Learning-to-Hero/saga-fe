"use client";

import { SearchIcon, XIcon, FilterIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import type { ProjectStatus } from "../types/project-management";

interface ProjectToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  semesterFilter: string;
  onSemesterFilterChange: (value: string) => void;
  statusFilter: "ALL" | ProjectStatus;
  onStatusFilterChange: (value: "ALL" | ProjectStatus) => void;
  integrationFilter: "ALL" | "CONNECTED" | "WARNING";
  onIntegrationFilterChange: (value: "ALL" | "CONNECTED" | "WARNING") => void;
  semesters: string[];
  totalFiltered: number;
  totalOriginal: number;
}

export function ProjectToolbar({
  search,
  onSearchChange,
  semesterFilter,
  onSemesterFilterChange,
  statusFilter,
  onStatusFilterChange,
  integrationFilter,
  onIntegrationFilterChange,
  semesters,
  totalFiltered,
  totalOriginal,
}: ProjectToolbarProps) {
  const isFiltered =
    search.trim() !== "" ||
    semesterFilter !== "ALL" ||
    statusFilter !== "ALL" ||
    integrationFilter !== "ALL";

  const handleReset = () => {
    onSearchChange("");
    onSemesterFilterChange("ALL");
    onStatusFilterChange("ALL");
    onIntegrationFilterChange("ALL");
  };

  return (
    <Card className="rounded-2xl border border-border shadow-xs">
      <CardContent className="p-3.5 space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input
              type="text"
              placeholder="Tìm theo tên nhóm, mã đề tài, Jira Key (SAGA), GitHub repo..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9 pr-8 h-9.5 text-sm rounded-lg bg-background"
            />
            {search && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onSearchChange("")}
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground hover:text-foreground"
              >
                <XIcon className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Semester Filter */}
            <div className="flex items-center gap-1 bg-muted/50 border border-border rounded-lg p-1">
              <Button
                variant={semesterFilter === "ALL" ? "default" : "ghost"}
                size="sm"
                onClick={() => onSemesterFilterChange("ALL")}
                className={`h-7 px-2.5 text-xs font-medium rounded-md ${semesterFilter === "ALL"
                    ? "shadow-2xs"
                    : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                Tất cả kỳ
              </Button>
              {semesters.map((sem) => (
                <Button
                  key={sem}
                  variant={semesterFilter === sem ? "default" : "ghost"}
                  size="sm"
                  onClick={() => onSemesterFilterChange(sem)}
                  className={`h-7 px-2.5 text-xs font-medium rounded-md ${semesterFilter === sem
                      ? "shadow-2xs"
                      : "text-muted-foreground hover:text-foreground"
                    }`}
                >
                  {sem}
                </Button>
              ))}
            </div>

            {/* Integration Filter */}
            <div className="flex items-center gap-1 bg-muted/50 border border-border rounded-lg p-1">
              {(
                [
                  { value: "ALL", label: "Tất cả tích hợp" },
                  { value: "CONNECTED", label: "Đủ Jira & Git" },
                  { value: "WARNING", label: "Có cảnh báo" },
                ] as const
              ).map((tab) => (
                <Button
                  key={tab.value}
                  variant={integrationFilter === tab.value ? "default" : "ghost"}
                  size="sm"
                  onClick={() => onIntegrationFilterChange(tab.value)}
                  className={`h-7 px-2.5 text-xs font-medium rounded-md ${integrationFilter === tab.value
                      ? "shadow-2xs"
                      : "text-muted-foreground hover:text-foreground"
                    }`}
                >
                  {tab.label}
                </Button>
              ))}
            </div>

            {/* Reset Button */}
            {isFiltered && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="h-8 px-2.5 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <XIcon className="w-3.5 h-3.5 mr-1" />
                Đặt lại
              </Button>
            )}
          </div>
        </div>

        {/* Result count indicator */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-border/60">
          <span className="flex items-center gap-1.5">
            <FilterIcon className="w-3.5 h-3.5" />
            Hiển thị <strong className="text-foreground">{totalFiltered}</strong> / {totalOriginal} nhóm đồ án
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
