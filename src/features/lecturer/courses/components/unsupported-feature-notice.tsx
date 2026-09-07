"use client";

import Link from "next/link";
import { ConstructionIcon } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { lecturerCoursePath, lecturerCoursesPath } from "../lib/course-routes";
import { cn } from "@/lib/utils";

interface UnsupportedFeatureNoticeProps {
  title: string;
  description: string;
  courseId?: string;
}

export function UnsupportedFeatureNotice({
  title,
  description,
  courseId,
}: UnsupportedFeatureNoticeProps) {
  return (
    <Card className="mx-auto max-w-2xl rounded-2xl border border-dashed border-border p-8 text-center">
      <ConstructionIcon className="mx-auto mb-3 size-8 text-muted-foreground/50" />
      <h1 className="text-lg font-bold">{title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      <div className="mt-4 flex justify-center gap-2">
        {courseId && (
          <Link
            href={lecturerCoursePath(courseId)}
            prefetch={true}
            className={cn(buttonVariants({ size: "sm" }), "text-xs")}
          >
            Về không gian lớp
          </Link>
        )}
        <Link
          href={lecturerCoursesPath()}
          prefetch={true}
          className={cn(buttonVariants({ variant: "outline", size: "sm" }), "text-xs")}
        >
          Danh sách lớp
        </Link>
      </div>
    </Card>
  );
}
