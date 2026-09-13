"use client";

import { useState, useMemo } from "react";
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
import { TaskLinkedCommitsList } from "./task-linked-commits-list";
import { TaskEvidencePanel } from "./task-evidence-panel";
import {
  useCreateProjectTask,
  usePatchProjectTask,
  useDeleteProjectTask,
  useTransitionTask,
  useTaskOptions,
  useProjectTaskDetail,
} from "../hooks/use-project-tasks";

function parseIssueStatus(status?: string | null, jiraStatusName?: string | null): IssueStatus {
  const combined = `${status || ""} ${jiraStatusName || ""}`.toUpperCase();
  if (["DONE", "COMPLETED", "RESOLVED", "CLOSED"].some((s) => combined.includes(s))) return "DONE";
  if (["REVIEW", "TEST", "QA"].some((s) => combined.includes(s))) return "IN_REVIEW";
  if (["IN_PROGRESS", "IN PROGRESS", "DOING", "PROGRESS", "DEVELOPMENT"].some((s) => combined.includes(s))) return "IN_PROGRESS";
  return "TODO";
}

interface IssueDetailsModalProps {
  isOpen: boolean;
  issue: SprintIssue | null;
  projectId?: string;
  isJiraConnected?: boolean;
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
  projectId,
  isJiraConnected = true,
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

  const { data: taskOptions } = useTaskOptions(projectId, {
    enabled: Boolean(isOpen && projectId && isJiraConnected),
  });
  const { data: taskDetail } = useProjectTaskDetail(projectId, issue?.id, {
    enabled: Boolean(isOpen && projectId && issue?.id),
  });
  const createTaskMutation = useCreateProjectTask();
  const patchTaskMutation = usePatchProjectTask();
  const deleteTaskMutation = useDeleteProjectTask();
  const transitionTaskMutation = useTransitionTask();

  const matchedAssignee = useMemo(() => {
    if (!issue?.assignee) return teamMembers[0];
    return (
      teamMembers.find(
        (m) =>
          m.id === issue.assignee?.id ||
          (issue.assignee?.studentCode && m.studentCode === issue.assignee.studentCode) ||
          m.name === issue.assignee?.name
      ) || issue.assignee
    );
  }, [issue, teamMembers]);

  const [form, setForm] = useState(() => {
    const initialStatus = issue ? parseIssueStatus(issue.status) : ("TODO" as IssueStatus);
    const initialSprintId = issue?.sprintId
      ? issue.sprintId
      : defaultSprintId
        ? defaultSprintId
        : "backlog";

    return {
      key: issue?.key || "SAGA-NEW",
      summary: issue?.summary || "",
      description: issue?.description || "",
      type: issue?.type || ("STORY" as IssueType),
      priority: issue?.priority || ("MEDIUM" as IssuePriority),
      status: initialStatus,
      storyPoints: typeof issue?.storyPoints === "number" ? issue.storyPoints : 0,
      assignee: matchedAssignee,
      labels: issue?.labels ? issue.labels.join(", ") : "",
      sprintId: initialSprintId,
    };
  });

  const [prevTaskDetail, setPrevTaskDetail] = useState(taskDetail);
  if (taskDetail !== prevTaskDetail) {
    setPrevTaskDetail(taskDetail);
    if (taskDetail) {
      const resolvedStatus = parseIssueStatus(taskDetail.status, taskDetail.jiraStatusName);
      const resolvedSprintId = taskDetail.sprint?.id ? String(taskDetail.sprint.id) : "backlog";

      setForm((prev) => ({
        ...prev,
        summary: taskDetail.title || prev.summary,
        description: taskDetail.description ?? prev.description,
        status: resolvedStatus,
        storyPoints:
          typeof taskDetail.storyPoint === "number" && !Number.isNaN(taskDetail.storyPoint)
            ? taskDetail.storyPoint
            : prev.storyPoints,
        sprintId: resolvedSprintId,
      }));
    }
  }

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [selectedCommitShas, setSelectedCommitShas] = useState("");

