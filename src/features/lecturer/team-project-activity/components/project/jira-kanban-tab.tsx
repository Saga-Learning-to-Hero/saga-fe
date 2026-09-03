import { SearchIcon, AlertCircleIcon, Maximize2Icon, CalendarIcon, CheckCircle2Icon, TimerIcon, StopCircleIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CustomSelect } from "@/components/common/custom-select";
import type { TeamProjectInfo, JiraIssue } from "../../types/team-project";
import { MOCK_JIRA_ISSUES } from "../../data/mock-team-projects";
import { getInitials } from "@/components/layout/sidebar/nav-config";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface JiraKanbanTabProps {
  project: TeamProjectInfo;
}

const KANBAN_COLUMNS = [
  { id: "TODO", matchIds: ["TODO", "TO DO"], label: "CẦN LÀM (TO DO)", color: "bg-slate-500" },
  { id: "IN_PROGRESS", matchIds: ["IN_PROGRESS", "IN PROGRESS"], label: "ĐANG LÀM (IN PROGRESS)", color: "bg-blue-500" },
  { id: "IN_REVIEW", matchIds: ["IN_REVIEW", "IN REVIEW"], label: "ĐANG DUYỆT (IN REVIEW)", color: "bg-amber-500" },
  { id: "BLOCKED", matchIds: ["BLOCKED"], label: "BỊ NGHẼN (BLOCKED)", color: "bg-destructive" },
  { id: "DONE", matchIds: ["DONE"], label: "HOÀN THÀNH (DONE)", color: "bg-success" },
];

