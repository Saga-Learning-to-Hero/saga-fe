"use client";

import { useState } from "react";
import {
  UserXIcon,
  MailIcon,
  HashIcon,
  AlertTriangleIcon,
  ShieldAlertIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ConfirmActionDialog } from "@/components/common/confirm-action-dialog";
import { ReasonConfirmDialog } from "@/components/common/reason-confirm-dialog";
import { getRemovalApiErrorMessage } from "@/lib/removal-reason";
import { isActiveEnrollment, isPendingInvitation } from "../lib/roster-status";
import type { CourseRosterEntry } from "../types/course-roster-types";
import {
  useRemoveEnrollment,
  useCancelInvitation,
} from "../hooks/use-academic";

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

  const isEnrollment = Boolean(
    student &&
    !isPendingInvitation(student) &&
    (isActiveEnrollment(student) ||
      student.kind === "ENROLLMENT" ||
      Boolean(student.enrollmentId)),
  );

  const isPending =
    removeEnrollmentMutation.isPending || cancelInvitationMutation.isPending;

  const handleClose = () => {
    if (isPending) return;
    setErrorMessage(null);
    onClose();
  };

  const handleRemoveEnrollment = async (reason: string) => {
    if (!student || !courseId) return;
    setErrorMessage(null);

    const enrollmentId = student.enrollmentId || student.id;
    if (!enrollmentId) {
      setErrorMessage(
        "Không tìm thấy mã ghi danh (Enrollment ID) của sinh viên.",
      );
      return;
    }

    try {
      await removeEnrollmentMutation.mutateAsync({
        courseId,
        enrollmentId,
        reason,
      });
      onSuccess?.();
      handleClose();
    } catch (error: unknown) {
      setErrorMessage(
        getRemovalApiErrorMessage(
          error,
          "Đã xảy ra lỗi khi thực hiện thao tác xóa. Vui lòng thử lại.",
        ),
      );
    }
  };

  const handleCancelInvitation = async () => {
    if (!student || !courseId) return;
    setErrorMessage(null);

    const invitationId = student.invitationId || student.id;
    if (!invitationId) {
      setErrorMessage("Không tìm thấy mã thư mời (Invitation ID) cần hủy.");
      return;
    }

    try {
      await cancelInvitationMutation.mutateAsync({
        courseId,
        invitationId,
      });
      onSuccess?.();
      handleClose();
    } catch (error: unknown) {
      const err = error as {
        response?: { data?: { code?: string; message?: string } };
        message?: string;
      };
      const code = err.response?.data?.code;

      if (code === "ROSTER_STUDENT_ALREADY_REMOVED") {
        setErrorMessage(
          "Sinh viên hoặc thư mời này đã được xóa hoặc hủy trước đó.",
        );
      } else if (code === "ROSTER_STUDENT_NOT_FOUND") {
        setErrorMessage(
          "Không tìm thấy thông tin sinh viên trong lớp học phần này.",
        );
      } else {
        setErrorMessage(
          err.response?.data?.message ||
            err.message ||
            "Đã xảy ra lỗi khi thực hiện thao tác xóa. Vui lòng thử lại.",
        );
      }
    }
  };

  if (!student) return null;

  const studentSummary = (
    <div className="space-y-3 rounded-xl border border-border/70 bg-muted/30 p-3.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-foreground">
          {student.fullName}
        </span>
        <Badge
          variant="outline"
          className="px-1.5 py-0 font-mono text-xs font-bold text-primary border-primary/30"
        >
          {student.studentCode}
        </Badge>
      </div>
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <MailIcon className="h-3.5 w-3.5 shrink-0" />
        <span className="truncate">{student.email}</span>
      </div>
      <div className="flex items-center gap-2 border-t border-border/50 pt-1 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <HashIcon className="h-3 w-3" />
          Loại:{" "}
          <strong className="text-foreground">
            {isEnrollment ? "Sinh viên đã ghi danh" : "Thư mời đang chờ"}
          </strong>
        </span>
      </div>
    </div>
  );

  if (!isEnrollment) {
    return (
      <ConfirmActionDialog
        isOpen={isOpen}
        onClose={handleClose}
        onConfirm={handleCancelInvitation}
        isLoading={isPending}
        title="Hủy thư mời tham gia lớp"
        description={
          courseCode
            ? `Áp dụng cho lớp học phần ${courseCode}.`
            : "Quản trị danh sách thành viên lớp học phần."
        }
        confirmText="Xác nhận hủy thư mời"
        loadingText="Đang xử lý..."
        icon={<UserXIcon className="h-5 w-5" />}
        iconClassName="bg-danger-muted text-danger"
      >
        <div className="mt-4">{studentSummary}</div>
        <div className="mt-4 space-y-1.5 rounded-xl border border-border/80 bg-background/50 p-3 text-xs text-muted-foreground">
          <div className="flex items-start gap-2">
            <AlertTriangleIcon className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
            <div>
              <p className="font-semibold text-foreground">
                Hủy thư mời tham gia lớp:
              </p>
              <p className="leading-relaxed">
                Thư mời gửi tới email này sẽ chuyển sang trạng thái{" "}
                <strong>Đã hủy (CANCELLED)</strong>. Sinh viên sẽ không thể đăng
                ký hoặc kích hoạt lớp học phần qua lời mời này nữa.
              </p>
            </div>
          </div>
        </div>
        {errorMessage ? (
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
            <ShieldAlertIcon className="mt-0.5 h-4 w-4 shrink-0" />
            <div className="space-y-1">
              <p className="font-semibold">Không thể hoàn tất thao tác:</p>
              <p className="leading-relaxed">{errorMessage}</p>
            </div>
          </div>
        ) : null}
      </ConfirmActionDialog>
    );
  }

  return (
    <ReasonConfirmDialog
      isOpen={isOpen}
      onClose={handleClose}
      onConfirm={handleRemoveEnrollment}
      isLoading={isPending}
      title="Rút tên sinh viên khỏi lớp"
      description={
        courseCode
          ? `Áp dụng cho lớp học phần ${courseCode}.`
          : "Quản trị danh sách thành viên lớp học phần."
      }
      confirmText="Xác nhận rút tên"
      loadingText="Đang xử lý..."
      errorMessage={errorMessage}
      reasonDescription="Bắt buộc. Tối đa 500 ký tự. Hệ thống sẽ gửi thông báo cho sinh viên."
    >
      {studentSummary}
      <div className="space-y-2 rounded-xl border border-border/80 bg-background/50 p-3 text-xs text-muted-foreground">
        <div className="flex items-start gap-2">
          <AlertTriangleIcon className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
          <div className="space-y-1">
            <p className="font-semibold text-foreground">
              Cơ chế rút khỏi lớp học:
            </p>
            <p className="leading-relaxed">
              Sinh viên sẽ chuyển sang trạng thái{" "}
              <strong>Đã rút (WITHDRAWN)</strong> và bị thu hồi quyền truy cập
              nhóm dự án.
            </p>
            <p className="leading-relaxed text-foreground/80">
              Toàn bộ lịch sử commit mã nguồn, nhiệm vụ Jira, phiên làm việc và
              bằng chứng đóng góp đã có vẫn được bảo lưu trọn vẹn trong cơ sở dữ
              liệu.
            </p>
          </div>
        </div>
      </div>
    </ReasonConfirmDialog>
  );
}
