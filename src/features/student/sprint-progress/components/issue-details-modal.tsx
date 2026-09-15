"use client";

import { useState, useMemo } from "react";
import {
  XIcon,
  SaveIcon,
  LoaderCircleIcon,
  FileTextIcon,
  Trash2Icon,
  TagIcon,
  LockIcon,
  GitCommitIcon,
  PaperclipIcon,
  ShieldCheckIcon,
  CalendarIcon,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TaskLinkedCommitsList } from "./task-linked-commits-list";
import { TaskEvidencePanel } from "./task-evidence-panel";
import { TaskWorkSessionControl } from "./task-work-session-control";
import { LabelsMultiSelect } from "./labels-multi-select";
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

function normalizeIssueType(name: string): IssueType {
  const upperName = name.toUpperCase();
  if (upperName.includes("EPIC")) return "EPIC";
  if (upperName.includes("STORY")) return "STORY";
  if (upperName.includes("BUG")) return "BUG";
  if (upperName.includes("SUB")) return "SUBTASK";
  return "TASK";
}

function matchJiraUserWithMember(
  displayName: string,
  members: { id: string; name: string; avatar: string; studentCode: string }[]
) {
  const cleanDisplayName = displayName.toLowerCase().trim();
  return members.find((m) => {
    const cleanMemberName = m.name.toLowerCase().trim();
    return (
      cleanDisplayName === cleanMemberName ||
      cleanDisplayName.includes(cleanMemberName) ||
      cleanMemberName.includes(cleanDisplayName) ||
      (m.studentCode && cleanDisplayName.includes(m.studentCode.toLowerCase().trim()))
    );
  });
}

interface IssueDetailsModalProps {
  isOpen: boolean;
  issue: SprintIssue | null;
  projectId?: string;
  isJiraConnected?: boolean;
  defaultSprintId?: string;
  sprints: Sprint[];
  teamMembers: { id: string; name: string; avatar: string; studentCode: string }[];
  availableLabels?: string[];
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
  availableLabels = [],
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
  const issueTypes = taskOptions?.issueTypes;

  const issueTypeOptions = useMemo(() => {
    if (!issueTypes?.length) {
      return [
        { value: "TASK", label: "Task", icon: renderTypeIcon("TASK"), type: "TASK" as const, issueTypeId: undefined },
        { value: "EPIC", label: "Epic", icon: renderTypeIcon("EPIC"), type: "EPIC" as const, issueTypeId: undefined },
        { value: "STORY", label: "User Story", icon: renderTypeIcon("STORY"), type: "STORY" as const, issueTypeId: undefined },
        { value: "BUG", label: "Bug", icon: renderTypeIcon("BUG"), type: "BUG" as const, issueTypeId: undefined },
        { value: "SUBTASK", label: "Sub-task", icon: renderTypeIcon("SUBTASK"), type: "SUBTASK" as const, issueTypeId: undefined },
      ];
    }

    const seenIds = new Set<string>();
    return issueTypes.flatMap((issueType) => {
      if (seenIds.has(issueType.id)) return [];
      seenIds.add(issueType.id);
      const value = normalizeIssueType(issueType.name);
      return [{
        value: issueType.id,
        label: issueType.name,
        icon: renderTypeIcon(value),
        type: value,
        issueTypeId: issueType.id,
      }];
    });
  }, [issueTypes]);

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

