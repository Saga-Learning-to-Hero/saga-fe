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
    <div className="space-y-3 pt-4 border-t border-border/60">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-purple-600 text-white flex items-center justify-center shrink-0">
            <GitBranchIcon className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                GitHub Repositories Đồ Án (Đa Repositories)
              </h4>
              <Badge
                variant="outline"
                className="font-mono text-[10px] border-purple-500/30 text-purple-600 dark:text-purple-400 bg-purple-500/10 font-bold"
              >
                {repositories.length} repos
              </Badge>
              {github?.accountLogin && (
                <Badge variant="secondary" className="font-mono text-[10px]">
                  @{github.accountLogin}
                </Badge>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground">
              Gom mã nguồn từ các phân hệ Frontend, Backend, AI Model về chung đồ án để truy xuất công sức
            </p>
          </div>
        </div>

        {isLeader && onAddRepo && (
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
                <span> Thêm Repo GitHub</span>
              </>
            )}
          </Button>
        )}
      </div>

      {!hasRepos ? (
        <div className="p-6 rounded-2xl border border-dashed border-border/80 bg-muted/20 text-center space-y-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center mx-auto">
            <GitBranchIcon className="w-5 h-5" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h5 className="text-xs font-bold text-foreground">Chưa có GitHub Repository nào được liên kết</h5>
            <p className="text-[11px] text-muted-foreground">
              Trưởng nhóm liên kết các kho mã nguồn của đồ án để hệ thống tự động đào dấu vết Commit và Pull Requests.
            </p>
          </div>
          {isLeader && onAddRepo && (
            <Button
              type="button"
              size="sm"
              onClick={onAddRepo}
              disabled={isConnectingRepo}
              className="h-8 px-3 text-xs font-bold rounded-xl gap-1.5 bg-purple-600 hover:bg-purple-700 text-white cursor-pointer shadow-2xs"
            >
              <PlusIcon className="w-3.5 h-3.5" />
              <span>Liên kết GitHub Repository ngay</span>
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {repositories.map((r) => (
            <div
              key={r.id || `${r.repositoryId}-${r.fullName}`}
              className="p-4 rounded-2xl bg-card border border-border/80 hover:border-border transition-all duration-200 flex flex-col justify-between gap-3.5 shadow-2xs"
            >
              <div className="space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <a
                    href={`https://github.com/${r.fullName}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-mono font-bold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1.5 truncate"
                  >
                    <span className="truncate">{r.fullName}</span>
                    <ExternalLinkIcon className="w-3.5 h-3.5 shrink-0" />
                  </a>
                  <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-0 text-[10px] font-semibold shrink-0">
                    <ShieldCheckIcon className="w-3 h-3 mr-1" />
                    {r.status || "ACTIVE"}
                  </Badge>
                </div>

                {r.role && (
                  <div className="flex items-center gap-2 pt-0.5">
                    <Badge variant="secondary" className="text-[10px] font-mono font-medium">
                      <Code2Icon className="w-3 h-3 mr-1" />
                      {r.role}
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
