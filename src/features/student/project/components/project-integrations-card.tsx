"use client";

import { useState } from "react";
import {
  Link2Icon,
  CheckSquareIcon,
  GitBranchIcon,
  CrownIcon,
  ExternalLinkIcon,
  PlusIcon,
  Trash2Icon,
  RefreshCwIcon,
  ShieldCheckIcon,
  GitCommitIcon,
  GitPullRequestIcon,
  ClockIcon,
  CheckCircle2Icon,
  LoaderCircleIcon,
  UnlinkIcon,
} from "lucide-react";
import type { StudentProjectDetails, ProjectJiraConfig, ProjectGitHubRepo } from "../types/student-project";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ProjectIntegrationsCardProps {
  project: StudentProjectDetails;
  isLeader: boolean;
  onUpdateJira: (config: ProjectJiraConfig | undefined) => void;
  onAddRepo: (repo: ProjectGitHubRepo) => void;
  onEditRepo?: (repo: ProjectGitHubRepo) => void;
  onDeleteRepo: (repoId: string) => void;
}

const PROJECT_JIRA_CANDIDATES: ProjectJiraConfig[] = [
  {
    serverUrl: "https://saga-capstone.atlassian.net",
    projectKey: "SWP490_SAGA",
    projectName: "SAGA Capstone Scrum Workspace",
    connected: true,
    lastSyncedAt: "Vừa xong",
    tasksCount: 38,
  },
  {
    serverUrl: "https://fpt-swp391.atlassian.net",
    projectKey: "SWP391_ECOMMERCE",
    projectName: "Hệ thống Thương mại Điện tử B2C",
    connected: true,
    lastSyncedAt: "Vừa xong",
    tasksCount: 24,
  },
];

const PROJECT_GITHUB_CANDIDATES: ProjectGitHubRepo[] = [
  {
    id: "repo-fe",
    alias: "Frontend Web Application (Next.js 16)",
    repository: "Saga-Learning-to-Hero/saga-fe",
    defaultBranch: "dev",
    connected: true,
    lastSyncedAt: "Vừa xong",
    commitsCount: 98,
    pullRequestsCount: 12,
  },
  {
    id: "repo-be",
    alias: "Backend Core API (Spring Boot & Neo4j)",
    repository: "Saga-Learning-to-Hero/saga-be",
    defaultBranch: "main",
    connected: true,
    lastSyncedAt: "Vừa xong",
    commitsCount: 142,
    pullRequestsCount: 18,
  },
  {
    id: "repo-ai",
    alias: "SNA Graph Analytics Engine (Python FastAPI)",
    repository: "Saga-Learning-to-Hero/saga-ai",
    defaultBranch: "main",
    connected: true,
    lastSyncedAt: "Vừa xong",
    commitsCount: 54,
    pullRequestsCount: 6,
  },
  {
    id: "repo-devops",
    alias: "DevOps CI/CD & Kubernetes Infrastructure",
    repository: "Saga-Learning-to-Hero/saga-devops",
    defaultBranch: "main",
    connected: true,
    lastSyncedAt: "Vừa xong",
    commitsCount: 31,
    pullRequestsCount: 4,
  },
  {
    id: "repo-mobile",
    alias: "Student Companion App (React Native)",
    repository: "Saga-Learning-to-Hero/saga-mobile",
    defaultBranch: "dev",
    connected: true,
    lastSyncedAt: "Vừa xong",
    commitsCount: 46,
    pullRequestsCount: 8,
  },
];

