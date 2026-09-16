"use client";

import {
  XIcon,
  UserIcon,
  CheckSquareIcon,
  GitCommitIcon,
  AlertTriangleIcon,
  LayersIcon,
  FolderGit2Icon,
  CalendarIcon,
  ShieldCheckIcon,
  FingerprintIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { CytoscapeNodeData, CanonicalNodeType } from "../types/graph";
import { parseStudentNodeProfileId } from "../lib/student-profile-id";

interface GraphNodeDetailsModalProps {
  nodeData: CytoscapeNodeData | null;
  onClose: () => void;
  onViewContribution?: (studentId: string) => void;
  onFocusNode?: (nodeId: string) => void;
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
  CRITERION: { label: "Tiêu chí", icon: ShieldCheckIcon, bgClass: "bg-amber-600" },
  IDENTITY: { label: "Danh tính Git", icon: FingerprintIcon, bgClass: "bg-slate-600" },
};

export function GraphNodeDetailsModal({
  nodeData,
  onClose,
  onViewContribution,
  onFocusNode,
}: GraphNodeDetailsModalProps) {
  if (!nodeData) return null;

  const config = TYPE_CONFIG[nodeData.type] || {
    label: nodeData.type,
    icon: LayersIcon,
    bgClass: "bg-primary",
  };
  const IconComponent = config.icon;
  const isStudent = nodeData.type === "STUDENT";

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in-0 duration-200">
      <div className="bg-card border border-border/80 rounded-3xl w-full max-w-lg max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-5 border-b border-border/60 flex items-center justify-between bg-muted/30 shrink-0">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-xs ${config.bgClass}`}
            >
              <IconComponent className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                {config.label}
              </span>
              <h3 className="text-base font-extrabold text-foreground truncate max-w-xs">
                {nodeData.label}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer transition-colors"
          >
            <XIcon className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {isStudent && (
            <div className="flex items-center gap-4 p-3.5 rounded-2xl bg-muted/40 border border-border/60">
              <Avatar className="h-12 w-12 border border-border">
                {nodeData.avatar && <AvatarImage src={nodeData.avatar} alt={nodeData.label} />}
                <AvatarFallback>{nodeData.label.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold truncate">{nodeData.label}</h4>
                {nodeData.subLabel && (
                  <p className="text-xs text-muted-foreground font-mono truncate">{nodeData.subLabel}</p>
                )}
                {nodeData.role && (
                  <Badge variant="outline" className="text-[10px] mt-1">
                    {nodeData.role}
                  </Badge>
                )}
              </div>
            </div>
          )}

          {!isStudent && nodeData.subLabel && (
            <div className="p-3 rounded-xl bg-muted/30 border border-border/50 text-xs text-muted-foreground">
              <span className="font-semibold text-foreground block mb-0.5">Mô tả / Chi tiết:</span>
              <p className="font-mono text-foreground break-all">{nodeData.subLabel}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2.5 text-xs">
            <div className="p-3 rounded-xl bg-muted/30 border border-border/50">
              <span className="text-[10px] text-muted-foreground uppercase font-bold block mb-1">
                Node ID
              </span>
              <span className="font-mono font-bold text-foreground text-[11px] break-all">
                {nodeData.id}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-muted/30 border border-border/50">
              <span className="text-[10px] text-muted-foreground uppercase font-bold block mb-1">
                Phân loại
              </span>
              <span className="font-mono font-bold text-primary">{nodeData.type}</span>
            </div>

            {nodeData.status && (
              <div className="p-3 rounded-xl bg-muted/30 border border-border/50">
                <span className="text-[10px] text-muted-foreground uppercase font-bold block mb-1">
                  Trạng thái
                </span>
                <Badge variant="secondary" className="font-mono text-[11px]">
                  {nodeData.status}
                </Badge>
              </div>
            )}

            {nodeData.weightType && (
              <div className="p-3 rounded-xl bg-muted/30 border border-border/50">
                <span className="text-[10px] text-muted-foreground uppercase font-bold block mb-1">
                  Loại trọng số
                </span>
                <span className="font-mono font-bold text-foreground">{nodeData.weightType}</span>
              </div>
            )}

            {typeof nodeData.storyPoint === "number" && (
              <div className="p-3 rounded-xl bg-muted/30 border border-border/50">
                <span className="text-[10px] text-muted-foreground uppercase font-bold block mb-1">
                  Story Points
                </span>
                <span className="font-mono font-extrabold text-foreground text-sm">
                  {nodeData.storyPoint}
                </span>
              </div>
            )}
          </div>

          {nodeData.isAnomaly === true && (
            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-700 dark:text-red-400 text-xs space-y-1 animate-pulse">
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
            {nodeData.type === "TASK" && onFocusNode && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onFocusNode(nodeData.id);
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
    </div>
  );
}
