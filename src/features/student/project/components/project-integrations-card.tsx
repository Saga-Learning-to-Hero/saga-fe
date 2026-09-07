"use client";

import { useState } from "react";
import { Link2Icon, CrownIcon, CheckCircle2Icon } from "lucide-react";
import type { StudentProjectDetails, ProjectJiraConfig, ProjectGitHubRepo } from "../types/student-project";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProjectJiraSection } from "./integrations/project-jira-section";
import { ProjectGithubSection } from "./integrations/project-github-section";

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
  const repos =
    project.githubRepositories && project.githubRepositories.length > 0
      ? project.githubRepositories
      : [
          {
            id: "repo-fe",
            alias: "Frontend Web Application (Next.js 16)",
            repository: project.githubRepositories?.[0]?.repository || "Saga-Learning-to-Hero/saga-fe",
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

    const candidate =
      PROJECT_JIRA_CANDIDATES.find((c) => c.projectKey !== jira?.projectKey) ||
      PROJECT_JIRA_CANDIDATES[0];

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

        <ProjectJiraSection
          jira={jira}
          isLeader={isLeader}
          isConnectingJira={isConnectingJira}
          syncingId={syncingId}
          onConnectJira={handleConnectJiraLink}
          onSyncJira={handleSyncJira}
          onDisconnectJira={handleDisconnectJira}
        />

        <ProjectGithubSection
          repos={repos}
          isLeader={isLeader}
          isConnectingRepo={isConnectingRepo}
          syncingId={syncingId}
          onAddRepo={handleAddRepoLink}
          onSyncRepo={handleSyncRepo}
          onDeleteRepo={onDeleteRepo}
        />
      </CardContent>
    </Card>
  );
}
