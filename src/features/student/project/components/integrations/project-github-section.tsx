"use client";

import {
  GitBranchIcon,
  ExternalLinkIcon,
  PlusIcon,
  LoaderCircleIcon,
  Code2Icon,
  ShieldCheckIcon,
} from "lucide-react";
import type { ProjectGitHubIntegration } from "../../types/student-project";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ProjectGithubSectionProps {
  github?: ProjectGitHubIntegration | null;
  isLeader: boolean;
  isConnectingRepo?: boolean;
  onAddRepo?: () => void;
}

export function ProjectGithubSection({
  github,
  isLeader,
  isConnectingRepo = false,
  onAddRepo,
}: ProjectGithubSectionProps) {
  const repositories = github?.repositories || [];
  const hasRepos = repositories.length > 0;

  return (
    <div className="rounded-xl border border-purple-500/25 bg-purple-500/[0.02] p-4 flex flex-col justify-between space-y-3">
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <GitBranchIcon className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-xs sm:text-sm font-bold text-foreground">
                  GitHub Repositories của nhóm
                </h4>
                <Badge
                  variant="outline"
                  className="font-mono text-[10px] border-purple-500/30 text-purple-600 dark:text-purple-400 bg-purple-500/10 font-bold"
                >
                  {repositories.length} repos
                </Badge>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Các repo mã nguồn chung để theo dõi commit và PR
              </p>
            </div>
          </div>

          {isLeader && onAddRepo && (
            <Button
              type="button"
              size="sm"
              onClick={onAddRepo}
              disabled={isConnectingRepo}
              className="h-7.5 px-2.5 text-[11px] font-bold rounded-lg gap-1.5 bg-purple-600 hover:bg-purple-700 text-white cursor-pointer shadow-2xs self-start sm:self-auto shrink-0"
            >
              {isConnectingRepo ? (
                <>
                  <LoaderCircleIcon className="w-3 h-3 animate-spin" />
                  <span>Đang xử lý...</span>
                </>
              ) : (
                <>
                  <PlusIcon className="w-3 h-3" />
                  <span>+ Thêm Repo</span>
                </>
              )}
            </Button>
          )}
        </div>

        {!hasRepos ? (
          <div className="p-4 rounded-xl border border-dashed border-border/80 bg-muted/15 text-center space-y-2">
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center mx-auto">
              <GitBranchIcon className="w-4 h-4" />
            </div>
            <div className="max-w-sm mx-auto space-y-0.5">
              <h5 className="text-xs font-bold text-foreground">Chưa có Repository nào</h5>
              <p className="text-[11px] text-muted-foreground">
                Trưởng nhóm thêm các repo GitHub để hệ thống ghi nhận commit và PR.
              </p>
            </div>
            {isLeader && onAddRepo && (
              <Button
                type="button"
                size="sm"
                onClick={onAddRepo}
                disabled={isConnectingRepo}
                className="h-7.5 px-3 text-[11px] font-bold rounded-lg gap-1.5 bg-purple-600 hover:bg-purple-700 text-white cursor-pointer shadow-2xs"
              >
                <PlusIcon className="w-3 h-3" />
                <span>Thêm GitHub Repository</span>
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
            {repositories.map((r) => (
              <div
                key={r.id || `${r.repositoryId}-${r.fullName}`}
                className="p-3.5 rounded-xl bg-card border border-border/80 hover:border-purple-500/40 transition-all duration-200 flex items-center justify-between gap-3 shadow-2xs"
              >
                <div className="min-w-0 space-y-1">
                  <a
                    href={`https://github.com/${r.fullName}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-mono font-bold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1.5 truncate"
                  >
                    <span className="truncate">{r.fullName}</span>
                    <ExternalLinkIcon className="w-3 h-3 shrink-0" />
                  </a>
                  {r.role && (
                    <Badge variant="secondary" className="text-[10px] font-mono font-medium">
                      <Code2Icon className="w-3 h-3 mr-1" />
                      {r.role}
                    </Badge>
                  )}
                </div>
                <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-0 text-[10px] font-semibold shrink-0">
                  <ShieldCheckIcon className="w-3 h-3 mr-1" />
                  {r.status || "ACTIVE"}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </div>

      {github?.accountLogin && (
        <div className="pt-3 border-t border-purple-500/15 flex items-center justify-between text-[11px] text-muted-foreground">
          <span>Tài khoản GitHub liên kết:</span>
          <Badge variant="secondary" className="font-mono text-[10px]">
            @{github.accountLogin}
          </Badge>
        </div>
      )}
    </div>
  );
}
