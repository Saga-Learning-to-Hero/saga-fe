"use client";

import { useState, useMemo } from "react";
import { SearchIcon, FilterIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TeamWeightCard } from "./team-weight-card";
import type { TeamWeightConfiguration } from "../types/course-weight-config";
import type { TeamMock } from "../data/mock-course-weight-config";

interface TeamWeightListProps {
  teams: TeamMock[];
  teamWeights: Record<string, TeamWeightConfiguration>;
  onCustomizeTeam: (teamId: string) => void;
}

export function TeamWeightList({ teams, teamWeights, onCustomizeTeam }: TeamWeightListProps) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "configured" | "unconfigured">("all");

  const processedTeams = useMemo(() => {
    return teams.map((t) => {
      const config = teamWeights[t.id];
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
      if (filter === "configured" && !t.weights) return false;
      if (filter === "unconfigured" && !!t.weights) return false;
      
      return true;
    });
  }, [teams, teamWeights, search, filter]);

  const configuredCount = Object.keys(teamWeights).length;
  const unconfiguredCount = teams.length - configuredCount;

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
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <FilterIcon className="w-4 h-4 text-muted-foreground shrink-0" />
          <Select value={filter} onValueChange={(v: "all" | "configured" | "unconfigured" | null) => v && setFilter(v)}>
            <SelectTrigger className="w-full sm:w-48 bg-background">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả ({teams.length})</SelectItem>
              <SelectItem value="configured">Đã cấu hình ({configuredCount})</SelectItem>
              <SelectItem value="unconfigured">Chưa cấu hình ({unconfiguredCount})</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* List */}
      <div className="space-y-3">
        {processedTeams.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground bg-muted/10 rounded-xl border border-dashed">
            Không tìm thấy team nào khớp với điều kiện lọc.
          </div>
        ) : (
          processedTeams.map((team) => (
            <TeamWeightCard
              key={team.id}
              teamId={team.id}
              teamName={team.name}
              projectName={team.projectName}
              memberCount={team.memberCount}
              weights={team.weights}
              onCustomize={onCustomizeTeam}
            />
          ))
        )}
      </div>
    </div>
  );
}
