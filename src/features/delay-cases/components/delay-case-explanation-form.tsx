"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { useExplainDelayCase } from "../hooks/use-delay-cases";
import { getCategoryConfig, DELAY_CAUSE_CATEGORY_CONFIG } from "../lib/delay-case-constants";
import type { DelayCaseResponse, DelayCauseCategory } from "../types/delay-cases";
import { Button } from "@/components/ui/button";
import { CustomSelect } from "@/components/common/custom-select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/axios";


export function DelayCaseExplanationForm({ delayCase }: { delayCase: DelayCaseResponse }) {
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const explainMutation = useExplainDelayCase();

  const formSchema = z.object({
    category: z.string().min(1, "Vui lòng chọn nguyên nhân"),
    note: z.string().max(1000, "Ghi chú không được vượt quá 1000 ký tự").optional(),
    blockingTaskId: z.string().optional(),
    evidenceUrl: z.string().max(2048, "Link không được vượt quá 2048 ký tự").optional(),
  }).superRefine((data, ctx) => {
    if (data.evidenceUrl && !/^(https?:\/\/)/.test(data.evidenceUrl)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Link minh chứng phải bắt đầu bằng http:// hoặc https://",
        path: ["evidenceUrl"],
      });
    }

    const config = getCategoryConfig(data.category);

    if (config.requiresNote && !data.note?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Ghi chú là bắt buộc cho nguyên nhân này",
        path: ["note"],
      });
    }

    if (data.category === "BLOCKED_BY_TASK" && !data.blockingTaskId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Vui lòng chọn Task chặn",
        path: ["blockingTaskId"],
      });
    }
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      category: "",
      note: "",
      blockingTaskId: "",
      evidenceUrl: "",
    },
  });

  const categoryOptions = Object.entries(DELAY_CAUSE_CATEGORY_CONFIG).map(([key, config]) => ({
    value: key,
    label: config.label,
    groupLabel: config.group,
  }));

  const watchCategory = form.watch("category");
  const isBlockedCategory = watchCategory === "BLOCKED_BY_TASK";

  const { data: tasks } = useQuery({
    queryKey: ["tasks", delayCase.projectId],
    queryFn: async () => {
      const res = await apiClient.get<{ id: string; key: string; summary: string }[]>(`/api/projects/${delayCase.projectId}/tasks`);
      return res.data;
    },
    enabled: isBlockedCategory,
  });

  const taskOptions = tasks
    ?.filter((t) => t.id !== delayCase.taskId)
    .map((t) => ({ value: t.id, label: `${t.key} - ${t.summary}` })) || [];

  const onSubmit = () => {
    setIsAlertOpen(true);
  };

  const onConfirm = () => {
    const data = form.getValues();
    explainMutation.mutate({
      projectId: delayCase.projectId,
      caseId: delayCase.id,
      payload: {
        category: data.category as DelayCauseCategory,
        note: data.note || undefined,
        blockingTaskId: isBlockedCategory ? data.blockingTaskId : undefined,
        evidenceUrl: data.evidenceUrl || undefined,
      },
    }, {
      onSuccess: () => {
        toast.success("Đã gửi giải trình thành công");
        setIsAlertOpen(false);
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
      <div className="space-y-3">
        <div>
          <label className="text-sm font-medium mb-1 block">Nguyên nhân <span className="text-red-500">*</span></label>
          <CustomSelect
            id="delay-category"
            value={watchCategory}
            onChange={(val) => form.setValue("category", val as DelayCauseCategory, { shouldValidate: true })}
            options={categoryOptions}
            placeholder="Chọn nguyên nhân..."
          />
          {form.formState.errors.category && (
            <p className="text-red-500 text-xs mt-1">{form.formState.errors.category.message}</p>
          )}
        </div>

        {isBlockedCategory && (
          <div>
            <label className="text-sm font-medium mb-1 block">Task chặn <span className="text-red-500">*</span></label>
            <CustomSelect
              id="delay-blocking-task"
              value={form.watch("blockingTaskId") || ""}
              onChange={(val) => form.setValue("blockingTaskId", val, { shouldValidate: true })}
              options={taskOptions}
              placeholder="Chọn Task..."
            />
            {form.formState.errors.blockingTaskId && (
              <p className="text-red-500 text-xs mt-1">{form.formState.errors.blockingTaskId.message}</p>
            )}
          </div>
        )}

        <div>
          <label className="text-sm font-medium mb-1 block">Ghi chú {getCategoryConfig(watchCategory).requiresNote && <span className="text-red-500">*</span>}</label>
          <textarea
            className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="Nhập ghi chú chi tiết..."
            {...form.register("note")}
          />
          {form.formState.errors.note && (
            <p className="text-red-500 text-xs mt-1">{form.formState.errors.note.message}</p>
          )}
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block">Link minh chứng</label>
          <input
            type="url"
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="Link Google Drive hoặc đường dẫn tới minh chứng (http://, https://)"
            {...form.register("evidenceUrl")}
          />
          {form.formState.errors.evidenceUrl && (
            <p className="text-red-500 text-xs mt-1">{form.formState.errors.evidenceUrl.message}</p>
          )}
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={form.handleSubmit(onSubmit)} disabled={explainMutation.isPending}>
          Gửi giải trình
        </Button>
      </div>

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận gửi giải trình</AlertDialogTitle>
            <AlertDialogDescription>
              Sau khi gửi, nội dung giải trình sẽ được chuyển sang bước xác nhận và không thể chỉnh sửa.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={explainMutation.isPending}>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={(e) => { e.preventDefault(); onConfirm(); }} disabled={explainMutation.isPending}>
              {explainMutation.isPending ? "Đang gửi..." : "Gửi giải trình"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
