"use client";

import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { useLecturerReviewDelayCase } from "../hooks/use-delay-cases";
import type { DelayCaseResponse, LecturerOutcome } from "../types/delay-cases";
import { Button } from "@/components/ui/button";
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
import { Scale, AlertTriangle } from "lucide-react";


export function DelayCaseLecturerReviewForm({ delayCase, onSuccess }: { delayCase: DelayCaseResponse; onSuccess?: () => void }) {
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const reviewMutation = useLecturerReviewDelayCase();

  const formSchema = z.object({
    outcome: z.string().min(1, "Vui lòng chọn quyết định"),
    comment: z.string().max(1000, "Nhận xét không được vượt quá 1000 ký tự").optional(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      outcome: "",
      comment: "",
    },
  });

  const watchOutcome = useWatch({ control: form.control, name: "outcome" });

  const onSubmit = () => {
    setIsAlertOpen(true);
  };

  const onConfirm = () => {
    const data = form.getValues();
    reviewMutation.mutate({
      projectId: delayCase.projectId,
      caseId: delayCase.id,
      payload: {
        outcome: data.outcome as LecturerOutcome,
        comment: data.comment || undefined,
      },
    }, {
      onSuccess: () => {
        toast.success("Đã lưu quyết định của giảng viên");
        setIsAlertOpen(false);
        if (onSuccess) onSuccess();
      },
      onError: (err: unknown) => {
        const errCode = (err as { response?: { data?: { code?: string, message?: string } } })?.response?.data?.code;
        if (errCode === "DELAY_CASE_INPUT_INVALID") {
          toast.error((err as { response?: { data?: { code?: string, message?: string } } })?.response?.data?.message || "Vui lòng kiểm tra lại thông tin");
        } else if (errCode === "REQUEST_INVALID") {
          toast.error("Vui lòng chọn đầy đủ thông tin bắt buộc.");
        } else if (errCode === "DELAY_CASE_STATE_CONFLICT") {
          toast.error("Hồ sơ đã thay đổi, hệ thống đang tải lại dữ liệu.");
          setIsAlertOpen(false);
        } else if (errCode === "DELAY_CASE_FORBIDDEN") {
          toast.error("Bạn không có quyền thực hiện bước này.");
          setIsAlertOpen(false);
        } else if (errCode === "DELAY_CASE_NOT_FOUND") {
          toast.error("Không tìm thấy hồ sơ trễ hạn.");
          setIsAlertOpen(false);
        } else {
          toast.error("Đã có lỗi xảy ra");
        }
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          type="button"
          variant={watchOutcome === "OBJECTIVE" ? "default" : "outline"}
          className={watchOutcome === "OBJECTIVE" ? "bg-emerald-600 hover:bg-emerald-700" : ""}
          onClick={() => form.setValue("outcome", "OBJECTIVE", { shouldValidate: true })}
        >
          <Scale className="w-4 h-4 mr-2" />
          Chấp nhận
        </Button>
        <Button
          type="button"
          variant={watchOutcome === "SUBJECTIVE" ? "default" : "outline"}
          className={watchOutcome === "SUBJECTIVE" ? "bg-red-600 hover:bg-red-700" : ""}
          onClick={() => form.setValue("outcome", "SUBJECTIVE", { shouldValidate: true })}
        >
          <AlertTriangle className="w-4 h-4 mr-2" />
          Từ chối
        </Button>
      </div>
      {form.formState.errors.outcome && (
        <p className="text-red-500 text-xs">{form.formState.errors.outcome.message}</p>
      )}

      <div>
        <label className="text-sm font-medium mb-1 block">Nhận xét</label>
        <textarea
          className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="Nhập nhận xét..."
          {...form.register("comment")}
        />
        {form.formState.errors.comment && (
          <p className="text-red-500 text-xs mt-1">{form.formState.errors.comment.message}</p>
        )}
      </div>

      <div className="flex justify-end">
        <Button onClick={form.handleSubmit(onSubmit)} disabled={reviewMutation.isPending || !watchOutcome}>
          Xác nhận quyết định cuối cùng
        </Button>
      </div>

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận quyết định</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn đang quyết định hồ sơ này là <b>{watchOutcome === "OBJECTIVE" ? "Chấp nhận" : "Từ chối"}</b>.
              Sau khi xác nhận, quyết định không thể thay đổi.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={reviewMutation.isPending}>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={(e) => { e.preventDefault(); onConfirm(); }} disabled={reviewMutation.isPending}>
              {reviewMutation.isPending ? "Đang gửi..." : "Xác nhận"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
