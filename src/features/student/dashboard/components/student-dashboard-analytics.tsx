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
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StudentKPICards } from "./student-kpi-cards";
import { StudentTaskCommitCharts } from "./student-task-commit-charts";
import { TeamWorkloadComparisonChart } from "./team-workload-comparison-chart";
import { MOCK_TEAM_SUMMARY, MOCK_TEAM_MEMBERS } from "../data/mock-student-analytics";
import type { MemberAnalytics } from "../types/student-analytics";

interface StudentDashboardAnalyticsProps {
  initialRole?: "LEADER" | "MEMBER";
}

export function StudentDashboardAnalytics({
  initialRole = "LEADER",
}: StudentDashboardAnalyticsProps) {
  // Demo state cho phép chuyển đổi vai trò Trưởng nhóm (Leader) vs Thành viên (Member)
  const [currentRole, setCurrentRole] = useState<"LEADER" | "MEMBER">(initialRole);

  // ID của thành viên được chọn để xem biểu đồ (Default: Lê Hoàng Hải - sv-01)
  const [selectedMemberId, setSelectedMemberId] = useState<string>("sv-01");
  const [isAllTeam, setIsAllTeam] = useState<boolean>(false);

  const isLeader = currentRole === "LEADER";

  // Lấy đối tượng thành viên được chọn
  const activeMember: MemberAnalytics = useMemo(() => {
    return MOCK_TEAM_MEMBERS.find((m) => m.id === selectedMemberId) || MOCK_TEAM_MEMBERS[0];
  }, [selectedMemberId]);

  // Nếu là Member, cưỡng chế chọn bản thân và tắt mode Cả nhóm
  const handleSelectMember = (memberId: string) => {
    if (!isLeader) return; // Member bị khóa
    setSelectedMemberId(memberId);
    setIsAllTeam(false);
  };

  const handleSelectAllTeam = () => {
    if (!isLeader) return;
    setIsAllTeam(true);
  };

  return (
    <div className="space-y-6">
      {/* ── Demo Role Switcher & Header Controls ──────────────────────── */}
      <div className="bg-card/90 backdrop-blur-md border border-border/80 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left: Leader / Member Indicator */}
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isLeader ? "bg-amber-500/15 text-amber-800 dark:text-amber-400" : "bg-blue-500/10 text-blue-600 dark:text-blue-400"
            }`}>
            {isLeader ? <CrownIcon className="w-5 h-5" /> : <UserCheckIcon className="w-5 h-5" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-foreground tracking-tight">
                Tiến độ & Hiệu suất Thành viên
              </h2>
              <Badge className={`border-0 text-[10px] font-semibold ${isLeader ? "bg-amber-500/15 text-amber-900 dark:text-amber-300" : "bg-blue-500/15 text-blue-700 dark:text-blue-300"
                }`}>
                {isLeader ? "Leader" : "Member"}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              {isLeader
                ? "Leader có quyền xem tiến độ và metrics của toàn bộ thành viên trong nhóm."
                : "Member theo dõi tiến độ công việc và chỉ số đóng góp của chính bản thân."}
            </p>
          </div>
        </div>

        {/* Right: Dropdown Chọn Thành viên & Nút Toggle Role Demo */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Member Selector Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground hidden lg:inline">
              Lọc thành viên:
            </span>

            {isLeader ? (
              /* Dropdown dành cho Leader: Chọn bất kỳ thành viên nào hoặc cả nhóm */
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-muted/70 hover:bg-muted border border-border text-xs font-semibold text-foreground transition-colors cursor-pointer outline-none">
                  <UsersIcon className="w-3.5 h-3.5 text-primary" />
                  <span>
                    {isAllTeam ? "Tổng quan Cả Nhóm SAGA" : activeMember.name}
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
                    <span>Tổng quan Cả nhóm SAGA</span>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />
                  <DropdownMenuLabel className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Thành viên nhóm (5)
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
              /* Dropdown bị KHÓA dành cho Member */
              <div
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-muted/40 border border-border/60 text-xs font-semibold text-muted-foreground cursor-not-allowed opacity-90"
                title="Bạn đang ở vai trò Thành viên. Bạn chỉ có thể xem báo cáo cá nhân."
              >
                <LockIcon className="w-3.5 h-3.5 text-amber-500" />
                <span>Lê Hoàng Hải (Bản thân)</span>
                <Badge variant="outline" className="text-[10px] py-0 border-amber-500/30 text-amber-600 font-mono">
                  Đã khóa
                </Badge>
              </div>
            )}
          </div>

          {/* Toggle Role Button for Demo Testing */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (isLeader) {
                setCurrentRole("MEMBER");
                setSelectedMemberId("sv-01"); // Force self
                setIsAllTeam(false);
              } else {
                setCurrentRole("LEADER");
              }
            }}
            className="h-8 text-xs font-semibold rounded-xl gap-1.5 border-primary/30 text-primary hover:bg-primary/10 cursor-pointer"
          >
            {isLeader ? (
              <>
                <UserCheckIcon className="w-3.5 h-3.5" />
                Thử xem dạng Thành viên
              </>
            ) : (
              <>
                <CrownIcon className="w-3.5 h-3.5 text-amber-500" />
                Thử xem dạng Trưởng nhóm
              </>
            )}
          </Button>
        </div>
      </div>

      {/* ── Section 1: KPI Summary Cards ─────────────────────────────── */}
      <StudentKPICards
        analytics={activeMember}
        isAllTeamSelected={isAllTeam}
        totalTeamCommits={MOCK_TEAM_SUMMARY.teamWeeklyActivities.reduce((acc, curr) => acc + curr.commits, 0)}
      />

      {/* ── Section 2: Main Task & Commit Charts ─────────────────────── */}
      <StudentTaskCommitCharts
        analytics={activeMember}
        weeklyData={isAllTeam ? MOCK_TEAM_SUMMARY.teamWeeklyActivities : activeMember.weeklyActivities}
      />


      {/* ── Section 4: Special Leader View (So sánh đóng góp giữa các thành viên) ─ */}
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
