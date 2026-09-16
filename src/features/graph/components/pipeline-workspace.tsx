"use client";

import { useState, useMemo } from "react";
import { SparklesIcon, TableIcon, GitCommitIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { PipelineFlowView } from "./pipeline-flow-view";
import { PipelineMatrixTable } from "./pipeline-matrix-table";
import { PipelineTaskInspector } from "./pipeline-task-inspector";
import type { PipelineCommit, PipelineLane, PipelineTask } from "../types/pipeline";

export interface PipelineWorkspaceProps {
  lanes: PipelineLane[];
  filteredTasks: PipelineTask[];
  selectedTaskId: string | null;
  onSelectTask: (taskId: string | null) => void;
  selectedCommits: PipelineCommit[];
  isLoadingCommits: boolean;
  errorMessage?: string | null;
  onRetryCommits: () => void;
}

export function PipelineWorkspace({
  lanes,
  filteredTasks,
  selectedTaskId,
  onSelectTask,
  selectedCommits,
  isLoadingCommits,
  errorMessage,
  onRetryCommits,
}: PipelineWorkspaceProps) {
  const [pipelineSubView, setPipelineSubView] = useState<"FLOW" | "MATRIX">("FLOW");
  const [isMobileInspectorOpen, setIsMobileInspectorOpen] = useState(false);

  const selectedTask = useMemo(
    () => filteredTasks.find((task) => task.id === selectedTaskId) || null,
    [filteredTasks, selectedTaskId]
  );

  const handleTaskClick = (taskId: string) => {
    const next = selectedTaskId === taskId ? null : taskId;
    onSelectTask(next);
    if (next && typeof window !== "undefined" && window.innerWidth < 1024) {
      setIsMobileInspectorOpen(true);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/80 bg-card p-2 shadow-2xs">
        <div className="flex items-center gap-1 rounded-xl border border-border/60 bg-muted/60 p-1 text-xs font-bold">
          <button
            type="button"
            onClick={() => setPipelineSubView("FLOW")}
            className={`flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 transition-all ${pipelineSubView === "FLOW"
                ? "bg-card text-foreground shadow-2xs"
                : "text-muted-foreground hover:text-foreground"
              }`}
          >
            <SparklesIcon className="size-3.5 text-primary" />
            <span>Luồng liên kết (Flow)</span>
          </button>
          <button
            type="button"
            onClick={() => setPipelineSubView("MATRIX")}
            className={`flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 transition-all ${pipelineSubView === "MATRIX"
                ? "bg-card text-foreground shadow-2xs"
                : "text-muted-foreground hover:text-foreground"
              }`}
          >
            <TableIcon className="size-3.5 text-primary" />
            <span>Ma trận đối soát (Audit matrix)</span>
          </button>
        </div>

        {selectedTask && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsMobileInspectorOpen(true)}
            className="h-8 cursor-pointer gap-1.5 rounded-xl text-xs font-bold lg:hidden"
          >
            <GitCommitIcon className="size-3.5 text-primary" />
            <span>Chi tiết Task & Commit ({selectedTask.key})</span>
          </Button>
        )}
      </div>

      <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
        <div className="min-w-0 flex-1">
          {pipelineSubView === "FLOW" ? (
            <PipelineFlowView
              lanes={lanes}
              selectedTaskId={selectedTaskId}
              onSelectTask={handleTaskClick}
            />
          ) : (
            <PipelineMatrixTable
              tasks={filteredTasks}
              selectedTaskId={selectedTaskId}
              onSelectTask={handleTaskClick}
            />
          )}
        </div>

        <aside className="hidden w-full shrink-0 self-start lg:sticky lg:top-28 lg:block lg:w-[380px] xl:w-[420px]">
          <PipelineTaskInspector
            selectedTask={selectedTask}
            commits={selectedCommits}
            isLoadingCommits={isLoadingCommits}
            errorMessage={errorMessage ?? null}
            onRetry={onRetryCommits}
            onClearSelection={() => onSelectTask(null)}
          />
        </aside>
      </div>

      <Sheet open={Boolean(selectedTask && isMobileInspectorOpen)} onOpenChange={setIsMobileInspectorOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md p-0 overflow-y-auto lg:hidden">
          <div className="p-4">
            <PipelineTaskInspector
              selectedTask={selectedTask}
              commits={selectedCommits}
              isLoadingCommits={isLoadingCommits}
              errorMessage={errorMessage ?? null}
              onRetry={onRetryCommits}
              onClearSelection={() => {
                onSelectTask(null);
                setIsMobileInspectorOpen(false);
              }}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
