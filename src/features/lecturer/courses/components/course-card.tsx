import Link from "next/link";
import { ArrowRightIcon, CalendarDaysIcon, MapPinIcon, MoreHorizontalIcon, UsersIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LecturerCourse } from "../types/course";

const toneStyles = {
  indigo: { bar: "bg-primary", badge: "bg-primary/10 text-primary", progress: "bg-primary" },
  cyan: { bar: "bg-saga-accent", badge: "bg-info-muted text-info", progress: "bg-saga-accent" },
  emerald: { bar: "bg-saga-success", badge: "bg-success-muted text-success", progress: "bg-saga-success" },
  amber: { bar: "bg-saga-warning", badge: "bg-warning-muted text-warning", progress: "bg-saga-warning" },
};

export function CourseCard({ course }: { course: LecturerCourse }) {
  const tone = toneStyles[course.tone];

  return (
    <Card className="relative gap-0 py-0 overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-saga-md">
      <div className={cn("absolute inset-y-0 left-0 w-1", tone.bar)} />
      <CardHeader className="px-5 pt-5 pb-0">
        <div className="flex items-center justify-between">
          <Badge className={cn("border-0 font-mono text-[10px] font-bold tracking-wider", tone.badge)}>{course.code}</Badge>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-muted-foreground" aria-label={`Tùy chọn lớp ${course.code}`}><MoreHorizontalIcon className="size-4" /></Button>
        </div>
        <h2 className="mt-3 line-clamp-1 text-base font-bold tracking-tight">{course.name}</h2>
        <p className="text-[11px] font-medium text-muted-foreground">Học kỳ {course.semesterId}</p>
      </CardHeader>

      <CardContent className="px-5 pt-4">
        <div className="flex flex-wrap gap-x-5 gap-y-2 border-t border-border pt-3.5 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1.5"><CalendarDaysIcon className="size-3.5" />{course.schedule}</span>
          <span className="flex items-center gap-1.5"><MapPinIcon className="size-3.5" />{course.room}</span>
        </div>

        <div className="mt-4 grid grid-cols-3 rounded-xl bg-muted/60 px-4 py-3">
          <div><strong className="block text-sm text-foreground">{course.studentCount}</strong><span className="text-[10px] text-muted-foreground">Sinh viên</span></div>
          <div className="border-x border-border px-4"><strong className="block text-sm text-foreground">{course.groupCount}</strong><span className="text-[10px] text-muted-foreground">Nhóm</span></div>
          <div className="text-right"><strong className="block text-sm text-foreground">{course.nextSession}</strong><span className="text-[10px] text-muted-foreground">Buổi tiếp theo</span></div>
        </div>

        <div className="mt-4">
          <div className="mb-2 flex justify-between text-[10px] font-medium text-muted-foreground"><span>Tiến độ học kỳ</span><span>{course.progress}%</span></div>
          <div className="h-1.5 overflow-hidden rounded-full bg-muted"><div className={cn("h-full rounded-full transition-all", tone.progress)} style={{ width: `${course.progress}%` }} /></div>
        </div>
      </CardContent>

      <CardFooter className="mt-5 border-t bg-muted/30 px-5 py-3">
        <Link
          href={`/lecturer/courses/${course.id}`}
          className={buttonVariants({ variant: "ghost", className: "h-8 w-full justify-between px-2 text-xs font-semibold text-foreground hover:text-primary" })}
        >
          <span className="flex items-center gap-2"><UsersIcon className="size-3.5" />Vào không gian lớp học</span><ArrowRightIcon className="size-3.5" />
        </Link>
      </CardFooter>
    </Card>
  );
}
