"use client";

import { useState } from "react";
import {
  XIcon,
  SaveIcon,
  CheckCircle2Icon,
  LoaderCircleIcon,
  FileTextIcon,
  Trash2Icon,
  TagIcon,
  LockIcon,
} from "lucide-react";
import type {
  SprintIssue,
  IssueStatus,
  IssueType,
  IssuePriority,
  Sprint,
} from "../types/sprint-progress";
import { renderTypeIcon } from "./sprint-board-view";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CustomSelect } from "@/components/common/custom-select";

interface IssueDetailsModalProps {
  isOpen: boolean;
  issue: SprintIssue | null; // Null means creating a new issue
  defaultSprintId?: string;
  sprints: Sprint[];
  teamMembers: { id: string; name: string; avatar: string; studentCode: string }[];
  onClose: () => void;
  onSave: (savedIssue: SprintIssue) => void;
  onDelete?: (issueId: string) => void;
  isTeamLeader: boolean;
  currentUserStudentCode: string;
}

export function IssueDetailsModal({
  isOpen,
  issue,
  defaultSprintId,
  sprints,
  teamMembers,
  onClose,
  onSave,
  onDelete,
  isTeamLeader,
  currentUserStudentCode,
}: IssueDetailsModalProps) {
  const isEditing = Boolean(issue);
  const isOwner = issue ? issue.assignee.studentCode === currentUserStudentCode : true;
  const canEdit = isTeamLeader || isOwner;

  const [form, setForm] = useState({
    key: issue?.key || "SAGA-NEW",
    summary: issue?.summary || "",
    description: issue?.description || "",
    type: issue?.type || ("STORY" as IssueType),
    priority: issue?.priority || ("MEDIUM" as IssuePriority),
    status: issue?.status || ("TODO" as IssueStatus),
    storyPoints: issue?.storyPoints || 3,
    assignee: issue?.assignee || teamMembers[0],
    labels: issue?.labels ? issue.labels.join(", ") : "Frontend, UI/UX",
    sprintId: issue?.sprintId || defaultSprintId || sprints[0]?.id,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) return;

    setIsSubmitting(true);
    setSuccessMsg("");
    await new Promise((r) => setTimeout(r, 600));

    const labelsArray = form.labels
      .split(",")
      .map((l) => l.trim())
      .filter(Boolean);

    const finalIssue: SprintIssue = {
      id: issue?.id || `issue-${Date.now()}`,
      key: form.key || `SAGA-199`,
      summary: form.summary || "Nhiệm vụ mới",
      description: form.description,
      type: form.type as IssueType,
      priority: form.priority as IssuePriority,
      status: form.status as IssueStatus,
      storyPoints: Number(form.storyPoints) || 1,
      assignee: form.assignee || teamMembers[0],
      labels: labelsArray,
      sprintId: form.sprintId || sprints[0]?.id,
      createdAt: issue?.createdAt || new Date().toISOString(),
      githubCommitCount: issue?.githubCommitCount || 0,
    };

    onSave(finalIssue);

    setIsSubmitting(false);
    setSuccessMsg(isEditing ? "Cập nhật công việc thành công!" : "Đã tạo task mới thành công!");
    setTimeout(() => {
      setSuccessMsg("");
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in-0 duration-200">
      <div className="bg-card border border-border/80 rounded-3xl w-full max-w-2xl shadow-xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-5 border-b border-border/60 flex items-center justify-between bg-muted/30 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
              {renderTypeIcon(form.type as IssueType)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-primary">{form.key}</span>
                <h3 className="text-base font-bold text-foreground">
                  {!canEdit
                    ? "Chi tiết Công việc (Chỉ đọc)"
                    : isEditing
                      ? "Chi tiết & Cập nhật Công việc"
                      : "Tạo Task mới"}
                </h3>
              </div>
              <p className="text-xs text-muted-foreground">
                Quản lý trạng thái, phân công, Story Points và Labels chuẩn Jira
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer transition-colors"
          >
            <XIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1 scrollbar-thin">
          {/* Read-Only Warning Banner if viewing another member's task */}
          {!canEdit && (
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in-0">
              <LockIcon className="w-4 h-4 shrink-0 text-amber-500" />
              <span>
                Bạn đang xem công việc của thành viên <strong>{issue?.assignee.name} ({issue?.assignee.studentCode})</strong>. Bạn chỉ có quyền xem thông tin (Chỉ đọc).
              </span>
            </div>
          )}

          {/* Feedback Alert */}
          {successMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2 animate-in fade-in-0">
              <CheckCircle2Icon className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Summary / Title */}
          <div className="space-y-1.5">
            <Label htmlFor="issue-summary" className="text-xs font-semibold">
              Tên công việc (Summary) <span className="text-destructive">*</span>
            </Label>
            <Input
              id="issue-summary"
              type="text"
              required
              disabled={!canEdit}
              value={form.summary}
              onChange={(e) => setForm((f) => ({ ...f, summary: e.target.value }))}
              placeholder="Nhập tên nhiệm vụ Jira..."
              className="h-9 text-xs rounded-xl bg-card font-semibold disabled:opacity-80"
            />
          </div>

          {/* Grid 2 Columns: Metadata */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Type */}
            <div className="space-y-1.5">
              <Label htmlFor="issue-type" className="text-xs font-semibold">
                Loại thẻ (Issue Type)
              </Label>
              <CustomSelect
                id="issue-type"
                disabled={!canEdit}
                value={form.type}
                onChange={(val) => setForm((f) => ({ ...f, type: val as IssueType }))}
                options={[
                  { value: "STORY", label: "User Story", icon: renderTypeIcon("STORY") },
                  { value: "TASK", label: "Task", icon: renderTypeIcon("TASK") },
                  { value: "BUG", label: "Bug", icon: renderTypeIcon("BUG") },
                  { value: "SUBTASK", label: "Sub-task", icon: renderTypeIcon("SUBTASK") },
                ]}
              />
            </div>

            {/* Status */}
            <div className="space-y-1.5">
              <Label htmlFor="issue-status" className="text-xs font-semibold">
                Trạng thái (Status)
              </Label>
              <CustomSelect
                id="issue-status"
                disabled={!canEdit}
                value={form.status}
                onChange={(val) => setForm((f) => ({ ...f, status: val as IssueStatus }))}
                options={[
                  { value: "TODO", label: "TO DO (Cần làm)" },
                  { value: "IN_PROGRESS", label: "IN PROGRESS (Đang làm)" },
                  { value: "IN_REVIEW", label: "IN REVIEW (Đang kiểm thử)" },
                  { value: "DONE", label: "DONE (Hoàn thành)" },
                ]}
              />
            </div>

            {/* Priority */}
            <div className="space-y-1.5">
              <Label htmlFor="issue-priority" className="text-xs font-semibold">
                Mức ưu tiên (Priority)
              </Label>
              <CustomSelect
                id="issue-priority"
                disabled={!canEdit}
                value={form.priority}
                onChange={(val) => setForm((f) => ({ ...f, priority: val as IssuePriority }))}
                options={[
                  { value: "HIGHEST", label: "HIGHEST (Rất cao)" },
                  { value: "HIGH", label: "HIGH (Cao)" },
                  { value: "MEDIUM", label: "MEDIUM (Trung bình)" },
                  { value: "LOW", label: "LOW (Thấp)" },
                ]}
              />
            </div>

            {/* Story Points */}
            <div className="space-y-1.5">
              <Label htmlFor="issue-sp" className="text-xs font-semibold">
                Story Points (Ước lượng khối lượng)
              </Label>
              <Input
                id="issue-sp"
                type="number"
                min={1}
                max={13}
                disabled={!canEdit}
                value={form.storyPoints}
                onChange={(e) => setForm((f) => ({ ...f, storyPoints: Number(e.target.value) }))}
                className="h-9 text-xs rounded-xl bg-card font-mono disabled:opacity-80"
              />
            </div>

            {/* Assignee */}
            <div className="space-y-1.5">
              <Label htmlFor="issue-assignee" className="text-xs font-semibold">
                Người thực hiện (Assignee)
              </Label>
              <CustomSelect
                id="issue-assignee"
                disabled={!canEdit}
                value={form.assignee?.id || ""}
                onChange={(val) => {
                  const m = teamMembers.find((member) => member.id === val);
                  if (m) setForm((f) => ({ ...f, assignee: m }));
                }}
                placeholder="Chọn thành viên..."
                options={teamMembers.map((m) => ({
                  value: m.id,
                  label: m.name,
                  subLabel: m.studentCode,
                }))}
              />
            </div>

            {/* Sprint */}
            <div className="space-y-1.5">
              <Label htmlFor="issue-sprint" className="text-xs font-semibold">
                Sprint thuộc về
              </Label>
              <CustomSelect
                id="issue-sprint"
                disabled={!canEdit}
                value={form.sprintId}
                onChange={(val) => setForm((f) => ({ ...f, sprintId: val }))}
                options={sprints.map((s) => ({
                  value: s.id,
                  label: s.name,
                  subLabel: `Trạng thái: ${s.status}`,
                }))}
              />
            </div>
          </div>

          {/* Labels Field */}
          <div className="space-y-1.5">
            <Label htmlFor="issue-labels" className="text-xs font-semibold flex items-center gap-1.5">
              <TagIcon className="w-3.5 h-3.5 text-blue-500" />
              Labels / Nhãn (phân cách bằng dấu phẩy)
            </Label>
            <Input
              id="issue-labels"
              type="text"
              disabled={!canEdit}
              value={form.labels}
              onChange={(e) => setForm((f) => ({ ...f, labels: e.target.value }))}
              placeholder="Frontend, UI/UX, API, Security"
              className="h-9 text-xs rounded-xl bg-card font-mono disabled:opacity-80"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="issue-desc" className="text-xs font-semibold flex items-center gap-1.5">
              <FileTextIcon className="w-3.5 h-3.5 text-primary" />
              Mô tả chi tiết công việc
            </Label>
            <Textarea
              id="issue-desc"
              rows={3}
              disabled={!canEdit}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Nhập ghi chú hoặc yêu cầu chi tiết của task..."
              className="text-xs rounded-xl bg-card resize-none disabled:opacity-80"
            />
          </div>

          {/* Modal Footer */}
          <div className="pt-3 border-t border-border/60 flex items-center justify-between">
            {canEdit && isEditing && onDelete ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (issue) onDelete(issue.id);
                  onClose();
                }}
                className="h-9 text-xs text-destructive hover:bg-destructive/10 rounded-xl gap-1 cursor-pointer"
              >
                <Trash2Icon className="w-4 h-4" />
                Xóa task
              </Button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant={canEdit ? "ghost" : "default"}
                size="sm"
                onClick={onClose}
                className="h-9 text-xs rounded-xl cursor-pointer"
              >
                {canEdit ? "Hủy" : "Đóng"}
              </Button>

              {canEdit && (
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-9 text-xs font-bold rounded-xl gap-2 cursor-pointer shadow-xs bg-blue-600 hover:bg-blue-700 text-white px-5"
                >
                  {isSubmitting ? (
                    <>
                      <LoaderCircleIcon className="w-4 h-4 animate-spin" />
                      Đang lưu...
                    </>
                  ) : (
                    <>
                      <SaveIcon className="w-4 h-4" />
                      {isEditing ? "Lưu thay đổi" : "Tạo task mới"}
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
