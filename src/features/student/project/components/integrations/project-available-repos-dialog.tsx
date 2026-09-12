"use client";

import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/components/ui/sonner";
import { CustomSelect } from "@/components/common/custom-select";
import {
  GitBranchIcon,
  ExternalLinkIcon,
  Loader2Icon,
  LockIcon,
  GlobeIcon,
  PlusIcon,
  RefreshCwIcon,
  CheckCircle2Icon,
} from "lucide-react";
import {
  useProjectAvailableGitHubRepositories,
  useUpdateProjectGitHubRepositories,
} from "../../hooks/useProjectIntegrations";
import type {
  ProjectGitHubRepositoryItem,
  SelectProjectGitHubRepoPayloadItem,
} from "../../types/student-project";

const REPO_ROLE_OPTIONS = [
  { value: "FRONTEND", label: "Frontend", subLabel: "Giao diện Web / App" },
  { value: "BACKEND", label: "Backend", subLabel: "API & Cơ sở dữ liệu" },
  { value: "FULLSTACK", label: "Fullstack", subLabel: "Frontend & Backend" },
  { value: "DOCS", label: "Tài liệu", subLabel: "Kiến trúc & SRS" },
  { value: "OTHER", label: "Khác", subLabel: "Kho lưu trữ phụ" },
];

interface ProjectAvailableReposDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  currentRepositories?: ProjectGitHubRepositoryItem[];
  onConfigureMore: () => void;
  isConnecting?: boolean;
}

