"use client";

import { showErrorToast, getApiErrorMessage } from "@/lib/api-error";
import { useCallback, useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangleIcon,
  CalendarClockIcon,
  InfoIcon,
  LayoutDashboardIcon,
  RefreshCwIcon,
  ServerCrashIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CustomSelect } from "@/components/common/custom-select";
import { DashboardKPIsSection } from "./dashboard-kpis";
import { DashboardChartsSection } from "./dashboard-charts";
import { WebhookIntegrationSection } from "./webhook-integration-card";
import { RecentAuditSection } from "./recent-audit-stream";
import {
  prefetchAdminDashboardSummary,
  useAdminDashboardForceRefresh,
  useAdminDashboardSummary,
} from "../hooks/use-admin-dashboard";
import {
  formatDashboardDateTime,
  getSemesterStatusLabel,
} from "../lib/dashboard-format";

export function DashboardPage() {
  const queryClient = useQueryClient();
  const [selectedSemesterId, setSelectedSemesterId] = useState<string>();
  const handledErrorRef = useRef<unknown>(undefined);
  const summaryQuery = useAdminDashboardSummary(selectedSemesterId);
  const refreshMutation = useAdminDashboardForceRefresh();

  const summary = summaryQuery.data;

  useEffect(() => {
    if (!summaryQuery.isError || handledErrorRef.current === summaryQuery.error) {
      return;
    }

    handledErrorRef.current = summaryQuery.error;
    showErrorToast("Không thể tải học kỳ đã chọn", {
      description: getApiErrorMessage(
        summaryQuery.error,
        "Dashboard chưa thể tải dữ liệu học kỳ này."
      ),
    });
  }, [summaryQuery.error, summaryQuery.isError]);

  const semesterOptions = (summary?.availableSemesters ?? []).map(
    (semester) => ({
      value: semester.id,
      label: `${semester.code} · ${semester.name}`,
      subLabel: `${getSemesterStatusLabel(semester.periodStatus)}${semester.active ? " · Học kỳ hiện tại" : ""}`,
    })
  );
  const selectValue = summaryQuery.isError
    ? (summary?.selectedSemester.id ?? "")
    : (selectedSemesterId ?? summary?.selectedSemester.id ?? "");
  const requestedSemester = semesterOptions.find(
    (semester) => semester.value === selectedSemesterId
  );
  const isChangingSemester = Boolean(
    summary &&
    selectedSemesterId &&
    selectedSemesterId !== summary.selectedSemester.id &&
    summaryQuery.isFetching
  );
  const updateLabel = isChangingSemester
    ? `Đang tải ${requestedSemester?.label ?? "học kỳ đã chọn"}`
    : refreshMutation.isPending
      ? "Đang làm mới"
      : summaryQuery.isFetching
        ? "Đang cập nhật"
        : undefined;
  const isUpdating = Boolean(summary && updateLabel);

  const handleSemesterIntent = useCallback(
    (semesterId: string) => {
      void prefetchAdminDashboardSummary(queryClient, semesterId);
    },
    [queryClient]
  );

  return (
    <div className="mx-auto max-w-[1600px] space-y-5 p-4 sm:p-6">
      <header className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div className="flex items-center gap-2.5">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <LayoutDashboardIcon className="size-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              Tổng quan vận hành SAGA
            </h1>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Theo dõi học kỳ, liên kết Task–Commit và tích hợp Jira/GitHub.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="min-w-0 sm:w-72">
            <CustomSelect
              value={selectValue}
              onChange={setSelectedSemesterId}
              onOptionIntent={handleSemesterIntent}
              options={semesterOptions}
              placeholder={
                summaryQuery.isPending ? "Đang tải học kỳ..." : "Chọn học kỳ"
              }
              disabled={!summary || semesterOptions.length === 0}
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              refreshMutation.mutate(summary?.selectedSemester.id)
            }
            disabled={
              !summary ||
              refreshMutation.isPending ||
              isChangingSemester
            }
            className="h-9 shrink-0 gap-1.5 rounded-xl text-xs font-semibold"
          >
            <RefreshCwIcon
              className={`size-3.5 ${refreshMutation.isPending ? "animate-spin" : ""}`}
            />
            {refreshMutation.isPending ? "Đang làm mới" : "Làm mới"}
          </Button>
        </div>
      </header>

      {summary ? (
        <DataFreshnessBar
          cachedAt={summary.cacheMetadata.cachedAt}
          expiresAt={summary.cacheMetadata.expiresAt}
          ttlSecondsRemaining={summary.cacheMetadata.ttlSecondsRemaining}
          refreshPending={summary.cacheMetadata.refreshPending}
          updateLabel={updateLabel}
        />
      ) : null}

      {summaryQuery.isError && !summary ? (
        <DashboardErrorState
          message={getApiErrorMessage(
            summaryQuery.error,
            "Không thể tải dữ liệu tổng hợp Admin Dashboard."
          )}
          onRetry={() => void summaryQuery.refetch()}
        />
      ) : !summary ? (
        <DashboardLoadingState />
      ) : (
        <div
          aria-busy={isUpdating}
          className={`space-y-5 transition-opacity ${isChangingSemester ? "opacity-85" : "opacity-100"}`}
        >
          <DashboardKPIsSection kpis={summary.kpis} />
          <DashboardChartsSection
            selectedSemester={summary.selectedSemester}
            weeklyTimeline={summary.weeklyTimeline}
          />
          <div
            style={{
              contentVisibility: "auto",
              containIntrinsicSize: "640px",
            }}
          >
            <WebhookIntegrationSection
              integrationPulse={summary.integrationPulse}
              unconnectedTeams={summary.unconnectedTeamsAlert}
            />
          </div>
          <div
            style={{
              contentVisibility: "auto",
              containIntrinsicSize: "360px",
            }}
          >
            <RecentAuditSection />
          </div>
        </div>
      )}
    </div>
  );
}

