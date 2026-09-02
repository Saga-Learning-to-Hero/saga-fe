"use client";

import { CheckCircle2Icon, AlertTriangleIcon, ActivityIcon } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import type { IntegrationServiceStatus, UnconnectedGroupAlert } from "../types/dashboard";

interface WebhookIntegrationSectionProps {
  integrations: IntegrationServiceStatus[];
  unconnectedGroups: UnconnectedGroupAlert[];
}

export function WebhookIntegrationSection({
  integrations,
  unconnectedGroups,
}: WebhookIntegrationSectionProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card className="rounded-2xl border border-border shadow-xs bg-card lg:col-span-1 flex flex-col justify-between">
        <CardHeader className="p-4 pb-3 border-b border-border/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <ActivityIcon className="w-4 h-4" />
              </div>
              <div>
                <CardTitle className="text-sm font-bold text-foreground">
                  Trạng thái Webhook & APIs
                </CardTitle>
                <CardDescription className="text-[11px] text-muted-foreground">
                  Kết nối Jira Cloud & GitHub Webhooks
                </CardDescription>
              </div>
            </div>
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-success"></span>
            </span>
          </div>
        </CardHeader>

        <CardContent className="p-4 space-y-3 flex-1 flex flex-col justify-around">
          {integrations.map((svc) => (
            <div
              key={svc.service}
              className="p-3 rounded-xl bg-muted/30 border border-border/60 space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-foreground">{svc.name}</span>
                </div>
                <Badge className="bg-success-muted text-success border-0 text-[10px] font-semibold flex items-center gap-1">
                  <CheckCircle2Icon className="w-3 h-3" />
                  Sẵn sàng (Operational)
                </Badge>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-1 text-[11px]">
                <div>
                  <p className="text-muted-foreground text-[10px]">Độ trễ (Latency)</p>
                  <p className="font-mono font-bold text-foreground">{svc.latencyMs} ms</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-[10px]">Events (24h)</p>
                  <p className="font-mono font-bold text-foreground">{svc.eventsProcessed24h}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-[10px]">Thành công</p>
                  <p className="font-mono font-bold text-success">{svc.successRate}%</p>
                </div>
              </div>
            </div>
          ))}

          <div className="p-2.5 rounded-xl bg-primary/5 border border-primary/15 text-[11px] text-muted-foreground flex items-center gap-2">
            <span className="text-primary font-bold">Lưu ý:</span>
            <span>Dữ liệu được cập nhật tự động khi Backend nhận Webhook mới.</span>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border border-border shadow-xs bg-card lg:col-span-2">
        <CardHeader className="p-4 pb-3 border-b border-border/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-warning-muted flex items-center justify-center text-warning">
                <AlertTriangleIcon className="w-4 h-4" />
              </div>
              <div>
                <CardTitle className="text-sm font-bold text-foreground">
                  Cảnh báo tích hợp Workspace (Integration Alerts)
                </CardTitle>
                <CardDescription className="text-[11px] text-muted-foreground">
                  Danh sách lớp học phần / nhóm chưa hoàn tất liên kết Jira hoặc GitHub
                </CardDescription>
              </div>
            </div>
            <Badge variant="outline" className="text-xs text-warning border-warning/40">
              {unconnectedGroups.length} nhóm cần rà soát
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table className="w-full text-left text-xs border-collapse">
              <TableHeader className="bg-muted/40 border-b border-border">
                <TableRow>
                  <TableHead className="py-2.5 px-3.5 text-xs font-semibold w-[70px]">Mã nhóm</TableHead>
                  <TableHead className="py-2.5 px-3.5 text-xs font-semibold min-w-[200px]">Tên đề tài</TableHead>
                  <TableHead className="py-2.5 px-3.5 text-xs font-semibold whitespace-nowrap w-[150px]">GV Hướng dẫn</TableHead>
                  <TableHead className="py-2.5 px-3.5 text-xs font-semibold whitespace-nowrap w-[130px]">Dịch vụ thiếu</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-border/60">
                {unconnectedGroups.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground text-xs">
                      Tất cả các nhóm đồ án đã kết nối đầy đủ Jira & GitHub!
                    </TableCell>
                  </TableRow>
                ) : (
                  unconnectedGroups.map((grp) => (
                    <TableRow key={grp.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="py-2.5 px-3.5 font-mono font-bold text-foreground">
                        <Badge variant="outline" className="font-mono text-[11px] border-primary/30 text-primary">
                          {grp.groupCode}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-2.5 px-3.5 font-medium text-foreground text-xs truncate max-w-[240px]">
                        {grp.projectName}
                      </TableCell>
                      <TableCell className="py-2.5 px-3.5 text-muted-foreground whitespace-nowrap text-xs">
                        {grp.mentorName}
                      </TableCell>
                      <TableCell className="py-2.5 px-3.5 whitespace-nowrap">
                        {grp.missingService === "BOTH" && (
                          <Badge className="bg-danger-muted text-danger border-0 text-[10px] font-semibold">
                            Chưa nối cả 2
                          </Badge>
                        )}
                        {grp.missingService === "JIRA" && (
                          <Badge className="bg-warning-muted text-warning border-0 text-[10px] font-semibold">
                            Thiếu Jira
                          </Badge>
                        )}
                        {grp.missingService === "GITHUB" && (
                          <Badge className="bg-info-muted text-info border-0 text-[10px] font-semibold">
                            Thiếu GitHub
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