export function ProjectAvailableReposDialog({
  open,
  onOpenChange,
  projectId,
  currentRepositories = [],
  onConfigureMore,
  isConnecting = false,
}: ProjectAvailableReposDialogProps) {
  const {
    data: repositories = [],
    isLoading,
    isRefetching,
    refetch,
  } = useProjectAvailableGitHubRepositories(projectId, { enabled: open });

  const updateReposMutation = useUpdateProjectGitHubRepositories();

  const availableRepoIdSet = useMemo(() => new Set(repositories.map((r) => r.id)), [repositories]);

  const defaultMap = useMemo(() => {
    const initial: Record<number, string> = {};
    if (repositories.length === 0) return initial;
    currentRepositories.forEach((cr) => {
      const match = repositories.find(
        (r) => r.id === cr.repositoryId || (cr.fullName && r.fullName.toLowerCase() === cr.fullName.toLowerCase())
      );
      if (match) initial[match.id] = cr.role || "FRONTEND";
    });
    return initial;
  }, [currentRepositories, repositories]);

  const [localMap, setLocalMap] = useState<Record<number, string> | null>(null);
  const rawMap = localMap ?? defaultMap;

  const activeSelectedMap = useMemo(() => {
    const filtered: Record<number, string> = {};
    Object.entries(rawMap).forEach(([idStr, role]) => {
      const idNum = Number(idStr);
      if (availableRepoIdSet.has(idNum)) filtered[idNum] = role;
    });
    return filtered;
  }, [rawMap, availableRepoIdSet]);

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) setLocalMap(null);
    onOpenChange(isOpen);
  };

  const toggleRepo = (repoId: number, repoName: string) => {
    const next = { ...activeSelectedMap };
    if (next[repoId]) {
      delete next[repoId];
    } else {
      const lower = repoName.toLowerCase();
      next[repoId] = lower.includes("be") || lower.includes("back") ? "BACKEND" : "FRONTEND";
    }
    setLocalMap(next);
  };

  const handleRoleChange = (repoId: number, role: string) => {
    setLocalMap({ ...activeSelectedMap, [repoId]: role });
  };

  const handleSave = async () => {
    const payload: SelectProjectGitHubRepoPayloadItem[] = Object.entries(activeSelectedMap).map(
      ([repoId, role]) => ({ repositoryId: Number(repoId), role })
    );

    try {
      await updateReposMutation.mutateAsync({ projectId, repositories: payload });
      toast.success("Cập nhật danh sách GitHub Repository cho dự án thành công!");
      handleOpenChange(false);
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Không thể lưu cấu hình Repository";
      toast.error(msg);
    }
  };

  const selectedCount = Object.keys(activeSelectedMap).length;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl bg-card border border-border/80 rounded-2xl shadow-2xl p-0 overflow-hidden flex flex-col max-h-[85vh]">
        <DialogHeader className="p-5 border-b border-border/60 bg-muted/20 shrink-0 text-left">
          <div className="flex items-center justify-between gap-3 pr-8">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <GitBranchIcon className="w-4.5 h-4.5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-foreground">Cấu hình GitHub Repositories</DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">Chọn các repository và gán vai trò tương ứng cho dự án</DialogDescription>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => void refetch()} disabled={isLoading || isRefetching} className="h-7.5 px-2 text-xs rounded-lg gap-1 shrink-0 cursor-pointer">
              <RefreshCwIcon className={`w-3 h-3 ${isRefetching ? "animate-spin text-primary" : ""}`} />
              <span>Làm mới</span>
            </Button>
          </div>
        </DialogHeader>

        <div className="p-5 overflow-y-auto flex-1 space-y-2.5 min-h-[300px]">
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2 text-xs text-muted-foreground animate-pulse">
              <Loader2Icon className="w-5 h-5 animate-spin text-purple-600" />
              <span>Đang tải danh sách repository từ GitHub...</span>
            </div>
          ) : repositories.length === 0 ? (
            <div className="py-8 text-center space-y-2 rounded-xl border border-dashed border-border/80 bg-muted/15 p-4">
              <p className="text-xs font-semibold text-foreground">Không tìm thấy repository nào</p>
              <p className="text-[11px] text-muted-foreground">Hãy cấp quyền cho GitHub App truy cập các repo của nhóm bạn.</p>
            </div>
          ) : (
            repositories.map((repo) => {
              const isSelected = Boolean(activeSelectedMap[repo.id]);
              const currentRole = activeSelectedMap[repo.id] || "FRONTEND";

              return (
                <div
                  key={repo.id}
                  className={`p-3.5 rounded-xl border transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs relative ${isSelected ? "bg-purple-500/10 border-purple-500/40 z-10" : "bg-muted/20 border-border/70 hover:border-purple-500/30"
                    }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Checkbox
                      id={`repo-${repo.id}`}
                      checked={isSelected}
                      onCheckedChange={() => toggleRepo(repo.id, repo.name)}
                      className="cursor-pointer"
                    />
                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <label
                          htmlFor={`repo-${repo.id}`}
                          className="text-xs font-mono font-bold text-purple-600 dark:text-purple-400 hover:underline cursor-pointer truncate"
                        >
                          {repo.fullName}
                        </label>
                        <a href={`https://github.com/${repo.fullName}`} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-foreground" title="Mở trên GitHub">
                          <ExternalLinkIcon className="w-3 h-3 shrink-0" />
                        </a>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-mono">
                        <span>Nhánh: {repo.defaultBranch || "main"}</span>
                        <span>•</span>
                        {repo.privateRepo ? (
                          <span className="flex items-center gap-1 text-amber-500"><LockIcon className="w-2.5 h-2.5" /> Private</span>
                        ) : (
                          <span className="flex items-center gap-1 text-emerald-500"><GlobeIcon className="w-2.5 h-2.5" /> Public</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="w-full sm:w-56 shrink-0 animate-in fade-in-0">
                      <CustomSelect
                        id={`role-${repo.id}`}
                        value={currentRole}
                        onChange={(val) => handleRoleChange(repo.id, val)}
                        options={REPO_ROLE_OPTIONS}
                        className="text-xs"
                        dropdownClassName="min-w-full sm:min-w-[220px] right-0"
                      />
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        <div className="p-4 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-2.5 shrink-0 bg-muted/20">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onConfigureMore}
            disabled={isConnecting}
            className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground gap-1.5 cursor-pointer w-full sm:w-auto"
          >
            {isConnecting ? <Loader2Icon className="w-3.5 h-3.5 animate-spin" /> : <PlusIcon className="w-3.5 h-3.5" />}
            <span>Cấp quyền thêm Repo trên GitHub</span>
          </Button>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <Button type="button" variant="outline" size="sm" onClick={() => handleOpenChange(false)} className="h-8 px-3 text-xs rounded-xl cursor-pointer">
              Hủy
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={() => void handleSave()}
              disabled={updateReposMutation.isPending}
              className="h-8 px-4 text-xs font-semibold rounded-xl bg-purple-600 hover:bg-purple-700 text-white gap-1.5 cursor-pointer shadow-xs"
            >
              {updateReposMutation.isPending ? <Loader2Icon className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2Icon className="w-3.5 h-3.5" />}
              <span>Lưu cấu hình ({selectedCount} repo)</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
