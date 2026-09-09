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

interface TaskEvidencePanelProps {
  taskId: string;
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

export function TaskEvidencePanel({
  taskId,
  isOwnerOrLeader = true,
  externalCommitShas,
  onConfirmCommitsChange,
}: TaskEvidencePanelProps) {
  const confirmSectionRef = useRef<HTMLDivElement>(null);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isSessionRunning, setIsSessionRunning] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [sessionMessage, setSessionMessage] = useState<string | null>(null);

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

  const [deletingLink, setDeletingLink] = useState<TaskWebLinkItem | null>(null);
  const [deletingFile, setDeletingFile] = useState<TaskFileItem | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isSessionRunning) {
      interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isSessionRunning]);

  const { data: links = [], isLoading: isLinksLoading } = useTaskWebLinks(taskId);
  const { data: files = [], isLoading: isFilesLoading } = useTaskFiles(taskId);

  const startSessionMutation = useStartWorkSession(taskId);
  const stopSessionMutation = useStopWorkSession(taskId);
  const addLinkMutation = useAddTaskWebLink(taskId);
  const deleteLinkMutation = useDeleteTaskWebLink(taskId);
  const uploadFileMutation = useUploadTaskFile(taskId);
  const downloadFileMutation = useDownloadTaskFile(taskId);
  const deleteFileMutation = useDeleteTaskFile(taskId);
  const confirmContributionMutation = useConfirmContribution(taskId);

  const handleStartSession = async () => {
    setSessionMessage(null);
    try {
      const res = await startSessionMutation.mutateAsync();
      setActiveSessionId(res.id);
      setIsSessionRunning(true);
      setElapsedSeconds(0);
      setSessionMessage("Đã bắt đầu bấm giờ phiên làm việc");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Không thể bắt đầu phiên làm việc";
      setSessionMessage(msg);
    }
  };

  const handleStopSession = async () => {
    if (!activeSessionId) return;
    try {
      await stopSessionMutation.mutateAsync(activeSessionId);
      setIsSessionRunning(false);
      setSessionMessage("Đã lưu lại thời lượng phiên làm việc thành công");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Không thể dừng phiên làm việc";
      setSessionMessage(msg);
    }
  };

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

  const isSessionLoading =
    startSessionMutation.isPending || stopSessionMutation.isPending;

  return (
    <div className="space-y-6 pt-4 border-t border-border/70">
      <div className="bg-card border border-border/80 rounded-2xl p-4 shadow-xs">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <TimerIcon className="w-4 h-4 text-primary" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Bấm giờ làm việc (Work Sessions)
            </h4>
          </div>
          <span
            className={`text-xs px-2.5 py-0.5 rounded-full font-medium border ${isSessionRunning
              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
              : "bg-muted text-muted-foreground border-border"
              }`}
          >
            {isSessionRunning ? "Đang bấm giờ" : "Chưa kích hoạt"}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-muted/30 rounded-xl p-3 border border-border/40">
          <div className="flex items-center gap-3">
            <div className="text-2xl font-mono font-bold tracking-widest text-foreground">
              {formatSeconds(elapsedSeconds)}
            </div>
            {activeSessionId && (
              <span className="text-[11px] font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded-md truncate max-w-[140px]">
                ID: {activeSessionId}
              </span>
            )}
          </div>

          {isOwnerOrLeader && (
            <div className="flex items-center gap-2 w-full sm:w-auto">
              {!isSessionRunning ? (
                <Button
                  type="button"
                  size="sm"
                  disabled={isSessionLoading}
                  onClick={handleStartSession}
                  className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl gap-1.5 text-xs font-semibold cursor-pointer"
                >
                  {isSessionLoading ? (
                    <Loader2Icon className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <PlayIcon className="w-3.5 h-3.5" />
                  )}
                  Bắt đầu làm việc
                </Button>
              ) : (
                <Button
                  type="button"
                  size="sm"
                  disabled={isSessionLoading}
                  onClick={handleStopSession}
                  className="w-full sm:w-auto bg-rose-600 hover:bg-rose-700 text-white rounded-xl gap-1.5 text-xs font-semibold cursor-pointer"
                >
                  {isSessionLoading ? (
                    <Loader2Icon className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <SquareIcon className="w-3.5 h-3.5" />
                  )}
                  Dừng phiên làm việc
                </Button>
              )}
            </div>
          )}
        </div>

        {sessionMessage && (
          <div className="mt-2 text-xs flex items-center gap-1.5 text-muted-foreground">
            <CheckCircle2Icon className="w-3.5 h-3.5 text-emerald-500" />
            <span>{sessionMessage}</span>
          </div>
        )}
      </div>

      <div className="bg-card border border-border/80 rounded-2xl p-4 shadow-xs space-y-4">
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

      <div className="bg-card border border-border/80 rounded-2xl p-4 shadow-xs space-y-4">
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

      <div ref={confirmSectionRef} className="bg-card border border-border/80 rounded-2xl p-4 shadow-xs space-y-4">
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
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <Label htmlFor="confirm-commit-shas" className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                  <GitCommitIcon className="w-3 h-3 text-violet-500" />
                  Mã Commit SHA (phân cách bằng dấu phẩy)
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
                onChange={(e) => {
                  setInternalCommits(e.target.value);
                  onConfirmCommitsChange?.(e.target.value);
                }}
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