  const initialAssigneeAccountId =
    issue?.assignee?.accountId ||
    taskDetail?.assignee?.accountId ||
    taskDetail?.assigneeExternalId ||
    "";

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
      type: issue?.type || ("TASK" as IssueType),
      issueTypeId: undefined as string | undefined,
      priority: issue?.priority || ("MEDIUM" as IssuePriority),
      status: initialStatus,
      storyPoints: typeof issue?.storyPoints === "number" ? issue.storyPoints : 0,
      assignee: matchedAssignee,
      assigneeAccountId: initialAssigneeAccountId,
      labels: Array.isArray(issue?.labels) ? issue.labels : [],
      sprintId: initialSprintId,
      startDate: issue?.startDate || taskDetail?.startDate || "",
      dueDate: issue?.dueDate || taskDetail?.dueDate || "",
    };
  });

  const [prevTaskDetail, setPrevTaskDetail] = useState(taskDetail);
  if (taskDetail !== prevTaskDetail) {
    setPrevTaskDetail(taskDetail);
    if (taskDetail) {
      const resolvedStatus = parseIssueStatus(taskDetail.status, taskDetail.jiraStatusName);
      const resolvedSprintId = taskDetail.sprint?.id ? String(taskDetail.sprint.id) : "backlog";
      const resolvedAccountId =
        taskDetail.assignee?.accountId || taskDetail.assigneeExternalId || "";

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
        assigneeAccountId: resolvedAccountId || prev.assigneeAccountId,
        labels: Array.isArray(taskDetail.labels) ? taskDetail.labels : prev.labels,
        startDate: taskDetail.startDate ?? prev.startDate,
        dueDate: taskDetail.dueDate ?? prev.dueDate,
      }));
    }
  }

  const [hasSyncedJiraAssignee, setHasSyncedJiraAssignee] = useState(false);
  if (!hasSyncedJiraAssignee && taskOptions?.assignableUsers && taskOptions.assignableUsers.length > 0) {
    setHasSyncedJiraAssignee(true);
    if (!form.assigneeAccountId) {
      if (!isEditing) {
        const currentMember = teamMembers.find((m) => m.studentCode === currentUserStudentCode);
        const currentUser = taskOptions.assignableUsers.find((u) =>
          currentMember ? matchJiraUserWithMember(u.displayName, [currentMember]) : false
        );
        if (currentUser) {
          setForm((prev) => ({ ...prev, assigneeAccountId: currentUser.accountId }));
        }
      } else if (issue?.assignee && issue.assignee.name !== "Chưa phân công") {
        const matched = taskOptions.assignableUsers.find((u) =>
          matchJiraUserWithMember(u.displayName, [issue.assignee])
        );
        if (matched) {
          setForm((prev) => ({ ...prev, assigneeAccountId: matched.accountId }));
        }
      }
    }
  }

  const assignableUsers = taskOptions?.assignableUsers;
  const assigneeOptions = useMemo(() => {
    const unassignedOption = {
      value: "",
      label: "Chưa phân công",
      subLabel: "Unassigned",
    };

    if (assignableUsers && assignableUsers.length > 0) {
      const jiraOptions = assignableUsers.map((user) => {
        const matched = matchJiraUserWithMember(user.displayName, teamMembers);
        return {
          value: user.accountId,
          label: user.displayName,
          subLabel: matched ? matched.studentCode : "Tài khoản Jira",
        };
      });
      return [unassignedOption, ...jiraOptions];
    }

    const memberOptions = teamMembers.map((m) => ({
      value: m.id,
      label: m.name,
      subLabel: m.studentCode,
    }));
    return [unassignedOption, ...memberOptions];
  }, [assignableUsers, teamMembers]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCommitShas, setSelectedCommitShas] = useState("");
  const [activeEvidenceTab, setActiveEvidenceTab] = useState("commits");

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

    let savedKey = form.key || "SAGA-NEW";
    const selectedIssueType =
      issueTypeOptions.find((option) => option.value === form.issueTypeId) ||
      issueTypeOptions.find((option) => option.type === form.type);
    const selectedIssueTypeId = form.issueTypeId || selectedIssueType?.issueTypeId;

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

          const originalAssigneeAccountId =
            taskDetail?.assignee?.accountId ||
            taskDetail?.assigneeExternalId ||
            issue.assignee?.accountId ||
            "";

          const patchData: {
            summary?: string;
            description?: string;
            issueTypeId?: string;
            storyPoints?: number;
            sprintExternalId?: string;
            moveToBacklog?: boolean;
            assigneeAccountId?: string;
            clearAssignee?: boolean;
            labels?: string[];
            startDate?: string;
            clearStartDate?: boolean;
            dueDate?: string;
            clearDueDate?: boolean;
          } = {
            summary: form.summary.trim() || issue.summary,
          };

          const originalStartDate = taskDetail?.startDate || issue.startDate || "";
          if (form.startDate !== originalStartDate) {
            if (!form.startDate.trim()) {
              patchData.clearStartDate = true;
            } else {
              patchData.startDate = form.startDate.trim();
            }
          }

          const originalDueDate = taskDetail?.dueDate || issue.dueDate || "";
          if (form.dueDate !== originalDueDate) {
            if (!form.dueDate.trim()) {
              patchData.clearDueDate = true;
            } else {
              patchData.dueDate = form.dueDate.trim();
            }
          }

          if (form.assigneeAccountId !== originalAssigneeAccountId) {
            if (!form.assigneeAccountId || !form.assigneeAccountId.trim()) {
              patchData.clearAssignee = true;
            } else {
              patchData.assigneeAccountId = form.assigneeAccountId.trim();
            }
          }

          const currentDesc = taskDetail?.description ?? issue.description ?? "";
          if (form.description.trim() !== currentDesc.trim()) {
            patchData.description = form.description.trim();
          }

          if (selectedIssueTypeId && form.type !== issue.type) {
            patchData.issueTypeId = selectedIssueTypeId;
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

          const originalLabels = Array.isArray(taskDetail?.labels)
            ? taskDetail.labels
            : Array.isArray(issue.labels)
              ? issue.labels
              : [];
          const labelsChanged =
            form.labels.length !== originalLabels.length ||
            form.labels.some((l, idx) => l !== originalLabels[idx]);
          if (labelsChanged) {
            patchData.labels = form.labels;
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

          const assigneeAccountId =
            form.assigneeAccountId && form.assigneeAccountId.trim()
              ? form.assigneeAccountId.trim()
              : undefined;

          const res = await createTaskMutation.mutateAsync({
            projectId,
            data: {
              summary: form.summary.trim(),
              description: form.description?.trim() || undefined,
              issueTypeId: selectedIssueTypeId,
              storyPoints: Number(form.storyPoints) > 0 ? Number(form.storyPoints) : undefined,
              sprintExternalId: sprintExtId,
              assigneeAccountId,
              labels: form.labels,
              startDate: form.startDate.trim() || undefined,
              dueDate: form.dueDate.trim() || undefined,
            },
          });
          savedKey = res.externalKey || savedKey;
        }
      }

      const matchedUser = taskOptions?.assignableUsers?.find(
        (u) => u.accountId === form.assigneeAccountId
      );
      const matchedMember = matchedUser
        ? matchJiraUserWithMember(matchedUser.displayName, teamMembers)
        : teamMembers.find((m) => m.id === form.assigneeAccountId);

      const finalAssignee = form.assigneeAccountId
        ? {
          id: matchedMember?.id || form.assigneeAccountId,
          name: matchedUser?.displayName || matchedMember?.name || form.assignee?.name || "Người dùng Jira",
          avatar: matchedMember?.avatar || "",
          studentCode: matchedMember?.studentCode || "",
          accountId: form.assigneeAccountId,
        }
        : {
          id: "unassigned",
          name: "Chưa phân công",
          avatar: "",
          studentCode: "",
          accountId: null,
        };

      const finalIssue: SprintIssue = {
        id: issue?.id || `issue-${Date.now()}`,
        key: savedKey,
        summary: form.summary || "Nhiệm vụ mới",
        description: form.description,
        type: form.type as IssueType,
        priority: form.priority as IssuePriority,
        status: form.status as IssueStatus,
        storyPoints: Number(form.storyPoints) || 0,
        assignee: finalAssignee,
        labels: form.labels,
        sprintId: form.sprintId || "backlog",
        startDate: form.startDate || undefined,
        dueDate: form.dueDate || undefined,
        createdAt: issue?.createdAt || new Date().toISOString(),
        githubCommitCount: issue?.githubCommitCount || 0,
      };

      onSave(finalIssue);
      onClose();
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
      className={`fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex animate-in fade-in-0 duration-300 ${isEditing ? "justify-end" : "items-center justify-center p-4"
        }`}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`bg-card border-border/80 shadow-2xl flex flex-col overflow-hidden animate-in duration-300 ${isEditing
          ? "border-l w-full sm:max-w-2xl md:max-w-3xl lg:max-w-4xl xl:max-w-5xl h-screen slide-in-from-right"
          : "w-full max-w-3xl max-h-[calc(100vh-2rem)] rounded-3xl border slide-in-from-bottom-4"
          }`}
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
                      : "Tạo Task mới với đầy đủ thông tin"}
                </h3>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {isEditing
                  ? "Quản lý trạng thái, phân công, Story Points và Labels chuẩn Jira"
                  : "Chỉ bắt buộc Tên task, các thuộc tính còn lại là tùy chọn"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isEditing && issue && (
              <TaskWorkSessionControl taskId={issue.id} isOwnerOrLeader={canEdit} />
            )}
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer transition-colors border border-border/50"
            >
              <XIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className={`p-4 sm:p-6 overflow-y-auto scrollbar-thin space-y-5 ${isEditing ? "flex-1" : ""}`}>
          {!canEdit && (
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in-0">
              <LockIcon className="w-4 h-4 shrink-0 text-amber-500" />
              <span>
                Bạn đang xem task của thành viên <strong>{issue?.assignee.name} ({issue?.assignee.studentCode})</strong>. Bạn chỉ có quyền xem thông tin (Chỉ đọc).
              </span>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="issue-title" className="text-xs font-semibold text-foreground flex items-center justify-between">
              <span>
                Tên task / Tóm tắt Jira <span className="text-destructive">*</span>
              </span>
              <span className="text-[10px] font-normal text-muted-foreground">Bắt buộc</span>
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

          <div className="space-y-5">
            <div className="space-y-1.5">
              <div className="space-y-1.5">
                <Label htmlFor="issue-desc" className="text-xs font-semibold flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <FileTextIcon className="w-3.5 h-3.5 text-primary" />
                    Mô tả chi tiết task
                  </span>
                  <span className="text-[10px] font-normal text-muted-foreground">(Tùy chọn)</span>
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
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-muted/20 border border-border/60 space-y-4">
              <div className="pb-2 border-b border-border/40">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Thuộc tính Task
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="issue-type" className="text-xs font-semibold flex items-center gap-1.5 text-foreground">
                    <span>Loại thẻ</span>
                    <span className="text-[11px] font-normal text-muted-foreground">(Tùy chọn)</span>
                  </Label>
                  <CustomSelect
                    id="issue-type"
                    disabled={!canEdit}
                    value={
                      issueTypeOptions.find((option) => option.value === form.issueTypeId)?.value ||
                      issueTypeOptions.find((option) => option.type === form.type)?.value ||
                      form.type
                    }
                    onChange={(value) => {
                      const selected = issueTypeOptions.find((option) => option.value === value);
                      if (!selected) return;
                      setForm((current) => ({
                        ...current,
                        type: selected.type,
                        issueTypeId: selected.issueTypeId,
                      }));
                    }}
                    options={issueTypeOptions}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="issue-status" className="text-xs font-semibold text-foreground">
                    Trạng thái
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
                  <Label htmlFor="issue-assignee" className="text-xs font-semibold flex items-center gap-1.5 text-foreground">
                    <span>Người thực hiện</span>
                    <span className="text-[11px] font-normal text-muted-foreground">(Tùy chọn)</span>
                  </Label>
                  <CustomSelect
                    id="issue-assignee"
                    disabled={!canEdit}
                    value={form.assigneeAccountId}
                    onChange={(val) => {
                      const matchedUser = taskOptions?.assignableUsers?.find((u) => u.accountId === val);
                      const matchedMember = matchedUser
                        ? matchJiraUserWithMember(matchedUser.displayName, teamMembers)
                        : teamMembers.find((m) => m.id === val);
                      setForm((f) => ({
                        ...f,
                        assigneeAccountId: val,
                        assignee: matchedMember || (matchedUser ? {
                          id: matchedUser.accountId,
                          name: matchedUser.displayName,
                          avatar: "",
                          studentCode: "",
                          accountId: matchedUser.accountId,
                        } : f.assignee),
                      }));
                    }}
                    placeholder="Chọn người thực hiện..."
                    options={assigneeOptions}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="issue-sprint" className="text-xs font-semibold flex items-center gap-1.5 text-foreground">
                    <span>Sprint</span>
                    <span className="text-[11px] font-normal text-muted-foreground">(Tùy chọn)</span>
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

                <div className="space-y-1.5">
                  <Label htmlFor="issue-sp" className="text-xs font-semibold flex items-center gap-1.5 text-foreground">
                    <span>Story Points</span>
                    <span className="text-[11px] font-normal text-muted-foreground">(Tùy chọn)</span>
                  </Label>
                  <Input
                    id="issue-sp"
                    type="number"
                    min={1}
                    max={13}
                    disabled={!canEdit}
                    value={form.storyPoints}
                    onChange={(e) => setForm((f) => ({ ...f, storyPoints: Number(e.target.value) }))}
                    className="h-9 text-xs rounded-xl bg-card font-mono disabled:opacity-80 border-border/80"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="issue-priority" className="text-xs font-semibold flex items-center gap-1.5 text-foreground">
                    <span>Mức ưu tiên</span>
                    <span className="text-[11px] font-normal text-muted-foreground">(Tùy chọn)</span>
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

                <div className="space-y-1.5">
                  <Label htmlFor="issue-start-date" className="text-xs font-semibold flex items-center gap-1.5 text-foreground">
                    <CalendarIcon className="w-3.5 h-3.5 text-muted-foreground" />
                    <span>Ngày bắt đầu</span>
                    <span className="text-[11px] font-normal text-muted-foreground">(Tùy chọn)</span>
                  </Label>
                  <Input
                    id="issue-start-date"
                    type="date"
                    disabled={!canEdit}
                    value={form.startDate}
                    onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
                    className="h-9 text-xs rounded-xl bg-card font-mono disabled:opacity-80 border-border/80"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="issue-due-date" className="text-xs font-semibold flex items-center gap-1.5 text-foreground">
                    <CalendarIcon className="w-3.5 h-3.5 text-muted-foreground" />
                    <span>Hạn hoàn thành</span>
                    <span className="text-[11px] font-normal text-muted-foreground">(Tùy chọn)</span>
                  </Label>
                  <Input
                    id="issue-due-date"
                    type="date"
                    disabled={!canEdit}
                    value={form.dueDate}
                    onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
                    className="h-9 text-xs rounded-xl bg-card font-mono disabled:opacity-80 border-border/80"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="issue-labels" className="text-xs font-semibold flex items-center gap-1.5 text-foreground">
                    <TagIcon className="w-3.5 h-3.5 text-blue-500" />
                    <span>Labels (Nhãn phân loại)</span>
                    <span className="text-[11px] font-normal text-muted-foreground">(Tùy chọn)</span>
                  </Label>
                  <LabelsMultiSelect
                    id="issue-labels"
                    disabled={!canEdit}
                    value={form.labels}
                    onChange={(newLabels) => setForm((f) => ({ ...f, labels: newLabels }))}
                    availableLabels={availableLabels}
                    placeholder="Chọn hoặc gõ nhãn mới (nhấn Enter hoặc dấu phẩy)..."
                  />
                </div>
              </div>
            </div>
          </div>

          {issue && (
            <Tabs value={activeEvidenceTab} onValueChange={setActiveEvidenceTab} className="space-y-4 pt-1">
              <TabsList className="w-full h-auto min-h-10 justify-start overflow-x-auto rounded-xl bg-muted/60">
                <TabsTrigger value="commits" className="shrink-0 text-xs font-semibold">
                  <GitCommitIcon className="w-3.5 h-3.5" />
                  Commits
                </TabsTrigger>
                <TabsTrigger value="documents" className="shrink-0 text-xs font-semibold">
                  <PaperclipIcon className="w-3.5 h-3.5" />
                  Tài liệu
                </TabsTrigger>
                <TabsTrigger value="contribution" className="shrink-0 text-xs font-semibold">
                  <ShieldCheckIcon className="w-3.5 h-3.5" />
                  Đóng góp
                </TabsTrigger>
              </TabsList>

              <TabsContent value="commits">
                <TaskLinkedCommitsList
                  taskId={issue.id}
                  projectId={projectId}
                  onSelectCommit={handleToggleCommitSha}
                  onSelectAllCommits={handleSelectAllCommitShas}
                  selectedShas={selectedShasList}
                />
              </TabsContent>

              <TabsContent value="documents">
                <TaskEvidencePanel
                  taskId={issue.id}
                  section="documents"
                  isOwnerOrLeader={canEdit}
                />
              </TabsContent>

              <TabsContent value="contribution">
                <TaskEvidencePanel
                  taskId={issue.id}
                  section="contribution"
                  isOwnerOrLeader={canEdit}
                  externalCommitShas={selectedCommitShas}
                />
              </TabsContent>
            </Tabs>
          )}
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
                disabled={isSubmitting || (!isEditing && !form.summary.trim())}
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
                    {isEditing ? "Lưu thay đổi" : "Tạo task"}
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
