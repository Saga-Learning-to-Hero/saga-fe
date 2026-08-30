"use client";

import { useState } from "react";
import {
  GitBranchIcon,
  UserIcon,
  FolderGit2Icon,
  CheckCircle2Icon,
  PlusIcon,
  Edit3Icon,
  LoaderCircleIcon,
  ExternalLinkIcon,
  UnlinkIcon,
  ClockIcon,
  ShieldCheckIcon,
} from "lucide-react";
import type { User, GitHubIntegration } from "@/types/auth";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface StudentGitHubSettingsProps {
  user: User;
}

export function StudentGitHubSettings({ user }: StudentGitHubSettingsProps) {
  const { updateUserProfile } = useAuthStore();
  const currentGitHub = user.githubIntegration || {
    connected: true,
    username: "lehoanghai-fpt",
    accessToken: "be-auto-configured",
    repository: "Saga-Learning-to-Hero/saga-fe",
    defaultBranch: "main",
    lastSyncedAt: "27/08/2026 14:30",
  };

  const [isConnected, setIsConnected] = useState(currentGitHub.connected);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [form, setForm] = useState({
    username: currentGitHub.username || "",
    repository: currentGitHub.repository || "",
    defaultBranch: currentGitHub.defaultBranch || "main",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState("");

  const handleConnectOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFeedbackMsg("");
    await new Promise((r) => setTimeout(r, 600));

    const newGitHubConfig: GitHubIntegration = {
      connected: true,
      username: form.username || "lehoanghai-fpt",
      accessToken: "be-auto-webhook",
      repository: form.repository || "Saga-Learning-to-Hero/saga-fe",
      defaultBranch: form.defaultBranch || "main",
      lastSyncedAt: "27/08/2026 14:30",
    };

    updateUserProfile({ githubIntegration: newGitHubConfig });

    setIsConnected(true);
    setIsFormOpen(false);
    setIsSubmitting(false);
    setFeedbackMsg("Đã liên kết tài khoản GitHub thành công!");
    setTimeout(() => setFeedbackMsg(""), 4000);
  };

  const handleDisconnect = async () => {
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 400));

    updateUserProfile({
      githubIntegration: {
        connected: false,
        username: "",
        accessToken: "",
        repository: "",
        defaultBranch: "main",
      },
    });

    setIsConnected(false);
    setIsFormOpen(false);
    setIsSubmitting(false);
    setForm({ username: "", repository: "", defaultBranch: "main" });
    setFeedbackMsg("Đã ngắt kết nối tài khoản GitHub.");
    setTimeout(() => setFeedbackMsg(""), 4000);
  };

  const repoUrl = form.repository.startsWith("http")
    ? form.repository
    : `https://github.com/${form.repository}`;

  return (
    <Card
      className="rounded-2xl border border-border/80 bg-card shadow-xs overflow-hidden"
    >
      <CardHeader className="p-4 sm:p-5 border-b border-border/60 bg-card">
        <div className="flex items-start justify-between gap-3">
          {/* Logo GitHub & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <GitBranchIcon className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-base font-bold text-foreground tracking-tight">
                GitHub Repository
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">
                Đồng bộ Commits & PRs từ Repository
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

      <CardContent className="p-4 sm:p-5 space-y-4 bg-card">
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
              Tài khoản GitHub bên thứ ba đã được xác thực và liên kết tự động với hệ thống SAGA:
            </p>

            {/* Account Details Box */}
            <div className="p-3.5 rounded-xl bg-muted/40 border border-border/80 space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground font-medium">Tài khoản GitHub:</span>
                <strong className="text-foreground font-mono">{form.username || "lehoanghai-fpt"}</strong>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground font-medium">Repository:</span>
                <a
                  href={repoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                >
                  {form.repository || "Saga-Learning-to-Hero/saga-fe"}
                  <ExternalLinkIcon className="w-3 h-3" />
                </a>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground font-medium">Branch theo dõi:</span>
                <Badge variant="outline" className="font-mono text-[11px] bg-background">
                  {form.defaultBranch || "main"}
                </Badge>
              </div>

              <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/50">
                <span className="flex items-center gap-1">
                  <ClockIcon className="w-3 h-3 text-emerald-500" />
                  Ngày xác thực: <strong className="text-foreground font-mono">27/08/2026 14:30</strong>
                </span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                  <ShieldCheckIcon className="w-3.5 h-3.5" /> Webhook Active
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-1 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setIsFormOpen(true)}
                className="h-8.5 px-3.5 text-xs font-semibold rounded-xl gap-1.5 cursor-pointer bg-background hover:bg-muted text-foreground border border-border/80 shadow-2xs flex items-center transition-colors"
              >
                <Edit3Icon className="w-3.5 h-3.5 text-muted-foreground" />
                Sửa thông tin
              </button>

              <button
                type="button"
                onClick={handleDisconnect}
                disabled={isSubmitting}
                className="h-8.5 px-3.5 text-xs font-semibold rounded-xl gap-1.5 cursor-pointer bg-rose-600 hover:bg-rose-700 text-white shadow-2xs flex items-center transition-colors disabled:opacity-50"
              >
                {isSubmitting ? (
                  <LoaderCircleIcon className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <UnlinkIcon className="w-3.5 h-3.5" />
                )}
                Ngắt kết nối
              </button>
            </div>
          </div>
        ) : !isFormOpen ? (
          /* ── STATE 2: Chưa kết nối (Unlinked State - Clean CTA Card) ─ */
          <div className="space-y-4">
            <p className="text-xs text-muted-foreground leading-relaxed">
              Tích hợp tài khoản GitHub để tự động ghi nhận mã nguồn Commits, Pull Requests và đo lường chỉ số độ phủ SAGA Traceability.
            </p>

            <div className="p-4 rounded-xl bg-muted/40 border border-border/50 space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
                Lợi ích tích hợp:
              </span>
              <ul className="text-xs text-muted-foreground space-y-1.5">
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                  Ghi nhận tự động tần suất đẩy code & dòng mã nguồn.
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                  Tự động đối soát commit với thẻ nhiệm vụ Jira.
                </li>
              </ul>
            </div>

            {/* CTA Button */}
            <Button
              type="button"
              onClick={() => setIsFormOpen(true)}
              className="w-full h-10 text-xs font-bold rounded-xl gap-2 cursor-pointer shadow-xs bg-purple-600 hover:bg-purple-700 text-white"
            >
              <PlusIcon className="w-4 h-4" />
              + Liên kết với GitHub
            </Button>
          </div>
        ) : (
          /* ── STATE 3: Form Điền thông tin kết nối (Interactive Form) ─ */
          <form onSubmit={handleConnectOrUpdate} className="space-y-4 animate-in fade-in-0">
            <div className="space-y-3">
              {/* Username */}
              <div className="space-y-1.5">
                <Label htmlFor="github-user" className="text-xs font-semibold">
                  GitHub Username <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="github-user"
                    type="text"
                    required
                    value={form.username}
                    onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
                    placeholder="lehoanghai-fpt"
                    className="pl-9 h-9 text-xs rounded-xl bg-card font-mono"
                  />
                </div>
              </div>

              {/* Repository */}
              <div className="space-y-1.5">
                <Label htmlFor="github-repo-link" className="text-xs font-semibold">
                  Link hoặc Tên Repository Đồ án <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <FolderGit2Icon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="github-repo-link"
                    type="text"
                    required
                    value={form.repository}
                    onChange={(e) => setForm((f) => ({ ...f, repository: e.target.value }))}
                    placeholder="Saga-Learning-to-Hero/saga-fe"
                    className="pl-9 h-9 text-xs rounded-xl bg-card font-mono"
                  />
                </div>
              </div>

              {/* Default Branch */}
              <div className="space-y-1.5">
                <Label htmlFor="github-default-branch" className="text-xs font-semibold">
                  Branch theo dõi chính
                </Label>
                <Input
                  id="github-default-branch"
                  type="text"
                  value={form.defaultBranch}
                  onChange={(e) => setForm((f) => ({ ...f, defaultBranch: e.target.value }))}
                  placeholder="main"
                  className="h-9 text-xs rounded-xl bg-card font-mono"
                />
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
                className="h-9 text-xs font-bold rounded-xl gap-1.5 cursor-pointer shadow-xs bg-purple-600 hover:bg-purple-700 text-white px-5"
              >
                {isSubmitting ? (
                  <>
                    <LoaderCircleIcon className="w-4 h-4 animate-spin" />
                    Đang kết nối...
                  </>
                ) : (
                  "Xác nhận kết nối GitHub"
                )}
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
