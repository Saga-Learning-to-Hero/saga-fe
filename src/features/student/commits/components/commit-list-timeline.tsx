"use client";

import { useState } from "react";
import {
  GitCommitIcon,
  CopyIcon,
  CheckIcon,
  ExternalLinkIcon,
  CalendarIcon,
  NetworkIcon,
  FolderGit2Icon,
} from "lucide-react";
import Link from "next/link";
import type { CommitItem } from "../types/commits";
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
      <div className="p-8 sm:p-12 text-center rounded-3xl border border-dashed border-border/80 bg-card/40 space-y-4 max-w-2xl mx-auto shadow-2xs">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto shadow-xs">
          <GitCommitIcon className="w-6 h-6" />
        </div>
        <div className="space-y-1.5">
          <h3 className="text-base font-extrabold text-foreground tracking-tight">
            Không tìm thấy Commit nào
          </h3>
          <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
            Chưa có commit nào khớp với bộ lọc repository <strong className="text-foreground">{selectedRepoName}</strong> và nhánh <strong className="text-foreground font-mono">{selectedBranchName}</strong>.
          </p>
        </div>
      </div>
    );
  }

  const groups: Record<string, CommitItem[]> = {};
  commits.forEach((commit) => {
    const commitDate = new Date(commit.createdAt);
    const today = new Date();
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
            <div className="flex items-center gap-2 pb-1 border-b border-border/50 text-xs font-bold text-muted-foreground">
              <CalendarIcon className="w-3.5 h-3.5 text-primary" />
              <span>Commits {groupTitle === "Hôm nay" || groupTitle === "Hôm qua" ? "vào " : ""}{groupTitle}</span>
              <Badge variant="secondary" className="font-mono text-[10px] px-1.5 py-0.2">
                {groupCommits.length}
              </Badge>
            </div>

            <div className="rounded-2xl border border-border/70 bg-card/60 backdrop-blur-xs overflow-hidden divide-y divide-border/50 shadow-2xs">
              {groupCommits.map((commit) => {
                const isCopied = copiedHash === commit.shortHash;

                return (
                  <div
                    key={commit.id}
                    className="p-3.5 sm:px-4.5 hover:bg-muted/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                  >
                    <div className="space-y-1.5 min-w-0 flex-1">
                      <div className="flex items-start gap-2.5">
                        <div className="w-7 h-7 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                          <GitCommitIcon className="w-4 h-4" />
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

                          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1.5">
                              <Avatar className="w-4.5 h-4.5 border">
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

                            <span className="text-border">•</span>

                            <span className="text-[11px] font-mono text-muted-foreground">
                              {new Date(commit.createdAt).toLocaleTimeString("vi-VN", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}{" "}
                              - {new Date(commit.createdAt).toLocaleDateString("vi-VN")}
                            </span>

                            {commit.repoName && (
                              <>
                                <span className="text-border">•</span>
                                <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                                  <FolderGit2Icon className="w-3 h-3 text-muted-foreground/70" />
                                  {commit.repoName}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center pt-2 sm:pt-0 border-t sm:border-t-0 border-border/40">
                      {commit.additions !== null && commit.deletions !== null ? (
                        <div className="font-mono text-[11px] font-bold text-right shrink-0">
                          <span className="text-emerald-600">+{commit.additions}</span>
                          <span className="text-muted-foreground mx-1">/</span>
                          <span className="text-rose-600">-{commit.deletions}</span>
                        </div>
                      ) : (
                        <span className="text-[10px] text-muted-foreground">Chưa có dữ liệu diff</span>
                      )}

                      <button
                        type="button"
                        onClick={() => handleCopyHash(commit.shortHash)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-muted/60 hover:bg-muted border border-border/60 text-[11px] font-mono font-bold text-foreground transition-all cursor-pointer shadow-2xs"
                        title="Sao chép mã hash commit"
                      >
                        {isCopied ? (
                          <>
                            <CheckIcon className="w-3 h-3 text-emerald-500" />
                            <span className="text-emerald-600">Đã chép</span>
                          </>
                        ) : (
                          <>
                            <CopyIcon className="w-3 h-3 text-muted-foreground" />
                            <span>{commit.shortHash}</span>
                          </>
                        )}
                      </button>

                      <Link
                        href={`/student/graph?commitHash=${commit.hash}`}
                        title="Xem nhánh minh chứng trên Đồ thị Neo4j"
                        className="p-1.5 rounded-xl border border-border/60 bg-muted/40 hover:bg-muted text-muted-foreground hover:text-primary transition-all shadow-2xs"
                      >
                        <NetworkIcon className="w-3.5 h-3.5" />
                      </Link>

                      {commit.commitUrl && (
                        <a
                          href={commit.commitUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-xl border border-border/60 bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground transition-all shadow-2xs"
                          title="Xem trên GitHub"
                        >
                          <ExternalLinkIcon className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
