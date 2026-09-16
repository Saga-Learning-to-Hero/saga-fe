"use client";

import { useState, useRef, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  BellIcon,
  SendIcon,
  RotateCcwIcon,
  AlertCircleIcon,
  CheckCircle2Icon,
  LoaderCircleIcon,
  ShieldAlertIcon,
  UsersIcon,
  GraduationCapIcon,
  UserIcon,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "@/components/ui/sonner";
import { CustomSelect, type CustomSelectOption } from "@/components/common/custom-select";
import { NotificationService } from "@/features/notification/api/notification-service";
import { LecturerCourseService } from "@/features/lecturer/courses/api/lecturer-course-service";
import { isValidInternalActionUrl } from "@/features/notification/lib/notification-utils";
import { cn } from "@/lib/utils";

type LecturerScope = "ALL_COURSES" | "COURSE" | "TEAM" | "STUDENT";

const SCOPE_OPTIONS: CustomSelectOption[] = [
  {
    value: "ALL_COURSES",
    label: "Tất cả các lớp phụ trách",
    subLabel: "Gửi tới mọi sinh viên thuộc tất cả lớp của bạn",
    icon: <GraduationCapIcon className="size-4 text-emerald-500" />,
  },
  {
    value: "COURSE",
    label: "Một lớp học phần cụ thể",
    subLabel: "Chỉ gửi tới sinh viên trong lớp được chọn",
    icon: <GraduationCapIcon className="size-4 text-primary" />,
  },
  {
    value: "TEAM",
    label: "Một nhóm dự án cụ thể",
    subLabel: "Chỉ gửi tới thành viên của nhóm được chọn",
    icon: <UsersIcon className="size-4 text-violet-500" />,
  },
  {
    value: "STUDENT",
    label: "Một sinh viên cụ thể",
    subLabel: "Gửi thông báo riêng cho một sinh viên trong lớp",
    icon: <UserIcon className="size-4 text-sky-500" />,
  },
];

export function LecturerNotificationComposer() {
  const [scope, setScope] = useState<LecturerScope>("ALL_COURSES");
  const [courseId, setCourseId] = useState("");
  const [teamId, setTeamId] = useState("");
  const [studentId, setStudentId] = useState("");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [actionUrl, setActionUrl] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const idempotencyKeyRef = useRef<string>(crypto.randomUUID());

  const { data: courses = [], isLoading: isLoadingCourses } = useQuery({
    queryKey: ["lecturer", "courses", "my-list"],
    queryFn: () => LecturerCourseService.getCourses(),
    staleTime: 1000 * 60 * 5,
  });

  const { data: courseProgress, isLoading: isLoadingProgress } = useQuery({
    queryKey: ["lecturer", "courses", courseId, "progress"],
    queryFn: () => LecturerCourseService.getCourseProgress(courseId),
    enabled: Boolean(courseId) && scope === "TEAM",
    staleTime: 1000 * 60 * 2,
  });

  const { data: rosterData, isLoading: isLoadingRoster } = useQuery({
    queryKey: ["lecturer", "courses", courseId, "roster"],
    queryFn: () => LecturerCourseService.getRoster(courseId),
    enabled: Boolean(courseId) && scope === "STUDENT",
    staleTime: 1000 * 60 * 2,
  });

  const courseOptions: CustomSelectOption[] = useMemo(() => {
    return courses.map((c) => ({
      value: c.id,
      label: `${c.courseCode} - ${c.classCode || c.name}`,
      subLabel: c.subjectCode || c.name,
    }));
  }, [courses]);

  const teamOptions: CustomSelectOption[] = useMemo(() => {
    if (!courseProgress?.teams) return [];
    return courseProgress.teams.map((t) => ({
      value: t.teamId,
      label: t.teamName || `Nhóm ${t.teamNo}`,
      subLabel: `${t.totalTasks} công việc`,
    }));
  }, [courseProgress]);

  const studentOptions: CustomSelectOption[] = useMemo(() => {
    if (!rosterData?.entries) return [];
    return rosterData.entries.map((s) => ({
      value: s.studentProfileId,
      label: `${s.fullName} (${s.studentCode})`,
      subLabel: s.classCode ? `Lớp ${s.classCode}` : s.email,
    }));
  }, [rosterData]);

  const handleScopeChange = (newScope: string) => {
    const s = newScope as LecturerScope;
    setScope(s);
    setTeamId("");
    setStudentId("");
    if (s === "ALL_COURSES") {
      setCourseId("");
    }
  };

  const handleCourseChange = (newCourseId: string) => {
    setCourseId(newCourseId);
    setTeamId("");
    setStudentId("");
  };

  const isScopeReady = useMemo(() => {
    switch (scope) {
      case "ALL_COURSES":
        return true;
      case "COURSE":
        return Boolean(courseId);
      case "TEAM":
        return Boolean(courseId && teamId);
      case "STUDENT":
        return Boolean(courseId && studentId);
      default:
        return false;
    }
  }, [scope, courseId, teamId, studentId]);

  const isTitleValid = title.trim().length > 0 && title.trim().length <= 160;
  const isMessageValid = message.trim().length > 0 && message.trim().length <= 1000;
  const isActionUrlValid = !actionUrl.trim() || isValidInternalActionUrl(actionUrl);
  const canSubmit = isScopeReady && isTitleValid && isMessageValid && isActionUrlValid && !isSending;

  const handleReset = () => {
    setTitle("");
    setMessage("");
    setActionUrl("");
    setErrorMessage(null);
    setScope("ALL_COURSES");
    setCourseId("");
    setTeamId("");
    setStudentId("");
    idempotencyKeyRef.current = crypto.randomUUID();
  };

  const handleSend = async () => {
    if (!canSubmit) return;
    setConfirmOpen(false);
    setIsSending(true);
    setErrorMessage(null);

    const payload = {
      title: title.trim(),
      message: message.trim(),
      actionUrl: actionUrl.trim() || null,
    };
    const key = idempotencyKeyRef.current;

    try {
      let response;
      if (scope === "ALL_COURSES") {
        response = await NotificationService.sendLecturerAllCourses(payload, key);
      } else if (scope === "COURSE") {
        response = await NotificationService.sendLecturerCourse(courseId, payload, key);
      } else if (scope === "TEAM") {
        response = await NotificationService.sendLecturerTeam(teamId, payload, key);
      } else {
        response = await NotificationService.sendLecturerStudent(courseId, studentId, payload, key);
      }

      toast.success("Gửi thông báo thành công!", {
        id: "lecturer-send-success",
        description: `Đã gửi thông báo tới ${response.recipientCount} người nhận (${response.createdCount} bản ghi đã lưu).`,
      });

      handleReset();
    } catch (err: unknown) {
      const error = err as { status?: number; response?: { status?: number; data?: { code?: string; message?: string } }; message?: string };
      const status = error.status || error.response?.status;
      const code = error.response?.data?.code;

      if (status === 409 || code === "NOTIFICATION_SEND_CONFLICT") {
        const msg = "Xung đột khóa gửi thông báo (409 NOTIFICATION_SEND_CONFLICT). Yêu cầu này đã được xử lý trên hệ thống, vui lòng không gửi lại.";
        setErrorMessage(msg);
        toast.error("Gửi thông báo thất bại", { description: msg });
      } else {
        const msg = error.response?.data?.message || error.message || "Không thể kết nối đến máy chủ để gửi thông báo. Bạn có thể nhấn Thử lại.";
        setErrorMessage(msg);
        toast.error("Gửi thông báo thất bại", { description: msg });
      }
    } finally {
      setIsSending(false);
    }
  };

  const selectedCourseName = courses.find((c) => c.id === courseId);
  const selectedTeamName = courseProgress?.teams?.find((t) => t.teamId === teamId)?.teamName;
  const selectedStudentName = rosterData?.entries?.find((s) => s.studentProfileId === studentId)?.fullName;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      <div className="lg:col-span-7 space-y-6">
        <Card className="rounded-3xl border-border bg-card shadow-sm">
          <CardHeader className="p-6 border-b border-border/80">
            <div className="flex items-center gap-2.5">
              <div className="size-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                <BellIcon className="size-4.5" />
              </div>
              <div>
                <CardTitle className="text-base font-bold text-foreground">
                  Gửi thông báo lớp học (COURSE / TEAM)
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Truyền đạt thông báo tới lớp học, nhóm dự án hoặc từng sinh viên bạn đang phụ trách.
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6 space-y-5">
            {errorMessage && (
              <div className="p-3.5 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-start gap-3 text-destructive">
                <AlertCircleIcon className="size-4.5 shrink-0 mt-0.5" />
                <div className="text-xs leading-relaxed flex-1 font-medium">{errorMessage}</div>
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="lecturer-scope-select" className="text-xs font-bold text-foreground">
                Phạm vi gửi thông báo <span className="text-destructive">*</span>
              </label>
              <CustomSelect
                id="lecturer-scope-select"
                value={scope}
                onChange={handleScopeChange}
                options={SCOPE_OPTIONS}
                disabled={isSending}
              />
            </div>

            {scope !== "ALL_COURSES" && (
              <div className="space-y-2">
                <label htmlFor="lecturer-course-select" className="text-xs font-bold text-foreground">
                  Chọn lớp học phần <span className="text-destructive">*</span>
                </label>
                <CustomSelect
                  id="lecturer-course-select"
                  value={courseId}
                  onChange={handleCourseChange}
                  options={courseOptions}
                  placeholder={isLoadingCourses ? "Đang tải danh sách lớp..." : "Chọn một lớp học phần..."}
                  disabled={isSending || isLoadingCourses || courseOptions.length === 0}
                />
              </div>
            )}

            {scope === "TEAM" && courseId && (
              <div className="space-y-2">
                <label htmlFor="lecturer-team-select" className="text-xs font-bold text-foreground">
                  Chọn nhóm dự án nhận thông báo <span className="text-destructive">*</span>
                </label>
                <CustomSelect
                  id="lecturer-team-select"
                  value={teamId}
                  onChange={setTeamId}
                  options={teamOptions}
                  placeholder={
                    isLoadingProgress
                      ? "Đang tải danh sách nhóm..."
                      : teamOptions.length === 0
                        ? "Lớp này chưa có nhóm dự án"
                        : "Chọn một nhóm dự án..."
                  }
                  disabled={isSending || isLoadingProgress || teamOptions.length === 0}
                />
              </div>
            )}

            {scope === "STUDENT" && courseId && (
              <div className="space-y-2">
                <label htmlFor="lecturer-student-select" className="text-xs font-bold text-foreground">
                  Chọn sinh viên nhận thông báo <span className="text-destructive">*</span>
                </label>
                <CustomSelect
                  id="lecturer-student-select"
                  value={studentId}
                  onChange={setStudentId}
                  options={studentOptions}
                  placeholder={
                    isLoadingRoster
                      ? "Đang tải danh sách sinh viên..."
                      : studentOptions.length === 0
                        ? "Lớp này chưa có sinh viên"
                        : "Chọn một sinh viên..."
                  }
                  disabled={isSending || isLoadingRoster || studentOptions.length === 0}
                />
              </div>
            )}

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="lecturer-notification-title" className="text-xs font-bold text-foreground">
                  Tiêu đề thông báo <span className="text-destructive">*</span>
                </label>
                <span
                  className={cn(
                    "text-[11px] font-mono",
                    title.length > 160 ? "text-destructive font-bold" : "text-muted-foreground"
                  )}
                >
                  {title.length}/160
                </span>
              </div>
              <Input
                id="lecturer-notification-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Nhập tiêu đề thông báo (tối đa 160 ký tự)..."
                maxLength={160}
                className="h-10 text-sm rounded-xl"
                disabled={isSending}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="lecturer-notification-message" className="text-xs font-bold text-foreground">
                  Nội dung thông báo <span className="text-destructive">*</span>
                </label>
                <span
                  className={cn(
                    "text-[11px] font-mono",
                    message.length > 1000 ? "text-destructive font-bold" : "text-muted-foreground"
                  )}
                >
                  {message.length}/1000
                </span>
              </div>
              <Textarea
                id="lecturer-notification-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Nhập nội dung thông báo gửi tới sinh viên..."
                rows={5}
                maxLength={1000}
                className="text-sm rounded-xl resize-none"
                disabled={isSending}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="lecturer-notification-action-url" className="text-xs font-bold text-foreground">
                Đường dẫn điều hướng nội bộ (Action URL)
              </label>
              <Input
                id="lecturer-notification-action-url"
                value={actionUrl}
                onChange={(e) => setActionUrl(e.target.value)}
                placeholder="Ví dụ: /student/dashboard hoặc /student/project-info (bắt đầu bằng /)"
                className="h-10 text-sm font-mono rounded-xl"
                disabled={isSending}
              />
              {actionUrl.trim() && !isActionUrlValid && (
                <p className="text-[11px] text-destructive flex items-center gap-1 font-medium">
                  <ShieldAlertIcon className="size-3.5" />
                  Đường dẫn không hợp lệ. Phải bắt đầu bằng &quot;/&quot; và không bắt đầu bằng &quot;//&quot;.
                </p>
              )}
            </div>

            <div className="pt-2 flex items-center justify-end gap-3 border-t border-border/60">
              <Button
                variant="outline"
                onClick={handleReset}
                disabled={isSending || (!title && !message && !actionUrl && scope === "ALL_COURSES")}
                className="cursor-pointer text-xs h-9 rounded-xl"
              >
                <RotateCcwIcon className="size-3.5 mr-1.5" />
                Làm mới
              </Button>
              <Button
                onClick={() => setConfirmOpen(true)}
                disabled={!canSubmit}
                className="cursor-pointer text-xs h-9 rounded-xl"
              >
                {isSending ? (
                  <>
                    <LoaderCircleIcon className="size-3.5 mr-1.5 animate-spin" />
                    Đang gửi thông báo...
                  </>
                ) : (
                  <>
                    <SendIcon className="size-3.5 mr-1.5" />
                    Gửi thông báo
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-5 space-y-4">
        <Card className="rounded-3xl border-border bg-card shadow-sm overflow-hidden">
          <CardHeader className="p-4 sm:p-5 border-b border-border/80 bg-muted/20">
            <CardTitle className="text-xs uppercase tracking-wider font-bold text-muted-foreground">
              Xem trước trực tiếp (Live Preview)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            <div className="p-4 rounded-2xl bg-card border border-primary/20 shadow-xs flex gap-3.5">
              <div
                className={cn(
                  "size-10 rounded-xl flex items-center justify-center shrink-0 border",
                  scope === "TEAM"
                    ? "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20"
                    : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                )}
              >
                {scope === "TEAM" ? <UsersIcon className="size-5" /> : <GraduationCapIcon className="size-5" />}
              </div>
              <div className="flex-1 min-w-0 space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-foreground truncate">
                    {title.trim() || "Tiêu đề thông báo..."}
                  </span>
                  <Badge
                    className={cn(
                      "text-[9px] px-1.5 py-0 font-bold shrink-0 border",
                      scope === "TEAM"
                        ? "bg-violet-500/15 text-violet-600 dark:text-violet-400 border-violet-500/30"
                        : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                    )}
                  >
                    {scope === "TEAM" ? "Nhóm" : "Lớp học"}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed break-words line-clamp-4">
                  {message.trim() || "Nội dung thông báo sẽ xuất hiện tại đây sau khi sinh viên nhận được..."}
                </p>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-muted-foreground font-medium">Vừa xong</span>
                  {actionUrl.trim() && isActionUrlValid && (
                    <span className="text-[10px] font-mono text-primary truncate max-w-[160px]">
                      {actionUrl.trim()}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-muted/40 border border-border/60 text-xs space-y-1.5">
              <div className="font-semibold text-foreground">Phạm vi người nhận:</div>
              <div className="text-muted-foreground">
                {scope === "ALL_COURSES" && "Toàn bộ sinh viên thuộc mọi lớp học phần bạn đang phụ trách."}
                {scope === "COURSE" && (selectedCourseName ? `Sinh viên lớp: ${selectedCourseName.courseCode} (${selectedCourseName.classCode})` : "Chưa chọn lớp.")}
                {scope === "TEAM" && (selectedTeamName ? `Thành viên: ${selectedTeamName}` : "Chưa chọn nhóm.")}
                {scope === "STUDENT" && (selectedStudentName ? `Sinh viên: ${selectedStudentName}` : "Chưa chọn sinh viên.")}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-border bg-muted/30 p-5 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-foreground">
            <CheckCircle2Icon className="size-4 text-emerald-500" />
            Quy định gửi thông báo giảng viên
          </div>
          <ul className="text-xs text-muted-foreground space-y-2 list-disc pl-4 leading-relaxed">
            <li>Dữ liệu lớp, nhóm và sinh viên được lấy trực tiếp từ quyền phụ trách thực tế.</li>
            <li>Không nhập mã định danh thủ công, đảm bảo không vi phạm ràng buộc bảo mật.</li>
            <li>Khóa Idempotency Key tự động bảo vệ giao dịch không bị gửi trùng khi nghẽn mạng.</li>
          </ul>
        </Card>
      </div>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent className="rounded-3xl max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-bold">
              Xác nhận gửi thông báo?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground leading-relaxed">
              Thông báo sẽ được gửi tới các sinh viên trong phạm vi đã chọn và không thể thu hồi sau khi phát hành.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer text-xs rounded-xl">Hủy bỏ</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => void handleSend()}
              className="cursor-pointer text-xs rounded-xl"
            >
              Xác nhận gửi
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
