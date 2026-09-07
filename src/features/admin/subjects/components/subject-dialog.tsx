"use client";

import { useState } from "react";
import { XIcon, BookOpenIcon, SaveIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CustomSelect } from "@/components/common/custom-select";
import type { SubjectResponse, CreateSubjectRequest, PatchSubjectRequest, SubjectStatus } from "../types/subject-types";

interface SubjectDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitCreate: (data: CreateSubjectRequest) => Promise<void>;
  onSubmitUpdate: (id: string, data: PatchSubjectRequest) => Promise<void>;
  initialData?: SubjectResponse | null;
  isSubmitting?: boolean;
}

interface SubjectFormProps {
  initialData?: SubjectResponse | null;
  onClose: () => void;
  onSubmitCreate?: (data: CreateSubjectRequest) => Promise<void>;
  onSubmitUpdate?: (id: string, data: PatchSubjectRequest) => Promise<void>;
  isSubmitting?: boolean;
}

function SubjectForm({
  initialData,
  onClose,
  onSubmitCreate,
  onSubmitUpdate,
  isSubmitting = false,
}: SubjectFormProps) {
  const isEdit = Boolean(initialData);

  const [code, setCode] = useState(initialData?.code || "");
  const [nameEnglish, setNameEnglish] = useState(initialData?.nameEnglish || "");
  const [nameVietnamese, setNameVietnamese] = useState(initialData?.nameVietnamese || "");
  const [status, setStatus] = useState<SubjectStatus>(initialData?.status || "ACTIVE");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isEdit && !code.trim()) {
      setError("Vui lòng nhập mã môn học (ví dụ: SWP391, PRN211).");
      return;
    }

    if (!nameEnglish.trim()) {
      setError("Vui lòng nhập tên môn học bằng tiếng Anh.");
      return;
    }

    try {
      if (isEdit && initialData) {
        if (onSubmitUpdate) {
          await onSubmitUpdate(initialData.id, {
            nameEnglish: nameEnglish.trim(),
            nameVietnamese: nameVietnamese.trim() || null,
            status,
          });
        }
      } else {
        if (onSubmitCreate) {
          await onSubmitCreate({
            code: code.trim().toUpperCase(),
            nameEnglish: nameEnglish.trim(),
            nameVietnamese: nameVietnamese.trim() || null,
          });
        }
      }
      onClose();
    } catch (err: unknown) {
      const e = err as { message?: string };
      setError(e.message || "Đã có lỗi xảy ra khi lưu môn học.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-card border border-border/80 rounded-3xl w-full max-w-xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in-0 zoom-in-95 duration-200">
        <div className="p-5 border-b border-border/60 flex items-center justify-between shrink-0 bg-muted/20">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <BookOpenIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">
                {isEdit ? `Cập nhật Môn học ${initialData?.code}` : "Thêm Môn học mới"}
              </h3>
              <p className="text-xs text-muted-foreground">
                {isEdit ? "Điều chỉnh tên gọi và trạng thái hoạt động của môn học." : "Khai báo mã môn và tên gọi để thêm vào danh mục đào tạo."}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <XIcon className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-6 overflow-y-auto flex-1 space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="subject-code" className="text-xs font-semibold">
                Mã môn học (Subject Code) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="subject-code"
                placeholder="Ví dụ: SWP391, PRN211..."
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                disabled={isEdit || isSubmitting}
                className="font-mono text-sm uppercase bg-background"
              />
              <p className="text-[11px] text-muted-foreground">
                Mã định danh duy nhất theo khung chương trình (không thể sửa sau khi tạo).
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="subject-name-en" className="text-xs font-semibold">
                Tên tiếng Anh (English Name) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="subject-name-en"
                placeholder="Ví dụ: Software Development Project"
                value={nameEnglish}
                onChange={(e) => setNameEnglish(e.target.value)}
                disabled={isSubmitting}
                className="text-sm bg-background"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="subject-name-vi" className="text-xs font-semibold">
                Tên tiếng Việt (Vietnamese Name)
              </Label>
              <Input
                id="subject-name-vi"
                placeholder="Ví dụ: Dự án phát triển phần mềm"
                value={nameVietnamese}
                onChange={(e) => setNameVietnamese(e.target.value)}
                disabled={isSubmitting}
                className="text-sm bg-background"
              />
            </div>

            {isEdit && (
              <div className="space-y-1.5">
                <Label htmlFor="subject-status" className="text-xs font-semibold">
                  Trạng thái hoạt động
                </Label>
                <CustomSelect
                  id="subject-status"
                  value={status}
                  onChange={(val) => setStatus(val as SubjectStatus)}
                  options={[
                    {
                      value: "ACTIVE",
                      label: "Đang hoạt động (ACTIVE)",
                      subLabel: "Cho phép mở lớp và gán đề cương mới",
                    },
                    {
                      value: "INACTIVE",
                      label: "Tạm ngừng (INACTIVE)",
                      subLabel: "Không cho phép mở lớp học phần mới",
                    },
                  ]}
                />
              </div>
            )}
          </div>

          <div className="p-4 border-t border-border/60 flex items-center justify-end gap-2.5 shrink-0 bg-muted/20">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="text-xs h-9 cursor-pointer"
            >
              Hủy bỏ
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="text-xs h-9 gap-1.5 cursor-pointer font-semibold"
            >
              <SaveIcon className="w-3.5 h-3.5" />
              {isSubmitting ? "Đang xử lý..." : isEdit ? "Lưu thay đổi" : "Thêm môn học"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function SubjectDialog(props: SubjectDialogProps) {
  if (!props.isOpen) return null;
  return (
    <SubjectForm
      key={props.initialData ? props.initialData.id : "new-subject"}
      {...props}
    />
  );
}
