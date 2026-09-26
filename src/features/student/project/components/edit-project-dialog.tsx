"use client";
import { showSuccessToast, showErrorToast } from "@/lib/api-error";

import { useState } from "react";
import { XIcon, PencilIcon, Loader2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useUpdateProject } from "../hooks/use-update-project";

interface EditProjectDialogProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  initialName: string;
  initialDescription?: string;
  onSuccess?: (updated: { name: string; description: string }) => void;
}

function EditProjectDialogContent({
  onClose,
  projectId,
  initialName,
  initialDescription = "",
  onSuccess,
}: Omit<EditProjectDialogProps, "isOpen">) {
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const updateMutation = useUpdateProject(projectId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg("Vui lòng nhập tên dự án.");
      return;
    }
    if (name.trim().length < 2) {
      setErrorMsg("Tên dự án phải chứa ít nhất 2 ký tự.");
      return;
    }

    try {
      const res = await updateMutation.mutateAsync({
        name: name.trim(),
        description: description.trim(),
      });
      showSuccessToast("Cập nhật thông tin dự án thành công!");
      if (onSuccess) {
        onSuccess({ name: res.name, description: res.description });
      }
      onClose();
    } catch (err) {
      showErrorToast(err instanceof Error ? err.message : "Không thể cập nhật dự án.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in-0 duration-200">
      <div className="bg-card border border-border/80 rounded-3xl w-full max-w-lg max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-5 border-b border-border/60 flex items-center justify-between shrink-0 bg-muted/20">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center">
              <PencilIcon className="size-4.5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-foreground">
                Chỉnh sửa thông tin dự án
              </h3>
              <p className="text-xs text-muted-foreground">
                Dành riêng cho Trưởng nhóm dự án (Active Team Leader)
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
            aria-label="Đóng"
          >
            <XIcon className="size-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-6 overflow-y-auto flex-1 space-y-4">
            {errorMsg && (
              <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold">
                {errorMsg}
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="edit-project-name" className="text-xs font-bold text-foreground">
                Tên đề tài / Dự án nhóm <span className="text-destructive">*</span>
              </Label>
              <Input
                id="edit-project-name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errorMsg) setErrorMsg(null);
                }}
                maxLength={120}
                placeholder="Nhập tên dự án dự án..."
                className="h-9 text-xs rounded-xl"
                disabled={updateMutation.isPending}
                required
              />
              <span className="text-[10px] text-muted-foreground font-mono">
                {name.length}/120 ký tự
              </span>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-project-desc" className="text-xs font-bold text-foreground">
                Mô tả mục tiêu dự án
              </Label>
              <Textarea
                id="edit-project-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={600}
                rows={4}
                placeholder="Mô tả tóm tắt phạm vi, mục tiêu và công nghệ áp dụng của đề tài..."
                className="text-xs rounded-xl resize-none"
                disabled={updateMutation.isPending}
              />
              <span className="text-[10px] text-muted-foreground font-mono">
                {description.length}/600 ký tự
              </span>
            </div>
          </div>

          <div className="p-4 border-t border-border/60 flex items-center justify-end gap-2.5 shrink-0 bg-muted/20">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={updateMutation.isPending}
              className="h-8 text-xs rounded-xl cursor-pointer"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={updateMutation.isPending}
              className="h-8 text-xs rounded-xl cursor-pointer gap-1.5"
            >
              {updateMutation.isPending ? (
                <>
                  <Loader2Icon className="size-3.5 animate-spin" />
                  <span>Đang lưu...</span>
                </>
              ) : (
                <span>Lưu thay đổi</span>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function EditProjectDialog(props: EditProjectDialogProps) {
  if (!props.isOpen) return null;
  return <EditProjectDialogContent {...props} />;
}
