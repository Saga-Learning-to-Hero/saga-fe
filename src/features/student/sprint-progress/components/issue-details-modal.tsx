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
  PaperclipIcon,
  ShieldCheckIcon,
  CalendarIcon,
  HistoryIcon,
  SparklesIcon,
} from "lucide-react";
import Link from "next/link";
import { TaskAiIntelligenceSection } from "@/features/ai";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TaskEvidencePanel } from "./task-evidence-panel";
import { TaskWorkSessionControl } from "./task-work-session-control";
import { TaskWorkSessionTimeline } from "./task-work-session-timeline";
import { LabelsMultiSelect } from "./labels-multi-select";
import {
  useCreateProjectTask,
  usePatchProjectTask,
  useDeleteProjectTask,
  useTransitionTask,
  useTaskOptions,
  useProjectTaskDetail,
  useParentTaskOptions,
} from "../hooks/use-project-tasks";
import { useJiraSources } from "@/features/student/project/hooks/use-jira-sources";
import { showErrorToast } from "@/lib/api-error";
import {
  getPersonalIntegrationErrorMessage,
  getTaskLabelErrorMessage,
} from "../lib/personal-integration-error";

function getTodayLocalDateString(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
import { useProjectSprints } from "../hooks/use-project-sprints";
import { useUserIdentities } from "@/features/integrations/hooks/useUserIntegrations";
import { ConfirmActionDialog } from "@/components/common/confirm-action-dialog";
import { isTaskOwnedByCurrentStudent } from "../lib/task-permissions";
import { RequirePersonalIntegrationModal } from "@/features/integrations/components/require-personal-integration-modal";
import {
  type TaskFormErrors,
  validateTaskForm,
} from "../lib/task-form-validation";

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

function normalizePriority(name?: string | null): IssuePriority {
  const upperName = (name || "").toUpperCase();
  if (upperName.includes("HIGHEST") || upperName.includes("BLOCKER")) return "HIGHEST";
  if (upperName.includes("HIGH") || upperName.includes("CRITICAL")) return "HIGH";
  if (upperName.includes("LOW") || upperName.includes("TRIVIAL")) return "LOW";
  return "MEDIUM";
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
  defaultJiraIntegrationId?: string;
  defaultSprintId?: string;
  sprints: Sprint[];
  teamMembers: { id: string; name: string; avatar: string; studentCode: string }[];
  onClose: () => void;
  onSave: (savedIssue: SprintIssue) => void;
  onDelete?: (issueId: string) => void;
  isTeamLeader: boolean;
  currentUserStudentId?: string;
  currentUserStudentCode: string;
  canCreateTask?: boolean;
}

export function IssueDetailsModal({
  isOpen,
  issue,
  projectId,
  isJiraConnected = true,
  defaultJiraIntegrationId,
  defaultSprintId,
  sprints,
  teamMembers,
  onClose,
  onSave,
  onDelete,
  isTeamLeader,
  currentUserStudentId,
  currentUserStudentCode,
  canCreateTask = true,
}: IssueDetailsModalProps) {
  const isEditing = Boolean(issue);
  const isOwner = isTaskOwnedByCurrentStudent(
    issue,
    currentUserStudentId,
    currentUserStudentCode
  );

  const { data: taskDetail } = useProjectTaskDetail(projectId, issue?.id, {
    enabled: Boolean(isOpen && projectId && issue?.id),
  });

  const isSuperseded = Boolean(issue?.superseded || taskDetail?.superseded);
  const canEdit = isSuperseded ? false : (isEditing ? (isTeamLeader || isOwner) : true);

  const { data: jiraSources } = useJiraSources(projectId, {
    enabled: Boolean(isOpen && projectId),
  });
  const {
    jiraIdentities,
    githubIdentities,
    isInitialLoading: isLoadingPersonalIntegrations,
  } = useUserIdentities();
  const activeJiraSources = useMemo(
    () => jiraSources?.filter((s) => s.connectionStatus === "ACTIVE") || [],
    [jiraSources]
  );
  const defaultJiraSourceId =
    activeJiraSources.find((source) => source.integrationId === defaultJiraIntegrationId)
      ?.integrationId || activeJiraSources[0]?.integrationId;

  const [selectedJiraSourceId, setSelectedJiraSourceId] = useState<string | undefined>(
    issue?.jiraIntegrationId || defaultJiraIntegrationId || undefined
  );

  const effectiveJiraIntegrationId =
    selectedJiraSourceId || (!isEditing ? defaultJiraSourceId : (issue?.jiraIntegrationId || taskDetail?.jiraIntegrationId || undefined));

  const { data: taskOptions } = useTaskOptions(projectId, {
    enabled: Boolean(isOpen && projectId && isJiraConnected),
    jiraIntegrationId: effectiveJiraIntegrationId,
  });
  const sourceSprintsQuery = useProjectSprints(projectId, effectiveJiraIntegrationId, {
    enabled: Boolean(isOpen && projectId && effectiveJiraIntegrationId && !isEditing),
  });
  const sourceSprints = useMemo<Sprint[]>(() => {
    if (isEditing || !sourceSprintsQuery.data) return sprints;
    return sourceSprintsQuery.data.map((sprint) => ({
      id: String(sprint.id),
      externalSprintId: sprint.externalSprintId,
      name: sprint.name,
      goal: sprint.goal || "",
      status:
        sprint.state === "active"
          ? "ACTIVE"
          : sprint.state === "closed"
            ? "COMPLETED"
            : "PLANNED",
      startDate: sprint.startDate?.split("T")[0] || "",
      endDate: sprint.endDate?.split("T")[0] || "",
      totalStoryPoints: 0,
      completedStoryPoints: 0,
    }));
  }, [isEditing, sourceSprintsQuery.data, sprints]);

  const { data: parentOptionsData } = useParentTaskOptions(
    projectId,
    { excludeTaskId: issue?.id, size: 50 },
    { enabled: Boolean(isOpen && projectId) }
  );
  const parentOptions = useMemo(() => {
    const list = parentOptionsData?.items || [];
    return [
      { value: "", label: "Không có Task cha (Root Task)" },
      ...list.map((item) => ({
        value: item.id,
        label: `${item.externalKey ? `[${item.externalKey}] ` : ""}${item.title}`,
        subLabel: item.status,
      })),
    ];
  }, [parentOptionsData]);

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

  const currentMember = useMemo(() => {
    return (
      teamMembers.find(
        (m) => Boolean(currentUserStudentCode) && m.studentCode === currentUserStudentCode
      ) || (teamMembers.length > 0 ? teamMembers[0] : undefined)
    );
  }, [teamMembers, currentUserStudentCode]);

  const matchedAssignee = useMemo(() => {
    if (!issue?.assignee) return currentMember || teamMembers[0];
    return (
      teamMembers.find(
        (m) =>
          m.id === issue.assignee?.id ||
          (issue.assignee?.studentCode && m.studentCode === issue.assignee.studentCode) ||
          m.name === issue.assignee?.name
      ) || issue.assignee
    );
  }, [issue, teamMembers, currentMember]);

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

    const initialStartDate = issue
      ? (issue.startDate || taskDetail?.startDate || "")
      : getTodayLocalDateString();

    return {
      key: issue?.key || "SAGA-NEW",
      summary: issue?.summary || "",
      description: issue?.description || "",
      type: issue?.type || ("TASK" as IssueType),
      issueTypeId: undefined as string | undefined,
      priority: issue?.priority || ("MEDIUM" as IssuePriority),
      priorityId: "",
      status: initialStatus,
      storyPoints: typeof issue?.storyPoints === "number" ? String(issue.storyPoints) : "",
      assignee: matchedAssignee,
      assigneeAccountId: initialAssigneeAccountId,
      labels: Array.isArray(issue?.labels) ? issue.labels : [],
      sprintId: initialSprintId,
      startDate: initialStartDate,
      dueDate: issue?.dueDate || taskDetail?.dueDate || "",
      parentTaskId: taskDetail?.parentTask?.id || "",
      jiraIntegrationId:
        issue?.jiraIntegrationId ||
        taskDetail?.jiraIntegrationId ||
        defaultJiraIntegrationId ||
        undefined,
    };
  });

  const displayAssignee = useMemo(() => {
    if (!isEditing) {
      return currentMember;
    }
    return form.assignee;
  }, [isEditing, currentMember, form.assignee]);

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
            ? String(taskDetail.storyPoint)
            : prev.storyPoints,
        sprintId: resolvedSprintId,
        assigneeAccountId: resolvedAccountId || prev.assigneeAccountId,
        labels: Array.isArray(taskDetail.labels) ? taskDetail.labels : prev.labels,
        startDate: taskDetail.startDate ?? prev.startDate,
        dueDate: taskDetail.dueDate ?? prev.dueDate,
        parentTaskId: taskDetail.parentTask?.id ?? prev.parentTaskId,
      }));
    }
  }

  const ownJiraAccountIds = useMemo(
    () =>
      jiraIdentities
        .map((identity) => identity.providerSubject?.trim())
        .filter((id): id is string => Boolean(id)),
    [jiraIdentities]
  );
  const ownAssignableJiraAccountId = taskOptions?.assignableUsers?.find((user) =>
    ownJiraAccountIds.includes(user.accountId)
  )?.accountId;

  const [hasSyncedJiraAssignee, setHasSyncedJiraAssignee] = useState(false);
  if (!hasSyncedJiraAssignee && taskOptions?.assignableUsers && taskOptions.assignableUsers.length > 0) {
    setHasSyncedJiraAssignee(true);
    if (!form.assigneeAccountId) {
      if (!isEditing && !isTeamLeader && ownAssignableJiraAccountId) {
        setForm((prev) => ({ ...prev, assigneeAccountId: ownAssignableJiraAccountId }));
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
      const filteredUsers = assignableUsers.filter((user) => {
        const name = (user.displayName || "").toLowerCase();
        return !name.includes("agent") && !name.includes("bot");
      });

      const jiraOptions = filteredUsers.map((user) => {
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

  const priorityOptions = useMemo(
    () =>
      (taskOptions?.priorities || []).map((priority) => ({
        value: priority.id,
        label: priority.name,
      })),
    [taskOptions?.priorities]
  );
  const resolvedPriorityId =
    form.priorityId ||
    taskOptions?.priorities?.find(
      (priority) => priority.name.toUpperCase() === form.priority.toUpperCase()
    )?.id ||
    "";
  const missingPersonalIntegrations = !isEditing
    ? [
      ...(jiraIdentities.length === 0 ? (["JIRA"] as const) : []),
      ...(githubIdentities.length === 0 ? (["GITHUB"] as const) : []),
    ]
    : [];

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<TaskFormErrors>({});
  const [dateWarning, setDateWarning] = useState<string | null>(null);
  const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] = useState(false);
  const [selectedCommitShas, setSelectedCommitShas] = useState("");
  const [activeEvidenceTab, setActiveEvidenceTab] = useState("timeline");

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

  const handleSubmit = async (
    e?: React.FormEvent,
    hasConfirmedDateWarning = false
  ) => {
    if (e) e.preventDefault();
    if (!canEdit) return;

    const originalSprintId = taskDetail?.sprint?.id
      ? String(taskDetail.sprint.id)
      : (issue?.sprintId || "backlog");
    const selectedSprint = sourceSprints.find((sprint) => sprint.id === form.sprintId);
    const validation = validateTaskForm({
      summary: form.summary,
      description: form.description,
      storyPoints: form.storyPoints,
      sprintId: form.sprintId,
      startDate: form.startDate,
      dueDate: form.dueDate,
      jiraIntegrationId: form.jiraIntegrationId || defaultJiraSourceId,
      activeJiraSourceCount: activeJiraSources.length,
      selectedSprint,
      isSprintAssignmentChanged: !isEditing || form.sprintId !== originalSprintId,
      requireOwnJiraAccount: !isEditing && !isTeamLeader,
      ownJiraAccountId: ownAssignableJiraAccountId,
      missingPersonalIntegrations,
    });
    setFormErrors(validation.errors);
    if (Object.keys(validation.errors).length > 0) return;
    if (validation.dateWarning && !hasConfirmedDateWarning) {
      setDateWarning(validation.dateWarning);
      return;
    }
    setDateWarning(null);

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
            await transitionTaskMutation.mutateAsync({
              projectId,
              taskId: issue.id,
              data: { targetStatus: form.status },
            });
          }

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
            priorityId?: string;
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
            parentTaskId?: string;
            clearParent?: boolean;
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

          if (isTeamLeader && form.assigneeAccountId !== originalAssigneeAccountId) {
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

          const currentPriorityName =
            taskDetail?.priorityDetail?.name || taskDetail?.priority || issue.priority;
          const selectedPriority = taskOptions?.priorities?.find(
            (priority) => priority.id === resolvedPriorityId
          );
          if (
            resolvedPriorityId &&
            selectedPriority &&
            selectedPriority.name.toUpperCase() !== currentPriorityName?.toUpperCase()
          ) {
            patchData.priorityId = resolvedPriorityId;
          }

          const currentPoints =
            typeof taskDetail?.storyPoint === "number" && !Number.isNaN(taskDetail.storyPoint)
              ? taskDetail.storyPoint
              : issue.storyPoints;
          if (
            taskOptions?.estimation?.supported === true &&
            form.storyPoints.trim() !== "" &&
            Number(form.storyPoints) !== currentPoints
          ) {
            patchData.storyPoints = Number(form.storyPoints);
          }

          if (sprintChanged) {
            if (form.sprintId === "backlog") {
              if (originalSprintId !== "backlog") {
                patchData.moveToBacklog = true;
              }
            } else {
              const targetSprint = sourceSprints.find((s) => s.id === form.sprintId);
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

          const originalParentId = taskDetail?.parentTask?.id || "";
          if (form.parentTaskId !== originalParentId) {
            if (!form.parentTaskId) {
              patchData.clearParent = true;
            } else {
              patchData.parentTaskId = form.parentTaskId;
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
          const targetSprint = sourceSprints.find((s) => s.id === form.sprintId);
          const extId = targetSprint?.externalSprintId;
          const sprintExtId =
            form.sprintId === "backlog"
              ? undefined
              : extId && !isNaN(Number(extId))
                ? String(extId)
                : undefined;

          const assigneeAccountId =
            isTeamLeader
              ? form.assigneeAccountId && form.assigneeAccountId.trim()
                ? form.assigneeAccountId.trim()
                : undefined
              : ownAssignableJiraAccountId;

          const res = await createTaskMutation.mutateAsync({
            projectId,
            data: {
              summary: form.summary.trim(),
              description: form.description?.trim() || undefined,
              issueTypeId: selectedIssueTypeId,
              priorityId: resolvedPriorityId || undefined,
              storyPoints: form.storyPoints.trim() ? Number(form.storyPoints) : undefined,
              sprintExternalId: sprintExtId,
              assigneeAccountId,
              labels: form.labels,
              startDate: form.startDate.trim() || undefined,
              dueDate: form.dueDate.trim() || undefined,
              parentTaskId: form.parentTaskId || undefined,
              jiraIntegrationId: form.jiraIntegrationId || defaultJiraSourceId || undefined,
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

      const finalAssignee = !isTeamLeader && !isEditing
        ? {
          id: matchedMember?.id || form.assigneeAccountId,
          studentId:
            matchedMember?.studentCode === currentUserStudentCode
              ? currentUserStudentId || null
              : !isTeamLeader
                ? currentUserStudentId || null
                : null,
          name: matchedUser?.displayName || matchedMember?.name || form.assignee?.name || "Người dùng Jira",
          avatar: matchedMember?.avatar || "",
          studentCode: matchedMember?.studentCode || "",
          accountId: form.assigneeAccountId,
        }
        : {
          id: "unassigned",
          studentId: null,
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
        superseded: issue?.superseded,
        migratedFrom: issue?.migratedFrom,
        migratedTo: issue?.migratedTo,
        jiraIntegrationId: form.jiraIntegrationId || defaultJiraSourceId || issue?.jiraIntegrationId,
        sourceProjectKey: issue?.sourceProjectKey,
      };

      onSave(finalIssue);
      onClose();
    } catch (err: unknown) {
      const personalIntegrationMsg = getPersonalIntegrationErrorMessage(err);
      if (personalIntegrationMsg) {
        showErrorToast(personalIntegrationMsg);
        return;
      }
      const labelNotAllowedMsg = getTaskLabelErrorMessage(err);
      if (labelNotAllowedMsg) {
        showErrorToast(labelNotAllowedMsg);
        return;
      }
      showErrorToast(err instanceof Error ? err.message : "Đã xảy ra lỗi khi lưu task.");
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


  if (!isEditing && !isLoadingPersonalIntegrations && missingPersonalIntegrations.length > 0) {
    return (
      <RequirePersonalIntegrationModal
        isOpen={isOpen}
        onClose={onClose}
        missingProviders={missingPersonalIntegrations.map((provider) => (provider === "JIRA" ? "Jira" : "GitHub"))}
      />
    );
  }

  return (
    <>
      <div
        onClick={onClose}
        className={`fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex animate-in fade-in-0 duration-300 ${isEditing ? "justify-end" : "items-center justify-center p-4"
          }`}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className={`bg-card border-border/80 shadow-lg flex flex-col overflow-hidden animate-in duration-300 ${isEditing
            ? "border-l w-full sm:max-w-2xl md:max-w-3xl lg:max-w-4xl xl:max-w-5xl h-screen slide-in-from-right"
            : "w-full max-w-3xl max-h-[calc(100vh-2rem)] rounded-xl border slide-in-from-bottom-4"
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
            {!canEdit && !isSuperseded && (
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in-0">
                <LockIcon className="w-4 h-4 shrink-0 text-amber-500" />
                <span>
                  Bạn đang xem task của thành viên <strong>{issue?.assignee.name} ({issue?.assignee.studentCode})</strong>. Bạn chỉ có quyền xem thông tin (Chỉ đọc).
                </span>
              </div>
            )}

            {isSuperseded && (
              <div className="p-3.5 rounded-xl bg-muted/60 border border-border text-xs font-semibold flex items-center justify-between gap-2 animate-in fade-in-0">
                <div className="flex items-center gap-2">
                  <HistoryIcon className="w-4 h-4 shrink-0 text-muted-foreground" />
                  <div>
                    <span className="font-bold text-foreground">Thẻ này là dữ liệu lịch sử (Superseded).</span>{" "}
                    <span className="text-muted-foreground">
                      Đầu việc này đã được chuyển giao sang nguồn Jira mới trong đợt Failover.
                    </span>
                  </div>
                </div>
                {(taskDetail?.migratedTo || issue?.migratedTo) && (
                  <span className="font-mono text-xs text-primary px-2 py-1 rounded bg-primary/10 border border-primary/20 shrink-0">
                    Đã chuyển sang: {taskDetail?.migratedTo?.externalKey || issue?.migratedTo?.externalKey || "Task mới"}
                  </span>
                )}
              </div>
            )}

            {(taskDetail?.migratedFrom || issue?.migratedFrom) && (
              <div className="p-2.5 rounded-xl bg-primary/5 border border-primary/20 text-xs flex items-center gap-2">
                <span className="text-muted-foreground">Kế thừa chuyển giao từ:</span>
                <span className="font-mono font-bold text-primary">
                  {taskDetail?.migratedFrom?.externalKey || issue?.migratedFrom?.externalKey}
                </span>
              </div>
            )}



            <div className="space-y-1.5">
              <Label htmlFor="issue-title" className="text-xs font-semibold text-foreground flex items-center justify-between">
                <span>
                  Tên task / Tóm tắt Jira <span className="text-destructive">*</span>
                </span>
                <span className="text-xs font-normal text-muted-foreground">Bắt buộc</span>
              </Label>
              <Input
                id="issue-title"
                type="text"
                required
                maxLength={255}
                aria-invalid={Boolean(formErrors.summary)}
                disabled={!canEdit}
                value={form.summary}
                onChange={(e) => {
                  setForm((f) => ({ ...f, summary: e.target.value }));
                  setFormErrors((errors) => ({ ...errors, summary: undefined }));
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    void handleSubmit();
                  }
                }}
                placeholder="Nhập tên task Jira..."
                className="h-10 text-sm rounded-xl bg-card font-semibold disabled:opacity-80 border-border/80"
              />
              {formErrors.summary && (
                <p className="text-xs font-medium text-destructive">{formErrors.summary}</p>
              )}
            </div>

            <div className="space-y-5">
              <div className="space-y-1.5">
                <div className="space-y-1.5">
                  <Label htmlFor="issue-desc" className="text-xs font-semibold flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <FileTextIcon className="w-3.5 h-3.5 text-primary" />
                      Mô tả chi tiết task
                    </span>
                    <span className="text-xs font-normal text-muted-foreground">(Tùy chọn)</span>
                  </Label>
                  <Textarea
                    id="issue-desc"
                    rows={4}
                    maxLength={10000}
                    aria-invalid={Boolean(formErrors.description)}
                    disabled={!canEdit}
                    value={form.description}
                    onChange={(e) => {
                      setForm((f) => ({ ...f, description: e.target.value }));
                      setFormErrors((errors) => ({ ...errors, description: undefined }));
                    }}
                    placeholder="Nhập yêu cầu kỹ thuật và tiêu chí chấp nhận..."
                    className="text-xs rounded-xl bg-card resize-none disabled:opacity-80 border-border/80 leading-relaxed"
                  />
                  {formErrors.description && (
                    <p className="text-xs font-medium text-destructive">{formErrors.description}</p>
                  )}
                </div>
              </div>

              <div className="p-4 sm:p-5 rounded-xl bg-muted/20 border border-border/60 space-y-4">
                <div className="pb-2 border-b border-border/40">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Thuộc tính Task
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {!isEditing && activeJiraSources.length >= 2 && (
                    <div className="space-y-1.5 sm:col-span-2">
                      <Label htmlFor="jira-source" className="text-xs font-semibold flex items-center gap-1.5 text-foreground">
                        <span>Nguồn Jira (Workspace)</span>
                        <span className="text-xs font-normal text-muted-foreground">(Chọn Jira đích)</span>
                      </Label>
                      <CustomSelect
                        id="jira-source"
                        value={form.jiraIntegrationId || defaultJiraSourceId || ""}
                        onChange={(val) => {
                          setForm((f) => ({
                            ...f,
                            jiraIntegrationId: val,
                            issueTypeId: undefined,
                            priorityId: "",
                            assigneeAccountId: "",
                            sprintId: "backlog",
                          }));
                          setSelectedJiraSourceId(val);
                          setHasSyncedJiraAssignee(false);
                          setFormErrors({});
                        }}
                        options={activeJiraSources.map((source) => ({
                          value: source.integrationId,
                          label: `${source.projectKey ? `[${source.projectKey}] ` : ""}${source.siteName}`,
                          subLabel: source.projectKey ? `Dự án Jira: ${source.projectKey}` : undefined,
                        }))}
                      />
                      {formErrors.jiraIntegrationId && (
                        <p className="text-xs font-medium text-destructive">
                          {formErrors.jiraIntegrationId}
                        </p>
                      )}
                    </div>
                  )}
                  <div className="space-y-1.5">
                    <Label htmlFor="issue-type" className="text-xs font-semibold flex items-center gap-1.5 text-foreground">
                      <span>Loại thẻ</span>
                      {isEditing ? (
                        <span className="text-xs font-normal text-muted-foreground">(Cố định)</span>
                      ) : (
                        <span className="text-xs font-normal text-muted-foreground">(Tùy chọn)</span>
                      )}
                    </Label>
                    <CustomSelect
                      id="issue-type"
                      disabled={!canEdit || isEditing}
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
                    {isEditing && (
                      <p className="text-[11px] text-muted-foreground italic">
                        Muốn đổi loại thẻ thì dùng Move trên Jira
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="issue-status" className="text-xs font-semibold text-foreground">
                      Trạng thái
                    </Label>
                    <CustomSelect
                      id="issue-status"
                      disabled={!canEdit || !isEditing}
                      value={form.status}
                      onChange={(val) => setForm((f) => ({ ...f, status: val as IssueStatus }))}
                      options={[
                        { value: "TODO", label: "TO DO (Cần làm)" },
                        { value: "IN_PROGRESS", label: "IN PROGRESS (Đang làm)" },
                        { value: "IN_REVIEW", label: "IN REVIEW (Đang kiểm thử)" },
                        { value: "DONE", label: "DONE (Hoàn thành)" },
                      ]}
                    />
                    {!isEditing && (
                      <p className="text-[11px] text-muted-foreground">
                        Task mới được tạo ở trạng thái mặc định của Jira.
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="issue-assignee" className="text-xs font-semibold flex items-center gap-1.5 text-foreground">
                      <span>Người thực hiện</span>
                      {!isTeamLeader ? (
                        <span className="text-xs font-normal text-muted-foreground">
                          {!isEditing ? "(Tự động gán cho bạn)" : "(Chỉ Leader mới có thể đổi)"}
                        </span>
                      ) : (
                        <span className="text-xs font-normal text-muted-foreground">(Tùy chọn)</span>
                      )}
                    </Label>
                    {!isTeamLeader ? (
                      <div
                        id="issue-assignee"
                        className="flex items-center gap-2.5 h-9 px-3 rounded-xl border border-border/70 bg-muted/40 text-xs text-foreground select-none"
                      >
                        <Avatar className="w-5 h-5 rounded-full border border-primary/20 shrink-0">
                          <AvatarImage src={displayAssignee?.avatar || undefined} />
                          <AvatarFallback className="text-[9px] font-bold bg-primary/10 text-primary font-mono">
                            {(displayAssignee?.name || "SV").slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium truncate">
                          {displayAssignee?.name || (!isEditing ? "Chính bạn" : "Chưa phân công")}
                        </span>
                        {(displayAssignee?.studentCode || (!isEditing && currentUserStudentCode)) && (
                          <span className="text-xs text-muted-foreground font-mono">
                            ({displayAssignee?.studentCode || currentUserStudentCode})
                          </span>
                        )}
                      </div>
                    ) : (
                      <CustomSelect
                        id="issue-assignee"
                        disabled={!canEdit || !isTeamLeader}
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
                    )}
                    {formErrors.assigneeAccountId && (
                      <div className="flex items-center justify-between gap-2 text-xs font-medium text-destructive mt-1">
                        <span>{formErrors.assigneeAccountId}</span>
                        <Link href="/profile/integrations" className="shrink-0 underline underline-offset-2">
                          Kiểm tra tích hợp
                        </Link>
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="issue-sprint" className="text-xs font-semibold flex items-center gap-1.5 text-foreground">
                      <span>Sprint</span>
                      <span className="text-xs font-normal text-muted-foreground">(Tùy chọn)</span>
                    </Label>
                    <CustomSelect
                      id="issue-sprint"
                      disabled={!canEdit}
                      value={form.sprintId}
                      onChange={(val) => {
                        setForm((f) => ({ ...f, sprintId: val }));
                        setFormErrors((errors) => ({ ...errors, sprintId: undefined }));
                      }}
                      options={[
                        {
                          value: "backlog",
                          label: "Backlog (Chưa gán vào Sprint)",
                          subLabel: "Product Backlog",
                        },
                        ...sourceSprints.map((s) => ({
                          value: s.id,
                          label: s.name,
                          subLabel: s.startDate && s.endDate
                            ? `${s.startDate} – ${s.endDate} · ${s.status}`
                            : `Chưa thiết lập lịch · ${s.status}`,
                        })),
                      ]}
                    />
                    {sourceSprintsQuery.isLoading && !isEditing && (
                      <p className="text-[11px] text-muted-foreground">Đang tải Sprint của nguồn Jira...</p>
                    )}
                    {formErrors.sprintId && (
                      <p className="text-xs font-medium text-destructive">{formErrors.sprintId}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="issue-sp" className="text-xs font-semibold flex items-center gap-1.5 text-foreground">
                      <span>Story Points</span>
                      <span className="text-xs font-normal text-muted-foreground">(Tùy chọn)</span>
                    </Label>
                    <Input
                      id="issue-sp"
                      type="number"
                      min={0}
                      max={100}
                      step={1}
                      aria-invalid={Boolean(formErrors.storyPoints)}
                      disabled={!canEdit}
                      value={form.storyPoints}
                      onChange={(e) => {
                        setForm((f) => ({ ...f, storyPoints: e.target.value }));
                        setFormErrors((errors) => ({ ...errors, storyPoints: undefined }));
                      }}
                      className="h-9 text-xs rounded-xl bg-card font-mono disabled:opacity-80 border-border/80"
                    />
                    {formErrors.storyPoints && (
                      <p className="text-xs font-medium text-destructive">{formErrors.storyPoints}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="issue-priority" className="text-xs font-semibold flex items-center gap-1.5 text-foreground">
                      <span>Mức ưu tiên</span>
                      <span className="text-xs font-normal text-muted-foreground">(Tùy chọn)</span>
                    </Label>
                    <CustomSelect
                      id="issue-priority"
                      disabled={!canEdit || priorityOptions.length === 0}
                      value={resolvedPriorityId}
                      onChange={(val) => {
                        const selected = taskOptions?.priorities?.find((priority) => priority.id === val);
                        setForm((f) => ({
                          ...f,
                          priorityId: val,
                          priority: normalizePriority(selected?.name),
                        }));
                      }}
                      placeholder="Dùng mức ưu tiên mặc định của Jira"
                      options={priorityOptions}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="issue-start-date" className="text-xs font-semibold flex items-center gap-1.5 text-foreground">
                      <CalendarIcon className="w-3.5 h-3.5 text-muted-foreground" />
                      <span>Ngày bắt đầu</span>
                      <span className="text-xs font-normal text-muted-foreground">(Tùy chọn)</span>
                    </Label>
                    <Input
                      id="issue-start-date"
                      type="date"
                      aria-invalid={Boolean(formErrors.startDate)}
                      disabled={!canEdit}
                      value={form.startDate}
                      onChange={(e) => {
                        setForm((f) => ({ ...f, startDate: e.target.value }));
                        setFormErrors((errors) => ({ ...errors, startDate: undefined }));
                      }}
                      className="h-9 text-xs rounded-xl bg-card font-mono disabled:opacity-80 border-border/80"
                    />
                    {formErrors.startDate && (
                      <p className="text-xs font-medium text-destructive">{formErrors.startDate}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="issue-due-date" className="text-xs font-semibold flex items-center gap-1.5 text-foreground">
                      <CalendarIcon className="w-3.5 h-3.5 text-muted-foreground" />
                      <span>Hạn hoàn thành</span>
                      <span className="text-xs font-normal text-muted-foreground">(Tùy chọn)</span>
                    </Label>
                    <Input
                      id="issue-due-date"
                      type="date"
                      min={form.startDate || undefined}
                      aria-invalid={Boolean(formErrors.dueDate)}
                      disabled={!canEdit}
                      value={form.dueDate}
                      onChange={(e) => {
                        setForm((f) => ({ ...f, dueDate: e.target.value }));
                        setFormErrors((errors) => ({ ...errors, dueDate: undefined }));
                      }}
                      className="h-9 text-xs rounded-xl bg-card font-mono disabled:opacity-80 border-border/80"
                    />
                    {formErrors.dueDate && (
                      <p className="text-xs font-medium text-destructive">{formErrors.dueDate}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="issue-parent-task" className="text-xs font-semibold flex items-center gap-1.5 text-foreground">
                      <span>Task cha</span>
                      <span className="text-xs font-normal text-muted-foreground">(Tùy chọn)</span>
                    </Label>
                    <CustomSelect
                      id="issue-parent-task"
                      disabled={!canEdit}
                      value={form.parentTaskId}
                      onChange={(val) => setForm((f) => ({ ...f, parentTaskId: val }))}
                      placeholder="Chọn Task cha..."
                      options={parentOptions}
                    />
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="issue-labels" className="text-xs font-semibold flex items-center gap-1.5 text-foreground">
                      <TagIcon className="w-3.5 h-3.5 text-blue-500" />
                      <span>Nhãn phân loại</span>
                      <span className="text-xs font-normal text-muted-foreground">(Tùy chọn)</span>
                    </Label>
                    <LabelsMultiSelect
                      id="issue-labels"
                      disabled={!canEdit}
                      value={form.labels}
                      onChange={(newLabels) => {
                        const regularLabels = newLabels.filter(
                          (label) => !label.toLowerCase().startsWith("saga:")
                        );
                        const sagaLabels = newLabels.filter((label) =>
                          label.toLowerCase().startsWith("saga:")
                        );
                        setForm((f) => ({
                          ...f,
                          labels: [...regularLabels, ...sagaLabels.slice(-1)],
                        }));
                      }}
                      availableLabels={taskOptions?.labels || [
                        "saga:code",
                        "saga:test",
                        "saga:document",
                        "saga:research",
                      ]}
                      allowCustom={false}
                      placeholder="Chọn một nhãn SAGA..."
                    />
                  </div>
                </div>
              </div>

              {taskDetail?.subtasks && taskDetail.subtasks.length > 0 && (
                <div className="p-4 sm:p-5 rounded-xl bg-muted/20 border border-border/60 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-border/40">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                      <span>Danh sách Task con (Subtasks)</span>
                      <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded-md border border-border font-semibold text-foreground">
                        {taskDetail.subtasks.length}
                      </span>
                    </h4>
                  </div>
                  <div className="space-y-1.5">
                    {taskDetail.subtasks.map((sub) => (
                      <div
                        key={sub.id}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-card border border-border/60 text-xs"
                      >
                        <span className="font-medium text-foreground truncate mr-2">
                          {sub.title}
                        </span>
                        <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-muted/50 border border-border text-muted-foreground shrink-0 font-semibold">
                          {sub.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {issue && (
              <Tabs value={activeEvidenceTab} onValueChange={setActiveEvidenceTab} className="space-y-4 pt-1">
                <TabsList className="w-full h-auto min-h-10 justify-start overflow-x-auto rounded-xl bg-muted/60">
                  <TabsTrigger value="timeline" className="shrink-0 text-xs font-semibold">
                    <HistoryIcon className="w-3.5 h-3.5" />
                    Dòng thời gian & Minh chứng
                  </TabsTrigger>
                  <TabsTrigger value="documents" className="shrink-0 text-xs font-semibold">
                    <PaperclipIcon className="w-3.5 h-3.5" />
                    Tài liệu
                  </TabsTrigger>
                  <TabsTrigger value="contribution" className="shrink-0 text-xs font-semibold">
                    <ShieldCheckIcon className="w-3.5 h-3.5" />
                    Đóng góp
                  </TabsTrigger>
                  <TabsTrigger value="ai" className="shrink-0 text-xs font-semibold text-primary">
                    <SparklesIcon className="w-3.5 h-3.5" />
                    Trí tuệ nhân tạo (AI)
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="timeline">
                  <TaskWorkSessionTimeline
                    projectId={projectId}
                    taskId={issue.id}
                    onSelectCommit={handleToggleCommitSha}
                    onSelectAllCommits={handleSelectAllCommitShas}
                    onContinueToConfirmation={() => setActiveEvidenceTab("contribution")}
                    selectedShas={selectedShasList}
                    canSelectCommit={canEdit}
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
                    onRequestCommitSelection={() => setActiveEvidenceTab("timeline")}
                    onConfirmationSuccess={() => setSelectedCommitShas("")}
                  />
                </TabsContent>

                <TabsContent value="ai">
                  <TaskAiIntelligenceSection
                    projectId={projectId}
                    taskId={issue.id}
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
                onClick={() => setIsDeleteConfirmationOpen(true)}
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
                  disabled={
                    isSubmitting ||
                    isLoadingPersonalIntegrations ||
                    (!isEditing && (!form.summary.trim() || missingPersonalIntegrations.length > 0)) ||
                    (!isEditing && !canCreateTask)
                  }
                  title={
                    !isEditing && !canCreateTask
                      ? "Cần liên kết tài khoản Jira và GitHub cá nhân để tạo task"
                      : undefined
                  }
                  className="h-9 text-xs font-bold rounded-xl gap-2 cursor-pointer shadow-xs bg-blue-600 hover:bg-blue-700 text-white px-5 disabled:opacity-50 disabled:cursor-not-allowed"
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
      <ConfirmActionDialog
        isOpen={Boolean(dateWarning)}
        onClose={() => setDateWarning(null)}
        onConfirm={() => void handleSubmit(undefined, true)}
        title="Lịch Task nằm ngoài Sprint"
        description={dateWarning || undefined}
        confirmText="Vẫn lưu Task"
        loadingText="Đang lưu..."
        confirmVariant="default"
        isLoading={isSubmitting}
        icon={<CalendarIcon className="size-5" />}
        iconClassName="bg-amber-500/10 text-amber-600"
      />
      <ConfirmActionDialog
        isOpen={isDeleteConfirmationOpen}
        onClose={() => setIsDeleteConfirmationOpen(false)}
        onConfirm={() => void handleDeleteTask()}
        title="Xóa Task khỏi Jira?"
        description="Task chỉ được xóa khi chưa có phiên làm việc, xác nhận đóng góp hoặc Task con. Thao tác này không thể hoàn tác."
        itemName={issue?.key}
        confirmText="Xóa Task"
        loadingText="Đang xóa..."
        isLoading={deleteTaskMutation.isPending}
      />
    </>
  );
}
