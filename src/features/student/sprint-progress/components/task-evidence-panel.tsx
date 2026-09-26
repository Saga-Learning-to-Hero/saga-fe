"use client";

import { showWarningToast, showSuccessToast } from "@/lib/api-error";
import { useState, useRef } from "react";
import {
  Link2Icon,
  FileIcon,
  ExternalLinkIcon,
  PlusIcon,
  Loader2Icon,
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
import { Badge } from "@/components/ui/badge";
import { ConfirmActionDialog } from "@/components/common/confirm-action-dialog";
import { cn } from "@/lib/utils";
import {
  useTaskWebLinks,
  useTaskFiles,
  useAddTaskWebLink,
  useDeleteTaskWebLink,
  useUploadTaskFile,
  useDownloadTaskFile,
  useDeleteTaskFile,
  useConfirmContribution,
} from "../hooks/use-task-evidence";
import { isStepUpRequiredError } from "@/lib/api-error";
import { StepUpAuthDialog } from "@/features/auth/components/step-up-auth-dialog";
import type {
  TaskWebLinkItem,
  TaskFileItem,
  CreateContributionConfirmationPayload,
} from "../types/task-evidence";

type TaskEvidenceSection = "all" | "documents" | "contribution";

interface TaskEvidencePanelProps {
  taskId: string;
  section?: TaskEvidenceSection;
  isOwnerOrLeader?: boolean;
  externalCommitShas?: string;
  onRequestCommitSelection?: () => void;
  onConfirmationSuccess?: () => void;
}

function formatFileSize(bytes: number): string {
  if (!bytes || bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function TaskEvidencePanel({
  taskId,
  section = "all",
  isOwnerOrLeader = true,
  externalCommitShas = "",
  onRequestCommitSelection,
  onConfirmationSuccess,
}: TaskEvidencePanelProps) {
  const [newUrl, setNewUrl] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [linkError, setLinkError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const [manualCommitShas, setManualCommitShas] = useState("");
  const [confirmPrs, setConfirmPrs] = useState("");
  const [confirmResult, setConfirmResult] = useState<{
    id: string;
    evidenceHash: string;
    state: string;
    commitShas?: string[];
    pullRequests?: string[];
  } | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [isStepUpModalOpen, setIsStepUpModalOpen] = useState(false);
  const [pendingContributionPayload, setPendingContributionPayload] =
    useState<CreateContributionConfirmationPayload | null>(null);

  const [deletingLink, setDeletingLink] = useState<TaskWebLinkItem | null>(null);
  const [deletingFile, setDeletingFile] = useState<TaskFileItem | null>(null);

  const { data: links = [], isLoading: isLinksLoading } = useTaskWebLinks(taskId);
  const { data: files = [], isLoading: isFilesLoading } = useTaskFiles(taskId);

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

  const selectedCommitShas = Array.from(
    new Set(
      externalCommitShas
        .split(",")
        .map((sha) => sha.trim())
        .filter(Boolean)
    )
  );
  const enteredCommitShas = manualCommitShas
    .split(",")
    .map((sha) => sha.trim())
    .filter(Boolean);
  const confirmationCommitShas = Array.from(
    new Set([...selectedCommitShas, ...enteredCommitShas])
  );
  const confirmationPullRequests = confirmPrs
    .split(",")
    .map((pullRequest) => pullRequest.trim())
    .filter(Boolean);
  const hasConfirmationEvidence =
    confirmationCommitShas.length > 0 || confirmationPullRequests.length > 0;

  const handleStepUpSuccess = async () => {
    if (!pendingContributionPayload) return;
    try {
      const res = await confirmContributionMutation.mutateAsync(pendingContributionPayload);
      setConfirmResult({
        ...res,
        commitShas: pendingContributionPayload.commitShas,
        pullRequests: pendingContributionPayload.pullRequests,
      });
      setManualCommitShas("");
      setConfirmPrs("");
      onConfirmationSuccess?.();
      setPendingContributionPayload(null);
      showSuccessToast("Xác thực nâng cao và xác nhận đóng góp thành công!");
    } catch (err: unknown) {
      const msg = isStepUpRequiredError(err)
        ? "Máy chủ vẫn yêu cầu xác thực lại. Yêu cầu đã được dừng để tránh gửi lặp."
        : err instanceof Error
          ? err.message
          : "Xác nhận đóng góp thất bại";
      setConfirmError(msg);
      throw new Error(msg);
    }
  };

  const handleConfirmContribution = async (e: React.FormEvent) => {
    e.preventDefault();
    setConfirmError(null);
    setConfirmResult(null);

    const payload: CreateContributionConfirmationPayload = {
      commitShas: confirmationCommitShas,
      pullRequests: confirmationPullRequests,
    };

    try {
      const res = await confirmContributionMutation.mutateAsync(payload);
      setConfirmResult({
        ...res,
        commitShas: payload.commitShas,
        pullRequests: payload.pullRequests,
      });
      setManualCommitShas("");
      setConfirmPrs("");
      onConfirmationSuccess?.();
      showSuccessToast("Xác nhận đóng góp thành công!");
    } catch (err: unknown) {
      if (isStepUpRequiredError(err)) {
        setPendingContributionPayload(payload);
        setConfirmError("Phiên xác thực bảo mật đã hết hạn. Vui lòng nhập lại mật khẩu để tiếp tục.");
        showWarningToast("Cần xác thực lại mật khẩu trước khi xác nhận đóng góp.");
        setIsStepUpModalOpen(true);
        return;
      }
      const msg = err instanceof Error ? err.message : "Xác nhận đóng góp thất bại";
      setConfirmError(msg);
    }
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
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[9px] font-mono font-bold px-1.5 py-0",
                      link.source === "JIRA"
                        ? "bg-blue-500/10 text-blue-600 border-blue-500/30"
                        : "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                    )}
                  >
                    {link.source || "SAGA"}
                  </Badge>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    {new Date(link.createdAt).toLocaleDateString("vi-VN")}
                  </span>
                  {isOwnerOrLeader && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      disabled={deleteLinkMutation.isPending || link.source === "JIRA"}
                      title={link.source === "JIRA" ? "Minh chứng đồng bộ từ Jira không thể xóa trực tiếp" : "Xóa liên kết"}
                      onClick={() => setDeletingLink(link)}
                      className="w-7 h-7 text-muted-foreground hover:text-destructive rounded-lg cursor-pointer disabled:opacity-40"
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
                <div className="flex items-center gap-1.5 shrink-0">
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[9px] font-mono font-bold px-1.5 py-0 mr-0.5",
                      file.source === "JIRA"
                        ? "bg-blue-500/10 text-blue-600 border-blue-500/30"
                        : "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                    )}
                  >
                    {file.source || "SAGA"}
                  </Badge>
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
                      disabled={deleteFileMutation.isPending || file.source === "JIRA"}
                      title={file.source === "JIRA" ? "Tệp minh chứng đồng bộ từ Jira không thể xóa trực tiếp" : "Xóa tệp"}
                      onClick={() => setDeletingFile(file)}
                      className="w-7 h-7 text-muted-foreground hover:text-destructive rounded-lg cursor-pointer disabled:opacity-40"
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
            <div className="space-y-2.5 rounded-xl border border-violet-500/20 bg-violet-500/[0.04] p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-0.5">
                  <p className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                    <GitCommitIcon className="size-3.5 text-violet-500" />
                    Commit đã chọn từ tab Commits
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Đây mới là lựa chọn tạm. Dữ liệu chỉ được gửi khi bạn bấm Xác nhận đóng góp.
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className="shrink-0 border-violet-500/25 bg-background font-mono text-[10px] text-violet-700 dark:text-violet-300"
                >
                  {selectedCommitShas.length} commit
                </Badge>
              </div>

              {selectedCommitShas.length === 0 ? (
                <div className="flex flex-col gap-2 rounded-lg border border-dashed border-border/70 bg-background/70 p-2.5 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-[11px] text-muted-foreground">
                    Chưa chọn commit nào. Bạn có thể chọn ở tab Commits hoặc nhập SHA thủ công bên dưới.
                  </p>
                  {onRequestCommitSelection && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={onRequestCommitSelection}
                      className="h-7 shrink-0 rounded-lg px-2.5 text-[11px]"
                    >
                      Chọn commit
                    </Button>
                  )}
                </div>
              ) : (
                <div className="flex items-end justify-between gap-3">
                  <div className="flex min-w-0 flex-wrap gap-1.5">
                    {selectedCommitShas.map((sha) => (
                      <Badge
                        key={sha}
                        variant="outline"
                        title={sha}
                        className="border-violet-500/25 bg-background font-mono text-[10px] text-violet-700 dark:text-violet-300"
                      >
                        {sha.slice(0, 7)}
                      </Badge>
                    ))}
                  </div>
                  {onRequestCommitSelection && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={onRequestCommitSelection}
                      className="h-7 shrink-0 px-2 text-[11px] text-violet-700 dark:text-violet-300"
                    >
                      Thay đổi lựa chọn
                    </Button>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <Label htmlFor="confirm-commit-shas" className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                  <GitCommitIcon className="w-3 h-3 text-violet-500" />
                  Bổ sung Commit SHA thủ công (phân cách bằng dấu phẩy)
                </Label>
                {enteredCommitShas.length > 0 && (
                  <span className="text-[10px] text-violet-600 dark:text-violet-400 font-mono font-semibold">
                    {enteredCommitShas.length} commit SHA
                  </span>
                )}
              </div>
              <Input
                id="confirm-commit-shas"
                type="text"
                placeholder="VD: a1b2c3d, e4f5g6h..."
                value={manualCommitShas}
                onChange={(e) => setManualCommitShas(e.target.value)}
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
                disabled={confirmContributionMutation.isPending || !hasConfirmationEvidence}
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
          <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
                <CheckCircle2Icon className="w-4 h-4" />
                <span>Đã xác nhận đóng góp thành công</span>
              </div>
              <Badge className="bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-mono text-[10px] border-emerald-500/30">
                {confirmResult.state || "CONFIRMED"}
              </Badge>
            </div>

            <div className="p-2.5 rounded-xl bg-background/80 border border-emerald-500/20 space-y-1.5 font-mono text-[11px]">
              <div className="flex items-center justify-between gap-2">
                <span className="text-muted-foreground text-[10px] uppercase font-bold">Mã đối soát (Evidence Hash):</span>
                <button
                  type="button"
                  onClick={() => {
                    void navigator.clipboard.writeText(confirmResult.evidenceHash);
                    showSuccessToast("Đã sao chép mã đối soát!");
                  }}
                  className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 font-mono text-[10px] underline cursor-pointer"
                >
                  Sao chép
                </button>
              </div>
              <p className="text-foreground break-all select-all font-semibold">
                {confirmResult.evidenceHash}
              </p>
            </div>

            {confirmResult.commitShas && confirmResult.commitShas.length > 0 && (
              <div className="space-y-1">
                <span className="text-[10px] text-muted-foreground uppercase font-bold block">
                  Commit đã xác nhận ({confirmResult.commitShas.length}):
                </span>
                <div className="flex flex-wrap gap-1">
                  {confirmResult.commitShas.map((sha) => (
                    <Badge
                      key={sha}
                      variant="outline"
                      className="font-mono text-[10px] bg-background border-emerald-500/30 text-emerald-700 dark:text-emerald-300"
                    >
                      {sha.slice(0, 7)}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {confirmResult.pullRequests && confirmResult.pullRequests.length > 0 && (
              <div className="space-y-1">
                <span className="text-[10px] text-muted-foreground uppercase font-bold block">
                  Pull Requests ({confirmResult.pullRequests.length}):
                </span>
                <div className="flex flex-wrap gap-1">
                  {confirmResult.pullRequests.map((pr, idx) => (
                    <a
                      key={idx}
                      href={pr}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 font-mono text-[10px] text-sky-600 dark:text-sky-400 hover:underline bg-background px-2 py-0.5 rounded border border-border"
                    >
                      <span>{pr}</span>
                      <ExternalLinkIcon className="w-2.5 h-2.5" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <ConfirmActionDialog
        isOpen={Boolean(deletingLink)}
        onClose={() => setDeletingLink(null)}
        onConfirm={handleConfirmDeleteLink}
        title="Xác nhận xóa liên kết tài liệu"
        itemType="liên kết tài liệu"
        itemName={deletingLink?.title || deletingLink?.url}
        isLoading={deleteLinkMutation.isPending}
      />

      <ConfirmActionDialog
        isOpen={Boolean(deletingFile)}
        onClose={() => setDeletingFile(null)}
        onConfirm={handleConfirmDeleteFile}
        title="Xác nhận xóa tệp tài liệu"
        itemType="tệp tài liệu"
        itemName={deletingFile?.filename}
        isLoading={deleteFileMutation.isPending}
      />

      <StepUpAuthDialog
        isOpen={isStepUpModalOpen}
        onClose={() => {
          setIsStepUpModalOpen(false);
          setPendingContributionPayload(null);
        }}
        onSuccess={handleStepUpSuccess}
        title="Cần xác thực lại để tiếp tục"
        description="Máy chủ đã từ chối yêu cầu xác nhận đóng góp vì phiên xác thực bảo mật đã hết hạn. Nhập mật khẩu hiện tại của tài khoản SAGA để xác minh, sau đó hệ thống sẽ gửi lại yêu cầu đúng một lần."
        notice="Yêu cầu xác nhận vừa rồi chưa thành công (403 STEP_UP_REQUIRED). Chưa có bằng chứng nào được ghi nhận lên máy chủ."
      />
    </div>
  );
}
