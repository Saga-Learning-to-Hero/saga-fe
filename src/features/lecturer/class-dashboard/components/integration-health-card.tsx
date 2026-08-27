import { CheckCircle2Icon, XCircleIcon, AlertTriangleIcon, ClockIcon } from "lucide-react";
import type { IntegrationHealth, IntegrationStatus } from "../types/course-dashboard";
import { Progress } from "@/components/ui/progress";

export function IntegrationHealthCard({ integrations }: { integrations: IntegrationHealth }) {
  const getStatusIcon = (status: IntegrationStatus) => {
    switch (status) {
      case "CONNECTED":
        return <CheckCircle2Icon className="size-4 text-emerald-500" />;
      case "PARTIAL":
        return <AlertTriangleIcon className="size-4 text-warning" />;
      case "DISCONNECTED":
      case "ERROR":
        return <XCircleIcon className="size-4 text-destructive" />;
    }
  };

  const getStatusColor = (status: IntegrationStatus) => {
    switch (status) {
      case "CONNECTED": return "bg-emerald-500";
      case "PARTIAL": return "bg-warning";
      case "DISCONNECTED":
      case "ERROR": return "bg-destructive";
    }
  };

  return (
    <div className="flex h-full flex-col">
      <div className="mb-6">
        <h3 className="text-base font-bold text-foreground">Sức khỏe tích hợp</h3>
        <p className="text-xs text-muted-foreground">Tình trạng kết nối workspace các nhóm</p>
      </div>

      <div className="flex flex-1 flex-col justify-center gap-6">
        {/* Jira */}
        <div>
          <div className="mb-2 flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 font-semibold">
              {getStatusIcon(integrations.jira.status)}
              <span>Jira Software</span>
            </div>
            <span className="font-bold">{integrations.jira.connectedGroups}/{integrations.jira.totalGroups} nhóm</span>
          </div>
          <Progress
            value={integrations.jira.percentage}
            trackClassName="h-2"
            indicatorClassName={getStatusColor(integrations.jira.status)}
          />
          {integrations.jira.unconnectedGroups.length > 0 && (
            <p className="mt-2 text-[11px] text-muted-foreground">
              Chưa kết nối: <span className="font-medium">{integrations.jira.unconnectedGroups.join(", ")}</span>
            </p>
          )}
        </div>

        {/* GitHub */}
        <div>
          <div className="mb-2 flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 font-semibold">
              {getStatusIcon(integrations.github.status)}
              <span>GitHub</span>
            </div>
            <span className="font-bold">{integrations.github.connectedGroups}/{integrations.github.totalGroups} nhóm</span>
          </div>
          <Progress
            value={integrations.github.percentage}
            trackClassName="h-2"
            indicatorClassName={getStatusColor(integrations.github.status)}
          />
        </div>
      </div>

      <div className="mt-6 flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <ClockIcon className="size-3" />
        <span>Đồng bộ lần cuối: {integrations.jira.lastSync}</span>
      </div>
    </div>
  );
}
