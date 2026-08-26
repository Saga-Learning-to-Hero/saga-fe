"use client";

import { useState, useMemo } from "react";
import { FolderKanbanIcon } from "lucide-react";
import { ProjectStats } from "@/features/admin/projects/components/project-stats";
import { ProjectToolbar } from "@/features/admin/projects/components/project-toolbar";
import { ProjectTable } from "@/features/admin/projects/components/project-table";
import { MOCK_PROJECTS } from "@/features/admin/projects/data/mock-projects";
import type { ManagedProject, ProjectStatus } from "@/features/admin/projects/types/project-management";

export default function AdminProjectsPage() {
  const [projects] = useState<ManagedProject[]>(MOCK_PROJECTS);
  const [search, setSearch] = useState("");
  const [semesterFilter, setSemesterFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState<"ALL" | ProjectStatus>("ALL");
  const [integrationFilter, setIntegrationFilter] = useState<"ALL" | "CONNECTED" | "WARNING">("ALL");

  // Semesters list
  const semesters = useMemo(() => {
    return Array.from(new Set(projects.map((p) => p.semester)));
  }, [projects]);

  // Filtered projects
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const matchSearch =
        search.trim() === "" ||
        p.groupName.toLowerCase().includes(search.toLowerCase()) ||
        p.topicCode.toLowerCase().includes(search.toLowerCase()) ||
        p.topicName.toLowerCase().includes(search.toLowerCase()) ||
        p.jira.projectKey.toLowerCase().includes(search.toLowerCase()) ||
        p.github.repoName.toLowerCase().includes(search.toLowerCase()) ||
        p.mentor.fullName.toLowerCase().includes(search.toLowerCase()) ||
        p.leader.fullName.toLowerCase().includes(search.toLowerCase());

      const matchSemester = semesterFilter === "ALL" || p.semester === semesterFilter;
      const matchStatus = statusFilter === "ALL" || p.status === statusFilter;

      let matchIntegration = true;
      if (integrationFilter === "CONNECTED") {
        matchIntegration = p.jira.status === "CONNECTED" && p.github.status === "CONNECTED";
      } else if (integrationFilter === "WARNING") {
        matchIntegration = p.jira.status !== "CONNECTED" || p.github.status !== "CONNECTED";
      }

      return matchSearch && matchSemester && matchStatus && matchIntegration;
    });
  }, [projects, search, semesterFilter, statusFilter, integrationFilter]);

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in-0 duration-200">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0 shadow-2xs">
            <FolderKanbanIcon className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground tracking-tight">
              Quản lý Dự án & Nhóm đồ án
            </h1>
            <p className="text-xs text-muted-foreground">
              Theo dõi danh sách các nhóm sinh viên làm đồ án và trạng thái tích hợp Webhook Jira / GitHub.
            </p>
          </div>
        </div>
      </div>

      {/* ── Stats Bar ── */}
      <ProjectStats projects={projects} />

      {/* ── Search & Filter Toolbar ── */}
      <ProjectToolbar
        search={search}
        onSearchChange={setSearch}
        semesterFilter={semesterFilter}
        onSemesterFilterChange={setSemesterFilter}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        integrationFilter={integrationFilter}
        onIntegrationFilterChange={setIntegrationFilter}
        semesters={semesters}
        totalFiltered={filteredProjects.length}
        totalOriginal={projects.length}
      />

      {/* ── Streamlined Data Table ── */}
      <ProjectTable projects={filteredProjects} />
    </div>
  );
}
