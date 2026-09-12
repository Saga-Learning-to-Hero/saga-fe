"use client";

import { useState } from "react";
import { UserXIcon, MailIcon, HashIcon, AlertTriangleIcon, Loader2Icon, ShieldAlertIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { CourseRosterEntry } from "../types/course-roster-types";
import { useRemoveEnrollment, useCancelInvitation } from "../hooks/use-academic";

interface RemoveStudentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: string;
  courseCode?: string;
  student: CourseRosterEntry | null;
  onSuccess?: () => void;
}

export function RemoveStudentDialog({
  isOpen,
  onClose,
  courseId,
  courseCode,
  student,
  onSuccess,
}: RemoveStudentDialogProps) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const removeEnrollmentMutation = useRemoveEnrollment();
  const cancelInvitationMutation = useCancelInvitation();

  const isEnrollment =
    student?.kind === "ENROLLMENT" ||
    student?.status === "ENROLLED" ||
    student?.enrollmentStatus === "ACTIVE";

  const isPending =
    removeEnrollmentMutation.isPending || cancelInvitationMutation.isPending;

  const handleClose = () => {
    if (isPending) return;
    setErrorMessage(null);
    onClose();
  };

  const handleConfirm = async () => {
    if (!student || !courseId) return;
    setErrorMessage(null);

    try {
      if (isEnrollment) {
        const enrollmentId = student.enrollmentId || student.id;
        if (!enrollmentId) {
          setErrorMessage("Không tìm thấy mã ghi danh (Enrollment ID) của sinh viên.");
          return;
        }
        await removeEnrollmentMutation.mutateAsync({
          courseId,
          enrollmentId,
        });
      } else {
        const invitationId = student.invitationId || student.id;
        if (!invitationId) {
          setErrorMessage("Không tìm thấy mã thư mời (Invitation ID) cần hủy.");
          return;
        }
        await cancelInvitationMutation.mutateAsync({
          courseId,
          invitationId,
        });
      }

      onSuccess?.();
      handleClose();
    } catch (error: unknown) {
      const err = error as {
        response?: { data?: { code?: string; message?: string } };
        message?: string;
      };
      const code = err.response?.data?.code;

      if (code === "TEAM_LEADER_REMOVAL_REQUIRES_REASSIGNMENT") {
        setErrorMessage(
          "Sinh viên đang là Trưởng nhóm (Leader) của một nhóm trong lớp. Giảng viên cần chỉ định Trưởng nhóm mới trước khi bạn có thể xóa sinh viên khỏi lớp."
        );
      } else if (code === "ROSTER_STUDENT_ALREADY_REMOVED") {
        setErrorMessage("Sinh viên hoặc thư mời này đã được xóa hoặc hủy trước đó.");
      } else if (code === "ROSTER_STUDENT_NOT_FOUND") {
        setErrorMessage("Không tìm thấy thông tin sinh viên trong lớp học phần này.");
      } else {
        setErrorMessage(
          err.response?.data?.message ||
          err.message ||
          "Đã xảy ra lỗi khi thực hiện thao tác xóa. Vui lòng thử lại."
        );
      }
    }
  };

  if (!student) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-lg p-6 rounded-2xl shadow-xl">
        <div className="space-y-4">
          <DialogHeader className="flex flex-row items-center gap-3 space-y-0 text-left pb-2 border-b border-border/60">
            <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center text-destructive shrink-0">
              <UserXIcon className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-foreground">
                {isEnrollment ? "Rút tên sinh viên khỏi lớp" : "Hủy thư mời tham gia lớp"}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                {courseCode
                  ? `Áp dụng cho lớp học phần ${courseCode}.`
                  : "Quản trị danh sách thành viên lớp học phần."}
              </DialogDescription>
            </div>
          </DialogHeader>

          <div className="rounded-xl border border-border/70 bg-muted/30 p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-foreground">
                {student.fullName}
              </span>
              <Badge
                variant="outline"
                className="font-mono text-[11px] font-bold text-primary border-primary/30 px-1.5 py-0"
              >
                {student.studentCode}
              </Badge>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <MailIcon className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{student.email}</span>
            </div>
            <div className="flex items-center gap-2 pt-1 border-t border-border/50 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <HashIcon className="w-3 h-3" />
                Loại: <strong className="text-foreground">{isEnrollment ? "Sinh viên đã ghi danh" : "Thư mời đang chờ"}</strong>
              </span>
            </div>
          </div>

          {isEnrollment ? (
            <div className="rounded-xl border border-border/80 bg-background/50 p-3 space-y-2 text-xs text-muted-foreground">
              <div className="flex items-start gap-2">
                <AlertTriangleIcon className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold text-foreground">
                    Cơ chế rút tên an toàn (Soft-withdrawal):
                  </p>
                  <p className="leading-relaxed">
                    Sinh viên sẽ chuyển sang trạng thái <strong>Đã rút (WITHDRAWN)</strong> và bị thu hồi quyền truy cập nhóm đồ án.
                  </p>
                  <p className="leading-relaxed text-foreground/80">
                    Toàn bộ lịch sử commit mã nguồn, nhiệm vụ Jira, phiên làm việc và bằng chứng đóng góp đã có vẫn được bảo lưu trọn vẹn trong cơ sở dữ liệu.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-border/80 bg-background/50 p-3 space-y-1.5 text-xs text-muted-foreground">
              <div className="flex items-start gap-2">
                <AlertTriangleIcon className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-foreground">
                    Hủy thư mời tham gia lớp:
                  </p>
                  <p className="leading-relaxed">
                    Thư mời gửi tới email này sẽ chuyển sang trạng thái <strong>Đã hủy (CANCELLED)</strong>. Sinh viên sẽ không thể đăng ký hoặc kích hoạt lớp học phần qua lời mời này nữa.
                  </p>
                </div>
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive flex items-start gap-2">
              <ShieldAlertIcon className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold">Không thể hoàn tất thao tác:</p>
                <p className="leading-relaxed">{errorMessage}</p>
              </div>
            </div>
          )}

          <DialogFooter className="pt-2 border-t border-border/60 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClose}
              disabled={isPending}
            >
              Đóng
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleConfirm}
              disabled={isPending}
            >
              {isPending && <Loader2Icon className="w-3.5 h-3.5 animate-spin mr-1.5" />}
              {isEnrollment ? "Xác nhận rút tên" : "Xác nhận hủy thư mời"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
