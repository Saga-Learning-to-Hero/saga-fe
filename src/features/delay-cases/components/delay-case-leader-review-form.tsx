"use client";

import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { useLeaderReviewDelayCase } from "../hooks/use-delay-cases";
import type { DelayCaseResponse, LeaderDecision } from "../types/delay-cases";
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
import { ThumbsUp, ThumbsDown } from "lucide-react";


export function DelayCaseLeaderReviewForm({ delayCase, onSuccess }: { delayCase: DelayCaseResponse; onSuccess?: () => void }) {
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const reviewMutation = useLeaderReviewDelayCase();

  const formSchema = z.object({
    decision: z.string().min(1, "Vui lòng chọn quyết định"),
    comment: z.string().max(1000, "Nhận xét không được vượt quá 1000 ký tự").optional(),
  }).superRefine((data, ctx) => {
    if (data.decision === "DISAGREE" && !data.comment?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Bạn phải nhập nhận xét khi không đồng ý",
        path: ["comment"],
      });
    }
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      decision: "",
      comment: "",
    },
  });

  const watchDecision = useWatch({ control: form.control, name: "decision" });

  const onSubmit = () => {
    setIsAlertOpen(true);
  };

  const onConfirm = () => {
    const data = form.getValues();
    reviewMutation.mutate({
      projectId: delayCase.projectId,
      caseId: delayCase.id,
      payload: {
        decision: data.decision as LeaderDecision,
        comment: data.comment || undefined,
      },
    }, {
      onSuccess: () => {
        toast.success("Đã lưu đánh giá của trưởng nhóm");
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
          variant={watchDecision === "AGREE" ? "default" : "outline"}
          className={watchDecision === "AGREE" ? "bg-emerald-600 hover:bg-emerald-700" : ""}
          onClick={() => form.setValue("decision", "AGREE", { shouldValidate: true })}
        >
          <ThumbsUp className="w-4 h-4 mr-2" />
          Đồng ý
        </Button>
        <Button
          type="button"
          variant={watchDecision === "DISAGREE" ? "default" : "outline"}
          className={watchDecision === "DISAGREE" ? "bg-red-600 hover:bg-red-700" : ""}
          onClick={() => form.setValue("decision", "DISAGREE", { shouldValidate: true })}
        >
          <ThumbsDown className="w-4 h-4 mr-2" />
          Không đồng ý
        </Button>
      </div>
      {form.formState.errors.decision && (
        <p className="text-red-500 text-xs">{form.formState.errors.decision.message}</p>
      )}

      <div>
        <label className="text-sm font-medium mb-1 block">
          Nhận xét {watchDecision === "DISAGREE" && <span className="text-red-500">*</span>}
        </label>
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
        <Button onClick={form.handleSubmit(onSubmit)} disabled={reviewMutation.isPending || !watchDecision}>
          Xác nhận quyết định
        </Button>
      </div>

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận quyết định</AlertDialogTitle>
            <AlertDialogDescription>
              {watchDecision === "AGREE" ? "Bạn đồng ý với giải trình này. " : "Bạn không đồng ý với giải trình này. "}
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
