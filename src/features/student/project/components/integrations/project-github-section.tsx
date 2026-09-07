"use client";

import {
  GitBranchIcon,
  ExternalLinkIcon,
  PlusIcon,
  Trash2Icon,
  RefreshCwIcon,
  GitCommitIcon,
  GitPullRequestIcon,
  ClockIcon,
  LoaderCircleIcon,
} from "lucide-react";
import type { ProjectGitHubRepo } from "../../types/student-project";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ProjectGithubSectionProps {
  repos: ProjectGitHubRepo[];
  isLeader: boolean;
  isConnectingRepo: boolean;
  syncingId: string | null;
  onAddRepo: () => void;
  onSyncRepo: (repoId: string) => void;
  onDeleteRepo: (repoId: string) => void;
}

export function ProjectGithubSection({
  repos,
  isLeader,
  isConnectingRepo,
  syncingId,
  onAddRepo,
  onSyncRepo,
  onDeleteRepo,
}: ProjectGithubSectionProps) {
  return (
    <div className="space-y-3 pt-4 border-t border-border/60">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-purple-600 text-white flex items-center justify-center shrink-0">
            <GitBranchIcon className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                GitHub Repositories Đồ Án (Đa Repositories)
              </h4>
              <Badge
                variant="outline"
                className="font-mono text-[10px] border-purple-500/30 text-purple-600 dark:text-purple-400 bg-purple-500/10 font-bold"
              >
                {repos.length} repos
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Gom mã nguồn từ các phân hệ Frontend, Backend, AI Model về chung đồ án
            </p>
          </div>
        </div>

        {isLeader && (
          <Button
            type="button"
            size="sm"
            onClick={onAddRepo}
            disabled={isConnectingRepo}
            className="h-8 px-3 text-xs font-bold rounded-xl gap-1.5 bg-purple-600 hover:bg-purple-700 text-white cursor-pointer shadow-2xs"
          >
            {isConnectingRepo ? (
              <>
                <LoaderCircleIcon className="w-3.5 h-3.5 animate-spin" />
                <span>Đang chuyển hướng...</span>
              </>
            ) : (
              <>
                <PlusIcon className="w-3.5 h-3.5" />
                <span>+ Thêm Repo qua GitHub Link</span>
              </>
            )}
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {repos.map((r) => (
          <div
            key={r.id}
            className="p-4 rounded-2xl bg-card border border-border/80 hover:border-border transition-all duration-200 flex flex-col justify-between gap-3.5 shadow-2xs"
          >
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <span className="text-xs font-bold text-foreground line-clamp-1">
                  {r.alias || r.repository}
                </span>
                <Badge variant="outline" className="font-mono text-[10px] py-0 bg-muted/30">
                  {r.defaultBranch}
                </Badge>
              </div>

              <a
                href={`https://github.com/${r.repository}`}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-mono font-semibold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1 truncate"
              >
                <span className="truncate">{r.repository}</span>
                <ExternalLinkIcon className="w-3.5 h-3.5 shrink-0" />
              </a>

              <div className="flex items-center gap-3 text-[11px] font-mono text-muted-foreground pt-1 border-t border-border/40">
                <span className="flex items-center gap-1 text-primary font-bold">
                  <GitCommitIcon className="w-3 h-3" />
                  {r.commitsCount ?? 0} commits
                </span>
                <span className="flex items-center gap-1 text-purple-600 dark:text-purple-400 font-bold">
                  <GitPullRequestIcon className="w-3 h-3" />
                  {r.pullRequestsCount ?? 0} PRs
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-border/40 text-[11px]">
              <div className="flex items-center gap-1 text-muted-foreground font-mono">
                <ClockIcon className="w-3 h-3 text-emerald-500 shrink-0" />
                <span>{r.lastSyncedAt || "Vừa xong"}</span>
              </div>

              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => onSyncRepo(r.id)}
                  disabled={syncingId === r.id}
                  className="h-7 w-7 p-0 rounded-lg text-muted-foreground hover:text-foreground cursor-pointer"
                  title="Đồng bộ ngay"
                >
                  <RefreshCwIcon className={`w-3 h-3 ${syncingId === r.id ? "animate-spin text-primary" : ""}`} />
                </Button>

                {isLeader && repos.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => onDeleteRepo(r.id)}
                    className="h-7 w-7 p-0 rounded-lg text-rose-500 hover:bg-rose-500/10 cursor-pointer"
                    title="Xóa repository"
                  >
                    <Trash2Icon className="w-3 h-3" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
