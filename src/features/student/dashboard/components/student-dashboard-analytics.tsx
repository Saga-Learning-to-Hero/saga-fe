"use client";

import { useState, useMemo } from "react";
import {
  UsersIcon,
  CrownIcon,
  LockIcon,
  FilterIcon,
  UserCheckIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { StudentKPICards } from "./student-kpi-cards";
import { StudentTaskCommitCharts } from "./student-task-commit-charts";
import { TeamWorkloadComparisonChart } from "./team-workload-comparison-chart";
import { MOCK_TEAM_SUMMARY, MOCK_TEAM_MEMBERS } from "../data/mock-student-analytics";
import type { MemberAnalytics } from "../types/student-analytics";

interface StudentDashboardAnalyticsProps {
  initialRole?: "LEADER" | "MEMBER";
}

export function StudentDashboardAnalytics({
  initialRole,
}: StudentDashboardAnalyticsProps) {
  const authUser = useAuthStore((state) => state.user);
  const selectedCourse = useAuthStore((state) => state.selectedCourse);

  const roleInTeam = initialRole || (selectedCourse?.myGroup?.role?.toUpperCase() === "LEADER" ? "LEADER" : "MEMBER");
  const isLeader = roleInTeam === "LEADER";

  const [selectedMemberId, setSelectedMemberId] = useState<string>("sv-01");
  const [isAllTeam, setIsAllTeam] = useState<boolean>(false);

  const activeMember: MemberAnalytics = useMemo(() => {
    return MOCK_TEAM_MEMBERS.find((m) => m.id === selectedMemberId) || MOCK_TEAM_MEMBERS[0];
  }, [selectedMemberId]);

  const handleSelectMember = (memberId: string) => {
    if (!isLeader) return;
    setSelectedMemberId(memberId);
    setIsAllTeam(false);
  };

  const handleSelectAllTeam = () => {
    if (!isLeader) return;
    setIsAllTeam(true);
  };

  return (
    <div className="space-y-6">
      <div className="bg-card/90 backdrop-blur-md border border-border/80 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isLeader ? "bg-amber-500/15 text-amber-800 dark:text-amber-400" : "bg-blue-500/10 text-blue-600 dark:text-blue-400"
            }`}>
            {isLeader ? <CrownIcon className="w-5 h-5" /> : <UserCheckIcon className="w-5 h-5" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-foreground tracking-tight">
                Tiến độ và hiệu suất thành viên
              </h2>
              <Badge className={`border-0 text-[10px] font-semibold ${isLeader ? "bg-amber-500/15 text-amber-900 dark:text-amber-300" : "bg-blue-500/15 text-blue-700 dark:text-blue-300"
                }`}>
                {isLeader ? "Trưởng nhóm" : "Thành viên"}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              {isLeader
                ? "Trưởng nhóm có quyền theo dõi tiến độ và chỉ số công việc của tất cả thành viên trong nhóm."
                : "Thành viên theo dõi tiến độ công việc và chỉ số đóng góp của chính bản thân."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground hidden lg:inline">
              Lọc thành viên:
            </span>

            {isLeader ? (
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-muted/70 hover:bg-muted border border-border text-xs font-semibold text-foreground transition-colors cursor-pointer outline-none">
                  <UsersIcon className="w-3.5 h-3.5 text-primary" />
                  <span>
                    {isAllTeam ? "Tổng quan cả nhóm" : activeMember.name}
                  </span>
                  <FilterIcon className="w-3 h-3 text-muted-foreground ml-1" />
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-64 p-1.5 rounded-xl">
                  <DropdownMenuLabel className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Phạm vi theo dõi
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    onClick={handleSelectAllTeam}
                    className={`flex items-center gap-2 text-xs py-2 px-2.5 rounded-lg cursor-pointer ${isAllTeam ? "bg-primary/10 text-primary font-bold" : ""
                      }`}
                  >
                    <UsersIcon className="w-4 h-4 text-primary" />
                    <span>Tổng quan cả nhóm</span>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />
                  <DropdownMenuLabel className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Thành viên nhóm ({MOCK_TEAM_MEMBERS.length})
                  </DropdownMenuLabel>

                  {MOCK_TEAM_MEMBERS.map((m) => (
                    <DropdownMenuItem
                      key={m.id}
                      onClick={() => handleSelectMember(m.id)}
                      className={`flex items-center justify-between text-xs py-2 px-2.5 rounded-lg cursor-pointer ${!isAllTeam && selectedMemberId === m.id ? "bg-primary/10 text-primary font-bold" : ""
                        }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                          {m.studentCode}
                        </span>
                        <span className="truncate">{m.name}</span>
                      </div>
                      {m.role === "LEADER" && (
                        <CrownIcon className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      )}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-muted/40 border border-border/60 text-xs font-semibold text-muted-foreground cursor-not-allowed opacity-90"
                title="Bạn đang ở vai trò Thành viên. Bạn chỉ có thể xem báo cáo cá nhân."
              >
                <LockIcon className="w-3.5 h-3.5 text-amber-500" />
                <span>{authUser?.fullName ?? authUser?.username ?? "Bản thân"}</span>
                <Badge variant="outline" className="text-[10px] py-0 border-amber-500/30 text-amber-600 font-mono">
                  Đã khóa
                </Badge>
              </div>
            )}
          </div>
        </div>
      </div>

      <StudentKPICards
        analytics={activeMember}
        isAllTeamSelected={isAllTeam}
        totalTeamCommits={MOCK_TEAM_SUMMARY.teamWeeklyActivities.reduce((acc, curr) => acc + curr.commits, 0)}
      />

      <StudentTaskCommitCharts
        analytics={activeMember}
        weeklyData={isAllTeam ? MOCK_TEAM_SUMMARY.teamWeeklyActivities : activeMember.weeklyActivities}
      />

      {isLeader && (
        <TeamWorkloadComparisonChart
          members={MOCK_TEAM_MEMBERS}
          selectedMemberId={selectedMemberId}
          onSelectMember={(mId) => {
            setSelectedMemberId(mId);
            setIsAllTeam(false);
          }}
        />
      )}
    </div>
  );
}
