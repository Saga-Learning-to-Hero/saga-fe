"use client";

import { useState } from "react";
import { AlertTriangleIcon, CheckCircle2Icon, Loader2Icon, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useFailoverReconcile } from "../../hooks/use-jira-sources";
import type { FailoverRunItem } from "../../types/jira-sources";

interface JiraReconcileItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  sourceIntegrationId: string;
  runId: string;
  item: FailoverRunItem | null;
  targetProjectKey?: string;
}

export function JiraReconcileItemDialog({
  open,
  onOpenChange,
  projectId,
  sourceIntegrationId,
  runId,
  item,
  targetProjectKey,
}: JiraReconcileItemDialogProps) {
  const [issueKeyOrId, setIssueKeyOrId] = useState("");
  const reconcileMutation = useFailoverReconcile(
    projectId,
    sourceIntegrationId,
    runId
  );

  if (!open || !item) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!issueKeyOrId.trim()) return;

    try {
      await reconcileMutation.mutateAsync({
        itemId: item.id,
        body: { remoteIssueIdOrKey: issueKeyOrId.trim() },
      });
      setIssueKeyOrId("");
      onOpenChange(false);
    } catch {
      // Error handled by mutation toast
    }
  };

  const handleClose = () => {
    setIssueKeyOrId("");
    onOpenChange(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-card border border-border/80 rounded-3xl w-full max-w-lg max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
        <div className="p-5 border-b border-border/60 flex items-center justify-between shrink-0 bg-muted/20">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-warning/15 text-warning flex items-center justify-center shrink-0">
              <AlertTriangleIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">
                Đối soát thủ công công việc
              </h3>
              <p className="text-[11px] text-muted-foreground">
                Xác thực Issue Jira đã tạo và liên kết thủ công
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-xl p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
          >
            <XIcon className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-6 overflow-y-auto flex-1 space-y-4">
            <div className="rounded-2xl border border-warning/30 bg-warning/5 p-3.5 space-y-2 text-xs">
              <p className="font-semibold text-foreground">
                Công việc gốc:{" "}
                <span className="font-mono text-primary font-bold">
                  {item.sourceExternalKey}
                </span>{" "}
                — {item.sourceTitle}
              </p>
              <p className="text-muted-foreground text-[11px] leading-relaxed">
                Hệ thống SAGA chưa nhận được phản hồi xác thực từ Jira đích sau khi gửi lệnh tạo. Issue có thể đã được tạo thành công trên Jira.
              </p>
            </div>

            <div className="rounded-2xl border border-border/70 bg-muted/20 p-3.5 space-y-1.5 text-xs text-muted-foreground">
              <p className="font-bold text-foreground text-[11px]">Hướng dẫn đối soát:</p>
              <ol className="list-decimal pl-4 space-y-1 text-[11px]">
                <li>Mở Jira của dự án đích và kiểm tra danh sách Backlog / Sprint.</li>
                <li>Tìm kiếm task có tiêu đề tương tự hoặc mới tạo gần nhất.</li>
                <li>
                  Nếu tìm thấy, hãy sao chép mã Issue Key (ví dụ:{" "}
                  <span className="font-mono text-foreground font-semibold">
                    {targetProjectKey ? `${targetProjectKey}-7` : "NEW-7"}
                  </span>
                  ) và dán vào ô bên dưới.
                </li>
              </ol>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="jira-reconcile-key" className="text-xs font-semibold">
                Mã Issue Key hoặc Issue ID trên Jira đích
              </Label>
              <Input
                id="jira-reconcile-key"
                value={issueKeyOrId}
                onChange={(e) => setIssueKeyOrId(e.target.value)}
                placeholder={targetProjectKey ? `${targetProjectKey}-15` : "NEW-7"}
                className="font-mono text-sm h-10 rounded-xl uppercase"
                autoFocus
                required
              />
              <p className="text-[10px] text-muted-foreground">
                Backend sẽ kiểm tra Issue có tồn tại, thuộc đúng dự án đích và chưa bị liên kết trước khi xác nhận.
              </p>
            </div>
          </div>

          <div className="p-4 border-t border-border/60 flex items-center justify-end gap-2.5 shrink-0 bg-muted/20">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClose}
              disabled={reconcileMutation.isPending}
              className="h-8.5 rounded-xl text-xs"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={!issueKeyOrId.trim() || reconcileMutation.isPending}
              className="h-8.5 rounded-xl text-xs font-semibold gap-1.5 bg-primary text-primary-foreground"
            >
              {reconcileMutation.isPending ? (
                <>
                  <Loader2Icon className="w-3.5 h-3.5 animate-spin" />
                  <span>Đang xác thực...</span>
                </>
              ) : (
                <>
                  <CheckCircle2Icon className="w-3.5 h-3.5" />
                  <span>Xác thực & Liên kết</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
