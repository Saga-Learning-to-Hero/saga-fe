"use client";

import {
  XIcon,
  UserIcon,
  CheckSquareIcon,
  GitCommitIcon,
  FileIcon,
  DownloadIcon,
  Loader2Icon,
  LinkIcon,
  AlertTriangleIcon,
  LayersIcon,
  FolderGit2Icon,
  CalendarIcon,
  ShieldCheckIcon,
  FingerprintIcon,
} from "lucide-react";
import { useEffect, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";

const emptySubscribe = () => () => { };
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { CytoscapeNodeData, CanonicalNodeType } from "../types/graph";
import { parseStudentNodeProfileId } from "../lib/student-profile-id";
import type { GraphFileDownloadContext } from "../lib/graph-file-download";
import { CommitDetailModal } from "@/features/student/commits/components/commit-detail-modal";
import { useDownloadTaskFile } from "@/features/student/sprint-progress/hooks/use-task-evidence";
import { showErrorToast } from "@/lib/api-error";

interface GraphNodeDetailsModalProps {
  nodeData: CytoscapeNodeData | null;
  onClose: () => void;
  onViewContribution?: (studentId: string) => void;
  onFocusNode?: (nodeId: string, nodeLabel?: string) => void;
  focusedNodeId?: string | null;
  projectId?: string | null;
  fileDownloadContext?: GraphFileDownloadContext | null;
}

const TYPE_CONFIG: Record<
  CanonicalNodeType,
  {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    bgClass: string;
  }
> = {
  STUDENT: { label: "Sinh viên", icon: UserIcon, bgClass: "bg-blue-600" },
  TEAM: { label: "Nhóm dự án", icon: LayersIcon, bgClass: "bg-indigo-600" },
  PROJECT: { label: "Dự án", icon: FolderGit2Icon, bgClass: "bg-cyan-600" },
  SPRINT: { label: "Sprint", icon: CalendarIcon, bgClass: "bg-teal-600" },
  TASK: { label: "Task Jira", icon: CheckSquareIcon, bgClass: "bg-emerald-600" },
  COMMIT: { label: "Git Commit", icon: GitCommitIcon, bgClass: "bg-purple-600" },
  FILE: { label: "Tệp", icon: FileIcon, bgClass: "bg-blue-700" },
  WEB_LINK: { label: "Liên kết", icon: LinkIcon, bgClass: "bg-violet-700" },
  CRITERION: { label: "Tiêu chí", icon: ShieldCheckIcon, bgClass: "bg-amber-600" },
  IDENTITY: { label: "Danh tính Git", icon: FingerprintIcon, bgClass: "bg-slate-600" },
};

const COMMIT_NODE_PREFIX = "commit:";

export function resolveGitCommitId(nodeId: string): string {
  return nodeId.startsWith(COMMIT_NODE_PREFIX) ? nodeId.slice(COMMIT_NODE_PREFIX.length) : nodeId;
}

export function GraphNodeDetailsModal({
  nodeData,
  onClose,
  onViewContribution,
  onFocusNode,
  focusedNodeId,
  projectId,
  fileDownloadContext = null,
}: GraphNodeDetailsModalProps) {
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
  const isCommitNode = nodeData?.type === "COMMIT";
  const isFileNode = nodeData?.type === "FILE";
  const downloadMutation = useDownloadTaskFile(fileDownloadContext?.taskId ?? "");

  const handleDownloadFile = () => {
    if (!fileDownloadContext || downloadMutation.isPending) return;
    downloadMutation.mutate(
      { fileId: fileDownloadContext.fileId, filename: fileDownloadContext.filename },
      {
        onError: (error) => {
          showErrorToast("Không thể tải tệp. Vui lòng thử lại.", error);
        },
      }
    );
  };

  useEffect(() => {
    if (!nodeData || isCommitNode) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nodeData, isCommitNode, onClose]);

  if (!nodeData) return null;

  if (isCommitNode) {
    const commitMessage = nodeData.subLabel || nodeData.label;
    return (
      <CommitDetailModal
        isOpen={true}
        onClose={onClose}
        projectId={projectId}
        gitCommitId={resolveGitCommitId(nodeData.id)}
        fallbackShortHash={nodeData.label}
        fallbackMessage={commitMessage}
        fallbackCommit={{
          commitHash: nodeData.label,
          commitMessage,
          authorName: "",
          committedDate: "",
        }}
      />
    );
  }

  if (!mounted || typeof document === "undefined") return null;

  const config = TYPE_CONFIG[nodeData.type] || {
    label: nodeData.type,
    icon: LayersIcon,
    bgClass: "bg-primary",
  };
  const IconComponent = config.icon;
  const isStudent = nodeData.type === "STUDENT";
  const avatarUrl = nodeData.avatar?.trim() || undefined;
  const showTaskFocusButton =
    nodeData.type === "TASK" && Boolean(onFocusNode) && focusedNodeId !== nodeData.id;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in-0 duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="bg-card border border-border/80 rounded-xl w-full max-w-lg max-h-[92vh] flex flex-col shadow-lg overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b border-border/60 flex items-center justify-between bg-muted/30 shrink-0">
          <div className="flex items-center gap-3">
            {isStudent && avatarUrl ? (
              <Avatar className="size-10 rounded-xl border border-border/60">
                <AvatarImage src={avatarUrl} alt={nodeData.label} />
                <AvatarFallback>{nodeData.label.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
            ) : (
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-xs ${config.bgClass}`}
              >
                <IconComponent className="w-5 h-5" />
              </div>
            )}
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {config.label}
              </span>
              <h3 className="text-base font-extrabold text-foreground truncate max-w-xs">
                {nodeData.label}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer transition-colors"
          >
            <XIcon className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {isStudent && (
            <div className="flex items-center gap-4 p-3.5 rounded-xl bg-muted/40 border border-border/60">
              <Avatar className="h-12 w-12 border border-border">
                {avatarUrl && <AvatarImage src={avatarUrl} alt={nodeData.label} />}
                <AvatarFallback>{nodeData.label.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold truncate">{nodeData.label}</h4>
                {nodeData.subLabel && (
                  <p className="text-xs text-muted-foreground font-mono truncate">{nodeData.subLabel}</p>
                )}
                {nodeData.role && (
                  <Badge variant="outline" className="text-xs mt-1">
                    {nodeData.role}
                  </Badge>
                )}
              </div>
            </div>
          )}

          {!isStudent && nodeData.subLabel && (
            <div className="p-3 rounded-xl bg-muted/30 border border-border/50 text-xs text-muted-foreground">
              <span className="font-semibold text-foreground block mb-0.5">
                {nodeData.type === "FILE"
                  ? "Tên tệp / loại nội dung:"
                  : nodeData.type === "WEB_LINK"
                    ? "Đường dẫn:"
                    : "Mô tả / Chi tiết:"}
              </span>
              {nodeData.type === "WEB_LINK" && /^https?:\/\//i.test(nodeData.subLabel) ? (
                <a
                  href={nodeData.subLabel}
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono text-primary break-all underline"
                >
                  {nodeData.subLabel}
                </a>
              ) : (
                <p className="font-mono text-foreground break-all">{nodeData.subLabel}</p>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-2.5 text-xs">
            <div className="p-3 rounded-xl bg-muted/30 border border-border/50">
              <span className="text-xs text-muted-foreground uppercase font-bold block mb-1">
                Phân loại
              </span>
              <span className="font-mono font-bold text-primary">{nodeData.type}</span>
            </div>

            {nodeData.status && (
              <div className="p-3 rounded-xl bg-muted/30 border border-border/50">
                <span className="text-xs text-muted-foreground uppercase font-bold block mb-1">
                  Trạng thái
                </span>
                <Badge variant="secondary" className="font-mono text-xs">
                  {nodeData.status}
                </Badge>
              </div>
            )}

            {nodeData.weightType && (
              <div className="p-3 rounded-xl bg-muted/30 border border-border/50">
                <span className="text-xs text-muted-foreground uppercase font-bold block mb-1">
                  Loại trọng số
                </span>
                <span className="font-mono font-bold text-foreground">{nodeData.weightType}</span>
              </div>
            )}

            {typeof nodeData.storyPoint === "number" && (
              <div className="p-3 rounded-xl bg-muted/30 border border-border/50">
                <span className="text-xs text-muted-foreground uppercase font-bold block mb-1">
                  Story Points
                </span>
                <span className="font-mono font-extrabold text-foreground text-sm">
                  {nodeData.storyPoint}
                </span>
              </div>
            )}

            {nodeData.type === "TASK" && nodeData.issueTypeLevel && (
              <div className="p-3 rounded-xl bg-muted/30 border border-border/50">
                <span className="text-xs text-muted-foreground uppercase font-bold block mb-1">
                  Cấp loại thẻ
                </span>
                <span className="font-mono font-bold text-foreground">
                  {nodeData.issueTypeName || nodeData.issueType || "—"} · {nodeData.issueTypeLevel}
                </span>
              </div>
            )}

            {nodeData.type === "TASK" && nodeData.parentExternalKey && (
              <div className="p-3 rounded-xl bg-muted/30 border border-border/50">
                <span className="text-xs text-muted-foreground uppercase font-bold block mb-1">
                  Task cha
                </span>
                <span className="font-mono font-bold text-foreground">{nodeData.parentExternalKey}</span>
              </div>
            )}
          </div>

          {nodeData.type === "TASK" && nodeData.parentResolution === "UNRESOLVED" && (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs space-y-1">
              <div className="flex items-center gap-2 font-bold text-sm">
                <AlertTriangleIcon className="w-4 h-4 shrink-0" />
                <span>Task cha chưa đồng bộ</span>
              </div>
              <p>
                {nodeData.parentExternalKey
                  ? `Jira có parent ${nodeData.parentExternalKey} nhưng SAGA chưa gắn được task cha.`
                  : "Jira có parent nhưng SAGA chưa đồng bộ được task cha."}
                {nodeData.parentResolutionReason === "PARENT_SOURCE_REVOKED"
                  ? " Nguồn Jira của parent đã bị thu hồi."
                  : ""}
              </p>
            </div>
          )}

          {nodeData.isAnomaly === true && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-700 dark:text-red-400 text-xs space-y-1 animate-pulse">
              <div className="flex items-center gap-2 font-bold text-sm text-red-600 dark:text-red-300">
                <AlertTriangleIcon className="w-4 h-4 shrink-0" />
                <span>Cảnh báo bất thường (Graph Anomaly)</span>
              </div>
              <p>
                Phần tử này được hệ thống phân tích phát hiện có dấu hiệu bất thường về cấu trúc liên kết
                hoặc tính nhất quán dữ liệu truy xuất.
              </p>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-border/60 flex items-center justify-between bg-muted/20 shrink-0">
          <div className="flex items-center gap-2">
            {isStudent && onViewContribution && parseStudentNodeProfileId(nodeData) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onViewContribution(nodeData.id);
                  onClose();
                }}
                className="h-9 text-xs rounded-xl cursor-pointer"
              >
                Xem chi tiết đóng góp
              </Button>
            )}
            {isFileNode && (
              <div className="flex flex-col items-start gap-1">
                {!fileDownloadContext && (
                  <p className="text-xs text-muted-foreground">
                    Không xác định được công việc liên kết với tệp này.
                  </p>
                )}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={!fileDownloadContext || downloadMutation.isPending}
                  onClick={handleDownloadFile}
                  className="h-9 gap-1.5 text-xs rounded-xl cursor-pointer"
                >
                  {downloadMutation.isPending ? (
                    <>
                      <Loader2Icon className="size-3.5 animate-spin" />
                      Đang tải...
                    </>
                  ) : (
                    <>
                      <DownloadIcon className="size-3.5" />
                      Tải file
                    </>
                  )}
                </Button>
              </div>
            )}
            {showTaskFocusButton && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const taskLabel =
                    nodeData.subLabel && nodeData.subLabel !== nodeData.label
                      ? `${nodeData.label} - ${nodeData.subLabel}`
                      : nodeData.label;
                  onFocusNode?.(nodeData.id, taskLabel);
                  onClose();
                }}
                className="h-9 text-xs rounded-xl cursor-pointer text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10"
              >
                Tập trung Task & Xem Commit đối chiếu
              </Button>
            )}
          </div>
          <Button onClick={onClose} size="sm" className="h-9 text-xs rounded-xl px-5 cursor-pointer">
            Đóng
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}
