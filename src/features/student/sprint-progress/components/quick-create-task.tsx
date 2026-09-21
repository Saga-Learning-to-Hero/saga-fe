"use client";

import { useState, useRef, useEffect } from "react";
import { PlusIcon, Loader2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useCreateProjectTask } from "../hooks/use-project-tasks";

interface QuickCreateTaskProps {
  projectId?: string | null;
  jiraIntegrationId?: string;
  sprintId?: string;
  sprintExternalId?: string;
  sprintName?: string;
  canCreate: boolean;
  onOpenFullModal?: () => void;
}

export function QuickCreateTask({
  projectId,
  jiraIntegrationId,
  sprintId,
  sprintExternalId,
  sprintName,
  canCreate,
  onOpenFullModal,
}: QuickCreateTaskProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [summary, setSummary] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const createTaskMutation = useCreateProjectTask();

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        if (!createTaskMutation.isPending) {
          setIsOpen(false);
          setErrorMessage(null);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, createTaskMutation.isPending]);

  if (!canCreate) {
    return null;
  }

  const handleCancel = () => {
    if (createTaskMutation.isPending) return;
    setIsOpen(false);
    setErrorMessage(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      void handleSubmit();
    } else if (e.key === "Escape") {
      e.preventDefault();
      handleCancel();
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (createTaskMutation.isPending) return;

    const trimmed = summary.trim();
    if (!trimmed) return;

    if (!projectId) {
      toast.error("Không tìm thấy thông tin dự án.");
      return;
    }

    const isSprint = Boolean(sprintId && sprintId !== "backlog");
    let targetExternalSprintId: string | undefined;

    if (isSprint) {
      if (!sprintExternalId || isNaN(Number(sprintExternalId))) {
        const msg = `Sprint "${sprintName || sprintId}" chưa có ID đồng bộ hợp lệ trên Jira. Không thể tạo task vào sprint này.`;
        setErrorMessage(msg);
        toast.error(msg);
        return;
      }
      targetExternalSprintId = String(sprintExternalId);
    }

    try {
      await createTaskMutation.mutateAsync({
        projectId,
        data: {
          summary: trimmed,
          jiraIntegrationId,
          sprintExternalId: targetExternalSprintId,
        },
      });
      setSummary("");
      setIsOpen(false);
      setErrorMessage(null);
    } catch (error: unknown) {
      const err = error as {
        response?: { data?: { code?: string; message?: string } };
        message?: string;
      };
      const code = err.response?.data?.code;
      if (code === "JIRA_WRITE_INCOMPLETE") {
        setSummary("");
        setIsOpen(false);
        setErrorMessage(null);
        return;
      }
      const msg = err.response?.data?.message || err.message || "Không thể tạo task.";
      setErrorMessage(msg);
    }
  };

  if (!isOpen) {
    return (
      <div className="flex items-center justify-between px-3.5 py-2 border-t border-border/40 hover:bg-muted/30 transition-colors">
        <button
          type="button"
          onClick={() => {
            setIsOpen(true);
            setErrorMessage(null);
          }}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors cursor-pointer py-1"
        >
          <PlusIcon className="w-3.5 h-3.5" />
          <span>Tạo task nhanh</span>
        </button>

        {onOpenFullModal && (
          <button
            type="button"
            onClick={onOpenFullModal}
            className="text-[11px] text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            title="Mở modal tạo task với đầy đủ thuộc tính"
          >
            Tạo với đầy đủ thông tin...
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="p-3 border-t border-border/60 bg-muted/20 space-y-2"
    >
      <form onSubmit={handleSubmit} className="space-y-2">
        <div className="flex items-center gap-2">
          <Input
            ref={inputRef}
            type="text"
            value={summary}
            onChange={(e) => {
              setSummary(e.target.value);
              if (errorMessage) setErrorMessage(null);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Cần làm gì? Nhập tên task..."
            disabled={createTaskMutation.isPending}
            className="h-8.5 text-xs rounded-xl bg-card border-border/80"
          />
          <Button
            type="submit"
            size="sm"
            disabled={createTaskMutation.isPending || !summary.trim()}
            className="h-8.5 px-3.5 text-xs font-bold rounded-xl gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground shrink-0 cursor-pointer shadow-2xs"
          >
            {createTaskMutation.isPending ? (
              <>
                <Loader2Icon className="w-3.5 h-3.5 animate-spin" />
                <span>Đang tạo...</span>
              </>
            ) : (
              <span>Tạo</span>
            )}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={createTaskMutation.isPending}
            onClick={handleCancel}
            className="h-8.5 px-2.5 text-xs rounded-xl cursor-pointer"
          >
            Hủy
          </Button>
        </div>

        {errorMessage && (
          <p className="text-[11px] font-medium text-destructive">{errorMessage}</p>
        )}

        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
          <span>
            Nhấn <kbd className="font-mono bg-muted px-1 py-0.5 rounded border border-border/50">Enter</kbd> để tạo,{" "}
            <kbd className="font-mono bg-muted px-1 py-0.5 rounded border border-border/50">Esc</kbd> để hủy
          </span>
          {onOpenFullModal && (
            <button
              type="button"
              onClick={onOpenFullModal}
              className="hover:text-primary transition-colors cursor-pointer underline underline-offset-2"
            >
              Tạo với đầy đủ thông tin
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
