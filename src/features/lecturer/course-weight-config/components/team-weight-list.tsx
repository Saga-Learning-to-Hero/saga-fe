"use client";

import { useState, useMemo } from "react";
import { SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { CustomSelect } from "@/components/common/custom-select";
import { TeamWeightCard } from "./team-weight-card";
import type { TeamWeightConfiguration, ContributionWeights } from "../types/course-weight-config";
import type { TeamMock } from "../data/mock-course-weight-config";
import { isWeightValid } from "../lib/weight-config-utils";

interface TeamWeightListProps {
  teams: TeamMock[];
  teamOverrides: Record<string, TeamWeightConfiguration>;
  classWeights: ContributionWeights;
  onCustomizeTeam: (teamId: string) => void;
  onRemoveOverride: (teamId: string) => void;
}

export function TeamWeightList({ 
  teams, 
  teamOverrides, 
  classWeights,
  onCustomizeTeam,
  onRemoveOverride
}: TeamWeightListProps) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const configuredCount = Object.keys(teamOverrides).length;
  const inheritedCount = teams.length - configuredCount;
  
  const invalidCount = Object.values(teamOverrides).filter(config => !isWeightValid(config.weights)).length;

  const processedTeams = useMemo(() => {
    return teams.map((t) => {
      const config = teamOverrides[t.id];
      const weights = config?.weights;
      return { ...t, weights };
    }).filter((t) => {
      // Apply search
      if (search) {
        const q = search.toLowerCase();
        if (!t.name.toLowerCase().includes(q) && !t.projectName.toLowerCase().includes(q)) {
          return false;
        }
      }
      // Apply filter
      if (filter === "custom" && !t.weights) return false;
      if (filter === "inherited" && !!t.weights) return false;
      if (filter === "invalid" && (!t.weights || isWeightValid(t.weights))) return false;
      
      return true;
    });
  }, [teams, teamOverrides, search, filter]);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-muted/20 p-4 rounded-xl border border-border/50">
        <div className="relative w-full sm:w-80">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Tìm team hoặc project..." 
            className="pl-9 bg-background"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <span className="text-sm text-muted-foreground whitespace-nowrap hidden md:inline-block">
            {configuredCount} nhóm cấu hình riêng · {inheritedCount} nhóm kế thừa
          </span>
          <div className="w-full sm:w-56">
            <CustomSelect
              value={filter}
              onChange={setFilter}
              options={[
                { value: "all", label: `Tất cả (${teams.length})` },
                { value: "inherited", label: `Kế thừa từ lớp (${inheritedCount})` },
                { value: "custom", label: `Có cấu hình riêng (${configuredCount})` },
                ...(invalidCount > 0 ? [{ value: "invalid", label: `Cấu hình lỗi (${invalidCount})` }] : [])
              ]}
            />
          </div>
        </div>
      </div>

      {/* List */}
      <div className="space-y-3">
        {processedTeams.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground bg-muted/10 rounded-xl border border-dashed">
            Không tìm thấy nhóm nào khớp với điều kiện lọc.
          </div>
        ) : (
          processedTeams.map((team) => (
            <TeamWeightCard
              key={team.id}
              teamId={team.id}
              teamName={team.name}
              projectName={team.projectName}
              memberCount={team.memberCount}
              classWeights={classWeights}
              weights={team.weights}
              onCustomize={onCustomizeTeam}
              onRemoveOverride={onRemoveOverride}
            />
          ))
        )}
      </div>
    </div>
  );
}
