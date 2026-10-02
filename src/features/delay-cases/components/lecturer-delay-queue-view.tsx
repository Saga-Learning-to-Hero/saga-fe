"use client";

import { useState } from "react";
import { useLecturerDelayQueue } from "../hooks/use-delay-cases";
import { DelayCaseCard } from "./delay-case-card";
import { Loader2, AlertCircle, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CustomSelect } from "@/components/common/custom-select";

export function LecturerDelayQueueView() {
  const [filter, setFilter] = useState("AWAITING_LECTURER");

  const queryParams = (() => {
    switch (filter) {
      case "AWAITING_LECTURER":
        return { status: "AWAITING_LECTURER" };
      case "OBJECTIVE":
        return { status: "CLOSED_OBJECTIVE" };
      case "SUBJECTIVE":
        return { status: "CLOSED_SUBJECTIVE" };
      case "CLOSED_ALL":
        return { status: ["CLOSED_OBJECTIVE", "CLOSED_SUBJECTIVE"] };
      default:
        return { status: "AWAITING_LECTURER" };
    }
  })();

  const { data: delayCases, isLoading, isError, refetch, isRefetching } = useLecturerDelayQueue(queryParams);

  const filterOptions = [
    { value: "AWAITING_LECTURER", label: "Chờ tôi duyệt" },
    { value: "OBJECTIVE", label: "Đã duyệt - Khách quan" },
    { value: "SUBJECTIVE", label: "Đã duyệt - Chủ quan" },
    { value: "CLOSED_ALL", label: "Tất cả hồ sơ đã đóng" },
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] p-4 sm:p-6 lg:p-8 max-w-[1200px] mx-auto w-full gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0 mb-2">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            Hồ sơ trễ hạn
            {isRefetching && <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Hàng chờ kiểm duyệt các yêu cầu trễ hạn từ sinh viên xuyên suốt các lớp bạn phụ trách.
          </p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <div className="w-full sm:w-[250px]">
            <CustomSelect
              id="lecturer-delay-queue-filter"
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
        ) : delayCases?.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-muted-foreground gap-2 bg-muted/10 rounded-xl border border-border/50">
            <span className="text-sm">Chưa có hồ sơ trễ hạn.</span>
          </div>
        ) : (
          delayCases?.map((delayCase) => (
            <DelayCaseCard key={delayCase.id} delayCase={delayCase} />
          ))
        )}
      </div>
    </div>
  );
}
