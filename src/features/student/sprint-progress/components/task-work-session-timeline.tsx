"use client";

import { useMemo, useState } from "react";
import {
  CheckIcon,
  ClockIcon,
  GitCommitIcon,
  LayersIcon,
  Loader2Icon,
  PlusIcon,
  ShieldCheckIcon,
  UserIcon,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useTaskWorkSessionTimeline } from "../hooks/use-project-tasks";
import { getAssigneeAvatarClass, getAssigneeInitials } from "../lib/assignee-avatar";
import type {
  TimelineCommitItem,
  TimelineSessionItem,
} from "../types/work-session-timeline";

interface TaskWorkSessionTimelineProps {
  projectId?: string | null;
  taskId: string;
  onSelectCommit?: (sha: string) => void;
  onSelectAllCommits?: (shas: string[]) => void;
  onContinueToConfirmation?: () => void;
  selectedShas?: string[];
  canSelectCommit?: boolean;
}

type TimelineFilter = "all" | "sessions" | "commits";

type TimelineUnifiedItem =
  | { type: "session"; timestamp: number; data: TimelineSessionItem }
  | { type: "commit"; timestamp: number; data: TimelineCommitItem };

function formatVietnamDateTime(dateStr?: string | null): string {
  if (!dateStr) return "—";
  try {
    let cleanStr = dateStr.trim();
    if (cleanStr.includes("T") && !cleanStr.endsWith("Z") && !/[+-]\d{2}(:\d{2})?$/.test(cleanStr)) {
      cleanStr += "Z";
    }
    const d = new Date(cleanStr);
    return Number.isNaN(d.getTime())
      ? dateStr
      : new Intl.DateTimeFormat("vi-VN", {
        timeZone: "Asia/Ho_Chi_Minh",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }).format(d);
  } catch {
    return dateStr;
  }
}

function formatDuration(seconds: number): string {
  if (!seconds || seconds <= 0) return "0 phút";
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0 && minutes > 0) {
    return `${hours} giờ ${minutes} phút`;
  }
  if (hours > 0) {
    return `${hours} giờ`;
  }
  if (minutes > 0) {
    return `${minutes} phút`;
  }
  return `${seconds} giây`;
}

function parseDateMs(dateStr?: string | null): number {
  if (!dateStr) return 0;
  let cleanStr = dateStr.trim();
  if (cleanStr.includes("T") && !cleanStr.endsWith("Z") && !/[+-]\d{2}(:\d{2})?$/.test(cleanStr)) {
    cleanStr += "Z";
  }
  const d = new Date(cleanStr);
  return Number.isNaN(d.getTime()) ? 0 : d.getTime();
}

