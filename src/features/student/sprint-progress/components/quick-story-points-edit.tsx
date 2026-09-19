"use client";

import { useState } from "react";
import { Loader2Icon, CheckIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { usePatchProjectTask } from "../hooks/use-project-tasks";

const COMMON_STORY_POINTS = [0, 1, 2, 3, 5, 8, 13, 21];

interface QuickStoryPointsEditProps {
  issueId: string;
  issueKey: string;
  storyPoints: number;
  projectId?: string | null;
  isTeamLeader: boolean;
}

export function QuickStoryPointsEdit({
  issueId,
  issueKey,
  storyPoints,
  projectId,
  isTeamLeader,
}: QuickStoryPointsEditProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [customValue, setCustomValue] = useState<string>(String(storyPoints));
  const patchTaskMutation = usePatchProjectTask();

  if (!isTeamLeader || !projectId) {
    return (
      <Badge variant="secondary" className="font-mono text-[10px] px-2 py-0.5">
        {storyPoints} SP
      </Badge>
    );
  }

  const handleSelectPoints = async (points: number) => {
    if (patchTaskMutation.isPending) return;
    try {
      await patchTaskMutation.mutateAsync({
        projectId,
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
    if (Number.isNaN(parsed) || parsed < 0) return;
    try {
      await patchTaskMutation.mutateAsync({
        projectId,
        taskId: issueId,
        data: { storyPoints: Math.round(parsed) },
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
          setCustomValue(String(storyPoints));
        }
      }}
    >
      <PopoverTrigger
        type="button"
        onClick={(e) => e.stopPropagation()}
        className="inline-flex items-center gap-1 font-mono text-[10px] font-bold px-2 py-0.5 rounded-md border border-border/70 bg-muted/60 hover:bg-primary/10 hover:text-primary hover:border-primary/50 cursor-pointer transition-colors"
        title="Nhấn để đổi Story Points (Trưởng nhóm)"
      >
        {patchTaskMutation.isPending ? (
          <Loader2Icon className="w-3 h-3 animate-spin text-primary" />
        ) : (
          <span>{storyPoints} SP</span>
        )}
      </PopoverTrigger>

      <PopoverContent
        align="end"
        side="bottom"
        sideOffset={6}
        className="w-56 p-3 space-y-3 z-50 bg-card border-border/80 shadow-xl rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border/60 pb-1.5">
          <span className="text-xs font-bold text-foreground">
            Story Points
          </span>
          <span className="font-mono text-[10px] font-bold text-primary px-1.5 py-0.2 rounded bg-primary/10 border border-primary/20">
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
      </PopoverContent>
    </Popover>
  );
}
