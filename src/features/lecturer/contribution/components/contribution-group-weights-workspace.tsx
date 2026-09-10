"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
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
      <div className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
        <div className="h-72 animate-pulse rounded-2xl bg-muted/60" />
        <div className="h-72 animate-pulse rounded-2xl bg-muted/60" />
      </div>
    );
  }

  if (sortedTeams.length === 0) {
    return (
      <Card className="rounded-2xl border border-dashed border-border p-8 text-center">
        <p className="text-sm font-semibold">Chưa có nhóm trong lớp học phần</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Hãy phân nhóm bằng Excel trước khi cấu hình trọng số riêng cho từng nhóm.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold">
          Tiến độ cấu hình:{" "}
          <span className="font-mono">
            {configuredCount}/{projectTeams.length}
          </span>{" "}
          nhóm có dự án
        </p>
        {projectTeams.length === 0 ? (
          <p className="text-xs text-muted-foreground">Chưa có nhóm khởi tạo dự án.</p>
        ) : null}
      </div>

      <div className="space-y-2 lg:hidden">
        <Label htmlFor="group-weight-team">Chọn nhóm</Label>
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

      <div className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
        <Card className="hidden overflow-hidden rounded-2xl border border-border lg:block">
          <ul className="max-h-[32rem] overflow-y-auto p-2">
            {sortedTeams.map((team) => {
              const hasProject = canEditProjectGroupWeights(team.projectId);
              const selected = team.teamId === resolvedTeamId;
              return (
                <li key={team.teamId}>
                  <button
                    type="button"
                    onClick={() => setSelectedTeamId(team.teamId)}
                    className={cn(
                      "flex w-full cursor-pointer flex-col gap-1 rounded-xl px-3 py-2.5 text-left transition-colors",
                      selected ? "bg-primary/10 text-foreground" : "hover:bg-muted/70"
                    )}
                  >
                    <span className="text-sm font-semibold">
                      {team.teamName || `Nhóm ${team.teamNo}`}
                    </span>
                    <span className="font-mono text-[11px] text-muted-foreground">
                      Mã nhóm {team.teamNo}
                    </span>
                    <div className="mt-1 flex flex-wrap gap-1">
                      <Badge
                        variant="outline"
                        className={
                          hasProject
                            ? "border-emerald-500/30 bg-emerald-500/15 text-[10px] text-emerald-700 dark:text-emerald-300"
                            : "border-amber-500/30 bg-amber-500/15 text-[10px] text-amber-700 dark:text-amber-300"
                        }
                      >
                        {hasProject ? "Đã có dự án" : "Chưa khởi tạo dự án"}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={
                          team.configured
                            ? "border-emerald-500/30 bg-emerald-500/15 text-[10px] text-emerald-700 dark:text-emerald-300"
                            : "text-[10px]"
                        }
                      >
                        {team.configured ? "Đã cấu hình" : "Chưa cấu hình"}
                      </Badge>
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
          <Card className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            Chọn một nhóm để xem hoặc lưu trọng số.
          </Card>
        )}
      </div>
    </div>
  );
}

function teamStatusLabel(team: ContributionTeamSummary): string {
  const project = canEditProjectGroupWeights(team.projectId)
    ? "Đã có dự án"
    : "Chưa khởi tạo dự án";
  const configured = team.configured ? "Đã cấu hình" : "Chưa cấu hình";
  return `Mã nhóm ${team.teamNo} · ${project} · ${configured}`;
}
