import { ActivityIcon, GitCommitIcon, GitPullRequestIcon, CheckCircle2Icon, AlertCircleIcon, TimerIcon } from "lucide-react";
import type { TeamProjectInfo } from "../../types/team-project";
import { SprintBurndownChart, WorkDistributionChart } from "./project-progress-charts";

interface OverviewTabProps {
  project: TeamProjectInfo;
}

export function OverviewTab({}: OverviewTabProps) {
  return (
    <div className="p-6 space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-card p-4 rounded-xl border flex flex-col gap-2 shadow-saga-xs">
          <div className="flex items-center gap-2 text-muted-foreground text-xs font-semibold">
            <GitCommitIcon className="w-4 h-4" />
            TỔNG COMMIT
          </div>
          <div className="text-2xl font-bold">128</div>
          <div className="text-[10px] text-success font-medium flex items-center">
            <ActivityIcon className="w-3 h-3 mr-1" />
            ↑ 12% so với sprint trước
          </div>
        </div>
        
        <div className="bg-card p-4 rounded-xl border flex flex-col gap-2 shadow-saga-xs">
          <div className="flex items-center gap-2 text-muted-foreground text-xs font-semibold">
            <GitPullRequestIcon className="w-4 h-4" />
            PR ĐÃ MERGE
          </div>
          <div className="text-2xl font-bold">24</div>
          <div className="text-[10px] text-success font-medium flex items-center">
            <ActivityIcon className="w-3 h-3 mr-1" />
            ↑ 5% so với sprint trước
          </div>
        </div>
        
        <div className="bg-card p-4 rounded-xl border flex flex-col gap-2 shadow-saga-xs">
          <div className="flex items-center gap-2 text-muted-foreground text-xs font-semibold">
            <CheckCircle2Icon className="w-4 h-4" />
            TASK HOÀN THÀNH
          </div>
          <div className="text-2xl font-bold">35</div>
          <div className="text-[10px] text-muted-foreground font-medium">
            Trong sprint hiện tại
          </div>
        </div>
        
        <div className="bg-card p-4 rounded-xl border flex flex-col gap-2 shadow-saga-xs">
          <div className="flex items-center gap-2 text-muted-foreground text-xs font-semibold">
            <AlertCircleIcon className="w-4 h-4" />
            TRỄ HẠN
          </div>
          <div className="text-2xl font-bold text-danger">3</div>
          <div className="text-[10px] text-danger font-medium flex items-center">
            Cần kiểm tra
          </div>
        </div>

        <div className="bg-card p-4 rounded-xl border flex flex-col gap-2 shadow-saga-xs">
          <div className="flex items-center gap-2 text-muted-foreground text-xs font-semibold">
            <TimerIcon className="w-4 h-4" />
            TIẾN ĐỘ SPRINT
          </div>
          <div className="text-2xl font-bold text-primary">68%</div>
          <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden mt-1">
            <div className="bg-primary h-full rounded-full" style={{ width: "68%" }} />
          </div>
        </div>

        <div className="bg-card p-4 rounded-xl border flex flex-col gap-2 shadow-saga-xs">
          <div className="flex items-center gap-2 text-muted-foreground text-xs font-semibold">
            <UsersIcon className="w-4 h-4" />
            ÍT HOẠT ĐỘNG
          </div>
          <div className="text-2xl font-bold text-warning">1</div>
          <div className="text-[10px] text-warning font-medium">
            Thành viên trong 7 ngày
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border rounded-xl p-6 min-h-[300px] flex flex-col">
          <h3 className="font-bold mb-4">Sprint Burndown</h3>
          <div className="flex-1 min-h-[240px]" aria-label="Biểu đồ tiến độ sprint">
            <SprintBurndownChart />
          </div>
        </div>
        
        <div className="bg-card border rounded-xl p-6 min-h-[300px] flex flex-col">
          <h3 className="font-bold mb-4">Phân bổ công việc</h3>
          <div className="flex-1 min-h-[240px]" aria-label="Biểu đồ phân bổ trạng thái công việc">
            <WorkDistributionChart />
          </div>
        </div>
      </div>
      
      <div className="bg-card border rounded-xl p-6">
        <h3 className="font-bold mb-4">Hoạt động gần đây</h3>
        <div className="flex flex-col gap-4">
          <div className="text-sm text-muted-foreground text-center py-8">
            Dữ liệu hoạt động sẽ được tổng hợp từ GitHub và Jira...
          </div>
        </div>
      </div>
    </div>
  );
}

// Just for icon above
import { UsersIcon } from "lucide-react";
