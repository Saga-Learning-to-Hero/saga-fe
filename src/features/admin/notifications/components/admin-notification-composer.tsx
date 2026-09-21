"use client";

import { useState, useRef } from "react";
import {
  BellIcon,
  SendIcon,
  RotateCcwIcon,
  AlertCircleIcon,
  CheckCircle2Icon,
  LoaderCircleIcon,
  RadioIcon,
  ShieldAlertIcon,
  ShieldCheckIcon,
  UsersIcon,
  ZapIcon,
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
import { NotificationService } from "@/features/notification/api/notification-service";
import { isValidInternalActionUrl } from "@/features/notification/lib/notification-utils";
import { cn } from "@/lib/utils";

export function AdminNotificationComposer() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [actionUrl, setActionUrl] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const idempotencyKeyRef = useRef<string>(crypto.randomUUID());

  const isTitleValid = title.trim().length > 0 && title.trim().length <= 160;
  const isMessageValid = message.trim().length > 0 && message.trim().length <= 1000;
  const isActionUrlValid = !actionUrl.trim() || isValidInternalActionUrl(actionUrl);
  const canSubmit = isTitleValid && isMessageValid && isActionUrlValid && !isSending;

  const handleReset = () => {
    setTitle("");
    setMessage("");
    setActionUrl("");
    setErrorMessage(null);
    idempotencyKeyRef.current = crypto.randomUUID();
  };

  const handleSend = async () => {
    if (!canSubmit) return;
    setConfirmOpen(false);
    setIsSending(true);
    setErrorMessage(null);

    try {
      const response = await NotificationService.sendAdminSystem(
        {
          title: title.trim(),
          message: message.trim(),
          actionUrl: actionUrl.trim() || null,
        },
        idempotencyKeyRef.current
      );

      toast.success("Phát thông báo hệ thống thành công!", {
        id: "admin-send-success",
        description: `Đã gửi thông báo tới ${response.recipientCount} tài khoản hoạt động (${response.createdCount} bản ghi đã lưu).`,
      });

      handleReset();
    } catch (err: unknown) {
      const error = err as {
        status?: number;
        response?: { status?: number; data?: { code?: string; message?: string } };
        message?: string;
      };
      const status = error.status || error.response?.status;
      const code = error.response?.data?.code;

      if (status === 409 || code === "NOTIFICATION_SEND_CONFLICT") {
        const msg =
          "Xung đột khóa gửi thông báo (409 NOTIFICATION_SEND_CONFLICT). Yêu cầu này đã được xử lý trên hệ thống, vui lòng không gửi lại.";
        setErrorMessage(msg);
        toast.error("Gửi thông báo thất bại", { description: msg });
      } else {
        const msg =
          error.response?.data?.message ||
          error.message ||
          "Không thể kết nối đến máy chủ để gửi thông báo. Bạn có thể nhấn Thử lại.";
        setErrorMessage(msg);
        toast.error("Gửi thông báo thất bại", { description: msg });
      }
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="rounded-2xl border border-border/80 bg-card p-4 shadow-xs">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 sm:divide-x sm:divide-border/60">
          <div className="flex items-center gap-3.5 sm:px-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <RadioIcon className="size-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground">Kênh phát hành</p>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-xs font-bold text-foreground">Toàn hệ thống</span>
                <Badge
                  variant="outline"
                  className="ml-1 border-primary/20 bg-primary/5 text-[10px] font-mono font-bold text-primary px-1.5 py-0"
                >
                  BROADCAST
                </Badge>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3.5 sm:px-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <UsersIcon className="size-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground">Đối tượng nhận</p>
              <p className="text-xs font-bold text-foreground mt-0.5">Giảng viên & Sinh viên</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 sm:px-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <ZapIcon className="size-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground">Mức độ ưu tiên</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-xs font-bold text-foreground">Cao</span>
                <Badge
                  variant="outline"
                  className="border-amber-500/30 bg-amber-500/10 text-[10px] font-mono font-bold text-amber-600 dark:text-amber-400 px-1.5 py-0"
                >
                  HIGH PRIORITY
                </Badge>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3.5 sm:px-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <ShieldCheckIcon className="size-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground">Bảo vệ trùng lặp</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-xs font-bold text-foreground">Khóa Idempotency</span>
                <Badge
                  variant="outline"
                  className="border-emerald-500/30 bg-emerald-500/10 text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 px-1.5 py-0"
                >
                  ACTIVE
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7 space-y-6">
          <Card className="rounded-2xl border border-border/80 bg-card shadow-xs">
            <CardHeader className="p-6 border-b border-border/80">
              <div className="flex items-center gap-2.5">
                <div className="size-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
                  <BellIcon className="size-4.5" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold text-foreground">
                    Soạn thông báo hệ thống (SYSTEM)
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">
                    Phát thông báo tới toàn bộ tài khoản Giảng viên và Sinh viên đang hoạt động trong hệ thống.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-6 space-y-5">
              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 flex items-start gap-3 text-destructive">
                  <AlertCircleIcon className="size-4.5 shrink-0 mt-0.5" />
                  <div className="text-xs leading-relaxed flex-1 font-medium">{errorMessage}</div>
                </div>
              )}

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="admin-notification-title" className="text-xs font-bold text-foreground">
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
                  id="admin-notification-title"
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
                  <label htmlFor="admin-notification-message" className="text-xs font-bold text-foreground">
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
                  id="admin-notification-message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Nhập chi tiết nội dung thông báo muốn truyền đạt..."
                  rows={5}
                  maxLength={1000}
                  className="text-sm rounded-xl resize-none"
                  disabled={isSending}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="admin-notification-action-url" className="text-xs font-bold text-foreground">
                  Đường dẫn điều hướng nội bộ (Action URL)
                </label>
                <Input
                  id="admin-notification-action-url"
                  value={actionUrl}
                  onChange={(e) => setActionUrl(e.target.value)}
                  placeholder="Ví dụ: /student/dashboard hoặc /lecturer/courses (bắt đầu bằng /)"
                  className="h-10 text-sm font-mono rounded-xl"
                  disabled={isSending}
                />
                {actionUrl.trim() && !isActionUrlValid && (
                  <p className="text-[11px] text-destructive flex items-center gap-1 font-medium">
                    <ShieldAlertIcon className="size-3.5" />
                    Đường dẫn không hợp lệ. Phải bắt đầu bằng &quot;/&quot; và không bắt đầu bằng &quot;//&quot; hoặc chứa liên kết ngoài.
                  </p>
                )}
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-border/60">
                <Button
                  variant="outline"
                  onClick={handleReset}
                  disabled={isSending || (!title && !message && !actionUrl)}
                  className="cursor-pointer text-xs h-9 rounded-xl"
                >
                  <RotateCcwIcon className="size-3.5 mr-1.5" />
                  Làm mới
                </Button>
                <Button
                  onClick={() => setConfirmOpen(true)}
                  disabled={!canSubmit}
                  className="cursor-pointer text-xs h-9 rounded-xl font-bold shadow-xs"
                >
                  {isSending ? (
                    <>
                      <LoaderCircleIcon className="size-3.5 mr-1.5 animate-spin" />
                      Đang gửi thông báo...
                    </>
                  ) : (
                    <>
                      <SendIcon className="size-3.5 mr-1.5" />
                      Gửi thông báo hệ thống
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-5 space-y-4">
          <Card className="rounded-2xl border border-border/80 bg-card shadow-xs overflow-hidden">
            <CardHeader className="p-4 sm:p-5 border-b border-border/80 bg-muted/20">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs uppercase tracking-wider font-bold text-muted-foreground">
                  Xem trước trực tiếp (Live Preview)
                </CardTitle>
                <Badge variant="outline" className="text-[10px] font-medium border-border/80">
                  Mô phỏng hiển thị
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-5">
              <div className="p-4 rounded-xl bg-card border border-primary/20 shadow-xs flex gap-3.5">
                <div className="size-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/20">
                  <BellIcon className="size-5" />
                </div>
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-foreground truncate">
                      {title.trim() || "Tiêu đề thông báo..."}
                    </span>
                    <Badge className="bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30 text-[9px] px-1.5 py-0 font-bold shrink-0">
                      Hệ thống
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed break-words line-clamp-4">
                    {message.trim() || "Nội dung thông báo sẽ xuất hiện tại đây sau khi người dùng nhận được..."}
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
            </CardContent>
          </Card>

          <Card className="rounded-2xl border border-border/80 bg-muted/20 p-5 space-y-3 shadow-xs">
            <div className="flex items-center gap-2 text-xs font-bold text-foreground">
              <CheckCircle2Icon className="size-4 text-emerald-500" />
              Nguyên tắc bảo vệ dữ liệu & Idempotency
            </div>
            <ul className="text-xs text-muted-foreground space-y-2 list-disc pl-4 leading-relaxed">
              <li>Mỗi phiên soạn thảo được gán một Idempotency Key duy nhất để chống gửi trùng lặp.</li>
              <li>Nếu kết nối gặp sự cố hoặc timeout, thao tác gửi lại sẽ tái sử dụng cùng mã key.</li>
              <li>Khi có lỗi xung đột 409, hệ thống không tự động thử lại nhằm bảo vệ tính toàn vẹn.</li>
            </ul>
          </Card>
        </div>

        <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
          <AlertDialogContent className="rounded-2xl max-w-md">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-base font-bold">
                Xác nhận phát thông báo hệ thống?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-xs text-muted-foreground leading-relaxed">
                Thông báo này sẽ được gửi tới toàn bộ tài khoản Giảng viên và Sinh viên đang hoạt động trong toàn hệ thống SAGA. Thao tác này không thể hoàn tác.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="cursor-pointer text-xs rounded-xl">Hủy bỏ</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => void handleSend()}
                className="cursor-pointer text-xs rounded-xl font-bold"
              >
                Xác nhận phát hành
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