export function ProjectIntegrationsCard({
  project,
  isLeader,
  onUpdateJira,
  onAddRepo,
  onDeleteRepo,
}: ProjectIntegrationsCardProps) {
  const [feedbackMsg, setFeedbackMsg] = useState("");
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [isConnectingJira, setIsConnectingJira] = useState(false);
  const [isConnectingRepo, setIsConnectingRepo] = useState(false);

  const jira = project.jiraConfig;

  const repos = project.githubRepositories && project.githubRepositories.length > 0
    ? project.githubRepositories
    : [
      {
        id: "repo-fe",
        alias: "Frontend Web Application (Next.js 16)",
        repository: project.githubRepository || "Saga-Learning-to-Hero/saga-fe",
        defaultBranch: "dev",
        connected: true,
        lastSyncedAt: "28/08/2026 15:45",
        commitsCount: 98,
        pullRequestsCount: 12,
      },
    ];

  const handleConnectJiraLink = async () => {
    setIsConnectingJira(true);
    setFeedbackMsg("Đang chuyển hướng sang Atlassian để xác thực và ủy quyền Jira cho Đồ án...");

    await new Promise((r) => setTimeout(r, 1200));

    const candidate = PROJECT_JIRA_CANDIDATES.find(
      (c) => c.projectKey !== jira?.projectKey
    ) || PROJECT_JIRA_CANDIDATES[0];

    onUpdateJira(candidate);
    setIsConnectingJira(false);
    setFeedbackMsg(`Đã kết nối thành công Jira Workspace (${candidate.projectKey}) cho Đồ án qua Atlassian OAuth!`);
    setTimeout(() => setFeedbackMsg(""), 4500);
  };

  const handleDisconnectJira = () => {
    onUpdateJira(undefined);
    setFeedbackMsg("Đã ngắt kết nối Jira của Đồ án.");
    setTimeout(() => setFeedbackMsg(""), 3500);
  };

  const handleAddRepoLink = async () => {
    setIsConnectingRepo(true);
    setFeedbackMsg("Đang chuyển hướng sang GitHub để cấp quyền kho mã nguồn cho Đồ án...");

    await new Promise((r) => setTimeout(r, 1200));

    const nextRepo = PROJECT_GITHUB_CANDIDATES.find(
      (c) => !repos.some((r) => r.repository === c.repository)
    );

    if (!nextRepo) {
      setIsConnectingRepo(false);
      setFeedbackMsg("Tất cả các kho mã nguồn gợi ý của nhóm đã được kết nối đầy đủ!");
      setTimeout(() => setFeedbackMsg(""), 4000);
      return;
    }

    onAddRepo(nextRepo);
    setIsConnectingRepo(false);
    setFeedbackMsg(`Đã liên kết thành công Repository (${nextRepo.repository}) từ GitHub!`);
    setTimeout(() => setFeedbackMsg(""), 4500);
  };

  const handleSyncJira = async () => {
    setSyncingId("jira");
    await new Promise((r) => setTimeout(r, 650));
    setSyncingId(null);
    setFeedbackMsg("Đã đồng bộ lại tiến độ từ Jira Project thành công!");
    setTimeout(() => setFeedbackMsg(""), 3500);
  };

  const handleSyncRepo = async (id: string) => {
    setSyncingId(id);
    await new Promise((r) => setTimeout(r, 650));
    setSyncingId(null);
    setFeedbackMsg("Đã đồng bộ commit từ Repository thành công!");
    setTimeout(() => setFeedbackMsg(""), 3500);
  };

  return (
    <Card className="rounded-2xl border border-border/80 shadow-xs bg-card overflow-hidden">
      <CardHeader className="p-4 sm:p-5 border-b border-border/60">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <Link2Icon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-base font-bold text-foreground">
                  Liên kết Tích hợp Đồ án (Project Integrations)
                </CardTitle>
                {isLeader ? (
                  <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-300 border-0 text-[10px] font-semibold gap-1">
                    <CrownIcon className="w-3 h-3" />
                    Quyền Trưởng nhóm
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-[10px] text-muted-foreground border-border">
                    Chế độ xem (Thành viên)
                  </Badge>
                )}
              </div>
              <CardDescription className="text-xs text-muted-foreground">
                Kết nối trực tiếp qua link ủy quyền Atlassian Jira (duy nhất 1) và GitHub Repositories (đa repo)
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-6 space-y-6">
        {feedbackMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2 animate-in fade-in-0">
            <CheckCircle2Icon className="w-4 h-4 shrink-0" />
            <span>{feedbackMsg}</span>
          </div>
        )}

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
                <CheckSquareIcon className="w-3.5 h-3.5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                  Jira Software Project (Duy nhất 1 Site & Key)
                </h4>
                <p className="text-[11px] text-muted-foreground">
                  Tất cả thành viên trong nhóm sẽ đối soát thẻ công việc theo Jira Site và Key này
                </p>
              </div>
            </div>

            {isLeader && (
              <Button
                type="button"
                size="sm"
                onClick={handleConnectJiraLink}
                disabled={isConnectingJira}
                className="h-8 px-3 text-xs font-bold rounded-xl gap-1.5 bg-blue-600 hover:bg-blue-700 text-white cursor-pointer shadow-2xs"
              >
                {isConnectingJira ? (
                  <>
                    <LoaderCircleIcon className="w-3.5 h-3.5 animate-spin" />
                    <span>Đang chuyển hướng...</span>
                  </>
                ) : (
                  <>
                    <ExternalLinkIcon className="w-3.5 h-3.5" />
                    <span>{jira ? "Đổi Jira qua Link" : "+ Kết nối Jira qua Link"}</span>
                  </>
                )}
              </Button>
            )}
          </div>

          {!jira ? (
            <div className="p-6 rounded-2xl border border-dashed border-border/80 bg-muted/20 text-center space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
                <CheckSquareIcon className="w-5 h-5" />
              </div>
              <div className="max-w-md mx-auto space-y-1">
                <h5 className="text-xs font-bold text-foreground">Chưa có Jira Workspace nào cho đồ án</h5>
                <p className="text-[11px] text-muted-foreground">
                  Trưởng nhóm bấm nút kết nối để chuyển hướng sang Atlassian Jira và xác thực dự án 1-chạm.
                </p>
              </div>
              {isLeader && (
                <Button
                  type="button"
                  size="sm"
                  onClick={handleConnectJiraLink}
                  disabled={isConnectingJira}
                  className="h-8 px-3 text-xs font-bold rounded-xl gap-1.5 bg-blue-600 hover:bg-blue-700 text-white cursor-pointer shadow-2xs"
                >
                  <ExternalLinkIcon className="w-3.5 h-3.5" />
                  <span>Chuyển sang Atlassian để kết nối Jira</span>
                </Button>
              )}
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/25 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1.5 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-bold text-foreground">
                    {jira.projectName || `Jira Project (${jira.projectKey})`}
                  </span>
                  <Badge variant="outline" className="font-mono font-bold text-xs bg-background">
                    {jira.projectKey}
                  </Badge>
                  <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-0 text-[10px] font-semibold">
                    <ShieldCheckIcon className="w-3 h-3 mr-1" />
                    Active
                  </Badge>
                </div>

                <div className="flex items-center gap-3 text-xs text-muted-foreground font-mono truncate">
                  <a
                    href={jira.serverUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 truncate"
                  >
                    <span className="truncate">{jira.serverUrl}</span>
                    <ExternalLinkIcon className="w-3 h-3 shrink-0" />
                  </a>
                  <span>•</span>
                  <span>{jira.tasksCount ?? 38} tasks đồng bộ</span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleSyncJira}
                  disabled={syncingId === "jira"}
                  className="h-8 px-3 text-xs font-semibold rounded-xl gap-1.5 cursor-pointer"
                >
                  <RefreshCwIcon className={`w-3.5 h-3.5 ${syncingId === "jira" ? "animate-spin text-primary" : ""}`} />
                  <span>Đồng bộ ngay</span>
                </Button>

                {isLeader && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleDisconnectJira}
                    className="h-8 w-8 p-0 rounded-xl text-muted-foreground hover:text-rose-600 hover:bg-rose-500/10 cursor-pointer"
                    title="Ngắt kết nối Jira"
                  >
                    <UnlinkIcon className="w-3.5 h-3.5" />
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-3 pt-4 border-t border-border/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-purple-600 text-white flex items-center justify-center shrink-0">
                <GitBranchIcon className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                    GitHub Repositories Đồ Án (Đa Repositories)
                  </h4>
                  <Badge variant="outline" className="font-mono text-[10px] border-purple-500/30 text-purple-600 dark:text-purple-400 bg-purple-500/10 font-bold">
                    {repos.length} repos
                  </Badge>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Gom mã nguồn từ các phân hệ Frontend, Backend, AI Model về chung đồ án
                </p>
              </div>
            </div>

            {isLeader && (
              <Button
                type="button"
                size="sm"
                onClick={handleAddRepoLink}
                disabled={isConnectingRepo}
                className="h-8 px-3 text-xs font-bold rounded-xl gap-1.5 bg-purple-600 hover:bg-purple-700 text-white cursor-pointer shadow-2xs"
              >
                {isConnectingRepo ? (
                  <>
                    <LoaderCircleIcon className="w-3.5 h-3.5 animate-spin" />
                    <span>Đang chuyển hướng...</span>
                  </>
                ) : (
                  <>
                    <PlusIcon className="w-3.5 h-3.5" />
                    <span>+ Thêm Repo qua GitHub Link</span>
                  </>
                )}
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {repos.map((r) => (
              <div
                key={r.id}
                className="p-4 rounded-2xl bg-card border border-border/80 hover:border-border transition-all duration-200 flex flex-col justify-between gap-3.5 shadow-2xs"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-bold text-foreground line-clamp-1">
                      {r.alias || r.repository}
                    </span>
                    <Badge variant="outline" className="font-mono text-[10px] py-0 bg-muted/30">
                      {r.defaultBranch}
                    </Badge>
                  </div>

                  <a
                    href={`https://github.com/${r.repository}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-mono font-semibold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1 truncate"
                  >
                    <span className="truncate">{r.repository}</span>
                    <ExternalLinkIcon className="w-3 h-3 shrink-0" />
                  </a>

                  <div className="flex items-center gap-3 text-[11px] font-mono text-muted-foreground pt-1 border-t border-border/40">
                    <span className="flex items-center gap-1 text-primary font-bold">
                      <GitCommitIcon className="w-3 h-3" />
                      {r.commitsCount ?? 0} commits
                    </span>
                    <span className="flex items-center gap-1 text-purple-600 dark:text-purple-400 font-bold">
                      <GitPullRequestIcon className="w-3 h-3" />
                      {r.pullRequestsCount ?? 0} PRs
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border/40 text-[11px]">
                  <div className="flex items-center gap-1 text-muted-foreground font-mono">
                    <ClockIcon className="w-3 h-3 text-emerald-500 shrink-0" />
                    <span>{r.lastSyncedAt || "Vừa xong"}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSyncRepo(r.id)}
                      disabled={syncingId === r.id}
                      className="h-7 w-7 p-0 rounded-lg text-muted-foreground hover:text-foreground cursor-pointer"
                      title="Đồng bộ ngay"
                    >
                      <RefreshCwIcon className={`w-3 h-3 ${syncingId === r.id ? "animate-spin text-primary" : ""}`} />
                    </Button>

                    {isLeader && repos.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => onDeleteRepo(r.id)}
                        className="h-7 w-7 p-0 rounded-lg text-rose-500 hover:bg-rose-500/10 cursor-pointer"
                        title="Xóa repository"
                      >
                        <Trash2Icon className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
