"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { Settings2Icon, UsersIcon, RotateCcwIcon, AlertTriangleIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ContributionWeights } from "../types/course-weight-config";
import { WeightPreview } from "./weight-preview";
import { isWeightValid } from "../lib/weight-config-utils";

interface TeamWeightCardProps {
  teamId: string;
  teamName: string;
  projectName: string;
  memberCount: number;
  classWeights: ContributionWeights;
  weights?: ContributionWeights;
  onCustomize: (teamId: string) => void;
  onRemoveOverride: (teamId: string) => void;
}

export function TeamWeightCard({
  teamId,
  teamName,
  projectName,
  memberCount,
  classWeights,
  weights,
  onCustomize,
  onRemoveOverride
}: TeamWeightCardProps) {
  
  const isConfigured = !!weights;
  const effectiveWeights = weights || classWeights;
  const isValid = isWeightValid(effectiveWeights);
  
  // Calculate differences
  const diffCount = weights ? 
    Object.keys(weights).filter(k => weights[k as keyof ContributionWeights] !== classWeights[k as keyof ContributionWeights]).length
    : 0;
  
  return (
    <div className={cn(
      "p-4 rounded-xl border transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4",
      isConfigured ? 
        (isValid ? "bg-card border-primary/20 shadow-saga-sm" : "bg-destructive/5 border-destructive/30 shadow-saga-sm") 
        : "bg-muted/30 border-dashed border-border shadow-none"
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
            <Badge className="bg-primary/10 text-primary hover:bg-primary/15 border-primary/20 font-semibold shadow-none">
              Cấu hình riêng
            </Badge>
          ) : (
            <Badge variant="secondary" className="font-medium bg-muted text-muted-foreground hover:bg-muted">
              Kế thừa từ lớp
            </Badge>
          )}

          {!isValid && (
            <Badge variant="destructive" className="font-semibold shadow-none gap-1">
              <AlertTriangleIcon className="w-3 h-3" /> Tổng trọng số chưa bằng 100%
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <span className="truncate" title={projectName}>{projectName}</span>
          {isConfigured && diffCount > 0 && (
             <>
               <span>•</span>
               <span className="text-amber-600 dark:text-amber-400 text-xs">Khác lớp {diffCount} tiêu chí</span>
             </>
          )}
        </div>
        
        {/* Weight Text Row */}
        <div className="flex items-center gap-3 text-xs font-mono pt-1 flex-wrap">
          <span className="text-primary font-bold">
            CODE {effectiveWeights.CODE}%
          </span>
          <span className="text-muted-foreground/40">•</span>
          <span className="text-blue-500 font-bold">
            TEST {effectiveWeights.TEST}%
          </span>
          <span className="text-muted-foreground/40">•</span>
          <span className="text-amber-500 font-bold">
            DOCUMENT {effectiveWeights.DOCUMENT}%
          </span>
          <span className="text-muted-foreground/40">•</span>
          <span className="text-emerald-500 font-bold">
            RESEARCH {effectiveWeights.RESEARCH}%
          </span>
        </div>
      </div>

      {/* Right Actions & Preview */}
      <div className="flex flex-col sm:flex-row md:flex-col items-start sm:items-center md:items-end gap-3 shrink-0">
        <div className="w-full sm:w-48">
          <WeightPreview weights={effectiveWeights} />
        </div>
        <div className="flex items-center gap-2 mt-1 w-full sm:w-auto justify-end">
          {isConfigured ? (
            <>
              <AlertDialog>
                <AlertDialogTrigger render={<Button variant="outline" size="sm" className="text-muted-foreground" />}>
                  <RotateCcwIcon className="w-4 h-4 mr-1.5" />
                  Dùng lại cấu hình lớp
                </AlertDialogTrigger>
                <AlertDialogContent className="max-w-md bg-card">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Khôi phục cấu hình lớp?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Nhóm <strong>{teamName}</strong> sẽ mất cấu hình riêng và quay lại sử dụng cấu hình mặc định của lớp. Hành động này không thể hoàn tác.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Hủy bỏ</AlertDialogCancel>
                    <AlertDialogAction onClick={() => onRemoveOverride(teamId)}>Đồng ý khôi phục</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <Button variant="default" size="sm" onClick={() => onCustomize(teamId)} className={!isValid ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : ""}>
                <Settings2Icon className="w-4 h-4 mr-1.5" />
                Chỉnh sửa
              </Button>
            </>
          ) : (
            <Button variant="outline" size="sm" onClick={() => onCustomize(teamId)}>
              <Settings2Icon className="w-4 h-4 mr-1.5" />
              Tạo cấu hình riêng
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
