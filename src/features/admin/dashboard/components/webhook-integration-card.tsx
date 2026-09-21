import {
  ActivityIcon,
  AlertTriangleIcon,
  Clock3Icon,
  GitBranchIcon,
  InfoIcon,
  RadioTowerIcon,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  formatDashboardDateTime,
  getMissingServiceLabel,
} from "../lib/dashboard-format";
import type {
  AdminDashboardIntegrationPulse,
  AdminDashboardMissingService,
  AdminDashboardUnconnectedTeam,
} from "../types/dashboard";

interface WebhookIntegrationSectionProps {
  integrationPulse: AdminDashboardIntegrationPulse[];
  unconnectedTeams: AdminDashboardUnconnectedTeam[];
}

export function WebhookIntegrationSection({
  integrationPulse,
  unconnectedTeams,
}: WebhookIntegrationSectionProps) {
  return (
    <section
      aria-label="Tích hợp Jira GitHub và cảnh báo nhóm"
      className="grid grid-cols-1 gap-4 xl:grid-cols-12"
    >
      <Card className="rounded-2xl border-border/80 bg-card shadow-xs xl:order-2 xl:col-span-4">
        <CardHeader className="border-b border-border/60 p-4 pb-3">
          <div className="flex items-start gap-2.5">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <ActivityIcon className="size-5" />
            </div>
            <div>
              <CardTitle className="text-sm font-bold text-foreground">
                Webhook activity
              </CardTitle>
              <CardDescription className="text-[11px] text-muted-foreground">
                Unique deliveries trong 24 giờ và 7 ngày.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-3 p-4">
          {integrationPulse.map((pulse) => (
            <IntegrationPulseCard key={pulse.service} pulse={pulse} />
          ))}

          <div className="flex items-start gap-2 rounded-xl border border-primary/15 bg-primary/5 p-2.5 text-[10px] leading-4 text-muted-foreground">
            <InfoIcon className="mt-0.5 size-3 shrink-0 text-primary" />
            <span>
              Đây là số webhook đã nhận, không phải health check của Jira hoặc GitHub.
            </span>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden rounded-2xl border-border/80 bg-card shadow-xs xl:order-1 xl:col-span-8">
        <CardHeader className="border-b border-border/60 p-4 pb-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-warning-muted text-warning">
                <AlertTriangleIcon className="size-5" />
              </div>
              <div>
                <CardTitle className="text-sm font-bold text-foreground">
                  Nhóm chưa hoàn tất tích hợp
                </CardTitle>
                <CardDescription className="text-[11px] text-muted-foreground">
                  Nhóm chưa có project hoặc chưa kết nối đủ Jira và GitHub trong học kỳ đang chọn.
                </CardDescription>
              </div>
            </div>
            <Badge
              variant="outline"
              className="border-warning/40 text-[11px] text-warning"
            >
              {unconnectedTeams.length} nhóm
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="max-h-96 overflow-auto">
            <Table className="min-w-[760px] text-xs">
              <TableHeader className="sticky top-0 z-10 bg-muted/95 backdrop-blur">
                <TableRow>
                  <TableHead className="px-3.5 py-2.5">Nhóm</TableHead>
                  <TableHead className="px-3.5 py-2.5">Lớp học phần</TableHead>
                  <TableHead className="px-3.5 py-2.5">Giảng viên</TableHead>
                  <TableHead className="px-3.5 py-2.5">Thiếu cấu hình</TableHead>
                  <TableHead className="px-3.5 py-2.5 text-right">Thời gian chờ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {unconnectedTeams.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="h-28 text-center text-xs text-muted-foreground"
                    >
                      Tất cả nhóm trong học kỳ đã có project và kết nối đủ Jira, GitHub.
                    </TableCell>
                  </TableRow>
                ) : (
                  unconnectedTeams.map((team) => (
                    <TableRow key={team.teamId}>
                      <TableCell className="px-3.5 py-3">
                        <p className="font-semibold text-foreground">
                          Nhóm {team.teamNo} · {team.teamName}
                        </p>
                        <p className="mt-0.5 font-mono text-[10px] text-muted-foreground">
                          {team.teamId.slice(0, 8)}
                        </p>
                      </TableCell>
                      <TableCell className="px-3.5 py-3 font-mono text-[11px] text-muted-foreground">
                        {team.courseCode ?? "Chưa có mã lớp"}
                      </TableCell>
                      <TableCell className="px-3.5 py-3">
                        <p className="text-xs text-foreground">
                          {team.lecturerName ?? "Chưa phân công"}
                        </p>
                        {team.lecturerEmail ? (
                          <p className="mt-0.5 text-[10px] text-muted-foreground">
                            {team.lecturerEmail}
                          </p>
                        ) : null}
                      </TableCell>
                      <TableCell className="px-3.5 py-3">
                        <MissingServiceBadge service={team.missingService} />
                      </TableCell>
                      <TableCell className="px-3.5 py-3 text-right">
                        <span
                          className={
                            team.daysSinceCreated > 7
                              ? "font-mono font-semibold text-danger"
                              : "font-mono text-muted-foreground"
                          }
                        >
                          {team.daysSinceCreated} ngày
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

function IntegrationPulseCard({
  pulse,
}: {
  pulse: AdminDashboardIntegrationPulse;
}) {
  const isGithub = pulse.service === "GITHUB";
  const Icon = isGithub ? GitBranchIcon : RadioTowerIcon;

  return (
    <div className="rounded-xl border border-border/70 bg-muted/25 p-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-lg bg-background text-foreground shadow-xs">
            <Icon className="size-3.5" />
          </div>
          <span className="text-xs font-bold text-foreground">
            {isGithub ? "GitHub" : "Jira"}
          </span>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <div>
          <p className="text-[10px] text-muted-foreground">24 giờ qua</p>
          <p className="font-mono text-base font-bold text-foreground">
            {pulse.uniqueEventsReceived24h.toLocaleString("vi-VN")}
          </p>
        </div>
        <div>
          <p className="text-[10px] text-muted-foreground">7 ngày qua</p>
          <p className="font-mono text-base font-bold text-foreground">
            {pulse.uniqueEventsReceived7d.toLocaleString("vi-VN")}
          </p>
        </div>
      </div>
      <p className="mt-2 flex items-center gap-1.5 text-[10px] text-muted-foreground">
        <Clock3Icon className="size-3" />
        Gần nhất: {formatDashboardDateTime(pulse.lastUniqueEventAt)}
      </p>
    </div>
  );
}

function MissingServiceBadge({
  service,
}: {
  service: AdminDashboardMissingService;
}) {
  const className =
    service === "PROJECT" || service === "BOTH"
      ? "bg-danger-muted text-danger"
      : service === "JIRA"
        ? "bg-warning-muted text-warning"
        : "bg-info-muted text-info";

  return (
    <Badge className={`border-0 text-[10px] font-semibold ${className}`}>
      {getMissingServiceLabel(service)}
    </Badge>
  );
}
