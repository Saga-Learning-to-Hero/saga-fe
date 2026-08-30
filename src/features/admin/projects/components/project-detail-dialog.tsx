"use client";

import {
  FolderKanbanIcon,
  ExternalLinkIcon,
  GitBranchIcon,
  CheckCircle2Icon,
  AlertCircleIcon,
  XCircleIcon,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { ManagedProject } from "../types/project-management";

interface ProjectDetailDialogProps {
  project: ManagedProject | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ProjectDetailDialog({
  project,
  isOpen,
  onClose,
}: ProjectDetailDialogProps) {
  if (!project) return null;

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .slice(-2)
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const formatDate = (iso?: string) => {
    if (!iso) return "Chưa có";
    try {
      const d = new Date(iso);
      return d.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return iso;
    }
  };

  const renderStatusBadge = (status: "CONNECTED" | "DISCONNECTED" | "WARNING") => {
    switch (status) {
      case "CONNECTED":
        return (
          <Badge className="bg-success-muted text-success border-0 text-[11px] gap-1">
            <CheckCircle2Icon className="w-3 h-3" />
            Đã kết nối Webhook
          </Badge>
        );
      case "WARNING":
        return (
          <Badge className="bg-warning-muted text-warning border-0 text-[11px] gap-1">
            <AlertCircleIcon className="w-3 h-3" />
            Mất tín hiệu Webhook
          </Badge>
        );
      case "DISCONNECTED":
        return (
          <Badge className="bg-danger-muted text-danger border-0 text-[11px] gap-1">
            <XCircleIcon className="w-3 h-3" />
            Chưa liên kết
          </Badge>
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl p-6 rounded-2xl max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <DialogHeader className="flex flex-row items-center gap-3 space-y-0 text-left">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <FolderKanbanIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <DialogTitle className="text-base font-bold text-foreground">
                {project.groupName}
              </DialogTitle>
              <Badge className="bg-primary/10 text-primary border-0 text-xs">
                {project.semester}
              </Badge>
            </div>
            <DialogDescription className="text-xs text-muted-foreground mt-0.5">
              {project.topicName} ({project.topicCode})
            </DialogDescription>
          </div>
        </DialogHeader>

        {/* Thông tin Cố vấn & Trưởng nhóm */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {/* Giảng viên */}
          <div className="bg-muted/40 border border-border p-3 rounded-xl space-y-1.5">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Giảng viên hướng dẫn
            </p>
            <div className="flex items-center gap-2.5">
              <Avatar className="w-8 h-8 rounded-lg">
                <AvatarImage src={project.mentor.avatar} alt={project.mentor.fullName} />
                <AvatarFallback className="text-[10px] font-bold bg-primary text-primary-foreground">
                  {getInitials(project.mentor.fullName)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-foreground truncate">
                  {project.mentor.fullName}
                </p>
                <p className="text-[11px] text-muted-foreground truncate">
                  {project.mentor.email}
                </p>
              </div>
            </div>
          </div>

          {/* Trưởng nhóm */}
          <div className="bg-muted/40 border border-border p-3 rounded-xl space-y-1.5">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Trưởng nhóm (Leader)
            </p>
            <div className="flex items-center gap-2.5">
              <Avatar className="w-8 h-8 rounded-lg">
                <AvatarFallback className="text-[10px] font-bold bg-info-muted text-info">
                  {getInitials(project.leader.fullName)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-semibold text-foreground truncate">
                    {project.leader.fullName}
                  </p>
                  <span className="font-mono text-[10px] px-1 rounded bg-muted text-foreground">
                    {project.leader.studentCode}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground truncate">
                  {project.leader.email}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Trạng thái Tích hợp Jira & GitHub */}
        <div className="space-y-2 pt-2">
          <p className="text-xs font-bold text-foreground">Trạng thái tích hợp ngoài (Integrations)</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Jira */}
            <div className="bg-background border border-border p-3.5 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  Jira Software
                </span>
                {renderStatusBadge(project.jira.status)}
              </div>
              <div className="text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Project Key:</span>
                  <span className="font-mono font-bold text-primary">{project.jira.projectKey}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tổng Tasks:</span>
                  <span className="font-semibold text-foreground">{project.jira.totalTasks} issues</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Đồng bộ gần nhất:</span>
                  <span className="text-foreground">{formatDate(project.jira.lastSyncedAt)}</span>
                </div>
              </div>
            </div>

            {/* GitHub */}
            <div className="bg-background border border-border p-3.5 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <GitBranchIcon className="w-3.5 h-3.5" />
                  GitHub Repository
                </span>
                {renderStatusBadge(project.github.status)}
              </div>
              <div className="text-xs space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Repository:</span>
                  <a
                    href={project.github.repoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="font-mono text-primary text-[11px] hover:underline flex items-center gap-1 truncate max-w-[150px]"
                  >
                    {project.github.repoName}
                    <ExternalLinkIcon className="w-3 h-3 shrink-0" />
                  </a>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tổng Commits:</span>
                  <span className="font-semibold text-foreground">{project.github.totalCommits} commits</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Đồng bộ gần nhất:</span>
                  <span className="text-foreground">{formatDate(project.github.lastSyncedAt)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Danh sách thành viên */}
        <div className="space-y-2 pt-2">
          <p className="text-xs font-bold text-foreground">
            Danh sách thành viên ({project.members.length} sinh viên)
          </p>
          <div className="border border-border rounded-xl overflow-hidden divide-y divide-border/60">
            {project.members.map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between p-2.5 bg-background hover:bg-muted/30 transition-colors text-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Avatar className="w-7 h-7 rounded-lg">
                    <AvatarImage src={m.avatar} alt={m.fullName} />
                    <AvatarFallback className="text-[10px] font-bold">
                      {getInitials(m.fullName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-foreground truncate">
                        {m.fullName}
                      </span>
                      {m.isLeader && (
                        <Badge className="bg-primary/10 text-primary border-0 text-[10px] py-0 px-1">
                          Trưởng nhóm
                        </Badge>
                      )}
                    </div>
                    <span className="text-[11px] text-muted-foreground">{m.email}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-muted-foreground shrink-0">
                  <span className="font-mono text-foreground font-medium">{m.studentCode}</span>
                  <span className="text-[11px]">
                    <strong className="text-foreground">{m.commitsCount}</strong> commits
                  </span>
                  <span className="text-[11px]">
                    <strong className="text-foreground">{m.tasksCount}</strong> tasks
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="pt-2">
          <Button variant="outline" size="sm" onClick={onClose} className="text-xs">
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
