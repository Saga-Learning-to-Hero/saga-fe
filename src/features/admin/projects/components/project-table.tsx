"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  InboxIcon,
  ArrowRightIcon,
  CheckCircle2Icon,
  AlertCircleIcon,
  XCircleIcon,
} from "lucide-react";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { ManagedProject, ProjectStatus } from "../types/project-management";

interface ProjectTableProps {
  projects: ManagedProject[];
}

const ITEMS_PER_PAGE = 5;

export function ProjectTable({ projects }: ProjectTableProps) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(projects.length / ITEMS_PER_PAGE) || 1;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedProjects = projects.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase();
  };

  const renderIntegrationBadge = (p: ManagedProject) => {
    const isFullConnected = p.github.status === "CONNECTED" && p.jira.status === "CONNECTED";
    const isDisconnected = p.github.status === "DISCONNECTED" || p.jira.status === "DISCONNECTED";

    if (isFullConnected) {
      return (
        <Badge className="bg-success-muted text-success border-0 font-medium text-xs gap-1.5 px-2.5 py-1 whitespace-nowrap">
          <CheckCircle2Icon className="w-3.5 h-3.5" />
          Đã liên kết (Jira & GitHub)
        </Badge>
      );
    }
    if (isDisconnected) {
      return (
        <Badge className="bg-danger-muted text-danger border-0 font-medium text-xs gap-1.5 px-2.5 py-1 whitespace-nowrap">
          <XCircleIcon className="w-3.5 h-3.5" />
          Chưa kết nối đầy đủ
        </Badge>
      );
    }
    return (
      <Badge className="bg-warning-muted text-warning border-0 font-medium text-xs gap-1.5 px-2.5 py-1 whitespace-nowrap">
        <AlertCircleIcon className="w-3.5 h-3.5" />
        Mất tín hiệu Webhook
      </Badge>
    );
  };

  const renderProjectStatusBadge = (status: ProjectStatus) => {
    switch (status) {
      case "ACTIVE":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-success-muted text-success whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse shrink-0" />
            Đang tiến hành
          </span>
        );
      case "COMPLETED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary whitespace-nowrap">
            Hoàn thành
          </span>
        );
      case "AT_RISK":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-danger-muted text-danger whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-danger shrink-0" />
            Cảnh báo trễ
          </span>
        );
      case "PLANNED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-muted text-muted-foreground whitespace-nowrap">
            Chưa bắt đầu
          </span>
        );
    }
  };

  if (projects.length === 0) {
    return (
      <Card className="rounded-2xl border border-border shadow-xs">
        <CardContent className="p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mx-auto text-muted-foreground">
            <InboxIcon className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-semibold text-foreground">Không tìm thấy nhóm đồ án phù hợp</p>
            <p className="text-xs text-muted-foreground">
              Hãy thử thay đổi từ khóa tìm kiếm hoặc điều chỉnh lại bộ lọc học kỳ.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl border border-border overflow-hidden shadow-xs">
      <Table>
        <TableHeader className="bg-muted/40 border-b border-border">
          <TableRow className="hover:bg-transparent">
            <TableHead className="py-3.5 px-4 text-xs font-semibold">Nhóm đồ án & Mã đề tài</TableHead>
            <TableHead className="py-3.5 px-4 text-xs font-semibold whitespace-nowrap">Học kỳ</TableHead>
            <TableHead className="py-3.5 px-4 text-xs font-semibold whitespace-nowrap">Giảng viên HD</TableHead>
            <TableHead className="py-3.5 px-4 text-xs font-semibold whitespace-nowrap">Thành viên</TableHead>
            <TableHead className="py-3.5 px-4 text-xs font-semibold whitespace-nowrap">Tích hợp Webhook</TableHead>
            <TableHead className="py-3.5 px-4 text-xs font-semibold whitespace-nowrap text-center">Trạng thái</TableHead>
            <TableHead className="py-3.5 px-4 text-xs font-semibold whitespace-nowrap text-right">Chi tiết</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody className="divide-y divide-border/60">
          {paginatedProjects.map((prj) => (
            <TableRow
              key={prj.id}
              className="hover:bg-muted/30 transition-colors duration-100 group"
            >
              {/* Nhóm & Mã đề tài */}
              <TableCell className="py-3.5 px-4">
                <div className="flex flex-col gap-0.5">
                  <span className="font-bold text-foreground text-sm group-hover:text-primary transition-colors">
                    {prj.groupName}
                  </span>
                  <span className="text-xs font-mono text-muted-foreground font-medium">
                    {prj.topicCode}
                  </span>
                </div>
              </TableCell>

              {/* Học kỳ & Lớp */}
              <TableCell className="py-3.5 px-4 whitespace-nowrap">
                <div className="flex flex-col items-start gap-0.5">
                  <Badge variant="outline" className="text-xs font-medium border-border whitespace-nowrap">
                    {prj.semester}
                  </Badge>
                  <span className="text-[11px] font-mono text-muted-foreground">
                    {prj.courseCode}
                  </span>
                </div>
              </TableCell>

              {/* Giảng viên HD */}
              <TableCell className="py-3.5 px-4 whitespace-nowrap">
                <div className="flex items-center gap-2.5">
                  <Avatar className="w-8 h-8 rounded-lg shrink-0">
                    <AvatarImage src={prj.mentor.avatar} alt={prj.mentor.fullName} />
                    <AvatarFallback className="text-[10px] font-bold bg-primary text-primary-foreground">
                      {getInitials(prj.mentor.fullName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col min-w-0">
                    <span className="font-semibold text-foreground text-xs leading-tight">
                      {prj.mentor.fullName}
                    </span>
                    <span className="text-[11px] text-muted-foreground mt-0.5">
                      {prj.mentor.email}
                    </span>
                  </div>
                </div>
              </TableCell>

              {/* Thành viên */}
              <TableCell className="py-3.5 px-4 whitespace-nowrap">
                <span className="text-xs font-semibold text-foreground">
                  {prj.members.length} sinh viên
                </span>
              </TableCell>

              {/* Tích hợp Webhook */}
              <TableCell className="py-3.5 px-4 whitespace-nowrap">
                {renderIntegrationBadge(prj)}
              </TableCell>

              {/* Trạng thái */}
              <TableCell className="py-3.5 px-4 whitespace-nowrap text-center">
                {renderProjectStatusBadge(prj.status)}
              </TableCell>

              {/* Action: Link to dedicated page */}
              <TableCell className="py-3.5 px-4 text-right whitespace-nowrap">
                <Link
                  href={`/admin/projects/${prj.id}`}
                  className={buttonVariants({
                    variant: "outline",
                    size: "sm",
                    className: "h-8 px-3 text-xs font-medium rounded-lg gap-1.5 cursor-pointer shadow-2xs hover:border-primary hover:text-primary hover:bg-primary/5 transition-colors",
                  })}
                >
                  Xem trang
                  <ArrowRightIcon className="w-3.5 h-3.5" />
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Pagination Footer */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/20 text-xs text-muted-foreground">
        <span>
          Trang <strong className="text-foreground">{currentPage}</strong> / {totalPages} (Tổng {projects.length} nhóm đồ án)
        </span>
        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="icon"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="h-8 w-8 rounded-lg"
          >
            <ChevronLeftIcon className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="h-8 w-8 rounded-lg"
          >
            <ChevronRightIcon className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
