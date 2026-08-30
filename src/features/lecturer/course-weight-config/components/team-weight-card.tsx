"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Settings2Icon, UsersIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ContributionWeights } from "../types/course-weight-config";
import { WeightPreview } from "./weight-preview";

interface TeamWeightCardProps {
  teamId: string;
  teamName: string;
  projectName: string;
  memberCount: number;
  weights?: ContributionWeights;
  onCustomize: (teamId: string) => void;
}

export function TeamWeightCard({
  teamId,
  teamName,
  projectName,
  memberCount,
  weights,
  onCustomize,
}: TeamWeightCardProps) {
  
  const isConfigured = !!weights;
  
  return (
    <div className={cn(
      "p-4 rounded-xl border transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4",
      isConfigured ? "bg-card border-primary/20 shadow-saga-sm" : "bg-muted/30 border-dashed border-border shadow-none"
    )}>
      {/* Left info */}
      <div className="space-y-2 flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="font-bold text-base truncate text-foreground">{teamName}</h3>
          <Badge variant="outline" className="font-normal text-xs bg-background">
            <UsersIcon className="w-3 h-3 mr-1" />
            {memberCount} thành viên
          </Badge>
          {isConfigured ? (
            <Badge className="bg-success-muted text-success hover:bg-success-muted border-success/20 font-semibold shadow-none">
              Đã cấu hình
            </Badge>
          ) : (
            <Badge variant="secondary" className="font-medium bg-muted-foreground/10 text-muted-foreground hover:bg-muted-foreground/10">
              Chưa cấu hình
            </Badge>
          )}
        </div>
        <p className="text-sm font-medium text-muted-foreground truncate" title={projectName}>
          {projectName}
        </p>
        
        {/* Weight Text Row */}
        {weights && (
          <div className="flex items-center gap-3 text-xs font-mono pt-1 flex-wrap">
            <span className="text-primary font-bold">
              CODE {weights.CODE}%
            </span>
            <span className="text-muted-foreground/40">•</span>
            <span className="text-blue-500 font-bold">
              TEST {weights.TEST}%
            </span>
            <span className="text-muted-foreground/40">•</span>
            <span className="text-amber-500 font-bold">
              DOCUMENT {weights.DOCUMENT}%
            </span>
            <span className="text-muted-foreground/40">•</span>
            <span className="text-emerald-500 font-bold">
              RESEARCH {weights.RESEARCH}%
            </span>
          </div>
        )}
      </div>

      {/* Right Actions & Preview */}
      <div className="flex flex-col sm:flex-row md:flex-col items-start sm:items-center md:items-end gap-3 shrink-0">
        <div className="w-full sm:w-48">
          {weights ? (
            <WeightPreview weights={weights} />
          ) : (
            <div className="w-full h-3 bg-muted rounded-full" />
          )}
        </div>
        <div className="flex items-center gap-2 mt-1 w-full sm:w-auto justify-end">
          <Button variant={isConfigured ? "outline" : "default"} size="sm" onClick={() => onCustomize(teamId)} className={isConfigured ? "border-primary/20 hover:bg-primary/5" : ""}>
            <Settings2Icon className={cn("w-4 h-4 mr-1.5", isConfigured && "text-primary")} />
            {isConfigured ? "Chỉnh sửa" : "Cấu hình"}
          </Button>
        </div>
      </div>
    </div>
  );
}