  const handleToggleCommitSha = (sha: string) => {
    setSelectedCommitShas((prev) => {
      const currentList = prev
        ? prev
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
        : [];
      const exists = currentList.includes(sha);
      const nextList = exists
        ? currentList.filter((s) => s !== sha)
        : [...currentList, sha];
      return nextList.join(", ");
    });
  };

  const handleSelectAllCommitShas = (shas: string[]) => {
    setSelectedCommitShas((prev) => {
      const currentList = prev
        ? prev
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
        : [];
      const allSelected = shas.length > 0 && shas.every((s) => currentList.includes(s));
      if (allSelected) {
        return currentList.filter((s) => !shas.includes(s)).join(", ");
      }
      return Array.from(new Set([...currentList, ...shas])).join(", ");
    });
  };

  const selectedShasList = useMemo(() => {
    return selectedCommitShas
      ? selectedCommitShas
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
      : [];
  }, [selectedCommitShas]);

  if (!isOpen) return null;

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!canEdit) return;

    setIsSubmitting(true);
    setSuccessMsg("");

    const labelsArray = form.labels
      .split(",")
      .map((l) => l.trim())
      .filter(Boolean);

    let savedKey = form.key || "SAGA-NEW";

    try {
      if (projectId) {
        if (isEditing && issue) {
          const currentStatus = taskDetail
            ? parseIssueStatus(taskDetail.status, taskDetail.jiraStatusName)
            : parseIssueStatus(issue.status);
          if (form.status !== currentStatus && canEdit) {
            try {
              await transitionTaskMutation.mutateAsync({
                projectId,
                taskId: issue.id,
                data: { targetStatus: form.status },
              });
            } catch { }
          }

          const originalSprintId = taskDetail?.sprint?.id
            ? String(taskDetail.sprint.id)
            : (issue.sprintId || "backlog");
          const sprintChanged = form.sprintId !== originalSprintId;

          const patchData: {
            summary?: string;
            description?: string;
            storyPoints?: number;
            sprintExternalId?: string;
            moveToBacklog?: boolean;
          } = {
            summary: form.summary.trim() || issue.summary,
          };

          const currentDesc = taskDetail?.description ?? issue.description ?? "";
          if (form.description.trim() !== currentDesc.trim()) {
            patchData.description = form.description.trim();
          }

          const currentPoints =
            typeof taskDetail?.storyPoint === "number" && !Number.isNaN(taskDetail.storyPoint)
              ? taskDetail.storyPoint
              : issue.storyPoints;
          if (
            taskOptions?.estimation?.supported === true &&
            typeof form.storyPoints === "number" &&
            form.storyPoints > 0 &&
            form.storyPoints !== currentPoints
          ) {
            patchData.storyPoints = form.storyPoints;
          }

          if (sprintChanged) {
            if (form.sprintId === "backlog") {
              if (originalSprintId !== "backlog") {
                patchData.moveToBacklog = true;
              }
            } else {
              const targetSprint = sprints.find((s) => s.id === form.sprintId);
              const extId = targetSprint?.externalSprintId;
              if (extId && !isNaN(Number(extId))) {
                patchData.sprintExternalId = String(extId);
              }
            }
          }

          if (Object.keys(patchData).length > 0) {
            const res = await patchTaskMutation.mutateAsync({
              projectId,
              taskId: issue.id,
              data: patchData,
            });
            savedKey = res.externalKey || savedKey;
          }
        } else {
          const targetSprint = sprints.find((s) => s.id === form.sprintId);
          const extId = targetSprint?.externalSprintId;
          const sprintExtId =
            form.sprintId === "backlog"
              ? undefined
              : extId && !isNaN(Number(extId))
                ? String(extId)
                : undefined;

          const res = await createTaskMutation.mutateAsync({
            projectId,
            data: {
              summary: form.summary.trim(),
              description: form.description?.trim() || undefined,
              storyPoints: Number(form.storyPoints) > 0 ? Number(form.storyPoints) : undefined,
              sprintExternalId: sprintExtId,
            },
          });
          savedKey = res.externalKey || savedKey;
        }
      }

      const finalIssue: SprintIssue = {
        id: issue?.id || `issue-${Date.now()}`,
        key: savedKey,
        summary: form.summary || "Nhiệm vụ mới",
        description: form.description,
        type: form.type as IssueType,
        priority: form.priority as IssuePriority,
        status: form.status as IssueStatus,
        storyPoints: Number(form.storyPoints) || 0,
        assignee: form.assignee || teamMembers[0],
        labels: labelsArray,
        sprintId: form.sprintId || "backlog",
        createdAt: issue?.createdAt || new Date().toISOString(),
        githubCommitCount: issue?.githubCommitCount || 0,
      };

      onSave(finalIssue);
      setSuccessMsg(isEditing ? "Cập nhật task thành công!" : "Đã tạo task mới thành công!");
      setTimeout(() => {
        setSuccessMsg("");
        onClose();
      }, 800);
    } catch {
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTask = async () => {
    if (!issue) return;
    if (projectId) {
      try {
        await deleteTaskMutation.mutateAsync({ projectId, taskId: issue.id });
        onDelete?.(issue.id);
        onClose();
      } catch { }
    } else {
      onDelete?.(issue.id);
      onClose();
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end animate-in fade-in-0 duration-300"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-card border-l border-border/80 w-full sm:max-w-2xl md:max-w-3xl lg:max-w-4xl xl:max-w-5xl h-screen shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-300"
      >
        <div className="p-4 sm:p-5 border-b border-border/60 flex items-center justify-between bg-muted/30 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
              {renderTypeIcon(form.type as IssueType)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-primary px-1.5 py-0.5 rounded-md bg-primary/10 border border-primary/20">
                  {form.key}
                </span>
                <h3 className="text-base sm:text-lg font-bold text-foreground">
                  {!canEdit
                    ? "Chi tiết Task (Chỉ đọc)"
                    : isEditing
                      ? "Chi tiết & Cập nhật Task"
                      : "Tạo Task mới"}
                </h3>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Quản lý trạng thái, phân công, Story Points và Labels chuẩn Jira
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer transition-colors border border-border/50"
          >
            <XIcon className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 sm:p-6 overflow-y-auto flex-1 scrollbar-thin space-y-5">
          {!canEdit && (
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in-0">
              <LockIcon className="w-4 h-4 shrink-0 text-amber-500" />
              <span>
                Bạn đang xem task của thành viên <strong>{issue?.assignee.name} ({issue?.assignee.studentCode})</strong>. Bạn chỉ có quyền xem thông tin (Chỉ đọc).
              </span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2 animate-in fade-in-0">
              <CheckCircle2Icon className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="issue-title" className="text-xs font-semibold text-foreground">
              Tên task / Tóm tắt Jira <span className="text-destructive">*</span>
            </Label>
            <Input
              id="issue-title"
              type="text"
              required
              disabled={!canEdit}
              value={form.summary}
              onChange={(e) => setForm((f) => ({ ...f, summary: e.target.value }))}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  void handleSubmit();
                }
              }}
              placeholder="Nhập tên task Jira..."
              className="h-10 text-sm rounded-xl bg-card font-semibold disabled:opacity-80 border-border/80"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-7 xl:col-span-8 space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="issue-desc" className="text-xs font-semibold flex items-center gap-1.5">
                  <FileTextIcon className="w-3.5 h-3.5 text-primary" />
                  Mô tả chi tiết task
                </Label>
                <Textarea
                  id="issue-desc"
                  rows={4}
                  disabled={!canEdit}
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Nhập chi tiết yêu cầu kỹ thuật, tiêu chí chấp nhận Acceptance Criteria..."
                  className="text-xs rounded-xl bg-card resize-none disabled:opacity-80 border-border/80 leading-relaxed"
                />
              </div>

              {issue && (
                <>
                  <TaskLinkedCommitsList
                    taskId={issue.id}
                    projectId={projectId}
                    onSelectCommit={handleToggleCommitSha}
                    onSelectAllCommits={handleSelectAllCommitShas}
                    selectedShas={selectedShasList}
                  />
                  <TaskEvidencePanel
                    taskId={issue.id}
                    isOwnerOrLeader={canEdit}
                    externalCommitShas={selectedCommitShas}
                    onConfirmCommitsChange={setSelectedCommitShas}
                  />
                </>
              )}
            </div>

            <div className="lg:col-span-5 xl:col-span-4 space-y-4 p-4 rounded-2xl bg-muted/20 border border-border/60">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground pb-1 border-b border-border/40">
                Thuộc tính Task
              </h4>

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

              <div className="space-y-1.5">
                <Label htmlFor="issue-sprint" className="text-xs font-semibold">
                  Sprint thuộc về
                </Label>
                <CustomSelect
                  id="issue-sprint"
                  disabled={!canEdit}
                  value={form.sprintId}
                  onChange={(val) => setForm((f) => ({ ...f, sprintId: val }))}
                  options={[
                    {
                      value: "backlog",
                      label: "Backlog (Chưa gán vào Sprint)",
                      subLabel: "Product Backlog",
                    },
                    ...sprints.map((s) => ({
                      value: s.id,
                      label: s.name,
                      subLabel: `Trạng thái: ${s.status}`,
                    })),
                  ]}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="issue-sp" className="text-xs font-semibold">
                    Story Points
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

                <div className="space-y-1.5">
                  <Label htmlFor="issue-priority" className="text-xs font-semibold">
                    Mức ưu tiên
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
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="issue-type" className="text-xs font-semibold">
                  Loại thẻ (Issue Type)
                </Label>
                <CustomSelect
                  id="issue-type"
                  disabled={!canEdit}
                  value={form.type}
                  onChange={(val) => setForm((f) => ({ ...f, type: val as IssueType }))}
                  options={
                    taskOptions?.issueTypes && taskOptions.issueTypes.length > 0
                      ? taskOptions.issueTypes.map((t) => ({
                        value: t.name.toUpperCase().includes("STORY")
                          ? "STORY"
                          : t.name.toUpperCase().includes("BUG")
                            ? "BUG"
                            : t.name.toUpperCase().includes("SUB")
                              ? "SUBTASK"
                              : "TASK",
                        label: t.name,
                        icon: renderTypeIcon(
                          t.name.toUpperCase().includes("STORY")
                            ? "STORY"
                            : t.name.toUpperCase().includes("BUG")
                              ? "BUG"
                              : t.name.toUpperCase().includes("SUB")
                                ? "SUBTASK"
                                : "TASK"
                        ),
                      }))
                      : [
                        { value: "STORY", label: "User Story", icon: renderTypeIcon("STORY") },
                        { value: "TASK", label: "Task", icon: renderTypeIcon("TASK") },
                        { value: "BUG", label: "Bug", icon: renderTypeIcon("BUG") },
                        { value: "SUBTASK", label: "Sub-task", icon: renderTypeIcon("SUBTASK") },
                      ]
                  }
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="issue-labels" className="text-xs font-semibold flex items-center gap-1.5">
                  <TagIcon className="w-3.5 h-3.5 text-blue-500" />
                  Labels (cách nhau bằng dấu phẩy)
                </Label>
                <Input
                  id="issue-labels"
                  type="text"
                  disabled={!canEdit}
                  value={form.labels}
                  onChange={(e) => setForm((f) => ({ ...f, labels: e.target.value }))}
                  placeholder="VD: Frontend, Backend, UI/UX"
                  className="h-9 text-xs rounded-xl bg-card disabled:opacity-80"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-5 border-t border-border/60 flex items-center justify-between bg-muted/30 shrink-0">
          {canEdit && isEditing && onDelete ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleDeleteTask}
              className="h-9 text-xs text-destructive hover:bg-destructive/10 rounded-xl gap-1.5 cursor-pointer"
            >
              <Trash2Icon className="w-4 h-4" />
              Xóa task
            </Button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2.5">
            <Button
              type="button"
              variant={canEdit ? "ghost" : "default"}
              size="sm"
              onClick={onClose}
              className="h-9 text-xs rounded-xl cursor-pointer px-4"
            >
              {canEdit ? "Hủy" : "Đóng"}
            </Button>

            {canEdit && (
              <Button
                type="button"
                onClick={() => void handleSubmit()}
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
      </div>
    </div>
  );
}
