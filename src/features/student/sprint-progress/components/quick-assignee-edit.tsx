"use client";

import { useState, useMemo } from "react";
import { Loader2Icon, CheckIcon, UserXIcon } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { getAssigneeAvatarClass, getAssigneeInitials } from "../lib/assignee-avatar";
import { usePatchProjectTask } from "../hooks/use-project-tasks";

export interface AssigneeMemberInfo {
  id: string;
  name: string;
  avatar?: string;
  studentCode?: string;
  accountId?: string | null;
}

export interface JiraAssignableUserInfo {
  accountId: string;
  displayName: string;
  avatarUrl?: string;
}

interface QuickAssigneeEditProps {
  issueId: string;
  issueKey: string;
  currentAssignee: {
    id: string;
    name: string;
    avatar?: string;
    studentCode?: string;
    accountId?: string | null;
  };
  teamMembers?: AssigneeMemberInfo[];
  assignableUsers?: JiraAssignableUserInfo[];
  projectId?: string | null;
  isTeamLeader: boolean;
}

export function QuickAssigneeEdit({
  issueId,
  issueKey,
  currentAssignee,
  teamMembers = [],
  assignableUsers = [],
  projectId,
  isTeamLeader,
}: QuickAssigneeEditProps) {
  const [isOpen, setIsOpen] = useState(false);
  const patchTaskMutation = usePatchProjectTask();

  const isUnassigned = !currentAssignee.name || currentAssignee.name === "Chưa phân công";

  const renderCurrentAvatar = () => (
    <Avatar title={currentAssignee.name} className="w-5.5 h-5.5 border shrink-0">
      <AvatarFallback
        className={`text-[8px] font-bold ${isUnassigned
          ? "bg-muted text-muted-foreground"
          : getAssigneeAvatarClass(currentAssignee.id)
          }`}
      >
        {isUnassigned ? "?" : getAssigneeInitials(currentAssignee.name)}
      </AvatarFallback>
    </Avatar>
  );

  const assigneeList = useMemo(() => {
    if (assignableUsers && assignableUsers.length > 0) {
      const filteredUsers = assignableUsers.filter((user) => {
        const name = (user.displayName || "").toLowerCase();
        return !name.includes("agent") && !name.includes("bot");
      });

      return filteredUsers.map((user) => {
        const cleanDisplayName = (user.displayName || "").toLowerCase().trim();
        const matched = teamMembers.find((m) => {
          const cleanMemberName = (m.name || "").toLowerCase().trim();
          return (
            cleanDisplayName === cleanMemberName ||
            cleanDisplayName.includes(cleanMemberName) ||
            cleanMemberName.includes(cleanDisplayName) ||
            (m.studentCode && cleanDisplayName.includes(m.studentCode.toLowerCase().trim()))
          );
        });

        return {
          accountId: user.accountId,
          displayName: user.displayName,
          subLabel: matched?.studentCode || "Tài khoản Jira",
          studentCode: matched?.studentCode,
          identifier: matched?.studentCode || matched?.id || user.accountId,
        };
      });
    }

    return teamMembers.map((member) => ({
      accountId: member.accountId || null,
      displayName: member.name,
      subLabel: member.studentCode || "Thành viên",
      studentCode: member.studentCode,
      identifier: member.studentCode || member.id,
    }));
  }, [assignableUsers, teamMembers]);

  if (!isTeamLeader || !projectId) {
    return renderCurrentAvatar();
  }

  const handleSelectAssignee = async (targetAccountId: string | null) => {
    if (patchTaskMutation.isPending) return;
    try {
      if (!targetAccountId) {
        await patchTaskMutation.mutateAsync({
          projectId,
          taskId: issueId,
          data: { clearAssignee: true },
        });
      } else {
        await patchTaskMutation.mutateAsync({
          projectId,
          taskId: issueId,
          data: { assigneeAccountId: targetAccountId },
        });
      }
      setIsOpen(false);
    } catch { }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger
        type="button"
        onClick={(e) => e.stopPropagation()}
        className="relative rounded-full hover:ring-2 hover:ring-primary/50 cursor-pointer transition-all shrink-0 p-0.5"
        title={`Người thực hiện: ${currentAssignee.name} (Nhấn để đổi - Trưởng nhóm)`}
      >
        {patchTaskMutation.isPending ? (
          <div className="w-5.5 h-5.5 rounded-full bg-primary/10 flex items-center justify-center">
            <Loader2Icon className="w-3.5 h-3.5 animate-spin text-primary" />
          </div>
        ) : (
          renderCurrentAvatar()
        )}
      </PopoverTrigger>

      <PopoverContent
        align="end"
        side="bottom"
        sideOffset={6}
        className="w-64 p-2 space-y-2 z-50 bg-card border-border/80 shadow-xl rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border/60 px-2 py-1">
          <span className="text-xs font-bold text-foreground">
            Phân công người thực hiện
          </span>
          <span className="font-mono text-[10px] font-bold text-primary px-1.5 py-0.2 rounded bg-primary/10 border border-primary/20">
            {issueKey}
          </span>
        </div>

        <div className="max-h-56 overflow-y-auto space-y-0.5 custom-scrollbar pr-0.5">
          <button
            type="button"
            disabled={patchTaskMutation.isPending}
            onClick={() => void handleSelectAssignee(null)}
            className={`w-full flex items-center justify-between gap-2 px-2 py-1.5 rounded-xl text-xs text-left cursor-pointer transition-colors ${isUnassigned
              ? "bg-primary/10 text-primary font-semibold"
              : "hover:bg-muted text-muted-foreground hover:text-foreground"
              }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-5.5 h-5.5 rounded-full bg-muted border flex items-center justify-center shrink-0">
                <UserXIcon className="w-3 h-3 text-muted-foreground" />
              </div>
              <div className="min-w-0">
                <p className="truncate font-medium text-xs">Chưa phân công</p>
                <p className="text-[10px] text-muted-foreground font-mono">Unassigned</p>
              </div>
            </div>
            {isUnassigned && <CheckIcon className="w-3.5 h-3.5 text-primary shrink-0" />}
          </button>

          {assigneeList.map((item) => {
            const isSelected =
              (item.accountId && currentAssignee.accountId === item.accountId) ||
              (item.studentCode && currentAssignee.studentCode === item.studentCode) ||
              currentAssignee.name === item.displayName;

            return (
              <button
                key={item.accountId || item.identifier}
                type="button"
                disabled={patchTaskMutation.isPending}
                onClick={() => void handleSelectAssignee(item.accountId)}
                className={`w-full flex items-center justify-between gap-2 px-2 py-1.5 rounded-xl text-xs text-left cursor-pointer transition-colors ${isSelected
                  ? "bg-primary/10 text-primary font-semibold"
                  : "hover:bg-muted text-foreground"
                  }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Avatar className="w-5.5 h-5.5 border shrink-0">
                    <AvatarFallback
                      className={`text-[8px] font-bold ${getAssigneeAvatarClass(item.identifier)}`}
                    >
                      {getAssigneeInitials(item.displayName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-xs text-foreground">{item.displayName}</p>
                    <p className="text-[10px] text-muted-foreground font-mono">
                      {item.subLabel}
                    </p>
                  </div>
                </div>
                {isSelected && <CheckIcon className="w-3.5 h-3.5 text-primary shrink-0" />}
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
