"use client";

import { useMemo, useState } from "react";
import { Loader2Icon, CheckIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { usePatchProjectTask, useProjectTasksData } from "../hooks/use-project-tasks";
import type { IssueTypeLevel } from "../types/jira-task-types";
import { normalizeIssueTypeLevel } from "../lib/issue-type-rules";
import {
  canQuickEditContributionPoints,
  formatIssuePointBadge,
  getMaxEditableShare,
  getRemainingPercent,
  getSubtaskPercent,
  isSubtaskShareValue,
  sumSiblingUsedPoints,
} from "../lib/subtask-allocation";

const COMMON_STORY_POINTS = [0, 1, 2, 3, 5, 8, 13, 21];
const SUBTASK_SHARE_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

interface QuickStoryPointsEditProps {
  issueId: string;
  issueKey: string;
  storyPoints: number | null;
  issueTypeLevel?: IssueTypeLevel | string | null;
  parentTaskId?: string | null;
  projectId?: string | null;
  isTeamLeader: boolean;
  isOwner?: boolean;
}

export function QuickStoryPointsEdit({
  issueId,
  issueKey,
  storyPoints,
  issueTypeLevel,
  parentTaskId,
  projectId,
  isTeamLeader,
  isOwner = false,
}: QuickStoryPointsEditProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [customValue, setCustomValue] = useState<string>(
    typeof storyPoints === "number" ? String(storyPoints) : ""
  );
  const patchTaskMutation = usePatchProjectTask();
  const tasksQuery = useProjectTasksData(projectId);
  const level = normalizeIssueTypeLevel(issueTypeLevel);
  const canEditLevel = canQuickEditContributionPoints(level);
  const canEdit = Boolean(projectId && canEditLevel && (isTeamLeader || isOwner));
  const badgeLabel = formatIssuePointBadge(level, storyPoints);

  const siblingUsed = useMemo(() => {
    if (level !== "SUBTASK" || !parentTaskId) return 0;
    return sumSiblingUsedPoints(tasksQuery.data ?? [], parentTaskId, issueId);
  }, [issueId, level, parentTaskId, tasksQuery.data]);

  const maxShare = getMaxEditableShare(siblingUsed);

  if (!canEdit) {
    return (
      <Badge variant="secondary" className="font-mono text-xs px-2 py-0.5">
        {badgeLabel}
      </Badge>
    );
  }

  const handleSelectPoints = async (points: number) => {
    if (patchTaskMutation.isPending) return;
    if (level === "SUBTASK" && (points > maxShare || !isSubtaskShareValue(points))) return;
    try {
      await patchTaskMutation.mutateAsync({
        projectId: projectId!,
        taskId: issueId,
        data: { storyPoints: points },
      });
      setIsOpen(false);
    } catch { }
  };

  const handleCustomSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (patchTaskMutation.isPending) return;
    const parsed = Number(customValue);
    if (level === "SUBTASK") {
      if (!isSubtaskShareValue(parsed) || parsed > maxShare) return;
    } else if (Number.isNaN(parsed) || parsed < 0 || parsed > 100 || !Number.isInteger(parsed)) {
      return;
    }
    try {
      await patchTaskMutation.mutateAsync({
        projectId: projectId!,
        taskId: issueId,
        data: { storyPoints: parsed },
      });
      setIsOpen(false);
    } catch { }
  };

  return (
    <Popover
      open={isOpen}
      onOpenChange={(next) => {
        setIsOpen(next);
        if (next) {
          setCustomValue(typeof storyPoints === "number" ? String(storyPoints) : "");
        }
      }}
    >
      <PopoverTrigger
        type="button"
        onClick={(e) => e.stopPropagation()}
        className="inline-flex items-center gap-1 font-mono text-xs font-bold px-2 py-0.5 rounded-md border border-border/70 bg-muted/60 hover:bg-primary/10 hover:text-primary hover:border-primary/50 cursor-pointer transition-colors"
        title={
          level === "SUBTASK"
            ? isTeamLeader
              ? "Nhấn để đổi tỷ trọng Subtask (Trưởng nhóm)"
              : "Nhấn để đổi tỷ trọng Subtask"
            : isTeamLeader
              ? "Nhấn để đổi Story Points (Trưởng nhóm)"
              : "Nhấn để đổi Story Points"
        }
      >
        {patchTaskMutation.isPending ? (
          <Loader2Icon className="w-3 h-3 animate-spin text-primary" />
        ) : (
          <span>{badgeLabel}</span>
        )}
      </PopoverTrigger>

      <PopoverContent
        align="end"
        side="bottom"
        sideOffset={6}
        className="w-56 p-3 space-y-3 z-50 bg-card border-border/80 shadow-md rounded-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {level === "SUBTASK" ? (
          <>
            <div className="flex items-center justify-between border-b border-border/60 pb-1.5">
              <span className="text-xs font-bold text-foreground">Tỷ trọng</span>
              <span className="font-mono text-xs font-bold text-primary px-1.5 py-0.2 rounded bg-primary/10 border border-primary/20">
                {issueKey}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Còn {getRemainingPercent(siblingUsed)}% ({maxShare}/10). Hiện{" "}
              {isSubtaskShareValue(storyPoints) ? `${getSubtaskPercent(storyPoints)}%` : "chưa phân bổ"}.
            </p>
            {maxShare <= 0 ? (
              <p className="text-[11px] font-medium text-destructive">
                Task cha đã phân bổ hết 100% cho các Subtask.
              </p>
            ) : (
              <div className="grid grid-cols-5 gap-1.5">
                {SUBTASK_SHARE_OPTIONS.map((pts) => {
                  const isSelected = pts === storyPoints;
                  const disabled = patchTaskMutation.isPending || pts > maxShare;
                  return (
                    <Button
                      key={pts}
                      type="button"
                      variant={isSelected ? "default" : "outline"}
                      size="sm"
                      disabled={disabled}
                      onClick={() => void handleSelectPoints(pts)}
                      className={`h-7 text-xs font-mono font-bold cursor-pointer rounded-lg p-0 ${isSelected ? "bg-primary text-primary-foreground" : "hover:bg-primary/10"}`}
                    >
                      {getSubtaskPercent(pts)}%
                    </Button>
                  );
                })}
              </div>
            )}
          </>
        ) : (
          <>
            <div className="flex items-center justify-between border-b border-border/60 pb-1.5">
              <span className="text-xs font-bold text-foreground">
                Story Points
              </span>
              <span className="font-mono text-xs font-bold text-primary px-1.5 py-0.2 rounded bg-primary/10 border border-primary/20">
                {issueKey}
              </span>
            </div>

            <div className="grid grid-cols-4 gap-1.5">
              {COMMON_STORY_POINTS.map((pts) => {
                const isSelected = pts === storyPoints;
                return (
                  <Button
                    key={pts}
                    type="button"
                    variant={isSelected ? "default" : "outline"}
                    size="sm"
                    disabled={patchTaskMutation.isPending}
                    onClick={() => void handleSelectPoints(pts)}
                    className={`h-7 text-xs font-mono font-bold cursor-pointer rounded-lg p-0 ${isSelected ? "bg-primary text-primary-foreground" : "hover:bg-primary/10"
                      }`}
                  >
                    {pts}
                  </Button>
                );
              })}
            </div>

            <form onSubmit={handleCustomSubmit} className="flex items-center gap-1.5 pt-1 border-t border-border/60">
              <Input
                type="number"
                min={0}
                max={100}
                value={customValue}
                onChange={(e) => setCustomValue(e.target.value)}
                disabled={patchTaskMutation.isPending}
                placeholder="Tùy chọn..."
                className="h-7 text-xs font-mono rounded-lg px-2"
              />
              <Button
                type="submit"
                size="sm"
                disabled={patchTaskMutation.isPending || !customValue.trim()}
                className="h-7 px-2.5 text-xs font-bold rounded-lg cursor-pointer shrink-0"
              >
                {patchTaskMutation.isPending ? (
                  <Loader2Icon className="w-3 h-3 animate-spin" />
                ) : (
                  <CheckIcon className="w-3.5 h-3.5" />
                )}
              </Button>
            </form>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}
