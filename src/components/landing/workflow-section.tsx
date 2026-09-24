"use client";

import {
  GitBranchIcon,
  NetworkIcon,
  PieChartIcon,
  BotIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

const quyTrinhCacBuoc = [
  {
    buoc: "01",
    tieuDe: "Khởi tạo & Tích hợp Công cụ",
    moTa: "Tạo dự án nhóm, kết nối GitHub Repository và Jira Workspace qua Webhooks tự động trong 60 giây.",
    icon: GitBranchIcon,
  },
  {
    buoc: "02",
    tieuDe: "Tự động Dựng Đồ thị Neo4j",
    moTa: "Mọi commit, pull request và task Jira được xâu chuỗi liên tục thành Đồ thị Truy xuất Traceability Graph.",
    icon: NetworkIcon,
  },
  {
    buoc: "03",
    tieuDe: "Giám sát Bất thường & AI Hub",
    moTa: "Tự động phát hiện MSR Anomaly (báo cáo khống), cô lập Ghosting qua SNA và đối soát chuẩn đầu ra CLO.",
    icon: BotIcon,
  },
  {
    buoc: "04",
    tieuDe: "Cổ phần Slicing Pie & Bảo vệ Đồ án",
    moTa: "Lượng hóa tỷ lệ đóng góp động theo 4 nhóm tiêu chí Code/Test/Doc/Research, sẵn sàng bảo vệ trước Hội đồng.",
    icon: PieChartIcon,
  },
];

export function WorkflowSection() {
  return (
    <section id="quy-trinh" className="py-20 border-t border-border/80 bg-background scroll-mt-20">
      <div className="max-w-6xl mx-auto px-6 space-y-12">
        <div className="text-center max-w-lg mx-auto space-y-2">
          <Badge variant="outline" className="text-primary border-primary/30 bg-primary/5 text-xs font-semibold">
            Quy trình Vận hành
          </Badge>
          <h2 className="text-3xl font-extrabold text-foreground tracking-tight">
            4 Bước Đơn giản để Đánh giá Minh bạch
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Từ khởi tạo tích hợp cho đến khi xuất báo cáo đối soát phục vụ bảo vệ đồ án tốt nghiệp.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {quyTrinhCacBuoc.map((item) => (
            <div
              key={item.buoc}
              className="rounded-2xl border border-border/80 bg-card p-5 space-y-4 hover:border-primary/40 transition-all shadow-xs flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-2xl font-black text-primary/30">
                  {item.buoc}
                </span>
                <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <item.icon className="w-4 h-4" />
                </div>
              </div>

              <div className="space-y-1.5">
                <h3 className="text-sm font-bold text-foreground">{item.tieuDe}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{item.moTa}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
