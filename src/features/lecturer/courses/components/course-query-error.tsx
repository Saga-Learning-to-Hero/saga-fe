"use client";

import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { lecturerCoursesPath } from "../lib/course-routes";
import { getApiErrorMessage } from "@/lib/api-error";
import { cn } from "@/lib/utils";

interface CourseQueryErrorProps {
  title: string;
  error: unknown;
  onRetry?: () => void;
}

export function CourseQueryError({ title, error, onRetry }: CourseQueryErrorProps) {
  return (
    <Card className="rounded-2xl border border-dashed border-destructive/30 p-8 text-center">
      <p className="text-sm font-semibold">{title}</p>
      <p className="mt-1 text-xs text-muted-foreground">
        {getApiErrorMessage(error, "Vui lòng thử lại hoặc quay lại danh sách lớp.")}
      </p>
      <div className="mt-4 flex justify-center gap-2">
        {onRetry && (
          <Button size="sm" variant="outline" className="cursor-pointer text-xs" onClick={onRetry}>
            Thử lại
          </Button>
        )}
        <Link
          href={lecturerCoursesPath()}
          prefetch={true}
          className={cn(buttonVariants({ size: "sm" }), "text-xs")}
        >
          Quay lại danh sách lớp
        </Link>
      </div>
    </Card>
  );
}
