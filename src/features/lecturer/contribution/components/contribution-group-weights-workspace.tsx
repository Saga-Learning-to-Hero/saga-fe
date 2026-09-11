"use client";

import { useMemo, useState } from "react";
import { CheckCircle2Icon, ClockIcon, FolderKanbanIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { CustomSelect } from "@/components/common/custom-select";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type {
  ContributionConfigMode,
  ContributionSliceWeightValues,
  ContributionTeamSummary,
} from "../types/contribution";
import { canEditProjectGroupWeights, getProjectTeams } from "../lib/contribution-utils";
import { ProjectGroupWeightsPanel } from "./project-group-weights-panel";

interface ContributionGroupWeightsWorkspaceProps {
  courseId: string;
  serverMode: ContributionConfigMode;
  teams: ContributionTeamSummary[];
  fallbackWeights: ContributionSliceWeightValues;
  isLoadingTeams?: boolean;
  queryEnabled: boolean;
}

export function ContributionGroupWeightsWorkspace({
  courseId,
  serverMode,
  teams,
  fallbackWeights,
  isLoadingTeams,
  queryEnabled,
}: ContributionGroupWeightsWorkspaceProps) {
  const [selectedTeamId, setSelectedTeamId] = useState("");
  const projectTeams = useMemo(() => getProjectTeams(teams), [teams]);
  const configuredCount = projectTeams.filter((team) => team.configured).length;
  const sortedTeams = useMemo(
    () => [...teams].sort((a, b) => a.teamNo - b.teamNo),
    [teams]
  );
  const resolvedTeamId = useMemo(() => {
    if (selectedTeamId && sortedTeams.some((team) => team.teamId === selectedTeamId)) {
      return selectedTeamId;
    }
    const firstProject = sortedTeams.find((team) => canEditProjectGroupWeights(team.projectId));
    return firstProject?.teamId || sortedTeams[0]?.teamId || "";
  }, [selectedTeamId, sortedTeams]);
  const selectedTeam = sortedTeams.find((team) => team.teamId === resolvedTeamId) ?? null;

  if (isLoadingTeams) {
    return (
      <div className="grid gap-4 lg:grid-cols-[300px_minmax(0,1fr)]">
        <div className="h-80 animate-pulse rounded-2xl bg-muted/60" />
        <div className="h-80 animate-pulse rounded-2xl bg-muted/60" />
      </div>
    );
  }

  if (sortedTeams.length === 0) {
    return (
      <Card className="rounded-2xl border border-dashed border-border/80 p-8 text-center shadow-xs">
        <FolderKanbanIcon className="mx-auto mb-3 size-8 text-muted-foreground/40" />
        <p className="text-sm font-bold text-foreground">Chưa có nhóm nào trong lớp học phần</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Hãy hoàn tất phân nhóm trước khi cấu hình trọng số Slicing Pie riêng cho từng nhóm.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="rounded-2xl border border-border/80 bg-card p-4 shadow-xs">
        <CardContent className="flex flex-wrap items-center justify-between gap-3 p-0 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-muted-foreground">Tiến độ tùy biến trọng số:</span>
            <span className="font-mono text-sm font-black text-foreground">
              {configuredCount}/{projectTeams.length}
            </span>
            <span className="text-muted-foreground">nhóm có dự án</span>
          </div>

          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="border-emerald-500/30 bg-emerald-500/10 font-mono text-[10px] text-emerald-600 dark:text-emerald-400"
            >
              {configuredCount} đã cấu hình
            </Badge>
            <Badge
              variant="outline"
              className="border-amber-500/30 bg-amber-500/10 font-mono text-[10px] text-amber-600 dark:text-amber-400"
            >
              {projectTeams.length - configuredCount} chờ cấu hình
            </Badge>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-2 lg:hidden">
        <Label htmlFor="group-weight-team" className="text-xs font-bold text-foreground">
          Chọn nhóm đồ án
        </Label>
        <CustomSelect
          id="group-weight-team"
          value={resolvedTeamId}
          onChange={setSelectedTeamId}
          placeholder="Chọn nhóm để cấu hình"
          options={sortedTeams.map((team) => ({
            value: team.teamId,
            label: team.teamName || `Nhóm ${team.teamNo}`,
            subLabel: teamStatusLabel(team),
          }))}
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-[300px_minmax(0,1fr)]">
        <Card className="hidden overflow-hidden rounded-2xl border border-border/80 bg-card shadow-xs lg:block">
          <div className="border-b border-border/60 bg-muted/30 px-4 py-3">
            <span className="text-xs font-bold text-foreground">Danh sách nhóm đồ án</span>
          </div>
          <ul className="max-h-[36rem] overflow-y-auto p-2 space-y-1">
            {sortedTeams.map((team) => {
              const hasProject = canEditProjectGroupWeights(team.projectId);
              const selected = team.teamId === resolvedTeamId;
              return (
                <li key={team.teamId}>
                  <button
                    type="button"
                    onClick={() => setSelectedTeamId(team.teamId)}
                    className={cn(
                      "flex w-full cursor-pointer flex-col gap-1 rounded-xl p-3 text-left transition-all",
                      selected
                        ? "bg-primary/10 border border-primary/30 text-foreground shadow-xs"
                        : "border border-transparent hover:bg-muted/40 text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-mono text-[11px] font-extrabold text-primary">
                        Team #{team.teamNo}
                      </span>
                      {team.configured ? (
                        <span className="flex items-center text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2Icon className="mr-0.5 size-3" />
                          Đã lưu
                        </span>
                      ) : (
                        <span className="text-[10px] text-muted-foreground">Mặc định</span>
                      )}
                    </div>

                    <span className="line-clamp-1 text-xs font-bold text-foreground">
                      {team.teamName || `Nhóm ${team.teamNo}`}
                    </span>

                    <div className="mt-1 flex items-center gap-1.5">
                      {hasProject ? (
                        <span className="flex items-center font-mono text-[10px] text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2Icon className="mr-1 size-2.5" />
                          Đã có dự án
                        </span>
                      ) : (
                        <span className="flex items-center font-mono text-[10px] text-amber-600 dark:text-amber-400">
                          <ClockIcon className="mr-1 size-2.5" />
                          Chờ dự án
                        </span>
                      )}
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </Card>

        {selectedTeam ? (
          <ProjectGroupWeightsPanel
            courseId={courseId}
            teamId={selectedTeam.teamId}
            teamName={selectedTeam.teamName || `Nhóm ${selectedTeam.teamNo}`}
            projectId={selectedTeam.projectId}
            serverMode={serverMode}
            fallbackWeights={fallbackWeights}
            queryEnabled={queryEnabled && canEditProjectGroupWeights(selectedTeam.projectId)}
          />
        ) : (
          <Card className="rounded-2xl border border-dashed border-border/80 p-8 text-center text-xs text-muted-foreground shadow-xs">
            Chọn một nhóm từ danh sách để xem và tùy biến trọng số Slicing Pie.
          </Card>
        )}
      </div>
    </div>
  );
}

function teamStatusLabel(team: ContributionTeamSummary): string {
  const project = canEditProjectGroupWeights(team.projectId)
    ? "Đã có dự án"
    : "Chờ khởi tạo dự án";
  const configured = team.configured ? "Đã cấu hình riêng" : "Theo chuẩn chung";
  return `Team #${team.teamNo} · ${project} · ${configured}`;
}
