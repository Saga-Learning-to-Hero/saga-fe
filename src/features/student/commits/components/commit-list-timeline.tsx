"use client";

import { useState } from "react";
import {
  GitCommitIcon,
  CopyIcon,
  CheckIcon,
  ExternalLinkIcon,
  CheckCircle2Icon,
  GitBranchIcon,
  CalendarIcon,
} from "lucide-react";
import type { CommitItem } from "../types/commits";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface CommitListTimelineProps {
  commits: CommitItem[];
  selectedRepoName: string;
  selectedBranchName: string;
}

export function CommitListTimeline({
  commits,
  selectedRepoName,
  selectedBranchName,
}: CommitListTimelineProps) {
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  const handleCopyHash = (shortHash: string) => {
    navigator.clipboard.writeText(shortHash);
    setCopiedHash(shortHash);
    setTimeout(() => setCopiedHash(null), 1500);
  };

  if (commits.length === 0) {
    return (
      <Card className="p-8 text-center rounded-2xl border border-dashed border-border/80 bg-card/60 space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mx-auto text-muted-foreground">
          <GitCommitIcon className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-foreground">Không tìm thấy Commit nào</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Không có commit nào khớp với bộ lọc repository <strong>{selectedRepoName}</strong> và nhánh <strong>{selectedBranchName}</strong>.
          </p>
        </div>
      </Card>
    );
  }

  // Group commits theo ngày thực tế (createdAt) thay vì match chuỗi relativeTime,
  // tránh nhầm lẫn "2 ngày trước" vào nhóm "Hôm nay" hay "3 tuần trước" vào "Hôm qua".
  const groups: Record<string, CommitItem[]> = {};
  commits.forEach((commit) => {
    const commitDate = new Date(commit.createdAt);
    const today = new Date();
    // Reset giờ về 0 để so sánh theo ngày
    today.setHours(0, 0, 0, 0);
    const commitDay = new Date(commitDate);
    commitDay.setHours(0, 0, 0, 0);

    const diffMs = today.getTime() - commitDay.getTime();
    const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));

    let groupKey: string;
    if (diffDays <= 0) {
      groupKey = "Hôm nay";
    } else if (diffDays === 1) {
      groupKey = "Hôm qua";
    } else if (diffDays <= 7) {
      groupKey = `${diffDays} ngày trước`;
    } else if (diffDays <= 30) {
      const weeks = Math.floor(diffDays / 7);
      groupKey = `${weeks} tuần trước`;
    } else {
      groupKey = "Trước đó";
    }

    if (!groups[groupKey]) groups[groupKey] = [];
    groups[groupKey].push(commit);
  });

  // Sắp xếp thứ tự nhóm: Hôm nay → Hôm qua → N ngày trước → N tuần trước → Trước đó
  const groupOrder = (key: string): number => {
    if (key === "Hôm nay") return 0;
    if (key === "Hôm qua") return 1;
    if (key.endsWith("ngày trước")) return 2;
    if (key.endsWith("tuần trước")) return 3;
    return 4;
  };
  const sortedGroupKeys = Object.keys(groups).sort(
    (a, b) => groupOrder(a) - groupOrder(b)
  );

  return (
    <div className="space-y-6">
      {sortedGroupKeys.map((groupTitle) => {
        const groupCommits = groups[groupTitle];
        return (
          <div key={groupTitle} className="space-y-3">
            {/* Section Header */}
            <div className="flex items-center gap-2 pb-1 border-b border-border/50 text-xs font-bold text-muted-foreground">
              <CalendarIcon className="w-3.5 h-3.5 text-primary" />
              <span>Commits {groupTitle === "Hôm nay" || groupTitle === "Hôm qua" ? "vào " : ""}{groupTitle}</span>
              <Badge variant="secondary" className="font-mono text-[10px] px-1.5 py-0.2">
                {groupCommits.length}
              </Badge>
            </div>

          {/* List of Commits - cuộn độc lập cho từng nhóm ngày khi có nhiều commits */}
          <Card className="rounded-2xl border border-border/80 bg-card overflow-hidden divide-y divide-border/60 shadow-xs max-h-[380px] overflow-y-auto scrollbar-thin scrollbar-thumb-border hover:scrollbar-thumb-muted-foreground/30">
            {groupCommits.map((commit) => {
              const isCopied = copiedHash === commit.shortHash;

              return (
                <div
                  key={commit.id}
                  className="p-4 sm:px-5 hover:bg-muted/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                >
                  {/* Left: Commit Info & Author */}
                  <div className="space-y-1.5 min-w-0 flex-1">
                    {/* Commit Message with Jira Tag */}
                    <div className="flex items-start gap-2">
                      <div className="w-6 h-6 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                        <GitCommitIcon className="w-3.5 h-3.5" />
                      </div>

                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          {commit.jiraKey && (
                            <Badge className="bg-blue-600/15 text-blue-600 dark:text-blue-400 border-blue-600/30 text-[10px] font-mono font-bold shrink-0">
                              {commit.jiraKey}
                            </Badge>
                          )}

                          <p className="text-xs sm:text-sm font-semibold text-foreground leading-snug group-hover:text-primary transition-colors">
                            {commit.message}
                          </p>
                        </div>

                        {/* Author Metadata */}
                        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <Avatar className="w-4 h-4 border">
                              <AvatarImage src={commit.author.avatar} alt={commit.author.name} />
                              <AvatarFallback className="text-[8px] bg-primary/20 text-primary font-bold">
                                {commit.author.name.slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium text-foreground">
                              {commit.author.name}
                            </span>
                            <span className="text-[11px] font-mono text-muted-foreground">
                              ({commit.author.studentCode})
                            </span>
                            <span className="text-[11px] font-mono text-muted-foreground/80">
                              @{commit.author.username}
                            </span>
                          </div>

                          <span>•</span>
                          <span className="text-[11px] font-medium">{commit.relativeTime}</span>

                          <span>•</span>
                          <span className="flex items-center gap-1 font-mono text-[11px]">
                            <GitBranchIcon className="w-3 h-3 text-purple-500" />
                            {commit.branchName}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right: Code Stats, Hash & Actions */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/40">
                    {/* Additions & Deletions */}
                    <div className="flex items-center gap-2 text-xs font-mono">
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                        +{commit.additions}
                      </span>
                      <span className="text-rose-500 font-bold">
                        -{commit.deletions}
                      </span>
                      <span className="text-[11px] text-muted-foreground hidden sm:inline">
                        ({commit.filesChanged} file)
                      </span>
                    </div>

                    {/* GitHub Sync Badge */}
                    {commit.isSyncedToJira && (
                      <Badge
                        variant="outline"
                        className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-[10px] font-semibold gap-1 hidden md:flex"
                      >
                        <CheckCircle2Icon className="w-3 h-3" />
                        GitHub Sync
                      </Badge>
                    )}

                    {/* Commit Hash & Copy Button */}
                    <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-xl border border-border/60">
                      <span className="font-mono text-xs font-bold px-2 text-foreground">
                        {commit.shortHash}
                      </span>

                      <button
                        onClick={() => handleCopyHash(commit.shortHash)}
                        title="Sao chép mã Short Hash"
                        className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer transition-colors"
                      >
                        {isCopied ? (
                          <CheckIcon className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <CopyIcon className="w-3.5 h-3.5" />
                        )}
                      </button>

                      <a
                        href={commit.commitUrl}
                        target="_blank"
                        rel="noreferrer"
                        title="Xem trên GitHub"
                        className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer transition-colors"
                      >
                        <ExternalLinkIcon className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </Card>
        </div>
        );
      })}
    </div>
  );
}
