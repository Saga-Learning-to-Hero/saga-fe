"use client";

import { useState } from "react";
import {
  CheckCircle2Icon,
  GraduationCapIcon,
  ScaleIcon,
  SparklesIcon,
  UsersIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

const roles = [
  {
    id: "student",
    title: "Dành cho Sinh viên",
    icon: GraduationCapIcon,
    badge: "Bảo vệ Công sức",
    headline: "Minh chứng năng lực thực tế, tự tin bảo vệ đồ án trước Hội đồng",
    description: "Đồ thị Traceability tự động xâu chuỗi mọi commit mã nguồn GitHub và task Jira. Không còn lo lắng bị cướp công hay chịu bất công từ vấn nạn người hưởng lợi thụ động (Free-rider).",
    highlights: [
      "Đồ thị truy xuất minh chứng công sức: Sinh viên → Task → Commit với hiệu ứng làm sáng đường đi cá nhân",
      "Tỷ lệ đóng góp Slicing Pie và đánh giá đồng đẳng (Peer Review) công bằng, minh bạch",
      "Trợ lý AI Hub cá nhân phân tích tiến độ Sprint và cảnh báo rủi ro kỹ thuật kịp thời",
    ],
    previewTitle: "Bảng Chỉ số Đóng góp Cá nhân",
    previewMetric: "31.4% Tỷ lệ Cổ phần Slicing Pie",
    previewDetail: "Ghi nhận 64 Commits · 18 Tasks · 100% Traceability",
  },
  {
    id: "lecturer",
    title: "Dành cho Giảng viên",
    icon: UsersIcon,
    badge: "Tiết kiệm 80% Thời gian",
    headline: "Giám sát đa nhóm học phần, bắt lỗi báo cáo khống trong 30 giây",
    description: "Tự động phát hiện các bất thường MSR Anomaly (Task Done nhưng 0 commit) và cô lập Ghosting qua mạng lưới SNA, thay vì phải kiểm tra thủ công hàng trăm pull request.",
    highlights: [
      "Trung tâm Giám sát Đa nhóm & Ma trận SNA (Degree Centrality) nhận diện Ghosting vs Key Contributor",
      "Phát hiện ngay lập tức bất thường MSR Anomaly khi sinh viên báo cáo khống nhiệm vụ",
      "AI Hub quét rủi ro tiến độ toàn khóa và tự động đối soát sản phẩm bàn giao theo chuẩn CLO Đề cương",
    ],
    previewTitle: "Radar Giám sát Đa nhóm Học phần",
    previewMetric: "32 Nhóm Dự án Giảng dạy",
    previewDetail: "Tự động quét bất thường MSR & SNA toàn lớp",
  },
  {
    id: "council",
    title: "Hội đồng & Quản trị",
    icon: ScaleIcon,
    badge: "Chuẩn mực Khách quan",
    headline: "Cơ sở khoa học bất biến, triệt tiêu tranh cãi khiếu nại điểm số",
    description: "Chuỗi minh chứng kỹ thuật được neo chặt vào Git SHA và Jira Webhooks, đi kèm nhật ký kiểm toán MongoDB Audit Trail bất biến bảo vệ sự liêm chính học thuật.",
    highlights: [
      "Bằng chứng số liệu đối chiếu chi tiết từ cấp Khóa học, Nhóm dự án đến từng Sinh viên",
      "Quản lý Đề cương chi tiết (FLM Syllabus, CLOs, Phases & Deliverables) bất biến",
      "Nhật ký kiểm toán hệ thống MongoDB Audit Trail chống giả mạo, hỗ trợ phúc khảo chuẩn xác",
    ],
    previewTitle: "Báo cáo Kiểm định Hội đồng",
    previewMetric: "100% Minh chứng Bất biến",
    previewDetail: "Được bảo chứng bởi chuỗi Audit Trail & Neo4j Graph",
  },
];

export function RoleShowcaseSection() {
  const [activeTab, setActiveTab] = useState(0);
  const currentRole = roles[activeTab];

  return (
    <section id="goc-nhin" className="py-24 border-t border-border/80 bg-background scroll-mt-20">
      <div className="max-w-6xl mx-auto px-6 space-y-12">
        <div className="text-center space-y-2.5 max-w-xl mx-auto">
          <Badge variant="outline" className="text-primary border-primary/30 bg-primary/5 text-xs font-semibold">
            Góc nhìn Đa chiều
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
            Giải pháp Chuyên biệt cho Từng Vai trò
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
            Từ sinh viên thực hiện dự án, giảng viên hướng dẫn cho đến hội đồng thẩm định đồ án tốt nghiệp.
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
