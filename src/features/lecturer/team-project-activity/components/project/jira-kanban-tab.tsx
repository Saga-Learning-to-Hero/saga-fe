import { KanbanIcon, SearchIcon, FilterIcon, AlertCircleIcon, Maximize2Icon, CalendarIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { TeamProjectInfo, JiraIssue } from "../../types/team-project";
import { MOCK_JIRA_ISSUES } from "../../data/mock-team-projects";
import { getInitials } from "@/components/layout/sidebar/nav-config";
import { cn } from "@/lib/utils";

interface JiraKanbanTabProps {
  project: TeamProjectInfo;
}

const KANBAN_COLUMNS = [
  { id: "TODO", matchIds: ["TODO", "TO DO"], label: "CẦN LÀM (TO DO)", color: "bg-slate-500" },
  { id: "IN_PROGRESS", matchIds: ["IN_PROGRESS", "IN PROGRESS"], label: "ĐANG LÀM (IN PROGRESS)", color: "bg-blue-500" },
  { id: "IN_REVIEW", matchIds: ["IN_REVIEW", "IN REVIEW"], label: "ĐANG DUYỆT (IN REVIEW)", color: "bg-amber-500" },
  { id: "BLOCKED", matchIds: ["BLOCKED"], label: "BỊ NGHẼN (BLOCKED)", color: "bg-danger" },
  { id: "DONE", matchIds: ["DONE"], label: "HOÀN THÀNH (DONE)", color: "bg-success" },
];

export function JiraKanbanTab({ project }: JiraKanbanTabProps) {
  const getIssueIcon = (type: JiraIssue["type"]) => {
    switch (type) {
      case "STORY":
      case "Story": return <div className="w-4 h-4 bg-success rounded-sm flex items-center justify-center text-white text-[10px] font-bold">S</div>;
      case "TASK":
      case "Task": return <div className="w-4 h-4 bg-blue-500 rounded-sm flex items-center justify-center text-white text-[10px] font-bold">T</div>;
      case "BUG":
      case "Bug": return <div className="w-4 h-4 bg-danger rounded-sm flex items-center justify-center text-white text-[10px] font-bold">B</div>;
      default: return <div className="w-4 h-4 bg-primary rounded-sm flex items-center justify-center text-white text-[10px] font-bold">T</div>;
    }
  };

  const getPriorityColor = (priority: JiraIssue["priority"]) => {
    switch (priority) {
      case "HIGHEST":
      case "Highest": return "text-danger";
      case "HIGH":
      case "High": return "text-amber-500";
      case "MEDIUM":
      case "Medium": return "text-blue-500";
      case "LOW":
      case "LOWEST":
      case "Low":
      case "Lowest": return "text-muted-foreground";
      default: return "text-muted-foreground";
    }
  };

  return (
    <div className="p-6 h-[calc(100vh-280px)] min-h-[600px] flex flex-col">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-4 mb-6 shrink-0">
        <Select defaultValue="sprint-3">
          <SelectTrigger className="w-[180px] bg-card font-semibold">
            <KanbanIcon className="w-4 h-4 mr-2 text-primary" />
            <SelectValue placeholder="Sprint" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="sprint-3">Sprint 3 (Hiện tại)</SelectItem>
            <SelectItem value="sprint-2">Sprint 2</SelectItem>
            <SelectItem value="sprint-1">Sprint 1</SelectItem>
          </SelectContent>
        </Select>

        <div className="relative w-full sm:w-64">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Tìm kiếm issue..." className="pl-9 bg-card" />
        </div>

        <Select defaultValue="all">
          <SelectTrigger className="w-[170px] bg-card">
            <FilterIcon className="w-3.5 h-3.5 mr-2" />
            <SelectValue placeholder="Người thực hiện" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả người thực hiện</SelectItem>
            {project.members.map(m => (
              <SelectItem key={m.id} value={m.id}>{m.fullName}</SelectItem>
            ))}
            <SelectItem value="unassigned">Chưa phân công</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" className="ml-auto bg-card" size="icon">
          <Maximize2Icon className="w-4 h-4" />
        </Button>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        <div className="flex gap-4 h-full min-w-max pb-4">
          {KANBAN_COLUMNS.map(column => {
            const issues = MOCK_JIRA_ISSUES.filter(i => column.matchIds.includes(i.status));

            return (
              <div key={column.id} className="w-[300px] flex flex-col bg-muted/30 rounded-xl border h-full">
                {/* Column Header */}
                <div className="p-3 border-b flex items-center justify-between shrink-0 bg-muted/10 rounded-t-xl">
                  <div className="flex items-center gap-2">
                    <div className={cn("w-2.5 h-2.5 rounded-full", column.color)} />
                    <h3 className="font-bold text-sm text-foreground">{column.label}</h3>
                  </div>
                  <Badge variant="secondary" className="font-mono">{issues.length}</Badge>
                </div>

                {/* Column Content */}
                <div className="flex-1 overflow-y-auto p-3 space-y-3">
                  {issues.map(issue => {
                    const assignee = project.members.find(m => m.id === issue.assigneeId);
                    const isOverdue = issue.dueDate && new Date(issue.dueDate) < new Date("2026-08-30");

                    return (
                      <div key={issue.id} className="bg-card p-3 rounded-lg border shadow-saga-xs cursor-pointer hover:border-primary/50 hover:shadow-saga-sm transition-all group">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-mono font-semibold text-muted-foreground group-hover:text-primary transition-colors">
                            {issue.key}
                          </span>
                          <div className="flex items-center gap-1">
                            {getIssueIcon(issue.type)}
                          </div>
                        </div>

                        <p className="font-medium text-sm text-foreground mb-3 line-clamp-3 leading-snug">
                          {issue.summary}
                        </p>

                        {/* Labels */}
                        {issue.labels.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {issue.labels.map(label => (
                              <Badge key={label} variant="outline" className="text-[9px] py-0 h-4 bg-muted/50 font-normal">
                                {label}
                              </Badge>
                            ))}
                          </div>
                        )}

                        <div className="flex items-end justify-between mt-auto">
                          <div className="flex items-center gap-2">
                            {/* Assignee Avatar */}
                            {assignee ? (
                              <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold" title={assignee.fullName}>
                                {getInitials(assignee.fullName)}
                              </div>
                            ) : (
                              <div className="w-6 h-6 rounded-full border border-dashed border-muted-foreground/50 flex items-center justify-center text-[10px]" title="Unassigned">
                                ?
                              </div>
                            )}

                            {/* Priority */}
                            <span title={`Priority: ${issue.priority}`}>
                              <AlertCircleIcon className={cn("w-3.5 h-3.5", getPriorityColor(issue.priority))} />
                            </span>

                            {/* Due date */}
                            {issue.dueDate && (
                              <div className={cn(
                                "flex items-center text-[10px] font-medium px-1.5 py-0.5 rounded",
                                isOverdue && issue.status !== "DONE" ? "bg-danger/10 text-danger" : "text-muted-foreground"
                              )}>
                                <CalendarIcon className="w-3 h-3 mr-1" />
                                {new Date(issue.dueDate).toLocaleDateString("vi-VN", { day: '2-digit', month: '2-digit' })}
                              </div>
                            )}
                          </div>

                          <div className="flex items-center justify-center w-5 h-5 rounded-full bg-muted text-[10px] font-bold font-mono text-muted-foreground" title={`${issue.storyPoint} Story Points`}>
                            {issue.storyPoint}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