function DataFreshnessBar({
  cachedAt,
  expiresAt,
  ttlSecondsRemaining,
  refreshPending,
  updateLabel,
}: {
  cachedAt: string;
  expiresAt: string;
  ttlSecondsRemaining: number | null;
  refreshPending: boolean;
  updateLabel?: string;
}) {
  const technicalDetails = `Hết hạn: ${formatDashboardDateTime(expiresAt)} · TTL: ${ttlSecondsRemaining === null ? "Không xác định" : `${ttlSecondsRemaining}s`
    }`;

  return (
    <div
      className={`relative flex min-h-11 flex-col justify-between gap-2 overflow-hidden rounded-2xl border px-3.5 py-2.5 text-xs sm:flex-row sm:items-center ${refreshPending
        ? "border-warning/35 bg-warning-muted/40"
        : "border-border/80 bg-card"
        }`}
    >
      {updateLabel ? (
        <span className="absolute inset-x-0 bottom-0 h-0.5 animate-pulse bg-primary" />
      ) : null}
      <div className="flex items-center gap-2 text-muted-foreground">
        {refreshPending ? (
          <AlertTriangleIcon className="size-4 shrink-0 text-warning" />
        ) : (
          <CalendarClockIcon className="size-4 shrink-0 text-primary" />
        )}
        <span>
          {refreshPending
            ? "Đang tổng hợp dữ liệu mới; tạm hiển thị bản gần nhất."
            : `Cập nhật lúc ${formatDashboardDateTime(cachedAt)}.`}
        </span>
      </div>
      <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
        {updateLabel ? (
          <span className="inline-flex items-center gap-1 font-medium text-primary" role="status">
            <RefreshCwIcon className="size-3 animate-spin" />
            {updateLabel}
          </span>
        ) : null}
        <span
          title={technicalDetails}
          aria-label={technicalDetails}
          className="inline-flex size-6 items-center justify-center rounded-full hover:bg-muted"
        >
          <InfoIcon className="size-3.5" />
        </span>
      </div>
    </div>
  );
}

function DashboardLoadingState() {
  return (
    <div aria-label="Đang tải Admin Dashboard" className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div
            key={index}
            className="h-32 animate-pulse rounded-2xl border border-border/70 bg-muted/35"
          />
        ))}
      </div>
      <div className="h-96 animate-pulse rounded-2xl border border-border/70 bg-muted/35" />
    </div>
  );
}

function DashboardErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="flex min-h-80 flex-col items-center justify-center rounded-2xl border border-danger/30 bg-danger-muted/30 p-8 text-center">
      <div className="flex size-12 items-center justify-center rounded-2xl bg-danger-muted text-danger">
        <ServerCrashIcon className="size-6" />
      </div>
      <h2 className="mt-4 text-base font-bold text-foreground">
        Không thể tải Admin Dashboard
      </h2>
      <p className="mt-1 max-w-xl text-xs leading-5 text-muted-foreground">
        {message}
      </p>
      <Button type="button" className="mt-4" onClick={onRetry}>
        Thử lại
      </Button>
    </div>
  );
}