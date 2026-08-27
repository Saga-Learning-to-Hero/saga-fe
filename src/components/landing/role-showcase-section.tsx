"use client";

import { useState } from "react";
import {
  CheckCircle2Icon,
  GraduationCapIcon,
  PieChartIcon,
  ScaleIcon,
  ShieldAlertIcon,
  ShieldCheckIcon,
  SparklesIcon,
  UserCheckIcon,
  UsersIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

const roles = [
  {
    id: "student",
    title: "Dành cho Sinh viên",
    icon: GraduationCapIcon,
    badge: "Bảo vệ Công sức",
    headline: "Được công nhận đúng năng lực, không sợ bị cướp công",
    description: "Mọi dòng code, bài kiểm thử và tài liệu bạn hoàn thành đều được tự động lưu vào đồ thị đóng góp cá nhân minh bạch.",
    highlights: [
      "Điểm số Slicing Pie phản ánh 100% công sức thực tế",
      "Không còn tình trạng một người gánh team cả nhóm hưởng lợi",
      "Theo dõi tiến độ và nhận cảnh báo cá nhân trước mỗi đợt review",
    ],
    previewTitle: "Bảng Chỉ số Đóng góp Cá nhân",
    previewMetric: "28.5% Tỷ lệ Công sức",
    previewDetail: "Ghi nhận 64 Commits · 18 Jira Tasks hoàn tất",
  },
  {
    id: "lecturer",
    title: "Dành cho Giảng viên",
    icon: UsersIcon,
    badge: "Tiết kiệm 80% Thời gian",
    headline: "Giám sát toàn diện hàng chục nhóm học phần trong 30 giây",
    description: "Không cần tự mình mở từng pull request hay tra soát hàng trăm commit. SAGA tự động tổng hợp bức tranh toàn cảnh.",
    highlights: [
      "Cảnh báo tự động thành viên có nguy cơ bỏ nhóm (Ghosting)",
      "So sánh trực quan mức độ cân bằng công việc giữa các thành viên",
      "Xuất báo cáo định lượng phục vụ chấm điểm từng Sprint",
    ],
    previewTitle: "Radar Giám sát Đồ án Học phần",
    previewMetric: "32 Nhóm Đang Theo dõi",
    previewDetail: "Phát hiện 2 nhóm có rủi ro thành viên thụ động",
  },
  {
    id: "council",
    title: "Hội đồng & Quản trị",
    icon: ScaleIcon,
    badge: "Chuẩn mực Khách quan",
    headline: "Căn cứ khoa học chuẩn xác để bảo vệ điểm số công bằng",
    description: "Triệt tiêu hoàn toàn sự tranh cãi hay khiếu nại điểm số nhờ hệ thống dữ liệu truy vết kỹ thuật không thể chỉnh sửa ngược.",
    highlights: [
      "Bằng chứng số liệu đối chiếu chi tiết đến từng file và task",
      "Nhật ký kiểm toán an ninh bảo đảm tính toàn vẹn dữ liệu",
      "Chuẩn hóa quy trình đánh giá đồ án công nghệ thông tin",
    ],
    previewTitle: "Báo cáo Kiểm định Chất lượng",
    previewMetric: "100% Khách quan",
    previewDetail: "Được bảo chứng bởi chuỗi Webhook Git & Jira",
  },
];

export function RoleShowcaseSection() {
  const [activeTab, setActiveTab] = useState(0);
  const currentRole = roles[activeTab];

  return (
    <section id="goc-nhin" className="py-24 border-t border-border/80 bg-background scroll-mt-20">
      <div className="max-w-6xl mx-auto px-6 space-y-12">
        <div className="text-center space-y-2.5 max-w-xl mx-auto">
          <Badge variant="outline" className="text-primary border-primary/30 bg-primary/5 text-xs">
            Góc nhìn Toàn diện
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
            Giải pháp cho Mọi Đối tượng
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
            Từ sinh viên làm đồ án đến giảng viên và hội đồng nghiệm thu.
          </p>
        </div>

        <div className="flex justify-center">
          <div className="inline-flex p-1.5 rounded-2xl bg-muted/60 border border-border/80 gap-1.5">
            {roles.map((role, idx) => (
              <button
                key={role.id}
                onClick={() => setActiveTab(idx)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  activeTab === idx
                    ? "bg-card text-foreground shadow-xs border border-border"
                    : "text-muted-foreground hover:text-foreground hover:bg-card/50"
                }`}
              >
                <role.icon className={`w-4 h-4 ${activeTab === idx ? "text-primary" : "text-muted-foreground"}`} />
                {role.title}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-border/80 bg-card p-6 sm:p-10 shadow-lg grid lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-semibold">
              <SparklesIcon className="w-3.5 h-3.5" />
              {currentRole.badge}
            </div>

            <div className="space-y-3">
              <h3 className="text-2xl sm:text-3xl font-bold text-foreground leading-tight">
                {currentRole.headline}
              </h3>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                {currentRole.description}
              </p>
            </div>

            <ul className="space-y-3 pt-1 text-sm text-muted-foreground">
              {currentRole.highlights.map((item, idx) => (
                <li key={idx} className="flex items-center gap-3">
                  <CheckCircle2Icon className="w-4 h-4 text-primary shrink-0" />
                  <span className="text-foreground/90 font-medium">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-5">
            <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-primary/5 to-cyan-500/10 p-6 space-y-5 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-border/60">
                <span className="text-xs font-mono font-bold text-foreground">
                  {currentRole.previewTitle}
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>

              <div className="space-y-2">
                <p className="text-2xl font-black font-mono text-primary">
                  {currentRole.previewMetric}
                </p>
                <p className="text-xs text-muted-foreground">
                  {currentRole.previewDetail}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-background/80 border border-border/60 text-xs font-mono space-y-1.5">
                <div className="flex justify-between text-[11px]">
                  <span className="text-muted-foreground">Đánh giá Liên tục SE:</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">Hoạt động</span>
                </div>
                <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-primary to-cyan-500 rounded-full w-[90%]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
