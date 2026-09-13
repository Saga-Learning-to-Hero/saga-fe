"use client";

import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import { CustomSelect } from "@/components/common/custom-select";
import {
  CheckSquareIcon, Loader2Icon, ExternalLinkIcon, RefreshCwIcon,
  CheckCircle2Icon, LayersIcon, FolderKanbanIcon, GlobeIcon,
} from "lucide-react";
import {
  useProjectJiraSites, useProjectJiraProjects, useProjectJiraBoards, useUpdateProjectJira,
} from "../../hooks/useProjectIntegrations";
import type { ProjectJiraIntegration, UpdateProjectJiraPayload } from "../../types/student-project";

interface ProjectJiraConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  currentJira?: ProjectJiraIntegration | null;
  onAuthorizeNew?: () => void;
  isAuthorizing?: boolean;
}

export function ProjectJiraConfigDialog({
  open, onOpenChange, projectId, currentJira, onAuthorizeNew, isAuthorizing = false,
}: ProjectJiraConfigDialogProps) {
  const updateJiraMutation = useUpdateProjectJira();
  const { data: sites = [], isLoading: isLoadingSites, refetch: refetchSites } = useProjectJiraSites(projectId, { enabled: open });
  const [localSiteId, setLocalSiteId] = useState<string | null>(null);
  const selectedSiteId = localSiteId !== null ? localSiteId : currentJira?.cloudId && sites.some((s) => s.id === currentJira.cloudId) ? currentJira.cloudId : sites[0]?.id || "";

  const { data: projects = [], isLoading: isLoadingProjects, refetch: refetchProjects } = useProjectJiraProjects(projectId, selectedSiteId, { enabled: open && Boolean(selectedSiteId) });
  const [localProjectId, setLocalProjectId] = useState<string | null>(null);
  const selectedProjectId = localProjectId !== null && projects.some((p) => p.id === localProjectId)
    ? localProjectId
    : currentJira?.projectKey ? projects.find((p) => p.key === currentJira.projectKey)?.id || projects[0]?.id || "" : projects[0]?.id || "";

  const { data: boards = [], isLoading: isLoadingBoards, refetch: refetchBoards } = useProjectJiraBoards(projectId, selectedSiteId, selectedProjectId, { enabled: open && Boolean(selectedSiteId && selectedProjectId) });
  const [localBoardId, setLocalBoardId] = useState<string | null>(null);
  const selectedBoardId = localBoardId !== null ? localBoardId : currentJira?.boardId && boards.some((b) => b.id === currentJira.boardId) ? currentJira.boardId : boards[0]?.id || "";

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setLocalSiteId(null);
      setLocalProjectId(null);
      setLocalBoardId(null);
    }
    onOpenChange(nextOpen);
  };

  const siteOptions = useMemo(() => sites.map((s) => ({ value: s.id, label: s.name || s.url, subLabel: s.url })), [sites]);
  const projectOptions = useMemo(() => projects.map((p) => ({ value: p.id, label: `${p.key} · ${p.name}`, subLabel: `Key: ${p.key}` })), [projects]);
  const boardOptions = useMemo(() => [
    { value: "NONE", label: "-- Không chọn Board --", subLabel: "Bỏ qua cấu hình board" },
    ...boards.map((b) => ({ value: b.id, label: b.name, subLabel: `Loại: ${b.type || "Kanban/Scrum"}` })),
  ], [boards]);

  const handleSave = async () => {
    if (!selectedSiteId) return toast.error("Vui lòng chọn Jira Site");
    if (!selectedProjectId) return toast.error("Vui lòng chọn Jira Project");
    try {
      const payload: UpdateProjectJiraPayload = { cloudId: selectedSiteId, jiraProjectId: selectedProjectId };
      if (selectedBoardId && selectedBoardId !== "NONE") payload.boardId = selectedBoardId;
      handleOpenChange(false);
      await updateJiraMutation.mutateAsync({ projectId, payload });
      toast.success("Lưu cấu hình Jira cho dự án thành công!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể lưu cấu hình Jira");
    }
  };

  const isRefreshing = isLoadingSites || isLoadingProjects || isLoadingBoards;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-xl bg-card border border-border/80 rounded-2xl shadow-xl p-5 space-y-4">
        <DialogHeader className="space-y-1.5 text-left border-b border-border/60 pb-3">
          <div className="flex items-center justify-between gap-3 pr-8">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <CheckSquareIcon className="w-4.5 h-4.5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-foreground">Cấu hình Jira Project của nhóm</DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">Chọn Site, Project và Board để liên kết theo dõi tiến độ</DialogDescription>
              </div>
            </div>
            <Button
              variant="outline" size="sm" disabled={isRefreshing}
              onClick={() => { void refetchSites(); void refetchProjects(); void refetchBoards(); }}
              className="h-7.5 px-2 text-xs rounded-lg gap-1 shrink-0 cursor-pointer"
            >
              <RefreshCwIcon className={`w-3 h-3 ${isRefreshing ? "animate-spin text-primary" : ""}`} />
              <span>Làm mới</span>
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-4 max-h-[360px] overflow-y-auto pr-1">
          {isLoadingSites ? (
            <div className="py-10 flex flex-col items-center justify-center gap-2 text-xs text-muted-foreground animate-pulse">
              <Loader2Icon className="w-5 h-5 animate-spin text-blue-600" />
              <span>Đang tải danh sách Jira Sites...</span>
            </div>
          ) : sites.length === 0 ? (
            <div className="py-8 text-center space-y-3 rounded-xl border border-dashed border-border/80 bg-muted/15 p-4">
              <GlobeIcon className="w-7 h-7 text-muted-foreground mx-auto" />
              <div className="space-y-1">
                <p className="text-xs font-semibold text-foreground">Chưa có Jira Site nào khả dụng</p>
                <p className="text-[11px] text-muted-foreground">Bạn cần đăng nhập ủy quyền tài khoản Atlassian để cấp quyền truy cập Jira Site.</p>
              </div>
              {onAuthorizeNew && (
                <Button type="button" size="sm" onClick={onAuthorizeNew} disabled={isAuthorizing} className="h-8 px-3 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white gap-1.5 cursor-pointer shadow-xs">
                  {isAuthorizing ? <Loader2Icon className="w-3.5 h-3.5 animate-spin" /> : <ExternalLinkIcon className="w-3.5 h-3.5" />}
                  <span>Ủy quyền Atlassian Jira</span>
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-3.5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <GlobeIcon className="w-3.5 h-3.5 text-blue-500" />
                  <span>1. Chọn Jira Site (Atlassian Cloud)</span>
                </label>
                <CustomSelect
                  id="jira-site-select"
                  value={selectedSiteId}
                  onChange={(val) => { setLocalSiteId(val); setLocalProjectId(null); setLocalBoardId(null); }}
                  options={siteOptions}
                  className="text-xs"
                />
              </div>

              {selectedSiteId && (
                <div className="space-y-1.5 animate-in fade-in-0">
                  <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <FolderKanbanIcon className="w-3.5 h-3.5 text-blue-500" />
                    <span>2. Chọn Jira Project của nhóm</span>
                  </label>
                  {isLoadingProjects ? (
                    <div className="p-2.5 rounded-lg border border-border bg-muted/20 text-xs text-muted-foreground flex items-center gap-2">
                      <Loader2Icon className="w-3.5 h-3.5 animate-spin text-blue-600" />
                      <span>Đang tải danh sách Projects...</span>
                    </div>
                  ) : projects.length === 0 ? (
                    <p className="text-xs text-amber-600 dark:text-amber-400 p-2">Không tìm thấy Project nào trong Site này</p>
                  ) : (
                    <CustomSelect id="jira-project-select" value={selectedProjectId} onChange={(val) => { setLocalProjectId(val); setLocalBoardId(null); }} options={projectOptions} className="text-xs" />
                  )}
                </div>
              )}

              {selectedProjectId && (
                <div className="space-y-1.5 animate-in fade-in-0">
                  <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <LayersIcon className="w-3.5 h-3.5 text-blue-500" />
                    <span>3. Chọn Jira Board</span>
                  </label>
                  {isLoadingBoards ? (
                    <div className="p-2.5 rounded-lg border border-border bg-muted/20 text-xs text-muted-foreground flex items-center gap-2">
                      <Loader2Icon className="w-3.5 h-3.5 animate-spin text-blue-600" />
                      <span>Đang tải danh sách Boards...</span>
                    </div>
                  ) : (
                    <CustomSelect id="jira-board-select" value={selectedBoardId || "NONE"} onChange={(val) => setLocalBoardId(val === "NONE" ? "" : val)} options={boardOptions} className="text-xs" />
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="border-t border-border/60 pt-3 flex flex-col sm:flex-row items-center justify-between gap-2.5">
          {onAuthorizeNew && (
            <Button
              type="button" variant="outline" size="sm" onClick={onAuthorizeNew} disabled={isAuthorizing}
              className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground gap-1.5 cursor-pointer w-full sm:w-auto"
            >
              {isAuthorizing ? <Loader2Icon className="w-3.5 h-3.5 animate-spin" /> : <ExternalLinkIcon className="w-3.5 h-3.5" />}
              <span>Ủy quyền lại Atlassian ID</span>
            </Button>
          )}

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <Button type="button" variant="outline" size="sm" onClick={() => handleOpenChange(false)} className="h-8 px-3 text-xs rounded-xl cursor-pointer">
              Hủy
            </Button>
            <Button
              type="button" size="sm" onClick={() => void handleSave()}
              disabled={updateJiraMutation.isPending || !selectedSiteId || !selectedProjectId}
              className="h-8 px-4 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white gap-1.5 cursor-pointer shadow-xs"
            >
              {updateJiraMutation.isPending ? <Loader2Icon className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2Icon className="w-3.5 h-3.5" />}
              <span>Lưu cấu hình Jira</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
