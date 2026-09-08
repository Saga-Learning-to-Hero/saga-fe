"use client";

import { useState } from "react";
import { UserPlusIcon, MailIcon, HashIcon, UserIcon, SparklesIcon, Loader2Icon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAddStudentToRoster } from "../hooks/use-academic";

interface AddStudentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: string;
  courseCode?: string;
}

function removeVietnameseTones(str: string) {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
}

function generateDefaults(fullName: string, studentCode: string) {
  const cleanCode = studentCode.trim().toUpperCase();
  const cleanName = removeVietnameseTones(fullName.trim());
  if (!cleanName || !cleanCode) {
    return { email: "", memberCode: "" };
  }

  const parts = cleanName.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { email: "", memberCode: "" };

  const lastName = parts[parts.length - 1];
  const otherInitials = parts.slice(0, parts.length - 1).map((p) => p[0].toUpperCase()).join("");
  const capitalizedLastName = lastName.charAt(0).toUpperCase() + lastName.slice(1).toLowerCase();

  const memberCode = `${capitalizedLastName}${otherInitials}${cleanCode}`;
  const email = `${lastName.toLowerCase()}${otherInitials.toLowerCase()}${cleanCode.toLowerCase()}@fpt.edu.vn`;

  return { email, memberCode };
}

export function AddStudentDialog({
  isOpen,
  onClose,
  courseId,
  courseCode,
}: AddStudentDialogProps) {
  const [formData, setFormData] = useState({
    fullName: "",
    studentCode: "",
    email: "",
    memberCode: "",
  });

  const [hasCustomEmail, setHasCustomEmail] = useState(false);
  const [hasCustomMemberCode, setHasCustomMemberCode] = useState(false);

  const addStudentMutation = useAddStudentToRoster();

  const handleClose = () => {
    setFormData({
      fullName: "",
      studentCode: "",
      email: "",
      memberCode: "",
    });
    setHasCustomEmail(false);
    setHasCustomMemberCode(false);
    onClose();
  };

  const handleNameOrCodeChange = (field: "fullName" | "studentCode", value: string) => {
    const updated = {
      ...formData,
      [field]: field === "studentCode" ? value.toUpperCase() : value,
    };

    const { email: autoEmail, memberCode: autoMemberCode } = generateDefaults(
      updated.fullName,
      updated.studentCode
    );

    if (!hasCustomEmail && autoEmail) {
      updated.email = autoEmail;
    }
    if (!hasCustomMemberCode && autoMemberCode) {
      updated.memberCode = autoMemberCode;
    }

    setFormData(updated);
  };

  const handleAutoSuggest = () => {
    const { email: autoEmail, memberCode: autoMemberCode } = generateDefaults(
      formData.fullName,
      formData.studentCode
    );
    if (autoEmail && autoMemberCode) {
      setFormData((prev) => ({
        ...prev,
        email: autoEmail,
        memberCode: autoMemberCode,
      }));
      setHasCustomEmail(false);
      setHasCustomMemberCode(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formData.fullName.trim() ||
      !formData.studentCode.trim() ||
      !formData.email.trim() ||
      !formData.memberCode.trim()
    ) {
      return;
    }

    await addStudentMutation.mutateAsync({
      courseId,
      data: {
        fullName: formData.fullName.trim(),
        studentCode: formData.studentCode.trim().toUpperCase(),
        email: formData.email.trim().toLowerCase(),
        memberCode: formData.memberCode.trim(),
      },
    });

    handleClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-lg p-6 rounded-2xl shadow-xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader className="flex flex-row items-center gap-3 space-y-0 text-left pb-2 border-b border-border/60">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <UserPlusIcon className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-foreground">
                Thêm sinh viên vào lớp học phần
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                {courseCode ? `Ghi danh sinh viên vào lớp ${courseCode}.` : "Ghi danh hoặc gửi thư mời tham gia lớp học phần cho một sinh viên."}
              </DialogDescription>
            </div>
          </DialogHeader>

          <div className="space-y-3.5 pt-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                  <HashIcon className="w-3 h-3 text-primary" />
                  Mã số sinh viên (MSSV) *
                </label>
                <Input
                  placeholder="VD: SE183904"
                  value={formData.studentCode}
                  onChange={(e) => handleNameOrCodeChange("studentCode", e.target.value)}
                  required
                  className="h-9 text-xs font-mono uppercase bg-muted/30 border-border/80 focus:border-primary rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                  <UserIcon className="w-3 h-3 text-primary" />
                  Họ và tên sinh viên *
                </label>
                <Input
                  placeholder="VD: Lê Hoàng Hải"
                  value={formData.fullName}
                  onChange={(e) => handleNameOrCodeChange("fullName", e.target.value)}
                  required
                  className="h-9 text-xs bg-muted/30 border-border/80 focus:border-primary rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                <MailIcon className="w-3 h-3 text-primary" />
                Email trường cấp (FPT Edu) *
              </label>
              <Input
                type="email"
                placeholder="VD: hailhse183904@fpt.edu.vn"
                value={formData.email}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value });
                  setHasCustomEmail(true);
                }}
                required
                className="h-9 text-xs font-mono bg-muted/30 border-border/80 focus:border-primary rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                  <SparklesIcon className="w-3 h-3 text-primary" />
                  Mã thành viên (Member Code) *
                </label>
                {formData.fullName && formData.studentCode && (
                  <button
                    type="button"
                    onClick={handleAutoSuggest}
                    className="text-[11px] text-primary hover:underline cursor-pointer font-medium"
                  >
                    Gợi ý lại theo tên
                  </button>
                )}
              </div>
              <Input
                placeholder="VD: HaiLHSE183904"
                value={formData.memberCode}
                onChange={(e) => {
                  setFormData({ ...formData, memberCode: e.target.value });
                  setHasCustomMemberCode(true);
                }}
                required
                className="h-9 text-xs font-mono bg-muted/30 border-border/80 focus:border-primary rounded-xl"
              />
              <p className="text-[11px] text-muted-foreground">
                Mã định danh thành viên dùng đối soát với Git và Jira.
              </p>
            </div>
          </div>

          <DialogFooter className="pt-3 border-t border-border/60">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClose}
              disabled={addStudentMutation.isPending}
              className="text-xs"
            >
              Hủy bỏ
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={
                addStudentMutation.isPending ||
                !formData.studentCode.trim() ||
                !formData.fullName.trim() ||
                !formData.email.trim() ||
                !formData.memberCode.trim()
              }
              className="text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 gap-1.5"
            >
              {addStudentMutation.isPending && <Loader2Icon className="w-3.5 h-3.5 animate-spin" />}
              {addStudentMutation.isPending ? "Đang thêm..." : "Thêm sinh viên"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
