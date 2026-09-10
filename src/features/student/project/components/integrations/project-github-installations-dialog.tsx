"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/sonner";
import {
  GitBranchIcon,
  CheckCircle2Icon,
  CircleIcon,
  PlusIcon,
  RefreshCwIcon,
  Loader2Icon,
  Building2Icon,
  UserIcon,
} from "lucide-react";
import Image from "next/image";
import {
  useProjectGitHubReconnectCandidates,
  useConnectProjectGitHub,
} from "../../hooks/useProjectIntegrations";
import type { GitHubInstallationCandidateItem } from "../../types/student-project";

interface ProjectGitHubInstallationsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
}

export function ProjectGitHubInstallationsDialog({
  open,
  onOpenChange,
  projectId,
}: ProjectGitHubInstallationsDialogProps) {
  const {
    data: candidates = [],
    isLoading,
    isRefetching,
    refetch,
  } = useProjectGitHubReconnectCandidates(projectId, { enabled: open });

  const connectMutation = useConnectProjectGitHub();
  const [selectedIdState, setSelectedIdState] = useState<string | number | null>(null);

  const fallbackId = candidates.length > 0 ? (candidates[0].installationId ?? candidates[0].id ?? null) : null;
  const selectedId = selectedIdState ?? fallbackId;

  const handleConnectSelected = async () => {
    if (selectedId === null) {
      toast.warning("Vui lòng chọn một tài khoản GitHub để kết nối.");
      return;
    }
    try {
      toast.loading("Đang khởi tạo liên kết GitHub với tài khoản đã chọn...", { id: "github-select-connect" });
      const returnPath = typeof window !== "undefined" ? window.location.pathname : "/student/project-info";
      const res = await connectMutation.mutateAsync({ projectId, installationId: selectedId, returnPath });

      if (res?.authorizationUrl && typeof window !== "undefined") {
        window.location.href = res.authorizationUrl;
      } else {
        toast.success("Kết nối GitHub thành công!", { id: "github-select-connect" });
        onOpenChange(false);
      }
    } catch {
      toast.error("Lỗi khi kết nối tài khoản GitHub đã chọn. Vui lòng thử lại sau.", { id: "github-select-connect" });
    }
  };

  const handleInstallNew = async () => {
    try {
      toast.loading("Đang chuyển hướng sang GitHub App để cài đặt mới...", { id: "github-install-new" });
      const returnPath = typeof window !== "undefined" ? window.location.pathname : "/student/project-info";
      const res = await connectMutation.mutateAsync({ projectId, mode: "install_new", returnPath });

      if (res?.authorizationUrl && typeof window !== "undefined") {
        window.location.href = res.authorizationUrl;
      } else {
        toast.success("Đã hoàn tất cài đặt!", { id: "github-install-new" });
        onOpenChange(false);
      }
    } catch {
      toast.error("Lỗi khi mở trang cài đặt GitHub mới. Vui lòng thử lại sau.", { id: "github-install-new" });
    }
  };

  const isPending = connectMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={(val) => !isPending && onOpenChange(val)}>
      <DialogContent className="max-w-xl bg-card border border-border/80 rounded-2xl shadow-2xl p-0 overflow-hidden flex flex-col max-h-[85vh]">
        <DialogHeader className="p-5 border-b border-border/60 bg-muted/20 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <GitBranchIcon className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-foreground">
                  Chọn cài đặt GitHub App
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  Chọn tài khoản đã cài đặt trước đó hoặc tiến hành cài đặt trên tổ chức mới.
                </DialogDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              disabled={isLoading || isRefetching}
              onClick={() => void refetch()}
              className="h-8 w-8 text-muted-foreground hover:text-foreground cursor-pointer"
              title="Tải lại danh sách"
            >
              <RefreshCwIcon className={`w-3.5 h-3.5 ${isRefetching ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </DialogHeader>

        <div className="p-5 overflow-y-auto flex-1 space-y-3">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-10 text-muted-foreground gap-2">
              <Loader2Icon className="w-6 h-6 animate-spin text-primary" />
              <span className="text-xs">Đang nạp danh sách cài đặt GitHub khả dụng...</span>
            </div>
          ) : candidates.length === 0 ? (
            <div className="text-center py-8 px-4 border border-dashed border-border rounded-xl bg-muted/10 space-y-3">
              <GitBranchIcon className="w-8 h-8 text-muted-foreground/50 mx-auto" />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-foreground">Chưa tìm thấy cài đặt GitHub nào trước đây</p>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  Bạn có thể tiến hành cài đặt ứng dụng GitHub SAGA App trên tài khoản cá nhân hoặc tổ chức mới.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground mb-1">
                Các tài khoản / tổ chức có sẵn ({candidates.length}):
              </p>
              {candidates.map((candidate: GitHubInstallationCandidateItem, idx) => {
                const candidateId = candidate.installationId ?? candidate.id ?? idx;
                const isSelected = selectedId === candidateId;
                const loginName = candidate.accountLogin || candidate.login || candidate.accountName || "GitHub Account";
                const isOrg = (candidate.accountType || candidate.targetType || "User").toLowerCase() === "organization";

                return (
                  <div
                    key={String(candidateId)}
                    onClick={() => setSelectedIdState(candidateId)}
                    className={`flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? "border-primary bg-primary/5 shadow-xs"
                        : "border-border/70 hover:border-border hover:bg-muted/30"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="shrink-0 text-primary">
                        {isSelected ? (
                          <CheckCircle2Icon className="w-4 h-4 fill-primary text-primary-foreground" />
                        ) : (
                          <CircleIcon className="w-4 h-4 text-muted-foreground/40" />
                        )}
                      </div>

                      <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-border/60 shrink-0 bg-muted flex items-center justify-center">
                        {candidate.avatarUrl ? (
                          <Image src={candidate.avatarUrl} alt={loginName} width={32} height={32} className="object-cover" />
                        ) : isOrg ? (
                          <Building2Icon className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <UserIcon className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-foreground truncate font-mono">{loginName}</span>
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 font-normal">
                            {isOrg ? "Tổ chức" : "Cá nhân"}
                          </Badge>
                        </div>
                        {candidate.installationId && (
                          <span className="text-[11px] text-muted-foreground block font-mono">ID: {String(candidate.installationId)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-border/60 bg-muted/20 shrink-0 flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleInstallNew}
            disabled={isPending}
            className="w-full sm:w-auto text-xs font-semibold gap-1.5 rounded-xl cursor-pointer order-2 sm:order-1"
          >
            <PlusIcon className="w-3.5 h-3.5" />
            Cài đặt trên tài khoản / tổ chức mới
          </Button>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end order-1 sm:order-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
              className="text-xs font-medium rounded-xl cursor-pointer"
            >
              Hủy
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleConnectSelected}
              disabled={isPending || selectedId === null || candidates.length === 0}
              className="text-xs font-semibold rounded-xl gap-1.5 cursor-pointer shadow-xs"
            >
              {isPending && <Loader2Icon className="w-3.5 h-3.5 animate-spin" />}
              Kết nối bằng tài khoản này
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