export function JiraKanbanTab({ project }: JiraKanbanTabProps) {
  const [sprintFilter, setSprintFilter] = useState("sprint-3");
  const [memberFilter, setMemberFilter] = useState("all");
  const [search, setSearch] = useState("");

  const getIssueIcon = (type: JiraIssue["type"]) => {
    switch (type) {
      case "STORY":
      case "Story": return <div className="w-4 h-4 bg-success rounded-sm flex items-center justify-center text-white text-[10px] font-bold">S</div>;
      case "TASK":
      case "Task": return <div className="w-4 h-4 bg-blue-500 rounded-sm flex items-center justify-center text-white text-[10px] font-bold">T</div>;
      case "BUG":
      case "Bug": return <div className="w-4 h-4 bg-destructive rounded-sm flex items-center justify-center text-white text-[10px] font-bold">B</div>;
      default: return <div className="w-4 h-4 bg-primary rounded-sm flex items-center justify-center text-white text-[10px] font-bold">T</div>;
    }
  };

  const getPriorityColor = (priority: JiraIssue["priority"]) => {
    switch (priority) {
      case "HIGHEST":
      case "Highest": return "text-destructive";
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

  // MOCK_NOW for consistent overdue checking during tests
  const MOCK_NOW = new Date("2026-08-30");

  const filteredIssues = MOCK_JIRA_ISSUES.filter(issue => {
    if (memberFilter !== "all") {
      if (memberFilter === "unassigned" && issue.assigneeId) return false;
      if (memberFilter !== "unassigned" && issue.assigneeId !== memberFilter) return false;
    }
    if (search) {
      const q = search.toLowerCase();
      if (!issue.summary.toLowerCase().includes(q) && !issue.key.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  // Calculate metrics
  const totalIssues = MOCK_JIRA_ISSUES.length;
  const doneIssues = MOCK_JIRA_ISSUES.filter(i => i.status === "DONE").length;
  const blockedIssues = MOCK_JIRA_ISSUES.filter(i => i.status === "BLOCKED").length;
  const overdueIssues = MOCK_JIRA_ISSUES.filter(i => i.dueDate && new Date(i.dueDate) < MOCK_NOW && i.status !== "DONE").length;
  const completionRate = totalIssues > 0 ? Math.round((doneIssues / totalIssues) * 100) : 0;

  return (
    <div className="p-4 sm:p-6 h-[calc(100vh-280px)] min-h-[600px] flex flex-col gap-4">
      {/* Sprint Health Compact Insight */}
      <div className="flex flex-wrap items-center gap-4 bg-card p-4 rounded-xl border border-border/60 shadow-saga-xs shrink-0">
        <div className="flex-1 min-w-[200px]">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
              <TimerIcon className="w-3.5 h-3.5" /> TIẾN ĐỘ SPRINT
            </span>
            <span className="text-sm font-bold font-mono text-primary">{completionRate}%</span>
          </div>
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <div className="bg-primary h-full rounded-full transition-all" style={{ width: `${completionRate}%` }} />
          </div>
        </div>
        
        <div className="h-8 w-px bg-border/60 mx-2 hidden md:block" />

        <div className="flex items-center gap-6">
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 mb-1">
              <CheckCircle2Icon className="w-3.5 h-3.5" /> HOÀN THÀNH
            </span>
            <span className="text-lg font-bold font-mono">{doneIssues} / {totalIssues}</span>
          </div>
          
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 mb-1">
              <StopCircleIcon className="w-3.5 h-3.5" /> BỊ NGHẼN
            </span>
            <span className="text-lg font-bold font-mono text-destructive">{blockedIssues}</span>
          </div>

          <div className="flex flex-col">
            <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 mb-1">
              <AlertCircleIcon className="w-3.5 h-3.5" /> QUÁ HẠN
            </span>
            <span className="text-lg font-bold font-mono text-amber-500">{overdueIssues}</span>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-4 bg-muted/20 p-4 rounded-xl border border-border/50 shrink-0">
        <div className="w-[180px]">
          <CustomSelect
            value={sprintFilter}
            onChange={setSprintFilter}
            options={[
              { value: "sprint-3", label: "Sprint 3 (Hiện tại)" },
              { value: "sprint-2", label: "Sprint 2" },
              { value: "sprint-1", label: "Sprint 1" },
            ]}
          />
        </div>

        <div className="relative w-full sm:w-64">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Tìm kiếm issue..." 
            className="pl-9 bg-background" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="w-[200px]">
          <CustomSelect
            value={memberFilter}
            onChange={setMemberFilter}
            options={[
              { value: "all", label: "Tất cả người thực hiện" },
              ...project.members.map(m => ({ value: m.id, label: m.fullName })),
              { value: "unassigned", label: "Chưa phân công" }
            ]}
          />
        </div>

        <Button variant="outline" className="ml-auto bg-background" size="icon">
          <Maximize2Icon className="w-4 h-4" />
        </Button>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden rounded-xl">
        <div className="flex gap-4 h-full min-w-max pb-4">
          {KANBAN_COLUMNS.map(column => {
            const issues = filteredIssues.filter(i => column.matchIds.includes(i.status));

            return (
              <div key={column.id} className="w-[300px] flex flex-col bg-muted/30 rounded-xl border border-border/60 h-full">
                {/* Column Header */}
                <div className="p-3 border-b border-border/60 flex items-center justify-between shrink-0 bg-muted/20 rounded-t-xl">
                  <div className="flex items-center gap-2">
                    <div className={cn("w-2.5 h-2.5 rounded-full", column.color)} />
                    <h3 className="font-bold text-sm text-foreground">{column.label}</h3>
                  </div>
                  <Badge variant="secondary" className="font-mono bg-background">{issues.length}</Badge>
                </div>

                {/* Column Content */}
                <div className="flex-1 overflow-y-auto p-3 space-y-3">
                  {issues.map(issue => {
                    const assignee = project.members.find(m => m.id === issue.assigneeId);
                    const isOverdue = issue.dueDate && new Date(issue.dueDate) < MOCK_NOW;

                    return (
                      <div key={issue.id} className="bg-card p-3 rounded-lg border border-border/60 shadow-saga-xs cursor-pointer hover:border-primary/50 hover:shadow-saga-sm transition-all group">
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
                              <Badge key={label} variant="outline" className="text-[9px] py-0 h-4 bg-muted/50 font-normal shadow-none">
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
                                isOverdue && issue.status !== "DONE" ? "bg-destructive/10 text-destructive" : "text-muted-foreground bg-muted/50"
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
