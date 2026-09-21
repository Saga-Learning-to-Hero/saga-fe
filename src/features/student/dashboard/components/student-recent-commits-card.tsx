"use client";

import Link from "next/link";
import { ExternalLinkIcon, GitCommitIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { studentCoursePath } from "@/features/student/courses/hooks/use-student-course-context";
import { cn } from "@/lib/utils";
import type { StudentDashboardRecentCommit } from "../types/student-dashboard-types";

interface StudentRecentCommitsCardProps {
  commits: StudentDashboardRecentCommit[];
  courseId: string;
}

export function StudentRecentCommitsCard({ commits, courseId }: StudentRecentCommitsCardProps) {
  return (
    <Card className="rounded-2xl border border-border/80 bg-card/90 shadow-xs flex flex-col">
      <CardHeader className="p-4 pb-2 border-b border-border/60 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-primary/10 text-primary">
            <GitCommitIcon className="size-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-bold">Nhật ký commit gần đây</CardTitle>
              {commits.length > 0 && (
                <Badge variant="secondary" className="font-mono text-[10px] px-1.5 py-0 h-4">
                  {commits.length}
                </Badge>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground">
              Các commit mới nhất của bạn trên GitHub repository
            </p>
          </div>
        </div>
        <Link
          href={studentCoursePath("/student/commits", courseId)}
          prefetch={true}
          className={cn(buttonVariants({ size: "sm", variant: "ghost" }), "text-xs h-8 gap-1")}
        >
          <span>Xem tất cả</span>
          <ExternalLinkIcon className="size-3" />
        </Link>
      </CardHeader>

      <CardContent className="p-4 flex-1 space-y-2.5 overflow-y-auto max-h-[380px] custom-scrollbar pr-2">
        {commits.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground space-y-2">
            <GitCommitIcon className="mx-auto size-7 text-muted-foreground/50" />
            <p className="text-xs">Chưa có commit nào được ghi nhận cho tài khoản của bạn.</p>
          </div>
        ) : (
          commits.map((commit) => {
            const formattedDate = new Date(commit.committedAt).toLocaleString("vi-VN", {
              timeZone: "Asia/Ho_Chi_Minh",
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <div
                key={commit.sha}
                className="p-3 rounded-xl border border-border/60 bg-muted/20 hover:bg-muted/40 transition-colors space-y-1.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                      {commit.shortSha || commit.sha.slice(0, 7)}
                    </span>
                    <Badge variant="outline" className="font-mono text-[10px] text-muted-foreground">
                      {commit.repositoryName}
                    </Badge>
                  </div>
                  <span className="font-mono text-[11px] text-muted-foreground">{formattedDate}</span>
                </div>

                <p className="text-xs text-foreground font-medium line-clamp-1" title={commit.message}>
                  {commit.message}
                </p>

                {commit.linkedTaskKeys && commit.linkedTaskKeys.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                    {commit.linkedTaskKeys.map((key) => (
                      <Badge
                        key={key}
                        variant="secondary"
                        className="font-mono text-[10px] px-1.5 py-0 bg-primary/15 text-primary border-primary/20"
                      >
                        {key}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
