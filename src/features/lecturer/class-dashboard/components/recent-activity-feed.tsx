import { GitPullRequestIcon, KanbanIcon, ActivityIcon } from "lucide-react";
import type { RecentActivity, ActivitySource } from "../types/course-dashboard";

export function RecentActivityFeed({ activities }: { activities: RecentActivity[] }) {
  const getSourceConfig = (source: ActivitySource) => {
    switch (source) {
      case "GITHUB":
        return { icon: <GitPullRequestIcon className="size-3.5" />, color: "bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900", label: "GitHub" };
      case "JIRA":
        return { icon: <KanbanIcon className="size-3.5" />, color: "bg-blue-600 text-white", label: "Jira" };
      case "SAGA":
        return { icon: <ActivityIcon className="size-3.5" />, color: "bg-primary text-primary-foreground", label: "SAGA" };
    }
  };

  return (
    <div className="flex flex-col">
      <div className="mb-4">
        <h3 className="text-base font-bold text-foreground">Hoạt động gần đây</h3>
        <p className="text-xs text-muted-foreground">Cập nhật từ Jira, GitHub và hệ thống</p>
      </div>

      <div className="relative border-l-2 border-muted ml-3 space-y-6 py-2">
        {activities.map((activity) => {
          const config = getSourceConfig(activity.source);
          return (
            <div key={activity.id} className="relative pl-6">
              {/* Timeline dot */}
              <div className={`absolute -left-[13px] flex size-6 items-center justify-center rounded-full shadow-sm ring-4 ring-background ${config.color}`}>
                {config.icon}
              </div>
              
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                  <span>{config.label}</span>
                  <span>·</span>
                  <span>{activity.timestamp}</span>
                </div>
                <p className="text-sm">
                  <span className="font-bold text-foreground">{activity.actor}</span>{" "}
                  <span className="text-muted-foreground">{activity.action}</span>{" "}
                  <span className="font-semibold text-foreground">{activity.target}</span>
                </p>
              </div>
            </div>
          );
        })}
      </div>
      
      {activities.length > 0 && (
        <button className="mt-4 w-full rounded-lg border border-border bg-muted/30 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
          Xem tất cả hoạt động
        </button>
      )}
    </div>
  );
}
