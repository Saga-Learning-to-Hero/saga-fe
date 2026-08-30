"use client";

import {
  CheckCircleIcon,
  GitBranchIcon,
  NetworkIcon,
  PieChartIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

const quyTrinhCacBuoc = [
  {
    buoc: "01",
    tieuDe: "Cài đặt Webhook",
    moTa: "Kết nối GitHub Repo và Jira Project của học phần trong 60 giây.",
    icon: GitBranchIcon,
  },
  {
    buoc: "02",
    tieuDe: "Tự động Dựng Đồ thị",
    moTa: "Mọi commit, PR và task được ánh xạ liên tục lên đồ thị Neo4j.",
    icon: NetworkIcon,
  },
  {
    buoc: "03",
    tieuDe: "Đo lường Slicing Pie",
    moTa: "Định lượng % công sức thực tế theo từng Sprint học phần.",
    icon: PieChartIcon,
  },
  {
    buoc: "04",
    tieuDe: "Đánh giá Liên tục",
    moTa: "Giảng viên và sinh viên nắm bắt năng lực thực tế tức thì.",
    icon: CheckCircleIcon,
  },
];

export function WorkflowSection() {
  return (
    <section id="quy-trinh" className="py-20 border-t border-border/80 bg-background scroll-mt-20">
      <div className="max-w-6xl mx-auto px-6 space-y-12">
        <div className="text-center max-w-lg mx-auto space-y-2">
          <Badge variant="outline" className="text-primary border-primary/30 bg-primary/5 text-xs">
            Quy trình
          </Badge>
          <h2 className="text-3xl font-extrabold text-foreground tracking-tight">
            Vận hành trong 4 Bước Đơn giản
          </h2>
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