export function TaskWorkSessionTimeline({
  projectId,
  taskId,
  onSelectCommit,
  onSelectAllCommits,
  onContinueToConfirmation,
  selectedShas = [],
  canSelectCommit = false,
}: TaskWorkSessionTimelineProps) {
  const [filter, setFilter] = useState<TimelineFilter>("all");
  const { data, isLoading, isError, refetch } = useTaskWorkSessionTimeline(
    projectId || "",
    taskId,
    { sessionSize: 50, commitSize: 50 },
    { enabled: Boolean(projectId && taskId) }
  );

  const workSessions = data?.workSessions;
  const commits = data?.commits;
  const openSessions = workSessions?.openSessions;
  const rawCompletedSessions = workSessions?.sessions;
  const rawCommitItems = commits?.items;
  const completedSessions = rawCompletedSessions || [];
  const commitItems = rawCommitItems || [];

  const validShas = useMemo(
    () => (rawCommitItems || []).map((c) => c.sha).filter(Boolean),
    [rawCommitItems]
  );
  const isAllSelected =
    validShas.length > 0 && validShas.every((sha) => selectedShas.includes(sha));

  const unifiedItems: TimelineUnifiedItem[] = useMemo(() => {
    const items: TimelineUnifiedItem[] = [];
    const completed = rawCompletedSessions || [];
    const commitList = rawCommitItems || [];

    if (filter === "all" || filter === "sessions") {
      completed.forEach((s) => {
        items.push({
          type: "session",
          timestamp: parseDateMs(s.startedAt),
          data: s,
        });
      });
    }

    if (filter === "all" || filter === "commits") {
      commitList.forEach((c) => {
        items.push({
          type: "commit",
          timestamp: parseDateMs(c.committedAt || c.linkedAt),
          data: c,
        });
      });
    }

    return items.sort((a, b) => b.timestamp - a.timestamp);
  }, [rawCompletedSessions, rawCommitItems, filter]);

  if (!projectId) {
    return (
      <div className="p-8 rounded-2xl border border-dashed border-border/80 bg-card flex flex-col items-center justify-center text-center space-y-3">
        <p className="text-xs text-muted-foreground">
          Chưa xác định dự án liên kết của công việc này.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-8 rounded-2xl border border-border/60 bg-card flex flex-col items-center justify-center text-center space-y-3">
        <Loader2Icon className="w-6 h-6 animate-spin text-primary" />
        <p className="text-xs text-muted-foreground font-medium">
          Đang tải dòng thời gian làm việc & commit...
        </p>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="p-8 rounded-2xl border border-dashed border-border/80 bg-card flex flex-col items-center justify-center text-center space-y-3">
        <p className="text-xs text-muted-foreground">
          Không thể tải dữ liệu dòng thời gian của công việc này.
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => void refetch()}
          className="text-xs rounded-xl h-8 cursor-pointer"
        >
          Thử lại
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        <div className="p-3 rounded-2xl border border-border/70 bg-card shadow-2xs space-y-1">
          <div className="flex items-center gap-1.5 text-muted-foreground text-[11px] font-medium">
            <ClockIcon className="w-3.5 h-3.5 text-blue-500" />
            <span>Tổng thời gian</span>
          </div>
          <p className="font-mono text-base font-extrabold text-foreground">
            {formatDuration(workSessions?.totalElapsedSeconds || 0)}
          </p>
        </div>

        <div className="p-3 rounded-2xl border border-border/70 bg-card shadow-2xs space-y-1">
          <div className="flex items-center gap-1.5 text-muted-foreground text-[11px] font-medium">
            <UserIcon className="w-3.5 h-3.5 text-teal-500" />
            <span>Phiên làm việc</span>
          </div>
          <p className="font-mono text-base font-extrabold text-foreground">
            {workSessions?.sessionCount ?? 0}
            <span className="text-xs font-normal text-muted-foreground ml-1">phiên</span>
          </p>
        </div>

        <div className="p-3 rounded-2xl border border-border/70 bg-card shadow-2xs space-y-1">
          <div className="flex items-center gap-1.5 text-muted-foreground text-[11px] font-medium">
            <GitCommitIcon className="w-3.5 h-3.5 text-purple-500" />
            <span>Commits gắn kết</span>
          </div>
          <p className="font-mono text-base font-extrabold text-foreground">
            {commits?.totalElements ?? 0}
            <span className="text-xs font-normal text-muted-foreground ml-1">commits</span>
          </p>
        </div>
      </div>

      {openSessions && openSessions.length > 0 && (
        <div className="p-3.5 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                Phiên làm việc đang diễn ra ({openSessions.length})
              </span>
            </div>
            <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-[10px] font-semibold">
              Live Presence
            </Badge>
          </div>

          <div className="space-y-2">
            {openSessions.map((session) => {
              const initials = getAssigneeInitials(session.fullName);
              const colorClass = getAssigneeAvatarClass(
                session.studentId || session.userId || session.studentCode
              );

              return (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-card border border-emerald-500/20 shadow-2xs gap-3"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Avatar className={`size-7 text-[10px] font-bold border border-border/80 ${colorClass}`}>
                      {session.avatarUrl && <AvatarImage src={session.avatarUrl} alt={session.fullName || "User"} />}
                      <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-foreground truncate">
                        {session.fullName || "Thành viên"}
                      </p>
                      <p className="text-[10px] font-mono text-muted-foreground">
                        {session.studentCode || "SAGA"} • Bắt đầu {formatVietnamDateTime(session.startedAt)}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      {formatDuration(session.elapsedSeconds)}
                    </span>
                    <span className="block text-[9px] text-muted-foreground">đang tích lũy</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-1 p-0.5 rounded-xl border border-border/60 bg-muted/40 text-[11px]">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={`px-2.5 py-1 font-semibold rounded-lg transition-all cursor-pointer ${filter === "all"
              ? "bg-card text-foreground shadow-2xs font-bold"
              : "text-muted-foreground hover:text-foreground"
              }`}
          >
            Tất cả ({completedSessions.length + commitItems.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter("sessions")}
            className={`px-2.5 py-1 font-semibold rounded-lg transition-all cursor-pointer ${filter === "sessions"
              ? "bg-card text-foreground shadow-2xs font-bold"
              : "text-muted-foreground hover:text-foreground"
              }`}
          >
            Phiên làm việc ({completedSessions.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter("commits")}
            className={`px-2.5 py-1 font-semibold rounded-lg transition-all cursor-pointer ${filter === "commits"
              ? "bg-card text-foreground shadow-2xs font-bold"
              : "text-muted-foreground hover:text-foreground"
              }`}
          >
            Commits ({commitItems.length})
          </button>
        </div>

        <span className="text-[10px] text-muted-foreground font-medium hidden sm:inline-block">
          Sắp xếp theo thời gian mới nhất
        </span>
      </div>

      {canSelectCommit && onSelectCommit && validShas.length > 0 && (
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-muted/40 border border-border/60 gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <ShieldCheckIcon className="w-4 h-4 text-violet-600 dark:text-violet-400 shrink-0" />
            <span className="text-xs font-semibold text-foreground truncate">
              Chọn commit làm minh chứng đóng góp
            </span>
            {selectedShas.length > 0 && (
              <Badge className="bg-violet-600 text-white font-mono text-[10px] shrink-0">
                {selectedShas.length} đã chọn
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onSelectAllCommits && (
              <Button
                type="button"
                variant={isAllSelected ? "secondary" : "outline"}
                size="sm"
                onClick={() => onSelectAllCommits(validShas)}
                className={`h-7 px-2 text-[11px] font-semibold gap-1 cursor-pointer transition-colors ${isAllSelected
                  ? "bg-violet-600 text-white hover:bg-violet-700 border-0"
                  : "text-violet-600 dark:text-violet-400 border-violet-500/30 hover:bg-violet-500/10"
                  }`}
              >
                <ShieldCheckIcon className="w-3 h-3" />
                <span>{isAllSelected ? "Bỏ chọn tất cả" : `Dùng tất cả (${validShas.length})`}</span>
              </Button>
            )}
          </div>
        </div>
      )}

      {unifiedItems.length === 0 ? (
        <div className="p-8 rounded-2xl border border-dashed border-border/80 bg-muted/10 text-center space-y-1.5">
          <LayersIcon className="w-6 h-6 mx-auto text-muted-foreground opacity-60" />
          <p className="text-xs font-semibold text-foreground">Chưa ghi nhận lịch sử</p>
          <p className="text-[11px] text-muted-foreground max-w-sm mx-auto">
            Task này chưa có phiên bấm giờ làm việc nào kết thúc hoặc chưa có commit nào được liên kết.
          </p>
        </div>
      ) : (
        <div className="relative pl-6 space-y-3.5 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-px before:bg-border/80">
          {unifiedItems.map((item) => {
            if (item.type === "session") {
              const session = item.data;
              const initials = getAssigneeInitials(session.fullName);
              const colorClass = getAssigneeAvatarClass(
                session.studentId || session.userId || session.studentCode
              );

              return (
                <div key={`session-${session.id}`} className="relative group">
                  <div className="absolute -left-6 top-1.5 size-5 rounded-full bg-card border border-blue-500/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-2xs">
                    <ClockIcon className="size-2.5" />
                  </div>

                  <div className="p-3 rounded-xl border border-border/70 bg-card hover:border-blue-500/40 transition-all shadow-2xs space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <Avatar className={`size-5 text-[9px] font-bold border border-border/60 ${colorClass}`}>
                          {session.avatarUrl && <AvatarImage src={session.avatarUrl} alt={session.fullName || "User"} />}
                          <AvatarFallback>{initials}</AvatarFallback>
                        </Avatar>
                        <span className="text-xs font-semibold text-foreground truncate">
                          {session.fullName || "Thành viên"}
                        </span>
                        {session.studentCode && (
                          <span className="font-mono text-[10px] text-muted-foreground">
                            ({session.studentCode})
                          </span>
                        )}
                      </div>

                      <Badge
                        variant="outline"
                        className="font-mono text-[10px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30 shrink-0"
                      >
                        {formatDuration(session.elapsedSeconds)}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-muted-foreground flex-wrap gap-1 font-mono pt-0.5 border-t border-border/40">
                      <span>Từ: {formatVietnamDateTime(session.startedAt)}</span>
                      <span>Đến: {formatVietnamDateTime(session.endedAt)}</span>
                    </div>
                  </div>
                </div>
              );
            }

            const commit = item.data;
            const shortSha = (commit.sha || "").slice(0, 7);
            const isSelected = Boolean(commit.sha && selectedShas.includes(commit.sha));

            return (
              <div key={`commit-${commit.id}`} className="relative group">
                <div className={`absolute -left-6 top-1.5 size-5 rounded-full bg-card border flex items-center justify-center shadow-2xs transition-colors ${isSelected
                  ? "border-violet-600 text-violet-600 dark:text-violet-400 bg-violet-500/10"
                  : "border-purple-500/40 text-purple-600 dark:text-purple-400"
                  }`}>
                  <GitCommitIcon className="size-2.5" />
                </div>

                <div className={`p-3 rounded-xl border transition-all shadow-2xs space-y-1.5 ${isSelected
                  ? "border-violet-500/60 bg-violet-500/[0.04]"
                  : "border-border/70 bg-card hover:border-purple-500/40"
                  }`}>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-mono text-xs font-bold text-purple-600 dark:text-purple-400 bg-purple-500/10 border border-purple-500/20 px-1.5 py-0.5 rounded-md shrink-0">
                        {shortSha}
                      </span>
                      <span className="text-[10px] font-mono text-muted-foreground truncate">
                        {formatVietnamDateTime(commit.committedAt || commit.linkedAt)}
                      </span>
                    </div>

                    {canSelectCommit && onSelectCommit && commit.sha && (
                      <Button
                        type="button"
                        variant={isSelected ? "secondary" : "outline"}
                        size="sm"
                        onClick={() => onSelectCommit(commit.sha)}
                        className={`h-6 px-2 text-[10px] font-semibold gap-1 rounded-md cursor-pointer transition-all shrink-0 ${isSelected
                          ? "bg-violet-600 text-white hover:bg-violet-700 border-0"
                          : "text-violet-600 dark:text-violet-400 border-violet-500/30 hover:bg-violet-500/10"
                          }`}
                      >
                        {isSelected ? (
                          <>
                            <CheckIcon className="w-3 h-3" />
                            <span>Đã chọn làm minh chứng</span>
                          </>
                        ) : (
                          <>
                            <PlusIcon className="w-3 h-3" />
                            <span>Dùng làm minh chứng</span>
                          </>
                        )}
                      </Button>
                    )}
                  </div>

                  <p className="text-xs text-foreground font-medium line-clamp-2 leading-relaxed">
                    {commit.message}
                  </p>

                  {commit.repositoryFullName && (
                    <p className="text-[10px] font-mono text-muted-foreground pt-0.5 border-t border-border/40 truncate">
                      Repo: <span className="text-foreground">{commit.repositoryFullName}</span>
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {canSelectCommit && selectedShas.length > 0 && onContinueToConfirmation && (
        <div className="flex flex-col gap-2 rounded-xl border border-violet-500/25 bg-violet-500/[0.06] px-3.5 py-2.5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold text-foreground">
              {selectedShas.length} commit đang chờ xác nhận minh chứng
            </p>
            <p className="text-[11px] text-muted-foreground">
              Lựa chọn này mới chỉ được lưu tạm trên màn hình, chưa gửi lên máy chủ.
            </p>
          </div>
          <Button
            type="button"
            size="sm"
            onClick={onContinueToConfirmation}
            className="h-8 shrink-0 rounded-lg bg-violet-600 px-3 text-xs font-semibold text-white hover:bg-violet-700 cursor-pointer gap-1.5"
          >
            <ShieldCheckIcon className="w-3.5 h-3.5" />
            <span>Tiếp tục sang bước Đóng góp ({selectedShas.length})</span>
          </Button>
        </div>
      )}
    </div>
  );
}
