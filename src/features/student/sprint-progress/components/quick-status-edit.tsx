"use client";

import { useState } from "react";
import { Loader2Icon, CheckIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { IssueStatus } from "../types/sprint-progress";

interface StatusOption {
  value: IssueStatus;
  label: string;
  badgeClass: string;
  dotClass: string;
}

const STATUS_OPTIONS: StatusOption[] = [
  {
    value: "TODO",
    label: "TO DO (Cần làm)",
    badgeClass: "bg-muted text-muted-foreground border-border text-[10px] font-medium",
    dotClass: "bg-muted-foreground",
  },
  {
    value: "IN_PROGRESS",
    label: "IN PROGRESS (Đang làm)",
    badgeClass: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30 font-bold text-[10px]",
    dotClass: "bg-blue-500",
  },
  {
    value: "IN_REVIEW",
    label: "IN REVIEW (Chờ kiểm thử)",
    badgeClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 font-bold text-[10px]",
    dotClass: "bg-amber-500",
  },
  {
    value: "DONE",
    label: "DONE (Hoàn thành)",
    badgeClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 font-bold text-[10px]",
    dotClass: "bg-emerald-500",
  },
];

interface QuickStatusEditProps {
  issueId: string;
  issueKey: string;
  status: IssueStatus;
  isTeamLeader: boolean;
  isOwner: boolean;
  onStatusChange?: (issueId: string, newStatus: IssueStatus) => Promise<void> | void;
  disabled?: boolean;
}

export function QuickStatusEdit({
  issueId,
  issueKey,
  status,
  isTeamLeader,
  isOwner,
  onStatusChange,
  disabled = false,
}: QuickStatusEditProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const canEdit = (isTeamLeader || isOwner) && !disabled && Boolean(onStatusChange);

  const currentOption =
    STATUS_OPTIONS.find((opt) => opt.value === status) || {
      value: status,
      label: status,
      badgeClass: "bg-muted text-muted-foreground border-border text-[10px] font-medium",
      dotClass: "bg-muted-foreground",
    };

  const renderBadge = () => (
    <Badge
      variant="outline"
      className={`${currentOption.badgeClass} shrink-0 transition-all ${canEdit
          ? "cursor-pointer hover:ring-2 hover:ring-primary/40 active:scale-95"
          : "cursor-default"
        }`}
    >
      {isUpdating ? (
        <Loader2Icon className="w-3 h-3 animate-spin mr-1" />
      ) : (
        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${currentOption.dotClass}`} />
      )}
      {status}
    </Badge>
  );

  if (!canEdit) {
    return (
      <div title="Chỉ Trưởng nhóm hoặc Người thực hiện mới có quyền đổi trạng thái">
        {renderBadge()}
      </div>
    );
  }

  const handleSelectStatus = async (newStatus: IssueStatus) => {
    if (newStatus === status) {
      setIsOpen(false);
      return;
    }

    if (!onStatusChange) return;

    try {
      setIsUpdating(true);
      await onStatusChange(issueId, newStatus);
      setIsOpen(false);
    } catch {
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger
        type="button"
        disabled={isUpdating}
        onClick={(e) => e.stopPropagation()}
        title="Nhấn để đổi trạng thái"
        className="shrink-0 p-0 border-0 bg-transparent"
      >
        {renderBadge()}
      </PopoverTrigger>

      <PopoverContent
        align="end"
        side="bottom"
        sideOffset={6}
        className="w-56 p-2 space-y-2 z-50 bg-card border-border/80 shadow-xl rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border/60 px-2 py-1">
          <span className="text-xs font-bold text-foreground">Đổi trạng thái</span>
          <span className="font-mono text-[10px] font-bold text-primary px-1.5 py-0.2 rounded bg-primary/10 border border-primary/20">
            {issueKey}
          </span>
        </div>

        <div className="space-y-1">
          {STATUS_OPTIONS.map((opt) => {
            const isSelected = opt.value === status;
            return (
              <button
                key={opt.value}
                type="button"
                disabled={isUpdating}
                onClick={() => void handleSelectStatus(opt.value)}
                className={`w-full flex items-center justify-between gap-2 px-2.5 py-2 rounded-xl text-xs text-left cursor-pointer transition-colors ${isSelected
                    ? "bg-primary/10 text-primary font-semibold"
                    : "hover:bg-muted text-foreground"
                  }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${opt.dotClass}`} />
                  <span className="truncate">{opt.label}</span>
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
