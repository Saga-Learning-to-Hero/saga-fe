"use client";

import { useState, useEffect, useRef } from "react";
import {
  PlayIcon,
  SquareIcon,
  Link2Icon,
  FileIcon,
  ExternalLinkIcon,
  PlusIcon,
  Loader2Icon,
  TimerIcon,
  AlertCircleIcon,
  CheckCircle2Icon,
  Trash2Icon,
  DownloadIcon,
  UploadCloudIcon,
  ShieldCheckIcon,
  GitCommitIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ConfirmDeleteDialog } from "@/components/common/confirm-delete-dialog";
import { toast } from "sonner";
import { useProjectCommits } from "@/features/student/project/hooks/useProjectSync";
import {
  useTaskWebLinks,
  useTaskFiles,
  useStartWorkSession,
  useStopWorkSession,
  useAddTaskWebLink,
  useDeleteTaskWebLink,
  useUploadTaskFile,
  useDownloadTaskFile,
  useDeleteTaskFile,
  useConfirmContribution,
} from "../hooks/use-task-evidence";
import type { TaskWebLinkItem, TaskFileItem } from "../types/task-evidence";

type TaskEvidenceSection = "all" | "documents" | "contribution";

interface TaskEvidencePanelProps {
  taskId: string;
  projectId?: string;
  taskKey?: string;
  section?: TaskEvidenceSection;
  isOwnerOrLeader?: boolean;
  externalCommitShas?: string;
  onConfirmCommitsChange?: (shas: string) => void;
}

