"use client";

import { AlertCircleIcon, CheckCircle2Icon, RefreshCwIcon, UsersIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { TeamPreviewResponse, TeamPreviewRowAction } from "../types/lecturer-team";

const ACTION_LABELS: Record<string, { label: string; className: string }> = {
  READY_CREATE: {
    label: "Sẽ tạo nhóm",
    className: "bg-primary/10 text-primary border-primary/25",
  },
  READY_ASSIGN: {
    label: "Sẽ thêm thành viên",
    className: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
  },
  READY_REASSIGN: {
    label: "Sẽ đổi nhóm/vai trò",
    className: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30",
  },
  ALREADY_ASSIGNED: {
    label: "Không đổi",
    className: "bg-muted text-muted-foreground border-border",
  },
  INVALID: {
    label: "Không hợp lệ",
    className: "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30",
  },
  CONFLICT: {
    label: "Xung đột",
    className: "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30",
  },
};

function ActionBadge({ action }: { action: TeamPreviewRowAction }) {
  const meta = ACTION_LABELS[action] ?? ACTION_LABELS.INVALID;
  return (
    <Badge variant="outline" className={`text-[10px] ${meta.className}`}>
      {meta.label}
    </Badge>
  );
}

interface TeamPreviewTableProps {
  preview: TeamPreviewResponse;
}

export function TeamPreviewTable({ preview }: TeamPreviewTableProps) {
  const summary = preview.summary;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-8">
        {[
          { label: "Tổng dòng", value: summary.totalRows },
          { label: "Hợp lệ", value: summary.validRows },
          { label: "Không hợp lệ", value: summary.invalidRows },
          { label: "Tạo nhóm", value: summary.readyCreate },
          { label: "Gán TV", value: summary.readyAssign },
          { label: "Đổi nhóm", value: summary.readyReassign },
          { label: "Không đổi", value: summary.alreadyAssigned },
          { label: "Lỗi chặn", value: summary.blockingErrorCount },
        ].map((item) => (
          <div key={item.label} className="rounded-xl border border-border bg-card p-3 text-center">
            <p className="text-[11px] text-muted-foreground">{item.label}</p>
            <p className="font-mono text-lg font-extrabold text-foreground">{item.value}</p>
          </div>
        ))}
      </div>

      {preview.hasBlockingErrors && (
        <div className="flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-700 dark:text-red-300">
          <AlertCircleIcon className="mt-0.5 size-4 shrink-0" />
          <div>
            <p className="font-semibold">Không thể xác nhận vì còn lỗi chặn.</p>
            <p className="mt-1 text-muted-foreground">
              Hãy sửa file Excel theo mẫu backend rồi tải lên lại. Không dùng kết quả tự tính phía
              trình duyệt.
            </p>
            {preview.blockingErrors.length > 0 && (
              <ul className="mt-2 list-disc space-y-0.5 pl-4">
                {preview.blockingErrors.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      <div className="max-h-[320px] overflow-auto rounded-2xl border border-border bg-card">
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-muted/70 backdrop-blur-md">
            <TableRow>
              <TableHead className="w-16 text-center text-xs font-bold">Dòng</TableHead>
              <TableHead className="text-xs font-bold">Sinh viên</TableHead>
              <TableHead className="text-xs font-bold">TeamNo</TableHead>
              <TableHead className="text-xs font-bold">Tên nhóm</TableHead>
              <TableHead className="text-xs font-bold">Vai trò</TableHead>
              <TableHead className="text-xs font-bold">Hành động</TableHead>
              <TableHead className="text-xs font-bold">Lỗi / cảnh báo</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {preview.rows.map((row) => (
              <TableRow key={`${row.rowNumber}-${row.studentCode}`}>
                <TableCell className="text-center font-mono text-xs text-muted-foreground">
                  {row.rowNumber}
                </TableCell>
                <TableCell className="text-xs">
                  <p className="font-medium text-foreground">{row.fullName}</p>
                  <p className="font-mono text-[11px] text-muted-foreground">{row.studentCode}</p>
                </TableCell>
                <TableCell className="font-mono text-xs">{row.teamNo ?? "—"}</TableCell>
                <TableCell className="text-xs">{row.teamName ?? "—"}</TableCell>
                <TableCell className="text-xs">{row.teamRole ?? "—"}</TableCell>
                <TableCell>
                  <ActionBadge action={row.action} />
                </TableCell>
                <TableCell className="text-[11px]">
                  {row.errors.length > 0 && (
                    <p className="flex items-start gap-1 text-red-600 dark:text-red-400">
                      <AlertCircleIcon className="mt-0.5 size-3 shrink-0" />
                      {row.errors.join(", ")}
                    </p>
                  )}
                  {row.warnings.length > 0 && (
                    <p className="mt-0.5 flex items-start gap-1 text-amber-700 dark:text-amber-300">
                      <RefreshCwIcon className="mt-0.5 size-3 shrink-0" />
                      {row.warnings.join(", ")}
                    </p>
                  )}
                  {row.errors.length === 0 && row.warnings.length === 0 && (
                    <span className="inline-flex items-center gap-1 text-muted-foreground">
                      <CheckCircle2Icon className="size-3" />
                      Không có
                    </span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {preview.rows.length === 0 && (
          <p className="flex items-center justify-center gap-2 p-6 text-xs text-muted-foreground">
            <UsersIcon className="size-4" />
            Không có dòng preview.
          </p>
        )}
      </div>
    </div>
  );
}
