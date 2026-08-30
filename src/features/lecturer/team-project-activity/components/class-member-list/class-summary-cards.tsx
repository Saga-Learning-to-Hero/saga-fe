import { UsersIcon, CheckCircle2Icon, AlertCircleIcon, UserMinusIcon } from "lucide-react";
import type { TeamMember, TeamProjectInfo } from "../../types/team-project";

interface ClassSummaryCardsProps {
  members: TeamMember[];
  projects: TeamProjectInfo[];
}

export function ClassSummaryCards({ members, projects }: ClassSummaryCardsProps) {
  const totalStudents = members.length;
  const totalTeams = projects.length;
  const teamsWithLeader = projects.filter(p => p.leaderId !== null).length;
  const teamsWithoutLeader = totalTeams - teamsWithLeader;
  const unassignedStudents = members.filter(m => m.groupId === null).length;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-card p-4 rounded-xl border flex flex-col gap-2">
        <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium">
          <UsersIcon className="w-4 h-4" />
          Sinh viên
        </div>
        <div className="text-2xl font-bold">{totalStudents}</div>
      </div>
      
      <div className="bg-card p-4 rounded-xl border flex flex-col gap-2">
        <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium">
          <CheckCircle2Icon className="w-4 h-4" />
          Nhóm dự án
        </div>
        <div className="text-2xl font-bold">{totalTeams}</div>
      </div>
      
      <div className="bg-card p-4 rounded-xl border flex flex-col gap-2">
        <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium">
          <AlertCircleIcon className="w-4 h-4" />
          Thiếu Leader
        </div>
        <div className="flex items-end gap-2">
          <div className="text-2xl font-bold text-amber-500">{teamsWithoutLeader}</div>
          <div className="text-xs text-muted-foreground mb-1">/ {totalTeams} nhóm</div>
        </div>
      </div>
      
      <div className="bg-card p-4 rounded-xl border flex flex-col gap-2">
        <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium">
          <UserMinusIcon className="w-4 h-4" />
          Chưa có nhóm
        </div>
        <div className="text-2xl font-bold text-danger">{unassignedStudents}</div>
      </div>
    </div>
  );
}
