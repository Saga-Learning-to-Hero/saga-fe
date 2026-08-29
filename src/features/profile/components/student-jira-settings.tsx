"use client";

import { useState } from "react";
import {
  CheckSquareIcon,
  GlobeIcon,
  MailIcon,
  FolderKanbanIcon,
  CheckCircle2Icon,
  PlusIcon,
  Edit3Icon,
  LoaderCircleIcon,
  ExternalLinkIcon,
  UnlinkIcon,
  ClockIcon,
  ShieldCheckIcon,
} from "lucide-react";
import type { User, JiraIntegration } from "@/types/auth";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface StudentJiraSettingsProps {
  user: User;
}

export function StudentJiraSettings({ user }: StudentJiraSettingsProps) {
  const { updateUserProfile } = useAuthStore();
  const currentJira = user.jiraIntegration || {
    connected: true,
    serverUrl: "https://saga-capstone.atlassian.net",
    email: user.email || "hailhhe170504@fpt.edu.vn",
    apiToken: "be-auto-configured",
    projectKey: "SWP490_SAGA",
    lastSyncedAt: "27/08/2026 14:30",
  };

  const [isConnected, setIsConnected] = useState(currentJira.connected);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [form, setForm] = useState({
    serverUrl: currentJira.serverUrl || "",
    email: currentJira.email || "",
    projectKey: currentJira.projectKey || "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState("");

  const handleConnectOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFeedbackMsg("");
    await new Promise((r) => setTimeout(r, 600));

    const newJiraConfig: JiraIntegration = {
      connected: true,
      serverUrl: form.serverUrl || "https://saga-capstone.atlassian.net",
      email: form.email || user.email,
      apiToken: "be-auto-webhook",
      projectKey: form.projectKey || "SWP490_SAGA",
      lastSyncedAt: "27/08/2026 14:30",
    };

    updateUserProfile({ jiraIntegration: newJiraConfig });

    setIsConnected(true);
    setIsFormOpen(false);
    setIsSubmitting(false);
    setFeedbackMsg("Đã liên kết tài khoản Jira thành công!");
    setTimeout(() => setFeedbackMsg(""), 4000);
  };

  const handleDisconnect = async () => {
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 400));

    updateUserProfile({
      jiraIntegration: {
        connected: false,
        serverUrl: "",
        email: "",
        apiToken: "",
        projectKey: "",
      },
    });

    setIsConnected(false);
    setIsFormOpen(false);
    setIsSubmitting(false);
    setForm({ serverUrl: "", email: "", projectKey: "" });
    setFeedbackMsg("Đã ngắt kết nối tài khoản Jira.");
    setTimeout(() => setFeedbackMsg(""), 4000);
  };

  return (
    <Card
      className={`rounded-2xl transition-all duration-300 ${isConnected && !isFormOpen
          ? "bg-emerald-500/5 dark:bg-emerald-950/20 border-emerald-500/40 shadow-sm"
          : "bg-card border-border/80 shadow-xs"
        }`}
    >
      <CardHeader className="p-5 border-b border-border/60">
        <div className="flex items-start justify-between gap-3">
          {/* Logo Jira & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <CheckSquareIcon className="w-6 h-6" />
            </div>
            <div>
              <CardTitle className="text-base font-bold text-foreground tracking-tight">
                Jira Software
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">
                Đồng bộ Task & Sprint từ Jira Cloud
              </CardDescription>
            </div>
          </div>

          {/* Status Badge Top Right */}
          {isConnected && !isFormOpen ? (
            <Badge className="bg-emerald-500 text-white border-0 text-[11px] font-semibold gap-1 px-2.5 py-0.5 shadow-xs">
              <CheckCircle2Icon className="w-3.5 h-3.5" /> Đã kết nối
            </Badge>
          ) : (
            <Badge variant="outline" className="text-muted-foreground border-border text-[11px] font-medium px-2.5 py-0.5">
              Chưa kết nối
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-5 sm:p-6 space-y-5">
        {/* Feedback Alert */}
        {feedbackMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2 animate-in fade-in-0">
            <CheckCircle2Icon className="w-4 h-4 shrink-0" />
            <span>{feedbackMsg}</span>
          </div>
        )}

        {/* ── STATE 1: Đã kết nối (Linked State) ────────────────────── */}
        {isConnected && !isFormOpen ? (
          <div className="space-y-4">
            <p className="text-xs text-muted-foreground">
              Tài khoản Jira bên thứ ba đã được xác thực và liên kết tự động với hệ thống SAGA:
            </p>

            {/* Account Details Box */}
            <div className="p-4 rounded-xl bg-card border border-border/70 space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground font-medium">Jira Email:</span>
                <strong className="text-foreground">{form.email || user.email}</strong>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground font-medium">Workspace URL:</span>
                <a
                  href={form.serverUrl || "https://saga-capstone.atlassian.net"}
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono font-bold text-blue-600 hover:underline flex items-center gap-1"
                >
                  {form.serverUrl || "https://saga-capstone.atlassian.net"}
                  <ExternalLinkIcon className="w-3 h-3" />
                </a>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground font-medium">Project Key:</span>
                <Badge variant="outline" className="font-mono text-[11px]">
                  {form.projectKey || "SWP490_SAGA"}
                </Badge>
              </div>

              <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/50">
                <span className="flex items-center gap-1">
                  <ClockIcon className="w-3 h-3 text-emerald-500" />
                  Ngày xác thực: <strong className="text-foreground font-mono">27/08/2026 14:30</strong>
                </span>
                <span className="text-emerald-600 font-semibold flex items-center gap-1">
                  <ShieldCheckIcon className="w-3.5 h-3.5" /> Webhook Active
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-1 flex items-center justify-between gap-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsFormOpen(true)}
                className="h-9 text-xs font-semibold rounded-xl gap-1.5 cursor-pointer"
              >
                <Edit3Icon className="w-3.5 h-3.5" />
                Sửa thông tin
              </Button>

              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleDisconnect}
                disabled={isSubmitting}
                className="h-9 text-xs font-semibold rounded-xl gap-1.5 cursor-pointer bg-rose-600 hover:bg-rose-700 text-white shadow-xs"
              >
                {isSubmitting ? (
                  <LoaderCircleIcon className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <UnlinkIcon className="w-3.5 h-3.5" />
                )}
                Ngắt kết nối
              </Button>
            </div>
          </div>
        ) : !isFormOpen ? (
          /* ── STATE 2: Chưa kết nối (Unlinked State - Clean CTA Card) ─ */
          <div className="space-y-4">
            <p className="text-xs text-muted-foreground leading-relaxed">
              Tích hợp tài khoản Jira để tự động đồng bộ danh sách đầu việc (Tasks, User Stories, Sprints) và đo lường độ phủ SAGA Traceability.
            </p>

            <div className="p-4 rounded-xl bg-muted/40 border border-border/50 space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
                Lợi ích tích hợp:
              </span>
              <ul className="text-xs text-muted-foreground space-y-1.5">
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  Đồng bộ thời gian thực các Sprint & Tasks từ Jira Cloud.
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  Liên kết tự động mã nguồn GitHub với mã thẻ Jira.
                </li>
              </ul>
            </div>

            {/* CTA Button */}
            <Button
              type="button"
              onClick={() => setIsFormOpen(true)}
              className="w-full h-10 text-xs font-bold rounded-xl gap-2 cursor-pointer shadow-xs bg-blue-600 hover:bg-blue-700 text-white"
            >
              <PlusIcon className="w-4 h-4" />
              + Liên kết với Jira
            </Button>
          </div>
        ) : (
          /* ── STATE 3: Form Điền thông tin kết nối (Interactive Form) ─ */
          <form onSubmit={handleConnectOrUpdate} className="space-y-4 animate-in fade-in-0">
            <div className="space-y-3">
              {/* Workspace URL */}
              <div className="space-y-1.5">
                <Label htmlFor="jira-domain" className="text-xs font-semibold">
                  Jira Workspace / Domain URL <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <GlobeIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="jira-domain"
                    type="url"
                    required
                    value={form.serverUrl}
                    onChange={(e) => setForm((f) => ({ ...f, serverUrl: e.target.value }))}
                    placeholder="https://saga-capstone.atlassian.net"
                    className="pl-9 h-9 text-xs rounded-xl bg-card font-mono"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <Label htmlFor="jira-user-email" className="text-xs font-semibold">
                  Email tài khoản Jira <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <MailIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="jira-user-email"
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    placeholder="hailhhe170504@fpt.edu.vn"
                    className="pl-9 h-9 text-xs rounded-xl bg-card"
                  />
                </div>
              </div>

              {/* Project Key */}
              <div className="space-y-1.5">
                <Label htmlFor="jira-key" className="text-xs font-semibold">
                  Mã dự án (Project Key)
                </Label>
                <div className="relative">
                  <FolderKanbanIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="jira-key"
                    type="text"
                    value={form.projectKey}
                    onChange={(e) => setForm((f) => ({ ...f, projectKey: e.target.value }))}
                    placeholder="SWP490_SAGA"
                    className="pl-9 h-9 text-xs rounded-xl bg-card font-mono uppercase"
                  />
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="pt-2 flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsFormOpen(false)}
                className="h-9 text-xs rounded-xl"
              >
                Hủy
              </Button>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-9 text-xs font-bold rounded-xl gap-1.5 cursor-pointer shadow-xs bg-blue-600 hover:bg-blue-700 text-white px-5"
              >
                {isSubmitting ? (
                  <>
                    <LoaderCircleIcon className="w-4 h-4 animate-spin" />
                    Đang kết nối...
                  </>
                ) : (
                  "Xác nhận kết nối Jira"
                )}
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
