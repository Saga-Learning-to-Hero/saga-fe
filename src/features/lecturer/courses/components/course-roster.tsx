"use client";

import { useDeferredValue, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertCircleIcon,
  CheckCircle2Icon,
  CrownIcon,
  FileSpreadsheetIcon,
  GraduationCapIcon,
  MailIcon,
  SearchIcon,
  UserCheck2Icon,
  UsersIcon,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useLecturerRoster } from "../hooks/use-lecturer-courses";
import { useLecturerTeams } from "@/features/lecturer/teams/hooks/use-lecturer-teams";
import { lecturerCourseTeamPath } from "../lib/course-routes";
import { CourseQueryError } from "./course-query-error";
import { cn } from "@/lib/utils";

interface CourseRosterProps {
  courseId: string;
  onSwitchToTeams?: () => void;
}

type StatusFilter = "ALL" | "ASSIGNED" | "UNASSIGNED";

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0 || !parts[0]) return "SV";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function CourseRoster({ courseId, onSwitchToTeams }: CourseRosterProps) {
  const { data, isLoading, isError, error, refetch } = useLecturerRoster(courseId);
  const teamsQuery = useLecturerTeams(courseId);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const deferredQuery = useDeferredValue(searchQuery);

  const entries = useMemo(() => data?.entries ?? [], [data?.entries]);

  const studentTeamMap = useMemo(() => {
    const map = new Map<
      string,
      { teamId: string; teamNo: number; teamName: string; isLeader: boolean }
    >();
    for (const t of teamsQuery.data?.teams ?? []) {
      for (const m of t.members ?? []) {
        if (m.studentCode) {
          map.set(m.studentCode.toLowerCase().trim(), {
            teamId: t.teamId,
            teamNo: t.teamNo,
            teamName: t.teamName || `Nhóm ${t.teamNo}`,
            isLeader: m.role === "LEADER",
          });
        }
      }
    }
    return map;
  }, [teamsQuery.data?.teams]);

  const uniqueClassesCount = useMemo(() => {
    return new Set(entries.map((e) => e.classCode).filter(Boolean)).size;
  }, [entries]);

  const totalCount = entries.length;
  const assignedStudents = useMemo(
    () => entries.filter((e) => studentTeamMap.has(e.studentCode.toLowerCase().trim())),
    [entries, studentTeamMap]
  );
  const assignedCount = assignedStudents.length;
  const unassignedCount = totalCount - assignedCount;
  const assignedPercentage = totalCount > 0 ? Math.round((assignedCount / totalCount) * 100) : 0;

  const filteredEntries = useMemo(() => {
    const query = deferredQuery.toLowerCase().trim();
    return entries.filter((entry) => {
      const teamInfo = studentTeamMap.get(entry.studentCode.toLowerCase().trim());
      const isAssigned = Boolean(teamInfo);

      if (statusFilter === "ASSIGNED" && !isAssigned) return false;
      if (statusFilter === "UNASSIGNED" && isAssigned) return false;

      if (!query) return true;
      const teamText = teamInfo ? `${teamInfo.teamName} ${teamInfo.teamNo}` : "";
      return `${entry.studentCode} ${entry.fullName} ${entry.email} ${entry.classCode} ${teamText}`
        .toLowerCase()
        .includes(query);
    });
  }, [entries, deferredQuery, statusFilter, studentTeamMap]);

  if (isLoading || teamsQuery.isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="h-20 animate-pulse rounded-2xl bg-muted/60" />
          <div className="h-20 animate-pulse rounded-2xl bg-muted/60" />
          <div className="h-20 animate-pulse rounded-2xl bg-muted/60" />
          <div className="h-20 animate-pulse rounded-2xl bg-muted/60" />
        </div>
        <div className="h-80 animate-pulse rounded-2xl bg-muted/60" />
      </div>
    );
  }

  if (isError) {
    return (
      <CourseQueryError
        title="Không tải được danh sách sinh viên đang học"
        error={error}
        onRetry={() => void refetch()}
      />
    );
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-2xl border border-border/80 bg-card p-4 shadow-xs">
          <CardContent className="flex items-center gap-3.5 p-0">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <UsersIcon className="size-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-muted-foreground truncate">Sĩ số sinh viên đang học</p>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="font-mono text-2xl font-black text-foreground">{totalCount}</span>
                <span className="text-xs font-medium text-muted-foreground">sinh viên</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-border/80 bg-card p-4 shadow-xs">
          <CardContent className="flex items-center gap-3.5 p-0">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <GraduationCapIcon className="size-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-muted-foreground truncate">Lớp sinh viên niên khóa</p>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="font-mono text-2xl font-black text-foreground">{uniqueClassesCount}</span>
                <span className="text-xs font-medium text-muted-foreground">lớp sinh hoạt</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-border/80 bg-card p-4 shadow-xs">
          <CardContent className="flex items-center gap-3.5 p-0">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2Icon className="size-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-muted-foreground truncate">Đã vào nhóm</p>
              <div className="flex items-center justify-between gap-1.5 mt-0.5">
                <div className="flex items-baseline gap-1">
                  <span className="font-mono text-2xl font-black text-foreground">{assignedCount}</span>
                  <span className="font-mono text-xs font-semibold text-muted-foreground">/ {totalCount}</span>
                </div>
                <Badge
                  variant="outline"
                  className="border-emerald-500/30 bg-emerald-500/10 font-mono text-[11px] font-bold text-emerald-600 dark:text-emerald-400"
                >
                  {assignedPercentage}%
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-border/80 bg-card p-4 shadow-xs">
          <CardContent className="flex items-center gap-3.5 p-0">
            <div
              className={cn(
                "flex size-11 shrink-0 items-center justify-center rounded-xl",
                unassignedCount > 0
                  ? "bg-amber-500/10 text-amber-700 dark:text-amber-400"
                  : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              )}
            >
              {unassignedCount > 0 ? (
                <AlertCircleIcon className="size-5" />
              ) : (
                <UserCheck2Icon className="size-5" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-muted-foreground truncate">Chưa có nhóm</p>
              <div className="flex items-center justify-between gap-1.5 mt-0.5">
                <span className="font-mono text-2xl font-black text-foreground">{unassignedCount}</span>
                {unassignedCount > 0 ? (
                  <Badge
                    variant="outline"
                    className="border-amber-500/30 bg-amber-500/10 font-mono text-[11px] font-bold text-amber-700 dark:text-amber-300"
                  >
                    Cần xếp nhóm
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="border-emerald-500/30 bg-emerald-500/10 font-mono text-[11px] font-bold text-emerald-600 dark:text-emerald-400"
                  >
                    100% có nhóm
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-3.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h2 className="text-base font-extrabold text-foreground">Danh sách sinh viên ghi danh</h2>
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <Button
              type="button"
              variant={statusFilter === "ALL" ? "default" : "outline"}
              size="sm"
              className="h-7 text-xs font-semibold cursor-pointer rounded-lg shadow-2xs"
              onClick={() => setStatusFilter("ALL")}
            >
              Tất cả ({totalCount})
            </Button>
            <Button
              type="button"
              variant={statusFilter === "ASSIGNED" ? "default" : "outline"}
              size="sm"
              className="h-7 text-xs font-semibold cursor-pointer rounded-lg shadow-2xs"
              onClick={() => setStatusFilter("ASSIGNED")}
            >
              Đã có nhóm ({assignedCount})
            </Button>
            <Button
              type="button"
              variant={statusFilter === "UNASSIGNED" ? "default" : "outline"}
              size="sm"
              className={cn(
                "h-7 text-xs font-semibold cursor-pointer rounded-lg shadow-2xs",
                unassignedCount > 0 && statusFilter !== "UNASSIGNED" && "border-amber-500/40 text-amber-700 dark:text-amber-400 bg-amber-500/5"
              )}
              onClick={() => setStatusFilter("UNASSIGNED")}
            >
              Chưa có nhóm ({unassignedCount})
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative w-full sm:w-64">
            <SearchIcon className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Tìm mã SV, họ tên, nhóm..."
              className="h-9 rounded-xl pl-9 text-xs"
            />
          </div>

          {onSwitchToTeams && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onSwitchToTeams}
              className="h-9 gap-1.5 rounded-xl border-border/80 bg-card px-3 text-xs font-bold shadow-xs hover:bg-muted/50 cursor-pointer"
            >
              <FileSpreadsheetIcon className="size-3.5 text-primary" />
              Phân nhóm Excel
            </Button>
          )}
        </div>
      </div>

      {entries.length === 0 ? (
        <Card className="rounded-2xl border border-dashed border-border/80 p-10 text-center shadow-xs">
          <UsersIcon className="mx-auto mb-3 size-10 text-muted-foreground/40" />
          <p className="text-sm font-bold text-foreground">Chưa có sinh viên nào trong lớp</p>
          <p className="mx-auto mt-1 max-w-md text-xs text-muted-foreground">
            Sinh viên sẽ xuất hiện khi quản trị viên phân bổ hoặc hoàn tất danh sách ghi danh học phần.
          </p>
        </Card>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-xs">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="border-b border-border/60">
                <TableHead className="w-14 px-4 text-center text-xs font-bold text-muted-foreground">#</TableHead>
                <TableHead className="px-4 text-xs font-bold text-muted-foreground">Mã sinh viên</TableHead>
                <TableHead className="px-4 text-xs font-bold text-muted-foreground">Họ và tên sinh viên</TableHead>
                <TableHead className="px-4 text-xs font-bold text-muted-foreground">Email trường</TableHead>
                <TableHead className="px-4 text-xs font-bold text-muted-foreground">Lớp niên khóa</TableHead>
                <TableHead className="px-4 text-xs font-bold text-muted-foreground">Nhóm đồ án</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-border/60">
              {filteredEntries.map((entry, index) => {
                const teamInfo = studentTeamMap.get(entry.studentCode.toLowerCase().trim());
                return (
                  <TableRow key={entry.courseEnrollmentId} className="transition-colors hover:bg-muted/20">
                    <TableCell className="px-4 text-center font-mono text-xs font-medium text-muted-foreground">
                      {index + 1}
                    </TableCell>
                    <TableCell className="px-4">
                      <span className="inline-block rounded-md bg-primary/10 px-2 py-0.5 font-mono text-xs font-bold text-primary">
                        {entry.studentCode}
                      </span>
                    </TableCell>
                    <TableCell className="px-4">
                      <div className="flex items-center gap-3">
                        <Avatar size="sm" className="border border-border/60">
                          <AvatarFallback className="bg-primary/10 font-mono text-[11px] font-bold text-primary">
                            {getInitials(entry.fullName)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs font-bold text-foreground">{entry.fullName}</span>
                      </div>
                    </TableCell>
                    <TableCell className="px-4">
                      <div className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground">
                        <MailIcon className="size-3 text-muted-foreground/70" />
                        <span>{entry.email}</span>
                      </div>
                    </TableCell>
                    <TableCell className="px-4">
                      <Badge variant="secondary" className="font-mono text-[11px] font-semibold">
                        {entry.classCode || "Chưa gắn lớp"}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-4">
                      {teamInfo ? (
                        <Link
                          href={lecturerCourseTeamPath(courseId, teamInfo.teamId)}
                          prefetch={true}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                        >
                          <span className="font-mono">Team #{teamInfo.teamNo}</span>
                          <span className="font-medium text-foreground/80">— {teamInfo.teamName}</span>
                          {teamInfo.isLeader && (
                            <span title="Trưởng nhóm" className="inline-flex items-center">
                              <CrownIcon className="size-3 text-amber-500 shrink-0" />
                            </span>
                          )}
                        </Link>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-lg border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-xs font-bold text-amber-700 dark:text-amber-400">
                          <AlertCircleIcon className="size-3" />
                          Chưa phân nhóm
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          {filteredEntries.length === 0 && (
            <div className="p-8 text-center text-xs text-muted-foreground">
              Không tìm thấy sinh viên nào phù hợp với bộ lọc và từ khóa hiện tại.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
