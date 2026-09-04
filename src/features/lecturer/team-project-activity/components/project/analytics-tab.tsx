import { FilterIcon, CheckCircle2Icon, AlertCircleIcon, TimerIcon, UsersIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CustomSelect } from "@/components/common/custom-select";
import type { TeamProjectInfo } from "../../types/team-project";
import {
  SprintBurndownChart,
  WorkDistributionChart,
  CommitIssueChart,
  CumulativeFlowChart,
  CycleTimeChart,
  MemberContributionChart,
  VelocityChart,
} from "./project-progress-charts";
import { useState } from "react";

interface AnalyticsTabProps {
  project: TeamProjectInfo;
}

const workloadByMember = [
  { member: "Nguyễn Văn A", weeks: [3, 4, 3, 2] },
  { member: "Trần Thị B", weeks: [2, 3, 4, 3] },
  { member: "Lê Văn C", weeks: [1, 3, 3, 4] },
  { member: "Phạm Thị D", weeks: [2, 2, 1, 2] },
];

const workloadColors = [
  "bg-muted/40",
  "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-200",
  "bg-indigo-200 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-100",
  "bg-indigo-400 text-white dark:bg-indigo-700",
  "bg-indigo-600 text-white dark:bg-indigo-500",
];

export function AnalyticsTab({ project }: AnalyticsTabProps) {
  const [sprintFilter, setSprintFilter] = useState("sprint-3");
  const [memberFilter, setMemberFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");

  const totalTasks = project.members.reduce((acc, m) => acc + (m.tasksCount || 0), 0) || 35;

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-4 p-4 bg-card rounded-xl border border-border/60">
        <div className="w-[160px]">
          <CustomSelect
            value={sprintFilter}
            onChange={setSprintFilter}
            options={[
              { value: "all", label: "Toàn thời gian" },
              { value: "sprint-3", label: "Sprint 3" },
              { value: "sprint-2", label: "Sprint 2" },
              { value: "sprint-1", label: "Sprint 1" },
            ]}
          />
        </div>

        <div className="w-[180px]">
          <CustomSelect
            value={memberFilter}
            onChange={setMemberFilter}
            options={[
              { value: "all", label: "Tất cả thành viên" },
              ...project.members.map(m => ({ value: m.id, label: m.fullName }))
            ]}
          />
        </div>

        <div className="w-[180px]">
          <CustomSelect
            value={sourceFilter}
            onChange={setSourceFilter}
            options={[
              { value: "all", label: "Tất cả (GitHub + Jira)" },
              { value: "github", label: "Chỉ GitHub" },
              { value: "jira", label: "Chỉ Jira" },
            ]}
          />
        </div>

        <div className="ml-auto flex items-center gap-3">
          <div className="text-sm font-medium text-muted-foreground hidden lg:block">
            Dữ liệu từ <strong className="text-foreground">12/08/2026</strong> đến <strong className="text-foreground">30/08/2026</strong>
          </div>
          <Button variant="ghost" size="sm" className="text-muted-foreground">
            <FilterIcon className="w-4 h-4 mr-2" /> Đặt lại
          </Button>
        </div>
      </div>

      {/* Metric Strip (KPIs) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card p-4 rounded-xl border border-border/60 flex items-center justify-between gap-4 shadow-saga-xs">
          <div>
            <div className="text-xs font-semibold text-muted-foreground mb-1 flex items-center gap-1.5">
              <TimerIcon className="w-3.5 h-3.5" /> TIẾN ĐỘ SPRINT
            </div>
            <div className="text-2xl font-bold font-mono text-primary">68%</div>
          </div>
          <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden shrink-0">
            <div className="bg-primary h-full rounded-full" style={{ width: "68%" }} />
          </div>
        </div>

        <div className="bg-card p-4 rounded-xl border border-border/60 flex flex-col justify-center shadow-saga-xs">
          <div className="text-xs font-semibold text-muted-foreground mb-1 flex items-center gap-1.5">
            <AlertCircleIcon className="w-3.5 h-3.5" /> TRỄ HẠN
          </div>
          <div className="flex items-baseline gap-2">
            <div className="text-2xl font-bold font-mono text-destructive">3</div>
            <div className="text-[10px] text-destructive font-medium">công việc cần kiểm tra</div>
          </div>
        </div>

        <div className="bg-card p-4 rounded-xl border border-border/60 flex flex-col justify-center shadow-saga-xs">
          <div className="text-xs font-semibold text-muted-foreground mb-1 flex items-center gap-1.5">
            <CheckCircle2Icon className="w-3.5 h-3.5" /> HOÀN THÀNH
          </div>
          <div className="flex items-baseline gap-2">
            <div className="text-2xl font-bold font-mono">{totalTasks}</div>
            <div className="text-[10px] text-muted-foreground font-medium">trong sprint hiện tại</div>
          </div>
        </div>

        <div className="bg-card p-4 rounded-xl border border-border/60 flex flex-col justify-center shadow-saga-xs">
          <div className="text-xs font-semibold text-muted-foreground mb-1 flex items-center gap-1.5">
            <UsersIcon className="w-3.5 h-3.5" /> ÍT HOẠT ĐỘNG
          </div>
          <div className="flex items-baseline gap-2">
            <div className="text-2xl font-bold font-mono text-warning">1</div>
            <div className="text-[10px] text-warning font-medium">thành viên trong 7 ngày</div>
          </div>
        </div>
      </div>

      {/* Above the fold Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-card border border-border/60 rounded-xl p-5 md:p-6 lg:col-span-2 flex flex-col min-h-[350px]">
          <h3 className="font-bold mb-1">Sprint Burndown</h3>
          <p className="text-xs text-muted-foreground mb-4">Tiến độ đốt cháy điểm nỗ lực so với kế hoạch lý tưởng</p>
          <div className="flex-1 min-h-[250px]" aria-label="Biểu đồ tiến độ sprint">
            <SprintBurndownChart />
          </div>
        </div>

        <div className="bg-card border border-border/60 rounded-xl p-5 md:p-6 flex flex-col min-h-[350px]">
          <h3 className="font-bold mb-1">Cảnh báo & Phân bổ</h3>
          <p className="text-xs text-muted-foreground mb-4">Phân bổ trạng thái công việc hiện tại</p>
          <div className="flex-1 min-h-[200px]" aria-label="Biểu đồ phân bổ trạng thái công việc">
            <WorkDistributionChart />
          </div>
          <div className="mt-4 pt-4 border-t border-border/50 text-sm">
            <div className="font-semibold text-destructive mb-2 flex items-center gap-2">
              <AlertCircleIcon className="w-4 h-4" /> Cảnh báo: Task DONE nhưng thiếu commit
            </div>
            <div className="text-xs text-muted-foreground">1 task Done nhưng không có commit liên kết. Cần kiểm tra lại đồ thị Traceability.</div>
          </div>
        </div>
      </div>

      {/* Group 2: Trend Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border/60 rounded-xl p-5 md:p-6 min-h-[350px] flex flex-col">
          <h3 className="font-bold mb-1">Cumulative Flow Diagram</h3>
          <p className="text-xs text-muted-foreground mb-4">Phát hiện điểm nghẽn trong luồng công việc</p>
          <div className="flex-1 min-h-[250px]" aria-label="Biểu đồ luồng công việc tích lũy">
            <CumulativeFlowChart />
          </div>
        </div>

        <div className="bg-card border border-border/60 rounded-xl p-5 md:p-6 min-h-[350px] flex flex-col">
          <h3 className="font-bold mb-1">Velocity theo sprint</h3>
          <p className="text-xs text-muted-foreground mb-4">Story point cam kết vs hoàn thành</p>
          <div className="flex-1 min-h-[250px]" aria-label="Biểu đồ velocity theo sprint">
            <VelocityChart />
          </div>
        </div>

        <div className="bg-card border border-border/60 rounded-xl p-5 md:p-6 min-h-[350px] flex flex-col">
          <h3 className="font-bold mb-1">Commit và Jira Issue</h3>
          <p className="text-xs text-muted-foreground mb-4">Hoạt động code và task theo thời gian</p>
          <div className="flex-1 min-h-[250px]" aria-label="Biểu đồ commit và Jira issue">
            <CommitIssueChart />
          </div>
        </div>

        <div className="bg-card border border-border/60 rounded-xl p-5 md:p-6 min-h-[350px] flex flex-col">
          <h3 className="font-bold mb-1">Cycle Time</h3>
          <p className="text-xs text-muted-foreground mb-4">Thời gian trung bình từ In Progress đến Done</p>
          <div className="flex-1 min-h-[250px]" aria-label="Biểu đồ cycle time">
            <CycleTimeChart />
          </div>
        </div>
      </div>

      {/* Group 3: Member Analysis */}
      <div className="grid grid-cols-1 gap-6">
        <div className="bg-card border border-border/60 rounded-xl p-5 md:p-6 min-h-[350px] flex flex-col">
          <h3 className="font-bold mb-1">Phân bổ đóng góp thành viên</h3>
          <p className="text-xs text-muted-foreground mb-4">Tỷ trọng các loại hoạt động của từng cá nhân</p>
          <div className="flex-1 min-h-[260px]" aria-label="Biểu đồ phân bổ đóng góp thành viên">
            <MemberContributionChart />
          </div>
        </div>

        <div className="bg-card border border-border/60 rounded-xl p-5 md:p-6 min-h-[350px] flex flex-col">
          <h3 className="font-bold mb-1">Ma trận khối lượng công việc (Workload Matrix)</h3>
          <p className="text-xs text-muted-foreground mb-4">Phân bổ khối lượng công việc theo thời gian</p>
          <div className="flex-1 min-h-[250px] overflow-x-auto" aria-label="Ma trận tải công việc theo thành viên và tuần">
            <div className="min-w-[620px] rounded-lg border border-border/50 overflow-hidden">
              <div className="grid grid-cols-[180px_repeat(4,minmax(90px,1fr))] bg-muted/40 text-xs font-semibold text-muted-foreground">
                <div className="p-3">Thành viên</div>
                {["Tuần 1", "Tuần 2", "Tuần 3", "Tuần 4"].map((week) => (
                  <div key={week} className="p-3 text-center">{week}</div>
                ))}
              </div>
              {workloadByMember.map((row) => (
                <div key={row.member} className="grid grid-cols-[180px_repeat(4,minmax(90px,1fr))] border-t border-border/50">
                  <div className="p-3 text-sm font-medium bg-card">{row.member}</div>
                  {row.weeks.map((level, index) => (
                    <div key={`${row.member}-${index}`} className="p-2 bg-card">
                      <div className={`h-10 rounded-md flex items-center justify-center text-xs font-bold ${workloadColors[level]}`}>
                        {level * 3} điểm
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-end gap-2 text-xs text-muted-foreground">
              <span>Khối lượng:</span>
              <span>Thấp</span>
              {[1, 2, 3, 4].map((level) => (
                <span key={level} className={`h-4 w-8 rounded ${workloadColors[level]}`} aria-hidden="true" />
              ))}
              <span>Cao</span>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Feed placeholder if any */}
      <div className="bg-card border border-border/60 rounded-xl p-6">
        <h3 className="font-bold mb-4">Hoạt động gần đây</h3>
        <div className="flex flex-col gap-4">
          <div className="text-sm text-muted-foreground text-center py-8">
            Dữ liệu hoạt động đang được đồng bộ tự động từ GitHub ({project.githubRepo || "Chưa kết nối"}) và Jira ({project.jiraProjectKey || "Chưa kết nối"}).
          </div>
        </div>
      </div>

    </div>
  );
}
