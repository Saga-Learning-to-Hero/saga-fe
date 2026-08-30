"use client";

import { useState } from "react";
import { SlidersIcon, InfoIcon, RotateCcwIcon } from "lucide-react";
import type { WeightConfig } from "../types/contribution";
import { DEFAULT_WEIGHT_CONFIG } from "../data/mock-contribution-data";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ContributionWeightSimulatorProps {
  onWeightChange: (weights: WeightConfig) => void;
}

export function ContributionWeightSimulator({ onWeightChange }: ContributionWeightSimulatorProps) {
  const [weights, setWeights] = useState<WeightConfig>(DEFAULT_WEIGHT_CONFIG);

  const handleSliderChange = (key: keyof WeightConfig, value: number) => {
    const updated = { ...weights, [key]: value };
    setWeights(updated);
    onWeightChange(updated);
  };

  const handleReset = () => {
    setWeights(DEFAULT_WEIGHT_CONFIG);
    onWeightChange(DEFAULT_WEIGHT_CONFIG);
  };

  const totalSum = weights.codeWeight + weights.tasksWeight + weights.peerWeight + weights.traceabilityWeight;

  return (
    <Card className="rounded-2xl border border-border/80 shadow-2xs bg-card overflow-hidden">
      <CardHeader className="p-4 sm:p-5 pb-3 border-b border-border/60">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
              <SlidersIcon className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-sm sm:text-base font-bold text-foreground">
                Trình Mô phỏng Trọng số Tính điểm Minh bạch (Slicing Pie Calculator)
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Thử nghiệm thay đổi tỷ trọng giữa các nguồn dữ liệu để xem kết quả đóng góp thời gian thực
              </CardDescription>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="h-8 text-xs font-bold rounded-xl gap-1.5 cursor-pointer shadow-2xs self-start sm:self-auto"
          >
            <RotateCcwIcon className="w-3.5 h-3.5" />
            Đặt lại mặc định
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-5 space-y-5">
        {/* Sliders Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* 1. Code Weight */}
          <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/60 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-foreground">1. Mã nguồn (GitHub Commits)</span>
              <span className="font-mono font-extrabold text-primary">{weights.codeWeight}%</span>
            </div>
            <input
              type="range"
              min={10}
              max={60}
              step={5}
              value={weights.codeWeight}
              onChange={(e) => handleSliderChange("codeWeight", Number(e.target.value))}
              className="w-full accent-primary cursor-pointer"
            />
            <p className="text-[10px] text-muted-foreground">
              Tính theo số commits và dòng code + / -
            </p>
          </div>

          {/* 2. Jira Tasks Weight */}
          <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/60 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-foreground">2. Đầu việc Jira (Story Points)</span>
              <span className="font-mono font-extrabold text-blue-600">{weights.tasksWeight}%</span>
            </div>
            <input
              type="range"
              min={10}
              max={50}
              step={5}
              value={weights.tasksWeight}
              onChange={(e) => handleSliderChange("tasksWeight", Number(e.target.value))}
              className="w-full accent-blue-500 cursor-pointer"
            />
            <p className="text-[10px] text-muted-foreground">
              Tính theo Story Points task đã hoàn thành
            </p>
          </div>

          {/* 3. Peer Assessment Weight */}
          <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/60 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-foreground">3. Đánh giá Chéo (Peer Review)</span>
              <span className="font-mono font-extrabold text-amber-500">{weights.peerWeight}%</span>
            </div>
            <input
              type="range"
              min={5}
              max={40}
              step={5}
              value={weights.peerWeight}
              onChange={(e) => handleSliderChange("peerWeight", Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
            <p className="text-[10px] text-muted-foreground">
              Điểm đánh giá từ 4 đồng đội trong nhóm
            </p>
          </div>

          {/* 4. Traceability Weight */}
          <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/60 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-foreground">4. Độ Ma vết (Traceability)</span>
              <span className="font-mono font-extrabold text-emerald-500">{weights.traceabilityWeight}%</span>
            </div>
            <input
              type="range"
              min={5}
              max={30}
              step={5}
              value={weights.traceabilityWeight}
              onChange={(e) => handleSliderChange("traceabilityWeight", Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
            <p className="text-[10px] text-muted-foreground">
              Tỷ lệ liên kết 1-1 giữa Task và Commit
            </p>
          </div>
        </div>

        {/* Formula Explanation Note */}
        <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/30 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <InfoIcon className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
            <span className="text-foreground font-medium">
              Tổng trọng số cấu thành công thức: <strong className="font-mono font-bold text-purple-600">{totalSum}%</strong>
            </span>
          </div>

          <span className="text-[11px] text-muted-foreground italic">
            Công thức được giảng viên &amp; hội đồng phê duyệt để đảm bảo công bằng khi chấm điểm đồ án.
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
