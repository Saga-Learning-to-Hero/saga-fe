"use client";

import { use, useMemo } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeftIcon,
  FolderKanbanIcon,
  GitBranchIcon,
  ExternalLinkIcon,
  CheckCircle2Icon,
  AlertCircleIcon,
  XCircleIcon,
  GitCommitIcon,
  CheckSquareIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { MOCK_PROJECTS } from "@/features/admin/projects/data/mock-projects";
import type { ProjectStatus } from "@/features/admin/projects/types/project-management";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function AdminProjectDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const project = useMemo(() => {
    return MOCK_PROJECTS.find((p) => p.id === resolvedParams.id);
  }, [resolvedParams.id]);

  if (!project) {
    return notFound();
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .slice(-2)
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const formatDate = (iso?: string) => {
    if (!iso) return "Chưa có";
    try {
      return new Date(iso).toLocaleString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return iso;
    }
  };

  const renderIntegrationBadge = (status: "CONNECTED" | "DISCONNECTED" | "WARNING") => {
    switch (status) {
      case "CONNECTED":
        return (
          <Badge className="bg-success-muted text-success border-0 text-xs font-semibold gap-1">
            <CheckCircle2Icon className="w-3.5 h-3.5" />
            Đã kết nối Webhook
          </Badge>
        );
      case "WARNING":
        return (
          <Badge className="bg-warning-muted text-warning border-0 text-xs font-semibold gap-1">
            <AlertCircleIcon className="w-3.5 h-3.5" />
            Mất tín hiệu Webhook
          </Badge>
        );
      case "DISCONNECTED":
        return (
          <Badge className="bg-danger-muted text-danger border-0 text-xs font-semibold gap-1">
            <XCircleIcon className="w-3.5 h-3.5" />
            Chưa liên kết
          </Badge>
        );
    }
  };

  const renderProjectStatusBadge = (status: ProjectStatus) => {
    switch (status) {
      case "ACTIVE":
        return (
          <Badge className="bg-success-muted text-success border-0 text-xs font-semibold gap-1.5 px-3 py-1">
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
            Đang tiến hành
          </Badge>
        );
      case "COMPLETED":
        return (
          <Badge className="bg-primary/10 text-primary border-0 text-xs font-semibold px-3 py-1">
            Hoàn thành
          </Badge>
        );
      case "AT_RISK":
        return (
          <Badge className="bg-danger-muted text-danger border-0 text-xs font-semibold gap-1.5 px-3 py-1">
            <span className="w-1.5 h-1.5 rounded-full bg-danger" />
            Cảnh báo trễ tiến độ
          </Badge>
        );
      case "PLANNED":
        return (
          <Badge variant="secondary" className="text-xs font-semibold px-3 py-1">
            Chưa bắt đầu
          </Badge>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in-0 duration-200">
      {/* ── Breadcrumb & Back button ── */}
      <div className="flex items-center gap-3">
        <Link
          href="/admin/projects"
          className={buttonVariants({ variant: "outline", size: "sm", className: "h-8 gap-1.5 text-xs" })}
        >
          <ArrowLeftIcon className="w-3.5 h-3.5" />
          Quay lại danh sách
        </Link>
        <span className="text-xs text-muted-foreground">/</span>
        <span className="text-xs font-medium text-muted-foreground">Chi tiết nhóm</span>
        <span className="text-xs text-muted-foreground">/</span>
        <span className="text-xs font-semibold text-foreground">{project.groupName}</span>
      </div>

      {/* ── Page Header Banner ── */}
      <Card className="rounded-2xl border border-border shadow-xs">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <FolderKanbanIcon className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl font-bold text-foreground tracking-tight">
                    {project.groupName}
                  </h1>
                  <Badge variant="outline" className="text-xs font-mono">
                    {project.topicCode}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    {project.semester}
                  </Badge>
                  {renderProjectStatusBadge(project.status)}
                </div>
                <p className="text-sm text-muted-foreground max-w-3xl leading-relaxed">
                  {project.topicName}
                </p>
                <p className="text-xs text-muted-foreground/80 font-mono">
                  Mã học phần: {project.courseCode} · Ngày khởi tạo: {formatDate(project.createdAt)}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── People Info: Giảng viên HD & Trưởng nhóm ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Mentor Card */}
        <Card className="rounded-2xl border border-border shadow-xs">
          <CardHeader className="p-4 pb-2">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Giảng viên hướng dẫn
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-1 flex items-center gap-3">
            <Avatar className="w-11 h-11 rounded-xl">
              <AvatarImage src={project.mentor.avatar} alt={project.mentor.fullName} />
              <AvatarFallback className="text-xs font-bold bg-primary text-primary-foreground">
                {getInitials(project.mentor.fullName)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="text-sm font-bold text-foreground truncate">
                {project.mentor.fullName}
              </p>
              <p className="text-xs text-muted-foreground truncate">{project.mentor.email}</p>
            </div>
          </CardContent>
        </Card>

        {/* Leader Card */}
        <Card className="rounded-2xl border border-border shadow-xs">
          <CardHeader className="p-4 pb-2">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Trưởng nhóm (Leader)
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-1 flex items-center gap-3">
            <Avatar className="w-11 h-11 rounded-xl">
              <AvatarFallback className="text-xs font-bold bg-info-muted text-info">
                {getInitials(project.leader.fullName)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold text-foreground truncate">
                  {project.leader.fullName}
                </p>
                <span className="font-mono text-xs px-1.5 py-0.5 rounded bg-muted text-foreground font-semibold">
                  {project.leader.studentCode}
                </span>
              </div>
              <p className="text-xs text-muted-foreground truncate">{project.leader.email}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Integrations Section: Jira & GitHub ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Jira Card */}
        <Card className="rounded-2xl border border-border shadow-xs">
          <CardHeader className="p-5 pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <CardTitle className="text-sm font-bold">Jira Software</CardTitle>
              </div>
              {renderIntegrationBadge(project.jira.status)}
            </div>
          </CardHeader>
          <CardContent className="p-5 pt-0 space-y-3">
            <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-muted/40 border border-border/60">
              <div>
                <span className="text-[11px] text-muted-foreground block">Project Key</span>
                <span className="text-base font-mono font-bold text-primary">
                  {project.jira.projectKey}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-muted-foreground block">Tổng số Tasks</span>
                <span className="text-base font-bold text-foreground">
                  {project.jira.totalTasks} issues
                </span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground flex justify-between">
              <span>Đồng bộ gần nhất:</span>
              <strong className="text-foreground">{formatDate(project.jira.lastSyncedAt)}</strong>
            </p>
          </CardContent>
        </Card>

        {/* GitHub Card */}
        <Card className="rounded-2xl border border-border shadow-xs">
          <CardHeader className="p-5 pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GitBranchIcon className="w-4 h-4 text-foreground" />
                <CardTitle className="text-sm font-bold">GitHub Repository</CardTitle>
              </div>
              {renderIntegrationBadge(project.github.status)}
            </div>
          </CardHeader>
          <CardContent className="p-5 pt-0 space-y-3">
            <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-muted/40 border border-border/60">
              <div className="min-w-0">
                <span className="text-[11px] text-muted-foreground block">Repository</span>
                <a
                  href={project.github.repoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-mono font-bold text-primary hover:underline flex items-center gap-1 truncate"
                >
                  {project.github.repoName}
                  <ExternalLinkIcon className="w-3 h-3 shrink-0" />
                </a>
              </div>
              <div>
                <span className="text-[11px] text-muted-foreground block">Tổng số Commits</span>
                <span className="text-base font-bold text-foreground">
                  {project.github.totalCommits} commits
                </span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground flex justify-between">
              <span>Đồng bộ gần nhất:</span>
              <strong className="text-foreground">{formatDate(project.github.lastSyncedAt)}</strong>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ── Team Members Table ── */}
      <Card className="rounded-2xl border border-border shadow-xs overflow-hidden">
        <CardHeader className="p-5 border-b border-border bg-muted/20">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold">Danh sách thành viên nhóm</CardTitle>
              <CardDescription className="text-xs mt-0.5">
                Bảng phân bổ đóng góp và chỉ số hoạt động của {project.members.length} sinh viên
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-xs">
              {project.members.length} sinh viên
            </Badge>
          </div>
        </CardHeader>

        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow>
              <TableHead className="py-3 px-4 text-xs font-semibold">Thành viên</TableHead>
              <TableHead className="py-3 px-4 text-xs font-semibold">MSSV</TableHead>
              <TableHead className="py-3 px-4 text-xs font-semibold">Vai trò</TableHead>
              <TableHead className="py-3 px-4 text-xs font-semibold text-right">Commits GitHub</TableHead>
              <TableHead className="py-3 px-4 text-xs font-semibold text-right">Tasks Jira</TableHead>
              <TableHead className="py-3 px-4 text-xs font-semibold text-right">Tỷ lệ đóng góp</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-border/60">
            {project.members.map((m) => {
              const commitPercent = project.github.totalCommits > 0
                ? Math.round((m.commitsCount / project.github.totalCommits) * 100)
                : 0;

              return (
                <TableRow key={m.id} className="hover:bg-muted/30">
                  {/* Member Name + Avatar + Email */}
                  <TableCell className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-8 h-8 rounded-lg shrink-0">
                        <AvatarImage src={m.avatar} alt={m.fullName} />
                        <AvatarFallback className="text-xs font-bold">
                          {getInitials(m.fullName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col min-w-0">
                        <span className="font-semibold text-foreground text-xs">
                          {m.fullName}
                        </span>
                        <span className="text-[11px] text-muted-foreground truncate">
                          {m.email}
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  {/* Student Code */}
                  <TableCell className="py-3 px-4">
                    <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-md bg-muted text-foreground">
                      {m.studentCode}
                    </span>
                  </TableCell>

                  {/* Role */}
                  <TableCell className="py-3 px-4">
                    {m.isLeader ? (
                      <Badge className="bg-primary/10 text-primary border-0 text-xs font-semibold">
                        Trưởng nhóm
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs font-normal border-border">
                        Thành viên
                      </Badge>
                    )}
                  </TableCell>

                  {/* Commits */}
                  <TableCell className="py-3 px-4 text-right">
                    <div className="inline-flex items-center gap-1 font-semibold text-foreground text-xs">
                      <GitCommitIcon className="w-3.5 h-3.5 text-muted-foreground" />
                      {m.commitsCount}
                    </div>
                  </TableCell>

                  {/* Tasks */}
                  <TableCell className="py-3 px-4 text-right">
                    <div className="inline-flex items-center gap-1 font-semibold text-foreground text-xs">
                      <CheckSquareIcon className="w-3.5 h-3.5 text-muted-foreground" />
                      {m.tasksCount}
                    </div>
                  </TableCell>

                  {/* Contribution Rate */}
                  <TableCell className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all duration-300"
                          style={{ width: `${commitPercent}%` }}
                        />
                      </div>
                      <span className="font-mono text-xs font-bold text-foreground w-9 text-right">
                        {commitPercent}%
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
