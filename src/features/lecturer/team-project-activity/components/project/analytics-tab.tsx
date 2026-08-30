import { FilterIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { TeamProjectInfo } from "../../types/team-project";
import {
  CommitIssueChart,
  CumulativeFlowChart,
  CycleTimeChart,
  MemberContributionChart,
  VelocityChart,
} from "./project-progress-charts";

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
  return (
    <div className="p-6 space-y-6">
      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-4 p-4 bg-card rounded-xl border">
        <Select defaultValue="sprint-3">
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Sprint" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toàn thời gian</SelectItem>
            <SelectItem value="sprint-3">Sprint 3</SelectItem>
            <SelectItem value="sprint-2">Sprint 2</SelectItem>
            <SelectItem value="sprint-1">Sprint 1</SelectItem>
          </SelectContent>
        </Select>
        
        <Select defaultValue="all-members">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Thành viên" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all-members">Tất cả thành viên</SelectItem>
            {project.members.map(m => (
              <SelectItem key={m.id} value={m.id}>{m.fullName}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select defaultValue="all-sources">
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Nguồn dữ liệu" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all-sources">Tất cả (GitHub + Jira)</SelectItem>
            <SelectItem value="github">Chỉ GitHub</SelectItem>
            <SelectItem value="jira">Chỉ Jira</SelectItem>
          </SelectContent>
        </Select>
        
        <Button variant="ghost" size="sm" className="ml-auto text-muted-foreground">
          <FilterIcon className="w-4 h-4 mr-2" /> Đặt lại bộ lọc
        </Button>
      </div>

      <div className="text-sm font-medium text-muted-foreground">
        Dữ liệu từ <strong className="text-foreground">12/08/2026</strong> đến <strong className="text-foreground">30/08/2026</strong>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border rounded-xl p-6 min-h-[350px] flex flex-col">
          <h3 className="font-bold mb-1">Cumulative Flow Diagram</h3>
          <p className="text-xs text-muted-foreground mb-4">Phát hiện điểm nghẽn trong luồng công việc</p>
          <div className="flex-1 min-h-[250px]" aria-label="Biểu đồ luồng công việc tích lũy">
            <CumulativeFlowChart />
          </div>
        </div>

        <div className="bg-card border rounded-xl p-6 min-h-[350px] flex flex-col">
          <h3 className="font-bold mb-1">Velocity theo sprint</h3>
          <p className="text-xs text-muted-foreground mb-4">Story point cam kết vs hoàn thành</p>
          <div className="flex-1 min-h-[250px]" aria-label="Biểu đồ velocity theo sprint">
            <VelocityChart />
          </div>
        </div>

        <div className="bg-card border rounded-xl p-6 min-h-[350px] flex flex-col">
          <h3 className="font-bold mb-1">Commit và Jira Issue</h3>
          <p className="text-xs text-muted-foreground mb-4">Hoạt động code và task theo thời gian</p>
          <div className="flex-1 min-h-[250px]" aria-label="Biểu đồ commit và Jira issue">
            <CommitIssueChart />
          </div>
        </div>

        <div className="bg-card border rounded-xl p-6 min-h-[350px] flex flex-col">
          <h3 className="font-bold mb-1">Cycle Time</h3>
          <p className="text-xs text-muted-foreground mb-4">Thời gian trung bình từ In Progress đến Done</p>
          <div className="flex-1 min-h-[250px]" aria-label="Biểu đồ cycle time">
            <CycleTimeChart />
          </div>
        </div>

        <div className="bg-card border rounded-xl p-6 min-h-[350px] flex flex-col lg:col-span-2">
          <h3 className="font-bold mb-1">Phân bổ đóng góp thành viên</h3>
          <p className="text-xs text-muted-foreground mb-4">Tỷ trọng các loại hoạt động của từng cá nhân</p>
          <div className="flex-1 min-h-[260px]" aria-label="Biểu đồ phân bổ đóng góp thành viên">
            <MemberContributionChart />
          </div>
        </div>

        <div className="bg-card border rounded-xl p-6 min-h-[350px] flex flex-col lg:col-span-2">
          <h3 className="font-bold mb-1">Workload Matrix</h3>
          <p className="text-xs text-muted-foreground mb-4">Phân bổ khối lượng công việc theo thời gian</p>
          <div className="flex-1 min-h-[250px] overflow-x-auto" aria-label="Ma trận tải công việc theo thành viên và tuần">
            <div className="min-w-[620px] rounded-lg border overflow-hidden">
              <div className="grid grid-cols-[180px_repeat(4,minmax(90px,1fr))] bg-muted/40 text-xs font-semibold text-muted-foreground">
                <div className="p-3">Thành viên</div>
                {["Tuần 1", "Tuần 2", "Tuần 3", "Tuần 4"].map((week) => (
                  <div key={week} className="p-3 text-center">{week}</div>
                ))}
              </div>
              {workloadByMember.map((row) => (
                <div key={row.member} className="grid grid-cols-[180px_repeat(4,minmax(90px,1fr))] border-t">
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
    </div>
  );
}
