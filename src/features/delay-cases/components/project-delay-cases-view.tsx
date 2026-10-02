"use client";

import { useState } from "react";
import { useDelayCases } from "../hooks/use-delay-cases";
import { DelayCaseCard } from "./delay-case-card";
import { Loader2, AlertCircle, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CustomSelect } from "@/components/common/custom-select";

interface ProjectDelayCasesViewProps {
  projectId: string;
}

export function ProjectDelayCasesView({ projectId }: ProjectDelayCasesViewProps) {
  const [filter, setFilter] = useState("ALL");
  const { data: delayCases, isLoading, isError, refetch, isRefetching } = useDelayCases(projectId);

  const filteredCases = delayCases?.filter((c) => {
    if (filter === "ALL") return true;
    if (filter === "AWAITING_EXPLANATION") return c.status === "OPEN";
    if (filter === "PENDING_LEADER_REVIEW") return c.status === "PENDING_LEADER_REVIEW";
    if (filter === "PENDING_LECTURER_REVIEW") return c.status === "PENDING_LECTURER_REVIEW";
    if (filter === "CLOSED") return c.status === "CLOSED_EXCUSED" || c.status === "CLOSED_REJECTED";
    if (filter === "MY_REVIEW") return c.permissions.canLeaderReview;
    return true;
  });

  const filterOptions = [
    { value: "ALL", label: "Tất cả" },
    { value: "AWAITING_EXPLANATION", label: "Chờ giải trình" },
    { value: "PENDING_LEADER_REVIEW", label: "Chờ trưởng nhóm" },
    { value: "PENDING_LECTURER_REVIEW", label: "Chờ giảng viên" },
    { value: "CLOSED", label: "Đã đóng" },
  ];

  const hasLeaderReviewTask = delayCases?.some(c => c.permissions.canLeaderReview);
  if (hasLeaderReviewTask) {
    filterOptions.push({ value: "MY_REVIEW", label: "Chờ tôi xác nhận" });
  }

  return (
    <div className="flex flex-col h-full overflow-hidden p-6 gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <h2 className="text-xl font-bold flex items-center gap-2">
          Hồ sơ trễ hạn
          {isRefetching && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
        </h2>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <div className="w-full sm:w-[250px]">
            <CustomSelect
              id="delay-cases-filter"
              value={filter}
              onChange={setFilter}
              options={filterOptions}
            />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0 pr-2 space-y-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-12 text-muted-foreground gap-2 bg-muted/10 rounded-xl border border-border/50">
            <Loader2 className="w-8 h-8 animate-spin" />
            <span className="text-sm">Đang tải danh sách hồ sơ...</span>
          </div>
        ) : isError ? (
          <div className="bg-red-500/10 border border-red-500/30 text-red-600 rounded-xl p-8 flex flex-col items-center justify-center gap-4">
            <div className="flex items-center gap-2 text-lg">
              <AlertCircle className="w-6 h-6" />
              <span className="font-semibold">Đã có lỗi xảy ra khi tải hồ sơ</span>
            </div>
            <Button variant="outline" onClick={() => refetch()} className="border-red-500/30 text-red-600 hover:bg-red-500/10">
              Thử lại
            </Button>
          </div>
        ) : filteredCases?.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-muted-foreground gap-2 bg-muted/10 rounded-xl border border-border/50">
            <span className="text-sm">Chưa có hồ sơ trễ hạn.</span>
          </div>
        ) : (
          filteredCases?.map((delayCase) => (
            <DelayCaseCard key={delayCase.id} delayCase={delayCase} />
          ))
        )}
      </div>
    </div>
  );
}