function formatFileSize(bytes: number): string {
  if (!bytes || bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function formatSeconds(totalSec: number): string {
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return [h, m, s].map((v) => (v < 10 ? `0${v}` : `${v}`)).join(":");
}

interface TaskWorkSessionControlProps {
  taskId: string;
  isOwnerOrLeader?: boolean;
}

/** A compact, immediately available work-session control for the task drawer header. */
export function TaskWorkSessionControl({
  taskId,
  isOwnerOrLeader = true,
}: TaskWorkSessionControlProps) {
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isSessionRunning, setIsSessionRunning] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const startSessionMutation = useStartWorkSession(taskId);
  const stopSessionMutation = useStopWorkSession(taskId);
  const isSessionLoading = startSessionMutation.isPending || stopSessionMutation.isPending;

  useEffect(() => {
    if (!isSessionRunning) return;

    const interval = window.setInterval(() => {
      setElapsedSeconds((previous) => previous + 1);
    }, 1000);

    return () => window.clearInterval(interval);
  }, [isSessionRunning]);

  const handleStartSession = async () => {
    try {
      const session = await startSessionMutation.mutateAsync();
      setActiveSessionId(session.id);
      setIsSessionRunning(true);
      setElapsedSeconds(0);
      toast.success("Đã bắt đầu bấm giờ phiên làm việc.");
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Không thể bắt đầu phiên làm việc.");
    }
  };

  const handleStopSession = async () => {
    if (!activeSessionId) return;

    try {
      await stopSessionMutation.mutateAsync(activeSessionId);
      setIsSessionRunning(false);
      toast.success("Đã lưu thời lượng phiên làm việc.");
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Không thể dừng phiên làm việc.");
    }
  };

  return (
    <div className="hidden sm:flex items-center gap-1.5">
      <div
        className={`flex items-center gap-1.5 rounded-lg border px-2 py-1 font-mono text-xs font-bold tabular-nums ${
          isSessionRunning
            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
            : "border-border/60 bg-background text-muted-foreground"
        }`}
        title={isSessionRunning ? "Đang bấm giờ" : "Chưa bấm giờ"}
      >
        <TimerIcon className="w-3.5 h-3.5" />
        {formatSeconds(elapsedSeconds)}
      </div>

      {isOwnerOrLeader &&
        (!isSessionRunning ? (
          <Button
            type="button"
            size="sm"
            disabled={isSessionLoading}
            onClick={handleStartSession}
            className="h-8 rounded-lg bg-emerald-600 px-2.5 text-xs font-semibold text-white hover:bg-emerald-700"
          >
            {isSessionLoading ? (
              <Loader2Icon className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <PlayIcon className="w-3.5 h-3.5" />
            )}
            Bắt đầu
          </Button>
        ) : (
          <Button
            type="button"
            size="sm"
            disabled={isSessionLoading}
            onClick={handleStopSession}
            className="h-8 rounded-lg bg-rose-600 px-2.5 text-xs font-semibold text-white hover:bg-rose-700"
          >
            {isSessionLoading ? (
              <Loader2Icon className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <SquareIcon className="w-3.5 h-3.5" />
            )}
            Dừng
          </Button>
        ))}
    </div>
  );
}

export function TaskEvidencePanel({
  taskId,
  projectId,
  taskKey,
  section = "all",
  isOwnerOrLeader = true,
  externalCommitShas,
  onConfirmCommitsChange,
}: TaskEvidencePanelProps) {
  const confirmSectionRef = useRef<HTMLDivElement>(null);

  const [newUrl, setNewUrl] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [linkError, setLinkError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const [internalCommits, setInternalCommits] = useState("");
  const confirmCommits = externalCommitShas !== undefined ? externalCommitShas : internalCommits;
  const [confirmPrs, setConfirmPrs] = useState("");
  const [confirmResult, setConfirmResult] = useState<{
    id: string;
    evidenceHash: string;
    state: string;
  } | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [isBrowsingOtherCommits, setIsBrowsingOtherCommits] = useState(false);
  const [otherCommitQuery, setOtherCommitQuery] = useState("");
  const [visibleOtherCommitCount, setVisibleOtherCommitCount] = useState(20);

  const [deletingLink, setDeletingLink] = useState<TaskWebLinkItem | null>(null);
  const [deletingFile, setDeletingFile] = useState<TaskFileItem | null>(null);

  const { data: links = [], isLoading: isLinksLoading } = useTaskWebLinks(taskId);
  const { data: files = [], isLoading: isFilesLoading } = useTaskFiles(taskId);
  const { data: projectCommits = [], isLoading: isProjectCommitsLoading } = useProjectCommits(projectId, {
    enabled: Boolean(projectId && (section === "all" || section === "contribution")),
  });

  const addLinkMutation = useAddTaskWebLink(taskId);
  const deleteLinkMutation = useDeleteTaskWebLink(taskId);
  const uploadFileMutation = useUploadTaskFile(taskId);
  const downloadFileMutation = useDownloadTaskFile(taskId);
  const deleteFileMutation = useDeleteTaskFile(taskId);
  const confirmContributionMutation = useConfirmContribution(taskId);

  const handleAddLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl.trim()) {
      setLinkError("Vui lòng nhập đường dẫn URL hợp lệ");
      return;
    }
    setLinkError(null);
    try {
      await addLinkMutation.mutateAsync({
        url: newUrl.trim(),
        title: newTitle.trim() || undefined,
      });
      setNewUrl("");
      setNewTitle("");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Không thể đính kèm liên kết";
      setLinkError(msg);
    }
  };

  const handleConfirmDeleteLink = async () => {
    if (!deletingLink) return;
    try {
      await deleteLinkMutation.mutateAsync(deletingLink.id);
      setDeletingLink(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Không thể xóa liên kết";
      setLinkError(msg);
    }
  };

  const handleUploadFile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setFileError("Vui lòng chọn tệp tin cần tải lên");
      return;
    }
    setFileError(null);
    try {
      await uploadFileMutation.mutateAsync(selectedFile);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Không thể tải tệp lên";
      setFileError(msg);
    }
  };

  const handleDownloadFile = (fileId: string, filename: string) => {
    downloadFileMutation.mutate({ fileId, filename });
  };

  const handleConfirmDeleteFile = async () => {
    if (!deletingFile) return;
    try {
      await deleteFileMutation.mutateAsync(deletingFile.id);
      setDeletingFile(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Không thể xóa tệp";
      setFileError(msg);
    }
  };

  const updateConfirmedShas = (shas: string[]) => {
    const value = Array.from(new Set(shas.map((sha) => sha.trim()).filter(Boolean))).join(", ");
    setInternalCommits(value);
    onConfirmCommitsChange?.(value);
  };

  const toggleConfirmedSha = (sha: string) => {
    const currentShas = confirmCommits
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);
    updateConfirmedShas(
      currentShas.includes(sha)
        ? currentShas.filter((currentSha) => currentSha !== sha)
        : [...currentShas, sha]
    );
  };

  const normalizedTaskKey = taskKey?.trim().toUpperCase() || "";
  const syncedCommits = projectCommits.filter((commit) => Boolean(commit.sha));
  const matchingTaskCommits = syncedCommits.filter((commit) =>
    normalizedTaskKey
      ? `${commit.message || ""} ${commit.headRef || ""}`.toUpperCase().includes(normalizedTaskKey)
      : false
  );
  const otherSyncedCommits = syncedCommits.filter((commit) => !matchingTaskCommits.includes(commit));
  const normalizedOtherQuery = otherCommitQuery.trim().toUpperCase();
  const filteredOtherCommits = otherSyncedCommits.filter((commit) =>
    normalizedOtherQuery
      ? `${commit.sha} ${commit.message || ""} ${commit.headRef || ""} ${commit.repositoryFullName || ""}`
        .toUpperCase()
        .includes(normalizedOtherQuery)
      : true
  );
  const visibleOtherCommits = filteredOtherCommits.slice(0, visibleOtherCommitCount);

  const handleConfirmContribution = async (e: React.FormEvent) => {
    e.preventDefault();
    setConfirmError(null);
    setConfirmResult(null);

    const shas = confirmCommits
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const prs = confirmPrs
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      const res = await confirmContributionMutation.mutateAsync({
        commitShas: shas,
        pullRequests: prs,
      });
      setConfirmResult(res);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Xác nhận đóng góp thất bại";
      setConfirmError(msg);
    }
  };

  const renderSelectableCommit = (commit: (typeof syncedCommits)[number]) => {
    const isSelected = confirmCommits
      .split(",")
      .map((sha) => sha.trim())
      .includes(commit.sha);

    return (
      <Button
        key={commit.id}
        type="button"
        variant="outline"
        onClick={() => toggleConfirmedSha(commit.sha)}
        className={`w-full h-auto min-h-9 justify-start px-2.5 py-2 text-left gap-2 rounded-lg border ${
          isSelected
            ? "border-violet-500/60 bg-violet-500/10 text-foreground"
            : "border-border/60 bg-background hover:bg-muted/50"
        }`}
      >
        <span className="font-mono text-[10px] font-bold text-primary shrink-0">
          {commit.sha.slice(0, 7)}
        </span>
        <span className="text-[11px] truncate flex-1">{commit.message}</span>
        {isSelected && <CheckCircle2Icon className="w-3.5 h-3.5 text-violet-600 shrink-0" />}
      </Button>
    );
  };

  return (
    <div className={section === "all" ? "space-y-6 pt-4 border-t border-border/70" : "space-y-4"}>
      <div className={`${section === "all" || section === "documents" ? "" : "hidden"} bg-card border border-border/80 rounded-2xl p-4 shadow-xs space-y-4`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link2Icon className="w-4 h-4 text-sky-500" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Tài liệu & Thiết kế đính kèm ({links.length})
            </h4>
          </div>
        </div>

        {isLinksLoading ? (
          <div className="flex items-center justify-center py-4 text-muted-foreground text-xs gap-2">
            <Loader2Icon className="w-4 h-4 animate-spin text-primary" />
            <span>Đang tải danh sách liên kết...</span>
          </div>
        ) : links.length === 0 ? (
          <div className="text-center py-4 text-xs text-muted-foreground bg-muted/20 border border-dashed border-border/70 rounded-xl">
            Chưa có tài liệu hoặc liên kết thiết kế nào được gắn kèm task này.
          </div>
        ) : (
          <div className="space-y-2">
            {links.map((link) => (
              <div
                key={link.id}
                className="flex items-center justify-between p-2.5 rounded-xl bg-muted/30 border border-border/50 text-xs hover:bg-muted/50 transition-colors"
              >
                <div className="min-w-0 flex-1 mr-3">
                  <p className="font-semibold text-foreground truncate">
                    {link.title || "Tài liệu đính kèm"}
                  </p>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    className="font-mono text-[11px] text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1 truncate mt-0.5"
                  >
                    <span className="truncate">{link.url}</span>
                    <ExternalLinkIcon className="w-3 h-3 shrink-0" />
                  </a>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] text-muted-foreground font-mono">
                    {new Date(link.createdAt).toLocaleDateString("vi-VN")}
                  </span>
                  {isOwnerOrLeader && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      disabled={deleteLinkMutation.isPending}
                      onClick={() => setDeletingLink(link)}
                      className="w-7 h-7 text-muted-foreground hover:text-destructive rounded-lg cursor-pointer"
                    >
                      <Trash2Icon className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {isOwnerOrLeader && (
          <form onSubmit={handleAddLink} className="space-y-2 pt-2 border-t border-border/40">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <Label htmlFor="web-link-url" className="text-[11px] font-medium text-muted-foreground">
                  Đường dẫn liên kết (URL) *
                </Label>
                <Input
                  id="web-link-url"
                  type="url"
                  placeholder="VD: https://figma.com/file/... hoặc https://docs.google.com/..."
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  className="h-8 text-xs rounded-lg mt-1 font-mono"
                  required
                />
              </div>
              <div>
                <Label htmlFor="web-link-title" className="text-[11px] font-medium text-muted-foreground">
                  Tên tài liệu / Thiết kế (tùy chọn)
                </Label>
                <Input
                  id="web-link-title"
                  type="text"
                  placeholder="VD: Đặc tả SRS, Thiết kế Figma..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="h-8 text-xs rounded-lg mt-1"
                />
              </div>
            </div>

            {linkError && (
              <p className="text-[11px] text-destructive flex items-center gap-1 mt-1">
                <AlertCircleIcon className="w-3 h-3" />
                {linkError}
              </p>
            )}

            <div className="flex justify-end pt-1">
              <Button
                type="submit"
                size="sm"
                disabled={addLinkMutation.isPending}
                className="h-7 text-xs rounded-lg gap-1.5 cursor-pointer bg-sky-600 hover:bg-sky-700 text-white"
              >
                {addLinkMutation.isPending ? (
                  <Loader2Icon className="w-3 h-3 animate-spin" />
                ) : (
                  <PlusIcon className="w-3 h-3" />
                )}
                Đính kèm liên kết
              </Button>
            </div>
          </form>
        )}
      </div>

      <div className={`${section === "all" || section === "documents" ? "" : "hidden"} bg-card border border-border/80 rounded-2xl p-4 shadow-xs space-y-4`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileIcon className="w-4 h-4 text-emerald-500" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Tệp tài liệu đính kèm ({files.length})
            </h4>
          </div>
        </div>

        {isFilesLoading ? (
          <div className="flex items-center justify-center py-4 text-muted-foreground text-xs gap-2">
            <Loader2Icon className="w-4 h-4 animate-spin text-primary" />
            <span>Đang tải danh sách tệp đính kèm...</span>
          </div>
        ) : files.length === 0 ? (
          <div className="text-center py-4 text-xs text-muted-foreground bg-muted/20 border border-dashed border-border/70 rounded-xl">
            Chưa có tệp tài liệu hay sản phẩm bàn giao nào được tải lên cho task này.
          </div>
        ) : (
          <div className="space-y-2">
            {files.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-2.5 rounded-xl bg-muted/30 border border-border/50 text-xs"
              >
                <div className="min-w-0 flex-1 mr-3 flex items-center gap-2">
                  <FileIcon className="w-4 h-4 text-muted-foreground shrink-0" />
                  <div className="truncate">
                    <p className="font-semibold text-foreground truncate">
                      {file.filename}
                    </p>
                    <p className="text-[11px] text-muted-foreground font-mono">
                      {formatFileSize(file.sizeBytes)} • {file.mimeType}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <span className="text-[10px] text-muted-foreground font-mono mr-1">
                    {new Date(file.createdAt).toLocaleDateString("vi-VN")}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    disabled={downloadFileMutation.isPending}
                    onClick={() => handleDownloadFile(file.id, file.filename)}
                    className="w-7 h-7 text-muted-foreground hover:text-foreground rounded-lg cursor-pointer"
                  >
                    <DownloadIcon className="w-3.5 h-3.5" />
                  </Button>
                  {isOwnerOrLeader && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      disabled={deleteFileMutation.isPending}
                      onClick={() => setDeletingFile(file)}
                      className="w-7 h-7 text-muted-foreground hover:text-destructive rounded-lg cursor-pointer"
                    >
                      <Trash2Icon className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {isOwnerOrLeader && (
          <form onSubmit={handleUploadFile} className="space-y-2 pt-2 border-t border-border/40">
            <div>
              <Label htmlFor="upload-evidence-file" className="text-[11px] font-medium text-muted-foreground">
                Tải lên tệp tài liệu, sơ đồ thiết kế hoặc báo cáo kiểm thử
              </Label>
              <div className="flex items-center gap-2 mt-1">
                <input
                  ref={fileInputRef}
                  id="upload-evidence-file"
                  type="file"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="text-xs file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-muted file:text-foreground hover:file:bg-muted/80 cursor-pointer"
                />
                <Button
                  type="submit"
                  size="sm"
                  disabled={uploadFileMutation.isPending || !selectedFile}
                  className="h-8 text-xs rounded-lg gap-1.5 cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white ml-auto shrink-0"
                >
                  {uploadFileMutation.isPending ? (
                    <Loader2Icon className="w-3 h-3 animate-spin" />
                  ) : (
                    <UploadCloudIcon className="w-3 h-3" />
                  )}
                  Tải tệp lên
                </Button>
              </div>
            </div>

            {fileError && (
              <p className="text-[11px] text-destructive flex items-center gap-1 mt-1">
                <AlertCircleIcon className="w-3 h-3" />
                {fileError}
              </p>
            )}
          </form>
        )}
      </div>

      <div
        ref={confirmSectionRef}
        className={`${section === "all" || section === "contribution" ? "" : "hidden"} bg-card border border-border/80 rounded-2xl p-4 shadow-xs space-y-4`}
      >
        <div className="flex items-center gap-2">
          <ShieldCheckIcon className="w-4 h-4 text-violet-500" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
            Xác nhận đóng góp (Contribution Confirmation)
          </h4>
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed">
          Gắn kèm Commit SHA hoặc Pull Request để minh chứng công sức hoàn thành task.
        </p>

        {isOwnerOrLeader && (
          <form onSubmit={handleConfirmContribution} className="space-y-3 bg-muted/20 p-3 rounded-xl border border-border/50">
            {projectId && (
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <Label className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                    <GitCommitIcon className="w-3 h-3 text-violet-500" />
                    Commit khớp {taskKey || "task"}
                  </Label>
                  <span className="text-[10px] text-muted-foreground">
                    {matchingTaskCommits.length} commit
                  </span>
                </div>

                {isProjectCommitsLoading ? (
                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground py-2">
                    <Loader2Icon className="w-3.5 h-3.5 animate-spin text-primary" />
                    Đang tải commits đã đồng bộ...
                  </div>
                ) : !normalizedTaskKey ? (
                  <p className="text-[11px] text-muted-foreground rounded-lg border border-dashed border-border/70 p-2.5">
                    Chưa xác định được mã Jira của task để đề xuất commit phù hợp.
                  </p>
                ) : matchingTaskCommits.length === 0 ? (
                  <p className="text-[11px] text-muted-foreground rounded-lg border border-dashed border-border/70 p-2.5">
                    Chưa có commit đã đồng bộ khớp <strong>{taskKey}</strong>. Hãy đồng bộ lại trước; nếu vẫn thiếu, bạn có thể tìm commit khác hoặc bổ sung SHA/PR bên dưới.
                  </p>
                ) : (
                  <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin">
                    {matchingTaskCommits.map(renderSelectableCommit)}
                  </div>
                )}

                <div className="border-t border-border/50 pt-2.5">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsBrowsingOtherCommits((current) => !current)}
                    className="h-7 px-1.5 text-[11px] text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    {isBrowsingOtherCommits
                      ? "Ẩn commit khác"
                      : `Tìm commit khác đã đồng bộ (${otherSyncedCommits.length})`}
                  </Button>

                  {isBrowsingOtherCommits && (
                    <div className="space-y-2 pt-2">
                      <Input
                        type="search"
                        value={otherCommitQuery}
                        onChange={(event) => {
                          setOtherCommitQuery(event.target.value);
                          setVisibleOtherCommitCount(20);
                        }}
                        placeholder="Tìm theo SHA, message, branch hoặc repository..."
                        className="h-8 text-xs rounded-lg"
                      />

                      {filteredOtherCommits.length === 0 ? (
                        <p className="text-[11px] text-muted-foreground rounded-lg border border-dashed border-border/70 p-2.5">
                          Không tìm thấy commit phù hợp.
                        </p>
                      ) : (
                        <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin">
                          {visibleOtherCommits.map(renderSelectableCommit)}
                        </div>
                      )}

                      {visibleOtherCommits.length < filteredOtherCommits.length && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setVisibleOtherCommitCount((count) => count + 20)}
                          className="h-7 text-[11px] rounded-lg cursor-pointer"
                        >
                          Xem thêm {Math.min(20, filteredOtherCommits.length - visibleOtherCommits.length)} commit
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <Label htmlFor="confirm-commit-shas" className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                  <GitCommitIcon className="w-3 h-3 text-violet-500" />
                  Bổ sung Commit SHA thủ công (phân cách bằng dấu phẩy)
                </Label>
                {confirmCommits && (
                  <span className="text-[10px] text-violet-600 dark:text-violet-400 font-mono font-semibold">
                    {confirmCommits.split(",").filter((s) => s.trim().length > 0).length} commit SHA
                  </span>
                )}
              </div>
              <Input
                id="confirm-commit-shas"
                type="text"
                placeholder="VD: a1b2c3d, e4f5g6h..."
                value={confirmCommits}
                onChange={(e) => updateConfirmedShas(e.target.value.split(","))}
                className="h-8 text-xs rounded-lg font-mono"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="confirm-pr-links" className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                <Link2Icon className="w-3 h-3 text-sky-500" />
                Liên kết Pull Requests (phân cách bằng dấu phẩy)
              </Label>
              <Input
                id="confirm-pr-links"
                type="text"
                placeholder="VD: https://github.com/org/repo/pull/1..."
                value={confirmPrs}
                onChange={(e) => setConfirmPrs(e.target.value)}
                className="h-8 text-xs rounded-lg font-mono"
              />
            </div>

            {confirmError && (
              <p className="text-[11px] text-destructive flex items-center gap-1">
                <AlertCircleIcon className="w-3 h-3" />
                {confirmError}
              </p>
            )}

            <div className="flex justify-end pt-1">
              <Button
                type="submit"
                size="sm"
                disabled={confirmContributionMutation.isPending}
                className="h-8 text-xs font-semibold rounded-lg gap-1.5 cursor-pointer bg-violet-600 hover:bg-violet-700 text-white"
              >
                {confirmContributionMutation.isPending ? (
                  <Loader2Icon className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <ShieldCheckIcon className="w-3.5 h-3.5" />
                )}
                Xác nhận đóng góp
              </Button>
            </div>
          </form>
        )}

        {confirmResult && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl space-y-1 text-xs">
            <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
              <CheckCircle2Icon className="w-4 h-4" />
              <span>Đã xác nhận đóng góp thành công</span>
            </div>
            <p className="font-mono text-[11px] text-foreground truncate">
              Mã đối soát (Evidence Hash): {confirmResult.evidenceHash}
            </p>
            <span className="inline-block font-mono text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
              Trạng thái: {confirmResult.state}
            </span>
          </div>
        )}
      </div>

      <ConfirmDeleteDialog
        isOpen={Boolean(deletingLink)}
        onClose={() => setDeletingLink(null)}
        onConfirm={handleConfirmDeleteLink}
        title="Xác nhận xóa liên kết tài liệu"
        itemType="liên kết tài liệu"
        itemName={deletingLink?.title || deletingLink?.url}
        isLoading={deleteLinkMutation.isPending}
      />

      <ConfirmDeleteDialog
        isOpen={Boolean(deletingFile)}
        onClose={() => setDeletingFile(null)}
        onConfirm={handleConfirmDeleteFile}
        title="Xác nhận xóa tệp tài liệu"
        itemType="tệp tài liệu"
        itemName={deletingFile?.filename}
        isLoading={deleteFileMutation.isPending}
      />
    </div>
  );
}
