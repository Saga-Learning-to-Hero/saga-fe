"use client";

import { useState } from "react";
import { useLecturerDelayQueue } from "../hooks/use-delay-cases";
import { DelayCaseCard } from "./delay-case-card";
import { Loader2, AlertCircle, Filter, Inbox, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CustomSelect } from "@/components/common/custom-select";
import { Badge } from "@/components/ui/badge";

export function LecturerDelayQueueView() {
  const [filter, setFilter] = useState("PENDING_LECTURER_REVIEW");

  const queryParams = (() => {
    switch (filter) {
      case "PENDING_LECTURER_REVIEW":
        return { status: "PENDING_LECTURER_REVIEW" };
      case "EXCUSED":
        return { status: "CLOSED_EXCUSED" };
      case "REJECTED":
        return { status: "CLOSED_REJECTED" };
      case "CLOSED_ALL":
        return { status: ["CLOSED_EXCUSED", "CLOSED_REJECTED"] };
      default:
        return { status: "PENDING_LECTURER_REVIEW" };
    }
  })();

  const { data: delayCases, isLoading, isError, refetch, isRefetching } = useLecturerDelayQueue(queryParams);

  const filterOptions = [
    { value: "PENDING_LECTURER_REVIEW", label: "Chờ tôi duyệt" },
    { value: "EXCUSED", label: "Đã duyệt - Châm chước" },
    { value: "REJECTED", label: "Đã duyệt - Từ chối" },
    { value: "CLOSED_ALL", label: "Tất cả hồ sơ đã đóng" },
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto w-full gap-6">
      {/* Premium Header Area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 shrink-0 bg-card p-6 rounded-2xl border border-border/60 shadow-sm relative overflow-hidden">
        {/* Subtle background pattern/gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent pointer-events-none" />
        
        <div className="relative z-10 space-y-1.5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 rounded-xl">
              <AlertCircle className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center gap-3">
              Hồ sơ trễ hạn
              {delayCases && !isLoading && (
                <Badge variant="secondary" className="bg-primary/15 text-primary text-sm px-2.5 py-0.5 rounded-full font-bold border-none">
                  {delayCases.length} hồ sơ
                </Badge>
              )}
              {isRefetching && <Loader2 className="w-5 h-5 animate-spin text-muted-foreground ml-2" />}
            </h1>
          </div>
          <p className="text-muted-foreground font-medium max-w-xl text-sm sm:text-base">
            Quản lý và xét duyệt các hồ sơ giải trình trễ hạn từ sinh viên xuyên suốt tất cả các lớp học phần bạn đang phụ trách.
          </p>
        </div>

        <div className="relative z-10 flex items-center w-full md:w-auto shrink-0 bg-background p-1.5 rounded-xl border border-border/60 shadow-sm">
          <div className="pl-3 pr-2 py-2 flex items-center justify-center border-r border-border/50">
            <Filter className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="w-full md:w-[260px] pl-1">
            <CustomSelect
              id="lecturer-delay-queue-filter"
              value={filter}
              onChange={setFilter}
              options={filterOptions}
            />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto min-h-0 pr-2 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-4 bg-card/40 rounded-2xl border border-dashed border-border/60 min-h-[400px]">
            <div className="p-4 bg-muted/30 rounded-2xl animate-pulse">
              <Loader2 className="w-10 h-10 animate-spin text-primary/60" />
            </div>
            <span className="font-semibold text-lg">Đang tải danh sách hồ sơ...</span>
            <span className="text-sm">Vui lòng chờ trong giây lát</span>
          </div>
        ) : isError ? (
          <div className="bg-red-500/5 border border-red-500/20 rounded-2xl min-h-[400px] flex flex-col items-center justify-center gap-5 p-8 shadow-sm">
            <div className="p-4 bg-red-500/10 rounded-2xl">
              <AlertCircle className="w-10 h-10 text-red-600" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="font-bold text-xl text-red-700 dark:text-red-400">Không thể tải dữ liệu</h3>
              <p className="text-red-600/80 dark:text-red-400/80">Đã có lỗi hệ thống xảy ra. Vui lòng thử lại sau.</p>
            </div>
            <Button variant="outline" onClick={() => refetch()} className="border-red-500/30 text-red-600 hover:bg-red-500/10 hover:text-red-700 rounded-xl px-6">
              Thử lại ngay
            </Button>
          </div>
        ) : delayCases?.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-5 bg-card/40 rounded-2xl border border-dashed border-border/60 min-h-[400px] shadow-sm">
            <div className="p-5 bg-emerald-500/10 rounded-full border border-emerald-500/20">
              {filter === "PENDING_LECTURER_REVIEW" ? (
                <CheckCircle2 className="w-12 h-12 text-emerald-500" />
              ) : (
                <Inbox className="w-12 h-12 text-muted-foreground" />
              )}
            </div>
            <div className="text-center max-w-sm space-y-1.5">
              <h3 className="font-bold text-xl text-foreground">
                {filter === "PENDING_LECTURER_REVIEW" ? "Tuyệt vời, không có hồ sơ tồn đọng!" : "Trống rỗng"}
              </h3>
              <p className="text-muted-foreground text-sm">
                {filter === "PENDING_LECTURER_REVIEW"
                  ? "Tất cả các hồ sơ giải trình đã được xem xét và xử lý xong."
                  : "Không tìm thấy hồ sơ nào khớp với bộ lọc hiện tại của bạn."}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 pb-8">
            {delayCases?.map((delayCase) => (
              <DelayCaseCard key={delayCase.id} delayCase={delayCase} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
