"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { SearchIcon, UsersIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useLecturerRoster } from "../hooks/use-lecturer-courses";
import { CourseQueryError } from "./course-query-error";

interface CourseRosterProps {
  courseId: string;
}

export function CourseRoster({ courseId }: CourseRosterProps) {
  const { data, isLoading, isError, error, refetch } = useLecturerRoster(courseId);
  const [searchQuery, setSearchQuery] = useState("");
  const deferredQuery = useDeferredValue(searchQuery);

  const entries = useMemo(() => data?.entries ?? [], [data?.entries]);
  const filteredEntries = useMemo(() => {
    const query = deferredQuery.toLowerCase().trim();
    if (!query) return entries;
    return entries.filter((entry) =>
      `${entry.studentCode} ${entry.fullName} ${entry.email} ${entry.classCode}`
        .toLowerCase()
        .includes(query)
    );
  }, [entries, deferredQuery]);

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="h-9 w-64 animate-pulse rounded-xl bg-muted" />
        <div className="h-64 animate-pulse rounded-2xl bg-muted/60" />
      </div>
    );
  }

  if (isError) {
    return (
      <CourseQueryError
        title="Không tải được danh sách sinh viên đang học"
        error={error}
        onRetry={() => void refetch()}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-bold text-foreground">Danh sách sinh viên đang học</h2>
          <p className="text-xs text-muted-foreground">
            Chỉ sinh viên đã hoàn tất ghi danh. Đây là nguồn duy nhất để kiểm tra trước khi phân nhóm.
          </p>
        </div>
        <Badge
          variant="outline"
          className="w-fit border-emerald-500/30 bg-emerald-500/15 font-mono text-xs text-emerald-600 dark:text-emerald-400"
        >
          {data?.enrolledCount ?? 0} sinh viên
        </Badge>
      </div>

      <div className="relative w-full sm:max-w-sm">
        <SearchIcon className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Tìm mã sinh viên, họ tên, email..."
          className="h-9 rounded-xl pl-9 text-xs"
        />
      </div>

      {entries.length === 0 ? (
        <Card className="rounded-2xl border border-dashed border-border p-8 text-center">
          <UsersIcon className="mx-auto mb-3 size-8 text-muted-foreground/40" />
          <p className="text-sm font-semibold">Chưa có sinh viên đang học trong lớp</p>
          <p className="mx-auto mt-1 max-w-md text-xs text-muted-foreground">
            Cần sinh viên hoàn tất đăng ký hoặc nhận lời mời trước khi có thể phân nhóm. Giảng viên
            không thêm sinh viên từ màn hình này.
          </p>
        </Card>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border bg-card">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead className="text-xs font-bold">Mã SV</TableHead>
                <TableHead className="sticky left-0 z-10 bg-muted/40 text-xs font-bold">Họ và tên</TableHead>
                <TableHead className="text-xs font-bold">Email</TableHead>
                <TableHead className="text-xs font-bold">Lớp sinh viên niên khóa</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEntries.map((entry) => (
                <TableRow key={entry.courseEnrollmentId}>
                  <TableCell className="font-mono text-xs font-bold">{entry.studentCode}</TableCell>
                  <TableCell className="sticky left-0 z-10 bg-card text-xs font-medium">{entry.fullName}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {entry.email}
                  </TableCell>
                  <TableCell className="font-mono text-xs">{entry.classCode}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredEntries.length === 0 && (
            <p className="p-4 text-center text-xs text-muted-foreground">
              Không có sinh viên khớp từ khóa tìm kiếm.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
